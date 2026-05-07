---
description: Build or improve the bidder document parsing pipeline (OCR router, language detection, evidence extraction)
---

# /parse-bidder

You are working on the bidder submission and document pipeline in `backend/app/services/bidder/`. This pipeline starts when a bidder submits firm details and documents against one tender, then produces typed `Evidence` records with full provenance.

## Before you write code

1. Read `CLAUDE.md` for project conventions.
2. Read `docs/ARCHITECTURE.md` sections "Bidder Pipeline" and the OCR routing decision tree.
3. Read `docs/TECH_STACK.md` for why we chose PaddleOCR / Tesseract / VLM / Textract.

## Workspace boundary

- Bidder-facing routes live under `/bidder/...` in the frontend and `/api/v1/public/...` or `/api/v1/submissions/...` in the API.
- Admin/reviewer routes live under `/tenders/...` or `/admin/...`.
- A bidder can only see public tender metadata and their own submission status.
- A bidder must never see other bidders, verdict matrices, reviewer actions, internal criteria edits, model outputs, or audit reports.
- The mock admin-side `/tenders/{id}/bidders` upload flow is a prototype shortcut only. Do not use it as the target product model.

## Pipeline stages (in order)

1. **Submission Intake** — create or load a `Submission` for `(tender_id, bidder_id)`, validate it is attached to an approved tender, and store uploaded documents.
2. **Document Type Classifier** (`document_classifier.py`) — file extension + magic bytes + text-layer presence → one of `TYPED_PDF` / `SCANNED_PDF` / `IMAGE` / `DOCX`.
3. **Language Detector** (`language_detector.py`) — page-level. langdetect + script heuristic for Indic.
4. **OCR Router** (`ocr_router.py`) — picks engine per the decision tree:
   - `TYPED_PDF` → PyMuPDF
   - `DOCX` → python-docx
   - Indic + reasonable quality → PaddleOCR
   - PaddleOCR confidence < 0.85 OR `IMAGE` (photograph) → Claude Sonnet vision
   - Indic without PaddleOCR weights → Tesseract
   - Tabular financial → AWS Textract (only if document is detected as a financial statement)
5. **Translator** (`translator.py`) — IndicTrans2 for non-English text. Always preserve original alongside translation.
6. **Evidence Extractor** (`evidence_extractor.py`) — Claude Sonnet structured output, per criterion category.

## Evidence shape (Pydantic)

```python
class Evidence(BaseModel):
    submission_id: UUID
    bidder_id: UUID
    criterion_id: UUID
    document_id: UUID
    page: int
    bbox: tuple[float, float, float, float] | None
    extracted_value: dict  # typed per category
    raw_span: str
    raw_span_language: str
    translated_span: str | None
    ocr_confidence: float
    extraction_confidence: float
    translation_confidence: float | None
```

## Hard rules

- **Always record OCR + extraction + translation confidence.** No exceptions. The verdict generator depends on these.
- **Always preserve the original-language text.** The translation is for review; the original is the legal record.
- **Never bypass the OCR router.** Even for "obvious" cases. The router exists so the choice is auditable.
- **Never parse documents unattached to a submission.** Every document must belong to a `Submission`, which belongs to exactly one tender and one bidder.
- **Page number and bbox must be present** when the source is a PDF or image. If they cannot be determined, log a warning and set bbox to `null` — the verdict generator treats null bbox as a partial-evidence case.

## Common pitfalls

- Don't use `pytesseract` when PaddleOCR works for the language — keeps the OCR router decision tree clean.
- Don't call the vision LLM on every page — only when PaddleOCR confidence is below the floor, or the document type is `IMAGE` (photograph). Otherwise costs blow up.
- Don't translate everything to English silently. Original-language text must be in the database row.

## When done

- Run the smoke test: `pytest tests/services/bidder/test_pipeline_smoke.py`.
- Verify bidder route smoke: bidder submits through `/bidder/tenders/{id}/submit`, admin sees it under `/tenders/{id}/submissions`.
- Verify a sample evidence row in the DB has all confidence fields populated.
- Update `CLAUDE.md` if you added support for a new language (also: add a sample doc to `data/samples/`).
