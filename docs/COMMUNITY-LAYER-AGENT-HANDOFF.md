# Community Layer Agent Handoff

## Mission

Turn the community-layer specification into a reviewable, safety-first vertical slice without opening unsafe social contact. Start with backend contracts, fixture-driven moderation, and a local-only prototype; do not build production child messaging yet.

## Workstreams

### Backend/integration owner

- define typed community account, room, post, report, support-link, and moderation-event schemas;
- enforce age-band and role boundaries server-side;
- expose room-post/reply/report/block operations only;
- add retention, audit, and aggregate-telemetry contracts;
- build deterministic safety fixtures and fail-closed validators;
- write ADRs for age assurance, trusted-adult scope, moderation, and data retention.

### Frontend owner

- build a local fixture UI for room rules, post templates, review state, report/block/mute, and support-link scope;
- make safety state visible without alarmist language;
- test keyboard, screen-reader, large-text, high-contrast, reduced-motion, and sensory preferences;
- never add DMs, follower counts, rankings, location, or open user search.

### Voice owner

- support local voice-note drafting only;
- show editable transcript and explicit “post to room” confirmation;
- never publish recognition output automatically;
- provide discard, retry, and report/help pathways;
- document microphone permission and recording-retention boundaries.

### Research/safeguarding owner

- complete the jurisdiction matrix and DPIA inputs;
- recruit an independent child-safety reviewer before any real child pilot;
- co-design room rules, language, and support pathways with neurodivergent young people and safeguarding professionals;
- maintain a live policy/response runbook and red-team corpus.

## First implementation milestone

Deliver a fictional local-only vertical slice:

`join age-banded room → read rules → compose bounded post → hold for moderation → moderator decision → reply in room → report/block → request bounded trusted-adult link → export aggregate evidence`

Acceptance requires no network send, no child DM route, no raw content in aggregate exports, and complete audit evidence for every safety decision.

## Do not infer authorization

This handoff does not authorize recruiting minors, launching a public community, collecting real child data, contacting schools or families, or claiming compliance. Those require explicit governance, legal review, safeguarding ownership, and a separately approved pilot protocol.
