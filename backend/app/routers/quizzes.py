from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas import (
    AnswerPublicResponse,
    QuestionResponse,
    QuizCreate,
    QuizListResponse,
    QuizResponse,
    QuizUpdate,
)
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


class QuestionWithAnswers(BaseModel):
    id: UUID
    quiz_id: UUID
    text: str
    order_index: int
    answers: list[AnswerPublicResponse]

    model_config = {"from_attributes": True}


class QuizDetailResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    time_limit_minutes: int
    questions: list[QuestionWithAnswers]

    model_config = {"from_attributes": True}


@router.get("", response_model=list[QuizListResponse])
async def list_quizzes(db: Annotated[Session, Depends(get_db)]):
    """Get all published quizzes."""
    quizzes = db.query(Quiz).filter(Quiz.is_published == True).all()
    return quizzes


@router.get("/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz(quiz_id: UUID, db: Annotated[Session, Depends(get_db)]):
    """Get quiz details with questions and answers (without correct answers marked)."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_published == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    questions_with_answers = []
    for question in sorted(quiz.questions, key=lambda q: q.order_index):
        answers = [
            AnswerPublicResponse(
                id=a.id,
                text=a.text,
                order_index=a.order_index,
            )
            for a in sorted(question.answers, key=lambda a: a.order_index)
        ]
        questions_with_answers.append(
            QuestionWithAnswers(
                id=question.id,
                quiz_id=question.quiz_id,
                text=question.text,
                order_index=question.order_index,
                answers=answers,
            )
        )

    return QuizDetailResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        time_limit_minutes=quiz.time_limit_minutes,
        questions=questions_with_answers,
    )


@router.post("", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new quiz (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create quizzes",
        )

    quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        time_limit_minutes=quiz_data.time_limit_minutes,
        created_by=current_user.id,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: UUID,
    quiz_data: QuizUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a quiz (admin only)."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    if not current_user.is_admin and quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this quiz",
        )

    update_data = quiz_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(quiz, field, value)

    db.commit()
    db.refresh(quiz)
    return quiz


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a quiz (admin only)."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    if not current_user.is_admin and quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this quiz",
        )

    db.delete(quiz)
    db.commit()
