"use client";

import {
  DataTable,
  StatusChip,
  TitleLink,
  LanguageChip,
  type Column,
  type TableFilter,
} from "@/components/app/data-table";
import { Panel } from "@/components/app/panel";
import { SaldoCard } from "@/components/app/saldo-card";
import { useEntries } from "@/components/app/use-entries";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { LANG_LABEL, tanggal } from "@/lib/format";
import type { ManhwaEntry } from "@/lib/types";
import { ManhwaForm } from "./manhwa-form";

export function ManhwaWorkspace() {
  const {
    items,
    saldo,
    status,
    add,
    query,
    setQuery,
    meta,
  } = useEntries<ManhwaEntry>("/api/manhwa");

  const columns: Column<ManhwaEntry>[] = [
    {
      key: "insertedAt",
      header: "Tanggal",
      sortKey: "insertedAt",
      cell: (r) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {tanggal(r.insertedAt)}
        </span>
      ),
    },
    {
      key: "title",
      header: "Judul Proyek",
      sortKey: "title",
      cell: (r) => (
        <div className="min-w-48 space-y-1">
          <TitleLink title={r.title} href={r.link} />
          {meta.isOwner && (
            <p className="text-xs text-muted-foreground">
              {r.staff?.displayUsername || r.staff?.username || "Staff tidak ditemukan"}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "lang",
      header: "Bahasa",
      sortKey: "lang",
      cell: (r) => (
        <LanguageChip language={LANG_LABEL[r.lang] ?? r.lang} />
      ),
    },
    {
      key: "totalCh",
      header: "Chapter",
      sortKey: "totalCh",
      className: "text-right tabular-nums",
      cell: (r) => (
        <span className="font-medium">{r.totalCh}</span>
      ),
    },
    {
      key: "isNew",
      header: "Tipe",
      sortKey: "isNew",
      cell: (r) =>
        Number(r.isNew) === 1 ? (
          <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
            Baru
          </span>
        ) : (
          <span className="text-muted-foreground">Reguler</span>
        ),
    },
    {
      key: "oktWm",
      header: "Watermark",
      sortKey: "oktWm",
      cell: (r) =>
        Number(r.oktWm) === 2 ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Dihapus
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">–</span>
        ),
    },
    {
      key: "approved",
      header: "Status",
      sortKey: "approved",
      cell: (r) => <StatusChip approved={r.approved} />,
    },
  ];

  const filters: TableFilter[] = [
    {
      key: "lang",
      label: "Bahasa",
      options: [
        { label: "English", value: "eng" },
        { label: "Korean", value: "kor" },
        { label: "Chinese", value: "chn" },
        { label: "Spanish", value: "spa" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Disetujui", value: "approved" },
        { label: "Menunggu", value: "pending" },
      ],
    },
    {
      key: "isNew",
      label: "Tipe",
      options: [
        { label: "Baru", value: "1" },
        { label: "Reguler", value: "0" },
      ],
    },
    {
      key: "oktWm",
      label: "Watermark",
      options: [
        { label: "Dihapus", value: "2" },
        { label: "Belum dihapus", value: "1" },
      ],
    },
  ];

  return (
    <WorkspaceShell
      title="Input Manhwa"
      subtitle="Catat pj manhwa yang sudah kamu kerjakan."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <SaldoCard saldo={saldo} />

          <Panel title="Tambah proyek">
            <ManhwaForm onCreated={add} />
          </Panel>
        </div>

        <Panel
          title="Proyek kamu"
          description={`${meta.total.toLocaleString("id-ID")} proyek tercatat`}
        >
          {status === "error" ? (
            <p className="px-5 py-12 text-center text-sm text-destructive">
              Gagal memuat data. Muat ulang halaman ini.
            </p>
          ) : (
            <DataTable
              columns={columns}
              rows={items}
              query={query}
              setQuery={setQuery}
              meta={meta}
              filters={filters}
              enableSearch
              enableStaffSearch
              loading={status === "loading"}
              empty="Belum ada proyek yang sesuai."
              onAction={(row) => {
                console.log("Manhwa action:", row);
              }}
            />
          )}
        </Panel>
      </div>
    </WorkspaceShell>
  );
}