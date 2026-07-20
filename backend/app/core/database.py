import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database. Raises on failure so a broken DB is not hidden."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

def init_db_pool():
    """Eagerly initialize the connection pool to avoid slow first request."""
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Database connection pool initialized")
