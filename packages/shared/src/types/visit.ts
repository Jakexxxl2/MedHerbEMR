export interface Visit {
  id: string;
  patientId: string;
  visitDate: string; // ISO date string
  // 快照的病人信息，方便访问记录页面直接展示
  patientName?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  phone?: string;
  mainComplaint?: string;
  // 简单处方文本，后续可以拆到独立的 prescriptions 集合
  prescription?: string;
  diagnosisTcm?: string;
  diagnosisWestern?: string;
  treatmentPrinciple?: string;
  notes?: string; // 当次问诊记录
}


