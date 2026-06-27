import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile
from app.models.otp import OTP
from app.services.email_service import send_verification_email, send_password_reset_email
from app.services.oauth_service import OAuthService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

OTP_EXPIRE_MINUTES = 10


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def create_otp(email: str, purpose: str, db: Session) -> str:
    # Invalidate old OTPs for same email+purpose
    db.query(OTP).filter(
        OTP.email == email,
        OTP.purpose == purpose,
        OTP.used == False,
    ).update({"used": True})
    db.commit()

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    otp = OTP(email=email, code=code, purpose=purpose, expires_at=expires_at)
    db.add(otp)
    db.commit()
    return code


def verify_otp(email: str, code: str, purpose: str, db: Session) -> bool:
    otp = db.query(OTP).filter(
        OTP.email == email,
        OTP.code == code,
        OTP.purpose == purpose,
        OTP.used == False,
    ).first()

    if not otp:
        return False

    now = datetime.now(timezone.utc)
    expires = otp.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if now > expires:
        return False

    otp.used = True
    db.commit()
    return True


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "email_verification"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Step 1: Register → sends OTP ─────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new account. Sends a 6-digit OTP to the email.
    Account is not active until email is verified.
    """
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.query(User).filter(User.email == req.email).first()
    if existing and existing.is_active:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create or update pending user
    if existing:
        existing.full_name = req.full_name
        existing.hashed_password = hash_password(req.password)
        existing.is_active = False
        db.commit()
        user = existing
    else:
        user = User(
            email=req.email,
            full_name=req.full_name,
            hashed_password=hash_password(req.password),
            is_active=False,   # not active until verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()

    # Send OTP
    code = create_otp(req.email, "email_verification", db)
    sent = send_verification_email(req.email, req.full_name, code)

    return {
        "message": f"Verification code: {code}",  # Show OTP directly
        "email": req.email,
        "email_sent": sent,
        "otp": code  # Direct OTP for development
    }


# ── Step 2: Verify email OTP → activates account ─────────────────────────────

@router.post("/verify-email", response_model=TokenResponse)
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify the OTP sent to email. Returns JWT on success."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    if not verify_otp(req.email, req.otp, "email_verification", db):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    user.is_active = True
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name},
    }


# ── Resend OTP ────────────────────────────────────────────────────────────────

@router.post("/resend-otp")
def resend_otp(req: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend OTP for email verification or password reset."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    code = create_otp(req.email, req.purpose, db)

    if req.purpose == "email_verification":
        sent = send_verification_email(req.email, user.full_name, code)
    else:
        sent = send_password_reset_email(req.email, user.full_name, code)

    return {"message": "OTP resent successfully", "email_sent": sent}


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please verify your email first."
        )

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name},
    }


# ── Refresh Token ─────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: User = Depends(get_current_user)):
    token = create_access_token({"sub": str(current_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": current_user.id, "email": current_user.email, "full_name": current_user.full_name},
    }


# ── Forgot Password → sends OTP ───────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a 6-digit OTP to the email for password reset."""
    user = db.query(User).filter(User.email == req.email).first()

    # Always return 200 to avoid leaking whether email exists
    if not user:
        return {"message": "If that email is registered, a reset code has been sent."}

    code = create_otp(req.email, "password_reset", db)
    sent = send_password_reset_email(req.email, user.full_name, code)

    return {
        "message": f"Password reset code: {code}",  # Show OTP directly for development
        "email_sent": sent,
        "otp": code  # Direct OTP for development
    }


# ── Reset Password with OTP ───────────────────────────────────────────────────

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the OTP sent to email."""
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if not verify_otp(req.email, req.otp, "password_reset", db):
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    user.hashed_password = hash_password(req.new_password)
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}


# ── Change Password (authenticated) ──────────────────────────────────────────

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    current_user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# ── Test Email Endpoint (for debugging) ────────────────────────────────────────

class TestEmailRequest(BaseModel):
    email: EmailStr

@router.post("/test-email")
def test_email(req: TestEmailRequest, db: Session = Depends(get_db)):
    """Test endpoint to debug email sending."""
    from app.services.email_service import send_email
    
    test_html = """
    <h1>Test Email</h1>
    <p>This is a test email from CareerCure.</p>
    <p>If you receive this, email service is working correctly.</p>
    """
    
    result = send_email(req.email, "CareerCure Test Email", test_html)
    
    return {
        "message": "Test email attempted",
        "email_sent": result,
        "recipient": req.email
    }


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
    }


# ── OAuth Authentication ──────────────────────────────────────────────────────

@router.get("/google")
async def google_auth():
    """Redirect to Google OAuth"""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    
    auth_url = OAuthService.get_google_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/linkedin")  
async def linkedin_auth():
    """Redirect to LinkedIn OAuth"""
    if not settings.LINKEDIN_CLIENT_ID:
        raise HTTPException(status_code=501, detail="LinkedIn OAuth not configured")
    
    auth_url = OAuthService.get_linkedin_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Exchange code for user info
        user_data = await OAuthService.exchange_google_code(code)
        if not user_data:
            raise HTTPException(status_code=400, detail="Failed to authenticate with Google")
        
        # Create or get user
        user = OAuthService.create_or_get_user(user_data, db)
        if not user:
            raise HTTPException(status_code=400, detail="Failed to create user account")
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": user.email})
        
        # Redirect to frontend with token
        redirect_url = f"{settings.FRONTEND_URL}/auth/success?token={access_token}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=Google authentication failed"
        return RedirectResponse(url=error_url)


@router.get("/linkedin/callback")
async def linkedin_callback(code: str, db: Session = Depends(get_db)):
    """Handle LinkedIn OAuth callback"""
    try:
        # Exchange code for user info
        user_data = await OAuthService.exchange_linkedin_code(code)
        if not user_data:
            raise HTTPException(status_code=400, detail="Failed to authenticate with LinkedIn")
        
        # Create or get user
        user = OAuthService.create_or_get_user(user_data, db)
        if not user:
            raise HTTPException(status_code=400, detail="Failed to create user account")
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": user.email})
        
        # Redirect to frontend with token
        redirect_url = f"{settings.FRONTEND_URL}/auth/success?token={access_token}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"LinkedIn OAuth callback error: {str(e)}")
        error_url = f"{settings.FRONTEND_URL}/auth/error?message=LinkedIn authentication failed"
        return RedirectResponse(url=error_url)


# ── OAuth Status Endpoints ─────────────────────────────────────────────────────

@router.get("/oauth/status")
async def oauth_status():
    """Check OAuth provider configuration status"""
    return {
        "google_configured": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "linkedin_configured": bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET),
        "oauth_available": bool((settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET) or 
                               (settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET))
    }