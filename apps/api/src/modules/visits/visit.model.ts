import { Schema, model, type InferSchemaType } from "mongoose";

const visitSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    visitDate: { type: String, required: true },
    patientName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    age: { type: Number },
    phone: { type: String },
    mainComplaint: { type: String },
    prescription: { type: String, default: "" },
    diagnosisTcm: { type: String },
    diagnosisWestern: { type: String },
    treatmentPrinciple: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

export type VisitDocument = InferSchemaType<typeof visitSchema> & {
  _id: string;
};

export const VisitModel = model<VisitDocument>("Visit", visitSchema);


