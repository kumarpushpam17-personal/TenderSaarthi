---
description: Prepare demo data and run a pre-flight check before recording the prototype-phase video
---

# /prepare-demo

You are preparing TenderSaarthi for the Round 2 demo recording. This command runs the full pre-flight: data loading, smoke test, performance check, and a checklist before the user hits "record".

## Steps

### 1. Bring up the stack
```bash
docker compose -f infra/docker-compose.yml down -v   # clean state
docker compose -f infra/docker-compose.yml up -d --build
sleep 15  # let Postgres + Elasticsearch settle
```

Verify health:
```bash
curl -s http://localhost:8000/health | jq .
curl -s http://localhost:3000 -o /dev/null -w '%{http_code}\n'
```

### 2. Load demo data
```bash
docker compose exec backend python -m scripts.load_demo
```

Expected output:
- 1 tender uploaded (CRPF construction)
- 12 criteria extracted (4 mandatory + 8 optional)
- 1 bidder-facing submission created through `/bidder/tenders/<tender_id>/submit`
- 10 demo submissions created for evaluation coverage
- ~30 documents uploaded across the 10 submissions
- All evidence extracted (no errors)
- Criterion-review gate APPROVED automatically (since this is demo data)

### 3. Cache pre-warming
Walk every page that the demo script visits — this populates HTTP caches and frontend bundles so the demo doesn't have a 2-second blank screen on first load.

```bash
# Backend warm
curl -s http://localhost:8000/api/v1/tenders > /dev/null
curl -s http://localhost:8000/api/v1/tenders/<tender_id>/criteria > /dev/null
curl -s http://localhost:8000/api/v1/tenders/<tender_id>/verdicts > /dev/null
curl -s http://localhost:8000/api/v1/tenders/<tender_id>/report.pdf > /dev/null
```

Then open the frontend pages in a browser:
- `http://localhost:3000/tenders`
- `http://localhost:3000/tenders/<tender_id>/review-criteria`
- `http://localhost:3000/bidder/tenders`
- `http://localhost:3000/bidder/tenders/<tender_id>`
- `http://localhost:3000/bidder/tenders/<tender_id>/submit`
- `http://localhost:3000/tenders/<tender_id>/submissions`
- `http://localhost:3000/tenders/<tender_id>/verdicts`
- `http://localhost:3000/tenders/<tender_id>/audit`

### 4. End-to-end smoke
```bash
docker compose exec backend pytest tests/integration/test_demo_smoke.py -v
```

This should hit every demo flow step. If it fails, fix before recording — do not record around bugs.

### 5. Hash verification
Generate the audit PDF, then verify the hash:
```bash
curl -s http://localhost:8000/api/v1/tenders/<tender_id>/report.pdf -o /tmp/report.pdf
sha256sum /tmp/report.pdf
# Compare against the hash printed on the last page of the PDF
```

If they match, the demo's "tamper-evident" claim is real.

### 6. Pre-record checklist

- [ ] Browser zoom set to 110%
- [ ] All notifications silenced (Slack, mail, calendar)
- [ ] Mic levels checked; no echo
- [ ] Recording at 1080p 30fps
- [ ] No real API keys visible in URL bars or terminals
- [ ] Tabs preloaded in the demo order: tender upload → criteria review → bidder submission → admin submissions → verdicts → audit
- [ ] Terminal window prepared for the `sha256sum` moment
- [ ] `docs/DEMO_SCRIPT.md` open on a second screen
- [ ] Backup screenshots taken in case the live demo breaks during recording

### 7. Common demo issues and fixes

| Issue | Fix |
|---|---|
| Frontend shows "Loading..." for too long | Check Celery worker logs; trigger an evaluation manually in the dashboard before recording |
| LLM call returns 429 | Switch to cached responses in `ANTHROPIC_USE_CACHE=true` env var |
| PDF.js bbox is in the wrong place | Reload the page; PDF.js layer attaches after document load |
| Audit PDF hash doesn't match | Confirm `generated_at` is excluded from the hashed content |

## When the demo passes

Tell the user: "Pre-flight passed. Stack is warm, demo data is loaded, smoke test green, audit hash verified. Ready to record."

If any step fails, **stop** and report the specific failure with logs. Do not let the user record against a broken demo.
