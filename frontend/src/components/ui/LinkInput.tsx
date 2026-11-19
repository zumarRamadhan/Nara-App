"use client";

import React, { useState } from "react";
import { Link as LinkIcon, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export interface LinkInputProps {
  className?: string;
  onAnalyzed?: (id: string) => void;
}

export function LinkInput({ className }: LinkInputProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "unauthorized">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateUrl = (value: string) => {
    setUrl(value);
    const trimmed = value.trim();

    if (!trimmed) {
      setStatus("idle");
      setErrorMessage("");
      return;
    }

    // Cek demo khusus untuk kasus error akun tidak terhubung
    if (trimmed.includes("unauthorized") || trimmed.includes("bukan_milik_akun")) {
      setStatus("unauthorized");
      setErrorMessage(
        "Postingan ini bukan milik akun yang terhubung. Hubungkan akun pemilik postingan, lalu coba lagi."
      );
      return;
    }

    // Format validasi: instagram.com/p/... atau /reel/...
    const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/i;
    if (igRegex.test(trimmed)) {
      setStatus("valid");
      setErrorMessage("");
    } else {
      setStatus("invalid");
      setErrorMessage("Tautan tidak dikenali. Gunakan tautan postingan atau reel Instagram.");
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "valid" || isLoading) return;

    setIsLoading(true);

    // Simulasi pemrosesan 1.2 detik
    setTimeout(() => {
      setIsLoading(false);
      showToast("Analisis selesai", "success");
      // Navigasi ke halaman hasil ANL_000076
      router.push("/hasil/ANL_000076");
    }, 1200);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full max-w-[480px]", className)}>
      <form onSubmit={handleAnalyze} className="relative flex items-center w-full">
        <div className="absolute left-4 text-[var(--ink-faint)] pointer-events-none flex items-center">
          <LinkIcon className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={url}
          onChange={(e) => validateUrl(e.target.value)}
          placeholder="Tempel tautan postingan Instagram"
          aria-label="Tempel tautan postingan Instagram"
          disabled={isLoading}
          className={cn(
            "w-full h-12 pl-11 pr-32 rounded-full bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] text-sm transition-all border",
            status === "invalid" || status === "unauthorized"
              ? "border-[var(--danger)] focus:border-[var(--danger)] ring-1 ring-[var(--danger)]"
              : status === "valid"
              ? "border-[var(--success)] focus:border-[var(--success)]"
              : "border-[var(--line)] focus:border-[var(--ink)]"
          )}
        />

        {/* Valid Icon Status */}
        {status === "valid" && (
          <div className="absolute right-[112px] text-[var(--success)] flex items-center pointer-events-none">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Tombol Analisis Pil Hitam */}
        <button
          type="submit"
          disabled={status !== "valid" || isLoading}
          className="absolute right-1.5 h-9 px-4 rounded-full bg-[var(--ink)] text-[var(--surface)] text-xs font-medium hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Memproses…</span>
            </>
          ) : (
            <>
              <span>Analisis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Pesan Galat Inline */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--danger)] px-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
