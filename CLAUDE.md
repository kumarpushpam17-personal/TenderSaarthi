# CLAUDE.md — TenderSaarthi Project Instructions

> This file is read by Claude Code at the start of every session. Keep it current. Anything strategic or rationale-heavy lives in `IDEA.md` and `docs/ARCHITECTURE.md` — link, do not duplicate.

## Project mission (one paragraph)

TenderSaarthi is an explainable, multilingual, audit-ready AI platform that converts government tender eligibility evaluation from a days-long manual process into a criterion-by-criterion decision-support workflow. Inputs: a tender document and a set of bidder submissions (typed PDFs, scans, photographs, Word files, in English/Hindi/Kannada/other Indian languages). Output: per-bidder, per-criterion verdicts (`Eligible` / `Not Eligible` / `Needs Manual Review`), each citing the exact source document, page, and bounding box, plus a signed audit-ready PDF report. Built for the AI for Bharat 2 hackathon, Theme 3 — CRPF.

## The three non-negotiables (do not violate these in code)

1. **Never silently disqualify.** Every low-confidence, ambiguous, or partial-evidence case must be routed to `NEEDS_MANUAL_REVIEW` with a reason. Disqualification only happens on high-confidence, evidence-backed mismatches.
2. **Every verdict cites its source.** Page number, bounding box (where applicable), and extracted value must be attached to every `Eligible` / `Not Eligible` / `Needs Manual Review` verdict. No exceptions.
3. **Replayability.** Every automated decision logs the model name + version, prompt template hash, OCR engine + confidence, and timestamp. Any verdict must be reconstructible months later.

## Tech stack (prototype scope, Round 2)

| Layer | Choice | Reason |
|---|---|---|
| Backend | FastAPI 0.115+, Python 3.11 | Async, Pydantic-native, mature in the team |
| Task queue | Celery + Redis (optional for prototype) | Long-running OCR + LLM jobs |
| DB | PostgreSQL 15 + `pgvector` | Structured + vector in one store |
| Search | Elasticsearch 8.x with Indic analyzers | Already team-familiar; clause search |
| OCR (primary) | PaddleOCR with Indic weights | Best free Indic OCR coverage |
| OCR (fallback) | Tesseract 5 with Indic language packs | Stable, broad language support |
| OCR (premium) | AWS Textract (only for tabular financials) | Best at column-aware extraction |
| Translation | AI4Bharat IndicTrans2 | Open-weights, 22 Indian languages |
| Embeddings | BGE-M3 (multilingual) | Single model handles EN + Indic |
| VLM | Claude 3.5 Sonnet via API (cloud); Qwen2.5-VL-7B (on-prem stretch) | Vision for scanned/photo evidence |
| Text LLM | Claude Sonnet 4.6 via API; Llama 3.3-70B for on-prem stretch | Structured extraction, criterion matching |
| Frontend | Next.js 14 + shadcn/ui + Tailwind + PDF.js | Standard stack; PDF.js for inline highlighting |
| Deploy | Docker Compose (demo); Kubernetes (production stretch) | One-command demo for judges |

For the prototype, prefer the cloud LLM/VLM path. The on-prem path is a slide in the deck, not a working binary.

## Folder layout (target — most of these don't exist yet)

```
TenderSaarthi/
├── .claude/                  # Claude Code config + slash commands
├── backend/                  # FastAPI app
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, security, db session
│   │   ├── models/           # SQLAlchemy + Pydantic
│   │   ├── services/
│   │   │   ├── tender/       # Criterion extraction
│   │   │   ├── bidder/       # Document parsing, OCR
│   │   │   ├── matching/     # Evidence-to-criterion engine
│   │   │   ├── verdict/      # Verdict generation, confidence floors
│   │   │   └── audit/        # PDF report, replay logs
│   │   └── workers/          # Celery tasks
│   └── tests/
├── frontend/                 # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
├── data/
│   ├── samples/              # Synthetic tender + bidder docs for demo
│   └── ground_truth/         # Hand-labelled ground truth for accuracy claims
├── docs/                     # Architecture, tech stack, demo script, rubric
├── infra/                    # Docker compose, env files, init SQL
├── CLAUDE.md                 # This file
├── README.md                 # Public-facing
├── IDEA.md                   # Vision document
├── TODOS.md                  # Prototype phase checklist
└── PROTOTYPE_PLAN.md         # 4-week build plan
```

## Domain glossary (use these terms consistently in code and prompts)

- **Tender** — the procuring department's document specifying goods/services + eligibility rules.
- **Criterion** — a single eligibility rule extracted from the tender. Has `category` (technical/financial/compliance/document), `is_mandatory` (bool), `threshold` (typed value), `description` (verbatim clause).
- **Bidder** — a private firm submitting a response to the tender.
- **Submission** — the bundle of documents a single bidder uploads.
- **Evidence** — a structured value extracted from a bidder document, with provenance (`document_id`, `page`, `bbox`, `extracted_value`, `ocr_confidence`, `extraction_confidence`).
- **Verdict** — per-bidder, per-criterion outcome: `ELIGIBLE` | `NOT_ELIGIBLE` | `NEEDS_MANUAL_REVIEW`. Always carries `reason`, `evidence_ref`, `model_version`, `replay_id`.
- **Criterion-review gate** — mandatory human checkpoint *after* criterion extraction, *before* any bidder is scored. Catches LLM extraction errors before they propagate.
- **Confidence floor** — per-modality threshold below which a piece of evidence cannot drive a `NOT_ELIGIBLE` verdict. Forces `NEEDS_MANUAL_REVIEW` instead.

## Coding conventions

- **Python:** PEP 8, type hints everywhere, no single-letter variables (per the user's standing preference), Black formatter, Ruff for lint, Pydantic v2 for all data shapes that cross a boundary (HTTP, DB, LLM I/O).
- **API design:** RESTful where it fits, JSON only, every response wrapped in `{ data, meta }`. Error responses follow RFC 7807.
- **LLM calls:** always go through `services/llm_client.py`. Always use Pydantic structured output (Anthropic's `tool_use` or OpenAI's `response_format`). Never parse free-form LLM text in production code paths.
- **OCR calls:** always go through `services/ocr_router.py`. The router picks engine based on document type and falls back on confidence.
- **Logging:** structured JSON via `structlog`. Every LLM call, OCR call, and verdict logs to the `replay_log` table with the same `replay_id`.
- **Tests:** pytest, fixtures for synthetic tenders/bidders, target 70%+ coverage on `services/` (don't waste time on routes).

## Common workflows

### Adding a new criterion category
1. Update `CriterionCategory` enum in `backend/app/models/criterion.py`.
2. Add extraction prompt in `services/tender/prompts/`.
3. Add matching logic in `services/matching/` if the category needs special handling.
4. Add a test fixture in `tests/fixtures/criteria/`.
5. Update `docs/ARCHITECTURE.md` glossary.

### Adding a new Indian language
1. Confirm PaddleOCR + Tesseract both have weights for it; if not, document the gap.
2. Add the language code to `services/bidder/language_detector.py`.
3. Add IndicTrans2 routing in `services/bidder/translator.py`.
4. Add a 2–3 page synthetic bidder doc in that language to `data/samples/`.
5. Run the end-to-end test on the new sample.

### Generating the audit PDF
- Use `services/audit/report_builder.py`. Never hand-build PDFs in route handlers.
- The report MUST include: tender ID, every criterion (mandatory + optional), every bidder × criterion verdict, the evidence citation for each, the reviewer who approved (if applicable), the model versions used, and a SHA-256 of the report content for tamper detection.

## What to ask the user before doing

- Anything that touches the demo data plan or the synthetic tender content.
- Adding a new third-party API key.
- Changing the verdict enum or the `Evidence` shape (these ripple through the audit report).
- Anything that would weaken the three non-negotiables above.

## What NOT to do

- Don't add Tesseract for languages PaddleOCR already covers — keeps the OCR router simple.
- Don't hand-roll PDF generation. Use ReportLab via `services/audit/`.
- Don't add a second vector store. `pgvector` is the only one.
- Don't ship features that aren't on `TODOS.md` for the current week.
- Don't introduce dependencies that aren't free / open-weights for the on-prem story (one of our differentiators is data-residency).

## Hackathon context (so Claude Code makes the right trade-offs)

- This is a **prototype**, not a production system. Demo quality > test coverage. A clean 5-minute walkthrough beats an unshipped perfect feature.
- Judges are CRPF/IAS officers + AI/ML technical mentors + VCs. The deck and demo must work on all three frequencies.
- Submission deliverables (Round 2): video link, PPT, source code, run instructions. See `docs/SUBMISSION_CHECKLIST.md`.
- Top 50 of ~600 advance to Grand Finale at Taj Yeshwantpur.

## Pointers

- Vision and "why" → `IDEA.md`
- System architecture → `docs/ARCHITECTURE.md`
- 4-week build plan → `PROTOTYPE_PLAN.md`
- Live work tracker → `TODOS.md`
- Demo flow → `docs/DEMO_SCRIPT.md`
- Judging rubric mapping → `docs/EVALUATION_RUBRIC.md`
- Final deliverables → `docs/SUBMISSION_CHECKLIST.md`
