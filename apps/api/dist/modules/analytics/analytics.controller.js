"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetAnalytics = handleGetAnalytics;
const analytics_service_js_1 = require("./analytics.service.js");
async function handleGetAnalytics(req, res) {
    const { year, month } = req.query;
    const y = typeof year === "string" ? Number(year) : undefined;
    const m = typeof month === "string" ? Number(month) : undefined;
    const summary = await (0, analytics_service_js_1.getAnalyticsSummary)({
        year: Number.isFinite(y) ? y : undefined,
        month: Number.isFinite(m) ? m : undefined
    });
    res.json(summary);
}
