# Production-readiness goal: supervised community layer

Status: Active implementation goal
Owner: backend/integration thread, with frontend, voice, security, privacy, and safeguarding owners

## Objective

Turn the current fictional local-only community slice into a deployable, reviewable, safety-first service for neurodivergent young people and bounded support networks.

Production readiness means more than a working UI. It requires a real operating model, security and privacy controls, trained human moderation, documented safeguarding escalation, age/consent decisions, incident response, and approval by the responsible legal and safeguarding owners.

The engineering thread can implement and verify the system. It cannot self-authorize a child pilot, claim legal compliance, replace a safeguarding lead, or operate emergency response.

## Release tracks

### Track A — engineering production baseline

- Deployable API service with authenticated sessions and server-side authorization.
- Explicit roles: child, guardian, approved support adult, moderator, safeguarding lead, administrator.
- Age-band and consent state machine with fail-closed access.
- Secure database schema, encryption configuration, secret management, backups, deletion/retention jobs, and recovery tests.
- Moderation queue, policy versioning, audit trail, report status, appeals, and moderator handoff.
- Rate limiting, spam/automation controls, content-size limits, link controls, abuse detection, and account/session revocation.
- No child-to-child DMs, adult discovery, public profiles, location, diagnosis badges, rankings, or targeted advertising in the first production scope.
- Accessibility acceptance across keyboard, screen reader, text size, contrast, reduced motion, and predictable error recovery.
- Structured logs and metrics that exclude message content and sensitive child data.
- Deployment configuration, health checks, migrations, rollback, alerting, and disaster-recovery runbook.

### Track B — safeguarding and privacy readiness

- Named safeguarding owner and trained moderation rota.
- Jurisdiction matrix for age assurance, parental/guardian consent, mandatory reporting, records retention, and emergency language.
- Data protection impact assessment and child-safety risk assessment.
- Clear child-facing rules, privacy explanation, report/appeal language, and trusted-adult scope.
- Human-reviewed response playbooks for grooming/enticement, sexual exploitation, self-harm, imminent danger, harassment, doxxing, and medical misinformation.
- Provider agreements and operating procedures for any age-assurance, messaging, hosting, analytics, or incident services.
- Tabletop exercises and red-team evidence before any real child data is admitted.

### Track C — controlled pilot acceptance

- Independent security review and safeguarding review complete.
- Moderator training complete and response SLAs tested.
- Consent/assent and withdrawal flows tested with appropriate experts.
- Pilot protocol, recruitment boundaries, support resources, stop criteria, and data retention approved.
- Real-device and accessibility acceptance complete.
- Pilot starts with an allowlisted cohort and the ability to stop new activity without destroying required safety records.

## Required state machines

### Account access

`created → age-pending → age-approved → consent-pending → consent-approved → active`

Any failed, expired, revoked, or uncertain state must deny community participation while preserving a safe explanation and appeal path. Age assurance must be minimised and must not retain unnecessary identity artifacts.

### Safety case

`received → triaged → assigned → investigating → actioned → notified → appealed → closed`

P0/P1 cases require human safeguarding ownership and cannot be closed by an automated classifier.

### Trusted-adult link

`requested → child-confirmed → adult-verified → active → expired/revoked`

Scope, access history, expiry, and revocation must be visible to the child. No adult is discoverable by a child through the product.

## Production API boundary

Required authenticated operations:

- `createAccount`, `beginAgeAssurance`, `recordConsent`, `appealAccess`
- `listRooms`, `joinRoom`, `leaveRoom`
- `createPost`, `createReply`, `reportContent`, `blockAccount`, `muteAccount`
- `getOwnReports`, `getOwnSupportLinks`, `requestSupportLink`, `revokeSupportLink`
- `moderationQueue`, `assignSafetyCase`, `recordModerationAction`, `recordAppealDecision`
- `exportOwnData`, `requestDeletion`

Explicitly forbidden operations:

- child-to-child direct messaging;
- adult search or adult recommendation;
- silent guardian access to all child messages;
- raw community-corpus export for model training or analytics;
- diagnosis inference or diagnosis-based matching;
- location sharing or contact import;
- automated P0/P1 closure.

Every operation needs authentication, role authorization, rate limits, audit classification, and an explicit data-retention policy.

## Definition of done

The engineering release gate passes only when:

1. Unit, integration, adversarial, security, accessibility, migration, backup/restore, and rollback tests pass.
2. A staging deployment can execute the complete child/guardian/moderator/safeguarding journey with synthetic identities and no real child data.
3. The service fails closed when age, consent, role, moderation, or provider dependencies are unavailable.
4. Security logs and analytics contain no raw message text, voice recordings, diagnosis, school, address, precise location, or unnecessary identifiers.
5. The moderation and incident-response runbooks are executable by a trained human team.
6. The production handoff lists open risks and names the human owner for every non-engineering approval.

## Non-negotiable limitation

No document, passing test, or local prototype can by itself make this safe to launch with children. “Production-ready” will mean engineering-ready for controlled review plus explicit external approvals—not permission to recruit or expose minors.
