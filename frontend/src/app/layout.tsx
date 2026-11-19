import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AnalysisProvider } from "@/context/AnalysisContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nara – Analisis Sentimen Komentar Instagram",
  description:
    "Aplikasi analisis sentimen komentar Instagram lewat tautan postingan untuk bisnis dan kreator.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nara-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full font-sans antialiased selection:bg-[var(--accent)] selection:text-white">
        <ThemeProvider>
          <ToastProvider>
            <AnalysisProvider>{children}</AnalysisProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
