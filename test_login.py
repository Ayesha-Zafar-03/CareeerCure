#!/usr/bin/env python3
"""Test script to verify admin login credentials."""
import requests
import json

def test_admin_login():
    """Test admin login via direct API call."""
    url = "http://localhost:8000/api/auth/login"
    
    # Login data in form format (as required by OAuth2PasswordRequestForm)
    login_data = {
        "username": "admin@careercure.com",
        "password": "admin123"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        print("🔐 Testing admin login...")
        print(f"URL: {url}")
        print(f"Data: {login_data}")
        
        response = requests.post(url, data=login_data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"Access Token: {result.get('access_token', 'Not found')[:50]}...")
            print(f"User: {result.get('user', 'Not found')}")
            return True
        else:
            print("❌ Login failed!")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Is it running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend_health():
    """Test if backend is responding."""
    try:
        response = requests.get("http://localhost:8000/docs")
        if response.status_code == 200:
            print("✅ Backend is responding")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 CareerCure Admin Login Test")
    print("=" * 40)
    
    # Test backend health first
    if not test_backend_health():
        print("\n🔴 Backend is not responding. Please check if it's running.")
        exit(1)
    
    print()
    # Test admin login
    if test_admin_login():
        print("\n🟢 Admin credentials are working correctly!")
    else:
        print("\n🔴 Admin login is not working. Check backend logs.")