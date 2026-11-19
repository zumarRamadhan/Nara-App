export type SentimentType = "positive" | "neutral" | "negative";

export type AnalysisStatus = "Selesai" | "Diproses" | "Gagal" | "Antre";

export type SourceType = "Instagram" | "File";

export interface InstagramAccount {
  id: string;
  username: string;
  isDarkTheme?: boolean;
  postCount: number;
  tokenExpiry: string;
  status: "Aktif" | "Perlu hubungkan ulang";
}

export interface PostOverview {
  id: string;
  caption: string;
  thumbnail: string;
  commentCount: number;
  positivePercent: number;
  status: AnalysisStatus;
  source: SourceType;
}

export interface AnalysisSummary {
  id: string;
  shortcode: string;
  postCaption: string;
  postThumbnail: string;
  commentCount: number;
  status: AnalysisStatus;
  date: string;
  source: SourceType;
}

export interface TrendDataPoint {
  period: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface CommentItem {
  id: string;
  username: string;
  text: string;
  sentiment: SentimentType;
  score: number; // 0 - 1
  date: string;
  correctedSentiment?: SentimentType;
  likeCount?: number;
  postTitle?: string;
}

export interface TopicItem {
  id: string;
  name: string;
  frequency: number;
  dominantSentiment: SentimentType;
  positiveRatio: number;
  neutralRatio: number;
  negativeRatio: number;
}

export interface AnalysisDetail {
  id: string;
  shortcode: string;
  username: string;
  postCaption: string;
  postUrl?: string;
  postedDate: string;
  totalComments: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  avgConfidence: number;
  source: SourceType;
  fileName?: string;
  isSimulated?: boolean;
  trend: TrendDataPoint[];
  topics: TopicItem[];
  wordCloud: { text: string; weight: number; sentiment: SentimentType }[];
  comments: CommentItem[];
}
