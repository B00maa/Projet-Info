const DEEPSEEK_COACH={
  url:'https://api.deepseek.com/chat/completions',model:'deepseek-flash',secret:'DEEPSEEK_API_KEY'
};
const GROQ_TEACHER_COACH={
  url:'https://api.groq.com/openai/v1/chat/completions',model:'openai/gpt-oss-120b',secret:'GROQ_API_KEY'
};
const GROQ_STUDENT_COACH={...GROQ_TEACHER_COACH,model:'openai/gpt-oss-20b'};
const MAX_CHAT_BODY = 192 * 1024;
const STUDENT_COACH_PROMPT = [
  'Tu es le coach scolaire de Madrassati Maâk pour des élèves du collège.',
  'Guide avec des indices et des explications adaptées au niveau de l’élève.',
  'Pour un devoir, encourage l’élève à réfléchir et à proposer une étape avant de donner la solution.',
  'Réponds dans la langue de la question. Pour le reste, utilise la langue d’interface indiquée.',
  'Reste dans le cadre scolaire, évite de demander ou de répéter des données personnelles.',
  'Donne du texte clair avec de courts paragraphes. Si tu ignores un fait, signale-le.'
].join(' ');
const TEACHER_TASKS = {
  lesson:'Développe un cours avec les définitions, les propriétés et leurs conditions, les méthodes et les justifications adaptées au niveau.',
  exercises:'Prépare une série d’exercices progressifs. Rédige les consignes et les données nécessaires pour les élèves, puis détaille les étapes du corrigé pour chaque exercice.',
  exam:'Prépare un sujet d’examen avec les consignes, la durée et les points de chaque question. Vérifie que les points correspondent au total. Rédige le corrigé et le barème détaillé à part.'
};
const TEACHER_LANGUAGES = {fr:'français',ar:'arabe',en:'anglais'};
const teacherLessonTimeout=65000;

function json(body,status = 200,headers = {}) {
  return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}

function coachProviders(env,teacher,school=false) {
  const groq=teacher?[GROQ_TEACHER_COACH,GROQ_STUDENT_COACH]:school?[GROQ_STUDENT_COACH,GROQ_TEACHER_COACH]:[];
  return [...groq,DEEPSEEK_COACH].filter(provider=>env[provider.secret]?.trim());
}

function coachAuthorization(request,env) {
  const allowed = (env.COACH_AI_ALLOWED_EMAILS || '').toLowerCase().split(/[,;\s]+/).filter(email => /^[^@\s]+@[^@\s]+$/.test(email));
  if (!allowed.length) return 'needs-access';
  const id = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  if (!id) return 'sign-in';
  return allowed.includes(email) ? 'ready' : 'forbidden';
}

const coachAccessError=status=>json({status},{'sign-in':401,forbidden:403}[status]||503);

async function readCoachBody(request) {
  if (!request.body || Number(request.headers.get('content-length')) > MAX_CHAT_BODY) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '', size = 0;
  for (;;) {
    const {done,value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_CHAT_BODY) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value,{stream:true});
  }
  return JSON.parse(text + decoder.decode());
}

function validChat(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 11 || messages.length % 2 === 0) return false;
  return messages.every((message,index) => {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    const maxLength = role === 'user' ? 3000 : 10000;
    return message?.role === role && typeof message.content === 'string' && message.content.length <= maxLength && !!message.content.trim();
  });
}

function studentCoachRequest(chat) {
  if (!validChat(chat.messages)) return null;
  const language = chat.language === 'ar' ? 'arabe' : 'français';
  const messages=chat.messages.map(({role,content})=>({role,content}));
  const encoder=new TextEncoder();
  const size=message=>encoder.encode(message.content).length;
  let start=messages.length-1;
  let budget=5600-size(messages[start]);
  for(let index=start-2;index>=0;index-=2) {
    budget-=size(messages[index])+size(messages[index+1]);
    if(budget<0)break;
    start=index;
  }
  return {
    max_tokens:1000,
    messages:[{role:'system',content:`${STUDENT_COACH_PROMPT} Langue de l’interface : ${language}.`},...messages.slice(start)]
  };
}

function teacherCoachRequest(input) {
  const {task,language,topic,notes,subject,level} = input;
  if (typeof task !== 'string' || !Object.hasOwn(TEACHER_TASKS,task) || typeof language !== 'string' || !Object.hasOwn(TEACHER_LANGUAGES,language)) return null;
  const fields = [[topic,120],[notes,1600],[subject,80],[level,100]];
  if (fields.some(([value,max]) => typeof value !== 'string' || value.length > max) || !topic.trim() || !subject.trim() || !level.trim()) return null;
  if ((input.count!=null&&(!Number.isInteger(input.count)||input.count<1||input.count>12)) ||
      (input.minutes!=null&&(!Number.isInteger(input.minutes)||input.minutes<1||input.minutes>180)) ||
      (input.difficulty!=null&&!['progressive','easy','standard','advanced'].includes(input.difficulty)) ||
      (input.format!=null&&!['open','qcm'].includes(input.format))) return null;
  const lesson=task==='lesson';
  if(lesson&&!validLessonRequest(input))return null;
  if(lesson&&input.lessonAction)return teacherLessonToolPrompt(input);
  const requestedLevel=lesson&&input.lessonLevel&&input.lessonLevel!=='class'?TEACHER_LESSON_LEVELS[input.lessonLevel].fr:undefined;
  const system = [
    'Tu es le coach pédagogique de Madrassati Maâk. Rédige un document complet et directement exploitable en classe.',
    TEACHER_TASKS[task],
    'Suis le sujet et les consignes. Si un niveau pédagogique est sélectionné, applique ce niveau. En CPGE, précise les hypothèses des théorèmes et démontre les propriétés importantes. En L1, présente les définitions formelles puis déroule les méthodes avec des exemples gradués. Donne des énoncés autonomes avec leurs données.',
    'Écris le document dans la langue demandée. N’utilise pas de données personnelles d’élèves.',
    'Réponds exclusivement avec un objet json ayant exactement cette forme :',
    lesson ?
      '{"title":"Titre court","summary":"Résumé du cours","objectives":["Objectif"],"sections":[{"heading":"Intitulé","explanation":"Cours rédigé","example":"Exemple résolu"}],"recap":"Synthèse","exercises":[{"prompt":"Énoncé","solution":"Corrigé détaillé","section":1'+(coachMathCourse(input)?',"checks":[]':'')+'}],"duration":60}' :
      '{"title":"Titre court","summary":"Consigne commune","items":[{"prompt":"Énoncé concret sans numéro initial","solution":"Réponse expliquée sans numéro initial","points":5}],"duration":30}',
    ...(lesson?teacherLessonInstructions(input):[
      'Donne exactement la quantité demandée. Le format qcm impose trois choix A), B) et C) par énoncé avec une seule bonne réponse. Ne mets jamais la solution dans un énoncé.',
      'Pour un examen, points est un nombre strictement positif et le total est 20 sauf demande explicite. Pour des exercices sans barème, utilise 0 pour points. Garde chaque énoncé et solution sous 900 caractères.'
    ]),
    'duration est un entier de 1 à 180 en minutes. Respecte la durée et le niveau de difficulté demandés. Utilise du texte brut sans balisage.',
    'Écris les formules avec des symboles lisibles et des parenthèses explicites, par exemple 2/3, (x + 1)/(x - 2), x², √(x + 1) et ≤. Utilise la même notation dans l’énoncé et le corrigé.'
  ].join(' ');
  const context = {matière:subject.trim(),niveau:level.trim(),langue:TEACHER_LANGUAGES[language],sujet:topic.trim(),
    portée:lesson?(input.lessonMode==='session'?'séance ciblée':'chapitre complet'):undefined,
    niveauPédagogique:requestedLevel,plan:lesson?input.lessonPlan:undefined,
    quantité:lesson?undefined:input.count,format:lesson?undefined:input.format,
    difficulté:input.difficulty,durée:input.minutes,précisions:notes.trim()};
  return {
    max_tokens:lesson?teacherLessonMode(input).tokens:7600,
    response_format:{type:'json_object'},
    messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(context)}]
  };
}

function structuredCoachObject(properties) {
  return {type:'object',properties,required:Object.keys(properties),additionalProperties:false};
}

function groqTeacherFormat(input) {
  const text={type:'string'};
  const common={title:text,summary:text,duration:{type:'integer'}};
  const lesson=input.task==='lesson';
  const action=lesson&&input.lessonAction;
  let properties=lesson ? {...common,objectives:{type:'array',items:text},
    sections:{type:'array',items:structuredCoachObject({heading:text,explanation:text,example:text})},recap:text,
    exercises:{type:'array',items:teacherLessonExerciseSchema(input)}
  } : {...common,items:{
    type:'array',items:structuredCoachObject({prompt:text,solution:text,points:{type:'number'}})
  }};
  if(action==='plan')properties={plan:{type:'array',items:text}};
  if(action==='expand')properties={text};
  return {type:'json_schema',json_schema:{name:'document_pedagogique',strict:true,schema:structuredCoachObject(properties)}};
}

const TEACHER_EXPORT_TERMS={
  fr:['Exercice','Question','Total','points'],
  en:['Exercise','Question','Total','marks'],
  ar:['التمرين','السؤال','المجموع','نقاط']
};

function teacherCoachDraft(draft,input) {
  const {task,language}=input;
  if (!draft || typeof draft.title !== 'string' || !draft.title.trim()) return null;
  const read=(value,max)=>typeof value==='string'&&value.trim().length<=max?value.trim():'';
  const summary=read(draft.summary,350);
  const duration=Number(draft.duration);
  const header={title:draft.title.trim().slice(0,100),summary,
    duration:input.minutes||(Number.isInteger(duration)&&duration>=1&&duration<=180?duration:
      task==='lesson'?teacherLessonMode(input).duration:task==='exam'?45:20)};
  if(task==='lesson') {
    const lesson=validatedTeacherLesson(draft,input);
    return lesson?{...header,...lesson}:null;
  }
  if(Array.isArray(draft.items)) {
    if(!draft.items.length||draft.items.length>12||(input.count&&draft.items.length!==input.count)) return null;
    const [exercise,question,totalLabel,marks]=TEACHER_EXPORT_TERMS[language];
    const exam=task==='exam';
    const items=draft.items.map(item=>({
      prompt:read(item?.prompt,950),solution:read(item?.solution,950),
      points:typeof item?.points==='number'?item.points:0
    }));
    if(items.some(item=>!item.prompt||!item.solution||(exam&&(!Number.isFinite(item.points)||item.points<=0))))return null;
    if(new Set(items.map(item=>item.prompt.replace(/\s+/g,' ').toLowerCase())).size!==items.length)return null;
    if(input.format==='qcm'&&items.some(item=>!['A','B','C'].every(letter=>new RegExp('^\\s*'+letter+'[).:]','im').test(item.prompt)))) return null;
    const total=Math.round(items.reduce((sum,item)=>sum+item.points,0)*100)/100;
    const requestedTotal=Number(input.notes.match(/(?:\/|sur |out of |من )\s*(\d{1,3})(?!\d)\s*(?:points?|marks?|نقط|[.,;]|$)/i)?.[1])||20;
    if(exam&&total!==requestedTotal)return null;
    const heading=(item,index)=>(exam?question:exercise)+' '+(index+1)+(exam?' - '+item.points+' '+marks:'');
    const score=exam?totalLabel+' '+total+' '+marks:'';
    const lines=key=>items.map((item,index)=>heading(item,index)+'\n'+item[key]);
    const content=[score,summary,...lines('prompt')].filter(Boolean).join('\n\n');
    const correction=[score,...lines('solution')].filter(Boolean).join('\n\n');
    return {...header,content,correction,count:items.length};
  }
  if(input.count)return null;
  const content=read(draft.content,12000),correction=read(draft.correction,16000);
  return content&&correction?{...header,content,correction}:null;
}

function teacherCoachResponse(answer,input) {
  let data;
  try {data=JSON.parse(answer.trim().replace(/^`{3}(?:json)?\s*([\s\S]+?)\s*`{3}$/i,'$1'));}
  catch {return null;}
  if(!data||typeof data!=='object')return null;
  if(input.task==='lesson'&&input.lessonAction==='plan') {
    const plan=validateTeacherPlan(data.plan,input.lessonMode);
    const [min,max]=teacherLessonMode(input).sections;
    return plan&&plan.length>=min&&plan.length<=max?{plan}:null;
  }
  if(input.task==='lesson'&&input.lessonAction==='expand') {
    const addition=schoolText(data.text,2400);
    return lessonWords(addition)>=30&&teacherLessonKey(addition)!==teacherLessonKey(input.explanation)&&
      teacherLessonKey(addition)!==teacherLessonKey(input.example)?{addition}:null;
  }
  const draft=teacherCoachDraft(data,input);
  return draft?{draft}:null;
}

function coachServiceError({status,code=502,detail,retryAfter}) {
  console.error('Coach service error',status,detail ?? '');
  return retryAfter?json({status,retryAfter},code,{'Retry-After':String(retryAfter)}):json({status},code);
}

function coachProviderError(response) {
  const detail=response.status;
  if (detail===401||detail===403) return {status:'provider-auth',detail};
  if (detail===402) return {status:'provider-balance',detail};
  if (detail===429) {
    const retry=response.headers.get('Retry-After');
    const seconds=retry&&(/^\d+$/.test(retry)?Number(retry):Math.ceil((Date.parse(retry)-Date.now())/1000));
    return {status:'rate-limit',code:429,detail,retryAfter:seconds>0?Math.min(seconds,86400):undefined};
  }
  if (detail===503) return {status:'busy',code:503,detail};
  if (detail===400||detail===404||detail===422||detail>=300&&detail<400) return {status:'provider-request',detail};
  return {status:'unavailable',detail};
}

function coachTransportDiagnostic(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  if (/header|authorization|latin.?1/i.test(message)) return 'request-header';
  if (/outbound|egress|denied|not allowed|prohibited|not permitted/i.test(message)) return 'outbound-access';
  if (/dns|resolve|name resolution|no such host/i.test(message)) return 'dns';
  if (/tls|ssl|certificate/i.test(message)) return 'tls';
  if (/redirect/i.test(message)) return 'redirect';
  return 'transport';
}

async function tryCoach(provider,apiKey,body,input,teacher,signal,timeout) {
  const controller=new AbortController();
  const cancel=()=>controller.abort();
  signal.addEventListener('abort',cancel,{once:true});
  const deadline=setTimeout(cancel,timeout);
  try {
    if(signal.aborted)return {status:'timeout',code:504};
    const response=await fetch(provider.url,{
      method:'POST',
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(body),redirect:'manual',signal:controller.signal
    });
    if(!response.ok) {
      const failure=coachProviderError(response);
      await response.body?.cancel().catch(()=>{});
      return failure;
    }
    const data=await response.json();
    if(!data)return {status:'invalid-response'};
    const choice=data?.choices?.[0];
    const answer=choice?.message?.content;
    if(teacher&&choice?.finish_reason==='length')return {status:'incomplete'};
    if(typeof answer!=='string'||!answer.trim())return {status:'empty-answer'};
    if(!teacher)return {result:{answer:answer.trim().slice(0,10000)}};
    const result=teacherCoachResponse(answer,input);
    return result?{result}:{status:input.task==='lesson'&&!input.lessonAction?'lesson-incomplete':'invalid-response'};
  } catch(error) {
    if(controller.signal.aborted)return {status:'timeout',code:504};
    if(error instanceof SyntaxError)return {status:'invalid-response'};
    return {status:'network-error',detail:coachTransportDiagnostic(error)};
  } finally {
    clearTimeout(deadline);
    signal.removeEventListener('abort',cancel);
  }
}

async function replyToCoach(request,env,account) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return json({status:'forbidden'},403);
  if (!account) {
    if (!env.DEEPSEEK_API_KEY?.trim()&&!env.GROQ_API_KEY?.trim()) return coachAccessError('needs-key');
    const authorization=coachAuthorization(request,env);
    if(authorization!=='ready')return coachAccessError(authorization);
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return json({status:'invalid'},415);

  let input = await readCoachBody(request).catch(() => null);
  if (!input || ![undefined,'student','teacher'].includes(input.profile)) return json({status:'invalid'},400);
  const teacher=account?account.role==='professeur':input.profile==='teacher';
  if(account&&input.profile&&input.profile!==(teacher?'teacher':'student')) return json({status:'forbidden'},403);
  const providers=coachProviders(env,teacher,!!account);
  if(!providers.length)return coachAccessError('needs-key');
  if(account&&teacher&&input.classId) {
    const teaching=await schoolTeaching(env.DB,account,account.id,input.classId);
    const entry=await schoolFirst(env.DB,'SELECT name FROM school_classes WHERE id=?',[teaching.class_id]);
    if(!entry)return json({status:'invalid'},400);
    input={...input,profile:'teacher',subject:teaching.subject,level:entry.name};
  }
  const parameters = teacher ? teacherCoachRequest(input) : studentCoachRequest(input);
  if (!parameters) return json({status:'invalid'},400);
  if (account&&!await schoolCoachLimit(env.DB,account)) return json({status:'school-rate-limit',retryAfter:300},429,{'Retry-After':'300'});
  const lesson=teacher&&input.task==='lesson';
  // A configurable single-provider installation can still repair malformed documents.
  if(teacher&&providers.length===1)providers.push(providers[0]);
  const deadline=Date.now()+(lesson?teacherLessonTimeout:teacher?50000:30000);
  const failures=[];
  const unusableSecrets=new Set();
  for(const [index,provider] of providers.entries()) {
    const remaining=deadline-Date.now();
    if(remaining<=0||request.signal.aborted)break;
    if(unusableSecrets.has(provider.secret))continue;
    const apiKey=env[provider.secret].trim().replace(/^(["'])([\s\S]*)\1$/,'$2').replace(/^Bearer[ \t]+/i,'').trim();
    if(!/^[!-~]+$/.test(apiKey)) {
      failures.push({status:'provider-auth',detail:'credential-format'});
      unusableSecrets.add(provider.secret);
      continue;
    }
    const previous=failures.at(-1);
    if(index&&provider===providers[index-1]&&previous?.detail)continue;
    const groq=provider.secret==='GROQ_API_KEY';
    const {max_tokens,messages,response_format}=parameters;
    const structured=teacher&&groq&&previous?.status!=='provider-request';
    const completionTokens=teacher?(lesson?max_tokens:1600+330*(input.count??5)):1500;
    const body={
      model:provider.model,stream:false,messages,
      ...(groq?{reasoning_effort:'low',max_completion_tokens:completionTokens}:{max_tokens,thinking:{type:'disabled'}}),
      ...(teacher?{response_format:structured?groqTeacherFormat(input):response_format}:{})
    };
    if(teacher&&['invalid-response','empty-answer','incomplete','lesson-incomplete'].includes(previous?.status)) {
      body.messages=[...messages,{role:'user',content:lesson&&!input.lessonAction?
        'Vérifie les longueurs des sections, les exemples résolus, la synthèse et les corrigés. Si un plan est fourni, utilise chaque intitulé dans l’ordre. Renvoie le document complet dans un seul objet JSON.':
        'Vérifie le format et le nombre d’éléments demandés, puis renvoie un seul objet JSON complet.'}];
    }
    const timeout=index<providers.length-1?Math.ceil(remaining*0.6):remaining;
    const {result,...failure}=await tryCoach(provider,apiKey,body,input,teacher,request.signal,timeout);
    if(result) {
      if(previous)console.info('Coach fallback succeeded',provider.model,previous.status);
      return json(result);
    }
    failures.push(failure);
    if(['provider-auth','provider-balance'].includes(failure.status))unusableSecrets.add(provider.secret);
  }
  const [limit]=failures.filter(failure=>failure.status==='rate-limit')
    .sort((a,b)=>(a.retryAfter??86401)-(b.retryAfter??86401));
  return coachServiceError(limit||failures.findLast(failure=>failure.status!=='empty-answer')||
    failures.at(-1)||{status:'timeout',code:504});
}

function assetRange(header,size) {
  const range = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!range || (!range[1] && !range[2])) return null;
  const start = range[1] ? Number(range[1]) : Math.max(0,size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(size - 1,Number(range[2])) : size - 1;
  return start <= end && start < size ? {start,end} : null;
}

function serveAsset(request,path) {
  if (!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  const asset = Object.hasOwn(ASSETS,path) && ASSETS[path];
  if (!asset) return new Response('Page introuvable',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  const bytes = Uint8Array.from(atob(asset.bytes),character => character.charCodeAt(0));
  const headers = {
    'Content-Type':asset.type,
    'Accept-Ranges':'bytes',
    'Cache-Control':path.endsWith('.html') ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options':'nosniff'
  };
  const rangeHeader = request.headers.get('range');
  if (rangeHeader && request.method === 'GET') {
    const range = assetRange(rangeHeader,bytes.length);
    if (!range) return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${bytes.length}`}});
    const {start,end} = range;
    const body = bytes.subarray(start,end + 1);
    return new Response(body,{status:206,headers:{...headers,'Content-Length':body.length,'Content-Range':`bytes ${start}-${end}/${bytes.length}`}});
  }
  return new Response(request.method === 'HEAD' ? null : bytes,{headers:{...headers,'Content-Length':bytes.length}});
}

export default {
  fetch(request,env) {
    const url = new URL(request.url);
    const {pathname} = url;
    if (pathname === '/ecole') return serveAsset(request,'/school.html');
    if (pathname.startsWith(SCHOOL_PREFIX+'/')) return handleSchool(request,env,url);
    if (pathname === '/api/coach/status') {
      if (request.method !== 'GET') return json({status:'invalid'},405,{Allow:'GET'});
      const providers=coachProviders(env,url.searchParams.get('profile')==='teacher');
      return json({status:providers.length?coachAuthorization(request,env):'needs-key'});
    }
    if (pathname === '/api/coach') {
      if (request.method !== 'POST') return json({status:'invalid'},405,{Allow:'POST'});
      return replyToCoach(request,env);
    }
    return serveAsset(request,pathname === '/' ? '/index.html' : pathname);
  }
};
