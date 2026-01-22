"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVisits = listVisits;
exports.createVisit = createVisit;
exports.updateVisit = updateVisit;
exports.deleteVisit = deleteVisit;
const visit_model_js_1 = require("./visit.model.js");
const patient_model_js_1 = require("../patients/patient.model.js");
function toVisit(doc) {
    return {
        id: doc._id.toString(),
        patientId: doc.patientId.toString(),
        visitDate: doc.visitDate,
        patientName: doc.patientName ?? undefined,
        gender: (doc.gender ?? undefined),
        age: doc.age ?? undefined,
        phone: doc.phone ?? undefined,
        mainComplaint: doc.mainComplaint ?? undefined,
        prescription: doc.prescription ?? undefined,
        diagnosisTcm: doc.diagnosisTcm ?? undefined,
        diagnosisWestern: doc.diagnosisWestern ?? undefined,
        treatmentPrinciple: doc.treatmentPrinciple ?? undefined,
        notes: doc.notes ?? undefined
    };
}
async function listVisits(params) {
    const filter = {};
    if (params.from || params.to) {
        const range = {};
        if (params.from)
            range.$gte = params.from;
        if (params.to)
            range.$lte = params.to;
        filter.visitDate = range;
    }
    if (params.keyword) {
        const regex = new RegExp(params.keyword, "i");
        filter.$or = [
            { patientName: regex },
            { mainComplaint: regex },
            { notes: regex },
            { diagnosisTcm: regex }
        ];
    }
    if (params.patientId) {
        filter.patientId = params.patientId;
    }
    const docs = await visit_model_js_1.VisitModel.find(filter)
        .sort({ visitDate: -1, createdAt: -1 })
        .exec();
    return docs.map(toVisit);
}
async function createVisit(input) {
    const patient = await patient_model_js_1.PatientModel.findById(input.patientId).exec();
    if (!patient) {
        throw new Error("Patient not found");
    }
    const created = await visit_model_js_1.VisitModel.create({
        patientId: patient._id,
        visitDate: input.visitDate,
        patientName: `${patient.lastName} ${patient.firstName}`,
        gender: patient.gender,
        age: patient.age,
        phone: patient.phone,
        mainComplaint: input.mainComplaint,
        prescription: input.prescription ?? "",
        diagnosisTcm: input.diagnosisTcm,
        diagnosisWestern: input.diagnosisWestern,
        treatmentPrinciple: input.treatmentPrinciple,
        notes: input.notes
    });
    // 尝试同步问诊次数（如果已有该字段）
    await patient_model_js_1.PatientModel.findByIdAndUpdate(patient._id, {
        $inc: { visitCount: 1 }
    }).exec();
    return toVisit(created);
}
async function updateVisit(id, input) {
    const updated = await visit_model_js_1.VisitModel.findByIdAndUpdate(id, input, { new: true }).exec();
    return updated ? toVisit(updated) : null;
}
async function deleteVisit(id) {
    const deleted = await visit_model_js_1.VisitModel.findByIdAndDelete(id).exec();
    if (deleted) {
        await patient_model_js_1.PatientModel.findByIdAndUpdate(deleted.patientId, {
            $inc: { visitCount: -1 }
        }).exec();
    }
}
