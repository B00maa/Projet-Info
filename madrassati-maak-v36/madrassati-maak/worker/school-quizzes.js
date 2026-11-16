function schoolQuizQuestions(items) {
  schoolRequire(Array.isArray(items)&&items.length>=1&&items.length<=8,'Prépare entre 1 et 8 questions.');
  return items.map(item=>{
    const prompt=schoolText(item?.prompt,400);
    const choices=Array.isArray(item?.choices)?item.choices.map(value=>schoolText(value,200)):[];
    const explanation=schoolText(item?.explanation,1000);
    schoolRequire(prompt&&choices.length===3&&choices.every(Boolean)&&new Set(choices.map(value=>value.toLowerCase())).size===3&&
      Number.isInteger(item.correct)&&item.correct>=0&&item.correct<choices.length&&explanation,
    'Vérifie les questions, les trois choix et les corrigés.');
    return {prompt,choices,correct:item.correct,explanation};
  });
}

function schoolQuizResult(items,answers) {
  const corrections=items.map((item,index)=>({
    choice:answers[index],correct:item.correct,explanation:item.explanation
  }));
  return {score:corrections.filter(row=>row.choice===row.correct).length,total:items.length,corrections};
}

async function schoolQuiz(db,account,id) {
  schoolRoles(account,'professeur','eleve');
  const session=await schoolSessionDetails(db,account,account.role==='eleve'?account:null,id);
  const row=await schoolFirst(db,'SELECT questions,revision FROM school_session_quizzes WHERE session_id=?',[id]);
  if(!row&&account.role==='eleve')throw new SchoolError(404,'Ce quiz de révision est introuvable.');
  const questions=row?JSON.parse(row.questions):[];
  if(account.role==='professeur')return {id,title:session.title,revision:row?.revision||0,questions};
  const attempt=await schoolFirst(db,`SELECT answers FROM school_quiz_attempts
    WHERE session_id=? AND student_id=? AND quiz_revision=?`,[id,account.id,row.revision]);
  return {id,title:session.title,revision:row.revision,
    questions:questions.map(({prompt,choices})=>({prompt,choices})),
    result:attempt?schoolQuizResult(questions,JSON.parse(attempt.answers)):null};
}

async function schoolQuizSave(db,account,data) {
  schoolRoles(account,'professeur');
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision)&&data.revision>=0,'Quiz invalide.');
  await schoolSessionDetails(db,account,null,data.id);
  const questions=schoolQuizQuestions(data.questions);
  const result=await schoolRun(db,`INSERT INTO school_session_quizzes(session_id,questions)
    SELECT s.id,? FROM school_sessions s JOIN school_teaching t ON t.teacher_id=s.teacher_id AND t.class_id=s.class_id
    WHERE s.id=? AND s.teacher_id=? AND (SELECT COALESCE(MAX(revision),0) FROM school_session_quizzes WHERE session_id=s.id)=?
    ON CONFLICT(session_id) DO UPDATE SET questions=excluded.questions,revision=school_session_quizzes.revision+1`,
  [JSON.stringify(questions),data.id,account.id,data.revision]);
  if(!schoolChanged(result))throw new SchoolError(409,'Le quiz ou la séance a changé. Rouvre le quiz.');
  return {saved:true};
}

async function schoolQuizSubmit(db,account,data) {
  schoolRoles(account,'eleve');
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision)&&data.revision>0,'Quiz invalide.');
  await schoolSessionDetails(db,account,account,data.id);
  const quiz=await schoolFirst(db,'SELECT questions,revision FROM school_session_quizzes WHERE session_id=?',[data.id]);
  if(!quiz||quiz.revision!==data.revision)throw new SchoolError(409,'Le quiz a changé. Rouvre-le pour répondre.');
  const items=JSON.parse(quiz.questions);
  const answers=data.answers;
  schoolRequire(Array.isArray(answers)&&answers.length===items.length&&
    answers.every((value,index)=>Number.isInteger(value)&&value>=0&&value<items[index].choices.length),
  'Réponds à chaque question du quiz.');
  const result=await schoolRun(db,`INSERT INTO school_quiz_attempts(session_id,student_id,quiz_revision,answers,submitted_at)
    SELECT q.session_id,?,q.revision,?,? FROM school_session_quizzes q
    JOIN school_sessions s ON s.id=q.session_id JOIN school_enrolments e ON e.class_id=s.class_id AND e.student_id=?
    WHERE q.session_id=? AND q.revision=?
    ON CONFLICT(session_id,student_id,quiz_revision) DO UPDATE SET answers=excluded.answers,submitted_at=excluded.submitted_at`,
  [account.id,JSON.stringify(answers),Date.now(),account.id,data.id,data.revision]);
  if(!schoolChanged(result))throw new SchoolError(409,'Le quiz ou la classe a changé. Rouvre le quiz.');
  return {result:schoolQuizResult(items,answers)};
}
