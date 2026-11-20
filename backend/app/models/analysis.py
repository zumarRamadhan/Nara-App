import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    source_type = Column(String(50), nullable=False)  # file_import | instagram_link
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    status = Column(
        String(50), nullable=False, default="done"
    )  # processing | done | failed
    total_comments = Column(Integer, nullable=False, default=0)
    has_label = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    user = relationship("User", back_populates="analyses")
    comments = relationship(
        "Comment", back_populates="analysis", cascade="all, delete-orphan"
    )
    topics = relationship(
        "Topic", back_populates="analysis", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_analyses_user_created", "user_id", "created_at"),)
