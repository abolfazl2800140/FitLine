import { pool } from "../server/db";

async function cleanup() {
  const client = await pool.connect();
  try {
    // Delete all messages that were marked as deleted
    const result = await client.query('DELETE FROM messages WHERE is_deleted = true');
    console.log('Deleted', result.rowCount, 'old deleted messages');
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
