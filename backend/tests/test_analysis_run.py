import json
import os

from fastapi.testclient import TestClient

from app.main import app
from app.services.sentiment_service import (
    ModelNotAvailableError,
    Prediction,
    get_sentiment_classifier,
)

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


class MockSentimentClassifier:
    def __init__(self, should_fail: bool = False, version: str = "mock-v1.0.0"):
        self.should_fail = should_fail
        self._version = version

    @property
    def model_version(self) -> str:
        return self._version

    def predict(self, texts: list[str]) -> list[Prediction]:
        if self.should_fail:
            raise ModelNotAvailableError("Model mock tidak tersedia untuk pengujian.")

        results = []
        for t in texts:
            if any(w in t for w in ["bagus", "mantap", "emopos", "rekomendasi", "puas"]):
                results.append(Prediction(label="positif", score=0.92))
            elif any(w in t for w in ["rusak", "jelek", "kecewa", "emoneg", "parah"]):
                results.append(Prediction(label="negatif", score=0.88))
            else:
                results.append(Prediction(label="netral", score=0.75))
        return results


def setup_imported_analysis(client: TestClient) -> str:
    file_path = os.path.join(FIXTURES_DIR, "nara-dummy-comments-labeled.csv")
    mapping = {
        "comment_text": "comment_text",
        "timestamp": "timestamp",
        "username": "username",
        "like_count": "like_count",
        "post_title": "post_title",
        "label": "label",
    }
    with open(file_path, "rb") as f:
        resp = client.post(
            "/api/imports",
            files={"file": ("nara-dummy-comments-labeled.csv", f, "text/csv")},
            data={"mapping": json.dumps(mapping)},
        )
    assert resp.status_code == 200
    return resp.json()["id"]


def test_results_before_run_returns_400(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)
    resp = authenticated_client.get(f"/api/analyses/{analysis_id}/results")
    assert resp.status_code == 400
    assert "belum dijalankan" in resp.json()["detail"]


def test_run_analysis_success_and_results(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    # Override sentiment classifier dengan Mock
    mock_classifier = MockSentimentClassifier(version="v1.0.0-test")
    app.dependency_overrides[get_sentiment_classifier] = lambda: mock_classifier

    try:
        # Jalankan run
        resp_run = authenticated_client.post(f"/api/analyses/{analysis_id}/run")
        assert resp_run.status_code == 200
        run_data = resp_run.json()
        assert run_data["status"] == "done"
        assert run_data["total_comments_processed"] == 160
        assert run_data["model_version"] == "v1.0.0-test"

        # Ambil results
        resp_res = authenticated_client.get(f"/api/analyses/{analysis_id}/results")
        assert resp_res.status_code == 200
        res_data = resp_res.json()

        assert res_data["analysis_id"] == analysis_id
        assert res_data["model_version"] == "v1.0.0-test"

        # Distribusi
        dist = res_data["distribution"]
        total = dist["positive"] + dist["neutral"] + dist["negative"]
        assert total == 160
        assert dist["positive_percent"] >= 0

        # Keywords
        keywords = res_data["top_keywords"]
        assert "positif" in keywords
        assert "netral" in keywords
        assert "negatif" in keywords

        # Agreement rate karena dataset berlabel (has_label = True)
        assert res_data["agreement_with_file_label"] is not None
        assert 0.0 <= res_data["agreement_with_file_label"] <= 100.0

    finally:
        app.dependency_overrides.pop(get_sentiment_classifier, None)


def test_run_analysis_idempotency(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)
    mock_classifier = MockSentimentClassifier(version="v1.0.0-idempotent")
    app.dependency_overrides[get_sentiment_classifier] = lambda: mock_classifier

    try:
        # Run pertama
        resp1 = authenticated_client.post(f"/api/analyses/{analysis_id}/run")
        assert resp1.status_code == 200

        # Run kedua (menimpa hasil sebelumnya tanpa duplikasi/error)
        resp2 = authenticated_client.post(f"/api/analyses/{analysis_id}/run")
        assert resp2.status_code == 200
        assert resp2.json()["total_comments_processed"] == 160

        # Cek results tetap konsisten total 160
        resp_res = authenticated_client.get(f"/api/analyses/{analysis_id}/results")
        assert resp_res.status_code == 200
        dist = resp_res.json()["distribution"]
        assert dist["positive"] + dist["neutral"] + dist["negative"] == 160

    finally:
        app.dependency_overrides.pop(get_sentiment_classifier, None)


def test_run_analysis_model_unavailable_returns_503(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)
    failing_classifier = MockSentimentClassifier(should_fail=True)
    app.dependency_overrides[get_sentiment_classifier] = lambda: failing_classifier

    try:
        resp = authenticated_client.post(f"/api/analyses/{analysis_id}/run")
        assert resp.status_code == 503
        assert "tidak tersedia" in resp.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_sentiment_classifier, None)


def test_run_and_results_multi_tenant_isolation_404(client: TestClient, registered_user: dict):
    # 1. Login sebagai User A dan upload file
    login_a = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert login_a.status_code == 200
    analysis_id = setup_imported_analysis(client)

    # 2. Register & Login sebagai User B
    user_b_payload = {
        "name": "User B",
        "email": "user_b_run@example.com",
        "password": "Password123!",
    }
    client.post("/api/auth/register", json=user_b_payload)
    client.post(
        "/api/auth/login",
        json={"email": user_b_payload["email"], "password": user_b_payload["password"]},
    )

    # 3. User B mencoba run analisis milik User A -> 404
    resp_run = client.post(f"/api/analyses/{analysis_id}/run")
    assert resp_run.status_code == 404

    # 4. User B mencoba get results milik User A -> 404
    resp_res = client.get(f"/api/analyses/{analysis_id}/results")
    assert resp_res.status_code == 404
