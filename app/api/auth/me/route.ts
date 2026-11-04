import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user) {
    // Cookie ada tapi token sudah tidak berlaku: hapus cookie-nya.
    // Tanpa ini, proxy.ts akan terus melempar user dari /login ke /dashboard.
    const res = NextResponse.json({ error: "Belum masuk." }, { status: 401 });
    clearSessionCookie(res);
    return res;
  }

  return NextResponse.json({ user });
}