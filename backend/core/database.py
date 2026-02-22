"""
Database connectivity and persistence spine.
PostgreSQL via SQLAlchemy (lightweight). No ORM models; engine + session + helper placeholders.
"""
from __future__ import annotations

from typing import Generator

from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from core.errors import PipelineError

# Set by lifespan in main.py when DATABASE_URL is present.
_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def init_engine(database_url: str) -> Engine:
    """Create and return the SQLAlchemy engine. Called once from lifespan."""
    global _engine, _session_factory
    if _engine is not None:
        return _engine
    _engine = __create_engine(database_url)
    _session_factory = sessionmaker(
        bind=_engine,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )
    return _engine


def __create_engine(database_url: str) -> Engine:
    from sqlalchemy import create_engine
    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,  # Recycle connections before server idle timeout (provider-agnostic)
    )


def dispose_engine() -> None:
    """Dispose engine and clear session factory. Called on shutdown."""
    global _engine, _session_factory
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _session_factory = None


def get_engine() -> Engine | None:
    """Return the global engine, or None if not initialized."""
    return _engine


def engine_exists() -> bool:
    """Safe check: True if engine was initialized (e.g. DATABASE_URL set). No side effects."""
    return _engine is not None


def check_connection() -> None:
    """
    Run SELECT 1 to verify connectivity. Raises PipelineError if engine is missing or query fails.
    For use in scripts or tests; no new routes.
    """
    if _engine is None:
        raise PipelineError(
            "Database not initialized",
            code="database_error",
            details={"hint": "Set DATABASE_URL and ensure lifespan has run."},
        )
    try:
        with _engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        raise PipelineError(
            "Database connectivity check failed",
            code="database_error",
            details={"error": str(e)},
        ) from e


def get_db() -> Generator[Session, None, None]:
    """Dependency: yield a DB session and close it when done."""
    if _session_factory is None:
        raise RuntimeError("Database not initialized; DATABASE_URL may be unset.")
    session = _session_factory()
    try:
        yield session
    finally:
        session.close()
