'use strict';

const ADMIN_AR = {
  'Pilotage':'الإشراف', 'Scolarité':'الشؤون الدراسية', 'Outils':'الأدوات',
  'Tous les statuts':'جميع الحالات', 'Actifs':'نشطة', 'À activer':'تحتاج إلى تفعيل',
  'Suspendus':'موقوفة', 'Effacer les filtres':'مسح عوامل التصفية',
  'Aucun élément à traiter.':'لا توجد عناصر للمعالجة.', 'Aucune séance à reprogrammer.':'لا توجد حصص لإعادة البرمجة.',
  'Séances programmées':'الحصص المبرمجة', 'État des séances':'حالة الحصص', 'Regrouper les séances':'تجميع الحصص',
  'Période du planning':'الفترة في الجدول',
  'À traiter':'للمعالجة', 'Séances à reprogrammer':'حصص تحتاج إلى إعادة برمجة',
  'Indicateurs de l’établissement':'مؤشرات المؤسسة', 'Professeurs actifs':'الأساتذة النشطون',
  'Voir toutes les classes':'عرض جميع الأقسام', 'Élève suivi':'التلميذ المتابَع', 'Nom ou identifiant…':'الاسم أو المعرّف…',
  'Attribuez une classe à un professeur pour programmer une séance.':'عيّنوا قسمًا لأستاذ لبرمجة حصة.',
};
for (const [fr,ar] of Object.entries(ADMIN_AR)) AR_LOOKUP.set(localeKey(fr),ar);

const ADMIN_ACCOUNT_STATES = [['all','Tous les statuts'],['active','Actifs'],['pending','À activer'],['inactive','Suspendus']];
const ADMIN_ACCOUNT_ROLES = [['all','Tous les rôles'],['Élève','Élève'],['Parent','Parent'],['Professeur','Professeur']];

function adminCountText(count,singular,plural,arabic) {
  return state.lang === 'ar' ? count + ' ' + arabic : count + ' ' + (count === 1 ? singular : plural);
}

function adminDashboard() {
  const [students,teachers,,sessions] = rosterStatistics();
  const indicators = [students,['user','mint','Professeurs actifs',teachers[3]],['cap','mint','Classes',publicationClasses().length],sessions];
  const actions = `<div class="admin-page-actions"><a class="btn secondary" href="/ecole">Ouvrir l’espace scolaire</a>${homeworkButton('Créer un compte','new-account','','secondary','users')}${homeworkButton('Nouvelle séance','new-session','','primary','plus')}</div>`;
  const cards = indicators.map(([symbol,color,label,total]) => statCard(symbol,color,label,total,'')).join('');
  const tasks = adminPendingTasks();
  const waiting = tasks.some(task => task.count);
  return `${heading('Vue d’ensemble','',actions)}
    <section class="stats-grid admin-indicators" aria-label="Indicateurs de l’établissement">${cards}</section>
    <div class="admin-overview">
      <section class="card admin-work">
        <div class="card-heading"><h2>À traiter</h2></div>
        ${waiting ? '' : '<p class="admin-empty">Aucun élément à traiter.</p>'}
        <ul class="admin-list">
          ${tasks.map(({kind,symbol,label,count}) => `<li><button type="button" class="admin-task" data-action="admin-queue" data-value="${kind}">
            ${tile(symbol,count ? 'orange' : 'mint')}<span>${label}</span><span class="tag ${count ? 'orange' : 'mint'}">${count}</span>${icon('right','sm')}
          </button></li>`).join('')}
        </ul>
      </section>
      <section class="card admin-enrolment">
        ${cardHeading('Effectifs par classe','Voir toutes les classes','classes')}
        <div class="class-list">${classRows(true)}</div>
      </section>
    </div>`;
}

function adminPendingTasks() {
  return [
    {kind:'accounts',symbol:'users',label:'Comptes à activer',count:state.accounts.filter(account => !account.active && account.pendingActivation).length},
    {kind:'sessions',symbol:'calendar',label:'Séances à reprogrammer',count:scheduledSessions().filter(planningNeedsAttention).length}
  ];
}

function openAdminQueue(queue) {
  if (state.role !== 'administration') return;
  if (queue === 'accounts') {
    state.accountRole = 'all';
    state.accountStatus = 'pending';
    state.accountSearch = '';
    go('comptes');
  } else if (queue === 'sessions') {
    state.planningScope = 'class';
    state.planningClass = 'all';
    state.planningTeacher = 'all';
    state.planningQueue = true;
    go('calendrier');
  }
}

function adminClassPage() {
  const classes = publicationClasses();
  const group = level => classes.filter(entry => entry.level === level);
  const groups = ['Primaire','Collège','Lycée'].filter(level => group(level).length);
  const unassigned = classStudents('').length;
  return `${heading('Niveaux & classes')}${groups.map(level => `<section class="card admin-level">
      <div class="card-heading"><h2>${level}</h2></div>
      <ul class="admin-list">${group(level).map(entry => `<li class="admin-level-row">
        <div class="student-name">${tile('cap',entry.color)}<strong>${esc(entry.name)}</strong></div>
        <span class="admin-level-count" data-no-i18n="true">${studentCountLabel(classStudents(entry.id).length)}</span>
        <div class="admin-row-actions">${homeworkButton('Voir les élèves','open-class',entry.id,'secondary','users')}
        <button type="button" class="btn soft" data-action="new-account" data-value="Élève" data-id="${entry.id}">${icon('plus','sm')}Ajouter un élève</button></div>
      </li>`).join('')}</ul>
    </section>`).join('')}${unassigned ? `<section class="card admin-level">${cardHeading('Sans classe')}
      <div class="admin-level-row"><p class="admin-level-count" data-no-i18n="true">${studentCountLabel(unassigned)}</p><div class="admin-row-actions">
      ${homeworkButton('Voir les élèves','open-class','unassigned','secondary','users')}</div></div>
    </section>` : ''}`;
}

function accountMatchesState(account) {
  if (state.accountStatus === 'active') return !!account.active;
  if (state.accountStatus === 'pending') return !account.active && !!account.pendingActivation;
  if (state.accountStatus === 'inactive') return !account.active && !account.pendingActivation;
  return true;
}

function adminAccountResults() {
  const query = searchKey(state.accountSearch.trim());
  const filtered = state.accounts.filter(account => (state.accountRole === 'all' || account.role === state.accountRole) &&
    accountMatchesState(account) && bilingualSearchText(`${account.name} ${account.email}`).includes(query));
  const count = adminCountText(filtered.length,'compte','comptes','حساب');
  return `<p class="admin-result-count" role="status" data-no-i18n="true">${count}</p>
    ${filtered.length ? `<ul class="admin-list">${filtered.map(adminAccountRow).join('')}</ul>` : '<p class="admin-empty">Aucun compte trouvé.</p>'}`;
}

function adminAccountRow(account) {
  const email = esc(account.email);
  const status = account.active ? 'Suspendre' : account.pendingActivation ? 'Activer le compte' : 'Réactiver';
  return `<li class="admin-directory-row">
    <div class="admin-identity">${avatar(accountInitials(account),'mint')}<div>
      <strong><bdi data-no-i18n="true">${esc(account.name)}</bdi></strong><small><bdi dir="ltr" data-no-i18n="true">${email}</bdi></small>
    </div></div>
    <div class="admin-directory-meta"><span class="tag blue">${esc(account.role)}</span><span>${esc(accountClassName(account))}</span></div>
    <span class="tag ${account.active ? 'mint' : 'orange'}">${accountStatus(account)}</span>
    <div class="admin-row-actions">${account.role === 'Élève' ? homeworkButton('Modifier la classe','student-reassign',account.email,'soft') : ''}
      ${homeworkButton(status,'account-toggle',account.email,'secondary')}
    </div>
  </li>`;
}

function accountsPage() {
  const active = state.accountRole !== 'all' || state.accountStatus !== 'all' || !!state.accountSearch;
  return `${heading('Gestion des comptes','',homeworkButton('Créer un compte','new-account','','primary','plus'))}
    <section class="card admin-directory">
      <div class="admin-filters">
        <div class="filter-field"><label for="accountSearch">Recherche</label><div class="search-box">${icon('search')}
          <input id="accountSearch" type="search" value="${esc(state.accountSearch)}" placeholder="Nom ou identifiant…" aria-controls="accountResults">
        </div></div>
        <div class="filter-field"><label for="accountRole">Rôle</label><select id="accountRole" aria-controls="accountResults">${libraryOptions(ADMIN_ACCOUNT_ROLES,state.accountRole)}</select></div>
        <div class="filter-field"><label for="accountStatus">Statut du compte</label><select id="accountStatus" aria-controls="accountResults">${libraryOptions(ADMIN_ACCOUNT_STATES,state.accountStatus)}</select></div>
        <button id="clearAccountFilters" type="button" class="btn soft" data-action="clear-account-filters" ${active ? '' : 'hidden'}>Effacer les filtres</button>
      </div>
      <div id="accountResults">${adminAccountResults()}</div>
    </section>`;
}

function updateAdminAccountSearch(input) {
  state.accountSearch = input.value;
  document.getElementById('accountResults').innerHTML = localizeHTML(adminAccountResults());
  const reset = document.getElementById('clearAccountFilters');
  reset.hidden = state.accountRole === 'all' && state.accountStatus === 'all' && !state.accountSearch;
}

function clearAdminAccountFilters() {
  state.accountRole = 'all';
  state.accountStatus = 'all';
  state.accountSearch = '';
  render();
  document.getElementById('accountSearch')?.focus();
}
