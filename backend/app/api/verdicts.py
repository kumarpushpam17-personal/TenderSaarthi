from fastapi import APIRouter
from pydantic import BaseModel

from app.api._mock import mock_meta, read_mock

router = APIRouter()


class OverrideBody(BaseModel):
    reason: str


@router.get("/tenders/{tender_id}/verdicts")
async def get_verdicts(tender_id: str):
    payload = read_mock("verdict_matrix.json")
    payload["data"]["tender_id"] = tender_id
    payload["meta"]["tender_id"] = tender_id
    return payload


@router.post("/verdicts/{verdict_id}/approve")
async def approve_verdict(verdict_id: str):
    return {
        "data": {"id": verdict_id, "reviewer_action": "APPROVED"},
        "meta": mock_meta(),
    }


@router.post("/verdicts/{verdict_id}/override")
async def override_verdict(verdict_id: str, body: OverrideBody):
    return {
        "data": {
            "id": verdict_id,
            "reviewer_action": "OVERRIDDEN",
            "reviewer_reason": body.reason,
        },
        "meta": mock_meta(),
    }
