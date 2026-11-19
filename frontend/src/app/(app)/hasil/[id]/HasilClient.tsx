"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Minus,
  ThumbsDown,
  AlertCircle,
  UploadCloud,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardPanel } from "@/components/ui/Card";
import { SentimentDistributionBar } from "@/components/hasil/SentimentDistributionBar";
import { DominantTopicsCard } from "@/components/hasil/DominantTopicsCard";
import { WordCloudCard } from "@/components/hasil/WordCloudCard";
import { CommentsDataTable } from "@/components/hasil/CommentsDataTable";
import { SourceChip } from "@/components/ui/SourceChip";
import { mockAnalysisDetail } from "@/lib/mock";
import { useToast } from "@/context/ToastContext";
import { useAnalysis } from "@/context/AnalysisContext";
import { CommentItem, AnalysisDetail } from "@/types";
import {
  calculateDailyTrend,
  calculateTopics,
  extractTopKeywords,
} from "@/lib/sentimentAnalyzer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface HasilClientProps {
  id: string;
}

export function HasilClient({ id }: HasilClientProps) {
  const { showToast } = useToast();
  const { importedAnalysis, isHydrated } = useAnalysis();

  const isFileImport = id === "ANL_000077" || id?.startsWith("FILE") || id?.startsWith("ANL_FILE");

  // Determine base data
  const baseData: AnalysisDetail | null = useMemo(() => {
    if (isFileImport) {
      return importedAnalysis;
    }
    return mockAnalysisDetail;
  }, [isFileImport, importedAnalysis]);

  // Local comments state to allow user corrections in table
  const [comments, setComments] = useState<CommentItem[]>(baseData?.comments || []);

  useEffect(() => {
    if (baseData?.comments) {
      setComments(baseData.comments);
    }
  }, [baseData]);

  // Dynamic calculations via useMemo
  const totalComments = comments.length;
  const positiveCount = useMemo(
    () => comments.filter((c) => c.sentiment === "positive").length,
    [comments]
  );
  const neutralCount = useMemo(
    () => comments.filter((c) => c.sentiment === "neutral").length,
    [comments]
  );
  const negativeCount = useMemo(
    () => comments.filter((c) => c.sentiment === "negative").length,
    [comments]
  );

  const positivePercent = totalComments > 0 ? Math.round((positiveCount / totalComments) * 100) : 0;
  const neutralPercent = totalComments > 0 ? Math.round((neutralCount / totalComments) * 100) : 0;
  const negativePercent = totalComments > 0 ? Math.round((negativeCount / totalComments) * 100) : 0;

  // Recalculate trend, topics, and word cloud dynamically
  const dynamicTrend = useMemo(() => {
    if (!baseData) return [];
    if (isFileImport) {
      return calculateDailyTrend(comments);
    }
    return baseData.trend;
  }, [isFileImport, comments, baseData]);

  const hasPostTitles = useMemo(() => {
    return comments.some((c) => c.postTitle && c.postTitle.trim() !== "");
  }, [comments]);

  const dynamicTopics = useMemo(() => {
    if (!baseData) return [];
    if (isFileImport) {
      return calculateTopics(comments);
    }
    return baseData.topics;
  }, [isFileImport, comments, baseData]);

  const dynamicWordCloud = useMemo(() => {
    if (!baseData) return [];
    if (isFileImport) {
      return extractTopKeywords(comments);
    }
    return baseData.wordCloud;
  }, [isFileImport, comments, baseData]);

  // Empty state if imported analysis is missing (e.g. refreshed in new session)
  if (isFileImport && isHydrated && !importedAnalysis) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto py-8">
        <section className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan</span>
          </Link>
        </section>

        <Card className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-medium text-[var(--ink)] mb-1">
            Data Analisis Tidak Ditemukan
          </h2>

          <p className="text-xs text-[var(--ink-soft)] mb-6 max-w-sm leading-relaxed">
            Data analisis tidak ditemukan. Unggah ulang file.
          </p>

          <Link href="/impor">
            <Button variant="primary">
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Ulang Berkas</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // If still hydrating on initial render
  if (isFileImport && !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = baseData || mockAnalysisDetail;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman: Tombol Kembali + Judul Caption + Aksi */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan</span>
          </Link>
          <span className="text-[var(--line)]">/</span>
          <span className="text-xs font-mono text-[var(--ink-soft)]">
            {id || data.id}
          </span>
          <span className="text-[var(--line)]">/</span>
          <SourceChip source={data.source} size="sm" />

          {/* Banner / Chip Simulasi Sentimen */}
          {data.isSimulated && (
            <>
              <span className="text-[var(--line)]">/</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-muted)] text-[var(--ink-soft)] border border-[var(--line)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span>Simulasi: sentimen belum dihitung model</span>
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ink)] leading-snug">
              {data.postCaption}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-soft)] mt-1.5">
              {data.source === "Instagram" ? (
                <>
                  <span className="font-medium text-[var(--ink)]">@{data.username}</span>
                  <span>•</span>
                  <span>Diposting: {data.postedDate}</span>
                  {data.postUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={data.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                      >
                        <span>Buka di Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-medium text-[var(--ink)]">Berkas: {data.fileName || "data.csv"}</span>
                  <span>•</span>
                  <span>Dianalisis: {data.postedDate}</span>
                </>
              )}
            </div>
          </div>

          {/* Tombol Unduh PDF & Analisis Ulang */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={() => showToast("Laporan PDF berhasil diunduh (Simulasi)", "info")}
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => showToast(data.source === "Instagram" ? "Memeriksa komentar baru lewat Instagram API..." : "Memproses ulang berkas...", "info")}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Analisis ulang</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Banner Peringatan Simulasi jika sentimen disimulasikan */}
      {data.isSimulated && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink-soft)]">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span>
            <strong className="text-[var(--ink)] font-medium">Simulasi: sentimen belum dihitung model.</strong> Komentar dianalisis sementara menggunakan pencocokan kata kunci bahasa Indonesia (model NLP aktif pada Fase 3).
          </span>
        </div>
      )}

      {/* 4 Kartu Statistik Ringkasan (Total, Positif, Netral, Negatif) */}
      <section
        aria-label="Statistik Sentimen Postingan"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <StatCard
          label="Total komentar"
          value={totalComments}
          icon={<MessageSquare className="w-4 h-4 text-white" />}
          trendValue="100%"
          trendDirection="up"
          trendLabel="dianalisis"
          isHighlight={true}
        />

        <StatCard
          label="Komentar positif"
          value={positiveCount}
          icon={<ThumbsUp className="w-4 h-4 text-[var(--success)]" />}
          trendValue={`${positivePercent}%`}
          trendDirection="up"
          isTrendGood={true}
          trendLabel="dari total"
        />

        <StatCard
          label="Komentar netral"
          value={neutralCount}
          icon={<Minus className="w-4 h-4 text-[var(--ink-soft)]" />}
          trendValue={`${neutralPercent}%`}
          trendDirection="down"
          isTrendGood={true}
          trendLabel="dari total"
        />

        <StatCard
          label="Komentar negatif"
          value={negativeCount}
          icon={<ThumbsDown className="w-4 h-4 text-[var(--danger)]" />}
          trendValue={`${negativePercent}%`}
          trendDirection="down"
          isTrendGood={true}
          trendLabel="dari total"
        />
      </section>

      {/* Bar Distribusi Sentimen Horizontal */}
      <Card>
        <SentimentDistributionBar
          positive={positiveCount}
          neutral={neutralCount}
          negative={negativeCount}
          total={totalComments}
        />
      </Card>

      {/* Baris Tengah: Tren Komentar per Waktu + Topik Dominan */}
      {dynamicTrend.length > 0 ? (
        <section
          aria-label="Tren Waktu dan Topik"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
        >
          {/* Kolom Kiri: Tren Komentar per Waktu (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <Card className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-medium text-[var(--ink)]">
                    Tren Komentar Sepanjang Waktu
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)]">
                    Lonjakan volume komentar dan pergeseran sentimen per tanggal
                  </p>
                </div>

                {/* Legenda */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ink)]" />
                    <span className="text-[var(--ink-soft)]">Positif</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#D9D9D6]" />
                    <span className="text-[var(--ink-soft)]">Netral</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs hatch-accent border border-black/10" />
                    <span className="text-[var(--ink-soft)]">Negatif</span>
                  </span>
                </div>
              </div>

              <CardPanel className="mt-2">
                <div className="w-full h-52 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dynamicTrend}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barSize={28}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--ink-faint)", fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="positive" stackId="t" fill="var(--ink)" />
                      <Bar dataKey="neutral" stackId="t" fill="#D9D9D6" />
                      <Bar dataKey="negative" stackId="t" fill="url(#hatch-accent)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardPanel>
            </Card>
          </div>

          {/* Kolom Kanan: Topik Dominan / Perbandingan per Post Title (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <DominantTopicsCard
              topics={dynamicTopics}
              title={hasPostTitles ? "Perbandingan per Judul Postingan" : "Topik Dominan Komentar"}
              subtitle={
                hasPostTitles
                  ? "Distribusi sentimen per judul postingan dalam berkas"
                  : "Isu dan topik yang paling banyak dibahas audiens"
              }
            />
          </div>
        </section>
      ) : (
        /* Jika timestamp tidak ada / tidak valid, grafik tren disembunyikan */
        <section aria-label="Topik Dominan Komentar">
          <DominantTopicsCard
            topics={dynamicTopics}
            title={hasPostTitles ? "Perbandingan per Judul Postingan" : "Topik Dominan Komentar"}
            subtitle={
              hasPostTitles
                ? "Distribusi sentimen per judul postingan dalam berkas"
                : "Isu dan topik yang paling banyak dibahas audiens"
            }
          />
        </section>
      )}

      {/* Word Cloud Card */}
      <section aria-label="Visualisasi Kata Kunci">
        <WordCloudCard words={dynamicWordCloud} />
      </section>

      {/* Tabel Komentar Detail */}
      <section aria-label="Tabel Komentar Postingan">
        <CommentsDataTable
          initialComments={comments}
          onCommentsChange={(updated) => setComments(updated)}
        />
      </section>
    </div>
  );
}
