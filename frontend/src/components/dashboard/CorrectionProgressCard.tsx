import React from "react";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { CheckCircle2 } from "lucide-react";

export function CorrectionProgressCard() {
  const correctedCount = 140;
  const totalDoubtful = 550;

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-[var(--ink)]">
          Progres koreksi label
        </h3>
        <div className="w-6 h-6 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--accent)] border border-[var(--line)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Progress Bar Oranye Solid + Sisa Berarsir Diagonal */}
      <div className="my-2">
        <ProgressBar value={correctedCount} max={totalDoubtful} />
      </div>

      {/* Label Keterangan di Bawah Bar */}
      <div className="flex items-center justify-between text-xs mt-1">
        <div>
          <span className="font-medium text-[var(--ink)]">{correctedCount} dikoreksi</span>{" "}
          <span className="text-[var(--ink-soft)] font-normal">dari</span>
        </div>
        <div className="font-medium text-[var(--ink-soft)]">
          {totalDoubtful} komentar terdeteksi ragu
        </div>
      </div>
    </Card>
  );
}
