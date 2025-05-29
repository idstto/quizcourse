from uuid import UUID

from pydantic import BaseModel, Field


class AnswerBase(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Answer text",
        json_schema_extra={"example": "4"},
    )
    is_correct: bool = Field(
        False,
        description="Whether this answer is correct",
        json_schema_extra={"example": True},
    )
    order_index: int = Field(
        0,
        ge=0,
        description="Order of the answer in the question",
        json_schema_extra={"example": 0},
    )


class AnswerCreate(AnswerBase):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "text": "4",
                    "is_correct": True,
                    "order_index": 0,
                }
            ]
        }
    }


class AnswerUpdate(BaseModel):
    text: str | None = Field(None, min_length=1, max_length=1000)
    is_correct: bool | None = None
    order_index: int | None = Field(None, ge=0)


class AnswerResponse(AnswerBase):
    id: UUID
    question_id: UUID

    model_config = {"from_attributes": True}


class AnswerPublicResponse(BaseModel):
    """Response without is_correct field for quiz taking"""

    id: UUID
    text: str
    order_index: int

    model_config = {"from_attributes": True}
