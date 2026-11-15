# Community Layer Specification: supervised connection and support pathways

Status: Draft for implementation planning
Version: 0.1
Audience: backend, frontend, voice, moderation, research, and presentation agents

## Product thesis

Neurodivergent young people may benefit from belonging, peer recognition, practical exchange, and access to trusted support. The product should make a safe first connection easier without turning a child into a public profile or creating pressure to disclose a diagnosis.

The community layer is a companion to the existing local-first tools. It is not a dating product, therapy service, emergency service, diagnostic tool, or replacement for school, family, clinical, or community support.

## MVP boundary

### In scope

- Age-banded spaces: 13–15 and 16–17.
- Pseudonymous child identity with a chosen display name and no public real-name field.
- Small moderated rooms organised around activities and needs: study starts, sensory-friendly hobbies, creative projects, communication practice, and “I need help choosing a next step.”
- Structured posts using bounded templates: “share,” “ask,” “offer a strategy,” “looking for a group activity.”
- Replies inside a room, with rate limits and no private child-to-child messaging.
- Trained moderator presence, visible room rules, report/block/mute controls, and a clear “I need help now” route to trusted adults or emergency resources.
- Trusted-adult linking by explicit invitation and consent, with role-based access to safety notices and selected summaries—not silent access to all messages.
- Resource directory for verified organisations and local support pathways, clearly separated from peer content.
- Local drafts and exportable personal notes using the existing review-first and redaction patterns.
- Aggregate, privacy-bounded product telemetry: reports, response times, room participation, helpfulness signals, and retention. Never export message text for analytics.

### Explicitly out of scope

- Under-13 accounts in the MVP.
- Open DMs, disappearing messages, live video, live audio, or file/image exchange between children.
- Searchable adult profiles or adult–child matching.
- Location sharing, school-name discovery, contact import, public follower counts, likes/ranking, streaks, or popularity leaderboards.
- Diagnosis verification, public diagnosis badges, or condition-based recommendations.
- Automated clinical advice, crisis counselling, or promises of immediate human response.
- AI moderation as the sole decision-maker.
- Advertising, personalised commercial targeting, or TikTok-Shop-style commerce involving children.

## Core user journeys

### Child joins a room

1. Child selects an age band through the approved age-assurance flow.
2. Child chooses a pseudonym and accessibility preferences.
3. The system explains what peers, moderators, and linked adults can see.
4. Child reads short room rules and completes a safety orientation.
5. Child joins a small room with a visible moderator schedule and report controls.

### Child posts safely

1. Child chooses a bounded post type.
2. Composer warns against names, school, address, phone number, private images, passwords, and moving off-platform.
3. The system previews the post and offers “save draft,” “post to room,” or “ask moderator first.”
4. Automated screening may hold content for review but never silently rewrites a child’s meaning.
5. Moderator queue receives risk signals and the child sees a clear status: posted, held for review, or removed with an understandable explanation.

### Child connects to support

1. Child chooses “trusted adult,” “moderator,” or “resource directory.”
2. The product states what will be shared and asks for confirmation.
3. A trusted adult receives only the bounded safety/support summary permitted by the relationship role.
4. The adult can acknowledge, offer a resource, or escalate through the documented safeguarding flow.
5. The child retains a visible history of the connection and can request review of access.

### Moderator handles a report

1. Report is acknowledged immediately with a case ID and expected response window.
2. Triage classifies: routine rule breach, harassment, privacy exposure, suspected grooming/enticement, self-harm/suicide risk, imminent danger, or technical issue.
3. Moderator records only the minimum necessary evidence and action reason.
4. High-risk cases follow a human escalation runbook; automated systems cannot close them alone.
5. Reporter receives a safe status update without exposing another child’s private information.

## Functional requirements

| Area | Requirement | MVP acceptance |
|---|---|---|
| Identity | Pseudonymous child identity; no public legal name | No public real-name field or contact import |
| Age bands | Separate 13–15 and 16–17 participation | Cross-band interaction disabled by default |
| Roles | Child, trusted adult, moderator, safeguarding lead, administrator | Server rejects role escalation from client input |
| Rooms | Small, topic-based, moderator-owned rooms | Every room has rules, owner, moderator rota, and closure path |
| Messaging | Room posts/replies only; no child DMs | API has no child-to-child direct-message route |
| Safety | Report, block, mute, hold, remove, appeal | All actions produce bounded audit events |
| Privacy | High-privacy defaults, minimum retention, no geolocation | Privacy review passes before pilot |
| Support | Explicit trusted-adult connection and resource directory | Each disclosure has visible scope and consent state |
| Accessibility | Plain language, predictable layouts, reduced motion, sensory preferences | Frontend acceptance covers keyboard, screen reader, text size, contrast |
| Voice | Optional voice note only after local review and consent | No automatic publication or transcription sharing |
| Analytics | Aggregate-only counters | No raw message text, filenames, identities, or diagnosis fields |

## Suggested domain model

```text
CommunityAccount
  id, ageBand, pseudonym, accessibilityPreferences, consentState,
  linkedSupportRoles[], status, createdAt, deletedAt

Room
  id, ageBand, topic, rulesVersion, moderatorIds[], status,
  maxMembers, createdAt, closedAt

Post
  id, roomId, authorId, templateKind, body, visibility,
  moderationState, createdAt, deletedAt

SafetyReport
  id, reporterId, targetType, targetId, category, severity,
  status, assignedTo, responseDueAt, resolutionCode, createdAt

SupportLink
  id, childId, adultId, role, scope, consentState,
  expiresAt, revokedAt, createdAt

ModerationEvent
  id, caseId, actorRole, action, reasonCode, evidenceRefs[],
  policyVersion, createdAt
```

Do not store diagnosis, school, home address, precise location, or raw safety-report text in analytics. Separate operational case data from aggregate product telemetry, with different retention and access controls.

## API boundary

The backend should expose typed operations such as:

- `createCommunityAccount`
- `listEligibleRooms`
- `createPostDraft`
- `submitPostForReview`
- `replyInRoom`
- `reportContent`
- `blockAccount`
- `requestSupportLink`
- `acceptSupportLink`
- `revokeSupportLink`
- `getResourceDirectory`
- `getOwnSafetyCaseStatus`

There should be no `sendDirectMessage(child, child)`, `discoverAdults`, `searchUsers`, `shareLocation`, or `exportRawCommunityCorpus` operation in the MVP API.

## Success measures

Measure software safety and usefulness signals, not diagnosis or clinical outcomes:

- time to acknowledge and resolve reports by severity;
- percentage of posts with complete moderation provenance;
- rate of unwanted-contact attempts blocked before delivery;
- percentage of child-visible safety explanations understood in usability testing;
- successful use of mute, block, report, and support-link controls;
- self-reported belonging/helpfulness in consented research, analysed separately from operational data;
- false positives and false negatives from moderator-reviewed safety fixtures.

Do not claim clinical benefit, reduced loneliness, improved school outcomes, or market demand without an approved human study.
