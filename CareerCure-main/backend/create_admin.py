#!/usr/bin/env python3
"""
Script to create an admin user for testing purposes.
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.profile import Profile
from app.core.config import settings
from app.core.security import hash_password

def create_admin_user():
    """Create admin user with email: admin@careercure.com and password: admin123"""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        admin_email = "admin@careercure.com"
        admin_password = "admin123"
        admin_name = "Admin User"
        
        # Check if admin user already exists
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            print(f"✅ Admin user already exists: {admin_email}")
            # Update password to ensure it's correct
            existing_user.hashed_password = hash_password(admin_password)
            existing_user.is_active = True
            existing_user.full_name = admin_name
            db.commit()
            print(f"✅ Admin password updated and user activated")
            return True
        
        # Create new admin user
        admin_user = User(
            email=admin_email,
            full_name=admin_name,
            hashed_password=hash_password(admin_password),
            is_active=True,  # Admin user should be active immediately
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Create profile for admin user
        profile = Profile(user_id=admin_user.id)
        db.add(profile)
        db.commit()
        
        print(f"✅ Admin user created successfully:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Status: Active")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()