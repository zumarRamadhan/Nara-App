import json
import os

from fastapi.testclient import TestClient

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


def test_get_import_template(client: TestClient):
    resp = client.get("/api/imports/template")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")
    content = resp.text
    assert "comment_text,timestamp,username,like_count,post_title" in content
    assert "Kopi susunya mantap" in content


def test_import_labeled_file(authenticated_client: TestClient):
    file_path = os.path.join(FIXTURES_DIR, "nara-dummy-comments-labeled.csv")
    assert os.path.exists(file_path), (
        "Fixture nara-dummy-comments-labeled.csv harus ada"
    )

    mapping = {
        "comment_text": "comment_text",
        "timestamp": "timestamp",
        "username": "username",
        "like_count": "like_count",
        "post_title": "post_title",
        "label": "label",
    }

    with open(file_path, "rb") as f:
        resp = authenticated_client.post(
            "/api/imports",
            files={"file": ("nara-dummy-comments-labeled.csv", f, "text/csv")},
            data={"mapping": json.dumps(mapping)},
        )

    assert resp.status_code == 200
    result = resp.json()
    assert result["total_comments"] == 160
    assert result["has_label"] is True
    analysis_id = result["id"]

    # Verify detail summary & aggregations
    detail_resp = authenticated_client.get(f"/api/analyses/{analysis_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()

    assert detail["total_comments"] == 160
    assert detail["has_label"] is True

    # Label distribution: 64 positif, 47 netral, 49 negatif
    dist = detail["label_distribution"]
    assert dist["positive"] == 64
    assert dist["neutral"] == 47
    assert dist["negative"] == 49

    # Post title breakdown: exactly 33, 32, 31, 32, 32
    pt_counts = {
        item["post_title"]: item["total"] for item in detail["post_title_breakdown"]
    }
    assert pt_counts["Peluncuran varian Kopi Susu Gula Aren"] == 33
    assert pt_counts["Review tas souvenir motif batik"] == 32
    assert pt_counts["Pengumuman kenaikan harga menu bulan depan"] == 31
    assert pt_counts["Promo gajian diskon 20% semua menu"] == 32
    assert pt_counts["Tanya pendapat kalian: kemasan baru Batik Nusa"] == 32


def test_import_unlabeled_file(authenticated_client: TestClient):
    file_path = os.path.join(FIXTURES_DIR, "nara-dummy-comments.csv")
    assert os.path.exists(file_path), "Fixture nara-dummy-comments.csv harus ada"

    mapping = {
        "comment_text": "comment_text",
        "timestamp": "timestamp",
        "username": "username",
        "like_count": "like_count",
        "post_title": "post_title",
    }

    with open(file_path, "rb") as f:
        resp = authenticated_client.post(
            "/api/imports",
            files={"file": ("nara-dummy-comments.csv", f, "text/csv")},
            data={"mapping": json.dumps(mapping)},
        )

    assert resp.status_code == 200
    result = resp.json()
    assert result["total_comments"] == 160
    assert result["has_label"] is False


def test_import_invalid_file_missing_comment_column(authenticated_client: TestClient):
    file_path = os.path.join(FIXTURES_DIR, "nara-dummy-invalid.csv")
    assert os.path.exists(file_path), "Fixture nara-dummy-invalid.csv harus ada"

    mapping = {
        "comment_text": "comment_text",  # Kolom ini tidak ada di file invalid
    }

    with open(file_path, "rb") as f:
        resp = authenticated_client.post(
            "/api/imports",
            files={"file": ("nara-dummy-invalid.csv", f, "text/csv")},
            data={"mapping": json.dumps(mapping)},
        )

    assert resp.status_code == 400
    assert "tidak ditemukan dalam file" in resp.json()["detail"].lower()


def test_import_file_too_large(authenticated_client: TestClient):
    mapping = {"comment_text": "comment"}
    # 6 MB dummy content
    fake_large_csv = b"comment\n" + (b"ini komentar dummy panjang sekali\n" * 200000)
    assert len(fake_large_csv) > 5 * 1024 * 1024

    resp = authenticated_client.post(
        "/api/imports",
        files={"file": ("large.csv", fake_large_csv, "text/csv")},
        data={"mapping": json.dumps(mapping)},
    )
    assert resp.status_code == 413
    assert "5 mb" in resp.json()["detail"].lower()


def test_import_file_too_many_rows(authenticated_client: TestClient):
    mapping = {"comment_text": "comment"}
    # 10.005 rows
    lines = ["comment\n"] + [f"komentar baris ke-{i}\n" for i in range(10005)]
    csv_bytes = "".join(lines).encode("utf-8")

    resp = authenticated_client.post(
        "/api/imports",
        files={"file": ("too_many.csv", csv_bytes, "text/csv")},
        data={"mapping": json.dumps(mapping)},
    )
    assert resp.status_code == 400
    assert "10.000 baris" in resp.json()["detail"].lower()


def test_import_wrong_extension(authenticated_client: TestClient):
    mapping = {"comment_text": "comment"}
    resp = authenticated_client.post(
        "/api/imports",
        files={"file": ("document.pdf", b"%PDF-1.4...", "application/pdf")},
        data={"mapping": json.dumps(mapping)},
    )
    assert resp.status_code == 400
    assert "tidak didukung" in resp.json()["detail"].lower()


def test_multi_tenant_isolation_404(client: TestClient, registered_user: dict):
    # 1. Login sebagai User A dan upload file
    login_a = client.post(
        "/api/auth/login",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert login_a.status_code == 200

    file_path = os.path.join(FIXTURES_DIR, "nara-dummy-comments.csv")
    mapping = {"comment_text": "comment_text"}
    with open(file_path, "rb") as f:
        resp_upload = client.post(
            "/api/imports",
            files={"file": ("nara-dummy-comments.csv", f, "text/csv")},
            data={"mapping": json.dumps(mapping)},
        )
    assert resp_upload.status_code == 200
    analysis_id = resp_upload.json()["id"]

    # 2. Register & Login sebagai User B
    user_b_payload = {
        "name": "User B",
        "email": "userb@example.com",
        "password": "password456",
    }
    client.post("/api/auth/register", json=user_b_payload)
    client.post(
        "/api/auth/login",
        json={"email": user_b_payload["email"], "password": user_b_payload["password"]},
    )

    # 3. User B mencoba mengakses analysis milik User A -> HARUS 404
    resp_access = client.get(f"/api/analyses/{analysis_id}")
    assert resp_access.status_code == 404

    resp_comments = client.get(f"/api/analyses/{analysis_id}/comments")
    assert resp_comments.status_code == 404

    resp_delete = client.delete(f"/api/analyses/{analysis_id}")
    assert resp_delete.status_code == 404
