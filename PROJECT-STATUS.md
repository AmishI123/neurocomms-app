# Project status and navigation

Updated for the Sunday presentation handoff.

## Current decision

The repository is ready to hand to a frontend agent for controlled polish while backend/data-boundary work continues. The defensible presentation claim is:

> We built and verified an internal, local-first engineering beta that helps a person turn confusing instructions or communication needs into a confirmed, resumable, reviewable plan. We have not yet demonstrated human benefit, market demand, clinical benefit, or native-device usability.

## What exists

| Area | Location | Status |
| --- | --- | --- |
| Background research and opportunity framing | `product-specs/opportunity-atlas/`, `communication-tool/docs/market-assessment/` | Substantial evidence package; limitations documented |
| Product direction | `docs/adr/`, `product-specs/my-visit-notes/`, `communication-tool/docs/end-to-end-goal.md` | Decisions documented |
| Web product | `communication-tool/` | Local-first prototype/beta; release audit passes within environment limits |
| Voice slice | [`docs/adr/ADR-003-voice-assistant-vertical-slice.md`](docs/adr/ADR-003-voice-assistant-vertical-slice.md), [`docs/VOICE-AGENT-HANDOFF.md`](docs/VOICE-AGENT-HANDOFF.md), [`docs/NEXT-MEATY-GOAL-VOICE-ASSISTANT-END-TO-END.md`](docs/NEXT-MEATY-GOAL-VOICE-ASSISTANT-END-TO-END.md) | Review-first card path implemented; live speech/device acceptance remains open |
| Shared integration/release | [`docs/NEXT-MEATY-GOAL-PRESENTATION-READY-PLATFORM-RELEASE.md`](docs/NEXT-MEATY-GOAL-PRESENTATION-READY-PLATFORM-RELEASE.md) | Active goal; unified audit and deterministic demo contract pass |
| Study Bridge workflow | `communication-tool/study-*.mjs`, `communication-tool/docs/architecture.md` | Implemented with fictional evaluation and recovery paths |
| Phrase Studio workflow | `communication-tool/index.html`, runtime modules, tests | Implemented; optional AI is opt-in and bounded |
| Native packaging | `communication-tool/android/`, `communication-tool/ios/` | Packaging/build paths exist; device/iOS runtime remains environment-dependent |
| My Visit Notes | `product-specs/my-visit-notes/`, `my-visit-notes-mobile/` | Separate product track and presentation material |
| Presentation material | `docs/PRESENTATION-RUNBOOK-SUNDAY.md`, `product-specs/*/presentation/`, `communication-tool/docs/demo-script.md` | Canonical runbook added; existing artifacts retained |

## What is proven vs not proven

### Proven within this checkout

- Local-first web workflow and offline-oriented storage paths.
- Source-grounded requirement review, visible uncertainty, explicit confirmation, and resumable work.
- Local backup/restore/erase paths and privacy boundary checks.
- Optional provider contract, redaction, preview, and no-automatic-send behavior.
- Fictional evaluation, release audits, and deterministic contract tests.
- Deterministic presentation fixture and operator path in `communication-tool/examples/presentation-demo-fixture.json`; `npm run presentation:demo-check` passes.

### Not proven

- Human usability, accessibility with screen-reader users, clinical outcomes, educational outcomes, or market demand.
- That Reddit themes represent the wider population.
- That personal experience or published studies validate this exact product.
- A production hosted backend or a secure-disk deletion guarantee.
- Native Android interaction on a real device or iOS compilation on this Linux host.
- Full browser suite on this host until the documented Chromium shared libraries are installed; the non-browser product, handoff, backup, voice, and mobile-bundle checks pass.

## Where an agent should work

- Frontend polish: `communication-tool/` plus [`docs/FRONTEND-AGENT-HANDOFF.md`](docs/FRONTEND-AGENT-HANDOFF.md).
- Backend/data contracts and local AI boundary: [`docs/BACKEND-OWNERSHIP-AND-API.md`](docs/BACKEND-OWNERSHIP-AND-API.md).
- Research interpretation: `product-specs/opportunity-atlas/` and `communication-tool/docs/market-assessment/`.
- My Visit Notes only: `product-specs/my-visit-notes/` and `my-visit-notes-mobile/`.

## Current git state

The canonical branch is `main`, currently aligned with `origin/main` at `fdc6952`. The unified `npm run presentation:release-audit` passes. Always re-check status before committing because other agents may be working in parallel.
