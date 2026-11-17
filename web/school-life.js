'use strict';

const SCHOOL_ATTENDANCE_LABELS={present:'Présent',absent:'Absent',late:'En retard'};
const SCHOOL_JUSTIFICATION_LABELS={pending:'En attente de validation',accepted:'Justificatif accepté',declined:'Justificatif refusé'};
const SCHOOL_FATIGUE_LABELS={pending:'En attente du parent',approved:'Mode fatigue activé',declined:'Demande refusée',
  cancelled:'Demande annulée',expired:'Demande expirée',ended:'Mode fatigue terminé'};

function schFatigueStatus(item) {
  const now=schNow();
  if(item.status==='approved'&&(item.stopped_at||item.expires_at<=now))return 'ended';
  if(item.status==='pending'&&item.requested_at+86400000<=now)return 'expired';
  return item.status;
}

function schFatigueCurrent() {
  return schoolUI.data?.fatigue?.find(item=>['pending','approved'].includes(schFatigueStatus(item)));
}

function schFatigueBanner() {
  const data=schoolUI.data;
  if(data.account.role==='professeur'){
    const active=data.teacherFatigue.filter(item=>item.expires_at>schNow());
    if(!active.length)return '';
    return `<section class="school-callout school-stack" aria-label="Mode fatigue">
      <h2>Mode fatigue activé</h2><ul class="school-checks">${active.map(item=>`<li>
        <strong>${schValue(item.name)}</strong><span>${schValue(item.class_name)}</span>
        <small><span>Jusqu’à</span> ${schValue(schTimestamp(item.expires_at))}</small></li>`).join('')}</ul></section>`;
  }
  if(data.account.role!=='eleve')return '';
  const current=schFatigueCurrent();
  if(!current)return '';
  return `<aside class="school-callout school-session-top"><div><strong>${SCHOOL_FATIGUE_LABELS[current.status]}</strong>
    ${current.status==='approved'?'<p class="school-small">La version courte s’affiche quand ton professeur l’a préparée.</p>':''}</div>
    <a class="btn secondary small" href="#fatigue">Voir le mode fatigue</a></aside>`;
}

function schFatiguePage() {
  const data=schoolUI.data;
  const parent=data.account.role==='parent';
  if(!data.child)return `<div class="school-title"><h1>Mode fatigue</h1></div><section class="card">${schEmpty('Aucun élève associé à ce compte.')}</section>`;
  const current=schFatigueCurrent();
  const heading=`<div class="school-title"><h1>Mode fatigue</h1>${parent?`<span class="tag mint">${schValue(data.child.name)}</span>`:''}</div>`;
  const request=parent?schEmpty('Aucune demande en cours.'):`<form class="form" data-school-form="fatigue-request">
    <p>Ton parent doit donner son accord avant l’activation. Ton professeur verra ensuite que le mode est actif.</p>
    <div><label for="schoolFatigueDuration">Durée souhaitée</label><select id="schoolFatigueDuration" name="minutes">
      ${schOpt('60','1 heure')}${schOpt('120','2 heures','120')}${schOpt('240','4 heures')}</select></div>
    ${schError()}<div><button class="btn primary" type="submit">Demander le mode fatigue</button></div></form>`;
  const actions=current?.status==='pending'&&parent?
    `<div class="school-actions"><button type="button" class="btn primary" data-school-action="fatigue-decide" data-id="${current.id}"
      data-value="approved">Accepter</button><button type="button" class="btn secondary" data-school-action="fatigue-decide"
      data-id="${current.id}" data-value="declined">Refuser</button></div>`:
    current?`<div><button type="button" class="btn secondary" data-school-action="fatigue-stop" data-id="${current.id}">
      ${current.status==='pending'?'Annuler la demande':'Terminer le mode fatigue'}</button></div>`:'';
  const status=current?`<div class="school-stack"><div><span class="tag ${current.status==='approved'?'mint':'orange'}">
      ${SCHOOL_FATIGUE_LABELS[current.status]}</span></div>
    <p><span>Durée souhaitée</span> · ${schValue(current.duration_minutes)} <span>minutes</span></p>
    ${current.expires_at?`<p><span>Jusqu’à</span> ${schValue(schTimestamp(current.expires_at))}</p>`:''}${actions}</div>`:request;
  const events=data.fatigue.map(item=>{
    const phase=schFatigueStatus(item);
    const end=item.stopped_at||(phase==='ended'?item.expires_at:null);
    return `<article class="school-session school-stack"><div class="school-session-top"><span class="tag ${phase==='approved'?'mint':'soft'}">
      ${SCHOOL_FATIGUE_LABELS[phase]}</span><span class="school-small"><span>Durée souhaitée</span> · ${schValue(item.duration_minutes)} <span>minutes</span></span></div>
      <div class="school-meta"><span>Demandé par l’élève</span> ${schValue(schTimestamp(item.requested_at))}
      ${item.decided_at?`· <span>Réponse du parent</span> ${schValue(schTimestamp(item.decided_at))}`:''}
      ${item.starts_at?`· <span>Activé le</span> ${schValue(schTimestamp(item.starts_at))}`:''}
      ${end?`· <span>Terminé le</span> ${schValue(schTimestamp(end))}`:''}</div></article>`;
  }).join('');
  return heading+`<div class="school-grid"><section class="card school-stack"><h2>État du mode fatigue</h2>${status}</section>
    <section class="card school-stack"><h2>Historique</h2>${events||schEmpty('Aucune demande enregistrée.')}</section></div>`;
}

function schParentLifeSummary() {
  const data=schoolUI.data;
  const absences=data.absences?.filter(item=>item.status==='absent'&&item.justification_status!=='accepted'&&
    item.date>=data.week.start&&item.date<=data.week.end).length||0;
  const tasks=[
    ['fatigue','Demande de mode fatigue',schFatigueCurrent()?.status==='pending'?1:0],
    ['absences','Absences à justifier auprès de l’établissement',absences],
    ['messages','Messages non lus',data.notices?.messages||0]
  ].filter(([, ,count])=>count);
  return `<section class="card school-stack school-parent-tasks"><h2>À traiter cette semaine</h2>
    ${tasks.length?`<div class="school-actions">${tasks.map(([page,label,count])=>
      `<a class="btn secondary small" href="#${page}"><span>${label}</span> · ${schValue(count)}</a>`).join('')}</div>`:
      '<p class="school-muted">Aucune action en attente.</p>'}</section>`;
}

function schDashboardSection(title,href,label,content) {
  return `<section class="card school-stack"><div class="school-session-top">
    <h2>${title}</h2><a class="text-link" href="${href}">${label}</a>
    </div><div>${content}</div></section>`;
}

function schDashboardHomework(rows) {
  return rows.length?rows.map(item=>`<article class="school-session school-session-top">
    <div><h3>${schValue(item.title)}</h3><p class="school-meta">${schValue(item.subject+' · '+schDate(item.due_date))}</p></div>
    <button type="button" class="btn secondary small" data-school-action="homework" data-id="${item.id}">Ouvrir le devoir</button>
    </article>`).join(''):schEmpty('Aucun devoir à rendre dans les sept prochains jours.');
}

function schDashboardUpcoming(rows) {
  return rows.length?rows.map(item=>schSessionRow(item)).join(''):schEmpty('Aucune séance à venir.');
}

function schTodayPage() {
  const {account,today,upcoming,dueHomework,missedSessions,homeSubjects,homeClass}=schoolUI.data;
  const subjects=homeSubjects.length?`<div class="school-card-grid school-home-subjects">${homeSubjects
    .map(item=>schCourseSubjectTile(item.subject,item.total)).join('')}</div>`:schEmpty('Aucun cours publié.');
  const missed=missedSessions.length?missedSessions.map(item=>`<article class="school-session school-session-top">
    <div><h3>${schValue(item.title)}</h3>${schSessionMeta(item)}</div>
    <a class="btn secondary small" href="#rattrapage?seance=${item.id}">Rattraper la séance</a></article>`).join(''):
    schEmpty('Aucune séance manquée à rattraper.');
  return `<div class="school-title school-home-heading"><div>
      <h1><span>Bonjour</span>, ${schValue(account.name)}</h1>
      <p class="school-meta">${schValue([homeClass,schExportDate(today)].filter(Boolean).join(' · '))}</p>
      </div><a class="btn secondary" href="#fatigue">${siteIcon('heart','sm')}<span>Mode fatigue</span></a></div>
    ${schFatigueBanner()}
    <div class="school-home-grid school-student-home">
      <div class="school-stack">
        <section class="school-study-entry"><div class="school-home-quick">
          <span class="school-home-icon">${siteIcon('robot','sm')}</span><h2>Coach d’études</h2>
        </div><a class="btn secondary small" href="#coach">Poser une question</a></section>
        ${schDashboardSection('Mes matières','#cours','Toutes les matières',subjects)}
        ${schDashboardSection('Devoirs à rendre','#devoirs','Tous les devoirs',schDashboardHomework(dueHomework))}
      </div>
      <div class="school-stack">
        ${schDashboardSection('Prochaines séances','#planning','Mon calendrier',schDashboardUpcoming(upcoming))}
        ${schDashboardSection('Cours à rattraper','#rattrapage','Voir le rattrapage',missed)}
      </div>
    </div>`;
}

function schFamilyPage() {
  const data=schoolUI.data;
  const child=data.family.find(row=>row.id===data.child?.id);
  const heading=`<div class="school-title school-home-heading"><h1>Suivi de mon enfant</h1>
    ${schChildPicker(data)}</div>`;
  if(!child)return heading+`<section class="card">${schEmpty('Aucun élève associé à ce compte.')}</section>`;
  const cards=[['a-rendre','clipboard','À rendre',data.homeworkCounts.pending],
    ['remis','file','Remis',data.homeworkCounts.submitted],['corriges','check','Corrigés',data.homeworkCounts.corrected]];
  const needsReview=child.absences||child.fatigue;
  return heading+`<div class="school-stack school-family-home">
    <section class="card school-family-summary">
      <div class="school-child-summary">${schWorkspaceAvatar(child.name)}<div>
        <h2>${schValue(child.name)}</h2><p class="school-meta">${schValue(child.class_name||'')}</p>
      </div></div>
      <div class="school-family-counters">${cards.map(([filter,icon,label,count])=>`<a class="school-home-quick" href="#devoirs?etat=${filter}">
        <span class="school-home-icon">${siteIcon(icon,'sm')}</span>
        <span><strong>${schValue(count)}</strong><small>${label}</small></span></a>`).join('')}</div>
      ${needsReview?`<div class="school-actions school-full">
        ${child.absences?`<a class="btn secondary small" href="#absences"><span>Absences à justifier</span> · ${schValue(child.absences)}</a>`:''}
        ${child.fatigue?'<a class="btn secondary small" href="#fatigue">Demande de mode fatigue</a>':''}
      </div>`:''}
    </section>
    <div class="school-home-grid">
      ${schDashboardSection('Devoirs à rendre','#devoirs','Tous les devoirs',schDashboardHomework(child.homework))}
      ${schDashboardSection('Prochaines séances','#planning','Son planning',schDashboardUpcoming(data.upcoming)+
        '<div class="school-note"><a class="text-link" href="#rattrapage">Voir les séances passées</a></div>')}
    </div>
    <section class="card school-stack"><h2>Accès rapides</h2><div class="school-family-counters">
      ${[['notes','chart','Voir ses résultats'],['absences','calendar','Son assiduité'],['bibliotheque','folder','Consulter la bibliothèque']].map(([page,icon,label])=>
        `<a class="school-home-quick" href="#${page}"><span class="school-home-icon">${siteIcon(icon,'sm')}</span><strong>${label}</strong></a>`).join('')}
    </div></section>
  </div>`;
}

async function schFetchDialog(button,path,render) {
  button.disabled=true;
  try {
    const response=await schRequest(path);
    if(button.isConnected)render(response);
  } catch(error) { schToast(error.message); }
  finally { button.disabled=false; }
}

function schAttendanceDialog(button) {
  const params=new URLSearchParams({session:button.dataset.id});
  return schFetchDialog(button,'/attendance?'+params,({session,roster,open})=>{
    schoolUI.editor={kind:'attendance',session,roster};
    const active=new Set(schoolUI.data.teacherFatigue.filter(row=>row.expires_at>schNow()).map(row=>row.student_id));
    schShowDialog('Faire l’appel',`<form class="form" data-school-form="attendance" data-id="${session.id}">
      <div><h3>${schValue(session.title)}</h3>${schSessionMeta(session)}</div>
      ${roster.length?`<div class="school-table-wrap"><table class="school-table"><thead><tr>
        <th scope="col">Élève</th><th scope="col">Présence</th></tr></thead><tbody>
        ${roster.map((student,index)=>`<tr><th scope="row" id="schoolAttendName${index}">${schValue(student.name)}
          ${active.has(student.id)?'<span class="tag orange">Mode fatigue activé</span>':''}
          ${student.justification_status?`<span class="tag soft">${SCHOOL_JUSTIFICATION_LABELS[student.justification_status]}</span>`:''}</th>
          <td><select data-student="${student.id}" data-revision="${student.revision||0}" aria-labelledby="schoolAttendName${index}" ${open?'':'disabled'}>
          ${schOpt('','Non pointé',student.status||'')}${Object.entries(SCHOOL_ATTENDANCE_LABELS).map(([value,label])=>
            schOpt(value,label,student.status)).join('')}</select></td></tr>`).join('')}</tbody></table></div>`:
        schEmpty('Aucun élève inscrit dans cette classe.')}
      ${open?'':schEmpty('L’appel est disponible à partir du début de la séance.')}
      ${schError()}${open&&roster.length?`<div class="school-actions">
        <button type="submit" class="btn primary">Enregistrer l’appel</button>
        <button type="button" class="btn secondary" data-school-action="attendance-present">Marquer présents les élèves non pointés</button></div>`:''}</form>`);
    if(roster.length) {
      const actions=schNode('schoolDialogBody').querySelector('.school-actions')||schNode('schoolDialogBody');
      actions.insertAdjacentHTML('beforeend',localizeHTML('<button type="button" class="btn secondary" data-school-action="attendance-workbook">Exporter l’appel Excel</button>'));
    }
  });
}

function schAbsencesPage() {
  const data=schoolUI.data;
  const admin=data.account.role==='administration';
  const parent=data.account.role==='parent';
  const rows=data.absences||[];
  return `<div class="school-title"><h1>${parent?'Son assiduité':'Absences et justificatifs'}</h1>
    ${data.child?`<span class="tag mint">${schValue(data.child.name)}</span>`:''}</div>
    <p class="school-note school-muted">${admin?'Enregistrez le justificatif après réception du document papier.':
      'Remettez le justificatif papier à l’administration.'}</p>
    <div class="school-stack">${rows.length?rows.map(row=>`<article class="card school-stack">
      <div class="school-session-top"><div><h2>${schValue(row.title)}</h2>
      <div class="school-meta">${schValue([row.student_name,row.class_name,row.subject,schDate(row.date)].filter(Boolean).join(' · '))}</div></div>
      <div class="school-actions"><span class="tag ${row.status==='present'?'mint':'orange'}">${SCHOOL_ATTENDANCE_LABELS[row.status]}</span>
      ${row.justification_status?`<span class="tag ${row.justification_status==='accepted'?'mint':'soft'}">
        ${SCHOOL_JUSTIFICATION_LABELS[row.justification_status]}</span>`:''}</div></div>
      ${admin&&row.justification_status!=='accepted'?`<div class="school-actions">
        <button type="button" class="btn secondary small" data-school-action="paper-received"
          data-id="${row.session_id}" data-student="${row.student_id}" data-revision="${row.revision}">Justificatif papier reçu</button>
        ${row.justification_status==='pending'?`<button type="button" class="btn secondary small" data-school-action="justification"
          data-id="${row.session_id}" data-student="${row.student_id}">Voir le justificatif déjà transmis</button>`:''}</div>`:''}</article>`).join(''):
      `<section class="card">${schEmpty(parent?'Aucun relevé de présence publié.':'Aucune absence ni aucun retard signalé.')}</section>`}</div>`;
}

function schJustificationDialog(button) {
  const row=schoolUI.data.absences.find(item=>item.session_id===button.dataset.id&&item.student_id===button.dataset.student);
  if(!row)return;
  if(schoolUI.data.account.role!=='administration'||row.justification_status!=='pending')return;
  const params=new URLSearchParams({session:row.session_id,student:row.student_id});
  const file=row.file_name?`<a class="btn secondary small" href="${schEsc(SCHOOL_API+'/justification/file?'+params)}">${schValue(row.file_name)}</a>`:'';
  const detail=`<div><h3>${schValue(row.title)}</h3><p class="school-meta">${schValue(schDate(row.date))}</p></div>
    ${row.justification_status?`<div><span class="tag soft">${SCHOOL_JUSTIFICATION_LABELS[row.justification_status]}</span></div>`:''}`;
  schShowDialog('Justificatif',`<div class="school-stack">${detail}
      ${row.justification?`<p class="school-text" data-no-i18n="true" dir="auto">${schEsc(row.justification)}</p>`:''}${file}
      <div class="school-actions">
        ${[['accepted','Accepter le justificatif'],['declined','Refuser le justificatif']].map(([decision,label])=>
          `<button type="button" class="btn ${decision==='accepted'?'primary':'secondary'}" data-school-action="review-justification"
            data-id="${row.session_id}" data-student="${row.student_id}" data-value="${decision}" data-revision="${row.revision}">${label}</button>`).join('')}
      </div></div>`);
}

function schSetupDialog() {
  if(schoolUI.setupState!=='ready'){
    const message=schoolUI.setupState==='invalid-code'?'Le code d’activation enregistré doit contenir entre 24 et 256 caractères.':
      'Ajoutez le code d’activation dans les paramètres du site.';
    return schShowDialog('Activer l’administration',`<div class="school-stack">
      <p>${message}</p>
      <p>Dans l’éditeur du site, ouvrez <strong>Paramètres → Secrets</strong>. Enregistrez un code aléatoire de 24 à 256 caractères
        comme secret <code dir="ltr" data-no-i18n="true">SCHOOL_SETUP_CODE</code>.</p>
      <p>Republiez le site, puis rechargez cette page pour saisir le code.</p>
    </div>`);
  }
  schShowDialog('Activer l’administration',`<form class="form" data-school-form="school-setup">
    <div><label for="schoolSetupCode">Code d’activation</label><input id="schoolSetupCode" name="setupCode" type="password"
      autocomplete="off" dir="ltr" maxlength="256" required></div>
    ${schError()}<div><button type="submit" class="btn primary">Créer le compte d’administration</button></div></form>`);
}

async function schSchoolAuth(form,button,setup=false) {
  if(schoolUI.busy)return;
  schoolUI.busy=true;button.disabled=true;
  const error=form.querySelector('[data-school-error]');
  error.textContent='';
  try {
    const result=await schRequest(setup?'/auth/setup':'/auth/login',Object.fromEntries(new FormData(form)));
    form.reset();
    if(setup){
      schoolUI.setupState='complete';
      schRender();
      schCredentialsDialog([{name:'Administration',...result.credential}]);
    } else {
      schResetWorkspace(true);
      await schLoad();
    }
  } catch(failure) { error.textContent=tr(failure.message); }
  finally { schoolUI.busy=false;button.disabled=false; }
}

async function schSchoolLogout(button) {
  if(schoolUI.busy)return;
  schoolUI.busy=true;
  button.disabled=true;
  try {
    await schRequest('/auth/logout',{});
    schResetWorkspace(true);
    schRender();
    await schLoad();
    schNode('schoolLoginId')?.focus({preventScroll:true});
  } catch(error) { schToast(error.message); }
  finally {
    schoolUI.busy=false;
    if(button.isConnected)button.disabled=false;
  }
}

function schLifeChange(target) {
  if(target.id==='schoolMessageContact') {
    schoolUI.peer=target.value;
    schRender();
    schNode('schoolMessageContact')?.focus({preventScroll:true});
  }
}

function schLifeSubmit(form,button) {
  const kind=form.dataset.schoolForm;
  switch(kind) {
    case 'school-login': schSchoolAuth(form,button); break;
    case 'school-setup': schSchoolAuth(form,button,true); break;
    case 'member-code': {
      const id=form.dataset.id;
      const member=schoolUI.data.directory.accounts.find(row=>row.id===id);
      schMutation(button,'/accounts/code',{id,revision:Number(form.dataset.revision)},null,
        {onSaved(result){schCredentialsDialog([{name:member?.name,...result.credential}]);}});
      break;
    }
    case 'school-import-preview': schImportPreview(form,button); break;
    case 'school-import': {
      const {rows,plan}=schoolUI.editor;
      schMutation(button,'/accounts/import',{rows,expectedClasses:JSON.stringify(plan.classes),
        expectedNewClasses:JSON.stringify(plan.newClasses)},'Les comptes élèves ont été créés.',
        {onSaved(result){schCredentialsDialog(result.created);}});
      break;
    }
    case 'fatigue-request':
      schMutation(button,'/fatigue',{minutes:Number(new FormData(form).get('minutes'))},'La demande a été transmise à ton parent.'); break;
    case 'attendance': {
      const marks=[...form.querySelectorAll('select[data-student]')].filter(select=>select.value).map(select=>
        ({id:select.dataset.student,status:select.value,revision:Number(select.dataset.revision)}));
      schMutation(button,'/attendance',{session:form.dataset.id,marks},'L’appel a été enregistré.',{close:true});
      break;
    }
    default: return schLearningSubmit(form,button)||schCommunicationSubmit(form,button);
  }
  return true;
}

function schLifeAction(button) {
  const {schoolAction:action,id,student,value,revision}=button.dataset;
  switch(action) {
    case 'school-logout':
      schSchoolLogout(button); break;
    case 'member-code': schMemberCodeDialog(id); break;
    case 'school-import': schImportDialog(); break;
    case 'import-template':
      schCsvDownload('madrassati-modele-eleves.csv',[['Nom','Classe','Identifiant']]); break;
    case 'fatigue-decide':
      schMutation(button,'/fatigue/decision',{id,decision:value},value==='approved'?'Le mode fatigue est actif.':'La demande a été refusée.'); break;
    case 'fatigue-stop':
      schMutation(button,'/fatigue/stop',{id},'Le mode fatigue a été mis à jour.'); break;
    case 'attendance': schAttendanceDialog(button); break;
    case 'attendance-present':
      for(const select of button.closest('form').querySelectorAll('select[data-student]'))if(!select.value)select.value='present';
      break;
    case 'justification': schJustificationDialog(button); break;
    case 'paper-received':
      schMutation(button,'/attendance/paper',{session:id,student,revision:Number(revision)},'La réception du justificatif papier a été enregistrée.');
      break;
    case 'review-justification':
      schMutation(button,'/justification/review',{session:id,student,decision:value,revision:Number(revision)},
        'Le justificatif a été mis à jour.',{close:true}); break;
    default: return schLearningAction(button)||schCommunicationAction(button)||schReportAction(button)||schPilotAction(button);
  }
  return true;
}
