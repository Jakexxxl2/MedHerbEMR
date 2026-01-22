import type { Request, Response } from "express";
import {
  createPatient,
  deletePatient,
  getPatientById,
  listPatients,
  updatePatient
} from "./patient.service.js";

export async function handleListPatients(req: Request, res: Response): Promise<void> {
  const { search, phone } = req.query;

  const patients = await listPatients({
    search: typeof search === "string" ? search : undefined,
    phone: typeof phone === "string" ? phone : undefined
  });

  res.json(patients);
}

export async function handleGetPatientById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const patient = await getPatientById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }
  res.json(patient);
}

export async function handleCreatePatient(req: Request, res: Response): Promise<void> {
  const body = req.body;

  try {
    const created = await createPatient(body);
    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create patient", err);
    if ((err as any)?.code === "PATIENT_DUPLICATE") {
      res
        .status(409)
        .json({ message: "Patient with same full name and birth date already exists" });
      return;
    }
    res.status(400).json({ message: "Invalid patient data" });
  }
}

export async function handleUpdatePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const body = req.body;

  const updated = await updatePatient(id, body);
  if (!updated) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }
  res.json(updated);
}

export async function handleDeletePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await deletePatient(id);
  res.status(204).send();
}


