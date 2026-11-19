"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showToast } = useToast();

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Gagal logout");
      }

      // Catat penanda toast sebelum navigasi penuh
      try {
        sessionStorage.setItem("nara_logout_toast", "true");
      } catch {
        // Abaikan jika storage dinonaktifkan
      }

      // Navigasi penuh untuk membersihkan seluruh router cache client dan state React
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    } catch {
      setIsLoggingOut(false);
      showToast("Gagal keluar. Coba lagi.", "error");
    }
  };

  return { logout, isLoggingOut };
}
