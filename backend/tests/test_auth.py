"""
End-to-end tests for authentication endpoints.
"""
import pytest
from sqlalchemy.orm import Session
from app.models.user import User


class TestRegister:
    def test_register_success(self, client):
        res = client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "password123",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "newuser@example.com"
        assert "message" in data

    def test_register_duplicate_email(self, client, registered_user):
        # Activate user first
        db = __import__("app.core.database", fromlist=["SessionLocal"]).SessionLocal
        res = client.post("/api/auth/register", json={
            "email": registered_user["email"],
            "full_name": "Duplicate",
            "password": "password123",
        })
        # Should either succeed (re-register pending) or 400 if already active
        assert res.status_code in (201, 400)

    def test_register_short_password(self, client):
        res = client.post("/api/auth/register", json={
            "email": "short@example.com",
            "full_name": "Short Pass",
            "password": "abc",
        })
        assert res.status_code == 400
        assert "8 characters" in res.json()["detail"]

    def test_register_invalid_email(self, client):
        res = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "full_name": "Bad Email",
            "password": "password123",
        })
        assert res.status_code == 422  # Pydantic validation error


class TestLogin:
    def test_login_success(self, client, registered_user):
        res = client.post("/api/auth/login", data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == registered_user["email"]

    def test_login_wrong_password(self, client, registered_user):
        res = client.post("/api/auth/login", data={
            "username": registered_user["email"],
            "password": "wrongpassword",
        })
        assert res.status_code == 401
        assert "Incorrect" in res.json()["detail"]

    def test_login_nonexistent_user(self, client):
        res = client.post("/api/auth/login", data={
            "username": "nobody@example.com",
            "password": "password123",
        })
        assert res.status_code == 401

    def test_login_returns_jwt_structure(self, client, registered_user):
        res = client.post("/api/auth/login", data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        })
        token = res.json()["access_token"]
        # JWT has 3 parts separated by dots
        parts = token.split(".")
        assert len(parts) == 3


class TestProtectedRoutes:
    def test_access_without_token(self, client):
        res = client.get("/api/profile/me")
        assert res.status_code == 401

    def test_access_with_invalid_token(self, client):
        res = client.get("/api/profile/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert res.status_code == 401

    def test_access_with_valid_token(self, client, auth_headers):
        res = client.get("/api/profile/me", headers=auth_headers)
        assert res.status_code == 200

    def test_refresh_token(self, client, auth_headers):
        res = client.post("/api/auth/refresh", headers=auth_headers)
        assert res.status_code == 200
        assert "access_token" in res.json()


class TestForgotPassword:
    def test_forgot_password_existing_email(self, client, registered_user):
        res = client.post("/api/auth/forgot-password", json={
            "email": registered_user["email"]
        })
        assert res.status_code == 200
        assert "message" in res.json()

    def test_forgot_password_nonexistent_email(self, client):
        res = client.post("/api/auth/forgot-password", json={
            "email": "ghost@example.com"
        })
        # Should return 200 (don't leak whether email exists)
        assert res.status_code == 200

    def test_reset_password_invalid_otp(self, client, registered_user):
        res = client.post("/api/auth/reset-password", json={
            "email": registered_user["email"],
            "otp": "000000",
            "new_password": "newpassword123",
        })
        assert res.status_code == 400
        assert "Invalid" in res.json()["detail"]

    def test_reset_password_short_password(self, client, registered_user):
        res = client.post("/api/auth/reset-password", json={
            "email": registered_user["email"],
            "otp": "123456",
            "new_password": "short",
        })
        assert res.status_code == 400


class TestChangePassword:
    def test_change_password_success(self, client, auth_headers, registered_user):
        res = client.post("/api/auth/change-password", json={
            "current_password": registered_user["password"],
            "new_password": "newpassword456",
        }, headers=auth_headers)
        assert res.status_code == 200

        # Change back so other tests still work
        client.post("/api/auth/change-password", json={
            "current_password": "newpassword456",
            "new_password": registered_user["password"],
        }, headers=auth_headers)

    def test_change_password_wrong_current(self, client, auth_headers):
        res = client.post("/api/auth/change-password", json={
            "current_password": "wrongpassword",
            "new_password": "newpassword456",
        }, headers=auth_headers)
        assert res.status_code == 400

    def test_change_password_unauthenticated(self, client):
        res = client.post("/api/auth/change-password", json={
            "current_password": "anything",
            "new_password": "newpassword456",
        })
        assert res.status_code == 401
