import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authorize } from "@/lib/guard";
import { recalcSaldo } from "@/lib/saldo-calc";
import { findStaffIds, staffByDisplayId } from "@/lib/staff";
import { Doujin } from "@/models/Doujin";
import type { DoujinEntry } from "@/lib/types";

const LANGS = ["eng", "jp"];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Staff doujin: data miliknya + saldo. Owner: semua data + nama staff.
export async function GET(req: NextRequest) {
  const auth = await authorize(req, ["doujin", "owner"]);
  if ("error" in auth) return auth.error;

  await connectDB();

  const params = req.nextUrl.searchParams;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 10));

  const q = params.get("q")?.trim() ?? "";
  const staffSearch = params.get("staff")?.trim() ?? "";
  const lang = params.get("lang") ?? "";
  const status = params.get("status") ?? "";

  const allowedSorts = [
    "insertedAt",
    "title",
    "lang",
    "totalPage",
    "approved",
  ];

  const requestedSort = params.get("sortBy") ?? "insertedAt";
  const sortBy = allowedSorts.includes(requestedSort)
    ? requestedSort
    : "insertedAt";

  const sortOrder = params.get("sortOrder") === "asc" ? 1 : -1;

  const filter: Record<string, unknown> = {};

  const isOwner = auth.workspace === "owner";

  if (!isOwner) {
    filter.userId = auth.user.displayId;
  }

  if (q) {
    filter.title = { $regex: escapeRegex(q), $options: "i" };
  }

  if (lang && ["eng", "jp"].includes(lang)) {
    filter.lang = lang;
  }

  if (status === "approved") filter.approved = 1;
  if (status === "pending") filter.approved = 0;

  if (isOwner && staffSearch) {
    const staffIds = await findStaffIds(staffSearch);

    if (staffIds.length === 0) {
      return NextResponse.json({
        items: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          isOwner,
        },
      });
    }

    filter.userId = { $in: staffIds };
  }

  const total = await Doujin.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const items = await Doujin.find(filter)
    .sort({ [sortBy]: sortOrder, uuid: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean<DoujinEntry[]>();

  let result: DoujinEntry[] = items;

  if (isOwner) {
    const staff = await staffByDisplayId(items.map((item) => item.userId));

    result = items.map((item) => ({
      ...item,
      staff: staff[item.userId],
    }));
  }

  let saldo: number | undefined;

  if (!isOwner) {
    saldo = await recalcSaldo(auth.user.displayId, "doujin");
  }

  return NextResponse.json({
    items: result,
    ...(saldo !== undefined ? { saldo } : {}),
    meta: {
      page,
      limit,
      total,
      totalPages,
      isOwner,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorize(req, ["doujin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const link = String(body?.link ?? "").trim();
  const totalPage = Number(body?.totalPage);
  const lang = String(body?.lang ?? "");

  const errors: Record<string, string> = {};
  if (title.length < 1 || title.length > 200) errors.title = "Judul wajib diisi (maks. 200 karakter).";
  if (!/^https?:\/\/\S+$/i.test(link)) errors.link = "Isi link yang diawali http:// atau https://.";
  if (!Number.isInteger(totalPage) || totalPage < 1 || totalPage > 9999) {
    errors.totalPage = "Isi jumlah halaman (angka bulat, minimal 1).";
  }
  if (!LANGS.includes(lang)) errors.lang = "Pilih bahasa.";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ fieldErrors: errors }, { status: 400 });
  }

  await connectDB();
  const userId = auth.user.displayId;
  const created = await Doujin.create({
    uuid: randomUUID(),
    userId,
    title,
    totalPage,
    lang,
    link,
    insertedAt: new Date().toISOString(),
    approved: 0,
  });

  const saldo = await recalcSaldo(userId, "doujin");
  return NextResponse.json({ item: created.toObject(), saldo }, { status: 201 });
}