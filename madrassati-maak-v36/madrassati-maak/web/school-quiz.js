'use strict';

function schQuizButton(item) {
  const {account,directory}=schoolUI.data;
  const teacher=account.role==='professeur'&&item.teacher_id===account.id&&directory.classes.some(row=>row.id===item.class_id);
  if(!item.id||(!teacher&&!(account.role==='eleve'&&item.has_quiz)))return '';
  const label=teacher?(item.has_quiz?'Modifier le quiz':'Ajouter un quiz'):'Faire le quiz';
  return `<button class="btn secondary small" type="button" data-school-action="quiz" data-id="${schEsc(item.id)}">${label}</button>`;
}

function schQuizQuestion(item,index) {
  const id='schoolQuizQuestion'+index;
  const letters=['A','B','C'];
  return `<fieldset class="school-block school-stack school-quiz-question" data-quiz-question>
    <legend>Question</legend>
    <div><label for="${id}-prompt">Énoncé</label><input id="${id}-prompt" data-question-prompt dir="auto"
      value="${schEsc(item?.prompt)}" maxlength="400" required></div>
    <div class="school-fields">${letters.map((letter,choice)=>`<div>
      <label for="${id}-choice${choice}"><span>Choix</span> <bdi data-no-i18n="true">${letter}</bdi></label>
      <input id="${id}-choice${choice}" data-question-choice dir="auto" value="${schEsc(item?.choices[choice])}" maxlength="200" required>
    </div>`).join('')}
      <div><label for="${id}-correct">Bonne réponse</label>
        <select id="${id}-correct" data-question-correct required>${schOpt('','Sélectionner')}${letters.map((letter,choice)=>
          schOpt(String(choice),letter,item?String(item.correct):'')).join('')}</select></div>
    </div>
    <div><label for="${id}-explanation">Explication du corrigé</label><textarea id="${id}-explanation" data-question-explanation dir="auto"
      maxlength="1000" rows="2" required>${schEsc(item?.explanation)}</textarea></div>
    <div><button type="button" class="btn secondary small" data-school-action="quiz-remove">Retirer la question</button></div>
    </fieldset>`;
}

function schQuizEditor(quiz) {
  const questions=quiz.questions.length?quiz.questions:[null];
  return `<form class="form" data-school-form="quiz-save" data-next-question="${questions.length}">
    <div class="school-stack" id="schoolQuizQuestions">${questions.map(schQuizQuestion).join('')}</div>
    ${schError()}<div class="school-actions">
      <button type="button" class="btn secondary" data-school-action="quiz-add">Ajouter une question</button>
      <button type="submit" class="btn primary">Enregistrer le quiz</button>
    </div></form>`;
}

function schQuizAttempt(quiz) {
  return `<form class="form" data-school-form="quiz-submit">
    ${quiz.questions.map((item,index)=>`<fieldset class="school-block school-choices school-quiz-question">
      <legend dir="auto">${schValue(item.prompt)}</legend>
      ${item.choices.map((choice,value)=>`<label><input type="radio" name="answer-${index}" value="${value}" required>
        <span dir="auto">${schValue(choice)}</span></label>`).join('')}
    </fieldset>`).join('')}
    ${schError()}<div><button type="submit" class="btn primary">Voir le corrigé</button></div></form>`;
}

function schQuizCorrection(quiz) {
  const {score,total,corrections}=quiz.result;
  return `<p class="school-meta"><span>Score</span> · <strong>${schValue(schExportNumber(score)+' / '+schExportNumber(total))}</strong></p>
    ${corrections.map((row,index)=>{
      const item=quiz.questions[index];
      return `<article class="school-block school-stack">
        <h4 dir="auto">${schValue(item.prompt)}</h4>
        <p><span>Ta réponse</span> · <span dir="auto">${schValue(item.choices[row.choice])}</span></p>
        <p><span>Bonne réponse</span> · <strong dir="auto">${schValue(item.choices[row.correct])}</strong></p>
        <p class="school-text" dir="auto" data-no-i18n="true">${schEsc(row.explanation)}</p>
      </article>`;
    }).join('')}
    <div><button type="button" class="btn secondary" data-school-action="quiz-retry">Refaire le quiz</button></div>`;
}

function schQuizDialog(quiz) {
  const teacher=schoolUI.data.account.role==='professeur';
  schoolUI.editor={kind:'quiz',quiz};
  schShowDialog(teacher?(quiz.revision?'Modifier le quiz':'Ajouter un quiz'):(quiz.result?'Corrigé du quiz':'Quiz de révision'),
    `<div class="school-stack"><h3>${schValue(quiz.title)}</h3>
      ${teacher?schQuizEditor(quiz):quiz.result?schQuizCorrection(quiz):schQuizAttempt(quiz)}</div>`);
  if(teacher)schQuizUpdateControls(schNode('schoolQuizQuestions'));
}

function schQuizUpdateControls(questions) {
  const count=questions.children.length;
  questions.querySelectorAll('[data-school-action="quiz-remove"]').forEach(button=>{button.disabled=count===1;});
  questions.closest('form').querySelector('[data-school-action="quiz-add"]').disabled=count>=8;
}

function schQuizAction(button) {
  const action=button.dataset.schoolAction;
  if(action==='quiz')return schFetchDialog(button,'/quiz?'+new URLSearchParams({session:button.dataset.id}),schQuizDialog);
  if(action==='quiz-retry')return schQuizDialog({...schoolUI.editor.quiz,result:null});
  const questions=schNode('schoolQuizQuestions');
  if(action==='quiz-add'&&questions.children.length<8) {
    const index=Number(button.form.dataset.nextQuestion);
    button.form.dataset.nextQuestion=String(index+1);
    questions.insertAdjacentHTML('beforeend',localizeHTML(schQuizQuestion(null,index)));
    questions.lastElementChild.querySelector('[data-question-prompt]').focus();
  }
  if(action==='quiz-remove'&&questions.children.length>1) {
    const item=button.closest('[data-quiz-question]');
    const focus=(item.nextElementSibling||item.previousElementSibling).querySelector('[data-question-prompt]');
    item.remove();
    focus.focus();
  }
  schQuizUpdateControls(questions);
}

async function schQuizSubmit(form,button) {
  button??=form.querySelector('button[type="submit"]');
  const quiz=schoolUI.editor.quiz;
  const base={id:quiz.id,revision:quiz.revision};
  if(form.dataset.schoolForm==='quiz-save') {
    const questions=[...form.querySelectorAll('[data-quiz-question]')].map(item=>({
      prompt:item.querySelector('[data-question-prompt]').value,
      choices:[...item.querySelectorAll('[data-question-choice]')].map(choice=>choice.value),
      correct:Number(item.querySelector('[data-question-correct]').value),
      explanation:item.querySelector('[data-question-explanation]').value
    }));
    return schMutation(button,'/quiz',{...base,questions},'Le quiz a été enregistré.',{close:true});
  }
  const values=new FormData(form);
  const answers=quiz.questions.map((_,index)=>Number(values.get('answer-'+index)));
  const error=form.querySelector('[data-school-error]');
  button.disabled=true;
  error.textContent='';
  try {
    const {result}=await schRequest('/quiz/submit',{...base,answers});
    if(form.isConnected&&schDialog().open)schQuizDialog({...quiz,result});
  } catch(failure) {
    error.textContent=tr(failure.message);
  } finally { button.disabled=false; }
}
