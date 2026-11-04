"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckField, Field, FormMessage, SelectField } from "@/components/auth/field";
import { useHydrated } from "@/components/auth/use-hydrated";
import type { ManhwaEntry } from "@/lib/types";

const LANG_OPTIONS = [
  { value: "eng", label: "Inggris" },
  { value: "kor", label: "Korea" },
  { value: "chn", label: "China" },
  { value: "spa", label: "Spanyol" },
];

export function ManhwaForm({ onCreated }: { onCreated: (item: ManhwaEntry, saldo: number) => void }) {
  const hydrated = useHydrated();
  const [lang, setLang] = useState("");
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
      const res = await fetch("/api/manhwa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.get("title"),
          link: f.get("link"),
          totalCh: Number(f.get("totalCh")),
          lang,
          isNew: f.get("isNew") === "on",
          clearWm: f.get("clearWm") === "on",
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setError(data.error);
        return;
      }
      formEl.reset();
      setLang("");
      onCreated(data.item, data.saldo);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setPending(false);
    }
  }

  const canClearWm = lang === "kor" || lang === "chn";

  return (
    <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field label="Judul" name="title" error={errors.title} required />
      <Field label="Link" name="link" type="url" placeholder="https://" error={errors.link} required />
      <Field
        label="Jumlah chapter"
        name="totalCh"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        error={errors.totalCh}
        required
      />
      <SelectField
        label="Bahasa"
        name="lang"
        placeholder="Pilih bahasa"
        options={LANG_OPTIONS}
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        error={errors.lang}
        required
      />
      <CheckField label="Proyek baru" name="isNew" />
      {canClearWm && (
        <CheckField
          label="Watermark dihapus"
          name="clearWm"
          hint="Ada tambahan bayaran per chapter."
        />
      )}

      <Button type="submit" className="w-full" disabled={!hydrated || pending}>
        {pending && <Loader2 className="animate-spin" />}
        Simpan proyek
      </Button>
    </form>
  );
}