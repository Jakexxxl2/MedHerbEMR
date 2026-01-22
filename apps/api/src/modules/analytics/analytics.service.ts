import type {
  AnalyticsSummary,
  AgeBucketItem,
  ComplaintStatItem,
  GenderDistributionItem,
  VisitCountBucketItem,
  VisitsByPeriodItem
} from "@medherb/shared";
import { PatientModel } from "../patients/patient.model.js";
import { VisitModel } from "../visits/visit.model.js";

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  let d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  d = new Date(value.replace(/\//g, "-"));
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

function computeGenderDistribution(patients: any[]): GenderDistributionItem[] {
  const counts: Record<GenderDistributionItem["gender"], number> = {
    male: 0,
    female: 0,
    other: 0,
    unknown: 0
  };

  for (const p of patients) {
    const g: unknown = p.gender;
    let key: GenderDistributionItem["gender"];
    if (g === "male" || g === "female" || g === "other") {
      key = g;
    } else {
      key = "unknown";
    }
    counts[key] += 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([gender, count]) => ({ gender: gender as GenderDistributionItem["gender"], count }));
}

function computeAgeBuckets(patients: any[]): AgeBucketItem[] {
  const buckets: Record<string, number> = {};

  function add(age: number | undefined | null) {
    if (typeof age !== "number" || Number.isNaN(age) || age < 1) return;
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
    } else if (typeof p.birthDate === "string" && p.birthDate.length >= 4) {
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

function computeVisitCountBuckets(patients: any[]): VisitCountBucketItem[] {
  const buckets: Record<string, number> = {
    "1次": 0,
    "2次": 0,
    "3-5次": 0,
    "6-10次": 0,
    "10次以上": 0
  };

  for (const p of patients) {
    const vc = typeof p.visitCount === "number" ? p.visitCount : 0;
    if (vc <= 0) continue;
    if (vc === 1) buckets["1次"] += 1;
    else if (vc === 2) buckets["2次"] += 1;
    else if (vc >= 3 && vc <= 5) buckets["3-5次"] += 1;
    else if (vc >= 6 && vc <= 10) buckets["6-10次"] += 1;
    else if (vc > 10) buckets["10次以上"] += 1;
  }

  return Object.entries(buckets)
    .filter(([, count]) => count > 0)
    .map(([bucket, count]) => ({ bucket, count }));
}

function computeVisitsByPeriod(
  visits: any[],
  year?: number,
  month?: number
): { mode: "year" | "month"; items: VisitsByPeriodItem[]; rangeFrom: string; rangeTo: string } {
  const result: Record<string, number> = {};
  const mode: "year" | "month" = month ? "month" : "year";

  let minYear: number | null = null;
  let maxYear: number | null = null;

  for (const v of visits) {
    const d = parseDate(v.visitDate);
    if (!d) continue;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    minYear = minYear === null ? y : Math.min(minYear, y);
    maxYear = maxYear === null ? y : Math.max(maxYear, y);

    if (!year && !month) {
      // 全部年份：按年份汇总
      const label = `${y}年`;
      result[label] = (result[label] ?? 0) + 1;
    } else if (year && !month) {
      // 指定年份：按月份汇总
      if (y !== year) continue;
      const label = `${m}月`;
      result[label] = (result[label] ?? 0) + 1;
    } else if (year && month) {
      // 指定年份 + 月份：按日期汇总
      if (y !== year || m !== month) continue;
      const label = `${day}日`;
      result[label] = (result[label] ?? 0) + 1;
    }
  }

  const items: VisitsByPeriodItem[] = Object.entries(result)
    .sort(([a], [b]) => {
      const aNum = Number(a.replace(/[^\d]/g, ""));
      const bNum = Number(b.replace(/[^\d]/g, ""));
      return aNum - bNum;
    })
    .map(([label, count]) => ({ label, count }));

  let rangeFrom: string;
  let rangeTo: string;
  if (!year && !month) {
    if (minYear === null || maxYear === null) {
      const nowYear = new Date().getFullYear();
      rangeFrom = `${nowYear}-01-01`;
      rangeTo = `${nowYear}-12-31`;
    } else {
      rangeFrom = `${minYear}-01-01`;
      rangeTo = `${maxYear}-12-31`;
    }
  } else if (year && !month) {
    rangeFrom = `${year}-01-01`;
    rangeTo = `${year}-12-31`;
  } else {
    // year && month
    rangeFrom = `${year}-${String(month).padStart(2, "0")}-01`;
    rangeTo = `${year}-${String(month).padStart(2, "0")}-31`;
  }

  return { mode, items, rangeFrom, rangeTo };
}

export async function getAnalyticsSummary(params: {
  year?: number;
  month?: number;
}): Promise<AnalyticsSummary> {
  const year = params.year;
  const month = params.month;

  const [patients, visits] = await Promise.all([
    PatientModel.find({}).exec(),
    VisitModel.find({}).exec()
  ]);

  // 基于选定的年份 / 月份过滤 visit
  const visitsForPeriod = visits.filter((v) => {
    const d = parseDate(v.visitDate);
    if (!d) return false;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (year && y !== year) return false;
    if (month && m !== month) return false;
    return true;
  });

  const totalVisits = visitsForPeriod.length;

  // 根据本期内有问诊记录的病人来计算性别 / 年龄 / 问诊次数
  const patientIdSet = new Set(
    visitsForPeriod.map((v) => v.patientId?.toString?.() ?? String(v.patientId))
  );
  const patientsForPeriod = patients.filter((p) =>
    patientIdSet.has(p._id.toString())
  );

  const genderDistribution = computeGenderDistribution(patientsForPeriod);
  const ageBuckets = computeAgeBuckets(patientsForPeriod);
  const visitCountBuckets = computeVisitCountBuckets(patientsForPeriod);

  // Visit summary：总人次 & 复诊率（至少 2 次 / 至少 1 次）
  let patientsWithAtLeastOneVisit = 0;
  let patientsWithAtLeastTwoVisits = 0;
  for (const p of patientsForPeriod) {
    const vc = typeof p.visitCount === "number" ? p.visitCount : 0;
    if (vc >= 1) patientsWithAtLeastOneVisit += 1;
    if (vc >= 2) patientsWithAtLeastTwoVisits += 1;
  }

  const returnRate =
    patientsWithAtLeastOneVisit > 0
      ? patientsWithAtLeastTwoVisits / patientsWithAtLeastOneVisit
      : 0;

  const { mode, items: visitsByPeriod, rangeFrom, rangeTo } = computeVisitsByPeriod(
    visitsForPeriod,
    year,
    month
  );

  // 先不做复杂的主诉关键词统计，返回空数组，后续可以按需要扩展
  const topComplaints: ComplaintStatItem[] = [];

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
    year: year ?? new Date().getFullYear(),
    month
  };
}



