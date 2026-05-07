---
description: Build or improve the tender criterion extraction service
---

# /extract-criteria

You are working on `backend/app/services/tender/criterion_extractor.py`. This service takes a parsed tender document and produces a typed list of `Criterion` records using Claude Sonnet with Pydantic structured output.

## Before you write code

1. Read `CLAUDE.md` for project conventions and the three non-negotiables.
2. Read `docs/ARCHITECTURE.md` section "Criterion Extractor" — the contract is defined there.
3. Read `IDEA.md` to ensure you don't drift from the criterion-review-gate philosophy.

## What this service must do

- Accept parsed tender text (list of `(page_number, text)` tuples).
- Chunk the tender into ~3000-token windows with 200-token overlap.
- Call Claude Sonnet 4.6 with `tool_use` structured output, asking for a list of criteria per chunk.
- Each criterion has these required fields (Pydantic model):
  - `category`: `TECHNICAL` | `FINANCIAL` | `COMPLIANCE` | `DOCUMENT` | `CERTIFICATION`
  - `description`: verbatim clause from the tender
  - `is_mandatory`: bool, inferred from language ("shall"/"must"/"essential" vs "may"/"preferred")
  - `threshold`: typed object — `{"type": "min_amount_inr", "value": int}` for financials, `{"type": "min_count", "value": int}` for counts, `{"type": "must_exist", "value": bool}` for presence checks, `{"type": "valid_on_date", "value": "YYYY-MM-DD"}` for cert validity
  - `source_page`: int
  - `source_bbox`: `[x0, y0, x1, y1]` if available
- Deduplicate across chunks using BGE-M3 cosine similarity > 0.92.
- Persist to the `criteria` table with the BGE-M3 embedding stored in `embedding`.

## Output checks before commit

- Pydantic models have `Field(...)` descriptions on every field.
- The prompt template lives in `services/tender/prompts/extract_criteria.md`, not inline in the Python file.
- The Anthropic call uses `tool_use` (not free-text JSON parsing).
- A unit test in `tests/services/tender/test_criterion_extractor.py` covers: empty tender, all-mandatory tender, mixed mandatory/optional, and a dedup case.
- Structured logging records: tender_id, model_version, prompt_hash, input_token_count, criteria_extracted_count.

## Hard rules

- Never invent a threshold not present in the source. If unsure, set `threshold: null` and let the criterion-review gate handle it.
- Always preserve `description` verbatim — that is the audit-ready text.
- Never hand-build prompts in code. They live in `services/tender/prompts/`.

## When done

- Update `CLAUDE.md` "Common workflows" if you added a new criterion category or threshold type.
- Commit with message format: `feat(tender): <what changed>`.
