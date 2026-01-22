export interface Prescription {
  id: string;
  visitId: string;
  name?: string; // 处方名/常用方
  rawText: string; // 原始处方文本
}


