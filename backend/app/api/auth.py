import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.otp import OTP
from app.services.email_service import send_verification_email, send_password_reset_email

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
        "message": "Account created. Please check your email for the 6-digit verification code.",
        "email": req.email,
        "email_sent": sent,
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
        "message": "Password reset code sent to your email.",
        "email_sent": sent,
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


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
    }
