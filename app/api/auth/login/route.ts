import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { issueToken, setSessionCookie } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!username || !password) {
    return NextResponse.json({ error: "Isi username dan password." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ username }).lean();
  const valid = user ? await bcrypt.compare(password, user.hashPassword) : false;

  if (!user || !valid) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  const token = await issueToken(user.username);
  const res = NextResponse.json({
    user: {
      displayId: user.displayId,
      username: user.username,
      displayUsername: user.displayUsername,
      role: user.role,
      divisi: user.divisi,
    },
  });
  setSessionCookie(res, token);
  return res;
}