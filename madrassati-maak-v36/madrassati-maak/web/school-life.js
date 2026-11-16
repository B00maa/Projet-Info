'use strict';

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

function schDashboardSection(title,href,label,content) {
  return `<section class="card school-stack"><div class="school-session-top">
    <h2>${title}</h2><a class="text-link" href="${href}">${label}</a>
    </div><div>${content}</div></section>`;
}

function schDashboardHomework(rows) {
  return rows.length?rows.map(item=>`<article class="school-session school-session-top">
    <div><h3>${schValue(item.title)}</h3><p class="school-meta">${schValue(item.due_date?
      item.subject+' · '+schDate(item.due_date):item.subject)}</p></div>
    <button type="button" class="btn secondary small" data-school-action="homework" data-id="${item.id}">Ouvrir le devoir</button>
    </article>`).join(''):schEmpty('Aucun devoir à rendre.');
}

async function schFetchDialog(button,path,render) {
  button.disabled=true;
  try {
    const response=await schRequest(path);
    if(button.isConnected)render(response);
  } catch(error) { schToast(error.message); }
  finally { button.disabled=false; }
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
    default: return schLearningSubmit(form,button)||schCommunicationSubmit(form,button);
  }
  return true;
}

function schLifeAction(button) {
  const {schoolAction:action,id,value}=button.dataset;
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
    default: return schLearningAction(button)||schCommunicationAction(button)||schReportAction(button);
  }
  return true;
}
