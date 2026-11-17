'use strict';

const TEACHER_FRACTION_LESSON = {
  fr:{
    title:'Fractions équivalentes',
    summary:'Reconnaître et construire des fractions qui représentent la même quantité.',
    content:[
      'Objectifs\nReconnaître deux fractions équivalentes, compléter une égalité et simplifier une fraction.',
      'Comprendre\nDeux fractions sont équivalentes lorsqu’elles représentent la même quantité. Pour passer de l’une à l’autre, on peut multiplier ou diviser le numérateur et le dénominateur par un même nombre non nul. Pour simplifier avec des entiers, on choisit un diviseur commun.',
      'Exemple travaillé\nOn multiplie 2 et 3 par 4. On obtient 2/3 = 8/12. On peut faire l’opération inverse en divisant 8 et 12 par 4.',
      'À vérifier\nComplète 5/7 = …/21. Écris le nombre par lequel tu multiplies le numérateur et le dénominateur.'
    ].join('\n\n'),
    correction:'5/7 = 15/21. On multiplie 7 par 3 pour obtenir 21. On multiplie aussi 5 par 3, ce qui donne 15.'
  },
  ar:{
    title:'الكسور المتكافئة',
    summary:'التعرّف على الكسور التي تمثّل المقدار نفسه وإنشاؤها.',
    content:[
      'الأهداف\nالتعرّف على كسرين متكافئين، وإتمام مساواة بين كسرين، وتبسيط كسر.',
      'الفهم\nيمثّل الكسران المتكافئان المقدار نفسه. يمكن ضرب البسط والمقام في العدد نفسه غير المنعدم أو قسمتهما عليه. وللتبسيط باستعمال الأعداد الصحيحة، نختار قاسمًا مشتركًا.',
      'مثال محلول\nنضرب 2 و3 في 4، فنحصل على 2/3 = 8/12. ويمكن الرجوع إلى الكسر الأول بقسمة 8 و12 على 4.',
      'تحقّق من فهمك\nأكمل 5/7 = …/21. اكتب العدد الذي ضربتَ فيه البسط والمقام.'
    ].join('\n\n'),
    correction:'5/7 = 15/21. نضرب 7 في 3 لنحصل على 21، ونضرب 5 في 3 لنحصل على 15.'
  },
  en:{
    title:'Equivalent fractions',
    summary:'Recognise and make fractions that represent the same amount.',
    content:[
      'Learning objectives\nRecognise equivalent fractions, find a missing value and simplify a fraction.',
      'Key idea\nEquivalent fractions represent the same amount. Multiplying or dividing the numerator and denominator by the same non-zero number keeps the value unchanged. To simplify using whole numbers, divide by a common factor.',
      'Worked example\nMultiply both 2 and 3 by 4 to get 2/3 = 8/12. You can reverse the operation by dividing both 8 and 12 by 4.',
      'Check your understanding\nComplete 5/7 = …/21. Write the number you multiply the numerator and denominator by.'
    ].join('\n\n'),
    correction:'5/7 = 15/21. Multiply 7 by 3 to get 21, and multiply 5 by 3 to get 15.'
  }
};

function teacherLocalDuration(notes,fallback) {
  const match = arabicNumbersToLatin(notes).match(/(\d{1,3})\s*(?:min(?:ute(?:s)?)?\b|دقيقة)/i);
  const duration = Number(match?.[1]);
  return Number.isInteger(duration) && duration >= 1 && duration <= 180 ? duration : fallback;
}

function teacherTemplateDraft(context) {
  const template = TEACHER_COACH_TEMPLATES[context.language][context.task];
  const duration = context.minutes || teacherLocalDuration(context.notes,template.duration);
  return {...template,...context,duration,
    content:context.task === 'exam' ? template.content.replace('45',String(duration)) : template.content,
    title:context.topic.slice(0,100) || template.title,source:'template'};
}

function teacherLocalDraft(context) {
  if(localVectorTopic(context)) {
    const lesson=buildVectorLesson(context);
    return lesson&&{...context,...formatTeacherLesson(lesson,context.language),lessonData:lesson,title:lesson.title,
      summary:lesson.summary,lessonLevelLabel:lesson.level,duration:context.minutes||TEACHER_LESSON_MODES[context.lessonMode||'chapter'].duration,source:'local'};
  }
  const family=teacherPracticeFamily(context.topic,context.subjectName);
  if(!family)return null;
  if(context.task!=='lesson')return {...context,...teacherPracticeDraft(context,family)};
  if(family!=='fractionEquivalent'||context.lessonPlan)return null;
  const duration=context.lessonMode==='chapter'&&!context.customLessonDuration?30:teacherPracticeSettings(context).duration;
  return {...context,...TEACHER_FRACTION_LESSON[context.language],lessonMode:'session',duration,source:'local'};
}

function localVectorTopic(context) {
  const secondaryLevel=/primaire|college|lycee|\b[2-6](?:e|eme|ᵉ)(?=\s|$)|\bbac\b(?!\s*\+)|ابتدائي|اعدادي|ثانوي/u;
  const level=searchKey(arabicNumbersToLatin((context.notes||'').normalize('NFKC')));
  return context.task==='lesson'&&typeof buildVectorLesson==='function'&&teacherVectorChapterTopic(context.topic)&&
    /math|رياضيات/i.test(searchKey(context.subjectName))&&(context.lessonLevel&&context.lessonLevel!=='class'||!secondaryLevel.test(level));
}
