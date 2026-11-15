'use strict';

const AI_COACH_LABELS = {
  'Exercices guidés':'تمارين موجّهة', 'Coach IA':'مساعد بالذكاء الاصطناعي',
  'Poser une question':'طرح سؤال', 'Coach d’études':'المساعد الدراسي',
  'Pose une question ou fais un exercice.':'اطرح سؤالًا أو أنجز تمرينًا.',
  'Vérification de l’accès au coach IA…':'جارٍ التحقّق من الوصول إلى المساعد…',
  'La connexion au service IA doit être configurée par l’établissement.':'يتعيّن على المؤسسة إعداد الاتصال بخدمة الذكاء الاصطناعي.',
  'Reconnecte-toi à ton espace scolaire.':'سجّل الدخول مجددًا إلى فضائك المدرسي.',
  'Le coach en ligne est accessible depuis le compte scolaire.':'يمكن استخدام المساعد عبر الإنترنت من الحساب المدرسي.',
  'Ouvrir l’espace scolaire':'فتح الفضاء المدرسي',
  'Ce compte ne dispose pas de l’accès au coach IA.':'لا يملك هذا الحساب صلاحية استخدام المساعد.',
  'Le coach IA est indisponible pour le moment.':'المساعد غير متاح حاليًا.',
  'Réessayer':'أعد المحاولة', 'Réessayer en ligne':'أعد المحاولة عبر الإنترنت',
  'Aide locale':'مساعدة محلية', 'Coach en ligne':'مساعد عبر الإنترنت',
  'Pose une question sur un cours.':'اطرح سؤالًا حول درس.',
  'Ta question au coach':'سؤالك للمساعد', 'Écris ta question…':'اكتب سؤالك…',
  'Envoyer ma question':'إرسال سؤالي', 'Le coach prépare une réponse…':'يعدّ المساعد الإجابة…',
  'Le service en ligne n’a pas répondu. Une aide locale est affichée.':'لم يردّ المساعد عبر الإنترنت. تظهر المساعدة المحلية.',
  'Le service en ligne a mis trop de temps à répondre.':'استغرق المساعد عبر الإنترنت وقتًا طويلًا للإجابة.',
  'Le service en ligne est occupé. Une aide locale est affichée.':'المساعد عبر الإنترنت مشغول. تظهر المساعدة المحلية.',
  'L’accès au service en ligne doit être vérifié.':'يجب التحقّق من إعداد الوصول إلى المساعد عبر الإنترنت.',
  'Le crédit du service en ligne est épuisé.':'نفد رصيد خدمة المساعد عبر الإنترنت.',
  'Patiente quelques minutes avant d’envoyer une nouvelle question.':'انتظر بضع دقائق قبل إرسال سؤال جديد.',
  'Entrée pour envoyer · Maj + Entrée pour aller à la ligne.':'اضغط Enter للإرسال، وShift + Enter للانتقال إلى سطر جديد.',
  'Pose ta question sans informations personnelles.':'اطرح سؤالك دون معلومات شخصية.'
};
for (const [fr, ar] of Object.entries(AI_COACH_LABELS)) AR_LOOKUP.set(localeKey(fr), ar);

const studentCoachSchool = () => typeof schoolUI!=='undefined'&&schoolUI.data?.account?.role==='eleve';
const studentCoachActive = () => studentCoachSchool()||state.role==='eleve';

function newAICoach() {
  return {mode:true,access:'',turns:[],draft:'',pending:false,request:null,accessRequest:null};
}

let aiCoach = newAICoach();

function resetAICoach() {
  aiCoach.request?.abort();
  aiCoach = newAICoach();
}

function coachModeButtons() {
  return `<div class="coach-modes" role="group" aria-label="Coach d’études">${[['ai','Poser une question','aiCoachPanel'],['guided','Exercices guidés','guidedCoachPanel']].map(([mode,label,panel]) =>
    `<button type="button" class="tab" data-action="coach-mode" data-value="${mode}" aria-controls="${panel}" aria-pressed="${(mode === 'ai') === aiCoach.mode}">${label}</button>`
  ).join('')}</div>`;
}

function studentCoachAvailability(access) {
  if (access === 'ready') return '<div class="student-coach-state"><span class="tag mint">Coach en ligne</span></div>';
  if (!access || access === 'loading') return '<div class="student-coach-state"><p role="status">Vérification de l’accès au coach IA…</p></div>';
  return `<div class="student-coach-state">
    <span class="tag mint">Aide locale</span>
    <p role="status">${AI_COACH_ACCESS[access]}</p>
    ${['school','sign-in'].includes(access) ? coachSchoolLink() : ['offline','needs-key'].includes(access) ? '<button type="button" class="text-link" data-action="coach-retry">Réessayer</button>' : ''}
  </div>`;
}

function coachQuestionSuggestions() {
  const suggestions = COACH_LOCAL_TOPICS.filter(topic => topic.prompt).map(({prompt}) => prompt[state.lang === 'ar' ? 1 : 0]);
  return `<div class="coach-ai-start"><p>Pose une question sur un cours.</p><div class="coach-suggestions">${suggestions.map(text =>
    `<button type="button" class="btn soft small" data-action="coach-prompt" data-value="${esc(text)}" data-no-i18n="true">${esc(text)}</button>`
  ).join('')}</div></div>`;
}

function coachResponseError(code,retryAfter) {
  const delay=coachRetryDelay(retryAfter);
  if(delay&&(code==='school-rate-limit'||code==='rate-limit'))return state.lang==='ar'?
    'يمكنك إعادة المحاولة بعد '+delay+'.':'Réessaie dans '+delay+'.';
  if (code === 'school-rate-limit') return 'Patiente quelques minutes avant d’envoyer une nouvelle question.';
  if (code === 'busy' || code === 'rate-limit') return 'Le service en ligne est occupé. Une aide locale est affichée.';
  if (code === 'timeout') return 'Le service en ligne a mis trop de temps à répondre.';
  if (code === 'provider-auth') return 'L’accès au service en ligne doit être vérifié.';
  if (code === 'provider-balance') return 'Le crédit du service en ligne est épuisé.';
  return 'Le service en ligne n’a pas répondu. Une aide locale est affichée.';
}

function aiCoachContent() {
  if (!aiCoach.mode) return '';
  const messages = aiCoach.turns.map(({question,answer,source}) =>
    `<div class="coach-message own"><div class="coach-bubble"><span dir="auto" data-no-i18n="true">${esc(question)}</span></div></div>
    ${answer ? `<div class="coach-message"><div class="coach-bubble"><strong>${source === 'local' ? 'Aide locale' : 'Coach IA'}</strong><span dir="auto" data-no-i18n="true">${esc(answer)}</span></div></div>` : ''}`
  ).join('');
  const {failure,retryAfter}=aiCoach.turns.at(-1)||{};
  const feedback = aiCoach.pending ? 'Le coach prépare une réponse…' : failure ? coachResponseError(failure,retryAfter) : '';
  const retry = failure && aiCoach.access === 'ready' && !aiCoach.pending ?
    '<button type="button" class="text-link" data-action="coach-retry-answer">Réessayer en ligne</button>' : '';
  return `<div id="studentCoachAvailability">${studentCoachAvailability(aiCoach.access)}</div>
    <div id="aiCoachChat" class="coach-chat coach-ai-chat" role="log" aria-live="polite" aria-busy="${aiCoach.pending}">${messages || coachQuestionSuggestions()}</div>
    <form class="coach-form coach-ai-form" id="coachAIForm">
      <label class="sr-only" for="coachAIInput">Ta question au coach</label>
      <textarea id="coachAIInput" name="question" dir="auto" rows="2" placeholder="Écris ta question…" maxlength="3000"
        enterkeyhint="send" aria-describedby="coachQuestionHint" required>${esc(aiCoach.draft)}</textarea>
      <button type="submit" class="${studentCoachSchool()?'btn primary':'send-button'}" aria-label="Envoyer ma question" ${aiCoach.pending ? 'disabled' : ''}>${typeof icon==='function'?icon('send'):''}<span>Envoyer</span></button>
    </form>
    <p class="coach-ai-note" id="coachQuestionHint">Entrée pour envoyer · Maj + Entrée pour aller à la ligne.</p>
    <p class="coach-ai-note coach-privacy">Pose ta question sans informations personnelles.</p>
    <div class="coach-ai-result"><p class="coach-ai-feedback" role="status">${esc(feedback)}</p>${retry}</div>`;
}

function refreshStudentCoachAvailability() {
  const availability=document.getElementById('studentCoachAvailability');
  if(availability)availability.innerHTML=localizeHTML(studentCoachAvailability(aiCoach.access));
}

function studentCoachPage() {
  return `<div class="school-title"><h1>Coach d’études</h1></div><section class="card school-student-coach"
    id="aiCoachPanel" aria-label="Coach d’études">${aiCoachContent()}</section>`;
}

function scrollAICoach() {
  const chat=document.getElementById('aiCoachChat');
  if(chat)chat.scrollTop=chat.scrollHeight;
}

function refreshAICoach(focusInput = false) {
  const panel = document.getElementById('aiCoachPanel');
  if (!panel || !aiCoach.mode) return;
  const active = document.activeElement;
  const hasFocus = active?.id === 'coachAIInput';
  const start = hasFocus ? active.selectionStart : aiCoach.draft.length;
  const end = hasFocus ? active.selectionEnd : start;
  panel.innerHTML = localizeHTML(aiCoachContent());
  if ((hasFocus || focusInput) && (studentCoachSchool()||document.getElementById('coachDisclosure')?.open)) {
    const input = document.getElementById('coachAIInput');
    input?.focus({preventScroll:true});
    input?.setSelectionRange(start,end);
  }
  scrollAICoach();
}

function setCoachMode(mode) {
  if (state.role !== 'eleve' || !['guided','ai'].includes(mode)) return;
  aiCoach.mode = mode === 'ai';
  const guided = document.getElementById('guidedCoachPanel');
  const panel = document.getElementById('aiCoachPanel');
  if (!guided || !panel) return;
  guided.hidden = aiCoach.mode;
  panel.hidden = !aiCoach.mode;
  document.querySelectorAll('[data-action="coach-mode"]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.value === mode)));
  if (aiCoach.mode) {
    refreshAICoach();
    if (!aiCoach.access) checkAICoachAccess();
  }
}

function checkAICoachAccess() {
  if (!studentCoachActive()) return Promise.resolve('offline');
  const session = aiCoach;
  if (session.accessRequest) return session.accessRequest;
  session.access = 'loading';
  session.accessRequest = readAICoachAccess(studentCoachSchool()).then(access => {
    session.access = access;
    session.accessRequest = null;
    if (session === aiCoach) refreshStudentCoachAvailability();
    return access;
  });
  refreshStudentCoachAvailability();
  return session.accessRequest;
}

function chooseCoachPrompt(prompt) {
  if (!studentCoachActive() || !COACH_LOCAL_TOPICS.some(topic => topic.prompt?.includes(prompt))) return;
  aiCoach.draft = prompt;
  refreshAICoach(true);
}

async function sendAIQuestion(question,retry = false) {
  if (!studentCoachActive() || aiCoach.pending || !aiCoach.mode) return;
  const session = aiCoach;
  const content = String(question || '').trim().slice(0,3000);
  const last = session.turns.at(-1);
  if (retry ? !last?.failure || session.access !== 'ready' : !content) return;
  const turn = retry ? last : {question:content,answer:'',source:'',failure:''};
  turn.failure='';
  turn.retryAfter=0;
  if (!retry) {
    session.turns = [...session.turns.slice(-19),turn];
    session.draft = '';
  }
  session.pending = true;
  const refocus = !retry;
  refreshAICoach(refocus);
  const language = state.lang;
  let deadline;
  try {
    const access = session.accessRequest ? await session.accessRequest : session.access || await checkAICoachAccess();
    if (session !== aiCoach) return;
    if (access === 'ready') {
      const context = session.turns.slice(0,-1).filter(item => item.source === 'online').slice(-5);
      const messages = context.flatMap(item => [{role:'user',content:item.question},{role:'assistant',content:item.answer}]);
      messages.push({role:'user',content:turn.question});
      session.request = new AbortController();
      deadline = setTimeout(() => session.request.abort(),33000);
      const {ok,data} = await requestAICoach({profile:'student',messages,language},session.request.signal,'/api/school/coach');
      if (ok && typeof data.answer === 'string' && data.answer.trim()) {
        Object.assign(turn,{answer:data.answer.trim(),source:'online',failure:''});
        return;
      }
      const status=data.status||data.code;
      if (AI_COACH_ACCOUNT_STATES.includes(status)) session.access = status;
      else Object.assign(turn,{failure:status||'unavailable',retryAfter:data.retryAfter});
    }
    Object.assign(turn,{answer:coachLocalAnswer(turn.question),source:'local'});
  } catch {
    if (session !== aiCoach) return;
    Object.assign(turn,{answer:coachLocalAnswer(turn.question),source:'local',
      failure:session.request?.signal.aborted ? 'timeout' : 'unavailable'});
  } finally {
    clearTimeout(deadline);
    session.request = null;
    session.pending = false;
    if (session === aiCoach) refreshAICoach();
  }
}

document.addEventListener('keydown',event => {
  const input = event.target;
  if (input?.id !== 'coachAIInput' || event.key !== 'Enter' || event.shiftKey || event.altKey ||
    event.ctrlKey || event.metaKey || event.isComposing || event.keyCode === 229) return;
  event.preventDefault();
  if (!event.repeat && !aiCoach.pending) input.form?.requestSubmit();
});

function openAICoachAfterSignIn() {
  const url = new URL(location.href);
  if (url.searchParams.get('coach') !== 'ia') return;
  url.searchParams.delete('coach');
  history.replaceState(null,'',url);
  if (state.role !== 'eleve' || state.page !== 'dashboard') return;
  const coach = document.getElementById('coachDisclosure');
  if (!coach) return;
  state.coachOpen = coach.open = true;
  setCoachMode('ai');
  coach.scrollIntoView({block:'center'});
}
