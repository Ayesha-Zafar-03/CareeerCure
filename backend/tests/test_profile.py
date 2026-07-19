"""
End-to-end tests for profile endpoints.
"""


class TestGetProfile:
    def test_get_profile_authenticated(self, client, auth_headers, registered_user):
        res = client.get("/api/profile/me", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == registered_user["email"]
        assert data["full_name"] == registered_user["full_name"]
        assert "profile" in data

    def test_get_profile_unauthenticated(self, client):
        res = client.get("/api/profile/me")
        assert res.status_code == 401

    def test_profile_has_expected_fields(self, client, auth_headers):
        res = client.get("/api/profile/me", headers=auth_headers)
        profile = res.json()["profile"]
        assert "skills" in profile
        assert "bio" in profile
        assert "career_goal" in profile
        assert "has_cv" in profile
        assert isinstance(profile["skills"], list)


class TestUpdateProfile:
    def test_update_bio(self, client, auth_headers):
        res = client.put("/api/profile/me", json={"bio": "I am a CS student"}, headers=auth_headers)
        assert res.status_code == 200

        # Verify it was saved
        res = client.get("/api/profile/me", headers=auth_headers)
        assert res.json()["profile"]["bio"] == "I am a CS student"

    def test_update_skills(self, client, auth_headers):
        skills = ["Python", "FastAPI", "SQL"]
        res = client.put("/api/profile/me", json={"skills": skills}, headers=auth_headers)
        assert res.status_code == 200

        res = client.get("/api/profile/me", headers=auth_headers)
        assert set(skills).issubset(set(res.json()["profile"]["skills"]))

    def test_update_career_goal(self, client, auth_headers):
        res = client.put("/api/profile/me", json={"career_goal": "Data Scientist"}, headers=auth_headers)
        assert res.status_code == 200

        res = client.get("/api/profile/me", headers=auth_headers)
        assert res.json()["profile"]["career_goal"] == "Data Scientist"

    def test_update_experience_years(self, client, auth_headers):
        res = client.put("/api/profile/me", json={"experience_years": 2}, headers=auth_headers)
        assert res.status_code == 200

    def test_update_profile_unauthenticated(self, client):
        res = client.put("/api/profile/me", json={"bio": "test"})
        assert res.status_code == 401

    def test_partial_update_does_not_clear_other_fields(self, client, auth_headers):
        # Set bio
        client.put("/api/profile/me", json={"bio": "My bio"}, headers=auth_headers)
        # Update only skills
        client.put("/api/profile/me", json={"skills": ["Python"]}, headers=auth_headers)
        # Bio should still be there
        res = client.get("/api/profile/me", headers=auth_headers)
        assert res.json()["profile"]["bio"] == "My bio"
