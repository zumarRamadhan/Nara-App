import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, Column, DateTime, Float, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(
        BigInteger,
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    label_model = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    label_koreksi = Column(String(50), nullable=True)
    model_version = Column(String(50), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    comment = relationship("Comment", back_populates="prediction")

    __table_args__ = (
        Index("ix_predictions_comment_id", "comment_id"),
        Index("ix_predictions_label_model", "label_model"),
    )
