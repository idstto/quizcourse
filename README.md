# QuizCourse - Minimal Quiz Application

A full-stack quiz application with a FastAPI backend and Next.js frontend, designed for creating and taking quizzes with timed sessions and result tracking.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Architecture UML](#system-architecture-uml)
- [Database Schema UML](#database-schema-uml)
- [API Endpoints](#api-endpoints)
- [Backend Project](#backend-project)
- [Frontend Project](#frontend-project)
- [Docker Development](#docker-development)
- [Getting Started](#getting-started)

---

## Architecture Overview

The application follows a client-server architecture with clear separation of concerns:

- **Backend**: RESTful API built with FastAPI, handling authentication, quiz management, and result processing
- **Frontend**: Next.js application with server-side rendering, providing an interactive quiz-taking experience
- **Database**: PostgreSQL with UUID primary keys for all entities

---

## System Architecture UML

```mermaid
graph TB
    subgraph Frontend ["Frontend (Next.js)"]
        UI[User Interface]
        Pages[Pages]
        Components[Components]
        APIClient[API Client]
    end

    subgraph Backend ["Backend (FastAPI)"]
        Router[API Routers]
        Auth[JWT Authentication]
        Services[Business Logic]
        Models[SQLAlchemy Models]
        Schemas[Pydantic Schemas]
    end

    subgraph Database ["Database (PostgreSQL)"]
        Users[(Users)]
        Quizzes[(Quizzes)]
        Questions[(Questions)]
        Answers[(Answers)]
        QuizAttempts[(Quiz Attempts)]
        AttemptAnswers[(Attempt Answers)]
    end

    UI --> Pages
    Pages --> Components
    Components --> APIClient
    APIClient -->|HTTP/REST| Router
    Router --> Auth
    Auth --> Services
    Services --> Models
    Models --> Schemas
    Models -->|ORM| Users
    Models -->|ORM| Quizzes
    Models -->|ORM| Questions
    Models -->|ORM| Answers
    Models -->|ORM| QuizAttempts
    Models -->|ORM| AttemptAnswers
```

---

## Database Schema UML

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        boolean is_admin
        datetime created_at
        datetime updated_at
    }

    QUIZ {
        uuid id PK
        uuid created_by FK
        string title
        string description
        int time_limit_minutes
        boolean is_published
        datetime created_at
        datetime updated_at
    }

    QUESTION {
        uuid id PK
        uuid quiz_id FK
        string text
        int order_index
        datetime created_at
    }

    ANSWER {
        uuid id PK
        uuid question_id FK
        string text
        boolean is_correct
        int order_index
    }

    QUIZ_ATTEMPT {
        uuid id PK
        uuid quiz_id FK
        uuid user_id FK
        datetime started_at
        datetime completed_at
        int score
        int total_questions
        boolean is_completed
    }

    ATTEMPT_ANSWER {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        uuid selected_answer_id FK
        boolean is_correct
        datetime answered_at
    }

    USER ||--o{ QUIZ : creates
    USER ||--o{ QUIZ_ATTEMPT : takes
    QUIZ ||--o{ QUESTION : contains
    QUIZ ||--o{ QUIZ_ATTEMPT : has
    QUESTION ||--o{ ANSWER : has
    QUESTION ||--o{ ATTEMPT_ANSWER : referenced_in
    ANSWER ||--o{ ATTEMPT_ANSWER : selected_in
    QUIZ_ATTEMPT ||--o{ ATTEMPT_ANSWER : contains
```

---

## Sequence Diagram - Quiz Taking Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL

    U->>F: Navigate to Quiz
    F->>B: GET /api/quizzes/{id}
    B->>DB: Fetch Quiz with Questions
    DB-->>B: Quiz Data
    B-->>F: Quiz JSON (without correct answers)
    F-->>U: Display Quiz with Timer

    loop For Each Question
        U->>F: Select Answer
        F->>F: Store Answer Locally
    end

    U->>F: Submit Quiz
    F->>B: POST /api/attempts
    B->>DB: Create Quiz Attempt
    B->>DB: Save All Answers
    B->>DB: Calculate Score
    DB-->>B: Attempt Result
    B-->>F: Result JSON
    F-->>U: Display Results Page
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | List all published quizzes |
| GET | `/api/quizzes/{id}` | Get quiz with questions |
| POST | `/api/quizzes` | Create new quiz (admin) |
| PUT | `/api/quizzes/{id}` | Update quiz (admin) |
| DELETE | `/api/quizzes/{id}` | Delete quiz (admin) |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/{id}/questions` | Add question to quiz |
| PUT | `/api/questions/{id}` | Update question |
| DELETE | `/api/questions/{id}` | Delete question |

### Quiz Attempts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/{id}/attempts` | Start quiz attempt |
| POST | `/api/attempts/{id}/submit` | Submit quiz answers |
| GET | `/api/attempts/{id}` | Get attempt results |
| GET | `/api/attempts` | Get user's attempt history |

---

## Backend Project

### Technology Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL with UUID primary keys
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger UI & ReDoc (OpenAPI 3.1)
- **Package Manager**: uv

### API Documentation (Swagger)

FastAPI provides automatic interactive API documentation. The following endpoints are available in development:

| Endpoint | Description |
|----------|-------------|
| `/docs` | Swagger UI - Interactive API documentation |
| `/redoc` | ReDoc - Alternative API documentation |
| `/openapi.json` | OpenAPI schema in JSON format |

#### Swagger Configuration

```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="QuizCourse API",
    description="RESTful API for the QuizCourse quiz application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

#### JWT Authentication in Swagger

```python
# app/utils/security.py
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(
    scheme_name="JWT",
    description="Enter your JWT token",
    auto_error=True,
)

# app/main.py - Add security scheme to OpenAPI
def custom_openapi():
    # ... existing code ...
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token obtained from /api/auth/login"
        }
    }
    return app.openapi_schema
```

#### Example Endpoint with Swagger Documentation

```python
# app/routers/quizzes.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.quiz import QuizCreate, QuizResponse, QuizListResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

@router.get(
    "/",
    response_model=List[QuizListResponse],
    summary="List all quizzes",
    description="Retrieve a list of all published quizzes available for participants.",
    responses={
        200: {"description": "List of quizzes retrieved successfully"},
        401: {"description": "Not authenticated"},
    },
)
async def list_quizzes(
    skip: int = 0,
    limit: int = 10,
):
    """
    Retrieve all published quizzes.

    - **skip**: Number of quizzes to skip (pagination)
    - **limit**: Maximum number of quizzes to return
    """
    pass

@router.post(
    "/",
    response_model=QuizResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new quiz",
    description="Create a new quiz. Only administrators can create quizzes.",
    responses={
        201: {"description": "Quiz created successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized - admin only"},
        422: {"description": "Validation error"},
    },
)
async def create_quiz(
    quiz: QuizCreate,
    current_user = Depends(get_current_user),
):
    """
    Create a new quiz with the following information:

    - **title**: Quiz title (required)
    - **description**: Quiz description
    - **time_limit_minutes**: Time limit for completing the quiz
    """
    pass
```

#### Pydantic Schemas with OpenAPI Examples

```python
# app/schemas/quiz.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class QuizCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The title of the quiz",
        json_schema_extra={"example": "Python Basics Quiz"}
    )
    description: str | None = Field(
        None,
        max_length=1000,
        description="Detailed description of the quiz",
        json_schema_extra={"example": "Test your knowledge of Python fundamentals"}
    )
    time_limit_minutes: int = Field(
        30,
        ge=1,
        le=180,
        description="Time limit in minutes",
        json_schema_extra={"example": 30}
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Python Basics Quiz",
                    "description": "Test your Python knowledge",
                    "time_limit_minutes": 30
                }
            ]
        }
    }

class QuizResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    time_limit_minutes: int
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}
```

#### Disabling Swagger in Production

```python
# app/main.py
from app.config import settings

app = FastAPI(
    title="QuizCourse API",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT == "development" else None,
)
```

#### Environment Variable

```env
# Add to .env
ENVIRONMENT=development  # Set to "production" to disable Swagger
```

### Project Structure
```
backend/
├── pyproject.toml          # Project dependencies (uv)
├── uv.lock                  # Lock file
├── alembic.ini              # Database migrations config
├── alembic/                 # Migration scripts
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── quiz.py
│   │   ├── question.py
│   │   ├── answer.py
│   │   └── attempt.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── quiz.py
│   │   ├── question.py
│   │   ├── answer.py
│   │   └── attempt.py
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── quizzes.py
│   │   ├── questions.py
│   │   └── attempts.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── quiz.py
│   └── utils/               # Utilities
│       ├── __init__.py
│       ├── security.py      # JWT & password hashing
│       └── deps.py          # Dependencies
└── tests/
    ├── __init__.py
    ├── conftest.py
    └── test_*.py
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/quizcourse
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development  # development | production (disables Swagger in production)
```

---

## Docker Development

### Docker Compose Configuration

The project includes a Docker Compose setup for backend development with PostgreSQL and pgAdmin.

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: quizcourse_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: quizcourse
      POSTGRES_PASSWORD: quizcourse_secret
      POSTGRES_DB: quizcourse
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quizcourse -d quizcourse"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: quizcourse_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@quizcourse.local
      PGADMIN_DEFAULT_PASSWORD: admin
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      db:
        condition: service_healthy

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: quizcourse_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://quizcourse:quizcourse_secret@db:5432/quizcourse
      SECRET_KEY: dev-secret-key-change-in-production
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      ENVIRONMENT: development
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - /app/.venv
    depends_on:
      db:
        condition: service_healthy
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
  pgadmin_data:

networks:
  default:
    name: quizcourse_network
```

### Backend Dockerfile for Development

```dockerfile
# backend/Dockerfile.dev
FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Reset database (removes all data)
docker-compose down -v

# Rebuild backend after dependency changes
docker-compose build backend
docker-compose up -d backend

# Run migrations inside container
docker-compose exec backend uv run alembic upgrade head

# Access database shell
docker-compose exec db psql -U quizcourse -d quizcourse
```

### Services Overview

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | FastAPI application |
| API Docs | http://localhost:8000/docs | Swagger UI |
| pgAdmin | http://localhost:5050 | Database management |
| PostgreSQL | localhost:5432 | Database server |

---

## Frontend Project

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **Theme**: Material Design Yellow Palette with Dark Mode
- **Theme Switching**: Light/Dark mode toggle with system preference detection
- **Deployment**: Vercel-ready

### Color Palette (Material Design Yellow)

#### Light Theme
| Usage | Color | Hex Code |
|-------|-------|----------|
| Primary | Yellow 500 | `#FFEB3B` |
| Primary Dark | Yellow 700 | `#FBC02D` |
| Primary Light | Yellow 200 | `#FFF59D` |
| Accent | Yellow A200 | `#FFFF00` |
| Background | Yellow 50 | `#FFFDE7` |
| Surface | White | `#FFFFFF` |
| Text Primary | Grey 900 | `#212121` |
| Text Secondary | Grey 600 | `#757575` |

#### Dark Theme
| Usage | Color | Hex Code |
|-------|-------|----------|
| Primary | Yellow 400 | `#FFEE58` |
| Primary Dark | Yellow 600 | `#FDD835` |
| Primary Light | Yellow 300 | `#FFF176` |
| Accent | Yellow A100 | `#FFFF8D` |
| Background | Grey 900 | `#121212` |
| Surface | Grey 800 | `#1E1E1E` |
| Text Primary | White | `#FFFFFF` |
| Text Secondary | Grey 400 | `#BDBDBD` |

### Project Structure
```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vercel.json
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── quizzes/
│   │   │   ├── page.tsx         # Quiz list
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Quiz detail
│   │   │       └── take/
│   │   │           └── page.tsx # Quiz taking (with timer)
│   │   └── results/
│   │       └── [attemptId]/
│   │           └── page.tsx     # Results page
│   ├── components/
│   │   ├── ui/                  # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Timer.tsx        # Quiz timer component
│   │   │   └── ThemeToggle.tsx  # Light/Dark mode toggle
│   │   ├── quiz/
│   │   │   ├── QuizCard.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   └── AnswerOption.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.ts              # Auth utilities
│   │   └── utils.ts             # Helper functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuiz.ts
│   │   ├── useTimer.ts          # Timer hook
│   │   └── useTheme.ts          # Theme hook
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── context/
│       ├── AuthContext.tsx
│       └── ThemeContext.tsx     # Theme provider
└── tests/
    └── *.test.tsx
```

### Key Features

#### Theme Switching
- Light and Dark mode support
- Toggle button in header for manual switching
- Automatic detection of system preference
- Persisted preference in localStorage
- Smooth transition animations between themes
- Consistent Material Design Yellow palette in both modes

```tsx
// Example ThemeContext usage
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme} {/* 'light' | 'dark' | 'system' */}
    </button>
  );
}
```

#### Timer Component
- Countdown timer for quiz duration
- Visual warning when time is running low (changes color)
- Auto-submit when time expires
- Progress bar indicator
- Supports both light and dark themes

#### Results Page
- Score display with percentage
- Question-by-question breakdown
- Correct/incorrect answer indicators
- Time taken to complete
- Option to retake quiz
- Share results functionality

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 16+ (or Docker)
- uv (Python package manager)
- Docker & Docker Compose (for containerized development)

### Option 1: Docker Development (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone and start all services
docker-compose up -d

# Wait for services to be healthy, then run migrations
docker-compose exec backend uv run alembic upgrade head

# View backend logs
docker-compose logs -f backend
```

Access the application:
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- pgAdmin: http://localhost:5050 (admin@quizcourse.local / admin)

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
uv sync
cp .env.example .env
# Edit .env with your database credentials
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### Vercel Deployment

The frontend is Vercel-ready. To deploy:

```bash
cd frontend
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

---

## License

MIT License
