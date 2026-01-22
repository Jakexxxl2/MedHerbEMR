"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitModel = void 0;
const mongoose_1 = require("mongoose");
const visitSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitDate: { type: String, required: true },
    patientName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    age: { type: Number },
    phone: { type: String },
    mainComplaint: { type: String },
    prescription: { type: String, default: "" },
    diagnosisTcm: { type: String },
    diagnosisWestern: { type: String },
    treatmentPrinciple: { type: String },
    notes: { type: String }
}, {
    timestamps: true
});
exports.VisitModel = (0, mongoose_1.model)("Visit", visitSchema);
