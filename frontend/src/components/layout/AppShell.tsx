"use client";

import React, { Suspense } from "react";
import { TopBar } from "./TopBar";
import { SideRail } from "./SideRail";
import { BottomTabBar } from "./BottomTabBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-page)] text-[var(--ink)] p-2 sm:p-4 md:p-6 lg:p-8 flex justify-center transition-colors">
      {/* Cangkang Aplikasi (Shell Kontainer besar r28) */}
      <div className="w-full max-w-[1440px] bg-[var(--bg-shell)] rounded-[var(--radius-shell)] border border-[var(--line)] p-4 sm:p-5 md:p-6 flex flex-col shadow-2xs transition-colors">
        {/* Bilah Atas */}
        <Suspense fallback={<div className="h-14 w-full" />}>
          <TopBar />
        </Suspense>

        {/* Konten Utama + SideRail Kiri */}
        <div className="flex gap-4 sm:gap-6 flex-1 items-start">
          <Suspense fallback={<div className="w-10 h-64" />}>
            <SideRail />
          </Suspense>
          <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
        </div>

        {/* Tab Bar Bawah untuk Mobile */}
        <Suspense fallback={null}>
          <BottomTabBar />
        </Suspense>
      </div>
    </div>
  );
}
