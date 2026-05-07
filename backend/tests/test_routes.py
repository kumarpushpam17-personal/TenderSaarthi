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
