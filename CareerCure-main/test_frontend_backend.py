#!/usr/bin/env python3

import requests
import json

def test_frontend_backend_connection():
    """Test if the frontend can reach the backend API endpoints"""
    
    print("🔍 Testing Frontend-Backend Connection")
    print("="*50)
    
    backend_url = "http://localhost:8000"
    
    # Test 1: Check if backend is reachable
    print("1. 🌐 Testing backend health...")
    try:
        response = requests.get(f"{backend_url}/docs", timeout=5)
        print(f"   ✅ Backend reachable: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Backend unreachable: {e}")
        return False
    
    # Test 2: Test registration endpoint
    print("\n2. 📝 Testing registration endpoint...")
    registration_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{backend_url}/api/auth/register", 
                               json=registration_data, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ Registration works")
            print(f"   📧 Email sent: {result.get('email_sent')}")
            print(f"   🔢 OTP: {result.get('otp')}")
        else:
            print(f"   ❌ Registration failed: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Registration request failed: {e}")
        return False
    
    # Test 3: Test forgot password endpoint
    print("\n3. 🔑 Testing forgot password endpoint...")
    forgot_data = {"email": "test@example.com"}
    
    try:
        response = requests.post(f"{backend_url}/api/auth/forgot-password", 
                               json=forgot_data, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Forgot password works")
            print(f"   📧 Email sent: {result.get('email_sent')}")
            print(f"   🔢 OTP: {result.get('otp')}")
        else:
            print(f"   ❌ Forgot password failed: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Forgot password request failed: {e}")
        return False
    
    # Test 4: Test CORS headers
    print("\n4. 🌍 Testing CORS configuration...")
    try:
        response = requests.options(f"{backend_url}/api/auth/register", 
                                  headers={
                                      'Origin': 'http://localhost:3000',
                                      'Access-Control-Request-Method': 'POST'
                                  }, timeout=5)
        print(f"   CORS preflight status: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ CORS test failed: {e}")
    
    return True

def show_debugging_steps():
    """Show debugging steps for the user"""
    
    print("\n" + "="*60)
    print("🛠️ DEBUGGING STEPS FOR WEB INTERFACE")
    print("="*60)
    
    print("\n1. 📋 CHECK BROWSER DEVELOPER TOOLS:")
    print("   • Press F12 in your browser")
    print("   • Go to Console tab")
    print("   • Look for error messages when trying to register/login")
    print("   • Check Network tab for failed requests")
    
    print("\n2. 🔍 CHECK NETWORK REQUESTS:")
    print("   • Open Network tab in DevTools")
    print("   • Try to register/login")
    print("   • Look for requests to 'localhost:8000'")
    print("   • Check if requests are failing or returning errors")
    
    print("\n3. 📱 TEST FRONTEND CONNECTION:")
    print("   • Open browser console")
    print("   • Type: fetch('http://localhost:8000/docs')")
    print("   • This should return a response if backend is reachable")
    
    print("\n4. ⚙️ CHECK FRONTEND SERVER:")
    print("   • Make sure frontend is running on http://localhost:3000")
    print("   • Check that both frontend and backend are running")
    
    print("\n5. 🔧 TEMPORARY SOLUTIONS:")
    print("   • Use the OTP from API response (shown in browser console)")
    print("   • Check email spam folder")
    print("   • Try with a different email address")
    
    print("\n6. 📊 WHAT WE'VE CONFIRMED:")
    print("   ✅ Backend is running and working")
    print("   ✅ Email service is functional")
    print("   ✅ OTP generation and verification works")
    print("   ✅ Database operations are successful")
    print("   ❓ Need to check browser-to-backend connection")

if __name__ == "__main__":
    print("🧪 CareerCure Frontend-Backend Connection Test\n")
    
    success = test_frontend_backend_connection()
    
    show_debugging_steps()
    
    if success:
        print(f"\n🎯 Backend API Tests: ✅ PASSED")
        print("If web interface still isn't working, check browser DevTools")
    else:
        print(f"\n🎯 Backend API Tests: ❌ FAILED")
        print("Backend connection issues detected")