# Naming and archive map

The repository accumulated many milestone documents before there was a single project index. They are intentionally retained for traceability. The canonical names below should be used for new work.

| Older pattern | Meaning | Canonical entry point |
| --- | --- | --- |
| `NEXT-MEATY-GOAL-*.md` at repository root | Historical milestone or product-specific goal | [`PROJECT-STATUS.md`](../PROJECT-STATUS.md) and [`WORKSTREAMS.md`](WORKSTREAMS.md) |
| `PROJECT-CONTEXT.md` | Conversation recovery and historical origin | [`PROJECT-STATUS.md`](../PROJECT-STATUS.md) |
| `communication-tool/docs/next-goal-*.md` | Detailed engineering goal records | [`communication-tool/README.md`](../communication-tool/README.md), then the relevant goal record |
| `product-specs/opportunity-atlas/` | Research and product opportunity evidence | [`ADR-001`](adr/ADR-001-background-research-and-problem.md) |
| `product-specs/my-visit-notes/` | Separate visit-preparation product track | [`ADR-002`](adr/ADR-002-product-direction-and-support.md) and its product decision record |
| `communication-tool/qa/` | Verification evidence and historical audits | [`PROJECT-STATUS.md`](../PROJECT-STATUS.md) and the release audit output |
| `product-specs/*/presentation/` | Existing presentation artifacts | [`PRESENTATION-RUNBOOK-SUNDAY.md`](PRESENTATION-RUNBOOK-SUNDAY.md) |

## Safe cleanup rule

Do not mass-rename these files during presentation week. Many documents, scripts, and generated artifacts link to their existing paths. The new canonical layer provides stable names without breaking historical links. A physical rename can be a separate migration with link auditing and a full test run.
