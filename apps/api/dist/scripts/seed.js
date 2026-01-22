"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const patient_model_js_1 = require("../modules/patients/patient.model.js");
const visit_model_js_1 = require("../modules/visits/visit.model.js");
async function seedPatientsAndVisits() {
    await (0, db_js_1.connectToDatabase)();
    const patients = [
        {
            lastName: "Wang",
            firstName: "Yaqiao",
            gender: "female",
            phone: "0448 674 048",
            birthDate: "1996-07-23",
            age: 29,
            occupation: "Student",
            email: "WYQbecky@163.com",
            address: "",
            region: "",
            postcode: "2018",
            countryOrNationality: "北京",
            firstVisitDate: "2025-10-04",
            mainComplaint: "减肥，神疲，记忆力↓，失眠，",
            visitCount: 2,
            acquisitionChannel: "xhs",
            notes: "UNSW策展，国内做互联网经验，3D设计"
        },
        {
            lastName: "Adams",
            firstName: "Bridget",
            gender: "female",
            phone: "0405 115 681",
            birthDate: "1947-06-16",
            age: 78,
            occupation: "Retired",
            email: "BridgetADAM@strategex.com.au",
            address: "42 Fitzroy Ave",
            region: "Balmain",
            postcode: "2041",
            countryOrNationality: "外国",
            firstVisitDate: "2023-03-04",
            mainComplaint: "皮肤病，身体发热，神疲，鼻炎，关节痛",
            visitCount: 7,
            acquisitionChannel: "Friends",
            notes: ""
        },
        {
            lastName: "Allotta",
            firstName: "John",
            gender: "male",
            phone: "0422 198 043",
            birthDate: "1964-07-29",
            age: 61,
            occupation: "Chartered Accountant",
            email: "john_allotta@hotmail.com",
            address: "4 Beckton Place",
            region: "Lilli Pilli",
            postcode: "2229",
            countryOrNationality: "外国",
            firstVisitDate: "2022-12-07",
            mainComplaint: "失眠，忧郁，能量不足，神疲",
            visitCount: 5,
            acquisitionChannel: "Friends",
            notes: ""
        },
        {
            lastName: "An",
            firstName: "Xunuo",
            gender: "female",
            phone: "0420 331 818",
            birthDate: "1982-02-07",
            age: 43,
            occupation: "",
            email: "",
            address: "81/Harbour St",
            region: "Haymarket",
            postcode: "2000",
            countryOrNationality: "",
            firstVisitDate: "2024-07-17",
            mainComplaint: "月经不调，晚睡，痛经，有腰痛，腹泻",
            visitCount: 3,
            acquisitionChannel: "",
            notes: ""
        },
        {
            lastName: "Ange",
            firstName: "James",
            gender: "male",
            phone: "0418 188 188",
            birthDate: "1998-01-16",
            age: 27,
            occupation: "Self Employed",
            email: "mimange@gmail.com",
            address: "102 Sugarloaf Cr",
            region: "Castlecrag",
            postcode: "2068",
            countryOrNationality: "外国",
            firstVisitDate: "2023-08-30",
            mainComplaint: "尿血，心悸，精神差，胃口不好，",
            visitCount: 1,
            acquisitionChannel: "",
            notes: ""
        },
        {
            lastName: "Ao",
            firstName: "Xue",
            gender: "female",
            phone: "0426 004 068",
            birthDate: "1987-04-08",
            age: 38,
            occupation: "",
            email: "",
            address: "1/49 Duke St",
            region: "Campsie",
            postcode: "2194",
            countryOrNationality: "中国",
            firstVisitDate: "2024-11-27",
            mainComplaint: "梦多，难入睡，手足凉，神疲，头痛，口苦",
            visitCount: 5,
            acquisitionChannel: "",
            notes: ""
        },
        {
            lastName: "Aneeckal",
            firstName: "Resmi Sony",
            gender: "female",
            phone: "0449 795 080",
            birthDate: "1985-04-15",
            age: 40,
            occupation: "Registered Nurse",
            email: "resmi.raina@gmail.com",
            address: "277 Kanahooka Rd",
            region: "Dapto",
            postcode: "2530",
            countryOrNationality: "外国",
            firstVisitDate: "2024-04-17",
            mainComplaint: "痔疮，减肥",
            visitCount: 1,
            acquisitionChannel: "Friends",
            notes: ""
        },
        {
            lastName: "Arzoumalian",
            firstName: "Taline",
            gender: "female",
            phone: "0401 307 593",
            birthDate: "1989-02-01",
            age: 36,
            occupation: "",
            email: "Taline1357@gmail.com",
            address: "18 Livingstone Pl",
            region: "Mt. Colah",
            postcode: "2079",
            countryOrNationality: "外国",
            firstVisitDate: "2021-12-01",
            mainComplaint: "痤疮，霉菌，白带，月经量少，头痛，月经痛",
            visitCount: 3,
            acquisitionChannel: "Friends",
            notes: "纹身生意Tattoo"
        }
    ];
    await patient_model_js_1.PatientModel.deleteMany({});
    await visit_model_js_1.VisitModel.deleteMany({});
    const createdPatients = await patient_model_js_1.PatientModel.insertMany(patients);
    console.log(`Seeded ${createdPatients.length} patients.`);
    const visits = createdPatients.map((p) => {
        const visitDate = p.firstVisitDate && p.firstVisitDate.length > 0
            ? p.firstVisitDate
            : new Date().toISOString().slice(0, 10);
        return {
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
            notes: "",
            // 保证每条都有唯一但简单可读的排序顺序
            createdAt: new Date(visitDate),
            updatedAt: new Date(visitDate)
        };
    });
    await visit_model_js_1.VisitModel.insertMany(visits);
    console.log(`Seeded ${visits.length} visits (one per patient).`);
}
seedPatientsAndVisits()
    .then(() => {
    console.log("Seeding completed.");
    process.exit(0);
})
    .catch((err) => {
    console.error("Seeding failed", err);
    process.exit(1);
});
