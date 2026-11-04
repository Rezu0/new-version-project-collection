import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { newToken, setSessionCookie } from "@/lib/auth";
import { User } from "@/models/User";
import { Saldo } from "@/models/Saldo";
import { RegisterCode } from "@/models/RegisterCode";

const fail = (fieldErrors: Record<string, string>, status = 400) =>
  NextResponse.json({ fieldErrors }, { status });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const displayUsername = String(body?.displayUsername ?? "").trim();
  const username = String(body?.username ?? "").trim().toLowerCase();
  const divisi = String(body?.divisi ?? "");
  const password = String(body?.password ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");
  const code = String(body?.code ?? "").trim().toUpperCase();

  const errors: Record<string, string> = {};
  if (displayUsername.length < 2) errors.displayUsername = "Minimal 2 karakter.";
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    errors.username = "3-20 karakter: huruf kecil, angka, titik, atau underscore.";
  }
  if (divisi !== "manhwa" && divisi !== "doujin") errors.divisi = "Pilih divisi.";
  if (password.length < 8) errors.password = "Minimal 8 karakter.";
  if (confirmPassword !== password) errors.confirmPassword = "Password tidak sama.";
  if (!/^[A-Z0-9]{8}$/.test(code)) errors.code = "Kode terdiri dari 8 karakter.";
  if (Object.keys(errors).length > 0) return fail(errors);

  await connectDB();

  if (await User.exists({ username })) {
    return fail({ username: "Username sudah dipakai." }, 409);
  }

  // Klaim kode secara atomik: satu kode hanya bisa dipakai satu orang.
  const now = new Date().toISOString();
  const claimed = await RegisterCode.findOneAndUpdate(
    { code, usedBy: null },
    { $set: { usedBy: username, usedAt: now } },
  );
  if (!claimed) return fail({ code: "Kode tidak valid atau sudah dipakai." });

  const displayId = randomUUID();
  const token = newToken();
  try {
    await User.create({
      displayId,
      username,
      hashPassword: await bcrypt.hash(password, 10),
      displayUsername,
      role: "staff",
      divisi,
      insertedAt: now,
      timeLogin: now,
      tokenActive: token,
    });
    await Saldo.create({ userId: displayId, lastWithdraw: now });
  } catch (err) {
    // Kembalikan kode supaya bisa dipakai lagi.
    await RegisterCode.updateOne({ code }, { $set: { usedBy: null, usedAt: null } });

    if ((err as { code?: number }).code === 11000) {
      return fail({ username: "Username sudah dipakai." }, 409);
    }
    console.error("Register gagal:", err);
    return NextResponse.json({ error: "Pendaftaran gagal. Coba lagi sebentar." }, { status: 500 });
  }

  // Setelah daftar, langsung masuk (token ikut dititipkan ke cookie).
  const res = NextResponse.json(
    { user: { displayId, username, displayUsername, role: "staff", divisi } },
    { status: 201 },
  );
  setSessionCookie(res, token);
  return res;
}