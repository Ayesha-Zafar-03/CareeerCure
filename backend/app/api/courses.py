from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import logging
from groq import Groq
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import Roadmap
from app.core.config import settings

router = APIRouter(prefix="/api/courses", tags=["Courses"])
logger = logging.getLogger(__name__)


class CourseSearchRequest(BaseModel):
    career_goal: str
    roadmap_id: Optional[int] = None
    phase: Optional[str] = ""


def fetch_courses_with_llm(career_goal: str, phase: str = "") -> list:
    """Use LLM to generate curated course recommendations from real platforms."""
    client = Groq(api_key=settings.GROQ_API_KEY)

    phase_context = f" specifically for the phase: {phase}" if phase else ""

    prompt = f"""You are a career education expert. Recommend 12 real, high-quality online courses for someone pursuing a career as a {career_goal}{phase_context}.

Return a JSON array of course objects. Each object must have these exact keys:
- "title": course title (real course name)
- "platform": platform name (Coursera, Udemy, edX, YouTube, freeCodeCamp, Khan Academy, LinkedIn Learning, Pluralsight, etc.)
- "url": real URL to the course (use actual known URLs)
- "instructor": instructor or institution name
- "duration": estimated duration (e.g. "20 hours", "6 weeks")
- "level": "Beginner", "Intermediate", or "Advanced"
- "is_free": true or false
- "rating": rating out of 5 (e.g. 4.7)
- "description": 1-2 sentence description
- "skills_covered": list of 3-5 skills this course covers
- "platform_color": hex color for the platform badge (e.g. "#0056D2" for Coursera)

Include a mix of free and paid courses from different platforms.
Return ONLY valid JSON array, no markdown, no extra text."""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for courses")
        return []


@router.post("/recommend")
def recommend_courses(
    req: CourseSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI-curated course recommendations matching a career goal or roadmap phase."""
    phase = req.phase or ""

    # If roadmap_id provided, get phase info from roadmap
    if req.roadmap_id:
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == req.roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        if roadmap and roadmap.roadmap_data:
            phases = roadmap.roadmap_data.get("phases", [])
            if phases and not phase:
                phase = phases[0].get("title", "")

    courses = fetch_courses_with_llm(req.career_goal, phase)

    return {
        "career_goal": req.career_goal,
        "phase": phase,
        "total": len(courses),
        "courses": courses,
    }


@router.get("/roadmap/{roadmap_id}")
def get_courses_for_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get courses matched to a specific saved roadmap."""
    roadmap = db.query(Roadmap).filter(
        Roadmap.id == roadmap_id,
        Roadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    courses = fetch_courses_with_llm(roadmap.career_goal)
    return {
        "career_goal": roadmap.career_goal,
        "roadmap_id": roadmap_id,
        "total": len(courses),
        "courses": courses,
    }
