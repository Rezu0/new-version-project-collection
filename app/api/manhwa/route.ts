import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authorize } from "@/lib/guard";
import { recalcSaldo } from "@/lib/saldo-calc";
import { findStaffIds, staffByDisplayId } from "@/lib/staff";
import { Manhwa } from "@/models/Manhwa";
import type { ManhwaEntry } from "@/lib/types";

const LANGS = ["eng", "kor", "chn", "spa"];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Staff manhwa: data miliknya + saldo. Owner: semua data + nama staff.
export async function GET(req: NextRequest) {
  const auth = await authorize(req, ["manhwa", "owner"]);
  if ("error" in auth) return auth.error;

  await connectDB();

  const params = req.nextUrl.searchParams;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 10));

  const q = params.get("q")?.trim() ?? "";
  const staffSearch = params.get("staff")?.trim() ?? "";
  const lang = params.get("lang") ?? "";
  const status = params.get("status") ?? "";
  const isNew = params.get("isNew") ?? "";
  const oktWm = params.get("oktWm") ?? "";

  const allowedSorts = [
    "insertedAt",
    "title",
    "lang",
    "totalCh",
    "isNew",
    "oktWm",
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

  if (lang && ["eng", "kor", "chn", "spa"].includes(lang)) {
    filter.lang = lang;
  }

  if (status === "approved") filter.approved = 1;
  if (status === "pending") filter.approved = 0;

  if (isNew === "1") filter.isNew = 1;
  if (isNew === "0") filter.isNew = 0;

  if (oktWm === "2") filter.oktWm = 2;
  if (oktWm === "1") filter.oktWm = 1;

  // Pencarian staff hanya boleh digunakan oleh Owner.
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

  const total = await Manhwa.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const items = await Manhwa.find(filter)
    .sort({ [sortBy]: sortOrder, uuid: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean<ManhwaEntry[]>();

  let result: ManhwaEntry[] = items;

  if (isOwner) {
    const staff = await staffByDisplayId(items.map((item) => item.userId));

    result = items.map((item) => ({
      ...item,
      staff: staff[item.userId],
    }));
  }

  let saldo: number | undefined;

  if (!isOwner) {
    saldo = await recalcSaldo(auth.user.displayId, "manhwa");
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
  const auth = await authorize(req, ["manhwa"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const link = String(body?.link ?? "").trim();
  const totalCh = Number(body?.totalCh);
  const lang = String(body?.lang ?? "");
  const isNew = body?.isNew === true ? 1 : 0;
  // oktWm == 2 artinya watermark dihapus (hanya berlaku untuk kor/chn).
  const oktWm = body?.clearWm === true && (lang === "kor" || lang === "chn") ? 2 : 1;

  const errors: Record<string, string> = {};
  if (title.length < 1 || title.length > 200) errors.title = "Judul wajib diisi (maks. 200 karakter).";
  if (!/^https?:\/\/\S+$/i.test(link)) errors.link = "Isi link yang diawali http:// atau https://.";
  if (!Number.isInteger(totalCh) || totalCh < 1 || totalCh > 9999) {
    errors.totalCh = "Isi jumlah chapter (angka bulat, minimal 1).";
  }
  if (!LANGS.includes(lang)) errors.lang = "Pilih bahasa.";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ fieldErrors: errors }, { status: 400 });
  }

  await connectDB();
  const userId = auth.user.displayId;
  const item = {
    uuid: randomUUID(),
    userId,
    title,
    totalCh,
    lang,
    isNew,
    link,
    oktWm,
    insertedAt: new Date().toISOString(),
    approved: 0,
  };
  // Lewat driver langsung karena `isNew` tidak boleh ada di schema Mongoose.
  await Manhwa.collection.insertOne({ ...item });

  const saldo = await recalcSaldo(userId, "manhwa");
  return NextResponse.json({ item, saldo }, { status: 201 });
}
