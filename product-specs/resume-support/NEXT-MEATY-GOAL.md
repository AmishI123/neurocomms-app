# Next meaty end-to-end goal: build and verify Resume Support v0.1

Turn the data-driven specification into a usable, local-first browser product that helps a person resume an interrupted task in under one minute, then prove that the implementation preserves user control and privacy under adversarial scenarios.

## Product promise

The user opens Resume Support, captures what they were trying to do, chooses one smallest restart step, and optionally sets a short-lived prompt. The product keeps the information on the device, makes retention visible, and lets the user skip, snooze, export, undo, or delete at every meaningful point. It never requires an ADHD/autism diagnosis and never turns attention into a score.

## Definition of done

### 1. Implement the product slice

- Create `product-specs/resume-support/prototype/` as a standalone static app that runs without a server or account.
- Implement the four states: capture, smallest-step choice, optional prompt, and quiet completion.
- Persist only the minimum item data locally; default unfinished-item retention to seven days.
- Add per-item delete, clear-all, undo, export-before-delete, retention display, and an explicit local-storage explanation.
- Make prompts off by default, non-recurring, and bounded to 24 hours.

### 2. Make the interaction accessible and calm

- Keyboard-only flow completes capture → step → prompt → save.
- Every control has a visible label and focus state; focus changes are intentional and testable.
- Respect `prefers-reduced-motion`, support mobile widths, and avoid color-only status cues.
- Use non-shaming copy and provide skip/snooze paths without asking for justification.

### 3. Prove the safety contract

- Add a static audit that fails on `fetch`, XHR, beacon, analytics SDKs, remote scripts, or unexpected storage keys.
- Add browser checks for delete, clear-all, undo, export, expiry, and prompt expiry.
- Verify that no diagnosis, employer, mood, or productivity-score field is required or persisted.

### 4. Run the scenario suite

- Execute all eight scenarios in `SCENARIOS.json`: interruption, initiation freeze, low energy, sensory load, workplace privacy, delete/undo, expiry, and no-network operation.
- Write `scenario-results.json` with step-level evidence and pass/fail status.
- Require 8/8 scenario passes, zero network calls, and zero required sensitive fields before calling the build ready.

### 5. Produce a reviewable release

- Generate `prototype-review.html` with screenshots or captured states, scenario results, privacy audit, known limitations, and the next decision.
- Link the review page from the product spec and `product-specs/README.md`.
- Package the prototype with a reproducible command and record the commit, browser/runtime versions, and checksum.

## Decision gates

- **Build:** all eight scenarios pass, privacy audit is clean, and the core flow takes no more than three decisions.
- **Revise:** any control is difficult to find, a prompt can recur without explicit consent, expiry is unclear, or low-energy/sensory scenarios force completion.
- **Stop:** data leaves the device, the product introduces diagnosis or clinical claims, or the flow cannot produce a concrete restart step without increasing cognitive load.

## Evidence boundary

The 271-record resume signal and adjacent pacing/accommodation signals justify this prototype as the next test. They do not prove clinical benefit, prevalence, or user preference. This milestone produces engineering and proxy evidence; consented participant validation remains the next evidence upgrade before high-confidence claims.

## Exact handoff

Start in [PRODUCT-SPEC.md](PRODUCT-SPEC.md), use [SCENARIOS.json](SCENARIOS.json) as the test contract, and keep all implementation and review artifacts inside this product folder. Do not modify unrelated work in the repository root while building this slice.
