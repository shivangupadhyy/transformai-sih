import logging
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger("transformai.database")


class Base(DeclarativeBase):
    pass


def normalize_database_url(database_url: str) -> str:
    """Use Psycopg 3 even when a copied Supabase URL has its default prefix."""
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    return database_url


def create_resilient_engine():
    configured_url = normalize_database_url(get_settings().database_url)
    try:
        connect_args = {"check_same_thread": False} if configured_url.startswith("sqlite") else {}
        test_engine = create_engine(configured_url, connect_args=connect_args, pool_pre_ping=True)
        # Test connection
        with test_engine.connect() as conn:
            pass
        return test_engine
    except Exception as exc:
        logger.warning(
            f"Could not connect to configured database ({configured_url}): {exc}. "
            "Falling back to local SQLite database."
        )
        return create_engine(
            "sqlite:///./transformai.db",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )


engine = create_resilient_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


