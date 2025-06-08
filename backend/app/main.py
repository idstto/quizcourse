from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.config import settings
from app.routers import auth, quizzes, attempts

app = FastAPI(
    title="QuizCourse API",
    description="RESTful API for the QuizCourse quiz application",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT == "development" else None,
    openapi_tags=[
        {"name": "auth", "description": "Authentication operations"},
        {"name": "quizzes", "description": "Quiz management"},
        {"name": "questions", "description": "Question management"},
        {"name": "attempts", "description": "Quiz attempts and results"},
    ],
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="QuizCourse API",
        version="1.0.0",
        description="API for creating and taking quizzes with timed sessions",
        routes=app.routes,
    )
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token obtained from /api/auth/login",
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(quizzes.router)
app.include_router(attempts.router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
