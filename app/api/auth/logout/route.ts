import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { clearSessionCookie, getTokenFromRequest } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (token) {
    await connectDB();
    await User.updateOne({ tokenActive: token }, { $set: { tokenActive: null } });
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}