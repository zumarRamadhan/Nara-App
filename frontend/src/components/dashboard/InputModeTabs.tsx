"use client";

import React, { useState } from "react";
import { LinkInput } from "@/components/ui/LinkInput";
import { FileDropzoneCompact } from "./FileDropzoneCompact";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputModeTabs() {
  const [activeTab, setActiveTab] = useState<"instagram" | "file">("instagram");

  return (
    <div className="flex flex-col items-start md:items-end gap-2.5 w-full max-w-[480px]">
      {/* Pengalih Dua Tab Pil */}
      <div className="inline-flex items-center bg-[var(--surface)] border border-[var(--line)] rounded-full p-1 gap-1 text-xs select-none shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("instagram")}
          className={cn(
            "h-7 px-3 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer",
            activeTab === "instagram"
              ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
          )}
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Tautan Instagram</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={cn(
            "h-7 px-3 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer",
            activeTab === "file"
              ? "bg-[var(--ink)] text-[var(--surface)] shadow-xs"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
          )}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Impor file</span>
        </button>
      </div>

      {/* Konten Tab Terpilih */}
      <div className="w-full">
        {activeTab === "instagram" ? (
          <LinkInput />
        ) : (
          <FileDropzoneCompact />
        )}
      </div>
    </div>
  );
}
