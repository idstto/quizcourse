from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuizBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Quiz title",
        json_schema_extra={"example": "Python Basics Quiz"},
    )
    description: str | None = Field(
        None,
        max_length=1000,
        description="Quiz description",
        json_schema_extra={"example": "Test your Python knowledge"},
    )
    time_limit_minutes: int = Field(
        30,
        ge=1,
        le=180,
        description="Time limit in minutes",
        json_schema_extra={"example": 30},
    )


class QuizCreate(QuizBase):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Python Basics Quiz",
                    "description": "Test your Python fundamentals",
                    "time_limit_minutes": 30,
                }
            ]
        }
    }


class QuizUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    time_limit_minutes: int | None = Field(None, ge=1, le=180)
    is_published: bool | None = None


class QuizResponse(QuizBase):
    id: UUID
    created_by: UUID
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuizListResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    time_limit_minutes: int
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}
