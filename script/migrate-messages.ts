import { pool } from "../server/db";

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting migration...");
    
    // Add message type enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE message_type AS ENUM ('text', 'voice', 'image', 'file');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ message_type enum created");
    
    // Add new columns to messages table
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type message_type DEFAULT 'text' NOT NULL`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_url TEXT`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_duration INTEGER`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`);
    console.log("✓ messages table columns added");
    
    // Create message reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id VARCHAR(36) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(message_id, user_id, emoji)
      )
    `);
    console.log("✓ message_reactions table created");
    
    console.log("Migration completed successfully!");
  } catch (err: any) {
    console.error("Migration error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
