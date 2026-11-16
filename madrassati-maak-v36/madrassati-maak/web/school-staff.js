'use strict';

const SCHOOL_ADMIN_DIRECTORY_VIEWS={
  comptes:{title:'Gestion des comptes',role:'',action:'Créer un compte'},
  eleves:{title:'Élèves inscrits',role:'eleve',action:'Ajouter un élève'},
  professeurs:{title:'Professeurs',role:'professeur',action:'Ajouter un professeur'},
  parents:{title:'Parents',role:'parent',action:'Ajouter un parent'}
};
const SCHOOL_ADMIN_ACCOUNT_FILTERS=[
  ['','Tous les statuts'],['actif','Actifs'],['sans-acces','Accès scolaire à créer'],['suspendu','Suspendus'],['archives','Archives']
];

function schDirectoryFilters() {
  if(!schoolUI.adminFilters) {
    const params=schViewParams();
    const classId=params.get('classe');
    const status=params.get('statut');
    schoolUI.adminFilters={name:'',role:'',
      status:SCHOOL_ADMIN_ACCOUNT_FILTERS.some(([value])=>value===status)?status:'',
      classId:schoolUI.data.directory.classes.some(entry=>entry.id===classId)?classId:''};
  }
  return schoolUI.adminFilters;
}

function schAccountStatus(member) {
  if(member.archived_at!=null)return 'Archivé';
  if(!member.active)return 'Suspendu';
  return member.login?'Actif':'Accès scolaire à créer';
}

function schFirstLogin(member) {
  if(member.onboarding_required&&!member.first_login_at)return 'En attente de première connexion';
  if(member.onboarding_required)return 'Mot de passe à définir';
  return member.first_login_at?schValue(schTimestamp(member.first_login_at)):'—';
}

function schAccountActions(member) {
  const {id,role,active,login,archived_at:archived}=member;
  if(archived!=null)return `<button type="button" class="btn secondary small" data-school-action="account-archive" data-id="${id}">Restaurer</button>`;
  return `<button type="button" class="btn secondary small" data-school-action="account-edit" data-id="${id}">Modifier</button>
    ${active?`<button type="button" class="btn secondary small" data-school-action="member-code" data-id="${id}">
      ${login?'Réinitialiser le code':'Créer un accès scolaire'}</button>`:''}
    <button type="button" class="btn secondary small" data-school-action="account-access" data-id="${id}">${active?'Suspendre':'Réactiver'}</button>
    ${role!=='parent'?`<button type="button" class="btn secondary small" data-school-action="account-archive" data-id="${id}">Archiver</button>`:''}`;
}

function schAccountRows() {
  const directory=schoolUI.data.directory;
  const {name,role,status,classId}=schDirectoryFilters();
  const selectedRole=SCHOOL_ADMIN_DIRECTORY_VIEWS[schPage()].role||role;
  const names=new Map(directory.accounts.map(account=>[account.id,account.name]));
  const classes=new Map(directory.classes.map(entry=>[entry.id,entry.name]));
  const enrolments=new Map(directory.enrolments.map(entry=>[entry.student_id,entry.class_id]));
  const query=searchKey(name.trim());
  const statusMatches={
    'actif':account=>!!account.active,
    'sans-acces':account=>account.active&&!account.login,
    'suspendu':account=>!account.active
  };
  const accounts=directory.accounts.filter(account=>{
    if(selectedRole&&account.role!==selectedRole)return false;
    if((account.archived_at!=null)!==(status==='archives'))return false;
    if(statusMatches[status]&&!statusMatches[status](account))return false;
    if(classId&&account.role==='eleve'&&enrolments.get(account.id)!==classId)return false;
    return searchKey([account.name,account.login,account.email].filter(Boolean).join(' ')).includes(query);
  });
  const unit=state.lang==='ar'?'حساب':accounts.length===1?'compte':'comptes';
  const count=`<p class="admin-result-count" role="status" data-no-i18n="true">${accounts.length} ${unit}</p>`;
  if(!accounts.length)return count+schEmpty('Aucun compte trouvé.');
  return count+`<ul class="admin-list">${accounts.map(account=>{
    const membership=account.role==='professeur' ? schStaffClasses(account.id).map(entry=>entry.name+' · '+entry.subject).join(', ') :
      account.role==='eleve' ? classes.get(enrolments.get(account.id)) :
      directory.guardians.filter(row=>row.parent_id===account.id).map(row=>names.get(row.student_id)).filter(Boolean).join(', ');
    const login=account.login||account.email;
    return `<li class="admin-directory-row">
      <div class="admin-identity">${schStaffAvatar(account.name)}<div><strong>${schValue(account.name)}</strong>
        ${login?`<small><bdi dir="ltr" data-no-i18n="true">${schEsc(login)}</bdi></small>`:''}</div></div>
      <div class="admin-directory-meta"><span class="tag blue">${SCHOOL_ROLE_NAMES[account.role]}</span>
        <span>${membership?schValue(membership):'Sans affectation'}</span></div>
      <div class="school-account-status"><span class="tag ${account.active?'mint':'orange'}">${schAccountStatus(account)}</span>
        ${account.login?`<small class="school-muted"><span>Première connexion</span><br>${schFirstLogin(account)}</small>`:''}</div>
      <div class="admin-row-actions">${schAccountActions(account)}</div>
    </li>`;
  }).join('')}</ul>`;
}

function schAccountsPage() {
  const view=SCHOOL_ADMIN_DIRECTORY_VIEWS[schPage()];
  const directory=schoolUI.data.directory;
  const {name,role,status,classId}=schDirectoryFilters();
  const students=view.role==='eleve';
  const noClasses=students&&!directory.classes.length;
  const noStudents=view.role==='parent'&&!directory.accounts.some(a=>a.role==='eleve'&&a.active);
  return `<div class="school-title school-admin-heading"><h1>${view.title}</h1>
    <div class="admin-page-actions">
      ${!view.role||students?'<button class="btn secondary" type="button" data-school-action="school-import">Importer Excel ou CSV</button>':''}
      <button class="btn primary" type="button" data-school-action="new-account" data-value="${view.role}" ${noClasses||noStudents?'disabled':''}>
        ${siteIcon('plus','sm')} ${view.action}</button>
    </div></div>
    ${noClasses?`<p class="school-note"><a href="#classes" class="text-link">Créer une classe</a></p>`:''}
    ${noStudents?`<p class="school-note">Inscris d’abord un élève pour pouvoir lui associer un parent.
      <a href="#eleves" class="text-link">Voir les élèves inscrits</a></p>`:''}
    <section class="card admin-directory">
      <div class="admin-filters school-workspace-filters">
        <div class="filter-field"><label for="schoolDirectoryName">Recherche</label><div class="search-box">${siteIcon('search')}
          <input id="schoolDirectoryName" type="search" value="${schEsc(name)}" placeholder="Nom ou identifiant…"
            aria-controls="schoolDirectoryResults" data-school-directory="name"></div></div>
        ${!view.role?`<div class="filter-field"><label for="schoolDirectoryRole">Rôle</label>
          <select id="schoolDirectoryRole" data-school-directory="role" aria-controls="schoolDirectoryResults">
            ${[['','Tous les rôles'],['eleve','Élève'],['professeur','Professeur'],['parent','Parent']].map(([value,label])=>schOpt(value,label,role)).join('')}
          </select></div>`:''}
        ${students?`<div class="filter-field"><label for="schoolDirectoryClass">Classe</label>
          <select id="schoolDirectoryClass" data-school-directory="classId" aria-controls="schoolDirectoryResults">
            ${schOpt('','Toutes les classes',classId)}${directory.classes.map(entry=>schOpt(entry.id,entry.name,classId)).join('')}
          </select></div>`:''}
        <div class="filter-field"><label for="schoolDirectoryStatus">Statut du compte</label>
          <select id="schoolDirectoryStatus" data-school-directory="status" aria-controls="schoolDirectoryResults">
            ${SCHOOL_ADMIN_ACCOUNT_FILTERS.map(([value,label])=>schOpt(value,label,status)).join('')}
          </select></div>
      </div>
      <div id="schoolDirectoryResults">${schAccountRows()}</div>
    </section>`;
}

function schDirectoryInput(field) {
  const results=schNode('schoolDirectoryResults');
  if(!results||schoolUI.data?.account.role!=='administration'||schoolUI.data.view!==schPage())return false;
  const filter=field.dataset.schoolDirectory;
  const values=schDirectoryFilters();
  if(!Object.hasOwn(values,filter))return false;
  values[filter]=field.value;
  results.innerHTML=localizeHTML(schAccountRows());
  return true;
}

function schRoleInputs(role) {
  const form=schNode('schoolAccountForm');
  if(!form)return;
  for(const group of form.querySelectorAll('[data-school-member]')){
    const show=group.dataset.schoolMember===role;
    group.hidden=!show;
    for(const field of group.querySelectorAll('input,select'))field.disabled=!show;
  }
}

function schStudentClassField(selected='') {
  const {classes}=schoolUI.data.directory;
  return `<div><label for="schoolStudentClass">Classe</label>
    <select id="schoolStudentClass" name="studentClass" required>${schOpt('','Choisis une classe',selected)}
      ${classes.map(c=>schOpt(c.id,c.name,selected)).join('')}</select></div>`;
}

function schTeacherClassesFields(assignments=[]) {
  const {classes}=schoolUI.data.directory;
  const subject=assignments.find(row=>row.subject?.trim())?.subject;
  return `<div><label for="schoolSubject">Matière</label><select id="schoolSubject" name="subject"
    ${assignments.length?'required':''}>${schSubjectOptions(subject)}</select></div>
    <fieldset class="school-choices"><legend>Classes enseignées</legend>${classes.length?classes.map(c=>
      `<label><input type="checkbox" name="teacherClass" value="${c.id}" ${assignments.some(row=>row.id===c.id)?'checked':''}>
        <span>${schValue(c.name)}</span></label>`).join(''):
      schEmpty('Crée une classe pour commencer.')}</fieldset>`;
}

function schParentChildrenField(parentId) {
  const {accounts,classes,enrolments,guardians}=schoolUI.data.directory;
  const classNames=new Map(classes.map(entry=>[entry.id,entry.name]));
  const studentClasses=new Map(enrolments.map(entry=>[entry.student_id,classNames.get(entry.class_id)]));
  const selected=new Set(guardians.filter(row=>row.parent_id===parentId).map(row=>row.student_id));
  const students=accounts.filter(a=>a.role==='eleve'&&(a.active||selected.has(a.id)));
  return `<fieldset class="school-choices"><legend>Élèves associés</legend>
    ${students.length?students.map(student=>{
      const className=studentClasses.get(student.id);
      return `<label><input type="checkbox" name="child" value="${student.id}" ${selected.has(student.id)?'checked':''}>
        <span>${schValue(student.name)}${className?` <small class="school-muted">· ${schValue(className)}</small>`:''}</span></label>`;
    }).join(''):schEmpty('Aucun élève inscrit.')}</fieldset>`;
}

function schNewAccount(preferredRole) {
  const {classes,accounts}=schoolUI.data.directory;
  const hasStudents=accounts.some(a=>a.role==='eleve'&&a.active);
  const roles=[...(classes.length?['eleve']:[]),'professeur',...(hasStudents?['parent']:[])];
  const parent=preferredRole==='parent';
  if(parent&&!hasStudents)return;
  const role=roles.includes(preferredRole)?preferredRole:roles[0];
  const classId=role==='eleve'?schDirectoryFilters().classId:'';
  schShowDialog(parent?'Nouveau compte parent':'Nouveau compte',`<form class="form" id="schoolAccountForm" data-school-form="account">
    <div class="school-fields">
      <div><label for="schoolMemberName">Nom</label><input id="schoolMemberName" name="name" maxlength="100" required></div>
      ${parent?'<input type="hidden" name="role" value="parent">':`<div><label for="schoolMemberRole">Rôle</label>
        <select name="role" id="schoolMemberRole">${roles.map(value=>schOpt(value,SCHOOL_ROLE_NAMES[value],role)).join('')}</select></div>`}
      <div><label for="schoolMemberLogin">Identifiant scolaire (facultatif)</label><input id="schoolMemberLogin" name="login" dir="ltr" maxlength="40"></div>
    </div>
    ${parent?'':`<div data-school-member="eleve" hidden>${schStudentClassField(classId)}</div>
      <div class="school-stack" data-school-member="professeur" hidden>${schTeacherClassesFields()}</div>`}
    <div data-school-member="parent" hidden>${schParentChildrenField()}</div>
    <p class="school-muted school-small">Un code personnel sera affiché après la création du compte.</p>
    ${schError()}<div><button type="submit" class="btn primary">Créer le compte</button></div></form>`);
  schRoleInputs(role);
}

function schEditAccount(member) {
  const {role,id,name,revision}=member;
  const {enrolments}=schoolUI.data.directory;
  schShowDialog('Modifier le compte',`<form class="form" data-school-form="account-edit" data-id="${id}" data-role="${role}" data-revision="${revision}">
    <div><label for="schoolMemberName">Nom</label><input id="schoolMemberName" name="name" value="${schEsc(name)}" maxlength="100" required></div>
    ${role==='eleve'?schStudentClassField(enrolments.find(row=>row.student_id===id)?.class_id):
      role==='parent'?schParentChildrenField(id):schTeacherClassesFields(schStaffClasses(id))}
    ${schError()}<div><button type="submit" class="btn primary">Enregistrer les modifications</button></div></form>`);
}

function schArchiveAccount(member) {
  const archived=member.archived_at==null;
  const label=archived?'Archiver le compte':'Restaurer le compte';
  schShowDialog(label,`<form class="form" data-school-form="account-archive" data-id="${member.id}"
    data-revision="${member.revision}" data-archived="${archived}">
    <p><strong>${schValue(member.name)}</strong></p>
    <p>${archived?'L’accès scolaire sera désactivé. L’historique et les affectations seront conservés.':
      'L’accès scolaire et les affectations de ce compte seront réactivés.'}</p>
    ${schError()}<div><button type="submit" class="btn ${archived?'danger':'primary'}">${label}</button></div></form>`);
}

function schStaffClasses(teacher) {
  const data=schoolUI.data;
  if(data.account.role==='professeur')return data.directory.classes;
  return data.directory.teaching.filter(row=>row.teacher_id===teacher).flatMap(row=>{
    const entry=data.directory.classes.find(c=>c.id===row.class_id);
    return entry ? [{...entry,subject:row.subject}] : [];
  });
}

function schSessionEditor(item,draft=item) {
  const data=schoolUI.data;
  const admin=data.account.role==='administration';
  const teachers=admin?data.directory.accounts.filter(a=>a.role==='professeur' && a.active && schStaffClasses(a.id).length):[];
  const match=(member,subject)=>schStaffClasses(member.id).some(row=>row.id===item?.class_id&&(!subject||row.subject===subject));
  const teacher=admin?(teachers.find(a=>a.id===item?.teacher_id&&match(a))||teachers.find(a=>match(a,item?.subject))||
    teachers.find(a=>match(a))||teachers[0])?.id:data.account.id;
  const classes=schStaffClasses(teacher);
  if(!teacher || !classes.length)return schToast('Attribue une classe à un professeur avant de publier.');
  const today=schDay(schNow());
  const week=schoolUI.data.week;
  const defaultDate=today>=week.start&&today<=week.end ? today : week.start;
  schoolUI.editor={kind:'session',item};
  const title=item?'Modifier la séance':draft?.kind==='course'?'Ajouter un cours':'Nouvelle séance';
  schShowDialog(title,`<form class="form" id="schoolSessionForm" data-school-form="session">
    <div class="school-fields">
      <div class="school-full"><label for="schoolSessionTitle">Titre</label>
        <input name="title" id="schoolSessionTitle" value="${schEsc(draft?.title)}" maxlength="120" required></div>
      ${admin?`<div><label for="schoolSessionTeacher">Professeur</label><select name="teacher" id="schoolSessionTeacher" required>
        ${teachers.map(a=>schOpt(a.id,a.name,teacher)).join('')}</select></div>`:''}
      <div><label for="schoolSessionClass">Classe</label><select name="class" id="schoolSessionClass" required>
        ${item?schOpt('','Choisis une classe',classes.some(c=>c.id===item.class_id)?item.class_id:''):''}
        ${classes.map(c=>schOpt(c.id,c.name+' · '+c.subject,draft?.class_id)).join('')}</select></div>
      <div><label for="schoolSessionDate">Date de la séance</label>
        <input type="date" name="date" id="schoolSessionDate" value="${item?.date||defaultDate}" required></div>
      <div><label for="schoolSessionTime">Heure de début</label>
        <input type="time" name="time" id="schoolSessionTime" value="${schClock(item?.start_minute??540)}" required></div>
      <div><label for="schoolSessionDuration">Durée en minutes</label>
        <input type="number" name="duration" id="schoolSessionDuration" value="${draft?.duration??45}" min="1" max="1440" required></div>
      <div class="school-full">
        <button class="btn secondary" type="button" data-school-action="slots">Proposer des créneaux</button>
        <div class="school-stack school-note" id="schoolSlots" role="status"></div>
      </div>
      ${admin?schSeriesFields(item):''}
      <div class="school-full"><label for="schoolSessionDescription">Consigne</label>
        <textarea name="description" id="schoolSessionDescription" maxlength="${TEACHER_LESSON_PUBLISH_LIMIT}">${schEsc(draft?.description)}</textarea></div>
      <div><label for="schoolMeeting">Lien de la séance</label><input type="url" name="meeting" id="schoolMeeting" value="${schEsc(item?.meeting_url)}" placeholder="https://"></div>
      <div><label for="schoolVideo">Lien vidéo</label><input type="url" name="video" id="schoolVideo" value="${schEsc(item?.video_url)}" placeholder="https://"></div>
      <div class="school-full"><label for="schoolSupport">Support de la séance</label>
        <input type="file" id="schoolSupport" name="support" accept="application/pdf,video/mp4,video/webm,.pdf,.mp4,.webm">
        <p class="school-small school-muted">PDF, MP4 ou WebM · 12 Mo maximum</p>
        ${item?.file?`<label class="school-small"><input type="checkbox" name="removeFile" value="1"> Retirer le support actuel · ${schValue(item.file.name)}</label>`:''}</div>
      <div class="school-full"><label for="schoolExercise">Exercice associé</label>
        <textarea name="exercise" id="schoolExercise" maxlength="12000">${schEsc(draft?.exercise)}</textarea></div>
      <details class="school-full school-details" ${item?.short_exercise?'open':''}><summary>Version courte du devoir (mode fatigue)</summary>
        <label for="schoolShortExercise">Consigne courte</label>
        <textarea name="shortExercise" id="schoolShortExercise" maxlength="2000">${schEsc(item?.short_exercise)}</textarea></details>
      <div><label for="schoolDue">Date de remise</label>
        <input type="date" name="due" id="schoolDue" value="${item?.due_date||''}"></div>
    </div>
    <p class="school-small school-muted">Les horaires du planning utilisent l’heure du Maroc.</p>
    <section id="schoolSessionPreview" class="card school-stack" tabindex="-1" hidden></section>
    ${schError()}<div class="school-actions">
      <button type="button" class="btn secondary" data-school-action="preview-session">Aperçu élève</button>
      <button type="submit" class="btn primary">${item?'Enregistrer la séance':'Publier la séance'}</button></div></form>`);
}

function schSessionCancellationDialog(item) {
  if(!item||schoolUI.data.account.role!=='administration')return;
  const cancel=item.cancelled_at==null;
  const title=cancel?'Annuler la séance':'Rétablir la séance';
  schShowDialog(title,`<form class="form" data-school-form="session-cancellation"
    data-id="${item.id}" data-revision="${item.revision}" data-cancel="${cancel}">
    <div><h3>${schValue(item.title)}</h3>${schSessionMeta(item)}</div>
    ${cancel?`<div><label for="schoolCancelReason">Motif de l’annulation</label>
      <textarea id="schoolCancelReason" name="reason" maxlength="400" rows="3" dir="auto" required></textarea></div>`:''}
    <p class="school-small school-muted">Le professeur, les élèves et leurs parents seront avertis dans leur espace.</p>
    ${schError()}<div><button type="submit" class="btn ${cancel?'danger':'primary'}">${title}</button></div>
    </form>`);
}

function schSessionValues(form) {
  const payload=new FormData(form);
  const [hour,minute]=String(payload.get('time')||'').split(':').map(Number);
  const start=hour*60+minute;
  payload.set('start',String(start));
  const item=schoolUI.editor?.item;
  if(item){payload.set('id',item.id);payload.set('revision',String(item.revision));}
  return payload;
}

function schPreviewSession() {
  const form=schNode('schoolSessionForm');
  if(!form?.reportValidity())return;
  const values=schSessionValues(form);
  const old=schoolUI.editor?.item;
  const teacher=values.get('teacher')||schoolUI.data.account.id;
  const entry=schStaffClasses(teacher).find(c=>c.id===values.get('class'));
  if(!entry)return schToast('Choisis une classe');
  const duration=Number(values.get('duration'));
  if(Number(values.get('start'))+duration>1440)return schToast('La séance doit finir le même jour.');
  const file=form.elements.support.files[0];
  const video=values.get('video');
  const meeting=values.get('meeting');
  if((video&&!schSafeLink(video))||(meeting&&!schSafeLink(meeting)))return schToast('Utilise un lien HTTPS valide.');
  if(file&&file.size>12*1024*1024)return schToast('Le support doit faire au plus 12 Mo.');
  schClearPreview();
  if(file)schoolUI.previewUrl=URL.createObjectURL(file);
  const item={id:old?.id,title:values.get('title'),subject:entry.subject,class_name:entry.name,
    date:values.get('date'),start_minute:Number(values.get('start')),duration,description:values.get('description'),
    exercise:values.get('exercise'),short_exercise:values.get('shortExercise'),due_date:values.get('due'),video_url:video,meeting_url:meeting,
    file:file?{name:file.name,type:file.type || (/\.mp4$/i.test(file.name)?'video/mp4':/\.webm$/i.test(file.name)?'video/webm':'application/pdf')}:
      values.get('removeFile')==='1'?null:old?.file};
  const preview=schNode('schoolSessionPreview');
  preview.innerHTML=localizeHTML(`<h3>Vérifier la séance avant publication</h3><strong>${schValue(item.title)}</strong>
    ${schSessionContent(item,schoolUI.previewUrl)}
    ${item.short_exercise?`<section class="school-block"><h3>Exercice en version courte</h3><p data-no-i18n="true" dir="auto">${schEsc(item.short_exercise)}</p></section>`:''}`);
  preview.hidden=false;
  preview.focus();
  preview.scrollIntoView({block:'nearest'});
}

async function schSlots(button) {
  const form=schNode('schoolSessionForm');
  const values=new FormData(form);
  const id=schoolUI.editor?.item?.id;
  const query=new URLSearchParams({teacher:values.get('teacher')||'',class:values.get('class')||'',
    date:values.get('date')||'',duration:values.get('duration')||'',session:id||''});
  const output=schNode('schoolSlots');
  button.disabled=true;
  try {
    const {slots}=await schRequest('/slots?'+query);
    if(!output.isConnected)return;
    output.innerHTML=localizeHTML(slots.length?
      `<p class="school-small school-muted">Créneaux proposés, du lundi au vendredi, entre 8 h et 18 h.</p><div class="school-actions">${slots.map(slot=>
        `<button type="button" class="btn secondary small" data-school-action="pick-slot" data-date="${slot.date}" data-start="${slot.start_minute}">
          ${schValue(schDate(slot.date)+' · '+schClock(slot.start_minute))}</button>`).join('')}</div>`:
      schEmpty('Aucun créneau trouvé dans les deux prochaines semaines.'));
  } catch(error){output.textContent=tr(error.message);}
  finally{button.disabled=false;}
}

function schPeriodStatus(period) {
  const label=SCHOOL_PERIOD_LABELS[period?.phase]||'Saisie fermée';
  return `<div class="school-stack"><div><span class="tag ${period?.phase==='open'||period?.phase==='published'?'mint':'orange'}">${label}</span></div>
    ${period?`<div class="school-meta"><span>Ouverture</span> ${schValue(schTimestamp(period.opens_at))}
      · <span>Fermeture</span> ${schValue(schTimestamp(period.end))}
      ${period.publish_at!==null?` · <span>Publication</span> ${schValue(schTimestamp(period.publish_at))}`:''}</div>`:''}</div>`;
}

function schAdminNotes() {
  const period=schPeriod();
  const complete=period?.phase==='published';
  const closes=period&&!complete?schMinute(period.closes_at):'';
  const opens=period&&!complete?schMinute(period.opens_at):schMinute(schNow());
  const progress=schoolUI.data.gradeProgress||[];
  return `<div class="school-title"><h1>Périodes et résultats</h1>
    ${period?.phase!=='open'?'<button type="button" class="btn primary" data-school-action="open-grades">Ouvrir la saisie des notes</button>':''}</div>
    <div class="school-grid">
      <section class="card school-stack"><h2>Période de saisie</h2>${schPeriodStatus(period)}
        <p class="school-small school-muted">Les dates et heures utilisent l’heure du Maroc.</p>
        <form class="form" data-school-form="period" data-id="${period?.id||''}" data-revision="${period?.revision||''}">
          <div class="school-fields">
            <div><label for="schoolOpens">Date et heure d’ouverture</label><input id="schoolOpens" type="datetime-local" name="opens" dir="ltr" value="${opens}" required></div>
            <div><label for="schoolCloses">Date et heure de fermeture</label><input id="schoolCloses" type="datetime-local" name="closes" dir="ltr" value="${closes}" required></div>
          </div>
          ${schError()}<div class="school-actions">
            <button type="submit" class="btn secondary">Enregistrer la période</button>
            ${['open','scheduled'].includes(period?.phase)?'<button type="button" class="btn secondary" data-school-action="close-period">Fermer la saisie</button>':''}
          </div></form></section>
      <section class="card school-stack"><h2>Publication</h2>
        ${!period||complete?`<p class="school-muted">${complete?'Notes publiées':'L’administration publie les notes après la saisie.'}</p>`:
        `<form class="form" data-school-form="publication" data-id="${period.id}" data-revision="${period.revision}">
          <div><label for="schoolPublish">Date et heure de publication</label><input type="datetime-local" id="schoolPublish" name="publish"
            dir="ltr" value="${period.publish_at!==null?schMinute(period.publish_at):''}" required></div>
          ${schError()}<div class="school-actions"><button type="submit" class="btn primary">Programmer la publication</button>
            <button type="button" class="btn secondary" data-school-action="publish-now" ${period.end<=schNow()?'':'disabled'}>Publier maintenant</button>
            ${period.publish_at!==null?'<button type="button" class="btn secondary" data-school-action="cancel-publication">Annuler la programmation</button>':''}</div>
          </form>`}</section>
      <section class="card school-full"><h2>Avancement de la saisie</h2>
        ${progress.length?`<div class="school-table-wrap"><table class="school-table"><thead><tr><th scope="col">Classe</th>
          <th scope="col">Matière</th><th scope="col">Évaluation</th><th scope="col">Notes saisies</th></tr></thead>
          <tbody>${progress.map(row=>`<tr><td>${schValue(row.class_name)}</td><td>${schValue(row.subject)}</td><td>${schValue(row.title)}</td>
            <td><bdi dir="ltr">${row.marked} / ${row.total}</bdi></td></tr>`).join('')}</tbody></table></div>`:
          schEmpty('Aucune évaluation dans cette période.')}</section>
    </div>`;
}

function schOpenGrades() {
  const period=schPeriod();
  const fallback=schNow()+7*86400000;
  const closes=period?.phase==='scheduled'?period.closes_at:fallback;
  schShowDialog('Ouvrir la saisie des notes',`<form class="form" data-school-form="open-grades" data-id="${period?.id||''}"
    data-revision="${period?.revision||''}">
    <p>Les professeurs pourront saisir les notes de leurs classes jusqu’à cette échéance.</p>
    <div><label for="schoolOpenUntil">Date et heure de fermeture</label><input type="datetime-local" id="schoolOpenUntil"
      name="closes" dir="ltr" value="${schMinute(closes)}" required></div>
    <p class="school-small school-muted">Les dates et heures utilisent l’heure du Maroc.</p>${schError()}
    <div><button type="submit" class="btn primary">Donner accès aux professeurs</button></div></form>`);
}

function schNotesPage() {
  const data=schoolUI.data;
  if(data.account.role==='administration')return schAdminNotes();
  if(['eleve','parent'].includes(data.account.role))return schResultsPage();
  const period=schPeriod();
  const list=data.evaluations||[];
  return `<div class="school-title"><h1>Saisie des notes</h1><a class="btn secondary" href="#evaluations">Voir les évaluations</a></div>
    <section class="card school-period" role="status">${schPeriodStatus(period)}</section>
    <section class="card"><h2>Évaluations</h2>${list.length?list.map(item=>{
      const scores=item.draft?.scores||item.scores;
      const missing=item.editable?data.directory.students.filter(student=>student.class_id===item.class_id&&!Object.hasOwn(scores,student.id)).length:0;
      return `<article class="school-session">
      <div class="school-session-top"><div><h3>${schValue(item.title)}</h3><div class="school-meta">${schValue(item.class_name)}
        · ${schValue(item.subject)} · ${schValue(schDate(item.date))}</div></div><div class="school-actions">
        <span class="tag ${item.publish_at!==null&&item.publish_at<=schNow()?'mint':'orange'}">${item.publish_at!==null&&item.publish_at<=schNow()?
          'Notes publiées':item.draft?'Brouillon automatique':item.id?'Notes enregistrées':'À noter'}</span>
        ${missing?`<span class="tag orange">${schCountLabel(missing,'note manquante','notes manquantes')}</span>`:''}
        <button class="btn secondary small" type="button" data-school-action="edit-grade" data-id="${item.id||item.assessment_id}"
          ${!item.id&&!item.editable?'disabled':''}>
          ${item.editable&&period?.phase==='open'?'Saisir les notes':item.id?'Voir les notes':'Saisie fermée'}</button></div></div></article>`;
    }).join(''):
        schEmpty('Ajoute une évaluation pour préparer la saisie.')}</section>`;
}

const SCHOOL_ASSESSMENT_NAMES={test:'Contrôle',exam:'Examen',oral:'Oral',other:'Autre évaluation'};

function schAssessmentsPage() {
  const data=schoolUI.data;
  const teacher=data.account.role==='professeur';
  const items=data.assessments||[];
  return `<div class="school-title"><h1>Évaluations</h1>${teacher?
    `<button class="btn primary" type="button" data-school-action="edit-assessment" ${data.directory.classes.length?'':'disabled'}>Ajouter une évaluation</button>`:''}</div>
    <section class="card school-stack">${items.length?items.map(item=>`<article class="school-session school-stack">
      <div class="school-session-top"><div><h2>${schValue(item.title)}</h2>
      <div class="school-meta"><span>${SCHOOL_ASSESSMENT_NAMES[item.kind]}</span> ·
        ${schValue(item.class_name+' · '+item.subject+' · '+schDate(item.date))}</div></div>
      ${teacher&&!item.graded?`<div class="school-actions">
        <button class="btn secondary small" type="button" data-school-action="edit-assessment" data-id="${item.id}">Modifier</button>
        <button class="btn danger small" type="button" data-school-action="remove-assessment" data-id="${item.id}">Supprimer</button>
        </div>`:teacher&&item.graded?'<span class="tag mint">Notes enregistrées</span>':''}</div>
      ${item.instruction?`<p class="school-text" data-no-i18n="true" dir="auto">${schEsc(item.instruction)}</p>`:''}</article>`).join(''):
    schEmpty('Aucune évaluation enregistrée.')}</section>`;
}

function schAssessmentEditor(item,draft=item) {
  const classes=schoolUI.data.directory.classes;
  if(!classes.length)return;
  schShowDialog(item?'Modifier l’évaluation':'Ajouter une évaluation',`<form class="form" data-school-form="assessment"
    data-id="${item?.id||''}" data-revision="${item?.revision||''}">
    <div class="school-fields">
      <div class="school-full"><label for="schoolAssessmentTitle">Titre de l’évaluation</label>
        <input name="title" id="schoolAssessmentTitle" maxlength="120" value="${schEsc(item?.title)}" required></div>
      <div><label for="schoolAssessmentClass">Classe</label><select name="classId" id="schoolAssessmentClass" required>
        ${classes.map(c=>schOpt(c.id,c.name+' · '+c.subject,draft?.class_id)).join('')}</select></div>
      <div><label for="schoolAssessmentType">Type d’évaluation</label><select name="kind" id="schoolAssessmentType">
        ${Object.entries(SCHOOL_ASSESSMENT_NAMES).map(([kind,name])=>schOpt(kind,name,draft?.kind)).join('')}</select></div>
      <div><label for="schoolAssessmentDate">Date de l’évaluation</label><input type="date" name="date" id="schoolAssessmentDate"
        value="${item?.date||schDay(schNow())}" required></div>
      <div class="school-full"><label for="schoolAssessmentInstruction">Consigne</label>
        <textarea name="instruction" id="schoolAssessmentInstruction" maxlength="12000">${schEsc(draft?.instruction)}</textarea></div>
    </div>${schError()}<div><button type="submit" class="btn primary">${item?'Enregistrer':'Publier l’évaluation'}</button></div></form>`);
}

function schGradeRows(classId,scores={}) {
  const students=schoolUI.data.directory.students.filter(s=>s.class_id===classId);
  if(!students.length)return schEmpty('Aucun élève inscrit dans cette classe.');
  return `<div class="school-table-wrap"><table class="school-table"><thead><tr><th scope="col">Élève</th>
    <th scope="col" id="schoolScoreHeading">Note / 20</th></tr></thead><tbody>
    ${students.map((student,i)=>`<tr><th scope="row" id="schoolScoreStudent${i}">${schValue(student.name)}</th>
      <td><input type="text" inputmode="decimal" dir="ltr" name="score:${student.id}" class="school-mark"
        value="${schEsc(String(scores[student.id]??'').replace('.',','))}" aria-labelledby="schoolScoreHeading schoolScoreStudent${i}"></td></tr>`).join('')}
    </tbody></table></div>`;
}

function schGradeEditor(item) {
  const period=schPeriod();
  if(!item)return;
  const current=schoolUI.data.directory.classes.find(c=>c.id===item.class_id);
  if(!current)return;
  schoolUI.editor={kind:'grade',item,periodId:item.period_id||period?.id,draftRevision:item.draft?.revision||0,
    accountId:schoolUI.data.account.id};
  schShowDialog('Notes de l’évaluation',`<form class="form" id="schoolGradeForm" data-school-form="grade">
    <div><h3>${schValue(item.title)}</h3><p class="school-small school-muted">${schValue(current.name+' · '+current.subject+' · '+schDate(item.date))}</p></div>
    <p id="schoolGradeHint" role="status" class="school-muted school-small">L’administration publie les notes après la saisie.</p>
    ${item.editable?`<p id="schoolGradeDraftStatus" role="status" class="school-muted school-small">${item.draft?'Brouillon récupéré.':'Le brouillon s’enregistre automatiquement pendant la saisie.'}</p>`:''}
    <fieldset class="school-scores school-stack" id="schoolGradeFields"><legend class="sr-only">Notes de l’évaluation</legend>
      <div>${schGradeRows(current.id,item.draft?.scores||item.scores)}</div></fieldset>
    ${item.editable?schGradeImportControls():''}
    ${schError()}<div class="school-actions"><button class="btn primary" type="submit">Enregistrer les notes</button>
      <button class="btn secondary" type="button" data-school-action="grade-workbook">Exporter le tableau Excel</button></div></form>`);
  schSyncEditor();
}

function schGradeValues(values) {
  return Object.fromEntries([...values].filter(([key])=>key.startsWith('score:')).map(([key,score])=>
    [key.slice(6),arabicNumbersToLatin(score)]));
}

function schGradePayload(editor,scores) {
  const item=editor.item;
  return {id:item.id,revision:item.revision,assessmentId:item.assessment_id,assessmentRevision:item.assessment_revision||0,
    periodId:editor.periodId,classId:item.class_id,title:item.title,date:item.date,draftRevision:editor.draftRevision,scores};
}

function schGradeStatus(editor,message) {
  if(schoolUI.editor===editor&&schDialog().open) {
    const status=schNode('schoolGradeDraftStatus');
    if(status)status.textContent=tr(message);
  }
}

async function schFlushGradeDraft(editor) {
  clearTimeout(editor.draftTimer);
  if(editor.draftRequest)await editor.draftRequest;
  if(!editor.pendingScores||editor.committing)return;
  const scores=editor.pendingScores;
  editor.pendingScores=null;
  const request=schRequest('/evaluation/draft',schGradePayload(editor,scores)).then(draft=>{
    const {revision}=draft;
    editor.draftRevision=revision;
    const data=schoolUI.data;
    if(data?.account.id===editor.accountId) {
      const item=data.evaluations?.find(row=>row.id===editor.item.id&&row.assessment_id===editor.item.assessment_id&&
        row.revision===editor.item.revision&&row.assessment_revision===editor.item.assessment_revision);
      if(item&&(item.draft?.revision||0)<revision)item.draft=draft;
    }
    if(!editor.pendingScores)schGradeStatus(editor,'Brouillon enregistré.');
  }).catch(error=>{
    if(schoolUI.editor===editor&&schDialog().open)schGradeStatus(editor,error.message);
    else if(schoolUI.data?.account.role==='professeur')schToast(error.message);
  });
  editor.draftRequest=request;
  await request;
  if(editor.draftRequest===request)editor.draftRequest=null;
}

function schGradeInput(target) {
  const editor=schoolUI.editor;
  if(target.form?.id!=='schoolGradeForm'||!target.name.startsWith('score:')||editor?.kind!=='grade'||editor.committing)return false;
  editor.pendingScores=schGradeValues(new FormData(target.form));
  clearTimeout(editor.draftTimer);
  schGradeStatus(editor,'Enregistrement du brouillon…');
  editor.draftTimer=setTimeout(()=>schFlushGradeDraft(editor),650);
  return true;
}

function schCloseGradeEditor(editor) {
  if(editor?.kind!=='grade'||editor.committing||!editor.pendingScores&&!editor.draftRequest)return;
  schFlushGradeDraft(editor).then(()=>{
    if(schoolUI.data?.account.role==='professeur'&&schPage()==='notes')schLoad({quiet:true});
  });
}

async function schSaveGradeEditor(button,values) {
  const editor=schoolUI.editor;
  if(editor?.kind!=='grade'||editor.committing||schoolUI.busy||schPeriod()?.phase!=='open')return;
  const scores=schGradeValues(values);
  editor.committing=true;
  clearTimeout(editor.draftTimer);
  editor.pendingScores=null;
  schSyncEditor();
  if(editor.draftRequest)await editor.draftRequest;
  if(schoolUI.editor===editor&&schDialog().open) {
    await schMutation(button,'/evaluation',schGradePayload(editor,scores),'Les notes ont été enregistrées.',{close:true});
  }
  editor.committing=false;
  schSyncEditor();
}

function schSyncEditor() {
  if(schoolUI.editor?.kind!=='grade')return;
  const form=schNode('schoolGradeForm');
  if(!form || !schDialog().open)return;
  const period=schPeriod();
  const open=period?.phase==='open'&&period.id===schoolUI.editor.periodId;
  schNode('schoolGradeFields').disabled=!open||schoolUI.editor.committing;
  form.querySelector('[type=submit]').disabled=!open||schoolUI.busy||schoolUI.editor.committing;
  const importFile=schNode('schoolGradeImportFile');
  if(importFile)importFile.disabled=!open||schoolUI.editor.committing;
  const applyImport=form.querySelector('[data-school-action="grade-apply-import"]');
  if(applyImport)applyImport.disabled=!open||schoolUI.editor.committing||!!schoolUI.editor.importPlan?.errors.length;
  schNode('schoolGradeHint').textContent=tr(open?'L’administration publie les notes après la saisie.':'Lecture seule');
}

function schStaffChange(target) {
  if(target.id==='schoolGradeImportFile')return schGradeImportFile(target);
  if(target.id==='schoolMemberRole')schRoleInputs(target.value);
  if(target.name==='teacherClass') {
    const subject=target.form?.elements.namedItem('subject');
    if(subject)subject.required=!!target.form.querySelector('[name="teacherClass"]:checked');
  }
  if(target.id==='schoolSessionTeacher'){
    const field=schNode('schoolSessionClass');
    const current=field.value;
    field.innerHTML=localizeHTML(schOpt('','Choisis une classe')+
      schStaffClasses(target.value).map(c=>schOpt(c.id,c.name+' · '+c.subject,current)).join(''));
  }
  if(target.closest('#schoolSessionForm')){
    schSeriesChange(target.form);
    schNode('schoolSessionPreview').hidden=true;
    schNode('schoolSlots').innerHTML='';
    schClearPreview();
  }
}

const schPeriodPayload=form=>({id:Number(form.dataset.id)||null,revision:Number(form.dataset.revision)||null,timeZone:SCHOOL_TIME_ZONE});

function schStaffSubmit(form,button) {
  const values=new FormData(form);
  const data=Object.fromEntries(values);
  switch(form.dataset.schoolForm){
    case 'class':
      return schMutation(button,'/classes',data,'La classe a été créée.');
    case 'account':
      data.classIds=data.role==='eleve'?[data.studentClass]:values.getAll('teacherClass');
      data.childIds=values.getAll('child');
      data.auth='school';
      return schMutation(button,'/accounts',data,'Le compte a été enregistré.',{onSaved(result){
        if(result.credential)schCredentialsDialog([{name:data.name,...result.credential}]);
        else if(schDialog().open)schDialog().close();
      }});
    case 'account-edit':
      return schMutation(button,'/accounts/edit',{id:form.dataset.id,revision:Number(form.dataset.revision),name:data.name,
        classIds:form.dataset.role==='eleve'?[data.studentClass]:values.getAll('teacherClass'),subject:data.subject,
        childIds:values.getAll('child')},
      'Le compte a été mis à jour.',{close:true});
    case 'account-archive': {
      const archived=form.dataset.archived==='true';
      return schMutation(button,'/accounts/archive',{id:form.dataset.id,revision:Number(form.dataset.revision),archived},
        archived?'Le compte a été archivé.':'Le compte a été restauré.',{close:true});
    }
    case 'session':
      return schSaveSession(form,button);
    case 'session-cancellation': {
      const cancel=form.dataset.cancel==='true';
      return schMutation(button,'/session/cancellation',{id:form.dataset.id,revision:Number(form.dataset.revision),cancel,reason:data.reason},
        cancel?'La séance a été annulée.':'La séance a été rétablie.',{close:true});
    }
    case 'period':
      return schMutation(button,'/period',{...schPeriodPayload(form),...data},'La période a été enregistrée.');
    case 'open-grades':
      return schMutation(button,'/period',{...schPeriodPayload(form),...data,action:'open'},'La saisie est ouverte.',{close:true});
    case 'publication':
      return schMutation(button,'/period/publish',{...schPeriodPayload(form),...data},'La publication a été programmée.');
    case 'assessment':
      return schMutation(button,'/assessment',{...data,id:form.dataset.id||null,revision:Number(form.dataset.revision)||null},
        'L’évaluation a été enregistrée.',{close:true});
    case 'assessment-remove':
      return schMutation(button,'/assessment/remove',{id:form.dataset.id,revision:Number(form.dataset.revision)},
        'L’évaluation a été supprimée.',{close:true});
    case 'grade':
      return schSaveGradeEditor(button,values);
  }
}

function schStaffAction(button) {
  const {schoolAction:action,id}=button.dataset;
  if(action==='grade-apply-import')return schApplyGradeImport();
  if(action==='new-account')return schNewAccount(button.dataset.value);
  if(action==='account-edit'||action==='account-archive') {
    const member=schoolUI.data.directory.accounts.find(account=>account.id===id);
    if(member)return action==='account-edit'?schEditAccount(member):schArchiveAccount(member);
  }
  if(action==='open-grades')return schOpenGrades();
  if(action==='session-cancellation')return schSessionCancellationDialog(schFindSession(id));
  if(action==='account-access'){
    const account=schoolUI.data.directory.accounts.find(a=>a.id===id);
    if(account)return schMutation(button,'/accounts/access',{id,revision:account.revision,active:!account.active},'Le statut du compte a été modifié.');
  }
  if(action==='edit-session') {
    const item=id?schFindSession(id):null;
    return schSessionEditor(item,item||(button.dataset.kind==='course'?{kind:'course'}:null));
  }
  if(action==='preview-session')return schPreviewSession();
  if(action==='preview-series')return schPreviewSeries(button.form,button);
  if(action==='slots')return schSlots(button);
  if(action==='pick-slot'){
    schNode('schoolSessionDate').value=button.dataset.date;
    schNode('schoolSessionTime').value=schClock(Number(button.dataset.start));
    schNode('schoolSlots').innerHTML='';
    schNode('schoolSessionPreview').hidden=true;
    schClearPreview();
    return;
  }
  if(action==='close-period')return schMutation(button,'/period/close',schPeriodPayload(button.closest('form')),'La saisie a été fermée.');
  if(action==='publish-now'||action==='cancel-publication'){
    return schMutation(button,'/period/publish',{...schPeriodPayload(button.closest('form')),
      action:action==='publish-now'?'now':'cancel'},action==='publish-now'?'Les notes ont été publiées.':'La programmation a été annulée.');
  }
  if(action==='edit-grade')return schGradeEditor(schoolUI.data.evaluations.find(item=>(item.id||item.assessment_id)===id));
  if(action==='edit-assessment'||action==='remove-assessment'){
    const item=id&&schoolUI.data.assessments.find(assessment=>assessment.id===id);
    if(action==='edit-assessment')return schAssessmentEditor(item||null);
    if(item)schShowDialog('Supprimer l’évaluation',`<form class="form" data-school-form="assessment-remove"
      data-id="${item.id}" data-revision="${item.revision}">
      <p>${schValue(item.title)}</p>${schError()}<div><button type="submit" class="btn danger">Supprimer l’évaluation</button></div></form>`);
  }
}
