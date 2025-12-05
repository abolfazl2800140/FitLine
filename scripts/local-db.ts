import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

const pool = new pg.Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Aa@123456@",
    database: "fitline",
});

export const db = drizzle(pool, { schema });
export { pool };
