'use strict';

const TEACHER_LESSON_LABELS={
  'Niveau pédagogique':'المستوى البيداغوجي','Niveau de la classe':'مستوى القسم',
  'CPGE':'الأقسام التحضيرية','Licence 1 (L1)':'السنة الأولى من الإجازة',
  'Plan du cours':'خطة الدرس','Proposer un plan':'اقتراح خطة',
  'Une notion par ligne. Ajoutez, retirez ou réorganisez les notions avant la génération.':'اكتبوا محورًا في كل سطر. يمكن إضافة المحاور أو حذفها أو إعادة ترتيبها قبل الإنشاء.',
  'Le plan est prêt à modifier.':'الخطة جاهزة للتعديل.',
  'Le plan contient des intitulés répétés, trop longs ou trop nombreux.':'تتضمّن الخطة عناوين مكرّرة أو طويلة أو أكثر من العدد المسموح.',
  'Le plan a été suivi dans le cours et le PDF.':'اتبعت الخطة في الدرس وملف PDF.',
  'Certaines notions du plan nécessitent le coach en ligne.':'تتطلّب بعض محاور الخطة استخدام المساعد المتصل.',
  'Approfondir cette section':'توسيع هذا القسم','Démonstration':'برهان','Exemple résolu':'مثال محلول','Contre-exemple':'مثال مضاد',
  'Le coach propose un plan…':'يقترح المساعد خطة…','Le coach prépare l’approfondissement…':'يُحضّر المساعد التوسّع…',
  'Approfondissement ajouté au cours et au PDF.':'أُضيف التوسّع إلى الدرس وملف PDF.',
  'Connectez-vous au coach en ligne pour cette demande.':'سجّلوا الدخول إلى المساعد المتصل لتنفيذ الطلب.',
  'Le cours a atteint la longueur maximale de l’éditeur.':'بلغ الدرس الطول الأقصى للمحرّر.',
  'Vérification des calculs':'التحقق من الحسابات','Exercices avec un résultat à revoir':'تمارين تحتاج إلى مراجعة',
  'Les calculs ci-dessous ont été refaits à partir des données numériques du corrigé.':'أُعيدت الحسابات أدناه باستعمال المعطيات العددية في التصحيح.',
  'Consultez la vérification des calculs.':'راجعوا نتائج التحقق من الحسابات.'
};

const TEACHER_CHECK_TERMS={
  fr:{title:'Vérification des calculs',verified:'Vérifié',review:'À revoir',unavailable:'Calcul non vérifiable',claim:'Indiqué',value:'Recalculé',
    rank:'Rang',spanDimension:'Dimension de l’espace engendré',kernelDimension:'Dimension du noyau',sumDimension:'Dimension de la somme',
    intersectionDimension:'Dimension de l’intersection',coordinates:'Coordonnées'},
  en:{title:'Calculation checks',verified:'Verified',review:'Review',unavailable:'Calculation could not be verified',claim:'Given',value:'Recomputed',
    rank:'Rank',spanDimension:'Dimension of the span',kernelDimension:'Kernel dimension',sumDimension:'Dimension of the sum',
    intersectionDimension:'Dimension of the intersection',coordinates:'Coordinates'},
  ar:{title:'التحقق من الحسابات',verified:'صحيح',review:'للمراجعة',unavailable:'تعذّر التحقق من الحساب',claim:'الجواب المدوّن',value:'إعادة الحساب',
    rank:'الرتبة',spanDimension:'بُعد الفضاء المولّد',kernelDimension:'بُعد النواة',sumDimension:'بُعد المجموع',
    intersectionDimension:'بُعد التقاطع',coordinates:'الإحداثيات'}
};

function teacherLessonPlanControls(settings) {
  return '<section class="teacher-lesson-plan"><label for="teacherLessonPlanText">Plan du cours</label>'+
    '<textarea id="teacherLessonPlanText" name="lessonPlanText" rows="4" maxlength="1452" dir="auto" aria-describedby="teacherLessonPlanHint">'+esc(settings.lessonPlanText||'')+'</textarea>'+
    '<small id="teacherLessonPlanHint" class="muted">Une notion par ligne. Ajoutez, retirez ou réorganisez les notions avant la génération.</small>'+
    '<button type="button" class="btn secondary small" data-action="teacher-coach-plan">Proposer un plan</button></section>';
}

async function runTeacherLessonTool(context,parameters,localResult,apply,focus) {
  const session=teacherCoach;
  if(session.request)return;
  const request=new AbortController();
  session.request=request;
  session.activity=parameters.lessonAction;
  session.feedback='';
  session.failure='';
  const access=session.accessRequest||(!session.access?checkTeacherCoachAccess():session.access);
  if(!localResult)refreshTeacherCoach('[data-action="teacher-coach-cancel"]');
  try{
    const ready=localResult?false:(await access)==='ready';
    if(request.signal.aborted)return;
    const result=localResult||(ready?await requestTeacherCoach(context,request,parameters):{});
    if(session!==teacherCoach||request.signal.aborted&&result.status!=='timeout')return;
    if(AI_COACH_ACCOUNT_STATES.includes(result.status))session.access=result.status;
    session.failure=result.status&&!AI_COACH_ACCOUNT_STATES.includes(result.status)?result.status:'';
    session.retryAt=result.retryAt;
    if(result.plan||result.addition)apply(result);
    else if(!session.failure)session.feedback='Cet outil utilise le coach en ligne.';
  } finally {
    session.request=null;
    session.activity='';
    if(session===teacherCoach)refreshTeacherCoach(focus);
  }
}

function proposeTeacherLessonPlan() {
  const form=document.getElementById('teacherCoachForm');
  if(!form||teacherCoach.task!=='lesson')return;
  const context=teacherDraftContext(Object.fromEntries(new FormData(form)),true,true);
  if(!context)return;
  const local=localVectorTopic(context)?{plan:vectorLessonPlan(context)}:null;
  return runTeacherLessonTool(context,{lessonAction:'plan'},local,({plan})=>{
    (teacherCoach.settings.lesson??={}).lessonPlanText=plan.join('\n');
    teacherCoach.feedback='Le plan est prêt à modifier.';
  },'#teacherLessonPlanText');
}

function expandTeacherLessonSection(value) {
  const draft=currentTeacherDraft();
  const [number,kind]=String(value).split('/');
  const index=Number(number)-1;
  const part=draft?.lessonData?.sections[index];
  if(!part||!Object.hasOwn(TEACHER_LESSON_ADDITIONS,kind)||part.additions?.[kind])return;
  const candidate=draft.source==='local'&&part.key&&vectorLessonAddition(draft.language,part.key,kind);
  const params={lessonAction:'expand',addition:kind,heading:part.heading,explanation:part.explanation,example:part.example||''};
  return runTeacherLessonTool(draft,params,candidate?{addition:candidate}:null,({addition})=>{
    const sections=draft.lessonData.sections.map((section,i)=>i===index?{...section,additions:{...section.additions,[kind]:addition}}:section);
    const lessonData={...draft.lessonData,sections};
    const formatted=formatTeacherLesson(lessonData,draft.language);
    if(formatted.content.length>TEACHER_LESSON_PUBLISH_LIMIT){
      teacherCoach.feedback='Le cours a atteint la longueur maximale de l’éditeur.';
      return;
    }
    teacherCoach.drafts.lesson={...draft,...formatted,lessonData};
    teacherCoach.feedback='Approfondissement ajouté au cours et au PDF.';
  },'#teacherLessonSection'+number);
}

function teacherLessonChecks(draft) {
  const words=TEACHER_CHECK_TERMS[draft.language];
  const exercise=TEACHER_LESSON_TERMS[draft.language].exercise;
  return (draft.lessonData?.exercises||[]).flatMap(({checks},index)=>(checks||[]).map(check=>{
    if(!check)return {exercise:exercise+' '+(index+1),text:words.unavailable,status:'unknown'};
    const shown=values=>values.length>1?'('+values.join(', ')+')':values[0]||'—';
    return {exercise:exercise+' '+(index+1),status:check.valid?'ok':'review',text:words[check.type]+' · '+
      (check.valid?words.verified+' · '+shown(check.result):
        words.review+' · '+words.claim+' '+shown(check.provided)+' · '+words.value+' '+shown(check.result))};
  }));
}

function renderTeacherLessonChecks(draft) {
  const checks=teacherLessonChecks(draft);
  if(!checks.length)return '';
  const review=checks.some(item=>item.status==='review');
  return '<details class="teacher-calculations"'+(review?' open':'')+'><summary>'+(
    review?'Exercices avec un résultat à revoir':'Vérification des calculs')+
    '</summary><p>Les calculs ci-dessous ont été refaits à partir des données numériques du corrigé.</p><ul>'+
    checks.map(({exercise,text,status})=>'<li class="lesson-check-'+status+'" data-no-i18n="true" dir="auto"><strong>'+esc(exercise)+'</strong> — '+esc(text)+'</li>').join('')+
    '</ul></details>';
}

function teacherLessonBlock(draft,block,busy) {
  const {section,exercises,diagram,text}=block;
  if(exercises)return exercises.map(row=>'<div class="teacher-lesson-exercise"><h5>'+esc(row.heading)+'</h5><p>'+esc(row.text)+'</p>'+
    (row.reference?'<a data-action="teacher-coach-section" data-value="'+row.reference.section+'" href="#teacherLessonSection'+row.reference.section+'">'+esc(row.reference.label)+'</a>':'')+'</div>').join('');
  const part=section&&draft.lessonData?.sections[section-1];
  const addition=part?'<details class="teacher-lesson-additions"><summary>'+tr('Approfondir cette section')+'</summary><div class="homework-actions">'+
    Object.entries(TEACHER_LESSON_ADDITIONS).map(([kind,labels])=>
      '<button type="button" class="btn secondary small" data-action="teacher-coach-expand" data-value="'+section+'/'+kind+'"'+
      (busy||part.additions?.[kind]?' disabled':'')+'>'+tr(labels.fr)+'</button>').join('')+'</div></details>':'';
  return '<p>'+esc(text)+'</p>'+(diagram?renderLessonFigure(diagram,draft.language):'')+addition;
}
