CREATE TABLE school_accounts (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administration','professeur','eleve','parent')),
  user_id TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE school_classes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE
);
--> statement-breakpoint
CREATE TABLE school_enrolments (
  student_id TEXT PRIMARY KEY NOT NULL REFERENCES school_accounts(id),
  class_id TEXT NOT NULL REFERENCES school_classes(id)
);
--> statement-breakpoint
CREATE INDEX school_enrolments_class ON school_enrolments(class_id);
--> statement-breakpoint
CREATE TABLE school_teaching (
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  class_id TEXT NOT NULL REFERENCES school_classes(id),
  subject TEXT NOT NULL,
  PRIMARY KEY (teacher_id,class_id)
);
--> statement-breakpoint
CREATE TABLE school_guardians (
  parent_id TEXT NOT NULL REFERENCES school_accounts(id),
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  PRIMARY KEY (parent_id,student_id)
);
--> statement-breakpoint
CREATE TABLE school_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL REFERENCES school_classes(id),
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_minute INTEGER NOT NULL CHECK (start_minute >= 0),
  duration INTEGER NOT NULL CHECK (duration BETWEEN 1 AND 1440 AND start_minute + duration <= 1440),
  description TEXT NOT NULL DEFAULT '',
  exercise TEXT NOT NULL DEFAULT '',
  due_date TEXT,
  meeting_url TEXT,
  video_url TEXT,
  file_key TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  updated_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX school_sessions_class_date ON school_sessions(class_id,date);
--> statement-breakpoint
CREATE INDEX school_sessions_teacher_date ON school_sessions(teacher_id,date);
--> statement-breakpoint
CREATE INDEX school_sessions_due ON school_sessions(class_id,due_date);
--> statement-breakpoint
CREATE TABLE school_catchup (
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  session_id TEXT NOT NULL REFERENCES school_sessions(id),
  step INTEGER NOT NULL CHECK (step BETWEEN 0 AND 3),
  PRIMARY KEY (student_id,session_id)
);
--> statement-breakpoint
CREATE TABLE school_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  opens_at INTEGER NOT NULL,
  closes_at INTEGER NOT NULL CHECK (closes_at > opens_at),
  closed_at INTEGER,
  publish_at INTEGER,
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE school_evaluations (
  id TEXT PRIMARY KEY NOT NULL,
  period_id INTEGER NOT NULL REFERENCES school_periods(id),
  class_id TEXT NOT NULL REFERENCES school_classes(id),
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  scores TEXT NOT NULL CHECK (json_valid(scores)),
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX school_evaluations_period ON school_evaluations(period_id);
--> statement-breakpoint
CREATE INDEX school_evaluations_teacher ON school_evaluations(teacher_id,class_id);
