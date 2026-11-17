'use strict';

const HOMEWORK_KEY = 'madrassati-maak-devoirs-v1';
const DEMO_CLASS = '6A';
const HOMEWORK_AR = {
  'Les fractions : additionner deux fractions': 'الكسور: جمع كسرين',
  'Calcule 1/2 + 1/4 et explique comment tu trouves un dénominateur commun. Puis calcule 2/3 + 1/6.': 'احسب 1/2 + 1/4 واشرح كيف تجد مقامًا مشتركًا. ثم احسب 2/3 + 1/6.',
  'Calcule 1/2 + 1/4 et écris le résultat.': 'احسب 1/2 + 1/4 واكتب النتيجة.',
  'Nouveau devoir': 'واجب جديد', 'Dupliquer le devoir': 'نسخ الواجب',
  'Publier un devoir': 'نشر واجب', 'Publier le devoir': 'نشر الواجب',
  'Nouvel examen': 'امتحان جديد', 'Examens': 'الامتحانات', 'Examen': 'امتحان', 'Devoir': 'واجب',
  'Type de publication': 'نوع المنشور', 'Dupliquer l’examen': 'نسخ الامتحان',
  'Ouvrir l’examen': 'فتح الامتحان', 'Reprendre l’examen': 'متابعة الامتحان',
  'Publier l’examen': 'نشر الامتحان', 'L’examen a été publié.': 'تم نشر الامتحان.',
  'Supprimer l’examen': 'حذف الامتحان', 'L’examen a été supprimé.': 'تم حذف الامتحان.',
  'Supprimer la publication': 'حذف المنشور', 'La publication a été supprimée.': 'تم حذف المنشور.',
  'La publication sera retirée de la liste des devoirs et du calendrier de la classe.': 'سيُزال المنشور من قائمة الواجبات وتقويم القسم.',
  'La copie, les fichiers remis, la correction et les demandes associés seront aussi supprimés.': 'ستُحذف أيضًا الإجابة والملفات المسلّمة والتصحيح والطلبات المرتبطة بالمنشور.',
  'Cette publication n’est plus disponible.': 'لم يعد هذا المنشور متاحًا.',
  'Aucun examen dans cette liste.': 'لا توجد امتحانات في هذه القائمة.',
  'Exemple de fractions': 'مثال عن الكسور', 'À corriger': 'للتصحيح',
  'Demandes de délai': 'طلبات المهلة', 'Tous les devoirs': 'جميع الواجبات',
  'À faire': 'للإنجاز', 'Brouillon': 'مسودة', 'Remis': 'تم التسليم',
  'Corrigé': 'تم التصحيح', 'Corrigés': 'واجبات مصحّحة',
  'Remis le': 'تم التسليم في', 'Corrigé le': 'تم التصحيح في',
  'Rendu de Yassine': 'واجب ياسين المسلّم', 'En attente de remise': 'في انتظار التسليم',
  'Aucun devoir dans cette liste.': 'لا توجد واجبات في هذه القائمة.',
  'Dépose ton travail ici et retrouve la correction sur la même fiche.': 'سلّم واجبك هنا واطّلع على التصحيح في البطاقة نفسها.',
  'Retrouvez les échéances et le suivi de chaque devoir.': 'اطّلعوا على المواعيد وحالة كل واجب.',
  'Publiez un devoir et retrouvez les copies à corriger.': 'انشروا واجبًا واطّلعوا على الأوراق التي تحتاج إلى تصحيح.',
  'Consigne': 'التعليمات', 'Consigne du devoir': 'تعليمات الواجب',
  'Titre du devoir': 'عنوان الواجب', 'Durée estimée': 'المدة التقريبية',
  'Durée en minutes': 'المدة بالدقائق', 'Date de remise': 'موعد التسليم',
  'Ajouter une version courte': 'إضافة نسخة مختصرة',
  'Consigne de la version courte': 'تعليمات النسخة المختصرة',
  'Durée de la version courte en minutes': 'مدة النسخة المختصرة بالدقائق',
  'Fiche associée': 'البطاقة المرافقة', 'Aucune fiche': 'دون بطاقة مرافقة',
  'Vérifiez le titre, la consigne, la date et la durée du devoir.': 'تحقّقوا من عنوان الواجب وتعليماته وموعده ومدته.',
  'La version courte doit durer au plus autant que le devoir complet.': 'يجب ألّا تتجاوز مدة النسخة المختصرة مدة الواجب الكامل.',
  'Le devoir a été publié.': 'تم نشر الواجب.', 'Devoir complet': 'الواجب الكامل',
  'L’essentiel': 'الأساسيات', 'Choisir la version du devoir': 'اختيار نسخة الواجب',
  'Ouvrir le devoir': 'فتح الواجب', 'Reprendre le devoir': 'متابعة الواجب',
  'Ouvrir la fiche associée': 'فتح البطاقة المرافقة', 'Ta réponse': 'إجابتك',
  'Écris ta réponse ou joins une photo.': 'اكتب إجابتك أو أرفق صورة.',
  'Joindre un fichier': 'إرفاق ملف', 'Retirer le fichier': 'إزالة الملف',
  'Photo, PDF ou document de 8 Mo maximum.': 'صورة أو ملف PDF أو مستند بحجم لا يتجاوز 8 ميغابايت.',
  'Le fichier doit être un document ou une image de 8 Mo maximum.': 'يجب أن يكون الملف مستندًا أو صورة بحجم لا يتجاوز 8 ميغابايت.',
  'Enregistrement du fichier…': 'جارٍ حفظ الملف…',
  'Impossible d’enregistrer le fichier sur cet appareil.': 'تعذّر حفظ الملف على هذا الجهاز.',
  'Ce fichier est indisponible sur cet appareil.': 'هذا الملف غير متاح على هذا الجهاز.',
  'Télécharger le fichier': 'تنزيل الملف', 'Enregistrer le brouillon': 'حفظ المسودة',
  'Brouillon enregistré sur cet appareil.': 'حُفظت المسودة على هذا الجهاز.',
  'L’enregistrement a échoué. Réessaie avant de fermer la fiche.': 'تعذّر الحفظ. أعد المحاولة قبل إغلاق البطاقة.',
  'Connexion coupée. Tu peux enregistrer ton brouillon.': 'انقطع الاتصال. يمكنك حفظ مسودتك.',
  'La remise sera possible dès que la connexion revient.': 'يمكنك التسليم عند عودة الاتصال.',
  'Remettre le devoir': 'تسليم الواجب',
  'Ajoute une réponse ou une pièce jointe avant de remettre le devoir.': 'أضف إجابة أو ملفًا مرفقًا قبل تسليم الواجب.',
  'Devoir remis.': 'تم تسليم الواجب.', 'Devoir reçu.': 'تم استلام الواجب.',
  'La correction apparaîtra sur cette fiche.': 'سيظهر التصحيح في هذه البطاقة.',
  'Voir la correction': 'عرض التصحيح', 'Correction de l’enseignant': 'تصحيح الأستاذ',
  'Retour à l’élève': 'ملاحظات للتلميذ', 'Publier la correction': 'نشر التصحيح',
  'La correction a été publiée.': 'تم نشر التصحيح.',
  'Ce devoir a déjà été remis.': 'تم تسليم هذا الواجب بالفعل.',
  'Demander un délai': 'طلب مهلة', 'Demande envoyée à l’enseignant.': 'أُرسل طلب المهلة إلى الأستاذ.',
  'Demande de délai en attente': 'طلب المهلة قيد المراجعة', 'Délai accordé': 'تم تمديد المهلة',
  'Délai initial maintenu': 'تم الإبقاء على الموعد الأصلي',
  'Demande de délai de Yassine': 'طلب مهلة من ياسين', 'Nouvelle date de remise': 'موعد التسليم الجديد',
  'Accorder le délai': 'الموافقة على المهلة', 'Garder la date actuelle': 'الإبقاء على الموعد الحالي',
  'Choisissez une date après l’échéance actuelle.': 'اختاروا موعدًا بعد تاريخ التسليم الحالي.',
  'Le calendrier affiche la nouvelle date.': 'يعرض التقويم الموعد الجديد.',
  'Voir dans le calendrier': 'عرض في التقويم', 'Échéances des devoirs': 'مواعيد تسليم الواجبات',
  'Aujourd’hui': 'اليوم', 'Environ': 'حوالي', 'Travail de la semaine': 'واجبات هذا الأسبوع',
  'Ton programme du jour est à jour.': 'أتممت برنامج اليوم.',
  'Cette semaine': 'هذا الأسبوع', 'Devoirs remis': 'الواجبات المسلّمة',
  'À venir': 'الواجبات القادمة', 'Aucun devoir remis cette semaine.': 'لم يُسلّم أي واجب هذا الأسبوع.',
  'Aucun devoir à rendre cette semaine.': 'لا يوجد واجب مطلوب هذا الأسبوع.',
  'Prochaine séance': 'الحصة القادمة', 'Écrire à l’enseignant': 'مراسلة الأستاذ',
  'Bonjour, au sujet du devoir': 'مرحبًا، بخصوص الواجب',
  'À traiter': 'مهام قيد المعالجة', 'Comptes à activer': 'حسابات تحتاج إلى تفعيل',
  'Dossiers à vérifier': 'ملفات تحتاج إلى مراجعة', 'Séances à modifier': 'حصص تحتاج إلى تعديل',
  'Activer le compte': 'تفعيل الحساب', 'Ouvrir le dossier': 'فتح الملف',
  'Aucun élément à traiter.': 'لا توجد مهام للمعالجة.',
  'Activation à confirmer': 'بانتظار تأكيد التفعيل', 'Le compte est activé.': 'تم تفعيل الحساب.',
  'À reprogrammer': 'تحتاج إلى إعادة البرمجة',
  'Fiches de la semaine': 'بطاقات الأسبوع',
  'Télécharger les fiches de la semaine': 'تنزيل بطاقات الأسبوع',
  'PDF à consulter hors ligne': 'ملف PDF للقراءة دون اتصال'
};
for (const [fr, ar] of Object.entries(HOMEWORK_AR)) AR_LOOKUP.set(localeKey(fr), ar);

let cachedHomework;
const homeworkUploads = new Set();

function dayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function homeworkDate(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return dayKey(date) === key ? date : null;
}

function plusDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


function homeworkWeek() {
  const today = new Date();
  const start = plusDays(today, -((today.getDay() + 6) % 7));
  return {start: dayKey(start), end: dayKey(plusDays(start, 6))};
}

function fractionAssignment() {
  const today = new Date();
  const daysUntilSunday = (7 - today.getDay()) % 7;
  return {
    id: 'fractions-demo', subject: 'maths', classId: DEMO_CLASS, example: true,
    title: 'Les fractions : additionner deux fractions',
    instructions: 'Calcule 1/2 + 1/4 et explique comment tu trouves un dénominateur commun. Puis calcule 2/3 + 1/6.',
    shortInstructions: 'Calcule 1/2 + 1/4 et écris le résultat.',
    duration: 10, shortDuration: 5, resourceId: 'r4',
    dueDate: dayKey(plusDays(today, Math.min(2, daysUntilSunday)))
  };
}

function initialHomeworkBoard() {
  const assignments = legacyAssignments.map((a, index) => ({
    id: String(a.id), subject: a.subject, classId: DEMO_CLASS, example: true,
    title: a.title, instructions: a.description, duration: parseInt(a.duration, 10),
    dueDate: `2025-05-${22 + index}`, resourceId: ['r1', 'r3', 'r5'][index]
  }));
  const submissions = {};
  for (const assignment of assignments) {
    const legacy = state.submitted[assignment.id];
    if (legacy) submissions[assignment.id] = {
      status: 'submitted', variant: 'full', answer: '', submittedAt: legacy.at,
      legacyFileName: typeof legacy.name === 'string' ? legacy.name : ''
    };
  }
  return {version: 1, assignments: [fractionAssignment(), ...assignments], submissions, extensions: {}};
}

function readHomeworkBoard() {
  try {
    const data = JSON.parse(localStorage.getItem(HOMEWORK_KEY));
    if (data?.version === 1 && Array.isArray(data.assignments) && data.submissions && data.extensions) return data;
  } catch { /* L’interface garde les données déjà chargées. */ }
  return null;
}

function homeworkBoard() {
  if (!cachedHomework) {
    cachedHomework = readHomeworkBoard();
    if (cachedHomework) return cachedHomework;
    cachedHomework = initialHomeworkBoard();
    try {
      localStorage.setItem(HOMEWORK_KEY, JSON.stringify(cachedHomework));
    } catch { /* Les écritures signalent l’erreur quand l’utilisateur enregistre. */ }
  }
  return cachedHomework;
}

function saveHomework(change, showError = true) {
  const data = readHomeworkBoard() || JSON.parse(JSON.stringify(homeworkBoard()));
  if (!change(data)) return false;
  try {
    localStorage.setItem(HOMEWORK_KEY, JSON.stringify(data));
    cachedHomework = data;
    return true;
  } catch {
    if (showError) toast('L’enregistrement a échoué. Réessaie avant de fermer la fiche.');
    return false;
  }
}

function homeworkDue(assignment, board = homeworkBoard()) {
  const extension = board.extensions[assignment.id];
  return extension?.status === 'approved' ? extension.dueDate : assignment.dueDate;
}

function homeworkStatus(id, board = homeworkBoard()) {
  return board.submissions[id]?.status || 'todo';
}

function homeworkCanEdit(id, board = homeworkBoard()) {
  return ['todo', 'draft'].includes(homeworkStatus(id, board)) && board.assignments.some(a => a.id === id);
}

function teacherOwnsHomework(assignment, teacher) {
  return !!assignment && !!teacher && assignment.subject === teacher.subjectId && (assignment.teacherId || legacyTeacherId(assignment.subject)) === teacher.id;
}

function homeworkList(role = state.role) {
  const board = homeworkBoard();
  const list = board.assignments.filter(a => state.examples || !a.example);
  if (role === 'professeur') {
    const teacher = activeTeacher();
    return list.filter(a => teacherOwnsHomework(a,teacher));
  }
  if (role !== 'eleve' && role !== 'parent') return [];
  const today = dayKey();
  return list.filter(a => a.classId === childClassId()).sort((a, b) => {
    const first = homeworkDue(a, board);
    const second = homeworkDue(b, board);
    return Number(first < today) - Number(second < today) || first.localeCompare(second);
  });
}

function findHomework(id) {
  return homeworkList().find(a => a.id === String(id));
}

function homeworkText(assignment, field) {
  const value = assignment[field] || '';
  return assignment.example ? tr(value) : value;
}

function homeworkTitle(assignment) {
  return `<bdi data-no-i18n="true">${esc(homeworkText(assignment, 'title'))}</bdi>`;
}

function homeworkWhen(key) {
  const date = homeworkDate(key);
  return date ? `<time datetime="${esc(key)}">${formatDate(date, {weekday: 'short', day: 'numeric', month: 'short'})}</time>` : '';
}

function homeworkTimestamp(value, label) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.valueOf())) return '';
  const stamp = date.toLocaleString(state.lang === 'ar' ? 'ar-MA-u-nu-latn' : 'fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  return `<p class="homework-time"><span>${label}</span> <time datetime="${esc(value)}">${stamp}</time></p>`;
}

function homeworkPill(status) {
  const labels = {todo: 'À faire', draft: 'Brouillon', submitted: 'Remis', corrected: 'Corrigé'};
  return `<span class="homework-status ${status}">${labels[status]}</span>`;
}

function homeworkButton(label, action, id = '', style = 'secondary', symbol = '') {
  const data = id ? ` data-id="${esc(id)}"` : '';
  return `<button type="button" class="btn ${style}" data-action="${action}"${data}>${symbol ? icon(symbol, 'sm') : ''}<span>${label}</span></button>`;
}

function homeworkCard(assignment) {
  const subject = subjects.find(s => s.id === assignment.subject);
  const className = classData.find(c => c.id === assignment.classId)?.name;
  const exam = assignment.kind === 'exam';
  const status = homeworkStatus(assignment.id);
  const extension = homeworkBoard().extensions[assignment.id];
  const label = state.role === 'professeur' && status === 'submitted' ? 'À corriger'
    : status === 'corrected' ? 'Voir la correction'
    : state.role === 'eleve' && status === 'draft' ? (exam ? 'Reprendre l’examen' : 'Reprendre le devoir') : (exam ? 'Ouvrir l’examen' : 'Ouvrir le devoir');
  const duplicate = state.role === 'professeur' ? homeworkButton(exam ? 'Dupliquer l’examen' : 'Dupliquer le devoir', 'homework-duplicate', assignment.id, 'soft small') : '';
  const pending = extension?.status === 'pending' ? '<span class="homework-status draft">Demande de délai en attente</span>' : '';
  return `<article class="card homework-card">
    ${tile(subject?.icon || 'clipboard', subject?.color || '')}
    <div class="homework-card-main">
      <div class="homework-meta">${exam ? '<span class="tag mint">Examen</span>' : ''}<span>${subject?.name || ''}</span><span>${className || ''}</span></div>
      <h2>${homeworkTitle(assignment)}</h2>
      <div class="homework-meta">${homeworkWhen(homeworkDue(assignment))}<span>${assignment.duration} min</span></div>
      <div class="homework-card-status">${homeworkPill(status)}${pending}</div>
      <div class="homework-actions">${homeworkButton(label, 'assignment-open', assignment.id, status === 'submitted' && state.role === 'professeur' ? 'primary small' : 'secondary small')}${duplicate}</div>
    </div>
  </article>`;
}

function renderHomeworkPage() {
  const teacher = state.role === 'professeur';
  const parent = state.role === 'parent';
  const title = teacher ? 'Devoirs de mes classes' : parent ? 'Devoirs de mon enfant' : 'Mes devoirs';
  const description = teacher ? 'Publiez un devoir et retrouvez les copies à corriger.'
    : parent ? 'Retrouvez les échéances et le suivi de chaque devoir.' : 'Dépose ton travail ici et retrouve la correction sur la même fiche.';
  const tabs = teacher ? [['all','Tous les devoirs'], ['exams','Examens'], ['correction','À corriger'], ['extensions','Demandes de délai'], ['help','Demandes d’aide']]
    : [['all','Tous les devoirs'], ['todo','À faire'], ['submitted','Remis'], ['corrected','Corrigés']];
  const all = homeworkList();
  const filters = {
    exams: a => a.kind === 'exam',
    todo: a => homeworkCanEdit(a.id),
    submitted: a => homeworkStatus(a.id) === 'submitted',
    corrected: a => homeworkStatus(a.id) === 'corrected',
    correction: a => homeworkStatus(a.id) === 'submitted',
    extensions: a => homeworkBoard().extensions[a.id]?.status === 'pending',
    help: a => homeworkBoard().helpRequests?.[a.id]?.status === 'pending'
  };
  const selected = tabs.some(([key]) => key === state.assignmentFilter) ? state.assignmentFilter : 'all';
  const current = filters[selected] ? all.filter(filters[selected]) : all;
  const create = teacher ? homeworkButton('Nouveau devoir', 'teacher-assignment', '', 'primary', 'plus') : '';
  const example = teacher && state.examples && activeTeacher()?.subjectId === 'maths' ? homeworkButton('Exemple de fractions', 'homework-example', '', 'secondary', 'calculator') : '';
  return `${heading(title, description, teacher ? `<div class="homework-actions">${teacherCoachLink()}${example}${create}</div>` : '')}
    <div class="tabs homework-tabs" aria-label="${tr(title)}">${tabs.map(([key, label]) => {
      const count = filters[key] ? all.filter(filters[key]).length : all.length;
      return `<button class="tab ${key === selected ? 'active' : ''}" aria-pressed="${key === selected}" data-action="assignment-filter" data-value="${key}">${label} <span>${count}</span></button>`;
    }).join('')}</div>
    <div class="homework-cards">${current.map(homeworkCard).join('') || `<p class="card homework-empty-text">${selected === 'exams' ? 'Aucun examen dans cette liste.' : 'Aucun devoir dans cette liste.'}</p>`}</div>`;
}

const HOMEWORK_INSTRUCTIONS_MAX = 12000;

function openHomeworkEditor(source = null, title = source ? (source.kind === 'exam' ? 'Dupliquer l’examen' : 'Dupliquer le devoir') : 'Nouveau devoir') {
  if (state.role !== 'professeur') return;
  const teacher = activeTeacher();
  if (!teacher) return;
  const draft = source || {classId: teacher.classIds[0], subject: teacher.subjectId, dueDate: dayKey(plusDays(new Date(), 2)), duration: 10};
  const kind = draft.kind === 'exam' ? 'exam' : 'homework';
  const options = (items, selected) => items.map(([value, label]) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`).join('');
  openModal(title, `<form id="homeworkEditorForm" class="form homework-form">
    <div class="form-grid">
      <div><label for="homeworkTitle">Titre</label><input id="homeworkTitle" name="title" dir="auto" maxlength="100" required value="${esc(source ? homeworkText(source, 'title') : '')}"></div>
      <div><label for="homeworkKind">Type de publication</label><select id="homeworkKind" name="kind">${options([['homework','Devoir'],['exam','Examen']],kind)}</select></div>
      <div><label for="homeworkSubject">Matière</label><select id="homeworkSubject" name="subject">${options(publicationSubjects().map(s => [s.id, s.name]), draft.subject)}</select></div>
      <div><label for="homeworkClass">Classe</label><select id="homeworkClass" name="classId">${options(publicationClasses().map(c => [c.id, c.name]), draft.classId)}</select></div>
      <div><label for="homeworkDueDate">Date de remise</label><input id="homeworkDueDate" name="dueDate" type="date" required value="${esc(draft.dueDate)}"></div>
      <div><label for="homeworkDuration">Durée en minutes</label><input id="homeworkDuration" name="duration" type="number" min="1" max="180" required value="${draft.duration}"></div>
      <div class="full"><label for="homeworkInstructions">Consigne</label><textarea id="homeworkInstructions" name="instructions" dir="auto" rows="6" maxlength="${HOMEWORK_INSTRUCTIONS_MAX}" required>${esc(source ? homeworkText(source, 'instructions') : '')}</textarea></div>
      <div class="full"><label for="homeworkResource">Ressource associée</label><select id="homeworkResource" name="resourceId">${libraryHomeworkResourceOptions(draft.classId,draft.resourceId)}</select></div>
    </div>
    <details class="homework-short-editor" ${draft.shortInstructions ? 'open' : ''}>
      <summary>Ajouter une version courte</summary>
      <label for="homeworkShortInstructions">Consigne de la version courte</label><textarea id="homeworkShortInstructions" name="shortInstructions" dir="auto" rows="3" maxlength="1400">${esc(source ? homeworkText(source, 'shortInstructions') : '')}</textarea>
      <label for="homeworkShortDuration">Durée de la version courte en minutes</label><input id="homeworkShortDuration" name="shortDuration" type="number" min="1" max="180" value="${draft.shortDuration || 5}">
    </details>${coachEditorFields(source)}
    <div class="homework-actions">${homeworkButton('Annuler', 'close-modal', '', 'soft')}<button type="submit" class="btn primary">${icon('check', 'sm')}<span id="homeworkPublishLabel">${kind === 'exam' ? 'Publier l’examen' : 'Publier le devoir'}</span></button></div>
  </form>`, false, 'homework-modal');
}

function publishHomework(values) {
  if (state.role !== 'professeur') return;
  const kind = values.kind === 'exam' ? 'exam' : 'homework';
  const title = String(values.title || '').trim().slice(0, 100);
  const instructions = String(values.instructions || '').trim().slice(0, HOMEWORK_INSTRUCTIONS_MAX);
  const shortInstructions = String(values.shortInstructions || '').trim().slice(0, 1400);
  const duration = Number(values.duration);
  const shortDuration = Number(values.shortDuration);
  if (!title || !instructions || !homeworkDate(values.dueDate) || !teacherCanPublish(values.subject, values.classId) || !Number.isInteger(duration) || duration < 1 || duration > 180) {
    toast('Vérifiez le titre, la consigne, la date et la durée du devoir.');
    return;
  }
  if (shortInstructions && (!Number.isInteger(shortDuration) || shortDuration < 1 || shortDuration > duration)) {
    toast('La version courte doit durer au plus autant que le devoir complet.');
    return;
  }
  const coach = coachExerciseFromForm(values);
  if (coach === false) { toast('Ajoutez l’énoncé et la réponse attendue pour publier l’exercice du coach.'); return; }
  const assignment = {
    id: homeworkId(kind === 'exam' ? 'examen' : 'devoir'), kind, title, instructions, duration, shortInstructions,
    shortDuration: shortInstructions ? shortDuration : null,
    classId: values.classId, subject: values.subject, teacherId: activeTeacher().id, dueDate: values.dueDate, coach,
    resourceId: libraryResources().some(r => r.id === values.resourceId && r.classId === values.classId) ? values.resourceId : '', publishedAt: new Date().toISOString()
  };
  if (!saveHomework(board => { board.assignments.unshift(assignment); return true; })) return;
  closeModal();
  state.assignmentFilter = kind === 'exam' ? 'exams' : 'all';
  go('devoirs');
  toast(kind === 'exam' ? 'L’examen a été publié.' : 'Le devoir a été publié.');
}

function homeworkId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function homeworkVariant(assignment, submission) {
  if (!assignment.shortInstructions) return 'full';
  return submission?.variant || (state.fatigue ? 'short' : 'full');
}

function homeworkOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

function homeworkInstructions(assignment, variant) {
  const field = variant === 'short' ? 'shortInstructions' : 'instructions';
  const text = homeworkText(assignment, field);
  const instructions = state.lang === 'ar' ? isolateMath(text) : text;
  const example = assignment.id === '1' ? `<ol><li>Résous : 3x + 5 = 20.</li><li>Résous : 2x − 7 = 9.</li><li>Vérifie tes réponses en remplaçant x.</li></ol>` : '';
  return `<section class="homework-instructions"><h3>Consigne</h3><p dir="auto" data-no-i18n="true">${esc(instructions)}</p>${example}</section>`;
}

function homeworkResponseForm(assignment, submission, variant) {
  const versions = assignment.shortInstructions ? `<fieldset class="homework-versions"><legend>Choisir la version du devoir</legend>
    <label><input type="radio" name="homeworkVariant" value="full" ${variant === 'full' ? 'checked' : ''}><span>Devoir complet</span><small>${assignment.duration} min</small></label>
    <label><input type="radio" name="homeworkVariant" value="short" ${variant === 'short' ? 'checked' : ''}><span>L’essentiel</span><small>${assignment.shortDuration} min</small></label>
  </fieldset>` : '<input type="hidden" name="homeworkVariant" value="full">';
  const attachment = submission?.attachment;
  const file = attachment ? `<div class="homework-attachment"><bdi>${esc(attachment.name)}</bdi>${homeworkButton('Retirer le fichier', 'homework-remove-file', assignment.id, 'soft small')}</div>` : '';
  return `<form id="homeworkResponseForm" class="form homework-form" data-id="${esc(assignment.id)}">
    ${versions}${homeworkInstructions(assignment, variant)}
    <label for="homeworkResponse">Ta réponse</label><textarea id="homeworkResponse" name="answer" dir="auto" rows="4" maxlength="3500" placeholder="Écris ta réponse ou joins une photo.">${esc(submission?.answer || '')}</textarea>
    <div class="homework-file-field"><label for="assignmentFile">Joindre un fichier</label><input id="assignmentFile" type="file" data-id="${esc(assignment.id)}" accept="image/*,.pdf,.txt,.doc,.docx"><p>Photo, PDF ou document de 8 Mo maximum.</p>${file}</div>
    <p id="homeworkDraftHint" class="homework-time" role="status">${submission ? 'Brouillon enregistré sur cet appareil.' : ''}</p>
    <p id="homeworkConnection" class="homework-connection" role="status" ${homeworkOnline() ? 'hidden' : ''}><span>Connexion coupée. Tu peux enregistrer ton brouillon.</span> <span>La remise sera possible dès que la connexion revient.</span></p>
    <div class="homework-actions">${homeworkButton('Enregistrer le brouillon', 'homework-save-draft', assignment.id)}<button id="homeworkSubmit" type="submit" class="btn primary" ${homeworkOnline() && !homeworkUploads.has(assignment.id) ? '' : 'disabled'}>${icon('check','sm')}Remettre le devoir</button></div>
  </form>`;
}

function homeworkReview(assignment, submission) {
  if (submission?.status === 'corrected') {
    return `<section class="homework-feedback"><h3>Correction de l’enseignant</h3><p dir="auto" data-no-i18n="true">${esc(submission.feedback)}</p>${homeworkTimestamp(submission.correctedAt, 'Corrigé le')}</section>`;
  }
  if (submission?.status !== 'submitted') return '';
  if (state.role !== 'professeur') return '<p class="homework-time">La correction apparaîtra sur cette fiche.</p>';
  return `<form id="homeworkReviewForm" class="form homework-form" data-id="${esc(assignment.id)}">
    <label for="homeworkFeedback">Retour à l’élève</label><textarea id="homeworkFeedback" name="feedback" dir="auto" rows="3" maxlength="1500" required></textarea>
    <div class="homework-actions"><button class="btn primary" type="submit">Publier la correction</button></div>
  </form>`;
}

function homeworkExtensionPanel(assignment, extension) {
  if (extension?.status === 'approved') return '<p class="homework-extension"><strong>Délai accordé</strong> <span>Le calendrier affiche la nouvelle date.</span></p>';
  if (extension?.status === 'declined') return '<p class="homework-extension">Délai initial maintenu</p>';
  if (extension?.status === 'pending' && state.role === 'professeur') {
    const minimum = dayKey(plusDays(homeworkDate(homeworkDue(assignment)), 1));
    const date = minimum > dayKey() ? minimum : dayKey();
    return `<form id="homeworkExtensionForm" class="form homework-extension" data-id="${esc(assignment.id)}">
      <h3>Demande de délai de Yassine</h3><label for="homeworkExtensionDate">Nouvelle date de remise</label>
      <input id="homeworkExtensionDate" name="dueDate" type="date" min="${date}" value="${date}" required>
      <div class="homework-actions">${homeworkButton('Garder la date actuelle', 'homework-decline', assignment.id, 'secondary')}<button class="btn primary" type="submit">Accorder le délai</button></div>
    </form>`;
  }
  if (extension?.status === 'pending') return '<p class="homework-extension">Demande de délai en attente</p>';
  if (state.role === 'eleve' && homeworkCanEdit(assignment.id)) return homeworkButton('Demander un délai', 'homework-request', assignment.id, 'secondary small', 'clock');
  return '';
}

function openHomework(id) {
  const assignment = findHomework(id);
  if (!assignment) return;
  const board = homeworkBoard();
  const submission = board.submissions[assignment.id];
  const status = homeworkStatus(assignment.id, board);
  const variant = homeworkVariant(assignment, submission);
  const editing = state.role === 'eleve' && homeworkCanEdit(assignment.id, board);
  const showAnswer = ['eleve', 'professeur'].includes(state.role) && ['submitted', 'corrected'].includes(status);
  const attachment = submission?.attachment;
  const file = attachment && showAnswer ? homeworkButton('Télécharger le fichier', 'homework-download-file', assignment.id, 'secondary small', 'download') : '';
  const legacy = showAnswer && submission?.legacyFileName ? `<p class="homework-time"><bdi>${esc(submission.legacyFileName)}</bdi></p>` : '';
  const response = showAnswer ? `<section class="homework-feedback"><h3>Rendu de Yassine</h3>${submission.answer ? `<p dir="auto" data-no-i18n="true">${esc(submission.answer)}</p>` : ''}${file}${legacy}</section>` : '';
  const pending = state.role === 'professeur' && homeworkCanEdit(assignment.id) ? '<p class="homework-time">En attente de remise</p>' : '';
  const parentMessage = state.role === 'parent' ? homeworkButton('Écrire à l’enseignant', 'homework-message', assignment.id, 'secondary', 'mail') : '';
  const resource = assignment.resourceId ? homeworkButton('Ouvrir la ressource associée', 'resource-open', assignment.resourceId, 'soft small', 'book') : '';
  const exam = assignment.kind === 'exam';
  const remove = canDeleteHomework(assignment) ? homeworkButton(homeworkDeleteLabel(assignment), 'homework-confirm-delete', assignment.id, 'soft small', 'trash') : '';
  openModal(homeworkTitle(assignment), `<div class="homework-details" data-homework-id="${esc(assignment.id)}">
    <div class="homework-detail-top"><div class="homework-meta">${exam ? '<span class="tag mint">Examen</span>' : ''}${homeworkPill(status)}<span>Date de remise</span>${homeworkWhen(homeworkDue(assignment))}</div>${remove}</div>
    ${homeworkTimestamp(submission?.submittedAt, 'Remis le')}${pending}
    ${editing ? homeworkResponseForm(assignment, submission, variant) : homeworkInstructions(assignment, submission ? variant : 'full')}
    ${response}${homeworkReview(assignment, submission)}${homeworkExtensionPanel(assignment, board.extensions[assignment.id])}${homeworkHelpPanel(assignment)}
    <div class="homework-actions">${resource}${homeworkButton('Voir dans le calendrier', 'homework-calendar', assignment.id, 'soft small', 'calendar')}${parentMessage}</div>
  </div>`, false, 'homework-modal');
}

function canDeleteHomework(assignment) {
  return state.role === 'professeur' && !!assignment && !assignment.example
    && (assignment.kind === 'exam' || assignment.kind == null) && teacherOwnsHomework(assignment,activeTeacher());
}

function homeworkDeleteLabel(assignment) {
  return assignment.kind === 'exam' ? 'Supprimer l’examen' : 'Supprimer la publication';
}

function confirmHomeworkDelete(id) {
  const assignment = findHomework(id);
  if (!canDeleteHomework(assignment)) return;
  const label = homeworkDeleteLabel(assignment);
  openModal(label, `<div class="homework-details" data-homework-id="${esc(id)}">
    <h3>${homeworkTitle(assignment)}</h3>
    <p>La publication sera retirée de la liste des devoirs et du calendrier de la classe.</p>
    <p>La copie, les fichiers remis, la correction et les demandes associés seront aussi supprimés.</p>
    <div class="homework-actions">${homeworkButton('Annuler','assignment-open',id,'soft')}${homeworkButton(label,'homework-delete',id,'danger','trash')}</div>
  </div>`);
}

function deleteHomework(id) {
  let deleted, attachmentId;
  const saved = saveHomework(board => {
    const assignment = board.assignments.find(a => a.id === id);
    if (!canDeleteHomework(assignment)) return false;
    deleted = assignment;
    attachmentId = board.submissions[id]?.attachment?.id;
    board.assignments = board.assignments.filter(a => a.id !== id);
    delete board.submissions[id];
    delete board.extensions[id];
    delete board.helpRequests?.[id];
    return true;
  });
  if (!saved) return;
  discardHomeworkFile(attachmentId);
  delete state.coachThreads?.[id];
  if (state.coachExerciseId === id) state.coachExerciseId = '';
  closeModal();
  render();
  document.getElementById('main')?.focus({preventScroll:true});
  toast(deleted.kind === 'exam' ? 'L’examen a été supprimé.' : 'La publication a été supprimée.');
}

function refreshHomework(id, message = '') {
  render();
  openHomework(id);
  previousFocus = document.getElementById('main') || previousFocus;
  if (message) toast(message);
}

function saveHomeworkDraft(form, announce = false) {
  const assignment = form && findHomework(form.dataset.id);
  if (state.role !== 'eleve' || !assignment) return false;
  const values = new FormData(form);
  const answer = String(values.get('answer') || '').slice(0, 3500);
  const variant = assignment.shortInstructions && values.get('homeworkVariant') === 'short' ? 'short' : 'full';
  const saved = saveHomework(board => {
    if (!homeworkCanEdit(assignment.id, board)) return false;
    board.submissions[assignment.id] = {...board.submissions[assignment.id], status: 'draft', answer, variant};
    return true;
  }, announce);
  const hint = document.getElementById('homeworkDraftHint');
  if (hint) hint.textContent = tr(saved ? 'Brouillon enregistré sur cet appareil.' : 'L’enregistrement a échoué. Réessaie avant de fermer la fiche.');
  if (saved && announce) toast('Brouillon enregistré sur cet appareil.');
  return saved;
}

function submitHomework(form, values) {
  const assignment = findHomework(form.dataset.id);
  if (state.role !== 'eleve' || !assignment || homeworkUploads.has(assignment.id)) return;
  if (!homeworkOnline()) { saveHomeworkDraft(form, true); syncHomeworkConnection(); return; }
  const answer = String(values.answer || '').trim().slice(0, 3500);
  const variant = assignment.shortInstructions && values.homeworkVariant === 'short' ? 'short' : 'full';
  const saved = saveHomework(board => {
    if (!homeworkCanEdit(assignment.id, board)) { toast('Ce devoir a déjà été remis.'); return false; }
    const submission = board.submissions[assignment.id];
    if (!answer && !submission?.attachment) { toast('Ajoute une réponse ou une pièce jointe avant de remettre le devoir.'); return false; }
    board.submissions[assignment.id] = {...submission, status: 'submitted', answer, variant, submittedAt: new Date().toISOString()};
    if (board.extensions[assignment.id]?.status === 'pending') delete board.extensions[assignment.id];
    return true;
  });
  if (saved) refreshHomework(assignment.id, 'Devoir remis.');
}

function correctHomework(id, feedback) {
  if (state.role !== 'professeur' || !findHomework(id) || !feedback) return;
  const saved = saveHomework(board => {
    const submission = board.submissions[id];
    if (submission?.status !== 'submitted') return false;
    board.submissions[id] = {...submission, status: 'corrected', feedback, correctedAt: new Date().toISOString()};
    return true;
  });
  if (saved) refreshHomework(id, 'La correction a été publiée.');
}

function requestHomeworkExtension(id) {
  if (state.role !== 'eleve' || !findHomework(id)) return;
  const form = document.getElementById('homeworkResponseForm');
  if (form?.dataset.id === id && form.elements.answer.value.trim() && !saveHomeworkDraft(form)) return;
  const saved = saveHomework(board => {
    if (!homeworkCanEdit(id, board) || board.extensions[id]) return false;
    board.extensions[id] = {status: 'pending', requestedAt: new Date().toISOString()};
    return true;
  });
  if (saved) refreshHomework(id, 'Demande envoyée à l’enseignant.');
}

function resolveHomeworkExtension(id, dueDate = '') {
  const assignment = findHomework(id);
  if (state.role !== 'professeur' || !assignment) return;
  const saved = saveHomework(board => {
    const request = board.extensions[id];
    if (request?.status !== 'pending' || !homeworkCanEdit(id, board)) return false;
    if (dueDate && (!homeworkDate(dueDate) || dueDate <= homeworkDue(assignment, board) || dueDate < dayKey())) {
      toast('Choisissez une date après l’échéance actuelle.');
      return false;
    }
    board.extensions[id] = {...request, status: dueDate ? 'approved' : 'declined', dueDate, resolvedAt: new Date().toISOString()};
    return true;
  });
  if (saved) refreshHomework(id, dueDate ? 'Délai accordé' : 'Délai initial maintenu');
}

function handleHomeworkForm(form, values) {
  switch (form.id) {
    case 'homeworkEditorForm': publishHomework(values); return true;
    case 'homeworkResponseForm': submitHomework(form, values); return true;
    case 'homeworkReviewForm': correctHomework(form.dataset.id, String(values.feedback || '').trim().slice(0, 1500)); return true;
    case 'homeworkExtensionForm': if (values.dueDate) resolveHomeworkExtension(form.dataset.id, values.dueDate); return true;
    default: return false;
  }
}

function syncHomeworkConnection() {
  const form = document.getElementById('homeworkResponseForm');
  if (!form) return;
  const notice = document.getElementById('homeworkConnection');
  const submit = document.getElementById('homeworkSubmit');
  if (notice) notice.hidden = homeworkOnline();
  if (submit) submit.disabled = !homeworkOnline() || homeworkUploads.has(form.dataset.id);
}

function homeworkFileOperation(mode, operation) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
    const opening = indexedDB.open('madrassati-maak-homework-files', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('files');
    opening.onerror = () => reject(opening.error);
    opening.onblocked = () => reject(new Error('File storage is blocked'));
    opening.onsuccess = () => {
      const db = opening.result;
      try {
        const transaction = db.transaction('files', mode);
        const request = operation(transaction.objectStore('files'));
        transaction.oncomplete = () => { db.close(); resolve(request.result); };
        transaction.onabort = () => { db.close(); reject(transaction.error); };
      } catch (error) { db.close(); reject(error); }
    };
  });
}

function discardHomeworkFile(id) {
  if (id) homeworkFileOperation('readwrite', files => files.delete(id)).catch(() => {});
}

async function attachHomeworkFile(input) {
  const assignment = findHomework(input.dataset.id);
  const file = input.files?.[0];
  if (state.role !== 'eleve' || !assignment || !file || !homeworkCanEdit(assignment.id) || homeworkUploads.has(assignment.id)) return;
  const supported = /\.(?:png|jpe?g|webp|heic|heif|gif|pdf|txt|docx?)$/i.test(file.name);
  if (!supported || !file.size || file.size > 8 * 1024 * 1024) {
    input.value = '';
    toast('Le fichier doit être un document ou une image de 8 Mo maximum.');
    return;
  }
  const id = assignment.id;
  const attachment = {id: homeworkId('fichier'), name: file.name.slice(0, 160), size: file.size};
  homeworkUploads.add(id);
  syncHomeworkConnection();
  const hint = document.getElementById('homeworkDraftHint');
  if (hint) hint.textContent = tr('Enregistrement du fichier…');
  let oldFile;
  let saved = false;
  try {
    await homeworkFileOperation('readwrite', files => files.put(file, attachment.id));
    if (state.role === 'eleve') saved = saveHomework(board => {
      if (!homeworkCanEdit(id, board)) return false;
      const submission = board.submissions[id];
      oldFile = submission?.attachment?.id;
      board.submissions[id] = {...submission, status: 'draft', variant: homeworkVariant(assignment, submission), attachment};
      return true;
    });
    if (saved) discardHomeworkFile(oldFile);
    else discardHomeworkFile(attachment.id);
  } catch { toast('Impossible d’enregistrer le fichier sur cet appareil.'); }
  finally {
    homeworkUploads.delete(id);
    if (saved && document.getElementById('homeworkResponseForm')?.dataset.id === id) refreshHomework(id, 'Brouillon enregistré sur cet appareil.');
    else { if (hint?.isConnected) hint.textContent = ''; syncHomeworkConnection(); }
  }
}

function removeHomeworkFile(id) {
  if (state.role !== 'eleve' || !findHomework(id)) return;
  let fileId;
  const saved = saveHomework(board => {
    if (!homeworkCanEdit(id, board) || !board.submissions[id]?.attachment) return false;
    fileId = board.submissions[id].attachment.id;
    delete board.submissions[id].attachment;
    return true;
  });
  if (saved) { discardHomeworkFile(fileId); refreshHomework(id); }
}

async function downloadHomeworkFile(id) {
  if (!['eleve','professeur'].includes(state.role) || !findHomework(id)) return;
  const submission = homeworkBoard().submissions[id];
  const attachment = submission?.attachment;
  if (!attachment || !['submitted','corrected'].includes(submission.status)) return;
  try {
    const blob = await homeworkFileOperation('readonly', files => files.get(attachment.id));
    if (!blob) throw new Error('File not found');
    download(blob, attachment.name, blob.type || 'application/octet-stream');
  } catch { toast('Ce fichier est indisponible sur cet appareil.'); }
}

function showHomeworkCalendar(id) {
  const assignment = findHomework(id);
  const date = assignment && homeworkDate(homeworkDue(assignment));
  if (!date) return;
  closeModal();
  state.calendarDate = dayKey(date);
  state.calendarView = 'week';
  go('calendrier');
}

function messageAboutHomework(id) {
  if (state.role !== 'parent') return;
  const assignment = findHomework(id);
  if (!assignment) return;
  const contactsBySubject = {maths: 'amal', francais: 'youssef', svt: 'salma'};
  state.contact = contactsBySubject[assignment.subject] || 'equipe';
  state.contactFilter = 'toutes';
  state.contactSearch = '';
  state.attachment = null;
  const key = messageThreadKey();
  const intro = `${tr('Bonjour, au sujet du devoir')} « ${homeworkText(assignment, 'title')} »\n\n`;
  const draft = state.messageDrafts[key] || '';
  state.messageDrafts[key] = draft.startsWith(intro) ? draft : intro + draft;
  closeModal();
  go('messagerie');
}

function homeworkRow(assignment) {
  const subject = subjects.find(s => s.id === assignment.subject);
  return `<button class="homework-summary-row" data-action="assignment-open" data-id="${esc(assignment.id)}">
    ${tile(subject?.icon || 'clipboard', subject?.color || '')}<span class="homework-summary-name"><strong>${homeworkTitle(assignment)}</strong>${homeworkWhen(homeworkDue(assignment))}</span>${homeworkPill(homeworkStatus(assignment.id))}
  </button>`;
}

function homeworkToday() {
  const list = homeworkList();
  const today = dayKey();
  const pending = list.find(a => homeworkCanEdit(a.id) && homeworkDue(a) >= today);
  const feedback = list.find(a => homeworkStatus(a.id) === 'corrected' && homeworkDue(a) >= today);
  const assignment = pending || feedback;
  const session = !assignment && upcomingSessions()[0];
  const variant = assignment ? homeworkVariant(assignment, homeworkBoard().submissions[assignment.id]) : 'full';
  const duration = assignment && (variant === 'short' ? assignment.shortDuration : assignment.duration);
  const label = feedback && !pending ? 'Voir la correction' : assignment && homeworkStatus(assignment.id) === 'draft' ? 'Reprendre le devoir' : 'Ouvrir le devoir';
  const action = assignment ? homeworkButton(label, 'assignment-open', assignment.id, 'primary', 'clipboard')
    : session ? homeworkButton('Ouvrir la séance','select-event',session.id,'primary','calendar')
    : '<button class="btn primary" data-page="devoirs">Tous les devoirs</button>';
  return `<section class="learning-hero homework-today"><div class="learning-hero-copy">
    <span class="hero-kicker">Aujourd’hui</span>
    <h2>${assignment ? homeworkTitle(assignment) : session ? sessionTitleHTML(session) : 'Aucun devoir ni séance à venir.'}</h2>
    ${assignment ? `<div class="homework-today-meta"><span>${duration} min</span>${variant === 'short' ? '<span>L’essentiel</span>' : ''}${homeworkWhen(homeworkDue(assignment))}</div>` : session ? `<div class="homework-today-meta">${homeworkWhen(session.date)}<span dir="ltr">${sessionTime(session)}</span></div>` : ''}
    ${action}<button class="text-link today-calendar" data-page="calendrier">Mon calendrier ${icon('arrow','sm')}</button>
  </div><div class="learning-hero-visual"><span class="hero-orbit orbit-one" aria-hidden="true"></span><span class="hero-orbit orbit-two" aria-hidden="true"></span>${art('student')}</div></section>`;
}

function homeworkTeacherQueue() {
  const correctionCount = homeworkList().filter(a => homeworkStatus(a.id) === 'submitted').length;
  const extensionCount = homeworkList().filter(a => homeworkBoard().extensions[a.id]?.status === 'pending').length;
  const helpCount = homeworkList().filter(a => homeworkBoard().helpRequests?.[a.id]?.status === 'pending').length;
  return `<section class="card homework-teacher-queue">
    <div><h2>Devoirs de mes classes</h2><div class="homework-actions">
      <button type="button" class="text-link" data-action="homework-queue" data-value="correction">À corriger <span class="tag mint">${correctionCount}</span></button>
      <button type="button" class="text-link" data-action="homework-queue" data-value="extensions">Demandes de délai <span class="tag orange">${extensionCount}</span></button>
      <button type="button" class="text-link" data-action="homework-queue" data-value="help">Demandes d’aide <span class="tag mint">${helpCount}</span></button>
    </div></div>${homeworkButton('Nouveau devoir', 'teacher-assignment', '', 'primary', 'plus')}
  </section>`;
}

function homeworkCalendarPanel() {
  const {start,end} = calendarRange();
  const list = homeworkList().filter(a => homeworkDue(a) >= start && homeworkDue(a) <= end && (state.role !== 'professeur' || state.planningClass === 'all' || a.classId === state.planningClass));
  if (!list.length) return '';
  return `<section class="card homework-calendar"><div class="homework-section-head"><h2>Échéances des devoirs</h2></div><div class="homework-calendar-list">${list.map(homeworkRow).join('')}</div></section>`;
}

function downloadHomeworkWeek() {
  const week = homeworkWeek();
  const assigned = homeworkList().filter(a => homeworkDue(a) >= week.start && homeworkDue(a) <= week.end);
  const ids = new Set(assigned.map(a => a.resourceId).filter(Boolean));
  const sheets = libraryResources().filter(r => !r.attachment && (ids.size ? ids.has(r.id) : r.type === 'pdf'));
  const documents = libraryResources().filter(r => ids.has(r.id) && r.attachment);
  const sections=[
    ...sheets.map(r=>({heading:tr(r.title),text:[tr(r.subject),tr(r.body||r.pages.join('\n\n'))].filter(Boolean).join('\n')})),
    ...documents.map(r=>({heading:tr(r.title),text:[tr(r.description),r.attachment.name].filter(Boolean).join('\n')}))
  ];
  saveSchoolDocument({kind:'weekly',language:state.lang,title:tr('Fiches de la semaine'),
    subtitle:formatDate(homeworkDate(week.start))+' - '+formatDate(homeworkDate(week.end)),sections},'Madrassati-Fiches-Semaine.pdf');
}

async function resetHomework() {
  try { await homeworkFileOperation('readwrite', files => files.clear()); } catch { /* Le stockage des fichiers peut être désactivé. */ }
  try { localStorage.removeItem(HOMEWORK_KEY); } catch { /* Le stockage peut être désactivé. */ }
  cachedHomework = undefined;
}
