import { type Request, type Response } from "express";
import {
  createTask,
  getAllTasks,
  updateTaskStatus,
} from "../models/tasks.model";
import type { NewTaskInput, Task } from "../types/task";

export const generatePart = async (
  req: Request<{}, {}, NewTaskInput>,
  res: Response<Pick<Task, "id" | "status"> | { error: string }>
) => {
  try {
    const { length, height, depth } = req.body;

    if (![length, height, depth].every((v) => typeof v === "number" && v > 0)) {
      return res
        .status(400)
        .json({ error: "All dimensions must be positive numeric values." });
    }
    const newTask = await createTask({ length, height, depth });
    return res.status(201).json(newTask);
  } catch (err) {
    console.error("❌ Error creating task:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while creating task." });
  }
};

export const listTasks = async (
  _req: Request,
  res: Response<Task[] | { error: string }>
) => {
  try {
    const tasks = await getAllTasks();
    return res.status(200).json(tasks);
  } catch (err) {
    console.error("❌ Error listing tasks:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while listing tasks." });
  }
};

export const markTaskAsDone = async (
  req: Request<{ id: string }, {}, { status: Task["status"]; name?: string }>,
  res: Response<Task | { error: string }>
) => {
  try {
    const id = Number(req.params.id);
    const { status, name } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Invalid task ID or status." });
    }

    const updatedTask = await updateTaskStatus(id, status, name);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    return res.status(200).json(updatedTask);
  } catch (err) {
    console.error("❌ Error updating task:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while updating task." });
  }
};