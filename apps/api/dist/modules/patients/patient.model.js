"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientModel = void 0;
const mongoose_1 = require("mongoose");
const patientSchema = new mongoose_1.Schema({
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    phone: { type: String },
    email: { type: String },
    birthDate: { type: String },
    age: { type: Number },
    occupation: { type: String },
    address: { type: String },
    region: { type: String },
    postcode: { type: String },
    countryOrNationality: { type: String },
    firstVisitDate: { type: String },
    mainComplaint: { type: String },
    visitCount: { type: Number },
    acquisitionChannel: { type: String },
    notes: { type: String }
}, {
    timestamps: true
});
exports.PatientModel = (0, mongoose_1.model)("Patient", patientSchema);
