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

async function schoolQuizResults(db,account,id) {
  schoolRoles(account,'professeur');
  schoolRequire(schoolId(id),'Séance invalide.');
  const scope=schoolSessionScope(account,null);
  const quiz=await schoolFirst(db,`SELECT s.title,c.name AS class_name,q.questions,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('name',roster.name,'answers',roster.answers,'submittedAt',roster.submitted_at))
      FROM (
        SELECT a.name,t.answers,t.submitted_at FROM school_enrolments e
        JOIN school_accounts a ON a.id=e.student_id AND a.role='eleve' AND a.active=1
        LEFT JOIN school_quiz_attempts t ON t.session_id=q.session_id AND t.student_id=e.student_id AND t.quiz_revision=q.revision
        WHERE e.class_id=s.class_id ORDER BY a.name,a.id
      ) roster) AS roster
    FROM school_sessions s JOIN school_classes c ON c.id=s.class_id
    JOIN school_session_quizzes q ON q.session_id=s.id
    WHERE s.id=? AND (${scope.where})`,[id,...scope.args]);
  if(!quiz)throw new SchoolError(404,'Ce quiz de révision est introuvable.');

  const items=JSON.parse(quiz.questions);
  const questions=items.map(({prompt})=>({prompt,correct:0}));
  let completed=0;
  const roster=JSON.parse(quiz.roster||'[]').sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(({name,answers,submittedAt})=>{
    if(answers===null)return {name,score:null,submittedAt:null};
    completed++;
    const {score,corrections}=schoolQuizResult(items,answers);
    corrections.forEach(({choice,correct},index)=>{
      if(choice===correct)questions[index].correct++;
    });
    return {name,score,submittedAt};
  });
  return {title:quiz.title,className:quiz.class_name,completed,roster,questions};
}

async function schoolQuizSave(db,account,data) {
  schoolRoles(account,'professeur');
  schoolRequire(schoolId(data.id)&&Number.isInteger(data.revision)&&data.revision>=0,'Quiz invalide.');
  await schoolSessionDetails(db,account,null,data.id);
  const questions=schoolQuizQuestions(data.questions);
  const own=`SELECT 1 FROM school_sessions s JOIN school_teaching t ON t.teacher_id=s.teacher_id AND t.class_id=s.class_id
    WHERE s.id=? AND s.teacher_id=? AND s.cancelled_at IS NULL`;
  const encoded=JSON.stringify(questions);
  const result=data.revision?await schoolRun(db,`UPDATE school_session_quizzes
    SET questions=?,revision=revision+1 WHERE session_id=? AND revision=? AND EXISTS (${own})`,
    [encoded,data.id,data.revision,data.id,account.id]):
    await schoolRun(db,`INSERT IGNORE INTO school_session_quizzes(session_id,questions)
      SELECT ?,? WHERE EXISTS (${own})`,[data.id,encoded,data.id,account.id]);
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
    WHERE q.session_id=? AND q.revision=? AND s.cancelled_at IS NULL
    ON DUPLICATE KEY UPDATE answers=VALUES(answers),submitted_at=VALUES(submitted_at)`,
  [account.id,JSON.stringify(answers),Date.now(),account.id,data.id,data.revision]);
  if(!schoolChanged(result)&&!await schoolFirst(db,`SELECT 1 FROM school_quiz_attempts a
    JOIN school_session_quizzes q ON q.session_id=a.session_id AND q.revision=a.quiz_revision
    JOIN school_sessions s ON s.id=q.session_id AND s.cancelled_at IS NULL
    JOIN school_enrolments e ON e.student_id=a.student_id AND e.class_id=s.class_id
    WHERE a.session_id=? AND a.student_id=? AND a.quiz_revision=?`,[data.id,account.id,data.revision])) {
    throw new SchoolError(409,'Le quiz ou le niveau a changé. Rouvre le quiz.');
  }
  const resultView=schoolQuizResult(items,answers);
  await schoolChapterOpen(db,account,{id:data.id,stage:'quiz',complete:resultView.score===resultView.total});
  return {result:resultView};
}
