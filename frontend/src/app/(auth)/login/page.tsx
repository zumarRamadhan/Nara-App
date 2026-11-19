"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Client validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Server error banner
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Tampilkan toast jika ada penanda logout dari sessionStorage
  useEffect(() => {
    try {
      const logoutFlag = sessionStorage.getItem("nara_logout_toast");
      if (logoutFlag) {
        sessionStorage.removeItem("nara_logout_toast");
        showToast("Anda telah keluar", "info");
      }
    } catch {
      // Abaikan error sessionStorage
    }
  }, [showToast]);

  // Validasi email
  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Email wajib diisi.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Format email tidak valid.";
    }
    return "";
  };

  // Validasi kata sandi
  const validatePassword = (val: string): string => {
    if (!val) {
      return "Kata sandi wajib diisi.";
    }
    if (val.length < 6) {
      return "Kata sandi minimal 6 karakter.";
    }
    return "";
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const errEmail = validateEmail(email);
    const errPass = validatePassword(password);

    setEmailError(errEmail);
    setPasswordError(errPass);

    if (errEmail) {
      emailInputRef.current?.focus();
      return;
    }
    if (errPass) {
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Email atau kata sandi salah.");
        setPassword("");
        passwordInputRef.current?.focus();
        setIsLoading(false);
        return;
      }

      // Login berhasil -> langsung ke dashboard
      router.push("/");
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan jaringan. Coba lagi beberapa saat.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-xs transition-colors">
      {/* Header Kartu: Logo Nara & Judul */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[var(--surface-muted)] border border-[var(--line)] rounded-full px-3.5 py-1.5 mb-4">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-sm font-medium tracking-tight text-[var(--ink)]">
            Nara
          </span>
        </div>

        <h1 className="text-2xl font-medium tracking-tight text-[var(--ink)] leading-snug">
          Masuk ke Nara
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1.5 max-w-xs leading-relaxed">
          Analisis sentimen komentar Instagram dengan mudah.
        </p>
      </div>

      {/* Banner Galat Server (401) */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3 rounded-2xl bg-[var(--danger-bg)] border border-[var(--danger)]/20 flex items-center gap-2.5 text-xs text-[var(--danger)] animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Autentikasi */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Kolom Email */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="email"
            className="text-xs font-medium text-[var(--ink)]"
          >
            Email
          </label>
          <div className="relative flex items-center w-full">
            <div className="absolute left-4 text-[var(--ink-faint)] pointer-events-none flex items-center">
              <Mail className="w-4 h-4" />
            </div>
            <input
              ref={emailInputRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              placeholder="nama@email.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              disabled={isLoading}
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-full bg-[var(--surface-muted)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] text-sm transition-all border",
                emailError
                  ? "border-[var(--danger)] focus:border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-[var(--line)] focus:border-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
              )}
            />
          </div>
          {emailError && (
            <span
              id="email-error"
              className="text-[12px] text-[var(--danger)] px-3 animate-in fade-in"
            >
              {emailError}
            </span>
          )}
        </div>

        {/* Kolom Kata Sandi */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="password"
            className="text-xs font-medium text-[var(--ink)]"
          >
            Kata sandi
          </label>
          <div className="relative flex items-center w-full">
            <div className="absolute left-4 text-[var(--ink-faint)] pointer-events-none flex items-center">
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={passwordInputRef}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              onBlur={handlePasswordBlur}
              placeholder="Minimal 6 karakter"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              disabled={isLoading}
              className={cn(
                "w-full h-12 pl-11 pr-12 rounded-full bg-[var(--surface-muted)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] text-sm transition-all border",
                passwordError
                  ? "border-[var(--danger)] focus:border-[var(--danger)] ring-1 ring-[var(--danger)]"
                  : "border-[var(--line)] focus:border-[var(--ink)] focus:outline-2 focus:outline-[var(--ink)]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3.5 p-1 text-[var(--ink-faint)] hover:text-[var(--ink)] rounded-full transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <span
              id="password-error"
              className="text-[12px] text-[var(--danger)] px-3 animate-in fade-in"
            >
              {passwordError}
            </span>
          )}
        </div>

        {/* Tombol Masuk Penuh Lebar */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 rounded-full bg-[var(--ink)] text-[var(--surface)] text-sm font-medium hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Memproses…</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>
    </div>
  );
}
