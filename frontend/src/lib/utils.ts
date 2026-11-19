import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka gaya Indonesia (pemisah ribuan dengan titik)
 * Contoh: 12480 -> "12.480"
 */
export function formatNumberId(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Format persentase
 * Contoh: 62.5 -> "62%"
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format tanggal Indonesia sesuai spesifikasi design.md
 * Contoh: "17 Nov 2026 15.45"
 */
export function formatDateId(dateStrOrObj: string | Date): string {
  const date = typeof dateStrOrObj === "string" ? new Date(dateStrOrObj) : dateStrOrObj;
  const day = date.getDate();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year} ${hours}.${minutes}`;
}
