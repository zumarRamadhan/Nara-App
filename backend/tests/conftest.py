import os
import sys
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.rate_limit import clear_all_rate_limits
from app.db.base import Base
from app.db.session import get_db
from app.main import app

test_engine = create_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def clean_db_and_limits():
    clear_all_rate_limits()
    # Clean tables before each test
    with test_engine.connect() as conn, conn.begin():
        conn.execute(Base.metadata.tables["comments"].delete())
        conn.execute(Base.metadata.tables["analyses"].delete())
        conn.execute(Base.metadata.tables["activity_logs"].delete())
        conn.execute(Base.metadata.tables["users"].delete())
    yield


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client: TestClient) -> dict:
    user_data = {
        "name": "Zumar Ramadhan",
        "email": "zumarramadhan@gmail.com",
        "password": "password123",
    }
    resp = client.post("/api/auth/register", json=user_data)
    assert resp.status_code == 201
    return user_data


@pytest.fixture
def authenticated_client(client: TestClient, registered_user: dict) -> TestClient:
    login_resp = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert login_resp.status_code == 200
    assert "nara_session" in client.cookies
    return client
