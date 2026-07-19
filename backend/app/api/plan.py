import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.plan import PlannedCourse

router = APIRouter(prefix="/api/plan", tags=["Planned Courses"])

logger = logging.getLogger(__name__)


class AddToPlanRequest(BaseModel):
    id: int
    title: str = ""
    provider: Optional[str] = None
    course_url: Optional[str] = None
    duration: Optional[str] = None
    difficulty_level: Optional[str] = None
    description: Optional[str] = None
    roadmap: str = "General"


def _serialize(pc: PlannedCourse) -> dict:
    return {
        "id": pc.course_id,
        "title": pc.title,
        "provider": pc.provider,
        "course_url": pc.course_url,
        "duration": pc.duration,
        "difficulty_level": pc.difficulty_level,
        "description": pc.description,
        "roadmap": pc.roadmap,
    }


@router.get("/list")
def list_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all courses the user has added to their plan."""
    items = (
        db.query(PlannedCourse)
        .filter(PlannedCourse.user_id == current_user.id)
        .order_by(PlannedCourse.created_at.asc())
        .all()
    )
    return {"courses": [_serialize(i) for i in items]}


@router.post("/add")
def add_to_plan(
    payload: AddToPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course_id = payload.id

    existing = (
        db.query(PlannedCourse)
        .filter(
            PlannedCourse.user_id == current_user.id,
            PlannedCourse.course_id == course_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already in plan", "course": _serialize(existing)}

    pc = PlannedCourse(
        user_id=current_user.id,
        course_id=course_id,
        title=payload.title,
        provider=payload.provider,
        course_url=payload.course_url,
        duration=payload.duration,
        difficulty_level=payload.difficulty_level,
        description=payload.description,
        roadmap=payload.roadmap,
    )
    db.add(pc)
    db.commit()
    db.refresh(pc)
    return {"message": "Added to plan", "course": _serialize(pc)}


@router.delete("/remove/{course_id}")
def remove_from_plan(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(PlannedCourse)
        .filter(
            PlannedCourse.user_id == current_user.id,
            PlannedCourse.course_id == course_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Course not in plan")
    db.delete(item)
    db.commit()
    return {"message": "Removed from plan"}
