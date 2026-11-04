import { NextResponse, type NextRequest } from "next/server";

// Harus sama dengan SESSION_COOKIE di lib/auth.ts.
// Sengaja tidak di-import dari sana supaya proxy tidak ikut menarik mongoose.
const SESSION_COOKIE = "session";
const AUTH_PAGES = ["/login", "/register"];

// Next.js 16: proxy.ts menggantikan middleware.ts.
// Hanya mengecek ADA tidaknya cookie (cepat, tanpa database).
// Keabsahan token dan hak akses per divisi dicek di /api/auth/me dan tiap API.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has(SESSION_COOKIE);
  const isAuthPage = AUTH_PAGES.includes(req.nextUrl.pathname);

  // Sudah login tapi membuka /login atau /register -> /dashboard (lalu diarahkan sesuai divisi).
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Belum login tapi membuka halaman dalam -> /login.
  if (!isAuthPage && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard", "/manhwa", "/doujin", "/owner"],
};