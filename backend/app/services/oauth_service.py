"""
OAuth service for Google and LinkedIn authentication
"""

import httpx
from typing import Optional, Dict, Any
from urllib.parse import urlencode
from app.core.config import settings
from app.core.security import create_access_token
from app.core.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


def _clean_url(url: str) -> str:
    """Normalize a base URL so redirect URIs never get a double slash."""
    return url.strip().rstrip("/")


class OAuthService:
    
    @staticmethod
    def get_google_auth_url() -> str:
        """Generate Google OAuth URL"""
        base_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": f"{_clean_url(settings.BACKEND_URL)}/api/auth/google/callback",
            "scope": "openid email profile",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        return f"{base_url}?{urlencode(params)}"
    
    @staticmethod
    def get_linkedin_auth_url() -> str:
        """Generate LinkedIn OAuth URL"""
        base_url = "https://www.linkedin.com/oauth/v2/authorization"
        params = {
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "redirect_uri": f"{_clean_url(settings.BACKEND_URL)}/api/auth/linkedin/callback",
            "scope": "r_liteprofile r_emailaddress",
            "response_type": "code",
            "state": "random_state_string"  # In production, use a secure random string
        }
        
        return f"{base_url}?{urlencode(params)}"
    
    @staticmethod
    async def exchange_google_code(code: str) -> Optional[Dict[str, Any]]:
        """Exchange Google authorization code for user info"""
        try:
            logger.info("Starting Google code exchange...")
            
            # Exchange code for access token
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{_clean_url(settings.BACKEND_URL)}/api/auth/google/callback"
            }
            
            logger.info(f"Token exchange redirect_uri: {token_data['redirect_uri']}")
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                
                if token_response.status_code != 200:
                    logger.error(f"Google token exchange failed with status {token_response.status_code}")
                    logger.error(f"Response: {token_response.text}")
                    return {"error": f"Google token exchange failed ({token_response.status_code}): {token_response.text[:200]}"}
                
                token_response.raise_for_status()
                token_json = token_response.json()
                
                access_token = token_json.get("access_token")
                if not access_token:
                    logger.error("No access token received from Google")
                    return {"error": "No access token received from Google"}
                
                logger.info("Successfully received access token from Google")
                
                # Get user info
                user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
                headers = {"Authorization": f"Bearer {access_token}"}
                
                user_response = await client.get(user_info_url, headers=headers)
                
                if user_response.status_code != 200:
                    logger.error(f"Google user info fetch failed with status {user_response.status_code}")
                    logger.error(f"Response: {user_response.text}")
                    return {"error": f"Google user info fetch failed ({user_response.status_code})"}
                
                user_response.raise_for_status()
                user_data = user_response.json()
                
                logger.info(f"Successfully retrieved user info for: {user_data.get('email')}")
                
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "name": user_data.get("name"),
                    "picture": user_data.get("picture"),
                    "provider": "google"
                }
                
        except httpx.HTTPStatusError as e:
            error_body = e.response.text[:300]
            logger.error(f"HTTP error exchanging Google code: {e.response.status_code} - {error_body}")
            return {"error": f"Google HTTP error {e.response.status_code}: {error_body}"}
        except Exception as e:
            logger.error(f"Error exchanging Google code: {str(e)}", exc_info=True)
            return {"error": f"Google exchange error: {str(e)}"}
    
    @staticmethod
    async def exchange_linkedin_code(code: str) -> Optional[Dict[str, Any]]:
        """Exchange LinkedIn authorization code for user info"""
        try:
            # Exchange code for access token
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            token_data = {
                "client_id": settings.LINKEDIN_CLIENT_ID,
                "client_secret": settings.LINKEDIN_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{settings.BACKEND_URL}/api/auth/linkedin/callback"
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_json = token_response.json()
                
                access_token = token_json.get("access_token")
                if not access_token:
                    logger.error("No access token received from LinkedIn")
                    return None
                
                headers = {"Authorization": f"Bearer {access_token}"}
                
                # Get profile info
                profile_response = await client.get(
                    "https://api.linkedin.com/v2/me", 
                    headers=headers
                )
                profile_response.raise_for_status()
                profile_data = profile_response.json()
                
                # Get email info
                email_response = await client.get(
                    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
                    headers=headers
                )
                email_response.raise_for_status()
                email_data = email_response.json()
                
                # Extract email
                email = None
                if email_data.get("elements"):
                    email = email_data["elements"][0]["handle~"]["emailAddress"]
                
                # Extract name
                first_name = profile_data.get("localizedFirstName", "")
                last_name = profile_data.get("localizedLastName", "")
                full_name = f"{first_name} {last_name}".strip()
                
                return {
                    "id": profile_data.get("id"),
                    "email": email,
                    "name": full_name,
                    "provider": "linkedin"
                }
                
        except Exception as e:
            logger.error(f"Error exchanging LinkedIn code: {str(e)}")
            return None
    
    @staticmethod
    def create_or_get_user(user_data: Dict[str, Any], db: Session) -> Optional[User]:
        """Create or get existing user from OAuth data"""
        try:
            email = user_data.get("email")
            if not email:
                logger.error("No email provided in OAuth data")
                return None
            
            # Check if user already exists
            user = db.query(User).filter(User.email == email).first()
            
            if user:
                # Update user info if needed
                if user_data.get("name") and not user.full_name:
                    user.full_name = user_data["name"]
                user.updated_at = datetime.now(timezone.utc)
                db.commit()
                return user
            else:
                # Create new user
                new_user = User(
                    email=email,
                    full_name=user_data.get("name", ""),
                    hashed_password="",  # OAuth users don't need password
                    is_active=True,
                    is_verified=True,  # OAuth users are pre-verified
                    oauth_provider=user_data.get("provider"),
                    oauth_id=user_data.get("id")
                )
                
                db.add(new_user)
                db.flush()
                
                # Create an associated profile so the rest of the app works
                from app.models.profile import Profile
                db.add(Profile(user_id=new_user.id))
                
                db.commit()
                db.refresh(new_user)
                return new_user
                
        except Exception as e:
            logger.error(f"Error creating/getting OAuth user: {str(e)}")
            db.rollback()
            return None