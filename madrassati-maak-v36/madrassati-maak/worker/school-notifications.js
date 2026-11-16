const SCHOOL_NOTIFICATION_DAYS=60;

const SCHOOL_NOTIFICATION_EVENTS=`children AS (
  SELECT json_extract(value,'$.id') AS id,json_extract(value,'$.name') AS name FROM json_each(?)
), settings AS (SELECT ? AS account,? AS role,? AS since,? AS now),
events AS (
  SELECT 'planning/'||s.id||'/'||s.schedule_revision AS event_key,s.schedule_event AS kind,
    s.id AS target,s.title,s.schedule_changed_at AS event_at,s.date,s.start_minute,NULL AS child_id,NULL AS child_name
  FROM school_sessions s CROSS JOIN settings k
  WHERE s.schedule_changed_at>=k.since AND (k.role='administration' OR (k.role='professeur' AND s.teacher_id=k.account AND EXISTS (
    SELECT 1 FROM school_teaching t WHERE t.teacher_id=s.teacher_id AND t.class_id=s.class_id)))
  UNION ALL
  SELECT 'planning/'||s.id||'/'||s.schedule_revision||'/'||c.id,s.schedule_event,s.id,s.title,s.schedule_changed_at,s.date,s.start_minute,c.id,c.name
  FROM children c JOIN school_enrolments e ON e.student_id=c.id JOIN school_sessions s ON s.class_id=e.class_id
  CROSS JOIN settings k WHERE s.schedule_changed_at>=k.since
  UNION ALL
  SELECT 'devoir/'||s.id||'/'||p.revision||'/'||c.id,'devoir',s.id,s.title,p.corrected_at,s.due_date,NULL,c.id,c.name
  FROM children c JOIN school_submissions p ON p.student_id=c.id JOIN school_sessions s ON s.id=p.session_id
  JOIN school_enrolments e ON e.student_id=c.id AND e.class_id=s.class_id
  CROSS JOIN settings k WHERE p.corrected_at>=k.since
  UNION ALL
  SELECT 'note/'||e.id||'/'||p.publish_at||'/'||c.id,'note',e.id,e.title,p.publish_at,e.date,NULL,c.id,c.name
  FROM settings k JOIN school_periods p ON p.publish_at BETWEEN k.since AND k.now JOIN school_evaluations e ON e.period_id=p.id
  JOIN json_each(e.scores) g JOIN children c ON c.id=g.key
), inbox AS (
  SELECT e.*,r.read_at FROM events e CROSS JOIN settings k
  LEFT JOIN school_notification_reads r ON r.account_id=k.account AND r.event_key=e.event_key
)`;

function schoolNotificationArgs(account,children) {
  const now=Date.now();
  return [JSON.stringify(children),account.id,account.role,now-SCHOOL_NOTIFICATION_DAYS*SCHOOL_DAY,now];
}

function schoolNotifications(db,account,children) {
  return schoolAll(db,`WITH ${SCHOOL_NOTIFICATION_EVENTS}
    SELECT * FROM inbox ORDER BY event_at DESC,event_key LIMIT 80`,schoolNotificationArgs(account,children));
}

async function schoolUnreadNotifications(db,account,children) {
  const row=await schoolFirst(db,`WITH ${SCHOOL_NOTIFICATION_EVENTS}
    SELECT COUNT(*) AS total FROM (SELECT read_at FROM inbox ORDER BY event_at DESC,event_key LIMIT 80) WHERE read_at IS NULL`,
  schoolNotificationArgs(account,children));
  return row.total;
}

async function schoolReadNotification(db,account,data) {
  const key=schoolText(data.key,160);
  schoolRequire(key,'Notification invalide.');
  const children=await schoolChildren(db,account);
  const event=await schoolFirst(db,`WITH ${SCHOOL_NOTIFICATION_EVENTS} SELECT * FROM inbox WHERE event_key=?`,
    [...schoolNotificationArgs(account,children),key]);
  if(!event)throw new SchoolError(404,'Cette notification est introuvable.');
  await schoolRun(db,`INSERT OR IGNORE INTO school_notification_reads(account_id,event_key,read_at) VALUES(?,?,?)`,[account.id,key,Date.now()]);
  return {event};
}
