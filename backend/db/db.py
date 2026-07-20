"""Database access layer.

Uses a psycopg2 connection pool and a context manager so connections are
reused and always returned/closed correctly. Nothing here runs at import
time — call ``init_db()`` once during application startup (see the FastAPI
lifespan handler in ``main.py``).
"""

import logging
from contextlib import contextmanager

import bcrypt
from psycopg2.pool import SimpleConnectionPool

from config import settings

logger = logging.getLogger(__name__)

_pool: SimpleConnectionPool | None = None


CREATE_EMBEDDINGS_TABLE = """
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    person_name VARCHAR(100) UNIQUE NOT NULL,
    embedding FLOAT8[] NOT NULL
);
"""

CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
"""


def init_db() -> None:
    """Create the connection pool and ensure required tables exist."""
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(
            settings.db_pool_min,
            settings.db_pool_max,
            **settings.dsn,
        )
        logger.info("Database connection pool created (%s:%s/%s)",
                    settings.db_host, settings.db_port, settings.db_name)

    with get_cursor() as cursor:
        cursor.execute(CREATE_EMBEDDINGS_TABLE)
        cursor.execute(CREATE_USERS_TABLE)
    logger.info("Database tables verified.")


def close_db() -> None:
    """Close every pooled connection. Called during application shutdown."""
    global _pool
    if _pool is not None:
        _pool.closeall()
        _pool = None
        logger.info("Database connection pool closed.")


@contextmanager
def get_cursor(commit: bool = True):
    """Yield a cursor from a pooled connection, committing on success."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialized. Call init_db() first.")

    conn = _pool.getconn()
    try:
        with conn.cursor() as cursor:
            yield cursor
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


# --- Users -----------------------------------------------------------------

def create_user(username: str, email: str, password: str) -> bool:
    try:
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        with get_cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                (username, email, password_hash),
            )
        return True
    except Exception as exc:
        logger.error("Error creating user: %s", exc)
        return False


def check_user(email: str, password: str) -> dict | None:
    with get_cursor(commit=False) as cursor:
        cursor.execute(
            "SELECT id, username, email, password_hash FROM users WHERE email = %s",
            (email,),
        )
        user = cursor.fetchone()
    if user and bcrypt.checkpw(password.encode("utf-8"), user[3].encode("utf-8")):
        return {"id": user[0], "username": user[1], "email": user[2]}
    return None


def user_exists(email: str) -> bool:
    with get_cursor(commit=False) as cursor:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        return cursor.fetchone() is not None


def delete_user(email: str, password: str) -> bool:
    """Delete a user account after verifying their password."""
    if check_user(email, password) is None:
        return False
    with get_cursor() as cursor:
        cursor.execute("DELETE FROM users WHERE email = %s", (email,))
    return True


# --- Embeddings ------------------------------------------------------------

def insert_embedding(name: str, embedding: list[float]) -> None:
    embedding = [float(x) for x in embedding]
    with get_cursor() as cursor:
        cursor.execute(
            "INSERT INTO embeddings (person_name, embedding) VALUES (%s, %s)",
            (name, embedding),
        )
    logger.info("Embedding inserted for %s", name)


def embedding_exists(person_name: str) -> bool:
    with get_cursor(commit=False) as cursor:
        cursor.execute("SELECT id FROM embeddings WHERE person_name = %s", (person_name,))
        return cursor.fetchone() is not None


def delete_embedding(person_name: str) -> bool:
    """Delete an embedding. Returns True if a row was actually removed."""
    with get_cursor() as cursor:
        cursor.execute("DELETE FROM embeddings WHERE person_name = %s", (person_name,))
        return cursor.rowcount > 0


def rename_embedding(person_name: str, new_person_name: str) -> bool:
    """Rename an embedding's person. Returns True if a row was updated."""
    with get_cursor() as cursor:
        cursor.execute(
            "UPDATE embeddings SET person_name = %s WHERE person_name = %s",
            (new_person_name, person_name),
        )
        return cursor.rowcount > 0


def list_embeddings() -> list[dict]:
    with get_cursor(commit=False) as cursor:
        cursor.execute("SELECT id, person_name FROM embeddings ORDER BY id DESC")
        rows = cursor.fetchall()
    return [{"id": r[0], "person_name": r[1]} for r in rows]
