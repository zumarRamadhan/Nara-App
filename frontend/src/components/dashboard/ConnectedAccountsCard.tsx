"use client";

import React from "react";
import Link from "next/link";
import { Plus, Radio, Sparkles, Wifi } from "lucide-react";
import { InstagramIcon } from "../ui/InstagramIcon";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { mockConnectedAccounts } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function ConnectedAccountsCard() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      {/* Header Kartu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink)] border border-[var(--line)]">
            <InstagramIcon className="w-4 h-4" />
          </div>
          <h3 className="text-base font-medium text-[var(--ink)]">
            Akun terhubung
          </h3>
        </div>

        <Link href="/hubungkan">
          <Button variant="tertiary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Hubungkan akun</span>
          </Button>
        </Link>
      </div>

      {/* Kontainer Dua Kartu Berdampingan (Horizontal scroll / cut-off effect) */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mr-4 pr-4">
        {mockConnectedAccounts.map((account) => {
          const isDark = account.isDarkTheme;

          return (
            <div
              key={account.id}
              className={cn(
                "min-w-[210px] sm:min-w-[230px] h-[126px] rounded-[18px] p-3.5 flex flex-col justify-between shrink-0 shadow-sm transition-transform hover:scale-[1.02]",
                isDark
                  ? "bg-[#181816] text-[#F5F5F3] border border-[#2B2B28] relative overflow-hidden"
                  : "bg-[linear-gradient(160deg,#FF7A45_0%,#EE5A2A_100%)] text-white"
              )}
            >
              {/* Subtle grid pattern background for dark card */}
              {isDark && (
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
              )}

              {/* Baris Atas Kartu: Chip Aktif & Ikon */}
              <div className="flex items-center justify-between relative z-10">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-xs",
                    account.status === "Aktif"
                      ? isDark
                        ? "bg-white/15 text-white"
                        : "bg-white/25 text-white"
                      : "bg-[var(--danger-bg)] text-[var(--danger)]"
                  )}
                >
                  <Radio className="w-2.5 h-2.5 text-[var(--success)] animate-pulse" />
                  <span>{account.status}</span>
                </span>

                <div className="text-white/80">
                  {isDark ? (
                    <Wifi className="w-4 h-4 rotate-90" />
                  ) : (
                    <Sparkles className="w-4 h-4 fill-white/80" />
                  )}
                </div>
              </div>

              {/* Username Akun */}
              <div className="relative z-10">
                <span className="text-[10px] opacity-75 block">Akun</span>
                <span className="text-sm font-medium tracking-tight">
                  @{account.username}
                </span>
              </div>

              {/* Baris Bawah: Token Berlaku & Jumlah Postingan */}
              <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/10 relative z-10">
                <div>
                  <span className="opacity-75">Token berlaku:</span>{" "}
                  <span className="font-medium">{account.tokenExpiry}</span>
                </div>
                <div>
                  <span className="font-medium">{account.postCount}</span> post
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
