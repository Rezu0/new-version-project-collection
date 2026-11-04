"use client";

import {
  DataTable,
  LanguageChip,
  StatusChip,
  TitleLink,
  type Column,
  type TableFilter,
} from "@/components/app/data-table";
import { Panel } from "@/components/app/panel";
import { useEntries } from "@/components/app/use-entries";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { Card } from "@/components/ui/card";
import { LANG_LABEL, tanggal } from "@/lib/format";
import type { DoujinEntry, ManhwaEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useState } from "react";
import { ButtonApprOwner } from "./_component/button-appr";

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card className="gap-1 border-primary/30 px-5 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-brand-ink">
        {value.toLocaleString("id-ID")}
      </p>
    </Card>
  );
}

const manhwaColumns: Column<ManhwaEntry>[] = [
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
    key: "staff",
    header: "Staff",
    cell: (r) => (
      <span className="font-medium">
        {r.staff?.displayUsername || r.staff?.username || "–"}
      </span>
    ),
  },
  {
    key: "title",
    header: "Judul Proyek",
    sortKey: "title",
    cell: (r) => <TitleLink title={r.title} href={r.link} />,
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
    cell: (r) => <span className="font-medium">{r.totalCh}</span>,
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
        <span className="text-xs font-medium text-emerald-600">
          Dihapus
        </span>
      ) : (
        <span className="text-muted-foreground">–</span>
      ),
  },
  {
    key: "approved",
    header: "Status",
    sortKey: "approved",
    cell: (r) => <StatusChip approved={r.approved} />,
  },
];

const doujinColumns: Column<DoujinEntry>[] = [
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
    key: "staff",
    header: "Staff",
    cell: (r) => (
      <span className="font-medium">
        {r.staff?.displayUsername || r.staff?.username || "–"}
      </span>
    ),
  },
  {
    key: "title",
    header: "Judul Proyek",
    sortKey: "title",
    cell: (r) => <TitleLink title={r.title} href={r.link} />,
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
    cell: (r) => <span className="font-medium">{r.totalPage}</span>,
  },
  {
    key: "approved",
    header: "Status",
    sortKey: "approved",
    cell: (r) => <StatusChip approved={r.approved} />,
  },
];

const manhwaFilters: TableFilter[] = [
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

const doujinFilters: TableFilter[] = [
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

export function OwnerWorkspace() {
  const manhwa = useEntries<ManhwaEntry>("/api/manhwa");
  const doujin = useEntries<DoujinEntry>("/api/doujin");

  const [tab, setTab] = useState<"manhwa" | "doujin">("manhwa");

  const active = tab === "manhwa" ? manhwa : doujin;

  return (
    <WorkspaceShell
      title="Dashboard Owner"
      subtitle="Seluruh data manhwa dan doujin yang dikumpulkan staff."
    >
      {/* Statistik sementara menggunakan total data dari API */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Proyek manhwa" value={manhwa.meta.total} />
        <Stat label="Total chapter" value={0} />
        <Stat label="Proyek doujin" value={doujin.meta.total} />
        <Stat label="Total halaman" value={0} />
      </div>

      <Panel
        title="Data proyek"
        description={`${active.meta.total.toLocaleString("id-ID")} proyek tercatat`}
        action={
          <div
            role="tablist"
            className="flex gap-1 rounded-lg bg-primary-foreground/15 p-1"
          >
            {(["manhwa", "doujin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-primary-foreground/50",
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-primary-foreground hover:bg-primary-foreground/10",
                )}
              >
                {t === "manhwa" ? "Manhwa" : "Doujin"}
              </button>
            ))}
          </div>
        }
      >
        {active.status === "error" ? (
          <p className="px-5 py-12 text-center text-sm text-destructive">
            Gagal memuat data. Muat ulang halaman ini.
          </p>
        ) : tab === "manhwa" ? (
          <DataTable
            columns={manhwaColumns}
            rows={manhwa.items}
            query={manhwa.query}
            setQuery={manhwa.setQuery}
            meta={manhwa.meta}
            filters={manhwaFilters}
            enableSearch
            enableStaffSearch
            loading={manhwa.status === "loading"}
            empty="Tidak ada data manhwa yang cocok."
            renderAction={(row) => (
              <ButtonApprOwner
                title={row.title}
                uuid={""}
                userId={""}
                totalCh={0}
                lang={""}
                isNew={0}
                link={""}
                oktWm={0}
                insertedAt={""}
                approved={0}
              />
            )}
          />
        ) : (
          <DataTable
            columns={doujinColumns}
            rows={doujin.items}
            query={doujin.query}
            setQuery={doujin.setQuery}
            meta={doujin.meta}
            filters={doujinFilters}
            enableSearch
            enableStaffSearch
            loading={doujin.status === "loading"}
            empty="Tidak ada data doujin yang cocok."
            renderAction={(row) => (
              <button
                type="button"
                onClick={() => {
                  console.log("Detail doujin:", row);
                }}
                className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition hover:bg-muted"
              >
                <Eye className="size-3.5" />
                Detail
              </button>
            )}
          />
        )}
      </Panel>
    </WorkspaceShell>
  );
}