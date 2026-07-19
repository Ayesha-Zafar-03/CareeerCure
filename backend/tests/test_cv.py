"""
End-to-end tests for CV upload and analysis endpoints.
PDF parsing and Groq LLM calls are mocked.
"""
import io
import json
from unittest.mock import patch, MagicMock


MOCK_ANALYSIS = {
    "extracted_skills": ["Python", "FastAPI", "SQL", "Git"],
    "skill_gaps": ["Docker", "Kubernetes", "Cloud"],
    "strengths": ["Strong Python skills", "Good project experience"],
    "recommendations": ["Learn Docker", "Build more projects"],
    "summary": "A motivated CS student with solid Python skills.",
}


def make_fake_pdf() -> bytes:
    """Return minimal valid PDF bytes for testing."""
    return b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF"""


class TestCVUpload:
    def test_upload_requires_auth(self, client):
        res = client.post("/api/cv/upload",
                          files={"file": ("cv.pdf", make_fake_pdf(), "application/pdf")})
        assert res.status_code == 401

    def test_upload_non_pdf_rejected(self, client, auth_headers):
        res = client.post("/api/cv/upload",
                          files={"file": ("cv.docx", b"fake content", "application/octet-stream")},
                          headers=auth_headers)
        assert res.status_code == 400
        assert "PDF" in res.json()["detail"]

    @patch("app.services.cv_service.analyse_cv_with_llm")
    @patch("app.services.cv_service.extract_text_from_pdf")
    @patch("app.services.cv_service.embed_text")
    @patch("app.services.cv_service.upsert_cv")
    @patch("app.services.cv_service.search_similar_internships")
    def test_upload_pdf_success(
        self, mock_search, mock_upsert, mock_embed, mock_extract, mock_analyse,
        client, auth_headers
    ):
        mock_extract.return_value = "John Doe\nPython Developer\nSkills: Python, SQL, FastAPI"
        mock_analyse.return_value = MOCK_ANALYSIS
        mock_embed.return_value = [0.1] * 384
        mock_upsert.return_value = None
        mock_search.return_value = [{"internship_id": 1, "score": 0.92, "snippet": "Python role"}]

        res = client.post("/api/cv/upload",
                          files={"file": ("cv.pdf", make_fake_pdf(), "application/pdf")},
                          headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "analysis" in data
        assert "job_matches" in data
        assert data["analysis"]["extracted_skills"] == MOCK_ANALYSIS["extracted_skills"]

    @patch("app.services.cv_service.analyse_cv_with_llm")
    @patch("app.services.cv_service.extract_text_from_pdf")
    @patch("app.services.cv_service.embed_text")
    @patch("app.services.cv_service.upsert_cv")
    @patch("app.services.cv_service.search_similar_internships")
    def test_upload_saves_skills_to_profile(
        self, mock_search, mock_upsert, mock_embed, mock_extract, mock_analyse,
        client, auth_headers
    ):
        mock_extract.return_value = "Skills: Python, Docker, AWS"
        mock_analyse.return_value = MOCK_ANALYSIS
        mock_embed.return_value = [0.1] * 384
        mock_upsert.return_value = None
        mock_search.return_value = []

        client.post("/api/cv/upload",
                    files={"file": ("cv.pdf", make_fake_pdf(), "application/pdf")},
                    headers=auth_headers)

        # Check profile has skills
        profile_res = client.get("/api/profile/me", headers=auth_headers)
        skills = profile_res.json()["profile"]["skills"]
        assert len(skills) > 0

    def test_get_analysis_without_cv(self, client, auth_headers):
        # Fresh user with no CV — need separate auth
        # Register a new user
        client.post("/api/auth/register", json={
            "email": "nocv@example.com",
            "full_name": "No CV",
            "password": "password123",
        })
        from tests.conftest import TestingSessionLocal
        from app.models.user import User
        db = TestingSessionLocal()
        user = db.query(User).filter(User.email == "nocv@example.com").first()
        if user:
            user.is_active = True
            db.commit()
        db.close()

        login_res = client.post("/api/auth/login", data={
            "username": "nocv@example.com",
            "password": "password123",
        })
        new_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        res = client.get("/api/cv/analysis", headers=new_headers)
        assert res.status_code == 404

    @patch("app.services.cv_service.analyse_cv_with_llm")
    @patch("app.services.cv_service.extract_text_from_pdf")
    @patch("app.services.cv_service.embed_text")
    @patch("app.services.cv_service.upsert_cv")
    @patch("app.services.cv_service.search_similar_internships")
    def test_get_analysis_after_upload(
        self, mock_search, mock_upsert, mock_embed, mock_extract, mock_analyse,
        client, auth_headers
    ):
        mock_extract.return_value = "Python developer with 2 years experience"
        mock_analyse.return_value = MOCK_ANALYSIS
        mock_embed.return_value = [0.1] * 384
        mock_upsert.return_value = None
        mock_search.return_value = []

        client.post("/api/cv/upload",
                    files={"file": ("cv.pdf", make_fake_pdf(), "application/pdf")},
                    headers=auth_headers)

        res = client.get("/api/cv/analysis", headers=auth_headers)
        assert res.status_code == 200
        assert "analysis" in res.json()
