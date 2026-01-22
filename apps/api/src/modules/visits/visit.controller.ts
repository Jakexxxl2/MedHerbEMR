import type { Request, Response } from "express";
import { createVisit, deleteVisit, listVisits, updateVisit } from "./visit.service.js";

export async function handleListVisits(req: Request, res: Response): Promise<void> {
  const { from, to, keyword, patientId } = req.query;

  const visits = await listVisits({
    from: typeof from === "string" ? from : undefined,
    to: typeof to === "string" ? to : undefined,
    keyword: typeof keyword === "string" ? keyword : undefined,
    patientId: typeof patientId === "string" ? patientId : undefined
  });

  res.json(visits);
}

export async function handleCreateVisit(req: Request, res: Response): Promise<void> {
  const body = req.body;
  try {
    const created = await createVisit(body);
    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create visit", err);
    res.status(400).json({ message: "Invalid visit data" });
  }
}

export async function handleUpdateVisit(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const body = req.body;

  try {
    const updated = await updateVisit(id, body);
    if (!updated) {
      res.status(404).json({ message: "Visit not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update visit", err);
    res.status(400).json({ message: "Invalid visit data" });
  }
}

export async function handleDeleteVisit(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await deleteVisit(id);
  res.status(204).send();
}


