import React from "react";
import { AnalysisStatus } from "@/types";
import { cn } from "@/lib/utils";

export interface StatusDotProps {
  status: AnalysisStatus;
  className?: string;
  showText?: boolean;
}

export function StatusDot({ status, className, showText = true }: StatusDotProps) {
  const statusConfig = {
    Selesai: "bg-[var(--success)]",
    Diproses: "bg-[var(--warning)]",
    Gagal: "bg-[var(--danger)]",
    Antre: "bg-[var(--ink-faint)]",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-medium text-[var(--ink)]", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig[status])} />
      {showText && <span>{status}</span>}
    </div>
  );
}
