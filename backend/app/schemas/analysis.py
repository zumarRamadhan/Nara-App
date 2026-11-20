from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnalysisSummary(BaseModel):
    id: UUID
    title: str
    source_type: str
    status: str
    total_comments: int
    has_label: bool
    original_filename: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisListResponse(BaseModel):
    items: list[AnalysisSummary]
    total: int
    page: int
    page_size: int


class LabelDistribution(BaseModel):
    positive: int = 0
    neutral: int = 0
    negative: int = 0
    positive_percent: int = 0
    neutral_percent: int = 0
    negative_percent: int = 0


class DailyTrendItem(BaseModel):
    period: str
    positive: int = 0
    neutral: int = 0
    negative: int = 0


class KeywordItem(BaseModel):
    text: str
    count: int


class PostTitleBreakdownItem(BaseModel):
    post_title: str
    total: int
    positive: int = 0
    neutral: int = 0
    negative: int = 0


class AnalysisDetailResponse(BaseModel):
    id: UUID
    title: str
    source_type: str
    status: str
    total_comments: int
    has_label: bool
    original_filename: str | None = None
    created_at: datetime
    label_distribution: LabelDistribution | None = None
    daily_trend: list[DailyTrendItem] = []
    top_keywords: list[KeywordItem] = []
    post_title_breakdown: list[PostTitleBreakdownItem] = []

    model_config = {"from_attributes": True}


class CommentItemResponse(BaseModel):
    id: int
    username: str | None = None
    text_raw: str
    label: str | None = None
    like_count: int = 0
    post_title: str | None = None
    commented_at: datetime | None = None

    model_config = {"from_attributes": True}


class PaginatedCommentsResponse(BaseModel):
    items: list[CommentItemResponse]
    total: int
    page: int
    page_size: int


class AnalysisRunResponse(BaseModel):
    analysis_id: UUID
    status: str
    total_comments_processed: int
    model_version: str


class TopicItem(BaseModel):
    keyword: str
    frequency: int


class SentimentKeywords(BaseModel):
    positif: list[TopicItem] = []
    netral: list[TopicItem] = []
    negatif: list[TopicItem] = []


class AnalysisResultsResponse(BaseModel):
    analysis_id: UUID
    model_version: str
    distribution: LabelDistribution
    top_keywords: SentimentKeywords
    agreement_with_file_label: float | None = None

