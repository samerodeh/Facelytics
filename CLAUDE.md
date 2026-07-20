# Facelytics

Face recognition web application. A FastAPI backend runs face detection and
embedding comparison (InsightFace `buffalo_l`) with user authentication, and a
React + Vite + TypeScript frontend provides the console UI.

## Architecture

```
Facelytics/
├── backend/                 FastAPI service
│   ├── main.py              App entrypoint: lifespan, CORS, health routes
│   ├── config.py            Env-driven settings (pydantic-settings)
│   ├── routes/
│   │   ├── auth.py          /auth/register, /auth/login, /auth/forget_account
│   │   └── embeddings.py    /create-embedding, /compare-faces, /embeddings, …
│   ├── db/db.py             psycopg2 connection pool + queries (users, embeddings)
│   ├── models/
│   │   ├── model.py         Lazy-loaded InsightFace model (get_model())
│   │   └── schemas.py       Pydantic request models
│   └── utils/face.py        get_embedding(), cosine_similarity()
└── frontend/                React + Vite + Tailwind SPA
    └── src/
        ├── pages/           LoginPage, RegisterPage, DashboardPage
        ├── components/      Header, FileUpload, CameraCapture, LoadingButton
        ├── contexts/        AuthContext (localStorage-backed)
        └── services/api.ts  Axios client (VITE_API_URL)
```

## Running locally

### Prerequisites
- Python 3.12, Node 18+, PostgreSQL 16 (Homebrew: `brew install postgresql@16`).

### Database
The default cluster user for Homebrew Postgres is your macOS username. The app
connects as `postgres/postgres`; create that role once:
```
brew services start postgresql@16
psql -d postgres -c "CREATE ROLE postgres LOGIN SUPERUSER PASSWORD 'postgres';"
```
Tables are created automatically on backend startup.

### Backend
```
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # adjust DB creds / CORS as needed
uvicorn main:app --reload --port 8010
```
Docs: http://localhost:8010/docs · Health: http://localhost:8010/health
The InsightFace model (~300 MB) downloads to `~/.insightface` on the first
face request.

### Frontend
```
cd frontend
npm install
cp .env.example .env          # VITE_API_URL, defaults to http://localhost:8010
npm run dev                    # http://localhost:3000
```

## Conventions
- All backend config comes from environment variables (`config.py`); never hard-code
  secrets. `.env` is git-ignored.
- The database layer uses a pooled connection via the `get_cursor()` context manager —
  do not open raw `psycopg2.connect()` calls in routes.
- The face model is loaded lazily; importing modules must have no I/O side effects.
- Backend default port is **8010** (8000 is often taken locally); keep the frontend
  `VITE_API_URL` and Vite proxy target in sync if you change it.
