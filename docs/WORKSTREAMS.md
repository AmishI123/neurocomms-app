# Workstreams and ownership

## Current presentation product

**Owner:** shared; frontend agent for UI, backend owner for contracts/data.

**Runtime:** `communication-tool/`

**Story:** Study Bridge + Phrase Studio help a person inspect information, confirm a next step, recover after interruption, and prepare a reviewable communication artifact.

## Frontend polish

**Owner:** frontend agent.

**Files:** `communication-tool/index.html`, `style.css`, `mobile-experience.css`, UI-facing runtime modules, `tests/`.

**Goal:** a calm, legible, responsive Sunday demo and a coherent internal beta experience.

**Boundary:** no changes to privacy, confirmation, provenance, persistence, or provider contracts without review.

## Voice assistant vertical slice

**Owner:** dedicated voice thread.

**Decision record:** [`ADR-003`](adr/ADR-003-voice-assistant-vertical-slice.md).

**Handoff:** [`VOICE-AGENT-HANDOFF.md`](VOICE-AGENT-HANDOFF.md).

**Goal:** explicit voice input, editable transcript, controllable read-aloud, safe fallback, and optional reviewed reply assistance.

**Boundary:** no always-on listening, raw-audio storage, silent provider calls, automatic sending, or diagnosis/intent inference.

## Backend/data and intelligence boundary

**Owner:** backend owner.

**Files:** document adapters, `study-workspace*.mjs`, `context-anchor.mjs`, `device-*.mjs`, `firewall.js`, local AI/proxy scripts, migrations, audits, and contract tests.

**Goal:** stable local data contracts, source grounding, recovery, privacy, bounded provider calls, and reproducible evaluation.

**Boundary:** there is no hosted production service in this checkout.

## Safety-first community layer

**Owner:** new community/safeguarding thread, with backend, frontend, voice, and research contributors.

**Specification:** [`community-layer-spec.md`](community-layer-spec.md).

**Decision record:** [`adr/ADR-004-community-layer-safety-first.md`](adr/ADR-004-community-layer-safety-first.md).

**Threat model:** [`community-layer-threat-model.md`](community-layer-threat-model.md).

**Handoff:** [`COMMUNITY-LAYER-AGENT-HANDOFF.md`](COMMUNITY-LAYER-AGENT-HANDOFF.md).

**Goal:** prototype moderated, age-banded, pseudonymous group participation and bounded trusted-adult support without open DMs, adult discovery, diagnosis disclosure, or engagement optimization.

**Boundary:** no real child data, recruitment, public launch, under-13 accounts, crisis-care claims, or production moderation operation until safeguarding ownership, legal/privacy review, trained moderation, and an approved pilot protocol exist.

**Production goal:** [`COMMUNITY-PRODUCTION-READINESS-GOAL.md`](COMMUNITY-PRODUCTION-READINESS-GOAL.md).

**API handoff:** [`COMMUNITY-PRODUCTION-API.md`](COMMUNITY-PRODUCTION-API.md).

**Incident response:** [`COMMUNITY-INCIDENT-RESPONSE.md`](COMMUNITY-INCIDENT-RESPONSE.md).

**Readiness ledger:** [`COMMUNITY-PRODUCTION-READINESS-CHECKLIST.md`](COMMUNITY-PRODUCTION-READINESS-CHECKLIST.md).

## Shared integration and release

**Owner:** integration thread.

**Goal:** [`NEXT-MEATY-GOAL-PRESENTATION-READY-PLATFORM-RELEASE.md`](NEXT-MEATY-GOAL-PRESENTATION-READY-PLATFORM-RELEASE.md).

**Responsibilities:** canonical journey state, cross-surface contracts, release audit, demo fixtures, presentation evidence, and final merge coordination.

## Evidence and research

**Owner:** research/product owner.

**Files:** `product-specs/opportunity-atlas/`, `communication-tool/docs/market-assessment/`, root research records, and the two ADRs.

**Goal:** preserve the link from evidence to product decisions without overclaiming.

## My Visit Notes

**Owner:** separate product track.

**Files:** `product-specs/my-visit-notes/`, `my-visit-notes-mobile/`, and related root goal records.

**Goal:** appointment question preparation, continuity, and recovery.

**Boundary:** do not silently merge its state model into Phrase Studio/Study Bridge.

## Public lab and benchmarks

**Owner:** research/release maintenance.

**Files:** `public-lab/`, `benchmark/`, `benchmark-v2/`, `benchmark-v3/`, `site/`.

**Goal:** reproducible fictional evaluation and public technical artifacts.

**Boundary:** these are not participant evidence or product-benefit proof.
