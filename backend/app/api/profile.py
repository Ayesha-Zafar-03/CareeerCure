from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[list] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    career_goal: Optional[str] = None


@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "profile": {
            "bio": profile.bio if profile else None,
            "skills": profile.skills if profile else [],
            "education": profile.education if profile else None,
            "experience_years": profile.experience_years if profile else 0,
            "career_goal": profile.career_goal if profile else None,
            "cv_filename": profile.cv_filename if profile else None,
            "has_cv": bool(profile and profile.cv_text),
        },
    }


@router.put("/me")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if data.bio is not None:
        profile.bio = data.bio
    if data.skills is not None:
        profile.skills = data.skills
    if data.education is not None:
        profile.education = data.education
    if data.experience_years is not None:
        profile.experience_years = data.experience_years
    if data.career_goal is not None:
        profile.career_goal = data.career_goal

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully"}
