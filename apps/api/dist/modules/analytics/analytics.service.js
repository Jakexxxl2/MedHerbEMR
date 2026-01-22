"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsSummary = getAnalyticsSummary;
const patient_model_js_1 = require("../patients/patient.model.js");
const visit_model_js_1 = require("../visits/visit.model.js");
function computeGenderDistribution(patients) {
    const counts = {
        male: 0,
        female: 0,
        other: 0,
        unknown: 0
    };
    for (const p of patients) {
        const g = p.gender;
        let key;
        if (g === "male" || g === "female" || g === "other") {
            key = g;
        }
        else {
            key = "unknown";
        }
        counts[key] += 1;
    }
    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([gender, count]) => ({ gender: gender, count }));
}
function computeAgeBuckets(patients) {
    const buckets = {};
    function add(age) {
        if (typeof age !== "number" || Number.isNaN(age) || age < 1)
            return;
        const capped = Math.min(age, 100);
        const index = Math.floor((capped - 1) / 10); // 0 -> 1-10, 1 -> 11-20, ...
        const start = index * 10 + 1;
        const end = start + 9;
        const label = `${start}-${end}`;
        buckets[label] = (buckets[label] ?? 0) + 1;
    }
    const currentYear = new Date().getFullYear();
    for (const p of patients) {
        if (typeof p.age === "number") {
            add(p.age);
        }
        else if (typeof p.birthDate === "string" && p.birthDate.length >= 4) {
            const year = Number(p.birthDate.slice(0, 4));
            if (!Number.isNaN(year)) {
                add(currentYear - year);
            }
        }
    }
    return Object.entries(buckets)
        .sort(([a], [b]) => {
        const aStart = Number(a.split("-")[0]);
        const bStart = Number(b.split("-")[0]);
        return aStart - bStart;
    })
        .map(([bucket, count]) => ({ bucket, count }));
}
function computeVisitCountBuckets(patients) {
    const buckets = {
        "1次": 0,
        "2次": 0,
        "3-5次": 0,
        "6-10次": 0,
        "10次以上": 0
    };
    for (const p of patients) {
        const vc = typeof p.visitCount === "number" ? p.visitCount : 0;
        if (vc <= 0)
            continue;
        if (vc === 1)
            buckets["1次"] += 1;
        else if (vc === 2)
            buckets["2次"] += 1;
        else if (vc >= 3 && vc <= 5)
            buckets["3-5次"] += 1;
        else if (vc >= 6 && vc <= 10)
            buckets["6-10次"] += 1;
        else if (vc > 10)
            buckets["10次以上"] += 1;
    }
    return Object.entries(buckets)
        .filter(([, count]) => count > 0)
        .map(([bucket, count]) => ({ bucket, count }));
}
function computeVisitsByPeriod(visits, year, month) {
    const result = {};
    const mode = month ? "month" : "year";
    function parseDate(str) {
        if (!str)
            return null;
        let d = new Date(str);
        if (!Number.isNaN(d.getTime()))
            return d;
        // 尝试将 2023/03/04 改为 2023-03-04
        d = new Date(str.replace(/\//g, "-"));
        if (!Number.isNaN(d.getTime()))
            return d;
        return null;
    }
    for (const v of visits) {
        const d = parseDate(v.visitDate);
        if (!d)
            continue;
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        if (y !== year)
            continue;
        if (month && m !== month)
            continue;
        if (mode === "year") {
            const label = `${m}月`;
            result[label] = (result[label] ?? 0) + 1;
        }
        else {
            const label = `${day}日`;
            result[label] = (result[label] ?? 0) + 1;
        }
    }
    const items = Object.entries(result)
        .sort(([a], [b]) => {
        const aNum = Number(a.replace(/[^\d]/g, ""));
        const bNum = Number(b.replace(/[^\d]/g, ""));
        return aNum - bNum;
    })
        .map(([label, count]) => ({ label, count }));
    const rangeFrom = month
        ? `${year}-${String(month).padStart(2, "0")}-01`
        : `${year}-01-01`;
    const rangeTo = month
        ? `${year}-${String(month).padStart(2, "0")}-31`
        : `${year}-12-31`;
    return { mode, items, rangeFrom, rangeTo };
}
async function getAnalyticsSummary(params) {
    const year = params.year ?? new Date().getFullYear();
    const month = params.month;
    const [patients, visits] = await Promise.all([
        patient_model_js_1.PatientModel.find({}).exec(),
        visit_model_js_1.VisitModel.find({}).exec()
    ]);
    const genderDistribution = computeGenderDistribution(patients);
    const ageBuckets = computeAgeBuckets(patients);
    const visitCountBuckets = computeVisitCountBuckets(patients);
    // Visit summary：总人次 & 复诊率
    const visitsForPeriod = visits.filter((v) => {
        const d = new Date(v.visitDate);
        if (Number.isNaN(d.getTime()))
            return false;
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        if (y !== year)
            return false;
        if (month && m !== month)
            return false;
        return true;
    });
    const totalVisits = visitsForPeriod.length;
    const patientsWithAtLeastOneVisit = patients.filter((p) => typeof p.visitCount === "number" && p.visitCount > 0).length;
    const patientsWithAtLeastTwoVisits = patients.filter((p) => typeof p.visitCount === "number" && p.visitCount >= 2).length;
    const returnRate = patientsWithAtLeastOneVisit > 0
        ? patientsWithAtLeastTwoVisits / patientsWithAtLeastOneVisit
        : 0;
    const { mode, items: visitsByPeriod, rangeFrom, rangeTo } = computeVisitsByPeriod(visits, year, month);
    // 先不做复杂的主诉关键词统计，返回空数组，后续可以按需要扩展
    const topComplaints = [];
    return {
        range: {
            from: rangeFrom,
            to: rangeTo
        },
        visitSummary: {
            totalVisits,
            returnRate
        },
        genderDistribution,
        ageBuckets,
        topComplaints,
        visitCountBuckets,
        visitsByPeriodMode: mode,
        visitsByPeriod,
        year,
        month
    };
}
