'use strict';

function schTeacherClassCounts(students) {
  const counts=new Map();
  for(const student of students)counts.set(student.class_id,(counts.get(student.class_id)||0)+1);
  return counts;
}

function schTeacherDashboard() {
  const {account,directory,upcoming=[],homeworkToCorrect=0}=schoolUI.data;
  const {classes,students}=directory;
  const subjects=[...new Set(classes.map(entry=>entry.subject))];
  const counts=schTeacherClassCounts(students);
  const disabled=classes.length?'':'disabled';
  return `<div class="school-title school-teacher-heading"><div><h1>${schValue(account.name)}</h1>
    ${subjects.length?`<p class="school-muted">${schValue(subjects.join(' · '))}</p>`:''}</div>
    <div class="school-actions">
      <a class="btn secondary" href="#coach">${siteIcon('robot','sm')} Coach pédagogique</a>
      <button type="button" class="btn primary" data-school-action="edit-session" data-kind="course" ${disabled}>
        ${siteIcon('plus','sm')} Ajouter un cours</button>
    </div></div>
    ${schFatigueBanner()}
    <section class="card school-teacher-work">
      <div class="card-heading"><h2>Devoirs de mes classes</h2><a class="text-link" href="#devoirs">Voir les devoirs</a></div>
      <a class="admin-task school-teacher-task" href="#devoirs?etat=a-corriger">
        ${siteIconTile('clipboard',homeworkToCorrect?'orange':'mint')}<span>À corriger</span>
        <span class="tag ${homeworkToCorrect?'orange':'mint'}">${homeworkToCorrect}</span>${siteIcon('right','sm')}
      </a>
    </section>
    <div class="school-teacher-dashboard">
      <div class="school-stack">
        <section class="card">
          <div class="card-heading"><h2>Planning des séances</h2><a class="text-link" href="#planning">Voir tout le calendrier</a></div>
          ${upcoming.length?upcoming.map(item=>schSessionRow(item,false,false)).join(''):schEmpty('Aucune séance à venir.')}
          <div class="school-note"><button type="button" class="btn primary small" data-school-action="edit-session" ${disabled}>
            ${siteIcon('plus','sm')} Nouvelle séance</button></div>
        </section>
        <section class="card">
          <div class="card-heading"><h2>Mes classes</h2><a class="text-link" href="#classes">Voir tout</a></div>
          ${classes.length?`<div class="school-teacher-class-list">${classes.slice(0,6).map(entry=>
            `<a class="class-row" href="${schClassRosterLink(entry.id)}">${siteIconTile('cap','mint')}<div>
              <strong>${schValue(entry.name)}</strong><small>${schValue(entry.subject)}</small>
              <small>${schCountLabel(counts.get(entry.id)||0,'élève','élèves')}</small></div></a>`).join('')}</div>`:
            schEmpty('Aucune classe ne vous est attribuée.')}
          <div class="school-note"><a class="text-link" href="#notes">${siteIcon('chart','sm')} Saisir les notes</a></div>
        </section>
      </div>
      <section class="card school-stack">
        <div class="card-heading"><h2>Ressources de mes classes</h2><a class="text-link" href="#bibliotheque">Bibliothèque</a></div>
        <div><button class="btn secondary small" type="button" data-school-action="resource" ${disabled}>
          ${siteIcon('plus','sm')} Ajouter une ressource</button></div>
      </section>
    </div>`;
}

function schTeacherClasses() {
  const {classes,students}=schoolUI.data.directory;
  const counts=schTeacherClassCounts(students);
  return `<div class="school-title"><h1>Mes classes</h1></div>
    ${classes.length?`<div class="school-card-grid">${classes.map(entry=>`<section class="card roster-class-card">
      <div class="school-actions">${siteIconTile('cap','mint')}<span class="tag blue">${schValue(entry.subject)}</span></div>
      <h2>${schValue(entry.name)}</h2>
      <p class="school-muted">${schCountLabel(counts.get(entry.id)||0,'élève','élèves')}</p>
      <div class="school-actions"><a class="btn secondary small" href="${schClassRosterLink(entry.id)}">
        ${siteIcon('users','sm')} Voir les élèves</a></div></section>`).join('')}</div>`:
      `<section class="card">${schEmpty('Aucune classe ne vous est attribuée.')}</section>`}`;
}

function schTeacherSelectedClass() {
  const id=schViewParams().get('classe');
  return schoolUI.data.directory.classes.some(entry=>entry.id===id)?id:'';
}

function schTeacherClassField() {
  const selected=schTeacherSelectedClass();
  return `<div class="filter-field"><label for="schoolTeacherClassFilter">Classe</label>
    <select id="schoolTeacherClassFilter">${schOpt('','Toutes les classes',selected)}
      ${schoolUI.data.directory.classes.map(entry=>schOpt(entry.id,entry.name,selected)).join('')}</select></div>`;
}

function schTeacherChangeClass(field) {
  if(schoolUI.data?.account.role!=='professeur'||!['eleves','presences'].includes(schPage()))return false;
  location.hash=schPage()+(field.value?'?classe='+encodeURIComponent(field.value):'');
  return true;
}

function schTeacherRoster() {
  const {directory,teacherFatigue}=schoolUI.data;
  const selected=schTeacherSelectedClass();
  const query=searchKey(schoolUI.rosterQuery.trim());
  const rows=directory.students.filter(student=>
    (!selected||student.class_id===selected)&&searchKey(student.name).includes(query));
  const classes=new Map(directory.classes.map(entry=>[entry.id,entry.name]));
  const fatigue=new Set(teacherFatigue.filter(row=>row.expires_at>schNow()).map(row=>row.student_id));
  return `<p class="admin-result-count" role="status">${schCountLabel(rows.length,'élève','élèves')}</p>
    ${rows.length?`<ul class="admin-list school-teacher-roster">${rows.map(student=>`<li class="roster-row">
      <div class="admin-identity">${schStaffAvatar(student.name)}<strong>${schValue(student.name)}</strong></div>
      <div class="roster-row-meta"><span class="tag blue">${schValue(classes.get(student.class_id))}</span>
        ${fatigue.has(student.id)?'<span class="tag orange">Mode fatigue activé</span>':''}</div>
    </li>`).join('')}</ul>`:schEmpty(query?'Aucun élève ne correspond à la recherche.':'Aucun élève inscrit dans cette classe.')}`;
}

function schTeacherStudents() {
  return `<div class="school-title"><h1>Mes élèves</h1></div>
    <section class="card school-stack">
      <div class="admin-filters school-workspace-filters">${schTeacherClassField()}
        <div class="filter-field"><label for="schoolRosterSearch">Recherche</label><div class="search-box">${siteIcon('search')}
          <input id="schoolRosterSearch" type="search" value="${schEsc(schoolUI.rosterQuery)}"
            aria-controls="schoolTeacherRoster" placeholder="Rechercher un élève…"></div></div></div>
      <div id="schoolTeacherRoster">${schTeacherRoster()}</div>
    </section>`;
}

function schTeacherSearch(field) {
  if(schoolUI.data?.account.role!=='professeur'||schPage()!=='eleves')return false;
  schoolUI.rosterQuery=field.value;
  schNode('schoolTeacherRoster').innerHTML=localizeHTML(schTeacherRoster());
  return true;
}

function schTeacherAttendance() {
  const selected=schTeacherSelectedClass();
  const now=schMinute(schNow());
  const sessions=schoolUI.data.sessions.filter(item=>
    (!selected||item.class_id===selected)&&item.date+'T'+schClock(item.start_minute)<=now);
  return `<div class="school-title"><h1>Suivi des présences</h1></div>
    ${schWeekBar()}
    <div class="school-workspace-filters school-note">${schTeacherClassField()}</div>
    <section class="card school-stack">${sessions.length?sessions.map(item=>
      `<article class="school-session"><div class="school-session-top"><div><h2>${schValue(item.title)}</h2>${schSessionMeta(item)}</div>
       <button type="button" class="btn secondary small" data-school-action="attendance" data-id="${item.id}">
         ${siteIcon('clipboard','sm')} Faire l’appel</button></div></article>`).join(''):
      schEmpty('Aucun appel disponible pour cette semaine.')}</section>`;
}
