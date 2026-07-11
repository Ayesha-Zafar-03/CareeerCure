"""
End-to-end tests for internship endpoints.
"""
from app.models.career import Internship
from tests.conftest import TestingSessionLocal


def seed_internships():
    """Insert test internships directly into the test DB."""
    db = TestingSessionLocal()
    existing = db.query(Internship).count()
    if existing == 0:
        internships = [
            Internship(
                title="Python Developer Intern",
                company="TechCorp",
                description="Build REST APIs using FastAPI and PostgreSQL in an agile team.",
                required_skills=["Python", "FastAPI", "PostgreSQL"],
                location="Karachi",
                duration="3 months",
            ),
            Internship(
                title="Data Science Intern",
                company="DataLab",
                description="Work on machine learning models using Python, pandas, and scikit-learn.",
                required_skills=["Python", "Machine Learning", "Pandas"],
                location="Lahore",
                duration="3 months",
            ),
            Internship(
                title="Frontend Developer Intern",
                company="WebAgency",
                description="Build responsive UIs using React and Tailwind CSS.",
                required_skills=["React", "JavaScript", "CSS"],
                location="Remote",
                duration="2 months",
            ),
        ]
        db.add_all(internships)
        db.commit()
    db.close()


class TestListInternships:
    def test_list_internships_public(self, client):
        seed_internships()
        res = client.get("/api/internships/list")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_list_internships_returns_data(self, client):
        seed_internships()
        res = client.get("/api/internships/list")
        data = res.json()
        assert len(data) >= 1
        first = data[0]
        assert "title" in first
        assert "company" in first
        assert "required_skills" in first

    def test_list_internships_pagination(self, client):
        seed_internships()
        res = client.get("/api/internships/list?skip=0&limit=2")
        assert res.status_code == 200
        assert len(res.json()) <= 2

    def test_get_internship_by_id(self, client):
        seed_internships()
        # Get first internship id
        res = client.get("/api/internships/list")
        internship_id = res.json()[0]["id"]

        res = client.get(f"/api/internships/{internship_id}")
        assert res.status_code == 200
        assert res.json()["id"] == internship_id

    def test_get_nonexistent_internship(self, client):
        res = client.get("/api/internships/99999")
        assert res.status_code == 404


class TestInternshipMatches:
    def test_matches_requires_auth(self, client):
        res = client.get("/api/internships/matches")
        assert res.status_code == 401

    def test_matches_without_cv_returns_404(self, client):
        # Register a brand-new user with no CV
        client.post("/api/auth/register", json={
            "email": "nocvmatch@example.com",
            "full_name": "No CV Match",
            "password": "password123",
        })
        from tests.conftest import TestingSessionLocal
        from app.models.user import User
        db = TestingSessionLocal()
        user = db.query(User).filter(User.email == "nocvmatch@example.com").first()
        if user:
            user.is_active = True
            db.commit()
        db.close()

        login_res = client.post("/api/auth/login", data={
            "username": "nocvmatch@example.com",
            "password": "password123",
        })
        headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        res = client.get("/api/internships/matches", headers=headers)
        assert res.status_code == 404
        assert "CV" in res.json()["detail"]
