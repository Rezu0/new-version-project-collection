import { connectDB } from "./db";
import { doujinAmount, manhwaAmount } from "./rates";
import { Saldo } from "@/models/Saldo";
import { Manhwa } from "@/models/Manhwa";
import { Doujin } from "@/models/Doujin";
import type { DoujinEntry, ManhwaEntry } from "./types";

// Sama seperti calculateProject di kode lama: jumlahkan semua proyek setelah
// penarikan terakhir (lastWithdraw), lalu simpan hasilnya ke saldo.amount.
export async function recalcSaldo(userId: string, workspace: "manhwa" | "doujin") {
  await connectDB();
  const saldo = await Saldo.findOne({ userId }).lean();
  const since = saldo?.lastWithdraw ?? "";

  let total = 0;
  if (workspace === "manhwa") {
    const items = await Manhwa.find({ userId, insertedAt: { $gt: since } }).lean<ManhwaEntry[]>();
    total = items.reduce(
      (sum, i) => sum + manhwaAmount(i.lang, i.totalCh, i.isNew, i.oktWm),
      0,
    );
  } else {
    const items = await Doujin.find({ userId, insertedAt: { $gt: since } }).lean<DoujinEntry[]>();
    total = items.reduce((sum, i) => sum + doujinAmount(i.lang, i.totalPage), 0);
  }

  await Saldo.updateOne({ userId }, { $set: { amount: total } });
  return total;
}