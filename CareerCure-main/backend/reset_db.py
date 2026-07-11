"""
Reset database - drop all tables and recreate with new schema
"""
import logging
from app.core.database import engine, Base, SessionLocal
from app.models import career, user, profile  # Import all models to register them

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    logger.info("Creating all tables with new schema...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("✅ Database reset complete! Run seed script to populate data.")