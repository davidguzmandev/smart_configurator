import { pool } from "../db/db";
import type { Task, NewTaskInput } from "../types/task";

export const createTask = async (
  task: NewTaskInput
): Promise<Pick<Task, "id" | "status">> => {
  const { length, height, depth } = task;

  const result = await pool.query<Pick<Task, "id" | "status">>(
    `INSERT INTO tasks ( length, height, depth, status, created_at )
        VALUES ($1, $2, $3, 'pending', NOW())
        RETURNING id, status`,
    [length, height, depth]
  );
  //El if es para asegurar que siempre se retorna un valor valido, se que postgresql va a retornar un valor pero por seguridad y codigo estricto lo dejo con if. Otra idea es poner el operador "!" en el return.
  if (!result.rows[0]) throw new Error("Failed to create task");
  return result.rows[0];
};

export const getAllTasks = async (): Promise<Task[]> => {
  const result = await pool.query<Task>(
    `SELECT * FROM tasks ORDER BY created_at DESC`
  );
  return result.rows;
};

export const updateTaskStatus = async (
  id: number,
  status: Task["status"]
): Promise<Task> => {
  const result = await pool.query<Task>(
    `
    UPDATE tasks
    SET
      status = $1,
      started_at   = CASE WHEN $1 = 'processing' THEN NOW() ELSE started_at END,
      completed_at = CASE WHEN $1 = 'done'       THEN NOW() ELSE completed_at END
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );
  if (!result.rows[0]) throw new Error("Failed to update task status");
  return result.rows[0];
};
