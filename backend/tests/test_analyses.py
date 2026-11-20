import json
import os

from fastapi.testclient import TestClient

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


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


def test_list_analyses(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    resp = authenticated_client.get("/api/analyses?page=1&page_size=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any(item["id"] == analysis_id for item in data["items"])


def test_comments_pagination_and_total(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    # Page 1 with page_size=10
    resp1 = authenticated_client.get(
        f"/api/analyses/{analysis_id}/comments?page=1&page_size=10"
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["total"] == 160
    assert len(data1["items"]) == 10

    # Page 2 with page_size=10
    resp2 = authenticated_client.get(
        f"/api/analyses/{analysis_id}/comments?page=2&page_size=10"
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert len(data2["items"]) == 10
    assert data1["items"][0]["id"] != data2["items"][0]["id"]


def test_comments_search_query_harga(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    resp = authenticated_client.get(f"/api/analyses/{analysis_id}/comments?q=harga")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] > 0
    # Every returned comment must contain 'harga' in text or username
    for item in data["items"]:
        match_in_text = "harga" in item["text_raw"].lower()
        match_in_user = item["username"] and "harga" in item["username"].lower()
        assert match_in_text or match_in_user


def test_comments_filter_label_negatif(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    resp = authenticated_client.get(
        f"/api/analyses/{analysis_id}/comments?label=negatif&page_size=100"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 49  # We have exactly 49 negatif
    for item in data["items"]:
        assert item["label"] == "negatif"


def test_comments_sorting_by_likes(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    resp = authenticated_client.get(
        f"/api/analyses/{analysis_id}/comments?sort=likes&order=desc&page_size=20"
    )
    assert resp.status_code == 200
    items = resp.json()["items"]
    like_counts = [item["like_count"] for item in items]
    assert like_counts == sorted(like_counts, reverse=True)


def test_delete_analysis_cascades(authenticated_client: TestClient):
    analysis_id = setup_imported_analysis(authenticated_client)

    # Delete
    del_resp = authenticated_client.delete(f"/api/analyses/{analysis_id}")
    assert del_resp.status_code == 200
    assert "berhasil dihapus" in del_resp.json()["message"].lower()

    # Subsequent GET -> 404
    get_resp = authenticated_client.get(f"/api/analyses/{analysis_id}")
    assert get_resp.status_code == 404

    # Subsequent GET comments -> 404
    comments_resp = authenticated_client.get(f"/api/analyses/{analysis_id}/comments")
    assert comments_resp.status_code == 404
