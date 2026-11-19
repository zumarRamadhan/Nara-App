import React from "react";
import { InstagramIcon } from "./InstagramIcon";
import { FileSpreadsheet } from "lucide-react";
import { SourceType } from "@/types";
import { cn } from "@/lib/utils";

export interface SourceChipProps {
  source: SourceType;
  className?: string;
  size?: "sm" | "default";
}

export function SourceChip({ source, className, size = "default" }: SourceChipProps) {
  const isInstagram = source === "Instagram";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        isInstagram
          ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
          : "bg-[var(--surface-muted)] text-[var(--ink-soft)] border border-[var(--line)]",
        className
      )}
    >
      {isInstagram ? (
        <InstagramIcon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      ) : (
        <FileSpreadsheet className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5 text-[var(--ink-soft)]"} />
      )}
      <span>{source}</span>
    </span>
  );
}
