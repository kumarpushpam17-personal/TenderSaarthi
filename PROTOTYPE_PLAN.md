# PROTOTYPE_PLAN.md — TenderSaarthi 4-Week Build Plan

> Strategic week-by-week plan. The granular checklist lives in `TODOS.md`. Read this for context, edit `TODOS.md` for execution.

## Operating principles

1. **Demo > tests > polish.** A judge spends 5 minutes with us. Make those 5 minutes flawless.
2. **One thing per week ships end-to-end.** No half-built features straddling weeks.
3. **Friday = no new work.** Friday is for demo recording, doc updates, and clean-up. New scope starts Monday.
4. **Cut, don't ship sloppy.** If a stretch item is at risk of breaking the demo, drop it.
5. **The three differentiators are non-negotiable.** Criterion-review gate, confidence floors, and replayability ship even if a "nice" feature doesn't.

## Week 1 — Foundation + Tender Understanding

**Outcome:** Upload a CRPF-style tender, see structured criteria appear, edit them at the criterion-review gate, lock the criterion set.

**What we are proving to a judge:** that the tender side of the pipeline is solid, structured, and human-supervised — *before* we touch a bidder.

**Risks this week:**
- LLM extracts criteria inconsistently → mitigate by using Pydantic structured output (Anthropic `tool_use`) and a tight prompt schema.
- Tender PDFs vary in structure → start with one canonical CRPF format; expand format coverage in Week 2 if time permits.

**Definition of done for Week 1:**
- One end-to-end demo: upload → 8–12 criteria appear → edit one → approve → status flips to `CRITERIA_APPROVED`.
- 60-second screencast saved.

## Week 2 — Bidder Pipeline (Multiformat + Multilingual)

**Outcome:** Upload a bidder bundle (typed PDF + scan + photo + Word + Hindi/Kannada documents), see every page parsed with provenance and confidence scores attached.

**What we are proving:** that we can actually handle the document chaos that real procurement evaluators face — not just the clean-PDF case every demo shows.

**The OCR routing decision tree:**
1. If the document is a typed PDF (text layer present) → PyMuPDF, no OCR needed.
2. If the document is a scanned PDF or image, language is in PaddleOCR's Indic set, and quality is reasonable → PaddleOCR.
3. If PaddleOCR confidence < 0.85 OR the document is a photograph (skewed, lit unevenly) → Claude Sonnet vision with a structured-output prompt.
4. If the language is Indic but PaddleOCR doesn't have weights for it → Tesseract.
5. If it's a financial table → AWS Textract (only path to good column-aware extraction).

**Risks this week:**
- IndicTrans2 setup pain → fall back to AI4Bharat's hosted endpoint if local inference is slow to set up; document the fallback.
- Synthetic bidder documents look fake → spend an afternoon reading real (public) tender responses on GeM and mirror the formatting.

**Definition of done for Week 2:**
- All 10 synthetic bidders have evidence rows in the database after upload.
- Confidence scores are visible per piece of evidence.
- Original-language and translated text are both stored.

## Week 3 — Matching, Verdicts, Reviewer UI

**Outcome:** Click "Evaluate", see a bidder × criterion verdict matrix in under 2 minutes; click any cell, jump to the highlighted bbox in the source document.

**What we are proving:** that the matching engine is hybrid (rule + semantic + span validation), the verdict is explainable end-to-end, and the reviewer UI makes a 20-second decision possible per criterion.

**The matching precedence:**
1. **Rule-based first.** If a criterion has a numeric threshold and a typed evidence value exists, the rule decides. No semantic ambiguity.
2. **Semantic second.** For clause-language variation ("annual sales" vs "annual turnover"), BGE-M3 embeddings + cosine similarity > 0.78 = match.
3. **Span validation last.** Re-read the original document span and confirm the LLM's claimed value is actually in the text. Catches hallucination at the verdict layer.

**The confidence-floor table:**
| Source modality | Floor | Below floor → |
|---|---|---|
| Typed PDF | 0.95 | `NEEDS_MANUAL_REVIEW` |
| PaddleOCR (printed) | 0.85 | `NEEDS_MANUAL_REVIEW` |
| Tesseract | 0.80 | `NEEDS_MANUAL_REVIEW` |
| VLM on photograph | 0.80 | `NEEDS_MANUAL_REVIEW` |
| Translated (non-original lang) | 0.75 | `NEEDS_MANUAL_REVIEW` |

(These numbers are starting points — tune empirically against ground truth.)

**Risks this week:**
- BGE-M3 setup time → use sentence-transformers with the BGE-M3 checkpoint; CPU-only is fine for prototype scale.
- Reviewer UI gets fancy → resist. The bbox highlight + language toggle + approve/override is the whole MVP.

**Definition of done for Week 3:**
- Verdict matrix renders for the demo tender × 10 bidders in under 2 minutes.
- Clicking a `NOT_ELIGIBLE` cell loads the source PDF with the correct page and bounding box highlighted.
- Override action writes to `reviewer_actions` and the verdict updates.

## Week 4 — Audit, Polish, Demo, Submission

**Outcome:** End-to-end demo runs cleanly. Video, deck, code, and run instructions are submitted on HackerEarth.

**What we are proving:** that this is a real submission, not a prototype that only works on the developer's laptop.

**Audit PDF must include:**
- Tender ID, title, procuring department.
- Every criterion (mandatory + optional), verbatim from the tender.
- Bidder × criterion verdict table.
- For every cell: evidence citation (doc, page, bbox), value, confidence.
- Reviewer name, action, and timestamp for every approval/override.
- Model versions used (LLM model + prompt template hash + OCR engine).
- A SHA-256 hash of the report content, printed on the last page.
- The `replay_id` so the entire evaluation can be re-run later.

**Demo flow (5 min, scripted):**
1. (0:00–0:30) Frame the problem with one slide-equivalent intro.
2. (0:30–1:30) Upload tender, watch criteria appear, approve at the gate.
3. (1:30–3:00) Trigger evaluation, watch the verdict matrix populate.
4. (3:00–4:00) Click a `NOT_ELIGIBLE` cell, jump to bbox, override one verdict, language-toggle one Hindi document.
5. (4:00–5:00) Export the audit PDF, show the SHA-256 hash, hit "Replay" and show identical output. Close on the three differentiators.

Full script in `docs/DEMO_SCRIPT.md`.

**Risks this week:**
- Demo runs slow (LLM latency) → cache demo extractions; record against cache.
- Last-minute regression → freeze code on Wednesday; only doc + video edits Thursday/Friday.
- Submission portal flake → submit early, never on the last day.

**Definition of done for Week 4 (and the prototype phase):**
- All four submission deliverables uploaded on HackerEarth.
- The submission is visible in the dashboard.
- A teammate has independently cloned the repo and run `docker compose up` successfully.

## Cut list (drop these in this order if behind schedule)

1. AWS Textract integration — replace with PaddleOCR table mode.
2. Replay diff view — replay just re-runs and confirms identical hash.
3. Compare-bidders view — single-bidder verdict view is enough.
4. Reviewer override audit log UI — DB record alone is enough for the demo.
5. ISO 9001 certification expiry parsing — use the simple "exists Y/N" check.

Never cut: criterion-review gate, confidence floors, signed audit PDF, the three differentiators in the deck.
