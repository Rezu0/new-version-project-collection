// TODO: pindahkan angka-angka ini ke MongoDB supaya bisa diubah dari dashboard admin.
const MANHWA = {
  newKor: 30000,
  newEng: 20000,
  newSpa: 25000,
  kor: 25000,
  eng: 15000,
  spa: 20000,
  clear: 5000, // tambahan per chapter kalau watermark dihapus (oktWm == 2), khusus kor/chn
};

const DOUJIN = { eng: 1000, jp: 1500 };

// Number() dipakai karena data lama bisa tersimpan sebagai string ("1").
export function manhwaAmount(lang: string, totalCh: number, isNew: unknown, oktWm: unknown) {
  const ch = Number(totalCh);
  const baru = Number(isNew) === 1;
  const clear = Number(oktWm) === 2;

  switch (lang) {
    case "eng":
      return (baru ? MANHWA.newEng : MANHWA.eng) * ch;
    case "spa":
      return (baru ? MANHWA.newSpa : MANHWA.spa) * ch;
    case "kor":
    case "chn":
      return ((baru ? MANHWA.newKor : MANHWA.kor) + (clear ? MANHWA.clear : 0)) * ch;
    default:
      return 0; // bahasa tidak dikenal: jangan sampai jadi undefined/NaN
  }
}

export function doujinAmount(lang: string, totalPage: number) {
  const pages = Number(totalPage);
  if (lang === "eng") return DOUJIN.eng * pages;
  if (lang === "jp") return DOUJIN.jp * pages;
  return 0;
}