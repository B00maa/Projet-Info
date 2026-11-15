const SCHOOL_STUDENT_SUFFIX = '@eleve.madrassati.invalid';
const SCHOOL_COOKIE = '__Host-madrassati-school';
const SCHOOL_LOGIN_LIFE = 12 * 60 * 60 * 1000;
const SCHOOL_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SCHOOL_PASSWORD_ITERATIONS = 100000;
const SCHOOL_PASSWORD_VERIFIER = new RegExp('^pbkdf2-sha256\\$'+SCHOOL_PASSWORD_ITERATIONS+'\\$([A-Za-z0-9_-]{22})\\$([A-Za-z0-9_-]{43})$');
const SCHOOL_IMPORT_LIMIT = 200;

const schoolNormalizeLogin = value => schoolText(value,40).toLowerCase();
const schoolValidLogin = value => /^[a-z0-9][a-z0-9._-]{2,39}$/.test(value);
const schoolNewLogin = (id,role='eleve') =>
  ({eleve:'el',professeur:'pr',parent:'pa',administration:'ad'})[role]+'-'+id.replace(/-/g,'').slice(0,12);
const schoolNativeEmail = email => schoolEmailValid(email) && !email.endsWith(SCHOOL_STUDENT_SUFFIX);
const schoolBase64 = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const schoolDigest = async text => schoolBase64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))));
const schoolLoginCode = value => schoolText(value,48).replace(/[ -]/g,'').toUpperCase();

function schoolPasswordValue(value) {
  if(typeof value!=='string'||value.length>256||/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(value)) return '';
  const password=value.normalize('NFC');
  return [...password].length<=128?password:'';
}

async function schoolPasswordDigest(password,salt) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:SCHOOL_PASSWORD_ITERATIONS},key,256);
  return schoolBase64(new Uint8Array(bits));
}

function schoolDigestMatches(actual,expected) {
  if(actual.length!==expected.length) return false;
  let difference=0;
  for(let i=0;i<actual.length;i++) difference|=actual.charCodeAt(i)^expected.charCodeAt(i);
  return difference===0;
}

async function schoolAccessMatches(value,stored) {
  if(/^[A-Za-z0-9_-]{43}$/.test(stored)) {
    const code=schoolLoginCode(value);
    return code.length===24&&[...code].every(letter=>SCHOOL_CODE_ALPHABET.includes(letter))&&
      schoolDigestMatches(await schoolDigest(code),stored);
  }
  const verifier=SCHOOL_PASSWORD_VERIFIER.exec(stored);
  const password=schoolPasswordValue(value);
  if(!verifier||!password) return false;
  const salt=Uint8Array.from(atob(verifier[1].replaceAll('-','+').replaceAll('_','/')+'=='),letter=>letter.charCodeAt(0));
  return schoolDigestMatches(await schoolPasswordDigest(password,salt),verifier[2]);
}

async function schoolNewCredential(login) {
  const random=crypto.getRandomValues(new Uint8Array(15));
  let value=0,bits=0,code='';
  for(const byte of random) {
    value=(value<<8)|byte;
    bits+=8;
    while(bits>=5) {
      bits-=5;
      code+=SCHOOL_CODE_ALPHABET[(value>>bits)&31];
    }
  }
  return {login,code:code.match(/.{6}/g).join('-'),digest:await schoolDigest(code)};
}

const schoolCredentialView = ({login,code}) => ({login,code});
const schoolSessionCookie = (value,seconds) => SCHOOL_COOKIE+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+seconds;

function schoolSessionToken(request) {
  return new RegExp('(?:^|;\\s*)'+SCHOOL_COOKIE+'=([A-Za-z0-9_-]{43})(?:;|$)')
    .exec(request.headers.get('cookie')||'')?.[1]||'';
}

async function schoolSessionAccount(db,token) {
  if(!token) return null;
  return schoolFirst(db,`SELECT a.id,a.name,a.role,k.onboarding_required FROM school_student_sessions s
    JOIN school_student_access k ON k.student_id=s.student_id AND k.revision=s.access_revision
    JOIN school_accounts a ON a.id=s.student_id AND a.revision=s.account_revision AND a.active=1
    WHERE s.token_digest=? AND s.expires_at>?`,[await schoolDigest(token),Date.now()]);
}

async function schoolAttemptLimit(db,key,maximum,now) {
  const limit=await schoolFirst(db,'SELECT failures FROM school_login_limits WHERE client_key=? AND expires_at>?',[key,now]);
  if(limit?.failures>=maximum) throw new SchoolError(429,'Trop de tentatives. Réessaie dans quelques minutes.');
}

async function schoolClientLimit(request,db,scope,maximum,now) {
  const ip=request.headers.get('cf-connecting-ip')||'unknown';
  const key=await schoolDigest(scope+':'+ip);
  await schoolAttemptLimit(db,key,maximum,now);
  return key;
}

function schoolRecordAttempt(db,key,now,until) {
  return schoolFirst(db,'INSERT INTO school_login_limits(client_key,expires_at,failures) VALUES(?,?,1) ON CONFLICT(client_key) DO UPDATE SET failures=CASE WHEN expires_at<=? THEN 1 ELSE failures+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING failures,expires_at',
    [key,until,now,now]);
}

async function schoolSignIn(request,db,data) {
  const login=schoolNormalizeLogin(data.login);
  const now=Date.now();
  const key=await schoolClientLimit(request,db,'school-login',60,now);
  let signedIn=false;
  const token=schoolBase64(crypto.getRandomValues(new Uint8Array(32)));
  const access=schoolValidLogin(login)?await schoolFirst(db,`SELECT k.student_id,k.code_digest,k.revision,k.onboarding_required FROM school_student_access k
    JOIN school_accounts a ON a.id=k.student_id AND a.active=1 WHERE k.login=?`,[login]):null;
  if(access&&await schoolAccessMatches(data.code,access.code_digest)) {
    const tokenDigest=await schoolDigest(token);
    const insert=schoolQuery(db,`INSERT INTO school_student_sessions(token_digest,student_id,access_revision,account_revision,expires_at)
      SELECT ?,a.id,k.revision,a.revision,? FROM school_student_access k
      JOIN school_accounts a ON a.id=k.student_id AND a.active=1
      WHERE k.login=? AND k.revision=? AND k.code_digest=?`,
      [tokenDigest,now+SCHOOL_LOGIN_LIFE,login,access.revision,access.code_digest]);
    if(access.onboarding_required) {
      const [result]=await db.batch([insert,schoolQuery(db,`UPDATE school_student_access SET first_login_at=?
        WHERE student_id=? AND first_login_at IS NULL
          AND EXISTS (SELECT 1 FROM school_student_sessions WHERE token_digest=?)`,
      [now,access.student_id,tokenDigest])]);
      signedIn=schoolChanged(result);
    } else signedIn=schoolChanged(await insert.run());
  }
  if(!signedIn) {
    await schoolRecordAttempt(db,key,now,now+10*SCHOOL_MINUTE);
    throw new SchoolError(401,'Identifiant ou mot de passe incorrect.','credentials');
  }
  try {
    await db.batch([
      schoolQuery(db,`DELETE FROM school_student_sessions WHERE token_digest IN (
        SELECT token_digest FROM school_student_sessions WHERE expires_at<=? LIMIT 200)`,[now]),
      schoolQuery(db,`DELETE FROM school_login_limits WHERE client_key IN (
        SELECT client_key FROM school_login_limits WHERE expires_at<=? LIMIT 200)`,[now])
    ]);
  } catch { console.warn('School session cleanup failed'); }
  return json({signedIn:true},200,{'Set-Cookie':schoolSessionCookie(token,SCHOOL_LOGIN_LIFE/1000)});
}

async function schoolChangePassword(request,db,account,data) {
  schoolRoles(account,...SCHOOL_MEMBER_ROLES);
  if(account.auth!=='school') throw new SchoolError(403,'Cette action est disponible avec un accès scolaire.');
  const password=schoolPasswordValue(data.newPassword);
  schoolRequire([...password].length>=15&&password.trim(),'Choisis un mot de passe de 15 à 128 caractères.');
  const now=Date.now();
  const sessionDigest=await schoolDigest(schoolSessionToken(request));
  const credentials=await schoolFirst(db,`SELECT k.code_digest,k.revision,s.account_revision
    FROM school_student_sessions s
    JOIN school_student_access k ON k.student_id=s.student_id AND k.revision=s.access_revision
    JOIN school_accounts a ON a.id=s.student_id AND a.revision=s.account_revision AND a.active=1
    WHERE s.student_id=? AND s.token_digest=? AND s.expires_at>?`,[account.id,sessionDigest,now]);
  const changed='La session ou le mot de passe a changé. Reconnecte-toi.';
  if(!credentials) throw new SchoolError(409,changed);
  const key=await schoolDigest('school-password:'+account.id+':'+credentials.revision);
  await schoolAttemptLimit(db,key,8,now);
  if(!await schoolAccessMatches(data.currentPassword,credentials.code_digest)) {
    await schoolRecordAttempt(db,key,now,now+10*SCHOOL_MINUTE);
    const message=account.passwordSetup?'Le code personnel est incorrect.':'Le mot de passe actuel est incorrect.';
    throw new SchoolError(400,message,'current-password');
  }
  const unchanged=credentials.code_digest.startsWith('pbkdf2-sha256$')?
    schoolPasswordValue(data.currentPassword)===password:schoolLoginCode(data.currentPassword)===schoolLoginCode(password);
  schoolRequire(!unchanged,'Choisis un mot de passe différent du mot de passe actuel.');

  const salt=crypto.getRandomValues(new Uint8Array(16));
  const token=schoolBase64(crypto.getRandomValues(new Uint8Array(32)));
  const [digest,tokenDigest]=await Promise.all([schoolPasswordDigest(password,salt),schoolDigest(token)]);
  const verifier='pbkdf2-sha256$'+SCHOOL_PASSWORD_ITERATIONS+'$'+schoolBase64(salt)+'$'+digest;
  const updatedAt=Date.now();
  // The access revision invalidates older sessions. Rotate the current session in the same transaction.
  const results=await db.batch([
    schoolQuery(db,`UPDATE school_student_access SET code_digest=?,revision=revision+1,onboarding_required=0
      WHERE student_id=? AND revision=? AND code_digest=? AND EXISTS (
        SELECT 1 FROM school_student_sessions s JOIN school_accounts a ON a.id=s.student_id
        WHERE s.student_id=? AND s.token_digest=? AND s.access_revision=? AND s.expires_at>?
          AND a.revision=s.account_revision AND a.revision=? AND a.active=1)`,
    [verifier,account.id,credentials.revision,credentials.code_digest,
      account.id,sessionDigest,credentials.revision,updatedAt,credentials.account_revision]),
    schoolQuery(db,`INSERT INTO school_student_sessions(token_digest,student_id,access_revision,account_revision,expires_at)
      SELECT ?,a.id,k.revision,a.revision,? FROM school_student_access k
      JOIN school_accounts a ON a.id=k.student_id AND a.active=1 AND a.revision=?
      WHERE k.student_id=? AND k.revision=? AND k.code_digest=?`,
    [tokenDigest,updatedAt+SCHOOL_LOGIN_LIFE,credentials.account_revision,account.id,credentials.revision+1,verifier])
  ]);
  if(!schoolChanged(results[0])) throw new SchoolError(409,changed);
  return json({saved:true},200,{'Set-Cookie':schoolSessionCookie(token,SCHOOL_LOGIN_LIFE/1000)});
}

async function schoolSignOut(db,request) {
  const token=schoolSessionToken(request);
  if(token) await schoolRun(db,'DELETE FROM school_student_sessions WHERE token_digest=?',[await schoolDigest(token)]);
  return json({signedOut:true},200,{'Set-Cookie':schoolSessionCookie('',0)});
}

async function schoolResetAccess(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(schoolId(data.id) && Number.isInteger(data.revision) && data.revision>=0,'Compte invalide.');
  const member=await schoolFirst(db,`SELECT a.id,a.role,k.login,k.revision FROM school_accounts a
    LEFT JOIN school_student_access k ON k.student_id=a.id WHERE a.id=? AND a.role<>'administration' AND a.active=1`,[data.id]);
  if(!member) throw new SchoolError(404,'Ce compte est indisponible.');
  if((member.revision||0)!==data.revision) throw new SchoolError(409,'Le code a déjà changé. Actualise la liste.');
  const access=await schoolNewCredential(member.login||schoolNewLogin(member.id,member.role));
  const [result]=await db.batch([schoolQuery(db,`INSERT INTO school_student_access(student_id,login,code_digest,onboarding_required)
    SELECT id,?,?,1 FROM school_accounts WHERE id=? AND active=1 AND role<>'administration'
    ON CONFLICT(student_id) DO UPDATE SET code_digest=excluded.code_digest,revision=revision+1
    WHERE school_student_access.revision=?`,[access.login,access.digest,member.id,data.revision]),
  schoolAccountEvent(db,account.id,member.id,'access-reset',
    'EXISTS (SELECT 1 FROM school_student_access WHERE student_id=? AND code_digest=?)',[member.id,access.digest])]);
  if(!schoolChanged(result)) throw new SchoolError(409,'Le compte a changé. Actualise la liste.');
  return schoolCredentialView(access);
}

async function schoolSetupState(env) {
  if(!env.DB)return 'unavailable';
  if(await schoolFirst(env.DB,"SELECT 1 FROM school_accounts WHERE role='administration' LIMIT 1"))return 'complete';
  const secret=typeof env.SCHOOL_SETUP_CODE==='string'?env.SCHOOL_SETUP_CODE.trim():'';
  if(!secret)return 'missing-code';
  return secret.length>=24&&secret.length<=256?'ready':'invalid-code';
}

async function schoolSetup(request,env,data) {
  const db=env.DB;
  if(await schoolSetupState(env)!=='ready') throw new SchoolError(409,'L’activation de l’administration est indisponible.');
  const now=Date.now();
  const key=await schoolClientLimit(request,db,'school-setup',8,now);
  const [provided,expected]=await Promise.all([
    schoolDigest(schoolText(data.setupCode,256)),schoolDigest(env.SCHOOL_SETUP_CODE.trim())
  ]);
  let mismatch=0;
  for(let i=0;i<expected.length;i++) mismatch|=provided.charCodeAt(i)^expected.charCodeAt(i);
  if(mismatch) {
    await schoolRecordAttempt(db,key,now,now+15*SCHOOL_MINUTE);
    throw new SchoolError(401,'Code d’activation incorrect.','setup-code');
  }
  const id=crypto.randomUUID();
  const access=await schoolNewCredential(schoolNewLogin(id,'administration'));
  const [result]=await db.batch([
    schoolQuery(db,`INSERT INTO school_accounts(id,email,name,role)
      SELECT ?,?,'Administration','administration' WHERE NOT EXISTS (SELECT 1 FROM school_accounts WHERE role='administration')`,
    [id,id+SCHOOL_STUDENT_SUFFIX]),
    schoolQuery(db,`INSERT INTO school_student_access(student_id,login,code_digest)
      SELECT id,?,? FROM school_accounts WHERE id=?`,[access.login,access.digest,id])
  ]);
  if(!schoolChanged(result)) throw new SchoolError(409,'L’administration est déjà activée.');
  return json({credential:schoolCredentialView(access)},201);
}

async function schoolCoachRetryAfter(db,account) {
  const now=Date.now();
  const key=await schoolDigest('school-coach:'+account.id);
  const maximum=account.role==='professeur'?16:30;
  const {failures,expires_at}=await schoolRecordAttempt(db,key,now,now+5*SCHOOL_MINUTE);
  return failures>maximum?Math.ceil((expires_at-now)/1000):0;
}

const schoolImportKey = value => value.normalize('NFC').toLocaleLowerCase('fr');

async function schoolImportPlan(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(Array.isArray(data.rows) && data.rows.length>0 && data.rows.length<=SCHOOL_IMPORT_LIMIT,
    'Importe de 1 à 200 élèves à la fois.');
  const [classes,students,accesses]=await Promise.all([
    schoolAll(db,'SELECT id,name FROM school_classes'),
    schoolAll(db,`SELECT a.name,a.active,a.archived_at,c.name AS class_name,k.login FROM school_enrolments e
      JOIN school_accounts a ON a.id=e.student_id JOIN school_classes c ON c.id=e.class_id
      LEFT JOIN school_student_access k ON k.student_id=e.student_id`),
    schoolAll(db,'SELECT login FROM school_student_access')
  ]);
  const currentClasses=new Map(classes.map(row=>[schoolImportKey(row.name),row]));
  const names=new Map();
  const logins=new Set(accesses.map(row=>row.login));
  const nameKey=(name,className)=>schoolImportKey(className)+'\n'+schoolImportKey(name);
  const addName=(key,login)=>names.set(key,[...(names.get(key)||[]),login]);
  for(const student of students)if(student.archived_at==null)addName(nameKey(student.name,student.class_name),student.login||'');
  const newClasses=new Map(),counts=new Map(),items=[];
  for(const [index,row] of data.rows.entries()) {
    const name=schoolText(row?.name,100);
    const className=schoolText(row?.className,60);
    const login=schoolNormalizeLogin(row?.login);
    const item={row:Number.isInteger(row?.row)&&row.row>=2&&row.row<1000000?row.row:index+2,name,className,login,error:''};
    items.push(item);
    if(!name||!className||(row?.login&&!schoolValidLogin(login))) {
      item.error='Vérifie le nom, la classe et l’identifiant.';
      continue;
    }
    const key=nameKey(name,className);
    if((login&&logins.has(login)) || names.get(key)?.some(existing=>!existing||!login||existing===login)) {
      item.error='Doublon à vérifier.';
      continue;
    }
    addName(key,login);
    if(login) logins.add(login);
    const classKey=schoolImportKey(className);
    const entry=currentClasses.get(classKey)||newClasses.get(classKey)||{name:className};
    if(!currentClasses.has(classKey)) newClasses.set(classKey,entry);
    item.className=entry.name;
    counts.set(entry.name,(counts.get(entry.name)||0)+1);
  }
  const currentCounts=new Map();
  for(const student of students)if(student.active)currentCounts.set(student.class_name,(currentCounts.get(student.class_name)||0)+1);
  return {
    items,newClasses:[...newClasses.values()],
    classes:[...counts].map(([name,added])=>({name,added,total:added+(currentCounts.get(name)||0)})),
    classByName:currentClasses
  };
}

async function schoolImportStudents(db,account,data,commit) {
  const plan=await schoolImportPlan(db,account,data);
  const {items,newClasses,classes,classByName}=plan;
  const ready=items.filter(item=>!item.error);
  if(!commit) return {items,classes,newClasses:newClasses.map(row=>row.name),ready:ready.length};
  schoolRequire(ready.length>0 && ready.length===items.length,'Corrige les lignes signalées avant d’importer.');
  schoolRequire(data.expectedClasses===JSON.stringify(classes)&&data.expectedNewClasses===JSON.stringify(newClasses.map(row=>row.name)),
    'Les classes ont changé. Relance l’aperçu.');
  const expectedCounts=new Map(classes.map(row=>[row.name,row.total-row.added]));
  const toCreate=newClasses.map(row=>({id:crypto.randomUUID(),name:row.name}));
  for(const row of toCreate) classByName.set(schoolImportKey(row.name),row);
  const entries=await Promise.all(ready.map(async row=>{
    const id=crypto.randomUUID();
    const classId=classByName.get(schoolImportKey(row.className)).id;
    const access=await schoolNewCredential(row.login||schoolNewLogin(id));
    return {name:row.name,className:row.className,credential:schoolCredentialView(access),
      insert:{id,classId,name:row.name,email:id+SCHOOL_STUDENT_SUFFIX,login:access.login,digest:access.digest,
        expected:expectedCounts.get(row.className)}};
  }));
  const payload=JSON.stringify(entries.map(row=>row.insert));
  const statements=[
    schoolQuery(db,`INSERT INTO school_classes(id,name) SELECT json_extract(value,'$.id'),json_extract(value,'$.name') FROM json_each(?)`,[JSON.stringify(toCreate)]),
    schoolQuery(db,`INSERT INTO school_accounts(id,email,name,role)
      SELECT CASE WHEN (SELECT COUNT(*) FROM school_enrolments e JOIN school_accounts a ON a.id=e.student_id AND a.active=1
        WHERE e.class_id=json_extract(j.value,'$.classId'))
        =json_extract(j.value,'$.expected') THEN json_extract(j.value,'$.id') END,
        json_extract(j.value,'$.email'),json_extract(j.value,'$.name'),'eleve' FROM json_each(?) j`,[payload]),
    schoolQuery(db,`INSERT INTO school_enrolments(student_id,class_id)
      SELECT json_extract(value,'$.id'),json_extract(value,'$.classId') FROM json_each(?)`,[payload]),
    schoolQuery(db,`INSERT INTO school_student_access(student_id,login,code_digest,onboarding_required)
      SELECT json_extract(value,'$.id'),json_extract(value,'$.login'),json_extract(value,'$.digest'),1 FROM json_each(?)`,[payload])
  ];
  try { await db.batch(statements); }
  catch(error) {
    if(/UNIQUE constraint failed|NOT NULL constraint failed: school_accounts.id/i.test(String(error?.message))) {
      throw new SchoolError(409,'Une classe ou un identifiant a changé. Relance l’aperçu.');
    }
    throw error;
  }
  return {created:entries.map(({name,className,credential})=>({name,className,...credential}))};
}
