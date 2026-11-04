export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const tanggal = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );

export const LANG_LABEL: Record<string, string> = {
  eng: "Inggris",
  kor: "Korea",
  chn: "China",
  spa: "Spanyol",
  jp: "Jepang",
};