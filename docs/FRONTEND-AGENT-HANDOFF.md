# Frontend-agent handoff

## Mission

Polish the existing `communication-tool/` experience for the Sunday presentation and the next internal beta review. Improve clarity, responsive behavior, visual hierarchy, accessibility affordances, and demo flow without changing the evidence or safety claims.

This is a separate thread from the voice-assistant vertical slice. Coordinate through the shared contracts and [`ADR-003`](adr/ADR-003-voice-assistant-vertical-slice.md); do not duplicate or replace the voice thread’s implementation.

## Start here

1. Read the root [`AGENTS.md`](../AGENTS.md) and [`PROJECT-STATUS.md`](../PROJECT-STATUS.md).
2. Read [`ADR-002`](adr/ADR-002-product-direction-and-support.md).
3. Run `npm run beta:release-audit` from `communication-tool/`.
4. Serve the app with `npm start` and walk through the presentation path in [`PRESENTATION-RUNBOOK-SUNDAY.md`](PRESENTATION-RUNBOOK-SUNDAY.md).

## Safe frontend scope

- Mobile-first layout, type scale, spacing, contrast, focus states, and empty/error/loading states.
- Clear distinction between source evidence, inference, user confirmation, and assistant suggestion.
- Better first-run orientation and a shorter demo path.
- Visual polish for Study Bridge, Context Anchor, Phrase Studio, Quick Board, and communication card.
- Keyboard navigation and reduced-motion improvements.
- Presentation screenshots or a self-contained visual walkthrough.

## Do not change

- The confirmation boundary for saved plans.
- Offline/local-first default.
- Provider opt-in, redaction, preview, and no-automatic-send behavior.
- The distinction between fictional evaluation and human evidence.
- Export/erase semantics or the local storage model without a backend/data-contract review.
- Claims in the UI that imply clinical, educational, or market validation.

## Required handoff output

- changed files and screenshots;
- before/after notes tied to a user task;
- `npm test` result or the exact environment blocker;
- `npm run beta:release-audit` result;
- any changed contract or copy that needs review by the backend/data owner.

## Definition of done

- The primary Study Bridge → Phrase Studio journey is understandable without narration.
- The layout works at phone and desktop widths.
- Focus, keyboard, contrast, text-size, reduced-motion, and error states remain usable.
- Voice controls, when present, have room for explicit listening/processing/error states.
- `npm run beta:release-audit` passes.
- `npm test` passes, or the exact host blocker is documented.
- Screenshots show the before/after result and use fictional content only.
- The branch is pushed with a concise file/test/known-limits summary.

## Suggested branch and merge protocol

Use a descriptive branch such as `codex/frontend-presentation-polish`. Start from the latest `main`, keep the diff focused on UI/UX, and do not absorb unrelated backend or voice changes. Before handoff, rebase or fast-forward from `main`, run the release audit, and list any contract changes for the backend owner.

## Suggested presentation polish order

1. Home/start screen: make the product promise and privacy boundary immediately legible.
2. Study Bridge: show source → uncertainty → confirmation in one compact sequence.
3. Pause/resume: make recovery visible and memorable.
4. Phrase Studio: show the user reviewing and choosing wording rather than accepting automation.
5. Quick Board/communication card: show the practical output.

Avoid broad refactors before Sunday. Prefer small, reversible UI changes.
