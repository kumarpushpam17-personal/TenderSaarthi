import uuid

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

from app.api._mock import mock_meta, read_mock

router = APIRouter()


class BidderCreate(BaseModel):
    legal_name: str


@router.get("/tenders/{tender_id}/bidders")
async def list_bidders(tender_id: str):
    payload = read_mock("bidders_list.json")
    payload["meta"]["tender_id"] = tender_id
    return payload


@router.post("/tenders/{tender_id}/bidders")
async def create_bidder(tender_id: str, body: BidderCreate):
    return {
        "data": {
            "id": f"b-{uuid.uuid4().hex[:6]}",
            "tender_id": tender_id,
            "legal_name": body.legal_name,
            "uploaded_at": "2026-05-07T12:00:00Z",
            "documents": [],
        },
        "meta": mock_meta(),
    }


@router.post("/bidders/{bidder_id}/documents")
async def upload_document(bidder_id: str, file: UploadFile = File(...)):
    return {
        "data": {
            "id": f"d-{uuid.uuid4().hex[:6]}",
            "bidder_id": bidder_id,
            "filename": file.filename,
            "document_type": "TYPED_PDF",
            "detected_languages": ["en"],
        },
        "meta": mock_meta(),
    }
