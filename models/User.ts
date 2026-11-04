import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Struktur sama dengan collection `users` yang sudah ada.
// Tanggal disimpan sebagai string ISO, sama seperti data lama.
const userSchema = new Schema(
  {
    displayId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    hashPassword: { type: String, required: true },
    displayUsername: { type: String, required: true },
    role: { type: String, enum: ["owner", "staff"], default: "staff" },
    // Tanpa enum: divisi owner kosong (atau 'owner-dd' di data lama).
    divisi: { type: String, default: "" },
    insertedAt: { type: String, required: true },
    timeLogin: { type: String, default: null },
    tokenActive: { type: String, default: null, index: true },
  },
  { collection: "users", versionKey: false },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);