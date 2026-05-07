import json
from pathlib import Path
from typing import Any


MOCK_DIR = Path(__file__).resolve().parents[1] / "mock_responses"


def read_mock(filename: str) -> dict[str, Any]:
    return json.loads((MOCK_DIR / filename).read_text(encoding="utf-8"))


def mock_meta() -> dict[str, str]:
    return {"request_id": "mock-001", "timestamp": "2026-05-07T12:00:00Z"}
