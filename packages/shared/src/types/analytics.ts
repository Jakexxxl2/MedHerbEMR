export interface VisitSummary {
  totalVisits: number;
  returnRate: number; // 复诊率 0-1
}

export interface GenderDistributionItem {
  gender: "male" | "female" | "other" | "unknown";
  count: number;
}

export interface AgeBucketItem {
  bucket: string; // e.g. "<30", "30-50", ">50"
  count: number;
}

export interface VisitCountBucketItem {
  bucket: string; // e.g. "1次", "2次", "3-5次", "6-10次", "10次以上"
  count: number;
}

export interface ComplaintStatItem {
  keyword: string;
  count: number;
}

export interface VisitsByPeriodItem {
  label: string; // e.g. "1月", "2月" for yearly; "1日", "2日" for monthly
  count: number;
}

export interface AnalyticsSummary {
  range: {
    from: string;
    to: string;
  };
  visitSummary: VisitSummary;
  genderDistribution: GenderDistributionItem[];
  ageBuckets: AgeBucketItem[];
  topComplaints: ComplaintStatItem[];
  visitCountBuckets: VisitCountBucketItem[];
  visitsByPeriodMode: "year" | "month";
  visitsByPeriod: VisitsByPeriodItem[];
  year: number;
  month?: number;
}


