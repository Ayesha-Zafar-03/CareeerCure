import json
import logging
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.career import Roadmap, Internship, Course
from app.vector.chroma_client import search_similar_internships, search_similar_courses
from app.vector.embedding_service import embed_text

logger = logging.getLogger(__name__)


def generate_roadmap(user_id: int, career_goal: str, current_skills: list, db: Session) -> dict:
    """
    Generate a personalised career roadmap using Groq LLM and save it to DB.
    Returns the roadmap dict.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    skills_str = ", ".join(current_skills) if current_skills else "none listed"

    prompt = f"""You are an expert career coach specialising in tech careers.
Create a detailed, personalised career roadmap for someone who wants to become a {career_goal}.
Their current skills are: {skills_str}.

Return a JSON object with these exact keys:
- "title": string — roadmap title
- "goal": string — the career goal
- "estimated_duration": string — e.g. "6-12 months"
- "phases": list of objects, each with:
    - "phase_number": int
    - "title": string
    - "duration": string
    - "objectives": list[str]
    - "resources": list of objects with "name" and "url" (use real, well-known resources)
    - "milestones": list[str]
- "final_outcome": string

Return ONLY valid JSON, no markdown, no extra text.
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        roadmap_data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON roadmap")
        roadmap_data = {"raw_response": raw, "phases": []}

    # Persist to DB
    roadmap = Roadmap(
        user_id=user_id,
        career_goal=career_goal,
        roadmap_data=roadmap_data,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return {"id": roadmap.id, "career_goal": career_goal, "roadmap": roadmap_data}


def build_profile_query(profile) -> str:
    """
    Build a single text query from the whole profile so recommendations
    match on career_goal, skills and education — not just an uploaded CV.
    Falls back to whatever is available (CV text is most detailed).
    """
    parts = []
    if profile:
        if getattr(profile, "career_goal", None):
            parts.append(f"Career goal: {profile.career_goal}")
        skills = getattr(profile, "skills", None) or []
        if skills:
            parts.append("Skills: " + ", ".join(skills))
        if getattr(profile, "education", None):
            parts.append(f"Education: {profile.education}")
        if getattr(profile, "bio", None):
            parts.append(profile.bio)
        if getattr(profile, "cv_text", None):
            parts.append(profile.cv_text)
    return "\n".join(parts).strip()


def get_course_matches(cv_text: str, db: Session, top_k: int = 5, profile=None) -> list:
    """
    Embed profile text, search ChromaDB for similar courses based on skill gaps,
    then enrich results with DB data. Uses the full profile (career_goal + skills +
    education + cv_text) so any profession gets relevant recommendations.
    """
    query = build_profile_query(profile) or cv_text
    try:
        embedding = embed_text(query)
        raw_matches = search_similar_courses(embedding, top_k=top_k)
        
        # Batch-fetch all courses in one query (fixes N+1)
        course_ids = [m["course_id"] for m in raw_matches]
        courses_map = {}
        if course_ids:
            for c in db.query(Course).filter(Course.id.in_(course_ids)).all():
                courses_map[c.id] = c
        enriched = []
        for match in raw_matches:
            course = courses_map.get(match["course_id"])
            if course:
                enriched.append({
                    "id": course.id,
                    "title": course.title,
                    "provider": course.provider,
                    "instructor": course.instructor,
                    "description": course.description[:200] + "..." if len(course.description) > 200 else course.description,
                    "difficulty_level": course.difficulty_level,
                    "duration": course.duration,
                    "price": course.price,
                    "course_url": course.course_url,
                    "rating": course.rating,
                    "category": course.category,
                    "skills_gained": course.skills_gained,
                    "match_score": match["score"],
                })
        return enriched
        
    except Exception as e:
        logger.warning(f"ChromaDB course search failed: {e}. Falling back to simple query.")
        # Fallback: return popular courses from different categories
        courses = (
            db.query(Course)
            .filter(Course.rating >= 4.0)
            .order_by(Course.rating.desc())
            .limit(top_k)
            .all()
        )
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
                "match_score": 0.8,  # Default high score for fallback
            }
            for c in courses
        ]

def get_job_matches(cv_text: str, db: Session, top_k: int = 5, profile=None) -> list:
    """
    Embed profile text, search ChromaDB for similar internships,
    then enrich results with DB data. Uses the full profile so any
    profession (e.g. doctor) gets relevant matches.
    """
    query = build_profile_query(profile) or cv_text
    embedding = embed_text(query)
    raw_matches = search_similar_internships(embedding, top_k=top_k)

    # Batch-fetch all internships in one query (fixes N+1)
    internship_ids = [m["internship_id"] for m in raw_matches]
    internships_map = {}
    if internship_ids:
        for i in db.query(Internship).filter(Internship.id.in_(internship_ids)).all():
            internships_map[i.id] = i
    enriched = []
    for match in raw_matches:
        internship = internships_map.get(match["internship_id"])
        if internship:
            enriched.append(
                {
                    "id": internship.id,
                    "title": internship.title,
                    "company": internship.company,
                    "location": internship.location,
                    "duration": internship.duration,
                    "required_skills": internship.required_skills,
                    "application_url": internship.application_url,
                    "salary_range": internship.salary_range,
                    "remote_option": internship.remote_option,
                    "match_score": match["score"],
                }
            )
    return enriched
