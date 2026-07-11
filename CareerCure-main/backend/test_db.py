#!/usr/bin/env python3
"""Simple test to check database connectivity and table creation."""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal
from app.models.user import User
from sqlalchemy import inspect, text

def test_database():
    """Test database connection and basic operations."""
    try:
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            print("✓ Database connection successful")
        
        # Check if tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"✓ Found {len(tables)} tables: {tables}")
        
        # Test creating a session
        db = SessionLocal()
        try:
            # Try a simple query
            user_count = db.query(User).count()
            print(f"✓ Found {user_count} users in database")
        finally:
            db.close()
            
        print("✓ Database test passed!")
        return True
        
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False

if __name__ == "__main__":
    test_database()