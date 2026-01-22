"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const patient_model_js_1 = require("../modules/patients/patient.model.js");
const visit_model_js_1 = require("../modules/visits/visit.model.js");
async function backfillVisitsFromPatients() {
    await (0, db_js_1.connectToDatabase)();
    const patients = await patient_model_js_1.PatientModel.find({}).exec();
    console.log(`Found ${patients.length} patients in database.`);
    const visitsToInsert = [];
    for (const p of patients) {
        // 如果该病人已经有 visit 记录，则跳过，避免重复生成
        const exists = await visit_model_js_1.VisitModel.exists({ patientId: p._id });
        if (exists)
            continue;
        const visitDate = (p.firstVisitDate && p.firstVisitDate.toString().slice(0, 10)) ||
            new Date().toISOString().slice(0, 10);
        visitsToInsert.push({
            patientId: p._id,
            visitDate,
            patientName: `${p.lastName} ${p.firstName}`,
            gender: p.gender,
            age: p.age,
            phone: p.phone,
            mainComplaint: p.mainComplaint,
            prescription: "",
            diagnosisTcm: "",
            diagnosisWestern: "",
            treatmentPrinciple: "",
            notes: ""
            // createdAt / updatedAt 由 Mongoose timestamps 自动生成
        });
    }
    if (visitsToInsert.length === 0) {
        console.log("No new visits to create (each patient already has at least one visit).");
        return;
    }
    const created = await visit_model_js_1.VisitModel.insertMany(visitsToInsert);
    console.log(`Created ${created.length} visits (one per patient without existing visits).`);
}
backfillVisitsFromPatients()
    .then(() => {
    console.log("Backfill completed.");
    process.exit(0);
})
    .catch((err) => {
    console.error("Backfill failed", err);
    process.exit(1);
});
