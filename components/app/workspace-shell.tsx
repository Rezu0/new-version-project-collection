"use client";

import { useRouter } from "next/navigation";
import { BookOpenText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "./role-guard";

export function WorkspaceShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useUser();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
              <BookOpenText className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">{title}</h1>
              <p className="text-sm text-primary-foreground/80">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">{user.displayUsername}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut />
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}