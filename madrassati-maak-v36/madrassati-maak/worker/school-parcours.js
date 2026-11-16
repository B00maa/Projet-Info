async function schoolCourses(db,account,child) {
  const rows=await schoolSessions(db,schoolSessionScope(account,child),'1',[],false);
  return rows.map(schoolSessionView);
}

async function schoolLessonOverview(db,account,child) {
  const scope=schoolSessionScope(account,child);
  const rows=await schoolAll(db,`SELECT s.id,s.title,s.subject,p.stage,p.updated_at,p.completed_at,
    q.questions,a.answers FROM school_sessions s
    LEFT JOIN school_lesson_progress p ON p.session_id=s.id AND p.student_id=?
    LEFT JOIN school_session_quizzes q ON q.session_id=s.id
    LEFT JOIN school_quiz_attempts a ON a.session_id=q.session_id AND a.quiz_revision=q.revision AND a.student_id=?
    WHERE s.cancelled_at IS NULL AND (${scope.where}) ORDER BY s.date,s.updated_at,s.id LIMIT 300`,
    [child.id,child.id,...scope.args]);
  const chapters=rows.map(({questions,answers,...row})=>{
    let review=[];
    if(answers) {
      const items=JSON.parse(questions);
      const choices=JSON.parse(answers);
      review=items.filter((item,index)=>item.correct!==choices[index]).map(item=>item.prompt);
    }
    return {...row,review};
  });
  const active=chapters.filter(row=>!row.completed_at).sort((a,b)=>(b.updated_at||0)-(a.updated_at||0))[0];
  return {chapters,next:active?.id??null};
}

async function schoolChapterOpen(db,account,data) {
  schoolRoles(account,'eleve');
  schoolRequire(['cours','quiz','devoir'].includes(data.stage),'Étape du chapitre invalide.');
  await schoolSessionDetails(db,account,account,data.id);
  const now=Date.now();
  await schoolRun(db,`INSERT INTO school_lesson_progress (student_id,session_id,stage,updated_at,completed_at)
    SELECT ?,s.id,?,?,? FROM school_sessions s
    JOIN school_enrolments e ON e.class_id=s.class_id AND e.student_id=?
    WHERE s.id=? AND s.cancelled_at IS NULL
    ON DUPLICATE KEY UPDATE stage=VALUES(stage),updated_at=VALUES(updated_at),
    completed_at=COALESCE(school_lesson_progress.completed_at,VALUES(completed_at))`,
    [account.id,data.stage,now,data.complete===true?now:null,account.id,data.id]);
  return {saved:true};
}

async function schoolChapterRoster(db,account,id) {
  schoolRoles(account,'professeur');
  const chapter=await schoolSessionDetails(db,account,null,id);
  const roster=await schoolAll(db,`SELECT a.name,p.updated_at,p.completed_at FROM school_enrolments e
    JOIN school_accounts a ON a.id=e.student_id AND a.active=1 AND a.role='eleve'
    LEFT JOIN school_lesson_progress p ON p.student_id=a.id AND p.session_id=?
    WHERE e.class_id=? ORDER BY a.name,a.id`,[id,chapter.class_id]);
  return {title:chapter.title,level:chapter.class_name,roster};
}

async function schoolChapterHelp(db,account,data) {
  schoolRoles(account,'eleve');
  const chapter=await schoolSessionDetails(db,account,account,data.id);
  const question=schoolText(data.question,2800);
  schoolRequire(question,'Écris ta question sur le chapitre.');
  return schoolMessageSend(db,account,{recipient:chapter.teacher_id,body:chapter.title+'\n\n'+question});
}
