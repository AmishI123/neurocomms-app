# Sunday presentation runbook

## Core message

We are building a cognitive-accessibility workspace for moments when information, memory, communication, and recovery are difficult. The system helps a person go from fragmented instructions or a difficult conversation to a confirmed, resumable, reviewable next step—while keeping the person in control.

## Suggested 10-minute story

### 1. Why this exists — 90 seconds

Explain that the project started from personal experience and was then widened with public Reddit discussions, published research, and market/alternative review. Be precise: these sources shaped hypotheses and design requirements; they do not prove prevalence, demand, or benefit.

### 2. The problem — 60 seconds

Show the recurring pattern: information arrives fragmented, uncertainty is mistaken for fact, interruptions erase context, and communication requires repeated explanation.

### 3. The product loop — 3 minutes

Use a fictional academic instruction or visit scenario:

1. import or enter the material locally;
2. show extracted requirements with source and uncertainty;
3. confirm or reject an item;
4. choose the next small action;
5. pause and resume using the recovery card;
6. prepare a clarification or support message;
7. export privately without automatic sending.

### 4. Communication support — 90 seconds

Show Next Step or the communication card. Emphasize that suggestions are candidates for review, not an assistant speaking for the person. Show the Quick Board only if the flow is stable.

### 5. What is technically real — 90 seconds

Mention local-first storage, offline behavior, provenance, confirmation, recovery, backup/restore/erase, opt-in provider boundary, and the passing release audit. Do not imply that a passing audit is a human study.

### 6. Honest limits and next step — 90 seconds

State plainly: human usability, screen-reader-user accessibility, clinical/educational outcomes, market demand, and complete native-device acceptance remain open. The next gate is domain-reviewed human-centered validation.

## Demo preparation

For the live demo, follow the click-by-click [`DEMO-CLICK-SCRIPT.md`](DEMO-CLICK-SCRIPT.md).

From `communication-tool/`:

```sh
npm run presentation:demo-check
npm run presentation:release-audit
npm run beta:release-audit
npm start
```

`examples/presentation-demo-fixture.json` is the canonical fictional input for
the walkthrough. The demo contract checks that it contains the expected
signals and that the operator path is complete. `presentation:release-audit`
is the canonical pre-presentation gate. It runs the Study Bridge, platform,
local-beta, and demo-contract checks together and writes
`ai-evaluation/results/presentation-release-audit.json`, plus the matching
Markdown and HTML handoff reports. The report is a software release decision
with explicit environment limits, not evidence of human benefit.

Use fictional content only. Open the browser at `http://127.0.0.1:8765`. Keep a backup screenshot or screen recording of the successful path. If browser tests fail because the host lacks `libnspr4.so`, use the documented `PHRASE_STUDIO_BROWSER_LIBS` environment override and report the environment condition honestly.

For a repeatable walkthrough, paste the `sourceText` from
`examples/presentation-demo-fixture.json`, then follow the exact
`operatorPath`: import, review, confirm, pause, draft clarification, resume,
and export a redacted plan. The expected actions and boundary checks in that
fixture are the presenter’s acceptance checklist. Never paste private or
participant material into the demo.

## Slide sequence

1. Title: “From fragmented information to a confirmed next step.”
2. Evidence: research sources and their limits.
3. Problem pattern: uncertainty, interruption, communication load.
4. Product loop diagram.
5. Study Bridge walkthrough.
6. Next Step / communication card walkthrough.
7. Privacy and safety architecture.
8. What is verified today.
9. What is not yet proven.
10. Sunday ask: feedback on product direction and the human-validation plan.

## Questions to expect

- Is this an ADHD or autism diagnostic tool? No.
- Did we interview participants? Not in this package; published studies and public discussions are external evidence.
- Does AI send messages or make decisions? No; the provider is opt-in and outputs remain reviewable candidates.
- Is there a backend? Not a hosted production backend; the current system is local-first with bounded local/provider interfaces.
- Does it work on phones? Packaging exists, but native execution remains environment-dependent and should not be presented as fully accepted.
- What would prove value? Approved human-centered review with domain and accessibility oversight.

## Before Sunday: device check and five-minute test (added 18 October)

**Five-minute test with someone new.** Give two or three people the link, explain nothing, and ask only:
1. "In one sentence, what is this for?"
2. "Show me how you would start with your own assignment."
3. "Where do you think your words go?"

Write down their exact words. A wrong answer to 1, or "the internet" for 3, means the landing page needs another pass.

**On your own devices.**
- Laptop: reload twice (Cmd+Shift+R) so the newest version loads; walk the whole demo with `DEMO-CLICK-SCRIPT.md`.
- Laptop, Chrome: tap **Speak instead** on the pause note with the real microphone.
- Phone: close the tab fully, reopen the link, check the coffee-and-cream look.
- iPhone, Safari: try **Speak instead**; if it says speaking is not available, note it for questions.
- Aeroplane mode after one visit: the app should still open and work (except talking to type).
- Display & privacy: try the largest text and high contrast once.

**Voice and privacy, said accurately.** Talking to type uses the browser's own speech service (in Chrome this sends the sound to Google to turn it into words). Next Step keeps no recording, and nothing is added until the person chooses "Use these words". Reading aloud works offline.

**Rehearsal.** Stop changes Thursday night. Full timed run Friday and Saturday. Keep the deck, the Q&A sheet and the backup video open in separate tabs. If something breaks live, play the backup video and return to the slides.
