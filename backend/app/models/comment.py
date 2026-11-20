from datetime import UTC, datetime

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(
        UUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
    )
    text_raw = Column(Text, nullable=False)
    text_clean = Column(Text, nullable=True)
    commented_at = Column(DateTime(timezone=True), nullable=True)
    username = Column(String(100), nullable=True)
    like_count = Column(Integer, nullable=False, default=0)
    post_title = Column(String(255), nullable=True)
    label = Column(String(20), nullable=True)  # positif | netral | negatif
    label_source = Column(String(20), nullable=True)  # file | model
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    analysis = relationship("Analysis", back_populates="comments")
    prediction = relationship(
        "Prediction", back_populates="comment", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_comments_analysis_id", "analysis_id"),
        Index("ix_comments_analysis_label", "analysis_id", "label"),
    )
