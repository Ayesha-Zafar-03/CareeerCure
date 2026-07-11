"""
Admin API endpoints
"""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Internship, Course
from app.services.external_data_service import external_data_service
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


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    # Calculate date for recent registrations (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Get all stats in efficient queries
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    oauth_users = db.query(User).filter(User.oauth_provider.isnot(None)).count()
    recent_registrations = db.query(User).filter(User.created_at >= week_ago).count()
    total_jobs = db.query(Internship).count()
    total_courses = db.query(Course).count()
    
    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        admin_users=admin_users,
        oauth_users=oauth_users,
        recent_registrations=recent_registrations,
        total_jobs=total_jobs,
        total_courses=total_courses
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
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (soft delete by deactivating)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete yourself"
        )
    
    # Soft delete by deactivating
    user.is_active = False
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    
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
        
        logger.info(f"Data sync completed: {results['jobs_added']} jobs, {results['courses_added']} courses added")
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
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """List all jobs with pagination (admin only)"""
    offset = (page - 1) * limit
    jobs = db.query(Internship).order_by(desc(Internship.created_at)).offset(offset).limit(limit).all()
    total = db.query(Internship).count()
    
    return {"jobs": jobs, "total": total, "page": page, "limit": limit}


@router.get("/courses")
async def list_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """List all courses with pagination (admin only)"""
    offset = (page - 1) * limit
    courses = db.query(Course).order_by(desc(Course.created_at)).offset(offset).limit(limit).all()
    total = db.query(Course).count()
    
    return {"courses": courses, "total": total, "page": page, "limit": limit}