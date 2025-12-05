import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Aa@123456@",
    database: "postgres",
});

async function createDatabase() {
    try {
        await client.connect();

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'fitline'"
        );

        if (result.rows.length === 0) {
            await client.query("CREATE DATABASE fitline");
            console.log("Database 'fitline' created successfully!");
        } else {
            console.log("Database 'fitline' already exists.");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

createDatabase();
