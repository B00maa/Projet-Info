function schoolContactScope(account) {
  if(account.role==='administration') return {where:'1',args:[]};
  const isClassTeacher=`EXISTS (SELECT 1 FROM school_teaching t JOIN school_enrolments e ON e.class_id=t.class_id
    WHERE t.teacher_id=? AND e.student_id=a.id)`;
  const isParentOfStudent=`EXISTS (SELECT 1 FROM school_teaching t JOIN school_enrolments e ON e.class_id=t.class_id
    JOIN school_guardians g ON g.student_id=e.student_id
    JOIN school_accounts child ON child.id=e.student_id AND child.active=1
    WHERE t.teacher_id=? AND g.parent_id=a.id)`;
  if(account.role==='professeur') return {where:`(a.role='administration' OR
    (a.role='eleve' AND ${isClassTeacher}) OR (a.role='parent' AND ${isParentOfStudent}))`,args:[account.id,account.id]};
  const studentFilter=account.role==='eleve'?'e.student_id=?':`EXISTS (
    SELECT 1 FROM school_guardians g JOIN school_accounts child ON child.id=g.student_id AND child.active=1
    WHERE g.student_id=e.student_id AND g.parent_id=?)`;
  return {where:`(a.role='administration' OR (a.role='professeur' AND EXISTS (
    SELECT 1 FROM school_teaching t JOIN school_enrolments e ON e.class_id=t.class_id
    WHERE t.teacher_id=a.id AND ${studentFilter})))`,args:[account.id]};
}

function schoolContacts(db,account) {
  const scope=schoolContactScope(account);
  return schoolAll(db,`SELECT a.id,a.name,a.role FROM school_accounts a
    WHERE a.id<>? AND a.active=1 AND ${scope.where} ORDER BY a.name,a.id LIMIT 1000`,[account.id,...scope.args]);
}

function schoolMessages(db,account) {
  return schoolAll(db,`SELECT m.*,s.name AS sender_name,r.name AS recipient_name FROM school_messages m
    JOIN school_accounts s ON s.id=m.sender_id JOIN school_accounts r ON r.id=m.recipient_id
    WHERE m.sender_id=? OR m.recipient_id=? ORDER BY m.created_at DESC,m.id DESC LIMIT 250`,[account.id,account.id]);
}

async function schoolMessageSend(db,account,data) {
  const body=schoolText(data.body,3000);
  schoolRequire(schoolId(data.recipient)&&body,'Choisis un destinataire et écris un message.');
  const scope=schoolContactScope(account);
  const result=await schoolRun(db,`INSERT INTO school_messages(id,sender_id,recipient_id,body,created_at)
    SELECT ?,?,a.id,?,? FROM school_accounts a
    WHERE a.id=? AND a.id<>? AND a.active=1 AND ${scope.where}`,
  [crypto.randomUUID(),account.id,body,Date.now(),data.recipient,account.id,...scope.args]);
  if(!schoolChanged(result)) throw new SchoolError(403,'Ce destinataire n’est pas disponible.');
}

async function schoolMessageRead(db,account,data) {
  schoolRequire(schoolId(data.peer),'Conversation invalide.');
  await schoolRun(db,'UPDATE school_messages SET read_at=? WHERE sender_id=? AND recipient_id=? AND read_at IS NULL',
    [Date.now(),data.peer,account.id]);
}

function schoolAnnouncementScope(account) {
  if(account.role==='parent') return {where:`(n.class_id IS NULL OR EXISTS (
    SELECT 1 FROM school_guardians g JOIN school_accounts a ON a.id=g.student_id AND a.active=1
    JOIN school_enrolments e ON e.student_id=g.student_id AND e.class_id=n.class_id
    WHERE g.parent_id=?))`,args:[account.id]};
  const scope=schoolClassScope(account,account.role==='eleve'?account:null,'n');
  return {where:'(n.class_id IS NULL OR '+scope.where+')',args:scope.args};
}

function schoolAnnouncements(db,account) {
  const scope=schoolAnnouncementScope(account);
  const counts=account.role==='administration'?`,(SELECT COUNT(*) FROM school_announcement_reads x
    WHERE x.announcement_id=n.id) AS confirmations`:'';
  return schoolAll(db,`SELECT n.*,c.name AS class_name,a.name AS author_name,r.read_at${counts}
    FROM school_announcements n LEFT JOIN school_classes c ON c.id=n.class_id
    JOIN school_accounts a ON a.id=n.author_id LEFT JOIN school_announcement_reads r
    ON r.announcement_id=n.id AND r.account_id=? WHERE ${scope.where} ORDER BY n.created_at DESC,n.id LIMIT 200`,
  [account.id,...scope.args]);
}

async function schoolAnnouncementPublish(db,account,data) {
  schoolRoles(account,'administration');
  const title=schoolText(data.title,120);
  const body=schoolText(data.body,4000);
  const classId=data.classId||null;
  schoolRequire(title&&body&&(!classId||schoolId(classId)),'Vérifie le titre, le message et les destinataires.');
  if(classId&&!await schoolFirst(db,'SELECT id FROM school_classes WHERE id=?',[classId])) {
    throw new SchoolError(404,'Cette classe est introuvable.');
  }
  await schoolRun(db,`INSERT INTO school_announcements(id,author_id,class_id,title,body,require_receipt,created_at)
    VALUES(?,?,?,?,?,?,?)`,[crypto.randomUUID(),account.id,classId,title,body,Number(data.requireReceipt===true),Date.now()]);
}

async function schoolAnnouncementRead(db,account,data) {
  schoolRequire(schoolId(data.id),'Annonce invalide.');
  const scope=schoolAnnouncementScope(account);
  const result=await schoolRun(db,`INSERT OR IGNORE INTO school_announcement_reads(announcement_id,account_id,read_at)
    SELECT n.id,?,? FROM school_announcements n WHERE n.id=? AND n.require_receipt=1 AND n.author_id<>?
    AND ${scope.where}`,[account.id,Date.now(),data.id,account.id,...scope.args]);
  if(!schoolChanged(result)) {
    const recorded=await schoolFirst(db,`SELECT n.id FROM school_announcements n JOIN school_announcement_reads r
      ON r.announcement_id=n.id AND r.account_id=? WHERE n.id=? AND ${scope.where}`,[account.id,data.id,...scope.args]);
    if(!recorded) throw new SchoolError(404,'Cette annonce est introuvable.');
  }
}

async function schoolNotices(db,account) {
  const scope=schoolAnnouncementScope(account);
  return schoolFirst(db,`SELECT
    (SELECT COUNT(*) FROM school_messages m WHERE m.recipient_id=? AND m.read_at IS NULL) AS messages,
    (SELECT COUNT(*) FROM school_announcements n WHERE n.require_receipt=1 AND n.author_id<>?
      AND ${scope.where} AND NOT EXISTS (SELECT 1 FROM school_announcement_reads r
      WHERE r.account_id=? AND r.announcement_id=n.id)) AS announcements,
    (SELECT COUNT(*) FROM school_fatigue_requests f JOIN school_guardians g ON g.student_id=f.student_id
      JOIN school_accounts a ON a.id=f.student_id AND a.active=1
      WHERE g.parent_id=? AND f.status='pending' AND f.requested_at>${SCHOOL_CLOCK}-?) AS fatigue`,
  [account.id,account.id,...scope.args,account.id,account.id,SCHOOL_FATIGUE_REPLY_WINDOW]);
}
