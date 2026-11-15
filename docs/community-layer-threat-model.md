# Community Layer Threat Model and Safeguarding Contract

Status: Draft; required before implementation or pilot

## Trust boundaries

1. Child device and local drafts.
2. Community API and durable account data.
3. Moderation queue and safeguarding case system.
4. Trusted-adult view.
5. Verified resource directory.
6. Aggregate analytics pipeline.
7. External links and imported content.

The highest-risk boundary is child-to-unknown-person contact. The MVP removes that boundary by prohibiting child DMs and adult discovery.

## Threats and controls

| Threat | Control | Required evidence |
|---|---|---|
| Adult impersonates a peer | age-banded access, pseudonyms without peer discovery, moderator review, no DMs | adversarial account and contact tests |
| Grooming or off-platform migration | block external-contact solicitation, hold and escalate suspicious posts, no links in first release | safety fixtures and moderator runbook |
| Doxxing or privacy leakage | composer warnings, redaction prompts, report category, rapid removal | privacy leakage tests |
| Bullying and dogpiling | small rooms, rate limits, reply throttles, mute/block, moderator presence | repeated-harassment simulations |
| Self-harm or imminent danger | human escalation, emergency-language runbook, resource directory, no AI-only closure | safeguarding tabletop exercise |
| Medical misinformation | no diagnosis claims, vetted resources, moderator escalation, source labels | misinformation fixture review |
| AI manipulation or prompt injection | treat user content as data, never as system instructions, bounded classifiers, human decision | adversarial input suite |
| Moderator abuse | least privilege, two-person review for highest-risk actions, audit log, appeal | role/permission tests |
| Guardian overreach | explicit link scope, child-visible access log, revocation and appeal | support-link tests |
| Data breach | minimise data, encryption in transit/at rest, short retention, separate analytics | DPIA/security review |
| Age misclassification | conservative access, regional policy matrix, appeal, no collection of unnecessary identity data | age-assurance review |
| Engagement harm | no streaks, rankings, infinite feed, or persuasive nudges | product audit |

## Severity response model

- **P0 imminent danger:** stop ordinary workflow, preserve only necessary case evidence, route to trained safeguarding lead and jurisdiction-appropriate emergency process.
- **P1 suspected grooming, sexual exploitation, credible threat, or severe self-harm signal:** restrict contact, escalate to safeguarding lead, follow legal reporting obligations, and document action.
- **P2 harassment, doxxing, repeated coercion, or serious privacy exposure:** hold/remove content, protect the target, assign human review, and notify the reporter.
- **P3 ordinary rule breach or technical issue:** explain, moderate, allow appeal, and record bounded reason code.

The product must never imply that a moderator, AI system, or resource directory provides emergency response. Child-facing copy must name the next safe human or emergency option appropriate to the deployment jurisdiction.

## Data contract

Retain only what is needed for the current safety case, access control, and legal obligations. Analytics may contain counts and bounded categories, never message text, images, voice recordings, names, school information, exact location, health diagnoses, or raw reports.

Every access to a safety case must be logged. Every moderation decision must have a policy version and reason code. Case deletion must follow a documented retention schedule and legal hold process; the product cannot promise immediate deletion where safeguarding or law requires preservation.

## Pilot gates

No child pilot starts until all are true:

- a jurisdiction and accountable safeguarding organisation are named;
- a child-safety and data-protection impact assessment is approved;
- age-band and consent flows are tested with child-safety experts;
- moderators are trained and staffed with response SLAs;
- reporting, appeal, escalation, and emergency copy are operational;
- red-team fixtures cover grooming, coercion, self-harm, doxxing, harassment, medical misinformation, and prompt injection;
- independent review is complete;
- the pilot can be stopped immediately without losing necessary case records.
