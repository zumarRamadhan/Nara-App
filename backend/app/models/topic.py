from sqlalchemy import BigInteger, Column, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_id = Column(
        UUID(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
    )
    keyword = Column(String(255), nullable=False)
    sentiment = Column(String(50), nullable=False)
    frequency = Column(Integer, nullable=False, default=1)

    analysis = relationship("Analysis", back_populates="topics")

    __table_args__ = (
        Index("ix_topics_analysis_sentiment", "analysis_id", "sentiment"),
    )
