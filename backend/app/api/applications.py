from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.career import Internship
from app.models.application import Application
from app.services.email_service import send_application_confirmation_email

router = APIRouter(prefix="/api/applications", tags=["Applications"])


class ApplyRequest(BaseModel):
    job_id: int


def _serialize(app: Application) -> dict:
    return {
        "id": app.id,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "job_title": app.job_title,
        "company": app.company,
        "application_url": app.application_url,
        "status": app.status,
        "cv_filename": app.cv_filename,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
    }


@router.post("/apply", status_code=200)
def apply_to_job(
    payload: ApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Auto-apply to a job: attach the user's CV + profile data, record the application,
    and send a confirmation email. Idempotent per (user, job)."""
    job = db.query(Internship).filter(Internship.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # Idempotent: return existing application if already applied
    existing = (
        db.query(Application)
        .filter(Application.user_id == current_user.id, Application.job_id == payload.job_id)
        .first()
    )
    if existing:
        return {**_serialize(existing), "already_applied": True, "external_url": job.application_url}

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    # Prefer the ATS-friendly CV if present, otherwise fall back to the latest CV text.
    cv_used = None
    cv_filename = None
    if profile:
        cv_used = profile.cv_text
        cv_filename = profile.cv_filename

    profile_snapshot = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "skills": profile.skills if profile else [],
        "education": profile.education if profile else None,
        "experience_years": profile.experience_years if profile else 0,
        "career_goal": profile.career_goal if profile else None,
    }

    application = Application(
        user_id=current_user.id,
        job_id=job.id,
        job_title=job.title,
        company=job.company,
        application_url=job.application_url,
        status="applied",
        cv_used=cv_used,
        cv_filename=cv_filename,
        profile_snapshot=profile_snapshot,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Best-effort confirmation email (no-op if SMTP is unconfigured)
    send_application_confirmation_email(
        to_email=current_user.email,
        full_name=current_user.full_name,
        job_title=job.title,
        company=job.company,
    )

    return {**_serialize(application), "already_applied": False, "external_url": job.application_url}


@router.get("")
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's applications, newest first."""
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [_serialize(a) for a in apps]


@router.get("/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    data = _serialize(app)
    data["cv_used"] = app.cv_used
    data["profile_snapshot"] = app.profile_snapshot
    return data


@router.post("/{application_id}/withdraw", status_code=200)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    app.status = "withdrawn"
    db.commit()
    return _serialize(app)
