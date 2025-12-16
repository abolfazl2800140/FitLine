-- Fix message timestamps to use timezone
ALTER TABLE messages 
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN edited_at TYPE timestamp with time zone USING edited_at AT TIME ZONE 'UTC';
