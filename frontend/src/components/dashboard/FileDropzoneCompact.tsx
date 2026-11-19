"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Download, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FileDropzoneCompact() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      router.push("/impor");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      router.push("/impor");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[480px]">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => router.push("/impor")}
        className={cn(
          "w-full h-12 px-4 rounded-full bg-[var(--surface)] border border-dashed flex items-center justify-between gap-3 cursor-pointer transition-all text-xs group",
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]"
            : "border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--surface-muted)]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Pilih file CSV atau XLSX"
        />

        <div className="flex items-center gap-2.5 truncate">
          <div className="w-7 h-7 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink-soft)] group-hover:text-[var(--accent)] transition-colors shrink-0">
            <UploadCloud className="w-4 h-4" />
          </div>
          <span className="text-[var(--ink)] font-normal truncate">
            Seret file CSV / XLSX ke sini, atau <strong className="font-medium text-[var(--ink)] underline">pilih file</strong>
          </span>
        </div>

        <a
          href="/templates/nara-template.csv"
          download="nara-template.csv"
          onClick={(e) => e.stopPropagation()}
          className="h-8 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-row-selected)] transition-colors flex items-center gap-1.5 shrink-0 text-[11px] font-medium"
          title="Unduh template CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Unduh template</span>
        </a>
      </div>

      {/* Catatan Kecil */}
      <div className="flex items-center gap-1.5 px-3 text-[11px] text-[var(--ink-faint)]">
        <FileText className="w-3 h-3 shrink-0" />
        <span>Gunakan data yang Anda miliki atau berhak Anda olah.</span>
      </div>
    </div>
  );
}
