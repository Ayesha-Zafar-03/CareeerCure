from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Internship
from app.services.recommendation_service import get_job_matches

router = APIRouter(prefix="/api/internships", tags=["Internships"])


@router.get("/list")
def list_internships(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """List all internships (public endpoint)."""
    internships = db.query(Internship).offset(skip).limit(limit).all()
    return [
        {
            "id": i.id,
            "title": i.title,
            "company": i.company,
            "location": i.location,
            "duration": i.duration,
            "required_skills": i.required_skills,
            "description": i.description[:200] + "..." if len(i.description) > 200 else i.description,
            "application_url": i.application_url,
            "salary_range": i.salary_range,
            "remote_option": i.remote_option,
        }
        for i in internships
    ]


@router.get("/matches")
def get_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get personalised internship matches based on the user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    query = (
        profile.career_goal
        or (", ".join(profile.skills) if profile.skills else None)
        or profile.education
        or profile.cv_text
    )
    if not query:
        raise HTTPException(
            status_code=404,
            detail="Add a career goal, skills, or upload your CV to get personalised matches.",
        )

    matches = get_job_matches(query, db, top_k=10, profile=profile)
    return {"matches": matches}


@router.get("/{internship_id}")
def get_internship(internship_id: int, db: Session = Depends(get_db)):
    """Get details of a specific internship."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return {
        "id": internship.id,
        "title": internship.title,
        "company": internship.company,
        "location": internship.location,
        "duration": internship.duration,
        "required_skills": internship.required_skills,
        "description": internship.description,
        "application_url": internship.application_url,
        "salary_range": internship.salary_range,
        "remote_option": internship.remote_option,
    }
