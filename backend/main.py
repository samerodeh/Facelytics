"""Facelytics API — face detection, comparison, and user authentication."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db.db import close_db, init_db
from routes import auth, embeddings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: prepare the database. Failing to connect should not crash the
    # server — it can still serve /health and /docs while the DB is brought up.
    try:
        init_db()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Database initialization failed at startup: %s", exc)
    yield
    # Shutdown
    close_db()


app = FastAPI(
    title="Facelytics API",
    description="API for face detection, comparison, and user authentication.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(embeddings.router)


@app.get("/", tags=["health"])
def root():
    return {"name": "Facelytics API", "version": app.version, "docs": "/docs"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
