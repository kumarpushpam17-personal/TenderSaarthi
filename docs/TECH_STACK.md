# TECH_STACK.md — TenderSaarthi

> Every technology choice with the reason. The hackathon rubric explicitly asks for "justification of technology and model choices" — this is that document.

## Decision summary

| Layer | Choice | Why | What we rejected |
|---|---|---|---|
| Backend framework | **FastAPI 0.115+** | Async-native, Pydantic v2 integration, OpenAPI for free, the team uses it daily | Django REST: heavier, sync-first; Flask: too DIY for our schema-heavy needs |
| Language | **Python 3.11** | The whole AI/OCR ecosystem is Python; team strength | Node: weaker AI SDKs; Go: no PaddleOCR bindings |
| Task queue | **Celery + Redis** | Mature, familiar, good for long OCR/LLM jobs | RQ: simpler but missing rate-limit / retry semantics we need |
| Primary DB | **PostgreSQL 15 + pgvector** | One DB for relational + vector; transactional integrity between criteria/evidence/embeddings | Pinecone/Weaviate: an extra service to operate; MongoDB: weaker join story |
| Search | **Elasticsearch 8.x** | Indic analyzers; clause-level search; team familiarity | OpenSearch: workable; Postgres FTS: weaker on Indic |
| Object storage | **MinIO (local), S3 (cloud)** | S3-compatible API, dev/prod parity | Filesystem: no audit story; GCS: locks us out of MeghRaj |
| OCR (primary) | **PaddleOCR with Indic weights** | Best free Indic coverage; bundled deskew | EasyOCR: weaker on Indic; Google Vision: cost + sovereignty |
| OCR (fallback) | **Tesseract 5** | Stable, broad language support, runs anywhere | None — needed as a wide-coverage backup |
| OCR (premium tabular) | **AWS Textract** | Best column-aware extraction for financials | LayoutLMv3 self-hosted: viable but slower to ship |
| Vision LLM | **Claude Sonnet 4.6** (cloud); **Qwen2.5-VL-7B** (on-prem stretch) | Strong on noisy scans + structured output; sovereignty path exists | GPT-4V: comparable but Anthropic SDK is cleaner for tool_use; Gemini: less mature on-prem story |
| Text LLM | **Claude Sonnet 4.6** (cloud); **Llama 3.3-70B Instruct** (on-prem stretch) | Reliable structured output; Anthropic's tool_use eliminates JSON drift | GPT-4o: comparable; Mistral Large: weaker structured output |
| Translation | **AI4Bharat IndicTrans2** | Open-weights, 22 Indian languages, India-built | Google Translate: closed; NLLB: less Indic-specialised |
| Embeddings | **BGE-M3** | Single model handles English + Indic; runs on CPU at our volume | Cohere: closed; multilingual-e5: weaker on Indic |
| Frontend | **Next.js 14 + TypeScript** | App router; SSR for the audit pages; mature ecosystem | Vite SPA: fine but loses SSR; Remix: smaller ecosystem |
| UI library | **shadcn/ui + Tailwind** | Accessible primitives, no theming lock-in | MUI: heavier; Ant Design: visually opinionated |
| PDF viewing | **PDF.js (Mozilla)** | The only mature option for in-browser PDF + bbox overlays | react-pdf: wraps PDF.js; we can use it directly |
| PDF generation | **ReportLab** | Deterministic output → hashable for audit; pure Python | WeasyPrint: dependent on system libs; Puppeteer: non-deterministic spacing |
| Testing | **pytest + httpx + playwright** | pytest for backend, playwright for the demo flow | None |
| Container runtime | **Docker** | Universal | None |
| Orchestration (prototype) | **Docker Compose** | One-command demo | k8s: overkill for the demo |
| Orchestration (production stretch) | **Kubernetes on MeghRaj/AWS** | Real production story; data residency on MeghRaj | None |

## Detailed rationale

### Why FastAPI over Django

This is a service-shaped backend, not a CMS-shaped backend. We want async LLM calls, OpenAPI docs by default, and Pydantic v2 type-safety end-to-end. Django's strengths (admin, ORM, batteries-included) don't apply when the data model is mostly evidence, verdicts, and replay logs. The team's day job is Django + DRF, but for a fresh service this size, FastAPI is faster to build and ship.

### Why Postgres + pgvector instead of Pinecone/Weaviate/Qdrant

The vector workload here is small — a few thousand criterion embeddings, a few hundred thousand evidence embeddings even at production scale. pgvector with HNSW handles this comfortably on a single Postgres instance, and gives us transactional consistency between criteria, evidence, and their embeddings. Operating one database is materially easier than operating two, and the audit story is simpler when everything lives in one transactional store.

We would reconsider a dedicated vector DB at >50M embeddings, which is far beyond the prototype scope.

### Why PaddleOCR primary and not Tesseract

For Indic text on scanned documents, PaddleOCR with the AI4Bharat-derived Indic weights consistently beats Tesseract on accuracy in our preliminary checks. PaddleOCR also bundles deskew and rotation correction, which Tesseract requires us to build separately. We keep Tesseract for the long-tail languages PaddleOCR doesn't cover.

### Why a vision LLM at all

Photographs of physical certificates — the kind a bidder might attach as a JPG — are a worst-case OCR scenario: skewed, lit unevenly, sometimes partially folded, often with stamps obscuring text. Both PaddleOCR and Tesseract struggle here. A vision LLM (Claude Sonnet) handles these robustly and can return structured output directly. The cost is small at our volume.

### Why Claude over GPT-4o or Gemini

Three reasons:
1. **Anthropic's `tool_use` for structured output is, in our hands, the most reliable way to eliminate JSON drift in LLM responses.** OpenAI's `response_format` is comparable but the failure modes differ.
2. **Anthropic publishes the model versioning + system card transparency we need for the replayability story.** This is a procurement audit feature, not a marketing feature.
3. **The team is already Claude-fluent** (existing project work uses Claude Code), which reduces ramp time.

We deliberately keep the model swap behind a single `LLMClient` interface so this choice is reversible.

### Why IndicTrans2 over Google Translate or NLLB

- **IndicTrans2** is open-weights (sovereignty), India-built, and trained on a corpus that includes domain-relevant text. Self-hostable for on-prem deployments.
- **Google Translate** is closed and ages procurement data through a foreign cloud — a non-starter for the on-prem story.
- **Meta's NLLB** is open-weights but less Indic-specialised; benchmark gap on Kannada and Bengali matters for our use case.

### Why ReportLab for the audit PDF

The audit PDF must be hashable and deterministic — generating the same input twice must produce identical bytes (modulo timestamp). ReportLab gives us this with pure Python, no system-library dependencies, and predictable text rendering. WeasyPrint relies on system libraries that vary across OSes; Puppeteer renders via Chrome, which has subtle non-determinism in font kerning and image scaling. The hash check is the audit story; we will not give it up.

### Why Docker Compose for the prototype

The judges will not deploy Kubernetes during evaluation. They will (at most) clone the repo and run `docker compose up`. The demo environment must reflect that. Kubernetes manifests live in `infra/k8s/` as a Round 3 / production stretch artifact, but they are not the path the judges run.

## What we deliberately did not adopt

- **LangChain / LlamaIndex.** We have direct LLM clients and a simple, typed pipeline. A framework here adds abstraction tax without a clear win.
- **A separate workflow engine (Temporal / Prefect).** Celery handles our task volume. A workflow engine is the right answer at production scale; not now.
- **A second OCR for English-only typed PDFs.** PyMuPDF gets the text layer cleanly; OCR is wasted compute.
- **ML-based document classification.** A heuristic on extension + magic bytes + text-layer presence is right ~99% of the time and adds zero training burden.
- **A web-based PDF rendering service for the audit report.** Adds latency, breaks determinism. ReportLab in-process is the right call.

## Cost envelope (prototype phase, single demo run)

Order-of-magnitude estimates for a single end-to-end demo (1 tender + 10 bidders, ~30 documents total).

| Item | Calls | Approx. cost |
|---|---|---|
| Claude Sonnet — criterion extraction | 5 chunks × 1 call | ~$0.05 |
| Claude Sonnet — evidence extraction | 30 docs × 4 criteria × 1 call | ~$1.50 |
| Claude Sonnet — vision (low-confidence pages) | ~10 calls | ~$0.30 |
| AWS Textract — financial tables | ~15 pages | ~$0.02 |
| PaddleOCR / IndicTrans2 / BGE-M3 | local | $0 |
| **Total per demo run** | | **~$2** |

Cache extracted criteria + evidence so demo replays are free. Pre-cache before judging.

## Open weights / sovereignty story

Every cloud LLM call is interface-isolated. Swapping `ClaudeClient` for `LlamaClient` (Llama 3.3-70B Instruct on a self-hosted GPU) is a config change. PaddleOCR, Tesseract, IndicTrans2, BGE-M3, and ReportLab are all local. This means TenderSaarthi can deploy in two modes:

- **Cloud mode** — Claude Sonnet for LLM/VLM, fastest path, lowest per-call cost. Production-ready for non-sensitive procurement data.
- **On-prem mode** — Llama 3.3-70B + Qwen2.5-VL on MeghRaj GPUs, no data leaves the cluster. Required for sensitive procurement domains.

For the prototype we ship cloud mode and slide on-prem mode. The on-prem path is real (the interfaces exist), it is just not what the judges run.
