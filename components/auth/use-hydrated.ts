import { useSyncExternalStore } from "react";

// false saat render di server, true setelah halaman hidup di browser.
// Tombol submit dikunci sampai true, supaya form tidak terkirim sebagai
// form HTML biasa (password bisa ikut ke URL) sebelum JavaScript siap.
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}