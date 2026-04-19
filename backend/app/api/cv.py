from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.services.cv_service import process_cv

router = APIRouter(prefix="/api/cv", tags=["CV Analysis"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF CV, extract text, analyse with AI, and return matches."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5 MB limit")

    try:
        result = process_cv(current_user.id, pdf_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV processing failed: {str(e)}")

    # Persist CV text and analysis to profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.cv_text = result["cv_text"]
        profile.cv_filename = result["filename"]
        profile.cv_analysis = result["analysis"]
        # Merge extracted skills into profile
        extracted = result["analysis"].get("extracted_skills", [])
        existing = profile.skills or []
        merged = list(set(existing + extracted))
        profile.skills = merged
        db.commit()

    return {
        "message": "CV analysed successfully",
        "filename": result["filename"],
        "analysis": result["analysis"],
        "job_matches": result["job_matches"],
    }


@router.get("/analysis")
def get_last_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the most recent CV analysis for the current user."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.cv_analysis:
        raise HTTPException(status_code=404, detail="No CV analysis found. Please upload your CV first.")
    return {
        "filename": profile.cv_filename,
        "analysis": profile.cv_analysis,
        "skills": profile.skills,
    }
