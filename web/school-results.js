'use strict';

const SCHOOL_NOTIFICATION_LABELS={planning:'Horaire modifié',annulation:'Séance annulée',retablissement:'Séance rétablie',
  devoir:'Devoir corrigé',note:'Note publiée'};

function schNotificationsPage() {
  const rows=schoolUI.data.notifications||[];
  return `<div class="school-title"><h1>Notifications</h1></div><section class="card school-stack">
    ${rows.length?rows.map(item=>`<article class="school-session school-session-top">
      <div class="school-stack"><div class="school-actions"><span class="tag mint">${SCHOOL_NOTIFICATION_LABELS[item.kind]}</span>
        ${item.read_at==null?'<span class="tag soft">Non lue</span>':''}</div>
        <h2>${schValue(item.title)}</h2><div class="school-meta">
          ${item.child_name&&schoolUI.data.account.role==='parent'?`<span>${schValue(item.child_name)}</span><span>·</span>`:''}
          <time data-no-i18n="true" datetime="${new Date(item.event_at).toISOString()}">${schEsc(schTimestamp(item.event_at))}</time>
          ${item.start_minute!=null?`<span>·</span><span>${schValue(schDate(item.date)+' · '+schClock(item.start_minute))}</span>`:''}
        </div></div>
      <button type="button" class="btn secondary small" data-school-action="open-notification" data-id="${schEsc(item.event_key)}">Ouvrir</button>
    </article>`).join(''):schEmpty('Aucune notification.')}
    </section>`;
}

async function schOpenNotification(button) {
  button.disabled=true;
  let marked=false;
  try {
    const {event}=await schRequest('/notifications/read',{key:button.dataset.id});
    marked=true;
    const params=new URLSearchParams(event.kind==='note'?{id:event.target}:{session:event.target});
    if(event.child_id)params.set('child',event.child_id);
    const route=event.kind==='note'?'/grade':event.kind==='devoir'?'/homework':'/session';
    const payload=await schRequest(route+'?'+params);
    if(!button.isConnected)return;
    if(event.kind==='note')schGradeDialog(payload);
    else if(event.kind==='devoir')schHomeworkView(payload,event.child_id);
    else schShowDialog(payload.session.title,schSessionContent(payload.session,'',event.child_id));
  } catch(error) {
    schToast(error.message);
  } finally {
    button.disabled=false;
    if(marked)schLoad({quiet:true});
  }
}

function schResultsPage() {
  const {account,child,gradeReport=[]}=schoolUI.data;
  const filters=schoolUI.resultFilters;
  const subjects=[...new Set(gradeReport.map(row=>row.subject))].sort((a,b)=>a.localeCompare(b,schLocale()));
  if(!subjects.includes(filters.subject))filters.subject='';
  return `<div class="school-title"><h1>${account.role==='eleve'?'Mes notes et progrès':'Ses résultats'}</h1>${schGradeReportButton()}</div>
    <section class="card school-stack">
      ${!child?schEmpty('Aucun élève associé à ce compte.'):!gradeReport.length?schEmpty('Aucune note publiée.'):`
        <div class="school-fields">
          <div><label for="schoolResultsSubject">Matière</label><select id="schoolResultsSubject" data-school-result="subject">
            ${schOpt('','Toutes les matières',filters.subject)}${subjects.map(subject=>schOpt(subject,subject,filters.subject)).join('')}</select></div>
          <div><label for="schoolResultsFrom">Du</label><input id="schoolResultsFrom" type="date" data-school-result="from" value="${schEsc(filters.from)}"></div>
          <div><label for="schoolResultsTo">Au</label><input id="schoolResultsTo" type="date" data-school-result="to" value="${schEsc(filters.to)}"></div>
        </div>
        <div id="schoolResultsContent" aria-live="polite">${schResultRows()}</div>`}
    </section>`;
}

function schResultRows() {
  const {subject,from,to}=schoolUI.resultFilters;
  if(from&&to&&from>to)return schEmpty('La date de fin doit suivre la date de début.');
  const rows=(schoolUI.data.gradeReport||[]).filter(row=>
    (!subject||row.subject===subject)&&(!from||row.date>=from)&&(!to||row.date<=to))
    .sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,schLocale()));
  if(!rows.length)return schEmpty('Aucune note pour ces filtres.');
  return `<div class="school-table-wrap"><table class="school-table school-results-table"><thead><tr>
    <th scope="col">Date</th><th scope="col">Matière</th><th scope="col">Évaluation</th><th scope="col">Note / 20</th></tr>
    </thead><tbody>${rows.map(row=>`<tr><td>${schValue(schExportDate(row.date))}</td><td>${schValue(row.subject)}</td>
      <td><button type="button" class="btn secondary small" data-school-action="grade-detail" data-id="${schEsc(row.id)}">${schValue(row.title)}</button></td>
      <td><div class="school-result-score"><meter min="0" max="20" value="${Number(row.score)}" aria-hidden="true"></meter>
        <strong>${schValue(schExportNumber(row.score))}</strong></div></td></tr>`).join('')}
    </tbody></table></div>`;
}

function schResultChange(target) {
  const field=target.dataset.schoolResult;
  if(!field)return false;
  schoolUI.resultFilters[field]=target.value;
  schNode('schoolResultsContent').innerHTML=localizeHTML(schResultRows());
  return true;
}

function schGradeDialog(row) {
  schShowDialog('Détail de l’évaluation',`<article class="school-stack">
    <h3>${schValue(row.title)}</h3>
    <p class="school-meta">${schValue(row.subject+' · '+schExportDate(row.date))}</p>
    <p><span>Note publiée</span> · <strong>${schValue(schExportNumber(row.score)+' / 20')}</strong></p>
    ${row.instruction?`<section class="school-block"><h3>Consigne</h3><p class="school-text" data-no-i18n="true" dir="auto">${schEsc(row.instruction)}</p></section>`:''}
    </article>`);
}

function schOpenGrade(button) {
  return schFetchDialog(button,'/grade?'+schFamilyParams({id:button.dataset.id}),schGradeDialog);
}
