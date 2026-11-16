const SCHOOL_FATIGUE_REPLY_WINDOW=24*60*SCHOOL_MINUTE;

async function schoolMultipart(request,limit) {
  const body=await schoolReadBody(request,limit+65536);
  try { return await body.formData(); }
  catch { throw new SchoolError(400,'Le formulaire avec pièce jointe est invalide.'); }
}

async function schoolWithUpload(env,upload,replaced,write) {
  if(upload&&!env.BUCKET) throw new SchoolError(503,'Le stockage des fichiers est indisponible.');
  let saved=false;
  try {
    if(upload) await env.BUCKET.put(upload.key,upload.file,{httpMetadata:{contentType:upload.type}});
    const result=await write();
    saved=true;
    return result;
  } finally {
    const unused=saved?(upload?replaced:null):upload?.key;
    if(unused&&env.BUCKET) {
      try { await env.BUCKET.delete(unused); }
      catch { console.warn('School attachment cleanup failed'); }
    }
  }
}

async function schoolDownload(env,file,type='application/pdf') {
  if(!file?.file_key||!env.BUCKET) throw new SchoolError(404,'Fichier introuvable.');
  const object=await env.BUCKET.get(file.file_key);
  if(!object) throw new SchoolError(404,'Fichier introuvable.');
  return new Response(object.body,{headers:{'Content-Type':type,'Content-Length':String(file.file_size),
    'Content-Disposition':schoolDisposition(file.file_name),'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});
}

async function schoolFatigueHistory(db,child) {
  if(!child) return [];
  return schoolAll(db,`SELECT id,student_id,requested_at,duration_minutes,status,decided_at,starts_at,expires_at,stopped_at
    FROM school_fatigue_requests WHERE student_id=? ORDER BY requested_at DESC LIMIT 40`,[child.id]);
}

function schoolTeacherFatigue(db,account) {
  return schoolAll(db,`SELECT f.student_id,f.starts_at,f.expires_at,a.name,c.name AS class_name,c.id AS class_id
    FROM school_fatigue_requests f JOIN school_enrolments e ON e.student_id=f.student_id
    JOIN school_accounts a ON a.id=e.student_id AND a.active=1 JOIN school_classes c ON c.id=e.class_id
    JOIN school_teaching t ON t.class_id=e.class_id AND t.teacher_id=?
    WHERE f.status='approved' AND f.stopped_at IS NULL AND f.expires_at>${SCHOOL_CLOCK}
    ORDER BY c.name,a.name`,[account.id]);
}

function schoolActiveFatigue(db,id) {
  return schoolFirst(db,`SELECT id FROM school_fatigue_requests WHERE student_id=? AND status='approved'
    AND stopped_at IS NULL AND expires_at>${SCHOOL_CLOCK} LIMIT 1`,[id]);
}

async function schoolFatigueRequest(db,account,data) {
  schoolRoles(account,'eleve');
  schoolRequire([60,120,240].includes(data.minutes),'Choisis une durée de mode fatigue.');
  const guardian=await schoolFirst(db,`SELECT g.parent_id FROM school_guardians g JOIN school_accounts p
    ON p.id=g.parent_id AND p.active=1 WHERE g.student_id=? LIMIT 1`,[account.id]);
  if(!guardian) throw new SchoolError(409,'Demande à l’établissement d’associer ton parent à ton compte.');
  const result=await schoolRun(db,`INSERT INTO school_fatigue_requests(id,student_id,requested_at,duration_minutes)
    SELECT ?,?,${SCHOOL_CLOCK},? WHERE NOT EXISTS (SELECT 1 FROM school_fatigue_requests WHERE student_id=? AND (
      (status='pending' AND requested_at>${SCHOOL_CLOCK}-?) OR
      (status='approved' AND stopped_at IS NULL AND expires_at>${SCHOOL_CLOCK})))`,
  [crypto.randomUUID(),account.id,data.minutes,account.id,SCHOOL_FATIGUE_REPLY_WINDOW]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Une demande est déjà en cours.');
}

async function schoolFatigueDecide(db,account,data) {
  schoolRoles(account,'parent');
  schoolRequire(schoolId(data.id)&&['approved','declined'].includes(data.decision),'Décision invalide.');
  const result=await schoolRun(db,`UPDATE school_fatigue_requests SET status=?,decided_at=${SCHOOL_CLOCK},decided_by=?,
    starts_at=CASE WHEN ?='approved' THEN ${SCHOOL_CLOCK} END,
    expires_at=CASE WHEN ?='approved' THEN ${SCHOOL_CLOCK}+duration_minutes*60000 END
    WHERE id=? AND status='pending' AND requested_at>${SCHOOL_CLOCK}-? AND EXISTS (
      SELECT 1 FROM school_guardians g JOIN school_accounts a ON a.id=g.student_id AND a.active=1
      WHERE g.student_id=school_fatigue_requests.student_id AND g.parent_id=?)`,
  [data.decision,account.id,data.decision,data.decision,data.id,SCHOOL_FATIGUE_REPLY_WINDOW,account.id]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Cette demande n’est plus disponible.');
}

async function schoolFatigueStop(db,account,data) {
  schoolRoles(account,'parent','eleve');
  schoolRequire(schoolId(data.id),'Demande invalide.');
  const result=await schoolRun(db,`UPDATE school_fatigue_requests SET
    status=CASE WHEN status='pending' THEN 'cancelled' ELSE status END,
    stopped_at=${SCHOOL_CLOCK},stopped_by=?
    WHERE id=? AND (student_id=? OR EXISTS (
      SELECT 1 FROM school_guardians g JOIN school_accounts a ON a.id=g.student_id AND a.active=1
      WHERE g.student_id=school_fatigue_requests.student_id AND g.parent_id=?))
    AND stopped_at IS NULL AND ((status='pending' AND student_id=? AND requested_at>${SCHOOL_CLOCK}-?) OR
      (status='approved' AND expires_at>${SCHOOL_CLOCK}))`,
  [account.id,data.id,account.id,account.id,account.id,SCHOOL_FATIGUE_REPLY_WINDOW]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Cette demande n’est plus disponible.');
}
