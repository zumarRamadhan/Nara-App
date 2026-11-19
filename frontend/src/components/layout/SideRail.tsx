"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  LayoutGrid,
  Clock,
  MessageSquare,
  FileText,
  Users,
  Layers,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLogout } from "@/lib/hooks/useLogout";
import { cn } from "@/lib/utils";

interface RailItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  exact?: boolean;
}

const RAIL_NAV: RailItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/", exact: true },
  { icon: Clock, label: "Riwayat Analisis", href: "#riwayat" },
  { icon: MessageSquare, label: "Daftar Komentar", href: "/hasil/ANL_000076" },
  { icon: FileText, label: "Dokumen & Laporan", href: "#laporan" },
  { icon: Users, label: "Akun Terhubung", href: "/hubungkan" },
  { icon: Layers, label: "Bandingkan Postingan", href: "#bandingkan" },
  { icon: Settings, label: "Pengaturan", href: "#pengaturan" },
];

export function SideRail() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { logout, isLoggingOut } = useLogout();

  return (
    <aside
      aria-label="Sidebar Menu"
      className="hidden md:flex flex-col items-center gap-4 shrink-0 select-none"
    >
      {/* 1. Pil Pengalih Tema (Matahari / Bulan) */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-full p-1 flex flex-col items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Ganti tema"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-[var(--ink)] text-[var(--surface)] dark:bg-transparent dark:text-[var(--ink-faint)] dark:hover:text-[var(--ink)] cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Ganti tema"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all text-[var(--ink-faint)] hover:text-[var(--ink)] dark:bg-[var(--ink)] dark:text-[var(--surface)] cursor-pointer"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Pil Navigasi Ikon Utama */}
      <nav
        aria-label="Navigasi Ikon Cepat"
        className="bg-[var(--surface)] border border-[var(--line)] rounded-full py-4 px-1.5 flex flex-col items-center gap-5 shadow-2xs"
      >
        {RAIL_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all group relative",
                isActive
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
              )}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </Link>
          );
        })}
      </nav>

      {/* 3. Pil Bawah: Bantuan & Keluar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-full p-1.5 flex flex-col items-center gap-3 mt-auto shadow-2xs">
        <button
          type="button"
          aria-label="Pusat Bantuan"
          title="Pusat Bantuan"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          aria-label={isLoggingOut ? "Keluar…" : "Keluar dari Akun"}
          title={isLoggingOut ? "Keluar…" : "Keluar dari Akun"}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
