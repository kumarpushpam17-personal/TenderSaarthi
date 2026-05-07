import uuid

from fastapi import APIRouter, File, Form, UploadFile

from app.api._mock import mock_meta, read_mock
from app.api.state import get_tender_status, set_tender_status

router = APIRouter()


@router.get("/tenders")
async def list_tenders():
    return read_mock("tenders_list.json")


@router.post("/tenders")
async def create_tender(
    title: str | None = Form(default=None),
    procuring_department: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    tender_id = f"t-{uuid.uuid4().hex[:6]}"
    set_tender_status(tender_id, "EXTRACTING")
    return {
        "data": {
            "id": tender_id,
            "title": title or "New Tender",
            "procuring_department": procuring_department or "CRPF",
            "status": "EXTRACTING",
            "uploaded_at": "2026-05-07T12:00:00Z",
            "source_pdf_uri": f"/mock/tenders/{file.filename}" if file else None,
            "criteria_count": 0,
            "bidder_count": 0,
            "verdict_count": 0,
        },
        "meta": mock_meta(),
    }


@router.get("/tenders/{tender_id}")
async def get_tender(tender_id: str):
    payload = read_mock("tender_detail.json")
    payload["data"]["id"] = tender_id
    payload["data"]["status"] = get_tender_status(tender_id)
    return payload


@router.post("/tenders/{tender_id}/evaluate")
async def evaluate_tender(tender_id: str):
    set_tender_status(tender_id, "EVALUATED")
    return {
        "data": {
            "tender_id": tender_id,
            "job_id": f"job-{uuid.uuid4().hex[:8]}",
            "status": "EVALUATING",
        },
        "meta": mock_meta(),
    }


@router.get("/tenders/{tender_id}/report")
async def get_report(tender_id: str):
    payload = read_mock("audit_report.json")
    payload["data"]["tender_id"] = tender_id
    return payload
