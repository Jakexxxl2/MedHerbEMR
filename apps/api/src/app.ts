import express from "express";
import cors from "cors";
import { json } from "express";
import { connectToDatabase } from "./config/db.js";
import { registerRoutes } from "./routes.js";

export const app = express();

app.use(cors());
app.use(json());

app.get("/", (_req, res) => {
  res.json({
    message: "MedHerbEMR API is running",
    docs: ["/health", "/api/patients"]
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

registerRoutes(app);

// Initialize DB connection on startup
void connectToDatabase();


