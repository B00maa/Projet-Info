'use strict';

function schPilotAction(button) {
  if(button.dataset.schoolAction!=='pilot')return false;
  if(schoolUI.data.account.role!=='administration')return true;
  const directory=schoolUI.data.directory;
  const active=new Set(directory.accounts.filter(row=>row.active).map(row=>row.id));
  const ready=directory.classes.map(entry=>{
    const pupils=new Set(directory.enrolments.filter(row=>row.class_id===entry.id&&active.has(row.student_id)).map(row=>row.student_id));
    return {name:entry.name,pupils:pupils.size,
      teacher:directory.teaching.some(row=>row.class_id===entry.id&&active.has(row.teacher_id)),
      parent:directory.guardians.some(row=>pupils.has(row.student_id)&&active.has(row.parent_id))};
  }).filter(entry=>entry.pupils>=2&&entry.teacher&&entry.parent);
  schShowDialog('Préparer une classe pilote',`<div class="school-stack">
    ${ready.length?`<div class="school-callout"><strong>Classes prêtes pour un essai</strong><p>${schValue(ready.map(entry=>entry.name).join(', '))}</p></div>`:''}
    <ol class="school-pilot-steps">
      <li><strong>Comptes de la classe</strong><p>Crée une classe, attribue-la à un professeur et ajoute deux élèves. Associe un parent à l’un des élèves.</p></li>
      <li><strong>Évaluation et notes</strong><p>Crée une évaluation depuis le compte professeur. Ouvre la saisie dans Périodes et résultats, saisis une note puis fais vérifier sa publication par le parent.</p></li>
      <li><strong>Demande de mode fatigue</strong><p>Demande le mode fatigue depuis le compte élève. Accepte depuis le compte parent et vérifie que le professeur voit l’activation dans Mes séances.</p></li>
    </ol>
    <div class="school-actions"><a class="btn secondary" href="/assets/madrassati-modele-eleves.xlsx" download>Télécharger le modèle Excel</a></div>
  </div>`);
  return true;
}
