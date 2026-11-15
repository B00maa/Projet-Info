const SCHOOL_FILE_LIMIT = 12*1024*1024;
const SCHOOL_PACK_LIMIT = 32*1024*1024;
const SCHOOL_SESSION_COLUMNS = `s.*,c.name AS class_name,a.name AS teacher_name`;

function schoolSessionScope(account,child) {
  if (account.role === 'administration') return {where:'1',args:[]};
  if (account.role === 'professeur') return {where:`s.teacher_id=? AND EXISTS (
    SELECT 1 FROM school_teaching t WHERE t.teacher_id=s.teacher_id AND t.class_id=s.class_id)`,args:[account.id]};
  if (!child) return {where:'0',args:[]};
  return {where:'EXISTS (SELECT 1 FROM school_enrolments e WHERE e.student_id=? AND e.class_id=s.class_id)',args:[child.id]};
}

function schoolSessions(db,scope,condition,params,latest = false,limit=300) {
  const direction = latest ? 'DESC' : 'ASC';
  return schoolAll(db,`SELECT ${SCHOOL_SESSION_COLUMNS} FROM school_sessions s
    JOIN school_classes c ON c.id=s.class_id JOIN school_accounts a ON a.id=s.teacher_id
    WHERE (${scope.where}) AND (${condition}) ORDER BY s.date ${direction},s.start_minute ${direction},s.id LIMIT ?`,
    [...scope.args,...params,limit]);
}

function schoolSessionView(session) {
  const {file_key,file_name,file_type,file_size,...view} = session;
  return {...view,file:file_key ? {name:file_name,type:file_type,size:file_size} : null};
}

async function schoolUpcomingSessions(db,scope,limit) {
  const [today,time]=schoolMoroccoClock.format(Date.now()).replace(' ','T').split('T');
  const [hour,minute]=time.split(':').map(Number);
  const rows=await schoolSessions(db,scope,'s.date>? OR (s.date=? AND s.start_minute+s.duration>?)',
    [today,today,hour*60+minute],false,limit);
  return rows.map(schoolSessionView);
}

function schoolSessionEnded(session) {
  return schoolSessionInstant(session.date,session.start_minute+session.duration)<=Date.now();
}

function schoolSessionInstant(date,minute) {
  const time=Date.parse(date+'T00:00:00Z')+minute*SCHOOL_MINUTE;
  return schoolDateTime(new Date(time).toISOString().slice(0,16),'Africa/Casablanca')??time;
}

function schoolOptionalUrl(value) {
  if (!value) return null;
  const text = schoolText(value,2000);
  try {
    const url = new URL(text);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {}
  throw new SchoolError(400,'Utilise un lien HTTPS valide.');
}

async function schoolTeaching(db,account,teacherId,classId) {
  schoolRoles(account,'administration','professeur');
  const teacher = account.role === 'professeur' ? account.id : teacherId;
  schoolRequire(schoolId(teacher) && schoolId(classId),'Choisis le professeur et la classe.');
  const match = await schoolFirst(db,`SELECT t.teacher_id,t.class_id,t.subject FROM school_teaching t
    JOIN school_accounts a ON a.id=t.teacher_id AND a.active=1 AND a.role='professeur'
    WHERE t.teacher_id=? AND t.class_id=?`,[teacher,classId]);
  if (!match) throw new SchoolError(403,'Ce professeur n’est pas affecté à cette classe.');
  return match;
}

function schoolSessionDuration(value) {
  const duration = Number(value);
  schoolRequire(Number.isInteger(duration) && duration >= 1 && duration <= 1440,'Indique une durée valide.');
  return duration;
}

async function schoolAvailableSlots(db,account,params) {
  const teaching = await schoolTeaching(db,account,params.get('teacher'),params.get('class'));
  const requested = params.get('date');
  schoolRequire(schoolDate(requested),'Choisis une date.');
  const duration = schoolSessionDuration(params.get('duration'));
  const from = Date.parse((requested < schoolToday() ? schoolToday() : requested)+'T00:00:00Z');
  const excluded = params.get('session') || '';
  if (excluded) {
    const existing = await schoolFirst(db,'SELECT id,teacher_id FROM school_sessions WHERE id=?',[excluded]);
    if (!existing || (account.role !== 'administration' && existing.teacher_id !== account.id)) {
      throw new SchoolError(404,'La séance est introuvable.');
    }
  }
  const busy = await schoolAll(db,`SELECT date,start_minute,duration FROM school_sessions
    WHERE date BETWEEN ? AND ? AND (teacher_id=? OR class_id=?) AND id<>?`,
    [schoolDay(from),schoolDay(from+13*SCHOOL_DAY),teaching.teacher_id,teaching.class_id,excluded]);
  const slots = [];
  const now = Date.now();
  for (let day=0;day<14 && slots.length<5;day++) {
    const timestamp = from+day*SCHOOL_DAY;
    const weekday = new Date(timestamp).getUTCDay();
    if (weekday===0 || weekday===6) continue;
    const date = schoolDay(timestamp);
    for (let start=480;start+duration<=1080 && slots.length<5;start+=30) {
      if (schoolSessionInstant(date,start)<now) continue;
      if (busy.some(entry=>entry.date===date && start<entry.start_minute+entry.duration && entry.start_minute<start+duration)) continue;
      slots.push({date,start_minute:start,duration});
    }
  }
  return slots;
}

function schoolFilename(value) {
  return String(value || '').replace(/[\\/\x00-\x1f\x7f]/g,'_').trim().slice(0,120) || 'support';
}

async function schoolAttachment(file) {
  if (!file || typeof file === 'string' || !file.size) return null;
  if (file.size > SCHOOL_FILE_LIMIT) throw new SchoolError(413,'Le support doit faire au plus 12 Mo.');
  const head = new Uint8Array(await file.slice(0,16).arrayBuffer());
  const ascii = String.fromCharCode(...head);
  const kind = ascii.startsWith('%PDF-') ? ['application/pdf','pdf'] :
    ascii.slice(4,8)==='ftyp' ? ['video/mp4','mp4'] :
    head[0]===0x1a && head[1]===0x45 && head[2]===0xdf && head[3]===0xa3 && file.type==='video/webm' ? ['video/webm','webm'] : null;
  if (!kind) throw new SchoolError(400,'Joins un fichier PDF, MP4 ou WebM valide.');
  const name = schoolFilename(file.name).replace(/\.[^.]+$/,'')+'.'+kind[1];
  return {key:'school/'+crypto.randomUUID(),name,type:kind[0],size:file.size,file};
}

async function schoolSessionSave(env,account,request) {
  schoolRoles(account,'administration','professeur');
  const db = env.DB;
  const payload = await schoolReadBody(request,SCHOOL_FILE_LIMIT+65536);
  let form;
  try { form = await payload.formData(); }
  catch { throw new SchoolError(400,'Le formulaire de séance est invalide.'); }
  const values = Object.fromEntries(form);
  const existingId = values.id || '';
  schoolRequire(!existingId || schoolId(existingId),'Séance invalide.');
  const existing = existingId && await schoolFirst(db,'SELECT * FROM school_sessions WHERE id=?',[existingId]);
  if (existingId && (!existing || (account.role!=='administration' && existing.teacher_id!==account.id))) {
    throw new SchoolError(404,'Cette séance est introuvable.');
  }
  if (existing && existing.revision !== Number(values.revision)) {
    throw new SchoolError(409,'La séance a changé. Rouvre-la avant de la modifier.');
  }
  const teaching = await schoolTeaching(db,account,values.teacher,values.class);
  const title = schoolText(values.title,120);
  const description = schoolText(values.description,TEACHER_LESSON_PUBLISH_LIMIT);
  const exercise = schoolText(values.exercise,12000);
  const shortExercise = exercise ? schoolText(values.shortExercise,2000) : '';
  const date = values.date;
  const start = Number(values.start);
  const duration = schoolSessionDuration(values.duration);
  schoolRequire(title && schoolDate(date) && typeof values.start==='string' && values.start!=='' &&
    Number.isInteger(start) && start>=0 && start+duration<=1440,'Vérifie le titre, la date et l’horaire.');
  schoolRequire(!values.description || description,'La consigne doit faire au plus 20 000 caractères.');
  schoolRequire(!values.exercise || exercise,'L’exercice doit faire au plus 12 000 caractères.');
  schoolRequire(!values.shortExercise || shortExercise,'Ajoute un exercice principal et limite la version courte à 2 000 caractères.');
  const due = exercise ? (values.due || date) : null;
  schoolRequire(!due || schoolDate(due),'La date du devoir est invalide.');
  const meeting = schoolOptionalUrl(values.meeting);
  const video = schoolOptionalUrl(values.video);
  const upload = await schoolAttachment(form.get('support'));
  if (upload && !env.BUCKET) throw new SchoolError(503,'Le stockage des supports est indisponible.');
  const oldFile = existing && values.removeFile !== '1' && existing.file_key ? {
    key:existing.file_key,name:existing.file_name,type:existing.file_type,size:existing.file_size
  } : null;
  const attachment = upload || oldFile;
  const id = existingId || crypto.randomUUID();
  const fields = [teaching.class_id,teaching.teacher_id,teaching.subject,title,date,start,duration,
    description,exercise,shortExercise,due,meeting,video,attachment?.key??null,attachment?.name??null,
    attachment?.type??null,attachment?.size??null,Date.now()];
  const available = `NOT EXISTS (SELECT 1 FROM school_sessions AS clash WHERE clash.id<>? AND clash.date=?
    AND (clash.class_id=? OR clash.teacher_id=?)
    AND clash.start_minute<? AND clash.start_minute+clash.duration>?)`;
  const availability = [id,date,teaching.class_id,teaching.teacher_id,start+duration,start];
  const currentTeaching = `EXISTS (SELECT 1 FROM school_teaching t JOIN school_accounts a ON a.id=t.teacher_id
    WHERE t.teacher_id=? AND t.class_id=? AND t.subject=? AND a.active=1)`;
  const assignment = [teaching.teacher_id,teaching.class_id,teaching.subject];
  const movesClass=!!existing&&existing.class_id!==teaching.class_id;
  const dropsHomework=!!existing?.exercise&&!exercise;
  const retained=`(?=0 OR NOT EXISTS (SELECT 1 FROM school_attendance p WHERE p.session_id=school_sessions.id))
    AND (?=0 OR NOT EXISTS (SELECT 1 FROM school_submissions p WHERE p.session_id=school_sessions.id))`;
  let saved = false;
  try {
    if (upload) await env.BUCKET.put(upload.key,upload.file,{httpMetadata:{contentType:upload.type}});
    const result = existing ?
      await schoolRun(db,`UPDATE school_sessions SET class_id=?,teacher_id=?,subject=?,title=?,date=?,
        start_minute=?,duration=?,description=?,exercise=?,short_exercise=?,due_date=?,meeting_url=?,video_url=?,
        file_key=?,file_name=?,file_type=?,file_size=?,updated_at=?,revision=revision+1
        WHERE id=? AND revision=? AND ${available} AND ${currentTeaching} AND ${retained}`,
        [...fields,id,existing.revision,...availability,...assignment,Number(movesClass),Number(movesClass||dropsHomework)]) :
      await schoolRun(db,`INSERT INTO school_sessions(id,class_id,teacher_id,subject,title,date,start_minute,
        duration,description,exercise,short_exercise,due_date,meeting_url,video_url,file_key,file_name,file_type,file_size,updated_at)
        SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${available} AND ${currentTeaching}`,
        [id,...fields,...availability,...assignment]);
    saved = schoolChanged(result);
    if (!saved) {
      if((movesClass||dropsHomework)&&await schoolFirst(db,`SELECT id FROM school_sessions WHERE id=? AND NOT (${retained})`,
        [id,Number(movesClass),Number(movesClass||dropsHomework)])) {
        throw new SchoolError(409,'Cette séance contient déjà un appel ou des devoirs remis.');
      }
      throw new SchoolError(409,'La séance ou le créneau a changé. Vérifie les créneaux libres.');
    }
    return id;
  } finally {
    const unused = !saved ? upload?.key : existing?.file_key!==attachment?.key ? existing?.file_key : null;
    if (unused && env.BUCKET) {
      try { await env.BUCKET.delete(unused); }
      catch { console.warn('School attachment cleanup failed'); }
    }
  }
}

async function schoolCatchup(db,account,data) {
  schoolRoles(account,'eleve');
  schoolRequire(schoolId(data.id) && Number.isInteger(data.step) && data.step>=1 && data.step<=3,'Étape invalide.');
  const scope = schoolSessionScope(account,account);
  const [session] = await schoolSessions(db,scope,'s.id=?',[data.id]);
  if (!session || !schoolSessionEnded(session)) throw new SchoolError(404,'Cette séance ne peut pas encore être rattrapée.');
  const result = data.step===1 ?
    await schoolRun(db,'INSERT OR IGNORE INTO school_catchup(student_id,session_id,step) VALUES(?,?,1)',[account.id,data.id]) :
    await schoolRun(db,'UPDATE school_catchup SET step=? WHERE student_id=? AND session_id=? AND step=?',
      [data.step,account.id,data.id,data.step-1]);
  if (!schoolChanged(result)) {
    const current = await schoolFirst(db,'SELECT step FROM school_catchup WHERE student_id=? AND session_id=?',[account.id,data.id]);
    if (!current || current.step<data.step) throw new SchoolError(409,'Termine d’abord l’étape précédente.');
  }
}

function schoolDisposition(name,inline = false) {
  const filename = encodeURIComponent(name).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16));
  return (inline ? 'inline' : 'attachment')+"; filename*=UTF-8''"+filename;
}

async function schoolSessionFile(env,account,id,url,request) {
  if (!schoolId(id) || !env.BUCKET) throw new SchoolError(404,'Support introuvable.');
  const child = schoolChild(await schoolChildren(env.DB,account),url.searchParams.get('child'));
  const [session] = await schoolSessions(env.DB,schoolSessionScope(account,child),'s.id=?',[id]);
  if (!session?.file_key) throw new SchoolError(404,'Support introuvable.');
  const rawRange = request.headers.get('range');
  const range = rawRange ? assetRange(rawRange,session.file_size) : null;
  const headers = {
    'Content-Type':session.file_type,'Cache-Control':'private, no-store',
    'Content-Disposition':schoolDisposition(session.file_name,url.searchParams.get('view')==='1'),
    'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"
  };
  if (rawRange && !range) return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${session.file_size}`}});
  const object = range ? await env.BUCKET.get(session.file_key,{range:{offset:range.start,length:range.end-range.start+1}}) :
    await env.BUCKET.get(session.file_key);
  if (!object) throw new SchoolError(404,'Support introuvable.');
  headers['Content-Length'] = String(range ? range.end-range.start+1 : session.file_size);
  if (range) headers['Content-Range'] = `bytes ${range.start}-${range.end}/${session.file_size}`;
  return new Response(object.body,{status:range ? 206 : 200,headers});
}

const schoolEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function schoolOfflinePack(env,account,url) {
  schoolRoles(account,'eleve');
  const week = schoolWeek(url.searchParams.get('week'));
  const sessions = await schoolSessions(env.DB,schoolSessionScope(account,account),
    '(s.date BETWEEN ? AND ?) OR (s.due_date BETWEEN ? AND ?)',[week.start,week.end,week.start,week.end]);
  if (!sessions.length) throw new SchoolError(404,'Aucun cours ni exercice pour cette semaine.');
  const size = sessions.reduce((total,entry)=>total+(entry.file_size||0),0);
  if (size>SCHOOL_PACK_LIMIT) throw new SchoolError(413,'Le dossier dépasse 32 Mo. Télécharge les supports depuis les séances.');
  const files = [];
  const html = [];
  for (const [index,session] of sessions.entries()) {
    let support = '';
    if (session.file_key) {
      if (!env.BUCKET) throw new SchoolError(503,'Le stockage des supports est indisponible.');
      const object = await env.BUCKET.get(session.file_key);
      if (!object) throw new SchoolError(409,'Un support a changé. Actualise le planning et relance le téléchargement.');
      const name = 'supports/'+String(index+1).padStart(2,'0')+'-'+session.file_name;
      files.push({name,bytes:new Uint8Array(await object.arrayBuffer())});
      support = `<p><a href="${schoolEscape(encodeURI(name).replace(/#/g,'%23').replace(/\?/g,'%3F'))}">${schoolEscape(session.file_name)}</a></p>`;
    }
    const video = session.video_url ? `<p><a href="${schoolEscape(session.video_url)}" rel="noreferrer">Vidéo en ligne</a></p>` : '';
    html.push(`<section><h2>${schoolEscape(session.title)}</h2><p>${schoolEscape(session.subject)} · ${schoolEscape(session.date)}</p>
      ${session.description ? `<h3>Consigne</h3><p>${schoolEscape(session.description)}</p>` : ''}
      ${support}${video}
      ${session.exercise ? `<h3>Exercice · ${schoolEscape(session.due_date)}</h3><p>${schoolEscape(session.exercise)}</p>` : ''}</section>`);
  }
  const index = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Madrassati Maâk · Dossier de la semaine</title>
    <style>body{font:16px/1.55 system-ui;margin:2rem auto;padding:0 1rem;max-width:48rem;color:#203d37}section{border-top:1px solid #bdd0c3;margin-top:2rem}p{white-space:pre-wrap}a{color:#255943}</style>
    <h1>Dossier de la semaine</h1><p>Du ${week.start} au ${week.end}</p>${html.join('')}</html>`;
  const zip = schoolZip([{name:'index.html',bytes:new TextEncoder().encode(index)},...files]);
  return new Response(zip,{headers:{
    'Content-Type':'application/zip','Content-Disposition':schoolDisposition(`Madrassati-Maak-${week.start}.zip`),
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'
  }});
}
