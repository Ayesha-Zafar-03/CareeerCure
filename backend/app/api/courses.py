from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Course
from app.services.recommendation_service import get_course_matches

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.get("/list")
def list_courses(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    price_filter: Optional[str] = Query(None, description="Filter by price (free, paid, all)"),
    db: Session = Depends(get_db),
):
    """List courses with optional filters (public endpoint)."""
    query = db.query(Course)
    
    # Apply filters
    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))
    if difficulty:
        query = query.filter(Course.difficulty_level.ilike(f"%{difficulty}%"))
    if provider:
        query = query.filter(Course.provider.ilike(f"%{provider}%"))
    if price_filter == "free":
        query = query.filter(Course.price.ilike("%free%"))
    elif price_filter == "paid":
        query = query.filter(~Course.price.ilike("%free%"))
    
    courses = query.offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "provider": c.provider,
            "instructor": c.instructor,
            "description": c.description[:200] + "..." if len(c.description) > 200 else c.description,
            "difficulty_level": c.difficulty_level,
            "duration": c.duration,
            "price": c.price,
            "course_url": c.course_url,
            "rating": c.rating,
            "category": c.category,
            "skills_gained": c.skills_gained,
        }
        for c in courses
    ]


@router.get("/matches")
def get_course_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get personalised course matches based on user's CV and skill gaps."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.cv_text:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first to get personalised course recommendations.",
        )

    matches = get_course_matches(profile.cv_text, db, top_k=10)
    return {"matches": matches}


@router.get("/categories")
def get_course_categories(db: Session = Depends(get_db)):
    """Get all available course categories."""
    categories = db.query(Course.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/providers")
def get_course_providers(db: Session = Depends(get_db)):
    """Get all available course providers."""
    providers = db.query(Course.provider).distinct().all()
    return [provider[0] for provider in providers if provider[0]]


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get details of a specific course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {
        "id": course.id,
        "title": course.title,
        "provider": course.provider,
        "instructor": course.instructor,
        "description": course.description,
        "required_skills": course.required_skills,
        "skills_gained": course.skills_gained,
        "difficulty_level": course.difficulty_level,
        "duration": course.duration,
        "price": course.price,
        "course_url": course.course_url,
        "rating": course.rating,
        "category": course.category,
    }