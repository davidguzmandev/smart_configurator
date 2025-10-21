import { pool } from '../db/db';
import type { Task, NewTaskInput } from '../types/task';

export const createTask = async (task: NewTaskInput): Promise<Pick<Task, "id" | "status">> => {
    const { length, height, depth,} = task;

    const result = await pool.query<Pick<Task, "id" | "status">>(
        `INSERT INTO tasks ( length, height, dept, status, created_at )
        VALUES ($1, $2, $3, 'pending', NOW())
        RETURNING id, status`,
        [length, height, depth]
    );
    //El if es para asegurar que siempre se retorna un valor valido, se que postgresql va a retornar un valor pero por seguridad y codigo estricto lo dejo con if. Otra idea es poner el operador "!" en el return.
    if (!result.rows[0]) throw new Error('Failed to create task');
    return result.rows[0];
}