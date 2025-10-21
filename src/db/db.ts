import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
})

export async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("✅ Database connection successful:", result.rows[0].now);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}