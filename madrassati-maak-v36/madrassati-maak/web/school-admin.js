'use strict';

function schAdminClassCounts(directory) {
  const active=new Set(directory.accounts.filter(account=>account.active).map(account=>account.id));
  const counts=new Map(directory.classes.map(entry=>[entry.id,{students:0,teachers:0}]));
  for(const entry of directory.enrolments) {
    if(active.has(entry.student_id)&&counts.has(entry.class_id))counts.get(entry.class_id).students++;
  }
  for(const entry of directory.teaching) {
    if(active.has(entry.teacher_id)&&counts.has(entry.class_id))counts.get(entry.class_id).teachers++;
  }
  return counts;
}

function schAdminDashboard() {
  const {directory}=schoolUI.data;
  const {classes,accounts}=directory;
  const enrolled=new Set(directory.enrolments.map(entry=>entry.student_id));
  const indicators=[
    ['users','', 'Élèves inscrits',accounts.filter(person=>person.active&&enrolled.has(person.id)).length,'#eleves'],
    ['user','mint','Professeurs actifs',accounts.filter(person=>person.role==='professeur'&&person.active).length,'#professeurs'],
    ['cap','mint','Niveaux scolaires',classes.length,'#classes'],
    ['users','orange','Parents',accounts.filter(person=>person.role==='parent'&&person.active).length,'#parents']
  ];
  const tasks=[
    ['users','Comptes sans accès scolaire',accounts.filter(person=>person.active&&!person.login).length,'#comptes?statut=sans-acces']
  ];
  const counts=schAdminClassCounts(directory);
  const classRows=classes.slice(0,5).map(entry=>`<a class="class-row" href="${schClassRosterLink(entry.id)}">
    ${siteIconTile('cap','mint')}<strong>${schValue(entry.name)}</strong>
    <span class="count">${schCountLabel(counts.get(entry.id).students,'élève actif','élèves actifs')}</span></a>`).join('');
  return `<div class="school-title school-admin-heading"><h1>Vue d’ensemble</h1>
    <div class="admin-page-actions">
      <button type="button" class="btn secondary" data-school-action="new-account">${siteIcon('users','sm')} Créer un compte</button>
      <a class="btn primary" href="#classes">${siteIcon('plus','sm')} Gérer les niveaux</a>
    </div></div>
    <section class="stats-grid admin-indicators" aria-label="Indicateurs de l’établissement">
      ${indicators.map(([icon,color,label,total,href])=>`<a class="stat-card" href="${href}">${siteIconTile(icon,color)}
        <div><p class="stat-label">${label}</p><div class="stat-number">${total}</div></div></a>`).join('')}
    </section>
    <div class="admin-overview">
      <section class="card admin-work">
        <div class="card-heading"><h2>À traiter</h2></div>
        ${tasks.some(([, , count])=>count)?'':'<p class="admin-empty">Aucun élément à traiter.</p>'}
        <ul class="admin-list">${tasks.map(([icon,label,count,href])=>
          `<li><a class="admin-task" href="${href}">${siteIconTile(icon,count?'orange':'mint')}<span>${label}</span>
            <span class="tag ${count?'orange':'mint'}">${count}</span>${siteIcon('right','sm')}</a></li>`).join('')}</ul>
      </section>
      <section class="card admin-enrolment">
        <div class="card-heading"><h2>Effectifs par niveau</h2><a class="text-link" href="#classes">Voir tous les niveaux</a></div>
        ${classRows?`<div class="class-list">${classRows}</div>`:schEmpty('Crée un niveau pour commencer.')}
      </section>
    </div>`;
}

function schAdminClasses() {
  const {directory}=schoolUI.data;
  const counts=schAdminClassCounts(directory);
  return `<div class="school-title school-admin-heading"><h1>Niveaux scolaires</h1>
    <div class="admin-page-actions">
      <button type="button" class="btn secondary" data-school-action="class-workbook" ${directory.classes.length?'':'disabled'}>Exporter les niveaux</button>
      <button type="button" class="btn secondary" data-school-action="school-import">Importer Excel ou CSV</button>
    </div></div>
    <div class="school-grid school-admin-class-grid">
      <section class="card school-stack"><h2>Nouveau niveau</h2>
        <form class="form" data-school-form="class"><div><label for="schoolClassName">Niveau scolaire</label>
          <input id="schoolClassName" name="name" maxlength="80" required></div>
          <div><label for="schoolLevelStream">Filière (facultatif)</label>
            <input id="schoolLevelStream" name="stream" maxlength="80"></div>
          ${schError()}<div><button class="btn primary" type="submit">Créer le niveau</button></div></form></section>
      <section class="card admin-level"><div class="card-heading"><h2>Niveaux de l’établissement</h2></div>
        ${directory.classes.length?`<ul class="admin-list">${directory.classes.map(entry=>{
          const {students,teachers}=counts.get(entry.id);
          return `<li class="admin-level-row"><div class="student-name">${siteIconTile('cap','mint')}<strong>${schValue(entry.name)}</strong></div>
            <div class="admin-level-count"><div>${schCountLabel(students,'élève actif','élèves actifs')}</div>
              <div>${schCountLabel(teachers,'professeur actif','professeurs actifs')}</div></div>
            <div class="admin-row-actions"><a class="btn secondary small" href="${schClassRosterLink(entry.id)}">Voir les élèves</a></div></li>`;
        }).join('')}</ul>`:schEmpty('Crée un niveau pour commencer.')}</section>
    </div>`;
}

function schAdminStatistics() {
  const directory=schoolUI.data.directory;
  const counts=schAdminClassCounts(directory);
  return `<div class="school-title school-admin-heading"><h1>Statistiques</h1>
    <button type="button" class="btn secondary" data-school-action="class-workbook" ${counts.size?'':'disabled'}>
      ${siteIcon('download','sm')} Exporter les niveaux</button></div>
    <section class="card school-stack"><h2>Effectifs par niveau</h2>
      ${counts.size?`<div class="school-table-wrap"><table class="school-table">
        <thead><tr><th scope="col">Niveau</th><th scope="col">Élèves actifs</th><th scope="col">Professeurs actifs</th></tr></thead>
        <tbody>${directory.classes.map(entry=>`<tr><th scope="row">${schValue(entry.name)}</th>
          <td>${counts.get(entry.id).students}</td><td>${counts.get(entry.id).teachers}</td></tr>`).join('')}</tbody>
      </table></div>`:schEmpty('Crée un niveau pour commencer.')}</section>`;
}

function schAdminHistory() {
  const {page,more,rows}=schoolUI.data.accountHistory;
  const labels={'class-changed':'Classe de l’élève modifiée','parent-linked':'Élèves associés au parent modifiés','access-reset':'Accès scolaire réinitialisé'};
  return `<div class="school-title school-admin-heading"><h1>Historique des comptes</h1></div>
    <section class="card school-stack">${rows.length?`<div class="school-table-wrap"><table class="school-table">
      <thead><tr><th scope="col">Date et heure</th><th scope="col">Effectué par</th><th scope="col">Compte concerné</th><th scope="col">Action</th></tr></thead>
      <tbody>${rows.map(row=>`<tr><td>${schValue(schTimestamp(row.occurred_at))}</td><td>${schValue(row.actor)}</td>
        <td>${schValue(row.member)}</td><td>${labels[row.action]}</td></tr>`).join('')}</tbody>
    </table></div>`:schEmpty('Aucune modification de compte à afficher.')}
    <div class="school-actions">
      ${page>1?`<a class="btn secondary small" href="#historique?page=${page-1}">Page précédente</a>`:''}
      ${more?`<a class="btn secondary small" href="#historique?page=${page+1}">Page suivante</a>`:''}
    </div></section>`;
}

function schAdminSettings() {
  return `<div class="school-title school-admin-heading"><h1>Paramètres</h1></div>
    <div class="school-grid">
      <section class="card school-stack"><h2>Langue de l’interface</h2>
        <div class="school-actions">
          <span data-no-i18n="true">${state.lang==='fr'?'Français':'العربية'}</span>
          <button type="button" class="btn secondary small" data-school-action="language">
            ${state.lang==='fr'?'Afficher le site en arabe':'Afficher le site en français'}</button>
        </div></section>

    </div>`;
}
