#!/usr/bin/env python3
"""
Script to make a user an admin.
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.config import settings

def make_admin(email: str):
    """Make a user an admin by email."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email '{email}' not found.")
            return False
            
        if user.is_admin:
            print(f"✅ User '{email}' is already an admin.")
            return True
            
        user.is_admin = True
        user.is_active = True
        user.is_verified = True
        db.commit()
        print(f"✅ User '{email}' has been made an admin successfully.")
        return True
        
    except Exception as e:
        print(f"❌ Error making user admin: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    make_admin(email)