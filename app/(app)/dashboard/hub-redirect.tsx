"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { workspaceOf, type SessionUser } from "@/lib/roles";

// Halaman penengah: cek siapa yang login lalu lempar ke halaman divisinya.
export function HubRedirect() {
  const router = useRouter();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) return router.replace("/login");
        if (!res.ok) return setMessage("Tidak bisa terhubung ke server. Muat ulang halaman ini.");

        const { user } = (await res.json()) as { user: SessionUser };
        const workspace = workspaceOf(user);
        if (workspace) router.replace(`/${workspace}`);
        else setMessage("Akun ini belum punya divisi yang dikenali. Hubungi admin.");
      })
      .catch(() => active && setMessage("Tidak bisa terhubung ke server. Muat ulang halaman ini."));

    return () => {
      active = false;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  return (
    <div className="grid min-h-svh place-items-center px-4 text-center">
      {message ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" onClick={logout}>
            Keluar
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      )}
    </div>
  );
}