import type { Visit } from "@medherb/shared";
import { VisitModel, type VisitDocument } from "./visit.model.js";
import { PatientModel } from "../patients/patient.model.js";

function toVisit(doc: VisitDocument): Visit {
  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    visitDate: doc.visitDate,
    patientName: doc.patientName ?? undefined,
    gender: (doc.gender ?? undefined) as Visit["gender"],
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

export async function listVisits(params: {
  from?: string;
  to?: string;
  keyword?: string;
  patientId?: string;
}): Promise<Visit[]> {
  const filter: Record<string, unknown> = {};

  if (params.from || params.to) {
    const range: Record<string, string> = {};
    if (params.from) range.$gte = params.from;
    if (params.to) range.$lte = params.to;
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

  const docs = await VisitModel.find(filter)
    .sort({ visitDate: -1, createdAt: -1 })
    .exec();

  return docs.map(toVisit);
}


export interface CreateVisitInput {
  patientId: string;
  visitDate: string;
  mainComplaint?: string;
  prescription?: string;
  diagnosisTcm?: string;
  diagnosisWestern?: string;
  treatmentPrinciple?: string;
  notes?: string;
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  const patient = await PatientModel.findById(input.patientId).exec();
  if (!patient) {
    throw new Error("Patient not found");
  }

  const created = await VisitModel.create({
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
  await PatientModel.findByIdAndUpdate(patient._id, {
    $inc: { visitCount: 1 }
  }).exec();

  return toVisit(created);
}

export interface UpdateVisitInput {
  visitDate?: string;
  mainComplaint?: string;
  prescription?: string;
  diagnosisTcm?: string;
  diagnosisWestern?: string;
  treatmentPrinciple?: string;
  notes?: string;
}

export async function updateVisit(id: string, input: UpdateVisitInput): Promise<Visit | null> {
  const updated = await VisitModel.findByIdAndUpdate(
    id,
    input,
    { new: true }
  ).exec();

  return updated ? toVisit(updated as VisitDocument) : null;
}

export async function deleteVisit(id: string): Promise<void> {
  const deleted = await VisitModel.findByIdAndDelete(id).exec();
  if (deleted) {
    await PatientModel.findByIdAndUpdate(deleted.patientId, {
      $inc: { visitCount: -1 }
    }).exec();
  }
}

