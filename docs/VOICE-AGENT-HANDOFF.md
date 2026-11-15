# Voice-assistant thread handoff

## Mission

Implement and verify the bounded voice-assistant vertical slice described in [`ADR-003`](adr/ADR-003-voice-assistant-vertical-slice.md). Start from the latest `main` branch. The goal is a dependable presentation-ready interaction, not an always-on assistant.

The full executable contract is [`NEXT-MEATY-GOAL-VOICE-ASSISTANT-END-TO-END.md`](NEXT-MEATY-GOAL-VOICE-ASSISTANT-END-TO-END.md).

## First steps

```sh
cd /home/mehta/neuro-divergent
git switch main
git pull --ff-only origin main
cd communication-tool
npm run beta:release-audit
npm test
```

If the browser test host lacks `libnspr4.so`, use the documented `PHRASE_STUDIO_BROWSER_LIBS` override in `qa/verification.md` and record the environment condition.

## Existing implementation to inspect

- `communication-tool/index.html`
- `communication-tool/app.mjs` or the current UI entry modules
- `communication-tool/voice*.mjs` and speech-related references found with `rg -n "speech|Speech|voice|dictat|read aloud|recogn" .`
- `communication-tool/firewall.js`
- `communication-tool/tests/assistant.test.cjs`
- `communication-tool/tests/translation-workflow.test.cjs`
- `communication-tool/tests/product-contract.test.cjs`
- `communication-tool/README.md`

Do not assume a filename from this handoff is present; inspect the current runtime map first.

## Deliverables

1. A clear voice-entry control with explicit start/stop/cancel states.
2. An editable transcript review surface.
3. Read-aloud controls with stop/replay behavior.
4. A safe fallback when speech recognition is unavailable or permission is denied.
5. Optional reviewed “Help me reply” handoff using the existing provider contract.
6. Tests for success, cancellation, denial, error, duplicate completion, and offline/provider boundaries.
7. A short `docs/voice-demo-notes.md` or equivalent describing the exact demo path and known browser support limits.

The current demo notes are [`communication-tool/docs/voice-demo-notes.md`](../communication-tool/docs/voice-demo-notes.md).

## Current shared-runtime checkpoint

The voice branch now extends the review-first implementation to **Add card by
voice** and **Speak message**: recognition produces an editable transcript,
explicit **Stop listening**, apply, and discard controls are available, and
text is not inserted before review. The shared voice tools also expose
**Stop speaking** for read-aloud. Contract and browser workflow tests cover the
review gates and unsupported-browser fallback. A live device voice run remains
host-dependent and is still required before claiming broad support.

The focused verification currently passes:

- `node --test tests/voice-review-contract.test.cjs` — six tests pass;
- `node --test tests/voice-workflow.test.cjs` with the pinned Chromium — card
  review, reply review, read-aloud stop, and unsupported-browser fallback pass;
- `npm run beta:release-audit` — beta-ready with documented environment limits.

The broader product-contract suite still has a pre-existing repository artifact
blocker: `ai-evaluation/results/research-package-manifest.json` is absent, and
`npm run research:package` cannot regenerate it until the older pre-human audit
artifacts listed by `scripts/research-package.mjs` are restored or regenerated.
This is unrelated to the voice implementation and must be resolved before
claiming the entire repository test suite is green.

## Ownership

The voice thread owns voice-specific UI, state, tests, and documentation. It may make small shared-style changes needed for voice states. It should not redesign the entire application or change persistent schema/provider contracts without coordinating with the backend owner.

## Hard boundaries

- no always-on listening;
- no raw audio persistence;
- no automatic save, send, or share;
- no silent provider request;
- no removal of typed/touch alternatives;
- no claims that browser speech APIs work identically across devices;
- no participant or clinical claims from the demo.

## Definition of done

- `npm test` passes, or the exact host blocker is documented;
- `npm run beta:release-audit` passes;
- the voice journey is manually demonstrated with fictional text;
- permission denial and unsupported-browser paths are visible and usable;
- the diff is reviewed against ADR-003;
- the branch is pushed and a merge summary identifies changed files, tests, screenshots, and unresolved limits.

## Suggested branch and merge protocol

Use a descriptive branch such as `codex/voice-assistant-vertical-slice`. Rebase or fast-forward from `main` before handoff. Do not merge unrelated frontend redesign commits into this branch. Open the merge with the ADR, acceptance results, and demo notes linked in the commit message or pull request description.
