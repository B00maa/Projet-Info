'use strict';

const TEACHER_LESSON_MODES={
  chapter:{sections:[6,8],planLimit:12,exercises:[3,4],examples:3,duration:60,tokens:5500,words:[750,1050],minimum:620,sectionWords:36},
  session:{sections:[2,4],planLimit:6,exercises:[2,3],examples:1,duration:30,tokens:2600,words:[280,480],minimum:190,sectionWords:24}
};
const TEACHER_LESSON_PUBLISH_LIMIT=20000;

const TEACHER_LESSON_LEVELS={
  class:{fr:'Niveau de la classe',ar:'مستوى القسم',en:'Class level'},
  cpge:{fr:'CPGE',ar:'الأقسام التحضيرية',en:'Preparatory classes (CPGE)'},
  l1:{fr:'Licence 1 (L1)',ar:'السنة الأولى من الإجازة',en:'First-year university (L1)'}
};

const TEACHER_LESSON_ADDITIONS={
  proof:{fr:'Démonstration',ar:'برهان',en:'Proof'},
  example:{fr:'Exemple résolu',ar:'مثال محلول',en:'Worked example'},
  counterexample:{fr:'Contre-exemple',ar:'مثال مضاد',en:'Counterexample'}
};

const TEACHER_LESSON_TERMS={
  fr:{objectives:'Objectifs',example:'Exemple résolu',recap:'À retenir',practice:'Exercices d’application',exercise:'Exercice',reference:'Revoir la section'},
  ar:{objectives:'الأهداف',example:'مثال محلول',recap:'خلاصة',practice:'تمارين تطبيقية',exercise:'التمرين',reference:'راجع القسم'},
  en:{objectives:'Learning objectives',example:'Worked example',recap:'Takeaways',practice:'Practice exercises',exercise:'Exercise',reference:'Review section'}
};

const teacherLessonKey=value=>String(value||'').normalize('NFKD').replace(/\p{M}/gu,'')
  .toLowerCase().replace(/[’']/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();

function lessonDiagramForHeading(heading) {
  const key=teacherLessonKey(heading);
  if(/grassmann|somme(?:s)? direct|somme et supplementaire|direct sum|sum.*complement|المجموع المباشر|المجموع والفضاءات/u.test(key))return 'vector-complement';
  if(/bases?.*coordonnees|bases?.*coordinates|الاساس والاحداثيات/u.test(key))return 'vector-coordinates';
  if(/fractions? equivalent|equivalent fractions?|الكسور المتكافئ/u.test(key))return 'equivalent-fractions';
  return undefined;
}
function validateTeacherPlan(value,mode) {
  const max=TEACHER_LESSON_MODES[mode||'chapter'].planLimit;
  if(!Array.isArray(value)||!value.length||value.length>max)return null;
  const headings=value.map(line=>typeof line==='string'&&!/[\r\n]/.test(line)?line.trim():'');
  const keys=headings.map(teacherLessonKey);
  return headings.every((line,index)=>line.length<=120&&keys[index]&& !/^\d{1,2}[.)]\s/.test(line))&&
    new Set(keys).size===headings.length?headings:null;
}

function teacherVectorChapterTopic(value) {
  const topic=String(value||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[’']/g,' ')
    .replace(/^(?:(?:le |un )?cours (?:complet )?(?:sur |de |d )?|introduction (?:aux |a |to )|درس (?:حول )?|مقدمة في )/u,'')
    .replace(/^(?:les |l |the )/u,'').replace(/[.!?؟]$/u,'').trim();
  return /^(?:espaces? vectoriels?|vector spaces?|(?:ال)?فضاء(?:ات)? (?:ال)?(?:متجه|شعاع)(?:ة|ي|ية))(?:[ ,:(–-]+(?:niveau +)?(?:cpge|mpsi|l1)(?:[ /+,]+(?:cpge|mpsi|l1))*\)?)?$/u.test(topic);
}

function formatTeacherLesson(lesson,language) {
  const terms=TEACHER_LESSON_TERMS[language];
  const sections=lesson.sections.map(({heading,explanation,example,additions,diagram},index)=>({
    heading:(index+1)+'. '+heading,
    text:[explanation,example&&terms.example+'\n'+example,
      ...Object.entries(additions||{}).map(([kind,text])=>TEACHER_LESSON_ADDITIONS[kind][language]+'\n'+text)].filter(Boolean).join('\n\n'),
    section:index+1,diagram
  }));
  const exercises=lesson.exercises.map(({prompt,section},index)=>({
    heading:terms.exercise+' '+(index+1),text:prompt,
    reference:sections[section-1]?{section,label:terms.reference+' '+sections[section-1].heading}:null
  }));
  const body=[
    {heading:terms.objectives,text:lesson.objectives.map((goal,index)=>(index+1)+'. '+goal).join('\n')},...sections,
    {heading:terms.recap,text:lesson.recap},
    {heading:terms.practice,text:'',exercises}
  ];
  const answers=lesson.exercises.map(({solution},index)=>({heading:terms.exercise+' '+(index+1),text:solution}));
  const flatten=blocks=>blocks.map(({heading,text,exercises})=>heading+'\n'+(exercises?
    exercises.map(row=>[row.heading,row.text,row.reference?.label].filter(Boolean).join('\n')).join('\n\n'):text)).join('\n\n');
  return {lessonSections:body,correctionSections:answers,content:flatten(body),correction:flatten(answers)};
}

function teacherLessonReferences(text) {
  const name=Object.values(TEACHER_LESSON_TERMS).map(item=>item.reference).join('|');
  const reference=new RegExp('^(?:'+name+') (\\d{1,2})\\. (.+)$','u');
  const parts=String(text||'').split(/\n\s*\n/);
  const sections=new Map();
  for(const [index,part] of parts.entries()){
    const heading=part.match(/^(\d{1,2})\. (.{1,120})\n/u);
    if(heading&&!sections.has(Number(heading[1])))sections.set(Number(heading[1]),{index,title:heading[2]});
  }
  const links=new Map();
  for(const part of parts)for(const line of part.split('\n')){
    const match=line.match(reference);
    const target=match&&sections.get(Number(match[1]));
    if(target&&target.title===match[2])links.set(line,target.index);
  }
  return links.size?{parts,sections,links}:null;
}
