"""Test PDF generation endpoints end-to-end."""
import fitz
from unittest.mock import patch

from tests.test_cv import make_fake_pdf, MOCK_ANALYSIS

CV_TEXT = """AHMED RAZA
ahmed.raza@example.com | +92 300 1234567 | Lahore, Pakistan

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3 years of experience.

EDUCATION
BS Computer Science
FAST NUCES, Lahore, 2020 - 2024
GPA: 3.7/4.0

PROFESSIONAL EXPERIENCE
Software Engineer - TechCorp Solutions (2023 - Present)
- Developed REST APIs using Python and FastAPI
- Improved query performance by 40%

TECHNICAL SKILLS
Python, JavaScript, React, PostgreSQL, Docker

KEY PROJECTS
E-Commerce Platform
- Built full-stack shopping platform with React and Node.js

CERTIFICATIONS
AWS Certified Cloud Practitioner

LANGUAGES
English (Fluent), Urdu (Native)

REFERENCES
Available upon request
"""


def _pdf_text(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    return "".join(page.get_text() for page in doc)


def test_generate_pdf_endpoint(client, auth_headers):
    res = client.post(
        "/api/cv/generate-pdf",
        json={"cv_text": CV_TEXT, "full_name": "Ahmed Raza"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content[:5] == b"%PDF-"
    text = _pdf_text(res.content)
    assert "AHMED RAZA" in text
    assert "PROFESSIONAL SUMMARY" in text
    assert "EDUCATION" in text


def test_generate_pdf_empty_rejected(client, auth_headers):
    res = client.post(
        "/api/cv/generate-pdf",
        json={"cv_text": "", "full_name": ""},
        headers=auth_headers,
    )
    assert res.status_code == 400


@patch("app.services.cv_service.analyse_cv_with_llm")
@patch("app.services.cv_service.extract_text_from_pdf")
@patch("app.services.cv_service.embed_text")
@patch("app.services.cv_service.upsert_cv")
@patch("app.services.cv_service.search_similar_internships")
def test_download_pdf_after_upload(
    mock_search, mock_upsert, mock_embed, mock_extract, mock_analyse,
    client, auth_headers
):
    mock_extract.return_value = CV_TEXT
    mock_analyse.return_value = MOCK_ANALYSIS
    mock_embed.return_value = [0.1] * 384
    mock_upsert.return_value = None
    mock_search.return_value = []

    up = client.post(
        "/api/cv/upload",
        files={"file": ("cv.pdf", make_fake_pdf(), "application/pdf")},
        headers=auth_headers,
    )
    assert up.status_code == 200

    res = client.get("/api/cv/download-pdf", headers=auth_headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content[:5] == b"%PDF-"
    assert "AHMED RAZA" in _pdf_text(res.content)
