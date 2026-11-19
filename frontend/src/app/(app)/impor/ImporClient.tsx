"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useAnalysis } from "@/context/AnalysisContext";
import { buildAnalysisFromImportedRows, ColumnMapping } from "@/lib/sentimentAnalyzer";
import { cn, formatNumberId } from "@/lib/utils";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_ROWS = 10000;

const DUMMY_XLSX_ROWS: Record<string, string>[] = [
  { comment_text: "Kopi susunya mantap bgt gula arennya pas!", timestamp: "2026-11-17 10:15", username: "dinda_safira99", like_count: "14", post_title: "Promo Akhir Pekan", label: "positif" },
  { comment_text: "Pelayanan ramah bgt baristanya cepat", timestamp: "2026-11-17 11:02", username: "clarissa.andrea", like_count: "8", post_title: "Promo Akhir Pekan", label: "positif" },
  { comment_text: "Antrean cabang Tebet tolong ditambah kasirnya", timestamp: "2026-11-17 10:22", username: "budi_santoso_id", like_count: "5", post_title: "Promo Akhir Pekan", label: "negatif" },
  { comment_text: "Worth it bgt promo buy 1 get 1!", timestamp: "2026-11-17 12:05", username: "gilang_ramadhan", like_count: "23", post_title: "Promo Akhir Pekan", label: "positif" },
  { comment_text: "Sayang cup matcha oat milknya habis pas siang", timestamp: "2026-11-17 11:18", username: "reza_aditya_pratama", like_count: "11", post_title: "Promo Akhir Pekan", label: "negatif" },
];

export function ImporClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setImportedAnalysis } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "xlsx" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Data parsing
  const [headers, setHeaders] = useState<string[]>([]);
  const [fullRows, setFullRows] = useState<Record<string, string>[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);

  // Mapping state
  const [mapping, setMapping] = useState<ColumnMapping>({
    comment_text: "",
    timestamp: "",
    username: "",
    like_count: "",
    post_title: "",
    label: "",
  });

  const autoMapColumns = (detectedHeaders: string[]): ColumnMapping => {
    const newMapping: ColumnMapping = {
      comment_text: "",
      timestamp: "",
      username: "",
      like_count: "",
      post_title: "",
      label: "",
    };

    detectedHeaders.forEach((h) => {
      const lower = h.toLowerCase().trim();
      if (!newMapping.comment_text && (lower.includes("comment") || lower.includes("teks") || lower.includes("komentar") || lower.includes("text"))) {
        newMapping.comment_text = h;
      } else if (!newMapping.timestamp && (lower.includes("time") || lower.includes("tanggal") || lower.includes("waktu") || lower.includes("date") || lower.includes("created"))) {
        newMapping.timestamp = h;
      } else if (!newMapping.username && (lower.includes("user") || lower.includes("pengguna") || lower.includes("author") || lower.includes("nama"))) {
        newMapping.username = h;
      } else if (!newMapping.like_count && (lower.includes("like") || lower.includes("suka"))) {
        newMapping.like_count = h;
      } else if (!newMapping.post_title && (lower.includes("title") || lower.includes("judul") || lower.includes("post") || lower.includes("caption"))) {
        newMapping.post_title = h;
      } else if (!newMapping.label && (lower === "label" || lower.includes("sentiment") || lower.includes("sentimen"))) {
        newMapping.label = h;
      }
    });

    return newMapping;
  };

  const processFile = (uploadedFile: File) => {
    setErrorMessage("");
    const ext = uploadedFile.name.split(".").pop()?.toLowerCase();

    // 1. Validasi ekstensi
    if (ext !== "csv" && ext !== "xlsx") {
      setErrorMessage("Format berkas tidak didukung. Harap unggah file berformat .CSV atau .XLSX.");
      setFile(null);
      return;
    }

    // 2. Validasi ukuran file
    if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (uploadedFile.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`Ukuran berkas melebihi batas 5 MB (ukuran berkas: ${sizeMb} MB). Harap perkecil berkas.`);
      setFile(null);
      return;
    }

    setFile(uploadedFile);
    setFileType(ext as "csv" | "xlsx");

    if (ext === "csv") {
      // Parsing CSV via PapaParse seluruh baris
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, string>[];
          const detectedHeaders = results.meta.fields || [];

          if (rows.length === 0 || detectedHeaders.length === 0) {
            setErrorMessage("Berkas CSV kosong atau tidak memiliki baris tajuk (header).");
            setFile(null);
            return;
          }

          if (rows.length > MAX_ROWS) {
            setErrorMessage(`Jumlah baris data melebihi batas 10.000 baris (total terdeteksi: ${formatNumberId(rows.length)} baris). Harap bagi berkas menjadi lebih kecil.`);
            setFile(null);
            return;
          }

          setFullRows(rows);
          setTotalRowCount(rows.length);
          setHeaders(detectedHeaders);
          setPreviewRows(rows.slice(0, 10));
          setMapping(autoMapColumns(detectedHeaders));
          showToast(`Berhasil membaca ${formatNumberId(rows.length)} baris data CSV`, "success");
        },
        error: () => {
          setErrorMessage("Gagal membaca berkas CSV. Pastikan struktur berkas valid dan coba lagi.");
          setFile(null);
        },
      });
    } else {
      // XLSX mode (pratinjau dummy di Fase 1)
      const detectedHeaders = ["comment_text", "timestamp", "username", "like_count", "post_title", "label"];
      setHeaders(detectedHeaders);
      setFullRows(DUMMY_XLSX_ROWS);
      setTotalRowCount(DUMMY_XLSX_ROWS.length);
      setPreviewRows(DUMMY_XLSX_ROWS);
      setMapping(autoMapColumns(detectedHeaders));
      showToast("Berkas XLSX terdeteksi (Simulasi pratinjau Fase 1)", "info");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const resetFile = () => {
    setFile(null);
    setFileType(null);
    setHeaders([]);
    setFullRows([]);
    setPreviewRows([]);
    setTotalRowCount(0);
    setErrorMessage("");
    setMapping({
      comment_text: "",
      timestamp: "",
      username: "",
      like_count: "",
      post_title: "",
      label: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = () => {
    if (!mapping.comment_text || isProcessing) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Bangun analisis sentimen dari dataset penuh
      const analysis = buildAnalysisFromImportedRows({
        fileName: file?.name || "data.csv",
        rows: fullRows,
        mapping,
      });

      // Simpan ke React Context & sessionStorage
      setImportedAnalysis(analysis);

      setIsProcessing(false);
      showToast("Analisis berkas selesai", "success");
      router.push("/hasil/ANL_000077");
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      {/* Navigasi Kembali & Judul */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Ringkasan</span>
          </Link>
          <span className="text-[var(--line)]">/</span>
          <span className="text-xs text-[var(--ink-soft)]">Impor Berkas</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[30px] font-medium tracking-tight text-[var(--ink)] leading-tight">
              Impor Berkas Komentar
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1">
              Unggah file CSV atau XLSX untuk menganalisis sentimen komentar audiens
            </p>
          </div>

          <a
            href="/templates/nara-template.csv"
            download="nara-template.csv"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors self-start sm:self-auto shrink-0"
          >
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span>Unduh Template CSV</span>
          </a>
        </div>
      </section>

      {/* Dropzone Utama */}
      {!file ? (
        <Card className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full max-w-xl p-8 sm:p-10 rounded-[var(--radius-panel)] border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
              isDragging
                ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]"
                : "border-[var(--line)] hover:border-[var(--ink)] bg-[var(--surface-muted)]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Pilih file berkas CSV atau XLSX"
            />

            <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                Seret file CSV atau XLSX ke sini, atau <span className="text-[var(--accent)] underline">pilih file</span>
              </p>
              <p className="text-xs text-[var(--ink-soft)] mt-1">
                Format yang didukung: .csv dan .xlsx (Maksimal 5 MB atau 10.000 baris)
              </p>
            </div>

            <span className="text-[11px] text-[var(--ink-faint)] mt-2">
              Gunakan data yang Anda miliki atau berhak Anda olah.
            </span>
          </div>

          {/* Pesan Galat Validasi Inline */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-full bg-[var(--danger-bg)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </Card>
      ) : (
        /* Status File Terpilih */
        <Card className="flex flex-col gap-6">
          {/* Card Info Berkas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[var(--radius-panel)] bg-[var(--surface-muted)] border border-[var(--line)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--ink)] truncate max-w-[260px] sm:max-w-md">
                    {file.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--ink)] text-[var(--surface)] uppercase">
                    {fileType}
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • {formatNumberId(totalRowCount)} baris terdeteksi
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={resetFile} className="self-start sm:self-center">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti Berkas</span>
            </Button>
          </div>

          {/* Banner Catatan untuk XLSX */}
          {fileType === "xlsx" && (
            <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)] flex items-start gap-2.5 text-xs text-[var(--ink-soft)]">
              <Info className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
              <p>
                <strong>Catatan:</strong> Pratinjau XLSX akan tersedia setelah backend aktif. Menampilkan simulasi struktur data.
              </p>
            </div>
          )}

          {/* 1. Pemetaan Kolom Data */}
          <div>
            <div className="mb-3">
              <h2 className="text-base font-medium text-[var(--ink)]">
                Pemetaan Kolom Data
              </h2>
              <p className="text-xs text-[var(--ink-soft)]">
                Pilih kolom dari berkas yang sesuai dengan atribut komentar
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Kolom Teks Komentar (Wajib) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Teks Komentar</span>
                  <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                    Wajib
                  </span>
                </label>
                <select
                  value={mapping.comment_text}
                  onChange={(e) => setMapping({ ...mapping, comment_text: e.target.value })}
                  aria-label="Pilih kolom teks komentar"
                  className={cn(
                    "w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)] transition-colors",
                    !mapping.comment_text ? "border-[var(--danger)]" : "border-[var(--line)]"
                  )}
                >
                  <option value="">-- Pilih Kolom Teks --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timestamp (Opsional) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Waktu / Tanggal</span>
                  <span className="text-[10px] text-[var(--ink-faint)]">Opsional</span>
                </label>
                <select
                  value={mapping.timestamp}
                  onChange={(e) => setMapping({ ...mapping, timestamp: e.target.value })}
                  aria-label="Pilih kolom waktu atau tanggal"
                  className="w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
                >
                  <option value="">-- Abaikan / Default --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Username (Opsional) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Nama Pengguna</span>
                  <span className="text-[10px] text-[var(--ink-faint)]">Opsional</span>
                </label>
                <select
                  value={mapping.username}
                  onChange={(e) => setMapping({ ...mapping, username: e.target.value })}
                  aria-label="Pilih kolom nama pengguna"
                  className="w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
                >
                  <option value="">-- Anonimkan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Like Count (Opsional) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Jumlah Suka (Likes)</span>
                  <span className="text-[10px] text-[var(--ink-faint)]">Opsional</span>
                </label>
                <select
                  value={mapping.like_count}
                  onChange={(e) => setMapping({ ...mapping, like_count: e.target.value })}
                  aria-label="Pilih kolom jumlah suka"
                  className="w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
                >
                  <option value="">-- Abaikan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Title (Opsional) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Judul / Topik Post</span>
                  <span className="text-[10px] text-[var(--ink-faint)]">Opsional</span>
                </label>
                <select
                  value={mapping.post_title}
                  onChange={(e) => setMapping({ ...mapping, post_title: e.target.value })}
                  aria-label="Pilih kolom judul atau caption"
                  className="w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
                >
                  <option value="">-- Gunakan Nama Berkas --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Label Sentimen (Opsional) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Label Sentimen</span>
                  <span className="text-[10px] text-[var(--ink-faint)]">Opsional</span>
                </label>
                <select
                  value={mapping.label || ""}
                  onChange={(e) => setMapping({ ...mapping, label: e.target.value })}
                  aria-label="Pilih kolom label sentimen"
                  className="w-full h-9 px-3 rounded-full bg-[var(--surface-muted)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
                >
                  <option value="">-- Simulasi Berbasis Kata Kunci --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!mapping.comment_text && (
              <p className="text-xs text-[var(--danger)] mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pilih kolom yang memuat teks komentar untuk mengaktifkan analisis.</span>
              </p>
            )}
          </div>

          {/* 2. Pratinjau Tabel 10 Baris Pertama */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-[var(--ink)]">
                Pratinjau Data (10 Baris Pertama)
              </h2>
              <span className="text-xs text-[var(--ink-soft)]">
                {totalRowCount > 0
                  ? `${formatNumberId(totalRowCount)} baris terbaca. Menampilkan ${Math.min(10, previewRows.length)} pertama.`
                  : "Menampilkan 0 baris"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--surface-muted)] text-[var(--ink-soft)] font-medium h-9 border-b border-[var(--line)]">
                    <th className="w-10 px-3 py-2 text-center">#</th>
                    {headers.map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-3 py-2 font-medium whitespace-nowrap",
                          mapping.comment_text === h && "text-[var(--accent)] font-semibold"
                        )}
                      >
                        {h}
                        {mapping.comment_text === h && " ★"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="h-10 hover:bg-[var(--surface-muted)]/50 transition-colors">
                      <td className="px-3 py-2 text-center text-[var(--ink-faint)] font-mono">
                        {idx + 1}
                      </td>
                      {headers.map((h) => (
                        <td
                          key={h}
                          className={cn(
                            "px-3 py-2 text-[var(--ink)] max-w-[280px] truncate",
                            mapping.comment_text === h && "font-medium"
                          )}
                        >
                          {row[h] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Baris Tombol Aksi */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            <Link href="/">
              <Button variant="secondary" size="default">
                Batal
              </Button>
            </Link>

            <Button
              variant="primary"
              size="default"
              disabled={!mapping.comment_text || isProcessing}
              onClick={handleAnalyze}
              className="px-8 gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Analisis…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mulai Analisis Sentimen</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
