import { Schema, model, type InferSchemaType } from "mongoose";

const patientSchema = new Schema(
  {
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    phone: { type: String },
    email: { type: String },
    birthDate: { type: String },
    age: { type: Number },
    occupation: { type: String },
    address: { type: String },
    region: { type: String },
    postcode: { type: String },
    countryOrNationality: { type: String },
    firstVisitDate: { type: String },
    mainComplaint: { type: String },
    visitCount: { type: Number },
    acquisitionChannel: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

export type PatientDocument = InferSchemaType<typeof patientSchema> & {
  _id: string;
};

export const PatientModel = model<PatientDocument>("Patient", patientSchema);


