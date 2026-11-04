"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, SelectField } from "@/components/auth/field";
import { useHydrated } from "@/components/auth/use-hydrated";
import type { DoujinEntry } from "@/lib/types";

const LANG_OPTIONS = [
  { value: "eng", label: "Inggris" },
  { value: "jp", label: "Jepang" },
];

export function DoujinForm({ onCreated }: { onCreated: (item: DoujinEntry, saldo: number) => void }) {
  const hydrated = useHydrated();
  const [error, setError] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    setError(undefined);
    setErrors({});
    setPending(true);

    try {
      const res = await fetch("/api/doujin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.get("title"),
          link: f.get("link"),
          totalPage: Number(f.get("totalPage")),
          lang: f.get("lang"),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setError(data.error);
        return;
      }
      formEl.reset();
      onCreated(data.item, data.saldo);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field label="Judul" name="title" error={errors.title} required />
      <Field label="Link" name="link" type="url" placeholder="https://" error={errors.link} required />
      <Field
        label="Jumlah halaman"
        name="totalPage"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        error={errors.totalPage}
        required
      />
      <SelectField
        label="Bahasa"
        name="lang"
        placeholder="Pilih bahasa"
        options={LANG_OPTIONS}
        defaultValue=""
        error={errors.lang}
        required
      />

      <Button type="submit" className="w-full" disabled={!hydrated || pending}>
        {pending && <Loader2 className="animate-spin" />}
        Simpan proyek
      </Button>
    </form>
  );
}