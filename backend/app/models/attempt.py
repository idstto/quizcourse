import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    score: Mapped[int] = mapped_column(Integer, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="attempts")
    answers: Mapped[list["AttemptAnswer"]] = relationship(
        "AttemptAnswer",
        back_populates="attempt",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
