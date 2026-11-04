"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, PasswordField } from "@/components/auth/field";
import { useHydrated } from "@/components/auth/use-hydrated";
import { homeFor } from "@/lib/roles";

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(undefined);
    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        setPending(false);
        return;
      }
      router.replace(homeFor(data.user));
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field label="Username" name="username" autoComplete="username" autoCapitalize="none" required />
      <PasswordField label="Password" name="password" autoComplete="current-password" required />

      <Button type="submit" className="w-full" disabled={!hydrated || pending}>
        {pending && <Loader2 className="animate-spin" />}
        Masuk
      </Button>
    </form>
  );
}