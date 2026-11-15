const SCHOOL_PREFIX = '/api/school';
const SCHOOL_DAY = 86400000;
const SCHOOL_MINUTE = 60000;
const SCHOOL_CLOCK = "CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)";
const SCHOOL_MEMBER_ROLES = ['professeur','eleve','parent'];

class SchoolError extends Error {
  constructor(status,message,code = '') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const schoolQuery = (db,sql,values = []) => db.prepare(sql).bind(...values);
const schoolFirst = (db,sql,values) => schoolQuery(db,sql,values).first();
const schoolAll = async (db,sql,values) => (await schoolQuery(db,sql,values).all()).results;
const schoolRun = (db,sql,values) => schoolQuery(db,sql,values).run();
const schoolChanged = result => (result.meta?.changes || 0) > 0;
const schoolEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const schoolEmailValid = email => email.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const schoolText = (value,length) => typeof value === 'string' && value.trim().length <= length ? value.trim() : '';
const schoolId = value => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
const schoolDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value;
const schoolDay = timestamp => new Date(timestamp).toISOString().slice(0,10);
const schoolToday = () => schoolMoroccoClock.format(Date.now()).slice(0,10);

function schoolWeek(date) {
  if (date && !schoolDate(date)) throw new SchoolError(400,'Choisis une date valide.');
  const time = Date.parse((date || schoolToday())+'T00:00:00Z');
  const monday = time - ((new Date(time).getUTCDay()+6)%7)*SCHOOL_DAY;
  return {start:schoolDay(monday),end:schoolDay(monday+6*SCHOOL_DAY),from:monday,until:monday+7*SCHOOL_DAY};
}

function schoolRoles(account,...roles) {
  if (!roles.includes(account.role)) throw new SchoolError(403,'Cette action n’est pas disponible dans ton espace.');
}

function schoolRequire(condition,message) {
  if (!condition) throw new SchoolError(400,message);
}

async function schoolReadBody(request,limit) {
  const size = Number(request.headers.get('content-length'));
  if (size > limit) throw new SchoolError(413,'Le fichier ou le formulaire est trop volumineux.');
  if (!request.body) throw new SchoolError(400,'Le formulaire est vide.');
  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;
  try {
    for (;;) {
      const {value,done} = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > limit) {
        await reader.cancel();
        throw new SchoolError(413,'Le fichier ou le formulaire est trop volumineux.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('content-type') || 'application/octet-stream'}});
}

async function schoolJson(request,limit=64*1024) {
  const body = await schoolReadBody(request,limit);
  try {
    const value = await body.json();
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {}
  throw new SchoolError(400,'Le formulaire n’a pas pu être lu.');
}

async function schoolAccount(request,env) {
  const user = request.headers.get('oai-authenticated-user-id')?.trim();
  const email = schoolEmail(request.headers.get('oai-authenticated-user-email'));
  const token=schoolSessionToken(request);
  if (!user&&!token) throw new SchoolError(401,'Connecte-toi à ton espace scolaire.','sign-in');
  if (!env.DB) throw new SchoolError(503,'Le stockage de l’espace scolaire est indisponible.','storage');
  const db = env.DB;
  const member=await schoolSessionAccount(db,token);
  if(member) return {id:member.id,name:member.name,role:member.role,auth:'school',passwordSetup:!!member.onboarding_required};
  if (!user||user.length>255) throw new SchoolError(401,'Connecte-toi à ton espace scolaire.','sign-in');
  let account = await schoolFirst(db,'SELECT id,name,role,active FROM school_accounts WHERE user_id=?',[user]);
  if (!account && schoolNativeEmail(email)) {
    const administrator = schoolEmail(env.SCHOOL_ADMIN_EMAIL);
    if (email === administrator) {
      await schoolRun(db,`INSERT OR IGNORE INTO school_accounts(id,email,name,role,user_id)
        SELECT ?,?,'Administration','administration',? WHERE NOT EXISTS (SELECT 1 FROM school_accounts WHERE role='administration')`,
      [crypto.randomUUID(),email,user]);
    }
    await schoolRun(db,'UPDATE school_accounts SET user_id=? WHERE email=? AND active=1 AND user_id IS NULL',[user,email]);
    account = await schoolFirst(db,'SELECT id,name,role,active FROM school_accounts WHERE user_id=?',[user]);
  }
  if (!account) {
    const ready = schoolEmailValid(schoolEmail(env.SCHOOL_ADMIN_EMAIL)) ||
      !!await schoolFirst(db,"SELECT id FROM school_accounts WHERE role='administration' LIMIT 1");
    throw new SchoolError(403,ready ? 'Cette adresse n’est pas encore autorisée par l’établissement.' :
      'Le premier compte d’administration doit être activé.',ready ? 'access' : 'setup');
  }
  if (!account.active) throw new SchoolError(403,'Ce compte scolaire est suspendu.','suspended');
  return {id:account.id,name:account.name,role:account.role,auth:'chatgpt'};
}

async function schoolClassCreate(db,account,data) {
  schoolRoles(account,'administration');
  const name = schoolText(data.name,60);
  schoolRequire(name,'Indique le nom de la classe.');
  const result = await schoolRun(db,'INSERT OR IGNORE INTO school_classes(id,name) VALUES(?,?)',[crypto.randomUUID(),name]);
  if (!schoolChanged(result)) throw new SchoolError(409,'Une classe porte déjà ce nom.');
}

function schoolDistinctIds(value,max) {
  schoolRequire(Array.isArray(value) && value.length <= max && value.every(schoolId),'La liste contient un choix invalide.');
  return [...new Set(value)];
}

async function schoolAccountClasses(db,role,data) {
  const classes=role==='parent'?[]:schoolDistinctIds(data.classIds,30);
  const subject=role==='professeur'?schoolText(data.subject,60):'';
  schoolRequire(role!=='eleve'||classes.length===1,'Choisis une classe pour l’élève.');
  schoolRequire(role!=='professeur'||!classes.length||subject,'Indique la matière enseignée.');
  if(classes.length) {
    const matching=await schoolAll(db,"SELECT id FROM school_classes WHERE id IN (SELECT value FROM json_each(?))",[JSON.stringify(classes)]);
    schoolRequire(matching.length===classes.length,'Une des classes est introuvable.');
  }
  return {classes,subject};
}

async function schoolGuardianSelection(db,values,parentId=null) {
  const children=schoolDistinctIds(values,20);
  schoolRequire(parentId||children.length,'Associe au moins un élève à ce parent.');
  const matching=await schoolAll(db,`SELECT id FROM school_accounts
    WHERE role='eleve' AND id IN (SELECT value FROM json_each(?))
      AND (active=1 OR EXISTS (SELECT 1 FROM school_guardians g WHERE g.parent_id=? AND g.student_id=school_accounts.id))`,
  [JSON.stringify(children),parentId]);
  schoolRequire(matching.length===children.length,'Un des élèves est introuvable.');
  return children;
}

function schoolAccountEvent(db,actorId,memberId,action,condition='1',values=[]) {
  return schoolQuery(db,`INSERT INTO school_account_history(actor_id,member_id,action,occurred_at)
    SELECT ?,?,?,? WHERE ${condition}`,[actorId,memberId,action,Date.now(),...values]);
}

async function schoolAccountHistory(db,pageParam) {
  const parsed=Number(pageParam);
  const page=Number.isSafeInteger(parsed)&&parsed>0?Math.min(parsed,1000000):1;
  const rows=await schoolAll(db,`SELECT h.id,h.action,h.occurred_at,a.name AS actor,m.name AS member
    FROM school_account_history h JOIN school_accounts a ON a.id=h.actor_id JOIN school_accounts m ON m.id=h.member_id
    ORDER BY h.id DESC LIMIT 31 OFFSET ?`,[(page-1)*30]);
  return {page,more:rows.length>30,rows:rows.slice(0,30)};
}

async function schoolAccountSave(db,account,data) {
  schoolRoles(account,'administration');
  const name = schoolText(data.name,100);
  const role = data.role;
  const id=crypto.randomUUID();
  const schoolAuth=data.auth==='school'||!data.email;
  const email=schoolAuth?id+SCHOOL_STUDENT_SUFFIX:schoolEmail(data.email);
  const login=schoolNormalizeLogin(data.login);
  schoolRequire(name && SCHOOL_MEMBER_ROLES.includes(role) && (schoolAuth||schoolNativeEmail(email)),
    'Vérifie le nom, l’adresse et le rôle.');
  schoolRequire(!schoolAuth||!data.login||schoolValidLogin(login),'L’identifiant doit contenir de 3 à 40 lettres, chiffres, points ou tirets.');
  const {classes,subject}=await schoolAccountClasses(db,role,data);
  const children=role==='parent'?await schoolGuardianSelection(db,data.childIds):[];
  const access=schoolAuth?await schoolNewCredential(login||schoolNewLogin(id,role)):null;
  const statements = [schoolQuery(db,'INSERT INTO school_accounts(id,email,name,role) VALUES(?,?,?,?)',[id,email,name,role])];
  if (role === 'eleve') statements.push(schoolQuery(db,'INSERT INTO school_enrolments(student_id,class_id) VALUES(?,?)',[id,classes[0]]));
  if (access) statements.push(schoolQuery(db,'INSERT INTO school_student_access(student_id,login,code_digest,onboarding_required) VALUES(?,?,?,1)',[id,access.login,access.digest]));
  if (role === 'professeur') for (const classId of classes) {
    statements.push(schoolQuery(db,'INSERT INTO school_teaching(teacher_id,class_id,subject) VALUES(?,?,?)',[id,classId,subject]));
  }
  if (role === 'parent') for (const child of children) {
    statements.push(schoolQuery(db,'INSERT INTO school_guardians(parent_id,student_id) VALUES(?,?)',[id,child]));
  }
  if(role==='parent') statements.push(schoolAccountEvent(db,account.id,id,'parent-linked'));
  try { await db.batch(statements); }
  catch (error) {
    if (/UNIQUE constraint failed: school_accounts.email/i.test(String(error?.message))) {
      throw new SchoolError(409,'Cette adresse est déjà associée à un compte scolaire.');
    }
    if (/UNIQUE constraint failed: school_student_access.login/i.test(String(error?.message))) {
      throw new SchoolError(409,'Cet identifiant scolaire est déjà utilisé.');
    }
    throw error;
  }
  return {id,...(access?{credential:schoolCredentialView(access)}:{})};
}

async function schoolAccountEdit(db,account,data) {
  schoolRoles(account,'administration');
  const name=schoolText(data.name,100);
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision)&&name,'Indique un nom valide.');
  const member=await schoolFirst(db,"SELECT id,role FROM school_accounts WHERE id=? AND role IN ('eleve','professeur','parent') AND archived_at IS NULL",[data.id]);
  if(!member) throw new SchoolError(404,'Ce compte est introuvable.');
  const {classes,subject}=await schoolAccountClasses(db,member.role,data);
  const guard='EXISTS (SELECT 1 FROM school_accounts WHERE id=? AND revision=? AND archived_at IS NULL)';
  const condition=[member.id,data.revision];
  const changes=[];
  if(member.role==='eleve') changes.push(
    schoolAccountEvent(db,account.id,member.id,'class-changed',`${guard} AND
      NOT EXISTS (SELECT 1 FROM school_enrolments WHERE student_id=? AND class_id=?)`,[...condition,member.id,classes[0]]),
    schoolQuery(db,`INSERT INTO school_enrolments(student_id,class_id) SELECT ?,? WHERE ${guard}
      ON CONFLICT(student_id) DO UPDATE SET class_id=excluded.class_id`,[member.id,classes[0],...condition]));
  if(member.role==='professeur') changes.push(
    schoolQuery(db,`DELETE FROM school_teaching WHERE teacher_id=? AND ${guard}`,[member.id,...condition]),
    schoolQuery(db,`INSERT INTO school_teaching(teacher_id,class_id,subject)
      SELECT ?,value,? FROM json_each(?) WHERE ${guard}`,[member.id,subject,JSON.stringify(classes),...condition]));
  if(member.role==='parent') {
    const children=await schoolGuardianSelection(db,data.childIds,member.id);
    const selected=JSON.stringify(children);
    changes.push(
      schoolAccountEvent(db,account.id,member.id,'parent-linked',`${guard} AND (
        (SELECT COUNT(*) FROM school_guardians WHERE parent_id=?)<>? OR
        EXISTS (SELECT 1 FROM school_guardians WHERE parent_id=? AND student_id NOT IN (SELECT value FROM json_each(?))))`,
      [...condition,member.id,children.length,member.id,selected]),
      schoolQuery(db,`DELETE FROM school_guardians WHERE parent_id=? AND ${guard}`,[member.id,...condition]),
      schoolQuery(db,`INSERT INTO school_guardians(parent_id,student_id)
        SELECT ?,value FROM json_each(?) WHERE ${guard}`,[member.id,selected,...condition]));
  }
  const results=await db.batch([
    ...changes,
    schoolQuery(db,'UPDATE school_accounts SET name=?,revision=revision+1 WHERE id=? AND revision=? AND archived_at IS NULL',
      [name,...condition]),
    schoolQuery(db,`UPDATE school_student_sessions SET account_revision=account_revision+1 WHERE student_id=? AND account_revision=?
      AND EXISTS (SELECT 1 FROM school_accounts WHERE id=? AND revision=? AND active=1)`,
      [...condition,member.id,data.revision+1])
  ]);
  if(!schoolChanged(results.at(-2))) throw new SchoolError(409,'Le compte a changé. Actualise la liste.');
}

async function schoolAccountAccess(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(schoolId(data.id) && typeof data.active === 'boolean' && Number.isInteger(data.revision),'Compte invalide.');
  const result = await schoolRun(db,`UPDATE school_accounts SET active=?,revision=revision+1
    WHERE id=? AND role!='administration' AND archived_at IS NULL AND revision=?`,[Number(data.active),data.id,data.revision]);
  if (!schoolChanged(result)) throw new SchoolError(409,'Le compte a changé. Actualise la liste.');
}

async function schoolAccountArchive(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(schoolId(data.id)&&typeof data.archived==='boolean'&&Number.isInteger(data.revision),'Compte invalide.');
  const result=await schoolRun(db,`UPDATE school_accounts SET active=?,archived_at=?,revision=revision+1
    WHERE id=? AND role IN ('eleve','professeur') AND revision=? AND (archived_at IS NULL)=?`,
  [data.archived?0:1,data.archived?Date.now():null,data.id,data.revision,Number(data.archived)]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Le compte a changé. Actualise la liste.');
}

async function schoolChildren(db,account) {
  if (account.role === 'eleve') return [{id:account.id,name:account.name}];
  if (account.role !== 'parent') return [];
  return schoolAll(db,`SELECT a.id,a.name FROM school_guardians g JOIN school_accounts a ON a.id=g.student_id
    WHERE g.parent_id=? AND a.active=1 AND a.role='eleve' ORDER BY a.name`,[account.id]);
}

function schoolChild(children,requested) {
  const child = requested ? children.find(entry => entry.id === requested) : children[0];
  if (requested && !child) throw new SchoolError(404,'Cet élève n’est pas disponible dans ton espace.');
  return child || null;
}

async function schoolDirectory(db,account) {
  if (account.role === 'administration') {
    const [classes,accounts,teaching,enrolments,guardians] = await Promise.all([
      schoolAll(db,'SELECT id,name FROM school_classes ORDER BY name'),
      schoolAll(db,`SELECT a.id,a.name,CASE WHEN a.email LIKE '%@eleve.madrassati.invalid' THEN '' ELSE a.email END AS email,
        a.role,a.active,a.revision,a.archived_at,k.login,k.revision AS access_revision,k.first_login_at,k.onboarding_required
        FROM school_accounts a LEFT JOIN school_student_access k ON k.student_id=a.id
        WHERE a.role!='administration' ORDER BY a.role,a.name`),
      schoolAll(db,'SELECT teacher_id,class_id,subject FROM school_teaching'),
      schoolAll(db,'SELECT student_id,class_id FROM school_enrolments'),
      schoolAll(db,'SELECT parent_id,student_id FROM school_guardians')
    ]);
    return {classes,accounts,teaching,enrolments,guardians};
  }
  if (account.role === 'professeur') {
    const [classes,students] = await Promise.all([
      schoolAll(db,`SELECT c.id,c.name,t.subject FROM school_teaching t JOIN school_classes c ON c.id=t.class_id
        WHERE t.teacher_id=? ORDER BY c.name`,[account.id]),
      schoolAll(db,`SELECT a.id,a.name,e.class_id FROM school_teaching t JOIN school_enrolments e ON e.class_id=t.class_id
        JOIN school_accounts a ON a.id=e.student_id AND a.active=1 WHERE t.teacher_id=? ORDER BY a.name`,[account.id])
    ]);
    return {classes,students};
  }
  return {};
}

async function schoolState(db,account,url) {
  const week = schoolWeek(url.searchParams.get('week'));
  const requestedView=url.searchParams.get('view');
  const view=requestedView||({administration:'dashboard',professeur:'dashboard',eleve:'planning',parent:'semaine'})[account.role];
  const children = await schoolChildren(db,account);
  const child = schoolChild(children,url.searchParams.get('child'));
  const scope = schoolSessionScope(account,child);
  const [directory,period,sessions,assignments,notices,fatigue,teacherFatigue] = await Promise.all([
    schoolDirectory(db,account), schoolPeriod(db),
    schoolSessions(db,scope,'s.date BETWEEN ? AND ?',[week.start,week.end]),
    child ? schoolSessions(db,scope,'s.due_date BETWEEN ? AND ?',[week.start,week.end]) : [],
    schoolNotices(db,account),schoolFatigueHistory(db,child),
    account.role==='professeur'?schoolTeacherFatigue(db,account):[]
  ]);
  const state = {account,view,week,children,child,directory,now:Date.now(),period:schoolPeriodView(period),
    sessions:sessions.map(schoolSessionView),notices,fatigue,teacherFatigue};
  if (account.role === 'eleve' && (!requestedView||view==='rattrapage')) {
    const [previous,progress,missed]=await Promise.all([
      schoolSessions(db,scope,'s.date<=?',[schoolToday()],true),
      schoolAll(db,'SELECT session_id,step FROM school_catchup WHERE student_id=?',[account.id]),
      schoolAll(db,"SELECT session_id FROM school_attendance WHERE student_id=? AND status='absent'",[account.id])
    ]);
    const steps = new Map(progress.map(row => [row.session_id,row.step]));
    const absences=new Set(missed.map(row=>row.session_id));
    state.catchup = previous.filter(schoolSessionEnded).map(session =>
      ({...schoolSessionView(session),step:steps.get(session.id)||0,missed:absences.has(session.id)}));
  }
  if (child) {
    state.assignments = assignments.map(schoolSessionView);
    state.grades = await schoolPublishedGrades(db,child.id,week,account.role==='parent');
    if (account.role === 'parent') {
      const changes = await schoolSessions(db,scope,'s.revision>1 AND s.updated_at>=? AND s.updated_at<?',[week.from,week.until]);
      state.changes = changes.map(schoolSessionView);
    }
  }
  const canSeeHomework=['eleve','parent','professeur'].includes(account.role);
  const extra=[];
  const attach=(key,value)=>extra.push(Promise.resolve(value).then(result=>{state[key]=result;}));
  if((view==='notes'||view==='semaine')&&child) {
    attach('gradeReport',account.role==='eleve'?state.grades:schoolPublishedGrades(db,child.id,week,false));
  }
  if (account.role==='professeur'&&(!requestedView||view==='notes')) attach('evaluations',schoolTeacherEvaluations(db,account,period));
  if (account.role==='administration'&&(!requestedView||view==='notes')) attach('gradeProgress',schoolGradeProgress(db,period));
  if (account.role==='administration'&&view==='historique') attach('accountHistory',schoolAccountHistory(db,url.searchParams.get('page')));
  if (view==='evaluations') attach('assessments',schoolAssessments(db,account,child));
  if (view==='absences'||(view==='semaine'&&account.role==='parent')) attach('absences',schoolAbsences(db,account,child));
  if (view==='devoirs'&&canSeeHomework) attach('homework',schoolHomeworkList(db,account,child));
  if (account.role==='professeur'&&view==='dashboard') {
    const [today,time]=schoolMoroccoClock.format(Date.now()).replace(' ','T').split('T');
    const [hour,minute]=time.split(':').map(Number);
    attach('upcoming',schoolSessions(db,scope,'s.date>? OR (s.date=? AND s.start_minute+s.duration>?)',
      [today,today,hour*60+minute],false,4).then(rows=>rows.map(schoolSessionView)));
    attach('homeworkToCorrect',schoolHomeworkList(db,account,null).then(rows=>
      rows.filter(row=>row.submitted>row.corrected).length));
  }
  if (view==='cours') attach('courses',schoolSessions(db,scope,'1',[],true).then(rows=>rows.map(schoolSessionView)));
  if (view==='bibliotheque') {
    attach('resources',schoolResources(db,account,child).then(rows=>rows.map(schoolResourceView)));
    attach('supports',schoolSessions(db,scope,'s.file_key IS NOT NULL OR s.video_url IS NOT NULL',[],true).then(rows=>rows.map(schoolSessionView)));
  }
  if (view==='messages') {
    attach('contacts',schoolContacts(db,account));
    attach('messages',schoolMessages(db,account));
  }
  if (view==='annonces') attach('announcements',schoolAnnouncements(db,account));
  await Promise.all(extra);
  return state;
}

async function schoolLifeRead(env,account,route,url) {
  const db=env.DB;
  const params=url.searchParams;
  if(route==='/attendance') return json(await schoolAttendanceRoster(db,account,params.get('session')));
  if(route==='/justification/file') {
    const row=await schoolJustificationRow(db,account,params.get('session'),params.get('student'));
    return schoolDownload(env,row);
  }
  const child=schoolChild(await schoolChildren(db,account),params.get('child'));
  if(route==='/resource/file') {
    const id=params.get('id');
    schoolRequire(schoolId(id),'Ressource invalide.');
    const [resource]=await schoolResources(db,account,child,id);
    return schoolDownload(env,resource,resource?.file_type);
  }
  if(route==='/homework') return json(await schoolHomeworkDetail(db,account,child,params.get('session')));
  if(route==='/homework/file') return schoolHomeworkFile(env,account,child,params.get('session'),params.get('student'));
  throw new SchoolError(404,'Cette page n’existe pas.');
}

async function schoolLifeWrite(request,env,account,route) {
  const db=env.DB;
  if(route==='/justification') throw new SchoolError(410,'Remets le justificatif papier à l’administration.');
  if(route==='/homework/submit') await schoolHomeworkSubmit(env,account,request);
  else if(route==='/resource') await schoolResourceSave(env,account,request);
  else {
    const data=await schoolJson(request,route.startsWith('/accounts/import')?192*1024:64*1024);
    switch(route) {
      case '/classes': await schoolClassCreate(db,account,data); break;
      case '/accounts': return json(await schoolAccountSave(db,account,data));
      case '/accounts/edit': await schoolAccountEdit(db,account,data); break;
      case '/accounts/access': await schoolAccountAccess(db,account,data); break;
      case '/accounts/archive': await schoolAccountArchive(db,account,data); break;
      case '/accounts/code': return json({credential:await schoolResetAccess(db,account,data)});
      case '/accounts/import/preview': return json(await schoolImportStudents(db,account,data,false));
      case '/accounts/import': return json(await schoolImportStudents(db,account,data,true));
      case '/catchup': await schoolCatchup(db,account,data); break;
      case '/period': await schoolPeriodSave(db,account,data); break;
      case '/period/close': await schoolPeriodClose(db,account,data); break;
      case '/period/publish': await schoolPeriodPublish(db,account,data); break;
      case '/assessment': return json({id:await schoolAssessmentSave(db,account,data)});
      case '/assessment/remove': await schoolAssessmentRemove(db,account,data); break;
      case '/evaluation': return json({id:await schoolEvaluationSave(db,account,data)});
      case '/evaluation/draft': return json(await schoolEvaluationDraftSave(db,account,data));
      case '/attendance': await schoolAttendanceSave(env,account,data); break;
      case '/attendance/paper': await schoolPaperReceived(db,account,data); break;
      case '/justification/review': await schoolJustificationReview(db,account,data); break;
      case '/fatigue': await schoolFatigueRequest(db,account,data); break;
      case '/fatigue/decision': await schoolFatigueDecide(db,account,data); break;
      case '/fatigue/stop': await schoolFatigueStop(db,account,data); break;
      case '/homework/correct': await schoolHomeworkCorrect(db,account,data); break;
      case '/resource/remove': await schoolResourceRemove(env,account,data); break;
      case '/messages': await schoolMessageSend(db,account,data); break;
      case '/messages/read': await schoolMessageRead(db,account,data); break;
      case '/announcement': await schoolAnnouncementPublish(db,account,data); break;
      case '/announcement/read': await schoolAnnouncementRead(db,account,data); break;
      default: throw new SchoolError(404,'Cette page n’existe pas.');
    }
  }
  return json({saved:true});
}

async function handleSchool(request,env,url) {
  try {
    const route = url.pathname.slice(SCHOOL_PREFIX.length);
    if (request.method !== 'GET' && request.method !== 'POST') throw new SchoolError(405,'Méthode indisponible.');
    if (request.method === 'POST' && request.headers.get('origin') !== url.origin) {
      throw new SchoolError(403,'Ouvre le formulaire depuis l’espace scolaire.');
    }
    const db = env.DB;
    if(request.method==='GET'&&route==='/auth/info') {
      const setupState=await schoolSetupState(env);
      return json({setupState,setupAvailable:setupState==='ready'});
    }
    if(request.method==='POST'&&['/auth/login','/auth/logout','/auth/setup'].includes(route)) {
      if(!db) throw new SchoolError(503,'Le stockage de l’espace scolaire est indisponible.','storage');
      if(route==='/auth/logout') return await schoolSignOut(db,request);
      const data=await schoolJson(request,4096);
      if(route==='/auth/setup') return await schoolSetup(request,env,data);
      return await schoolSignIn(request,db,data);
    }
    const account = await schoolAccount(request,env);
    if (request.method==='POST'&&route==='/auth/password') return await schoolChangePassword(request,db,account,await schoolJson(request,4096));
    if (account.passwordSetup) {
      if (request.method==='GET'&&route==='/state') return json({account,now:Date.now()});
      throw new SchoolError(403,'Choisis ton mot de passe pour accéder à ton espace.','password-setup');
    }
    if (request.method === 'GET') {
      if (route === '/state') return json(await schoolState(db,account,url));
      if (route === '/coach/course') return json({course:await schoolTeacherCourse(db,account)});
      if (route === '/coach/status') {
        schoolRoles(account,'professeur','eleve');
        return json({status:coachProviders(env,account.role==='professeur',true).length?'ready':'needs-key'});
      }
      if (route === '/slots') return json({slots:await schoolAvailableSlots(db,account,url.searchParams)});
      if (route === '/pack') return await schoolOfflinePack(env,account,url);
      if (route.startsWith('/file/')) return await schoolSessionFile(env,account,route.slice(6),url,request);
      return await schoolLifeRead(env,account,route,url);
    }
    if (route === '/session') return json({id:await schoolSessionSave(env,account,request)});
    if (route === '/coach/course') return await schoolEditTeacherCourse(request,env,account);
    if (route === '/coach') {
      schoolRoles(account,'professeur','eleve');
      return await replyToCoach(request,env,account);
    }
    return await schoolLifeWrite(request,env,account,route);
  } catch (error) {
    if (error instanceof SchoolError) return json({message:error.message,code:error.code},error.status);
    console.error('School request failed',url.pathname.split('/').slice(0,4).join('/'));
    return json({message:'L’action a échoué. Actualise la page et réessaie.'},500);
  }
}
