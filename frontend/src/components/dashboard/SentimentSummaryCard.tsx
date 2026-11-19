"use client";

import React, { useState } from "react";
import { Link as LinkIcon, GitCompare, ChevronDown, MoreVertical } from "lucide-react";
import { Card, CardPanel } from "../ui/Card";
import { Button } from "../ui/Button";
import { TrendChip } from "../ui/TrendChip";
import { StatusDot } from "../ui/StatusDot";
import { SourceChip } from "../ui/SourceChip";
import { mockRecentPostsOverview } from "@/lib/mock";
import { formatNumberId } from "@/lib/utils";
import Link from "next/link";

export function SentimentSummaryCard() {
  const [period, setPeriod] = useState("30 hari");

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Bagian Atas: Label & Periode */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-normal text-[var(--ink-soft)]">
            Total komentar dianalisis
          </span>
          <button
            type="button"
            onClick={() => setPeriod(period === "30 hari" ? "7 hari" : "30 hari")}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--surface-row-selected)] transition-colors cursor-pointer"
          >
            <span>{period}</span>
            <ChevronDown className="w-3 h-3 text-[var(--ink-soft)]" />
          </button>
        </div>

        {/* Angka Besar & Delta */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-medium tracking-tight text-[var(--ink)]">
            12.480
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
            <TrendChip value="↑ 5%" direction="up" isGood={true} />
            <span>dari bulan lalu</span>
          </div>
        </div>

        {/* 2 Tombol Aksi */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a href="#link-input">
            <Button variant="primary" className="w-full text-xs sm:text-sm">
              <LinkIcon className="w-4 h-4 shrink-0" />
              <span>Analisis baru</span>
            </Button>
          </a>

          <Link href="#bandingkan">
            <Button variant="secondary" className="w-full text-xs sm:text-sm">
              <GitCompare className="w-4 h-4 shrink-0" />
              <span>Bandingkan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Panel Dalam Abu: Postingan Terbaru */}
      <CardPanel className="mt-auto">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-soft)] mb-2.5">
          <span>Postingan terbaru</span>
          <span className="text-[11px] text-[var(--ink-faint)]">Total 6 postingan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {mockRecentPostsOverview.map((post) => (
            <div
              key={post.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-2.5 flex flex-col justify-between shadow-2xs hover:border-[var(--ink-faint)] transition-colors"
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-xs shrink-0">
                  {post.thumbnail}
                </div>
                <span className="text-[11px] font-medium text-[var(--ink)] truncate max-w-[80px]">
                  {post.caption}
                </span>
                <button
                  type="button"
                  aria-label="Opsi postingan"
                  className="text-[var(--ink-faint)] hover:text-[var(--ink)]"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="text-xs font-medium text-[var(--ink)]">
                  {formatNumberId(post.commentCount)} <span className="text-[10px] text-[var(--ink-soft)] font-normal">komentar</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-[var(--success)] font-medium">Positif {post.positivePercent}%</span>
                  <div className="flex items-center gap-1">
                    <SourceChip source={post.source} size="sm" />
                    <StatusDot status={post.status} showText={false} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardPanel>
    </Card>
  );
}
