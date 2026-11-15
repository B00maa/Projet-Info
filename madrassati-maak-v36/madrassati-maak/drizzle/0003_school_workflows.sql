ALTER TABLE school_student_access ADD COLUMN first_login_at INTEGER;
--> statement-breakpoint
ALTER TABLE school_student_access ADD COLUMN onboarding_required INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_required IN (0,1));
--> statement-breakpoint
CREATE TABLE school_account_history (
  id INTEGER PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES school_accounts(id),
  member_id TEXT NOT NULL REFERENCES school_accounts(id),
  action TEXT NOT NULL CHECK (action IN ('class-changed','parent-linked','access-reset')),
  occurred_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE school_grade_drafts (
  teacher_id TEXT NOT NULL REFERENCES school_accounts(id),
  period_id INTEGER NOT NULL REFERENCES school_periods(id),
  item_id TEXT NOT NULL,
  base_revision INTEGER NOT NULL,
  assessment_revision INTEGER NOT NULL,
  scores TEXT NOT NULL CHECK (json_valid(scores)),
  revision INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (teacher_id,period_id,item_id)
);
--> statement-breakpoint
CREATE TABLE school_teacher_course_drafts (
  teacher_id TEXT PRIMARY KEY NOT NULL REFERENCES school_accounts(id),
  context TEXT NOT NULL CHECK (json_valid(context)),
  chapters TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(chapters)),
  revision INTEGER NOT NULL DEFAULT 1
);
