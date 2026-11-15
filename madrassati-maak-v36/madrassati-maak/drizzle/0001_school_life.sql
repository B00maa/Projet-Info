CREATE TABLE school_student_access (
  student_id TEXT PRIMARY KEY NOT NULL REFERENCES school_accounts(id),
  login TEXT NOT NULL COLLATE NOCASE UNIQUE,
  code_digest TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE school_student_sessions (
  token_digest TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL REFERENCES school_student_access(student_id),
  access_revision INTEGER NOT NULL,
  account_revision INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX school_student_sessions_expiry ON school_student_sessions(expires_at);
--> statement-breakpoint
CREATE INDEX school_student_sessions_student ON school_student_sessions(student_id);
--> statement-breakpoint
CREATE TABLE school_login_limits (
  client_key TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  failures INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX school_login_limits_expiry ON school_login_limits(expires_at);
--> statement-breakpoint
CREATE TABLE school_assessments (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL REFERENCES school_classes(id),
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('test','exam','oral','other')),
  instruction TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX school_assessments_class ON school_assessments(class_id,date);
--> statement-breakpoint
CREATE INDEX school_assessments_teacher ON school_assessments(teacher_id,date);
--> statement-breakpoint
ALTER TABLE school_evaluations ADD COLUMN assessment_id TEXT REFERENCES school_assessments(id);
--> statement-breakpoint
CREATE UNIQUE INDEX school_evaluations_assessment ON school_evaluations(assessment_id) WHERE assessment_id IS NOT NULL;
--> statement-breakpoint
CREATE TABLE school_attendance (
  session_id TEXT NOT NULL REFERENCES school_sessions(id),
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  status TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  marked_at INTEGER NOT NULL,
  marked_by TEXT NOT NULL REFERENCES school_accounts(id),
  justification TEXT NOT NULL DEFAULT '',
  justification_status TEXT CHECK (justification_status IN ('pending','accepted','declined')),
  justified_at INTEGER,
  justified_by TEXT REFERENCES school_accounts(id),
  reviewed_at INTEGER,
  reviewed_by TEXT REFERENCES school_accounts(id),
  file_key TEXT,
  file_name TEXT,
  file_size INTEGER,
  revision INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (session_id,student_id)
);
--> statement-breakpoint
CREATE INDEX school_attendance_student ON school_attendance(student_id,status);
--> statement-breakpoint
CREATE INDEX school_attendance_pending ON school_attendance(justification_status,justified_at);
--> statement-breakpoint
CREATE TABLE school_fatigue_requests (
  id TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  requested_at INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (60,120,240)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined','cancelled')),
  decided_at INTEGER,
  decided_by TEXT REFERENCES school_accounts(id),
  starts_at INTEGER,
  expires_at INTEGER,
  stopped_at INTEGER,
  stopped_by TEXT REFERENCES school_accounts(id)
);
--> statement-breakpoint
CREATE INDEX school_fatigue_student ON school_fatigue_requests(student_id,requested_at);
--> statement-breakpoint
CREATE INDEX school_fatigue_active ON school_fatigue_requests(status,expires_at) WHERE stopped_at IS NULL;
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN short_exercise TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE school_submissions (
  session_id TEXT NOT NULL REFERENCES school_sessions(id),
  student_id TEXT NOT NULL REFERENCES school_accounts(id),
  answer TEXT NOT NULL DEFAULT '',
  variant TEXT NOT NULL DEFAULT 'full' CHECK (variant IN ('full','short')),
  submitted_at INTEGER NOT NULL,
  file_key TEXT,
  file_name TEXT,
  file_size INTEGER,
  feedback TEXT NOT NULL DEFAULT '',
  corrected_at INTEGER,
  revision INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (session_id,student_id)
);
--> statement-breakpoint
CREATE INDEX school_submissions_student ON school_submissions(student_id,submitted_at);
--> statement-breakpoint
CREATE TABLE school_resources (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL REFERENCES school_classes(id),
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  link TEXT,
  file_key TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX school_resources_class ON school_resources(class_id,created_at);
--> statement-breakpoint
CREATE INDEX school_resources_teacher ON school_resources(teacher_id,created_at);
--> statement-breakpoint
CREATE TABLE school_messages (
  id TEXT PRIMARY KEY NOT NULL,
  sender_id TEXT NOT NULL REFERENCES school_accounts(id),
  recipient_id TEXT NOT NULL REFERENCES school_accounts(id),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
--> statement-breakpoint
CREATE INDEX school_messages_sender ON school_messages(sender_id,created_at);
--> statement-breakpoint
CREATE INDEX school_messages_recipient ON school_messages(recipient_id,read_at,created_at);
--> statement-breakpoint
CREATE TABLE school_announcements (
  id TEXT PRIMARY KEY NOT NULL,
  author_id TEXT NOT NULL REFERENCES school_accounts(id),
  class_id TEXT REFERENCES school_classes(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  require_receipt INTEGER NOT NULL CHECK (require_receipt IN (0,1)),
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX school_announcements_class ON school_announcements(class_id,created_at);
--> statement-breakpoint
CREATE TABLE school_announcement_reads (
  announcement_id TEXT NOT NULL REFERENCES school_announcements(id),
  account_id TEXT NOT NULL REFERENCES school_accounts(id),
  read_at INTEGER NOT NULL,
  PRIMARY KEY (announcement_id,account_id)
);
