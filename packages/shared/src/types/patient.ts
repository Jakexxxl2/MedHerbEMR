export interface Patient {
  id: string;
  lastName: string;
  firstName: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  email?: string;
  birthDate?: string; // ISO date string
  age?: number;
  occupation?: string;
  address?: string;
  region?: string;
  postcode?: string;
  countryOrNationality?: string;
  firstVisitDate?: string; // ISO date string
  mainComplaint?: string; // 病情描述（整体主诉）
  visitCount?: number; // 问诊次数
  acquisitionChannel?: string; // 了解途径
  notes?: string; // 备注（不再分类）
}


