# Agent operating guide

This repository contains research, product specifications, a working local-first web application, native shells, evaluation scripts, and presentation artifacts. Start with [`PROJECT-STATUS.md`](PROJECT-STATUS.md) before changing code.

## Canonical product story

The current story is:

`fragmented instructions or difficult conversations` → `source-grounded preparation` → `user-confirmed next action` → `pause/resume and recovery` → `reviewable communication` → `private export`

The primary engineering surface for the current presentation is `communication-tool/`. It is a local-first Phrase Studio / Study Bridge workspace. My Visit Notes and the Opportunity Atlas are related research and product tracks, not interchangeable runtime modules.

## Before editing

1. Read [`PROJECT-STATUS.md`](PROJECT-STATUS.md).
2. Read the relevant ADR in [`docs/adr/`](docs/adr/).
3. Check `git status --short --branch`.
4. Run the narrowest relevant audit before and after the change.
5. Keep fictional fixtures, research evidence, and runtime code clearly separated.

## Frontend boundary

Frontend work belongs in `communication-tool/index.html`, `style.css`, the runtime modules at the repository root of `communication-tool/`, and the associated tests. The frontend agent may improve information architecture, responsive layout, accessibility, copy, loading/error states, and demo polish. It must not weaken consent, provenance, confirmation, privacy, or offline boundaries.

## Backend/data boundary

There is no hosted production backend in this checkout. The backend-adjacent scope is the local document pipeline, persistence/recovery, bounded local AI proxy, export contracts, and deterministic evaluation scripts. Keep provider calls opt-in and local by default. Never put API keys in source, fixtures, bundles, or presentation material.

## Evidence boundary

Personal experience is origin/context, not participant research. Reddit and other public discussions are self-selected qualitative evidence, not prevalence estimates. Published interview studies are external research, not interviews conducted by this project. Synthetic benchmarks and LLM judging are engineering evidence, not human usability or clinical evidence.

## Verification commands

From `communication-tool/`:

```sh
npm run beta:release-audit
npm run presentation:release-audit
npm run platform:audit
npm test
```

The browser test may require the documented `PHRASE_STUDIO_BROWSER_LIBS` override when Playwright system libraries are absent. Native execution requires an authorized device/emulator; iOS compilation requires macOS/Xcode.

## Change discipline

- Do not delete old research or presentation artifacts merely to make the tree look tidy.
- Do not merge separate product concepts into one runtime without an ADR.
- Update the canonical status or handoff document when verification status changes.
- Use small, descriptive commits. Keep generated artifacts out of source changes unless the task explicitly requires them.
