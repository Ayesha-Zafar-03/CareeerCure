"""
Admin API endpoints
"""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Internship, Course
from app.services.external_data_service import external_data_service
from app.vector.chroma_client import upsert_internship, upsert_course
from app.vector.embedding_service import embed_texts
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Admin Security Decorator ──────────────────────────────────────────────────

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verify current user is admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ── Response Models ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    oauth_provider: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    admin_users: int
    oauth_users: int
    recent_registrations: int  # Last 7 days
    total_jobs: int
    total_courses: int


class UserUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None


class UpdateDataRequest(BaseModel):
    update_jobs: bool = True
    update_courses: bool = True


class DataSyncResponse(BaseModel):
    jobs_added: int
    courses_added: int
    total_jobs: int
    total_courses: int
    errors: list = []


class JobCreateRequest(BaseModel):
    title: str
    company: str
    description: str
    required_skills: list = []
    location: Optional[str] = None
    duration: Optional[str] = None
    application_url: Optional[str] = None
    salary_range: Optional[str] = None
    remote_option: Optional[str] = None


class JobUpdateRequest(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[list] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    application_url: Optional[str] = None
    salary_range: Optional[str] = None
    remote_option: Optional[str] = None


class CourseCreateRequest(BaseModel):
    title: str
    provider: str
    description: str
    instructor: Optional[str] = None
    required_skills: list = []
    skills_gained: list = []
    difficulty_level: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[str] = None
    course_url: str
    rating: Optional[float] = None
    category: Optional[str] = None


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    description: Optional[str] = None
    instructor: Optional[str] = None
    required_skills: Optional[list] = None
    skills_gained: Optional[list] = None
    difficulty_level: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[str] = None
    course_url: Optional[str] = None
    rating: Optional[float] = None
    category: Optional[str] = None


class DBStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_jobs: int
    total_courses: int
    total_profiles: int
    total_roadmaps: int
    db_status: str
    db_version: str


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics (single query)"""
    
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    row = db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
            (SELECT COUNT(*) FROM users WHERE is_verified = TRUE) AS verified_users,
            (SELECT COUNT(*) FROM users WHERE is_admin = TRUE) AS admin_users,
            (SELECT COUNT(*) FROM users WHERE oauth_provider IS NOT NULL) AS oauth_users,
            (SELECT COUNT(*) FROM users WHERE created_at >= :week_ago) AS recent_registrations,
            (SELECT COUNT(*) FROM internships) AS total_jobs,
            (SELECT COUNT(*) FROM courses) AS total_courses
    """), {"week_ago": week_ago}).one()
    
    return AdminStatsResponse(
        total_users=row.total_users,
        active_users=row.active_users,
        verified_users=row.verified_users,
        admin_users=row.admin_users,
        oauth_users=row.oauth_users,
        recent_registrations=row.recent_registrations,
        total_jobs=row.total_jobs,
        total_courses=row.total_courses
    )


# ── User Management ───────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users with pagination and search"""
    
    query = db.query(User)
    
    # Add search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) | 
            (User.full_name.ilike(search_term))
        )
    
    # Order by most recent first
    query = query.order_by(desc(User.created_at))
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    return [UserResponse.from_orm(user) for user in users]


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific user by ID"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.from_orm(user)


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    update_data: UserUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user properties"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from removing their own admin status
    if user.id == admin_user.id and update_data.is_admin is False:
        raise HTTPException(
            status_code=400, 
            detail="Cannot remove admin status from yourself"
        )
    
    # Update fields
    update_fields = update_data.dict(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    
    return {"message": "User updated successfully", "user": UserResponse.from_orm(user)}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    hard: bool = Query(False),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user. Pass ?hard=true to permanently remove, otherwise soft-deletes (deactivates)."""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    if hard:
        db.delete(user)
        db.commit()
        return {"message": "User permanently deleted"}
    
    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "User deactivated successfully"}
    
    return {"message": "User deactivated successfully"}


# ── System Info ───────────────────────────────────────────────────────────────

@router.get("/system/info")
async def get_system_info(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system information"""
    
    from app.core.config import settings
    
    # Get database info
    try:
        db_result = db.execute("SELECT version()").scalar()
        db_status = "Connected"
    except Exception as e:
        db_result = str(e)
        db_status = "Error"
    
    # Count profiles
    profiles_count = db.query(Profile).count()
    
    return {
        "database": {
            "status": db_status,
            "version": db_result if db_status == "Connected" else "Unknown"
        },
        "oauth": {
            "google_configured": bool(settings.GOOGLE_CLIENT_ID),
            "linkedin_configured": bool(settings.LINKEDIN_CLIENT_ID)
        },
        "content": {
            "user_profiles": profiles_count,
        },
        "admin_user": {
            "id": admin_user.id,
            "email": admin_user.email,
            "name": admin_user.full_name
        }
    }


# ── External Data Management ──────────────────────────────────────────────────

@router.post("/sync-data", response_model=DataSyncResponse)
async def sync_external_data(
    request: UpdateDataRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Sync jobs and courses from external APIs (admin only)
    This endpoint fetches real jobs and courses from external APIs and updates the database
    """
    try:
        logger.info(f"Admin {admin_user.email} initiated data sync")
        
        results = await external_data_service.update_all_data(db)
        
        # Reindex newly added items into ChromaDB for AI recommendations
        reindexed_jobs = 0
        reindexed_courses = 0
        
        new_jobs = results.get('new_jobs', [])
        if new_jobs:
            try:
                descriptions = [j.description or f"{j.title} at {j.company}" for j in new_jobs]
                embeddings = embed_texts(descriptions)
                for job, emb in zip(new_jobs, embeddings):
                    upsert_internship(job.id, job.description or job.title, emb)
                    reindexed_jobs += 1
                logger.info(f"Reindexed {reindexed_jobs} jobs into ChromaDB")
            except Exception as e:
                logger.error(f"ChromaDB job reindex error: {e}")
                results['errors'].append(f"ChromaDB job reindex failed: {str(e)}")
        
        new_courses = results.get('new_courses', [])
        if new_courses:
            try:
                descriptions = [c.description or c.title for c in new_courses]
                embeddings = embed_texts(descriptions)
                for course, emb in zip(new_courses, embeddings):
                    upsert_course(course.id, course.description or course.title, emb, course.skills_gained)
                    reindexed_courses += 1
                logger.info(f"Reindexed {reindexed_courses} courses into ChromaDB")
            except Exception as e:
                logger.error(f"ChromaDB course reindex error: {e}")
                results['errors'].append(f"ChromaDB course reindex failed: {str(e)}")
        
        # Get current totals
        total_jobs = db.query(Internship).count()
        total_courses = db.query(Course).count()
        
        response = DataSyncResponse(
            jobs_added=results['jobs_added'],
            courses_added=results['courses_added'],
            total_jobs=total_jobs,
            total_courses=total_courses,
            errors=results.get('errors', [])
        )
        
        logger.info(f"Data sync completed: {results['jobs_added']} jobs, {results['courses_added']} courses added, {reindexed_jobs} jobs + {reindexed_courses} courses reindexed")
        return response
        
    except Exception as e:
        logger.error(f"Error in data sync: {e}")
        raise HTTPException(status_code=500, detail=f"Data sync failed: {str(e)}")


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a job (admin only)"""
    job = db.query(Internship).filter(Internship.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a course (admin only)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.get("/jobs")
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """List all jobs with pagination and search (admin only)"""
    query = db.query(Internship)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Internship.title.ilike(term)) |
            (Internship.company.ilike(term)) |
            (Internship.location.ilike(term))
        )
    total = query.count()
    offset = (page - 1) * limit
    jobs = query.order_by(desc(Internship.created_at)).offset(offset).limit(limit).all()
    
    return {"jobs": jobs, "total": total, "page": page, "limit": limit}


@router.get("/courses")
async def list_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """List all courses with pagination and search (admin only)"""
    query = db.query(Course)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Course.title.ilike(term)) |
            (Course.provider.ilike(term)) |
            (Course.category.ilike(term))
        )
    total = query.count()
    offset = (page - 1) * limit
    courses = query.order_by(desc(Course.created_at)).offset(offset).limit(limit).all()
    
    return {"courses": courses, "total": total, "page": page, "limit": limit}


@router.get("/jobs/search")
async def search_jobs(
    q: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Search jobs by title or company (admin only)"""
    query = db.query(Internship)
    if q:
        term = f"%{q}%"
        query = query.filter(
            (Internship.title.ilike(term)) |
            (Internship.company.ilike(term)) |
            (Internship.location.ilike(term))
        )
    total = query.count()
    offset = (page - 1) * limit
    jobs = query.order_by(desc(Internship.created_at)).offset(offset).limit(limit).all()
    
    return {"jobs": jobs, "total": total, "page": page, "limit": limit}


# ── Job CRUD ──────────────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}")
async def get_job(
    job_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get a single job by ID (admin only)"""
    job = db.query(Internship).filter(Internship.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/jobs")
async def create_job(
    data: JobCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new job listing (admin only)"""
    job = Internship(**data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"message": "Job created successfully", "job": job}


@router.put("/jobs/{job_id}")
async def update_job(
    job_id: int,
    data: JobUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing job (admin only)"""
    job = db.query(Internship).filter(Internship.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    return {"message": "Job updated successfully", "job": job}


# ── Course CRUD ───────────────────────────────────────────────────────────────

@router.get("/courses/{course_id}")
async def get_course(
    course_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get a single course by ID (admin only)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/courses")
async def create_course(
    data: CourseCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new course listing (admin only)"""
    course = Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"message": "Course created successfully", "course": course}


@router.put("/courses/{course_id}")
async def update_course(
    course_id: int,
    data: CourseUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing course (admin only)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return {"message": "Course updated successfully", "course": course}


# ── Database Stats ────────────────────────────────────────────────────────────

@router.get("/db/stats", response_model=DBStatsResponse)
async def get_db_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get database statistics for the admin panel"""
    from app.models.career import Roadmap
    
    try:
        row = db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
                (SELECT COUNT(*) FROM internships) AS total_jobs,
                (SELECT COUNT(*) FROM courses) AS total_courses,
                (SELECT COUNT(*) FROM profiles) AS total_profiles,
                (SELECT COUNT(*) FROM roadmaps) AS total_roadmaps,
                version() AS db_version
        """)).one()
        db_status = "Connected"
    except Exception:
        row = None
        db_status = "Error"
    
    return DBStatsResponse(
        total_users=row.total_users if row else 0,
        active_users=row.active_users if row else 0,
        total_jobs=row.total_jobs if row else 0,
        total_courses=row.total_courses if row else 0,
        total_profiles=row.total_profiles if row else 0,
        total_roadmaps=row.total_roadmaps if row else 0,
        db_status=db_status,
        db_version=row.db_version if row else "Unknown",
    )