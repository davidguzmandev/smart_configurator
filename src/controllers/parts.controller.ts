import { type Request, type Response } from "express";
import { getAllParts, getPartById, createPart } from "../models/parts.model";
import type { Part, NewPartInput } from "../types/part";

export const listParts = async (
  _req: Request,
  res: Response<Part[] | { error: string }>
) => {
  try {
    const parts = await getAllParts();
    return res.status(200).json(parts);
  } catch (err) {
    console.error("❌ Error listing parts:", err);
    return res.status(500).json({ error: "Internal server error while listing parts." });
  }
};

export const getPart = async (
  req: Request<{ id: string }>,
  res: Response<Part | { error: string }>
) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid part ID." });

    const part = await getPartById(id);
    if (!part) return res.status(404).json({ error: "Part not found." });

    return res.status(200).json(part);
  } catch (err) {
    console.error("❌ Error fetching part:", err);
    return res.status(500).json({ error: "Internal server error while fetching part." });
  }
};

export const addPart = async (
  req: Request<{}, {}, NewPartInput>,
  res: Response<Part | { error: string }>
) => {
  try {
    const { task_id, name, length, height, depth } = req.body;

    // Validación básica
    if (!task_id || !name || !length || !height || !depth) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newPart = await createPart({
      task_id,
      name,
      length,
      height,
      depth,
    });

    return res.status(201).json(newPart);
  } catch (err) {
    console.error("❌ Error creating part:", err);
    return res.status(500).json({ error: "Internal server error while creating part." });
  }
};