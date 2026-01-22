"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPatients = listPatients;
exports.getPatientById = getPatientById;
exports.createPatient = createPatient;
exports.updatePatient = updatePatient;
exports.deletePatient = deletePatient;
const patient_model_js_1 = require("./patient.model.js");
const visit_model_js_1 = require("../visits/visit.model.js");
function toPatient(doc) {
    return {
        id: doc._id.toString(),
        lastName: doc.lastName,
        firstName: doc.firstName,
        gender: (doc.gender),
        phone: doc.phone ?? undefined,
        email: doc.email ?? undefined,
        birthDate: doc.birthDate ?? undefined,
        age: doc.age ?? undefined,
        occupation: doc.occupation ?? undefined,
        address: doc.address ?? undefined,
        region: doc.region ?? undefined,
        postcode: doc.postcode ?? undefined,
        countryOrNationality: doc.countryOrNationality ?? undefined,
        firstVisitDate: doc.firstVisitDate ?? undefined,
        mainComplaint: doc.mainComplaint ?? undefined,
        visitCount: doc.visitCount ?? undefined,
        acquisitionChannel: doc.acquisitionChannel ?? undefined,
        notes: doc.notes ?? undefined
    };
}
async function listPatients(params) {
    const filter = {};
    if (params.phone) {
        filter.phone = new RegExp(params.phone.replace(/\s+/g, ""), "i");
    }
    if (params.search) {
        const regex = new RegExp(params.search, "i");
        filter.$or = [{ lastName: regex }, { firstName: regex }];
    }
    const docs = await patient_model_js_1.PatientModel.find(filter)
        .sort({ lastName: 1, firstName: 1 })
        .exec();
    return docs.map(toPatient);
}
async function getPatientById(id) {
    const doc = await patient_model_js_1.PatientModel.findById(id).exec();
    return doc ? toPatient(doc) : null;
}
async function createPatient(data) {
    // check duplicate by full name + birthDate (only when birthDate is provided)
    if (data.birthDate) {
        const existing = await patient_model_js_1.PatientModel.findOne({
            lastName: data.lastName,
            firstName: data.firstName,
            birthDate: data.birthDate
        }).exec();
        if (existing) {
            const error = new Error("PATIENT_DUPLICATE");
            // @ts-expect-error custom code
            error.code = "PATIENT_DUPLICATE";
            throw error;
        }
    }
    const created = await patient_model_js_1.PatientModel.create({
        ...data
    });
    return toPatient(created);
}
async function updatePatient(id, data) {
    const updated = await patient_model_js_1.PatientModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    }).exec();
    return updated ? toPatient(updated) : null;
}
async function deletePatient(id) {
    await visit_model_js_1.VisitModel.deleteMany({ patientId: id }).exec();
    await patient_model_js_1.PatientModel.findByIdAndDelete(id).exec();
}
