-- Add follow request status enum
DO $$ BEGIN
    CREATE TYPE follow_request_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add follow_requests table
CREATE TABLE IF NOT EXISTS follow_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id VARCHAR(36) NOT NULL REFERENCES users(id),
    target_id VARCHAR(36) NOT NULL REFERENCES users(id),
    status follow_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_follow_requests_target ON follow_requests(target_id, status);
CREATE INDEX IF NOT EXISTS idx_follow_requests_requester ON follow_requests(requester_id, status);
