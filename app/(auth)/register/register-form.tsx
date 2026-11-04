"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, PasswordField, SelectField } from "@/components/auth/field";
import { useHydrated } from "@/components/auth/use-hydrated";
import { homeFor } from "@/lib/roles";

const DIVISI_OPTIONS = [
  { value: "manhwa", label: "Manhwa" },
  { value: "doujin", label: "Doujin" },
];

export function RegisterForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [error, setError] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(undefined);
    setErrors({});
    setPending(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        if (data.error) setError(data.error);
        setPending(false);
        return;
      }
      // Akun jadi dan langsung masuk (cookie sudah dipasang oleh server).
      router.replace(homeFor(data.user));
    } catch {
      setError("Tidak bisa terhubung ke server.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field
        label="Nama tampilan"
        name="displayUsername"
        autoComplete="name"
        error={errors.displayUsername}
        required
      />
      <Field
        label="Username"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        hint="Dipakai untuk masuk. Huruf kecil, angka, titik, atau underscore."
        error={errors.username}
        required
      />
      <SelectField
        label="Divisi"
        name="divisi"
        placeholder="Pilih divisi"
        options={DIVISI_OPTIONS}
        defaultValue=""
        error={errors.divisi}
        required
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        error={errors.password}
        required
      />
      <PasswordField
        label="Konfirmasi password"
        name="confirmPassword"
        autoComplete="new-password"
        error={errors.confirmPassword}
        required
      />
      <Field
        label="Kode dari admin"
        name="code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={8}
        hint="8 karakter. Minta ke admin kalau belum punya."
        error={errors.code}
        className="font-mono tracking-widest uppercase"
        required
      />

      <Button type="submit" className="w-full" disabled={!hydrated || pending}>
        {pending && <Loader2 className="animate-spin" />}
        Buat akun
      </Button>
    </form>
  );
}