# Frontend + Mock Backend Design
**Date:** 2026-05-07
**Status:** Approved

## Overview

Build the TenderSaarthi frontend (Next.js 14) and a mock FastAPI backend that returns static JSON responses. The frontend makes real HTTP calls to the backend. In Phase 3, mock route handler bodies are replaced with real DB + AI logic — zero frontend changes required.

Clarification after implementation review: the target product has two workspaces. The current mock's `/tenders/[id]/bidders` page is an admin-assisted shortcut for demo speed. The durable product flow must add a bidder-facing submission workspace so bidders upload their own documents against a tender, and CRPF/admin users only review received submissions and verdicts.

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Navigation | Top nav + horizontal tab stepper | More screen real estate; works best for the data-dense verdict matrix |
| Visual style | Government Blue (#1e40af primary) | Authoritative for CRPF officers; still clean for AI/VC judges |
| Frontend framework | Next.js 14 App Router | Already in CLAUDE.md stack; RSC-friendly |
| Component library | shadcn/ui + Tailwind | Already in CLAUDE.md stack |
| Mock backend | FastAPI reading from `mock_responses/*.json` | Real API contract from day one; Phase 3 = swap handler bodies only |

---

## Section 1 — Project Structure

### Frontend (`frontend/`)

```
frontend/
├── app/
│   ├── layout.tsx                      # Root layout — TopNav only
│   ├── page.tsx                        # Redirect → /tenders
│   ├── bidder/
│   │   ├── tenders/
│   │   │   ├── page.tsx                # /bidder/tenders — bidder list of open tenders
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # /bidder/tenders/[id] — public tender details
│   │   │       └── submit/
│   │   │           └── page.tsx        # /bidder/tenders/[id]/submit — bidder submission form
│   │   └── submissions/
│   │       └── [id]/
│   │           └── page.tsx            # /bidder/submissions/[id] — bidder's own status
│   ├── tenders/
│   │   ├── page.tsx                    # /tenders — tender list + stats row
│   │   ├── new/
│   │   │   └── page.tsx                # /tenders/new — upload form
│   │   └── [id]/
│   │       ├── layout.tsx              # Tender layout — TenderTabs stepper
│   │       ├── page.tsx                # /tenders/[id] — overview + next-step prompt
│   │       ├── review-criteria/
│   │       │   └── page.tsx            # Criterion-review gate
│   │       ├── bidders/
│   │       │   └── page.tsx            # Admin-assisted bidder upload shortcut (mock only)
│   │       ├── submissions/
│   │       │   └── page.tsx            # Admin view of bidder submissions
│   │       ├── verdicts/
│   │       │   └── page.tsx            # Verdict matrix + side panel
│   │       └── audit/
│   │           └── page.tsx            # Audit report + download
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx                  # Brand + global links + avatar
│   │   └── TenderTabs.tsx              # 5-step stepper with status-aware rendering
│   ├── tenders/
│   │   ├── TenderCard.tsx              # List item with status badge
│   │   ├── TenderStatusBadge.tsx       # Coloured pill per status enum
│   │   └── StatsRow.tsx                # 4 stat cards above tender list
│   ├── criteria/
│   │   ├── CriteriaTable.tsx           # Table with edit/delete per row
│   │   ├── CriterionRow.tsx            # Single row; inline edit on click
│   │   └── CriterionEditModal.tsx      # Modal for editing a criterion
│   ├── bidders/
│   │   ├── BidderCard.tsx              # Card with doc list + language badges
│   │   ├── DocumentBadge.tsx           # EN/HI/KA + typed/scanned/photo tags
│   │   └── AddBidderModal.tsx          # Name input + multi-file upload
│   ├── verdicts/
│   │   ├── VerdictMatrix.tsx           # Scrollable table, click handler
│   │   ├── VerdictCell.tsx             # Colour-coded ✓/✗/⚠ cell
│   │   └── VerdictSidePanel.tsx        # Detail panel: evidence + confidence bars + approve/override
│   └── ui/                             # shadcn/ui primitives (Button, Badge, Dialog, etc.)
├── lib/
│   ├── api.ts                          # fetch helpers; BASE_URL from env
│   └── types.ts                        # TypeScript interfaces mirroring API shapes
├── public/
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

### Backend (`backend/`)

```
backend/
├── app/
│   ├── main.py                         # FastAPI app; CORS; router includes
│   ├── api/
│   │   ├── health.py                   # GET /health, GET /version
│   │   ├── tenders.py                  # /api/v1/tenders routes
│   │   ├── criteria.py                 # /api/v1/tenders/{id}/criteria routes
│   │   ├── bidders.py                  # /api/v1/bidders routes
│   │   └── verdicts.py                 # /api/v1/verdicts routes
│   └── mock_responses/
│       ├── tenders_list.json
│       ├── tender_detail.json
│       ├── criteria_list.json
│       ├── bidders_list.json
│       ├── verdict_matrix.json
│       └── audit_report.json
├── pyproject.toml
└── Dockerfile
```

Every route handler in Phase 1 follows the same pattern:
```python
@router.get("/api/v1/tenders")
async def list_tenders():
    return json.loads(Path("app/mock_responses/tenders_list.json").read_text())
```
In Phase 3, the `json.loads(Path(...))` line is replaced with real DB queries.

---

## Section 2 — Pages & Navigation

### Navigation shell

**TopNav** (always visible):
- Left: `🏛 TenderSaarthi` logo → `/tenders`
- Right: `Tenders` link, `Reports` link, avatar circle (Admin)
- Background: `#1e40af`, text `#bfdbfe`

**TenderTabs** (visible on `/tenders/[id]/*`):
- 5 tabs: Overview · Review Criteria · Bidders · Evaluate · Report
- Tab state: `completed` (green ✓) / `active` (blue underline, white bg) / `locked` (grey, disabled until prerequisites met)
- Lock rules:
  - `Bidders` locked until `CRITERIA_APPROVED`
  - `Evaluate` locked until at least 1 bidder added
  - `Report` locked until `EVALUATED`

### Page inventory

| Route | Purpose | Key interactions |
|---|---|---|
| `/tenders` | Tender list + stats row | Filter pills, "New Tender" button |
| `/tenders/new` | Upload form | File drop zone, submit → shows extraction progress banner |
| `/tenders/[id]` | Overview | Stats (criteria count, bidders, verdicts), next-step CTA |
| `/tenders/[id]/review-criteria` | Criterion-review gate | Edit row inline, delete, add, "Approve All & Lock" |
| `/bidder/tenders` | Bidder open tender list | Choose tender to submit against |
| `/bidder/tenders/[id]` | Bidder tender details | Review public tender details, start submission |
| `/bidder/tenders/[id]/submit` | Bidder submission | Firm details + document upload |
| `/bidder/submissions/[id]` | Bidder submission status | See submitted/processing/needs correction |
| `/tenders/[id]/submissions` | Admin submission review | See submissions received for this tender |
| `/tenders/[id]/bidders` | Mock admin-assisted upload shortcut | Add bidder modal, per-doc language + type badges |
| `/tenders/[id]/verdicts` | Verdict matrix + side panel | Click cell → side panel with confidence bars, approve/override |
| `/tenders/[id]/audit` | Audit report | SHA-256 display, Download PDF, Replay button |

### Tender status state machine (drives tab lock + badge colour)

```
UPLOADED → EXTRACTING → AWAITING_REVIEW → CRITERIA_APPROVED → EVALUATING → EVALUATED → SIGNED
```

Badge colours: `AWAITING_REVIEW` = amber, `CRITERIA_APPROVED` = blue, `EVALUATED` = green, `SIGNED` = indigo.

---

## Section 3 — Mock API & Data Shapes

### Endpoints mocked (Phase 1)

```
GET    /health
GET    /api/v1/tenders                       → tenders_list.json
POST   /api/v1/tenders                       → mock created tender (status: EXTRACTING)
GET    /api/v1/tenders/{id}                  → tender_detail.json
GET    /api/v1/tenders/{id}/criteria         → criteria_list.json
PATCH  /api/v1/tenders/{id}/criteria/{cid}   → echoes back updated criterion
POST   /api/v1/tenders/{id}/criteria/approve → { data: { status: "CRITERIA_APPROVED" }, meta: {...} }
GET    /api/v1/public/tenders                → public open tenders for bidder workspace
GET    /api/v1/public/tenders/{id}           → public tender detail
POST   /api/v1/public/tenders/{id}/submissions → mock created bidder submission
POST   /api/v1/submissions/{id}/documents    → mock uploaded document
GET    /api/v1/submissions/{id}              → bidder's own submission status
GET    /api/v1/tenders/{id}/submissions      → admin list of received submissions
GET    /api/v1/tenders/{id}/bidders          → bidders_list.json (mock shortcut)
POST   /api/v1/tenders/{id}/bidders          → mock created bidder (mock shortcut)
POST   /api/v1/bidders/{id}/documents        → mock uploaded document (mock shortcut)
POST   /api/v1/tenders/{id}/evaluate         → { data: { job_id: "...", status: "EVALUATING" }, meta: {...} }
GET    /api/v1/tenders/{id}/verdicts         → verdict_matrix.json
POST   /api/v1/verdicts/{id}/approve         → updated verdict with reviewer_action: "APPROVED"
POST   /api/v1/verdicts/{id}/override        → updated verdict with reviewer_action: "OVERRIDDEN"
GET    /api/v1/tenders/{id}/report           → audit_report.json
```

### Key mock data shapes (abbreviated)

**tenders_list.json** — 3 tenders covering all status states for demo variety:
```json
{
  "data": [
    { "id": "t-001", "title": "CRPF Construction Tender 2024", "procuring_department": "CRPF — HQ New Delhi", "status": "AWAITING_REVIEW", "uploaded_at": "2026-05-05T09:00:00Z", "criteria_count": 9, "bidder_count": 0 },
    { "id": "t-002", "title": "CRPF IT Infrastructure 2024", "procuring_department": "CRPF — Signals Wing", "status": "EVALUATED", "uploaded_at": "2026-05-02T11:00:00Z", "criteria_count": 7, "bidder_count": 5 },
    { "id": "t-003", "title": "CRPF Vehicle Maintenance 2023", "procuring_department": "CRPF — Transport Wing", "status": "SIGNED", "uploaded_at": "2026-04-14T08:00:00Z", "criteria_count": 6, "bidder_count": 4 }
  ],
  "meta": { "total": 3, "stats": { "awaiting_review": 1, "evaluated": 1, "signed": 1, "verdicts_total": 27 } }
}
```

**criteria_list.json** — 9 criteria for t-001 covering all 5 categories (FINANCIAL, TECHNICAL, COMPLIANCE, DOCUMENT, CERTIFICATION), mix of mandatory + optional.

**verdict_matrix.json** — 3 bidders × 9 criteria = 27 verdicts. Includes at least:
- 1 `NOT_ELIGIBLE` cell with full evidence + confidence scores for the demo
- 1 `NEEDS_MANUAL_REVIEW` cell (low OCR confidence on a Hindi document)
- 1 `ELIGIBLE` cell with full provenance

Each verdict carries: `verdict`, `reason`, `evidence_ref` (value, page, bbox, raw_span, translated_span), `ocr_confidence`, `extraction_confidence`, `span_validated`, `model_version`, `replay_id`.

**bidders_list.json** — 3 bidders with realistic document sets. Each document has `filename`, `document_type` (TYPED_PDF/SCANNED_PDF/IMAGE), `detected_languages` (["en"], ["hi"], ["kn"]).

---

## Section 4 — Enhancements (judge-facing differentiators)

1. **Confidence score bars** — VerdictSidePanel shows three progress bars: OCR %, Extraction %, Span Validated ✓/✗. AI/ML judges will specifically look for this.
2. **Language + type badges on documents** — `EN`/`HI`/`KA` pill + `typed`/`scanned`/`photo` pill on every document in BidderCard. Shows multilingual pipeline at a glance.
3. **Live extraction progress banner** — After upload, `/tenders/[id]` shows an animated progress bar + "Claude Sonnet is reading the tender…" until status flips to `AWAITING_REVIEW`.
4. **Stats row on tenders list** — 4 stat cards (Active Tenders, Awaiting Review, Verdicts Generated, Signed Reports) with coloured top borders.

---

## Section 5 — Run Setup

### Local dev (no Docker)
```bash
# Terminal 1 — backend
cd backend && pip install -e ".[dev]" && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm install && npm run dev   # runs on :3000
```

### Docker Compose (for judges)
`infra/docker-compose.yml` adds two services: `backend` (port 8000) and `frontend` (port 3000). No DB or Redis needed for the mock phase — just the two app containers.

Frontend reads `NEXT_PUBLIC_API_URL` from env; defaults to `http://localhost:8000`.

---

## What this spec does NOT cover

- Real DB, Celery workers, OCR, LLM calls — Phase 3.
- Authentication — single hardcoded admin for demo, Phase 4 polish.
- Bidder authentication and per-bidder authorization — use mock identity until auth polish.
- PDF.js viewer with bbox overlay — Week 3 feature per TODOS.md.
- ReportLab audit PDF generation — Week 4 feature per TODOS.md.
