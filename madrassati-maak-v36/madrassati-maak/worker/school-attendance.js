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

async function schoolOwnSession(db,account,id) {
  schoolRequire(schoolId(id),'Séance invalide.');
  const [session]=await schoolSessions(db,schoolSessionScope(account,account),'s.id=?',[id]);
  if(!session) throw new SchoolError(404,'Cette séance est introuvable.');
  return session;
}

async function schoolAttendanceRoster(db,account,id) {
  schoolRoles(account,'administration','professeur');
  const session=await schoolOwnSession(db,account,id);
  const roster=await schoolAll(db,`SELECT a.id,a.name,p.status,p.marked_at,p.justification_status,p.revision
    FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id AND a.active=1 AND a.role='eleve'
    LEFT JOIN school_attendance p ON p.student_id=e.student_id AND p.session_id=?
    WHERE e.class_id=? ORDER BY a.name,a.id`,[session.id,session.class_id]);
  const open=schoolSessionInstant(session.date,session.start_minute)<=Date.now();
  return {session:schoolSessionView(session),roster,open};
}

async function schoolAttendanceSave(env,account,data) {
  const db=env.DB;
  const {session,roster,open}=await schoolAttendanceRoster(db,account,data.session);
  schoolRequire(open,'L’appel est disponible à partir du début de la séance.');
  schoolRequire(Array.isArray(data.marks)&&data.marks.length<=roster.length,'Liste d’appel invalide.');
  const students=new Map(roster.map(student=>[student.id,student]));
  const seen=new Set(),changes=[];
  for(const mark of data.marks) {
    const student=students.get(mark?.id);
    schoolRequire(student&&!seen.has(mark.id)&&['present','absent','late'].includes(mark.status),'Liste d’appel invalide.');
    seen.add(mark.id);
    if(student.status===mark.status) continue;
    if((student.revision||0)!==mark.revision) throw new SchoolError(409,'L’appel a changé. Rouvre la liste.');
    changes.push(mark);
  }
  if(!changes.length) return;
  const priorFiles=changes.some(mark=>mark.status==='present') ? await schoolAll(db,`SELECT p.file_key
    FROM school_attendance p JOIN json_each(?) j ON p.student_id=json_extract(j.value,'$.id')
    WHERE p.session_id=? AND json_extract(j.value,'$.status')='present' AND p.file_key IS NOT NULL`,[JSON.stringify(changes),session.id]) : [];
  const result=await schoolRun(db,`WITH marks AS (
    SELECT json_extract(value,'$.id') AS student_id,json_extract(value,'$.status') AS status,
      json_extract(value,'$.revision') AS revision FROM json_each(?)
  ), valid AS (
    SELECT 1 FROM school_sessions s JOIN school_accounts actor ON actor.id=? AND actor.active=1
    WHERE s.id=? AND s.class_id=? AND (actor.role='administration' OR (s.teacher_id=actor.id AND EXISTS (
      SELECT 1 FROM school_teaching t WHERE t.teacher_id=actor.id AND t.class_id=s.class_id)))
    AND NOT EXISTS (
      SELECT 1 FROM marks m LEFT JOIN school_attendance p ON p.session_id=s.id AND p.student_id=m.student_id
      LEFT JOIN school_enrolments e ON e.student_id=m.student_id AND e.class_id=s.class_id
      LEFT JOIN school_accounts a ON a.id=m.student_id AND a.active=1
      WHERE COALESCE(p.revision,0)<>m.revision OR e.student_id IS NULL OR a.id IS NULL
    )
  )
  INSERT INTO school_attendance(session_id,student_id,status,marked_at,marked_by)
    SELECT ?,student_id,status,?,? FROM marks WHERE EXISTS (SELECT 1 FROM valid)
    ON CONFLICT(session_id,student_id) DO UPDATE SET status=excluded.status,marked_at=excluded.marked_at,
    marked_by=excluded.marked_by,revision=school_attendance.revision+1,
    justification=CASE WHEN excluded.status='present' THEN '' ELSE school_attendance.justification END,
    justification_status=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.justification_status END,
    justified_at=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.justified_at END,
    justified_by=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.justified_by END,
    reviewed_at=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.reviewed_at END,
    reviewed_by=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.reviewed_by END,
    file_key=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.file_key END,
    file_name=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.file_name END,
    file_size=CASE WHEN excluded.status='present' THEN NULL ELSE school_attendance.file_size END`,
  [JSON.stringify(changes),account.id,session.id,session.class_id,session.id,Date.now(),account.id]);
  if((result.meta?.changes||0)!==changes.length) throw new SchoolError(409,'L’appel a changé. Rouvre la liste.');
  if(env.BUCKET&&priorFiles.length) {
    try { await env.BUCKET.delete(priorFiles.map(file=>file.file_key)); }
    catch { console.warn('School attachment cleanup failed'); }
  }
}

function schoolAbsences(db,account,child) {
  if(account.role==='administration') return schoolAll(db,`SELECT p.session_id,p.student_id,p.status,p.marked_at,
    p.justification,p.justification_status,p.justified_at,p.reviewed_at,p.file_name,p.revision,s.title,s.date,s.subject,
    c.name AS class_name,a.name AS student_name FROM school_attendance p
    JOIN school_sessions s ON s.id=p.session_id JOIN school_accounts a ON a.id=p.student_id
    JOIN school_classes c ON c.id=s.class_id WHERE p.status<>'present'
    ORDER BY (p.justification_status='pending') DESC,p.marked_at DESC LIMIT 200`);
  if(!child) return [];
  return schoolAll(db,`SELECT p.session_id,p.student_id,p.status,p.marked_at,p.justification_status,p.reviewed_at,
    s.title,s.date,s.subject FROM school_attendance p JOIN school_sessions s ON s.id=p.session_id
    WHERE p.student_id=? AND p.status<>'present' ORDER BY s.date DESC,p.marked_at DESC LIMIT 120`,[child.id]);
}

async function schoolJustificationRow(db,account,session,student) {
  schoolRoles(account,'administration','parent');
  schoolRequire(schoolId(session)&&schoolId(student),'Absence invalide.');
  const row=await schoolFirst(db,`SELECT p.* FROM school_attendance p WHERE p.session_id=? AND p.student_id=?
    AND p.status<>'present' AND (?='administration' OR EXISTS (
      SELECT 1 FROM school_guardians g JOIN school_accounts a ON a.id=g.student_id AND a.active=1
      WHERE g.student_id=p.student_id AND g.parent_id=?))`,[session,student,account.role,account.id]);
  if(!row) throw new SchoolError(404,'Cette absence est introuvable.');
  return row;
}

async function schoolPaperReceived(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(schoolId(data.session)&&schoolId(data.student)&&Number.isInteger(data.revision),'Absence invalide.');
  const now=Date.now();
  const result=await schoolRun(db,`UPDATE school_attendance SET justification_status='accepted',
    justified_at=COALESCE(justified_at,?),justified_by=COALESCE(justified_by,?),reviewed_at=?,reviewed_by=?,revision=revision+1
    WHERE session_id=? AND student_id=? AND revision=? AND status<>'present' AND justification_status IS NOT 'accepted'`,
  [now,account.id,now,account.id,data.session,data.student,data.revision]);
  if(!schoolChanged(result)) throw new SchoolError(409,'L’absence a changé. Actualise la liste.');
}

async function schoolJustificationReview(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(schoolId(data.session)&&schoolId(data.student)&&Number.isInteger(data.revision)&&
    ['accepted','declined'].includes(data.decision),'Décision invalide.');
  const result=await schoolRun(db,`UPDATE school_attendance SET justification_status=?,reviewed_at=?,reviewed_by=?,revision=revision+1
    WHERE session_id=? AND student_id=? AND revision=? AND justification_status='pending' AND status<>'present'`,
  [data.decision,Date.now(),account.id,data.session,data.student,data.revision]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Le justificatif a déjà changé. Actualise la liste.');
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
