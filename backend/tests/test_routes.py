import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.anyio
async def test_health():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.anyio
async def test_list_tenders():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tenders")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]) == 3
    assert payload["data"][0]["id"] == "t-001"
    assert payload["meta"]["stats"]["verdicts_total"] == 27


@pytest.mark.anyio
async def test_list_criteria():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tenders/t-001/criteria")

    assert response.status_code == 200
    assert len(response.json()["data"]) == 9


@pytest.mark.anyio
async def test_approve_criteria():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/tenders/t-001/criteria/approve")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "CRITERIA_APPROVED"


@pytest.mark.anyio
async def test_list_bidders():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tenders/t-001/bidders")

    assert response.status_code == 200
    bidders = response.json()["data"]
    assert len(bidders) == 3
    assert bidders[1]["documents"][0]["detected_languages"] == ["hi"]


@pytest.mark.anyio
async def test_get_verdicts():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tenders/t-001/verdicts")

    assert response.status_code == 200
    matrix = response.json()["data"]
    assert len(matrix["verdicts"]) == 3
    assert len(matrix["criteria"]) == 9


@pytest.mark.anyio
async def test_get_report():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/tenders/t-001/report")

    assert response.status_code == 200
    report = response.json()["data"]
    assert report["verdict_count"] == 27
    assert report["content_hash"]


@pytest.mark.anyio
async def test_list_public_tenders_for_bidder_workspace():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/public/tenders")

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"][0]["id"] == "t-001"
    assert payload["data"][0]["submission_status"] == "NOT_STARTED"
    assert payload["meta"]["total"] >= 1


@pytest.mark.anyio
async def test_create_bidder_submission_and_upload_document():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        create_response = await client.post(
            "/api/v1/public/tenders/t-001/submissions",
            json={
                "legal_name": "Demo Infrastructure LLP",
                "contact_email": "demo@example.com",
                "gst_number": "29ABCDE1234F1Z5",
            },
        )
        upload_response = await client.post(
            "/api/v1/submissions/s-mock/documents",
            files={"file": ("turnover.pdf", b"mock pdf", "application/pdf")},
        )

    assert create_response.status_code == 200
    created = create_response.json()["data"]
    assert created["id"].startswith("s-")
    assert created["tender_id"] == "t-001"
    assert created["status"] == "PROCESSING"
    assert upload_response.status_code == 200
    uploaded = upload_response.json()["data"]
    assert uploaded["submission_id"] == "s-mock"
    assert uploaded["filename"] == "turnover.pdf"


@pytest.mark.anyio
async def test_get_submission_status_and_admin_submission_list():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        status_response = await client.get("/api/v1/submissions/s-001")
        admin_response = await client.get("/api/v1/tenders/t-001/submissions")

    assert status_response.status_code == 200
    status_payload = status_response.json()["data"]
    assert status_payload["id"] == "s-001"
    assert status_payload["status"] == "READY_FOR_EVALUATION"
    assert admin_response.status_code == 200
    submissions = admin_response.json()["data"]
    assert len(submissions) == 3
    assert submissions[0]["document_count"] >= 3
