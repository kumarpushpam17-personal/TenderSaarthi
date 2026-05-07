---
description: Build or improve the criterion-to-evidence matching engine (rule + semantic + span validation)
---

# /match-evidence

You are working on `backend/app/services/matching/`. The matching engine takes approved criteria and extracted evidence and produces a verdict per (bidder, criterion) pair.

## Before you write code

1. Read `CLAUDE.md` for the three non-negotiables — especially "never silently disqualify".
2. Read `docs/ARCHITECTURE.md` section "Matching Engine" for the precedence rules.
3. Read `docs/PROTOTYPE_PLAN.md` Week 3 for the matching precedence and the confidence floor table.

## Three matchers, run in this order

### 1. Rule Matcher (`rule_matcher.py`)
For criteria with typed thresholds, do a direct comparison.
- `min_amount_inr`: `evidence.value >= threshold.value` → match
- `min_count`: same
- `must_exist`: `evidence.value is not None` → match
- `valid_on_date`: `evidence.expiry_date >= threshold.value` → match
Return `RuleMatchResult(matched: bool, threshold: ..., evidence_value: ..., reason: str)`.

### 2. Semantic Matcher (`semantic_matcher.py`)
For clause-language variation. Embed the criterion description and the evidence raw_span with BGE-M3, compute cosine similarity.
- Threshold per category:
  - `COMPLIANCE`: 0.78
  - `CERTIFICATION`: 0.85
  - `TECHNICAL`: 0.75
  - `DOCUMENT`: 0.80
  - `FINANCIAL`: defer to rule matcher (semantic match isn't appropriate for thresholds)

### 3. Span Validator (`span_validator.py`)
Re-read the original document span and confirm the extracted value is actually present.
- For numeric values: regex-search for the value in `raw_span` (with locale-aware formatting — Indian numbering, "₹7.5 crore" vs "75,000,000").
- For date values: parse and confirm the date is in the span.
- For existence checks: confirm the criterion's named entity is in the span.
- Returns `SpanValidationResult(valid: bool, reason: str)`.

## Composing into a verdict

`engine.py` runs the matchers and produces a verdict via `services/verdict/generator.py`. The combination logic:

```
floor_breach = (
    evidence.ocr_confidence < FLOOR[category]['ocr']
    or evidence.extraction_confidence < FLOOR[category]['extraction']
    or (evidence.translation_confidence is not None
        and evidence.translation_confidence < FLOOR[category]['translation'])
)

if floor_breach:
    verdict = NEEDS_MANUAL_REVIEW
    reason = f"below_confidence_floor: {which_one}"
elif rule_match.matched and span_valid:
    verdict = ELIGIBLE
elif (not rule_match.matched) and span_valid:
    verdict = NOT_ELIGIBLE
    reason = rule_match.reason
elif rule_match.matched and (not span_valid):
    verdict = NEEDS_MANUAL_REVIEW
    reason = "span_validation_failed"
else:
    verdict = NEEDS_MANUAL_REVIEW
    reason = "ambiguous"
```

## Hard rules

- **Never default to `NOT_ELIGIBLE` on partial information.** Default is `NEEDS_MANUAL_REVIEW`.
- **Span validation runs even when rule_match is True.** This catches LLM hallucination on the value side.
- **Confidence floors are per-modality and per-category.** Tune empirically against ground truth in `data/ground_truth/`.

## When done

- Run `pytest tests/services/matching/` — test cases must include: clean eligible, clean ineligible, low-confidence (forces review), span-mismatch (forces review), semantic-only match.
- Add a test case for the dedicated edge case: bidder has the right value but span validation fails because the LLM grabbed the wrong line.
- Document any new confidence floor in `docs/ARCHITECTURE.md`.
