"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardPanel } from "../ui/Card";
import { mockMonthlyTrends, mockWeeklyTrends } from "@/lib/mock";
import { formatNumberId } from "@/lib/utils";

interface TooltipPayload {
  value: number;
  name: string;
  fill: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3 shadow-md text-xs select-none min-w-[130px]">
        <div className="font-medium text-[var(--ink)] mb-2 border-b border-[var(--line)] pb-1">
          Periode: {label}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ink)] shrink-0" />
              Positif:
            </span>
            <span className="font-medium text-[var(--ink)]">
              {formatNumberId(payload.find((p) => p.dataKey === "positive")?.value || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D9D9D6] shrink-0" />
              Netral:
            </span>
            <span className="font-medium text-[var(--ink)]">
              {formatNumberId(payload.find((p) => p.dataKey === "neutral")?.value || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
              <span className="w-2.5 h-2.5 rounded-xs hatch-accent shrink-0 border border-black/10" />
              Negatif:
            </span>
            <span className="font-medium text-[var(--ink)]">
              {formatNumberId(payload.find((p) => p.dataKey === "negative")?.value || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function SentimentTrendChart() {
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly">("monthly");
  const data = timeframe === "monthly" ? mockMonthlyTrends : mockWeeklyTrends;

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Header Kartu */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-medium text-[var(--ink)]">Tren sentimen</h3>
          <p className="text-xs text-[var(--ink-soft)]">
            Lihat perubahan sentimen komentar dari waktu ke waktu
          </p>
        </div>

        {/* Toggle Bulanan / Mingguan */}
        <div className="flex items-center bg-[var(--surface-muted)] border border-[var(--line)] rounded-full p-1 text-xs">
          <button
            type="button"
            onClick={() => setTimeframe("monthly")}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              timeframe === "monthly"
                ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("weekly")}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              timeframe === "weekly"
                ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            Mingguan
          </button>
        </div>
      </div>

      {/* Panel Dalam Berisi Grafik */}
      <CardPanel className="mt-2">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-medium text-[var(--ink)]">
            {timeframe === "monthly" ? "Sentimen per bulan" : "Sentimen per minggu"}
          </span>

          {/* Legenda Sesuai design.md Bagian 5.3 & 7.1 */}
          <div className="flex items-center gap-4 text-xs font-normal">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ink)]" />
              <span className="text-[var(--ink-soft)]">Positif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D9D9D6]" />
              <span className="text-[var(--ink-soft)]">Netral</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs hatch-accent border border-black/10" />
              <span className="text-[var(--ink-soft)]">Negatif</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-52 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barSize={24}
            >
              {/* SVG Pattern Definitions for Hatching */}
              <defs>
                <pattern
                  id="hatch-accent"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="#EE5A2A" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="#F7845C"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--line)"
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--ink-faint)", fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--surface-row-selected)", opacity: 0.5 }}
              />

              {/* Batang bertumpuk: Positif (bawah), Netral (tengah), Negatif (atas) */}
              <Bar
                dataKey="positive"
                stackId="sentiment"
                fill="var(--ink)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="neutral"
                stackId="sentiment"
                fill="#D9D9D6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="negative"
                stackId="sentiment"
                fill="url(#hatch-accent)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardPanel>
    </Card>
  );
}
