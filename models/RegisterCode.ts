import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const registerCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    createdAt: { type: String, required: true },
    usedBy: { type: String, default: null },
    usedAt: { type: String, default: null },
  },
  { collection: "registerCodes", versionKey: false },
);

export type RegisterCodeDoc = InferSchemaType<typeof registerCodeSchema>;
export const RegisterCode =
  (models.RegisterCode as Model<RegisterCodeDoc>) ||
  model<RegisterCodeDoc>("RegisterCode", registerCodeSchema);