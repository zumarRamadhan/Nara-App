import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-[var(--ink-faint)] pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-1 disabled:opacity-50",
            icon ? "pl-11" : "pl-4",
            rightElement ? "pr-14" : "pr-4",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 flex items-center">{rightElement}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
