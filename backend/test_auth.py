#!/usr/bin/env python3

import requests
import json

def test_registration():
    """Test user registration and OTP sending"""
    
    # Test registration endpoint
    registration_data = {
        "email": "y0685670@gmail.com",
        "full_name": "Test User",
        "password": "testpass123"
    }
    
    try:
        print("Testing registration endpoint...")
        response = requests.post("http://localhost:8000/api/auth/register", 
                               json=registration_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Registration successful - OTP should be sent!")
            return True
        else:
            print("❌ Registration failed")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server at http://localhost:8000")
        print("Make sure the backend server is running")
        return False
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return False

def test_otp_resend():
    """Test OTP resend functionality"""
    
    resend_data = {
        "email": "y0685670@gmail.com",
        "purpose": "email_verification"
    }
    
    try:
        print("\nTesting OTP resend endpoint...")
        response = requests.post("http://localhost:8000/api/auth/resend-otp", 
                               json=resend_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ OTP resend successful!")
            return True
        else:
            print("❌ OTP resend failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during OTP resend: {e}")
        return False

def test_email_endpoint():
    """Test the dedicated email test endpoint"""
    
    test_data = {
        "email": "y0685670@gmail.com"
    }
    
    try:
        print("\nTesting email test endpoint...")
        response = requests.post("http://localhost:8000/api/auth/test-email", 
                               json=test_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Email test successful!")
            return True
        else:
            print("❌ Email test failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during email test: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing CareerCure Authentication & Email System\n")
    
    # Test email endpoint first
    email_result = test_email_endpoint()
    
    # Test registration
    reg_result = test_registration()
    
    # Test OTP resend
    resend_result = test_otp_resend()
    
    print(f"\n📊 Test Results:")
    print(f"Email Test: {'✅ PASS' if email_result else '❌ FAIL'}")
    print(f"Registration: {'✅ PASS' if reg_result else '❌ FAIL'}")
    print(f"OTP Resend: {'✅ PASS' if resend_result else '❌ FAIL'}")
    
    if all([email_result, reg_result, resend_result]):
        print("\n🎉 All tests passed! OTP system should be working now.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")