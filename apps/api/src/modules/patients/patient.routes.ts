import { Router } from "express";
import {
  handleCreatePatient,
  handleGetPatientById,
  handleListPatients,
  handleUpdatePatient,
  handleDeletePatient
} from "./patient.controller.js";

export const patientRouter = Router();

patientRouter.get("/", handleListPatients);
patientRouter.get("/:id", handleGetPatientById);
patientRouter.post("/", handleCreatePatient);
patientRouter.put("/:id", handleUpdatePatient);
patientRouter.delete("/:id", handleDeletePatient);


