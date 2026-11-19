import React from "react";
import { Card } from "../ui/Card";
import { SentimentType } from "@/types";

interface WordItem {
  text: string;
  weight: number;
  sentiment: SentimentType;
}

interface WordCloudCardProps {
  words: WordItem[];
}

export function WordCloudCard({ words }: WordCloudCardProps) {
  const getWordColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case "positive":
        return "text-[var(--ink)] hover:text-[var(--success)]";
      case "negative":
        return "text-[var(--accent)] hover:text-[var(--danger)] font-medium";
      default:
        return "text-[var(--ink-soft)] hover:text-[var(--ink)]";
    }
  };

  const getFontSize = (weight: number) => {
    if (weight >= 90) return "text-xl sm:text-2xl font-semibold";
    if (weight >= 75) return "text-base sm:text-lg font-medium";
    if (weight >= 60) return "text-sm font-normal";
    return "text-xs font-normal opacity-75";
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-[var(--ink)]">
            Awan Kata Kunci (Word Cloud)
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            Istilah dan ekspresi yang paling sering diutarakan komentator
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-4 rounded-[var(--radius-panel)] bg-[var(--surface-muted)] border border-[var(--line)] my-auto min-h-[160px]">
        {words.map((item, index) => (
          <span
            key={index}
            className={`transition-transform hover:scale-110 cursor-default select-none ${getFontSize(
              item.weight
            )} ${getWordColor(item.sentiment)}`}
            title={`Bobot: ${item.weight} | Sentimen: ${item.sentiment}`}
          >
            {item.text}
          </span>
        ))}
      </div>
    </Card>
  );
}
