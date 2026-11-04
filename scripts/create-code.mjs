// Membuat kode registrasi dari terminal (untuk bootstrap sebelum dashboard admin ada).
// Pakai: node --env-file=.env.local scripts/create-code.mjs 3
import mongoose from "mongoose";
import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sama dengan lib/auth.ts
const makeCode = () =>
  Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const count = Number(process.argv[2] ?? 1);

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  const codes = mongoose.connection.collection("registerCodes");
  await codes.createIndex({ code: 1 }, { unique: true });

  for (let i = 0; i < count; i++) {
    const code = makeCode();
    await codes.insertOne({
      code,
      createdBy: "script",
      createdAt: new Date().toISOString(),
      usedBy: null,
      usedAt: null,
    });
    console.log(code);
  }
} finally {
  await mongoose.disconnect();
}
