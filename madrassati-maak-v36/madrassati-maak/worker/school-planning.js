const SCHOOL_FILE_LIMIT = 12*1024*1024;
const SCHOOL_SESSION_COLUMNS = `s.*,c.name AS class_name,a.name AS teacher_name,
  EXISTS (SELECT 1 FROM school_session_quizzes q WHERE q.session_id=s.id) AS has_quiz`;

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
    WHERE (${scope.where}) AND s.cancelled_at IS NULL AND (${condition}) ORDER BY s.date ${direction},s.start_minute ${direction},s.id LIMIT ?`,
    [...scope.args,...params,limit]);
}

function schoolSessionView(session) {
  const {file_key,file_name,file_type,file_size,...view} = session;
  delete view.meeting_url;
  return {...view,file:file_key ? {name:file_name,type:file_type,size:file_size} : null};
}

async function schoolSessionDetails(db,account,child,id) {
  schoolRequire(schoolId(id),'Séance invalide.');
  const [session]=await schoolSessions(db,schoolSessionScope(account,child),'s.id=?',[id]);
  if(!session)throw new SchoolError(404,'Cette séance est introuvable.');
  return session;
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

async function schoolChapterSave(env,account,request) {
  schoolRoles(account,'professeur');
  const form=await schoolMultipart(request,SCHOOL_FILE_LIMIT);
  const id=form.get('id')||crypto.randomUUID();
  const db=env.DB;
  const previous=form.get('id')?await schoolSessionDetails(db,account,null,id):null;
  const teaching=await schoolTeaching(db,account,account.id,form.get('class'));
  const title=schoolText(form.get('title'),120);
  const description=schoolText(form.get('description'),TEACHER_LESSON_PUBLISH_LIMIT);
  const exercise=schoolText(form.get('exercise'),12000);
  const shortExercise=schoolText(form.get('shortExercise'),2000);
  const video=schoolOptionalUrl(form.get('video'));
  const due=exercise?(form.get('due')||null):null;
  schoolRequire(title&&(!form.get('description')||description)&&(!form.get('exercise')||exercise)
    &&(!form.get('shortExercise')||(shortExercise&&exercise))&&(!due||schoolDate(due)),
  'Vérifie le titre, le contenu et le devoir du chapitre.');
  schoolRequire(!previous||previous.class_id===teaching.class_id,'Le niveau est fixé lors de la publication du chapitre.');
  const upload=await schoolAttachment(form.get('support'));
  const kept=previous&&form.get('removeFile')!=='1'?previous:null;
  const attachment=upload||{key:kept?.file_key,name:kept?.file_name,type:kept?.file_type,size:kept?.file_size};
  schoolRequire(description||attachment.key||video,'Ajoute du contenu, une vidéo ou un support au chapitre.');
  const fields=[title,description,exercise,shortExercise,due,video,attachment.key??null,attachment.name??null,
    attachment.type??null,attachment.size??null,Date.now()];
  const scope=`EXISTS (SELECT 1 FROM school_teaching t JOIN school_accounts a ON a.id=t.teacher_id AND a.active=1
    WHERE t.teacher_id=? AND t.class_id=? AND t.subject=?)`;
  const teachingArgs=[account.id,teaching.class_id,teaching.subject];
  await schoolWithUpload(env,upload,previous?.file_key,async()=>{
    const result=previous?await schoolRun(db,`UPDATE school_sessions
      SET title=?,description=?,exercise=?,short_exercise=?,due_date=?,video_url=?,file_key=?,file_name=?,
      file_type=?,file_size=?,updated_at=?,meeting_url=NULL,revision=revision+1
      WHERE id=? AND revision=? AND cancelled_at IS NULL AND ${scope}
        AND (?<>'' OR NOT EXISTS (SELECT 1 FROM school_submissions p WHERE p.session_id=?))`,
      [...fields,id,Number(form.get('revision')), ...teachingArgs,exercise,id]):
      await schoolRun(db,`INSERT INTO school_sessions(id,class_id,teacher_id,subject,date,start_minute,duration,
        title,description,exercise,short_exercise,due_date,video_url,file_key,file_name,file_type,file_size,updated_at)
        SELECT ?,?,?,?,?,0,1,?,?,?,?,?,?,?,?,?,?,? WHERE ${scope}`,
        [id,teaching.class_id,account.id,teaching.subject,schoolToday(),...fields,...teachingArgs]);
    if(!schoolChanged(result))throw new SchoolError(409,'Le chapitre ou son niveau a changé. Rouvre le chapitre.');
  });
  if(!upload&&previous?.file_key&&!attachment.key)await env.BUCKET.delete(previous.file_key).catch(()=>{});
  return id;
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
