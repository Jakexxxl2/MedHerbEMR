"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListPatients = handleListPatients;
exports.handleGetPatientById = handleGetPatientById;
exports.handleCreatePatient = handleCreatePatient;
exports.handleUpdatePatient = handleUpdatePatient;
exports.handleDeletePatient = handleDeletePatient;
const patient_service_js_1 = require("./patient.service.js");
async function handleListPatients(req, res) {
    const { search, phone } = req.query;
    const patients = await (0, patient_service_js_1.listPatients)({
        search: typeof search === "string" ? search : undefined,
        phone: typeof phone === "string" ? phone : undefined
    });
    res.json(patients);
}
async function handleGetPatientById(req, res) {
    const { id } = req.params;
    const patient = await (0, patient_service_js_1.getPatientById)(id);
    if (!patient) {
        res.status(404).json({ message: "Patient not found" });
        return;
    }
    res.json(patient);
}
async function handleCreatePatient(req, res) {
    const body = req.body;
    try {
        const created = await (0, patient_service_js_1.createPatient)(body);
        res.status(201).json(created);
    }
    catch (err) {
        console.error("Failed to create patient", err);
        if (err?.code === "PATIENT_DUPLICATE") {
            res
                .status(409)
                .json({ message: "Patient with same full name and birth date already exists" });
            return;
        }
        res.status(400).json({ message: "Invalid patient data" });
    }
}
async function handleUpdatePatient(req, res) {
    const { id } = req.params;
    const body = req.body;
    const updated = await (0, patient_service_js_1.updatePatient)(id, body);
    if (!updated) {
        res.status(404).json({ message: "Patient not found" });
        return;
    }
    res.json(updated);
}
async function handleDeletePatient(req, res) {
    const { id } = req.params;
    await (0, patient_service_js_1.deletePatient)(id);
    res.status(204).send();
}
