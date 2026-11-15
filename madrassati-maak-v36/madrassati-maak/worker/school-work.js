function schoolClassScope(account,child,alias) {
  if(account.role==='administration') return {where:'1',args:[]};
  if(account.role==='professeur') return {where:`EXISTS (
    SELECT 1 FROM school_teaching t WHERE t.teacher_id=? AND t.class_id=${alias}.class_id)`,args:[account.id]};
  if(child) return {where:`EXISTS (
    SELECT 1 FROM school_enrolments e WHERE e.student_id=? AND e.class_id=${alias}.class_id)`,args:[child.id]};
  return {where:'0',args:[]};
}

function schoolResourceView(row) {
  const {file_key,file_name,file_size,file_type,...entry}=row;
  return {...entry,file:file_key?{name:file_name,size:file_size,type:file_type}:null};
}

function schoolResources(db,account,child,id) {
  const scope=schoolClassScope(account,child,'r');
  return schoolAll(db,`SELECT r.*,c.name AS class_name,a.name AS teacher_name FROM school_resources r
    JOIN school_classes c ON c.id=r.class_id JOIN school_accounts a ON a.id=r.teacher_id
    WHERE ${scope.where} ${id?'AND r.id=?':''}
    ORDER BY r.created_at DESC,r.title LIMIT 250`,[...scope.args,...(id?[id]:[])]);
}

async function schoolResourceSave(env,account,request) {
  schoolRoles(account,'professeur');
  const form=await schoolMultipart(request,SCHOOL_FILE_LIMIT);
  const id=form.get('id')||'';
  schoolRequire(!id||schoolId(id),'Ressource invalide.');
  const old=id&&await schoolFirst(env.DB,'SELECT * FROM school_resources WHERE id=? AND teacher_id=?',[id,account.id]);
  if(id&&(!old||old.revision!==Number(form.get('revision')))) throw new SchoolError(409,'Cette ressource a changé. Rouvre-la.');
  const title=schoolText(form.get('title'),120);
  const description=schoolText(form.get('description'),3000);
  schoolRequire(title&&(!form.get('description')||description),'Vérifie le titre et la description.');
  const link=schoolOptionalUrl(form.get('link'));
  const upload=await schoolAttachment(form.get('file'));
  schoolRequire(link||upload||old?.file_key,'Ajoute un fichier ou un lien HTTPS.');
  const teaching=await schoolTeaching(env.DB,account,account.id,form.get('class'));
  const fields=[teaching.class_id,teaching.subject,title,description,link,upload?.key??old?.file_key??null,
    upload?.name??old?.file_name??null,upload?.type??old?.file_type??null,upload?.size??old?.file_size??null];
  return schoolWithUpload(env,upload,old?.file_key,async()=>{
    const result=old ? await schoolRun(env.DB,`UPDATE school_resources SET class_id=?,subject=?,title=?,description=?,link=?,
      file_key=?,file_name=?,file_type=?,file_size=?,revision=revision+1 WHERE id=? AND teacher_id=? AND revision=?`,
    [...fields,old.id,account.id,old.revision]) : await schoolRun(env.DB,`INSERT INTO school_resources
      (id,teacher_id,class_id,subject,title,description,link,file_key,file_name,file_type,file_size,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,[crypto.randomUUID(),account.id,...fields,Date.now()]);
    if(!schoolChanged(result)) throw new SchoolError(409,'Cette ressource a changé. Rouvre-la.');
  });
}

async function schoolResourceRemove(env,account,data) {
  schoolRoles(account,'professeur');
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision),'Ressource invalide.');
  const row=await schoolFirst(env.DB,'SELECT file_key FROM school_resources WHERE id=? AND teacher_id=? AND revision=?',
    [data.id,account.id,data.revision]);
  if(!row) throw new SchoolError(404,'Cette ressource est introuvable.');
  const result=await schoolRun(env.DB,'DELETE FROM school_resources WHERE id=? AND teacher_id=? AND revision=?',
    [data.id,account.id,data.revision]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Cette ressource a changé. Rouvre-la.');
  if(row.file_key&&env.BUCKET) {
    try { await env.BUCKET.delete(row.file_key); }
    catch { console.warn('School attachment cleanup failed'); }
  }
}

function schoolHomeworkList(db,account,child) {
  const scope=schoolSessionScope(account,child);
  const student=child?.id||'';
  return schoolAll(db,`SELECT s.id,s.title,s.date,s.due_date,s.subject,s.class_id,c.name AS class_name,
    p.submitted_at,p.corrected_at,
    CASE WHEN ? THEN (SELECT COUNT(*) FROM school_submissions b WHERE b.session_id=s.id) END AS submitted,
    CASE WHEN ? THEN (SELECT COUNT(*) FROM school_submissions b WHERE b.session_id=s.id AND b.corrected_at IS NOT NULL) END AS corrected,
    CASE WHEN ? THEN (SELECT COUNT(*) FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id AND a.active=1
      WHERE e.class_id=s.class_id) END AS total
    FROM school_sessions s JOIN school_classes c ON c.id=s.class_id
    LEFT JOIN school_submissions p ON p.session_id=s.id AND p.student_id=?
    WHERE (${scope.where}) AND s.exercise<>'' ORDER BY s.due_date DESC,s.title LIMIT 250`,
  [...Array(3).fill(Number(account.role==='professeur')),student,...scope.args]);
}

function schoolDueHomework(db,children,until,limit) {
  return schoolAll(db,`WITH due AS (
    SELECT e.student_id,s.id,s.title,s.subject,s.due_date,
      ROW_NUMBER() OVER (PARTITION BY e.student_id ORDER BY s.due_date,s.title,s.id) AS position
    FROM school_enrolments e JOIN school_sessions s ON s.class_id=e.class_id
    LEFT JOIN school_submissions p ON p.session_id=s.id AND p.student_id=e.student_id
    WHERE e.student_id IN (SELECT value FROM json_each(?)) AND s.exercise<>'' AND s.due_date<=? AND p.submitted_at IS NULL
  ) SELECT student_id,id,title,subject,due_date FROM due WHERE position<=? ORDER BY position,id`,
  [JSON.stringify(children.map(child=>child.id)),until,limit]);
}

async function schoolHomeworkSession(db,account,child,id) {
  schoolRoles(account,'professeur','eleve','parent');
  schoolRequire(schoolId(id),'Devoir invalide.');
  const [session]=await schoolSessions(db,schoolSessionScope(account,child),'s.id=? AND s.exercise<>\'\'',[id]);
  if(!session) throw new SchoolError(404,'Ce devoir est introuvable.');
  return session;
}

async function schoolHomeworkDetail(db,account,child,id) {
  const session=await schoolHomeworkSession(db,account,child,id);
  const submissionColumns='p.answer,p.variant,p.submitted_at,p.file_name,p.feedback,p.corrected_at,p.revision';
  const submissions=account.role==='professeur' ? await schoolAll(db,`SELECT a.id AS student_id,a.name,${submissionColumns}
    FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id AND a.active=1
    LEFT JOIN school_submissions p ON p.student_id=e.student_id AND p.session_id=? WHERE e.class_id=? ORDER BY a.name,a.id`,
  [session.id,session.class_id]) : await schoolAll(db,`SELECT student_id,${submissionColumns}
    FROM school_submissions p WHERE p.session_id=? AND p.student_id=?`,[session.id,child.id]);
  return {session:schoolSessionView(session),submissions};
}

const SCHOOL_HOMEWORK_PDF_LIMIT=6*1024*1024;

async function schoolHomeworkPdf(file) {
  if(!file || typeof file==='string' || !file.size) return null;
  if(file.size>SCHOOL_HOMEWORK_PDF_LIMIT) throw new SchoolError(413,'Le PDF doit faire au plus 6 Mo.');
  const attachment=await schoolAttachment(file);
  schoolRequire(attachment?.type==='application/pdf','Joins un fichier PDF valide.');
  return attachment;
}

async function schoolHomeworkSubmit(env,account,request) {
  schoolRoles(account,'eleve');
  const form=await schoolMultipart(request,SCHOOL_HOMEWORK_PDF_LIMIT);
  const db=env.DB;
  const session=await schoolHomeworkSession(db,account,account,form.get('session'));
  const previous=await schoolFirst(db,'SELECT * FROM school_submissions WHERE session_id=? AND student_id=?',[session.id,account.id]);
  const revision=Number(form.get('revision'));
  if((previous?.revision||0)!==revision||previous?.corrected_at!=null) {
    throw new SchoolError(409,'Le devoir a changé ou a déjà été corrigé.');
  }
  const answer=schoolText(form.get('answer'),5000);
  const upload=await schoolHomeworkPdf(form.get('file'));
  schoolRequire(!form.get('answer')||answer,'La réponse doit faire au plus 5 000 caractères.');
  schoolRequire(answer||upload||previous?.file_key,'Écris ta réponse ou joins un PDF.');
  const variant=previous?.variant || (session.short_exercise&&await schoolActiveFatigue(db,account.id)?'short':'full');
  if(form.get('variant')&&form.get('variant')!==variant) throw new SchoolError(409,'La consigne a changé. Rouvre le devoir.');
  return schoolWithUpload(env,upload,previous?.file_key,async()=>{
    const result=await schoolRun(db,`INSERT INTO school_submissions(session_id,student_id,answer,variant,submitted_at,file_key,file_name,file_size)
      SELECT s.id,?,?,?,?,?,?,? FROM school_sessions s JOIN school_enrolments e ON e.class_id=s.class_id
      WHERE s.id=? AND s.exercise<>'' AND e.student_id=?
      ON CONFLICT(session_id,student_id) DO UPDATE SET answer=excluded.answer,submitted_at=excluded.submitted_at,
      file_key=excluded.file_key,file_name=excluded.file_name,file_size=excluded.file_size,revision=school_submissions.revision+1
      WHERE school_submissions.revision=? AND school_submissions.corrected_at IS NULL`,
    [account.id,answer,variant,Date.now(),upload?.key??previous?.file_key??null,upload?.name??previous?.file_name??null,
      upload?.size??previous?.file_size??null,session.id,account.id,revision]);
    if(!schoolChanged(result)) throw new SchoolError(409,'Le devoir a changé ou a déjà été corrigé.');
  });
}

async function schoolHomeworkCorrect(db,account,data) {
  schoolRoles(account,'professeur');
  const session=await schoolHomeworkSession(db,account,null,data.session);
  const feedback=schoolText(data.feedback,5000);
  schoolRequire(feedback&&schoolId(data.student)&&Number.isInteger(data.revision),'Indique la correction du travail.');
  const result=await schoolRun(db,`UPDATE school_submissions SET feedback=?,corrected_at=?,revision=revision+1
    WHERE session_id=? AND student_id=? AND revision=? AND EXISTS (
      SELECT 1 FROM school_enrolments e WHERE e.student_id=school_submissions.student_id AND e.class_id=?)`,
  [feedback,Date.now(),session.id,data.student,data.revision,session.class_id]);
  if(!schoolChanged(result)) throw new SchoolError(409,'La remise a changé. Rouvre le devoir.');
}

async function schoolHomeworkFile(env,account,child,sessionId,studentId) {
  const session=await schoolHomeworkSession(env.DB,account,child,sessionId);
  schoolRequire(schoolId(studentId),'Remise invalide.');
  if(account.role!=='professeur'&&studentId!==child?.id) throw new SchoolError(404,'Remise introuvable.');
  const row=await schoolFirst(env.DB,`SELECT p.file_key,p.file_name,p.file_size FROM school_submissions p
    JOIN school_enrolments e ON e.student_id=p.student_id AND e.class_id=? WHERE p.session_id=? AND p.student_id=?`,
  [session.class_id,session.id,studentId]);
  return schoolDownload(env,row);
}
