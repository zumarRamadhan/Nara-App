"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessageSquare, Users, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLogout } from "@/lib/hooks/useLogout";
import { cn } from "@/lib/utils";

export function BottomTabBar() {
  const pathname = usePathname();
  const { toggleTheme } = useTheme();
  const { logout, isLoggingOut } = useLogout();

  const NAV = [
    { icon: LayoutGrid, label: "Beranda", href: "/" },
    { icon: MessageSquare, label: "Hasil", href: "/hasil/ANL_000076" },
    { icon: Users, label: "Akun", href: "/hubungkan" },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-[var(--surface)] border border-[var(--line)] rounded-full px-4 py-2 flex items-center justify-around shadow-lg backdrop-blur-md"
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 rounded-full transition-colors",
              isActive
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}

      {/* Quick theme toggle */}
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Ganti tema"
        className="flex flex-col items-center justify-center p-1.5 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
      >
        <Moon className="w-5 h-5 block dark:hidden" />
        <Sun className="w-5 h-5 hidden dark:block" />
        <span className="text-[10px] mt-0.5">Tema</span>
      </button>

      {/* Logout button */}
      <button
        onClick={logout}
        disabled={isLoggingOut}
        type="button"
        aria-label="Keluar"
        className="flex flex-col items-center justify-center p-1.5 text-[var(--ink-soft)] hover:text-[var(--danger)] cursor-pointer disabled:opacity-50"
      >
        {isLoggingOut ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5">{isLoggingOut ? "Keluar…" : "Keluar"}</span>
      </button>
    </nav>
  );
}
