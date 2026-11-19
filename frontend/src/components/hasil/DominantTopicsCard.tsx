import React from "react";
import { Card } from "../ui/Card";
import { TopicItem } from "@/types";
import { formatNumberId } from "@/lib/utils";

interface DominantTopicsCardProps {
  topics: TopicItem[];
  title?: string;
  subtitle?: string;
}

export function DominantTopicsCard({
  topics,
  title = "Topik Dominan Komentar",
  subtitle = "Isu dan topik yang paling banyak dibahas audiens",
}: DominantTopicsCardProps) {
  const getSentimentChip = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--success-bg)] text-[var(--success)]">
            Dominan Positif
          </span>
        );
      case "negative":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--danger-bg)] text-[var(--danger)]">
            Dominan Negatif
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface-muted)] text-[var(--ink-soft)] border border-[var(--line)]">
            Dominan Netral
          </span>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-[var(--ink)]">
            {title}
          </h3>
          <p className="text-xs text-[var(--ink-soft)]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 my-auto">
        {topics.map((topic) => (
          <div key={topic.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--ink)] truncate max-w-[200px]">
                {topic.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ink-soft)] text-[11px]">
                  {formatNumberId(topic.frequency)} respon
                </span>
                {getSentimentChip(topic.dominantSentiment)}
              </div>
            </div>

            {/* Bar Tipis Progres Pembagian Sentimen per Topik */}
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden flex border border-[var(--line)]">
              <div
                style={{ width: `${topic.positiveRatio}%` }}
                className="h-full bg-[var(--ink)]"
                title={`Positif: ${topic.positiveRatio}%`}
              />
              <div
                style={{ width: `${topic.neutralRatio}%` }}
                className="h-full bg-[#D9D9D6]"
                title={`Netral: ${topic.neutralRatio}%`}
              />
              <div
                style={{ width: `${topic.negativeRatio}%` }}
                className="h-full hatch-accent"
                title={`Negatif: ${topic.negativeRatio}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
