from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
import json
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.services.cv_service import process_cv, generate_cv_from_data, generate_cv_pdf, rebuild_cv_for_ats, extract_text_from_pdf

router = APIRouter(prefix="/api/cv", tags=["CV Management"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class CVGenerationRequest(BaseModel):
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    target_role: Optional[str] = ""
    experience_years: Optional[str] = "0"
    summary: Optional[str] = ""
    education: Optional[str] = ""
    work_experience: Optional[str] = ""
    skills: Optional[str] = ""
    projects: Optional[str] = ""
    certifications: Optional[str] = ""
    languages: Optional[str] = ""
    achievements: Optional[str] = ""
    use_ai_enhancement: Optional[bool] = False


class CVRebuildRequest(BaseModel):
    cv_text: str
    target_role: Optional[str] = ""


class CVPDFRequest(BaseModel):
    cv_text: str
    full_name: Optional[str] = ""


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


@router.post("/generate")
def generate_new_cv(
    request: CVGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new CV from user input fields."""
    try:
        # Convert request to dict
        cv_data = request.dict()
        
        # Add user info if not provided
        if not cv_data.get('full_name'):
            cv_data['full_name'] = current_user.full_name
        if not cv_data.get('email'):
            cv_data['email'] = current_user.email
        
        # Generate CV
        result = generate_cv_from_data(cv_data)
        
        # Save to user profile
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile:
            profile.cv_text = result["cv_text"]
            profile.cv_filename = f"{current_user.full_name.replace(' ', '_')}_CV_Generated.txt"
            
            # Update profile fields from generated CV
            if cv_data.get('skills'):
                profile.skills = [s.strip() for s in cv_data['skills'].split(',') if s.strip()]
            if cv_data.get('target_role'):
                profile.bio = result.get('summary', '')
            
            db.commit()
        
        return {
            "message": "CV generated successfully",
            "cv_text": result["cv_text"],
            "ats_score": result["ats_score"],
            "ats_tips": result["ats_tips"],
            "keywords_used": result["keywords_used"],
            "summary": result["summary"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV generation failed: {str(e)}")


@router.post("/rebuild")
async def rebuild_existing_cv(
    target_role: Optional[str] = "",
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rebuild and optimize an existing CV for better ATS score."""
    try:
        cv_text = ""
        profile = None
        
        if file:
            if not file.filename.lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail="Only PDF files are accepted")
            
            pdf_bytes = await file.read()
            if len(pdf_bytes) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File size exceeds 5 MB limit")
            
            cv_text = extract_text_from_pdf(pdf_bytes)
            
            if not cv_text:
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        else:
            profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
            if not profile or not profile.cv_text:
                raise HTTPException(status_code=404, detail="No saved CV found. Please upload a PDF or generate a CV first.")
            cv_text = profile.cv_text
        
        result = rebuild_cv_for_ats(cv_text, target_role or "")
        
        if not profile:
            profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile:
            profile.cv_text = result["improved_cv_text"]
            profile.cv_filename = f"{current_user.full_name.replace(' ', '_')}_CV_Improved.txt"
            db.commit()
        
        return {
            "message": "CV rebuilt successfully",
            "improved_cv_text": result["improved_cv_text"],
            "original_ats_score": result["original_ats_score"],
            "improved_ats_score": result["improved_ats_score"],
            "changes_made": result["changes_made"],
            "keywords_added": result["keywords_added"],
            "formatting_fixes": result["formatting_fixes"],
            "ats_tips": result["ats_tips"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV rebuild failed: {str(e)}")


@router.get("/download-pdf")
def download_cv_as_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download the user's CV as a professionally formatted PDF."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile or not profile.cv_text:
        raise HTTPException(status_code=404, detail="No CV found. Please generate or upload a CV first.")
    
    try:
        # Generate PDF
        pdf_bytes = generate_cv_pdf(profile.cv_text, current_user.full_name)
        
        # Create filename from CV text name or user name
        cv_first_line = profile.cv_text.strip().split('\n')[0].strip() if profile.cv_text else ""
        pdf_name = cv_first_line if cv_first_line and not any(c in cv_first_line for c in ['@', '|', '•', '-', '/']) and len(cv_first_line.split()) >= 2 else current_user.full_name
        safe_name = pdf_name.replace(' ', '_').replace('.', '').lower()
        filename = f"{safe_name}_cv.pdf"
        
        # Return as downloadable file
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/generate-pdf")
def generate_cv_pdf_endpoint(
    request: CVPDFRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a PDF from the supplied CV text (used for freshly generated/rebuilt CVs)."""
    if not request.cv_text or not request.cv_text.strip():
        raise HTTPException(status_code=400, detail="CV text is empty. Nothing to download.")
    
    try:
        pdf_bytes = generate_cv_pdf(request.cv_text, request.full_name or current_user.full_name or "CV")
        
        pdf_name = request.full_name or "CV"
        safe_name = pdf_name.replace(' ', '_').replace('.', '').lower()
        filename = f"{safe_name}_cv.pdf"
        
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.get("/preview")
def get_cv_preview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current CV text for preview."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile or not profile.cv_text:
        raise HTTPException(status_code=404, detail="No CV found. Please generate or upload a CV first.")
    
    return {
        "cv_text": profile.cv_text,
        "filename": profile.cv_filename,
        "last_updated": profile.updated_at.isoformat() if profile.updated_at else None
    }
