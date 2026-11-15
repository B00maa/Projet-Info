ALTER TABLE school_teacher_course_drafts RENAME TO school_teacher_course_drafts_previous;
--> statement-breakpoint
CREATE TABLE school_teacher_course_drafts (
  id TEXT PRIMARY KEY NOT NULL,
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  name TEXT NOT NULL,
  context TEXT NOT NULL CHECK (json_valid(context)),
  chapters TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(chapters)),
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
INSERT INTO school_teacher_course_drafts(id,teacher_id,name,context,chapters,revision,updated_at)
  SELECT teacher_id,teacher_id,COALESCE(json_extract(context,'$.topic'),'Cours'),context,chapters,revision,0
  FROM school_teacher_course_drafts_previous;
--> statement-breakpoint
DROP TABLE school_teacher_course_drafts_previous;
--> statement-breakpoint
CREATE INDEX school_teacher_course_drafts_owner ON school_teacher_course_drafts(teacher_id,updated_at DESC,id);
