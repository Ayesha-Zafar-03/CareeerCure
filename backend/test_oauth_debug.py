"""
Test OAuth configuration and debug issues
Run: python test_oauth_debug.py
"""
import asyncio
import httpx
from app.core.config import settings

async def test_oauth_flow():
    print("=" * 60)
    print("OAuth Configuration Debug Test")
    print("=" * 60)
    
    print("\n1. Checking Environment Variables:")
    print(f"   GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID[:20]}...")
    print(f"   GOOGLE_CLIENT_SECRET: {'*' * len(settings.GOOGLE_CLIENT_SECRET)}")
    print(f"   BACKEND_URL: {settings.BACKEND_URL}")
    print(f"   FRONTEND_URL: {settings.FRONTEND_URL}")
    
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"
    print(f"\n2. OAuth Redirect URI:")
    print(f"   {redirect_uri}")
    print(f"   ⚠️  This MUST be added to Google Cloud Console!")
    
    print("\n3. Testing OAuth Status Endpoint:")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.BACKEND_URL}/api/auth/oauth/status")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ OAuth Status: {data}")
                if data.get("google_configured"):
                    print("   ✅ Google OAuth is configured")
                else:
                    print("   ❌ Google OAuth NOT configured")
            else:
                print(f"   ❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ❌ Cannot reach backend: {e}")
    
    print("\n4. Testing Google Token Exchange (simulation):")
    print("   This would normally exchange the authorization code for a token")
    print(f"   Token URL: https://oauth2.googleapis.com/token")
    print(f"   User Info URL: https://www.googleapis.com/oauth2/v2/userinfo")
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Verify the redirect URI is in Google Cloud Console")
    print("2. Check Vercel backend logs for detailed error messages")
    print("3. Test the OAuth flow and check browser network tab")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_oauth_flow())
