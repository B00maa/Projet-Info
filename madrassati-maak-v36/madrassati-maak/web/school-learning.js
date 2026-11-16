'use strict';

function schCoursesPage() {
  const data=schoolUI.data;
  const courses=data.courses||[];
  const groups=new Map();
  for(const item of courses) {
    if(!groups.has(item.subject))groups.set(item.subject,[]);
    groups.get(item.subject).push(item);
  }
  const current=groups.get(schoolUI.courseSubject);
  if(current)return `<div class="school-title"><h1>${schValue(schoolUI.courseSubject)}</h1>
    <button type="button" class="btn secondary" data-school-action="course-subject" data-value="">Toutes les matières</button></div>
    <section class="card school-stack">${current.map(item=>schSessionRow(item,false,true,true)).join('')}</section>`;
  return `<div class="school-title"><h1>Mes cours</h1>${data.account.role==='professeur'?
    `<button type="button" class="btn primary" data-school-action="edit-session" data-kind="course" ${data.directory.classes.length?'':'disabled'}>Publier un cours</button>`:''}</div>
    ${groups.size?`<div class="school-card-grid">${[...groups].sort(([a],[b])=>a.localeCompare(b,'fr')).map(([subject,items])=>
      `<button type="button" class="card school-subject" data-school-action="course-subject" data-value="${schEsc(subject)}">
        <strong>${schValue(subject)}</strong><span class="school-small"><span data-no-i18n="true">${items.length}</span> <span>Cours</span></span></button>`).join('')}</div>`:
      `<section class="card">${schEmpty('Aucun cours publié.')}</section>`}`;
}

function schFamilyParams(values) {
  const params=new URLSearchParams(values);
  if(schoolUI.data.account.role==='parent'&&schoolUI.data.child)params.set('child',schoolUI.data.child.id);
  return params;
}

function schLibraryPage() {
  const data=schoolUI.data;
  const teacher=data.account.role==='professeur';
  const resources=data.resources||[];
  const supports=data.supports||[];
  return `<div class="school-title"><h1>Bibliothèque</h1>${teacher?
    `<button class="btn primary" type="button" data-school-action="resource" ${data.directory.classes.length?'':'disabled'}>Ajouter une ressource</button>`:''}</div>
    <div class="school-stack">
    <section class="card school-stack"><h2>${data.account.role==='administration'?'Ressources des classes':'Ressources de la classe'}</h2>
      ${resources.length?resources.map(item=>{
        const link=schSafeLink(item.link);
        const file=schFamilyParams({id:item.id});
        return `<article class="school-session school-stack"><div class="school-session-top"><div><h3>${schValue(item.title)}</h3>
          <div class="school-meta">${schValue(item.subject+' · '+item.class_name+' · '+item.teacher_name)}</div></div>
          ${teacher&&item.teacher_id===data.account.id?`<div class="school-actions">
            <button type="button" class="btn secondary small" data-school-action="resource" data-id="${item.id}">Modifier</button>
            <button type="button" class="btn danger small" data-school-action="resource-remove" data-id="${item.id}">Supprimer</button></div>`:''}</div>
          ${item.description?`<p class="school-text" data-no-i18n="true" dir="auto">${schEsc(item.description)}</p>`:''}
          <div class="school-actions">${item.file?`<a class="btn secondary small" href="${schEsc(SCHOOL_API+'/resource/file?'+file)}">${schValue(item.file.name)}</a>`:''}
            ${link?`<a class="btn secondary small" href="${schEsc(link)}" target="_blank" rel="noopener noreferrer">Ouvrir le lien</a>`:''}</div></article>`;
      }).join(''):schEmpty('Aucune ressource ajoutée.')}</section>
    <section class="card school-stack"><h2>Supports des séances</h2>
      ${supports.length?supports.map(item=>schSessionRow(item)).join(''):schEmpty('Aucun support de séance.')}</section></div>`;
}

function schResourceEditor(item) {
  const classes=schoolUI.data.directory.classes;
  if(!classes.length)return;
  schShowDialog(item?'Modifier la ressource':'Ajouter une ressource',`<form class="form" data-school-form="resource"
    data-id="${item?.id||''}" data-revision="${item?.revision||''}">
    <div class="school-fields">
      <div><label for="schoolResourceTitle">Titre</label><input id="schoolResourceTitle" name="title" maxlength="120"
        value="${schEsc(item?.title)}" required></div>
      <div><label for="schoolResourceClass">Classe</label><select name="class" id="schoolResourceClass" required>
        ${classes.map(row=>schOpt(row.id,row.name+' · '+row.subject,item?.class_id)).join('')}</select></div>
      <div class="school-full"><label for="schoolResourceDescription">Description</label><textarea id="schoolResourceDescription"
        name="description" maxlength="3000" dir="auto">${schEsc(item?.description)}</textarea></div>
      <div><label for="schoolResourceLink">Lien HTTPS</label><input type="url" name="link" id="schoolResourceLink" placeholder="https://"
        value="${schEsc(item?.link)}"></div>
      <div><label for="schoolResourceFile">Fichier</label><input name="file" id="schoolResourceFile" type="file"
        accept="application/pdf,video/mp4,video/webm,.pdf,.mp4,.webm">
        <p class="school-small school-muted">PDF, MP4 ou WebM · 12 Mo maximum</p>
        ${item?.file?`<p class="school-small">${schValue(item.file.name)}</p>`:''}</div>
    </div>${schError()}<div><button type="submit" class="btn primary">${item?'Enregistrer':'Publier la ressource'}</button></div></form>`);
}

function schHomeworkStatus(item) {
  if(item.corrected_at)return '<span class="tag mint">Corrigé</span>';
  if(item.submitted_at){
    const late=item.due_date&&schMinute(item.submitted_at).slice(0,10)>item.due_date;
    return `<span class="tag ${late?'orange':'mint'}">${late?'Rendu en retard':'Rendu'}</span>`;
  }
  return '<span class="tag orange">À rendre</span>';
}

function schHomeworkPage() {
  const data=schoolUI.data;
  const teacher=data.account.role==='professeur';
  const toCorrect=teacher&&schViewParams().get('etat')==='a-corriger';
  const homework=(data.homework||[]).filter(item=>!toCorrect||item.submitted>item.corrected);
  if(!teacher)homework.sort((a,b)=>Number(!!a.submitted_at)-Number(!!b.submitted_at)||
    (a.submitted_at?b.due_date.localeCompare(a.due_date):a.due_date.localeCompare(b.due_date)));
  return `<div class="school-title"><h1>${teacher?'Devoirs de mes classes':'Devoirs'}</h1>${teacher?
    `<button class="btn primary" type="button" data-school-action="edit-session" ${data.directory.classes.length?'':'disabled'}>Nouvelle séance avec devoir</button>`:''}</div>
    ${teacher?`<nav class="school-actions school-directory-tabs" aria-label="État des devoirs">
      <a class="btn ${toCorrect?'secondary':'primary'} small" href="#devoirs" ${toCorrect?'':'aria-current="page"'}>Tous les devoirs</a>
      <a class="btn ${toCorrect?'primary':'secondary'} small" href="#devoirs?etat=a-corriger" ${toCorrect?'aria-current="page"':''}>À corriger</a></nav>`:''}
    ${schFatigueBanner()}<section class="card school-stack">${homework.length?homework.map(item=>
      `<article class="school-session"><div class="school-session-top"><div><h2>${schValue(item.title)}</h2>
      <div class="school-meta">${schValue(item.subject+' · '+item.class_name)}
      <span>·</span><span>Date de remise</span> ${schValue(schDate(item.due_date))}</div></div>
      <div class="school-actions">${teacher?`<span class="school-small"><span>Remises</span> ${schValue(item.submitted+' / '+item.total)}
        <span>· Corrigés</span> ${schValue(item.corrected)}</span>`:schHomeworkStatus(item)}
        <button class="btn secondary small" type="button" data-school-action="homework" data-id="${item.id}">
        ${teacher?'Voir les remises':'Ouvrir le devoir'}</button></div></div></article>`).join(''):
       schEmpty(toCorrect?'Aucun devoir à corriger.':'Aucun devoir publié.')}</section>`;
}

function schHomeworkFile(session,student,childId) {
  if(!student.file_name)return '';
  const params=schFamilyParams({session:session.id,student:student.student_id});
  if(childId)params.set('child',childId);
  return `<div><a class="btn secondary small" href="${schEsc(SCHOOL_API+'/homework/file?'+params)}">${schValue(student.file_name)}</a></div>`;
}

function schHomeworkView({session,submissions},childId) {
  const role=schoolUI.data.account.role;
  const pupil=role==='eleve';
  const teacher=role==='professeur';
  const entry=teacher?null:submissions[0];
  const short=!!session.short_exercise&&(entry?.variant==='short'||(!entry&&schFatigueCurrent()?.status==='approved'));
  const instruction=short?session.short_exercise:session.exercise;
  const task=`<div class="school-stack"><h3>${schValue(session.title)}</h3>${schSessionMeta(session)}
    <p class="school-small"><span>Date de remise</span> · ${schValue(schDate(session.due_date))}</p>
    <section class="school-block"><h3>${short?'Exercice en version courte':'Consigne du devoir'}</h3>
      <p data-no-i18n="true" dir="auto">${schEsc(instruction)}</p></section>
    ${teacher&&session.short_exercise?`<section class="school-block"><h3>Exercice en version courte</h3>
      <p data-no-i18n="true" dir="auto">${schEsc(session.short_exercise)}</p></section>`:''}</div>`;
  if(teacher){
    return schShowDialog('Remises et corrections',`<div class="school-stack">${task}
      ${submissions.length?submissions.map(student=>student.submitted_at?
        `<details class="school-details school-block"><summary>${schValue(student.name)}
          ${schHomeworkStatus({...student,due_date:session.due_date})}</summary>
          <div class="school-stack school-note">
          <p class="school-small"><span>Rendu le</span> ${schValue(schTimestamp(student.submitted_at))}
            ${student.variant==='short'?'<span> · Version courte</span>':''}</p>
          ${student.answer?`<p class="school-text" data-no-i18n="true" dir="auto">${schEsc(student.answer)}</p>`:''}${schHomeworkFile(session,student)}
          <form class="form" data-school-form="homework-correct" data-id="${session.id}" data-student="${student.student_id}" data-revision="${student.revision}">
            <div><label for="schoolFeedback-${student.student_id}">Correction</label><textarea name="feedback"
              id="schoolFeedback-${student.student_id}" dir="auto" maxlength="5000" required>${schEsc(student.feedback)}</textarea></div>
            ${schError()}<div><button type="submit" class="btn primary">Enregistrer la correction</button></div></form></div></details>`:
        `<div class="school-block school-session-top"><strong>${schValue(student.name)}</strong><span class="tag soft">À rendre</span></div>`).join(''):
        schEmpty('Aucun élève inscrit dans cette classe.')}</div>`);
  }
  const submitted=entry?`<section class="school-block school-stack"><div class="school-session-top"><h3>Travail remis</h3>
    ${schHomeworkStatus({...entry,due_date:session.due_date})}</div>
    ${entry.answer?`<p data-no-i18n="true" dir="auto">${schEsc(entry.answer)}</p>`:''}${schHomeworkFile(session,entry,childId)}
    ${entry.feedback?`<h3>Correction</h3><p data-no-i18n="true" dir="auto">${schEsc(entry.feedback)}</p>`:''}</section>`:'';
  const submit=pupil&&!entry?.corrected_at?`<form class="form school-block" data-school-form="homework-submit"
    data-id="${session.id}" data-revision="${entry?.revision||0}">
    <input type="hidden" name="variant" value="${short?'short':'full'}">
    <div><label for="schoolHomeworkAnswer">Ta réponse</label><textarea id="schoolHomeworkAnswer" name="answer" dir="auto"
      maxlength="5000">${schEsc(entry?.answer)}</textarea></div>
    <div><label for="schoolHomeworkFile">Joindre un PDF (facultatif)</label><input id="schoolHomeworkFile" name="file" type="file"
      accept="application/pdf,.pdf"><p class="school-small school-muted">6 Mo maximum</p></div>
    ${schError()}<div><button type="submit" class="btn primary">${entry?'Mettre à jour le devoir':'Remettre le devoir'}</button></div></form>`:'';
  schShowDialog('Devoir',`<div class="school-stack">${task}${submitted}${submit}${!entry&&!pupil?schEmpty('Travail non remis.') : ''}</div>`);
}

function schLearningSubmit(form,button) {
  const kind=form.dataset.schoolForm;
  const {id,revision,student}=form.dataset;
  if(kind==='resource'){
    const data=new FormData(form);
    if(id){data.set('id',id);data.set('revision',revision);}
    schMutation(button,'/resource',data,'La ressource a été enregistrée.',{close:true});
  } else if(kind==='resource-remove'){
    schMutation(button,'/resource/remove',{id,revision:Number(revision)},'La ressource a été supprimée.',{close:true});
  } else if(kind==='homework-submit'){
    const data=new FormData(form);data.set('session',id);data.set('revision',revision);
    schMutation(button,'/homework/submit',data,'Le devoir a été remis.',{close:true});
  } else if(kind==='homework-correct'){
    const feedback=new FormData(form).get('feedback');
    schMutation(button,'/homework/correct',{session:id,student,revision:Number(revision),feedback},'La correction a été enregistrée.',{
      async onSaved(){
        if(schDialog().open)schHomeworkView(await schRequest('/homework?'+schFamilyParams({session:id})));
      }
    });
  } else return false;
  return true;
}

function schLearningAction(button) {
  const {schoolAction:action,id,value}=button.dataset;
  if(action==='course-subject'){
    schoolUI.courseSubject=value;
    schRender();
    schNode('schoolMain').focus({preventScroll:true});
  } else if(action==='resource'||action==='resource-remove'){
    const item=id&&schoolUI.data.resources.find(resource=>resource.id===id);
    if(action==='resource')schResourceEditor(item||null);
    else if(item)schShowDialog('Supprimer la ressource',`<form class="form" data-school-form="resource-remove"
      data-id="${item.id}" data-revision="${item.revision}"><p>${schValue(item.title)}</p>${schError()}
      <div><button class="btn danger" type="submit">Supprimer la ressource</button></div></form>`);
  } else if(action==='homework'){
    schFetchDialog(button,'/homework?'+schFamilyParams({session:id}),schHomeworkView);
  } else return false;
  return true;
}
