---
description: Build or improve the signed, replayable audit PDF report
---

# /build-audit-pdf

You are working on `backend/app/services/audit/report_builder.py`. This service produces the signed audit PDF — the document that goes into the formal procurement file and defends the decision under RTI / CAT / audit review.

## Before you write code

1. Read `CLAUDE.md` for the third non-negotiable: "Replayability".
2. Read `docs/ARCHITECTURE.md` section "Audit PDF Builder".
3. Read `IDEA.md` Stage 5 for what the report must contain.

## Required contents (in order)

1. **Cover page** — TenderSaarthi logo, tender title, procuring department, tender ID, generation date.
2. **Tender summary** — verbatim tender description (top 500 words), uploaded date, source PDF SHA-256.
3. **Criterion list** — every criterion (mandatory then optional), with category, description, threshold.
4. **Bidder roster** — every bidder, legal name, document count, upload date.
5. **Verdict matrix** — bidders × criteria, color-coded (green/red/amber) with the verdict in each cell.
6. **Per-bidder detail page** — for each bidder:
   - Each criterion + verdict + extracted value + source citation (doc, page, bbox)
   - Reviewer action if any (approved / overridden / pending)
   - Confidence scores for each piece of evidence
7. **Audit metadata** — model versions used, prompt template hashes, OCR engines used, replay_id.
8. **Signatures** — reviewer name, role, signed-at timestamp. Leave blank lines for physical sign-off if the digital flow isn't enabled.
9. **Tamper hash** — SHA-256 of all report contents (excluding the hash line itself), printed on the last page.

## Hard rules

- **Use ReportLab**, not WeasyPrint or any HTML-to-PDF service. Determinism is required.
- **The hash line must be reproducible.** Generating the report twice with the same DB state produces the same hash.
- **The replay_id must be cited.** Without it, the report is not auditable.
- **Original-language text must be cited where applicable.** If a verdict was driven by a Hindi document, the original Hindi span goes in the report alongside the translation. Both, not one.
- **Page numbers and bounding boxes are required citations.** No prose-only references to "the bidder's GST certificate" — always "GST certificate, page 2, bbox [120,450,380,478]".

## Determinism checklist

- Pin font versions (bundle in `assets/fonts/`).
- Avoid time-dependent strings except in one explicit "generated_at" header.
- Sort lists deterministically (criteria by `(is_mandatory desc, category, id)`, bidders by `(legal_name, id)`).
- Use ISO 8601 timestamps everywhere.
- Don't use random colors or jittered layout — every cell is predictable.

## When done

- Run `pytest tests/services/audit/` including a test that generates the same report twice and asserts the hashes match.
- Generate a sample report from the demo data and `sha256sum` it from the terminal — confirm it matches the printed hash.
- Update `docs/SUBMISSION_CHECKLIST.md` if any new fields were added.
