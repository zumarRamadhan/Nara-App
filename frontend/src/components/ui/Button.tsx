"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "icon" | "accent";
  size?: "default" | "sm" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "rounded-full bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 active:scale-[0.98]",
      secondary:
        "rounded-full bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-row-selected)] active:scale-[0.98]",
      tertiary:
        "rounded-full bg-[var(--surface-muted)] text-[var(--ink)] hover:bg-[var(--surface-row-selected)] text-[13px] h-8 px-3 gap-1.5",
      accent:
        "rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-light)] active:scale-[0.98]",
      icon:
        "rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-muted)]",
    };

    const sizeStyles = {
      default: variant === "tertiary" ? "" : "h-11 px-5 text-sm gap-2",
      sm: "h-8 px-3 text-xs gap-1.5",
      icon: "w-9 h-9 sm:w-10 sm:h-10 p-0 shrink-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
