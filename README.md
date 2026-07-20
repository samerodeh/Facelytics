# Facelytics

A face recognition web app: detect faces, compare two images, and manage a
biometric registry. FastAPI + InsightFace backend, React + Vite + Tailwind frontend,
PostgreSQL storage.

![Stack](https://img.shields.io/badge/FastAPI-InsightFace-34e5b0) ![Frontend](https://img.shields.io/badge/React-Vite%20%2B%20TS-34e5b0)

## Features
- **Enroll** a face from an image or webcam and store its embedding under a name.
- **Compare** two images and get a cosine-similarity match score.
- **Manage** the registry — rename or delete stored embeddings.
- **Auth** — register / login with bcrypt-hashed passwords.

## Quick start
See [`CLAUDE.md`](CLAUDE.md) for full setup. In short:

```bash
# 1. Postgres
brew services start postgresql@16
psql -d postgres -c "CREATE ROLE postgres LOGIN SUPERUSER PASSWORD 'postgres';"

# 2. Backend  (http://localhost:8010)
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn main:app --reload --port 8010

# 3. Frontend (http://localhost:3000)
cd frontend && npm install && cp .env.example .env && npm run dev
```

## API
Interactive docs at `http://localhost:8010/docs`.

| Method | Path                  | Description                        |
| ------ | --------------------- | ---------------------------------- |
| POST   | `/auth/register`      | Create an account                  |
| POST   | `/auth/login`         | Authenticate                       |
| DELETE | `/auth/forget_account`| Delete an account (email+password) |
| POST   | `/create-embedding`   | Enroll a face (multipart image)    |
| POST   | `/compare-faces`      | Compare two face images            |
| GET    | `/embeddings`         | List enrolled identities           |
| PUT    | `/update-embedding`   | Rename an embedding                |
| DELETE | `/delete-embedding`   | Delete an embedding                |
| GET    | `/health`             | Liveness probe                     |
