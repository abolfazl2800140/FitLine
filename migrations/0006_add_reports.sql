-- Report reason enum
DO $$ BEGIN
  CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'harassment', 'misinformation', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Report status enum
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Report item type enum
DO $$ BEGIN
  CREATE TYPE report_item_type AS ENUM ('post', 'comment', 'question', 'answer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id VARCHAR(36) NOT NULL REFERENCES users(id),
  item_id VARCHAR(36) NOT NULL,
  item_type report_item_type NOT NULL,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_item ON reports(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
