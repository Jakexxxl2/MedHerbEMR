import type { Request, Response } from "express";
import { getAnalyticsSummary } from "./analytics.service.js";

export async function handleGetAnalytics(req: Request, res: Response): Promise<void> {
  const { year, month } = req.query;

  const y = typeof year === "string" ? Number(year) : undefined;
  const m = typeof month === "string" ? Number(month) : undefined;

  const summary = await getAnalyticsSummary({
    year: Number.isFinite(y) ? y : undefined,
    month: Number.isFinite(m) ? m : undefined
  });

  res.json(summary);
}








