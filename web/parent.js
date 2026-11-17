'use strict';

const PARENT_AR = {
  'Suivi de mon enfant':'متابعة طفلي', 'Aucun élève associé.':'لا يوجد تلميذ مرتبط.',
  'À rendre':'واجبات للتسليم', 'Remis':'تم التسليم',
  'En retard':'متأخر', 'À revoir':'للمراجعة', 'À rendre aujourd’hui':'للتسليم اليوم',
  'Prochaines séances':'الحصص القادمة', 'Séances passées':'الحصص السابقة',
  'Voir les séances passées':'عرض الحصص السابقة', 'Devoirs à rendre':'الواجبات المطلوب تسليمها',
  'Aucun devoir à rendre pour le moment.':'لا يوجد واجب للتسليم حاليًا.',
  'Planning de mon enfant':'جدول طفلي', 'Consultez les supports et les travaux liés aux séances passées.':'اطّلعوا على الموارد والواجبات المرتبطة بالحصص السابقة.',
  'Corrections de mon enfant':'تصحيحات طفلي', 'Voir les corrections':'عرض التصحيحات',
  'Aucune correction publiée pour le moment.':'لا يوجد تصحيح منشور حاليًا.',
  'Aucun relevé de présence publié.':'لا يوجد سجلّ حضور منشور.',
  'Bulletin d’exemple':'كشف نقاط تجريبي', 'Échanges et ressources':'التواصل والموارد',
  'Consulter la bibliothèque':'عرض المكتبة'
};
for (const [fr,ar] of Object.entries(PARENT_AR)) AR_LOOKUP.set(localeKey(fr),ar);

function parentAssignments() {
  const board = homeworkBoard();
  const list = homeworkList('parent');
  const pending = list.filter(item => homeworkCanEdit(item.id,board)).sort((a,b) => homeworkDue(a,board).localeCompare(homeworkDue(b,board)));
  const submitted = list.filter(item => homeworkStatus(item.id,board) === 'submitted');
  const corrected = list.filter(item => homeworkStatus(item.id,board) === 'corrected').sort((a,b) =>
    (board.submissions[b.id]?.correctedAt || '').localeCompare(board.submissions[a.id]?.correctedAt || ''));
  return {pending,submitted,corrected,board};
}

function parentAssignmentFilter(filter) {
  if (state.role !== 'parent' || !['all','todo','submitted','corrected'].includes(filter)) return;
  state.assignmentFilter = filter;
  go('devoirs');
}

function parentCountCard(symbol,color,label,filter,count) {
  return `<button type="button" class="parent-count" data-action="parent-assignment-filter" data-value="${filter}">
    ${tile(symbol,color)}<span><strong>${count}</strong><small>${label}</small></span>${icon('right','sm')}
  </button>`;
}

function parentAssignmentRow(assignment,board) {
  const date = homeworkDue(assignment,board);
  const today = dayKey();
  const pending = homeworkCanEdit(assignment.id,board);
  const late = pending && date && date < today;
  const dueToday = pending && date === today;
  const subject = subjectById(assignment.subject);
  const status = late ? '<span class="tag orange">En retard</span>' : dueToday ? '<span class="tag orange">À rendre aujourd’hui</span>' : homeworkPill(homeworkStatus(assignment.id,board));
  return `<button type="button" class="parent-assignment-row" data-action="assignment-open" data-id="${esc(assignment.id)}">
    <span class="parent-assignment-main"><strong>${homeworkTitle(assignment)}</strong><small>${esc(subject?.name || '')}${date ? ` · ${homeworkWhen(date)}` : ''}</small></span>
    ${status}${icon('right','sm')}
  </button>`;
}

function parentChildSummary(child) {
  const entry = classById(child.classId);
  return `<div class="parent-child-summary">
    ${avatar(accountInitials(child),'mint','large')}<div><h2><bdi data-no-i18n="true">${esc(child.name)}</bdi></h2>
    <p>${esc(entry?.name || 'Sans classe')}${entry ? ` · ${esc(entry.level)}` : ''}</p></div>
  </div>`;
}

function parentDashboard() {
  const child = childAccount();
  const message = `<button type="button" class="btn secondary" data-page="messagerie">${icon('mail','sm')}Contacter les enseignants</button>`;
  const title = heading('Suivi de mon enfant','',message);
  if (!child) return `<div class="parent-home">${title}<section class="card"><p>Aucun élève associé.</p></section></div>`;
  const {pending,submitted,corrected,board} = parentAssignments();
  const deadlines = pending.slice(0,4).map(item => parentAssignmentRow(item,board)).join('');
  const upcoming = upcomingSessions('parent').slice(0,3).map(session => sessionRow(session,true)).join('');
  return `<div class="parent-home">${title}
    <section class="card parent-summary">
      ${parentChildSummary(child)}<div class="parent-counters">
        ${parentCountCard('clipboard','orange','À rendre','todo',pending.length)}
        ${parentCountCard('file','blue','Remis','submitted',submitted.length)}
        ${parentCountCard('check','mint','Corrigés','corrected',corrected.length)}
      </div>
    </section>
    <div class="parent-home-grid">
      <section class="card parent-work">
        <div class="card-heading"><h2>Devoirs à rendre</h2><button type="button" class="text-link" data-action="parent-assignment-filter" data-value="all">Tous les devoirs ${icon('right','sm')}</button></div>
        ${deadlines || '<p class="parent-empty">Aucun devoir à rendre pour le moment.</p>'}
      </section>
      <section class="card parent-planning">
        ${cardHeading('Prochaines séances','Son planning','calendrier')}
        ${upcoming || '<p class="parent-empty">Aucune séance à venir.</p>'}
        <button type="button" class="text-link parent-past-link" data-page="rattrapage">Voir les séances passées ${icon('right','sm')}</button>
      </section>
    </div>
    <section class="card parent-links">
      ${cardHeading('Accès rapides')}
      <div class="parent-link-grid">
        ${parentQuickLink('notes','chart','Voir ses résultats')}
        ${parentQuickLink('presences','calendar','Son assiduité')}
        ${parentQuickLink('resources','folder','Consulter la bibliothèque')}
      </div>
    </section>
  </div>`;
}

function parentQuickLink(page,symbol,label) {
  return `<button type="button" class="parent-link" data-page="${page}">
    ${tile(symbol,'mint')}<span>${label}</span>${icon('right','sm')}
  </button>`;
}

function parentResultsPage() {
  const {corrected,board} = parentAssignments();
  const sample = state.examples ? homeworkButton('Bulletin d’exemple','export-grades','','secondary','download') : '';
  return `<div class="parent-home">${heading('Résultats de mon enfant','',sample)}
    ${recordedGradebookCard('Notes de mon enfant')}
    <section class="card parent-work">${cardHeading('Corrections de mon enfant')}${corrected.length ?
      corrected.map(item => parentAssignmentRow(item,board)).join('') :
      '<p class="parent-empty">Aucune correction publiée pour le moment.</p>'}</section></div>`;
}

function parentAttendancePage() {
  const child = childAccount();
  const rows = attendanceForAccounts(child ? [child] : [],state.examples ? 'example' : 'week');
  const records = rows.flatMap(row => row.record ? [row.record] : []);
  const planning = `<button type="button" class="btn secondary" data-page="calendrier">${icon('calendar','sm')}Son planning</button>`;
  return `<div class="parent-home">${heading('Assiduité de mon enfant','',planning)}
    <section class="card">${records.length ? `<div class="card-heading"><h2>Présences</h2><span class="tag mint">Période d’exemple</span></div>
      ${records.map(record => `<div class="parent-attendance-item"><div><h3>${esc(record.subject)}</h3>
        <p><bdi dir="ltr">${esc(record.date)} · ${esc(record.arrival)}</bdi> · ${record.duration} min</p></div>${tag(record.status)}</div>`).join('')}` :
      '<p class="parent-empty">Aucun relevé de présence publié.</p>'}
    </section></div>`;
}
