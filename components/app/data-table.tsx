
"use client";

import type { ReactNode } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import type { TableMeta, TableQuery } from "@/lib/types";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  className?: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type TableFilter = {
  key: "lang" | "status" | "isNew" | "oktWm";
  label: string;
  options: FilterOption[];
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  empty: string;

  query: TableQuery;
  setQuery: (changes: Partial<TableQuery>) => void;
  meta: TableMeta;

  filters?: TableFilter[];
  enableSearch?: boolean;
  enableStaffSearch?: boolean;
  enableAction?: boolean;
  loading?: boolean;

  // Aksi default jika renderAction tidak diberikan.
  onAction?: (row: T) => void;

  // Mengganti tampilan tombol aksi sesuai halaman.
  renderAction?: (row: T) => ReactNode;
  actionLabel?: string;
};

export function DataTable<T extends { uuid: string }>({
  columns,
  rows,
  empty,
  query,
  setQuery,
  meta,
  filters = [],
  enableSearch = true,
  enableStaffSearch = false,
  enableAction = true,
  loading = false,
  onAction,
  renderAction,
  actionLabel = "Aksi",
}: DataTableProps<T>) {
  const toggleSort = (key: string) => {
    if (query.sortBy === key) {
      setQuery({
        sortOrder: query.sortOrder === "asc" ? "desc" : "asc",
      });
      return;
    }

    setQuery({
      sortBy: key,
      sortOrder: "asc",
    });
  };

  const start =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;

  const end = Math.min(meta.page * meta.limit, meta.total);
  const totalPages = Math.max(meta.totalPages, 1);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            {enableSearch && (
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={query.q}
                  onChange={(e) => setQuery({ q: e.target.value })}
                  placeholder="Cari judul proyek..."
                  className="h-10 w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground/70 hover:border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            )}

            {enableStaffSearch && meta.isOwner && (
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={query.staff}
                  onChange={(e) => setQuery({ staff: e.target.value })}
                  placeholder="Cari nama staff..."
                  className="h-10 w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground/70 hover:border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            )}
          </div>

          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={query[filter.key]}
                  onChange={(e) =>
                    setQuery({
                      [filter.key]: e.target.value,
                    } as Partial<TableQuery>)
                  }
                  className="h-10 min-w-32 rounded-xl border border-border/70 bg-background px-3 text-sm shadow-sm outline-none transition hover:border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">{filter.label}: Semua</option>

                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm shadow-lg">
              <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Memuat data...
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                {columns.map((column) => {
                  const active = query.sortBy === column.sortKey;

                  return (
                    <th
                      key={column.key}
                      className={`h-12 whitespace-nowrap px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${column.className ?? ""}`}
                    >
                      {column.sortKey ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.sortKey!)}
                          className="inline-flex items-center gap-2 transition hover:text-foreground"
                        >
                          {column.header}

                          {active ? (
                            query.sortOrder === "asc" ? (
                              <ChevronUp className="size-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="size-3.5 text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}

                {enableAction && (
                  <th className="w-20 whitespace-nowrap px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {actionLabel}
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableAction ? 1 : 0)}
                    className="h-48 px-5 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                        <Search className="size-5 text-muted-foreground" />
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        Data tidak ditemukan
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {empty}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.uuid}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3.5 align-middle ${column.className ?? ""}`}
                      >
                        {column.cell(row)}
                      </td>
                    ))}

                    {enableAction && (
                      <td className="px-4 py-3 text-right align-middle">
                        {renderAction ? (
                          renderAction(row)
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAction?.(row)}
                            aria-label="Buka menu aksi"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition hover:border-border hover:bg-background hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            <MoreHorizontal className="size-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {start}–{end}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-foreground">
              {meta.total}
            </span>{" "}
            data
          </span>

          <span className="hidden text-border sm:inline">|</span>

          <select
            value={query.limit}
            onChange={(e) =>
              setQuery({ limit: Number(e.target.value) })
            }
            className="h-8 rounded-lg border border-border/70 bg-background px-2.5 text-xs outline-none transition hover:border-border focus:border-primary"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / halaman
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs text-muted-foreground">
            Halaman {meta.page} dari {totalPages}
          </span>

          <button
            type="button"
            disabled={meta.page <= 1 || loading}
            onClick={() => setQuery({ page: meta.page - 1 })}
            aria-label="Halaman sebelumnya"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            disabled={meta.page >= meta.totalPages || loading}
            onClick={() => setQuery({ page: meta.page + 1 })}
            aria-label="Halaman selanjutnya"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TitleLink({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-foreground transition hover:text-primary hover:underline"
    >
      {title}
    </a>
  );
}

export function StatusChip({ approved }: { approved: number }) {
  return Number(approved) === 1 ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Disetujui
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Menunggu
    </span>
  );
}

export function LanguageChip({ language }: { language: string }) {
  return (
    <span className="inline-flex rounded-md border border-border/70 bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
      {language}
    </span>
  );
}
