'use strict';

const GRADEBOOK_KEY = 'madrassati-maak-notes-v1';
let gradebookClassId = '';
let gradebookEditor = null;

const GRADEBOOK_AR = {
  'Saisie des notes':'إدخال النقط', 'Saisir les notes':'إدخال النقط',
  'Évaluations':'التقييمات', 'Nouvelle évaluation':'تقييم جديد',
  'Modifier les notes':'تعديل النقط', 'Notes saisies':'النقط المُدخلة',
  'Titre de l’évaluation':'عنوان التقييم', 'Date de l’évaluation':'تاريخ التقييم',
  'Aucune évaluation dans cette classe.':'لا يوجد تقييم في هذا القسم.',
  'Aucune classe attribuée.':'لم يُعيّن أي قسم.',
  'Enregistrer les notes':'حفظ النقط',
  'Notes conservées dans ce navigateur.':'تُحفَظ النقط في هذا المتصفّح.',
  'Laissez une case vide si l’élève n’a pas de note.':'اتركوا الخانة فارغة إذا لم تكن للتلميذ نقطة.',
  'Saisissez une note entre 0 et 20 avec deux décimales au maximum.':'أدخلوا نقطة بين 0 و20 بمنزلتين عشريتين على الأكثر.',
  'Indiquez un titre et une date valides.':'أدخلوا عنوانًا وتاريخًا صالحين.',
  'Les notes ont été enregistrées.':'تم حفظ النقط.',
  'La classe ou l’évaluation a changé. Rouvrez la fiche avant d’enregistrer.':'تغيّر القسم أو التقييم. افتحوا البطاقة من جديد قبل الحفظ.',
  'Impossible d’enregistrer les notes dans ce navigateur.':'تعذّر حفظ النقط في هذا المتصفّح.',
  'Aucune note enregistrée pour le moment.':'لم تُسجّل أي نقطة بعد.',
  'Notes d’exemple':'نقط توضيحية', 'Notes de mon enfant':'نقط طفلي',
  'Résultats de mon enfant':'نتائج طفلي', 'Voir ses résultats':'عرض نتائجه'
};
for (const [fr, ar] of Object.entries(GRADEBOOK_AR)) AR_LOOKUP.set(localeKey(fr),ar);

function withGradebookLock(commit) {
  return navigator.locks ? navigator.locks.request(GRADEBOOK_KEY,commit) : commit();
}

function readGradebook() {
  const saved = localStorage.getItem(GRADEBOOK_KEY);
  if (saved === null) return [];
  const records = JSON.parse(saved);
  if (!Array.isArray(records)) throw new TypeError('Invalid gradebook');
  return records;
}

function gradebookRecords() {
  try { return readGradebook(); }
  catch { return []; }
}

function gradebookAssessments(teacher, classId) {
  const saved = gradebookRecords().filter(record =>
    record.teacherId === teacher.id && record.subjectId === teacher.subjectId && record.classId === classId);
  const linkedExams = new Set(saved.map(record => record.examId));
  const exams = homeworkList('professeur').filter(item =>
    item.kind === 'exam' && item.classId === classId && !linkedExams.has(item.id));
  return [...saved,...exams.map(exam => ({
    id:`exam:${exam.id}`, examId:exam.id, teacherId:teacher.id, subjectId:teacher.subjectId, classId,
    title:homeworkText(exam,'title'), date:exam.dueDate, scores:{}, revision:0
  }))].sort((a,b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title,state.lang));
}

function gradebookDate(key) {
  const date = homeworkDate(key);
  return date ? `<time datetime="${esc(key)}" data-no-i18n="true">${formatDate(date,{day:'numeric',month:'short',year:'numeric'})}</time>` : '—';
}

function gradebookEntryLabel(marked,open) {
  return open ? (marked ? 'Modifier les notes' : 'Saisir les notes') : 'Voir les notes';
}

function syncGradebookAccess(open) {
  const create = document.getElementById('gradebookCreate');
  if (create) create.disabled = !open;
  for (const label of document.querySelectorAll('[data-gradebook-entry]')) {
    label.textContent = tr(gradebookEntryLabel(label.dataset.gradebookEntry === 'marked',open));
  }

  const form = gradebookEditor?.form;
  if (!form?.isConnected) return;
  form.querySelector('#gradebookFields').disabled = !open;
  form.querySelector('[type="submit"]').disabled = !open || gradebookEditor.saving === true;
  form.querySelector('[data-gradebook-dismiss]').textContent = tr(open ? 'Annuler' : 'Fermer');
  form.querySelector('#gradebookHint').textContent = tr(open ?
    'Laissez une case vide si l’élève n’a pas de note.' : 'Lecture seule. La saisie est fermée.');
}

function teacherGradebookPage() {
  const open = gradePeriodIsOpen();
  const teacher = activeTeacher();
  const classes = publicationClasses();
  const classEntry = classes.find(item => item.id === gradebookClassId) || classes[0];
  if (!teacher || !classEntry) return `${heading('Saisie des notes')}<section class="card"><p>Aucune classe attribuée.</p></section>`;
  gradebookClassId = classEntry.id;
  const students = classStudents(gradebookClassId);
  const evaluations = gradebookAssessments(teacher,gradebookClassId);
  const add = students.length ? `<button type="button" class="btn primary" id="gradebookCreate" data-action="gradebook-open"
    aria-describedby="gradePeriodStatus" ${open ? '' : 'disabled'}>${icon('plus','sm')}Nouvelle évaluation</button>` : '';
  const list = evaluations.map(entry => {
    const marked = students.filter(student => Number.isFinite(entry.scores[accountId(student.email)])).length;
    return `<li class="gradebook-evaluation">
      <div class="gradebook-evaluation-name"><strong><bdi data-no-i18n="true">${esc(entry.title)}</bdi></strong>
        <div class="gradebook-meta">${entry.examId ? '<span class="tag mint">Examen</span>' : ''}${gradebookDate(entry.date)}</div>
      </div>
      <div class="gradebook-evaluation-actions"><span class="tiny muted"><bdi dir="ltr">${marked} / ${students.length}</bdi> <span>Notes saisies</span></span>
        ${students.length ? `<button type="button" class="btn secondary" data-action="gradebook-open" data-id="${esc(entry.id)}">
          ${icon('clipboard','sm')}<span data-gradebook-entry="${marked ? 'marked' : 'unmarked'}">${gradebookEntryLabel(marked,open)}</span></button>` : ''}
      </div>
    </li>`;
  }).join('');
  return `${heading('Saisie des notes','',add)}
    <section class="card grade-period-panel grade-period-notice" id="gradePeriodStatus" role="status"></section>
    <div class="filters gradebook-filters"><div class="filter-field"><label for="gradebookClass">Classe</label>
      <select id="gradebookClass">${libraryOptions(classes.map(item => [item.id,item.name]),gradebookClassId)}</select></div>
      <div class="gradebook-subject"><span>Matière</span><strong>${esc(subjectById(teacher.subjectId).name)}</strong></div>
    </div>
    <section class="card gradebook-assessments">${cardHeading('Évaluations')}
      ${students.length ? '' : '<p class="gradebook-empty">Aucun élève inscrit dans cette classe.</p>'}
      ${list ? `<ul class="gradebook-evaluations">${list}</ul>` : '<p class="gradebook-empty">Aucune évaluation dans cette classe.</p>'}
      <p class="tiny muted gradebook-storage">Notes conservées dans ce navigateur.</p>
    </section>`;
}

function updateGradebookClass(control) {
  if (control.id !== 'gradebookClass') return false;
  if (state.role === 'professeur' && state.page === 'notes' && publicationClasses().some(entry => entry.id === control.value)) {
    gradebookClassId = control.value;
    render();
    document.getElementById(control.id)?.focus();
  }
  return true;
}

function openGradebookEditor(id) {
  if (state.role !== 'professeur' || state.page !== 'notes') return;
  const open = gradePeriodIsOpen();
  if (!id && !open) {
    refreshGradePeriod();
    toast('La période de saisie est fermée.');
    return;
  }
  const teacher = activeTeacher();
  const classEntry = publicationClasses().find(item => item.id === gradebookClassId);
  if (!teacher || !classEntry) return;
  const students = classStudents(classEntry.id).sort((a,b) => a.name.localeCompare(b.name,state.lang));
  if (!students.length) return;
  const entry = id ? gradebookAssessments(teacher,classEntry.id).find(record => record.id === id) : {
    id:homeworkId('evaluation'), teacherId:teacher.id, subjectId:teacher.subjectId, classId:classEntry.id,
    title:'', date:dayKey(), scores:{}, revision:0
  };
  if (!entry) return;
  const rows = students.map((student,index) => {
    const studentId = accountId(student.email);
    const score = entry.scores[studentId];
    const value = Number.isFinite(score) ? String(score).replace('.',',') : '';
    return `<tr><th scope="row" id="gradebookStudent${index}"><bdi data-no-i18n="true">${esc(student.name)}</bdi></th>
      <td><input type="text" class="gradebook-score" data-grade-student="${esc(studentId)}" dir="ltr"
        inputmode="decimal" value="${esc(value)}" placeholder="—"
        aria-labelledby="gradebookScoreLabel gradebookStudent${index}" aria-describedby="gradebookHint"></td></tr>`;
  }).join('');
  const dialogTitle = id ? (open ? 'Saisir les notes' : 'Notes de l’évaluation') : 'Nouvelle évaluation';
  openModal(dialogTitle,`
    <form id="gradebookForm" class="form">
      <div class="gradebook-meta"><span class="tag mint">${esc(classEntry.name)}</span><span>${esc(subjectById(teacher.subjectId).name)}</span></div>
      <fieldset class="gradebook-fields" id="gradebookFields" ${open ? '' : 'disabled'}>
        <legend class="sr-only">Notes de l’évaluation</legend>
        <div class="gradebook-details">
          <div><label for="gradebookTitle">Titre de l’évaluation</label><input id="gradebookTitle" name="title" maxlength="120" dir="auto" value="${esc(entry.title)}" required></div>
          <div><label for="gradebookDate">Date de l’évaluation</label><input type="date" id="gradebookDate" name="date" value="${esc(entry.date)}" required></div>
        </div>
        <p class="tiny muted" id="gradebookHint" role="status">${open ? 'Laissez une case vide si l’élève n’a pas de note.' : 'Lecture seule. La saisie est fermée.'}</p>
        <div class="gradebook-score-list"><table class="data-table">
          <thead><tr><th scope="col">Élève</th><th scope="col" id="gradebookScoreLabel">Note / 20</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </fieldset>
      <p class="error" id="gradebookError" role="alert"></p>
      <div class="modal-actions"><button type="button" class="btn secondary" data-action="close-modal" data-gradebook-dismiss>${open ? 'Annuler' : 'Fermer'}</button>
        <button type="submit" class="btn primary" ${open ? '' : 'disabled'}>${icon('save','sm')}Enregistrer les notes</button></div>
    </form>`,true,'gradebook-modal');
  const form = document.getElementById('gradebookForm');
  gradebookEditor = {entry,form};
  refreshGradePeriod();
  if (open) form.querySelector(id ? '.gradebook-score' : '#gradebookTitle')?.focus();
}

function gradebookScore(raw) {
  const text = arabicNumbersToLatin(raw.trim()).replace(/[٫,]/g,'.');
  if (!text) return null;
  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(text)) return NaN;
  const score = Number(text);
  return score <= 20 ? score : NaN;
}

async function saveGradebookForm(form, values) {
  const editor = gradebookEditor;
  if (editor?.form !== form || editor.saving || state.role !== 'professeur' || state.page !== 'notes') return;
  const error = document.getElementById('gradebookError');
  if (!gradePeriodIsOpen()) {
    error.textContent = tr('La période de saisie est fermée.');
    refreshGradePeriod();
    return;
  }
  const title = String(values.title || '').trim().slice(0,120);
  const date = values.date;
  const scoreInputs = [...form.querySelectorAll('[data-grade-student]')];
  const marks = scoreInputs.map(input => ({input,studentId:input.dataset.gradeStudent,score:gradebookScore(input.value)}));
  const invalid = marks.filter(mark => Number.isNaN(mark.score));
  for (const {input,score} of marks) {
    input.classList.toggle('invalid',Number.isNaN(score));
    input.setAttribute('aria-invalid',String(Number.isNaN(score)));
  }
  if (!title || !homeworkDate(date) || invalid.length) {
    error.textContent = tr(invalid.length ? 'Saisissez une note entre 0 et 20 avec deux décimales au maximum.' : 'Indiquez un titre et une date valides.');
    (invalid[0]?.input || form.elements[title ? 'date' : 'title']).focus();
    return;
  }
  editor.saving = true;
  syncGradebookAccess(true);
  error.textContent = '';
  const {entry} = editor;
  const commit = () => {
    if (!form.isConnected || state.role !== 'professeur' || state.page !== 'notes') return false;
    const teacher = activeTeacher();
    if (teacher?.id !== entry.teacherId || teacher.subjectId !== entry.subjectId || !teacher.classIds.includes(entry.classId)) return false;
    const accounts = readAccountStore() || state.accounts;
    const roster = new Set(accounts.filter(a => a.role === 'Élève' && a.classId === entry.classId).map(a => accountId(a.email)));
    if (marks.some(mark => !roster.has(mark.studentId))) return false;
    const records = readGradebook();
    const current = records.find(record => record.id === entry.id);
    if ((current?.revision || 0) !== entry.revision) return false;
    if (entry.examId && !current) {
      const exam = (readHomeworkBoard() || homeworkBoard()).assignments.find(item => item.id === entry.examId);
      if (!teacherOwnsHomework(exam,teacher) || exam.kind !== 'exam' || exam.classId !== entry.classId || (exam.example && !state.examples)) return false;
    }
    const scores = Object.assign(Object.create(null),current?.scores);
    for (const {studentId,score} of marks) {
      if (score === null) delete scores[studentId];
      else scores[studentId] = score;
    }
    const updated = {...entry,title,date,scores,revision:entry.revision+1};
    const next = current ? records.map(record => record.id === entry.id ? updated : record) : [...records,updated];
    if (!gradePeriodIsOpen()) return 'closed';
    localStorage.setItem(GRADEBOOK_KEY,JSON.stringify(next));
    return true;
  };
  try {
    const saved = await withGradebookLock(commit);
    if (!form.isConnected) return;
    if (saved !== true) {
      error.textContent = tr(saved === 'closed' ? 'La période de saisie est fermée.' :
        'La classe ou l’évaluation a changé. Rouvrez la fiche avant d’enregistrer.');
      return;
    }
    closeModal();
    render();
    document.getElementById('gradebookClass')?.focus();
    toast('Les notes ont été enregistrées.');
  } catch {
    error.textContent = tr('Impossible d’enregistrer les notes dans ce navigateur.');
  } finally {
    editor.saving = false;
    if (form.isConnected) refreshGradePeriod();
  }
}

function recordedGradebookCard(title) {
  const child = childAccount();
  const studentId = child?.active ? accountId(child.email) : '';
  const records = studentId ? gradebookRecords().filter(record => Number.isFinite(record.scores[studentId])) : [];
  const format = new Intl.NumberFormat(state.lang === 'ar' ? 'ar-MA' : 'fr-FR',{maximumFractionDigits:2});
  const rows = records.sort((a,b) => b.date.localeCompare(a.date)).map(record => `<tr>
    <td>${esc(subjectById(record.subjectId)?.name || '')}</td>
    <td><bdi data-no-i18n="true">${esc(record.title)}</bdi></td>
    <td>${gradebookDate(record.date)}</td>
    <td><span class="tag mint" data-no-i18n="true">${format.format(record.scores[studentId])}</span></td>
  </tr>`).join('');
  return `<section class="card gradebook-recorded">${cardHeading(title)}
    ${rows ? `<div class="table-scroll"><table class="data-table">
      <thead><tr><th scope="col">Matière</th><th scope="col">Évaluation</th><th scope="col">Date</th><th scope="col">Note / 20</th></tr></thead>
      <tbody>${rows}</tbody></table></div>` : '<p class="gradebook-empty">Aucune note enregistrée pour le moment.</p>'}
  </section>`;
}
