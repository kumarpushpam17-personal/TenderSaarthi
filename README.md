# TenderSaarthi

**Explainable, Multilingual, Audit-Ready AI for Government Tender Eligibility Evaluation**

> Built for AI for Bharat 2 — Theme 3: AI-Based Tender Evaluation and Eligibility Analysis for Government Procurement (CRPF).

---

## What it does

TenderSaarthi turns government tender evaluation from a days-long manual review into a criterion-by-criterion, fully-cited, audit-ready decision-support workflow.

Given a tender document and a set of bidder submissions, TenderSaarthi:

1. **Extracts** eligibility criteria from the tender — separating mandatory from optional, technical from financial from compliance.
2. **Parses** every bidder document — typed PDFs, scanned copies, photographs, Word files — across English, Hindi, Kannada and other Indian languages.
3. **Matches** bidder evidence to each criterion using a hybrid rule + semantic engine.
4. **Decides** — `Eligible`, `Not Eligible`, or `Needs Manual Review` — with a citation to the exact source page and bounding box that drove the verdict.
5. **Reports** — a signed, replayable PDF report a procurement officer can review and use as the basis for a decision.

## Why it's different

Three deliberate design choices separate it from a generic LLM-over-PDFs demo:

- **Criterion-review gate.** A mandatory human checkpoint after criterion extraction, before any bidder is scored. Catches LLM extraction errors at their source instead of letting them ripple through ten bidder evaluations.
- **OCR + translation confidence floors.** Per-modality thresholds make silent disqualification structurally impossible. Below the floor, the case is routed to manual review, never auto-rejected.
- **Model-versioned replayability.** Every verdict logs the model name, prompt template hash, OCR engine and confidence, and timestamp. Any decision can be reconstructed years later under RTI or CAT scrutiny.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       TENDER DOCUMENT                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌──────────────────────────────────────────────────────┐
   │  TENDER UNDERSTANDING                                │
   │  PDF parse → criterion extraction (LLM, structured)  │
   │  → mandatory/optional split → criterion registry     │
   └──────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │  CRITERION-REVIEW GATE    │  ← human checkpoint
                └─────────────┬─────────────┘
                              │
   ┌──────────────────────────┴───────────────────────────┐
   │                                                      │
   ▼                                                      ▼
┌──────────────────────┐                 ┌──────────────────────┐
│  BIDDER PIPELINE     │                 │  CRITERION REGISTRY  │
│  Lang detect → OCR   │                 │  (typed, indexed)    │
│  router → VLM for    │                 └──────────────────────┘
│  scans → translation │                          │
│  → evidence extract  │                          │
└──────────────────────┘                          │
              │                                   │
              └─────────────┬─────────────────────┘
                            ▼
   ┌──────────────────────────────────────────────────────┐
   │  MATCHING ENGINE                                     │
   │  Rule-based threshold checks +                       │
   │  semantic clause matching (BGE-M3) +                 │
   │  span validation                                     │
   └──────────────────────────────────────────────────────┘
                            │
                            ▼
   ┌──────────────────────────────────────────────────────┐
   │  VERDICT GENERATOR                                   │
   │  ELIGIBLE | NOT_ELIGIBLE | NEEDS_MANUAL_REVIEW       │
   │  + confidence floors + reason + evidence citation    │
   └──────────────────────────────────────────────────────┘
                            │
                            ▼
   ┌──────────────────────────────────────────────────────┐
   │  REVIEWER UI         ←     AUDIT LOG (replay_id)     │
   │  Bbox highlights,                                    │
   │  language toggle,                                    │
   │  approve / override                                  │
   └──────────────────────────────────────────────────────┘
                            │
                            ▼
   ┌──────────────────────────────────────────────────────┐
   │  SIGNED PDF REPORT (with SHA-256 tamper hash)        │
   └──────────────────────────────────────────────────────┘
```

A higher-resolution Mermaid diagram lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Quick start

```bash
# Clone
git clone https://github.com/<your-team>/TenderSaarthi
cd TenderSaarthi

# Configure secrets
cp infra/.env.example infra/.env
# Edit infra/.env — add ANTHROPIC_API_KEY at minimum

# One-command bootstrap
docker compose -f infra/docker-compose.yml up --build

# Open
# Frontend:   http://localhost:3000
# API docs:   http://localhost:8000/docs
```

To run with the bundled demo tender + 10 synthetic bidders:

```bash
docker compose exec backend python -m scripts.load_demo
```

Then open `http://localhost:3000/tenders/demo` in the UI.

## Demo

- **Demo video:** _link added at submission_
- **Live walkthrough URL:** _link added at submission_
- **Sample data:** `data/samples/` — one CRPF-style tender + 10 synthetic bidders covering every edge case (Kannada GST cert, scanned Hindi affidavit, low-confidence turnover scan, etc.)

## Tech stack (summary)

FastAPI · PostgreSQL + pgvector · Elasticsearch · PaddleOCR (Indic) · IndicTrans2 · BGE-M3 · Claude Sonnet 4.6 · Next.js 14 · shadcn/ui · PDF.js · Docker

Full justifications and trade-offs in [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

## Repository layout

```
.claude/                Claude Code config + custom slash commands
backend/                FastAPI service
frontend/               Next.js reviewer UI
data/samples/           Synthetic tender + bidder docs
docs/                   Architecture, tech stack, demo script, rubric
infra/                  Docker compose, env, init SQL
CLAUDE.md               Project instructions for Claude Code
IDEA.md                 Vision document
TODOS.md                Live work tracker
PROTOTYPE_PLAN.md       4-week build plan
```

## Team

- **Pushpam Kumar** — Backend / Architecture
- _Add teammates here_

## Hackathon context

- **Event:** AI for Bharat 2, HackerEarth
- **Track:** Theme 3 — CRPF Tender Evaluation
- **Phase:** Prototype (Round 2)
- **Grand Finale:** Taj Yeshwantpur, Bengaluru

## License

MIT for the source. Bundled sample tender and bidder documents are synthetic — no real procurement data is included.
