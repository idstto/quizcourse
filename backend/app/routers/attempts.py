from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.answer import Answer
from app.models.attempt import AttemptAnswer, QuizAttempt
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas import (
    AttemptAnswerDetail,
    QuizAttemptResponse,
    QuizAttemptResult,
    QuizSubmit,
)
from app.utils.deps import get_current_user

router = APIRouter(tags=["attempts"])


class AttemptStartResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    started_at: datetime

    model_config = {"from_attributes": True}


class AttemptSubmitResponse(BaseModel):
    id: UUID
    score: int
    total_questions: int


class AttemptDetailResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    quiz_title: str
    score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int | None
    answers: list[AttemptAnswerDetail]


@router.post(
    "/api/quizzes/{quiz_id}/attempts",
    response_model=AttemptStartResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_attempt(
    quiz_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Start a new quiz attempt."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_published == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    # Check for incomplete attempts
    existing_attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == current_user.id,
            QuizAttempt.is_completed == False,
        )
        .first()
    )

    if existing_attempt:
        return AttemptStartResponse(
            id=existing_attempt.id,
            quiz_id=existing_attempt.quiz_id,
            started_at=existing_attempt.started_at,
        )

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        total_questions=len(quiz.questions),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return AttemptStartResponse(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        started_at=attempt.started_at,
    )


@router.post("/api/attempts/{attempt_id}/submit", response_model=AttemptSubmitResponse)
async def submit_attempt(
    attempt_id: UUID,
    submission: QuizSubmit,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit answers for a quiz attempt."""
    attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == current_user.id,
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found",
        )

    if attempt.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt already submitted",
        )

    score = 0
    for answer_submission in submission.answers:
        question = (
            db.query(Question)
            .filter(Question.id == answer_submission.question_id)
            .first()
        )
        if not question:
            continue

        selected_answer = (
            db.query(Answer).filter(Answer.id == answer_submission.answer_id).first()
        )
        if not selected_answer:
            continue

        is_correct = selected_answer.is_correct
        if is_correct:
            score += 1

        attempt_answer = AttemptAnswer(
            attempt_id=attempt_id,
            question_id=answer_submission.question_id,
            selected_answer_id=answer_submission.answer_id,
            is_correct=is_correct,
        )
        db.add(attempt_answer)

    attempt.score = score
    attempt.is_completed = True
    attempt.completed_at = datetime.now(timezone.utc)
    db.commit()

    return AttemptSubmitResponse(
        id=attempt.id,
        score=score,
        total_questions=attempt.total_questions,
    )


@router.get("/api/attempts/{attempt_id}", response_model=AttemptDetailResponse)
async def get_attempt_result(
    attempt_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get detailed results for a completed attempt."""
    attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == current_user.id,
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found",
        )

    if not attempt.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt not yet completed",
        )

    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()

    time_taken_seconds = None
    if attempt.completed_at and attempt.started_at:
        time_taken_seconds = int(
            (attempt.completed_at - attempt.started_at).total_seconds()
        )

    percentage = (
        (attempt.score / attempt.total_questions * 100)
        if attempt.total_questions > 0
        else 0
    )

    answer_details = []
    for attempt_answer in attempt.answers:
        question = attempt_answer.question
        selected_answer = attempt_answer.selected_answer
        correct_answer = (
            db.query(Answer)
            .filter(Answer.question_id == question.id, Answer.is_correct == True)
            .first()
        )

        answer_details.append(
            AttemptAnswerDetail(
                question_id=question.id,
                question_text=question.text,
                selected_answer_id=selected_answer.id,
                selected_answer_text=selected_answer.text,
                correct_answer_id=correct_answer.id if correct_answer else selected_answer.id,
                correct_answer_text=correct_answer.text if correct_answer else selected_answer.text,
                is_correct=attempt_answer.is_correct,
            )
        )

    return AttemptDetailResponse(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        quiz_title=quiz.title if quiz else "Unknown Quiz",
        score=attempt.score,
        total_questions=attempt.total_questions,
        percentage=percentage,
        time_taken_seconds=time_taken_seconds,
        answers=answer_details,
    )
