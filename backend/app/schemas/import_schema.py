from uuid import UUID

from pydantic import BaseModel, Field


class ColumnMapping(BaseModel):
    comment_text: str = Field(..., description="Nama kolom untuk teks komentar (Wajib)")
    timestamp: str | None = Field(None, description="Nama kolom untuk tanggal/waktu")
    username: str | None = Field(None, description="Nama kolom untuk username")
    like_count: str | None = Field(None, description="Nama kolom untuk jumlah like")
    post_title: str | None = Field(None, description="Nama kolom untuk judul postingan")
    label: str | None = Field(None, description="Nama kolom untuk label sentimen")


class ImportResponse(BaseModel):
    id: UUID
    total_comments: int
    has_label: bool
    ignored_labels_count: int = 0
