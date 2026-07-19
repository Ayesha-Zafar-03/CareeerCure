"""
Update database schema for OAuth fields
"""

from app.core.database import engine, Base
from app.models.user import User
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_schema():
    """Add OAuth columns to existing users table"""
    try:
        with engine.begin() as connection:
            # Add OAuth and admin columns if they don't exist
            try:
                connection.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
                    ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
                """))
                logger.info("Successfully added OAuth and admin columns to users table")
            except Exception as e:
                logger.warning(f"Columns might already exist: {e}")
            
            # Make hashed_password nullable for OAuth users
            try:
                connection.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
                logger.info("Made hashed_password nullable")
            except Exception as e:
                logger.warning(f"Column might already be nullable: {e}")
                
        logger.info("Schema update completed successfully")
        
    except Exception as e:
        logger.error(f"Error updating schema: {e}")
        raise

if __name__ == "__main__":
    update_schema()