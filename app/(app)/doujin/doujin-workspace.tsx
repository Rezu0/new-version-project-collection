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
import type { DoujinEntry } from "@/lib/types";
import { DoujinForm } from "./doujin-form";

export function DoujinWorkspace() {
  const {
    items,
    saldo,
    status,
    add,
    query,
    setQuery,
    meta,
  } = useEntries<DoujinEntry>("/api/doujin");

  const columns: Column<DoujinEntry>[] = [
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
      key: "totalPage",
      header: "Halaman",
      sortKey: "totalPage",
      className: "text-right tabular-nums",
      cell: (r) => (
        <span className="font-medium">{r.totalPage}</span>
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
        { label: "Japanese", value: "jp" },
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
  ];

  return (
    <WorkspaceShell
      title="Input Doujin"
      subtitle="Catat proyek doujin yang sudah kamu kerjakan."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <SaldoCard saldo={saldo} />

          <Panel title="Tambah proyek">
            <DoujinForm onCreated={add} />
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
                console.log("Doujin action:", row);
              }}
            />
          )}
        </Panel>
      </div>
    </WorkspaceShell>
  );
}