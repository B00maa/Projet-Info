const SCHOOL_SERIES_LIMIT = 52;

const SCHOOL_SERIES_CTE = `planned AS MATERIALIZED (
  SELECT json_extract(value,'$.id') AS id,json_extract(value,'$.revision') AS revision,
    json_extract(value,'$.class_id') AS class_id,json_extract(value,'$.teacher_id') AS teacher_id,
    json_extract(value,'$.subject') AS subject,json_extract(value,'$.date') AS date,
    json_extract(value,'$.start') AS start,json_extract(value,'$.duration') AS duration,
    json_extract(value,'$.due') AS due,json_extract(value,'$.position') AS position
  FROM json_each(?)
)`;

const SCHOOL_SERIES_CONFLICTS = `
  SELECT p.id FROM planned p JOIN school_sessions s ON s.date=p.date
    AND (s.class_id=p.class_id OR s.teacher_id=p.teacher_id)
    AND s.start_minute<p.start+p.duration AND s.start_minute+s.duration>p.start
    WHERE NOT EXISTS (SELECT 1 FROM planned x WHERE x.id=s.id)
  UNION
  SELECT p.id FROM planned p JOIN planned q ON q.id<>p.id AND q.date=p.date
    AND (q.class_id=p.class_id OR q.teacher_id=p.teacher_id)
    AND q.start<p.start+p.duration AND q.start+q.duration>p.start
  UNION
  SELECT p.id FROM planned p WHERE NOT EXISTS (
    SELECT 1 FROM school_teaching t JOIN school_accounts a ON a.id=t.teacher_id AND a.active=1
    WHERE t.teacher_id=p.teacher_id AND t.class_id=p.class_id AND t.subject=p.subject
  )`;

const schoolShiftDate = (date,days) => schoolDay(Date.parse(date+'T00:00:00Z')+days*SCHOOL_DAY);

async function schoolSeriesPlan(db,account,values,existing,teaching) {
  schoolRoles(account,'administration');
  const {date,due,repeatUntil,following}=values;
  const start=Number(values.start);
  const duration=schoolSessionDuration(values.duration);
  schoolRequire(schoolDate(date)&&values.start!=null&&values.start!==''&&Number.isInteger(start)&&start>=0&&start+duration<=1440&&
    (!due||schoolDate(due)),'Vérifie les dates et les horaires de la série.');
  const now=Date.now();
  schoolRequire(schoolSessionInstant(date,start)>=now,'Programme les séances récurrentes à une date à venir.');
  const selected={class_id:teaching.class_id,teacher_id:teaching.teacher_id,subject:teaching.subject,date,start,duration,due};
  if (!existing) {
    schoolRequire(!following&&schoolDate(repeatUntil)&&repeatUntil>=date,'Choisis la date de fin de la série.');
    const size=1+Math.floor((Date.parse(repeatUntil)-Date.parse(date))/(7*SCHOOL_DAY));
    schoolRequire(size>=2&&size<=SCHOOL_SERIES_LIMIT,'Choisis une série de 2 à 52 séances hebdomadaires.');
    const rows=Array.from({length:size},(_,position)=>({
      ...selected,id:crypto.randomUUID(),position,date:schoolShiftDate(date,7*position),
      due:due?schoolShiftDate(due,7*position):null
    }));
    schoolRequire(rows.every(row=>schoolDate(row.date)&&(!row.due||schoolDate(row.due))),'Vérifie les dates et les horaires de la série.');
    return {rows,seriesId:rows[0].id};
  }
  schoolRequire(following&&!repeatUntil&&existing.series_id&&schoolSessionInstant(existing.date,existing.start_minute)>=now,
    'Choisis une séance à venir de cette série.');
  const remaining=await schoolAll(db,`SELECT id,revision,class_id,teacher_id,subject,date,start_minute,duration,due_date
    FROM school_sessions WHERE series_id=? AND series_index>? AND date>=? ORDER BY series_index`,
  [existing.series_id,existing.series_index,schoolToday()]);
  const days=(Date.parse(date)-Date.parse(existing.date))/SCHOOL_DAY;
  const rows=[{...selected,id:existing.id,revision:existing.revision}];
  for(const row of remaining) {
    if(schoolSessionInstant(row.date,row.start_minute)<now)continue;
    rows.push({...row,date:schoolShiftDate(row.date,days),start,duration,due:row.due_date?schoolShiftDate(row.due_date,days):null});
  }
  schoolRequire(rows.every(row=>schoolDate(row.date)&&(!row.due||schoolDate(row.due))&&schoolSessionInstant(row.date,row.start)>=now),
    'Vérifie les dates et les horaires de la série.');
  return {rows,seriesId:existing.series_id};
}

async function schoolSeriesPreview(db,account,data) {
  schoolRoles(account,'administration');
  schoolRequire(!data.id||schoolId(data.id),'Séance invalide.');
  const existing=data.id?await schoolFirst(db,'SELECT * FROM school_sessions WHERE id=?',[data.id]):null;
  if(data.id&&(!existing||existing.revision!==data.revision)) {
    throw new SchoolError(409,'La séance a changé. Rouvre-la avant de la modifier.');
  }
  const teaching=await schoolTeaching(db,account,data.teacher,data.class);
  const {rows}=await schoolSeriesPlan(db,account,data,existing,teaching);
  const busy=await schoolAll(db,`WITH ${SCHOOL_SERIES_CTE} ${SCHOOL_SERIES_CONFLICTS}`,[JSON.stringify(rows)]);
  const conflicts=new Set(busy.map(row=>row.id));
  return {sessions:rows.map(row=>({date:row.date,start:row.start,duration:row.duration,conflict:conflicts.has(row.id)}))};
}

async function schoolSeriesSave(db,plan,existing,content,{movesClass,dropsHomework}) {
  const {rows,seriesId}=plan;
  const body=JSON.stringify(content);
  const changedAt=Date.now();
  const conflictFree=`NOT EXISTS (${SCHOOL_SERIES_CONFLICTS})`;
  const columns=['title','description','exercise','short_exercise','meeting_url','video_url','file_key','file_name','file_type','file_size'];
  const selected=column=>`json_extract(body,'$.${column}')`;
  let saved;
  if(!existing) {
    saved=await schoolAll(db,`WITH ${SCHOOL_SERIES_CTE}, content AS (SELECT json(?) AS body)
      INSERT INTO school_sessions(id,class_id,teacher_id,subject,date,start_minute,duration,due_date,
        series_id,series_index,updated_at,${columns.join(',')})
      SELECT p.id,p.class_id,p.teacher_id,p.subject,p.date,p.start,p.duration,p.due,?,p.position,?,${columns.map(selected).join(',')}
      FROM planned p CROSS JOIN content WHERE ${conflictFree} RETURNING id`,[JSON.stringify(rows),body,seriesId,changedAt]);
  } else {
    const setContent=columns.map(column=>`${column}=CASE WHEN p.id=target.id THEN ${selected(column)} ELSE s.${column} END`).join(',');
    saved=await schoolAll(db,`WITH ${SCHOOL_SERIES_CTE}, target AS (SELECT ? AS id,json(?) AS body),
      ready AS MATERIALIZED (SELECT ${conflictFree}
        AND NOT EXISTS (SELECT 1 FROM planned p LEFT JOIN school_sessions live ON live.id=p.id
          WHERE live.id IS NULL OR live.revision<>p.revision OR live.series_id IS NOT ?)
        AND (?=0 OR NOT EXISTS (SELECT 1 FROM school_attendance WHERE session_id=(SELECT id FROM target)))
        AND (?=0 OR NOT EXISTS (SELECT 1 FROM school_submissions WHERE session_id=(SELECT id FROM target))) AS ok)
      UPDATE school_sessions AS s SET class_id=p.class_id,teacher_id=p.teacher_id,subject=p.subject,
        date=p.date,start_minute=p.start,duration=p.duration,due_date=p.due,${setContent},
        updated_at=?,revision=s.revision+1
      FROM planned p CROSS JOIN target CROSS JOIN ready WHERE s.id=p.id AND ready.ok RETURNING id`,
    [JSON.stringify(rows),existing.id,body,seriesId,Number(movesClass),Number(movesClass||dropsHomework),changedAt]);
  }
  if(saved.length!==rows.length)throw new SchoolError(409,'Un créneau ou une séance de la série a changé. Vérifie la série.');
  return rows[0].id;
}
