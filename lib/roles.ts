// Aman dipakai di server maupun client (tanpa mongoose).
export type Workspace = "manhwa" | "doujin" | "owner";

export type SessionUser = {
  displayId: string;
  username: string;
  displayUsername: string;
  role: string;
  divisi: string;
};

type RoleInfo = { role?: string | null; divisi?: string | null };

// owner-dd (divisi) atau role owner -> halaman owner.
// manhwa / doujin -> halaman input masing-masing.
export function workspaceOf(u: RoleInfo): Workspace | null {
  if (u.role === "owner" || u.divisi === "owner-dd") return "owner";
  if (u.divisi === "manhwa") return "manhwa";
  if (u.divisi === "doujin") return "doujin";
  return null;
}

// Akun tanpa divisi yang dikenali diarahkan ke /dashboard (halaman penengah).
export function homeFor(u: RoleInfo) {
  const w = workspaceOf(u);
  return w ? `/${w}` : "/dashboard";
}