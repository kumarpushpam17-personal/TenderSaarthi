import uuid

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

from app.api._mock import mock_meta, read_mock

router = APIRouter()


class SubmissionCreate(BaseModel):
    legal_name: str
    contact_email: str
    gst_number: str | None = None


@router.get("/public/tenders")
async def list_public_tenders():
    return read_mock("public_tenders_list.json")


@router.get("/public/tenders/{tender_id}")
async def get_public_tender(tender_id: str):
    payload = read_mock("tender_detail.json")
    payload["data"]["id"] = tender_id
    payload["data"]["submission_deadline"] = "2026-05-20T17:00:00Z"
    payload["data"]["submission_status"] = "NOT_STARTED"
    return payload


@router.post("/public/tenders/{tender_id}/submissions")
async def create_submission(tender_id: str, body: SubmissionCreate):
    return {
        "data": {
            "id": f"s-{uuid.uuid4().hex[:6]}",
            "tender_id": tender_id,
            "bidder_id": f"b-{uuid.uuid4().hex[:6]}",
            "legal_name": body.legal_name,
            "contact_email": body.contact_email,
            "gst_number": body.gst_number,
            "status": "PROCESSING",
            "submitted_at": "2026-05-07T12:00:00Z",
            "document_count": 0,
            "documents": [],
            "processing_summary": {
                "ocr": "queued",
                "criteria_matched": 0,
                "needs_correction": 0,
            },
        },
        "meta": mock_meta(),
    }


@router.post("/submissions/{submission_id}/documents")
async def upload_submission_document(
    submission_id: str, file: UploadFile = File(...)
):
    return {
        "data": {
            "id": f"d-{uuid.uuid4().hex[:6]}",
            "submission_id": submission_id,
            "filename": file.filename,
            "document_type": "TYPED_PDF",
            "detected_languages": ["en"],
        },
        "meta": mock_meta(),
    }


@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str):
    payload = read_mock("submissions_list.json")
    submission = next(
        (item for item in payload["data"] if item["id"] == submission_id),
        payload["data"][0],
    )
    submission["id"] = submission_id
    return {"data": submission, "meta": mock_meta()}


@router.get("/tenders/{tender_id}/submissions")
async def list_tender_submissions(tender_id: str):
    payload = read_mock("submissions_list.json")
    payload["data"] = [
        {**item, "tender_id": tender_id}
        for item in payload["data"]
    ]
    payload["meta"]["tender_id"] = tender_id
    return payload
