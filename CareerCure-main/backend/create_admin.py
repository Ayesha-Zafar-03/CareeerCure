"""
Create admin user script
"""

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_admin_user(email: str, password: str, full_name: str):
    """Create or update user to be admin"""
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # Make existing user admin
            user.is_admin = True
            user.is_active = True
            user.is_verified = True
            logger.info(f"Updated existing user {email} to admin")
        else:
            # Create new admin user
            hashed_password = hash_password(password)
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=hashed_password,
                is_active=True,
                is_verified=True,
                is_admin=True
            )
            db.add(user)
            logger.info(f"Created new admin user {email}")
        
        db.commit()
        db.refresh(user)
        logger.info(f"Admin user ready: {user.email} (ID: {user.id})")
        
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Create admin user - change these values
    create_admin_user(
        email="admin@careercure.com",
        password="admin123",
        full_name="Admin User"
    )