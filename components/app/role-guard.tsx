"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { homeFor, workspaceOf, type SessionUser, type Workspace } from "@/lib/roles";

const UserContext = createContext<SessionUser | null>(null);

export function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser harus dipakai di dalam <RoleGuard>");
  return user;
}

// Cek ke /api/auth/me: belum login -> /login, salah divisi -> halaman divisinya sendiri.
// (Keamanan sebenarnya tetap di tiap API; ini hanya mengatur halaman mana yang tampil.)
export function RoleGuard({ allow, children }: { allow: Workspace; children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        if (!active) return;
        if (res.status === 401) return router.replace("/login");
        if (!res.ok) return setFailed(true);

        const { user } = (await res.json()) as { user: SessionUser };
        if (workspaceOf(user) !== allow) return router.replace(homeFor(user));
        setUser(user);
      } catch {
        if (active) setFailed(true);
      }
    }

    check();
    return () => {
      active = false;
    };
  }, [allow, router]);

  if (failed) {
    return (
      <div className="grid min-h-svh place-items-center px-4 text-center text-sm text-muted-foreground">
        Tidak bisa terhubung ke server. Muat ulang halaman ini.
      </div>
    );
  }
  if (!user) {
    return (
      <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Memuat…</div>
    );
  }
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}