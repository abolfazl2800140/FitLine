import "dotenv/config";
import { pool } from "./local-db";

async function createSessionTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
    `);
    console.log("✅ Session table created successfully");
  } catch (error) {
    console.error("Error creating session table:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

createSessionTable();
