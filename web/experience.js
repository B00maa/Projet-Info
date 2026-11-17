'use strict';

// Composants partagés du tableau de bord. Les dates de cours restent celles
// de la semaine exemple ; seul le parcours personnel utilise la date locale.
const EXPERIENCE_AR = {
  'Mon apprentissage':'تعلّمي', 'Mon quotidien':'حياتي اليومية',
  'Le suivi scolaire':'المتابعة الدراسية', 'L’accompagnement':'المواكبة',
  'Mes classes et élèves':'أقسامي وتلاميذي', 'Mon organisation':'تنظيم عملي',
  'Le pilotage':'الإشراف', 'La gestion':'التسيير',
  'Démonstration':'نسخة توضيحية', 'Rechercher une ressource':'البحث عن مورد دراسي',
  'TON ESPACE POUR GRANDIR':'فضاؤك للتعلّم والتقدّم',
  'Bonjour, Yassine !':'مرحبًا ياسين!',
  'Un cours, une découverte, une pause. Avance à ton rythme.':'درس واكتشاف واستراحة. تقدّم على إيقاعك.',
  'Mon programme':'برنامجي', 'Une petite étape suffit.':'خطوة صغيرة تكفي.',
  'À ton programme':'في برنامجك', 'Ouvrir la séance':'فتح الحصة',
  'Semaine exemple · 19–25 mai 2025':'أسبوع توضيحي · من 19 إلى 25 ماي 2025',
  'Séance exemple · mercredi 21 mai 2025':'حصة توضيحية · الأربعاء 21 ماي 2025',
  'Progression des cours':'تقدّم الدروس', 'Données de la semaine exemple':'بيانات الأسبوع التوضيحي',
  'À faire à ton rythme':'للإنجاز على إيقاعك', 'Travaux terminés':'أعمال مكتملة',
  'Tu as terminé tes devoirs. Une belle occasion de découvrir un jeu !':'أنهيت واجباتك. فرصة جميلة لاكتشاف لعبة!',
  'Tes prochaines découvertes':'اكتشافاتك القادمة', 'À retrouver dans le calendrier':'ستجدها في الجدول الدراسي',
  'Le plaisir d’apprendre':'متعة التعلّم',
  'Quatre aventures, des explications et de petites victoires.':'أربع مغامرات وشروحات ونجاحات صغيرة.',
  'Explorer les jeux':'اكتشاف الألعاب', 'Tes découvertes comptent.':'كل اكتشاف لك له قيمة.',
  'Étoiles gagnées':'نجوم مكتسبة', 'Aventures terminées':'مغامرات مكتملة',
  'Ton prochain badge t’attend dans les jeux.':'شارتك القادمة تنتظرك في الألعاب.',
  'Voir ma collection':'عرض مجموعتي', 'Besoin d’un coup de pouce ?':'تحتاج إلى مساعدة صغيرة؟',
  'Ouvre ton coach de mathématiques.':'افتح مساعدك في الرياضيات.',
  'Tu peux aussi faire une pause.':'يمكنك أيضًا أخذ استراحة.',
  'Apprendre commence par se sentir bien.':'يبدأ التعلّم بالشعور بالراحة.',
  'Ton petit parcours':'مسارك القصير', 'Un peu chaque jour, à ton rythme.':'قليل كل يوم، على إيقاعك.',
  'Environ 5 min, sans chronomètre':'حوالي 5 دقائق، دون مؤقّت',
  'Environ 3 min, sans chronomètre':'حوالي 3 دقائق، دون مؤقّت',
  'Je comprends':'أفهم', 'Je m’entraîne':'أتدرّب', 'Je souffle':'أستريح',
  'Une idée à découvrir':'فكرة لاكتشافها', 'Un petit exercice guidé':'تمرين صغير مع توجيه',
  'Un moment pour toi':'لحظة لك', 'Commencer mon parcours':'بدء مساري',
  'Reprendre mon parcours':'متابعة مساري', 'Parcours terminé':'اكتمل المسار',
  'Revoir mon parcours':'مراجعة مساري',
  'Tes étapes sont conservées si tu fais une pause.':'تُحفَظ خطواتك إذا أخذت استراحة.',
  'Bravo ! Tu as pris le temps d’apprendre et de souffler.':'أحسنت! خصّصت وقتًا للتعلّم والراحة.',
  'Étape terminée':'اكتملت الخطوة', 'Étapes terminées':'خطوات مكتملة', 'Un petit parcours de mathématiques':'مسار قصير في الرياضيات',
  'Une équation, comme une balance':'المعادلة تشبه الميزان',
  'Pour garder l’équilibre, on fait la même opération des deux côtés.':'للحفاظ على التوازن، نجري العملية نفسها على الطرفين.',
  'On soustrait 4 des deux côtés.':'نطرح 4 من الطرفين.',
  'On divise les deux côtés par 2.':'نقسم الطرفين على 2.',
  'On vérifie en remplaçant x par 3.':'نتحقّق بتعويض x بالعدد 3.',
  'J’ai compris, j’essaie':'فهمت، سأجرّب', 'Je reprendrai plus tard':'سأتابع لاحقًا',
  'À toi de trouver x':'حان دورك لإيجاد x',
  'Commence par retirer 5, puis divise par 3.':'ابدأ بطرح 5، ثم اقسم على 3.',
  'Choisis une réponse. Tu peux essayer plusieurs fois.':'اختر إجابة. يمكنك المحاولة عدة مرات.',
  'Encore un essai ? Soustrais d’abord 5 des deux côtés.':'تحاول مرة أخرى؟ اطرح أولًا 5 من الطرفين.',
  'Bien joué ! La même opération des deux côtés.':'أحسنت! العملية نفسها على الطرفين.',
  'La vérification confirme ta réponse.':'التحقّق يؤكّد إجابتك.',
  'Maintenant, on souffle.':'والآن، نأخذ استراحة.',
  'Relâche les épaules et respire tranquillement. Tu choisis la durée de ta pause.':'أرخِ كتفيك وتنفّس بهدوء. اختر مدّة الاستراحة التي تناسبك.',
  'À ton rythme':'على إيقاعك', 'Terminer mon parcours':'إنهاء مساري',
  'Revoir la leçon':'مراجعة الدرس', 'Retour à mon espace':'العودة إلى فضائي',
  'Ton parcours est terminé. Bravo pour tes efforts !':'اكتمل مسارك. أحسنت على مجهودك!',
  'À retenir : on garde l’équilibre des deux côtés.':'تذكّر: نحافظ على التوازن بين الطرفين.',
  'Parcours personnel enregistré dans ce navigateur.':'يُحفَظ المسار الشخصي في هذا المتصفّح.',
  'Votre prochain pas':'خطوتكم القادمة', 'Garder le lien avec son enseignant':'التواصل مع أستاذه',
  'Un échange pour mieux accompagner Yassine.':'تواصل لمواكبة ياسين بشكل أفضل.',
  'Consulter ses devoirs':'عرض واجباته', 'Préparer votre prochaine séance':'إعداد حصّتكم القادمة',
  'Retrouvez vos classes et organisez les activités à votre rythme.':'تصفّحوا أقسامكم ونظّموا الأنشطة على إيقاعكم.',
  'Créer une séance':'إنشاء حصة', 'Voir les présences':'عرض الحضور',
  'Les dossiers à suivre':'الملفّات التي تحتاج المتابعة',
  'Retrouvez les demandes en attente et les accès de la communauté.':'تصفّحوا الطلبات قيد الانتظار وحسابات المستعملين.',
'Gérer les comptes':'تسيير الحسابات',
  'Tu peux reprendre ton parcours quand tu le souhaites.':'يمكنك متابعة مسارك متى شئت.',
  'Fermer le menu':'إغلاق القائمة'
};
for (const [fr, ar] of Object.entries(EXPERIENCE_AR)) AR_LOOKUP.set(localeKey(fr), ar);

function roleNavGroups() {
  const groups = {
    eleve:[['Mon apprentissage',['dashboard','courses','devoirs','jeux','notes']],['Mon quotidien',['calendrier','rattrapage','resources','messagerie','bien-etre']]],
    parent:[['Le suivi scolaire',['dashboard','calendrier','devoirs','rattrapage','notes','presences']],['Échanges et ressources',['messagerie','resources','bien-etre']]],
    professeur:[['Mes classes et élèves',['dashboard','messagerie','classes','eleves','notes']],['Mon organisation',['calendrier','presences','courses','coach','devoirs','resources']]],
    administration:[['Pilotage',['dashboard','calendrier']],['Scolarité',['classes','eleves','notes','comptes']],['Outils',['resources','statistiques','parametres']]]
  };
  return groups[state.role];
}

function renderGroupedNavigation() {
  return roleNavGroups().map(([label,pages]) => `<div class="nav-group"><p class="nav-group-label">${label}</p>${pages.map(page => {
    const item = menu[state.role].find(m => m[0] === page);
    if (!item || !allowedPages().has(page)) return '';
    return `<a class="nav-item ${state.page===page?'active':''}" href="#${state.role}/${page}" ${state.page===page?'aria-current="page"':''}>${icon(item[1])}<span>${item[2]}</span>${page==='messagerie'&&state.examples&&state.unread?`<span class="nav-badge">${state.unread}</span>`:''}</a>`;
  }).join('')}</div>`).join('');
}

function localPlanDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dailyPlanState() {
  const p=state.dailyPlan;
  if (!p || p.day!==localPlanDay() || !Number.isInteger(p.step) || p.step<0 || p.step>3) state.dailyPlan={day:localPlanDay(),step:0};
  return state.dailyPlan;
}
function planSteps(active) {
  return `<ol class="learning-steps">${[['Je comprends','Une idée à découvrir','book'],['Je m’entraîne','Un petit exercice guidé','edit'],['Je souffle','Un moment pour toi','heart']].map(([title,sub,i],n)=>`<li class="${n<active?'is-done':n===active?'is-current':''}"><span class="step-marker" aria-hidden="true">${icon(n<active?'check':i,'sm')}</span><div><strong>${title}</strong><small>${sub}</small></div>${n<active?`<span class="sr-only">${tr('Étape terminée')}</span>`:''}</li>`).join('')}</ol>`;
}
function dailyPlanCard() {
  const p=dailyPlanState();
  return `<section class="card daily-plan"><div class="between"><span class="section-kicker">Mon programme</span><span class="plan-count" dir="ltr">${p.step}/3</span></div><h2>Ton petit parcours</h2><p class="section-intro">Un peu chaque jour, à ton rythme.</p><div class="plan-duration">${icon('clock','sm')}<span>${state.fatigue?'Environ 3 min, sans chronomètre':'Environ 5 min, sans chronomètre'}</span></div>${progress(Math.round(p.step/3*100),'var(--mint)')}${planSteps(p.step)}<button class="btn secondary full" data-action="plan-open">${icon(p.step===3?'check':'play','sm')}<span>${p.step===0?'Commencer mon parcours':p.step===3?'Revoir mon parcours':'Reprendre mon parcours'}</span></button><p class="plan-note">${p.step===3?'Bravo ! Tu as pris le temps d’apprendre et de souffler.':'Tes étapes sont conservées si tu fais une pause.'}</p></section>`;
}

function renderStudentExperience() {
  if (!state.examples) return publishedStudentDashboard();
  const todo=homeworkList().filter(a=>homeworkCanEdit(a.id));
  const profile=state.gameProfile;
  const average=Math.round(subjects.reduce((n,s)=>n+s.progress,0)/subjects.length);
  return `<div class="page-heading student-greeting between"><div><p class="section-kicker">TON ESPACE POUR GRANDIR</p><h1>Bonjour, Yassine ! <span class="greeting-spark" aria-hidden="true">✦</span></h1><p>Un cours, une découverte, une pause. Avance à ton rythme.</p></div>${fatigueToggle()}</div>
  ${state.fatigue?`<div class="focus-notice">${icon('moon')}<div><strong>Une petite étape suffit.</strong><p>Aujourd’hui, on avance doucement : une séance de 15 minutes et une pause entre les activités.</p></div></div>`:''}
  <div class="learn-layout"><div class="learn-main">
    ${homeworkToday()}
    <div class="overview-strip"><div>${tile('chart','mint')}<span><strong>${average}%</strong><small>Progression des cours</small></span></div><button data-page="devoirs">${tile('clipboard','')}<span><strong>${todo.length}</strong><small>À faire à ton rythme</small></span>${icon('right','sm')}</button><button data-page="jeux">${tile('star','orange')}<span><strong>${profile.points}</strong><small>Étoiles gagnées</small></span>${icon('right','sm')}</button></div><p class="sample-note">Données de la semaine exemple</p>
  </div>${dailyPlanCard()}<div class="learn-study">${coachDisclosure()}${dashboardDiscovery()}<section class="subjects-home">${cardHeading('Mes matières','Voir tout','courses')}${subjectsGrid()}</section>
    <section class="card homework-home">${cardHeading(`Devoirs à faire <span class="homework-count">${todo.length}</span>`,'Tout voir','devoirs')}${todo.length?homeworkRows():`<div class="homework-empty">${tile('check','mint')}<p>Tu as terminé tes devoirs. Une belle occasion de découvrir un jeu !</p></div>`}</section>
    <section class="play-invitation"><div class="play-invitation-symbol" aria-hidden="true">${icon('gamepad')}</div><div><span class="section-kicker">Le plaisir d’apprendre</span><h2>Tes découvertes comptent.</h2><p>Quatre aventures, des explications et de petites victoires.</p></div><button class="btn play-accent" data-page="jeux">Explorer les jeux ${icon('arrow','sm')}</button></section>
  </div><aside class="learn-aside">
    <section class="card upcoming-home">${cardHeading('Prochaines séances')}${sessionRows()}<button class="text-link" data-page="calendrier">Mon calendrier ${icon('arrow','sm')}</button></section>
    <section class="card earned-home"><div class="between">${tile('award','orange')}<span class="earned-count" dir="ltr">${profile.badges.length}/${GAME_BADGES.length}</span></div><h2>Mes badges</h2><p>${profile.badges.length?'Tes découvertes comptent.':'Ton prochain badge t’attend dans les jeux.'}</p>${profile.badges.length?`<div class="earned-icons">${GAME_BADGES.filter(b=>profile.badges.includes(b.id)).map(b=>`<span title="${esc(b.name)}">${tile(b.icon,b.color==='blue'?'':b.color)}</span>`).join('')}</div>`:''}<button class="text-link" data-action="badges">Voir ma collection ${icon('arrow','sm')}</button></section>
    <button class="gentle-break" data-page="bien-etre">${icon('heart')}<span><strong>Tu peux aussi faire une pause.</strong><small>Apprendre commence par se sentir bien.</small></span>${icon('right','sm')}</button>
  </aside></div>`;
}

function coachDisclosure() {
  return `<details class="coach-disclosure" id="coachDisclosure" ${state.coachOpen ? 'open' : ''}><summary>${tile('robot','')}<span><strong>Coach d’études</strong><small>Pose une question ou fais un exercice.</small></span>${icon('chevron')}</summary><div class="coach-disclosure-content">${coachCard()}</div></details>`;
}

function publishedStudentDashboard() {
  const contentSubjects = new Set([...visibleSessions().map(s => s.subjectId), ...libraryResources().map(r => r.subjectId), ...homeworkList().map(a => a.subject)]);
  const cards = subjects.filter(s => contentSubjects.has(s.id)).map(s => `<button class="subject-card" data-action="subject" data-id="${s.id}">${tile(s.icon,s.color)}<strong>${s.name}</strong></button>`).join('');
  return `${heading('Bonjour, Yassine !','',fatigueToggle())}<div class="learn-layout"><div class="learn-study">
    ${homeworkToday()}${coachDisclosure()}${dashboardDiscovery()}
    <section class="card published-subjects">${cardHeading('Mes matières','Voir tout','courses')}${cards ? `<div class="subject-grid">${cards}</div>` : '<p class="planning-empty">Aucun cours publié pour le moment.</p>'}</section>
    <section class="card homework-home">${cardHeading('Devoirs à faire','Tout voir','devoirs')}${homeworkRows() || '<p class="planning-empty">Aucun devoir à faire pour le moment.</p>'}</section>
  </div><aside class="learn-aside"><section class="card upcoming-home">${cardHeading('Prochaines séances','Mon calendrier','calendrier')}${sessionRows()}</section></aside></div>`;
}

function mathFormula(text, extra='') { return `<bdi class="math-formula ${extra}" dir="ltr" data-no-i18n="true">${text}</bdi>`; }
function planLesson(readOnly=false) {
  return `<div class="micro-lesson"><span class="tag mint">Je comprends</span><h3>Une équation, comme une balance</h3><p>Pour garder l’équilibre, on fait la même opération des deux côtés.</p><div class="equation-worked"><div>${mathFormula('2x + 4 = 10','equation-start')}</div><div>${mathFormula('2x = 6')}<span>On soustrait 4 des deux côtés.</span></div><div>${mathFormula('x = 3')}<span>On divise les deux côtés par 2.</span></div></div><div class="lesson-check">${icon('check','sm')}<span>On vérifie en remplaçant x par 3.</span>${mathFormula('2 × 3 + 4 = 10')}</div><div class="plan-dialog-actions"><button class="btn primary" data-action="${readOnly?'close-modal':'plan-next'}">${readOnly?'Retour à mon espace':'J’ai compris, j’essaie'} ${icon('arrow','sm')}</button>${readOnly?'':'<button class="text-link" data-action="close-modal">Je reprendrai plus tard</button>'}</div></div>`;
}
function openDailyPlan(feedback=false,review=false) {
  if(state.role!=='eleve')return;
  const p=dailyPlanState();
  let body='';
  if(review||p.step===0)body=planLesson(review);
  else if(p.step===1)body=`<div class="micro-lesson"><span class="tag blue">Je m’entraîne</span><h3>À toi de trouver x</h3><p>Choisis une réponse. Tu peux essayer plusieurs fois.</p><div class="plan-equation">${mathFormula('3x + 5 = 20')}</div><div class="plan-answers" role="group" aria-label="À toi de trouver x">${[3,5,8].map(n=>`<button class="plan-answer" data-action="plan-answer" data-value="${n}" aria-label="x = ${n}">${mathFormula(`x = ${n}`)}</button>`).join('')}</div>${feedback?`<p class="plan-feedback" role="status">${icon('info','sm')}Encore un essai ? Soustrais d’abord 5 des deux côtés.</p>`:'<p class="plan-note">Commence par retirer 5, puis divise par 3.</p>'}<div class="plan-dialog-actions"><button class="text-link" data-action="close-modal">Je reprendrai plus tard</button></div></div>`;
  else if(p.step===2)body=`<div class="micro-lesson text-center"><span class="tag mint">Je souffle</span><h3>Bien joué ! La même opération des deux côtés.</h3><div class="plan-solution">${mathFormula('3 × 5 + 5 = 20')}${icon('check','sm')}</div><p>La vérification confirme ta réponse.</p><h3 class="mt">Maintenant, on souffle.</h3><p>Relâche les épaules et respire tranquillement. Tu choisis la durée de ta pause.</p><div class="plan-breath" aria-hidden="true">${icon('heart')}</div><p class="plan-note">À ton rythme</p><div class="plan-dialog-actions"><button class="btn primary" data-action="plan-complete">${icon('check','sm')}Terminer mon parcours</button><button class="text-link" data-action="close-modal">Je reprendrai plus tard</button></div></div>`;
  else body=`<div class="micro-lesson text-center"><span class="plan-celebration">${icon('award')}</span><h3>Ton parcours est terminé. Bravo pour tes efforts !</h3><p>À retenir : on garde l’équilibre des deux côtés.</p>${planSteps(3)}<div class="plan-dialog-actions"><button class="btn primary" data-action="close-modal">Retour à mon espace</button><button class="text-link" data-action="plan-review">Revoir la leçon</button></div></div>`;
  openModal('Un petit parcours de mathématiques',`<div class="plan-dialog-progress"><span>Étapes terminées</span><strong dir="ltr">${p.step}/3</strong></div>${progress(Math.round(p.step/3*100),'var(--mint)')}${body}<p class="plan-privacy">Parcours personnel enregistré dans ce navigateur.</p>`,false,'plan-dialog');
  previousFocus=document.querySelector('[data-action="plan-open"]')||previousFocus;
}

function handlePlanAction(action,data) {
  if(state.role!=='eleve')return;
  const p=dailyPlanState();
  if(action==='plan-open')openDailyPlan();
  if(action==='plan-review'&&p.step===3)openDailyPlan(false,true);
  if(action==='plan-next'&&p.step===0){p.step=1;persist();render();openDailyPlan();}
  if(action==='plan-answer'&&p.step===1){
    if(Number(data.value)===5){p.step=2;persist();render();openDailyPlan();}
    else openDailyPlan(true);
  }
  if(action==='plan-complete'&&p.step===2){p.step=3;persist();closeModal();render();document.querySelector('[data-action="plan-open"]')?.focus();toast('Ton parcours est terminé. Bravo pour tes efforts !');}
}
