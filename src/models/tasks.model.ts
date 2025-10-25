import { pool } from "../db/db";
import type { Task, NewTaskInput } from "../types/task";
import { createPart, getPartByTaskId } from "./parts.model";

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
  const now = new Date();
  let query = "";
  let params: any[] = [];

  if (status === "processing") {
    query = "UPDATE tasks SET status=$1, started_at=$2 WHERE id=$3 RETURNING *";
    params = [status, now, id];
  } else if (status === "done") {
    query =
      "UPDATE tasks SET status=$1, completed_at=$2 WHERE id=$3 RETURNING *";
    params = [status, now, id];
  } else {
    query = "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *";
    params = [status, id];
  }

  const result = await pool.query<Task>(query, params);

  if (!result.rows[0]) throw new Error("Failed to update task status");

  const updated = result.rows[0];

  // 👇 NUEVO: si la tarea pasó a 'done', insertamos la 'part'
  if (updated.status === "done") {
    // Evita duplicados si ya existe part para esta task (idempotencia)
    const existing = await getPartByTaskId(updated.id);
    if (!existing) {
      // Construimos el nombre de la pieza: "cube_LxHxD.SLDPRT"
      // Puedes hacerlo dinámico si luego soportas más familias de modelos
      const partName = `cube_${updated.length}x${updated.height}x${updated.depth}.SLDPRT`;

      await createPart({
        task_id: updated.id,
        name: partName,
        length: updated.length,
        height: updated.height,
        depth: updated.depth,
      });
    }
  }

  return updated;
};
