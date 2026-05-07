---
description: Final pre-submission validation against the Round 2 deliverables checklist
---

# /submission-check

You are running the final pre-submission validation for the Round 2 prototype-phase submission. The goal is to catch every possible blocker before the user hits "Submit" on HackerEarth.

## Before you start

1. Read `docs/SUBMISSION_CHECKLIST.md`.
2. Read `docs/EVALUATION_RUBRIC.md` to ensure all four scoring categories are addressed.

## Run these checks in order

### 1. Repo hygiene
```bash
# No secrets in git history
git log -p --all | grep -E '(sk-ant-|AKIA|AIza|ghp_|secret_)' && echo "FAIL: secrets found" || echo "OK"

# .gitignore covers the basics
grep -E '^(\.env|node_modules|__pycache__|\.venv|\*\.pyc)$' .gitignore || echo "FAIL: .gitignore incomplete"

# README has Quick Start section
grep -i "quick start" README.md || echo "FAIL: missing Quick Start"

# LICENSE present
test -f LICENSE && echo "OK: LICENSE present" || echo "FAIL: no LICENSE"

# .env.example present
test -f infra/.env.example && echo "OK: env example present" || echo "FAIL: no .env.example"

# No real .env committed
test ! -f infra/.env && echo "OK: no real .env in repo" || echo "FAIL: .env committed"
```

### 2. Clean-clone smoke test
```bash
# In a temp directory
TEMPDIR=$(mktemp -d)
cd $TEMPDIR
git clone <repo_url> TenderSaarthi-clone
cd TenderSaarthi-clone
cp infra/.env.example infra/.env
# Note: ANTHROPIC_API_KEY must be filled in manually, prompt the user
docker compose -f infra/docker-compose.yml up --build -d
sleep 30
docker compose -f infra/docker-compose.yml exec backend python -m scripts.load_demo
curl -s http://localhost:8000/health | jq .
curl -s http://localhost:3000 -o /dev/null -w '%{http_code}\n'
docker compose -f infra/docker-compose.yml down -v
cd /
rm -rf $TEMPDIR
```

If any step in the clean-clone test fails, **stop and fix** before submission.

### 3. Demo deliverables
- [ ] Video file exists, < 5:00, 1080p, audio levels reasonable
- [ ] YouTube upload is **unlisted** (not private)
- [ ] YouTube link tested in incognito browser
- [ ] PPT exists as both `.pptx` and `.pdf`
- [ ] PPT slide count between 12 and 15
- [ ] PPT renders cleanly when exported to PDF (no overflowing text)
- [ ] Architecture diagram in deck is high-resolution
- [ ] No "DRAFT" or scratch slides in the deck

### 4. README and run instructions
- [ ] README opens with TenderSaarthi name and tagline
- [ ] README has architecture diagram (ASCII or image)
- [ ] README has "Quick start" with `docker compose up` as the path
- [ ] README has demo video link (after upload)
- [ ] README has team list
- [ ] `RUN.md` exists OR README "Quick start" is detailed enough
- [ ] All commands in "Quick start" actually work

### 5. Code quality (light pass — this is a prototype, not production)
```bash
# Backend
docker compose exec backend ruff check . && echo "OK: ruff clean"
docker compose exec backend pytest tests/ -q && echo "OK: tests passing"

# Frontend
cd frontend && npm run lint && echo "OK: frontend lint clean"
```

### 6. Differentiator visibility
The three differentiators must be present in:
- [ ] `README.md` — "Why it's different" section
- [ ] `IDEA.md` — "Three differentiators" section
- [ ] PPT — at least one slide per differentiator (Differentiator 1, 2, 3)
- [ ] Demo video — explicitly named in the closing 30 seconds
- [ ] `docs/EVALUATION_RUBRIC.md` — referenced in scoring

### 7. Audit hash test
This is the single most credibility-earning moment in the demo. Verify it works:
```bash
# Generate report
TENDER_ID=$(docker compose exec -T backend python -c "from app.db import session; from app.models import Tender; s = session(); t = s.query(Tender).first(); print(t.id)")
curl -s http://localhost:8000/api/v1/tenders/$TENDER_ID/report.pdf -o /tmp/report.pdf

# Compare hash
EXTERNAL_HASH=$(sha256sum /tmp/report.pdf | awk '{print $1}')
INTERNAL_HASH=$(docker compose exec -T backend python -m scripts.print_report_hash $TENDER_ID)

if [ "$EXTERNAL_HASH" = "$INTERNAL_HASH" ]; then
  echo "OK: audit hash verifies"
else
  echo "FAIL: audit hash mismatch — fix before demo"
fi
```

## Final go/no-go

If every section above is OK, tell the user:
> Pre-submission validation passed. The repo, demo, deck, and README are ready to submit. Last step: open HackerEarth and follow `docs/SUBMISSION_CHECKLIST.md` "Submission day" section.

If anything failed:
1. List every failure with the specific check that failed.
2. Recommend fixing in order of severity: secrets > demo crashes > deck issues > lint warnings.
3. Do not let the user submit if a clean-clone smoke test failed — that is the failure mode that will kill the score in Round 2 evaluation.
