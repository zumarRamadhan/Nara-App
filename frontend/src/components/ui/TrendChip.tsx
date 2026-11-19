import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendChipProps {
  direction?: "up" | "down";
  value: string | number;
  isGood?: boolean;
  onHighlight?: boolean;
  className?: string;
}

export function TrendChip({
  direction = "up",
  value,
  isGood = true,
  onHighlight = false,
  className,
}: TrendChipProps) {
  const Icon = direction === "up" ? ArrowUpRight : ArrowDownRight;

  if (onHighlight) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/25 text-white backdrop-blur-xs",
          className
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{value}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium",
        isGood
          ? "bg-[var(--success-bg)] text-[var(--success)]"
          : "bg-[var(--danger-bg)] text-[var(--danger)]",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{value}</span>
    </span>
  );
}
