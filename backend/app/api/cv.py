from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.services.cv_service import process_cv, generate_cv_from_data, rebuild_cv_for_ats, generate_cv_pdf

router = APIRouter(prefix="/api/cv", tags=["CV Analysis"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateCVRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    target_role: str
    experience_years: Optional[str] = "0"
    education: str
    work_experience: Optional[str] = ""
    skills: str
    projects: Optional[str] = ""
    certifications: Optional[str] = ""
    languages: Optional[str] = ""
    achievements: Optional[str] = ""


class RebuildCVRequest(BaseModel):
    target_role: Optional[str] = ""


# ── Upload & Analyse existing CV ──────────────────────────────────────────────

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

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.cv_text = result["cv_text"]
        profile.cv_filename = result["filename"]
        profile.cv_analysis = result["analysis"]
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


# ── Generate new CV from input fields ────────────────────────────────────────

@router.post("/generate")
def generate_cv(
    req: GenerateCVRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a professional ATS-optimized CV from structured input fields."""
    try:
        result = generate_cv_from_data(req.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV generation failed: {str(e)}")

    # Save generated CV to profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.cv_text = result.get("cv_text", "")
        profile.cv_filename = f"generated_cv_{req.full_name.replace(' ', '_')}.txt"
        db.commit()

    return {
        "message": "CV generated successfully",
        "cv_text": result.get("cv_text", ""),
        "ats_score": result.get("ats_score", 0),
        "ats_tips": result.get("ats_tips", []),
        "keywords_used": result.get("keywords_used", []),
        "summary": result.get("summary", ""),
    }


# ── Rebuild existing CV for ATS ───────────────────────────────────────────────

@router.post("/rebuild")
async def rebuild_cv(
    req: RebuildCVRequest,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rebuild/improve an existing CV for better ATS score. Upload new PDF or use saved CV."""
    cv_text = None

    # Use uploaded file if provided
    if file:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        pdf_bytes = await file.read()
        if len(pdf_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5 MB limit")
        try:
            from app.services.cv_service import extract_text_from_pdf
            cv_text = extract_text_from_pdf(pdf_bytes)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")
    else:
        # Use saved CV from profile
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile and profile.cv_text:
            cv_text = profile.cv_text

    if not cv_text:
        raise HTTPException(
            status_code=400,
            detail="No CV found. Please upload a PDF or save a CV first."
        )

    try:
        result = rebuild_cv_for_ats(cv_text, req.target_role or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV rebuild failed: {str(e)}")

    # Save improved CV to profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.cv_text = result.get("improved_cv_text", cv_text)
        db.commit()

    return {
        "message": "CV rebuilt successfully",
        "improved_cv_text": result.get("improved_cv_text", ""),
        "original_ats_score": result.get("original_ats_score", 0),
        "improved_ats_score": result.get("improved_ats_score", 0),
        "changes_made": result.get("changes_made", []),
        "keywords_added": result.get("keywords_added", []),
        "formatting_fixes": result.get("formatting_fixes", []),
        "ats_tips": result.get("ats_tips", []),
    }


# ── Get last analysis ─────────────────────────────────────────────────────────

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


# ── Download CV as PDF ────────────────────────────────────────────────────────

class DownloadCVRequest(BaseModel):
    cv_text: str
    full_name: Optional[str] = "CV"


@router.post("/download-pdf")
def download_cv_pdf(
    req: DownloadCVRequest,
    current_user: User = Depends(get_current_user),
):
    """Convert CV text to a formatted PDF and return it as a downloadable file."""
    if not req.cv_text.strip():
        raise HTTPException(status_code=400, detail="CV text cannot be empty")
    try:
        pdf_bytes = generate_cv_pdf(req.cv_text, req.full_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    safe_name = req.full_name.replace(" ", "_") if req.full_name else "CV"
    filename = f"{safe_name}_CV.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/download-saved-pdf")
def download_saved_cv_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download the user's saved CV as a formatted PDF."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.cv_text:
        raise HTTPException(status_code=404, detail="No saved CV found. Please generate or upload a CV first.")

    try:
        pdf_bytes = generate_cv_pdf(profile.cv_text, current_user.full_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    safe_name = current_user.full_name.replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_CV.pdf"'},
    )
