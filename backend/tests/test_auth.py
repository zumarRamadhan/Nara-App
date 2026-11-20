from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_register_success(client: TestClient):
    payload = {
        "name": "Budi Santoso",
        "email": "Budi.Santoso@example.com",
        "password": "strongpassword123",
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Budi Santoso"
    assert data["email"] == "budi.santoso@example.com"  # Lowercased
    assert "id" in data


def test_register_duplicate_email(client: TestClient):
    payload = {
        "name": "User One",
        "email": "user@example.com",
        "password": "password123",
    }
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    # Try duplicate with different case
    payload_dup = {
        "name": "User Two",
        "email": "USER@example.com",
        "password": "password456",
    }
    resp2 = client.post("/api/auth/register", json=payload_dup)
    assert resp2.status_code == 409
    assert "sudah terdaftar" in resp2.json()["detail"].lower()


def test_register_short_password(client: TestClient):
    payload = {
        "name": "User Test",
        "email": "test@example.com",
        "password": "short",  # < 8 chars
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 422


def test_login_success_sets_cookie(client: TestClient, registered_user: dict):
    resp = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert resp.status_code == 200
    assert "nara_session" in client.cookies
    assert resp.json()["user"]["email"] == registered_user["email"]


def test_login_invalid_credentials_identical_message(
    client: TestClient, registered_user: dict
):
    # 1. Wrong password
    resp1 = client.post(
        "/api/auth/login",
        json={"email": registered_user["email"], "password": "wrongpassword999"},
    )
    assert resp1.status_code == 401
    detail_wrong_pw = resp1.json()["detail"]

    # 2. Wrong email
    resp2 = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": registered_user["password"],
        },
    )
    assert resp2.status_code == 401
    detail_wrong_email = resp2.json()["detail"]

    # Both must have IDENTICAL message
    assert detail_wrong_pw == detail_wrong_email
    assert detail_wrong_pw == "Email atau kata sandi salah."


def test_login_rate_limiting(client: TestClient, registered_user: dict):
    # Perform 5 failed attempts
    for _ in range(5):
        resp = client.post(
            "/api/auth/login",
            json={"email": registered_user["email"], "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    # 6th attempt should be blocked with 429
    blocked_resp = client.post(
        "/api/auth/login",
        json={"email": registered_user["email"], "password": "wrongpassword"},
    )
    assert blocked_resp.status_code == 429
    assert "30 detik" in blocked_resp.json()["detail"]


def test_me_without_session(client: TestClient):
    client.cookies.clear()
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_with_session(authenticated_client: TestClient, registered_user: dict):
    resp = authenticated_client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == registered_user["email"]


def test_logout_clears_cookie(authenticated_client: TestClient):
    resp = authenticated_client.post("/api/auth/logout")
    assert resp.status_code == 200
    assert resp.headers.get("Cache-Control") == "no-store"

    # Next call to /me must fail with 401
    resp_me = authenticated_client.get("/api/auth/me")
    assert resp_me.status_code == 401
