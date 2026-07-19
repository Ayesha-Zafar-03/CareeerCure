#!/usr/bin/env python3
"""
Test script to verify admin login works correctly.
"""
import requests
import json

def test_admin_login():
    """Test admin login via API"""
    url = "http://localhost:8000/api/auth/login"
    
    # Prepare form data as the API expects
    form_data = {
        "username": "admin@careercure.com",
        "password": "admin123"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        print("🔍 Testing admin login...")
        print(f"URL: {url}")
        print(f"Data: {form_data}")
        
        response = requests.post(url, data=form_data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"Access Token: {result.get('access_token', 'N/A')[:20]}...")
            print(f"User Info: {result.get('user', 'N/A')}")
        else:
            print("❌ Login failed!")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_admin_login()