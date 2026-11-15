function schoolPeriod(db) {
  return schoolFirst(db,'SELECT * FROM school_periods ORDER BY id DESC LIMIT 1');
}

function schoolPeriodView(period,now = Date.now()) {
  if (!period) return null;
  const end = Math.min(period.closed_at ?? period.closes_at,period.closes_at);
  const phase = period.publish_at!==null && period.publish_at<=now ? 'published' :
    period.closed_at!==null || now>=period.closes_at ? (period.publish_at!==null ? 'publication-planned' : 'closed') :
    now<period.opens_at ? 'scheduled' : 'open';
  return {...period,end,phase};
}

const schoolMoroccoClock=new Intl.DateTimeFormat('sv-SE',{
  timeZone:'Africa/Casablanca',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
});

function schoolDateTime(value,timeZone) {
  if (typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const ms=Date.parse(value+':00Z');
  if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,16)!==value) return null;
  if(timeZone!=='Africa/Casablanca') return ms;
  const local=timestamp=>schoolMoroccoClock.format(timestamp).replace(' ','T');
  let candidate=ms;
  for(let i=0;i<3;i++) {
    const rendered=local(candidate);
    if(rendered===value) return candidate;
    candidate+=ms-Date.parse(rendered+':00Z');
  }
  return null;
}

function schoolCheckPeriod(current,data) {
  if ((current?.id ?? null)!==(data.id ?? null) || (current?.revision ?? null)!==(data.revision ?? null)) {
    throw new SchoolError(409,'La période a changé. Actualise la page.');
  }
}

async function schoolPeriodSave(db,account,data) {
  schoolRoles(account,'administration');
  const current=await schoolPeriod(db);
  schoolCheckPeriod(current,data);
  const opens=data.action==='open' ? Date.now() : schoolDateTime(data.opens,data.timeZone);
  const closes=schoolDateTime(data.closes,data.timeZone);
  schoolRequire(opens!==null && closes!==null && closes>opens && closes>Date.now(),
    'La fermeture doit suivre l’ouverture et être dans le futur.');
  const phase=schoolPeriodView(current)?.phase;
  if (current?.publish_at> Date.now() && closes>current.publish_at) {
    throw new SchoolError(409,'Choisis une fermeture antérieure à la publication ou déplace la publication.');
  }
  const result = !current || phase==='published' ?
    await schoolRun(db,`INSERT INTO school_periods(opens_at,closes_at)
      SELECT ?,? WHERE ? > ${SCHOOL_CLOCK}
      AND COALESCE((SELECT MAX(id) FROM school_periods),0)=?
      AND NOT EXISTS (SELECT 1 FROM school_periods WHERE publish_at IS NULL OR publish_at>${SCHOOL_CLOCK})`,
      [opens,closes,closes,current?.id || 0]) :
    await schoolRun(db,`UPDATE school_periods SET opens_at=?,closes_at=?,closed_at=NULL,revision=revision+1
      WHERE id=? AND revision=? AND (publish_at IS NULL OR (publish_at>${SCHOOL_CLOCK} AND publish_at>=?))
      AND ?>${SCHOOL_CLOCK}`,
      [opens,closes,current.id,current.revision,closes,closes]);
  if (!schoolChanged(result)) throw new SchoolError(409,'La période a changé. Actualise la page.');
}

async function schoolPeriodClose(db,account,data) {
  schoolRoles(account,'administration');
  const current=await schoolPeriod(db);
  schoolCheckPeriod(current,data);
  if (!current) throw new SchoolError(409,'Aucune période à fermer.');
  const result=await schoolRun(db,`UPDATE school_periods SET closed_at=${SCHOOL_CLOCK},revision=revision+1
    WHERE id=? AND revision=? AND closed_at IS NULL AND (publish_at IS NULL OR publish_at>${SCHOOL_CLOCK}) AND closes_at>${SCHOOL_CLOCK}`,
    [current.id,current.revision]);
  if (!schoolChanged(result)) throw new SchoolError(409,'La période est déjà fermée ou a changé.');
}

async function schoolPeriodPublish(db,account,data) {
  schoolRoles(account,'administration');
  const period=await schoolPeriod(db);
  schoolCheckPeriod(period,data);
  if (!period) throw new SchoolError(409,'Crée d’abord une période de saisie.');
  const current=schoolPeriodView(period);
  const now=Date.now();
  if (current.phase==='published') throw new SchoolError(409,'Les notes de cette période sont déjà publiées.');
  let publishAt=null;
  if (data.action!=='cancel') {
    publishAt=data.action==='now' ? now : schoolDateTime(data.publish,data.timeZone);
    schoolRequire(publishAt!==null && publishAt>=current.end && publishAt>=now,
      'La publication doit suivre la fermeture de la saisie.');
  }
  const result=await schoolRun(db,`UPDATE school_periods SET publish_at=?,revision=revision+1
    WHERE id=? AND revision=? AND (publish_at IS NULL OR publish_at>${SCHOOL_CLOCK})`,
    [publishAt,period.id,period.revision]);
  if (!schoolChanged(result)) throw new SchoolError(409,'La période a changé. Actualise la page.');
}

function schoolScore(value) {
  if (value==='' || value===null) return null;
  const text=String(value).trim().replace(',','.');
  const score=Number(text);
  schoolRequire(/^\d{1,2}(\.\d{1,2})?$/.test(text) && score<=20,'Les notes doivent être comprises entre 0 et 20.');
  return score;
}

const SCHOOL_ASSESSMENT_KINDS=['test','exam','oral','other'];

function schoolAssessments(db,account,child) {
  const scopes={
    administration:['1',[]],
    professeur:[`s.teacher_id=? AND EXISTS (SELECT 1 FROM school_teaching t
      WHERE t.teacher_id=s.teacher_id AND t.class_id=s.class_id)`,[account.id]]
  };
  const [where,params]=scopes[account.role] || (child ? [
    'EXISTS (SELECT 1 FROM school_enrolments e WHERE e.student_id=? AND e.class_id=s.class_id)',[child.id]
  ] : ['0',[]]);
  return schoolAll(db,`WITH assessments AS (
    SELECT s.*,EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=s.id) AS graded FROM school_assessments s
    UNION ALL
    SELECT e.id,e.class_id,e.teacher_id,e.subject,e.title,e.date,'other','',e.revision,1
    FROM school_evaluations e JOIN school_periods p ON p.id=e.period_id
    WHERE e.assessment_id IS NULL AND (? OR p.publish_at<=${SCHOOL_CLOCK})
  )
    SELECT s.*,c.name AS class_name,a.name AS teacher_name
    FROM assessments s JOIN school_classes c ON c.id=s.class_id JOIN school_accounts a ON a.id=s.teacher_id
    WHERE ${where} ORDER BY s.date DESC,s.title LIMIT 250`,[Number(!child),...params]);
}

async function schoolAssessmentSave(db,account,data) {
  schoolRoles(account,'professeur');
  const title=schoolText(data.title,120);
  const instruction=schoolText(data.instruction,12000);
  schoolRequire(title&&schoolDate(data.date)&&SCHOOL_ASSESSMENT_KINDS.includes(data.kind)&&
    (!data.instruction||instruction)&&(!data.id||schoolId(data.id)),'Vérifie le titre, le type, la date et la consigne.');
  const teaching=await schoolTeaching(db,account,account.id,data.classId);
  const id=data.id||crypto.randomUUID();
  const fields=[teaching.class_id,teaching.subject,title,data.date,data.kind,instruction];
  const result=data.id ? await schoolRun(db,`UPDATE school_assessments SET class_id=?,subject=?,title=?,date=?,
    kind=?,instruction=?,revision=revision+1 WHERE id=? AND teacher_id=? AND revision=?
      AND EXISTS (SELECT 1 FROM school_teaching t WHERE t.teacher_id=school_assessments.teacher_id AND t.class_id=school_assessments.class_id)
      AND NOT EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=school_assessments.id)`,
    [...fields,id,account.id,data.revision??0]) : await schoolRun(db,`INSERT INTO school_assessments
      (id,teacher_id,class_id,subject,title,date,kind,instruction) VALUES(?,?,?,?,?,?,?,?)`,[id,account.id,...fields]);
  if(!schoolChanged(result)) throw new SchoolError(409,'L’évaluation a changé ou une saisie de notes y est déjà associée.');
  return id;
}

async function schoolAssessmentRemove(db,account,data) {
  schoolRoles(account,'professeur');
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision),'Évaluation invalide.');
  const result=await schoolRun(db,`DELETE FROM school_assessments WHERE id=? AND teacher_id=? AND revision=?
    AND EXISTS (SELECT 1 FROM school_teaching t WHERE t.teacher_id=school_assessments.teacher_id AND t.class_id=school_assessments.class_id)
    AND NOT EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=school_assessments.id)`,
  [data.id,account.id,data.revision]);
  if(!schoolChanged(result)) throw new SchoolError(409,'L’évaluation a changé ou une saisie de notes y est déjà associée.');
}

async function schoolEvaluationEntry(db,account,data) {
  schoolRoles(account,'professeur');
  const period=await schoolPeriod(db);
  if (!period || period.id!==data.periodId || schoolPeriodView(period).phase!=='open') {
    throw new SchoolError(409,'La période de saisie est fermée.');
  }
  schoolRequire((!data.assessmentId||schoolId(data.assessmentId))&&(!data.id||schoolId(data.id)),'Évaluation invalide.');
  const assessment=data.assessmentId && await schoolFirst(db,
    'SELECT * FROM school_assessments WHERE id=? AND teacher_id=?',[data.assessmentId,account.id]);
  if(data.assessmentId&&!assessment) throw new SchoolError(404,'Cette évaluation n’est pas disponible.');
  if(data.assessmentRevision!=null&&(assessment?.revision||0)!==data.assessmentRevision) {
    throw new SchoolError(409,'L’évaluation a changé. Actualise la page.');
  }
  const teaching=await schoolTeaching(db,account,account.id,assessment?.class_id||data.classId);
  const title=assessment?.title||schoolText(data.title,120);
  const date=assessment?.date||data.date;
  schoolRequire(title && schoolDate(date) &&
    data.scores && typeof data.scores==='object' && !Array.isArray(data.scores),'Vérifie le titre, la date et les notes.');
  const existing=assessment ? await schoolFirst(db,'SELECT * FROM school_evaluations WHERE assessment_id=?',[assessment.id]) :
    data.id && await schoolFirst(db,`SELECT * FROM school_evaluations WHERE id=? AND teacher_id=?
      AND class_id=? AND period_id=? AND assessment_id IS NULL`,[data.id,account.id,teaching.class_id,period.id]);
  if (data.id && !existing) throw new SchoolError(404,'Cette évaluation n’est pas disponible.');
  if (existing && (existing.revision!==data.revision||existing.id!==data.id||existing.period_id!==period.id)) {
    throw new SchoolError(409,'L’évaluation a changé ou appartient à une autre période.');
  }
  const roster=await schoolAll(db,`SELECT a.id FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id
    AND a.active=1 AND a.role='eleve' WHERE e.class_id=?`,[teaching.class_id]);
  schoolRequire(roster.length,'Inscris des élèves dans cette classe avant de saisir les notes.');
  const enrolled=new Set(roster.map(student=>student.id));
  const scores=Object.assign(Object.create(null),existing ? JSON.parse(existing.scores) : null);
  for (const [student,value] of Object.entries(data.scores)) {
    schoolRequire(enrolled.has(student),'Un élève ne fait plus partie de cette classe.');
    const score=schoolScore(value);
    if (score===null) delete scores[student];
    else scores[student]=score;
  }
  const stored=JSON.stringify(scores);
  const window=`EXISTS (SELECT 1 FROM school_periods p WHERE p.id=? AND (p.publish_at IS NULL OR p.publish_at>${SCHOOL_CLOCK})
    AND p.closed_at IS NULL AND p.opens_at<=${SCHOOL_CLOCK} AND p.closes_at>${SCHOOL_CLOCK}
    AND p.id=(SELECT MAX(id) FROM school_periods))`;
  const authorized=`EXISTS (SELECT 1 FROM school_teaching t JOIN school_accounts a ON a.id=t.teacher_id
    WHERE t.teacher_id=? AND t.class_id=? AND t.subject=? AND a.active=1)`;
  const assessmentCurrent=assessment ? 'AND EXISTS (SELECT 1 FROM school_assessments s WHERE s.id=? AND s.revision=?)' : '';
  const scope=[period.id,account.id,teaching.class_id,teaching.subject,...(assessment?[assessment.id,assessment.revision]:[])];
  return {period,assessment,teaching,existing,title,date,stored,window,authorized,assessmentCurrent,scope};
}

async function schoolEvaluationDraftSave(db,account,data) {
  const {period,assessment,existing,stored,window,authorized,assessmentCurrent,scope}=await schoolEvaluationEntry(db,account,data);
  const key=assessment?.id||existing?.id;
  schoolRequire(key&&Number.isSafeInteger(data.draftRevision)&&data.draftRevision>=0,'Brouillon invalide.');
  const current=existing?'EXISTS (SELECT 1 FROM school_evaluations WHERE id=? AND revision=?)':
    'NOT EXISTS (SELECT 1 FROM school_evaluations WHERE assessment_id=?)';
  const result=await schoolFirst(db,`INSERT INTO school_grade_drafts(teacher_id,period_id,item_id,base_revision,assessment_revision,scores)
    SELECT ?,?,?,?,?,? WHERE ${window} AND ${authorized} ${assessmentCurrent} AND ${current}
    ON CONFLICT(teacher_id,period_id,item_id) DO UPDATE SET
      scores=excluded.scores,base_revision=excluded.base_revision,assessment_revision=excluded.assessment_revision,revision=revision+1
    WHERE school_grade_drafts.revision=? OR (?=0 AND (school_grade_drafts.base_revision<>excluded.base_revision
      OR school_grade_drafts.assessment_revision<>excluded.assessment_revision))
    RETURNING revision`,[account.id,period.id,key,existing?.revision||0,assessment?.revision||0,stored,...scope,
    ...(existing?[existing.id,existing.revision]:[assessment.id]),data.draftRevision,data.draftRevision]);
  if(!result) throw new SchoolError(409,'Le brouillon ou la période a changé. Actualise la page.');
  return {...result,scores:JSON.parse(stored)};
}

async function schoolEvaluationSave(db,account,data) {
  const {period,assessment,teaching,existing,title,date,stored,window,authorized,assessmentCurrent,scope}=await schoolEvaluationEntry(db,account,data);
  const id=existing?.id||crypto.randomUUID();
  let draftCurrent='';
  if(data.draftRevision!=null) {
    schoolRequire(Number.isSafeInteger(data.draftRevision)&&data.draftRevision>=0,'Brouillon invalide.');
    draftCurrent=`AND COALESCE((SELECT revision FROM school_grade_drafts WHERE teacher_id=? AND period_id=? AND item_id=?
      AND base_revision=? AND assessment_revision=?),0)=?`;
    scope.push(account.id,period.id,assessment?.id||id,existing?.revision||0,assessment?.revision||0,data.draftRevision);
  }
  const result=existing ?
    await schoolRun(db,`UPDATE school_evaluations SET title=?,date=?,scores=?,revision=revision+1
      WHERE id=? AND revision=? AND ${window} AND ${authorized} ${assessmentCurrent} ${draftCurrent}`,[title,date,stored,id,existing.revision,...scope]) :
    await schoolRun(db,`INSERT OR IGNORE INTO school_evaluations(id,period_id,class_id,teacher_id,subject,title,date,scores,assessment_id)
      SELECT ?,?,?,?,?,?,?,?,? WHERE ${window} AND ${authorized} ${assessmentCurrent} ${draftCurrent}`,[id,period.id,teaching.class_id,account.id,
      teaching.subject,title,date,stored,assessment?.id??null,...scope]);
  if (!schoolChanged(result)) throw new SchoolError(409,'La période ou l’évaluation a changé. Actualise la page.');
  return id;
}

async function schoolTeacherEvaluations(db,account,period) {
  const open=schoolPeriodView(period)?.phase==='open';
  const drafts=open?await schoolAll(db,`SELECT item_id,revision,base_revision,assessment_revision,scores FROM school_grade_drafts
    WHERE period_id=? AND teacher_id=?`,[period.id,account.id]):[];
  const byItem=new Map(drafts.map(row=>[row.item_id,row]));
  const rows=await schoolAll(db,`SELECT e.id,e.assessment_id,e.period_id,e.class_id,e.subject,e.title,e.date,e.scores,e.revision,
    p.publish_at,c.name AS class_name,s.revision AS assessment_revision FROM school_evaluations e
    JOIN school_periods p ON p.id=e.period_id JOIN school_classes c ON c.id=e.class_id
    JOIN school_teaching t ON t.teacher_id=e.teacher_id AND t.class_id=e.class_id
    LEFT JOIN school_assessments s ON s.id=e.assessment_id
    WHERE e.teacher_id=?
    UNION ALL
    SELECT NULL,s.id,NULL,s.class_id,s.subject,s.title,s.date,'{}',NULL,NULL,c.name,s.revision FROM school_assessments s
    JOIN school_classes c ON c.id=s.class_id JOIN school_teaching t ON t.teacher_id=s.teacher_id AND t.class_id=s.class_id
    WHERE s.teacher_id=? AND NOT EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=s.id)
    ORDER BY date DESC,title LIMIT 250`,[account.id,account.id]);
  return rows.map(row=>{
    const editable=open&&(!row.period_id||row.period_id===period.id);
    const draft=editable&&byItem.get(row.assessment_id||row.id);
    return {...row,scores:JSON.parse(row.scores),editable,
      draft:draft&&draft.base_revision===(row.revision||0)&&draft.assessment_revision===(row.assessment_revision||0)?
        {revision:draft.revision,scores:JSON.parse(draft.scores)}:null};
  });
}

function schoolPublishedGrades(db,studentId,week,inWeek) {
  const range=inWeek ? 'AND p.publish_at>=? AND p.publish_at<?' : '';
  return schoolAll(db,`SELECT e.id,e.subject,e.title,e.date,g.value AS score,p.publish_at
    FROM school_evaluations e JOIN school_periods p ON p.id=e.period_id JOIN json_each(e.scores) g
    WHERE g.key=? AND p.publish_at<=? ${range} ORDER BY p.publish_at DESC,e.date DESC LIMIT 250`,
    [studentId,Date.now(),...(inWeek ? [week.from,week.until] : [])]);
}

function schoolGradeProgress(db,period) {
  if (!period) return [];
  return schoolAll(db,`WITH work AS (
    SELECT class_id,subject,title,scores FROM school_evaluations WHERE period_id=?
    UNION ALL SELECT s.class_id,s.subject,s.title,'{}' FROM school_assessments s
    WHERE ? AND NOT EXISTS (SELECT 1 FROM school_evaluations e WHERE e.assessment_id=s.id)
  ) SELECT c.name AS class_name,e.subject,e.title,
    (SELECT COUNT(*) FROM school_enrolments m JOIN school_accounts a ON a.id=m.student_id AND a.active=1
      WHERE m.class_id=e.class_id) AS total,
    (SELECT COUNT(*) FROM json_each(e.scores) g JOIN school_enrolments m ON m.student_id=g.key
      JOIN school_accounts a ON a.id=m.student_id AND a.active=1 WHERE m.class_id=e.class_id) AS marked
    FROM work e JOIN school_classes c ON c.id=e.class_id
    ORDER BY c.name,e.subject,e.title LIMIT 250`,[period.id,Number(schoolPeriodView(period).phase!=='published')]);
}
