'use strict';

const schExportDate=date=>schDate(date,{day:'numeric',month:'short',year:'numeric'});
const schExportNumber=value=>new Intl.NumberFormat(schLocale(),{maximumFractionDigits:2}).format(value);
const schWorkbookSubtitle=(...values)=>values.filter(Boolean).join(' · ');
const schWorkbookLocale=()=>({rightToLeft:state.lang==='ar'});

function schGradeReportButton() {
  return '<button type="button" class="btn secondary small" data-school-action="grade-report" '+
    (schoolUI.data.gradeReport?.length?'':'disabled')+'>Télécharger le relevé PDF</button>';
}

function schGradeReport() {
  const {child,gradeReport}=schoolUI.data;
  if(!child||!gradeReport?.length)return;
  saveSchoolDocument({kind:'grades',language:state.lang,title:tr('Relevé des notes publiées'),
    meta:[[tr('Élève'),child.name],[tr('Date d’export'),schExportDate(schMinute(schNow()).slice(0,10))]],
    table:{headers:['Matière','Évaluation','Date','Note / 20'].map(value=>tr(value)),widths:[2,3,1.55,1.2],
      rows:gradeReport.map(row=>[row.subject,row.title,schExportDate(row.date),schExportNumber(row.score)])}},
  'Madrassati-Releve-de-notes.pdf');
}

function schWeeklyPdf() {
  const {week,sessions,assignments}=schoolUI.data;
  const items=new Map([...sessions,...assignments].map(item=>[item.id,item]));
  const short=schFatigueCurrent()?.status==='approved';
  const sections=[...items.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.start_minute-b.start_minute).map(item=>({
    heading:item.title,text:[
      schWorkbookSubtitle(item.subject,schExportDate(item.date),schClock(item.start_minute)),
      item.cancelled_at!=null?tr('Séance annulée')+' · '+item.cancel_reason:'',
      item.description,short&&item.short_exercise?item.short_exercise:item.exercise,
      item.due_date?tr('Date de remise')+' · '+schExportDate(item.due_date):''
    ].filter(Boolean).join('\n')
  }));
  if(sections.length)saveSchoolDocument({kind:'weekly',language:state.lang,title:tr('Fiche de la semaine'),
    subtitle:schExportDate(week.start)+' - '+schExportDate(week.end),sections},'Madrassati-Semaine-'+week.start+'.pdf');
}

function schClassWorkbook() {
  const {classes,accounts,enrolments}=schoolUI.data.directory;
  const classNames=new Map(classes.map(entry=>[entry.id,entry.name]));
  const students=new Map(accounts.filter(entry=>entry.role==='eleve').map(entry=>[entry.id,entry]));
  const rows=enrolments.flatMap(({student_id,class_id})=>{
    const student=students.get(student_id);
    return student&&student.archived_at==null?[[student.name,classNames.get(class_id),student.login||'',tr(student.active?'Actif':'Suspendu')]]:[];
  }).sort((a,b)=>a[1].localeCompare(b[1],schLocale())||a[0].localeCompare(b[0],schLocale()));
  const total=new Map();
  for(const row of enrolments)if(students.get(row.student_id)?.active)total.set(row.class_id,(total.get(row.class_id)||0)+1);
  saveSchoolWorkbook([
    {...schWorkbookLocale(),name:tr('Effectifs'),title:tr('Effectifs par classe'),subtitle:'Madrassati Maâk',
      headers:['Classe','Élèves actifs'].map(value=>tr(value)),widths:[34,21],rows:classes.map(row=>[row.name,total.get(row.id)||0])},
    {...schWorkbookLocale(),name:tr('Élèves'),title:tr('Liste des élèves'),subtitle:'Madrassati Maâk',
      headers:['Nom','Classe','Identifiant scolaire','Statut'].map(value=>tr(value)),widths:[36,21,24,18],rows}
  ],'Madrassati-Classes.xlsx');
}

function schCodesWorkbook() {
  if(!schoolUI.credentials?.length)return;
  saveSchoolWorkbook([{...schWorkbookLocale(),name:tr('Accès scolaires'),title:tr('Accès scolaires'),
    subtitle:tr('À remettre en privé à chaque personne.'),
    headers:['Nom','Classe','Identifiant scolaire','Code personnel'].map(value=>tr(value)),widths:[36,22,25,34],
    rows:schoolUI.credentials.map(row=>[row.name,row.className,row.login,row.code])
  }],'Madrassati-Acces-Scolaires.xlsx');
}

function schTeacherGradesWorkbook() {
  const editor=schoolUI.editor;
  if(editor?.kind!=='grade')return;
  const {item}=editor;
  const form=schNode('schoolGradeForm');
  const students=schoolUI.data.directory.students.filter(row=>row.class_id===item.class_id);
  saveSchoolWorkbook([{...schWorkbookLocale(),name:tr('Notes'),title:item.title,
    subtitle:schWorkbookSubtitle(item.class_name,item.subject,schExportDate(item.date)),
    headers:SCHOOL_GRADE_COLUMNS.map(value=>tr(value)),widths:[34,20,18,39,45],
    rows:students.map(student=>{
      const value=form.elements.namedItem('score:'+student.id)?.value||'';
      return [student.name,item.class_name,schGradeSpreadsheetNumber(value)??value,student.id,schGradeReference(editor)];
    })
  }],'Madrassati-Notes.xlsx','27566A');
}

function schAttendanceWorkbook() {
  const {session,roster,kind}=schoolUI.editor||{};
  if(kind!=='attendance'||!roster.length)return;
  saveSchoolWorkbook([{...schWorkbookLocale(),name:tr('Appel'),title:tr('Feuille d’appel'),
    subtitle:schWorkbookSubtitle(session.title,session.class_name,session.subject,schExportDate(session.date)),
    headers:['Élève','Classe','Date','Présence','Justificatif'].map(value=>tr(value)),widths:[34,20,17,21,29],
    rows:roster.map(row=>[row.name,session.class_name,xlsxDate(session.date),
      tr(SCHOOL_ATTENDANCE_LABELS[row.status]||'Non pointé'),row.justification_status?tr(SCHOOL_JUSTIFICATION_LABELS[row.justification_status]):''])
  }],'Madrassati-Appel.xlsx','225974');
}

function schReportAction(button) {
  switch(button.dataset.schoolAction){
    case 'grade-report': schGradeReport();break;
    case 'weekly-pdf': schWeeklyPdf();break;
    case 'class-workbook': schClassWorkbook();break;
    case 'grade-workbook': schTeacherGradesWorkbook();break;
    case 'attendance-workbook': schAttendanceWorkbook();break;
    default:return false;
  }
  return true;
}
