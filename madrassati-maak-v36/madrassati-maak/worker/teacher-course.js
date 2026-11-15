const teacherLessonMode=input=>TEACHER_LESSON_MODES[input.lessonMode||'chapter'];
const coachMathCourse=input=>/math|رياضيات/u.test(teacherLessonKey(input.subject));
const lessonWords=value=>(value.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)||[]).length;

function validLessonRequest(input) {
  return (input.lessonMode==null||typeof input.lessonMode==='string'&&Object.hasOwn(TEACHER_LESSON_MODES,input.lessonMode))&&
    (input.lessonLevel==null||typeof input.lessonLevel==='string'&&Object.hasOwn(TEACHER_LESSON_LEVELS,input.lessonLevel))&&
    (input.lessonPlan==null||!!validateTeacherPlan(input.lessonPlan,input.lessonMode))&&
    (input.lessonAction==null||input.lessonAction==='plan'||input.lessonAction==='section'&&
      Array.isArray(input.lessonPlan)&&Number.isInteger(input.lessonIndex)&&input.lessonIndex>=0&&input.lessonIndex<input.lessonPlan.length||
      input.lessonAction==='expand'&&
      typeof input.addition==='string'&&Object.hasOwn(TEACHER_LESSON_ADDITIONS,input.addition)&&
      !!schoolText(input.heading,120)&&!!schoolText(input.explanation,3200)&&typeof input.example==='string'&&input.example.length<=1600);
}

function teacherLessonInstructions(input) {
  const mode=teacherLessonMode(input);
  const chapter=input.lessonMode!=='session';
  const plan=input.lessonPlan;
  const examples=plan?Math.min(plan.length,mode.examples):mode.examples;
  return [chapter?'Rédige un chapitre complet et progressif sur le sujet, utilisable sur plusieurs séances. La durée indique le temps de travail, pas une limite au programme du chapitre.':
    'Prépare une séance qui développe une notion ciblée, au rythme indiqué et adaptée au niveau de la classe.',
    plan?'Développe les '+plan.length+' notions du plan dans l’ordre. Recopie chaque intitulé dans heading sans le renuméroter.':
      'Donne '+mode.sections.join(' à ')+' sections distinctes. Réserve une section à chaque notion essentielle du sujet.',
    'Donne 3 objectifs distincts, une synthèse de 30 à 70 mots, '+mode.exercises[0]+' exercices progressifs et leurs solutions détaillées. Le champ section de chaque exercice indique le numéro de la section de cours associée (à partir de 1).',
    plan?'Donne au moins '+(chapter?60:35)+' mots d’explication par notion, en plus des exemples.':
      'Développe '+mode.words.join(' à ')+' mots de cours (explications, exemples et synthèse), avec au moins '+(chapter?65:35)+' mots d’explication par section.',
    'Répartis '+examples+' exemples résolus dans autant de sections. Développe chaque exemple sur 30 mots ou plus en donnant les étapes et le résultat.',
    'Dans les autres sections, renvoie une chaîne vide pour example. Explique les cas limites ou erreurs fréquentes lorsque c’est utile. Rédige en texte brut, en paragraphes. Vise moins de 11 200 caractères pour le texte et les énoncés. Garde chaque correction dans solution.',
    chapter&&!plan&&teacherVectorChapterTopic(input.topic)?'Pour les espaces vectoriels, développe les définitions et des exemples, le critère de sous-espace, les combinaisons linéaires et l’espace engendré, la liberté, les bases, les coordonnées, la dimension et le rang. En CPGE ou dans le supérieur, traite aussi sommes, sommes directes et supplémentaires, avec la formule de Grassmann si le niveau le permet.':null,
    coachMathCourse(input)?'Pour un calcul de rang, de dimension ou de coordonnées sur données numériques, ajoute une vérification dans checks avec les valeurs de l’énoncé et la réponse du corrigé. Types : rank, spanDimension (dimension de l’image ou de l’espace engendré), kernelDimension (dimension du noyau), sumDimension, intersectionDimension, coordinates (résoudre matrix × coordonnées = vector). Les matrices sont des listes de lignes, et les vecteurs générateurs sont en colonnes. Écris les nombres en chaînes, par exemple "4" ou "-2/3". Pour le rang et les dimensions, answer contient le seul entier annoncé. Laisse otherMatrix et vector vides quand inutilisés, et checks vide si ces calculs ne s’appliquent pas.':null
  ].filter(Boolean);
}

function teacherLessonToolPrompt(input) {
  if(input.lessonAction==='section') return teacherLessonSectionPrompt(input);
  const mode=teacherLessonMode(input);
  const plan=input.lessonAction==='plan';
  const level=input.lessonLevel==='class'||!input.lessonLevel?input.level:TEACHER_LESSON_LEVELS[input.lessonLevel].fr;
  const example=plan?'{"plan":["Première notion","Deuxième notion"]}':'{"text":"Texte rédigé de l’ajout"}';
  return {
    max_tokens:plan?850:1400,response_format:{type:'json_object'},
    messages:[{role:'system',content:[
      'Tu es le coach pédagogique de Madrassati Maâk. Respecte la langue et le niveau, emploie des notations mathématiques lisibles et évite toute donnée personnelle.',
      plan?'Propose un plan progressif de '+mode.sections.join(' à ')+' notions précises à traiter. Donne seulement les intitulés distincts, sans numéros. Ne rédige aucun cours.':
        'Ajoute uniquement le développement demandé pour la section donnée. Rédige 80 à 230 mots, avec des hypothèses explicites et un raisonnement détaillé. Un contre-exemple doit préciser quelle affirmation échoue et le vérifier. Ne recopie pas la section et ne réécris pas le reste du cours.',
      'Réponds exclusivement en json sous cette forme : '+example
    ].join(' ')},{role:'user',content:JSON.stringify({matière:input.subject,niveau:level,langue:input.language,sujet:input.topic,
      portée:input.lessonMode==='session'?'séance ciblée':'chapitre complet',précisions:input.notes,
      ...(plan?{}:{ajout:TEACHER_LESSON_ADDITIONS[input.addition].fr,section:input.heading,cours:input.explanation,exemple:input.example})})}]
  };
}

function teacherLessonSectionPrompt(input) {
  const number=input.lessonIndex+1;
  const level=input.lessonLevel&&input.lessonLevel!=='class'?TEACHER_LESSON_LEVELS[input.lessonLevel].fr:input.level;
  const math=coachMathCourse(input);
  return {
    max_tokens:2200,expandedTokens:2900,response_format:{type:'json_object'},
    messages:[{role:'system',content:[
      'Rédige uniquement la section demandée du cours et respecte la langue. Suis le plan et le niveau sans répéter les notions du plan traitées ailleurs.',
      'Donne un objectif inférieur à 90 caractères, un cours rédigé entre 45 mots et 720 caractères, un exemple résolu inférieur à 250 caractères, une phrase à retenir inférieure à 95 caractères, et un exercice autonome inférieur à 150 caractères avec son corrigé expliqué inférieur à 700 caractères.',
      'Pour des mathématiques de niveau CPGE ou L1 précise les hypothèses, puis justifie la propriété utilisée. Emploie du texte brut avec des notations lisibles.',
      'Réponds exclusivement en JSON sous cette forme : {"objective":"Objectif","explanation":"Cours rédigé","example":"Exemple résolu","takeaway":"À retenir","exercise":{"prompt":"Énoncé","solution":"Correction","section":'+number+(math?',"checks":[]':'')+'}}.',
      math?'Lorsque tu annonces un résultat de rang, de dimension ou de coordonnées dans le corrigé, ajoute dans checks les données numériques et le résultat comme chaînes. Champs : type (rank, spanDimension, kernelDimension, sumDimension, intersectionDimension, coordinates), matrix, otherMatrix, vector et answer. Les vecteurs générateurs sont en colonnes. Sinon, checks reste vide.':''
    ].join(' ')},{role:'user',content:JSON.stringify({matière:input.subject,niveau:level,langue:TEACHER_LANGUAGES[input.language],
      sujet:input.topic,plan:input.lessonPlan,section:number,intitulé:input.lessonPlan[input.lessonIndex],précisions:input.notes})}]
  };
}

function validatedTeacherSection(data,input) {
  const objective=schoolText(data.objective,90);
  const explanation=schoolText(data.explanation,720);
  const example=schoolText(data.example,250);
  const takeaway=schoolText(data.takeaway,95);
  const prompt=schoolText(data.exercise?.prompt,150);
  const solution=schoolText(data.exercise?.solution,700);
  if(!objective||!takeaway||lessonWords(explanation)<40||lessonWords(example)<12||lessonWords(prompt)<4||lessonWords(solution)<12)return null;
  const heading=input.lessonPlan[input.lessonIndex];
  const checks=coachMathCourse(input)&&Array.isArray(data.exercise.checks)?data.exercise.checks.slice(0,4).map(checkLessonCalculation):[];
  return {chapter:{objective,takeaway,section:{heading,explanation,example,diagram:lessonDiagramForHeading(heading)},
    exercise:{prompt,solution,section:input.lessonIndex+1,checks}}};
}

async function schoolTeacherCourse(db,account) {
  schoolRoles(account,'professeur');
  const row=await schoolFirst(db,'SELECT context,chapters,revision FROM school_teacher_course_drafts WHERE teacher_id=?',[account.id]);
  return row?{revision:row.revision,context:JSON.parse(row.context),chapters:JSON.parse(row.chapters)}:null;
}

async function schoolEditTeacherCourse(request,env,account) {
  schoolRoles(account,'professeur');
  const db=env.DB;
  const data=await schoolJson(request,8192);
  const course=await schoolTeacherCourse(db,account);
  const changed=()=>new SchoolError(409,'Le brouillon du cours a changé. Rouvre-le pour reprendre.','course-changed');
  if(data.revision!==(course?.revision||0))throw changed();
  if(data.action==='start') {
    const {classId,subject,level,language,topic,notes,lessonMode,lessonLevel,minutes,lessonPlan}=data.context||{};
    const context=await schoolTeacherCoachContext(db,account,{profile:'teacher',task:'lesson',classId,subject,level,
      language,topic,notes,lessonMode,lessonLevel,minutes,lessonPlan,lessonAction:'section',lessonIndex:0});
    schoolRequire(teacherCoachRequest(context),'Vérifie le sujet, la matière, le niveau et le plan du cours.');
    delete context.lessonAction;
    delete context.lessonIndex;
    context.lessonPlan=validateTeacherPlan(context.lessonPlan,context.lessonMode);
    const result=await schoolRun(db,`INSERT INTO school_teacher_course_drafts(teacher_id,context) VALUES(?,?)
      ON CONFLICT(teacher_id) DO UPDATE SET context=excluded.context,chapters='[]',revision=revision+1
      WHERE school_teacher_course_drafts.revision=?`,[account.id,JSON.stringify(context),data.revision]);
    if(!schoolChanged(result))throw changed();
    return json({course:{context,chapters:[],revision:data.revision+1}});
  }
  schoolRequire(data.action==='next'&&course&&course.chapters.length<course.context.lessonPlan.length,
    'Choisis un chapitre du plan à générer.');
  const current=await schoolTeacherCoachContext(db,account,course.context);
  schoolRequire(current.subject===course.context.subject&&current.level===course.context.level,
    'La classe ou la matière du plan a changé. Valide un nouveau plan.');
  const response=await replyToCoach(request,env,account,{...course.context,lessonAction:'section',lessonIndex:course.chapters.length});
  if(!response.ok)return response;
  const {chapter}=await response.json();
  const chapters=[...course.chapters,chapter];
  const result=await schoolRun(db,`UPDATE school_teacher_course_drafts SET chapters=?,revision=revision+1
    WHERE teacher_id=? AND revision=?`,[JSON.stringify(chapters),account.id,course.revision]);
  if(!schoolChanged(result))throw changed();
  return json({course:{...course,chapters,revision:course.revision+1}});
}

function teacherLessonExerciseSchema(input) {
  const text={type:'string'},matrix={type:'array',items:{type:'array',items:text}},vector={type:'array',items:text};
  const exercise={prompt:text,solution:text,section:{type:'integer'}};
  if(coachMathCourse(input))exercise.checks={type:'array',items:structuredCoachObject({
    type:{type:'string',enum:LESSON_CALCULATIONS},matrix,otherMatrix:matrix,vector,answer:vector
  })};
  return structuredCoachObject(exercise);
}

function validatedTeacherLesson(draft,input) {
  const mode=teacherLessonMode(input),plan=input.lessonPlan&&validateTeacherPlan(input.lessonPlan,input.lessonMode);
  const {objectives,sections,exercises}=draft;
  const list=(value,min,max)=>Array.isArray(value)&&value.length>=min&&value.length<=max;
  const sectionCount=plan?[plan.length,plan.length]:mode.sections;
  if(!list(objectives,2,5)||!list(sections,...sectionCount)||!list(exercises,...mode.exercises))return null;
  const distinct=values=>new Set(values.map(teacherLessonKey)).size===values.length;
  const goals=objectives.map(value=>schoolText(value,250));
  const parts=sections.map(item=>({heading:schoolText(item?.heading,120),
    explanation:schoolText(item?.explanation,3200),example:schoolText(item?.example,1600)}));
  if(plan&&parts.some((part,index)=>{
    const heading=teacherLessonKey(plan[index]);
    const unnumbered=part.heading.replace(/^\d{1,2}\s*[.)–:-]\s+/u,'');
    return teacherLessonKey(part.heading)!==heading&&teacherLessonKey(unnumbered)!==heading;
  }))return null;
  if(plan)parts.forEach((part,index)=>{part.heading=plan[index];});
  parts.forEach(part=>{part.diagram=lessonDiagramForHeading(part.heading);});
  const recap=schoolText(draft.recap,1800);
  const math=coachMathCourse(input);
  const practice=exercises.map(item=>({
    prompt:schoolText(item?.prompt,1000),solution:schoolText(item?.solution,1800),
    section:typeof item?.section==='string'&&/^\d{1,2}$/.test(item.section.trim())?Number(item.section):item?.section??null,
    checks:math&&Array.isArray(item?.checks)?item.checks.slice(0,4).map(checkLessonCalculation):[]
  }));
  if(!goals.every(Boolean)||!distinct(goals)||lessonWords(recap)<20||
     parts.some(item=>!item.heading||lessonWords(item.explanation)<mode.sectionWords)||
     parts.filter(item=>lessonWords(item.example)>=16).length<(plan?Math.min(plan.length,mode.examples):mode.examples)||
     !distinct(parts.map(item=>item.heading))||!distinct(parts.map(item=>item.explanation))||
     practice.some(item=>lessonWords(item.prompt)<4||lessonWords(item.solution)<12||
       (item.section!==null||plan||input.lessonLevel)&&(!Number.isInteger(item.section)||item.section<1||item.section>parts.length))||
     !distinct(practice.map(item=>item.prompt)))return null;
  if(parts.reduce((sum,item)=>sum+lessonWords(item.explanation)+lessonWords(item.example),lessonWords(recap))<
    (plan?Math.min(mode.minimum,plan.length*58+40):mode.minimum))return null;
  const lessonData={objectives:goals,sections:parts,recap,exercises:practice};
  const body=formatTeacherLesson(lessonData,input.language);
  return body.content.length<=12000&&body.correction.length<=16000?{...body,lessonData}:null;
}
