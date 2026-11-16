const SCHOOL_NOTIFICATION_DAYS=60;

const SCHOOL_NOTIFICATION_EVENTS=`children AS (
  SELECT j.id,j.name FROM JSON_TABLE(?, '$[*]' COLUMNS (id VARCHAR(36) PATH '$.id',name VARCHAR(100) PATH '$.name')) j
), settings AS (SELECT CAST(? AS CHAR(36)) AS account,CAST(? AS SIGNED) AS since,CAST(? AS SIGNED) AS now),
events AS (
  SELECT CONCAT('devoir/',s.id,'/',p.revision,'/',c.id) AS event_key,'devoir' AS kind,s.id AS target,
    s.title,p.corrected_at AS event_at,s.due_date AS date,c.id AS child_id,c.name AS child_name
  FROM children c JOIN school_submissions p ON p.student_id=c.id JOIN school_sessions s ON s.id=p.session_id
  JOIN school_enrolments e ON e.student_id=c.id AND e.class_id=s.class_id
  CROSS JOIN settings k WHERE p.corrected_at>=k.since
  UNION ALL
  SELECT CONCAT('note/',e.id,'/',p.publish_at,'/',c.id),'note',e.id,e.title,p.publish_at,e.date,c.id,c.name
  FROM settings k JOIN school_periods p ON p.publish_at BETWEEN k.since AND k.now
  JOIN school_evaluations e ON e.period_id=p.id
  JOIN children c ON JSON_CONTAINS_PATH(e.scores, 'one', CONCAT('$."',c.id,'"'))
), inbox AS (
  SELECT e.*,r.read_at FROM events e CROSS JOIN settings k
  LEFT JOIN school_notification_reads r ON r.account_id=k.account AND r.event_key=e.event_key
)`;

function schoolNotificationArgs(account,children) {
  const now=Date.now();
  return [JSON.stringify(children),account.id,now-SCHOOL_NOTIFICATION_DAYS*SCHOOL_DAY,now];
}

function schoolNotifications(db,account,children) {
  return schoolAll(db,`WITH ${SCHOOL_NOTIFICATION_EVENTS}
    SELECT * FROM inbox ORDER BY event_at DESC,event_key LIMIT 80`,schoolNotificationArgs(account,children));
}

async function schoolUnreadNotifications(db,account,children) {
  const row=await schoolFirst(db,`WITH ${SCHOOL_NOTIFICATION_EVENTS}
    SELECT COUNT(*) AS total FROM (SELECT read_at FROM inbox ORDER BY event_at DESC,event_key LIMIT 80) latest WHERE read_at IS NULL`,
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
  await schoolRun(db,`INSERT IGNORE INTO school_notification_reads(account_id,event_key,read_at) VALUES(?,?,?)`,[account.id,key,Date.now()]);
  return {event};
}
