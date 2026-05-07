# IDEA.md — TenderSaarthi Vision

> The "why" of TenderSaarthi. Read this once before reading the architecture or the TODO list. Anything technical lives in `docs/ARCHITECTURE.md`.

## Problem (the real one, not the surface one)

Government procurement is not a document-AI problem dressed up in formal language. It is a decision-making process governed by **GFR 2017**, **CVC guidelines**, and the **two-envelope tender system**, where every "no" can be challenged at the **Central Administrative Tribunal (CAT)**, and every record can be requested under **RTI** for years afterward. A procurement officer's job is not just to pick the right bidder — it is to make a decision they can defend in writing, on paper, under hostile scrutiny, possibly long after the contract is over.

Today, this defence is built by hand. For a single CRPF tender:

1. A committee of officers prints out dozens of bidder submissions.
2. They build a manual spreadsheet of criteria × bidders.
3. They cross-check supporting documents — typed PDFs, scanned certificates, photographs of physical documents — against each criterion.
4. They write a justification note for every disqualification.
5. They sign and file the record.

This process has **five structural failures**:

1. **Slow.** Days per tender; weeks at the central level when bidder counts run high.
2. **Inconsistent.** Two evaluators reading the same documents can reach different conclusions, especially on borderline cases.
3. **Format-fragile.** A blurry scan or a regional-language certificate can stop the workflow cold.
4. **Hard to audit.** The justification is only as good as what one officer remembered to write down.
5. **Linguistically narrow.** Bidder documents in Hindi, Kannada, or other Indian languages add friction in a system designed assuming English.

A naive "throw an LLM at it" approach fixes the speed but worsens the other four — black-box outputs, no source citations, hallucinated values, no replay path. That is the opposite of what procurement law requires.

## Solution

**TenderSaarthi** is a decision-support platform that automates the document-heavy parts of tender evaluation while leaving the decision authority squarely with the procurement officer. It produces a criterion-by-criterion verdict for every bidder, with full source citations and a replayable audit trail.

It works in five stages.

### Stage 1 — Tender Understanding
The platform ingests the tender PDF, extracts every eligibility criterion, classifies it (technical / financial / compliance / document checklist / certification), tags it as mandatory or optional, and converts it into a typed structured record. Free-form prose becomes a checklist a machine can match against.

### Stage 2 — Multiformat & Multilingual Document Understanding
Bidder submissions arrive as a mix of typed PDFs, scanned PDFs, JPG/PNG photographs of physical certificates, and Word files — sometimes in English, sometimes in Hindi, Kannada, or other regional languages. The pipeline routes each document through the right extractor: digital text parsers for typed PDFs, an OCR router (PaddleOCR with Indic weights → Tesseract → vision LLM) for scans and photos, and AWS Textract for tabular financial statements. Multilingual content flows through IndicTrans2 with original-language text always preserved alongside the translation.

### Stage 3 — Criteria-to-Evidence Matching
For every bidder, the engine maps extracted evidence against every criterion. It uses three complementary modes:
- **Rule-based** for hard thresholds (turnover ≥ ₹5 cr, certification valid on tender date).
- **Semantic** for clause-language variation (a bidder's "annual sales" is the tender's "annual turnover").
- **Span validation** that re-reads the original document span to confirm the LLM's claimed value is actually present where it says it is.

### Stage 4 — Explainable Verdicts with Human-in-the-Loop
Every criterion produces one of three outcomes:
- **Eligible** — high-confidence evidence meeting the criterion.
- **Not Eligible** — high-confidence evidence missing or below threshold.
- **Needs Manual Review** — evidence is ambiguous, low-confidence, or partial.

Every verdict carries: which criterion was checked, which document and page were used, what value was found, why the bidder passed or failed, the OCR/extraction confidence, and the model + prompt version.

A reviewer UI lets an officer:
- See bidder × criterion verdicts in a single table.
- Click any verdict and jump straight to the highlighted bounding box in the original document.
- Toggle between original-language text and translation.
- Approve, override (with a recorded reason), or escalate.

### Stage 5 — Audit-Ready Reporting
At sign-off, TenderSaarthi exports a PDF report containing the tender ID, every criterion, every bidder × criterion verdict, the evidence citation for each, the reviewer who approved, the model versions used, and a SHA-256 content hash. This is the document that goes into the procurement file — the one that defends the decision under RTI, CAT, or audit review.

## Three differentiators (what makes this defensible vs. a generic LLM demo)

These are the three hooks that score points on the rubric and keep the solution defensible against follow-on competitors.

### 1. Criterion-review gate
Most LLM-document pipelines extract from the source and immediately apply the result. We insert a mandatory human checkpoint *between* tender criterion extraction and bidder scoring. If the LLM hallucinates a criterion or misclassifies one as mandatory when it was optional, the officer catches it once — not ten times across ten bidder evaluations. This single design choice prevents extraction errors from becoming systemic disqualifications.

### 2. OCR + translation confidence floors
Each modality has a documented confidence floor. Below the floor, evidence cannot drive a `Not Eligible` verdict — only a `Needs Manual Review`. This makes silent disqualification *structurally impossible*: a blurry scan can never auto-reject a bidder, no matter what the downstream LLM thinks the value is. The floor numbers are configurable and logged.

### 3. Model-versioned replayability
Every LLM and OCR call is logged with: model name + version, prompt template hash, input document hash, output, confidence, timestamp, and a `replay_id` that ties the chain together. A verdict from six months ago can be re-run with the same models on the same documents and produce the same result — or, if a model has been updated, the diff is visible. This is what RTI and CAT scrutiny actually need; it is not standard practice in LLM-for-government demos and it is the strongest argument that this is a real procurement-grade system.

## Why now

Three things converge in 2026 that did not exist three years ago.

1. **Multilingual VLMs and Indic OCR are finally good enough.** PaddleOCR's Indic weights and IndicTrans2 close most of the regional-language gap; Claude Sonnet 4.6 and similar models can read scanned certificates with usable accuracy.
2. **GeM and the broader procurement digital infrastructure** mean tender + bidder documents already arrive electronically in most central organisations. The integration story is a webhook, not a digitisation programme.
3. **Sovereign-AI compute (MeghRaj GI Cloud, on-prem GPUs)** lets the on-prem deployment story be real, not hypothetical — important because much procurement data cannot legally cross borders.

## Target users

- **Primary:** CRPF procurement evaluation committees. The hackathon sponsor.
- **Adjacent (Round 2 deck):** CPWD, Indian Railways, BSNL, NTPC, ONGC, DRDO, state procurement portals (KTPP, MahaTenders, Tamil Nadu e-Procurement).
- **Outside government (long-term):** Large enterprises running formal RFP processes — banks, PSUs, large corporates. Same pattern, lower compliance bar.

## Scope and non-goals (what we are deliberately not building)

- **Not** a tender authoring tool — we read tenders, not write them.
- **Not** a bidder portal — we score bidders, we do not collect their submissions through a marketplace.
- **Not** a financial-evaluation engine — we evaluate eligibility (the first envelope), not L1 price ranking (the second envelope). That is a separate problem.
- **Not** a fully autonomous decision-maker — every disqualification routes to or is signed off by a human officer.

## Long-term scale

The criterion registry is tender-domain and language-agnostic. The same engine that scores construction tenders for CRPF can score IT procurement for Railways or pharmaceutical procurement for AIIMS by swapping the prompt library and the synthetic training corpus. India's central + state procurement spend is in the **₹8–10 lakh crore** range; even a 10% dent in evaluation cycle time at this scale is a measurable national-productivity outcome. Adjacent unlocks: faster MSME participation (because review delay is a known MSME barrier), cleaner RTI compliance, and a procurement audit corpus that itself becomes training data for the next generation of public-sector AI.

## What "good" looks like at the end of Round 2

A judge can:
1. Upload our bundled CRPF-style tender and watch criteria appear in 30 seconds.
2. Approve or edit the criteria at the criterion-review gate.
3. Trigger evaluation of 10 synthetic bidders.
4. See a verdict table with `Eligible` / `Not Eligible` / `Needs Manual Review` outcomes.
5. Click a `Not Eligible` verdict and jump to the exact bounding box in the bidder's GST certificate.
6. Override a verdict with a typed reason, then re-export.
7. Download the signed audit PDF and verify its SHA-256 hash.
8. Replay the entire evaluation by clicking one button and confirm identical output.

If that demo lands, the rest is implementation detail.
