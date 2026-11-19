"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Unlink,
  RefreshCw,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockConnectedAccounts } from "@/lib/mock";
import { useToast } from "@/context/ToastContext";

export default function HubungkanAkunPage() {
  const { showToast } = useToast();

  const handleConnectClick = () => {
    showToast(
      "Integrasi OAuth resmi Meta akan aktif pada Fase 2 (Backend).",
      "info"
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-2">
      {/* Navigasi Kembali */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Kartu Utama: Hubungkan Akun Instagram Sesuai design.md 6.3 */}
      <Card className="flex flex-col items-center text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-muted)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] mb-4">
          <InstagramIcon className="w-7 h-7" />
        </div>

        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--ink)] mb-2">
          Hubungkan Akun Instagram
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)] max-w-md leading-relaxed mb-6">
          Hubungkan akun profesional (Business atau Creator) Anda untuk mengizinkan
          Nara membaca postingan dan komentar secara otomatis melalui API resmi Meta.
        </p>

        {/* Kotak Penjelasan Izin & Keamanan */}
        <div className="w-full max-w-md bg-[var(--surface-muted)] rounded-[var(--radius-panel)] border border-[var(--line)] p-4 text-left mb-6 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-[var(--ink)] block">
                Izin Minimum & Akses Terbatas
              </span>
              <span className="text-[var(--ink-soft)] leading-normal">
                Nara hanya meminta izin <code className="bg-[var(--surface)] px-1 py-0.5 rounded text-[11px]">instagram_business_basic</code> untuk membaca media dan komentar postingan Anda.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-[var(--ink)] block">
                Bukan Scraping Data
              </span>
              <span className="text-[var(--ink-soft)] leading-normal">
                Sepenuhnya mematuhi Meta Developer Policy. Akun Anda aman dari pemblokiran atau penalti.
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Utama Hubungkan Instagram (design.md 6.3: tombol belum fungsional) */}
        <Button
          variant="primary"
          onClick={handleConnectClick}
          className="h-12 px-8 text-sm gap-2 mb-4"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>Hubungkan Instagram</span>
        </Button>

        {/* Catatan Kecil */}
        <p className="text-[11px] text-[var(--ink-faint)] max-w-sm">
          * Hanya akun <strong>Business</strong> atau <strong>Creator</strong>. Nara tidak pernah meminta kata sandi Anda dan tidak dapat memposting atau mengirim DM atas nama akun Anda.
        </p>
      </Card>

      {/* Bagian Akun yang Terhubung Saat Ini */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium text-[var(--ink)]">
          Akun Terhubung Saat Ini
        </h2>

        <div className="flex flex-col gap-3">
          {mockConnectedAccounts.map((account) => (
            <Card
              key={account.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#FF7A45,#EE5A2A)] text-white flex items-center justify-center font-medium text-xs">
                  {account.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--ink)]">
                      @{account.username}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--success-bg)] text-[var(--success)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                      {account.status}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] mt-0.5">
                    Token berlaku sampai <strong>{account.tokenExpiry}</strong> • {account.postCount} postingan terdeteksi
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast(`Memperbarui token untuk @${account.username}`, "info")
                  }
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Perbarui Token</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    showToast(`Akun @${account.username} diputus (Simulasi)`, "error")
                  }
                  className="text-[var(--danger)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Putus Akun</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
