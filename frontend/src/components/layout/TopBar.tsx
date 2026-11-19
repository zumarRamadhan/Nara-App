"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, ChevronDown, Sparkles, LogOut } from "lucide-react";
import { useLogout } from "@/lib/hooks/useLogout";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Ringkasan", href: "/" },
  { label: "Analisis", href: "/" },
  { label: "Postingan", href: "#postingan" },
  { label: "Bandingkan", href: "#bandingkan" },
  { label: "Akun", href: "/hubungkan" },
  { label: "Laporan", href: "#laporan" },
];

export function TopBar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const [hasUnreadNotice] = useState(true);

  // Data sesi pengguna dari server
  const [user, setUser] = useState<{ name: string; email: string }>({
    name: "Zumar",
    email: "zumarramadhan@gmail.com",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="w-full flex items-center justify-between gap-3 mb-6 flex-wrap lg:flex-nowrap">
      {/* 1. Pil Logo Kiri */}
      <div className="flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-full px-4 py-2 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-xs group-hover:opacity-90 transition-opacity">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <span className="text-base font-medium tracking-tight text-[var(--ink)]">
            Nara
          </span>
        </Link>
      </div>

      {/* 2. Pil Navigasi Tengah (Hidden di < 1024px) */}
      <nav
        aria-label="Navigasi Utama"
        className="hidden lg:flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-full p-1.5 gap-1.5 shadow-2xs"
      >
        {NAV_ITEMS.map((item, idx) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" && idx === 0
              : item.href === "/hubungkan"
              ? pathname === "/hubungkan"
              : false;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "h-9 px-4 rounded-full text-sm font-medium flex items-center justify-center transition-all",
                isActive
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. Kanan: Pil Ikon & Pil Profil */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Pil Ikon Aksi */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-full px-3 py-1.5 gap-3 text-[var(--ink-soft)]">
          <button
            type="button"
            className="p-1 rounded-full hover:text-[var(--ink)] transition-colors focus-visible:outline-2"
            aria-label="Cari"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-[var(--line)]" />

          <button
            type="button"
            className="p-1 rounded-full hover:text-[var(--ink)] transition-colors relative focus-visible:outline-2"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotice && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent)] ring-1 ring-[var(--surface)]" />
            )}
          </button>

          <div className="w-[1px] h-4 bg-[var(--line)]" />

          <button
            type="button"
            className="p-1 rounded-full hover:text-[var(--ink)] transition-colors focus-visible:outline-2"
            aria-label="Bantuan dan Panduan"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Pil Profil Dinamis dari Sesi */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Menu profil"
            className="flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-full pl-1.5 pr-3 py-1 gap-2.5 select-none hover:border-[var(--ink-faint)] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#FF7A45,#EE5A2A)] text-white flex items-center justify-center font-medium text-xs border border-white/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-medium text-[var(--ink)] leading-tight">
                {user.name}
              </span>
              <span className="text-[11px] text-[var(--ink-soft)] leading-tight max-w-[120px] truncate">
                {user.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
          </button>

          {/* Dropdown Keluar Profil */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-lg p-2 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                <span className="text-xs font-medium text-[var(--ink)] block truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-[var(--ink-soft)] block truncate">
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-xl transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>{isLoggingOut ? "Keluar…" : "Keluar dari Akun"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
