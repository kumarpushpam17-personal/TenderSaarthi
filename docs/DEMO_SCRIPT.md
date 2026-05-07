# DEMO_SCRIPT.md — TenderSaarthi 5-Minute Walkthrough

> Word-for-word demo script for the prototype-phase video. Practice once before recording. Time budget: 5:00 max.

## Pre-flight (do these before hitting record)

- [ ] Browser zoom set to 110% (text legible at 1080p)
- [ ] Cache pre-warmed: open every page once before recording
- [ ] Demo data loaded: `make demo` ran without errors
- [ ] Anthropic API key has budget headroom
- [ ] Tabs open in this order: admin tender upload, criteria review, bidder submission, admin submissions, verdicts, audit
- [ ] Mic levelled, screen recording at 1080p 30fps
- [ ] No notifications: turn off Slack, email, calendar

## Open with the problem (0:00 – 0:30)

> _Voice-over over a still image of a stack of procurement documents._
>
> "Government procurement evaluation in India is still a manual process. A CRPF tender for construction services pulls in dozens of bidders, each with hundreds of pages of documents — typed PDFs, scanned certificates, photographs of GST registrations, sometimes in Hindi or Kannada. A committee of officers spends days cross-checking eligibility criteria. Two evaluators reading the same documents can reach different conclusions. And every decision has to survive RTI and CAT scrutiny years later.
>
> We built TenderSaarthi to fix this — without becoming another black-box AI tool that procurement law cannot defend."

## Show the tender ingestion (0:30 – 1:30)

> _Click into the tender upload page. Drag the bundled CRPF construction tender PDF onto the dropzone._
>
> "I'm uploading a CRPF construction tender. It runs to about 40 pages with eligibility criteria scattered across technical, financial, and compliance sections."
>
> _Watch a progress indicator. After ~20 seconds the page redirects to the criteria review screen._
>
> "TenderSaarthi has extracted twelve eligibility criteria. Four mandatory, eight optional. Categorised — technical, financial, compliance, certification. Each one has its threshold parsed out as structured data, and a citation back to the page where it was found in the tender."
>
> _Hover over one criterion. The side panel shows the verbatim clause from the tender._
>
> "This is the criterion-review gate. Before any bidder is scored, a procurement officer confirms what the LLM extracted. If the model misclassified an optional requirement as mandatory, the officer fixes it once — not ten times across ten bidder evaluations. This single design choice prevents extraction errors from cascading into systemic disqualifications."
>
> _Edit one criterion's threshold. Click "Approve criteria"._
>
> "Approved. The tender is now locked and ready for bidder evaluation."

## Show the bidder evaluation (1:30 – 3:00)

> _Switch to the bidder workspace. Open the CRPF construction tender from the open-tenders list._
>
> "Now I'm switching roles. This is the bidder side. A firm sees open tenders, opens the CRPF construction tender, and submits its company details plus supporting documents for this tender."
>
> _Submit one bidder profile and upload a small bundle: turnover certificate, GST certificate, ISO certificate._
>
> "The bidder does not see other bidders, model outputs, or reviewer screens. They only submit documents and track their own submission."
>
> _Return to the admin workspace. Open the tender submissions page._
>
> "Back on the CRPF side, the officer can see that the submission has arrived and that the document pipeline is parsing it."
>
> _Show the list of 10 bidders that have been pre-loaded for the evaluation demo._
>
> "I've pre-loaded ten bidders for this demo. Each bundle is different — typed PDFs, scanned certificates, photographs, mixed English-Hindi-Kannada documents."
>
> _Click "Evaluate"._
>
> "TenderSaarthi is now parsing every bidder document. The OCR router picks the right engine per page — PaddleOCR for clean Indic scans, Claude Sonnet vision for blurry photographs, AWS Textract for tabular financial statements. Every piece of evidence carries its OCR confidence score."
>
> _The verdict matrix populates: bidders down, criteria across, color-coded cells._
>
> "Here's the verdict matrix. Six bidders are clearly eligible — green. Three are clearly ineligible — red. One is flagged for manual review — amber.
>
> The amber case is the important one. Bidder seven submitted a scanned turnover certificate. PaddleOCR returned a confidence of 0.72, below our financial-evidence floor of 0.85. The system *could not* tell with confidence whether the turnover figure meets the threshold — so it flagged the case for manual review instead of silently disqualifying. That's our second core design choice: confidence floors that make silent rejection structurally impossible."

## Drill into one verdict (3:00 – 4:00)

> _Click on a "NOT_ELIGIBLE" cell — bidder five, ISO 9001 certification._
>
> "Let's drill into a 'Not Eligible' verdict. Bidder five — ISO 9001 certification."
>
> _The side panel opens. PDF.js viewer on the right shows the bidder's certificate scan with a red bounding box around the expiry date._
>
> "TenderSaarthi found the certificate. The expiry date is 31st March 2024 — before the tender publication date. The verdict cites the exact bounding box on page 2 of the bidder's certificate scan. The reviewer can verify the source in one click."
>
> _Click on a Hindi-language document for a different bidder. Toggle the language switch._
>
> "If the source is in Hindi or Kannada, the reviewer can toggle between original and translation. The audit trail keeps both — the translation for review, the original-language text for the formal record."
>
> _Click "Override" on one verdict, type a reason, save._
>
> "If the reviewer disagrees with the verdict, they can override it. Every override is logged with the reviewer's name, the reason, and the before-and-after state. The original automated verdict is never lost — it remains in the replay log."

## Close on the audit story (4:00 – 5:00)

> _Click "Generate Audit Report"._
>
> "Once the reviewer signs off, TenderSaarthi exports the audit report."
>
> _The PDF downloads. Open it._
>
> "Every criterion. Every bidder. Every verdict. Every reviewer action. The model versions used for each LLM call. And on the last page — a SHA-256 hash of the report contents."
>
> _Run `sha256sum` on the downloaded PDF in the terminal, point at the matching hash on the page._
>
> "Tamper-evident. If anything in this report changes after sign-off, the hash breaks."
>
> _Click "Replay evaluation"._
>
> "And finally — replayability. TenderSaarthi logged every LLM call, every OCR call, with the model version, the prompt template, the input hash, and the output. Six months from now, under RTI or CAT scrutiny, the entire evaluation can be re-run and verified — or, if a model has been updated since, the diff is visible. This is the third core design choice that separates a real procurement-grade system from a generic LLM-over-PDFs demo.
>
> Criterion-review gate. Confidence floors. Replayability. Three deliberate design choices that make TenderSaarthi defensible in front of an IAS officer, a CAT bench, or an RTI applicant.
>
> Built for CRPF. Designed to extend to CPWD, Railways, PSUs, and state procurement at India scale. Thank you."

## Recording tips

- Pause cuts are fine — no need for a single take.
- Record narration first against a static screen if voice quality matters more than tight cursor motion.
- For the loading screens, speed up to 1.5x in post — don't make a judge watch a real progress bar.
- Trim aggressively. 5:00 is a hard cap; 4:30 is better.

## Backup plan

If the live demo fails at recording time, fall back to:
1. Pre-generated screenshots of every step.
2. Voice-over against the screenshots.
3. The pre-built audit PDF as a downloadable artifact.

Test this fallback before Wednesday of submission week.

## Checklist before upload

- [ ] Total runtime under 5:00
- [ ] Audio levels consistent across cuts
- [ ] No keys, secrets, or personal info visible on screen
- [ ] Captions auto-generated on YouTube and reviewed for accuracy
- [ ] Video uploaded as **unlisted** (not private — the link must be openable by judges)
- [ ] Link copied into the HackerEarth submission form
- [ ] Backup copy uploaded to a second host (Google Drive shareable link)
