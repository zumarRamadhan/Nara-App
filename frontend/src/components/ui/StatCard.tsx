import React from "react";
import { TrendChip } from "./TrendChip";
import { cn, formatNumberId } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trendValue?: string;
  trendDirection?: "up" | "down";
  isTrendGood?: boolean;
  trendLabel?: string;
  isHighlight?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trendValue,
  trendDirection = "up",
  isTrendGood = true,
  trendLabel = "bulan ini",
  isHighlight = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] p-4 flex flex-col justify-between transition-all min-h-[118px]",
        isHighlight
          ? "bg-[linear-gradient(160deg,#FF7A45_0%,#EE5A2A_100%)] text-white"
          : "bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--line)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs sm:text-[13px] font-normal",
            isHighlight ? "text-white/90" : "text-[var(--ink-soft)]"
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isHighlight ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)]"
          )}
        >
          {icon}
        </div>
      </div>

      <div className="my-1.5">
        <div className={cn("text-2xl sm:text-[26px] font-medium tracking-tight", isHighlight ? "text-white" : "text-[var(--ink)]")}>
          {formatNumberId(value)}
        </div>
      </div>

      {trendValue && (
        <div className="flex items-center gap-1.5 text-xs">
          <TrendChip
            value={trendValue}
            direction={trendDirection}
            isGood={isTrendGood}
            onHighlight={isHighlight}
          />
          <span
            className={cn(
              "text-[11px]",
              isHighlight ? "text-white/80" : "text-[var(--ink-soft)]"
            )}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
