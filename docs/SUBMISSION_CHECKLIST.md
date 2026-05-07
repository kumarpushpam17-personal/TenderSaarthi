# SUBMISSION_CHECKLIST.md — TenderSaarthi Round 2 Submission

> The checklist for the Prototype Phase submission on HackerEarth. Run through this in order on submission day.

## Required submission fields (HackerEarth form)

| Field | Status | Asset |
|---|---|---|
| Video link | ☐ | YouTube unlisted URL |
| Presentation (PPT) | ☐ | `submissions/TenderSaarthi_Deck.pptx` + `.pdf` |
| Source code | ☐ | Public GitHub repo URL |
| Instructions to run | ☐ | README "Quick start" section + `RUN.md` if needed |

## Day before submission

### Code freeze (Wednesday EOD)
- [ ] All Week 4 PRs merged to `main`
- [ ] No new feature work after this point
- [ ] Tag the release: `git tag -a v0.1-prototype -m "Round 2 submission" && git push --tags`

### Final smoke test on a clean clone
On a fresh laptop, or a fresh VM, or in a fresh Docker context:
```bash
git clone https://github.com/<your-team>/TenderSaarthi
cd TenderSaarthi
cp infra/.env.example infra/.env
# fill in ANTHROPIC_API_KEY
docker compose -f infra/docker-compose.yml up --build
# in another shell:
docker compose exec backend python -m scripts.load_demo
```
- [ ] All services come up cleanly (no error logs)
- [ ] Frontend at `localhost:3000` loads
- [ ] Bidder workspace route loads and can create a demo submission
- [ ] Admin workspace shows the received bidder submission for the tender
- [ ] Demo tender + 10 bidders are visible after `load_demo`
- [ ] End-to-end evaluation completes without manual intervention
- [ ] Audit PDF downloads and hash-verifies

### Repository hygiene
- [ ] `.gitignore` excludes `.env`, `node_modules/`, `__pycache__/`, `*.pyc`, `.venv/`
- [ ] No real API keys in git history (run `git log -p | grep -i 'sk-ant'` — should be empty)
- [ ] No PII or real procurement data in `data/samples/`
- [ ] LICENSE file present (MIT)
- [ ] README "Quick start" works on a clean machine
- [ ] CI badge in README if you set up CI; otherwise omit
- [ ] All TODOs in code that are real production gaps marked with `# TODO(round2):` (and absent from the demo path)

## Submission day

### T-4h — final smoke test
- [ ] Re-run the clean-clone smoke test
- [ ] Take screenshots of every demo step (backup for video)
- [ ] Upload backup video to Google Drive (in addition to YouTube)

### T-3h — video
- [ ] Watch the video end to end with audio
- [ ] Re-record if any blocker (broken UI, voice cracks, captions missing)
- [ ] Upload to YouTube as **unlisted** with a clear title and description
- [ ] Description includes: GitHub link, team name, hackathon track
- [ ] Share link tested in an incognito window — must open without login

### T-2h — deck
- [ ] PPT exported to PDF
- [ ] Both files saved with consistent names: `TenderSaarthi_Deck.pptx`, `TenderSaarthi_Deck.pdf`
- [ ] Slide count verified (12–15 max)
- [ ] No raw notes / draft slides left in
- [ ] Architecture diagram renders cleanly at 1080p

### T-1h — submit
- [ ] Open HackerEarth submission form
- [ ] Paste video link
- [ ] Upload PPT (use the `.pptx` if HackerEarth allows; fall back to PDF if not)
- [ ] Paste source code URL
- [ ] Paste run instructions (link to README or paste a condensed version)
- [ ] Hit submit
- [ ] Take a screenshot of the submission confirmation
- [ ] Save the submission ID to a backup doc

### T-30m — verify
- [ ] Submission visible in HackerEarth dashboard
- [ ] Status shows "Submitted" not "Draft"
- [ ] Video link tested again from the dashboard preview
- [ ] All teammates have the GitHub repo URL, the YouTube URL, and the deck file

### T-0 — done
- [ ] Post a thank-you message in the team channel
- [ ] Backup all assets (video, deck, repo zip) to a shared drive
- [ ] Take a break

## Deck structure (12–15 slides)

1. **Title** — TenderSaarthi · one-line tagline · team
2. **The problem** — five structural failures, one slide
3. **What's TenderSaarthi** — five-stage pipeline, one diagram
4. **Live demo** — placeholder slide; cut to video
5. **Workflow split** — CRPF/admin workspace vs bidder workspace
6. **Differentiator 1** — Criterion-review gate
7. **Differentiator 2** — Confidence floors
8. **Differentiator 3** — Model-versioned replayability
9. **Architecture** — the system diagram from `README.md`
10. **Tech stack** — table from `docs/TECH_STACK.md`, condensed
11. **Risks & trade-offs** — four bullets max
12. **Roadmap & impact** — CPWD / Railways / PSUs / state portals; ₹8–10 lakh crore framing
13. **Team** — names, roles, one-line each
14. **(Optional) Q&A holder slide**

## Public-link sanity test

Before submission, open every link from a fresh browser session (incognito or different machine):

- [ ] GitHub repo loads, README is readable, clone URL copies cleanly
- [ ] YouTube video plays without sign-in
- [ ] Deck PDF downloads or previews
- [ ] Backup Google Drive video plays without sign-in (or with HackerEarth-domain sharing)

## Don't submit on the last day

The HackerEarth platform has had submission-portal issues in past hackathons. Aim to submit at least 24 hours before the deadline. Use the spare time to:

- Watch the video again with fresh ears
- Have a non-team member read the README and try to run it
- Catch the one typo on slide 3 you missed

## Post-submission

- [ ] Submit a thumbs-up to the team
- [ ] Add the submission to your portfolio / LinkedIn (after results, if shortlisted)
- [ ] Save lessons learned for the next hackathon — one Markdown file in the repo's `docs/postmortem.md`
