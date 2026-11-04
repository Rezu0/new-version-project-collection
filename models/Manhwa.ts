import { Schema, model, models, type Model } from "mongoose";
import type { ManhwaEntry } from "@/lib/types";

// `isNew` adalah nama yang dipesan Mongoose (properti dokumen), jadi tidak
// didaftarkan di schema. Data lama tetap punya field itu: dibaca lewat .lean()
// dan ditulis lewat Manhwa.collection.insertOne() (lihat app/api/manhwa).
const manhwaSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    title: String,
    totalCh: Number,
    lang: String,
    link: String,
    oktWm: Number,
    insertedAt: { type: String, index: true },
    approved: { type: Number, default: 0 },
  },
  { collection: "projectsManhwa", versionKey: false, strict: false },
);

manhwaSchema.index({ userId: 1, insertedAt: -1 });
manhwaSchema.index({ userId: 1, lang: 1 });
manhwaSchema.index({ userId: 1, approved: 1 });

export const Manhwa =
  (models.Manhwa as Model<ManhwaEntry>) || model<ManhwaEntry>("Manhwa", manhwaSchema);