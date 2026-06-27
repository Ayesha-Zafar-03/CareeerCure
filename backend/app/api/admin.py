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
    

class UserUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None


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
    
    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        admin_users=admin_users,
        oauth_users=oauth_users,
        recent_registrations=recent_registrations
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