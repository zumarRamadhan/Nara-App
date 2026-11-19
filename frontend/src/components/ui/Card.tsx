import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4 sm:p-5 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardPanel({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-muted)] rounded-[var(--radius-panel)] p-3 sm:p-4 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
