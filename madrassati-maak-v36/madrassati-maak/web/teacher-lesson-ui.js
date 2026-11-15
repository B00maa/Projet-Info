'use strict';

const TEACHER_LESSON_LABELS={
  'Niveau pédagogique':'المستوى البيداغوجي','Niveau de la classe':'مستوى القسم',
  'CPGE':'الأقسام التحضيرية','Licence 1 (L1)':'السنة الأولى من الإجازة',
  'Plan du cours':'خطة الدرس','Proposer un plan':'اقتراح خطة',
  'Valider le plan':'اعتماد الخطة',
  'Cours en préparation':'الدروس قيد الإعداد','Choisir un cours':'اختر درسًا','Nouveau cours':'درس جديد',
  'Renommer le cours':'إعادة تسمية الدرس','Dupliquer le cours':'نسخ الدرس','Nom du cours':'اسم الدرس',
  'Le cours a été renommé.':'تمت إعادة تسمية الدرس.','Le cours a été dupliqué.':'تم إنشاء نسخة من الدرس.',
  'Modifier le chapitre':'تعديل المحور','Régénérer le chapitre':'إعادة إنشاء المحور',
  'Nom du chapitre':'عنوان المحور','Objectif':'الهدف','Explication':'الشرح','À retenir':'خلاصة',
  'Énoncé de l’exercice':'نص التمرين','Corrigé de l’exercice':'تصحيح التمرين','Enregistrer le chapitre':'حفظ المحور',
  'Le chapitre a été mis à jour.':'تم تحديث المحور.','Ce cours est introuvable.':'هذا الدرس غير موجود.',
  'Vérifie les champs du chapitre et le titre dans le plan.':'تحقّق من حقول المحور ومن عنوانه في الخطة.',
  'Cours par chapitres':'إعداد الدرس حسب المحاور','Chapitres rédigés':'المحاور المكتوبة',
  'Rédigé':'مكتمل',
  'Générer le chapitre suivant':'إنشاء المحور التالي','Relire les chapitres':'مراجعة المحاور',
  'Recharger le brouillon':'إعادة تحميل المسودة','Le brouillon du cours est indisponible. Réessayez.':'مسودة الدرس غير متاحة حاليًا. أعيدوا المحاولة.',
  'Ajoutez les intitulés des chapitres avant de valider le plan.':'أضيفوا عناوين المحاور قبل اعتماد الخطة.',
  'Le plan est validé. Vous pouvez générer le premier chapitre.':'تم اعتماد الخطة. يمكنكم إنشاء المحور الأول.',
  'Le chapitre est enregistré.':'تم حفظ المحور.','Tous les chapitres du plan sont rédigés.':'اكتملت كتابة جميع محاور الخطة.',
  'Le coach rédige le chapitre suivant…':'يكتب المساعد المحور التالي…','Cours en cours de rédaction':'درس قيد الكتابة',
  'Le coach rédige à nouveau le chapitre…':'يعيد المساعد كتابة المحور…',
  'Le brouillon du cours a été actualisé.':'تم تحديث مسودة الدرس.',
  'Vérifie le sujet, la matière, le niveau et le plan du cours.':'تحقّق من الموضوع والمادة والمستوى وخطة الدرس.',
  'La classe ou la matière du plan a changé. Valide un nouveau plan.':'تغيّر قسم الخطة أو مادتها. اعتمد خطة جديدة.',
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
    '<div class="homework-actions"><button type="button" class="btn secondary small" data-action="teacher-coach-plan">Proposer un plan</button>'+
    (teacherCoachSchool()?'<button type="button" class="btn secondary small" data-action="teacher-course-start">Valider le plan</button>':'')+'</div></section>';
}

function teacherCoursePanel() {
  const session=teacherCoach;
  const course=session.course;
  const chooser=session.courses.length?`<div class="teacher-lesson-plan"><label for="teacherCourseSelect">Cours en préparation</label>
    <select id="teacherCourseSelect">${teacherCoachOptions([['','Choisir un cours'],...session.courses.map(item=>[item.id,item.name])],course?.id||'')}</select>
    <div><button class="btn secondary small" type="button" data-action="teacher-course-new">Nouveau cours</button></div></div>`:'';
  const warning=session.courseReadError?
    '<p class="teacher-coach-status"><span>Le brouillon du cours est indisponible. Réessayez.</span> <button type="button" class="btn secondary small" data-action="teacher-course-load">Recharger le brouillon</button></p>':'';
  if(!course)return chooser+warning;
  const {chapters,context}=course;
  const plan=context.lessonPlan;
  return chooser+warning+`<section class="teacher-lesson-plan" id="teacherCourseProgress" aria-labelledby="teacherCourseTitle">
    <h3 id="teacherCourseTitle">Cours par chapitres</h3><strong data-no-i18n="true" dir="auto">${esc(course.name)}</strong>
    <div class="homework-actions">
      <button class="btn secondary small" type="button" data-action="teacher-course-rename">Renommer le cours</button>
      <button class="btn secondary small" type="button" data-action="teacher-course-duplicate">Dupliquer le cours</button></div>
    <p class="small muted"><span>Chapitres rédigés</span> <bdi dir="ltr">${chapters.length} / ${plan.length}</bdi></p>
    <ol class="teacher-course-chapters">${plan.map((heading,i)=>`<li ${i===chapters.length?'aria-current="step"':''}><bdi data-no-i18n="true">${esc(heading)}</bdi>
      ${i<chapters.length?`<div class="homework-actions"><span class="tag mint">Rédigé</span>
        <button class="btn secondary small" type="button" data-action="teacher-course-edit-chapter" data-value="${i}">Modifier le chapitre<span class="sr-only"> · ${esc(heading)}</span></button>
        <button class="btn secondary small" type="button" data-action="teacher-course-regenerate" data-value="${i}">Régénérer le chapitre<span class="sr-only"> · ${esc(heading)}</span></button>
      </div>`:''}</li>`).join('')}</ol>
    <div class="homework-actions">
      ${chapters.length<plan.length?'<button type="button" class="btn primary small" data-action="teacher-course-next">Générer le chapitre suivant</button>':''}
      ${chapters.length?'<button type="button" class="btn secondary small" data-action="teacher-course-preview">Relire les chapitres</button>':''}
    </div></section>`;
}

function teacherCoursePreviewDraft(course) {
  if(!course?.chapters.length)return null;
  const {context,chapters}=course;
  const lessonData={
    objectives:chapters.map(chapter=>chapter.objective),
    sections:chapters.map(chapter=>chapter.section),
    recap:chapters.map((chapter,i)=>(i+1)+'. '+chapter.takeaway).join('\n'),
    exercises:chapters.map(chapter=>chapter.exercise)
  };
  const lessonLevelLabel=context.lessonLevel&&context.lessonLevel!=='class'?TEACHER_LESSON_LEVELS[context.lessonLevel][context.language]:undefined;
  return {...context,title:course.name,summary:lessonData.objectives[0],subjectName:context.subject,levelName:context.level,lessonLevelLabel,
    duration:context.minutes||TEACHER_LESSON_MODES[context.lessonMode||'chapter'].duration,source:'ai',fromChapterPlan:true,
    pendingChapters:chapters.length<context.lessonPlan.length,lessonData,...formatTeacherLesson(lessonData,context.language)};
}

function teacherApplyCourse(session,course,{restoreFields=false}={}) {
  session.course=course;
  if(course)session.courses=[{id:course.id,name:course.name},...session.courses.filter(item=>item.id!==course.id)];
  if(course?.chapters.length||session.drafts.lesson?.fromChapterPlan)session.drafts.lesson=teacherCoursePreviewDraft(course);
  if(!restoreFields||!course)return;
  const input=course.context;
  session.classId=teacherCoachClass(input.classId)?input.classId:'';
  session.subject=input.subject;
  session.level=input.level;
  session.language=input.language;
  session.topic=input.topic;
  session.notes=input.notes;
  session.settings.lesson={lessonPlanText:input.lessonPlan.join('\n'),lessonMode:input.lessonMode,lessonLevel:input.lessonLevel,minutes:input.minutes};
}

function loadTeacherCourse(id='',force=false) {
  const session=teacherCoach;
  if(!teacherCoachSchool()||(!id&&!force&&session.courseLoaded)||session.courseLoad)return session.courseLoad;
  if(id&&!session.courses.some(course=>course.id===id))return;
  const chooser=document.getElementById('teacherCourseSelect');
  if(chooser)chooser.disabled=true;
  const path=id?'/coach/course?id='+encodeURIComponent(id):'/coach/course';
  session.courseLoad=schRequest(path).then(({course,courses})=>{
    session.courses=courses;
    teacherApplyCourse(session,course,{restoreFields:!!id});
    session.courseLoaded=true;
    session.courseReadError=false;
  }).catch(()=>{
    session.courseReadError=true;
  }).finally(()=>{
    session.courseLoad=null;
    if(session===teacherCoach&&!session.request)refreshTeacherCoach();
  });
  return session.courseLoad;
}

function newTeacherCourse() {
  const session=teacherCoach;
  teacherApplyCourse(session,null);
  session.topic='';
  session.notes='';
  session.settings.lesson={};
  session.feedback='';
  session.failure='';
  refreshTeacherCoach('#teacherCoachTopic');
}

async function changeTeacherCourse(action,index) {
  const session=teacherCoach;
  if(!teacherCoachSchool()||session.task!=='lesson'||session.request)return;
  let context;
  if(action==='start') {
    const form=document.getElementById('teacherCoachForm');
    if(!form)return;
    context=teacherDraftContext(Object.fromEntries(new FormData(form)),true);
    if(!context)return;
    if(!context.lessonPlan) return schToast('Ajoutez les intitulés des chapitres avant de valider le plan.');
    context={...context,subject:context.subjectName,level:context.levelName};
  }
  if(action!=='start'&&!session.course)return;
  const loading=loadTeacherCourse();
  const request=new AbortController();
  session.request=request;
  session.activity=action==='next'?'section':action==='regenerate'?'section-again':'course-start';
  session.feedback='';
  session.failure='';
  const timeout=setTimeout(()=>request.abort('timeout'),70000);
  refreshTeacherCoach('[data-action="teacher-coach-cancel"]');
  try {
    await loading;
    if(session!==teacherCoach||request.signal.aborted)return;
    const {ok,data}=await requestAICoach({action,id:session.course?.id,revision:session.course?.revision||0,context,index},request.signal,'/api/school/coach/course');
    if(request.signal.aborted||session!==teacherCoach)return;
    if(ok&&data.course) {
      teacherApplyCourse(session,data.course,{restoreFields:action==='duplicate'});
      session.courseLoaded=true;
      session.courseReadError=false;
      const complete=data.course.chapters.length===data.course.context.lessonPlan.length;
      session.feedback=action==='start'?'Le plan est validé. Vous pouvez générer le premier chapitre.':
        action==='duplicate'?'Le cours a été dupliqué.':action==='regenerate'?'Le chapitre a été mis à jour.':
          complete?'Tous les chapitres du plan sont rédigés.':'Le chapitre est enregistré.';
    } else if(data.code==='course-changed') {
      await loadTeacherCourse(session.course?.id||'',true);
      session.feedback='Le brouillon du cours a été actualisé.';
    } else {
      if(AI_COACH_ACCOUNT_STATES.includes(data.status))session.access=data.status;
      session.failure=AI_COACH_ACCOUNT_STATES.includes(data.status)?'':data.status||'';
      session.retryAt=coachRetryDeadline(data.retryAfter);
      session.feedback=data.message||'';
    }
  } catch {
    if(!request.signal.aborted)session.failure='network-error';
    else if(request.signal.reason==='timeout')session.failure='timeout';
  } finally {
    clearTimeout(timeout);
    session.request=null;
    session.activity='';
    if(session===teacherCoach)refreshTeacherCoach('[data-action="teacher-course-next"], [data-action="teacher-course-preview"]');
  }
}

function teacherCourseForm(index) {
  const course=teacherCoach.course;
  if(!course)return;
  const chapter=course.chapters[index];
  if(index!=null&&!chapter)return;
  const field=(label,name,value,max,rows=0)=>`<div><label for="schoolCourseField-${name}">${label}</label>${rows?
    `<textarea id="schoolCourseField-${name}" name="${name}" rows="${rows}" maxlength="${max}" dir="auto" ${name==='example'?'':'required'}>${esc(value)}</textarea>`:
    `<input id="schoolCourseField-${name}" name="${name}" value="${esc(value)}" maxlength="${max}" dir="auto" required>`}</div>`;
  const content=chapter?`
    ${field('Nom du chapitre','heading',chapter.section.heading,120)}
    ${field('Objectif','objective',chapter.objective,90)}
    ${field('Explication','explanation',chapter.section.explanation,720,5)}
    ${field('Exemple résolu','example',chapter.section.example,250,3)}
    ${field('À retenir','takeaway',chapter.takeaway,95)}
    ${field('Énoncé de l’exercice','prompt',chapter.exercise.prompt,150,2)}
    ${field('Corrigé de l’exercice','solution',chapter.exercise.solution,700,4)}`:
    field('Nom du cours','name',course.name,120);
  schShowDialog(chapter?'Modifier le chapitre':'Renommer le cours',`<form class="form" data-school-form="teacher-course"
    data-id="${course.id}" data-revision="${course.revision}" data-index="${index??''}">
    ${content}${schError()}<div><button type="submit" class="btn primary">${chapter?'Enregistrer le chapitre':'Enregistrer'}</button></div></form>`);
}

function submitTeacherCourseForm(form,button) {
  const fields=Object.fromEntries(new FormData(form));
  const chapter=form.dataset.index!=='';
  const session=teacherCoach;
  const payload={id:form.dataset.id,revision:Number(form.dataset.revision),
    ...(chapter?{action:'edit-chapter',index:Number(form.dataset.index),fields}:{action:'rename',name:fields.name})};
  return schMutation(button,'/coach/course',payload,chapter?'Le chapitre a été mis à jour.':'Le cours a été renommé.',{
    close:true,onSaved({course}){
      if(session!==teacherCoach)return;
      teacherApplyCourse(session,course,{restoreFields:chapter});
      refreshTeacherCoach();
    }});
}

function showTeacherCourseDraft() {
  const draft=teacherCoursePreviewDraft(teacherCoach.course);
  if(!draft)return;
  if(!teacherCoach.drafts.lesson?.fromChapterPlan)teacherCoach.drafts.lesson=draft;
  refreshTeacherCoach();
  viewTeacherCoachOutput();
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
