'use strict';

const teacherPracticeText=(language,...text)=>text[{fr:0,en:1,ar:2}[language]];
const teacherNumber=number=>String(Math.round(number*1e8)/1e8);
const teacherTopicText=value=>searchKey(arabicNumbersToLatin(value)).replace(/[’']/g,' ');

function teacherPracticeFamily(topic,subject) {
  const text=teacherTopicText(topic);
  const area=teacherTopicText(subject);
  if(!/math|رياضيات/.test(area))return '';
  if(/(?:addition|soustract|add(?:ing|ition)?\b|subtract|جمع|طرح).{0,32}(?:fraction|كسور)|(?:fraction|كسور).{0,32}(?:addition|soustract|add(?:ing|ition)?\b|subtract|جمع|طرح)/.test(text))return 'fractionSum';
  if(/(?:equival|simplifi|تكاف|تبسيط|متكاف).{0,25}(?:fraction|كسور)|(?:fraction|كسور).{0,25}(?:equival|simplifi|تكاف|تبسيط|متكاف)|^(?:les )?fractions?$|^الكسور$/.test(text))return 'fractionEquivalent';
  if(/pourcent|percentage|percent|نسب.{0,12}مئوي/.test(text)&&!/compose|successi|inverse/.test(text))return 'percent';
  if(/equation|معادل/.test(text)&&!/second|quadrati|differentiel|trigonomet|degre\s*[2-9]|مجمع|الثاني/.test(text))return 'equation';
  if(/proportionnalit|proportionality|تناسب/.test(text))return 'proportion';
  if(/(?:peri[mé]etr|perimetr|aire|area|perimeter|محيط|مساح).{0,30}(?:rectangle|مستطيل)|(?:rectangle|مستطيل).{0,30}(?:peri[mé]etr|perimetr|aire|area|perimeter|محيط|مساح)/.test(text))return 'rectangle';
  if(/pythagor|فيثاغورس/.test(text))return 'pythagoras';
  return '';
}

function teacherPracticeSettings(context) {
  const notes=teacherTopicText(context.notes||'');
  const raw=Number(notes.match(/\b(\d{1,2})\s*(?:exercices?|exercises?|questions?)\b|(\d{1,2})\s*(?:تمارين|اسئل)/)?.slice(1).find(Boolean));
  const count=context.count||(raw>=1&&raw<=12?raw:context.task==='exam'?4:5);
  const format=context.format||(/\bqcm\b|multiple choice|اختيار من متعدد/.test(notes)?'qcm':'open');
  const difficulty=context.difficulty||(/facile|easy|سهل/.test(notes)?'easy':/difficile|advanced|صعب/.test(notes)?'advanced':'progressive');
  const fallback=context.task==='exam'?45:context.task==='lesson'?(context.lessonMode==='chapter'?60:30):20;
  const duration=context.minutes||teacherLocalDuration(context.notes||'',fallback);
  const total=Number(notes.match(/(?:\/|sur |out of |من )\s*(\d{1,3})(?!\d)\s*(?:points?|marks?|نقط|[.,;]|$)/)?.[1])||20;
  return {count,format,difficulty,duration,total};
}

function teacherPracticeItem(family,context,index,settings) {
  const {language}=context;
  const t=(...words)=>teacherPracticeText(language,...words);
  const number=teacherNumber;
  const stage={easy:0,standard:1,advanced:2,progressive:Math.min(2,Math.floor(index*3/settings.count))}[settings.difficulty];
  const n=index+2+stage;
  const k=3+stage+index%4;
  const w=n+3;
  let prompt,answer,explain,alternatives;
  switch(family) {
    case 'fractionEquivalent': {
      const simplify=stage===2||(stage===1&&index%2===1);
      prompt=simplify?t(
        'Simplifie '+(n*k)+'/'+(w*k)+' en divisant les deux termes par '+k+'.',
        'Simplify '+(n*k)+'/'+(w*k)+' by dividing both terms by '+k+'.',
        'بسّط '+(n*k)+'/'+(w*k)+' بقسمة البسط والمقام على '+k+'.'
      ):t(
        'Complète '+n+'/'+w+' = …/'+(w*k)+'. Quel est le numérateur manquant ?',
        'Complete '+n+'/'+w+' = …/'+(w*k)+'. What is the missing numerator?',
        'أكمل '+n+'/'+w+' = …/'+(w*k)+'. ما البسط الناقص؟'
      );
      answer=simplify?n+'/'+w:String(n*k);
      alternatives=simplify?[(n+1)+'/'+w,n+'/'+(w+1)]:[String(n*k+k),String(n*k-k)];
      explain=simplify?t('Divise le numérateur et le dénominateur par '+k+'.','Divide the numerator and denominator by '+k+'.','نقسم البسط والمقام على '+k+'.'):
        t(w+' × '+k+' = '+w*k+'. On multiplie aussi le numérateur par '+k+'.',w+' × '+k+' = '+w*k+'. Multiply the numerator by '+k+' as well.',w+' × '+k+' = '+w*k+'. نضرب البسط أيضًا في '+k+'.');
      break;
    }
    case 'fractionSum': {
      const subtract=/soustract|subtract|طرح/.test(teacherTopicText(context.topic));
      const sign=subtract?'−':'+';
      const second=stage===0?1:2;
      const denominator=stage===0?w:w*2;
      const first=n*(denominator/w);
      const sum=first+(subtract?-second:second);
      const expression=n+'/'+w+' '+sign+' '+second+'/'+denominator;
      prompt=t('Calcule '+expression+'. Exprime le résultat avec le dénominateur '+denominator+'.',
        'Calculate '+expression+'. Write the result with denominator '+denominator+'.',
        'احسب '+expression+'. اكتب الناتج بالمقام '+denominator+'.');
      answer=sum+'/'+denominator;
      alternatives=[(sum+1)+'/'+denominator,(sum-1)+'/'+denominator];
      explain=t('Écris le premier terme '+first+'/'+denominator+', puis calcule '+first+' '+sign+' '+second+'.',
        'Rewrite the first term as '+first+'/'+denominator+', then work out '+first+' '+sign+' '+second+'.',
        'نكتب الحد الأول على شكل '+first+'/'+denominator+' ثم نحسب '+first+' '+sign+' '+second+'.');
      break;
    }
    case 'equation': {
      const rhs=n*k+w;
      const expression=stage===2?k+'x + '+(w+2)+' = 2x + '+(rhs-2*n+2):k+'x + '+w+' = '+rhs;
      prompt=t('Résous '+expression+'.','Solve '+expression+'.','حل المعادلة '+expression+'.');
      answer='x = '+n;alternatives=['x = '+(n+1),'x = '+(n-1)];
      const a=stage===2?k-2:k;
      explain=t('Isole les termes en x. Il reste '+a+'x = '+a*n+'. Divise par '+a+'.',
        'Collect the x terms to get '+a+'x = '+a*n+'. Divide by '+a+'.',
        'نجمع الحدود التي تحتوي على x فنحصل على '+a+'x = '+a*n+'. نقسم على '+a+'.');
      break;
    }
    case 'percent': {
      const amount=20+index*10+stage*30;
      const rate=5*(2+index%6+stage);
      const discount=amount*rate/100;
      const sale=stage>0&&/remise|reduction|discount|تخفيض/.test(teacherTopicText(context.topic+' '+context.notes));
      const result=sale?amount-discount:discount;
      prompt=sale?t(
        'Un article coûte '+amount+' DH avant une remise de '+rate+' %. Quel est le prix final ?',
        'An item costs '+amount+' DH before a '+rate+'% discount. What is the final price?',
        'ثمن سلعة '+amount+' درهم قبل تخفيض قدره '+rate+'%. ما الثمن النهائي؟'
      ):t('Calcule '+rate+' % de '+amount+'.','Calculate '+rate+'% of '+amount+'.','احسب '+rate+'% من '+amount+'.');
      answer=number(result)+(sale?' DH':'');
      alternatives=[number(result+5),number(result+2)].map(value=>value+(sale?' DH':''));
      explain=amount+' × '+rate+' / 100 = '+number(discount)+(sale?' ; '+amount+' − '+number(discount)+' = '+number(result)+'.':'.');
      break;
    }
    case 'proportion': {
      const price=n*k,units=w+stage;
      prompt=t(n+' cahiers coûtent '+price+' DH. Combien coûtent '+units+' cahiers au même prix unitaire ?',
        n+' notebooks cost '+price+' DH. What do '+units+' cost at the same unit price?',
        'ثمن '+n+' دفاتر هو '+price+' درهمًا. ما ثمن '+units+' دفاتر بالسعر نفسه للدفتر الواحد؟');
      answer=units*k+' DH';alternatives=[(units*k+k)+' DH',(units*k-k)+' DH'];
      explain=price+' ÷ '+n+' = '+k+' ; '+k+' × '+units+' = '+units*k+' DH.';
      break;
    }
    case 'rectangle': {
      const perimeter=/perimetr|perimeter|محيط/.test(teacherTopicText(context.topic));
      const unit=perimeter?' cm':' cm²';
      const result=perimeter?2*(n+w):n*w;
      prompt=t('Un rectangle mesure '+w+' cm sur '+n+' cm. Calcule '+(perimeter?'son périmètre.':'son aire.'),
        'A rectangle is '+w+' cm by '+n+' cm. Calculate its '+(perimeter?'perimeter.':'area.'),
        'أبعاد مستطيل '+w+' سم و'+n+' سم. احسب '+(perimeter?'محيطه.':'مساحته.'));
      answer=result+unit;
      alternatives=[(result+n)+unit,(result+w)+unit];
      explain=(perimeter?'2 × ('+n+' + '+w+')':n+' × '+w)+' = '+answer+'.';
      break;
    }
    case 'pythagoras': {
      const [a,b,c]=(stage===0?[3,4,5]:stage===1?[5,12,13]:[8,15,17]).map(value=>value*(index+1));
      const missing=stage!==0&&index%2!==0;
      prompt=missing?t('Un triangle rectangle a une hypoténuse de '+c+' cm et un côté de '+a+' cm. Calcule l’autre côté.',
        'A right triangle has a hypotenuse of '+c+' cm and a leg of '+a+' cm. Find the other leg.',
        'وتر مثلث قائم هو '+c+' سم وطول أحد ضلعي الزاوية القائمة '+a+' سم. احسب طول الضلع الآخر.'):
        t('Les côtés de l’angle droit mesurent '+a+' cm et '+b+' cm. Calcule l’hypoténuse.',
          'The legs of a right triangle measure '+a+' cm and '+b+' cm. Find the hypotenuse.',
          'طولا ضلعي الزاوية القائمة '+a+' سم و'+b+' سم. احسب طول الوتر.');
      const result=missing?b:c;
      answer=result+' cm';alternatives=[(result+1)+' cm',(result-1)+' cm'];
      explain=(missing?'√('+c+'² − '+a+'²)':'√('+a+'² + '+b+'²)')+' = '+answer+'.';
      break;
    }
  }
  if(settings.format!=='qcm')return {prompt,solution:answer+'. '+explain};
  const choices=[...alternatives];
  choices.splice(index%3,0,answer);
  const letters=['A','B','C'];
  return {prompt:[prompt,...choices.map((choice,i)=>letters[i]+') '+choice)].join('\n'),
    solution:letters[index%3]+') '+answer+'. '+explain};
}

function teacherPracticeDraft(context,family) {
  const settings=teacherPracticeSettings(context);
  const t=(...terms)=>teacherPracticeText(context.language,...terms);
  const exam=context.task==='exam';
  const label=exam?t('Question','Question','السؤال'):t('Exercice','Exercise','التمرين');
  const points=t('points','marks','نقاط');
  const directions=settings.format==='qcm'?t('Coche une seule réponse par question.','Choose one answer per question.','اختر إجابة واحدة لكل سؤال.'):
    t('Détaille tes calculs et justifie tes réponses.','Show your working and explain your answers.','اكتب خطوات الحساب وعلّل إجاباتك.');
  const total=exam?t('Total','Total','المجموع')+' '+settings.total+' '+points:'';
  const items=Array.from({length:settings.count},(_,index)=>teacherPracticeItem(family,context,index,settings));
  const sections=key=>items.map((item,index)=>{
    const mark=(Math.round(settings.total*100*(index+1)/items.length)-Math.round(settings.total*100*index/items.length))/100;
    return label+' '+(index+1)+(exam?' - '+mark+' '+points:'')+'\n'+item[key];
  });
  return {title:context.topic,summary:directions,content:[total,directions,...sections('prompt')].filter(Boolean).join('\n\n'),
    correction:[total,...sections('solution')].filter(Boolean).join('\n\n'),
    duration:settings.duration,count:settings.count,source:'local'};
}
