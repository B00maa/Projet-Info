'use strict';

const SCHOOL_SUBJECTS=[
  ['Mathématiques','Mathématiques'],['Français','Français'],['Arabe','Arabe'],['Anglais','Anglais'],
  ['Amazighe','Amazighe'],['Espagnol','Espagnol'],['Histoire-géographie','Histoire-géographie'],
  ['SVT','Sciences de la vie et de la Terre (SVT)'],['Physique-chimie','Physique-chimie'],
  ['Informatique','Informatique'],['Technologie','Technologie'],['Sciences de l’ingénieur','Sciences de l’ingénieur'],
  ['Éducation islamique','Éducation islamique'],['Éducation physique et sportive','Éducation physique et sportive'],
  ['Arts plastiques','Arts plastiques'],['Éducation musicale','Éducation musicale'],
  ['Philosophie','Philosophie'],['Économie et gestion','Économie et gestion']
];

function schSubjectOptions(selected='') {
  const {teaching=[],classes=[]}=schoolUI.data.directory;
  const known=new Map(SCHOOL_SUBJECTS);
  for(const subject of [...teaching.map(row=>row.subject),...classes.map(row=>row.subject),selected]) {
    if(subject&&!known.has(subject))known.set(subject,subject);
  }
  const subjects=[...known].sort(([,a],[,b])=>a.localeCompare(b,'fr',{sensitivity:'base'}));
  return schOpt('','Choisis une matière',selected)+subjects.map(([value,label])=>schOpt(value,label,selected)).join('');
}
