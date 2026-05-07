from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import bidders, criteria, health, submissions, tenders, verdicts

app = FastAPI(title="TenderSaarthi API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(tenders.router, prefix="/api/v1")
app.include_router(criteria.router, prefix="/api/v1")
app.include_router(bidders.router, prefix="/api/v1")
app.include_router(submissions.router, prefix="/api/v1")
app.include_router(verdicts.router, prefix="/api/v1")
