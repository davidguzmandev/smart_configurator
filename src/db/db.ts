import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: false // o { rejectUnauthorized: false } si uso hosting con SSL obligatorio
});

export async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("✅ Database connection successful:", result.rows[0].now);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}