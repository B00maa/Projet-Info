CREATE TABLE IF NOT EXISTS school_uploads (
  file_key VARCHAR(240) NOT NULL PRIMARY KEY,
  body LONGBLOB NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS school_lesson_progress (
  student_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36) NOT NULL,
  stage ENUM('cours','quiz','devoir') NOT NULL,
  updated_at BIGINT NOT NULL,
  completed_at BIGINT NULL,
  PRIMARY KEY (student_id,session_id),
  FOREIGN KEY (student_id) REFERENCES school_accounts(id),
  FOREIGN KEY (session_id) REFERENCES school_sessions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS school_assessment_extensions (
  assessment_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  closes_at BIGINT NOT NULL,
  extra_minutes INT NOT NULL DEFAULT 0,
  PRIMARY KEY (assessment_id,student_id),
  FOREIGN KEY (assessment_id) REFERENCES school_assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES school_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS school_assessment_submissions (
  assessment_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  started_at BIGINT NOT NULL,
  answer TEXT NOT NULL DEFAULT (''),
  file_key VARCHAR(240) NULL,
  file_name VARCHAR(200) NULL,
  file_type VARCHAR(80) NULL,
  file_size BIGINT NULL,
  submitted_at BIGINT NULL,
  feedback TEXT NOT NULL DEFAULT (''),
  proposed_score DECIMAL(4,2) NULL,
  corrected_at BIGINT NULL,
  revision BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (assessment_id,student_id),
  FOREIGN KEY (assessment_id) REFERENCES school_assessments(id),
  FOREIGN KEY (student_id) REFERENCES school_accounts(id),
  CHECK (proposed_score BETWEEN 0 AND 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
