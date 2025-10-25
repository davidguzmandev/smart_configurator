import { pool } from "../db/db";
import type { Part, NewPartInput } from "../types/part";

export const createPart = async (input: NewPartInput): Promise<Part> => {
  const {
    task_id,
    base_model = "cube",
    file_name,
    file_path,
    version_label = "v1",
    volume = null,
  } = input;

  const result = await pool.query<Part>(
    `INSERT INTO parts (task_id, base_model, file_name, file_path, version_label, volume, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, task_id, base_model, file_name, file_path, version_label, volume, created_at`,
    [task_id, base_model, file_name, file_path, version_label, volume]
  );

  if (!result.rows[0]) throw new Error("Failed to create part");
  return result.rows[0];
};

export const getAllParts = async (): Promise<Part[]> => {
  const result = await pool.query<Part>(
    `SELECT id, task_id, base_model, file_name, file_path, version_label, volume, created_at
     FROM parts
     ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getPartById = async (id: number): Promise<Part | null> => {
  const result = await pool.query<Part>(
    `SELECT id, task_id, base_model, file_name, file_path, version_label, volume, created_at
     FROM parts
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};

export const getPartByTaskId = async (taskId: number): Promise<Part | null> => {
  const result = await pool.query<Part>(
    `SELECT id, task_id, base_model, file_name, file_path, version_label, volume, created_at
     FROM parts
     WHERE task_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [taskId]
  );
  return result.rows[0] ?? null;
};
