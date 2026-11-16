const SCHOOL_COPY_LIMIT=6*1024*1024;

async function schoolAssessmentRow(db,account,child,id,lock=false) {
  schoolRequire(schoolId(id),'Évaluation invalide.');
  const scope=schoolClassScope(account,child,'s');
  const own=account.role==='professeur'?'AND s.teacher_id=?':'';
  const assessment=await schoolFirst(db,`SELECT s.*,c.name AS class_name FROM school_assessments s
    JOIN school_classes c ON c.id=s.class_id WHERE s.id=? AND (${scope.where}) ${own} ${lock?'FOR UPDATE':''}`,
    [id,...scope.args,...(own?[account.id]:[])]);
  if(!assessment)throw new SchoolError(404,'Cette évaluation est introuvable.');
  return assessment;
}

function schoolCopy(db,id,student) {
  return schoolFirst(db,`SELECT p.*,x.closes_at AS extended_until,x.extra_minutes FROM school_assessment_submissions p
    LEFT JOIN school_assessment_extensions x ON p.assessment_id=x.assessment_id AND p.student_id=x.student_id
    WHERE p.assessment_id=? AND p.student_id=?`,[id,student]);
}

function schoolExtension(db,id,student) {
  return schoolFirst(db,'SELECT closes_at AS extended_until,extra_minutes FROM school_assessment_extensions WHERE assessment_id=? AND student_id=?',
    [id,student]);
}

function schoolCopyWindow(assessment,copy) {
  const closes=Math.max(assessment.closes_at||0,copy?.extended_until||0);
  const personal=assessment.duration_minutes&&copy?.started_at?
    copy.started_at+(assessment.duration_minutes+(copy.extra_minutes||0))*SCHOOL_MINUTE:closes;
  const deadline=Math.min(closes,personal)||null;
  const now=Date.now();
  const status=copy?.submitted_at?'rendu':!deadline||assessment.opens_at>now?'avenir':
    now>=deadline?'ferme':copy?.started_at?'brouillon':'afaire';
  return {deadline,status};
}

async function schoolAssessmentCards(db,account,child) {
  const rows=await schoolAssessments(db,account,child);
  if(!child||!['eleve','parent'].includes(account.role))return rows;
  const [submissions,extensions]=await Promise.all([
    schoolAll(db,`SELECT assessment_id,started_at,submitted_at,corrected_at FROM school_assessment_submissions WHERE student_id=?`,[child.id]),
    schoolAll(db,`SELECT assessment_id,closes_at AS extended_until,extra_minutes FROM school_assessment_extensions WHERE student_id=?`,[child.id])
  ]);
  const copies=new Map(submissions.map(x=>[x.assessment_id,x]));
  const limits=new Map(extensions.map(x=>[x.assessment_id,x]));
  return rows.map(({instruction,rubric,...row})=>({...row,...schoolCopyWindow(row,{...copies.get(row.id),...limits.get(row.id)})}));
}

async function schoolAssessmentDetail(db,account,child,id) {
  const assessment=await schoolAssessmentRow(db,account,child,id);
  if(account.role==='professeur') {
    const roster=await schoolAll(db,`SELECT a.id,a.name,p.started_at,p.submitted_at,p.answer,p.feedback,p.proposed_score,p.corrected_at,
      p.file_name,p.revision,x.closes_at AS extended_until,x.extra_minutes
      FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id AND a.active=1 AND a.role='eleve'
      LEFT JOIN school_assessment_submissions p ON p.student_id=a.id AND p.assessment_id=?
      LEFT JOIN school_assessment_extensions x ON x.student_id=a.id AND x.assessment_id=?
      WHERE e.class_id=? ORDER BY a.name,a.id`,[id,id,assessment.class_id]);
    return {assessment,roster:roster.map(row=>row.submitted_at?{...row,...schoolCopyWindow(assessment,row)}:
      {id:row.id,name:row.name,submitted_at:null,extended_until:row.extended_until,extra_minutes:row.extra_minutes,
        ...schoolCopyWindow(assessment,row)})};
  }
  schoolRoles(account,'eleve','parent');
  const copy=await schoolCopy(db,id,child.id);
  const window=schoolCopyWindow(assessment,copy||await schoolExtension(db,id,child.id));
  const {instruction,rubric,...metadata}=assessment;
  const published=copy?.corrected_at&&await schoolFirst(db,`SELECT 1 FROM school_evaluations e
    JOIN school_periods p ON p.id=e.period_id WHERE e.assessment_id=? AND p.publish_at<=?`,[id,Date.now()]);
  const showSubject=account.role==='eleve'&&!!copy||!!copy?.submitted_at;
  return {assessment:{...metadata,instruction:showSubject?instruction:'',rubric:showSubject?rubric:''},...window,
    copy:copy&&(account.role==='eleve'||copy.submitted_at)?{
      started_at:copy.started_at,submitted_at:copy.submitted_at,revision:copy.revision,
      answer:copy.answer,file_name:copy.file_name,feedback:published?copy.feedback:''
    }:null};
}

async function schoolAssessmentStart(db,account,data) {
  schoolRoles(account,'eleve');
  await db.transaction(async tx=>{
    const assessment=await schoolAssessmentRow(tx,account,account,data.id,true);
    const copy=await schoolCopy(tx,data.id,account.id);
    if(copy)return;
    const {status}=schoolCopyWindow(assessment,await schoolExtension(tx,data.id,account.id));
    if(status!=='afaire')throw new SchoolError(409,'Cette évaluation ne peut pas être commencée actuellement.');
    await schoolRun(tx,`INSERT INTO school_assessment_submissions(assessment_id,student_id,started_at)
      VALUES(?,?,?)`,[data.id,account.id,Date.now()]);
  });
  return schoolAssessmentDetail(db,account,account,data.id);
}

async function schoolAssessmentUpload(file) {
  if(!file||typeof file==='string'||!file.size)return null;
  schoolRequire(file.size<=SCHOOL_COPY_LIMIT,'La copie doit faire au plus 6 Mo.');
  const h=new Uint8Array(await file.slice(0,8).arrayBuffer());
  const type=h[0]===37&&h[1]===80&&h[2]===68&&h[3]===70?'application/pdf':
    h[0]===255&&h[1]===216&&h[2]===255?'image/jpeg':
      h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71&&h[4]===13&&h[5]===10?'image/png':'';
  schoolRequire(type,'Joins une copie PDF, JPEG ou PNG valide.');
  const extension={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'}[type];
  return {key:'copies/'+crypto.randomUUID(),name:'copie.'+extension,type,size:file.size,file};
}

async function schoolAssessmentSubmission(env,account,request) {
  schoolRoles(account,'eleve');
  const db=env.DB;
  const form=await schoolMultipart(request,SCHOOL_COPY_LIMIT);
  const id=form.get('id'), revision=Number(form.get('revision'));
  const send=form.get('action')==='submit';
  const answer=schoolText(form.get('answer'),12000);
  schoolRequire((send||form.get('action')==='draft')&&Number.isSafeInteger(revision)&&(!form.get('answer')||answer),
    'Vérifie la réponse et rouvre ton brouillon.');
  const upload=send?await schoolAssessmentUpload(form.get('file')):null;
  return schoolWithUpload(env,upload,null,()=>db.transaction(async tx=>{
    const assessment=await schoolAssessmentRow(tx,account,account,id,true);
    const copy=await schoolCopy(tx,id,account.id);
    if(!copy||copy.revision!==revision||schoolCopyWindow(assessment,copy).status!=='brouillon') {
      throw new SchoolError(409,'La copie a changé ou le délai est terminé. Rouvre l’évaluation.');
    }
    schoolRequire(!send||answer||upload,'Écris ta réponse ou joins une copie.');
    const submitted=send?Date.now():null;
    await schoolRun(tx,`UPDATE school_assessment_submissions SET answer=?,file_key=?,file_name=?,file_type=?,
      file_size=?,submitted_at=?,revision=revision+1 WHERE assessment_id=? AND student_id=?`,
    [answer,upload?.key??null,upload?.name??null,upload?.type??null,upload?.size??null,submitted,id,account.id]);
    return {revision:revision+1,submitted_at:submitted};
  }));
}

async function schoolAssessmentStudent(db,assessment,id) {
  schoolRequire(schoolId(id),'Choisis un élève.');
  const student=await schoolFirst(db,`SELECT a.id FROM school_enrolments e
    JOIN school_accounts a ON a.id=e.student_id AND a.active=1 AND a.role='eleve'
    WHERE e.class_id=? AND e.student_id=?`,[assessment.class_id,id]);
  if(!student)throw new SchoolError(404,'Cet élève ne fait plus partie du niveau.');
}

async function schoolAssessmentExtend(db,account,data) {
  schoolRoles(account,'professeur');
  const until=schoolDateTime(data.closes,'Africa/Casablanca');
  const extra=Number(data.extraMinutes||0);
  schoolRequire(until>Date.now()&&Number.isSafeInteger(extra)&&extra>=0&&extra<=480,'Indique un nouveau délai valide.');
  await db.transaction(async tx=>{
    const assessment=await schoolAssessmentRow(tx,account,null,data.id,true);
    await schoolAssessmentStudent(tx,assessment,data.student);
    const copy=await schoolCopy(tx,data.id,data.student);
    schoolRequire(assessment.closes_at&&until>=assessment.closes_at&&!copy?.submitted_at,
      'La prolongation doit atteindre la date de remise initiale.');
    await schoolRun(tx,`INSERT INTO school_assessment_extensions(assessment_id,student_id,closes_at,extra_minutes)
      VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE closes_at=VALUES(closes_at),extra_minutes=VALUES(extra_minutes)`,
    [data.id,data.student,until,extra]);
  });
}

async function schoolAssessmentCorrect(db,account,data) {
  schoolRoles(account,'professeur');
  const feedback=schoolText(data.feedback,5000);
  const score=schoolScore(data.score);
  schoolRequire(feedback&&score!==null&&Number.isSafeInteger(data.revision),'Indique une note sur 20 et un commentaire.');
  const assessment=await schoolAssessmentRow(db,account,null,data.id);
  await schoolAssessmentStudent(db,assessment,data.student);
  const result=await schoolRun(db,`UPDATE school_assessment_submissions SET feedback=?,proposed_score=?,corrected_at=?,revision=revision+1
    WHERE assessment_id=? AND student_id=? AND revision=? AND submitted_at IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=?)`,
  [feedback,score,Date.now(),data.id,data.student,data.revision,data.id]);
  if(!schoolChanged(result))throw new SchoolError(409,'La copie a changé ou les notes ont déjà été enregistrées.');
}

async function schoolAssessmentDownload(env,account,child,params) {
  schoolRoles(account,'professeur','eleve','parent');
  const assessment=await schoolAssessmentRow(env.DB,account,child,params.get('id'));
  const student=account.role==='professeur'?params.get('student'):child.id;
  await schoolAssessmentStudent(env.DB,assessment,student);
  const copy=await schoolCopy(env.DB,assessment.id,student);
  if(!copy?.submitted_at||!copy.file_key)throw new SchoolError(404,'Copie introuvable.');
  return schoolDownload(env,copy,copy.file_type);
}
