"use client";

import React from "react";
import { MessageSquare, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { InputModeTabs } from "@/components/dashboard/InputModeTabs";
import { SentimentSummaryCard } from "@/components/dashboard/SentimentSummaryCard";
import { StatCard } from "@/components/ui/StatCard";
import { SentimentTrendChart } from "@/components/dashboard/SentimentTrendChart";
import { CorrectionProgressCard } from "@/components/dashboard/CorrectionProgressCard";
import { ConnectedAccountsCard } from "@/components/dashboard/ConnectedAccountsCard";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Baris Judul & Input Tempel Tautan (design.md 3.4 & 6.1) */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-medium tracking-tight text-[var(--ink)] leading-tight">
            Selamat pagi, Zumar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1">
            Berikut ringkasan sentimen komentar dari akun Instagram bisnis Anda
          </p>
        </div>

        {/* Kolom Tempel Tautan Postingan & Impor File */}
        <div id="link-input">
          <InputModeTabs />
        </div>
      </section>

      {/* Grid Dashboard Utama */}
      <div className="flex flex-col gap-4">
        {/* Baris Atas: 3 Kolom (Ringkasan Sentimen, Grid 2x2 Statistik, Tren Sentimen) */}
        <section
          aria-label="Metrik dan Tren Sentimen"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
        >
          {/* Kolom 1 (Kiri Atas): Ringkasan Sentimen (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <SentimentSummaryCard />
          </div>

          {/* Kolom 2 (Tengah Atas): Grid Statistik 2x2 (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            {/* Kiri Atas: Total Komentar (Sorotan Gradien Oranye) */}
            <StatCard
              label="Total komentar"
              value={12480}
              icon={<MessageSquare className="w-4 h-4 text-white" />}
              trendValue="↑ 5%"
              trendDirection="up"
              isTrendGood={true}
              trendLabel="bulan ini"
              isHighlight={true}
            />

            {/* Kanan Atas: Komentar Positif */}
            <StatCard
              label="Komentar positif"
              value={7738}
              icon={<ThumbsUp className="w-4 h-4 text-[var(--success)]" />}
              trendValue="↑ 8%"
              trendDirection="up"
              isTrendGood={true}
              trendLabel="bulan ini"
            />

            {/* Kiri Bawah: Komentar Netral */}
            <StatCard
              label="Komentar netral"
              value={3120}
              icon={<Minus className="w-4 h-4 text-[var(--ink-soft)]" />}
              trendValue="↓ 2%"
              trendDirection="down"
              isTrendGood={true}
              trendLabel="bulan ini"
            />

            {/* Kanan Bawah: Komentar Negatif (Penurunan negatif adalah tren baik -> isTrendGood: true) */}
            <StatCard
              label="Komentar negatif"
              value={1622}
              icon={<ThumbsDown className="w-4 h-4 text-[var(--danger)]" />}
              trendValue="↓ 4%"
              trendDirection="down"
              isTrendGood={true}
              trendLabel="bulan ini"
            />
          </div>

          {/* Kolom 3 (Kanan Atas): Tren Sentimen Grafik (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <SentimentTrendChart />
          </div>
        </section>

        {/* Baris Bawah: Kolom Kiri (Progres + Akun) dan Kolom Kanan (Tabel Analisis) */}
        <section
          aria-label="Riwayat dan Status Akun"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
        >
          {/* Kolom Kiri: Progres Koreksi Label + Akun Instagram Terhubung (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <CorrectionProgressCard />
            <ConnectedAccountsCard />
          </div>

          {/* Kolom Kanan: Tabel Analisis Terbaru (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <RecentAnalysesTable />
          </div>
        </section>
      </div>
    </div>
  );
}
