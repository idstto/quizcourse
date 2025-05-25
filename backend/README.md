# QuizCourse Backend

Backend API for the QuizCourse application built with FastAPI.

## Tech Stack

- **FastAPI** - Modern web framework for building APIs
- **PostgreSQL** - Database with UUID primary keys
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Alembic** - Database migrations

## Development

```bash
# Install dependencies
uv sync

# Run development server
uv run uvicorn app.main:app --reload

# Run migrations
uv run alembic upgrade head
```

## Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```
