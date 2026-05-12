import fitz  # PyMuPDF
import json
import logging
from groq import Groq
from app.core.config import settings
from app.vector.embedding_service import embed_text
from app.vector.chroma_client import upsert_cv, search_similar_internships

logger = logging.getLogger(__name__)


def generate_cv_from_data(cv_data: dict) -> dict:
    """
    Generate a professional CV from structured input fields using LLM.
    Returns generated CV text + ATS score + suggestions.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an expert CV writer. Create a professional ATS-optimized CV.
Output ONLY a JSON object with these exact keys, nothing else before or after:
{{"cv_text": "full CV as plain text", "ats_score": 85, "ats_tips": ["tip1", "tip2"], "keywords_used": ["kw1", "kw2"], "summary": "2-3 sentence summary"}}

Candidate:
Name: {cv_data.get('full_name', '')}
Email: {cv_data.get('email', '')}
Phone: {cv_data.get('phone', '')}
Location: {cv_data.get('location', '')}
LinkedIn: {cv_data.get('linkedin', '')}
Target Role: {cv_data.get('target_role', '')}
Experience Years: {cv_data.get('experience_years', '0')}
Education: {cv_data.get('education', '')}
Work Experience: {cv_data.get('work_experience', '')}
Skills: {cv_data.get('skills', '')}
Projects: {cv_data.get('projects', '')}
Certifications: {cv_data.get('certifications', '')}
Languages: {cv_data.get('languages', '')}
Achievements: {cv_data.get('achievements', '')}

Rules for cv_text: Use plain text only. Start with the name on line 1. Add sections: SUMMARY, EDUCATION, EXPERIENCE, SKILLS, PROJECTS, CERTIFICATIONS. Use dashes for bullets.
Output ONLY the JSON object. No markdown. No explanation."""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown fences
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break
    # Find JSON object boundaries
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start != -1 and end > start:
        raw = raw[start:end]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for CV generation")
        return {
            "cv_text": raw,
            "ats_score": 0,
            "ats_tips": [],
            "keywords_used": [],
            "summary": ""
        }


def rebuild_cv_for_ats(cv_text: str, target_role: str = "") -> dict:
    """
    Take existing CV text and rebuild/improve it for better ATS score.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an ATS optimization expert. Rewrite the CV below to maximize ATS score.
{"Target Role: " + target_role if target_role else ""}

Output ONLY a JSON object with these exact keys, nothing else:
{{"improved_cv_text": "full rewritten CV as plain text", "original_ats_score": 60, "improved_ats_score": 85, "changes_made": ["change1"], "keywords_added": ["kw1"], "formatting_fixes": ["fix1"], "ats_tips": ["tip1"]}}

ORIGINAL CV:
{cv_text[:3000]}

Output ONLY the JSON object. No markdown. No explanation."""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start != -1 and end > start:
        raw = raw[start:end]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for CV rebuild")
        return {
            "improved_cv_text": raw,
            "original_ats_score": 0,
            "improved_ats_score": 0,
            "changes_made": [],
            "keywords_added": [],
            "formatting_fixes": [],
            "ats_tips": []
        }


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from a PDF file given its bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def analyse_cv_with_llm(cv_text: str) -> dict:
    """
    Send CV text to Groq LLM and get back a structured JSON with:
    - extracted_skills: list[str]
    - skill_gaps: list[str]
    - strengths: list[str]
    - recommendations: list[str]
    - summary: str
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an expert career counselor and CV analyst.
Analyse the following CV text and return a JSON object with these exact keys:
- "extracted_skills": list of technical and soft skills found
- "skill_gaps": list of important skills missing for modern tech roles
- "strengths": list of candidate's key strengths
- "recommendations": list of actionable improvement suggestions
- "summary": a 2-3 sentence professional summary of the candidate

Return ONLY valid JSON, no markdown, no extra text.

CV TEXT:
{cv_text[:4000]}
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1024,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON CV analysis, returning raw text")
        return {"raw_response": raw, "extracted_skills": [], "skill_gaps": [], "strengths": [], "recommendations": [], "summary": ""}


def process_cv(user_id: int, pdf_bytes: bytes, filename: str) -> dict:
    """
    Full CV processing pipeline:
    1. Extract text
    2. Analyse with LLM
    3. Embed and store in ChromaDB
    4. Return analysis + top job matches
    """
    cv_text = extract_text_from_pdf(pdf_bytes)
    if not cv_text:
        raise ValueError("Could not extract text from the uploaded PDF.")

    analysis = analyse_cv_with_llm(cv_text)

    # Embed and store CV
    embedding = embed_text(cv_text)
    upsert_cv(user_id, cv_text, embedding)

    # Find matching internships
    matches = search_similar_internships(embedding, top_k=5)

    return {
        "cv_text": cv_text,
        "analysis": analysis,
        "job_matches": matches,
        "filename": filename,
    }


def generate_cv_pdf(cv_text: str, full_name: str = "CV") -> bytes:
    """
    Convert plain CV text into a professionally formatted PDF using ReportLab.
    Returns PDF as bytes.
    """
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    PRIMARY = colors.HexColor("#2563eb")
    DARK = colors.HexColor("#111827")
    GRAY = colors.HexColor("#6b7280")
    LIGHT_GRAY = colors.HexColor("#f3f4f6")

    # Custom styles
    name_style = ParagraphStyle("Name", fontSize=22, fontName="Helvetica-Bold",
                                 textColor=DARK, alignment=TA_CENTER, spaceAfter=4)
    section_style = ParagraphStyle("Section", fontSize=11, fontName="Helvetica-Bold",
                                    textColor=PRIMARY, spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle("Body", fontSize=9.5, fontName="Helvetica",
                                 textColor=DARK, leading=14, spaceAfter=2)
    sub_style = ParagraphStyle("Sub", fontSize=9, fontName="Helvetica",
                                textColor=GRAY, leading=13, spaceAfter=2)

    story = []
    lines = cv_text.strip().split("\n")

    # Section keywords to detect headers
    SECTION_KEYWORDS = [
        "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "SKILLS", "PROJECTS",
        "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "SUMMARY", "OBJECTIVE",
        "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "CONTACT", "PROFILE",
        "INTERNSHIP", "VOLUNTEER", "AWARDS", "PUBLICATIONS", "REFERENCES",
    ]

    first_line = True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 4))
            continue

        upper = stripped.upper()

        # First non-empty line = name
        if first_line:
            story.append(Paragraph(stripped, name_style))
            story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=6))
            first_line = False
            continue

        # Section header detection
        is_section = any(upper == kw or upper.startswith(kw + " ") or upper.startswith(kw + ":") for kw in SECTION_KEYWORDS)
        if is_section or (stripped.isupper() and len(stripped) > 3 and len(stripped) < 40):
            story.append(Paragraph(stripped.title(), section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=4))
            continue

        # Bullet points
        if stripped.startswith(("•", "-", "*", "·")):
            text = "• " + stripped.lstrip("•-*· ").strip()
            story.append(Paragraph(text, body_style))
            continue

        # Lines with | separator (contact info)
        if "|" in stripped and len(stripped) < 120:
            contact_style = ParagraphStyle("Contact", fontSize=9, fontName="Helvetica",
                                            textColor=GRAY, alignment=TA_CENTER, spaceAfter=6)
            story.append(Paragraph(stripped, contact_style))
            continue

        # Bold-looking lines (short, possibly job titles / degrees)
        if len(stripped) < 80 and not stripped.endswith(".") and stripped[0].isupper():
            story.append(Paragraph(stripped, ParagraphStyle("Bold", fontSize=10,
                fontName="Helvetica-Bold", textColor=DARK, spaceAfter=2)))
            continue

        story.append(Paragraph(stripped, body_style))

    doc.build(story)
    return buffer.getvalue()
