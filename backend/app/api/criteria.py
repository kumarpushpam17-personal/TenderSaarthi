from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.api._mock import mock_meta, read_mock
from app.api.state import set_tender_status

router = APIRouter()


class CriterionUpdate(BaseModel):
    description: str | None = None
    category: str | None = None
    is_mandatory: bool | None = None
    threshold: Any = None


@router.get("/tenders/{tender_id}/criteria")
async def list_criteria(tender_id: str):
    payload = read_mock("criteria_list.json")
    payload["meta"]["tender_id"] = tender_id
    return payload


@router.patch("/tenders/{tender_id}/criteria/{criterion_id}")
async def update_criterion(
    tender_id: str, criterion_id: str, body: CriterionUpdate
):
    return {
        "data": {
            "id": criterion_id,
            "tender_id": tender_id,
            **body.model_dump(exclude_none=True),
        },
        "meta": mock_meta(),
    }


@router.post("/tenders/{tender_id}/criteria/approve")
async def approve_criteria(tender_id: str):
    set_tender_status(tender_id, "CRITERIA_APPROVED")
    return {
        "data": {"tender_id": tender_id, "status": "CRITERIA_APPROVED"},
        "meta": mock_meta(),
    }
