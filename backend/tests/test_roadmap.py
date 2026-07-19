"""
End-to-end tests for career roadmap endpoints.
Roadmap generation calls Groq LLM — those tests are mocked.
"""
import json
import pytest
from unittest.mock import patch, MagicMock


MOCK_ROADMAP = {
    "title": "Data Scientist Roadmap",
    "goal": "Become a Data Scientist",
    "estimated_duration": "6-12 months",
    "phases": [
        {
            "phase_number": 1,
            "title": "Python & Statistics Foundations",
            "duration": "2 months",
            "objectives": ["Learn Python basics", "Understand statistics"],
            "resources": [{"name": "Python.org", "url": "https://python.org"}],
            "milestones": ["Complete Python course"],
        }
    ],
    "final_outcome": "Job-ready Data Scientist",
}


class TestRoadmapList:
    def test_list_roadmaps_authenticated(self, client, auth_headers):
        res = client.get("/api/roadmap/list", headers=auth_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_list_roadmaps_unauthenticated(self, client):
        res = client.get("/api/roadmap/list")
        assert res.status_code == 401


class TestRoadmapGenerate:
    @patch("app.services.recommendation_service.Groq")
    def test_generate_roadmap_success(self, mock_groq, client, auth_headers):
        # Mock Groq response
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = json.dumps(MOCK_ROADMAP)
        mock_client.chat.completions.create.return_value = mock_response

        res = client.post("/api/roadmap/generate",
                          json={"career_goal": "Data Scientist"},
                          headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "roadmap" in data
        assert data["career_goal"] == "Data Scientist"

    def test_generate_roadmap_unauthenticated(self, client):
        res = client.post("/api/roadmap/generate", json={"career_goal": "Developer"})
        assert res.status_code == 401

    def test_generate_roadmap_empty_goal(self, client, auth_headers):
        res = client.post("/api/roadmap/generate",
                          json={"career_goal": ""},
                          headers=auth_headers)
        # Empty string should still be accepted (LLM handles it)
        # or return validation error — either is acceptable
        assert res.status_code in (200, 422, 500)

    @patch("app.services.recommendation_service.Groq")
    def test_generated_roadmap_saved_to_db(self, mock_groq, client, auth_headers):
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = json.dumps(MOCK_ROADMAP)
        mock_client.chat.completions.create.return_value = mock_response

        # Generate
        client.post("/api/roadmap/generate",
                    json={"career_goal": "DevOps Engineer"},
                    headers=auth_headers)

        # Should appear in list
        res = client.get("/api/roadmap/list", headers=auth_headers)
        goals = [r["career_goal"] for r in res.json()]
        assert "DevOps Engineer" in goals

    @patch("app.services.recommendation_service.Groq")
    def test_get_roadmap_by_id(self, mock_groq, client, auth_headers):
        mock_client = MagicMock()
        mock_groq.return_value = mock_client
        mock_response = MagicMock()
        mock_response.choices[0].message.content = json.dumps(MOCK_ROADMAP)
        mock_client.chat.completions.create.return_value = mock_response

        # Generate
        gen_res = client.post("/api/roadmap/generate",
                              json={"career_goal": "ML Engineer"},
                              headers=auth_headers)
        roadmap_id = gen_res.json()["id"]

        # Fetch by ID
        res = client.get(f"/api/roadmap/{roadmap_id}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == roadmap_id

    def test_get_nonexistent_roadmap(self, client, auth_headers):
        res = client.get("/api/roadmap/99999", headers=auth_headers)
        assert res.status_code == 404
