-- MySQL 8.4. The historical class identifiers are the identifiers of the school levels.

CREATE TABLE IF NOT EXISTS `school_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `role` VARCHAR(24) NOT NULL,
  `user_id` VARCHAR(36),
  `active` BIGINT NOT NULL DEFAULT 1,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `archived_at` BIGINT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_id` (`user_id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_classes` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  grade_label VARCHAR(80) NOT NULL DEFAULT '',
  stream VARCHAR(80) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_enrolments` (
  `student_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`student_id`),
  KEY `school_enrolments_class` (`class_id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_teaching` (
  `teacher_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`teacher_id`, `class_id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_guardians` (
  `parent_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`parent_id`, `student_id`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `start_minute` BIGINT NOT NULL,
  `duration` BIGINT NOT NULL,
  `description` TEXT NOT NULL DEFAULT (''),
  `exercise` TEXT NOT NULL DEFAULT (''),
  `due_date` VARCHAR(10),
  `meeting_url` TEXT,
  `video_url` TEXT,
  `file_key` VARCHAR(240),
  `file_name` VARCHAR(200),
  `file_type` VARCHAR(80),
  `file_size` BIGINT,
  `updated_at` BIGINT NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `short_exercise` TEXT NOT NULL DEFAULT (''),
  `series_id` VARCHAR(36),
  `series_index` BIGINT,
  `schedule_changed_at` BIGINT,
  `schedule_revision` BIGINT,
  `cancelled_at` BIGINT,
  `cancel_reason` TEXT NOT NULL DEFAULT (''),
  `schedule_event` VARCHAR(20) NOT NULL DEFAULT 'planning',
  PRIMARY KEY (`id`),
  KEY `school_sessions_schedule_changes` (`schedule_changed_at`),
  UNIQUE KEY `school_sessions_series_order` (`series_id`, `series_index`),
  KEY `school_sessions_due` (`class_id`, `due_date`),
  KEY `school_sessions_teacher_date` (`teacher_id`, `date`),
  KEY `school_sessions_class_date` (`class_id`, `date`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_catchup` (
  `student_id` VARCHAR(36) NOT NULL,
  `session_id` VARCHAR(36) NOT NULL,
  `step` BIGINT NOT NULL,
  PRIMARY KEY (`student_id`, `session_id`),
  FOREIGN KEY (`session_id`) REFERENCES `school_sessions` (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_periods` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `opens_at` BIGINT NOT NULL,
  `closes_at` BIGINT NOT NULL,
  `closed_at` BIGINT,
  `publish_at` BIGINT,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_student_access` (
  `student_id` VARCHAR(36) NOT NULL,
  `login` VARCHAR(40) NOT NULL,
  `code_digest` VARCHAR(255) NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `first_login_at` BIGINT,
  `onboarding_required` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `unique_login` (`login`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_student_sessions` (
  `token_digest` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `access_revision` BIGINT NOT NULL,
  `account_revision` BIGINT NOT NULL,
  `expires_at` BIGINT NOT NULL,
  PRIMARY KEY (`token_digest`),
  KEY `school_student_sessions_student` (`student_id`),
  KEY `school_student_sessions_expiry` (`expires_at`),
  FOREIGN KEY (`student_id`) REFERENCES `school_student_access` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_login_limits` (
  `client_key` VARCHAR(64) NOT NULL,
  `expires_at` BIGINT NOT NULL,
  `failures` BIGINT NOT NULL,
  PRIMARY KEY (`client_key`),
  KEY `school_login_limits_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_assessments` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `kind` VARCHAR(20) NOT NULL,
  `instruction` TEXT NOT NULL DEFAULT (''),
  `revision` BIGINT NOT NULL DEFAULT 1,
  opens_at BIGINT NULL,
  closes_at BIGINT NULL,
  duration_minutes INT NULL,
  rubric TEXT NOT NULL DEFAULT (''),
  PRIMARY KEY (`id`),
  KEY `school_assessments_teacher` (`teacher_id`, `date`),
  KEY `school_assessments_class` (`class_id`, `date`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_attendance` (
  `session_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(24) NOT NULL,
  `marked_at` BIGINT NOT NULL,
  `marked_by` VARCHAR(36) NOT NULL,
  `justification` TEXT NOT NULL DEFAULT (''),
  `justification_status` VARCHAR(24),
  `justified_at` BIGINT,
  `justified_by` VARCHAR(36),
  `reviewed_at` BIGINT,
  `reviewed_by` VARCHAR(36),
  `file_key` VARCHAR(240),
  `file_name` VARCHAR(200),
  `file_size` BIGINT,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`session_id`, `student_id`),
  KEY `school_attendance_pending` (`justification_status`, `justified_at`),
  KEY `school_attendance_student` (`student_id`, `status`),
  FOREIGN KEY (`reviewed_by`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`justified_by`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`marked_by`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`session_id`) REFERENCES `school_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_fatigue_requests` (
  `id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `requested_at` BIGINT NOT NULL,
  `duration_minutes` BIGINT NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'pending',
  `decided_at` BIGINT,
  `decided_by` VARCHAR(36),
  `starts_at` BIGINT,
  `expires_at` BIGINT,
  `stopped_at` BIGINT,
  `stopped_by` VARCHAR(36),
  PRIMARY KEY (`id`),
  KEY `school_fatigue_active` (`status`, `expires_at`),
  KEY `school_fatigue_student` (`student_id`, `requested_at`),
  FOREIGN KEY (`stopped_by`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`decided_by`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_submissions` (
  `session_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `answer` TEXT NOT NULL DEFAULT (''),
  `variant` VARCHAR(12) NOT NULL DEFAULT 'full',
  `submitted_at` BIGINT NOT NULL,
  `file_key` VARCHAR(240),
  `file_name` VARCHAR(200),
  `file_size` BIGINT,
  `feedback` TEXT NOT NULL DEFAULT (''),
  `corrected_at` BIGINT,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`session_id`, `student_id`),
  KEY `school_submissions_student` (`student_id`, `submitted_at`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`session_id`) REFERENCES `school_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_resources` (
  `id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `description` TEXT NOT NULL DEFAULT (''),
  `link` TEXT,
  `file_key` VARCHAR(240),
  `file_name` VARCHAR(200),
  `file_type` VARCHAR(80),
  `file_size` BIGINT,
  `created_at` BIGINT NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `school_resources_teacher` (`teacher_id`, `created_at`),
  KEY `school_resources_class` (`class_id`, `created_at`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_messages` (
  `id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` BIGINT NOT NULL,
  `read_at` BIGINT,
  PRIMARY KEY (`id`),
  KEY `school_messages_recipient` (`recipient_id`, `read_at`, `created_at`),
  KEY `school_messages_sender` (`sender_id`, `created_at`),
  FOREIGN KEY (`recipient_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`sender_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_announcements` (
  `id` VARCHAR(36) NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `class_id` VARCHAR(36),
  `title` VARCHAR(120) NOT NULL,
  `body` TEXT NOT NULL,
  `require_receipt` BIGINT NOT NULL,
  `created_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `school_announcements_class` (`class_id`, `created_at`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_announcement_reads` (
  `announcement_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `read_at` BIGINT NOT NULL,
  PRIMARY KEY (`announcement_id`, `account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`announcement_id`) REFERENCES `school_announcements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_account_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `actor_id` VARCHAR(36) NOT NULL,
  `member_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(40) NOT NULL,
  `occurred_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`member_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`actor_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_grade_drafts` (
  `teacher_id` VARCHAR(36) NOT NULL,
  `period_id` BIGINT NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `base_revision` BIGINT NOT NULL,
  `assessment_revision` BIGINT NOT NULL,
  `scores` JSON NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`teacher_id`, `period_id`, `item_id`),
  FOREIGN KEY (`period_id`) REFERENCES `school_periods` (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_teacher_course_drafts` (
  `id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `context` JSON NOT NULL,
  `chapters` JSON NOT NULL DEFAULT ('[]'),
  `revision` BIGINT NOT NULL DEFAULT 1,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `school_teacher_course_drafts_owner` (`teacher_id`, `updated_at`, `id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_notification_reads` (
  `account_id` VARCHAR(36) NOT NULL,
  `event_key` VARCHAR(160) NOT NULL,
  `read_at` BIGINT NOT NULL,
  PRIMARY KEY (`account_id`, `event_key`),
  FOREIGN KEY (`account_id`) REFERENCES `school_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_session_quizzes` (
  `session_id` VARCHAR(36) NOT NULL,
  `questions` JSON NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`session_id`),
  FOREIGN KEY (`session_id`) REFERENCES `school_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_quiz_attempts` (
  `session_id` VARCHAR(36) NOT NULL,
  `student_id` VARCHAR(36) NOT NULL,
  `quiz_revision` BIGINT NOT NULL,
  `answers` JSON NOT NULL,
  `submitted_at` BIGINT NOT NULL,
  PRIMARY KEY (`session_id`, `student_id`, `quiz_revision`),
  FOREIGN KEY (`student_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`session_id`) REFERENCES `school_session_quizzes` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `school_evaluations` (
  `id` VARCHAR(36) NOT NULL,
  `period_id` BIGINT NOT NULL,
  `class_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `scores` JSON NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `assessment_id` VARCHAR(36),
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_evaluations_assessment` (`assessment_id`),
  KEY `school_evaluations_teacher` (`teacher_id`, `class_id`),
  KEY `school_evaluations_period` (`period_id`),
  FOREIGN KEY (`assessment_id`) REFERENCES `school_assessments` (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `school_accounts` (`id`),
  FOREIGN KEY (`class_id`) REFERENCES `school_classes` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `school_periods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
