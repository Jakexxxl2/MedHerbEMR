import { Router } from "express";
import { handleGetAnalytics } from "./analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/", handleGetAnalytics);








