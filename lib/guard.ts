import { NextResponse, type NextRequest } from "next/server";
import { getUserFromRequest } from "./auth";
import { workspaceOf, type Workspace } from "./roles";

// Dipakai di setiap API: pastikan sudah login dan divisinya diizinkan.
//   const auth = await authorize(req, ["manhwa", "owner"]);
//   if ("error" in auth) return auth.error;
export async function authorize(req: NextRequest, allowed: Workspace[]) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Belum masuk." }, { status: 401 }) };
  }

  const workspace = workspaceOf(user);
  if (!workspace || !allowed.includes(workspace)) {
    return { error: NextResponse.json({ error: "Tidak punya akses." }, { status: 403 }) };
  }
  return { user, workspace };
}