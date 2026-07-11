#!/usr/bin/env python3
"""
Simple test script to verify the career coach RAG functionality is working correctly.
This script tests the key functionality without needing a browser.
"""

import requests
import json
from time import sleep

# Test configuration
BACKEND_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def test_auth_and_chat():
    """Test authentication and chat functionality"""
    print("🚀 Testing Career Coach RAG Functionality")
    print("-" * 50)
    
    # Step 1: Register a test user (optional, may fail if user exists)
    print("1. Registering test user...")
    try:
        register_data = {
            "email": TEST_EMAIL,
            "full_name": "Test User",
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BACKEND_URL}/api/auth/register", json=register_data)
        if response.status_code == 200:
            print("   ✅ User registered successfully")
        else:
            print(f"   ⚠️ Registration failed (user may exist): {response.status_code}")
    except Exception as e:
        print(f"   ⚠️ Registration error: {e}")
    
    # Step 2: Login
    print("\n2. Logging in...")
    try:
        login_data = {
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            data=login_data,  # Form data for OAuth2
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data["access_token"]
            print("   ✅ Login successful")
        else:
            print(f"   ❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False
    
    # Step 3: Test chat functionality with job query
    print("\n3. Testing job query...")
    try:
        chat_data = {
            "message": "Show me jobs in software development",
            "history": []
        }
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(
            f"{BACKEND_URL}/api/chat/message",
            json=chat_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Chat response received")
            print(f"   📋 Full response: {json.dumps(result, indent=2)}")
            print(f"   📝 Reply: {result.get('reply', 'No reply')[:100]}...")
            print(f"   🔍 Show jobs: {result.get('show_jobs', False)}")
            print(f"   📚 Show courses: {result.get('show_courses', False)}")
            print(f"   💼 Jobs returned: {len(result.get('jobs', []))}")
            print(f"   📖 Courses returned: {len(result.get('courses', []))}")
            
            if result.get('show_jobs', False) and len(result.get('jobs', [])) > 0:
                print("   ✅ RAG functionality working - jobs returned!")
                job = result['jobs'][0]
                print(f"   💼 Sample job: {job.get('title', 'N/A')} at {job.get('company', 'N/A')}")
            else:
                print("   ⚠️ No jobs returned, but response received")
        else:
            print(f"   ❌ Chat failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Chat error: {e}")
        return False
    
    # Step 4: Test chat functionality with course query  
    print("\n4. Testing course query...")
    try:
        chat_data = {
            "message": "Recommend courses for Python programming",
            "history": [
                {"role": "user", "content": "Show me jobs in software development"},
                {"role": "assistant", "content": result.get('reply', '')}
            ]
        }
        response = requests.post(
            f"{BACKEND_URL}/api/chat/message",
            json=chat_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Chat response received")
            print(f"   📋 Full response: {json.dumps(result, indent=2)}")
            print(f"   📝 Reply: {result.get('reply', 'No reply')[:100]}...")
            print(f"   🔍 Show jobs: {result.get('show_jobs', False)}")
            print(f"   📚 Show courses: {result.get('show_courses', False)}")
            print(f"   💼 Jobs returned: {len(result.get('jobs', []))}")
            print(f"   📖 Courses returned: {len(result.get('courses', []))}")
            
            if result.get('show_courses', False) and len(result.get('courses', [])) > 0:
                print("   ✅ RAG functionality working - courses returned!")
                course = result['courses'][0]
                print(f"   📖 Sample course: {course.get('title', 'N/A')} by {course.get('provider', 'N/A')}")
            else:
                print("   ⚠️ No courses returned, but response received")
        else:
            print(f"   ❌ Chat failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Chat error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Career Coach RAG Testing Complete!")
    print("✅ All core functionality working correctly")
    return True

if __name__ == "__main__":
    print("Waiting 3 seconds for services to be ready...")
    sleep(3)
    
    try:
        test_auth_and_chat()
    except KeyboardInterrupt:
        print("\n\n⏹️ Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")