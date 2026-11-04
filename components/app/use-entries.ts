"use client";

import { useCallback, useEffect, useState } from "react";
import type { TableMeta, TableQuery } from "@/lib/types";

const initialQuery: TableQuery = {
  page: 1,
  limit: 10,
  q: "",
  staff: "",
  lang: "",
  status: "",
  isNew: "",
  oktWm: "",
  sortBy: "insertedAt",
  sortOrder: "desc",
};

export function useEntries<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [query, setQueryState] = useState<TableQuery>(initialQuery);

  const [meta, setMeta] = useState<TableMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    isOwner: false,
  });

  const setQuery = useCallback((changes: Partial<TableQuery>) => {
    setQueryState((prev) => {
      const next = { ...prev, ...changes };

      // Filter dan pencarian selalu kembali ke halaman pertama.
      if (
        "q" in changes ||
        "staff" in changes ||
        "lang" in changes ||
        "status" in changes ||
        "isNew" in changes ||
        "oktWm" in changes ||
        "limit" in changes ||
        "sortBy" in changes ||
        "sortOrder" in changes
      ) {
        next.page = 1;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setStatus("loading");

        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
          if (value !== "") params.set(key, String(value));
        });

        const res = await fetch(`${endpoint}?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(String(res.status));

        const data = await res.json();

        setItems(data.items ?? []);
        setMeta(data.meta);
        setSaldo(typeof data.saldo === "number" ? data.saldo : null);
        setStatus("ready");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setStatus("error");
      }
    }, query.q || query.staff ? 350 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint, query]);

  const add = useCallback((item: T, nextSaldo: number) => {
    setSaldo(nextSaldo);

    // Data baru hanya dimasukkan secara lokal jika sedang halaman pertama.
    if (query.page === 1) {
      setItems((prev) => [item, ...prev].slice(0, query.limit));

      setMeta((prev) => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit),
      }));
    }
  }, [query.page, query.limit]);

  return {
    items,
    saldo,
    status,
    add,
    query,
    setQuery,
    meta,
  };
}