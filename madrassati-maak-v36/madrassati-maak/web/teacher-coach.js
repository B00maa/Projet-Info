'use strict';

const TEACHER_COACH_TASKS = {
  lesson:{label:'Cours',icon:'book',file:'cours'},
  exercises:{label:'Exercices',icon:'clipboard',file:'exercices'},
  exam:{label:'Examen',icon:'file',file:'examen'}
};
const TEACHER_COACH_LANGUAGES = {fr:'Français',ar:'Arabe',en:'Anglais'};
const TEACHER_COACH_DIFFICULTIES={progressive:'Progressive',easy:'Application directe',standard:'Intermédiaire',advanced:'Approfondissement'};
const TEACHER_COACH_FORMATS={open:'Questions ouvertes',qcm:'QCM'};
const TEACHER_COACH_LESSON_MODES={chapter:'Chapitre complet',session:'Séance ciblée'};
const TEACHER_COACH_LABELS = {
  'Coach pédagogique':'المساعد التربوي',
  'Préparez un cours, des exercices ou un examen pour vos classes.':'حضّروا درسًا أو تمارين أو امتحانًا لأقسامكم.',
  'Type de document':'نوع المستند', 'Cours':'درس', 'Exercices':'تمارين', 'Examen':'امتحان',
  'Préparer le document':'تحضير المستند', 'Sujet':'الموضوع', 'Langue du document':'لغة المستند',
  'Consignes et précisions':'التعليمات والتفاصيل', 'Ex. les fractions équivalentes':'مثال: الكسور المتكافئة',
  'Objectifs, niveau de difficulté, durée ou barème…':'الأهداف ومستوى الصعوبة والمدة أو سلم التنقيط…',
  'Générer le document':'إنشاء المستند', 'Utiliser un modèle':'استخدام قالب',
  'Préparation libre':'تحضير حر',
  'Ex. 3ᵉ collège':'مثال: الثالثة إعدادي',
  'Indiquez la matière, le niveau et le sujet.':'حدّدوا المادة والمستوى والموضوع.',
  'Le sujet et les consignes sont transmis au service IA. Évitez les données personnelles.':'يُرسل الموضوع والتعليمات إلى خدمة الذكاء الاصطناعي. تجنّبوا البيانات الشخصية.',
  'Génération IA configurée':'تم إعداد الإنشاء بالذكاء الاصطناعي',
  'La préparation locale reste disponible.':'يبقى التحضير المحلي متاحًا.',
  'Brouillon local':'مسودة محلية', 'Précisions de préparation':'ملاحظات التحضير',
  'Brouillon local prêt à relire.':'المسودة المحلية جاهزة للمراجعة.',
  'Un modèle sur votre sujet est prêt à compléter.':'قالب موضوعكم جاهز للإكمال.',
  'Le site ne parvient pas à joindre le service IA.':'يتعذّر على الموقع الوصول إلى خدمة الذكاء الاصطناعي.',
  'Le service IA a mis trop de temps à répondre.':'استغرقت خدمة الذكاء الاصطناعي وقتًا طويلًا للإجابة.',
  'Le service IA a refusé ses identifiants.':'رفضت خدمة الذكاء الاصطناعي بيانات اعتمادها.',
  'Le crédit du service IA est épuisé.':'نفد رصيد خدمة الذكاء الاصطناعي.',
  'Le service IA n’a pas renvoyé de document utilisable.':'لم تُرجع خدمة الذكاء الاصطناعي مستندًا صالحًا للاستخدام.',
  'Le service IA est occupé.':'خدمة الذكاء الاصطناعي مشغولة.',
  'Le quota du service IA est atteint. Réessayez dans quelques instants.':'بلغت خدمة الذكاء الاصطناعي حد الاستخدام. أعيدوا المحاولة بعد قليل.',
  'Le document IA dépasse la longueur autorisée.':'يتجاوز المستند المولّد الطول المسموح به.',
  'Le coach prépare le document…':'يعدّ المساعد المستند…',
  'Aucune classe attribuée pour préparer un document.':'لا يوجد قسم معيّن لتحضير مستند.',
  'Choisissez une classe et indiquez le sujet.':'اختاروا قسمًا وحددوا الموضوع.',
  'Brouillon généré':'مسودة مولّدة', 'Modèle à compléter':'قالب للإكمال',
  'Aperçu du document':'معاينة المستند',
  'Le document apparaîtra ici après la génération ou la sélection d’un modèle.':'سيظهر المستند هنا بعد إنشائه أو اختيار قالب.',
  'Version élève':'نسخة التلميذ', 'Corrigé professeur':'التصحيح للأستاذ',
  'Télécharger la version élève':'تنزيل نسخة التلميذ', 'Télécharger le corrigé':'تنزيل التصحيح',
  'Ouvrir dans l’éditeur de cours':'فتح في محرر الدروس', 'Ouvrir dans l’éditeur de devoir':'فتح في محرر الواجبات',
  'Ouvrir dans l’éditeur d’examen':'فتح في محرر الامتحانات',
  'Relisez et complétez le document avant de le publier.':'راجعوا المستند وأكملوه قبل نشره.',
  'Document prêt à relire.':'المستند جاهز للمراجعة.',
  'Exercices d’exemple':'تمارين نموذجية'
};
Object.assign(TEACHER_COACH_LABELS,{
  'Nombre de questions':'عدد الأسئلة','Difficulté':'الصعوبة','Progressive':'متدرجة','Application directe':'تطبيق مباشر',
  'Intermédiaire':'متوسطة','Approfondissement':'معمّقة','Format des questions':'شكل الأسئلة',
  'D’après les consignes':'حسب التعليمات','Questions ouvertes':'أسئلة مفتوحة','QCM':'أسئلة اختيار من متعدد','Durée en minutes':'المدة بالدقائق',
  'Afficher le document':'عرض المستند','Voir les sujets disponibles hors connexion':'عرض المواضيع المتاحة دون اتصال',
  'Fractions équivalentes':'الكسور المتكافئة','Addition de fractions':'جمع الكسور','Équations du premier degré':'معادلات الدرجة الأولى',
  'Pourcentages':'النسب المئوية','Proportionnalité':'التناسب','Aire d’un rectangle':'مساحة المستطيل',
  'Théorème de Pythagore':'مبرهنة فيثاغورس','Corrigé séparé':'تصحيح منفصل',
  'Le service IA n’a plus de crédit. La génération libre reprendra après rechargement.':'نفد رصيد خدمة الذكاء الاصطناعي. سيُستأنف الإنشاء الحر بعد شحن الرصيد.',
  'Le coach local ne couvre pas encore ce sujet. Choisissez un sujet de la liste ou utilisez un modèle à compléter.':'لا يغطي المساعد المحلي هذا الموضوع بعد. اختر موضوعًا من القائمة أو استعمل قالبًا للإكمال.',
  'Ouvrir dans l’éditeur de séance':'فتح في محرر الحصص','Brouillon local prêt à relire.':'المسودة المحلية جاهزة للمراجعة.'
});
Object.assign(TEACHER_COACH_LABELS,{
  'Format du cours':'صيغة الدرس','Chapitre complet':'فصل كامل','Séance ciblée':'حصة حول مفهوم محدد',
  'Indiquez les notions à couvrir ou le niveau voulu, par exemple CPGE.':'حدّدوا المحاور أو المستوى المطلوب، مثل الأقسام التحضيرية.',
  'Le coach rédige les sections du cours et les exercices…':'يكتب المساعد أجزاء الدرس والتمارين…',
  'Le service IA a renvoyé un cours incomplet. Réessayez pour recevoir toutes les sections.':'أعادت خدمة الذكاء الاصطناعي درسًا ناقصًا. أعيدوا المحاولة للحصول على جميع الأجزاء.',
  'Le cours affiché est le dernier brouillon disponible.':'الدرس المعروض هو آخر مسودة متاحة.',
  'La version locale de ce sujet couvre une séance ciblée. Le chapitre complet est disponible avec le coach en ligne.':'يغطي الدرس المحلي لهذا الموضوع حصة محددة. يتاح الفصل الكامل عبر المساعد المتصل.',
  'Espaces vectoriels':'الفضاءات المتجهية','Sommaire du cours':'فهرس الدرس',
  'PDF · Version élève':'PDF · نسخة التلميذ','PDF · Corrigé':'PDF · التصحيح'
});
TEACHER_COACH_LABELS['Connexion au coach en ligne requise pour les autres sujets.']='يتطلب إنشاء المواضيع الأخرى الاتصال بالمساعد عبر الإنترنت.';
for (const [fr,ar] of Object.entries(TEACHER_COACH_LABELS)) {
  if (!AR_LOOKUP.has(localeKey(fr))) AR_LOOKUP.set(localeKey(fr),ar);
}
if(typeof TEACHER_LESSON_LABELS!=='undefined')for(const [fr,ar] of Object.entries(TEACHER_LESSON_LABELS))AR_LOOKUP.set(localeKey(fr),ar);

const TEACHER_COACH_TEMPLATES = {
  fr:{
    lesson:{
      title:'Cours à préparer',summary:'Objectifs et notions de la leçon.',
      content:'Objectifs\n[Compétences à acquérir]\n\nNotions du cours\n[Définitions, propriétés et explications]\n\nExemple travaillé\n[Énoncé et étapes]\n\nÀ retenir\n[Résumé en quelques lignes]',
      correction:'',duration:30
    },
    exercises:{
      title:'Série d’exercices',summary:'Exercices progressifs.',
      content:'Consignes\n[Matériel autorisé et travail attendu]\n\nExercice 1 — Application directe\n[Énoncé et données]\n\nExercice 2 — Entraînement\n[Énoncé et questions]\n\nExercice 3 — Approfondissement\n[Énoncé et questions]',
      correction:'Exercice 1\n[Réponse et démarche]\n\nExercice 2\n[Réponse et démarche]\n\nExercice 3\n[Réponse et démarche]',duration:20
    },
    exam:{
      title:'Sujet d’examen',summary:'Sujet et barème à compléter.',
      content:'Durée : 45 minutes\nTotal : 20 points\n\nConsignes\n[Matériel autorisé et rédaction attendue]\n\nPartie 1 — 8 points\n[Questions et points par question]\n\nPartie 2 — 12 points\n[Problème, données et points par question]',
      correction:'Partie 1 — 8 points\n[Réponses et attribution des points]\n\nPartie 2 — 12 points\n[Résolution et attribution des points]',duration:45
    }
  },
  ar:{
    lesson:{
      title:'درس للتحضير',summary:'أهداف الدرس ومفاهيمه.',
      content:'الأهداف\n[الكفايات المطلوب اكتسابها]\n\nمفاهيم الدرس\n[التعاريف والخصائص والشروح]\n\nمثال تطبيقي\n[المسألة وخطوات الحل]\n\nخلاصة\n[ملخص قصير للدرس]',
      correction:'',duration:30
    },
    exercises:{
      title:'سلسلة تمارين',summary:'تمارين متدرجة.',
      content:'التعليمات\n[الوسائل المسموح بها والعمل المطلوب]\n\nالتمرين الأول — تطبيق مباشر\n[نص التمرين والمعطيات]\n\nالتمرين الثاني — تدريب\n[المعطيات والأسئلة]\n\nالتمرين الثالث — تعميق\n[المعطيات والأسئلة]',
      correction:'التمرين الأول\n[الإجابة وطريقة الحل]\n\nالتمرين الثاني\n[الإجابة وطريقة الحل]\n\nالتمرين الثالث\n[الإجابة وطريقة الحل]',duration:20
    },
    exam:{
      title:'موضوع امتحان',summary:'موضوع وسلم تنقيط للإكمال.',
      content:'المدة: 45 دقيقة\nالمجموع: 20 نقطة\n\nالتعليمات\n[الوسائل المسموح بها وطريقة تحرير الإجابة]\n\nالجزء الأول — 8 نقاط\n[الأسئلة ونقط كل سؤال]\n\nالجزء الثاني — 12 نقطة\n[المسألة والمعطيات ونقط كل سؤال]',
      correction:'الجزء الأول — 8 نقاط\n[الأجوبة وتوزيع النقط]\n\nالجزء الثاني — 12 نقطة\n[الحل وتوزيع النقط]',duration:45
    }
  },
  en:{
    lesson:{
      title:'Lesson outline',summary:'Lesson objectives and concepts.',
      content:'Learning objectives\n[Skills students will develop]\n\nKey concepts\n[Definitions, properties and explanations]\n\nWorked example\n[Problem and steps]\n\nTakeaways\n[Short summary]',
      correction:'',duration:30
    },
    exercises:{
      title:'Practice exercises',summary:'Exercises in increasing difficulty.',
      content:'Instructions\n[Materials allowed and expected work]\n\nExercise 1 — Direct application\n[Problem and data]\n\nExercise 2 — Practice\n[Problem and questions]\n\nExercise 3 — Extension\n[Problem and questions]',
      correction:'Exercise 1\n[Answer and method]\n\nExercise 2\n[Answer and method]\n\nExercise 3\n[Answer and method]',duration:20
    },
    exam:{
      title:'Exam paper',summary:'Exam questions and marks to complete.',
      content:'Time allowed: 45 minutes\nTotal: 20 marks\n\nInstructions\n[Materials allowed and answer requirements]\n\nPart 1 — 8 marks\n[Questions and marks per question]\n\nPart 2 — 12 marks\n[Problem, data and marks per question]',
      correction:'Part 1 — 8 marks\n[Answers and marking criteria]\n\nPart 2 — 12 marks\n[Solution and marking criteria]',duration:45
    }
  }
};

function newTeacherCoach() {
  return {teacherId:'',access:'',task:'lesson',classId:null,subject:'',level:'',language:'',topic:'',notes:'',settings:{},drafts:{},request:null,
    accessRequest:null,failure:'',feedback:'',localTopicsOpen:false,activity:''};
}

let teacherCoach = newTeacherCoach();

function resetTeacherCoach() {
  teacherCoach.request?.abort();
  teacherCoach = newTeacherCoach();
}

function teacherCoachLink() {
  return `<button type="button" class="btn secondary" data-page="coach">${icon('robot','sm')} Coach pédagogique</button>`;
}

const teacherCoachGlyph=(name,small='sm')=>typeof icon==='function'?icon(name,small):'';
const teacherCoachTile=(name,accent)=>typeof tile==='function'?tile(name,accent):'';

function teacherCoachSchool() {
  return typeof schoolUI!=='undefined'&&schoolUI.data?.account?.role==='professeur';
}

function teacherCoachActive() {
  return teacherCoachSchool()||typeof activeTeacher==='function'&&state.role==='professeur';
}

function teacherCoachVisible() {
  return teacherCoachSchool()?schPage()==='coach':teacherCoachActive()&&state.page==='coach';
}

function teacherCoachTeacherId() {
  return teacherCoachSchool()?schoolUI.data.account.id:activeTeacher()?.id||'';
}

function teacherCoachClasses() {
  if(teacherCoachSchool())return schoolUI.data.directory.classes;
  return publicationClasses().map(entry=>({...entry,subject:publicationSubjects()[0]?.name}));
}

function teacherCoachSubject(entry,freeSubject=teacherCoach.subject) {
  const name=entry?.subject||freeSubject;
  return teacherCoachSchool()?{id:name,name,icon:'book'}:publicationSubjects()[0];
}

function teacherCoachClass(id) {
  return teacherCoachClasses().find(entry=>entry.id===id);
}

function teacherCourseHeading() {
  return teacherCoachSchool()?'<div class="school-title"><h1>Coach pédagogique</h1></div>':
    heading('Coach pédagogique','Préparez un cours, des exercices ou un examen pour vos classes.');
}

function teacherCoachPage() {
  const teacherId=teacherCoachTeacherId();
  const classes=teacherCoachClasses();
  if (teacherId !== teacherCoach.teacherId) {
    resetTeacherCoach();
    teacherCoach.teacherId = teacherId;
  }
  if (!(teacherCoachSchool()&&teacherCoach.classId==='')&&!classes.some(c => c.id===teacherCoach.classId)) {
    teacherCoach.classId=classes[0]?.id||'';
  }
  const subject=teacherCoachSubject(classes.find(c=>c.id===teacherCoach.classId));
  const title=teacherCourseHeading();
  if (!teacherCoachSchool()&&(!subject?.name||!classes.length)) return `${title}<p class="card">Aucune classe attribuée pour préparer un document.</p>`;
  if (!teacherCoach.language) {
    const name=searchKey(subject.name);
    teacherCoach.language=/arabe|عربي/.test(name)?'ar':/anglais|english/.test(name)?'en':state.lang;
  }
  return `${title}<div id="teacherCoachWorkspace">${teacherCoachWorkspace(subject,classes)}</div>`;
}

function teacherCoachAccessContent() {
  if (teacherCoach.access === 'ready') return `<p class="teacher-coach-connected" role="status">${teacherCoachGlyph('spark')} Génération IA configurée</p>`;
  return aiCoachAccessPanel(teacherCoach.access) +
    '<p class="tiny muted teacher-coach-local-note">La préparation locale reste disponible.</p>';
}

function teacherCoachFailure(status,retryAfter) {
  const delay=coachRetryDelay(retryAfter);
  if(delay&&(status==='rate-limit'||status==='school-rate-limit'))return state.lang==='ar'?
    'يمكنك إعادة المحاولة بعد '+delay+'.':'Réessayez dans '+delay+'.';
  return ({
    'network-error':'Le site ne parvient pas à joindre le service IA.',
    timeout:'Le service IA a mis trop de temps à répondre.',
    'provider-auth':'Le service IA a refusé ses identifiants.',
    'provider-balance':'Le service IA n’a plus de crédit. La génération libre reprendra après rechargement.',
    'rate-limit':'Le quota du service IA est atteint. Réessayez dans quelques instants.',
    'school-rate-limit':'Patientez quelques minutes avant de lancer une nouvelle génération.',
    busy:'Le service IA est occupé.',
    'provider-request':'Le service IA a refusé le format demandé. Réessayez.',
    invalid:'Vérifiez le sujet, la matière, le niveau et les options du document.',
    'school-class':'Cette classe ne vous est plus attribuée. Actualisez la page ou choisissez Préparation libre.',
    incomplete:'Le document IA dépasse la longueur autorisée.',
    'lesson-incomplete':'Le service IA a renvoyé un cours incomplet. Réessayez pour recevoir toutes les sections.'
  })[status] || 'Le service IA n’a pas renvoyé de document utilisable.';
}

const teacherCoachOptions=(values,selected)=>values.map(([key,label])=>
  '<option value="'+esc(key)+'"'+(key===selected?' selected':'')+'>'+esc(label)+'</option>').join('');

function teacherCoachControls(task,settings) {
  const options=(values,selected)=>teacherCoachOptions(Object.entries(values),selected);
  const lessonMode=settings.lessonMode||'chapter';
  return `<div class="teacher-coach-settings form-grid">
    ${task==='lesson'?`<div><label for="teacherCoachLessonMode">Format du cours</label><select id="teacherCoachLessonMode" name="lessonMode">
      ${options(TEACHER_COACH_LESSON_MODES,lessonMode)}</select></div>
    <div><label for="teacherCoachLessonLevel">Niveau pédagogique</label><select id="teacherCoachLessonLevel" name="lessonLevel">
      ${teacherCoachOptions(Object.entries(TEACHER_LESSON_LEVELS).map(([key,item])=>[key,item.fr]),settings.lessonLevel||'class')}</select></div>`:`<div><label for="teacherCoachCount">Nombre de questions</label>
      <input type="number" id="teacherCoachCount" name="count" min="1" max="12" value="${esc(settings.count||'')}" placeholder="${task==='exam'?4:5}"></div>
    <div><label for="teacherCoachFormat">Format des questions</label><select id="teacherCoachFormat" name="format">
      ${options({'':'D’après les consignes',...TEACHER_COACH_FORMATS},settings.format||'')}</select></div>`}
    <div><label for="teacherCoachDifficulty">Difficulté</label><select id="teacherCoachDifficulty" name="difficulty">
      ${options({'':'D’après les consignes',...TEACHER_COACH_DIFFICULTIES},settings.difficulty||'')}</select></div>
    <div><label for="teacherCoachMinutes">Durée en minutes</label><input type="number" id="teacherCoachMinutes" name="minutes"
      min="1" max="180" value="${esc(settings.minutes||'')}" placeholder="${task==='lesson'?TEACHER_LESSON_MODES[lessonMode].duration:task==='exam'?45:20}"></div>
    </div>`;
}

function teacherLocalTopics(subject) {
  if(!/math|رياضيات/i.test(searchKey(subject.name)))return '';
  const topics=teacherCoach.task==='lesson'?['Fractions équivalentes','Espaces vectoriels']:['Fractions équivalentes','Addition de fractions',
    'Équations du premier degré','Pourcentages','Proportionnalité','Aire d’un rectangle','Théorème de Pythagore'];
  return `<details id="teacherPracticeTopics" class="teacher-practice-topics" ${teacherCoach.localTopicsOpen?'open':''}>
    <summary>Voir les sujets disponibles hors connexion</summary>
    <div class="homework-actions">${topics.map(topic=>`<button type="button" class="btn soft small"
      data-action="teacher-coach-topic" data-value="${esc(topic)}">${topic}</button>`).join('')}</div>
    </details>`;
}

function teacherCoachWorkspace(subject,classes) {
  const session = teacherCoach;
  const busy = !!session.request;
  const draft = session.drafts[session.task];
  const free=teacherCoachSchool()&&session.classId==='';
  const contexts=classes.map(c=>[c.id,c.name]);
  if(teacherCoachSchool())contexts.push(['','Préparation libre']);
  const fullLesson=session.task==='lesson'&&session.settings.lesson?.lessonMode!=='session';
  const progress={plan:'Le coach propose un plan…',expand:'Le coach prépare l’approfondissement…'}[session.activity]||
    (fullLesson?'Le coach rédige les sections du cours et les exercices…':'Le coach prépare le document…');
  return `<div class="teacher-coach-types" role="group" aria-label="Type de document">${Object.entries(TEACHER_COACH_TASKS).map(([task,{label,icon:graphic}]) =>
    `<button type="button" data-action="teacher-coach-task" data-value="${task}" aria-pressed="${session.task === task}" ${busy ? 'disabled' : ''}>${teacherCoachTile(graphic,session.task === task ? 'mint' : '')}<span>${label}</span></button>`
  ).join('')}</div>
  <div class="teacher-coach-grid">
    <section class="card teacher-coach-editor">
      <h2>Préparer le document</h2>
      <p class="teacher-coach-subject" id="teacherCoachSubject" ${free?'hidden':''}><span data-no-i18n="true">${esc(subject.name)}</span></p>
      <div id="teacherCoachAccess">${teacherCoachAccessContent()}</div>
      <form id="teacherCoachForm" class="form">
        <fieldset class="teacher-coach-fields" ${busy ? 'disabled' : ''}>
          <div class="form-grid">
            <div><label for="teacherCoachClass">Classe</label><select id="teacherCoachClass" name="classId">${teacherCoachOptions(contexts,session.classId)}</select></div>
            <div><label for="teacherCoachLanguage">Langue du document</label><select id="teacherCoachLanguage" name="language" required>${teacherCoachOptions(Object.entries(TEACHER_COACH_LANGUAGES),session.language)}</select></div>
          </div>
          ${teacherCoachSchool()?`<div id="teacherCoachFreeContext" class="form-grid" ${free?'':'hidden'}>
            <div><label for="teacherCoachFreeSubject">Matière</label><select id="teacherCoachFreeSubject" name="subject" required
              ${free?'':'disabled'}>${schSubjectOptions(session.subject)}</select></div>
            <div><label for="teacherCoachFreeLevel">Niveau</label><input id="teacherCoachFreeLevel" name="level" value="${esc(session.level)}" maxlength="100" placeholder="Ex. 3ᵉ collège" required ${free?'':'disabled'}></div>
          </div>`:''}
          <div><label for="teacherCoachTopic">Sujet</label><input id="teacherCoachTopic" name="topic" maxlength="120" dir="auto" value="${esc(session.topic)}" placeholder="Ex. les fractions équivalentes" required></div>
          <div><label for="teacherCoachNotes">Consignes et précisions</label><textarea id="teacherCoachNotes" name="notes" maxlength="1600" dir="auto" rows="4" placeholder="${session.task==='lesson'?'Indiquez les notions à couvrir ou le niveau voulu, par exemple CPGE.':'Objectifs, niveau de difficulté, durée ou barème…'}">${esc(session.notes)}</textarea></div>
          ${teacherCoachControls(session.task,session.settings[session.task]||{})}
          ${session.task==='lesson'?teacherLessonPlanControls(session.settings.lesson||{}):''}
          <div id="teacherCoachExamples" ${free?'hidden':''}>${teacherLocalTopics(subject)}</div>
        </fieldset>
        <div class="homework-actions">
          <button type="submit" id="teacherCoachGenerate" class="btn primary" ${busy ? 'disabled' : ''}>${teacherCoachGlyph('spark')} Générer le document</button>
          ${busy ? '<button type="button" class="btn secondary" data-action="teacher-coach-cancel">Annuler</button>' : '<button type="button" class="btn secondary" data-action="teacher-coach-template">Utiliser un modèle</button>'}
        </div>
        <p class="coach-ai-note" ${session.access === 'ready' ? '' : 'hidden'}>Le sujet et les consignes sont transmis au service IA. Évitez les données personnelles.</p>
        <div class="teacher-coach-feedback" role="status">${busy ? '<p>'+progress+'</p>' :
          (session.failure ? `<p>${esc(teacherCoachFailure(session.failure,session.retryAfter))}</p>` : '') + (session.feedback ? `<p>${session.feedback}</p>` : '')}</div>
        ${draft&&!busy?`<div class="teacher-coach-jump"><button type="button" class="btn secondary small"
          data-action="teacher-coach-view">Afficher le document</button></div>`:''}
      </form>
    </section>
    <section class="card teacher-coach-output" id="teacherCoachOutput" tabindex="-1">${draft ? teacherCoachDraftPreview(draft,busy) : '<h2>Aperçu du document</h2><p class="teacher-coach-empty">Le document apparaîtra ici après la génération ou la sélection d’un modèle.</p>'}</section>
  </div>`;
}

function teacherCoachLessonPreview(draft,busy) {
  const sections=draft.lessonSections;
  return `<details class="teacher-lesson-contents" open><summary>Sommaire du cours</summary><ul>${sections.map(({heading},index)=>
    `<li><a href="#teacherLessonSection${index}" data-action="teacher-coach-section" data-value="${index}"><bdi data-no-i18n="true">${esc(heading)}</bdi></a></li>`).join('')}</ul></details>
    <div class="teacher-draft-text teacher-lesson-sections">${sections.map(({heading,text},index)=>
      `<section id="teacherLessonSection${index}" tabindex="-1" dir="auto" data-no-i18n="true"><h4>${esc(heading)}</h4>${teacherLessonBlock(draft,sections[index],busy)}</section>`).join('')}</div>`;
}

function teacherCoachDraftPreview(draft,busy) {
  const entry = teacherCoachClass(draft.classId);
  const canPublish=!teacherCoachSchool()||!!entry;
  const actionLabel = teacherCoachSchool()&&draft.task!=='exam'?'Ouvrir dans l’éditeur de séance':
    {lesson:'Ouvrir dans l’éditeur de cours',exercises:'Ouvrir dans l’éditeur de devoir',exam:'Ouvrir dans l’éditeur d’examen'}[draft.task];
  const disabled = busy ? 'disabled' : '';
  const source = draft.source === 'local' ? 'Brouillon local' : draft.source === 'template' ? 'Modèle à compléter' : 'Brouillon généré';
  const notes = draft.source !== 'ai' && draft.notes && searchKey(draft.notes) !== searchKey(draft.topic) ?
    `<details class="teacher-preparation-notes"><summary>Précisions de préparation</summary><p class="teacher-draft-text" dir="auto" data-no-i18n="true">${esc(draft.notes)}</p></details>` : '';
  const scope=draft.task==='lesson'&&draft.source!=='template'&&TEACHER_COACH_LESSON_MODES[draft.lessonMode];
  const level=draft.lessonLevelLabel||draft.levelName||entry?.name||'';
  const review=draft.lessonData&&teacherLessonChecks(draft).some(check=>check.status==='review');
  return `<div class="teacher-coach-document-meta"><span class="tag mint">${source}</span>${scope?`<span>${scope}</span>`:''}<bdi data-no-i18n="true">${esc(level)}</bdi><bdi dir="ltr">${draft.duration} min</bdi></div>
    <h2><bdi data-no-i18n="true">${esc(draft.title)}</bdi></h2>
    <p class="tiny muted">Relisez et complétez le document avant de le publier.</p>
    ${review?'<button type="button" class="btn secondary small lesson-review-button" data-action="teacher-coach-checks">Consultez la vérification des calculs.</button>':''}
    <h3>Version élève</h3>
    <div class="homework-actions">
      ${canPublish?`<button type="button" class="btn primary" data-action="teacher-coach-open" ${disabled}>${teacherCoachGlyph('arrow')} ${actionLabel}</button>`:''}
      <button type="button" class="btn secondary" data-action="teacher-coach-download" data-value="content" ${disabled}>${teacherCoachGlyph('download')} PDF · Version élève</button>
    </div>
    ${draft.lessonSections?teacherCoachLessonPreview(draft,busy):`<pre class="teacher-draft-text" dir="auto" data-no-i18n="true">${esc(draft.content)}</pre>`}
    ${draft.correction ? `<details class="teacher-coach-correction"><summary>Corrigé professeur</summary><button type="button" class="btn secondary" data-action="teacher-coach-download" data-value="correction" ${disabled}>${teacherCoachGlyph('download')} PDF · Corrigé</button>${draft.lessonData?renderTeacherLessonChecks(draft):''}<pre class="teacher-draft-text" dir="auto" data-no-i18n="true">${esc(draft.correction)}</pre></details>` : ''}${notes}`;
}

function refreshTeacherCoach(focusSelector = '') {
  const node = document.getElementById('teacherCoachWorkspace');
  if(!node||!teacherCoachVisible())return;
  const classes=teacherCoachClasses();
  const subject=teacherCoachSubject(classes.find(entry=>entry.id===teacherCoach.classId));
  if (!teacherCoachSchool()&&(!subject?.name||!classes.length)) return;
  const scroll=schoolScrollSnapshot();
  teacherCoach.localTopicsOpen=node.querySelector('#teacherPracticeTopics')?.open||false;
  node.innerHTML = localizeHTML(teacherCoachWorkspace(subject,classes));
  if (focusSelector && !document.querySelector('.modal,dialog[open]')) node.querySelector(focusSelector)?.focus({preventScroll:true});
  restoreSchoolScroll(scroll);
}

function refreshTeacherCoachAccess() {
  const panel = document.getElementById('teacherCoachAccess');
  if (!panel) return;
  panel.innerHTML = localizeHTML(teacherCoachAccessContent());
  const note = document.querySelector('#teacherCoachForm .coach-ai-note');
  if (note) note.hidden = teacherCoach.access !== 'ready';
}

function checkTeacherCoachAccess() {
  const session = teacherCoach;
  if (!teacherCoachVisible() || !document.getElementById('teacherCoachWorkspace')) return Promise.resolve(session.access);
  if (session.accessRequest) return session.accessRequest;
  session.access = 'loading';
  session.accessRequest = readAICoachAccess(teacherCoachSchool()).then(access => {
    session.access = access;
    session.accessRequest = null;
    if (session === teacherCoach) refreshTeacherCoachAccess();
    return access;
  });
  refreshTeacherCoachAccess();
  return session.accessRequest;
}

function changeTeacherCoachTask(task) {
  if (!teacherCoachVisible() || teacherCoach.request || !Object.hasOwn(TEACHER_COACH_TASKS,task)) return;
  teacherCoach.task = task;
  teacherCoach.feedback = '';
  teacherCoach.failure = '';
  refreshTeacherCoach(`[data-action="teacher-coach-task"][data-value="${task}"]`);
}

function rememberTeacherCoachInput(input) {
  if (input.form?.id !== 'teacherCoachForm') return false;
  if(!teacherCoachVisible())return true;
  if(['classId','language','topic','notes','subject','level'].includes(input.name)) teacherCoach[input.name] = input.value;
  else if(['count','minutes','format','difficulty','lessonMode','lessonLevel','lessonPlanText'].includes(input.name)) (teacherCoach.settings[teacherCoach.task]??={})[input.name]=input.value;
  if(input.name==='lessonMode'){
    document.getElementById('teacherCoachMinutes').placeholder=TEACHER_LESSON_MODES[input.value].duration;
  }
  if(input.name==='classId'){
    const subject=teacherCoachSubject(teacherCoachClass(input.value));
    const display=document.getElementById('teacherCoachSubject');
    const freeContext=document.getElementById('teacherCoachFreeContext');
    if(freeContext){
      const free=input.value==='';
      display.hidden=free;
      freeContext.hidden=!free;
      for(const field of freeContext.querySelectorAll('input,select'))field.disabled=!free;
      const examples=document.getElementById('teacherCoachExamples');
      examples.hidden=free;
      examples.innerHTML=free?'':localizeHTML(teacherLocalTopics(subject));
    }
    display.querySelector('span').textContent=subject?.name||'';
  }
  return true;
}

function teacherDraftContext(values,topicRequired,ignorePlan=false) {
  if (!teacherCoachVisible() || teacherCoach.request) return null;
  const classEntry=teacherCoachClass(values.classId);
  const free=teacherCoachSchool()&&values.classId==='';
  const subject=teacherCoachSubject(classEntry,free?String(values.subject||'').trim():'');
  const levelName=free?String(values.level||'').trim():[classEntry?.name,classEntry?.level].filter(Boolean).join(' · ');
  const notify=teacherCoachSchool()?schToast:toast;
  const topic = String(values.topic || '').trim().slice(0,120);
  if (!subject?.name || !levelName || (!classEntry&&!free) || !Object.hasOwn(TEACHER_COACH_LANGUAGES,values.language) || (topicRequired && !topic)) {
    notify(free?'Indiquez la matière, le niveau et le sujet.':'Choisissez une classe et indiquez le sujet.');
    return null;
  }
  const notes = String(values.notes || '').trim().slice(0,1600);
  const settings={...teacherCoach.settings[teacherCoach.task],...values};
  const requested={count:Number(settings.count)||undefined,minutes:Number(settings.minutes)||undefined,
    difficulty:settings.difficulty||undefined,format:settings.format||undefined};
  const lessonMode=teacherCoach.task==='lesson'?(settings.lessonMode==='session'?'session':'chapter'):undefined;
  const lessonLevel=lessonMode&&Object.hasOwn(TEACHER_LESSON_LEVELS,settings.lessonLevel)?settings.lessonLevel:undefined;
  const rawPlan=lessonMode&&!ignorePlan?String(settings.lessonPlanText||'').trim():'';
  const lessonPlan=rawPlan?validateTeacherPlan(rawPlan.split(/\r?\n/).map(line=>line.trim()).filter(Boolean),lessonMode):undefined;
  if(rawPlan&&!lessonPlan){notify('Le plan contient des intitulés répétés, trop longs ou trop nombreux.');return null;}
  const context={task:teacherCoach.task,classId:classEntry?.id||'',levelName,subjectId:subject.id,subjectName:subject.name,
    language:values.language,topic,notes,lessonMode,lessonLevel,lessonPlan,customLessonDuration:requested.minutes||teacherLocalDuration(notes,0),...requested};
  const defaults=teacherPracticeSettings(context);
  return {...context,count:context.task==='lesson'?undefined:defaults.count,format:context.task==='lesson'?undefined:defaults.format,
    difficulty:defaults.difficulty,minutes:defaults.duration};
}

function useTeacherCoachTemplate() {
  const context = teacherDraftContext(teacherCoach,false,true);
  if (!context) return;
  teacherCoach.drafts[context.task] = teacherTemplateDraft(context);
  teacherCoach.failure = '';
  teacherCoach.feedback = 'Un modèle sur votre sujet est prêt à compléter.';
  refreshTeacherCoach('[data-action="teacher-coach-view"]');
}

async function requestTeacherCoach(context,request,parameters={}) {
  let timedOut = false;
  const deadline = setTimeout(() => { timedOut = true; request.abort(); },context.task==='lesson'?70000:54000);
  try {
    const {ok,data} = await requestAICoach({
      profile:'teacher',task:context.task,language:context.language,topic:context.topic,notes:context.notes,
      count:context.count,minutes:context.minutes,format:context.format,difficulty:context.difficulty,lessonMode:context.lessonMode,
      lessonLevel:context.lessonLevel,lessonPlan:parameters.lessonAction?undefined:context.lessonPlan,...parameters,
      ...(context.classId?{classId:context.classId}:{subject:context.subjectName,level:context.levelName})
    },request.signal,'/api/school/coach');
    return ok&&(data.draft||data.plan||data.addition)?data:{
      status:data.status||data.code||(data.message?'school-class':'invalid-response'),retryAfter:data.retryAfter
    };
  } catch {
    return {status:timedOut ? 'timeout' : request.signal.aborted ? 'cancelled' : 'network-error'};
  } finally {
    clearTimeout(deadline);
  }
}

async function generateTeacherDraft(values) {
  const context = teacherDraftContext(values,true);
  if (!context) return;
  const session = teacherCoach;
  const access = session.accessRequest || (!session.access ? checkTeacherCoachAccess() : session.access);
  const request = new AbortController();
  session.request = request;
  session.feedback = '';
  session.failure = '';
  refreshTeacherCoach('[data-action="teacher-coach-cancel"]');
  let nextFocus = '#teacherCoachGenerate';
  try {
    const ready = (await access) === 'ready';
    if (request.signal.aborted) return;
    const result = ready ? await requestTeacherCoach(context,request) : {};
    if (request.signal.aborted && result.status !== 'timeout') return;
    if (AI_COACH_ACCOUNT_STATES.includes(result.status)) session.access = result.status;
    const label=context.lessonLevel&&context.lessonLevel!=='class'?TEACHER_LESSON_LEVELS[context.lessonLevel][context.language]:undefined;
    const draft = result.draft ? {...context,...result.draft,lessonLevelLabel:label,source:'ai'} : teacherLocalDraft(context);
    if(draft)session.drafts[context.task] = draft;
    session.failure = result.status && !AI_COACH_ACCOUNT_STATES.includes(result.status) ? result.status : '';
    session.retryAfter = result.retryAfter;
    session.feedback = draft?.lessonPlan&&draft.lessonSections?'Le plan a été suivi dans le cours et le PDF.' :
      draft?.source === 'local' ? (context.lessonMode==='chapter'&&draft.lessonMode==='session'?
      'La version locale de ce sujet couvre une séance ciblée. Le chapitre complet est disponible avec le coach en ligne.':'Brouillon local prêt à relire.') :
      draft ? 'Document prêt à relire.' : session.drafts[context.task] ? 'Le dernier brouillon reste affiché.' :
      ready&&session.failure ? '' : context.lessonPlan?'Certaines notions du plan nécessitent le coach en ligne.' : /math|رياضيات/i.test(searchKey(context.subjectName))?
        'Le coach local ne couvre pas encore ce sujet. Choisissez un sujet de la liste ou utilisez un modèle à compléter.':
        'Connexion au coach en ligne requise pour les autres sujets.';
    if(draft)nextFocus='[data-action="teacher-coach-view"]';
  } finally {
    session.request = null;
    if (session === teacherCoach) refreshTeacherCoach(nextFocus);
  }
}

function currentTeacherDraft() {
  if (!teacherCoachVisible() || teacherCoach.request || teacherCoachTeacherId() !== teacherCoach.teacherId) return null;
  const draft = teacherCoach.drafts[teacherCoach.task];
  return draft&&(teacherCoachSchool()||(teacherCoachClass(draft.classId)&&teacherCanPublish(draft.subjectId,draft.classId)))?draft:null;
}

function openTeacherDraft() {
  const draft = currentTeacherDraft();
  if (!draft) return;
  if(teacherCoachSchool()) {
    if(!teacherCoachClass(draft.classId))return;
    if(draft.task==='exam')return schAssessmentEditor(null,{title:draft.title,class_id:draft.classId,kind:'exam',instruction:draft.content});
    return schSessionEditor(null,{title:draft.title,class_id:draft.classId,description:draft.task==='lesson'?draft.content:'',
      exercise:draft.task==='exercises'?draft.content:'',duration:draft.duration});
  }
  if (draft.task === 'lesson') {
    openLibraryEditor(true,{
      classId:draft.classId,language:draft.language,title:draft.title,
      description:draft.summary || draft.title,chapter:(draft.topic || draft.title).slice(0,80),text:draft.content
    });
    return;
  }
  openHomeworkEditor({
    title:draft.title,subject:draft.subjectId,classId:draft.classId,
    dueDate:dayKey(plusDays(new Date(),2)),duration:draft.duration,instructions:draft.content,
    kind:draft.task === 'exam' ? 'exam' : 'homework'
  },draft.task === 'exam' ? 'Nouvel examen' : 'Nouveau devoir');
}

function selectTeacherPracticeTopic(value) {
  const input=document.getElementById('teacherCoachTopic');
  if(!input)return;
  teacherCoach.localTopicsOpen=true;
  teacherCoach.topic=state.lang==='ar'?tr(value):value;
  input.value=teacherCoach.topic;
  input.focus({preventScroll:true});
}

function viewTeacherCoachOutput() {
  const output=document.getElementById('teacherCoachOutput');
  output?.focus({preventScroll:true});
  output?.scrollIntoView({block:'nearest'});
}

function viewTeacherLessonSection(value) {
  const section=document.getElementById('teacherLessonSection'+value);
  section?.focus({preventScroll:true});
  section?.scrollIntoView({block:'start'});
}

function teacherCoachAction(action,value) {
  if(!teacherCoachVisible())return false;
  switch(action){
    case 'coach-retry': checkTeacherCoachAccess(); break;
    case 'teacher-coach-task': changeTeacherCoachTask(value); break;
    case 'teacher-coach-template': useTeacherCoachTemplate(); break;
    case 'teacher-coach-open': openTeacherDraft(); break;
    case 'teacher-coach-topic': selectTeacherPracticeTopic(value); break;
    case 'teacher-coach-view': viewTeacherCoachOutput(); break;
    case 'teacher-coach-section': viewTeacherLessonSection(value); break;
    case 'teacher-coach-plan': proposeTeacherLessonPlan(); break;
    case 'teacher-coach-expand': expandTeacherLessonSection(value); break;
    case 'teacher-coach-checks': {
      const correction=document.querySelector('#teacherCoachOutput .teacher-coach-correction');
      if(!correction)break;
      correction.open=true;
      const checks=correction.querySelector('.teacher-calculations');
      if(checks){
        checks.open=true;
        checks.querySelector('summary')?.focus({preventScroll:true});
        checks.scrollIntoView({block:'start'});
      }
      break;
    }
    case 'teacher-coach-download': downloadTeacherDraft(value); break;
    case 'teacher-coach-cancel': teacherCoach.request?.abort(); break;
    default:return false;
  }
  return true;
}

function downloadTeacherDraft(part) {
  const draft = currentTeacherDraft();
  if (!draft || !['content','correction'].includes(part) || !draft[part]) return;
  const file = TEACHER_COACH_TASKS[draft.task].file;
  const suffix = part === 'correction' ? '-corrige' : '';
  const labels={
    fr:['Classe','Matière','Durée','Barème',' min',' points','Niveau'],
    ar:['القسم','المادة','المدة','سلم التنقيط',' دقيقة',' نقاط','المستوى'],
    en:['Class','Subject','Time','Marks',' min',' marks','Level']
  }[draft.language];
  const entry=teacherCoachClass(draft.classId);
  const correction=part==='correction';
  const alerts=correction&&draft.lessonData?teacherLessonChecks(draft).filter(check=>check.status!=='ok'):[];
  const sections=alerts.length?[{heading:TEACHER_CHECK_TERMS[draft.language].title,
    text:alerts.map(item=>item.exercise+' · '+item.text).join('\n')},...draft.correctionSections]:
    correction?draft.correctionSections:draft.lessonSections;
  const meta=[draft.lessonLevelLabel||!entry?[labels[6],draft.lessonLevelLabel||draft.levelName]:[labels[0],entry.name],
    [labels[1],draft.subjectName],[labels[2],draft.duration+labels[4]]];
  const total=draft.task==='exam'&&draft[part].match(/^(?:Total|المجموع)\s*[:：]?\s*([0-9]+(?:[.,][0-9]+)?)/im)?.[1];
  if(total)meta.push([labels[3],total+labels[5]]);
  const body=total?draft[part].replace(/^(?:Total|المجموع)[^\n]*\n*/im,''):draft[part];
  saveSchoolDocument({title:draft.title,kind:correction?'correction':draft.task,language:draft.language,meta,body,sections,math:true,
    studentFields:!correction&&draft.task!=='lesson'},'madrassati-'+file+suffix+'.pdf');
}
