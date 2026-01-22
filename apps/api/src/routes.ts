import type { Express } from "express";
import { patientRouter } from "./modules/patients/patient.routes.js";
import { visitRouter } from "./modules/visits/visit.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api/patients", patientRouter);
  app.use("/api/visits", visitRouter);
  app.use("/api/analytics", analyticsRouter);
}


