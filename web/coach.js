'use strict';

const COACH_AR = {
  'Exercice du coach': 'تمرين المساعد الدراسي', 'Énoncé de l’exercice': 'نص التمرين',
  'Réponse attendue': 'الإجابة المنتظرة', 'Indice': 'تلميح', 'Explication de la réponse': 'شرح الإجابة',
  'Ajoutez l’énoncé et la réponse attendue pour publier l’exercice du coach.': 'أضيفوا نص التمرين والإجابة المنتظرة لنشره في المساعد.',
  'Ouvre ton coach d’études.': 'افتح مساعدك الدراسي.',
  'Choisis un exercice préparé par ton enseignant.': 'اختر تمرينًا أعدّه أستاذك.',
  'Ton coach t’aide à retrouver tes devoirs et les exercices de tes enseignants.': 'يساعدك مساعدك الدراسي في العثور على واجباتك وتمارين أساتذتك.',
  'Ouvre un devoir et choisis « J’ai besoin d’aide » pour poser une question à ton enseignant.': 'افتح واجبًا واختر « أحتاج إلى مساعدة » لطرح سؤال على أستاذك.',
  'Bonne réponse !': 'إجابة صحيحة!', 'Essaie encore. Relis l’énoncé et vérifie ta réponse.': 'حاول مرة أخرى. أعد قراءة التمرين وتحقّق من إجابتك.',
  'Choisir un exercice': 'اختيار تمرين', 'Voir mes devoirs': 'عرض واجباتي'
};
for (const [fr, ar] of Object.entries(COACH_AR)) AR_LOOKUP.set(localeKey(fr), ar);

const COACH_EXAMPLE = [
  {question:'3x + 5 = 20',answer:'5',hint:'Soustrais 5 des deux côtés : 3x = 15. Divise ensuite par 3.',explanation:'3 × 5 + 5 = 20'},
  {question:'2x − 7 = 9',answer:'8',hint:'Ajoute 7 aux deux côtés, puis divise par 2.',explanation:'2 × 8 − 7 = 9'},
  {question:'3x + 5 = 20',answer:'5',hint:'Soustrais 5, puis divise par 3.',explanation:'3 × 5 + 5 = 20'}
];

function coachExercises() {
  return homeworkList('eleve').filter(a => a.coach?.question && a.coach.answer);
}

function coachContext() {
  const choices = coachExercises();
  const assignment = choices.find(a => a.id === state.coachExerciseId) || choices[0];
  if (assignment) return {key:assignment.id,exercise:assignment.coach,choices};
  if (state.examples) return {key:'example',exercise:COACH_EXAMPLE[state.coachStep % COACH_EXAMPLE.length],choices};
  return {key:'help',exercise:null,choices};
}

function coachMessages(context) {
  const messages = context.key === 'example' ? state.coach : state.coachThreads[context.key];
  if (messages?.length) return messages;
  if (context.exercise) return [{own:false,text:context.exercise.question,literal:context.key !== 'example'}];
  return [{own:false,text:'Ton coach t’aide à retrouver tes devoirs et les exercices de tes enseignants.'}];
}

function coachConversation(context) {
  return coachMessages(context).map(message => `<div class="coach-message ${message.own ? 'own' : ''}">${message.own ? '' : avatar('🤖','','emoji')}<div class="coach-bubble">${message.own ? '' : '<strong>Ton coach</strong>'}<span dir="auto" data-no-i18n="${message.own || message.literal ? 'true' : 'false'}">${esc(message.text)}</span></div></div>`).join('');
}

function coachCard() {
  const context = coachContext();
  const select = context.choices.length ? `<div class="coach-select"><label for="coachExercise">Choisir un exercice</label><select id="coachExercise">${libraryOptions(context.choices.map(a => [a.id,homeworkText(a,'title')]),context.key)}</select></div>` : '';
  return `<section class="coach-card">${coachModeButtons()}
    <div id="guidedCoachPanel" ${aiCoach.mode ? 'hidden' : ''}>${select}
    <div class="coach-chat" id="coachChat" role="log" aria-live="polite">${coachConversation(context)}</div>
    <form class="coach-form" id="coachForm"><label class="sr-only" for="coachInput">Ta réponse au coach</label><input id="coachInput" name="answer" dir="auto" placeholder="Écris ta réponse…" autocomplete="off" maxlength="200" required><button type="submit" class="send-button" aria-label="Envoyer ma réponse">${icon('send')}</button></form>
    ${context.exercise ? '' : '<button class="text-link coach-homework-link" data-page="devoirs">Voir mes devoirs</button>'}</div>
    <div id="aiCoachPanel" ${aiCoach.mode ? '' : 'hidden'}>${aiCoachContent()}</div></section>`;
}

function coachAnswerKey(value) {
  return arabicNumbersToLatin(String(value)).normalize('NFC').toLocaleLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/،|,/g,'.');
}

function refreshCoachConversation(context = coachContext()) {
  const chat = document.getElementById('coachChat');
  if (!chat) return;
  chat.innerHTML = localizeHTML(coachConversation(context));
  chat.scrollTop = chat.scrollHeight;
}

function sendCoachAnswer(form, value) {
  if (state.role !== 'eleve') return;
  const answer = String(value || '').trim().slice(0,200);
  if (!answer) return;
  const context = coachContext();
  const messages = [...coachMessages(context),{own:true,text:answer}];
  const exercise = context.exercise;
  if (exercise) {
    const cleaned = coachAnswerKey(answer);
    const expected = coachAnswerKey(exercise.answer);
    const exampleNumber = context.key === 'example' ? cleaned.match(/-?\d+(?:\.\d+)?/g) : null;
    const correct = cleaned === expected || exampleNumber?.length === 1 && Number(exampleNumber[0]) === Number(expected);
    if (correct) {
      messages.push({own:false,text:'Bonne réponse !'});
      if (exercise.explanation) messages.push({own:false,text:exercise.explanation,literal:context.key !== 'example'});
      if (context.key === 'example') {
        state.coachStep++;
        messages.push({own:false,text:COACH_EXAMPLE[state.coachStep % COACH_EXAMPLE.length].question});
      }
    } else messages.push({own:false,text:exercise.hint || 'Essaie encore. Relis l’énoncé et vérifie ta réponse.',literal:!!exercise.hint && context.key !== 'example'});
  } else messages.push({own:false,text:'Ouvre un devoir et choisis « J’ai besoin d’aide » pour poser une question à ton enseignant.'});
  if (context.key === 'example') state.coach = messages.slice(-30);
  else state.coachThreads[context.key] = messages.slice(-30);
  state.coachOpen = true;
  persist();
  refreshCoachConversation(context);
  form.reset();
  document.getElementById('coachInput')?.focus();
}

function chooseCoachExercise(id) {
  if (!coachExercises().some(a => a.id === id)) return;
  state.coachExerciseId = id;
  persist();
  refreshCoachConversation();
}

function coachEditorFields(source) {
  const exercise = source?.coach;
  const fields = [
    ['coachQuestion','Énoncé de l’exercice','question',500],
    ['coachAnswer','Réponse attendue','answer',200],
    ['coachHint','Indice','hint',500],
    ['coachExplanation','Explication de la réponse','explanation',600]
  ];
  return `<details class="homework-short-editor" ${exercise ? 'open' : ''}><summary>Exercice du coach</summary>${fields.map(([name,label,key,max]) => `<label for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="2" dir="auto" maxlength="${max}">${esc(exercise?.[key] || '')}</textarea>`).join('')}</details>`;
}

function coachExerciseFromForm(values) {
  const exercise = {
    question:String(values.coachQuestion || '').trim().slice(0,500),
    answer:String(values.coachAnswer || '').trim().slice(0,200),
    hint:String(values.coachHint || '').trim().slice(0,500),
    explanation:String(values.coachExplanation || '').trim().slice(0,600)
  };
  if (!Object.values(exercise).some(Boolean)) return null;
  if (!exercise.question || !exercise.answer) return false;
  return exercise;
}

document.addEventListener('toggle', event => {
  if (event.target.id !== 'coachDisclosure') return;
  state.coachOpen = event.target.open;
  if (state.coachOpen && aiCoach.mode && (!aiCoach.access || aiCoach.access === 'offline')) checkAICoachAccess();
}, true);
