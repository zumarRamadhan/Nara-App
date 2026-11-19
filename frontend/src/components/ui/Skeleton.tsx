import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--surface-muted)] rounded-[var(--radius-panel)]",
        className
      )}
      {...props}
    />
  );
}
