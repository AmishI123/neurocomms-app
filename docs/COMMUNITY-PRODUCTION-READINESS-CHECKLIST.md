# Community production-readiness checklist

This is the handoff ledger for the supervised community layer. A checked engineering item means the repository contains executable evidence. It does not authorize a child pilot.

## Engineering evidence

| Gate | Evidence | Status |
| --- | --- | --- |
| API/auth/state machine | `communication-tool/tests/community-api.test.cjs` | pass |
| Configured HTTP server | `npm run community:server:test` | pass |
| Whole-app API/demo browser integration | `npm run community:integration:test` | pass |
| Safety and privacy boundary | `npm run community:production-audit` | pass |
| Static community release boundary | `npm run community:release-audit` | pass |
| Encrypted-store recovery exercise | `npm run community:recovery-check` | pass |
| Mobile bundle integrity | `npm run build:mobile && npm run mobile:audit` | pass |
| Accessibility baseline | `npm run accessibility:audit` plus community browser journey | pass |
| Deployment configuration | `communication-tool/deploy/` and `docs/COMMUNITY-PRODUCTION-API.md` | present |
| Incident response | `docs/COMMUNITY-INCIDENT-RESPONSE.md` | present |

## Human and organizational approvals

The responsible organization must replace each owner placeholder and attach dated evidence before enabling real participant traffic.

| Decision | Required owner | Evidence required | Status |
| --- | --- | --- | --- |
| Identity, age assurance, and guardian consent provider | Product/security owner + privacy counsel | provider contract, data-minimization review, failure test | not approved |
| Database, backups, restore, migrations, rollback | Infrastructure owner | staging deployment, restore drill, rollback record, alert test | not approved |
| Safeguarding policy and escalation matrix | Named safeguarding lead | jurisdiction matrix, P0/P1 playbook, on-call rota | not approved |
| Moderator training and capacity | Moderation operations owner | training completion, response SLA exercise, coverage schedule | not approved |
| DPIA, child risk assessment, retention, deletion | Privacy/legal counsel | signed DPIA, retention schedule, legal-hold procedure | not approved |
| Security review | Independent security reviewer | threat-model review, penetration/adversarial findings, remediation sign-off | not approved |
| Pilot protocol and stop criteria | Executive/product owner + safeguarding lead | allowlist, assent/consent materials, support resources, stop decision | not approved |

## Release rule

No real child data may enter the service while any human/organizational row is `not approved`. The engineering team may run synthetic staging journeys and keep improving the implementation, but cannot convert passing code checks into safeguarding, legal, or clinical approval.
