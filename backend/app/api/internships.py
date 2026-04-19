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
        }
        for i in internships
    ]


@router.get("/matches")
def get_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get personalised internship matches based on user's CV."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.cv_text:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first to get personalised matches.",
        )

    matches = get_job_matches(profile.cv_text, db, top_k=10)
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
    }
