import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to max
  max: number;
  className?: string;
  fillClassName?: string;
}

export function ProgressBar({ value, max, className, fillClassName }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("w-full h-2.5 rounded-full overflow-hidden hatch-muted relative bg-[var(--line)]", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300 bg-[var(--accent)]", fillClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
