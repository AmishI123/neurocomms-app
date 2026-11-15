# Meaty end-to-end goal: presentation-ready platform release

## Status

Active implementation goal. The voice and frontend threads are parallel contributors; this goal owns the shared local data contracts, integration, release evidence, and final demo handoff.

## Objective

Deliver one coherent, reproducible, presentation-ready local-first platform release in which a fictional user can move from confusing information or a communication need to a confirmed, resumable next action and a reviewed communication artifact—without raw source leakage, silent automation, or unsupported product claims.

## Complete journey

`fictional instructions or communication need`
→ `local input/import`
→ `source-grounded requirements and visible uncertainty`
→ `user confirmation or rejection`
→ `small next action`
→ `pause and resume with context`
→ `reviewable Phrase Studio communication draft`
→ `optional voice or typed interaction`
→ `user-approved read/copy/save/export`
→ `redacted engineering evidence`

## Why this is the next goal

The repository already contains substantial runtime pieces, research, audits, and product experiments. The remaining risk is integration: a feature can pass in isolation while the end-to-end story, persisted state, recovery behavior, privacy boundary, bundle, and presentation disagree. This goal joins the existing pieces into one inspectable release rather than adding another disconnected feature family.

## Workstreams

### Shared data and integration

- define the canonical journey states and transitions;
- preserve provenance, uncertainty, confirmation, and user edits;
- make pause/resume and recovery stable across reloads;
- connect confirmed Study Bridge work to reviewable Phrase Studio drafts;
- preserve typed/touch/voice alternatives without changing the underlying contract.

### Privacy and safety

- keep raw source local unless a separate explicit personal export is chosen;
- keep research/evidence exports source-free;
- require confirmation before a requirement becomes a plan commitment;
- keep provider calls opt-in, redacted, bounded, and reviewable;
- ensure no automatic message sending, submission, diagnosis, or intent inference.

### Release and presentation evidence

- create one unified release-readiness report;
- verify web bundle equality and offline/cache recovery;
- run Study Bridge, platform, beta, and relevant product-contract audits;
- record browser/native environment limits separately;
- provide a repeatable fictional demo script, screenshots, and architecture explanation.

## Required implementation outcomes

1. A single canonical journey report exists and points to the underlying audit artifacts.
2. A clean browser session can complete the fictional journey from source review through confirmation, recovery, communication draft, and export.
3. A reload or interruption does not silently lose confirmed work or convert an unconfirmed item into a commitment.
4. The communication handoff remains unsent and editable.
5. Voice and frontend branches can merge without changing the shared state/privacy contract.
6. The packaged web/mobile runtime matches the declared source allowlist.
7. Release evidence clearly distinguishes software verification, synthetic evaluation, public-source research, and human evidence.

## Definition of done

The goal is complete when:

- the canonical journey is implemented and manually repeatable with fictional data;
- state, recovery, backup/restore, erase, provenance, and confirmation contracts have passing tests;
- the unified release audit passes or explicitly reports environment-limited gates;
- the frontend and voice handoffs are integrated without regressions;
- the demo can be run from a clean checkout using documented commands;
- the presentation package includes the research-to-product chain, live flow, architecture, verified capabilities, and limitations;
- no claim of human usefulness, clinical benefit, accessibility benefit, market demand, or native-device acceptance is made without corresponding evidence.

## Required checks

From `communication-tool/`:

```sh
npm run presentation:demo-check
npm run presentation:release-audit
npm test
npm run beta:release-audit
npm run study-bridge:release-audit
npm run platform:audit
```

If the host lacks browser shared libraries, use the documented `PHRASE_STUDIO_BROWSER_LIBS` override. If native hardware or Xcode is unavailable, retain the environment-limited result instead of claiming native acceptance.

Current verification snapshot: the deterministic demo, unified release audit,
beta audit, Study Bridge release audit, platform audit, cross-surface browser
journeys, 28-case adversarial recovery suite, mobile bundle audit, typed
handoff, backup/restore, product-contract, accessibility, and voice checks
pass. The browser audit wrappers now isolate heavy files and parse the current
Node test output. Native-device execution, iOS/Xcode, human review, and
market/benefit claims remain explicitly open.

## Non-goals

- building a hosted production backend this week;
- collecting participant or child data;
- claiming that Reddit or other public discussions establish prevalence or demand;
- adding autonomous agent behavior to the product;
- replacing AAC, speech, writing, signing, or professional support;
- automatic sending, posting, submission, diagnosis, or surveillance;
- merging the separate My Visit Notes product into this runtime.

## Handoff artifacts

- current product status and workstream map;
- ADR-001, ADR-002, and ADR-003;
- frontend and voice agent handoffs;
- backend/data contract handoff;
- unified machine-readable and plain-language release report;
- fictional demo script and presentation runbook;
- exact commit, test output, known environment limits, and remaining human-validation gates.
