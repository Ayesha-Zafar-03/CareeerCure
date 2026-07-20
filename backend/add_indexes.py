"""Add missing indexes to existing database tables."""
import logging
from app.core.database import engine
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INDEXES = [
    "CREATE INDEX IF NOT EXISTS ix_profiles_user_id ON profiles (user_id)",
    "CREATE INDEX IF NOT EXISTS ix_roadmaps_user_id ON roadmaps (user_id)",
    "CREATE INDEX IF NOT EXISTS ix_chat_messages_user_conversation ON chat_messages (user_id, conversation_id)",
    "CREATE INDEX IF NOT EXISTS ix_planned_courses_user_course ON planned_courses (user_id, course_id)",
]

def add_indexes():
    with engine.connect() as conn:
        for stmt in INDEXES:
            try:
                conn.execute(text(stmt))
                logger.info(f"Index created: {stmt.split('ON')[1].strip()}")
            except Exception as e:
                logger.warning(f"Could not create index: {e}")
        conn.commit()
    logger.info("All indexes applied.")

if __name__ == "__main__":
    add_indexes()
