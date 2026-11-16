ALTER TABLE school_sessions ADD COLUMN series_id TEXT;
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN series_index INTEGER;
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN schedule_changed_at INTEGER;
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN schedule_revision INTEGER;
--> statement-breakpoint
CREATE UNIQUE INDEX school_sessions_series_order ON school_sessions(series_id,series_index) WHERE series_id IS NOT NULL;
--> statement-breakpoint
CREATE INDEX school_sessions_schedule_changes ON school_sessions(schedule_changed_at) WHERE schedule_changed_at IS NOT NULL;
--> statement-breakpoint
CREATE TRIGGER school_record_schedule_change AFTER UPDATE OF date,start_minute,duration ON school_sessions
WHEN OLD.date<>NEW.date OR OLD.start_minute<>NEW.start_minute OR OLD.duration<>NEW.duration
BEGIN
  UPDATE school_sessions SET schedule_changed_at=NEW.updated_at,schedule_revision=NEW.revision WHERE id=NEW.id;
END;
--> statement-breakpoint
CREATE TABLE school_notification_reads (
  account_id TEXT NOT NULL REFERENCES school_accounts(id),
  event_key TEXT NOT NULL,
  read_at INTEGER NOT NULL,
  PRIMARY KEY (account_id,event_key)
);
--> statement-breakpoint
CREATE TABLE school_session_quizzes (
  session_id TEXT PRIMARY KEY NOT NULL REFERENCES school_sessions(id),
  questions TEXT NOT NULL CHECK (json_valid(questions)),
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE school_quiz_attempts (
  session_id TEXT NOT NULL REFERENCES school_session_quizzes(session_id),
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  quiz_revision INTEGER NOT NULL,
  answers TEXT NOT NULL CHECK (json_valid(answers)),
  submitted_at INTEGER NOT NULL,
  PRIMARY KEY (session_id,student_id,quiz_revision)
);
