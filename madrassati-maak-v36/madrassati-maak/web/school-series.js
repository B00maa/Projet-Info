'use strict';

function schSeriesFields(item) {
  if(item&&(!item.series_id||item.date+'T'+schClock(item.start_minute)<schMinute(schNow())))return '';
  return `<section class="school-full school-stack school-block" aria-labelledby="schoolSeriesTitle">
    <h3 id="schoolSeriesTitle">Série hebdomadaire</h3>
    ${item?`<div class="school-choices"><label><input type="checkbox" name="applyFollowing" value="1">
      <span>Appliquer l’horaire aux séances suivantes</span></label></div>
      <p class="school-small school-muted">Les prochaines séances de cette série prendront le même horaire et la même durée.</p>`:
      `<div><label for="schoolRepeatUntil">Répéter chaque semaine jusqu’au</label>
        <input type="date" name="repeatUntil" id="schoolRepeatUntil"></div>
      <p class="school-small school-muted">Facultatif · 2 à 52 séances hebdomadaires.</p>`}
    <div><button type="button" class="btn secondary" data-school-action="preview-series" hidden>Vérifier les créneaux</button></div>
    <div id="schoolSeriesPreview" role="status" class="school-stack" tabindex="-1" hidden></div>
  </section>`;
}

function schSeriesPayload(values) {
  if(!values.get('repeatUntil')&&values.get('applyFollowing')!=='1')return null;
  return {id:values.get('id'),revision:Number(values.get('revision')),teacher:values.get('teacher'),
    class:values.get('class'),date:values.get('date'),start:Number(values.get('start')),duration:Number(values.get('duration')),
    due:values.get('exercise')?.trim()?values.get('due')||values.get('date'):null,
    repeatUntil:values.get('repeatUntil'),following:values.get('applyFollowing')==='1'};
}

function schSeriesChange(form) {
  const button=form.querySelector('[data-school-action="preview-series"]');
  if(!button)return;
  const series=schSeriesPayload(schSessionValues(form));
  button.hidden=!series;
  const save=form.querySelector('button[type="submit"]');
  save.textContent=tr(schoolUI.editor.item?(series?'Enregistrer la série':'Enregistrer la séance'):
    (series?'Publier la série':'Publier la séance'));
  if(schoolUI.editor.seriesPreview?.signature!==JSON.stringify(series)){
    schoolUI.editor.seriesPreview=null;
    schNode('schoolSeriesPreview').hidden=true;
  }
}

async function schPreviewSeries(form,button,series=schSeriesPayload(schSessionValues(form))) {
  if(!series||button.disabled||!form.reportValidity())return;
  const editor=schoolUI.editor;
  const signature=JSON.stringify(series);
  const preview=schNode('schoolSeriesPreview');
  const error=form.querySelector('[data-school-error]');
  button.disabled=true;
  error.textContent='';
  preview.hidden=true;
  editor.seriesPreview=null;
  try {
    const {sessions}=await schRequest('/session/series',series);
    if(!form.isConnected||signature!==JSON.stringify(schSeriesPayload(schSessionValues(form))))return;
    const allowed=sessions.every(row=>!row.conflict);
    editor.seriesPreview={signature,allowed};
    preview.innerHTML=localizeHTML(`<p>${allowed?'Les créneaux sont disponibles.':'Modifie l’horaire ou la période de répétition pour résoudre les conflits.'}</p>
      <ol class="school-series-dates">${sessions.map(row=>`<li>
        <time data-no-i18n="true" datetime="${schEsc(row.date)}">${schEsc(schDate(row.date))} · <bdi dir="ltr">${schClock(row.start)}–${schClock(row.start+row.duration)}</bdi></time>
        ${row.conflict?'<span class="tag orange">Conflit de planning</span>':''}</li>`).join('')}</ol>`);
    preview.hidden=false;
    if(button.type==='submit')preview.focus();
  } catch(failure) {
    if(form.isConnected)error.textContent=tr(failure.message);
  } finally { button.disabled=false; }
}

function schSaveSession(form,button) {
  button??=form.querySelector('button[type="submit"]');
  const values=schSessionValues(form);
  const series=schSeriesPayload(values);
  if(series) {
    const preview=schoolUI.editor.seriesPreview;
    if(preview?.signature!==JSON.stringify(series)||!preview.allowed)return schPreviewSeries(form,button,series);
    schoolUI.editor.seriesPreview=null;
  }
  return schMutation(button,'/session',values,series?'La série a été enregistrée.':'La séance a été enregistrée.',
    {close:true,week:values.get('date')});
}
