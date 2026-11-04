import { Schema, model, models, type Model } from "mongoose";
import type { DoujinEntry } from "@/lib/types";

const doujinSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    totalPage: { type: Number, required: true },
    lang: { type: String, required: true },
    link: { type: String, default: "" },
    insertedAt: { type: String, required: true, index: true },
    approved: { type: Number, default: 0 },
  },
  { collection: "projectsDoujin", versionKey: false },
);

doujinSchema.index({ userId: 1, insertedAt: -1 });
doujinSchema.index({ userId: 1, lang: 1 });
doujinSchema.index({ userId: 1, approved: 1 });

export const Doujin =
  (models.Doujin as Model<DoujinEntry>) || model<DoujinEntry>("Doujin", doujinSchema);