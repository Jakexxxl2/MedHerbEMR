"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListVisits = handleListVisits;
exports.handleCreateVisit = handleCreateVisit;
exports.handleUpdateVisit = handleUpdateVisit;
exports.handleDeleteVisit = handleDeleteVisit;
const visit_service_js_1 = require("./visit.service.js");
async function handleListVisits(req, res) {
    const { from, to, keyword, patientId } = req.query;
    const visits = await (0, visit_service_js_1.listVisits)({
        from: typeof from === "string" ? from : undefined,
        to: typeof to === "string" ? to : undefined,
        keyword: typeof keyword === "string" ? keyword : undefined,
        patientId: typeof patientId === "string" ? patientId : undefined
    });
    res.json(visits);
}
async function handleCreateVisit(req, res) {
    const body = req.body;
    try {
        const created = await (0, visit_service_js_1.createVisit)(body);
        res.status(201).json(created);
    }
    catch (err) {
        console.error("Failed to create visit", err);
        res.status(400).json({ message: "Invalid visit data" });
    }
}
async function handleUpdateVisit(req, res) {
    const { id } = req.params;
    const body = req.body;
    try {
        const updated = await (0, visit_service_js_1.updateVisit)(id, body);
        if (!updated) {
            res.status(404).json({ message: "Visit not found" });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error("Failed to update visit", err);
        res.status(400).json({ message: "Invalid visit data" });
    }
}
async function handleDeleteVisit(req, res) {
    const { id } = req.params;
    await (0, visit_service_js_1.deleteVisit)(id);
    res.status(204).send();
}
