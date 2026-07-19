#!/usr/bin/env python3
"""
Setup script to create and fix test users for CareerCure.
This addresses the bcrypt compatibility issues and creates active test accounts.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.profile import Profile
from app.core.config import settings
from app.core.security import hash_password

def setup_test_users():
    """Create or fix test users with proper password hashing."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    test_users = [
        {"email": "admin@careercure.com", "full_name": "Admin User", "password": "admin123"},
        {"email": "john@example.com", "full_name": "John Doe", "password": "password123"},
        {"email": "jane@example.com", "full_name": "Jane Smith", "password": "password123"},
    ]
    
    try:
        for user_data in test_users:
            email = user_data["email"]
            full_name = user_data["full_name"] 
            password = user_data["password"]
            
            # Check if user exists
            user = db.query(User).filter(User.email == email).first()
            
            if user:
                # Update existing user with new password hash and activate
                user.hashed_password = hash_password(password)
                user.is_active = True
                user.full_name = full_name
                db.commit()
                print(f"✅ Updated user: {email}")
            else:
                # Create new user
                new_user = User(
                    email=email,
                    full_name=full_name,
                    hashed_password=hash_password(password),
                    is_active=True  # Skip email verification for test users
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                # Create profile
                profile = Profile(user_id=new_user.id)
                db.add(profile)
                db.commit()
                
                print(f"✅ Created user: {email}")
        
        print("\n🎉 Test users setup completed!")
        print("\nYou can now login with:")
        for user_data in test_users:
            print(f"   📧 {user_data['email']} / 🔑 {user_data['password']}")
            
    except Exception as e:
        print(f"❌ Error setting up test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_test_users()