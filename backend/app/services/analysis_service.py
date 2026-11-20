import re
from collections import Counter

from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.comment import Comment
from app.schemas.analysis import (
    AnalysisDetailResponse,
    DailyTrendItem,
    KeywordItem,
    LabelDistribution,
    PostTitleBreakdownItem,
)

INDONESIAN_STOPWORDS = {
    "dan",
    "yang",
    "di",
    "ke",
    "dari",
    "ini",
    "itu",
    "untuk",
    "dengan",
    "ada",
    "dll",
    "yg",
    "gak",
    "ga",
    "ya",
    "yaa",
    "nya",
    "saya",
    "aku",
    "kita",
    "kami",
    "kalian",
    "mereka",
    "dia",
    "tapi",
    "namun",
    "atau",
    "juga",
    "kalau",
    "kalo",
    "jika",
    "agar",
    "supaya",
    "karena",
    "sebab",
    "saat",
    "ketika",
    "sudah",
    "telah",
    "lagi",
    "belum",
    "tidak",
    "tak",
    "bukan",
    "sangat",
    "banget",
    "bgt",
    "amat",
    "lebih",
    "paling",
    "bisa",
    "dapat",
    "mau",
    "ingin",
    "akan",
    "hendak",
    "jd",
    "jadi",
    "aja",
    "saja",
    "dong",
    "sih",
    "kok",
    "deh",
    "lah",
    "loh",
    "kan",
    "nih",
    "tuh",
    "nan",
    "dm",
    "kak",
    "min",
    "minn",
    "halo",
    "bpk",
    "ibu",
    "yuk",
    "sama",
    "pada",
    "oleh",
    "tentang",
    "seperti",
    "bagaikan",
    "adalah",
    "ialah",
    "yaitu",
    "yakni",
    "bagi",
    "dalam",
    "luar",
    "antara",
    "serta",
    "tiap",
    "setiap",
    "semua",
    "banyak",
    "sedikit",
    "cuma",
    "hanya",
    "begitu",
    "begini",
    "masih",
    "sempat",
    "pernah",
    "terus",
    "selalu",
    "kembali",
    "bahkan",
    "dah",
    "udh",
    "udah",
    "udahh",
    "pun",
    "jg",
    "dgn",
    "utk",
    "krn",
    "sy",
    "klo",
    "tp",
    "gitu",
    "gini",
    "pas",
    "si",
    "dongg",
    "bgttt",
}


def build_analysis_detail(db: Session, analysis: Analysis) -> AnalysisDetailResponse:
    comments: list[Comment] = (
        db.query(Comment).filter(Comment.analysis_id == analysis.id).all()
    )
    total = len(comments)

    # 1. Label Distribution
    label_dist: LabelDistribution | None = None
    if analysis.has_label and total > 0:
        pos = sum(1 for c in comments if c.label == "positif")
        neu = sum(1 for c in comments if c.label == "netral")
        neg = sum(1 for c in comments if c.label == "negatif")
        label_dist = LabelDistribution(
            positive=pos,
            neutral=neu,
            negative=neg,
            positive_percent=round((pos / total) * 100),
            neutral_percent=round((neu / total) * 100),
            negative_percent=round((neg / total) * 100),
        )

    # 2. Daily Trend (jika ada timestamp)
    trend_map: dict[str, dict[str, int]] = {}
    valid_dates_count = 0

    for c in comments:
        if c.commented_at:
            valid_dates_count += 1
            # Format: "YYYY-MM-DD"
            day_str = c.commented_at.strftime("%Y-%m-%d")
            if day_str not in trend_map:
                trend_map[day_str] = {"positive": 0, "neutral": 0, "negative": 0}
            if c.label == "positif":
                trend_map[day_str]["positive"] += 1
            elif c.label == "negatif":
                trend_map[day_str]["negative"] += 1
            else:
                trend_map[day_str]["neutral"] += 1

    daily_trend: list[DailyTrendItem] = []
    if valid_dates_count > 0:
        sorted_days = sorted(trend_map.keys())
        for d in sorted_days:
            daily_trend.append(
                DailyTrendItem(
                    period=d,
                    positive=trend_map[d]["positive"],
                    neutral=trend_map[d]["neutral"],
                    negative=trend_map[d]["negative"],
                )
            )

    # 3. Top 10 Keywords (abaikan stopword Indonesia)
    word_counter: Counter = Counter()
    for c in comments:
        clean = re.sub(r"[^a-zA-Z0-9\s]", " ", c.text_raw.lower())
        tokens = clean.split()
        unique_tokens = set(tokens)
        for t in unique_tokens:
            if len(t) >= 3 and t not in INDONESIAN_STOPWORDS:
                word_counter[t] += 1

    top_keywords = [
        KeywordItem(text=word, count=cnt) for word, cnt in word_counter.most_common(10)
    ]

    # 4. Post Title Breakdown (jika ada kolom post_title)
    title_map: dict[str, dict[str, int]] = {}
    has_post_title = any(c.post_title for c in comments)

    if has_post_title:
        for c in comments:
            title = c.post_title or "Tanpa Judul"
            if title not in title_map:
                title_map[title] = {
                    "total": 0,
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                }
            title_map[title]["total"] += 1
            if c.label == "positif":
                title_map[title]["positive"] += 1
            elif c.label == "negatif":
                title_map[title]["negative"] += 1
            elif c.label == "netral":
                title_map[title]["neutral"] += 1

    post_title_breakdown = [
        PostTitleBreakdownItem(
            post_title=t,
            total=data["total"],
            positive=data["positive"],
            neutral=data["neutral"],
            negative=data["negative"],
        )
        for t, data in sorted(
            title_map.items(), key=lambda x: x[1]["total"], reverse=True
        )
    ]

    return AnalysisDetailResponse(
        id=analysis.id,
        title=analysis.title,
        source_type=analysis.source_type,
        status=analysis.status,
        total_comments=analysis.total_comments,
        has_label=analysis.has_label,
        original_filename=analysis.original_filename,
        created_at=analysis.created_at,
        label_distribution=label_dist,
        daily_trend=daily_trend,
        top_keywords=top_keywords,
        post_title_breakdown=post_title_breakdown,
    )
