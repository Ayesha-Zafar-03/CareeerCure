#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

import requests
import json

def test_with_different_email():
    """Test registration with a different email to see delivery"""
    
    print("🧪 Testing with Different Email Address...\n")
    
    # Ask user for a different email to test with
    print("To test if the issue is Gmail self-sending filtering:")
    print("We can try sending to a different email address.")
    print("\nDo you have another email address we can test with?")
    print("(This will help confirm if the issue is Gmail filtering)")
    
    # For now, let's just show what would happen
    different_email = input("\nEnter a different email to test (or press Enter to skip): ").strip()
    
    if not different_email:
        print("Skipping different email test.")
        return
    
    registration_data = {
        "email": different_email,
        "full_name": "Test User Different Email",
        "password": "testpass123"
    }
    
    try:
        print(f"📧 Testing registration with: {different_email}")
        response = requests.post("http://localhost:8000/api/auth/register", 
                               json=registration_data)
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 201:
            print(f"\n✅ Registration successful!")
            print(f"📧 Check {different_email} for the verification email")
            print(f"🔢 OTP: {result.get('otp')} (also in API response)")
        else:
            print("❌ Registration failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def show_current_solution():
    """Show the current working solution"""
    
    print("🎯 CURRENT WORKING SOLUTION:")
    print("="*50)
    print()
    print("Since the OTP system is working correctly, you have two options:")
    print()
    print("1. 📱 USE THE OTP FROM API RESPONSE (Development)")
    print("   - Register a user via your frontend")
    print("   - The API returns the OTP in the response")
    print("   - Use that OTP to verify the account")
    print()
    print("2. 🔍 FIND THE EMAIL IN GMAIL")
    print("   - Check your Spam folder")
    print("   - Check 'All Mail' folder")
    print("   - Search for 'CareerCure' in Gmail")
    print("   - Check 'Promotions' tab")
    print()
    print("3. 📧 TEST WITH DIFFERENT EMAIL")
    print("   - Use a different email address (not y0685670@gmail.com)")
    print("   - This will avoid Gmail's self-sending filters")
    print()
    print("For production, this won't be an issue since users")
    print("will have different email addresses.")

if __name__ == "__main__":
    print("📧 CareerCure Email Testing Tool\n")
    
    show_current_solution()
    print()
    
    # Offer to test with different email
    test_with_different_email()