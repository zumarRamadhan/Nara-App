"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, MoreHorizontal, ArrowUpRight, RefreshCw, Download, Trash2, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";
import { mockRecentAnalyses } from "@/lib/mock";
import { SourceChip } from "../ui/SourceChip";
import { formatNumberId } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export function RecentAnalysesTable() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(["ANL_000076"]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredAnalyses = mockRecentAnalyses.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.postCaption.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAnalyses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAnalyses.map((a) => a.id));
    }
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Hindari navigasi jika mengklik checkbox atau tombol menu
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) return;
    router.push(`/hasil/${id}`);
  };

  return (
    <Card className="flex flex-col">
      {/* Baris Judul & Aksi Pencarian / Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-medium text-[var(--ink)]">
            Analisis terbaru
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            Daftar riwayat analisis postingan Instagram
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Input Cari */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--ink-faint)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari analisis..."
              aria-label="Cari analisis"
              className="w-full sm:w-44 h-9 pl-8 pr-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-2 focus:outline-[var(--ink)]"
            />
          </div>

          {/* Tombol Filter */}
          <button
            type="button"
            className="h-9 px-3.5 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs font-medium text-[var(--ink)] flex items-center gap-1.5 hover:bg-[var(--surface-row-selected)] transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Kontainer Tabel */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--surface-muted)] text-[var(--ink-soft)] font-medium h-10 border-b border-[var(--line)]">
              <th className="w-10 px-3 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  aria-label="Pilih semua baris"
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                    selectedIds.length === filteredAnalyses.length && filteredAnalyses.length > 0
                      ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--surface)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  }`}
                >
                  {selectedIds.length === filteredAnalyses.length && filteredAnalyses.length > 0 && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </button>
              </th>
              <th className="px-3 py-2 font-medium">ID Analisis</th>
              <th className="px-3 py-2 font-medium">Postingan / Berkas</th>
              <th className="px-3 py-2 font-medium">Sumber</th>
              <th className="px-3 py-2 font-medium">Komentar</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Tanggal</th>
              <th className="w-10 px-3 py-2 text-center font-medium">⋯</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filteredAnalyses.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[var(--ink-soft)]">
                  Tidak ada analisis yang sesuai pencarian.
                </td>
              </tr>
            ) : (
              filteredAnalyses.map((row) => {
                const isSelected = selectedIds.includes(row.id);

                return (
                  <tr
                    key={row.id}
                    onClick={(e) => handleRowClick(row.id, e)}
                    className={`h-11 transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-[var(--surface-row-selected)]"
                        : "hover:bg-[var(--surface-muted)]/70"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(row.id);
                        }}
                        aria-label={`Pilih baris ${row.id}`}
                        className={`w-4 h-4 rounded-[4px] border mx-auto flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--surface)]"
                            : "border-[var(--line)] bg-[var(--surface)]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>

                    {/* ID Analisis */}
                    <td className="px-3 py-2 font-mono font-medium text-[var(--ink)]">
                      {row.id}
                    </td>

                    {/* Postingan */}
                    <td className="px-3 py-2 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-xs shrink-0 border border-[var(--line)]">
                          {row.postThumbnail}
                        </span>
                        <span className="truncate font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                          {row.postCaption}
                        </span>
                      </div>
                    </td>

                    {/* Sumber */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <SourceChip source={row.source} size="sm" />
                    </td>

                    {/* Komentar */}
                    <td className="px-3 py-2 font-medium text-[var(--ink)]">
                      {formatNumberId(row.commentCount)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <StatusDot status={row.status} />
                    </td>

                    {/* Tanggal */}
                    <td className="px-3 py-2 text-[var(--ink-soft)] whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Menu Aksi ⋯ */}
                    <td className="px-3 py-2 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === row.id ? null : row.id);
                        }}
                        aria-label={`Opsi untuk ${row.id}`}
                        className="p-1 rounded-full text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Popover */}
                      {activeMenuId === row.id && (
                        <div
                          className="absolute right-3 top-9 z-30 w-44 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg p-1.5 flex flex-col gap-1 text-left animate-in fade-in zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/hasil/${row.id}`}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                            <span>Lihat hasil analisis</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Analisis ulang ${row.id} dimulai`, "info");
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors text-left"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                            <span>Analisis ulang</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Mengunduh laporan ${row.id}`, "info");
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors text-left"
                          >
                            <Download className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                            <span>Unduh laporan PDF</span>
                          </button>
                          <div className="w-full h-[1px] bg-[var(--line)] my-0.5" />
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Analisis ${row.id} dihapus`, "error");
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus riwayat</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
