# Frontend + Mock Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full TenderSaarthi frontend (Next.js 14 + shadcn/ui) and mock FastAPI backend so every page renders with realistic data and the API contract is locked for Phase 3.

**Architecture:** FastAPI reads static JSON from `backend/app/mock_responses/`; frontend calls it over HTTP. Government Blue (#1e40af) style, top-nav + horizontal tab stepper, 7 admin mock pages total. All 14 mock endpoints are wired — Phase 3 swaps handler bodies and adds the bidder workspace endpoints.

**Role clarification:** This plan implemented the admin/reviewer mock flow first. `/tenders/[id]/bidders` is an admin-assisted shortcut used to keep the mock phase small. The target product also requires a bidder workspace where bidders view open tenders and upload their own submissions, then the admin workspace reviews received submissions.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, FastAPI 0.115, Python 3.11, Docker Compose.

---

## File Map

**Backend (new files)**
- `backend/pyproject.toml` — deps + build config
- `backend/Dockerfile`
- `backend/app/__init__.py`
- `backend/app/main.py` — FastAPI app + CORS
- `backend/app/api/__init__.py`
- `backend/app/api/health.py`
- `backend/app/api/tenders.py`
- `backend/app/api/criteria.py`
- `backend/app/api/bidders.py`
- `backend/app/api/verdicts.py`
- `backend/app/mock_responses/tenders_list.json`
- `backend/app/mock_responses/tender_detail.json`
- `backend/app/mock_responses/criteria_list.json`
- `backend/app/mock_responses/bidders_list.json`
- `backend/app/mock_responses/verdict_matrix.json`
- `backend/app/mock_responses/audit_report.json`
- `backend/tests/__init__.py`
- `backend/tests/test_routes.py`

**Frontend (new — scaffolded then extended)**
- `frontend/` — entire Next.js app
- `frontend/lib/types.ts` — all TypeScript interfaces
- `frontend/lib/api.ts` — typed fetch helpers
- `frontend/components/layout/TopNav.tsx`
- `frontend/components/layout/TenderTabs.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/app/tenders/page.tsx`
- `frontend/components/tenders/TenderStatusBadge.tsx`
- `frontend/components/tenders/StatsRow.tsx`
- `frontend/components/tenders/TenderCard.tsx`
- `frontend/app/tenders/new/page.tsx`
- `frontend/app/tenders/[id]/layout.tsx`
- `frontend/app/tenders/[id]/page.tsx`
- `frontend/app/tenders/[id]/review-criteria/page.tsx`
- `frontend/components/criteria/CriterionEditModal.tsx`
- `frontend/components/criteria/CriterionRow.tsx`
- `frontend/components/criteria/CriteriaTable.tsx`
- `frontend/app/tenders/[id]/bidders/page.tsx`
- `frontend/components/bidders/DocumentBadge.tsx`
- `frontend/components/bidders/BidderCard.tsx`
- `frontend/components/bidders/AddBidderModal.tsx`
- `frontend/app/bidder/tenders/page.tsx` — target bidder workspace route, not included in this mock shortcut plan
- `frontend/app/bidder/tenders/[id]/page.tsx` — target bidder tender details route
- `frontend/app/bidder/tenders/[id]/submit/page.tsx` — target bidder submission route
- `frontend/app/bidder/submissions/[id]/page.tsx` — target bidder submission status route
- `frontend/app/tenders/[id]/submissions/page.tsx` — target admin submissions review route
- `frontend/app/tenders/[id]/verdicts/page.tsx`
- `frontend/components/verdicts/VerdictCell.tsx`
- `frontend/components/verdicts/VerdictSidePanel.tsx`
- `frontend/components/verdicts/VerdictMatrix.tsx`
- `frontend/app/tenders/[id]/audit/page.tsx`

**Infra**
- `infra/docker-compose.yml`
- `infra/.env.example`
- `frontend/Dockerfile`

---

## Task 1: Backend scaffold

**Files:** `backend/pyproject.toml`, `backend/Dockerfile`, `backend/app/__init__.py`, `backend/app/main.py`, `backend/app/api/__init__.py`

- [ ] **Step 1: Create backend/pyproject.toml**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "tendersaarthi-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.29.0",
    "python-multipart>=0.0.9",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "httpx>=0.27.0",
]

[tool.hatch.build.targets.wheel]
packages = ["app"]
```

- [ ] **Step 2: Create backend/app/\_\_init\_\_.py** (empty file)

```python
```

- [ ] **Step 3: Create backend/app/api/\_\_init\_\_.py** (empty file)

```python
```

- [ ] **Step 4: Create backend/app/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, tenders, criteria, bidders, verdicts

app = FastAPI(title="TenderSaarthi API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(tenders.router, prefix="/api/v1")
app.include_router(criteria.router, prefix="/api/v1")
app.include_router(bidders.router, prefix="/api/v1")
app.include_router(verdicts.router, prefix="/api/v1")
```

- [ ] **Step 5: Create backend/Dockerfile**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install -e .
COPY app/ app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 6: Verify backend starts**

```bash
cd backend && pip install -e ".[dev]" && uvicorn app.main:app --port 8000
```
Expected: `Application startup complete.` (will fail on missing routers — that's fine, continue to Task 2)

---

## Task 2: Mock JSON data files

**Files:** all 6 JSON files in `backend/app/mock_responses/`

- [ ] **Step 1: Create backend/app/mock_responses/tenders_list.json**

```json
{
  "data": [
    {
      "id": "t-001",
      "title": "CRPF Construction Tender 2024",
      "procuring_department": "CRPF — HQ New Delhi",
      "status": "AWAITING_REVIEW",
      "uploaded_at": "2026-05-05T09:00:00Z",
      "criteria_count": 9,
      "bidder_count": 3,
      "verdict_count": 0
    },
    {
      "id": "t-002",
      "title": "CRPF IT Infrastructure 2024",
      "procuring_department": "CRPF — Signals Wing",
      "status": "EVALUATED",
      "uploaded_at": "2026-05-02T11:00:00Z",
      "criteria_count": 7,
      "bidder_count": 5,
      "verdict_count": 35
    },
    {
      "id": "t-003",
      "title": "CRPF Vehicle Maintenance 2023",
      "procuring_department": "CRPF — Transport Wing",
      "status": "SIGNED",
      "uploaded_at": "2026-04-14T08:00:00Z",
      "criteria_count": 6,
      "bidder_count": 4,
      "verdict_count": 24
    }
  ],
  "meta": {
    "total": 3,
    "stats": {
      "active": 3,
      "awaiting_review": 1,
      "evaluated": 1,
      "signed": 1,
      "verdicts_total": 59
    }
  }
}
```

- [ ] **Step 2: Create backend/app/mock_responses/tender_detail.json**

```json
{
  "data": {
    "id": "t-001",
    "title": "CRPF Construction Tender 2024",
    "procuring_department": "CRPF — HQ New Delhi",
    "status": "AWAITING_REVIEW",
    "uploaded_at": "2026-05-05T09:00:00Z",
    "source_pdf_uri": "/mock/tenders/t-001.pdf",
    "criteria_count": 9,
    "bidder_count": 3,
    "verdict_count": 0
  },
  "meta": { "request_id": "mock-001", "timestamp": "2026-05-07T00:00:00Z" }
}
```

- [ ] **Step 3: Create backend/app/mock_responses/criteria_list.json**

```json
{
  "data": [
    {
      "id": "c-001", "tender_id": "t-001", "category": "FINANCIAL",
      "description": "The bidder shall have a minimum average annual turnover of ₹5 Crore during the last three financial years (2021-22, 2022-23, 2023-24).",
      "is_mandatory": true, "threshold": {"type": "min_amount_inr", "value": 50000000},
      "source_page": 12, "approved_at": null
    },
    {
      "id": "c-002", "tender_id": "t-001", "category": "TECHNICAL",
      "description": "The bidder must have successfully completed at least 3 similar construction works of value not less than ₹2 Crore each during the last 5 years.",
      "is_mandatory": true, "threshold": {"type": "min_count", "value": 3},
      "source_page": 13, "approved_at": null
    },
    {
      "id": "c-003", "tender_id": "t-001", "category": "CERTIFICATION",
      "description": "The bidder shall possess a valid ISO 9001:2015 Quality Management System certification from an accredited certification body.",
      "is_mandatory": true, "threshold": {"type": "must_exist", "value": true},
      "source_page": 14, "approved_at": null
    },
    {
      "id": "c-004", "tender_id": "t-001", "category": "DOCUMENT",
      "description": "Valid GST Registration Certificate with active GST number must be submitted.",
      "is_mandatory": true, "threshold": {"type": "must_exist", "value": true},
      "source_page": 15, "approved_at": null
    },
    {
      "id": "c-005", "tender_id": "t-001", "category": "DOCUMENT",
      "description": "Valid PAN Card issued by the Income Tax Department.",
      "is_mandatory": true, "threshold": {"type": "must_exist", "value": true},
      "source_page": 15, "approved_at": null
    },
    {
      "id": "c-006", "tender_id": "t-001", "category": "COMPLIANCE",
      "description": "The bidder shall not be blacklisted or debarred by any Central/State Government department or PSU.",
      "is_mandatory": true, "threshold": {"type": "must_exist", "value": true},
      "source_page": 16, "approved_at": null
    },
    {
      "id": "c-007", "tender_id": "t-001", "category": "TECHNICAL",
      "description": "The bidder must have at least one project of similar nature worth ₹3 Crore or more as a single work order.",
      "is_mandatory": true, "threshold": {"type": "min_amount_inr", "value": 30000000},
      "source_page": 13, "approved_at": null
    },
    {
      "id": "c-008", "tender_id": "t-001", "category": "FINANCIAL",
      "description": "The bidder shall have a positive Net Worth in the latest audited balance sheet.",
      "is_mandatory": true, "threshold": {"type": "must_exist", "value": true},
      "source_page": 12, "approved_at": null
    },
    {
      "id": "c-009", "tender_id": "t-001", "category": "CERTIFICATION",
      "description": "The bidder may possess OHSAS 18001 / ISO 45001 Occupational Health & Safety certification (preferred but not mandatory).",
      "is_mandatory": false, "threshold": {"type": "must_exist", "value": true},
      "source_page": 14, "approved_at": null
    }
  ],
  "meta": {"total": 9, "tender_id": "t-001", "status": "AWAITING_REVIEW"}
}
```

- [ ] **Step 4: Create backend/app/mock_responses/bidders_list.json**

```json
{
  "data": [
    {
      "id": "b-001", "tender_id": "t-001",
      "legal_name": "Sharma Constructions Pvt. Ltd.",
      "uploaded_at": "2026-05-06T10:00:00Z",
      "documents": [
        {"id": "d-001", "filename": "Annual_Report_2023-24.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]},
        {"id": "d-002", "filename": "ISO_9001_Certificate.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]},
        {"id": "d-003", "filename": "GST_Registration.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]},
        {"id": "d-004", "filename": "Project_Completion_Certs.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]}
      ]
    },
    {
      "id": "b-002", "tender_id": "t-001",
      "legal_name": "Rajesh Builders & Co.",
      "uploaded_at": "2026-05-06T11:30:00Z",
      "documents": [
        {"id": "d-005", "filename": "Turnover_Certificate.jpg", "document_type": "IMAGE", "detected_languages": ["hi"]},
        {"id": "d-006", "filename": "GST_Certificate_scan.pdf", "document_type": "SCANNED_PDF", "detected_languages": ["hi"]},
        {"id": "d-007", "filename": "ISO_Certificate_photo.jpg", "document_type": "IMAGE", "detected_languages": ["en"]}
      ]
    },
    {
      "id": "b-003", "tender_id": "t-001",
      "legal_name": "Verma & Sons Infrastructure",
      "uploaded_at": "2026-05-06T14:00:00Z",
      "documents": [
        {"id": "d-008", "filename": "Balance_Sheet_FY2024.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]},
        {"id": "d-009", "filename": "GST_Certificate_Kannada.pdf", "document_type": "SCANNED_PDF", "detected_languages": ["kn"]},
        {"id": "d-010", "filename": "Project_Certificates.pdf", "document_type": "TYPED_PDF", "detected_languages": ["en"]}
      ]
    }
  ],
  "meta": {"total": 3, "tender_id": "t-001"}
}
```

- [ ] **Step 5: Create backend/app/mock_responses/verdict_matrix.json**

```json
{
  "data": {
    "tender_id": "t-001",
    "criteria": ["c-001","c-002","c-003","c-004","c-005","c-006","c-007","c-008","c-009"],
    "verdicts": [
      {
        "bidder_id": "b-001", "bidder_name": "Sharma Constructions Pvt. Ltd.",
        "results": [
          {"criterion_id":"c-001","verdict":"ELIGIBLE","reason":"Turnover ₹8.3 Cr exceeds ₹5 Cr threshold","ocr_confidence":0.98,"extraction_confidence":0.96,"span_validated":true,"evidence_ref":{"value":"₹8.3 Crore","page":4,"bbox":[120,450,380,470],"raw_span":"Total Revenue from Operations: ₹8.3 crore","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-002","verdict":"ELIGIBLE","reason":"4 similar projects found, meets minimum of 3","ocr_confidence":0.97,"extraction_confidence":0.94,"span_validated":true,"evidence_ref":{"value":"4 projects","page":7,"bbox":[100,200,400,280],"raw_span":"List of similar works completed: 4 projects worth ₹2Cr+","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-003","verdict":"ELIGIBLE","reason":"ISO 9001:2015 certificate found, valid until 2026-12-31","ocr_confidence":0.99,"extraction_confidence":0.97,"span_validated":true,"evidence_ref":{"value":"ISO 9001:2015","page":1,"bbox":[50,100,350,200],"raw_span":"ISO 9001:2015 Certified — valid until 31-Dec-2026","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-004","verdict":"ELIGIBLE","reason":"GST certificate found and active","ocr_confidence":0.98,"extraction_confidence":0.96,"span_validated":true,"evidence_ref":{"value":"29AABCS1234K1Z5","page":1,"bbox":[80,150,300,180],"raw_span":"GSTIN: 29AABCS1234K1Z5 — Status: Active","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-005","verdict":"ELIGIBLE","reason":"PAN card found","ocr_confidence":0.99,"extraction_confidence":0.98,"span_validated":true,"evidence_ref":{"value":"AABCS1234K","page":1,"bbox":[80,200,250,220],"raw_span":"Permanent Account Number: AABCS1234K","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-006","verdict":"ELIGIBLE","reason":"Self-declaration of non-blacklisting submitted","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"self-declaration","page":2,"bbox":[60,100,450,300],"raw_span":"We hereby declare that our firm is not blacklisted...","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-007","verdict":"ELIGIBLE","reason":"Single project of ₹4.5 Cr found, exceeds ₹3 Cr threshold","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"₹4.5 Crore","page":8,"bbox":[100,300,380,330],"raw_span":"Work order value: ₹4.5 Crore — CRPF Barracks 2022","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-008","verdict":"ELIGIBLE","reason":"Positive net worth of ₹3.2 Cr confirmed","ocr_confidence":0.98,"extraction_confidence":0.96,"span_validated":true,"evidence_ref":{"value":"₹3.2 Crore","page":5,"bbox":[120,500,380,520],"raw_span":"Net Worth as on 31-Mar-2024: ₹3.2 Crore","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-009","verdict":"ELIGIBLE","reason":"OHSAS 18001 certification found","ocr_confidence":0.98,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"OHSAS 18001","page":2,"bbox":[50,150,350,200],"raw_span":"OHSAS 18001:2007 Certified — valid until 2026-09-30","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"}
        ]
      },
      {
        "bidder_id": "b-002", "bidder_name": "Rajesh Builders & Co.",
        "results": [
          {"criterion_id":"c-001","verdict":"NOT_ELIGIBLE","reason":"Turnover ₹2.1 Cr is below ₹5 Cr threshold","ocr_confidence":0.82,"extraction_confidence":0.87,"span_validated":true,"evidence_ref":{"value":"₹2.1 Crore","page":4,"bbox":[110,430,370,455],"raw_span":"कुल राजस्व: ₹2.1 करोड़","translated_span":"Total Revenue: ₹2.1 Crore"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-002","verdict":"ELIGIBLE","reason":"3 similar projects found","ocr_confidence":0.91,"extraction_confidence":0.89,"span_validated":true,"evidence_ref":{"value":"3 projects","page":6,"bbox":[90,180,420,260],"raw_span":"समान कार्यों की सूची: 3 परियोजनाएं","translated_span":"List of similar works: 3 projects"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-003","verdict":"NEEDS_MANUAL_REVIEW","reason":"OCR confidence below floor on photograph; value may be present but unverifiable","ocr_confidence":0.61,"extraction_confidence":0.72,"span_validated":false,"evidence_ref":{"value":"ISO 9001 (unconfirmed)","page":1,"bbox":[50,80,400,220],"raw_span":"[low confidence OCR output]","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-004","verdict":"ELIGIBLE","reason":"GST certificate found after translation","ocr_confidence":0.84,"extraction_confidence":0.88,"span_validated":true,"evidence_ref":{"value":"27AABCR5678M1Z3","page":1,"bbox":[70,140,310,165],"raw_span":"जीएसटीआईएन: 27AABCR5678M1Z3","translated_span":"GSTIN: 27AABCR5678M1Z3"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-005","verdict":"ELIGIBLE","reason":"PAN card found","ocr_confidence":0.89,"extraction_confidence":0.92,"span_validated":true,"evidence_ref":{"value":"AABCR5678M","page":1,"bbox":[70,190,240,210],"raw_span":"पैन: AABCR5678M","translated_span":"PAN: AABCR5678M"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-006","verdict":"ELIGIBLE","reason":"Non-blacklisting declaration found","ocr_confidence":0.86,"extraction_confidence":0.90,"span_validated":true,"evidence_ref":{"value":"self-declaration","page":3,"bbox":[55,90,460,310],"raw_span":"हम घोषणा करते हैं कि हमारी फर्म...","translated_span":"We declare that our firm is not blacklisted..."},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-007","verdict":"NOT_ELIGIBLE","reason":"Largest single project is ₹1.8 Cr, below ₹3 Cr threshold","ocr_confidence":0.85,"extraction_confidence":0.88,"span_validated":true,"evidence_ref":{"value":"₹1.8 Crore","page":7,"bbox":[95,290,375,315],"raw_span":"सबसे बड़ा एकल कार्य: ₹1.8 करोड़","translated_span":"Largest single work: ₹1.8 Crore"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-008","verdict":"NEEDS_MANUAL_REVIEW","reason":"Translation confidence below floor; net worth figure could not be reliably extracted","ocr_confidence":0.79,"extraction_confidence":0.68,"span_validated":false,"evidence_ref":{"value":"unknown","page":5,"bbox":[110,490,370,515],"raw_span":"शुद्ध संपत्ति: [unclear]","translated_span":"Net Worth: [unclear]"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-009","verdict":"NOT_ELIGIBLE","reason":"OHSAS/ISO 45001 certificate not found in submission","ocr_confidence":null,"extraction_confidence":null,"span_validated":false,"evidence_ref":null,"model_version":"claude-sonnet-4-6","replay_id":"r-001"}
        ]
      },
      {
        "bidder_id": "b-003", "bidder_name": "Verma & Sons Infrastructure",
        "results": [
          {"criterion_id":"c-001","verdict":"ELIGIBLE","reason":"Turnover ₹6.2 Cr exceeds ₹5 Cr threshold","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"₹6.2 Crore","page":3,"bbox":[115,440,375,462],"raw_span":"Total Revenue from Operations: ₹6.2 crore","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-002","verdict":"NOT_ELIGIBLE","reason":"Only 2 similar projects found; minimum required is 3","ocr_confidence":0.96,"extraction_confidence":0.94,"span_validated":true,"evidence_ref":{"value":"2 projects","page":6,"bbox":[90,200,400,270],"raw_span":"Similar works completed: 2 projects","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-003","verdict":"ELIGIBLE","reason":"ISO 9001:2015 valid","ocr_confidence":0.98,"extraction_confidence":0.96,"span_validated":true,"evidence_ref":{"value":"ISO 9001:2015","page":1,"bbox":[50,100,350,200],"raw_span":"ISO 9001:2015 — Valid until 2027-03-15","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-004","verdict":"NEEDS_MANUAL_REVIEW","reason":"GST certificate in Kannada; OCR confidence below floor after translation","ocr_confidence":0.71,"extraction_confidence":0.76,"span_validated":false,"evidence_ref":{"value":"GST cert (unconfirmed)","page":1,"bbox":[60,130,320,180],"raw_span":"ಜಿಎಸ್‌ಟಿ ನೋಂದಣಿ: [low confidence]","translated_span":"GST Registration: [low confidence]"},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-005","verdict":"ELIGIBLE","reason":"PAN card found","ocr_confidence":0.98,"extraction_confidence":0.97,"span_validated":true,"evidence_ref":{"value":"AABCV9012N","page":1,"bbox":[80,200,250,218],"raw_span":"PAN: AABCV9012N","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-006","verdict":"ELIGIBLE","reason":"Self-declaration submitted","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"self-declaration","page":2,"bbox":[60,100,450,300],"raw_span":"We hereby certify that our firm is not debarred...","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-007","verdict":"ELIGIBLE","reason":"Single project of ₹3.8 Cr found","ocr_confidence":0.96,"extraction_confidence":0.94,"span_validated":true,"evidence_ref":{"value":"₹3.8 Crore","page":7,"bbox":[100,310,380,335],"raw_span":"Single work order: CRPF Road Construction — ₹3.8 Crore","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-008","verdict":"ELIGIBLE","reason":"Net worth ₹2.1 Cr confirmed","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"₹2.1 Crore","page":4,"bbox":[120,510,380,530],"raw_span":"Net Worth as on 31-Mar-2024: ₹2.1 Crore","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"},
          {"criterion_id":"c-009","verdict":"ELIGIBLE","reason":"ISO 45001 found","ocr_confidence":0.97,"extraction_confidence":0.95,"span_validated":true,"evidence_ref":{"value":"ISO 45001","page":2,"bbox":[50,160,340,205],"raw_span":"ISO 45001:2018 — valid until 2025-11-30","translated_span":null},"model_version":"claude-sonnet-4-6","replay_id":"r-001"}
        ]
      }
    ]
  },
  "meta": {"tender_id": "t-001", "total_verdicts": 27, "request_id": "mock-001"}
}
```

- [ ] **Step 6: Create backend/app/mock_responses/audit_report.json**

```json
{
  "data": {
    "id": "ar-001",
    "tender_id": "t-001",
    "tender_title": "CRPF Construction Tender 2024",
    "procuring_department": "CRPF — HQ New Delhi",
    "generated_at": "2026-05-07T12:00:00Z",
    "generated_by": "admin",
    "bidder_count": 3,
    "criteria_count": 9,
    "verdict_count": 27,
    "eligible_count": 20,
    "not_eligible_count": 5,
    "needs_review_count": 2,
    "content_hash": "a3f8c2d1e4b79f2a1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    "replay_id": "r-001",
    "model_versions": ["claude-sonnet-4-6"],
    "pdf_uri": "/api/v1/tenders/t-001/report.pdf"
  },
  "meta": {"request_id": "mock-001", "timestamp": "2026-05-07T12:00:00Z"}
}
```

---

## Task 3: Backend API routes

**Files:** `backend/app/api/health.py`, `tenders.py`, `criteria.py`, `bidders.py`, `verdicts.py`

- [ ] **Step 1: Create backend/app/api/health.py**

```python
import json
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "tendersaarthi-backend"}

@router.get("/version")
async def version():
    return {"version": "0.1.0", "phase": "mock"}
```

- [ ] **Step 2: Create backend/app/api/tenders.py**

```python
import json
import uuid
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()
MOCK = Path("app/mock_responses")

@router.get("/tenders")
async def list_tenders():
    return json.loads((MOCK / "tenders_list.json").read_text())

@router.post("/tenders")
async def create_tender():
    return {
        "data": {
            "id": f"t-{uuid.uuid4().hex[:6]}",
            "title": "New Tender",
            "status": "EXTRACTING",
            "uploaded_at": "2026-05-07T12:00:00Z",
            "criteria_count": 0,
            "bidder_count": 0,
            "verdict_count": 0,
        },
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }

@router.get("/tenders/{tender_id}")
async def get_tender(tender_id: str):
    return json.loads((MOCK / "tender_detail.json").read_text())

@router.post("/tenders/{tender_id}/evaluate")
async def evaluate_tender(tender_id: str):
    return {
        "data": {"job_id": f"job-{uuid.uuid4().hex[:8]}", "status": "EVALUATING"},
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }

@router.get("/tenders/{tender_id}/report")
async def get_report(tender_id: str):
    return json.loads((MOCK / "audit_report.json").read_text())
```

- [ ] **Step 3: Create backend/app/api/criteria.py**

```python
import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

router = APIRouter()
MOCK = Path("app/mock_responses")

class CriterionUpdate(BaseModel):
    description: str | None = None
    is_mandatory: bool | None = None
    threshold: Any = None

@router.get("/tenders/{tender_id}/criteria")
async def list_criteria(tender_id: str):
    return json.loads((MOCK / "criteria_list.json").read_text())

@router.patch("/tenders/{tender_id}/criteria/{criterion_id}")
async def update_criterion(tender_id: str, criterion_id: str, body: CriterionUpdate):
    return {
        "data": {"id": criterion_id, "tender_id": tender_id, **body.model_dump(exclude_none=True)},
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }

@router.post("/tenders/{tender_id}/criteria/approve")
async def approve_criteria(tender_id: str):
    return {
        "data": {"tender_id": tender_id, "status": "CRITERIA_APPROVED"},
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }
```

- [ ] **Step 4: Create backend/app/api/bidders.py**

```python
import json
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel

router = APIRouter()
MOCK = Path("app/mock_responses")

class BidderCreate(BaseModel):
    legal_name: str

@router.get("/tenders/{tender_id}/bidders")
async def list_bidders(tender_id: str):
    return json.loads((MOCK / "bidders_list.json").read_text())

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
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
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
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }
```

- [ ] **Step 5: Create backend/app/api/verdicts.py**

```python
import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
MOCK = Path("app/mock_responses")

class OverrideBody(BaseModel):
    reason: str

@router.get("/tenders/{tender_id}/verdicts")
async def get_verdicts(tender_id: str):
    return json.loads((MOCK / "verdict_matrix.json").read_text())

@router.post("/verdicts/{verdict_id}/approve")
async def approve_verdict(verdict_id: str):
    return {
        "data": {"id": verdict_id, "reviewer_action": "APPROVED"},
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }

@router.post("/verdicts/{verdict_id}/override")
async def override_verdict(verdict_id: str, body: OverrideBody):
    return {
        "data": {"id": verdict_id, "reviewer_action": "OVERRIDDEN", "reviewer_reason": body.reason},
        "meta": {"request_id": "mock", "timestamp": "2026-05-07T12:00:00Z"},
    }
```

- [ ] **Step 6: Verify backend boots cleanly**

```bash
cd backend && uvicorn app.main:app --port 8000 --reload
```
Expected: `Application startup complete.` with no import errors.

- [ ] **Step 7: Hit smoke endpoints**

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/tenders
```
Expected: JSON responses with `"status": "ok"` and `"data": [...]`.

---

## Task 4: Backend tests + first commit

**Files:** `backend/tests/__init__.py`, `backend/tests/test_routes.py`

- [ ] **Step 1: Create backend/tests/\_\_init\_\_.py** (empty)

- [ ] **Step 2: Create backend/tests/test_routes.py**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.anyio
async def test_list_tenders():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tenders")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 3
    assert data[0]["id"] == "t-001"

@pytest.mark.anyio
async def test_list_criteria():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tenders/t-001/criteria")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 9

@pytest.mark.anyio
async def test_approve_criteria():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/tenders/t-001/criteria/approve")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "CRITERIA_APPROVED"

@pytest.mark.anyio
async def test_get_verdicts():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/tenders/t-001/verdicts")
    assert response.status_code == 200
    assert len(response.json()["data"]["verdicts"]) == 3
```

- [ ] **Step 3: Add anyio to dev deps in pyproject.toml**

Add to `[project.optional-dependencies] dev`:
```
"anyio[trio]>=4.0.0",
"pytest-anyio>=0.0.0",
```

Actually use this exact dev section:
```toml
[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "httpx>=0.27.0",
    "anyio[trio]>=4.0.0",
    "pytest-anyio>=0.0.0",
]

[tool.pytest.ini_options]
anyio_mode = "auto"
```

- [ ] **Step 4: Run tests**

```bash
cd backend && pip install -e ".[dev]" && pytest tests/ -v
```
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/ && git commit -m "feat: mock FastAPI backend with 14 endpoints and 6 JSON fixtures"
```

---

## Task 5: Frontend scaffold

- [ ] **Step 1: Scaffold Next.js 14 app**

```bash
cd /Users/pushpamkumar/work/TenderSaarthi
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-git
```
When prompted, accept all defaults.

- [ ] **Step 2: Init shadcn/ui**

```bash
cd frontend
npx shadcn@latest init
```
When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 3: Install shadcn components**

```bash
npx shadcn@latest add button badge dialog table input label textarea progress separator
```

- [ ] **Step 4: Update frontend/tailwind.config.ts** to add Government Blue tokens

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1e40af",
          light: "#3b82f6",
          dark: "#1e3a8a",
          muted: "#bfdbfe",
          bg: "#eff6ff",
          border: "#bfdbfe",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 5: Set NEXT_PUBLIC_API_URL in frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 6: Verify scaffold runs**

```bash
cd frontend && npm run dev
```
Expected: Next.js dev server on port 3000, default page loads.

---

## Task 6: TypeScript types + API client

**Files:** `frontend/lib/types.ts`, `frontend/lib/api.ts`

- [ ] **Step 1: Create frontend/lib/types.ts**

```typescript
export type TenderStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "AWAITING_REVIEW"
  | "CRITERIA_APPROVED"
  | "EVALUATING"
  | "EVALUATED"
  | "SIGNED";

export type CriterionCategory =
  | "FINANCIAL"
  | "TECHNICAL"
  | "COMPLIANCE"
  | "DOCUMENT"
  | "CERTIFICATION";

export type DocumentType = "TYPED_PDF" | "SCANNED_PDF" | "IMAGE" | "DOCX";

export type VerdictValue = "ELIGIBLE" | "NOT_ELIGIBLE" | "NEEDS_MANUAL_REVIEW";

export interface TenderSummary {
  id: string;
  title: string;
  procuring_department: string;
  status: TenderStatus;
  uploaded_at: string;
  criteria_count: number;
  bidder_count: number;
  verdict_count: number;
}

export interface TenderDetail extends TenderSummary {
  source_pdf_uri: string;
}

export interface Criterion {
  id: string;
  tender_id: string;
  category: CriterionCategory;
  description: string;
  is_mandatory: boolean;
  threshold: { type: string; value: number | boolean } | null;
  source_page: number | null;
  approved_at: string | null;
}

export interface BidderDocument {
  id: string;
  filename: string;
  document_type: DocumentType;
  detected_languages: string[];
}

export interface Bidder {
  id: string;
  tender_id: string;
  legal_name: string;
  uploaded_at: string;
  documents: BidderDocument[];
}

export interface EvidenceRef {
  value: string;
  page: number;
  bbox: [number, number, number, number];
  raw_span: string;
  translated_span: string | null;
}

export interface VerdictResult {
  criterion_id: string;
  verdict: VerdictValue;
  reason: string;
  ocr_confidence: number | null;
  extraction_confidence: number | null;
  span_validated: boolean;
  evidence_ref: EvidenceRef | null;
  model_version: string;
  replay_id: string;
  reviewer_action?: "APPROVED" | "OVERRIDDEN" | null;
  reviewer_reason?: string | null;
}

export interface BidderVerdicts {
  bidder_id: string;
  bidder_name: string;
  results: VerdictResult[];
}

export interface VerdictMatrix {
  tender_id: string;
  criteria: string[];
  verdicts: BidderVerdicts[];
}

export interface TenderStats {
  active: number;
  awaiting_review: number;
  evaluated: number;
  signed: number;
  verdicts_total: number;
}

export interface AuditReport {
  id: string;
  tender_id: string;
  tender_title: string;
  procuring_department: string;
  generated_at: string;
  generated_by: string;
  bidder_count: number;
  criteria_count: number;
  verdict_count: number;
  eligible_count: number;
  not_eligible_count: number;
  needs_review_count: number;
  content_hash: string;
  replay_id: string;
  model_versions: string[];
  pdf_uri: string;
}
```

- [ ] **Step 2: Create frontend/lib/api.ts**

```typescript
import type {
  TenderSummary, TenderDetail, Criterion, Bidder,
  VerdictMatrix, AuditReport, TenderStats,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export async function fetchTenders(): Promise<{ tenders: TenderSummary[]; stats: TenderStats }> {
  const res = await fetch(`${BASE}/api/v1/tenders`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/v1/tenders → ${res.status}`);
  const json = await res.json();
  return { tenders: json.data, stats: json.meta.stats };
}

export const fetchTender = (id: string) => get<TenderDetail>(`/api/v1/tenders/${id}`);
export const fetchCriteria = (id: string) => get<Criterion[]>(`/api/v1/tenders/${id}/criteria`).then(d => Array.isArray(d) ? d : (d as any));
export const approveCriteria = (id: string) => post<{ status: string }>(`/api/v1/tenders/${id}/criteria/approve`);
export const updateCriterion = (tenderId: string, criterionId: string, body: Partial<Criterion>) =>
  patch<Criterion>(`/api/v1/tenders/${tenderId}/criteria/${criterionId}`, body);
export const fetchBidders = (id: string) => get<Bidder[]>(`/api/v1/tenders/${id}/bidders`).then(d => Array.isArray(d) ? d : (d as any));
export const createBidder = (tenderId: string, legalName: string) =>
  post<Bidder>(`/api/v1/tenders/${tenderId}/bidders`, { legal_name: legalName });
export const fetchVerdicts = (id: string) => get<VerdictMatrix>(`/api/v1/tenders/${id}/verdicts`);
export const approveVerdict = (id: string) => post(`/api/v1/verdicts/${id}/approve`);
export const overrideVerdict = (id: string, reason: string) =>
  post(`/api/v1/verdicts/${id}/override`, { reason });
export const fetchAuditReport = (id: string) => get<AuditReport>(`/api/v1/tenders/${id}/report`);
export const triggerEvaluation = (id: string) => post(`/api/v1/tenders/${id}/evaluate`);

// fetchCriteria and fetchBidders return wrapped data; fix with a list helper
export async function fetchCriteriaList(tenderId: string): Promise<Criterion[]> {
  const res = await fetch(`${BASE}/api/v1/tenders/${tenderId}/criteria`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET criteria → ${res.status}`);
  return (await res.json()).data as Criterion[];
}

export async function fetchBiddersList(tenderId: string): Promise<Bidder[]> {
  const res = await fetch(`${BASE}/api/v1/tenders/${tenderId}/bidders`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET bidders → ${res.status}`);
  return (await res.json()).data as Bidder[];
}
```

---

## Task 7: Layout components + root layout

**Files:** `frontend/components/layout/TopNav.tsx`, `frontend/components/layout/TenderTabs.tsx`, `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/app/page.tsx`

- [ ] **Step 1: Create frontend/components/layout/TopNav.tsx**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  return (
    <nav className="bg-brand text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50 shadow-md">
      <Link href="/tenders" className="font-bold text-base tracking-tight hover:text-brand-muted transition-colors">
        🏛 TenderSaarthi
      </Link>
      <div className="flex-1" />
      <Link href="/tenders" className="text-brand-muted hover:text-white text-sm transition-colors">
        Tenders
      </Link>
      <span className="text-brand-muted hover:text-white text-sm cursor-pointer transition-colors">
        Reports
      </span>
      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-white text-xs font-bold">
        A
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create frontend/components/layout/TenderTabs.tsx**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TenderStatus } from "@/lib/types";

const TABS = [
  { label: "Overview", path: "" },
  { label: "Review Criteria", path: "/review-criteria" },
  { label: "Bidders", path: "/bidders" },
  { label: "Evaluate", path: "/verdicts" },
  { label: "Report", path: "/audit" },
] as const;

function isTabCompleted(tabPath: string, status: TenderStatus): boolean {
  const order = ["", "/review-criteria", "/bidders", "/verdicts", "/audit"];
  const completedUpTo: Record<TenderStatus, number> = {
    UPLOADED: -1, EXTRACTING: -1, AWAITING_REVIEW: 0,
    CRITERIA_APPROVED: 1, EVALUATING: 2, EVALUATED: 3, SIGNED: 4,
  };
  return order.indexOf(tabPath) <= completedUpTo[status];
}

function isTabLocked(tabPath: string, status: TenderStatus): boolean {
  if (tabPath === "/bidders" && !["CRITERIA_APPROVED","EVALUATING","EVALUATED","SIGNED"].includes(status)) return true;
  if (tabPath === "/verdicts" && !["EVALUATING","EVALUATED","SIGNED"].includes(status)) return true;
  if (tabPath === "/audit" && !["EVALUATED","SIGNED"].includes(status)) return true;
  return false;
}

interface TenderTabsProps {
  tenderId: string;
  status: TenderStatus;
}

export function TenderTabs({ tenderId, status }: TenderTabsProps) {
  const pathname = usePathname();
  const base = `/tenders/${tenderId}`;

  return (
    <div className="bg-brand-bg border-b border-brand-border flex px-6">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}`;
        const isActive = pathname === href || (tab.path === "" && pathname === base);
        const completed = isTabCompleted(tab.path, status);
        const locked = isTabLocked(tab.path, status);

        if (locked) {
          return (
            <span key={tab.path} className="px-4 py-3 text-xs text-gray-400 border-r border-brand-border cursor-not-allowed select-none">
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.path}
            href={href}
            className={`px-4 py-3 text-xs border-r border-brand-border transition-colors ${
              isActive
                ? "text-brand font-bold border-b-2 border-brand bg-white -mb-px"
                : completed
                ? "text-green-600 hover:text-brand"
                : "text-gray-500 hover:text-brand"
            }`}
          >
            {completed && !isActive ? `✓ ${tab.label}` : tab.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Replace frontend/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TenderSaarthi",
  description: "AI-powered tender eligibility evaluation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Replace frontend/app/page.tsx** (redirect)

```tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/tenders");
}
```

---

## Task 8: Tenders list page

**Files:** `frontend/components/tenders/TenderStatusBadge.tsx`, `StatsRow.tsx`, `TenderCard.tsx`, `frontend/app/tenders/page.tsx`

- [ ] **Step 1: Create frontend/components/tenders/TenderStatusBadge.tsx**

```tsx
import type { TenderStatus } from "@/lib/types";

const CONFIG: Record<TenderStatus, { label: string; className: string }> = {
  UPLOADED:          { label: "Uploaded",          className: "bg-gray-100 text-gray-600" },
  EXTRACTING:        { label: "Extracting…",        className: "bg-blue-100 text-blue-700 animate-pulse" },
  AWAITING_REVIEW:   { label: "Awaiting Review",   className: "bg-amber-100 text-amber-800" },
  CRITERIA_APPROVED: { label: "Criteria Approved", className: "bg-blue-100 text-blue-800" },
  EVALUATING:        { label: "Evaluating…",        className: "bg-purple-100 text-purple-800 animate-pulse" },
  EVALUATED:         { label: "Evaluated",          className: "bg-green-100 text-green-800" },
  SIGNED:            { label: "Signed",             className: "bg-indigo-100 text-indigo-800" },
};

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.UPLOADED;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create frontend/components/tenders/StatsRow.tsx**

```tsx
import type { TenderStats } from "@/lib/types";

interface StatCardProps { label: string; value: number; color: string }

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 text-center border-t-4 ${color} shadow-sm`}>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: TenderStats }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard label="Active Tenders"     value={stats.active}           color="border-brand" />
      <StatCard label="Awaiting Review"    value={stats.awaiting_review}  color="border-amber-400" />
      <StatCard label="Verdicts Generated" value={stats.verdicts_total}   color="border-green-500" />
      <StatCard label="Signed Reports"     value={stats.signed}           color="border-indigo-500" />
    </div>
  );
}
```

- [ ] **Step 3: Create frontend/components/tenders/TenderCard.tsx**

```tsx
import Link from "next/link";
import type { TenderSummary } from "@/lib/types";
import { TenderStatusBadge } from "./TenderStatusBadge";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function TenderCard({ tender }: { tender: TenderSummary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{tender.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {tender.procuring_department} · Uploaded {timeAgo(tender.uploaded_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex gap-4 text-xs text-gray-400">
          <span>{tender.criteria_count} criteria</span>
          <span>{tender.bidder_count} bidders</span>
        </div>
        <TenderStatusBadge status={tender.status} />
        <Link
          href={`/tenders/${tender.id}`}
          className="text-xs text-brand font-semibold hover:underline"
        >
          Open →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create frontend/app/tenders/page.tsx**

```tsx
import Link from "next/link";
import { fetchTenders } from "@/lib/api";
import { StatsRow } from "@/components/tenders/StatsRow";
import { TenderCard } from "@/components/tenders/TenderCard";

export default async function TendersPage() {
  const { tenders, stats } = await fetchTenders();

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">All Tenders</h1>
          <p className="text-sm text-gray-500">{tenders.length} tenders</p>
        </div>
        <Link
          href="/tenders/new"
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-brand-dark transition-colors"
        >
          + New Tender
        </Link>
      </div>

      <StatsRow stats={stats} />

      <div className="flex flex-col gap-3">
        {tenders.map((tender) => (
          <TenderCard key={tender.id} tender={tender} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify tenders list renders**

Open [http://localhost:3000/tenders](http://localhost:3000/tenders). Should show 4 stat cards + 3 tender cards.

---

## Task 9: New tender upload page

**File:** `frontend/app/tenders/new/page.tsx`

- [ ] **Step 1: Create frontend/app/tenders/new/page.tsx**

```tsx
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTenderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("procuring_department", dept);
      form.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/tenders`,
        { method: "POST", body: form }
      );
      const json = await res.json();
      router.push(`/tenders/${json.data?.id ?? "t-001"}?extracting=1`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <Link href="/tenders" className="text-sm text-brand hover:underline mb-6 inline-block">
        ← Back to Tenders
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Upload New Tender</h1>
      <p className="text-sm text-gray-500 mb-8">Criteria will be automatically extracted after upload.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tender Name *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. CRPF Construction Tender 2024"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Procuring Department</label>
          <input
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            placeholder="e.g. CRPF — HQ New Delhi"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tender PDF *</label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-brand bg-brand-bg" : "border-blue-300 hover:border-brand"
            }`}
          >
            {file ? (
              <p className="text-sm font-medium text-gray-700">📄 {file.name}</p>
            ) : (
              <>
                <p className="text-2xl mb-2">📄</p>
                <p className="text-sm font-medium text-gray-700">Drop PDF here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF only · Max 50 MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button
          type="submit"
          disabled={loading || !title || !file}
          className="bg-brand text-white font-semibold py-2.5 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading…" : "Upload & Extract Criteria"}
        </button>
      </form>
    </main>
  );
}
```

---

## Task 10: Tender overview page + extraction banner

**Files:** `frontend/app/tenders/[id]/layout.tsx`, `frontend/app/tenders/[id]/page.tsx`

- [ ] **Step 1: Create frontend/app/tenders/[id]/layout.tsx**

```tsx
import { fetchTender } from "@/lib/api";
import { TenderTabs } from "@/components/layout/TenderTabs";

export default async function TenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const tender = await fetchTender(params.id);
  return (
    <div>
      <TenderTabs tenderId={params.id} status={tender.status} />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create frontend/app/tenders/[id]/page.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchTender } from "@/lib/api";
import { TenderStatusBadge } from "@/components/tenders/TenderStatusBadge";
import type { TenderDetail } from "@/lib/types";

function ExtractionBanner() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 600);
    const timeout = setTimeout(() => { setVisible(false); clearInterval(interval); }, 4000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  if (!visible) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4 mb-6">
      <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-blue-900 text-sm">Extracting criteria from PDF…</p>
        <p className="text-blue-600 text-xs mt-0.5">Claude Sonnet is reading the tender · Usually takes 15–30 seconds</p>
        <div className="bg-blue-200 rounded-full h-1.5 mt-2">
          <div className="bg-brand h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function TenderOverviewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const extracting = searchParams.get("extracting") === "1";
  const [tender, setTender] = useState<TenderDetail | null>(null);

  useEffect(() => {
    fetchTender(params.id).then(setTender);
  }, [params.id]);

  if (!tender) return <div className="p-8 text-gray-400 text-sm">Loading…</div>;

  const nextStep =
    tender.status === "AWAITING_REVIEW" ? "review-criteria" :
    tender.status === "CRITERIA_APPROVED" ? "bidders" :
    tender.status === "EVALUATED" ? "audit" : null;

  const nextLabel =
    tender.status === "AWAITING_REVIEW" ? "Review Criteria →" :
    tender.status === "CRITERIA_APPROVED" ? "Add Bidders →" :
    tender.status === "EVALUATED" ? "Download Report →" : null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      {extracting && <ExtractionBanner />}

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">TENDER</p>
          <p className="font-bold text-gray-900">{tender.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{tender.procuring_department}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center min-w-[140px]">
          <p className="text-xs text-gray-400 mb-2">STATUS</p>
          <TenderStatusBadge status={tender.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Criteria extracted", value: tender.criteria_count },
          { label: "Bidders added", value: tender.bidder_count },
          { label: "Verdicts", value: tender.verdict_count || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-brand">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {nextStep && (
        <div className="bg-brand-bg border border-brand-border rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-blue-900">
            {tender.status === "AWAITING_REVIEW" && "Next: review the extracted criteria before adding bidders."}
            {tender.status === "CRITERIA_APPROVED" && "Next: add bidders and upload their documents."}
            {tender.status === "EVALUATED" && "Evaluation complete. Download the signed audit report."}
          </p>
          <Link
            href={`/tenders/${params.id}/${nextStep}`}
            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-brand-dark transition-colors whitespace-nowrap ml-4"
          >
            {nextLabel}
          </Link>
        </div>
      )}
    </main>
  );
}
```

---

## Task 11: Review criteria page

**Files:** `frontend/components/criteria/CriterionEditModal.tsx`, `CriterionRow.tsx`, `CriteriaTable.tsx`, `frontend/app/tenders/[id]/review-criteria/page.tsx`

- [ ] **Step 1: Create frontend/components/criteria/CriterionEditModal.tsx**

```tsx
"use client";
import { useState } from "react";
import type { Criterion } from "@/lib/types";

interface Props {
  criterion: Criterion;
  onSave: (updates: Partial<Criterion>) => void;
  onClose: () => void;
}

const CATEGORIES = ["FINANCIAL","TECHNICAL","COMPLIANCE","DOCUMENT","CERTIFICATION"] as const;

export function CriterionEditModal({ criterion, onSave, onClose }: Props) {
  const [description, setDescription] = useState(criterion.description);
  const [isMandatory, setIsMandatory] = useState(criterion.is_mandatory);
  const [category, setCategory] = useState(criterion.category);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Edit Criterion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 accent-brand"
            />
            Mandatory criterion
          </label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => { onSave({ description, is_mandatory: isMandatory, category }); onClose(); }}
            className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-brand-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create frontend/components/criteria/CriterionRow.tsx**

```tsx
"use client";
import type { Criterion } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  FINANCIAL:    "bg-blue-100 text-blue-800",
  TECHNICAL:    "bg-green-100 text-green-800",
  COMPLIANCE:   "bg-purple-100 text-purple-800",
  DOCUMENT:     "bg-orange-100 text-orange-800",
  CERTIFICATION:"bg-amber-100 text-amber-800",
};

interface Props {
  criterion: Criterion;
  onEdit: () => void;
  onDelete: () => void;
}

export function CriterionRow({ criterion, onEdit, onDelete }: Props) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-xs">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_STYLES[criterion.category] ?? "bg-gray-100"}`}>
          {criterion.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 max-w-sm">{criterion.description}</td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {criterion.threshold
          ? criterion.threshold.type === "min_amount_inr"
            ? `≥ ₹${(Number(criterion.threshold.value) / 10000000).toFixed(0)} Cr`
            : criterion.threshold.type === "min_count"
            ? `≥ ${criterion.threshold.value}`
            : "Must exist"
          : "—"}
      </td>
      <td className="px-4 py-3 text-xs">
        <span className={`px-2 py-0.5 rounded font-semibold ${criterion.is_mandatory ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {criterion.is_mandatory ? "YES" : "optional"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs">
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-gray-400 hover:text-brand" title="Edit">✏️</button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  );
}
```

- [ ] **Step 3: Create frontend/components/criteria/CriteriaTable.tsx**

```tsx
"use client";
import { useState } from "react";
import type { Criterion } from "@/lib/types";
import { CriterionRow } from "./CriterionRow";
import { CriterionEditModal } from "./CriterionEditModal";

interface Props {
  initialCriteria: Criterion[];
  tenderId: string;
  onApprove: () => void;
  approving: boolean;
}

export function CriteriaTable({ initialCriteria, tenderId, onApprove, approving }: Props) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [editing, setEditing] = useState<Criterion | null>(null);

  function handleDelete(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave(id: string, updates: Partial<Criterion>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Review Extracted Criteria</h1>
          <p className="text-xs text-gray-500">{criteria.length} criteria · Approve, edit, or add before scoring begins</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-brand text-brand text-xs font-semibold px-3 py-2 rounded-md hover:bg-brand-bg">
            + Add Criterion
          </button>
          <button
            onClick={onApprove}
            disabled={approving}
            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-brand-dark disabled:opacity-50"
          >
            {approving ? "Approving…" : "✓ Approve All & Lock"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              {["CATEGORY","DESCRIPTION","THRESHOLD","MANDATORY","ACTIONS"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-xs font-bold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                onEdit={() => setEditing(criterion)}
                onDelete={() => handleDelete(criterion.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CriterionEditModal
          criterion={editing}
          onSave={(updates) => handleSave(editing.id, updates)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: Create frontend/app/tenders/[id]/review-criteria/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCriteriaList, approveCriteria } from "@/lib/api";
import { CriteriaTable } from "@/components/criteria/CriteriaTable";
import type { Criterion } from "@/lib/types";

export default function ReviewCriteriaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [approving, setApproving] = useState(false);

  useEffect(() => { fetchCriteriaList(params.id).then(setCriteria); }, [params.id]);

  async function handleApprove() {
    setApproving(true);
    try {
      await approveCriteria(params.id);
      router.push(`/tenders/${params.id}/bidders`);
    } finally {
      setApproving(false);
    }
  }

  if (!criteria.length) return <div className="p-8 text-gray-400 text-sm">Loading…</div>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <CriteriaTable
        initialCriteria={criteria}
        tenderId={params.id}
        onApprove={handleApprove}
        approving={approving}
      />
    </main>
  );
}
```

---

## Task 12: Bidders page

**Files:** `DocumentBadge.tsx`, `BidderCard.tsx`, `AddBidderModal.tsx`, bidders page

> Product note: this page is an admin-assisted upload shortcut for the mock phase. The durable implementation should add bidder-facing submission routes (`/bidder/tenders/{id}/submit`) and an admin submissions review route (`/tenders/{id}/submissions`). Do not present `/tenders/{id}/bidders` as the final bidder portal.

- [ ] **Step 1: Create frontend/components/bidders/DocumentBadge.tsx**

```tsx
import type { DocumentType } from "@/lib/types";

const LANG_STYLE: Record<string, string> = {
  en: "bg-blue-100 text-blue-800",
  hi: "bg-orange-100 text-orange-800",
  kn: "bg-purple-100 text-purple-800",
};

const TYPE_STYLE: Record<DocumentType, string> = {
  TYPED_PDF:   "bg-green-100 text-green-700",
  SCANNED_PDF: "bg-red-100 text-red-700",
  IMAGE:       "bg-red-100 text-red-700",
  DOCX:        "bg-blue-100 text-blue-700",
};

const TYPE_LABEL: Record<DocumentType, string> = {
  TYPED_PDF: "typed", SCANNED_PDF: "scanned", IMAGE: "photo", DOCX: "docx",
};

interface Props { languages: string[]; docType: DocumentType }

export function DocumentBadge({ languages, docType }: Props) {
  return (
    <div className="flex gap-1 items-center">
      {languages.map((lang) => (
        <span key={lang} className={`text-xs font-bold px-1.5 py-0.5 rounded ${LANG_STYLE[lang] ?? "bg-gray-100 text-gray-600"}`}>
          {lang.toUpperCase()}
        </span>
      ))}
      <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_STYLE[docType]}`}>
        {TYPE_LABEL[docType]}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create frontend/components/bidders/BidderCard.tsx**

```tsx
import type { Bidder } from "@/lib/types";
import { DocumentBadge } from "./DocumentBadge";

export function BidderCard({ bidder }: { bidder: Bidder }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-900 text-sm">{bidder.legal_name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          bidder.documents.length >= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>
          {bidder.documents.length} doc{bidder.documents.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {bidder.documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <span className="text-xs text-gray-600">📄</span>
            <span className="text-xs text-gray-700 max-w-[140px] truncate" title={doc.filename}>{doc.filename}</span>
            <DocumentBadge languages={doc.detected_languages} docType={doc.document_type} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create frontend/components/bidders/AddBidderModal.tsx**

```tsx
"use client";
import { useState } from "react";

interface Props {
  onAdd: (name: string, files: File[]) => void;
  onClose: () => void;
}

export function AddBidderModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Add Bidder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Legal Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sharma Constructions Pvt. Ltd."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Documents (PDF / images)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm text-gray-600"
            />
            {files.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100">Cancel</button>
          <button
            disabled={!name}
            onClick={() => { onAdd(name, files); onClose(); }}
            className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-brand-dark disabled:opacity-50"
          >
            Add Bidder
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create frontend/app/tenders/[id]/bidders/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { fetchBiddersList, createBidder } from "@/lib/api";
import { BidderCard } from "@/components/bidders/BidderCard";
import { AddBidderModal } from "@/components/bidders/AddBidderModal";
import type { Bidder } from "@/lib/types";

export default function BiddersPage({ params }: { params: { id: string } }) {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchBiddersList(params.id).then(setBidders); }, [params.id]);

  async function handleAdd(name: string) {
    const created = await createBidder(params.id, name);
    setBidders((prev) => [created, ...prev]);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bidders ({bidders.length})</h1>
          <p className="text-xs text-gray-500">Language and document type detected automatically</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-brand-dark"
        >
          + Add Bidder
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {bidders.map((bidder) => <BidderCard key={bidder.id} bidder={bidder} />)}
      </div>
      {showModal && (
        <AddBidderModal
          onAdd={(name) => handleAdd(name)}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
```

---

## Task 13: Verdicts page

**Files:** `VerdictCell.tsx`, `VerdictSidePanel.tsx`, `VerdictMatrix.tsx`, verdicts page

- [ ] **Step 1: Create frontend/components/verdicts/VerdictCell.tsx**

```tsx
import type { VerdictValue } from "@/lib/types";

const STYLES: Record<VerdictValue, string> = {
  ELIGIBLE:            "bg-green-100 text-green-700 hover:bg-green-200",
  NOT_ELIGIBLE:        "bg-red-100 text-red-700 hover:bg-red-200 font-bold",
  NEEDS_MANUAL_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-200",
};

const ICONS: Record<VerdictValue, string> = {
  ELIGIBLE: "✓", NOT_ELIGIBLE: "✗", NEEDS_MANUAL_REVIEW: "⚠",
};

interface Props {
  verdict: VerdictValue;
  onClick: () => void;
  isSelected: boolean;
}

export function VerdictCell({ verdict, onClick, isSelected }: Props) {
  return (
    <td
      onClick={onClick}
      className={`px-3 py-2.5 text-center text-sm cursor-pointer transition-colors border border-gray-100 ${STYLES[verdict]} ${isSelected ? "ring-2 ring-brand ring-inset" : ""}`}
    >
      {ICONS[verdict]}
    </td>
  );
}
```

- [ ] **Step 2: Create frontend/components/verdicts/VerdictSidePanel.tsx**

```tsx
import type { VerdictResult, Criterion } from "@/lib/types";

interface Props {
  result: VerdictResult;
  criterion: Criterion | undefined;
  bidderName: string;
  onClose: () => void;
  onApprove: () => void;
  onOverride: (reason: string) => void;
}

function ConfidenceBar({ label, value, pass }: { label: string; value: number | null; pass?: boolean }) {
  if (value === null && pass === undefined) return null;
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        {value !== null ? (
          <span className={`text-xs font-semibold ${value >= 0.85 ? "text-green-600" : value >= 0.70 ? "text-amber-600" : "text-red-600"}`}>
            {Math.round(value * 100)}%
          </span>
        ) : (
          <span className={`text-xs font-semibold ${pass ? "text-green-600" : "text-red-600"}`}>
            {pass ? "✓ Pass" : "✗ Fail"}
          </span>
        )}
      </div>
      {value !== null && (
        <div className="bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${value >= 0.85 ? "bg-green-500" : value >= 0.70 ? "bg-amber-400" : "bg-red-500"}`}
            style={{ width: `${value * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

const VERDICT_STYLES = {
  ELIGIBLE:            { bg: "bg-green-50 border-green-200", text: "text-green-800", label: "✓ ELIGIBLE" },
  NOT_ELIGIBLE:        { bg: "bg-red-50 border-red-200",     text: "text-red-800",   label: "✗ NOT ELIGIBLE" },
  NEEDS_MANUAL_REVIEW: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", label: "⚠ NEEDS REVIEW" },
};

export function VerdictSidePanel({ result, criterion, bidderName, onClose, onApprove, onOverride }: Props) {
  const style = VERDICT_STYLES[result.verdict];

  return (
    <div className="w-72 bg-white border-l-2 border-brand flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">Verdict Detail</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3 flex-1">
        <div className={`rounded-md border p-3 ${style.bg}`}>
          <p className={`font-bold text-sm ${style.text}`}>{style.label}</p>
          <p className={`text-xs mt-0.5 ${style.text} opacity-80`}>{bidderName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1">CRITERION</p>
          <p className="text-sm text-gray-700 leading-snug">{criterion?.description ?? "—"}</p>
        </div>

        {result.evidence_ref && (
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">EVIDENCE</p>
            <p className="text-sm text-gray-800 font-medium">{result.evidence_ref.value}</p>
            <p className="text-xs text-gray-500">Page {result.evidence_ref.page}</p>
            {result.evidence_ref.translated_span && (
              <p className="text-xs text-purple-600 mt-0.5">Translated: {result.evidence_ref.translated_span}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">CONFIDENCE</p>
          <ConfidenceBar label="OCR Confidence"         value={result.ocr_confidence} />
          <ConfidenceBar label="Extraction Confidence"  value={result.extraction_confidence} />
          <ConfidenceBar label="Span Validated"         value={null} pass={result.span_validated} />
        </div>

        {result.evidence_ref?.raw_span && (
          <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-500 italic border-l-2 border-brand">
            "{result.evidence_ref.raw_span}"
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1">REASON</p>
          <p className="text-xs text-gray-600">{result.reason}</p>
        </div>

        <p className="text-xs text-gray-400">Model: {result.model_version}</p>
      </div>

      <div className="px-4 py-3 border-t flex flex-col gap-2">
        <button
          onClick={onApprove}
          className="w-full border border-gray-300 text-gray-700 text-xs py-1.5 rounded hover:bg-gray-50"
        >
          ✓ Approve verdict
        </button>
        <button
          onClick={() => {
            const reason = window.prompt("Reason for override:");
            if (reason) onOverride(reason);
          }}
          className="w-full bg-brand text-white text-xs font-semibold py-1.5 rounded hover:bg-brand-dark"
        >
          Override verdict
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create frontend/components/verdicts/VerdictMatrix.tsx**

```tsx
"use client";
import { useState } from "react";
import type { VerdictMatrix as VerdictMatrixType, Criterion, VerdictResult } from "@/lib/types";
import { VerdictCell } from "./VerdictCell";
import { VerdictSidePanel } from "./VerdictSidePanel";

interface Props {
  matrix: VerdictMatrixType;
  criteria: Criterion[];
}

interface Selected { bidderIdx: number; criterionId: string }

export function VerdictMatrix({ matrix, criteria }: Props) {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [localVerdicts, setLocalVerdicts] = useState(matrix.verdicts);

  const criteriaMap = Object.fromEntries(criteria.map((c) => [c.id, c]));

  const selectedResult: VerdictResult | null = selected
    ? localVerdicts[selected.bidderIdx]?.results.find((r) => r.criterion_id === selected.criterionId) ?? null
    : null;

  const selectedBidderName = selected ? localVerdicts[selected.bidderIdx]?.bidder_name : "";

  function handleApprove() {
    if (!selected || !selectedResult) return;
    setLocalVerdicts((prev) =>
      prev.map((bv, i) =>
        i === selected.bidderIdx
          ? { ...bv, results: bv.results.map((r) => r.criterion_id === selected.criterionId ? { ...r, reviewer_action: "APPROVED" } : r) }
          : bv
      )
    );
  }

  function handleOverride(reason: string) {
    if (!selected) return;
    setLocalVerdicts((prev) =>
      prev.map((bv, i) =>
        i === selected.bidderIdx
          ? { ...bv, results: bv.results.map((r) => r.criterion_id === selected.criterionId ? { ...r, reviewer_action: "OVERRIDDEN", reviewer_reason: reason } : r) }
          : bv
      )
    );
  }

  const shortLabel = (c: Criterion) => c.category === "FINANCIAL" ? "Turnover" : c.category === "TECHNICAL" ? "Projects" : c.description.slice(0, 12) + "…";

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4 px-6 pt-8">
          <h1 className="text-lg font-bold text-gray-900">Verdict Matrix</h1>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">ELIGIBLE</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">NOT ELIGIBLE</span>
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">REVIEW</span>
          </div>
        </div>
        <div className="px-6 pb-8 overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 border border-gray-200 min-w-[160px]">BIDDER</th>
                {matrix.criteria.map((cid) => (
                  <th key={cid} className="px-3 py-2 text-center text-xs font-bold text-gray-500 border border-gray-200 min-w-[80px]">
                    {criteriaMap[cid] ? shortLabel(criteriaMap[cid]) : cid}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localVerdicts.map((bv, bIdx) => (
                <tr key={bv.bidder_id}>
                  <td className="px-4 py-2.5 font-semibold text-gray-800 text-xs border border-gray-100 bg-white">{bv.bidder_name}</td>
                  {matrix.criteria.map((cid) => {
                    const result = bv.results.find((r) => r.criterion_id === cid);
                    if (!result) return <td key={cid} className="border border-gray-100 px-3 py-2 text-center text-gray-300">—</td>;
                    return (
                      <VerdictCell
                        key={cid}
                        verdict={result.verdict}
                        isSelected={selected?.bidderIdx === bIdx && selected?.criterionId === cid}
                        onClick={() => setSelected({ bidderIdx: bIdx, criterionId: cid })}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && selectedResult && (
        <VerdictSidePanel
          result={selectedResult}
          criterion={criteriaMap[selected.criterionId]}
          bidderName={selectedBidderName}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onOverride={handleOverride}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create frontend/app/tenders/[id]/verdicts/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { fetchVerdicts, fetchCriteriaList, triggerEvaluation } from "@/lib/api";
import { VerdictMatrix } from "@/components/verdicts/VerdictMatrix";
import type { VerdictMatrix as VerdictMatrixType, Criterion } from "@/lib/types";

export default function VerdictsPage({ params }: { params: { id: string } }) {
  const [matrix, setMatrix] = useState<VerdictMatrixType | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    Promise.all([fetchVerdicts(params.id), fetchCriteriaList(params.id)])
      .then(([m, c]) => { setMatrix(m); setCriteria(c); });
  }, [params.id]);

  async function handleEvaluate() {
    setEvaluating(true);
    await triggerEvaluation(params.id);
    const [m, c] = await Promise.all([fetchVerdicts(params.id), fetchCriteriaList(params.id)]);
    setMatrix(m); setCriteria(c);
    setEvaluating(false);
  }

  if (!matrix) return <div className="p-8 text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-110px)]">
      {!matrix.verdicts.length ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-gray-500">No verdicts yet.</p>
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="bg-brand text-white font-semibold px-6 py-2.5 rounded-md hover:bg-brand-dark disabled:opacity-50"
          >
            {evaluating ? "Evaluating…" : "Run Evaluation"}
          </button>
        </div>
      ) : (
        <VerdictMatrix matrix={matrix} criteria={criteria} />
      )}
    </div>
  );
}
```

---

## Task 14: Audit report page

**File:** `frontend/app/tenders/[id]/audit/page.tsx`

- [ ] **Step 1: Create frontend/app/tenders/[id]/audit/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { fetchAuditReport } from "@/lib/api";
import type { AuditReport } from "@/lib/types";

export default function AuditPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<AuditReport | null>(null);

  useEffect(() => { fetchAuditReport(params.id).then(setReport); }, [params.id]);

  if (!report) return <div className="p-8 text-gray-400 text-sm">Loading…</div>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-lg font-bold text-gray-900 mb-6">Audit Report</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tender", value: report.tender_title },
            { label: "Department", value: report.procuring_department },
            { label: "Generated", value: new Date(report.generated_at).toLocaleDateString("en-IN") },
            { label: "By", value: report.generated_by },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label.toUpperCase()}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Eligible",       value: report.eligible_count,     color: "text-green-600" },
            { label: "Not Eligible",   value: report.not_eligible_count, color: "text-red-600" },
            { label: "Needs Review",   value: report.needs_review_count, color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center bg-gray-50 rounded-lg py-3">
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-xs text-gray-500 break-all">
          SHA-256: {report.content_hash}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Replay ID: {report.replay_id} · Models: {report.model_versions.join(", ")}</p>
      </div>

      <div className="flex gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}${report.pdf_uri}`}
          className="flex-1 bg-brand text-white text-sm font-semibold py-3 rounded-md text-center hover:bg-brand-dark transition-colors"
        >
          ⬇ Download Audit PDF
        </a>
        <button className="flex-1 border border-brand text-brand text-sm font-semibold py-3 rounded-md hover:bg-brand-bg transition-colors">
          ↻ Replay Evaluation
        </button>
      </div>
    </main>
  );
}
```

---

## Task 15: Docker Compose + infra + final checks

**Files:** `infra/docker-compose.yml`, `infra/.env.example`, `frontend/Dockerfile`

- [ ] **Step 1: Create frontend/Dockerfile**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Update frontend/next.config.ts for standalone output**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 3: Create infra/docker-compose.yml**

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
```

- [ ] **Step 4: Create infra/.env.example**

```
# Backend
PYTHONUNBUFFERED=1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 5: Add .superpowers/ to .gitignore**

Open `TenderSaarthi/.gitignore` and append:
```
# Brainstorming session files
.superpowers/
```

- [ ] **Step 6: Full local smoke test**

```bash
# Terminal 1
cd backend && uvicorn app.main:app --port 8000 --reload

# Terminal 2
cd frontend && npm run dev
```

Visit in browser:
- [http://localhost:3000/tenders](http://localhost:3000/tenders) — stats row + 3 tender cards ✓
- [http://localhost:3000/tenders/new](http://localhost:3000/tenders/new) — upload form ✓
- [http://localhost:3000/tenders/t-001](http://localhost:3000/tenders/t-001) — overview + tab stepper ✓
- [http://localhost:3000/tenders/t-001/review-criteria](http://localhost:3000/tenders/t-001/review-criteria) — 9 criteria table ✓
- [http://localhost:3000/tenders/t-001/bidders](http://localhost:3000/tenders/t-001/bidders) — 3 bidders with language badges ✓
- [http://localhost:3000/tenders/t-001/verdicts](http://localhost:3000/tenders/t-001/verdicts) — verdict matrix, click any cell ✓
- [http://localhost:3000/tenders/t-001/audit](http://localhost:3000/tenders/t-001/audit) — SHA-256, download button ✓

- [ ] **Step 7: Final commit**

```bash
git add frontend/ infra/ .gitignore
git commit -m "feat: full frontend scaffold + Docker Compose (mock phase complete)"
```
