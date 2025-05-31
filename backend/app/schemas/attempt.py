from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuizAttemptCreate(BaseModel):
    quiz_id: UUID = Field(..., description="ID of the quiz to attempt")


class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    user_id: UUID
    started_at: datetime
    completed_at: datetime | None
    score: int
    total_questions: int
    is_completed: bool

    model_config = {"from_attributes": True}


class QuizAttemptResult(BaseModel):
    id: UUID
    quiz_id: UUID
    quiz_title: str
    score: int
    total_questions: int
    percentage: float
    started_at: datetime
    completed_at: datetime | None
    time_taken_seconds: int | None

    model_config = {"from_attributes": True}


class AttemptAnswerSubmit(BaseModel):
    question_id: UUID = Field(..., description="ID of the question")
    answer_id: UUID = Field(..., description="ID of the selected answer")


class AttemptAnswerResponse(BaseModel):
    id: UUID
    attempt_id: UUID
    question_id: UUID
    selected_answer_id: UUID
    is_correct: bool
    answered_at: datetime

    model_config = {"from_attributes": True}


class AttemptAnswerDetail(BaseModel):
    """Detailed response for results page showing question and answer text"""

    question_id: UUID
    question_text: str
    selected_answer_id: UUID
    selected_answer_text: str
    correct_answer_id: UUID
    correct_answer_text: str
    is_correct: bool


class QuizSubmit(BaseModel):
    answers: list[AttemptAnswerSubmit] = Field(
        ..., description="List of answers for each question"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "answers": [
                        {
                            "question_id": "123e4567-e89b-12d3-a456-426614174000",
                            "answer_id": "123e4567-e89b-12d3-a456-426614174001",
                        }
                    ]
                }
            ]
        }
    }
