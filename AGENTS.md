# AGENTS.md — transcript-monster

## Project Overview

Monorepo with two services orchestrated by Docker Compose:
- **backend/** — Python 3.14, FastAPI, PostgreSQL, LangGraph AI pipeline (port 8000)
- **frontend/** — Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui (port 3000)

## Developer Commands

### Full stack (Docker)
```bash
docker compose up --build    # start all services (db → backend → frontend)
docker compose down          # stop all
docker compose logs -f       # follow logs
```

### Backend (Python/FastAPI)
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000   # dev server
```
- Entry point: `backend/app/main.py`
- No test framework configured yet
- No linter/formatter configured yet
- Dependencies: `pip install -r requirements.txt`

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Next.js 16 with Turbopack
npm run build        # production build (output: standalone)
npm run lint         # eslint (Next.js config)
```
- Path alias: `@/*` → `./*` (root of frontend/)
- Strict TypeScript enabled

## Environment Setup

Copy `.env.example` to `.env` and fill in values. Required:
- **Database**: either `DATABASE_URL` or all of `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **LLM**: `LLLM_PROVIDER` = `openrouter` or `anthropic`, plus corresponding `*_API_KEY` and `*_MODEL`
- **Frontend**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)

Backend loads `.env` via pydantic-settings (`env_file=".env"`). Frontend reads `NEXT_PUBLIC_API_URL` at build time.

## Architecture

### Backend (`backend/app/`)
```
app/
  main.py            # FastAPI app, lifespan init_db, /health endpoint
  api/
    transcript.py    # YouTube transcript fetch + AI processing endpoints
    chat.py          # Chat with transcript endpoints
  core/
    config.py        # pydantic-settings Settings, env validation
    logging.py       # logging setup
  db/
    base.py          # SQLAlchemy Base
    init_db.py       # creates tables on startup
    session.py       # engine + get_db dependency
  models/
    transcript.py    # Transcript SQL model
    chat.py          # Chat/Message SQL models
  schemas/           # Pydantic request/response schemas
  services/
    transcript.py    # YouTube transcript fetching
    ai/              # LangGraph AI pipeline
      graph.py       # LangGraph workflow
      llm.py         # LLM provider abstraction
      prompts.py     # system/user prompts
      state.py       # graph state definition
```

### Frontend (`frontend/`)
- App Router under `frontend/app/`
- Components in `frontend/components/` (shadcn/ui pattern)
- Custom hooks in `frontend/hooks/`
- Shared utilities in `frontend/lib/`
- TypeScript types in `frontend/types/`

## Key Conventions

- No tests exist yet — if adding tests, pick a framework and document it here
- No CI/CD configured
- Docker Compose handles service startup order via healthchecks (db → backend → frontend)
