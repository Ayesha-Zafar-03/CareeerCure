#!/usr/bin/env python3
"""
Test admin API endpoints.
"""
import requests

def test_admin_api():
    """Test admin login and stats API"""
    # First login to get token
    login_url = "http://localhost:8000/api/auth/login"
    form_data = {
        "username": "admin@careercure.com",
        "password": "admin123"
    }
    
    print("🔍 Testing admin login...")
    login_response = requests.post(login_url, data=form_data, headers={
        "Content-Type": "application/x-www-form-urlencoded"
    })
    
    if login_response.status_code != 200:
        print("❌ Login failed!")
        return
    
    token = login_response.json()["access_token"]
    print("✅ Login successful, got token")
    
    # Test admin stats API
    stats_url = "http://localhost:8000/api/admin/stats"
    print("🔍 Testing admin stats API...")
    
    stats_response = requests.get(stats_url, headers={
        "Authorization": f"Bearer {token}"
    })
    
    print(f"Status Code: {stats_response.status_code}")
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print("✅ Admin stats API working!")
        print(f"Stats: {stats}")
    else:
        print("❌ Admin stats API failed!")
        print(f"Error: {stats_response.text}")

if __name__ == "__main__":
    test_admin_api()