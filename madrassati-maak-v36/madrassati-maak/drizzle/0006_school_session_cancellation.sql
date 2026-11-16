ALTER TABLE school_sessions ADD COLUMN cancelled_at INTEGER;
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE school_sessions ADD COLUMN schedule_event TEXT NOT NULL DEFAULT 'planning'
  CHECK (schedule_event IN ('planning','annulation','retablissement'));
--> statement-breakpoint
DROP TRIGGER school_record_schedule_change;
--> statement-breakpoint
CREATE TRIGGER school_record_schedule_change AFTER UPDATE OF date,start_minute,duration,cancelled_at ON school_sessions
WHEN OLD.date<>NEW.date OR OLD.start_minute<>NEW.start_minute OR OLD.duration<>NEW.duration
  OR OLD.cancelled_at IS NOT NEW.cancelled_at
BEGIN
  UPDATE school_sessions SET schedule_changed_at=NEW.updated_at,schedule_revision=NEW.revision,
    schedule_event=CASE WHEN NEW.cancelled_at IS NOT NULL THEN 'annulation'
      WHEN OLD.cancelled_at IS NOT NULL THEN 'retablissement' ELSE 'planning' END
    WHERE id=NEW.id;
END;
