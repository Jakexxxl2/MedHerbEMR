import type { Patient } from "@medherb/shared";
import { PatientModel, type PatientDocument } from "./patient.model.js";
import { VisitModel } from "../visits/visit.model.js";

function toPatient(doc: PatientDocument): Patient {
  return {
    id: doc._id.toString(),
    lastName: doc.lastName,
    firstName: doc.firstName,
    gender: (doc.gender) as Patient["gender"],
    phone: doc.phone ?? undefined,
    email: doc.email ?? undefined,
    birthDate: doc.birthDate ?? undefined,
    age: doc.age ?? undefined,
    occupation: doc.occupation ?? undefined,
    address: doc.address ?? undefined,
    region: doc.region ?? undefined,
    postcode: doc.postcode ?? undefined,
    countryOrNationality: doc.countryOrNationality ?? undefined,
    firstVisitDate: doc.firstVisitDate ?? undefined,
    mainComplaint: doc.mainComplaint ?? undefined,
    visitCount: doc.visitCount ?? undefined,
    acquisitionChannel: doc.acquisitionChannel ?? undefined,
    notes: doc.notes ?? undefined
  };
}

export async function listPatients(params: {
  search?: string;
  phone?: string;
}): Promise<Patient[]> {
  const filter: Record<string, unknown> = {};

  if (params.phone) {
    filter.phone = new RegExp(params.phone.replace(/\s+/g, ""), "i");  //去空格，改小写，等价于 phone LIKE /041234/i
  }

  if (params.search) {
    const regex = new RegExp(params.search, "i");
    filter.$or = [{ lastName: regex }, { firstName: regex }]; //等价于WHERE lastName LIKE '%regex%' OR firstName LIKE '%regex%'
  }

  const docs = await PatientModel.find(filter) //执行数据库查询
    .sort({ lastName: 1, firstName: 1 })
    .exec();

  return docs.map(toPatient); //前后端解耦，转换成业务层 Patient 对象。不把 _id、__v 等数据库细节泄漏到前端
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const doc = await PatientModel.findById(id).exec();
  return doc ? toPatient(doc) : null;
}

export async function createPatient(data: Omit<Patient, "id">): Promise<Patient> {
  // check duplicate by full name + birthDate (only when birthDate is provided)
  if (data.birthDate) {
    const existing = await PatientModel.findOne({
      lastName: data.lastName,
      firstName: data.firstName,
      birthDate: data.birthDate
    }).exec();

    if (existing) {
      const error = new Error("PATIENT_DUPLICATE");
      // @ts-expect-error custom code
      error.code = "PATIENT_DUPLICATE";
      throw error;
    }
  }

  const created = await PatientModel.create({
    ...data
  });
  return toPatient(created);
}

export async function updatePatient(
  id: string,
  data: Partial<Omit<Patient, "id">>
): Promise<Patient | null> {
  const updated = await PatientModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).exec();
  return updated ? toPatient(updated) : null;
}

export async function deletePatient(id: string): Promise<void> {
  await VisitModel.deleteMany({ patientId: id }).exec();
  await PatientModel.findByIdAndDelete(id).exec();
}


