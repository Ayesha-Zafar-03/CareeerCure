"""
Pytest configuration — sets up an in-memory SQLite test database
and a TestClient that uses it instead of the real PostgreSQL DB.
"""
import os

os.environ.setdefault("TESTING", "1")
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("SECRET_KEY", "test-only-strong-key-abcdefghijklmnopqrstuvwxyz-123456")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# ── In-memory SQLite for tests (no PostgreSQL needed) ─────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once for the entire test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    """Fresh DB session per test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="session")
def client():
    """TestClient with DB override."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def registered_user(client):
    """Register a test user and return their credentials."""
    payload = {
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpass123",
    }
    res = client.post("/api/auth/register", json=payload)
    # Mark user as active directly (skip email OTP in tests)
    db = TestingSessionLocal()
    from app.models.user import User
    user = db.query(User).filter(User.email == payload["email"]).first()
    if user:
        user.is_active = True
        db.commit()
    db.close()
    return payload


@pytest.fixture(scope="session")
def auth_headers(client, registered_user):
    """Login and return Authorization headers."""
    res = client.post(
        "/api/auth/login",
        data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
