import { TrendDataPoint } from "@/types";

export const mockMonthlyTrends: TrendDataPoint[] = [
  { period: "Jul", positive: 1250, neutral: 520, negative: 380 },
  { period: "Agu", positive: 1480, neutral: 610, negative: 410 },
  { period: "Sep", positive: 1820, neutral: 740, negative: 320 },
  { period: "Okt", positive: 2100, neutral: 890, negative: 450 },
  { period: "Nov", positive: 2450, neutral: 980, negative: 290 },
  { period: "Des", positive: 2890, neutral: 1040, negative: 310 },
];

export const mockWeeklyTrends: TrendDataPoint[] = [
  { period: "Mgg 1", positive: 580, neutral: 210, negative: 85 },
  { period: "Mgg 2", positive: 640, neutral: 240, negative: 70 },
  { period: "Mgg 3", positive: 720, neutral: 290, negative: 65 },
  { period: "Mgg 4", positive: 810, neutral: 310, negative: 90 },
];
