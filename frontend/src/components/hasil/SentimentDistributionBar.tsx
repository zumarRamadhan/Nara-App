import React from "react";
import { formatNumberId, formatPercent } from "@/lib/utils";

interface SentimentDistributionBarProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export function SentimentDistributionBar({
  positive,
  neutral,
  negative,
  total,
}: SentimentDistributionBarProps) {
  const posPct = (positive / total) * 100;
  const neuPct = (neutral / total) * 100;
  const negPct = (negative / total) * 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--ink)]">Distribusi Sentimen</span>
        <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ink)]" />
            Positif {formatPercent(posPct)} ({formatNumberId(positive)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D9D9D6]" />
            Netral {formatPercent(neuPct)} ({formatNumberId(neutral)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs hatch-accent border border-black/10" />
            Negatif {formatPercent(negPct)} ({formatNumberId(negative)})
          </span>
        </div>
      </div>

      {/* Satu bar bertumpuk horizontal sesuai design.md 6.2 */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--line)]">
        <div
          style={{ width: `${posPct}%` }}
          className="h-full bg-[var(--ink)] transition-all"
          title={`Positif: ${formatPercent(posPct)}`}
        />
        <div
          style={{ width: `${neuPct}%` }}
          className="h-full bg-[#D9D9D6] transition-all"
          title={`Netral: ${formatPercent(neuPct)}`}
        />
        <div
          style={{ width: `${negPct}%` }}
          className="h-full hatch-accent transition-all"
          title={`Negatif: ${formatPercent(negPct)}`}
        />
      </div>
    </div>
  );
}
