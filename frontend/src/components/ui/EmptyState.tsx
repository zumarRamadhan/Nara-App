import React from "react";
import { MessageSquareDashed } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title = "Belum ada analisis",
  description = "Tempel tautan postingan Instagram di atas untuk memulai analisis sentimen komentar.",
  actionText,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-panel)] border border-dashed border-[var(--line)] bg-[var(--surface-muted)]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center mb-3 text-[var(--ink-soft)] border border-[var(--line)]">
        <MessageSquareDashed className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-[var(--ink)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--ink-soft)] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button size="sm" variant="primary">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
}
