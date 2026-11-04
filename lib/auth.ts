import { randomBytes, randomInt } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { RegisterCode } from "@/models/RegisterCode";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

// Tanpa karakter yang mirip (0/O, 1/I/L) supaya kode mudah dibaca dan diketik.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRegisterCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

// Dipakai nanti oleh dashboard admin untuk membuat kode baru.
export async function createRegisterCode(createdBy: string) {
  await connectDB();
  const code = generateRegisterCode();
  await RegisterCode.create({
    code,
    createdBy,
    createdAt: new Date().toISOString(),
  });
  return code;
}

export const newToken = () => randomBytes(32).toString("hex");

// Token disimpan di users.tokenActive (+ timeLogin), sama seperti alur lama.
export async function issueToken(username: string) {
  const token = newToken();
  await connectDB();
  await User.updateOne(
    { username },
    { $set: { tokenActive: token, timeLogin: new Date().toISOString() } },
  );
  return token;
}

// Token yang sama dititipkan ke cookie browser lewat response (bukan next/headers).
export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
}

export function getTokenFromRequest(req: NextRequest) {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

// Cek token ke database. Dipakai oleh API yang butuh user yang sedang login.
export async function getUserFromRequest(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  await connectDB();
  return User.findOne({ tokenActive: token })
    .select("-_id displayId username displayUsername role divisi")
    .lean();
}