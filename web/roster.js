'use strict';

const ACCOUNTS_KEY = 'madrassati-maak-comptes-v1';
const DEMO_CHILD_ACCOUNT = 'yassine@exemple.ma';
const ROSTER_AR = {
  'Élèves inscrits': 'التلاميذ المسجّلون', 'Effectifs par classe': 'عدد التلاميذ حسب القسم',
  'Tous les élèves': 'جميع التلاميذ', 'Sans classe': 'دون قسم',
  'Classe à attribuer': 'يلزم تحديد القسم', 'Ancienne classe': 'القسم السابق',
  'Ajouter un élève': 'إضافة تلميذ', 'Modifier la classe': 'تعديل القسم',
  'Classe mise à jour.': 'تم تحديث القسم.', 'Fiche de l’élève': 'بطاقة التلميذ',
  'Voir la fiche': 'عرض البطاقة', 'Statut du compte': 'حالة الحساب',
  'Aucun élève inscrit dans cette classe.': 'لا يوجد تلاميذ مسجّلون في هذا القسم.',
  'Aucun élève ne correspond à la recherche.': 'لا يوجد تلميذ يطابق البحث.',
  'Choisissez une classe dans la liste.': 'اختاروا قسمًا من القائمة.',
  'Vérifiez le nom, le rôle et l’identifiant.': 'تحقّقوا من الاسم والدور ومعرّف الحساب.',
  'Impossible d’enregistrer le compte dans ce navigateur.': 'تعذّر حفظ الحساب في هذا المتصفّح.',
  'Ce compte n’est plus disponible.': 'هذا الحساب غير متاح الآن.',
  'Comptes à activer': 'حسابات تحتاج إلى تفعيل', 'Comptes professeur actifs': 'حسابات الأساتذة النشطة',
  'Séances de la semaine': 'حصص الأسبوع', 'Présence non renseignée': 'الحضور غير مسجّل',
  'Aucune présence enregistrée.': 'لم يُسجّل أي حضور.', 'Séance d’exemple': 'حصة توضيحية',
  'Période d’exemple': 'فترة توضيحية', 'Sur les présences renseignées': 'حسب الحضور المسجّل',
  'Les comptes de cette maquette sont enregistrés dans votre navigateur.': 'تُحفظ حسابات هذا النموذج في متصفّحكم.'
};
for (const [fr, ar] of Object.entries(ROSTER_AR)) AR_LOOKUP.set(localeKey(fr), ar);

function accountId(email) {
  return String(email || '').trim().toLowerCase();
}

function classLabelKey(value) {
  return arabicNumbersToLatin(String(value || '')).normalize('NFKD').toLowerCase()
    .replace(/\p{M}/gu,'').trim().replace(/^(classe|القسم)\s+/,'')
    .replace(/(\d)\s*(?:ieme|eme|ere|er|e)(?=\s|[a-z]|$)/g,'$1').replace(/[^a-z0-9\u0600-\u06ff]/g,'');
}

function normalizeAccount(account) {
  if (account.role !== 'Élève') return {...account};
  const legacyClass = classLabelKey(account.class);
  const entry = Object.hasOwn(account,'classId') ? classById(account.classId) : classData.find(c => {
    const labels = [c.id,c.name,AR_LOOKUP.get(localeKey(c.name)) || dynamicArabic(c.name,0)];
    return legacyClass && labels.some(label => classLabelKey(label) === legacyClass);
  });
  return {...account,classId:entry?.id || '',class:entry?.name || account.class || ''};
}

function readAccountStore() {
  try {
    const list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
    return Array.isArray(list) ? list : null;
  } catch { return null; }
}

function loadAccounts(legacy) {
  const saved = readAccountStore();
  if (saved) return saved;
  const accounts = (Array.isArray(legacy) ? legacy : initialAccounts).map(normalizeAccount);
  try { localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts)); } catch { /* L’ancienne sauvegarde reste disponible. */ }
  return accounts;
}

async function updateAccounts(change) {
  const commit = () => {
    const accounts = readAccountStore() || state.accounts;
    const next = change(accounts);
    if (!next) return false;
    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(next));
    state.accounts = next;
    return true;
  };
  try { return typeof navigator !== 'undefined' && navigator.locks ? await navigator.locks.request(ACCOUNTS_KEY,commit) : commit(); }
  catch { toast('Impossible d’enregistrer le compte dans ce navigateur.'); return false; }
}

function studentAccounts() {
  return state.accounts.filter(a => a.role === 'Élève');
}

function childClassId() {
  return childAccount()?.classId || '';
}

function childAccount() {
  return studentAccounts().find(a => accountId(a.email) === DEMO_CHILD_ACCOUNT);
}

function childClassName() {
  return classById(childClassId())?.name || 'Sans classe';
}

function classStudents(classId) {
  return studentAccounts().filter(a => a.classId === classId);
}

function visibleStudentAccounts() {
  if (state.role === 'administration') return studentAccounts();
  if (state.role !== 'professeur') return [];
  const classes = activeTeacher()?.classIds || [];
  return studentAccounts().filter(a => classes.includes(a.classId));
}

function accountInitials(account) {
  return account.name.trim().split(/\s+/).slice(0,2).map(name => name[0]).join('').toLocaleUpperCase();
}

function accountClassName(account) {
  if (account.role !== 'Élève') return account.class || '';
  return classById(account.classId)?.name || (account.class ? 'Classe à attribuer' : 'Sans classe');
}

function accountStatus(account) {
  return account.active ? 'Actif' : account.pendingActivation ? 'Activation à confirmer' : 'Suspendu';
}

function studentCountLabel(count) {
  if (state.lang === 'ar') return `${count} ${count === 1 ? 'تلميذ مسجّل' : 'تلاميذ مسجّلون'}`;
  return `${count} ${count === 1 ? 'élève inscrit' : 'élèves inscrits'}`;
}

function classRows(includeUnassigned = false) {
  const classes = publicationClasses();
  const rows = classes.map(c => `<button class="class-row" data-action="open-class" data-id="${c.id}">${tile('cap',c.color)}<div><strong>${c.name}</strong><small>${c.level}</small></div><span class="count" data-no-i18n="true">${studentCountLabel(classStudents(c.id).length)}</span></button>`);
  const unassigned = classStudents('').length;
  if (includeUnassigned && unassigned) rows.push(`<button class="class-row" data-action="open-class" data-id="unassigned">${tile('users','orange')}<strong>Sans classe</strong><span class="count" data-no-i18n="true">${studentCountLabel(unassigned)}</span></button>`);
  return rows.join('');
}

function classesPage() {
  if (state.role === 'administration') return adminClassPage();
  const cards = publicationClasses().map(c => `<section class="card roster-class-card"><div class="between">${tile('cap',c.color)}<span class="tag ${c.color || 'blue'}">${c.level}</span></div><h2>${c.name}</h2><p class="roster-class-count" data-no-i18n="true">${studentCountLabel(classStudents(c.id).length)}</p><div class="homework-actions">${homeworkButton('Voir les élèves','open-class',c.id,'secondary','users')}</div></section>`).join('');
  return `${heading('Mes classes')}<div class="course-grid">${cards}</div>`;
}

function openClassRoster(id) {
  const admin = state.role === 'administration';
  if (!admin && state.role !== 'professeur') return;
  if (!(admin && id === 'unassigned') && !publicationClasses().some(c => c.id === id)) return;
  state.rosterClass = id;
  state.rosterSearch = '';
  go('eleves');
}

function selectedRosterClass() {
  if (state.role === 'administration' && state.rosterClass === 'unassigned') return state.rosterClass;
  return publicationClasses().some(c => c.id === state.rosterClass) ? state.rosterClass : 'all';
}

function selectedRoster() {
  const selected = selectedRosterClass();
  return visibleStudentAccounts().filter(a => selected === 'all' || a.classId === (selected === 'unassigned' ? '' : selected));
}

function studentRosterResults() {
  const list = selectedRoster();
  const query = searchKey(state.rosterSearch.trim());
  const shown = list.filter(a => bilingualSearchText(a.name).includes(query)).sort((a,b) => a.name.localeCompare(b.name,state.lang));
  const count = shown.length === list.length ? studentCountLabel(list.length) : state.lang === 'ar' ? `${shown.length} من ${list.length}` : `${shown.length} sur ${list.length} élèves inscrits`;
  return `<p class="roster-results-count" role="status" data-no-i18n="true">${count}</p>${shown.length ? `<ul class="roster-list">${shown.map(a => `<li class="roster-row"><div class="student-name">${avatar(accountInitials(a),'mint')}<bdi data-no-i18n="true">${esc(a.name)}</bdi></div><div class="roster-row-meta"><span class="tag blue">${esc(accountClassName(a))}</span><span class="tag ${a.active ? 'mint' : 'orange'}">${accountStatus(a)}</span></div><div class="roster-row-actions"><button class="text-link" data-action="student-detail" data-id="${esc(a.email)}">Voir la fiche</button>${state.role === 'administration' ? `<button class="text-link" data-action="student-reassign" data-id="${esc(a.email)}">Modifier la classe</button>` : ''}</div></li>`).join('')}</ul>` : `<p class="roster-empty">${list.length ? 'Aucun élève ne correspond à la recherche.' : 'Aucun élève inscrit dans cette classe.'}</p>`}`;
}

function studentsPage() {
  const admin = state.role === 'administration';
  const selected = selectedRosterClass();
  const add = admin ? `<button class="btn primary" data-action="new-account" data-value="Élève" data-id="${esc(classById(selected)?.id || '')}">${icon('plus','sm')}Ajouter un élève</button>` : '';
  const choices = [['all','Tous les élèves'],...publicationClasses().map(c => [c.id,c.name]),...(admin ? [['unassigned','Sans classe']] : [])];
  return `${heading(admin ? 'Élèves inscrits' : 'Mes élèves','',add)}<div class="filters roster-filters"><div class="filter-field"><label for="studentClass">Classe</label><select id="studentClass">${libraryOptions(choices,selected)}</select></div><div class="filter-field"><label for="rosterSearch">Recherche</label><div class="search-box">${icon('search')}<input id="rosterSearch" type="search" placeholder="Rechercher un élève…" value="${esc(state.rosterSearch)}"></div></div></div><section class="card" id="rosterResults">${studentRosterResults()}</section>`;
}

function studentDetail(email) {
  const account = visibleStudentAccounts().find(a => accountId(a.email) === accountId(email));
  if (!account) return;
  const entry = classById(account.classId);
  const legacy = !entry && account.class ? `<p class="tiny muted"><span>Ancienne classe</span> <bdi data-no-i18n="true">${esc(account.class)}</bdi></p>` : '';
  const edit = state.role === 'administration' ? homeworkButton('Modifier la classe','student-reassign',account.email,'secondary','edit') : '';
  openModal('Fiche de l’élève',`<div class="flex gap">${avatar(accountInitials(account),'mint','large')}<div><h3><bdi data-no-i18n="true">${esc(account.name)}</bdi></h3><p>${esc(accountClassName(account))}${entry ? ` · ${esc(entry.level)}` : ''}</p>${legacy}</div></div><div class="detail-line">${icon('user')}<span>Statut du compte</span><span class="tag ${account.active ? 'mint' : 'orange'}">${accountStatus(account)}</span></div><div class="homework-actions mt">${edit}${homeworkButton('Fermer','close-modal','','soft')}</div>`);
}

function studentClassOptions(selected) {
  return libraryOptions([['','Sans classe'],...classData.map(c => [c.id,c.name])],selected);
}

function newAccount(defaultRole = 'Élève', classId = '') {
  if (state.role !== 'administration') return;
  const role = ['Élève','Parent','Professeur'].includes(defaultRole) ? defaultRole : 'Élève';
  openModal('Créer un compte',`<form id="accountForm" class="form"><div class="form-grid">
    <div><label for="accountName">Nom complet</label><input id="accountName" name="name" placeholder="Prénom et nom" maxlength="80" dir="auto" required></div>
    <div><label for="newAccountRole">Rôle</label><select id="newAccountRole" name="role">${libraryOptions(['Élève','Parent','Professeur'].map(r => [r,r]),role)}</select></div>
    <div class="full"><label for="accountEmail">Identifiant / e-mail</label><input id="accountEmail" name="email" type="email" placeholder="prenom@exemple.ma" maxlength="120" required></div>
    <div class="full" id="accountStudentFields" hidden><label for="accountStudentClass">Classe</label><select id="accountStudentClass" name="classId" disabled>${studentClassOptions(classById(classId)?.id || '')}</select></div>
    <div class="full"><label for="accountClass">Élève suivi</label><input id="accountClass" name="class" dir="auto" maxlength="80" required></div>${teacherAccountFields()}
    </div><label class="homework-check"><input type="checkbox" name="pendingActivation"> Activation à confirmer</label><p class="tiny muted">Les comptes de cette maquette sont enregistrés dans votre navigateur.</p><div class="homework-actions">${homeworkButton('Annuler','close-modal','','soft')}<button type="submit" class="btn primary">Ajouter le compte</button></div></form>`);
  syncAccountFields(document.getElementById('newAccountRole'));
}

function syncAccountFields(roleInput) {
  if (!roleInput) return;
  const role = roleInput.value;
  const teacher = document.getElementById('teacherAccountFields');
  teacher.hidden = role !== 'Professeur';
  teacher.querySelectorAll('input,select').forEach(input => { input.disabled = teacher.hidden; });
  const student = document.getElementById('accountStudentFields');
  student.hidden = role !== 'Élève';
  document.getElementById('accountStudentClass').disabled = student.hidden;
  const parent = document.getElementById('accountClass');
  parent.disabled = role !== 'Parent';
  parent.closest('div').hidden = parent.disabled;
}

async function saveAccountForm(form, values) {
  if (state.role !== 'administration' || form.dataset.saving) return;
  const name = String(values.name || '').trim().slice(0,80);
  const email = String(values.email || '').trim().slice(0,120);
  const role = values.role;
  if (!name || !/^[^\s@]+@[^\s@]+$/.test(email) || !['Élève','Parent','Professeur'].includes(role)) { toast('Vérifiez le nom, le rôle et l’identifiant.'); return; }
  const classId = values.classId || '';
  if (role === 'Élève' && classId && !classById(classId)) { toast('Choisissez une classe dans la liste.'); return; }
  const fields = role === 'Élève' ? {classId,class:classById(classId)?.name || ''} : accountTeachingData(form,values);
  if (!fields) return;
  const account = {name,email,role,...fields,active:!values.pendingActivation,pendingActivation:!!values.pendingActivation};
  form.dataset.saving = 'true';
  const saved = await updateAccounts(accounts => {
    if (accounts.some(a => accountId(a.email) === accountId(email))) { toast('Cet identifiant existe déjà dans la maquette.'); return null; }
    return [...accounts,account];
  });
  delete form.dataset.saving;
  if (!saved) return;
  if (form.isConnected) closeModal();
  if (state.page === 'comptes') {
    state.accountRole = 'all';
    state.accountStatus = 'all';
    state.accountSearch = '';
  }
  render();
  toast('Le compte a été ajouté à la liste de démonstration.');
}

function editStudentClass(email) {
  if (state.role !== 'administration') return;
  const account = studentAccounts().find(a => accountId(a.email) === accountId(email));
  if (!account) return;
  openModal('Modifier la classe',`<form id="studentClassForm" class="form" data-id="${esc(account.email)}"><h3><bdi data-no-i18n="true">${esc(account.name)}</bdi></h3>${!account.classId && account.class ? `<p><span>Ancienne classe</span> <bdi data-no-i18n="true">${esc(account.class)}</bdi></p>` : ''}<div><label for="assignedClass">Classe</label><select id="assignedClass" name="classId">${studentClassOptions(account.classId)}</select></div><div class="homework-actions">${homeworkButton('Annuler','close-modal','','soft')}<button class="btn primary" type="submit">Enregistrer</button></div></form>`);
}

async function saveStudentClass(form, classId) {
  if (state.role !== 'administration' || form.dataset.saving) return;
  if (classId && !classById(classId)) { toast('Choisissez une classe dans la liste.'); return; }
  const id = accountId(form.dataset.id);
  form.dataset.saving = 'true';
  const saved = await updateAccounts(accounts => {
    if (!accounts.some(a => a.role === 'Élève' && accountId(a.email) === id)) { toast('Ce compte n’est plus disponible.'); return null; }
    return accounts.map(a => accountId(a.email) === id && a.role === 'Élève' ? {...a,classId,class:classById(classId)?.name || ''} : a);
  });
  delete form.dataset.saving;
  if (!saved) return;
  if (form.isConnected) closeModal();
  render();
  toast('Classe mise à jour.');
}

async function changeAccountStatus(email, pendingOnly = false) {
  if (state.role !== 'administration') return;
  const id = accountId(email);
  let active;
  const saved = await updateAccounts(accounts => {
    const account = accounts.find(a => accountId(a.email) === id);
    if (!account || pendingOnly && (account.active || !account.pendingActivation)) return null;
    active = !account.active;
    return accounts.map(a => a === account ? {...a,active,pendingActivation:false} : a);
  });
  if (!saved) return;
  render();
  toast(pendingOnly ? 'Le compte est activé.' : active ? 'Compte de démonstration réactivé.' : 'Compte de démonstration suspendu.');
}

function rosterStatistics() {
  const {start,end} = homeworkWeek();
  return [
    ['users','','Élèves inscrits',studentAccounts().length],
    ['user','mint','Comptes professeur actifs',state.accounts.filter(a => a.role === 'Professeur' && a.active).length],
    ['users','orange','Comptes à activer',state.accounts.filter(a => !a.active && a.pendingActivation).length],
    ['calendar','','Séances de la semaine',visibleSessions('administration').filter(s => !planningNeedsAttention(s) && s.date >= start && s.date <= end).length]
  ];
}

function rosterStatCards() {
  return rosterStatistics().map(([symbol,color,label,value]) => statCard(symbol,color,label,value,'')).join('');
}

function statisticsPage() {
  return `${heading('Statistiques','',homeworkButton('Exporter','export-stats','','secondary','download'))}<div class="stats-grid">${rosterStatCards()}</div><section class="card">${cardHeading('Effectifs par classe','Élèves inscrits','eleves')}<div class="class-list">${classRows(true)}</div></section>`;
}

function exportRosterStatistics() {
  const languages={rightToLeft:state.lang==='ar',subtitle:'Madrassati Maâk'};
  saveSchoolWorkbook([
    {...languages,name:tr('Indicateurs'),title:tr('Statistiques'),headers:[tr('Indicateur'),tr('Valeur')],widths:[44,18],
      rows:rosterStatistics().map(([, ,label,value])=>[tr(label),value])},
    {...languages,name:tr('Classes'),title:tr('Effectifs par classe'),headers:[tr('Classe'),tr('Élèves inscrits')],widths:[36,20],
      rows:[...classData.map(c=>[c.name,classStudents(c.id).length]),[tr('Sans classe'),classStudents('').length]]}
  ],'Madrassati-Statistiques.xlsx');
}

function attendanceForAccounts(accounts,period = state.attendance.period) {
  return accounts.map(account => {
    const example = state.examples && period === 'example' && account.classId === DEMO_CLASS && accountId(account.email) === DEMO_CHILD_ACCOUNT;
    return {account,record:example ? {date:'20/05/2025',subject:'Mathématiques',arrival:'08:02',duration:58,status:'Présent'} : null};
  });
}

function filteredAttendance() {
  const filter = state.attendance;
  const selected = publicationClasses().some(c => c.id === filter.class) ? filter.class : 'all';
  const accounts = visibleStudentAccounts().filter(a => (selected === 'all' || a.classId === selected) && (filter.level === 'all' || classById(a.classId)?.level === filter.level) && bilingualSearchText(a.name).includes(searchKey(filter.search)));
  return attendanceForAccounts(accounts).map(row => row.record && row.record.subject !== filter.subject ? {...row,record:null} : row);
}

function attendanceTable(list) {
  const staff = ['professeur','administration'].includes(state.role);
  const rows = list.map(({account,record}) => `<tr><td><span class="student-name">${avatar(accountInitials(account),'mint')}<bdi data-no-i18n="true">${esc(account.name)}</bdi></span></td><td>${esc(accountClassName(account))}</td><td>${record ? esc(record.date) : '—'}</td><td>${record ? esc(record.arrival) : '—'}</td><td>${record ? `${record.duration} min` : '—'}</td><td>${record ? tag(record.status) : '<span class="tiny muted">Présence non renseignée</span>'}</td>${staff ? `<td><button class="text-link" data-action="student-detail" data-id="${esc(account.email)}">Voir la fiche</button></td>` : ''}</tr>`).join('');
  return `<div class="table-scroll"><table class="data-table attendance-table"><thead><tr><th>Élève</th><th>Classe</th><th>Date</th><th>Heure d’arrivée</th><th>Durée</th><th>Statut</th>${staff ? '<th></th>' : ''}</tr></thead><tbody>${rows || `<tr><td colspan="${staff ? 7 : 6}">Aucun élève ne correspond à ces filtres.</td></tr>`}</tbody></table></div>`;
}

function attendanceStats(list) {
  const records = list.flatMap(row => row.record ? [row.record] : []);
  if (!records.length) return '<p class="roster-empty">Aucune présence enregistrée.</p>';
  const active = records.filter(r => r.duration > 0);
  return `${statCard('users','mint','Taux de présence',`${Math.round(active.length / records.length * 100)}%`,'Sur les présences renseignées')}${statCard('clock','orange','Retards',records.filter(r => r.status === 'En retard').length,'Élèves')}${statCard('user','red','Absences',records.filter(r => r.status === 'Absent').length,'Élèves')}${statCard('clock','','Durée moyenne',active.length ? `${Math.round(active.reduce((total,r) => total + r.duration,0) / active.length)} min` : '—','Par connexion')}`;
}

function exportRosterAttendance() {
  const rows=filteredAttendance().map(({account,record})=>[account.name,accountClassName(account),tr(record?.subject||''),
    xlsxDate(record?.date),record?.arrival||'',record?.duration??'',tr(record?.status||'Présence non renseignée')]);
  saveSchoolWorkbook([{name:tr('Présences'),title:tr('Rapport de présence'),subtitle:'Madrassati Maâk',
    headers:['Élève','Classe','Matière','Date','Heure d’arrivée','Durée (min)','Statut'].map(value=>tr(value)),
    widths:[32,16,26,17,21,18,32],rows,rightToLeft:state.lang==='ar'}],'Madrassati-Presences.xlsx','225974');
  toast('Classeur Excel téléchargé.');
}
