import fitz  # PyMuPDF
import json
import logging
from groq import Groq
from app.core.config import settings
from app.vector.embedding_service import embed_text
from app.vector.chroma_client import upsert_cv, search_similar_internships

logger = logging.getLogger(__name__)


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
