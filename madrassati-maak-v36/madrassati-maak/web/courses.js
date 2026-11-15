'use strict';

const COURSE_FORMATS = {replay:'Cours écrit',pdf:'Document PDF ou texte',video:'Vidéo',audio:'Audio'};
const COURSE_AR = {
  'Mes cours': 'دروسي', 'Ajouter un cours': 'إضافة درس', 'Publier le cours': 'نشر الدرس',
  'Le cours a été publié.': 'تم نشر الدرس.', 'Titre du cours': 'عنوان الدرس',
  'Texte du cours': 'نص الدرس', 'Saisissez le texte du cours.': 'أدخلوا نص الدرس.',
  'Cours écrit': 'درس مكتوب', 'Document PDF ou texte': 'مستند PDF أو نص',
  'Chapitre': 'الفصل', 'Ordre dans le chapitre': 'ترتيب الدرس في الفصل',
  'Cours publiés': 'الدروس المنشورة', 'Ressources de la matière': 'موارد المادة',
  'Ouvrir le cours': 'فتح الدرس', 'Aucun cours dans cette classe.': 'لا توجد دروس في هذا القسم.',
  'Aucune classe attribuée pour publier un cours.': 'لا يوجد قسم معيّن لنشر الدرس.',
  'PDF ou TXT. 30 Mo maximum.': 'PDF أو TXT. الحجم الأقصى 30 ميغابايت.',
  'MP4 ou WebM. 30 Mo maximum.': 'MP4 أو WebM. الحجم الأقصى 30 ميغابايت.',
  'MP3, M4A, OGG ou WAV. 30 Mo maximum.': 'MP3 أو M4A أو OGG أو WAV. الحجم الأقصى 30 ميغابايت.',
  'Ajoutez un fichier PDF ou texte pour ce format.': 'أضيفوا ملف PDF أو ملفًا نصيًا لهذه الصيغة.',
  'Vérifiez le titre, le chapitre et l’ordre du cours.': 'تحقّقوا من العنوان والفصل وترتيب الدرس.',
  'Retour à mon espace': 'العودة إلى فضائي', 'Choisir un profil': 'اختيار الملف الشخصي'
};
for (const [fr, ar] of Object.entries(COURSE_AR)) AR_LOOKUP.set(localeKey(fr), ar);

function isCourse(resource) {
  return !!resource.course || resource.type === 'replay';
}

function courseCount(count) {
  return state.lang === 'ar' ? `${count} ${count === 1 ? 'درس' : 'دروس'}` : `${count} cours`;
}

function courseFormat(resource) {
  return COURSE_FORMATS[resource.type] || LIBRARY_FORMATS[resource.type];
}

function courseSubjectCards(resources) {
  return `<div class="subject-squares">${subjects.map(subject => {
    const count = resources.filter(r => r.subjectId === subject.id && isCourse(r)).length;
    return `<a class="subject-square ${subject.color || 'blue'}" href="#eleve/courses/${subject.id}">${tile(subject.icon,subject.color)}<strong>${subject.name}</strong><small data-no-i18n="true">${courseCount(count)}</small>${icon('arrow','sm')}</a>`;
  }).join('')}</div>`;
}

function courseRow(resource, showClass = false) {
  const className = showClass ? classById(resource.classId)?.name : '';
  return `<button class="course-row" data-action="resource-open" data-id="${esc(resource.id)}">${tile(resource.icon,resource.color)}<span class="course-row-content">${libraryTextHTML(resource,'title','strong')}${resource.description ? libraryTextHTML(resource,'description','small') : ''}</span><span class="course-row-tags">${className ? `<span class="tag mint">${esc(className)}</span>` : ''}<span class="tag blue">${courseFormat(resource)}</span></span>${icon('right','sm')}</button>`;
}

function courseChapters(resources, showClass = false) {
  const collator = new Intl.Collator(state.lang,{numeric:true,sensitivity:'base'});
  const grouped = new Map();
  for (const resource of resources) {
    const chapter = resource.course?.chapter?.trim() || '';
    if (!grouped.has(chapter)) grouped.set(chapter,[]);
    grouped.get(chapter).push(resource);
  }
  return [...grouped].sort(([a],[b]) => collator.compare(a,b)).map(([chapter,items]) => {
    const ordered = items.sort((a,b) => (a.course?.position || 1) - (b.course?.position || 1) || collator.compare(a.title,b.title));
    const title = chapter ? `<bdi data-no-i18n="true">${esc(chapter)}</bdi>` : 'Cours publiés';
    return `<section class="card course-chapter"><div class="course-chapter-heading"><h2>${title}</h2><span data-no-i18n="true">${courseCount(items.length)}</span></div>${ordered.map(r => courseRow(r,showClass)).join('')}</section>`;
  }).join('');
}

function coursesPage() {
  if (state.role === 'professeur') return teacherCoursesPage();
  const subject = subjectById(state.subject);
  const resources = libraryResources();
  if (!subject) return `${heading('Mes matières',esc(childClassName()))}${courseSubjectCards(resources)}`;
  const matching = resources.filter(r => r.subjectId === subject.id);
  const courses = matching.filter(isCourse);
  const materials = matching.filter(r => !isCourse(r));
  const sessions = upcomingSessions().filter(s => s.subjectId === subject.id).slice(0,4);
  const back = `<a class="text-link course-back" href="#eleve/courses">${icon('left','sm')}Toutes les matières</a>`;
  return `${back}${heading(subject.name,esc(childClassName()))}${courses.length ? courseChapters(courses) : '<section class="card mb"><p class="roster-empty">Aucun cours publié pour le moment.</p></section>'}${materials.length ? `<section class="card course-chapter"><div class="course-chapter-heading"><h2>Ressources de la matière</h2></div>${materials.map(r => courseRow(r)).join('')}</section>` : ''}${sessions.length ? `<section class="card">${cardHeading('Prochaines séances','Mon calendrier','calendrier')}${sessions.map(s => sessionRow(s,true)).join('')}</section>` : ''}`;
}

function teacherCoursesPage() {
  const teacher = activeTeacher();
  const classes = publicationClasses();
  const selected = classes.some(c => c.id === state.courseClass) ? state.courseClass : 'all';
  const resources = teacher ? libraryResources().filter(r => r.uploaded && isCourse(r) && r.subjectId === teacher.subjectId && teacher.classIds.includes(r.classId) && (r.course?.teacherId ? r.course.teacherId === teacher.id : !r.author || r.author === teacher.name)) : [];
  const visible = selected === 'all' ? resources : resources.filter(r => r.classId === selected);
  const actions = `<div class="homework-actions">${teacherCoachLink()}${homeworkButton('Ajouter un cours','course-new','','primary','plus')}</div>`;
  return `${heading('Mes cours',esc(subjectById(teacher?.subjectId)?.name || ''),actions)}<div class="filter-field course-class-filter"><label for="courseClassFilter">Classe</label><select id="courseClassFilter">${libraryOptions([['all','Toutes les classes'],...classes.map(c => [c.id,c.name])],selected)}</select></div>${visible.length ? courseChapters(visible,true) : '<section class="card"><p class="roster-empty">Aucun cours dans cette classe.</p></section>'}`;
}

function openCourseSubject(id) {
  if (state.role !== 'eleve') return;
  const subject = subjectById(id);
  const hash = subject ? `#eleve/courses/${subject.id}` : '#eleve/courses';
  if (location.hash === hash) render();
  else location.hash = hash;
}

function courseEditorFields(chapter = '') {
  return `<div class="form-grid"><div><label for="courseChapter">Chapitre</label><input id="courseChapter" name="chapter" dir="auto" maxlength="80" required value="${esc(chapter)}"></div><div><label for="coursePosition">Ordre dans le chapitre</label><input id="coursePosition" name="position" type="number" min="1" max="999" step="1" value="1" required></div></div>`;
}

function courseFromForm(values, teacherId) {
  const chapter = String(values.chapter || '').trim().slice(0,80);
  const position = Number(values.position);
  if (!chapter || !Number.isInteger(position) || position < 1 || position > 999) return null;
  return {chapter,position,teacherId};
}
