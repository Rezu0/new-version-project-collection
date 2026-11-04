import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const saldoSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    lastWithdraw: { type: String, required: true },
    status: { type: String, default: "none" },
    amount: { type: Number, default: 0 },
  },
  { collection: "saldo", versionKey: false },
);

export type SaldoDoc = InferSchemaType<typeof saldoSchema>;
export const Saldo = (models.Saldo as Model<SaldoDoc>) || model<SaldoDoc>("Saldo", saldoSchema);