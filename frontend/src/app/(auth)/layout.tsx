import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-page)] text-[var(--ink)] flex items-center justify-center p-4 sm:p-6 transition-colors">
      {children}
    </div>
  );
}
