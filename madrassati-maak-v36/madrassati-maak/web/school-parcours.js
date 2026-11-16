'use strict';

const SCHOOL_COPY_STATUS={afaire:'À faire',brouillon:'Brouillon',rendu:'Rendu',avenir:'À venir',ferme:'Délai terminé'};
const schChapterButton=(id,label='Ouvrir le chapitre',style='secondary',stage='cours')=>
  `<button type="button" class="btn ${style} small" data-school-action="view-session" data-id="${schEsc(id)}" data-value="${stage}">${label}</button>`;

function schChapterRow(item) {
  const {account,learning}=schoolUI.data;
  const teacher=account.role==='professeur'&&account.id===item.teacher_id;
  const progress=learning?.chapters.find(chapter=>chapter.id===item.id);
  return `<article class="school-session school-session-top"><div><h2>${schValue(item.title)}</h2>${schSessionMeta(item)}
    ${progress?.completed_at?'<span class="tag mint">Terminé</span>':progress?.updated_at?'<span class="tag soft">En cours</span>':''}
    </div><div class="school-actions">${schChapterButton(item.id)}
    ${schQuizActions(item)}
    ${teacher?`<button type="button" class="btn secondary small" data-school-action="chapter-progress" data-id="${item.id}">Voir la progression</button>
      <button type="button" class="btn secondary small" data-school-action="edit-session" data-id="${item.id}">Modifier le chapitre</button>`:''}
    </div></article>`;
}

function schStudentPathHome() {
  const {account,learning,assessments=[],homework=[]}=schoolUI.data;
  const next=learning?.chapters.find(row=>row.id===learning.next);
  const evaluations=assessments.filter(item=>['afaire','brouillon'].includes(item.status)).slice(0,3);
  return `<div class="school-title"><h1>${schValue(account.name)}</h1><a class="btn secondary small" href="#cours">Mes parcours</a></div>
    ${schFatigueBanner()}<div class="school-home-grid school-student-home">
      <div class="school-stack">
        <section class="card school-stack"><h2>Mon parcours</h2>
          ${next?`<div class="school-study-entry"><div><p class="school-small school-muted">${schValue(next.subject)}</p>
            <h3>${schValue(next.title)}</h3></div>${schChapterButton(next.id,'Continuer','primary',next.stage||'cours')}</div>`:
            schEmpty(learning?.chapters.length?'Tous tes chapitres sont terminés.':'Aucun chapitre n’est disponible pour ton niveau.')}
          <div class="school-actions"><a href="#revoir" class="btn secondary small">Revoir une notion</a>
            ${next?`<button type="button" class="btn secondary small" data-school-action="chapter-help" data-id="${next.id}">Demander de l’aide</button>`:''}</div>
        </section>
        ${schDashboardSection('Devoirs à rendre','#devoirs','Tous les devoirs',schDashboardHomework(homework.filter(row=>!row.submitted_at).slice(0,4)))}
      </div>
      ${schDashboardSection('Évaluations à rendre','#evaluations','Voir les évaluations',
        evaluations.length?evaluations.map(assessment=>schAssessmentCard(assessment)).join(''):schEmpty('Aucune évaluation à rendre.'))}
    </div>`;
}

function schParentPathHome() {
  const data=schoolUI.data;
  const child=data.child;
  const heading=`<div class="school-title school-home-heading"><h1>Suivi de mon enfant</h1>${schChildPicker(data)}</div>`;
  if(!child)return heading+`<section class="card">${schEmpty('Aucun élève associé à ce compte.')}</section>`;
  const chapters=data.learning?.chapters||[];
  const finished=chapters.filter(row=>row.completed_at).length;
  const homework=data.homework||[];
  const tasks=[['progression','Chapitre terminé',finished+' / '+chapters.length],['devoirs','Devoirs à rendre',homework.filter(row=>!row.submitted_at).length],
    ['notes','Résultats publiés',data.gradeReport?.length||0]];
  return heading+`<div class="school-stack">
    <section class="card school-stack"><div class="school-child-summary">${schWorkspaceAvatar(child.name)}<h2>${schValue(child.name)}</h2></div>
      <div class="school-family-counters">${tasks.map(([link,label,value])=>`<a class="school-home-quick" href="#${link}">
        <span><strong>${schValue(value)}</strong><small>${label}</small></span></a>`).join('')}</div>
    </section><div class="school-home-grid">
      ${schDashboardSection('Évaluations','#evaluations','Voir les évaluations',
        (data.assessments||[]).slice(0,4).map(item=>schAssessmentCard(item)).join('')||schEmpty('Aucune évaluation enregistrée.'))}
      ${schDashboardSection('Devoirs à rendre','#devoirs','Tous les devoirs',schDashboardHomework(homework.filter(row=>!row.submitted_at).slice(0,4)))}
    </div></div>`;
}

function schProgressPage() {
  const data=schoolUI.data;
  const teacher=data.account.role==='professeur';
  return `<div class="school-title"><h1>${teacher?'Progression des élèves':'Progression'}</h1></div>
    <section class="card">${data.courses?.length?data.courses.map(item=>schChapterRow(item)).join(''):
      schEmpty('Aucun chapitre publié.')}</section>`;
}

function schReviewPage() {
  const review=schoolUI.data.learning?.chapters.filter(chapter=>chapter.review.length)||[];
  return `<div class="school-title"><h1>Revoir une notion</h1></div><div class="school-stack">${review.length?
    review.map(chapter=>`<section class="card school-stack"><h2>${schValue(chapter.title)}</h2>
      <ul class="school-path-questions">${chapter.review.map(prompt=>`<li>${schValue(prompt)}</li>`).join('')}</ul>
      <div class="school-actions">${schChapterButton(chapter.id,'Relire le chapitre')}
        ${schChapterButton(chapter.id,'Reprendre le quiz','secondary','quiz')}</div></section>`).join(''):
    `<section class="card school-stack">${schEmpty('Les questions à revoir apparaissent après un quiz.')}
      <div><a class="btn secondary" href="#cours">Mes parcours</a></div></section>`}</div>`;
}

function schChapterTools(item) {
  if(schoolUI.data.account.role!=='eleve')return '';
  const done=schoolUI.data.learning?.chapters.find(row=>row.id===item.id)?.completed_at;
  return `<div class="school-actions school-block">
    ${item.exercise?`<button type="button" class="btn secondary" data-school-action="view-session" data-id="${item.id}" data-value="devoir">Ouvrir le devoir</button>`:''}
    <button type="button" class="btn secondary" data-school-action="chapter-help" data-id="${item.id}">Demander de l’aide</button>
    ${done?'<span class="tag mint">Terminé</span>':`<button type="button" class="btn primary" data-school-action="chapter-complete" data-id="${item.id}">Marquer terminé</button>`}</div>`;
}

async function schViewChapter(button) {
  const id=button.dataset.id, pupil=schoolUI.data.account.role==='eleve';
  const child=schoolUI.data.child?.id;
  button.disabled=true;
  try {
    const item=schFindSession(id)??(await schRequest('/session?'+schFamilyParams({session:id}))).session;
    const stage=button.dataset.value==='quiz'&&item.has_quiz?'quiz':button.dataset.value==='devoir'&&item.exercise?'devoir':'cours';
    if(pupil)await schRequest('/chapter/open',{id,stage});
    if(!button.isConnected||schoolUI.data?.child?.id!==child)return;
    if(stage==='quiz'&&pupil)schQuizDialog(await schRequest('/quiz?'+new URLSearchParams({session:id})));
    else if(stage==='devoir'&&pupil)schHomeworkView(await schRequest('/homework?'+new URLSearchParams({session:id})),child);
    else schShowDialog(item.title,schSessionContent(item)+schChapterTools(item));
    schDialog().scrollTop=0;
  } catch(error){schToast(error.message);}
  finally {button.disabled=false;}
}

function schChapterRoster({title,level,roster}) {
  schShowDialog('Progression des élèves',`<div class="school-stack"><div><h3>${schValue(title)}</h3>
    <p class="school-meta">${schValue(level)}</p></div>${roster.length?`<div class="school-table-wrap">
    <table class="school-table"><thead><tr><th scope="col">Élève</th><th scope="col">Progression</th></tr></thead><tbody>
    ${roster.map(student=>`<tr><th scope="row">${schValue(student.name)}</th><td>
      <span class="tag ${student.completed_at?'mint':'soft'}">${student.completed_at?'Terminé':student.updated_at?'En cours':'À faire'}</span></td></tr>`).join('')}
    </tbody></table></div>`:schEmpty('Aucun élève inscrit à ce niveau.')}</div>`);
}

function schAssessmentStatus(item) {
  return item.status?`<span class="tag ${item.status==='rendu'?'mint':item.status==='ferme'?'orange':'soft'}">${SCHOOL_COPY_STATUS[item.status]}</span>`:'';
}

function schAssessmentCard(item) {
  const role=schoolUI.data.account.role;
  return `<article class="school-session school-session-top"><div><h3>${schValue(item.title)}</h3>
    <p class="school-meta">${schValue([item.class_name,item.subject].filter(Boolean).join(' · '))}</p>
    ${item.deadline||item.closes_at?`<p class="school-small"><span>Date limite</span> · ${schValue(schTimestamp(item.deadline||item.closes_at))}</p>`:''}
    ${schAssessmentStatus(item)}</div><div class="school-actions">
    ${role==='professeur'?`<button type="button" class="btn secondary small" data-school-action="assessment-detail" data-id="${item.id}">Voir les copies</button>
      ${item.graded?'':`<button type="button" class="btn secondary small" data-school-action="edit-assessment" data-id="${item.id}">Modifier</button>
        <button type="button" class="btn secondary small" data-school-action="remove-assessment" data-id="${item.id}">Supprimer</button>`}`:
      role==='administration'||!item.closes_at?'':`<button type="button" class="btn secondary small" data-school-action="assessment-detail"
        data-id="${item.id}">${item.status==='brouillon'&&role==='eleve'?'Reprendre':'Ouvrir'}</button>`}</div></article>`;
}

function schAssessmentsPage() {
  const {account,directory,assessments=[]}=schoolUI.data;
  return `<div class="school-title"><h1>Évaluations</h1>${account.role==='professeur'?
    `<button class="btn primary" type="button" data-school-action="edit-assessment" ${directory.classes.length?'':'disabled'}>Ajouter une évaluation</button>`:''}</div>
    <section class="card">${assessments.length?assessments.map(schAssessmentCard).join(''):schEmpty('Aucune évaluation enregistrée.')}</section>`;
}

function schCopyLink(id,student,name) {
  const params=schFamilyParams({id,...(student?{student}:{})});
  return name?`<a class="btn secondary small" href="${schEsc(SCHOOL_API+'/assessment/file?'+params)}">Télécharger la copie</a>`:'';
}

function schTeacherCopies({assessment,roster}) {
  schoolUI.editor={kind:'assessment-roster',assessment,roster};
  schShowDialog('Copies des élèves',`<div class="school-stack"><div><h3>${schValue(assessment.title)}</h3>
    <p class="school-meta">${schValue(assessment.class_name)}</p></div>
    <section class="school-block"><h3>Barème sur 20</h3><p dir="auto">${schValue(assessment.rubric)}</p></section>
    ${roster.length?roster.map(student=>`<article class="school-block school-stack"><div><strong>${schValue(student.name)}</strong> ${schAssessmentStatus(student)}
      ${student.corrected_at?'<span class="tag mint">Corrigé</span>':''}</div>
      ${student.submitted_at?`<p dir="auto">${schValue(student.answer)}</p>
        <div class="school-actions">${schCopyLink(assessment.id,student.id,student.file_name)}
        <button class="btn secondary small" type="button" data-school-action="assessment-correction" data-id="${student.id}">Corriger la copie</button></div>`:
        `<div><button class="btn secondary small" type="button" data-school-action="assessment-extension" data-id="${student.id}">Prolonger le délai</button></div>`}
    </article>`).join(''):schEmpty('Aucun élève inscrit à ce niveau.')}</div>`);
}

function schCopyForm({assessment,status,deadline,copy}) {
  const pupil=schoolUI.data.account.role==='eleve';
  if(schoolUI.editor?.kind==='assessment-copy')schCloseCopy(schoolUI.editor);
  schShowDialog('Évaluation',`<div class="school-stack"><div><h3>${schValue(assessment.title)}</h3>
    ${schAssessmentStatus({status})}</div>${deadline?`<p class="school-small"><span>Date limite</span> · ${schValue(schTimestamp(deadline))}</p>`:''}
    ${assessment.duration_minutes&&status==='afaire'?`<p class="school-small"><span>Durée en minutes</span> · ${schValue(assessment.duration_minutes)}</p>`:''}
    ${assessment.instruction?`<section class="school-block"><h3>Sujet et consignes</h3>
      <p dir="auto">${schValue(assessment.instruction)}</p><h3>Barème sur 20</h3><p dir="auto">${schValue(assessment.rubric)}</p></section>`:''}
    ${pupil&&status==='afaire'?`<div><button type="button" class="btn primary" data-school-action="assessment-start" data-id="${assessment.id}">Commencer</button></div>`:''}
    ${pupil&&status==='brouillon'?`<form class="form" data-school-form="assessment-copy">
      ${assessment.duration_minutes?'<p class="school-meta"><span>Temps restant</span><strong id="schoolCopyTime" dir="ltr"></strong></p>':''}
      <div><label for="schoolCopyAnswer">Ta réponse</label><textarea id="schoolCopyAnswer" name="answer" maxlength="12000" rows="6" dir="auto">${schEsc(copy.answer)}</textarea></div>
      <div><label for="schoolCopyFile">Joindre une copie</label><input id="schoolCopyFile" name="file" type="file"
        accept="application/pdf,image/jpeg,image/png"><p class="school-small school-muted">PDF, JPEG ou PNG · 6 Mo maximum</p></div>
      <p id="schoolCopySaved" class="school-small school-muted" role="status"></p>${schError()}
      <div class="school-actions"><button class="btn secondary" value="draft" type="submit">Enregistrer le brouillon</button>
        <button class="btn primary" value="submit" type="submit">Rendre ma copie</button></div></form>`:''}
    ${status==='rendu'&&copy?`<p class="school-text" dir="auto">${schValue(copy.answer)}</p>${schCopyLink(assessment.id,null,copy.file_name)}
      ${copy.feedback?`<section class="school-block"><h3>Commentaire du professeur</h3><p dir="auto">${schValue(copy.feedback)}</p></section>`:''}`:''}</div>`);
  if(pupil&&status==='brouillon') {
    const editor={kind:'assessment-copy',id:assessment.id,revision:copy.revision,saved:copy.answer,answer:copy.answer,
      form:schNode('schoolDialogBody').querySelector('form')};
    schoolUI.editor=editor;
    const clock=schNode('schoolCopyTime');
    if(clock) {
      const tick=()=>{
        const seconds=Math.max(0,Math.ceil((deadline-schNow())/1000));
        clock.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
        if(!seconds){for(const input of editor.form.elements)input.disabled=true;clearInterval(editor.clock);}
      };
      editor.clock=setInterval(tick,1000);tick();
    }
  } else schoolUI.editor=null;
}

function schCopyPayload(editor,action,payload=new FormData()) {
  payload.set('id',editor.id);
  payload.set('revision',String(editor.revision));
  payload.set('action',action);
  payload.set('answer',editor.answer);
  return payload;
}

async function schSaveCopy(editor) {
  if(editor.request||editor.finishing||editor.saved===editor.answer)return;
  const answer=editor.answer;
  editor.request=schRequest('/assessment/submission',schCopyPayload(editor,'draft'));
  try {
    const result=await editor.request;
    editor.revision=result.revision;editor.saved=answer;
    if(schoolUI.editor===editor)schNode('schoolCopySaved').textContent=tr('Brouillon enregistré.');
  } catch(error) {
    if(schoolUI.editor===editor)editor.form.querySelector('[data-school-error]').textContent=tr(error.message);
  } finally {
    editor.request=null;
    if(editor.answer!==answer&&!editor.finishing)schSaveCopy(editor);
  }
}

function schCopyInput(target) {
  const editor=schoolUI.editor;
  if(editor?.kind!=='assessment-copy'||target.id!=='schoolCopyAnswer')return false;
  editor.answer=target.value;
  clearTimeout(editor.timer);
  editor.timer=setTimeout(()=>schSaveCopy(editor),500);
  return true;
}

function schCloseCopy(editor) {
  if(editor?.kind!=='assessment-copy')return;
  clearTimeout(editor.timer);clearInterval(editor.clock);
  if(schoolUI.data?.account.role==='eleve')schSaveCopy(editor);
}

async function schSubmitCopy(form,button) {
  const editor=schoolUI.editor;
  if(editor?.kind!=='assessment-copy'||editor.finishing)return;
  if(button?.value!=='submit')return schSaveCopy(editor);
  editor.finishing=true;button.disabled=true;clearTimeout(editor.timer);
  const payload=new FormData(form);
  try {
    if(editor.request)await editor.request;
    await schRequest('/assessment/submission',schCopyPayload(editor,'submit',payload));
    editor.saved=editor.answer;
    const response=await schRequest('/assessment/detail?'+new URLSearchParams({id:editor.id}));
    if(schoolUI.editor===editor&&schDialog().open)schCopyForm(response);
    await schLoad({quiet:true});
  } catch(error) {form.querySelector('[data-school-error]').textContent=tr(error.message);}
  finally {editor.finishing=false;button.disabled=false;}
}

function schTeacherCopyEdit(action,id) {
  const {assessment,roster}=schoolUI.editor;
  const row=roster.find(student=>student.id===id);
  const extend=action==='assessment-extension';
  schShowDialog(extend?'Prolonger le délai':'Corriger la copie',`<form data-school-form="${action}" class="form"
    data-id="${assessment.id}" data-student="${id}" data-revision="${row.revision??0}">
    <p>${schValue(row.name)}</p>
    ${extend?`<div><label for="schoolExtendUntil">Nouvelle date limite</label><input type="datetime-local" id="schoolExtendUntil"
      name="closes" value="${assessment.closes_at?schMinute(row.extended_until||assessment.closes_at):''}" required></div>
      ${assessment.duration_minutes?`<div><label for="schoolExtendMinutes">Minutes supplémentaires</label>
        <input type="number" id="schoolExtendMinutes" name="extraMinutes" value="${row.extra_minutes||0}" min="0" max="480"></div>`:''}`:
      `<div><label for="schoolCopyScore">Note proposée sur 20</label><input type="number" name="score" id="schoolCopyScore" min="0" max="20"
        step=".01" value="${row.proposed_score??''}" required></div>
      <div><label for="schoolCopyFeedback">Commentaire</label><textarea name="feedback" id="schoolCopyFeedback"
        maxlength="5000" required>${schEsc(row.feedback)}</textarea></div>`}
    ${schError()}<div><button type="submit" class="btn primary">Enregistrer</button></div></form>`);
}

function schPathAction(button) {
  const {schoolAction:action,id}=button.dataset;
  if(action==='view-session')schViewChapter(button);
  else if(action==='chapter-progress')schFetchDialog(button,'/chapter/progress?'+new URLSearchParams({chapter:id}),schChapterRoster);
  else if(action==='chapter-complete')schMutation(button,'/chapter/open',{id,stage:'cours',complete:true},'Chapitre terminé.',{close:true});
  else if(action==='chapter-help')schShowDialog('Demander de l’aide',`<form class="form" data-school-form="chapter-help" data-id="${schEsc(id)}">
    <label for="schoolChapterQuestion">Ta question au professeur</label><textarea name="question" id="schoolChapterQuestion" maxlength="2800" required></textarea>
    ${schError()}<div><button type="submit" class="btn primary">Envoyer la question</button></div></form>`);
  else if(action==='assessment-detail')schFetchDialog(button,'/assessment/detail?'+schFamilyParams({id}),
    schoolUI.data.account.role==='professeur'?schTeacherCopies:schCopyForm);
  else if(action==='assessment-start') {
    button.disabled=true;
    schRequest('/assessment/start',{id}).then(response=>{
      if(button.isConnected&&schDialog().open)schCopyForm(response);
    }).catch(error=>schToast(error.message)).finally(()=>{button.disabled=false;});
  } else if(action==='assessment-extension'||action==='assessment-correction')schTeacherCopyEdit(action,id);
  else return false;
  return true;
}

function schPathSubmit(form,button) {
  const action=form.dataset.schoolForm;
  const id=form.dataset.id;
  if(!['chapter-help','assessment-copy','assessment-extension','assessment-correction'].includes(action))return false;
  const data=action==='assessment-copy'?null:Object.fromEntries(new FormData(form));
  if(action==='chapter-help')schMutation(button,'/chapter/help',{id,question:data.question},'Question envoyée.',{close:true});
  else if(action==='assessment-copy')schSubmitCopy(form,button);
  else if(action==='assessment-extension'||action==='assessment-correction') {
    const route=action==='assessment-extension'?'/assessment/extend':'/assessment/correct';
    schMutation(button,route,{...data,id,student:form.dataset.student,revision:Number(form.dataset.revision)},'Modification enregistrée.',
      {onSaved:async()=>schTeacherCopies(await schRequest('/assessment/detail?'+new URLSearchParams({id})))});
  } else return false;
  return true;
}
