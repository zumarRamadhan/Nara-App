import { AnalysisDetail, CommentItem, SentimentType, TopicItem, TrendDataPoint } from "@/types";

export interface ColumnMapping {
  comment_text: string;
  timestamp: string;
  username: string;
  like_count: string;
  post_title: string;
  label?: string;
}

const POSITIVE_WORDS = new Set([
  "bagus", "suka", "enak", "mantap", "ramah", "keren", "juara", "worth", "worthit",
  "puas", "cepat", "rapi", "cinta", "love", "rekomendasi", "rekomen", "recommended",
  "terbaik", "mantul", "asik", "bersih", "wangi", "top", "fresh", "nikmat", "lezat",
  "senang", "gembira", "cantik", "manis", "halus", "berkilau", "adem", "terang", "empuk",
  "murah", "terjangkau", "promo", "hemat", "makasih", "terima kasih", "makasi", "tq",
  "thx", "berkah", "untung", "bahagia", "wow", "jos", "josss", "salut", "konsisten",
  "cakep", "nyegerin", "segar", "mantapp", "kerenn", "favorit", "bintang", "sip", "oke",
  "mantab", "lezatos", "membantu", "menyenangkan", "puasbgt", "lovetheflavor"
]);

const NEGATIVE_WORDS = new Set([
  "kecewa", "jelek", "buruk", "mahal", "lambat", "lama", "antre", "antri", "habis",
  "tumpah", "sempit", "rusak", "bohong", "kapok", "rugi", "zonk", "basi", "bau",
  "asin", "pahit", "gosong", "kotor", "lelet", "parah", "nyesel", "batal", "php",
  "tipu", "kasar", "hancur", "kurang", "gagal", "lamban", "error", "komplain", "ribet",
  "payah", "hambar", "overrated", "mengecewakan", "amis", "berantakan", "dingin",
  "pelit", "tengik", "bocor", "menyesal", "dusta", "menipu", "ancur", "parahhh",
  "kapokkk", "rugibesar"
]);

const INDONESIAN_STOPWORDS = new Set([
  "dan", "yang", "di", "ke", "dari", "ini", "itu", "untuk", "dengan", "ada",
  "dll", "yg", "gak", "ga", "ya", "yaa", "nya", "saya", "aku", "kita", "kami",
  "kalian", "mereka", "dia", "tapi", "namun", "atau", "juga", "kalau", "kalo",
  "jika", "agar", "supaya", "karena", "sebab", "saat", "ketika", "sudah", "telah",
  "lagi", "belum", "tidak", "tak", "bukan", "sangat", "banget", "bgt", "amat",
  "lebih", "paling", "bisa", "dapat", "mau", "ingin", "akan", "hendak", "jd",
  "jadi", "aja", "saja", "dong", "sih", "kok", "deh", "lah", "loh", "kan",
  "nih", "tuh", "nan", "dm", "kak", "min", "minn", "halo", "bpk", "ibu",
  "yuk", "sama", "pada", "oleh", "tentang", "seperti", "bagaikan", "adalah",
  "ialah", "yaitu", "yakni", "bagi", "dalam", "luar", "antara", "serta",
  "tiap", "setiap", "semua", "banyak", "sedikit", "cuma", "hanya", "begitu",
  "begini", "masih", "sempat", "pernah", "terus", "selalu", "kembali", "bahkan",
  "bisa", "dah", "udh", "udah", "udahh", "pun", "jg", "dgn", "utk", "krn", "sy",
  "klo", "tp", "gitu", "gini", "pas", "si", "dongg", "yaa", "yaaa", "bgttt"
]);

export function parseSentimentLabel(val: string): SentimentType | null {
  if (!val) return null;
  const norm = val.trim().toLowerCase();
  if (norm.includes("positif") || norm === "positive" || norm === "pos") return "positive";
  if (norm.includes("negatif") || norm === "negative" || norm === "neg") return "negative";
  if (norm.includes("netral") || norm === "neutral" || norm === "neu") return "neutral";
  return null;
}

export function analyzeCommentText(text: string): { sentiment: SentimentType; score: number } {
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = cleanText.split(/\s+/).filter(Boolean);

  let posMatches = 0;
  let negMatches = 0;

  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) posMatches++;
    if (NEGATIVE_WORDS.has(token)) negMatches++;
  }

  if (cleanText.includes("worth it") || cleanText.includes("worth bgt")) posMatches++;
  if (cleanText.includes("terima kasih")) posMatches++;
  if (cleanText.includes("buy 1 get 1") || cleanText.includes("bogo")) posMatches++;

  if (posMatches > negMatches) {
    const diff = posMatches - negMatches;
    const score = Math.min(0.98, 0.72 + diff * 0.08);
    return { sentiment: "positive", score: Number(score.toFixed(2)) };
  } else if (negMatches > posMatches) {
    const diff = negMatches - posMatches;
    const score = Math.min(0.98, 0.72 + diff * 0.08);
    return { sentiment: "negative", score: Number(score.toFixed(2)) };
  } else {
    return { sentiment: "neutral", score: 0.65 };
  }
}

export function extractTopKeywords(
  comments: CommentItem[]
): { text: string; weight: number; sentiment: SentimentType }[] {
  const wordStats: Record<string, { count: number; pos: number; neg: number; neu: number }> = {};

  comments.forEach((c) => {
    const clean = c.text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = clean.split(/\s+/).filter((w) => w.length >= 3 && !INDONESIAN_STOPWORDS.has(w));
    const uniqueInComment = new Set(words);

    uniqueInComment.forEach((w) => {
      if (!wordStats[w]) {
        wordStats[w] = { count: 0, pos: 0, neg: 0, neu: 0 };
      }
      wordStats[w].count++;
      if (c.sentiment === "positive") wordStats[w].pos++;
      else if (c.sentiment === "negative") wordStats[w].neg++;
      else wordStats[w].neu++;
    });
  });

  const sorted = Object.entries(wordStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  if (sorted.length === 0) return [];

  const maxCount = sorted[0][1].count;

  return sorted.map(([word, stat]) => {
    let dominant: SentimentType = "neutral";
    if (stat.pos > stat.neg && stat.pos >= stat.neu) dominant = "positive";
    else if (stat.neg > stat.pos && stat.neg >= stat.neu) dominant = "negative";

    // Normalize weight between 60 and 96
    const ratio = stat.count / Math.max(maxCount, 1);
    const weight = Math.round(60 + ratio * 36);

    return {
      text: word,
      weight,
      sentiment: dominant,
    };
  });
}

export function calculateDailyTrend(comments: CommentItem[]): TrendDataPoint[] {
  const dayMap: Record<string, { positive: number; neutral: number; negative: number; dateObj: Date | null }> = {};
  let validDateCount = 0;

  comments.forEach((c) => {
    if (!c.date || c.date === "-") return;

    // Handle timestamps like "2026-11-02 10:03:25" or "2026-11-02" or ISO
    const rawDate = c.date.trim();
    let label = "";
    let parsedDate: Date | null = null;

    if (rawDate.includes("-") || rawDate.includes("/")) {
      const parts = rawDate.split(" ")[0]; // Date portion
      const d = new Date(parts.replace(/\//g, "-"));
      if (!isNaN(d.getTime())) {
        parsedDate = d;
        label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        validDateCount++;
      } else {
        label = parts;
      }
    } else {
      label = rawDate;
    }

    if (label) {
      if (!dayMap[label]) {
        dayMap[label] = { positive: 0, neutral: 0, negative: 0, dateObj: parsedDate };
      }
      if (c.sentiment === "positive") dayMap[label].positive++;
      else if (c.sentiment === "negative") dayMap[label].negative++;
      else dayMap[label].neutral++;
    }
  });

  // If fewer than 2 distinct dates or no valid dates, return empty array to hide trend chart
  const entries = Object.entries(dayMap);
  if (validDateCount < 2 || entries.length === 0) {
    return [];
  }

  // Sort chronologically if dates were parsed
  entries.sort((a, b) => {
    if (a[1].dateObj && b[1].dateObj) {
      return a[1].dateObj.getTime() - b[1].dateObj.getTime();
    }
    return a[0].localeCompare(b[0]);
  });

  return entries.map(([period, counts]) => ({
    period,
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
  }));
}

export function calculateTopics(comments: CommentItem[]): TopicItem[] {
  // If post_title is available, compare by post_title
  const hasPostTitles = comments.some((c) => c.postTitle && c.postTitle.trim() !== "");

  if (hasPostTitles) {
    const titleMap: Record<string, { count: number; pos: number; neu: number; neg: number }> = {};

    comments.forEach((c) => {
      const title = c.postTitle?.trim() || "Lainnya";
      if (!titleMap[title]) {
        titleMap[title] = { count: 0, pos: 0, neu: 0, neg: 0 };
      }
      titleMap[title].count++;
      if (c.sentiment === "positive") titleMap[title].pos++;
      else if (c.sentiment === "negative") titleMap[title].neg++;
      else titleMap[title].neu++;
    });

    return Object.entries(titleMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, stat], idx) => {
        const total = stat.count;
        const posRatio = Math.round((stat.pos / total) * 100);
        const neuRatio = Math.round((stat.neu / total) * 100);
        const negRatio = 100 - posRatio - neuRatio;

        let dominant: SentimentType = "neutral";
        if (stat.pos > stat.neg && stat.pos >= stat.neu) dominant = "positive";
        else if (stat.neg > stat.pos && stat.neg >= stat.neu) dominant = "negative";

        return {
          id: `topic_${idx + 1}`,
          name,
          frequency: total,
          dominantSentiment: dominant,
          positiveRatio: posRatio,
          neutralRatio: neuRatio,
          negativeRatio: negRatio,
        };
      });
  }

  // Fallback: extract topics from top keywords
  const keywords = extractTopKeywords(comments).slice(0, 5);
  return keywords.map((kw, idx) => {
    const related = comments.filter((c) => c.text.toLowerCase().includes(kw.text));
    const total = related.length || 1;
    const pos = related.filter((c) => c.sentiment === "positive").length;
    const neu = related.filter((c) => c.sentiment === "neutral").length;
    const posRatio = Math.round((pos / total) * 100);
    const neuRatio = Math.round((neu / total) * 100);
    const negRatio = 100 - posRatio - neuRatio;

    return {
      id: `topic_${idx + 1}`,
      name: `Topik: ${kw.text.charAt(0).toUpperCase() + kw.text.slice(1)}`,
      frequency: total,
      dominantSentiment: kw.sentiment,
      positiveRatio: posRatio,
      neutralRatio: neuRatio,
      negativeRatio: negRatio,
    };
  });
}

export function buildAnalysisFromImportedRows(params: {
  fileName: string;
  rows: Record<string, string>[];
  mapping: ColumnMapping;
}): AnalysisDetail {
  const { fileName, rows, mapping } = params;

  let simulatedCount = 0;

  const comments: CommentItem[] = rows.map((row, idx) => {
    const text = (mapping.comment_text ? row[mapping.comment_text] : "") || "";
    const username = (mapping.username ? row[mapping.username] : "") || `user_${idx + 1}`;
    const date = (mapping.timestamp ? row[mapping.timestamp] : "") || "-";
    const postTitle = mapping.post_title ? row[mapping.post_title] : undefined;
    const likeVal = mapping.like_count ? parseInt(row[mapping.like_count], 10) : 0;
    const likeCount = isNaN(likeVal) ? 0 : likeVal;

    // Check label column
    let sentiment: SentimentType;
    let score: number;

    const labelVal = mapping.label && row[mapping.label] ? parseSentimentLabel(row[mapping.label]) : null;

    if (labelVal) {
      sentiment = labelVal;
      score = 0.95;
    } else {
      const analyzed = analyzeCommentText(text);
      sentiment = analyzed.sentiment;
      score = analyzed.score;
      simulatedCount++;
    }

    return {
      id: `imp_cmt_${idx + 1}`,
      username: username.replace(/^@/, ""),
      text,
      sentiment,
      score,
      date,
      likeCount,
      postTitle,
    };
  });

  const totalComments = comments.length;
  const positiveCount = comments.filter((c) => c.sentiment === "positive").length;
  const neutralCount = comments.filter((c) => c.sentiment === "neutral").length;
  const negativeCount = comments.filter((c) => c.sentiment === "negative").length;

  const sumConfidence = comments.reduce((acc, c) => acc + c.score, 0);
  const avgConfidence = totalComments > 0 ? Number((sumConfidence / totalComments).toFixed(2)) : 0.85;

  // Determine if simulated: if any row did not have a valid label or label wasn't mapped
  const isSimulated = !mapping.label || simulatedCount > 0;

  const trend = calculateDailyTrend(comments);
  const topics = calculateTopics(comments);
  const wordCloud = extractTopKeywords(comments);

  // Caption/title: if post_title is common or first row's post_title, use it, else file name
  const firstPostTitle = comments.find((c) => c.postTitle)?.postTitle;
  const postCaption = firstPostTitle || `Analisis Berkas ${fileName}`;

  return {
    id: "ANL_000077",
    shortcode: "FILE_IMPORT",
    username: "impor_berkas",
    postCaption,
    postedDate: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    totalComments,
    positiveCount,
    neutralCount,
    negativeCount,
    avgConfidence,
    source: "File",
    fileName,
    isSimulated,
    trend,
    topics,
    wordCloud,
    comments,
  };
}
