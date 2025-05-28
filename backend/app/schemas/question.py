from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuestionBase(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Question text",
        json_schema_extra={"example": "What is the output of print(2 + 2)?"},
    )
    order_index: int = Field(
        0,
        ge=0,
        description="Order of the question in the quiz",
        json_schema_extra={"example": 1},
    )


class QuestionCreate(QuestionBase):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "text": "What is the output of print(2 + 2)?",
                    "order_index": 1,
                }
            ]
        }
    }


class QuestionUpdate(BaseModel):
    text: str | None = Field(None, min_length=1, max_length=2000)
    order_index: int | None = Field(None, ge=0)


class QuestionResponse(QuestionBase):
    id: UUID
    quiz_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
