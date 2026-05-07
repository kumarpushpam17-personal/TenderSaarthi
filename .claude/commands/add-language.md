---
description: Add support for a new Indian language to the bidder pipeline
---

# /add-language

You are adding support for a new Indian language to TenderSaarthi. The pipeline is designed to be extensible across the 22 Indian languages. This is the canonical workflow.

## Before you start

1. Confirm the user wants this language: ask which one and what the use case is.
2. Read `CLAUDE.md` "Common workflows → Adding a new Indian language".
3. Read `docs/TECH_STACK.md` "Translation" section.

## Steps

### 1. Capability check
For the requested language:
- [ ] Does **PaddleOCR** have weights? Check the PaddleOCR model zoo (multilingual section). If yes, note the model name.
- [ ] Does **Tesseract** have a language pack? Check `tesseract --list-langs` after `apt install tesseract-ocr-<lang>`. Note the lang code.
- [ ] Does **IndicTrans2** support it? Check the AI4Bharat HuggingFace model card. Note the language code.
- [ ] Does **BGE-M3** handle it? It supports 100+ languages including most Indic — usually yes.

If PaddleOCR doesn't have it but Tesseract does → fine, the OCR router will pick Tesseract.
If neither has it → the language can only be handled via the vision LLM fallback — note this clearly in the language config.

### 2. Wire it into the pipeline

- [ ] `backend/app/services/bidder/config.py` — add the language to `SUPPORTED_LANGUAGES` with its codes for each engine.
- [ ] `backend/app/services/bidder/language_detector.py` — confirm the script heuristic identifies it correctly. langdetect handles most; for short snippets in less-common scripts, add the script range explicitly.
- [ ] `backend/app/services/bidder/ocr_router.py` — the routing logic should pick up the new language automatically if config is correct.
- [ ] `backend/app/services/bidder/translator.py` — add the IndicTrans2 language code mapping if needed.

### 3. Sample data and tests

- [ ] Add a synthetic bidder document in the new language to `data/samples/bidders/<lang>_sample/`.
- [ ] Add an end-to-end test in `tests/services/bidder/test_language_<lang>.py` that uploads the sample and asserts evidence rows have the correct language tag and a translation.
- [ ] Run the smoke test: full pipeline through to verdict generation on the new sample.

### 4. UI

- [ ] `frontend/lib/languages.ts` — add display name + native name (e.g., `{ code: "ta", english: "Tamil", native: "தமிழ்" }`).
- [ ] Confirm the language toggle in the verdict side panel renders the native script correctly.

### 5. Documentation

- [ ] Update `CLAUDE.md` Tech stack table if a new OCR engine is now needed.
- [ ] Update `README.md` "Quick start" if any new env vars or model downloads are required.
- [ ] Add a note to `docs/SUBMISSION_CHECKLIST.md` if the demo data should now include this language.

### 6. Demo readiness

- [ ] Test the full pipeline: upload a multi-page bidder doc in the new language → confirm OCR confidence is reasonable → confirm translation is reasonable → confirm evidence is extracted with correct provenance → confirm verdict generates.
- [ ] If the demo video for this round should include the new language, update `docs/DEMO_SCRIPT.md`.

## Hard rules

- **Don't ship a language without a sample document.** A language config with no test sample is a regression-time bomb.
- **Don't claim support if confidence is consistently below the floor.** Better to honestly mark a language as "experimental" than to silently disqualify bidders submitting in it.
- **Always preserve original-language text in the database.** This rule never changes.

## When done

Run the smoke test, commit with `feat(i18n): add <language> support`, and update `CLAUDE.md`.
