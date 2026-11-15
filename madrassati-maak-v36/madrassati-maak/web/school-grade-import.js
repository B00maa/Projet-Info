'use strict';

const SCHOOL_GRADE_COLUMNS=['Élève','Classe','Note / 20','Référence de l’élève','Référence de l’évaluation'];
const schGradeReference=editor=>editor.periodId+'/'+(editor.item.assessment_id||editor.item.id);

function schGradeSpreadsheetNumber(value) {
  if(typeof value!=='string')return null;
  const number=arabicNumbersToLatin(value).trim().replace(',','.');
  return /^\d{1,2}(\.\d{1,2})?$/.test(number)&&Number(number)<=20?Number(number):null;
}

function schGradeSpreadsheetPlan(sheet,students,reference) {
  const labels=[
    [SCHOOL_GRADE_COLUMNS[2],'النقطة / 20'],
    [SCHOOL_GRADE_COLUMNS[3],'مرجع التلميذ'],
    [SCHOOL_GRADE_COLUMNS[4],'مرجع التقييم']
  ].map(names=>names.map(schImportHeader));
  const declared=sheet.map((row,i)=>({i,columns:labels.map(names=>row.findIndex(cell=>names.includes(schImportHeader(cell))))}))
    .find(row=>row.columns.every(index=>index>=0));
  if(!declared)throw new Error('Utilise le tableau Excel exporté depuis cette évaluation.');
  const [scoreColumn,idColumn,referenceColumn]=declared.columns;
  const roster=new Map(students.map(student=>[student.id,student]));
  const scores=new Map(),errors=[];
  const seen=new Set();
  for(const row of sheet.slice(declared.i+1)) {
    if(!row.some(value=>typeof value!=='string'||value.trim()))continue;
    const id=typeof row[idColumn]==='string'?row[idColumn].trim():'';
    const student=roster.get(id);
    if(row[referenceColumn]!==reference) {
      errors.push({name:student?.name,reason:'Référence d’évaluation différente'});
    } else if(!student) {
      errors.push({reason:'Élève absent de la liste actuelle'});
    } else if(seen.has(id)) {
      errors.push({name:student.name,reason:'Élève présent plusieurs fois'});
    } else {
      const raw=row[scoreColumn]??'';
      const score=schGradeSpreadsheetNumber(raw);
      if(typeof raw==='string'&&!raw.trim())scores.set(id,'');
      else if(score!==null)scores.set(id,String(score));
      else errors.push({name:student.name,reason:'Note invalide ou calculée'});
    }
    if(student)seen.add(id);
  }
  if(!scores.size&&!errors.length)throw new Error('Le tableau Excel ne contient aucune ligne d’élève.');
  const missing=students.filter(student=>scores.get(student.id)===''||!seen.has(student.id)).length;
  return {scores,errors,missing};
}

function schGradeImportControls() {
  return `<details class="school-details"><summary>Importer les notes depuis Excel</summary>
    <div class="school-note school-stack">
      <p class="school-muted school-small">Remplis la colonne « Note / 20 » du tableau exporté et conserve les références.</p>
      <div><label for="schoolGradeImportFile">Tableau de notes Excel</label>
        <input type="file" id="schoolGradeImportFile" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></div>
      <div id="schoolGradeImportPreview" class="school-stack school-grade-import-preview" aria-live="polite"></div>
    </div></details>`;
}

function schGradeImportOpen(editor) {
  const period=schPeriod();
  return editor?.kind==='grade'&&!editor.committing&&period?.phase==='open'&&editor.periodId===period.id;
}

function schRenderGradeImport(plan,students) {
  const {scores,errors,missing}=plan;
  const marks=[...scores.values()].filter(value=>value!=='').length;
  return `<div class="school-actions">
      <span class="tag mint">${schCountLabel(marks,'note lue','notes lues')}</span>
      <span class="tag orange">${schCountLabel(missing,'note manquante','notes manquantes')}</span>
      ${errors.length?`<span class="tag orange">${schCountLabel(errors.length,'ligne à corriger','lignes à corriger')}</span>`:''}</div>
    ${errors.length?`<ul class="school-family-deadlines">${errors.slice(0,20).map(row=>
      `<li>${row.name?schValue(row.name)+' · ':''}<span>${row.reason}</span></li>`).join('')}</ul>`:''}
    <div class="school-table-wrap"><table class="school-table">
      <thead><tr><th scope="col">Élève</th><th scope="col">Note / 20</th></tr></thead>
      <tbody>${students.map(student=>`<tr><th scope="row">${schValue(student.name)}</th>
        <td>${scores.get(student.id)?schValue(scores.get(student.id).replace('.',',')):
          scores.has(student.id)?'Vide':'Ligne à vérifier'}</td></tr>`).join('')}</tbody></table></div>
    <div><button class="btn secondary small" type="button" data-school-action="grade-apply-import" ${errors.length?'disabled':''}>
      Appliquer au brouillon</button></div>`;
}

async function schGradeImportFile(input) {
  const editor=schoolUI.editor;
  const output=schNode('schoolGradeImportPreview');
  if(!output||!schGradeImportOpen(editor))return;
  editor.importPlan=null;
  output.textContent='';
  const file=input.files[0];
  const request=editor.importRequest=Symbol();
  if(!file)return;
  try {
    if(!file.size||file.size>SCHOOL_IMPORT_BYTES||!/\.xlsx$/i.test(file.name))throw new Error('Choisis un fichier .xlsx de 4 Mo maximum.');
    output.textContent=tr('Lecture du tableau Excel…');
    const rows=await schExcelRows(await file.arrayBuffer(),{literalOnly:true});
    if(schoolUI.editor!==editor||editor.importRequest!==request||!schDialog().open)return;
    if(!schGradeImportOpen(editor))throw new Error('La période de saisie est fermée.');
    const students=schoolUI.data.directory.students.filter(student=>student.class_id===editor.item.class_id);
    const plan=schGradeSpreadsheetPlan(rows,students,schGradeReference(editor));
    editor.importPlan=plan;
    output.innerHTML=localizeHTML(schRenderGradeImport(plan,students));
  } catch(error) {
    if(schoolUI.editor===editor&&editor.importRequest===request)output.textContent=tr(error.message);
  }
}

function schApplyGradeImport() {
  const editor=schoolUI.editor;
  const plan=editor?.importPlan;
  if(!schGradeImportOpen(editor)||!plan||plan.errors.length)return;
  const form=schNode('schoolGradeForm');
  const fields=[...plan.scores].map(([id,score])=>[form.elements.namedItem('score:'+id),score]);
  if(fields.some(([input])=>!input))return schToast('La liste des élèves a changé. Rouvre l’évaluation.');
  for(const [input,score] of fields)input.value=score.replace('.',',');
  editor.importRequest=null;
  editor.importPlan=null;
  schNode('schoolGradeImportFile').value='';
  schNode('schoolGradeImportPreview').textContent=tr('Les notes du tableau ont été ajoutées au brouillon.');
  schGradeInput(fields[0][0]);
}
