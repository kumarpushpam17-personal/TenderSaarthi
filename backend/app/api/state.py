from typing import Final

DEFAULT_TENDER_STATUS: Final = "AWAITING_REVIEW"

TENDER_STATUS: dict[str, str] = {"t-001": DEFAULT_TENDER_STATUS}


def get_tender_status(tender_id: str) -> str:
    return TENDER_STATUS.get(tender_id, DEFAULT_TENDER_STATUS)


def set_tender_status(tender_id: str, status: str) -> None:
    TENDER_STATUS[tender_id] = status
