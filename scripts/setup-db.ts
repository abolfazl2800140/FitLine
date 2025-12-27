import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

async function setupDatabase() {
    console.log("🚀 Setting up database...\n");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL not found in .env file!");
        console.log("\n📝 Create a .env file with:");
        console.log("DATABASE_URL=postgresql://username:password@localhost:5432/fitline");
        process.exit(1);
    }

    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const db = drizzle(pool, { schema });

        console.log("✅ Connected to database");
        console.log("📦 Running migrations with drizzle-kit push...\n");

        // Close pool
        await pool.end();

        // Run drizzle-kit push
        const { execSync } = await import("child_process");
        execSync("npx drizzle-kit push", { stdio: "inherit" });

        console.log("\n✅ Database schema created successfully!");
        console.log("\n📝 Next steps:");
        console.log("   1. Run: npm run db:seed    (to add sample data)");
        console.log("   2. Run: npm run dev        (to start the app)");

    } catch (error: any) {
        console.error("❌ Database setup failed:", error.message);
        process.exit(1);
    }
}

setupDatabase();
