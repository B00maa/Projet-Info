'use strict';

const PLANNING_AR = {
  'Dupliquer la séance': 'نسخ الحصة', 'Aperçu élève': 'معاينة التلميذ',
  'Devoir ou examen associé': 'واجب أو اختبار مرتبط', 'Aucun travail associé': 'لا يوجد عمل مرتبط',
  'Voir le travail associé': 'عرض العمل المرتبط', 'Choisissez un travail de cette classe et de cette matière.': 'اختاروا عملاً من هذا القسم وهذه المادة.',
  'À rattraper': 'حصص للاستدراك', 'Retrouve les séances passées, leurs supports et le travail associé.': 'اطّلع على الحصص السابقة والموارد والعمل المرتبط بها.',
  'Aucune séance passée pour le moment.': 'لا توجد حصص سابقة حاليًا.',
  'Aucune séance ce jour-là.': 'لا توجد حصة في هذا اليوم.',
  'Marquer comme rattrapée': 'وضع علامة الاستدراك', 'Rattrapée': 'تم الاستدراك', 'Remettre à rattraper': 'إعادتها للاستدراك',
  'Vérifiez le titre, la classe et l’horaire pour afficher l’aperçu.': 'تحقّقوا من العنوان والقسم والتوقيت للمعاينة.',
  'Planning de Yassine': 'جدول ياسين', 'Séances de la classe': 'حصص القسم',
  'Vue par classe': 'عرض حسب القسم', 'Vue par professeur': 'عرض حسب الأستاذ',
  'Tous les professeurs': 'جميع الأساتذة', 'Séances publiées': 'الحصص المنشورة',
  'Aucune séance publiée pour cette période.': 'لا توجد حصص منشورة لهذه الفترة.',
  'Aucune séance à venir.': 'لا توجد حصص قادمة.', 'Séances à dater': 'حصص تحتاج إلى تاريخ',
  'Choisir une date': 'اختيار تاريخ', 'Date de la séance': 'تاريخ الحصة',
  'Détails de la séance': 'تفاصيل الحصة', 'Lien de la séance': 'رابط الحصة',
  'Déroulé de la séance': 'برنامج الحصة',
  'Ex. révision, exercice guidé, puis questions.': 'مثال: مراجعة، ثم تمرين موجّه، ثم أسئلة.',
  'Support de la séance': 'مورد الحصة', 'Support': 'مورد', 'Document PDF': 'مستند PDF',
  'Type de support': 'نوع المورد', 'Joindre un PDF': 'إرفاق ملف PDF', 'Joindre une vidéo': 'إرفاق فيديو',
  'Choisir un support': 'اختيار مورد', 'Aucun support disponible pour cette classe.': 'لا يوجد مورد متاح لهذا القسم.',
  'Fichier à joindre': 'الملف المراد إرفاقه', 'Fichier PDF, 30 Mo maximum.': 'ملف PDF، الحجم الأقصى 30 ميغابايت.',
  'Vidéo MP4 ou WebM, 30 Mo maximum.': 'فيديو MP4 أو WebM، الحجم الأقصى 30 ميغابايت.',
  'Choisissez un fichier PDF de 30 Mo maximum.': 'اختاروا ملف PDF بحجم لا يتجاوز 30 ميغابايت.',
  'Choisissez une vidéo MP4 ou WebM de 30 Mo maximum.': 'اختاروا فيديو MP4 أو WebM بحجم لا يتجاوز 30 ميغابايت.',
  'Choisissez un support de la matière et de la classe.': 'اختاروا موردًا مناسبًا للمادة والقسم.',
  'Indiquez un nombre de pages entre 1 et 300.': 'أدخلوا عدد صفحات بين 1 و300.',
  'Le fichier sera ajouté à la bibliothèque de la classe.': 'سيُضاف الملف إلى مكتبة القسم.',
  'Enregistrement du support…': 'جارٍ حفظ المورد…', 'Ouvrir le PDF': 'فتح ملف PDF', 'Voir la vidéo': 'مشاهدة الفيديو',
  'La séance a changé. Rouvrez-la pour continuer.': 'تغيّرت الحصة. افتحوها مرة أخرى للمتابعة.',
  'Le lien de la séance sera communiqué par l’enseignant.': 'سيشارك الأستاذ رابط الحصة.',
  'Séance à confirmer': 'حصة بانتظار التأكيد', 'Publier la séance': 'نشر الحصة',
  'La séance a été publiée.': 'تم نشر الحصة.', 'La séance a été mise à jour.': 'تم تحديث الحصة.',
  'Vérifiez la classe, la date et les horaires de la séance.': 'تحقّقوا من القسم والتاريخ وتوقيت الحصة.',
  'Saisissez un lien de séance valide.': 'أدخلوا رابط حصة صالحًا.',
  'Cette séance n’est pas disponible dans votre espace.': 'هذه الحصة غير متاحة في فضائكم.',
  'Supprimer la séance': 'حذف الحصة', 'La séance sera retirée du calendrier de la classe.': 'ستُحذف الحصة من جدول القسم.',
  'La séance a été supprimée.': 'تم حذف الحصة.', 'Ouvrir la séance': 'فتح الحصة',
  'Choisir un professeur pour la démo': 'اختيار أستاذ للعرض التجريبي',
  'Profil à tester': 'الملف للتجربة',
  'Choisir un professeur': 'اختيار أستاذ', 'Matière enseignée': 'المادة التي يدرّسها الأستاذ',
  'Classes enseignées': 'الأقسام التي يدرّسها الأستاذ', 'Sélectionnez une matière et au moins une classe.': 'اختاروا مادة وقسمًا واحدًا على الأقل.',
  'Contenus d’exemple': 'محتويات توضيحية', 'Afficher des séances, des devoirs et des ressources fictifs.': 'عرض حصص وواجبات وموارد توضيحية.',
  'Afficher les exemples': 'عرض الأمثلة', 'Exemples activés': 'الأمثلة مفعّلة',
  'Cours de ma classe': 'دروس قسمي', 'Les ressources publiées pour ta classe apparaissent ici.': 'تظهر هنا الموارد المنشورة لقسمك.',
  'Aucun cours publié pour le moment.': 'لا توجد دروس منشورة حاليًا.',
  'Aucune ressource publiée.': 'لا توجد موارد منشورة.', 'Les ressources de votre classe apparaîtront ici.': 'ستظهر هنا موارد قسمكم.',
  'Aucun devoir à faire pour le moment.': 'لا يوجد واجب للإنجاز حاليًا.',
  'Nouveau devoir publié': 'واجب جديد منشور', 'Ressources de mes classes': 'موارد أقسامي',
  'Aucun devoir ni séance à venir.': 'لا توجد واجبات أو حصص قادمة.', 'Bonjour, Yassine !': 'مرحبًا ياسين!'
};
for (const [fr, ar] of Object.entries(PLANNING_AR)) AR_LOOKUP.set(localeKey(fr), ar);

const DEMO_TEACHERS = [
  {id:'amal',name:'Mme Amal Benali',initial:'AB',subjectId:'maths',email:'amal@exemple.ma'},
  {id:'youssef',name:'M. Youssef El Idrissi',initial:'YI',subjectId:'francais'},
  {id:'salma',name:'Mme Salma Khatball',initial:'SK',subjectId:'svt',email:'salma@exemple.ma'},
  {id:'karim',name:'M. Karim El Idrissi',initial:'KI',subjectId:'histoire'},
  {id:'ines',name:'Mme Inès Bennis',initial:'IB',subjectId:'anglais'},
  {id:'salma-arabe',name:'Mme Salma El Fassi',initial:'SF',subjectId:'arabe'}
];

const timeLabel = minutes => `${String(Math.floor(minutes / 60)).padStart(2,'0')}:${String(minutes % 60).padStart(2,'0')}`;

function subjectById(id) {
  return subjects.find(s => s.id === id);
}

function classById(id) {
  return classData.find(c => c.id === id);
}

function teacherDirectory() {
  const allClasses = classData.map(c => c.id);
  const accounts = state.accounts.filter(a => a.role === 'Professeur');
  const defaults = DEMO_TEACHERS.map(t => ({...t,classIds:allClasses,active:!accounts.some(a => a.email === t.email && a.active === false)}));
  const otherTeachers = accounts.filter(a => !defaults.some(t => t.email === a.email)).flatMap(a => {
    const subject = subjectById(a.subjectId) || subjects.find(s => s.name === a.class);
    if (!subject) return [];
    const classIds = Array.isArray(a.classIds) ? a.classIds.filter(id => classById(id)) : allClasses;
    return [{id:a.teacherId || a.email,email:a.email,name:a.name,initial:a.name.split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(),subjectId:subject.id,classIds,active:a.active !== false}];
  });
  return [...defaults,...otherTeachers];
}

function activeTeacher() {
  const list = teacherDirectory().filter(t => t.active);
  return list.find(t => t.id === state.teacherId) || list[0];
}

function currentProfile() {
  if (state.role === 'eleve') {
    const entry = classById(childClassId());
    return {...roles.eleve,sub:entry ? `${entry.name} · ${entry.level}` : 'Sans classe'};
  }
  if (state.role === 'parent') return {...roles.parent,sub:childClassName()};
  if (state.role !== 'professeur') return roles[state.role];
  const teacher = activeTeacher();
  if (!teacher) return roles.professeur;
  return {...roles.professeur,name:teacher.name,initial:teacher.initial,sub:subjectById(teacher.subjectId).name};
}

function teacherLabel(teacher) {
  if (!teacher) return '';
  return `${tr(teacher.name)} · ${tr(subjectById(teacher.subjectId)?.name || '')}`;
}

function teacherChoices(selected, includeAll = false) {
  const entries = teacherDirectory().filter(t => includeAll || t.active || t.id === selected).map(t => [t.id,teacherLabel(t)]);
  return libraryOptions(includeAll ? [['all','Tous les professeurs'],...entries] : entries,selected);
}

function teacherForIdentifier(identifier) {
  const email = accountId(identifier);
  return teacherDirectory().find(teacher => teacher.active && teacher.email && accountId(teacher.email) === email);
}

function demoTeacherField() {
  if (loginRole !== 'professeur') return '';
  const options = teacherDirectory().filter(teacher => teacher.active).map(teacher => [teacher.id,teacher.name]);
  if (!options.length) return '';
  return `<details class="planning-login"><summary>Choisir un professeur pour la démo</summary><div class="form-field"><label for="demoTeacher">Profil à tester</label><select id="demoTeacher">${libraryOptions(options,loginTeacherId)}</select></div></details>`;
}

function teacherAccountFields() {
  return `<div class="full" id="teacherAccountFields" hidden>
    <label for="newTeacherSubject">Matière enseignée</label><select id="newTeacherSubject" name="teacherSubject" disabled>${libraryOptions(subjects.map(s => [s.id,s.name]),'maths')}</select>
    <fieldset class="teacher-class-options"><legend>Classes enseignées</legend>${classData.map(c => `<label><input type="checkbox" name="teacherClass" value="${c.id}" disabled><span>${c.name}</span></label>`).join('')}</fieldset>
  </div>`;
}

function accountTeachingData(form, values) {
  if (values.role !== 'Professeur') return {class:String(values.class || '').trim()};
  const subject = subjectById(values.teacherSubject);
  const ids = new FormData(form).getAll('teacherClass');
  const classIds = classData.filter(c => ids.includes(c.id)).map(c => c.id);
  if (!subject || !classIds.length) { toast('Sélectionnez une matière et au moins une classe.'); return null; }
  return {teacherId:homeworkId('professeur'),subjectId:subject.id,classIds,class:subject.name};
}

function teacherCanPublish(subjectId, classId) {
  if (state.role === 'administration') return !!subjectById(subjectId) && !!classById(classId);
  const teacher = activeTeacher();
  return state.role === 'professeur' && teacher?.subjectId === subjectId && teacher.classIds.includes(classId);
}

function publicationSubjects() {
  return state.role === 'professeur' ? subjects.filter(s => s.id === activeTeacher()?.subjectId) : subjects;
}

function publicationClasses() {
  return state.role === 'professeur' ? classData.filter(c => activeTeacher()?.classIds.includes(c.id)) : classData;
}

function legacyTeacherId(subjectId) {
  return DEMO_TEACHERS.find(t => t.subjectId === subjectId)?.id || '';
}

function sessionSubject(session) {
  return subjectById(session.subjectId)?.name || session.legacySubject || '';
}

function sessionClass(session) {
  return classById(session.classId)?.name || session.legacyClass || '';
}

function sessionTeacher(session) {
  return teacherDirectory().find(t => t.id === session.teacherId)?.name || 'Professeur';
}

function sessionTime(session) {
  return `${timeLabel(session.start)} – ${timeLabel(session.start + session.duration)}`;
}

function parseSessionTime(value) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return NaN;
  const [hour,minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function migrateLegacySessions(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(s => s && !initialSessions.some(example => example.id === s.id && example.lesson === s.lesson && example.time === s.time && example.class === s.class && example.subject === s.subject)).map(s => {
    const subjectId = subjects.find(subject => subject.name === s.subject || subject.id === s.subject)?.id || '';
    const classId = classData.find(c => c.name === s.class || c.id === s.class)?.id || '';
    const [startTime,endTime] = String(s.time || '').match(/\d{2}:\d{2}/g) || [];
    const start = parseSessionTime(startTime);
    const end = endTime === '24:00' ? 1440 : parseSessionTime(endTime);
    return {id:String(s.id),title:String(s.lesson || ''),subjectId,classId,teacherId:legacyTeacherId(subjectId),date:'',start:Number.isInteger(start) ? start : 600,duration:end > start ? end - start : 45,link:'',needsReschedule:true,legacySubject:s.subject,legacyClass:s.class};
  });
}

function scheduledSessions(board = homeworkBoard()) {
  return Array.isArray(board.sessions) ? board.sessions : migrateLegacySessions(state.legacySessions);
}

function exampleSchedule() {
  const start = homeworkDate(homeworkWeek().start);
  return [
    ['demo-svt','svt','6A','La cellule, unité du vivant',2,600],
    ['demo-maths','maths','6A','Additionner deux fractions',3,900],
    ['demo-fr','francais','6A','Décrire un paysage',4,660],
    ['demo-maths-3b','maths','3B','Les équations de premier degré',4,870]
  ].map(([id,subjectId,classId,title,offset,minute]) => ({id,subjectId,classId,title,teacherId:legacyTeacherId(subjectId),date:dayKey(plusDays(start,offset)),start:minute,duration:45,example:true}));
}

function visibleSessions(role = state.role) {
  const list = [...scheduledSessions(),...(state.examples ? exampleSchedule() : [])];
  if (role === 'administration') return list;
  if (role === 'professeur') {
    const teacher = activeTeacher();
    return list.filter(s => s.teacherId === teacher?.id && s.subjectId === teacher?.subjectId);
  }
  return list.filter(s => s.classId === childClassId() && s.date);
}

function canEditSession(session) {
  if (!session || session.example) return false;
  if (state.role === 'administration') return true;
  const teacher = activeTeacher();
  return state.role === 'professeur' && !!teacher && session.teacherId === teacher.id && session.subjectId === teacher.subjectId;
}

function sortSessions(list) {
  return list.slice().sort((a,b) => a.date.localeCompare(b.date) || a.start - b.start || a.title.localeCompare(b.title));
}

function upcomingSessions(role = state.role) {
  const now = new Date();
  const today = dayKey(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  return sortSessions(visibleSessions(role).filter(s => !s.needsReschedule && (s.date > today || s.date === today && s.start + s.duration > minute)));
}

function calendarAnchor() {
  return homeworkDate(state.calendarDate) || new Date();
}

function calendarRange() {
  const anchor = calendarAnchor();
  if (state.calendarView === 'month') {
    return {start:dayKey(new Date(anchor.getFullYear(),anchor.getMonth(),1,12)),end:dayKey(new Date(anchor.getFullYear(),anchor.getMonth()+1,0,12))};
  }
  const monday = plusDays(anchor,-((anchor.getDay()+6)%7));
  return {start:dayKey(monday),end:dayKey(plusDays(monday,6))};
}

function shiftCalendar(direction) {
  const date = calendarAnchor();
  const next = state.calendarView === 'month' ? new Date(date.getFullYear(),date.getMonth()+direction,1,12) : plusDays(date,direction*7);
  state.calendarDate = dayKey(next);
  render();
}

function calendarPeriodLabel(range) {
  const first = homeworkDate(range.start), last = homeworkDate(range.end);
  if (state.calendarView === 'month') return formatDate(first,{month:'long',year:'numeric'});
  return `${formatDate(first,{day:'numeric',month:'short'})} – ${formatDate(last,{day:'numeric',month:'short',year:'numeric'})}`;
}

function calendarSessionScope(list) {
  if (state.role === 'administration' && state.planningScope === 'teacher') {
    return state.planningTeacher === 'all' ? list : list.filter(s => s.teacherId === state.planningTeacher);
  }
  if (['administration','professeur'].includes(state.role) && state.planningClass !== 'all') return list.filter(s => s.classId === state.planningClass);
  return list;
}

function sessionTitleHTML(session, tagName = 'strong') {
  const title = session.example ? tr(session.title) : session.title;
  return `<${tagName} dir="auto" data-no-i18n="true">${esc(title)}</${tagName}>`;
}

function planningNeedsAttention(session) {
  return !session.date || session.needsReschedule;
}

function focusPlanningControl(action,value = '') {
  [...document.querySelectorAll('#main [data-action]')].find(button =>
    button.dataset.action === action && (button.dataset.value || '') === value)?.focus({preventScroll:true});
}

function sessionRow(session, showDate = false) {
  return `<button class="planning-session" data-action="select-event" data-id="${esc(session.id)}"><span class="planning-time">${showDate && session.date ? `<small>${formatDate(homeworkDate(session.date),{weekday:'short',day:'numeric',month:'short'})}</small>` : ''}${session.date ? `<bdi dir="ltr">${sessionTime(session)}</bdi>` : 'Choisir une date'}</span><span class="planning-session-title">${sessionTitleHTML(session)}<small>${esc(sessionSubject(session))} · ${esc(sessionTeacher(session))}</small></span><span class="planning-session-meta"><span class="tag mint">${esc(sessionClass(session))}</span>${session.resourceId ? '<span class="tag">Support</span>' : ''}${planningNeedsAttention(session) ? '<span class="tag orange">À reprogrammer</span>' : ''}${session.example ? '<span class="tag">Exemple</span>' : ''}</span>${icon('right','sm')}</button>`;
}

function sessionRows(limit = 3) {
  return upcomingSessions().slice(0,limit).map(s => sessionRow(s,true)).join('') || '<p class="planning-empty">Aucune séance à venir.</p>';
}

function calendarWeekRows(list) {
  if (!list.length) return '<p class="planning-empty">Aucune séance publiée pour cette période.</p>';
  const days = [...new Set(list.map(s => s.date))];
  return days.map(date => `<section class="planning-day"><h3>${formatDate(homeworkDate(date),{weekday:'long',day:'numeric',month:'long'})}</h3><div>${list.filter(s => s.date === date).map(s => sessionRow(s)).join('')}</div></section>`).join('');
}

function calendarMonthGrid(list, range) {
  const first = homeworkDate(range.start);
  const leading = (first.getDay()+6)%7;
  const dates = Array.from({length:homeworkDate(range.end).getDate()},(_,i) => plusDays(first,i));
  const current = dayKey(calendarAnchor());
  const today = dayKey();
  const days = Array.from({length:7},(_,i) => formatDate(plusDays(first,i-leading),{weekday:'short'}));
  return `<div class="planning-month">${days.map(d => `<span class="planning-weekday">${d}</span>`).join('')}${'<span aria-hidden="true"></span>'.repeat(leading)}${dates.map(date => {
    const key = dayKey(date);
    const count = list.filter(s => s.date === key).length;
    const label = formatDate(date,{weekday:'long',day:'numeric',month:'long'}) + (count ? ', ' + count + ' ' + tr('Séances') : '');
    return `<button type="button" class="planning-date ${key === current ? 'selected' : ''}" data-action="calendar-date" data-value="${key}" aria-pressed="${key === current}" ${key === today ? 'aria-current="date"' : ''} aria-label="${esc(label)}"><span>${date.getDate()}</span>${count ? `<small aria-hidden="true">${count}</small>` : ''}</button>`;
  }).join('')}</div><h3 class="planning-selected-day">${formatDate(calendarAnchor(),{weekday:'long',day:'numeric',month:'long'})}</h3>${list.filter(s => s.date === current).map(s => sessionRow(s)).join('') || '<p class="planning-empty">Aucune séance ce jour-là.</p>'}`;
}

function calendarScopeControls() {
  if (!['professeur','administration'].includes(state.role)) return `<span class="tag mint">${esc(classById(childClassId())?.name || 'Sans classe')}</span>`;
  const admin = state.role === 'administration';
  const teacher = activeTeacher();
  const tabs = admin ? planningTabs('Regrouper les séances','calendar-scope',
    [['class','Vue par classe'],['teacher','Vue par professeur']],state.planningScope) :
    `<span class="tag mint">${esc(subjectById(teacher?.subjectId)?.name || '')}</span>`;
  const filter = admin && state.planningScope === 'teacher' ? `<label for="calendarTeacher">Professeur</label><select id="calendarTeacher">${teacherChoices(state.planningTeacher,true)}</select>` : `<label for="calendarClass">Classe</label><select id="calendarClass">${libraryOptions([['all','Toutes les classes'],...publicationClasses().map(c => [c.id,c.name])],state.planningClass)}</select>`;
  return `${tabs}<div class="planning-filter">${filter}</div>`;
}

function planningTabs(label,action,items,selected,extraClass = '') {
  return `<div class="planning-tabs ${extraClass}" role="group" aria-label="${label}">${items.map(([value,text,count]) =>
    `<button type="button" class="tab ${selected === value ? 'active' : ''}" data-action="${action}" data-value="${value}" aria-pressed="${selected === value}">${text}${count === undefined ? '' : `<span class="admin-tab-count">${count}</span>`}</button>`
  ).join('')}</div>`;
}

function calendarPeriodToolbar(range) {
  return `<div class="planning-toolbar">
    <div class="planning-nav"><button class="icon-button" data-action="calendar-prev" aria-label="Période précédente">${icon('left')}</button><button class="btn soft small" data-action="calendar-today">Aujourd’hui</button><button class="icon-button" data-action="calendar-next" aria-label="Période suivante">${icon('right')}</button></div>
    <h2>${calendarPeriodLabel(range)}</h2>${planningTabs('Période du planning','calendar-view',[['week','Semaine'],['month','Mois']],state.calendarView)}
  </div>`;
}

function adminCalendarPage(scope,range,add) {
  const pending = sortSessions(scope.filter(planningNeedsAttention));
  const sessions = sortSessions(scope.filter(session => !planningNeedsAttention(session) && session.date >= range.start && session.date <= range.end));
  const controls = planningTabs('État des séances','admin-planning-state',
    [['scheduled','Séances programmées'],['queue','À reprogrammer',pending.length]],state.planningQueue ? 'queue' : 'scheduled','planning-section-tabs');
  const calendar = state.calendarView === 'month' ? calendarMonthGrid(sessions,range) : calendarWeekRows(sessions);
  return `${heading('Planning des séances','',add)}<section class="card planning-calendar admin-planning">
    ${controls}<div class="planning-scope">${calendarScopeControls()}</div>
    ${state.planningQueue ? pending.map(session => sessionRow(session,true)).join('') ||
      '<p class="planning-empty">Aucune séance à reprogrammer.</p>' : calendarPeriodToolbar(range) + calendar}
  </section>`;
}

function calendarPage() {
  const staff = ['professeur','administration'].includes(state.role);
  const range = calendarRange();
  const scope = calendarSessionScope(visibleSessions());
  const add = staff ? homeworkButton('Nouvelle séance','new-session','','primary','plus') : '';
  if (state.role === 'administration') return adminCalendarPage(scope,range,add);
  const sessions = sortSessions(scope.filter(s => s.date >= range.start && s.date <= range.end));
  const undated = staff ? scope.filter(s => !s.date) : [];
  const reminders = sortSessions(visibleSessions().filter(s => s.date && !s.needsReschedule && state.reminders.includes(s.id)));
  const title = state.role === 'professeur' ? 'Mes séances' : state.role === 'parent' ? 'Planning de mon enfant' : 'Calendrier';
  const subtitle = state.role === 'professeur' ? teacherLabel(activeTeacher()) : 'Séances de la classe';
  return `${heading(title,esc(subtitle),add)}<section class="card planning-calendar">
    <div class="planning-scope">${calendarScopeControls()}</div>${calendarPeriodToolbar(range)}
    ${state.calendarView === 'month' ? calendarMonthGrid(sessions,range) : calendarWeekRows(sessions)}
  </section>${undated.length ? `<section class="card planning-undated"><h2>Séances à dater</h2>${undated.map(s => sessionRow(s)).join('')}</section>` : ''}${homeworkCalendarPanel()}${reminders.length ? `<section class="card">${cardHeading('Mes rappels')}${reminders.map(s => sessionRow(s,true)).join('')}</section>` : ''}`;
}

function findVisibleSession(id) {
  return visibleSessions().find(s => s.id === id);
}

function sessionHasEnded(session,now) {
  const today = dayKey(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  return !planningNeedsAttention(session) && (session.date < today ||
    session.date === today && session.start + session.duration <= minute);
}

function pastDemoSessions() {
  const now = new Date();
  return sortSessions(visibleSessions().filter(session => sessionHasEnded(session,now))).reverse();
}

function catchupPage() {
  const parent = state.role === 'parent';
  const sessions = pastDemoSessions().sort((a,b) => Number(!!state.catchup[a.id]) - Number(!!state.catchup[b.id]));
  const list = sessions.map(session => `<div class="catchup-row">${sessionRow(session,true)}
    <span class="tag ${state.catchup[session.id] ? 'mint' : 'orange'}">${state.catchup[session.id] ? 'Rattrapée' : parent ? 'À revoir' : 'À rattraper'}</span></div>`).join('');
  return `${parent ? heading('Séances passées','Consultez les supports et les travaux liés aux séances passées.') :
    heading('À rattraper','Retrouve les séances passées, leurs supports et le travail associé.')}
    <section class="card planning-undated">${list || '<p class="planning-empty">Aucune séance passée pour le moment.</p>'}</section>`;
}

function completeDemoSession(id) {
  if (state.role !== 'eleve' || !pastDemoSessions().some(session => session.id === id)) return;
  if (state.catchup[id]) delete state.catchup[id];
  else state.catchup[id] = true;
  persist();
  closeModal();
  render();
  document.querySelector(`[data-action="select-event"][data-id="${CSS.escape(id)}"]`)?.focus();
}

function openSession(id) {
  const session = findVisibleSession(id);
  if (!session) { toast('Cette séance n’est pas disponible dans votre espace.'); return; }
  const resource = session.resourceId && libraryResource(session.resourceId);
  const date = session.date ? formatDate(homeworkDate(session.date),{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : tr('Choisir une date');
  const ended = ['eleve','parent'].includes(state.role) && sessionHasEnded(session,new Date());
  const join = session.link && !session.needsReschedule && !ended ? `<a class="btn primary" href="${esc(session.link)}" target="_blank" rel="noopener noreferrer">${icon('video','sm')}Rejoindre la séance</a>` : '';
  const edit = canEditSession(session) ? `${homeworkButton('Modifier la séance','edit-session',session.id,'primary','edit')}${homeworkButton('Dupliquer la séance','duplicate-session',session.id,'secondary','file')}${homeworkButton('Supprimer la séance','confirm-session-delete',session.id,'soft','trash')}` : '';
  const remind = !edit && session.date && !session.needsReschedule && !ended ? homeworkButton(state.reminders.includes(id) ? 'Retirer le rappel' : 'Ajouter un rappel','reminder',id,'secondary','bell') : '';
  const programme = session.description ? `<section class="planning-detail-block"><h4>Déroulé de la séance</h4><p class="planning-description" dir="auto" data-no-i18n="true">${esc(session.description)}</p></section>` : '';
  const support = resource ? `<section class="planning-detail-block"><h4>Support de la séance</h4><div class="planning-resource-summary">${libraryTextHTML(resource,'title','strong')}<span class="tag mint">${sessionResourceType(resource)}</span></div>${homeworkButton(resource.type === 'video' ? 'Voir la vidéo' : resource.attachment?.kind === 'pdf' ? 'Ouvrir le PDF' : 'Ouvrir la ressource associée','resource-open',resource.id,'secondary',resource.icon)}</section>` : '';
  const assignment = state.role === 'administration' ? sessionAssignments(teacherDirectory().find(teacher => teacher.id === session.teacherId),session.classId).find(item => item.id === session.assignmentId) : findHomework(session.assignmentId);
  const work = assignment ? `<section class="planning-detail-block"><h4>Devoir ou examen associé</h4><p dir="auto" data-no-i18n="true">${esc(homeworkText(assignment,'title'))}</p>
    ${state.role === 'administration' ? '' : homeworkButton('Voir le travail associé','assignment-open',assignment.id,'secondary','book')}</section>` : '';
  const catchup = state.role === 'eleve' && ended ?
    homeworkButton(state.catchup[id] ? 'Remettre à rattraper' : 'Marquer comme rattrapée','complete-session',id,'secondary','check') : '';
  openModal('Détails de la séance',`<div class="planning-detail"><div class="planning-session-meta"><span class="tag mint">${esc(sessionClass(session))}</span><span class="tag">${esc(sessionSubject(session))}</span>${session.needsReschedule ? '<span class="tag orange">Séance à confirmer</span>' : ''}</div>${sessionTitleHTML(session,'h3')}<p>${esc(sessionTeacher(session))}</p><p>${date} · <bdi dir="ltr">${sessionTime(session)}</bdi></p>${programme}${support}${work}${!session.link && !edit && !session.example && !ended ? '<p>Le lien de la séance sera communiqué par l’enseignant.</p>' : ''}<div class="homework-actions">${join}${remind}${catchup}${edit}</div></div>`);
}

function meeting(id) {
  const session = id ? findVisibleSession(id) : upcomingSessions()[0];
  if (session) openSession(session.id);
  else go('calendrier');
}

function sessionClassOptions(teacher, selected) {
  const list = classData.filter(c => teacher?.classIds.includes(c.id));
  return libraryOptions(list.map(c => [c.id,c.name]),selected);
}

const SESSION_SOURCE_OPTIONS = [['none','Aucune ressource'],['library','Bibliothèque'],['pdf','Joindre un PDF'],['video','Joindre une vidéo']];

function sessionLibraryResources(teacher, classId, board = homeworkBoard()) {
  return libraryResources(state.role,board).filter(resource => resource.classId === classId && resource.subjectId === teacher?.subjectId);
}

function sessionResourceType(resource) {
  return resource.attachment?.kind === 'pdf' ? 'Document PDF' : LIBRARY_FORMATS[resource.type] || 'Ressource';
}

function sessionResourceOptions(teacher, classId, selected = '') {
  const resources = sessionLibraryResources(teacher,classId);
  const placeholder = resources.length ? 'Choisir un support' : 'Aucun support disponible pour cette classe.';
  return libraryOptions([['',placeholder],...resources.map(r => [r.id,`${tr(sessionResourceType(r))} · ${libraryText(r,'title')}`])],selected);
}

function sessionRevision(session) {
  return session?.updatedAt || session?.publishedAt || '';
}

function sessionAssignments(teacher,classId,board = homeworkBoard()) {
  return board.assignments.filter(assignment => (state.examples || !assignment.example) &&
    assignment.classId === classId && teacherOwnsHomework(assignment,teacher));
}

function sessionAssignmentOptions(teacher,classId,selected) {
  return libraryOptions([['','Aucun travail associé'],...sessionAssignments(teacher,classId).map(assignment =>
    [assignment.id,homeworkText(assignment,'title')])],selected);
}

function newSession(id = '',duplicate = false) {
  if (!['professeur','administration'].includes(state.role)) return;
  const session = id ? scheduledSessions().find(s => s.id === id) : null;
  if (id && !canEditSession(session)) { toast('Cette séance n’est pas disponible dans votre espace.'); return; }
  const admin = state.role === 'administration';
  const teacher = admin ? teacherDirectory().find(t => t.id === (session?.teacherId || state.planningTeacher) &&
    (t.active || !duplicate && session?.teacherId === t.id)) || activeTeacher() : activeTeacher();
  if (!teacher?.classIds.length) { toast('Attribuez une classe à un professeur pour programmer une séance.'); return; }
  const classId = teacher.classIds.includes(session?.classId) ? session.classId : teacher.classIds.includes(state.planningClass) ? state.planningClass : teacher.classIds[0];
  const teacherField = admin ? `<div><label for="sessionTeacher">Professeur</label><select id="sessionTeacher" name="teacherId" required>${teacherChoices(teacher.id)}</select></div>` : '';
  const hasResource = sessionLibraryResources(teacher,classId).some(r => r.id === session?.resourceId);
  const date = duplicate ? dayKey(plusDays(homeworkDate(session?.date >= dayKey() ? session.date : dayKey()),1)) : session ? session.date : dayKey(calendarAnchor());
  openModal(duplicate ? 'Dupliquer la séance' : session ? 'Modifier la séance' : 'Programmer une séance',`<form id="sessionForm" class="form planning-form" data-id="${duplicate ? '' : esc(id)}" data-revision="${esc(sessionRevision(session))}">
    <div class="form-grid">${teacherField}<div><label>Matière</label><p id="sessionSubjectLabel">${esc(subjectById(teacher.subjectId).name)}</p></div>
    <div><label for="sessionClass">Classe</label><select id="sessionClass" name="classId" required>${sessionClassOptions(teacher,classId)}</select></div>
    <div class="full"><label for="sessionLesson">Leçon à étudier</label><input id="sessionLesson" name="lesson" dir="auto" value="${esc(session?.title || '')}" maxlength="100" required></div>
    <div class="full"><label for="sessionDescription">Déroulé de la séance</label><textarea id="sessionDescription" name="description" dir="auto" rows="3" maxlength="1200" placeholder="Ex. révision, exercice guidé, puis questions.">${esc(session?.description || '')}</textarea></div>
    <div><label for="sessionDate">Date de la séance</label><input id="sessionDate" name="date" type="date" value="${esc(date)}" required></div>
    <div><label for="sessionTime">Heure de début</label><input id="sessionTime" name="time" type="time" value="${timeLabel(session?.start ?? 600)}" required></div>
    <div><label for="sessionDuration">Durée en minutes</label><input id="sessionDuration" name="duration" type="number" min="1" max="1440" value="${session?.duration || 45}" required></div>
    <div class="full"><label for="sessionLink">Lien de la séance</label><input id="sessionLink" name="link" type="url" dir="ltr" value="${esc(session?.link || '')}" placeholder="https://" maxlength="500"></div></div>
    <fieldset class="planning-resource-fields"><legend>Support de la séance</legend>
      <div><label for="sessionSource">Type de support</label><select id="sessionSource" name="resourceSource">${libraryOptions(SESSION_SOURCE_OPTIONS,hasResource ? 'library' : 'none')}</select></div>
      <div id="sessionLibraryFields" ${hasResource ? '' : 'hidden'}><label for="sessionResource">Choisir un support</label><select id="sessionResource" name="resourceId" ${hasResource ? 'required' : 'disabled'}>${sessionResourceOptions(teacher,classId,session?.resourceId)}</select></div>
      <div id="sessionUploadFields" hidden><label for="sessionFile">Fichier à joindre</label><input id="sessionFile" name="sessionFile" type="file" disabled aria-describedby="sessionFileHint"><p id="sessionFileHint" class="tiny muted"></p><p class="tiny muted">Le fichier sera ajouté à la bibliothèque de la classe.</p></div>
      <div id="sessionPdfFields" hidden><label for="sessionPdfPages">Nombre de pages du PDF</label><input id="sessionPdfPages" name="pageCount" type="number" min="1" max="300" value="1" disabled></div>
    </fieldset>
    <div><label for="sessionAssignment">Devoir ou examen associé</label><select id="sessionAssignment" name="assignmentId">${sessionAssignmentOptions(teacher,classId,session?.assignmentId)}</select></div>
    <label class="homework-check"><input type="checkbox" name="needsReschedule" ${!duplicate && session?.needsReschedule && session.date ? 'checked' : ''}> À reprogrammer</label>
    <p id="sessionPublishStatus" class="planning-publish-status" role="status"></p>
    <div class="homework-actions">${homeworkButton('Annuler','close-modal','','soft')}${homeworkButton('Aperçu élève','preview-session','','secondary','eye')}<button class="btn primary" type="submit">${session && !duplicate ? 'Enregistrer' : 'Publier la séance'}</button></div><section id="sessionPreview" class="planning-detail-block" hidden tabindex="-1"></section></form>`,false,'planning-modal');
}

function updateSessionForm(input) {
  const form = input.form;
  if (form?.id === 'sessionForm') clearSessionPreview();
  if (form?.id !== 'sessionForm' || !['sessionTeacher','sessionClass','sessionSource'].includes(input.id)) return false;
  if (input.id === 'sessionSource') {
    const library = input.value === 'library', pdf = input.value === 'pdf', video = input.value === 'video';
    document.getElementById('sessionLibraryFields').hidden = !library;
    form.elements.resourceId.disabled = !library;
    form.elements.resourceId.required = library;
    document.getElementById('sessionUploadFields').hidden = !pdf && !video;
    const file = form.elements.sessionFile;
    file.value = '';
    file.disabled = !pdf && !video;
    file.required = pdf || video;
    file.accept = pdf ? '.pdf' : video ? '.mp4,.webm' : '';
    document.getElementById('sessionFileHint').textContent = tr(pdf ? 'Fichier PDF, 30 Mo maximum.' : video ? 'Vidéo MP4 ou WebM, 30 Mo maximum.' : '');
    document.getElementById('sessionPdfFields').hidden = !pdf;
    form.elements.pageCount.disabled = !pdf;
    form.elements.pageCount.required = pdf;
    return true;
  }
  const classInput = document.getElementById('sessionClass');
  const teacher = state.role === 'administration' ? teacherDirectory().find(t => t.id === document.getElementById('sessionTeacher').value) : activeTeacher();
  if (input.id === 'sessionTeacher') {
    classInput.innerHTML = localizeHTML(sessionClassOptions(teacher,classInput.value));
    document.getElementById('sessionSubjectLabel').textContent = tr(subjectById(teacher?.subjectId)?.name || '');
  }
  const resourceInput = form.elements.resourceId;
  resourceInput.innerHTML = localizeHTML(sessionResourceOptions(teacher,classInput.value,resourceInput.value));
  const work = form.elements.assignmentId;
  work.innerHTML = localizeHTML(sessionAssignmentOptions(teacher,classInput.value,work.value));
  return true;
}

let sessionPreviewUrl = '';
let sessionPreviewToken = 0;

function clearSessionPreview() {
  sessionPreviewToken++;
  const preview = document.getElementById('sessionPreview');
  if (preview) preview.hidden = true;
  if (sessionPreviewUrl) URL.revokeObjectURL(sessionPreviewUrl);
  sessionPreviewUrl = '';
}

async function previewSessionForm() {
  const form = document.getElementById('sessionForm');
  const preview = document.getElementById('sessionPreview');
  if (!form || !preview || form.dataset.busy || !form.reportValidity()) return;
  clearSessionPreview();
  const token = sessionPreviewToken;
  const values = Object.fromEntries(new FormData(form));
  const teacher = values.teacherId ? teacherDirectory().find(entry => entry.id === values.teacherId) : activeTeacher();
  const date = homeworkDate(values.date);
  const start = parseSessionTime(values.time);
  const duration = Number(values.duration);
  if (!teacher?.classIds.includes(values.classId) || !values.lesson.trim() || !date ||
      !Number.isInteger(start) || !Number.isInteger(duration) || duration < 1 || start + duration > 1440) {
    toast('Vérifiez le titre, la classe et l’horaire pour afficher l’aperçu.');
    return;
  }
  const resource = values.resourceSource === 'library' && sessionLibraryResources(teacher,values.classId).find(entry => entry.id === values.resourceId);
  const file = form.elements.sessionFile.files[0];
  const support = resource ? libraryText(resource,'title') : file?.name || '';
  let url = resource?.mediaUrl || '';
  const format = file && libraryFileKind(file,values.resourceSource);
  let blob = format ? new Blob([file],{type:format.mime}) : null;
  if (resource?.attachment) {
    try {
      const data = await homeworkFileOperation('readonly',files => files.get(resource.attachment.id));
      if (data) blob = new Blob([data],{type:resource.attachment.mime});
    } catch { /* L’intitulé reste visible dans l’aperçu. */ }
  }
  if (token !== sessionPreviewToken || !preview.isConnected) return;
  if (blob) url = sessionPreviewUrl = URL.createObjectURL(blob);
  const assignment = sessionAssignments(teacher,values.classId).find(entry => entry.id === values.assignmentId);
  preview.innerHTML = localizeHTML(`<h3>Aperçu élève</h3><strong dir="auto" data-no-i18n="true">${esc(values.lesson)}</strong>
    <p>${esc(classById(values.classId).name)} · ${esc(teacherLabel(teacher))}</p>
    <p>${formatDate(date,{weekday:'long',day:'numeric',month:'long'})} · <bdi dir="ltr">${sessionTime({start,duration})}</bdi></p>
    ${values.description ? `<h4>Déroulé de la séance</h4><p class="planning-description" dir="auto" data-no-i18n="true">${esc(values.description)}</p>` : ''}
    ${support ? `<h4>Support de la séance</h4>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" dir="auto" data-no-i18n="true">${esc(support)}</a>` : `<p dir="auto" data-no-i18n="true">${esc(support)}</p>`}` : ''}
    ${assignment ? `<h4>Devoir ou examen associé</h4><p dir="auto" data-no-i18n="true">${esc(homeworkText(assignment,'title'))}</p>` : ''}`);
  preview.hidden = false;
  preview.focus();
}

function sessionAttachmentResource(session, teacher, attachment, type, pageCount, language) {
  return {id:homeworkId('ressource'),uploaded:true,title:session.title,description:session.description.slice(0,350),
    subjectId:session.subjectId,subject:subjectById(session.subjectId).name,classId:session.classId,author:teacher.name,
    language,type,kind:LIBRARY_FORMATS[type],icon:type === 'video' ? 'video' : 'file',color:'mint',
    pages:[],body:'',pageCount,attachment,publishedAt:session.updatedAt};
}

async function saveSession(form, values) {
  const role = state.role;
  if (!['professeur','administration'].includes(role) || form.dataset.busy) return;
  const id = form.dataset.id || '';
  const previous = id && scheduledSessions().find(s => s.id === id);
  if (id && !canEditSession(previous)) { toast('Cette séance n’est pas disponible dans votre espace.'); return; }
  const revision = form.dataset.revision || '';
  if (id && sessionRevision(previous) !== revision) { toast('La séance a changé. Rouvrez-la pour continuer.'); return; }
  const teacher = role === 'administration' ? teacherDirectory().find(t => t.id === values.teacherId && (t.active || t.id === previous?.teacherId)) : activeTeacher();
  const start = parseSessionTime(values.time), duration = Number(values.duration);
  const title = String(values.lesson || '').trim().slice(0,100);
  const description = String(values.description || '').trim().slice(0,1200);
  if (!teacher?.classIds.includes(values.classId) || !homeworkDate(values.date) || !title || !Number.isInteger(start) || !Number.isInteger(duration) || duration < 1 || start + duration > 1440) {
    toast('Vérifiez la classe, la date et les horaires de la séance.'); return;
  }
  let link = '';
  if (values.link?.trim()) {
    try { const url = new URL(values.link.trim()); if (!['http:','https:'].includes(url.protocol)) throw new Error('Unsupported URL'); link = url.href; }
    catch { toast('Saisissez un lien de séance valide.'); return; }
  }
  const source = values.resourceSource || (values.resourceId ? 'library' : 'none');
  if (!SESSION_SOURCE_OPTIONS.some(([type]) => type === source)) return;
  const uploading = source === 'pdf' || source === 'video';
  const file = uploading ? form.elements.sessionFile.files[0] : null;
  const format = file && libraryFileKind(file,source);
  if (uploading && (!format || (source === 'pdf' && format.kind !== 'pdf'))) {
    toast(source === 'pdf' ? 'Choisissez un fichier PDF de 30 Mo maximum.' : 'Choisissez une vidéo MP4 ou WebM de 30 Mo maximum.');
    return;
  }
  const pageCount = source === 'pdf' ? Number(values.pageCount) : 1;
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 300) { toast('Indiquez un nombre de pages entre 1 et 300.'); return; }
  const language = state.lang;
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('#sessionPublishStatus');
  form.dataset.busy = 'true';
  submit.disabled = true;
  if (uploading) status.textContent = tr('Enregistrement du support…');
  let attachment;
  let saved = false;
  try {
    if (file) attachment = await storeLibraryAttachment(file,format);
    if (!form.isConnected || state.role !== role || (role === 'professeur' && activeTeacher()?.id !== teacher.id)) return;
    const currentTeacher = teacherDirectory().find(t => t.id === teacher.id && (t.active || t.id === previous?.teacherId));
    if (!currentTeacher?.classIds.includes(values.classId) || currentTeacher.subjectId !== teacher.subjectId) {
      toast('Vérifiez la classe, la date et les horaires de la séance.'); return;
    }
    const now = new Date().toISOString();
    const session = {id:id || homeworkId('seance'),title,description,subjectId:teacher.subjectId,teacherId:teacher.id,classId:values.classId,
      date:values.date,start,duration,link,assignmentId:values.assignmentId || '',needsReschedule:!!values.needsReschedule,resourceId:'',publishedAt:previous?.publishedAt || now,updatedAt:now};
    saved = saveHomework(board => {
      const sessions = scheduledSessions(board);
      const current = id && sessions.find(s => s.id === id);
      if (id && (!canEditSession(current) || sessionRevision(current) !== revision)) {
        toast('La séance a changé. Rouvrez-la pour continuer.'); return false;
      }
      if (session.assignmentId && !sessionAssignments(currentTeacher,values.classId,board).some(assignment => assignment.id === session.assignmentId)) {
        toast('Choisissez un travail de cette classe et de cette matière.');
        return false;
      }
      if (source === 'library') {
        const resource = sessionLibraryResources(currentTeacher,values.classId,board).find(r => r.id === values.resourceId);
        if (!resource) { toast('Choisissez un support de la matière et de la classe.'); return false; }
        session.resourceId = resource.id;
      }
      if (attachment) {
        const resource = sessionAttachmentResource(session,currentTeacher,attachment,source,pageCount,language);
        board.libraryResources = [resource,...(board.libraryResources || [])];
        session.resourceId = resource.id;
      }
      board.sessions = [...sessions.filter(s => s.id !== session.id),session];
      return true;
    });
  } catch {
    if (form.isConnected) toast('Impossible d’enregistrer ce fichier. Réessayez.');
  } finally {
    if (!saved) discardHomeworkFile(attachment?.id);
    delete form.dataset.busy;
    submit.disabled = false;
    status.textContent = '';
  }
  if (!saved) return;
  closeModal();
  state.calendarDate = values.date;
  state.planningQueue = !!values.needsReschedule;
  state.planningClass = 'all';
  state.planningTeacher = 'all';
  go('calendrier');
  toast(previous ? 'La séance a été mise à jour.' : 'La séance a été publiée.');
}

function confirmSessionDelete(id) {
  const session = scheduledSessions().find(s => s.id === id);
  if (!canEditSession(session)) return;
  openModal('Supprimer la séance',`${sessionTitleHTML(session,'h3')}<p>La séance sera retirée du calendrier de la classe.</p><div class="homework-actions">${homeworkButton('Annuler','select-event',id,'soft')}${homeworkButton('Supprimer la séance','delete-session',id,'danger','trash')}</div>`);
}

function deleteSession(id) {
  if (!saveHomework(board => {
    const sessions = scheduledSessions(board);
    if (!canEditSession(sessions.find(s => s.id === id))) return false;
    board.sessions = sessions.filter(s => s.id !== id);
    return true;
  })) return;
  state.reminders = state.reminders.filter(s => s !== id);
  delete state.catchup[id];
  persist();
  closeModal();
  render();
  toast('La séance a été supprimée.');
}

function toggleSessionReminder(id) {
  if (!findVisibleSession(id)) return;
  if (!state.notify) { toast('Active les rappels dans tes préférences pour en ajouter.'); return; }
  const active = state.reminders.includes(id);
  state.reminders = active ? state.reminders.filter(r => r !== id) : [...state.reminders,id];
  persist();
  openSession(id);
  toast(active ? 'Rappel retiré.' : 'Rappel ajouté à la maquette.');
}

function exampleSettings() {
  return `<div class="setting-row"><div><h3>Contenus d’exemple</h3><p>Afficher des séances, des devoirs et des ressources fictifs.</p></div><button type="button" class="btn secondary" data-action="toggle-examples" aria-pressed="${state.examples}">${state.examples ? 'Exemples activés' : 'Afficher les exemples'}</button></div>`;
}
