# Next meaty end-to-end goal: production-ready controlled release

## Objective

Take the fictional, local-first Phrase Studio / Study Bridge platform from a
collection of working surfaces to one production-ready controlled release.
The release must be reproducible from a clean checkout, safe to inspect with
fictional data, explicit about what it stores and shares, resilient to
interruption and failure, and honest about what has not yet been proven with
people or real devices.

In this goal, **production-ready** means engineering-ready for a bounded,
reviewed release candidate. It does not mean approved for children, clinical
use, emergency support, unsupervised community operation, or a claim of human
benefit.

The product journey is:

`fictional source or communication need`
→ `local import and provenance review`
→ `user-confirmed plan`
→ `small next action`
→ `pause, resume, edit and recover`
→ `reviewable communication material`
→ `optional typed or voice interaction`
→ `explicit copy, save or export`
→ `redacted release evidence`

## Product boundary

The first release is the local-first web/PWA package in `communication-tool/`.
The community server, Android shell, iOS shell, optional AI providers, and
human pilot are separate release tracks. They may be audited in this goal, but
none may be described as production-approved merely because the web package
passes.

The release must preserve these boundaries:

- No task, card, message, post, or export is created without an explicit user
  action.
- Nothing is automatically sent, submitted, posted, or shared.
- Raw pasted or imported source remains local unless the user chooses a clearly
  labelled personal export; research exports contain no raw source.
- AI is off by default, opt-in, redacted before a request, previewed before
  transmission, bounded by deterministic contracts, and never allowed to
  override confirmation.
- Microphone access starts only after a user tap; transcripts are editable;
  audio is not retained.
- The product does not ask for, infer, display, or match on diagnosis.
- Fixtures, screenshots, logs, reports, and packages contain fictional data
  only.
- Deletion, backup, restore, pause, resume, and stale-state behavior are
  visible and testable.

## Workstreams

### 1. Canonical journey and state contract

- Define the canonical state machine for import, extraction, review,
  confirmation, work, pause/resume, completion, communication draft, export,
  deletion, and recovery.
- Give each state a stable schema, version, provenance record, and migration
  rule.
- Prove that unconfirmed suggestions cannot become confirmed commitments after
  reload, stale-tab writes, failed saves, or restore.
- Ensure all surfaces use the same data contract rather than copying partial
  state into feature-specific storage.
- Document which state is local-only, exportable, recoverable, or intentionally
  erased.

### 2. End-to-end browser acceptance

- Build the production bundle and serve `dist/` over HTTP.
- Automate the complete Sunday demo and every journey in
  `NEXT-MEATY-GOAL-END-TO-END-JOURNEYS.md`.
- Run at 390×844, 320×700, and 1280×800; with keyboard only, largest text,
  high contrast, reduced motion, reloads, fresh contexts, and offline mode.
- Fail on page errors, console errors, unexpected external requests, keyboard
  traps, horizontal overflow, clipped content, undersized controls, and focus
  loss.
- Capture a small screenshot set and a plain-English report for every journey.

### 3. Failure, recovery, and data integrity

- Test interrupted writes, quota errors, malformed backups, stale tabs, partial
  restores, duplicate imports, invalid files, oversized files, empty files,
  conflicting instructions, and unavailable browser features.
- Prove that cancellation and failure preserve the last valid saved state.
- Prove that backup/restore round trips preserve approved work and omit data
  declared non-exportable.
- Prove that erase removes application data and owned service-worker caches,
  with an explicit statement about what the browser or operating system may
  retain outside the app's control.
- Add migration tests for every persisted schema version in the release.

### 4. Privacy, security, and supply-chain review

- Inventory every storage location, export, request, permission, dependency,
  cache, log, and generated artifact.
- Add negative tests for raw-source leakage, URL/share leakage, prompt
  injection, unredacted AI requests, accidental auto-send, diagnosis fields,
  community cross-room visibility, and unsafe recovery links.
- Verify that package contents contain no credentials, personal data, local
  model weights, hidden network endpoints, or development-only fixtures.
- Pin or record dependency versions and generate a release manifest with file
  hashes, source revision, build command, environment, and known exceptions.
- Define a vulnerability-reporting path, incident owner, rollback procedure,
  and supported release scope before publishing.

### 5. Cross-surface and deployment parity

- Build the web/PWA and mobile bundles from the same declared source allowlist.
- Compare confirmation, privacy, deletion, offline, export, and no-auto-send
  behavior across web, Android, and iOS handoff artifacts.
- Run the community API only with fictional identities and explicit server
  configuration; fail closed when authentication, consent, role, moderation,
  or provider dependencies are unavailable.
- Record physical Android, iOS/Xcode, Safari, screen-reader, microphone, and
  install limitations as environment-limited gates when unavailable here.
- Verify the deployed static site against the exact release manifest, not just
  the local source tree.

### 6. Operational readiness

- Provide clean-checkout setup and preflight commands with actionable errors.
- Provide release, rollback, backup/restore, cache invalidation, incident, and
  support runbooks.
- Define what is monitored, what is never logged, and how a release is stopped
  without destroying safety or audit records.
- State the supported browsers, data-retention behavior, offline guarantees,
  known limitations, and contact path in user-facing language.
- Produce one release dashboard/report with separate statuses for software,
  reproducibility, privacy/safety, device execution, human validation, and
  safeguarding approval.

### 7. Human and safeguarding gates

These gates cannot be satisfied by the coding agent or by synthetic tests:

- named product, privacy, security, and safeguarding owners review the release;
- legal/privacy review covers the intended jurisdiction and data flows;
- accessibility review includes people using relevant assistive technology;
- any child/community pilot has an approved protocol, consent/assent process,
  trained moderation, stop rules, incident response, and support resources;
- human benefit, demand, clinical, educational, and native-device claims are
  made only from appropriate evidence.

## Required artifacts

1. `communication-tool/qa/end-to-end/REPORT.md` — journey results, bugs,
   fixes, screenshots, environment limits, and remaining risks.
2. `communication-tool/qa/production-readiness-report.md` — gate-by-gate
   decision with evidence links and separate human-approval status.
3. `communication-tool/qa/production-readiness.json` — machine-readable gate
   results; no aggregate green status may hide an unresolved blocker.
4. The output of `npm run release:artifact-manifest`, currently
   `communication-tool/ai-evaluation/results/release-artifact-manifest.json`,
   plus a SHA-256 sidecar — source revision, package files, hashes, build
   command, and environment. If the output location changes, update the
   command and this artifact together.
5. `communication-tool/docs/production-runbook.md` — install, preflight,
   deploy, rollback, backup, erase, incident, and support procedures.
6. A clean-checkout transcript showing the exact commands and results.
7. A short limitations and claims page stating what is and is not proven.

## Definition of done

This goal is complete only when:

1. A clean checkout can install, preflight, build, test, package, and serve the
   release without undocumented session state.
2. The full fictional journey passes against the built artifact at all required
   sizes and accessibility modes.
3. Recovery, deletion, backup/restore, migration, offline, and failure paths
   have passing automated checks and human-readable evidence.
4. Privacy and security negative tests demonstrate that unsafe actions and data
   leaks are blocked.
5. Web/PWA/mobile artifacts have a reproducible manifest and documented parity
   or explicit environment-limited exceptions.
6. Deployment, rollback, incident, support, and data-retention runbooks are
   executable by someone other than the author.
7. The release report separates engineering readiness from human validation,
   safeguarding, legal/privacy, and real-device approval.
8. No open critical or high-risk defect is hidden behind a skipped test,
   invented reviewer result, or vague “known limitation.”
9. The exact release is published only after the required human owners approve
   the applicable release track.

## Required checks

From `communication-tool/`:

```sh
npm run browser:preflight
npm run build:mobile
npm test
npm run presentation:demo-check
npm run presentation:release-audit
npm run beta:release-audit
npm run study-bridge:release-audit
npm run study-bridge:adversarial-audit
npm run platform:audit
npm run mobile:acceptance
npm run native:environment-audit
npm run release:artifact-manifest
npm run release:self-review
```

Run community checks only when the community release track is in scope:

```sh
npm run community:release-audit
npm run community:production-audit
npm run community:recovery-check
npm run community:api:test
npm run community:server:test
npm run community:integration:test
```

An unavailable browser library, device, simulator, microphone, screen reader,
or Xcode toolchain is an explicit environment result. It is not permission to
claim that gate passed.

## Non-goals

- launching an unsupervised service for children;
- collecting real child, health, school, or community data;
- claiming clinical, educational, accessibility, or market benefit;
- inventing human reviewers, pilot results, approvals, or publication status;
- adding automatic sending, diagnosis, surveillance, engagement optimization,
  or autonomous agent behavior;
- merging My Visit Notes into Phrase Studio;
- treating a passing synthetic benchmark as user validation.

## First execution gate

Start from a clean worktree and run the preflight, build, and full test suite.
Record every failure before fixing it. Then implement the canonical state and
release manifest, run the adversarial privacy/recovery checks, and only after
those pass begin the complete browser journey matrix. Do not publish or invite
real users until the engineering report and the required human-owner gates are
explicitly signed off.

## Handoff

Finish with the exact release commit, manifest hash, test transcript, journey
report, production-readiness decision, deployment URL if approved, rollback
instructions, open risks, named owners, and the list of checks a person must
still perform on a real phone, with a real screen reader, and with a real
microphone.
