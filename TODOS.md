# TODOS — TenderSaarthi Prototype Phase

> Live tracker. Update as you go. Anything not on this list is out of scope for Round 2.
> Format: `- [ ]` for open, `- [x]` for done, `- [~]` for in progress, `- [!]` for blocked.

---

## Submission deliverables (the only things judges actually see)

These are the four prototype-phase deliverables. Everything else is infrastructure for these.

- [ ] **Source code** — public GitHub repo with one-command Docker bootstrap
- [ ] **Run instructions** — README "Quick start" that works on a clean laptop
- [ ] **Demo video** — 5 minutes max, screen-recorded walkthrough of the full pipeline
- [ ] **Presentation (PPT)** — judge-facing deck (problem → solution → demo → architecture → impact)

Do not ship anything that does not move at least one of the four bullets above forward.

---

## Week 1 — Foundation + Tender Understanding

**Goal:** Upload a tender PDF, see structured criteria appear, edit them at the criterion-review gate.

### Repo + infra
- [ ] Initialise repo, add `.gitignore`, `LICENSE` (MIT), branch protection
- [ ] `infra/docker-compose.yml` — Postgres + Redis + Elasticsearch + backend + frontend
- [ ] `infra/.env.example` with every env var documented
- [ ] `backend/pyproject.toml` with FastAPI, Pydantic v2, SQLAlchemy 2, Celery, anthropic SDK, paddleocr, pytesseract, PyPDF2, pdf2image, structlog, ruff, black, pytest
- [ ] FastAPI skeleton with `/health` and `/version` routes
- [ ] Postgres init SQL + Alembic migration for the tables in `docs/ARCHITECTURE.md`
- [ ] Structured JSON logging (structlog) wired in

### Tender ingestion
- [ ] `POST /api/v1/tenders` — accept PDF upload, store in object storage (S3-compatible: MinIO for local)
- [ ] `services/tender/parser.py` — extract text from typed PDF (PyMuPDF) and from scanned PDF (PaddleOCR fallback)
- [ ] `services/tender/criterion_extractor.py` — Claude Sonnet structured output → list of `Criterion` records
- [ ] Prompt template in `services/tender/prompts/extract_criteria.md` — covers technical/financial/compliance/document/certification, mandatory vs optional
- [ ] Save extracted criteria to `criteria` table with `tender_id` FK
- [ ] `GET /api/v1/tenders/{id}/criteria` — return criteria for review

### Criterion-review gate (the differentiator — do not skip)
- [ ] Frontend page `/tenders/[id]/review-criteria` — table of extracted criteria with edit/delete/add
- [ ] `PATCH /api/v1/tenders/{id}/criteria/{criterion_id}` — edit a criterion
- [ ] `POST /api/v1/tenders/{id}/criteria/approve` — lock the criterion set, set `tender.status = 'CRITERIA_APPROVED'`
- [ ] Until status is `CRITERIA_APPROVED`, no bidder evaluation can run (enforce in matching service)

### Sample data + smoke test
- [ ] Write 1 synthetic CRPF construction tender (₹5cr turnover, 3 similar projects, GST, ISO 9001) — save to `data/samples/tenders/crpf_construction_v1.pdf`
- [ ] End-to-end test: upload → criteria extracted → reviewer approves
- [ ] Demo recording (rough draft, 1 min) — proves Week 1 works

---

## Week 2 — Bidder Pipeline (Multiformat + Multilingual)

**Goal:** Upload a bidder's bundle, see every document parsed with provenance, regardless of format or language.

### Bidder ingestion
- [ ] `POST /api/v1/tenders/{id}/bidders` — create bidder, return bidder ID
- [ ] `POST /api/v1/bidders/{id}/documents` — multipart upload, multiple files
- [ ] Per document: detect type (typed PDF / scanned PDF / image / docx)
- [ ] Save to object storage with deduplication (SHA-256 keyed)

### Language detection + OCR router
- [ ] `services/bidder/language_detector.py` — page-level language detection (langdetect + script heuristic for Indic)
- [ ] `services/bidder/ocr_router.py` — pick PaddleOCR / Tesseract / VLM based on doc type + language
- [ ] PaddleOCR with Indic weights wired in (English, Hindi, Kannada minimum)
- [ ] Tesseract fallback for languages PaddleOCR misses
- [ ] Vision LLM (Claude Sonnet) for low-confidence pages or photographs of certificates
- [ ] Confidence score recorded for every OCR'd page

### Translation
- [ ] `services/bidder/translator.py` — IndicTrans2 wrapper (use AI4Bharat hosted endpoint or local checkpoint)
- [ ] Always preserve original-language text alongside translation
- [ ] Per-language confidence floor in `services/bidder/config.py`

### Evidence extraction
- [ ] `services/bidder/evidence_extractor.py` — Claude Sonnet structured output, per criterion category
- [ ] Output shape: `{ value, type, source_doc, page, bbox, ocr_confidence, extraction_confidence, raw_span, translated_span }`
- [ ] Save to `evidence` table with FK to bidder + criterion

### Sample data
- [ ] 10 synthetic bidders covering edge cases:
  - [ ] Bidder 1: clean, all criteria met, English, typed PDFs
  - [ ] Bidder 2: clean, all criteria met, Hindi documents
  - [ ] Bidder 3: clean, all criteria met, Kannada GST cert
  - [ ] Bidder 4: turnover too low (clear `NOT_ELIGIBLE`)
  - [ ] Bidder 5: ISO certification expired (clear `NOT_ELIGIBLE`)
  - [ ] Bidder 6: only 2 similar projects (clear `NOT_ELIGIBLE`)
  - [ ] Bidder 7: blurry scanned turnover certificate (`NEEDS_MANUAL_REVIEW`)
  - [ ] Bidder 8: photograph of physical GST cert at angle (`NEEDS_MANUAL_REVIEW`)
  - [ ] Bidder 9: GST in Hindi, format variation, but valid
  - [ ] Bidder 10: clean, all criteria met, mixed-language bundle
- [ ] Smoke test: upload bidder 1's documents, confirm evidence extracted

---

## Week 3 — Matching, Verdicts, Reviewer UI

**Goal:** Click "Evaluate", get a verdict table; click any verdict, jump to the bounding box.

### Matching engine
- [ ] `services/matching/rule_matcher.py` — hard threshold checks (turnover ≥ X, projects ≥ N, cert valid on date Y)
- [ ] `services/matching/semantic_matcher.py` — BGE-M3 embeddings; cosine match between criterion clause and evidence span; threshold tuned per category
- [ ] `services/matching/span_validator.py` — re-read original document span, confirm the claimed value is actually there (catches LLM hallucination)
- [ ] Wire all three into `services/matching/engine.py` with a clear precedence order

### Verdict generation
- [ ] `services/verdict/generator.py` — combines matching output + confidence floors
- [ ] Confidence floor logic: if `min(ocr_confidence, extraction_confidence) < threshold[category]` → `NEEDS_MANUAL_REVIEW`, regardless of value
- [ ] Verdict shape: `{ verdict, reason, evidence_ref, model_version, prompt_hash, replay_id, created_at }`
- [ ] `POST /api/v1/tenders/{id}/evaluate` — kick off Celery job, return job ID
- [ ] `GET /api/v1/tenders/{id}/verdicts` — return the bidder × criterion verdict matrix

### Reviewer UI
- [ ] Verdict matrix page `/tenders/[id]/verdicts` — bidders down, criteria across, color-coded cells
- [ ] Click a cell → side panel with: criterion text, extracted evidence, confidence, source doc reference
- [ ] PDF.js viewer with bounding box highlighted on the right pane
- [ ] Language toggle (original ↔ translated) on the side panel
- [ ] Approve / Override buttons; override requires a typed reason
- [ ] Reviewer actions logged to `reviewer_actions` table with user, timestamp, before/after values

### Replay + audit log
- [ ] Every LLM call logged to `replay_log` with input hash, output, model + version, prompt hash, timestamp
- [ ] `POST /api/v1/tenders/{id}/replay` — re-run evaluation, diff against previous result

---

## Week 4 — Audit Report, Polish, Demo, Submission

**Goal:** End-to-end demo runs cleanly; deliverables uploaded.

### Signed audit PDF
- [ ] `services/audit/report_builder.py` — ReportLab-based PDF generation
- [ ] Report contents: tender summary, criterion list, bidder × criterion verdict table, evidence citations, reviewer sign-offs, model versions, replay IDs
- [ ] SHA-256 content hash printed on the last page + saved to DB
- [ ] `GET /api/v1/tenders/{id}/report.pdf` — download endpoint
- [ ] Verify hash check works: external `sha256sum` matches the printed hash

### Polish
- [ ] Loading states + error boundaries on every async page in the frontend
- [ ] Empty-state copy on every page (no crashes on fresh tenant)
- [ ] Basic auth (single admin user for the demo — JWT cookie, no need for full RBAC at prototype)
- [ ] One-command `make demo` that loads the bundled tender + 10 bidders and prints a URL

### Submission deliverables
- [ ] **Demo video (5 min):**
  - [ ] Script written (`docs/DEMO_SCRIPT.md`)
  - [ ] Recording done (Loom or OBS, 1080p)
  - [ ] Uploaded to YouTube (unlisted) — link in submission form
- [ ] **PPT:**
  - [ ] 12–15 slides max
  - [ ] Slides: Title / Problem / Solution / Architecture / Demo / Differentiators (3) / Tech Stack / Risks / Roadmap / Team / Q&A
  - [ ] Saved as both .pptx and .pdf
- [ ] **Source code:**
  - [ ] All commits pushed to public GitHub
  - [ ] README "Quick start" tested on a clean machine
  - [ ] `.env.example` covers every needed key
  - [ ] No real API keys in git history (run `git secrets` or `truffleHog`)
- [ ] **Run instructions:**
  - [ ] `docker compose up` works in one shot
  - [ ] Sample data bootstrap script verified
  - [ ] Health check at `http://localhost:8000/health` returns 200

### Day-of-submission checklist (do this hour-by-hour)
- [ ] T-4h: Final smoke test on a clean clone
- [ ] T-3h: Re-record video if anything looks broken
- [ ] T-2h: PPT export to PDF, both files attached
- [ ] T-1h: Submit on HackerEarth — copy submission URL to a backup doc
- [ ] T-30m: Confirm submission visible in dashboard
- [ ] T-0: Take a deep breath

---

## Stretch (only if Week 1–4 above are fully done)

- [ ] On-prem mode toggle (swap Claude API → Llama 3.3-70B / Qwen 2.5; OCR stays local)
- [ ] Per-criterion explanation export to JSON (machine-readable audit feed)
- [ ] Compare-bidders view (side-by-side three bidders on the same criterion)
- [ ] Criterion library — save approved criterion sets as templates for reuse across tenders
- [ ] Telegram / email alerts when a tender finishes evaluation

---

## Risk register (review weekly)

| Risk | Mitigation | Owner |
|---|---|---|
| LLM hallucinates a criterion threshold | Criterion-review gate catches it before scoring | Backend |
| Indic OCR confidence too low to use | Confidence floor → `NEEDS_MANUAL_REVIEW`, never auto-reject | Backend |
| Demo crashes live | Pre-recorded video as fallback; Docker images pre-built and pushed | All |
| Anthropic API rate limits during demo | Cache extraction results; record demo against cache | Backend |
| Synthetic bidder data looks fake | Use real GFR/CVC clause language; have a domain-aware teammate review | All |
| Team member bandwidth | Stretch items are stretch — never trade against Week 1–4 | Lead |

---

## Definition of done (for any task above)

A task is done when:
1. The code is merged to `main`.
2. There is at least one test (unit or integration) covering the happy path.
3. The README or relevant doc is updated if a new env var, command, or endpoint was added.
4. It works in `docker compose up` on a clean clone.
