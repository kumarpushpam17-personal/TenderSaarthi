# EVALUATION_RUBRIC.md — How TenderSaarthi Scores Against the Judging Criteria

> The official AI for Bharat 2 rubric, mapped to specific things in our submission. Use this as a final pre-submission self-audit.

## Official scoring breakdown

| Criterion | Weight |
|---|---|
| Problem Relevance & Depth of Understanding | 20% |
| Technical Implementation & Innovation | 25% |
| Real-World Deployability & Government Feasibility | 25% |
| Demo Quality & Presentation | 15% |
| Scalability & Long-Term Impact | 15% |

Top 50 of ~600 advance to the Grand Finale at Taj Yeshwantpur.

## Self-audit (target: 85+/100)

### Problem Relevance & Depth of Understanding (20%)

| Lever | Where it lives | Evidence in submission |
|---|---|---|
| Domain vocabulary | `IDEA.md` opening section | GFR 2017, CVC, two-envelope, CAT, RTI mentioned in context |
| Real failure modes named | `IDEA.md` "Five structural failures" | Slow / inconsistent / format-fragile / hard-to-audit / linguistically narrow |
| Theme-specific framing | Throughout | CRPF named explicitly; tender categories from the brief reproduced |
| Why-now argument | `IDEA.md` "Why now" | Three converging trends, dated specifically to 2026 |

**Self-score target: 18/20.** Only thing missing: a CRPF officer or procurement insider review. If you can get one before submission, do it.

### Technical Implementation & Innovation (25%)

| Lever | Where it lives | Evidence |
|---|---|---|
| Named technology choices with reasons | `docs/TECH_STACK.md` | Each choice has a rejected alternative |
| Novel design choices, not just "LLM over PDFs" | `IDEA.md` + `README.md` differentiators | Three differentiators: criterion-review gate, confidence floors, replayability |
| Hybrid matching (rule + semantic + span) | `docs/ARCHITECTURE.md` Matching Engine | Three matchers in precedence order |
| Working demo end-to-end | Video + repo | All four submission deliverables wired together |
| Code quality | Repo | Pydantic typing, structured logs, tests on services/ |

**Self-score target: 22/25.** Risk: judges expect to see actual code that runs. The repo + run-instructions deliverable is doing this work.

### Real-World Deployability & Government Feasibility (25%)

This is where most hackathon submissions lose points. Judges include IAS officers and CRPF representatives. They are looking for: would this actually work inside our compliance constraints?

| Lever | Where it lives | Evidence |
|---|---|---|
| Explainability at criterion level | Verdicts always cite source | Every verdict has `evidence_ref`, `reason`, `model_version` |
| Never silently disqualifies | Confidence-floor logic | `NEEDS_MANUAL_REVIEW` is a first-class outcome |
| Audit trail | `replay_log` table + signed PDF | SHA-256 hash on the audit report; full replay capability |
| Data residency | On-prem mode option | `docs/TECH_STACK.md` "Open weights / sovereignty story" |
| Human authority preserved | Criterion-review gate + reviewer override | The reviewer signs off, never the AI |
| Format coverage | OCR router | Typed PDF, scanned PDF, image, Word, financial tables — all handled |
| Indic language coverage | Translation pipeline | English + Hindi + Kannada minimum, extensible to 22 Indian languages |

**Self-score target: 23/25.** This is our strongest section. Lean into it in the deck.

### Demo Quality & Presentation (15%)

| Lever | Where it lives | Evidence |
|---|---|---|
| Demo runs end-to-end | Video | One uninterrupted flow, 5:00 max |
| Differentiators front-loaded | Demo script | Criterion gate at 1:30, confidence floor at 3:00, replayability at 4:30 |
| Slides judge-friendly | PPT | 12–15 slides, no walls of text, big diagrams |
| Synthetic data realistic | `data/samples/` | Real GFR/CVC clause language, not generic placeholders |

**Self-score target: 13/15.** Risk: production polish matters here. A clean demo with bad audio loses points; a great demo with shaky audio is fine.

### Scalability & Long-Term Impact (15%)

| Lever | Where it lives | Evidence |
|---|---|---|
| Concrete extension path | `IDEA.md` "Long-term scale" | CPWD, Railways, BSNL, NTPC, ONGC, DRDO, KTPP, MahaTenders, TN |
| India-scale framing | Same | ₹8–10 lakh crore procurement spend |
| MSME inclusion angle | Same | Faster review = lower MSME participation barrier |
| Architecture supports scale | `docs/ARCHITECTURE.md` | Stateless services, queue-based async, vector DB-ready |

**Self-score target: 12/15.** Sharpen with one quantified before/after — e.g., "current evaluation cycle 7–14 days → projected 4–8 hours per tender."

## Total target: 88/100

## Things that lose points (do not do)

- **Live demo crashes.** Pre-record. Cache. Have screenshots as a fallback.
- **Walls of text in slides.** No slide should have more than 30 words.
- **Buzzword inflation.** "Generative AI", "transformer-powered", "next-gen". Drop them.
- **Vague tech claims.** "We use multilingual OCR" is worth zero points. "We use PaddleOCR with AI4Bharat-derived Indic weights, Tesseract fallback, and Claude Sonnet vision for low-confidence pages" is worth full points.
- **Apologising in the demo.** "Sorry it's slow" / "Ignore the bug" — do not say either out loud. Edit them out.
- **Skipping the explainability story.** This is your 25% Deployability section. Make it the spine of the demo.

## Things that gain points (do these)

- **Show the audit PDF being hash-verified live in the terminal.** This is the single most credibility-earning moment in the demo for an IAS judge.
- **Toggle between original-language and translation in the UI.** Multilingual is a theme angle competitors will mention but few will demonstrate.
- **Quote one verbatim clause from the bundled tender.** Shows you actually read what you're claiming to evaluate.
- **Name your three differentiators in the closing slide and the closing 30 seconds of the demo.** Give judges a phrase to remember you by.
