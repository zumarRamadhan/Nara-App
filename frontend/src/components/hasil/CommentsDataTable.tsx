"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Check, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Card } from "../ui/Card";
import { CommentItem, SentimentType } from "@/types";
import { useToast } from "@/context/ToastContext";
import { formatNumberId } from "@/lib/utils";

interface CommentsDataTableProps {
  initialComments: CommentItem[];
  onCommentsChange?: (updated: CommentItem[]) => void;
}

type SortOption = "latest" | "oldest" | "most_likes";

export function CommentsDataTable({ initialComments, onCommentsChange }: CommentsDataTableProps) {
  const { showToast } = useToast();
  const [correctedMap, setCorrectedMap] = useState<Record<string, SentimentType>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | SentimentType>("all");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Apply user corrections to the comments list
  const comments = useMemo(() => {
    return initialComments.map((c) => {
      const corrected = correctedMap[c.id];
      if (corrected) {
        return { ...c, sentiment: corrected, correctedSentiment: corrected };
      }
      return c;
    });
  }, [initialComments, correctedMap]);

  const handleCorrectSentiment = (commentId: string, newSentiment: SentimentType) => {
    const updatedMap = { ...correctedMap, [commentId]: newSentiment };
    setCorrectedMap(updatedMap);

    if (onCommentsChange) {
      const updatedComments = initialComments.map((c) => {
        const corr = updatedMap[c.id];
        if (corr) {
          return { ...c, sentiment: corr, correctedSentiment: corr };
        }
        return c;
      });
      onCommentsChange(updatedComments);
    }

    setActiveDropdownId(null);
    showToast(`Label komentar berhasil diubah ke ${newSentiment}`, "success");
  };

  // 1. Filter
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesSearch =
        comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment =
        sentimentFilter === "all" || comment.sentiment === sentimentFilter;

      return matchesSearch && matchesSentiment;
    });
  }, [comments, searchQuery, sentimentFilter]);

  // 2. Sort
  const sortedComments = useMemo(() => {
    return [...filteredComments].sort((a, b) => {
      if (sortOption === "most_likes") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      if (sortOption === "oldest") {
        const timeA = new Date(a.date.replace(/\//g, "-")).getTime();
        const timeB = new Date(b.date.replace(/\//g, "-")).getTime();
        if (!isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
        return a.date.localeCompare(b.date);
      }
      // default: latest
      const timeA = new Date(a.date.replace(/\//g, "-")).getTime();
      const timeB = new Date(b.date.replace(/\//g, "-")).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;
      return b.date.localeCompare(a.date);
    });
  }, [filteredComments, sortOption]);

  // 3. Paginate
  const totalItems = sortedComments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRows = sortedComments.slice(startIndex, endIndex);

  const getSentimentChip = (sentiment: SentimentType, isCorrected?: boolean) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--success-bg)] text-[var(--success)]">
            Positif
            {isCorrected && <span className="text-[10px] opacity-75">(Koreksi)</span>}
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--danger-bg)] text-[var(--danger)]">
            Negatif
            {isCorrected && <span className="text-[10px] opacity-75">(Koreksi)</span>}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--ink-soft)] border border-[var(--line)]">
            Netral
            {isCorrected && <span className="text-[10px] opacity-75">(Koreksi)</span>}
          </span>
        );
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      {/* Baris Judul & Filter / Pencarian */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium text-[var(--ink)]">
            Daftar Komentar Postingan
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            Tinjau seluruh komentar, skor keyakinan model, dan lakukan koreksi label
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Sentimen Tabs */}
          <div className="flex items-center bg-[var(--surface-muted)] border border-[var(--line)] rounded-full p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setSentimentFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                sentimentFilter === "all"
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => {
                setSentimentFilter("positive");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                sentimentFilter === "positive"
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Positif
            </button>
            <button
              type="button"
              onClick={() => {
                setSentimentFilter("neutral");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                sentimentFilter === "neutral"
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Netral
            </button>
            <button
              type="button"
              onClick={() => {
                setSentimentFilter("negative");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                sentimentFilter === "negative"
                  ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              Negatif
            </button>
          </div>

          {/* Pengurutan (Sorting) */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              aria-label="Urutkan komentar"
              className="bg-transparent border-none text-xs text-[var(--ink)] focus:outline-hidden cursor-pointer"
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_likes">Suka Terbanyak</option>
            </select>
          </div>

          {/* Input Cari */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--ink-faint)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kata atau user..."
              aria-label="Cari kata di komentar"
              className="w-full sm:w-44 h-9 pl-8 pr-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-2 focus:outline-[var(--ink)]"
            />
          </div>
        </div>
      </div>

      {/* Kontainer Tabel Komentar */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--surface-muted)] text-[var(--ink-soft)] font-medium h-10 border-b border-[var(--line)]">
              <th className="px-3 py-2 font-medium">Pengguna</th>
              <th className="px-3 py-2 font-medium">Isi Komentar</th>
              <th className="px-3 py-2 font-medium">Sentimen</th>
              <th className="px-3 py-2 font-medium">Keyakinan</th>
              <th className="px-3 py-2 font-medium">Suka</th>
              <th className="px-3 py-2 font-medium">Waktu</th>
              <th className="px-3 py-2 font-medium text-center">Koreksi Label</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[var(--ink-soft)]">
                  Tidak ada komentar yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              currentRows.map((comment) => (
                <tr
                  key={comment.id}
                  className="h-12 hover:bg-[var(--surface-muted)]/60 transition-colors"
                >
                  {/* Pengguna */}
                  <td className="px-3 py-2 font-medium text-[var(--ink)] whitespace-nowrap">
                    @{comment.username}
                  </td>

                  {/* Isi Komentar */}
                  <td className="px-3 py-2 text-[var(--ink)] max-w-[340px]">
                    <p className="line-clamp-2 leading-relaxed">{comment.text}</p>
                    {comment.postTitle && (
                      <span className="text-[10px] text-[var(--ink-faint)] truncate block mt-0.5">
                        Post: {comment.postTitle}
                      </span>
                    )}
                  </td>

                  {/* Sentimen */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getSentimentChip(comment.sentiment, !!comment.correctedSentiment)}
                  </td>

                  {/* Keyakinan */}
                  <td className="px-3 py-2 font-mono text-[var(--ink-soft)] whitespace-nowrap">
                    {Math.round(comment.score * 100)}%
                  </td>

                  {/* Like Count */}
                  <td className="px-3 py-2 font-mono text-[var(--ink-soft)] whitespace-nowrap">
                    {formatNumberId(comment.likeCount || 0)}
                  </td>

                  {/* Tanggal */}
                  <td className="px-3 py-2 text-[var(--ink-soft)] whitespace-nowrap">
                    {comment.date}
                  </td>

                  {/* Aksi Koreksi Label (Dropdown Mini) */}
                  <td className="px-3 py-2 text-center relative whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdownId(
                          activeDropdownId === comment.id ? null : comment.id
                        )
                      }
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] hover:bg-[var(--surface-row-selected)] transition-colors"
                    >
                      <span>Ubah</span>
                      <ChevronDown className="w-3 h-3 text-[var(--ink-soft)]" />
                    </button>

                    {/* Dropdown Menu Koreksi */}
                    {activeDropdownId === comment.id && (
                      <div className="absolute right-3 top-9 z-30 w-32 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg p-1 flex flex-col gap-1 text-left animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => handleCorrectSentiment(comment.id, "positive")}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--success)] hover:bg-[var(--success-bg)] transition-colors"
                        >
                          <span>Positif</span>
                          {comment.sentiment === "positive" && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCorrectSentiment(comment.id, "neutral")}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
                        >
                          <span>Netral</span>
                          {comment.sentiment === "neutral" && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCorrectSentiment(comment.id, "negative")}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
                        >
                          <span>Negatif</span>
                          {comment.sentiment === "negative" && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Baris Navigasi Pagination & Info Baris */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-[var(--ink-soft)]">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan {totalItems === 0 ? 0 : `${startIndex + 1}–${endIndex}`} dari {formatNumberId(totalItems)}
          </span>

          <span className="text-[var(--line)]">|</span>

          {/* Opsi Jumlah Baris per Halaman */}
          <div className="flex items-center gap-1.5">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Pilih jumlah baris per halaman"
              className="h-7 px-2 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Tombol Navigasi Halaman */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-[var(--ink-faint)] mr-1">
            Halaman {safeCurrentPage} dari {totalPages}
          </span>

          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Halaman sebelumnya"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Halaman berikutnya"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
