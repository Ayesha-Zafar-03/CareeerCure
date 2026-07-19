#!/usr/bin/env python3
"""
Script to manually activate a user for testing purposes.
Run this to activate a user account without email verification.
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.config import settings

def activate_user(email: str):
    """Activate a user account by email."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email '{email}' not found.")
            return False
            
        if user.is_active:
            print(f"✅ User '{email}' is already active.")
            return True
            
        user.is_active = True
        db.commit()
        print(f"✅ User '{email}' has been activated successfully.")
        return True
        
    except Exception as e:
        print(f"❌ Error activating user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python activate_user.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    activate_user(email)