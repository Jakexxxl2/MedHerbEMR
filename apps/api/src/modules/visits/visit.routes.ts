import { Router } from "express";
import {
  handleCreateVisit,
  handleDeleteVisit,
  handleListVisits,
  handleUpdateVisit
} from "./visit.controller.js";

export const visitRouter = Router();

visitRouter.get("/", handleListVisits);
visitRouter.post("/", handleCreateVisit);
visitRouter.put("/:id", handleUpdateVisit);
visitRouter.delete("/:id", handleDeleteVisit);


