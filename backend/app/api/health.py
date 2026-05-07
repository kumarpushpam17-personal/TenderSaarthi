from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "tendersaarthi-backend"}


@router.get("/version")
async def version():
    return {"version": "0.1.0", "phase": "mock"}
