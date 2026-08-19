from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Roadmap
from app.services.recommendation_service import generate_roadmap
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])


class RoadmapRequest(BaseModel):
    career_goal: str


@router.post("/generate")
def create_roadmap(
    req: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a personalised career roadmap using AI."""
    try:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        current_skills = profile.skills if profile and profile.skills else []

        roadmap = generate_roadmap(current_user.id, req.career_goal, current_skills, db)

        # Update profile career goal
        if profile:
            profile.career_goal = req.career_goal
            db.commit()

        return roadmap
    except Exception as e:
        logger.error(f"Roadmap generation failed for user {current_user.id}: {e}", exc_info=True)
        if "GROQ_API_KEY" in str(e) or "api_key" in str(e).lower():
            raise HTTPException(status_code=500, detail="AI service not configured. Please set GROQ_API_KEY in backend environment.")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.get("/list")
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all roadmaps for the current user."""
    roadmaps = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "career_goal": r.career_goal,
            "created_at": r.created_at.isoformat(),
            "roadmap": r.roadmap_data,
        }
        for r in roadmaps
    ]


@router.get("/{roadmap_id}")
def get_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific roadmap by ID."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {
        "id": roadmap.id,
        "career_goal": roadmap.career_goal,
        "created_at": roadmap.created_at.isoformat(),
        "roadmap": roadmap.roadmap_data,
    }


@router.delete("/{roadmap_id}")
def delete_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a specific roadmap by ID."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()
    return {"message": "Roadmap deleted successfully"}
