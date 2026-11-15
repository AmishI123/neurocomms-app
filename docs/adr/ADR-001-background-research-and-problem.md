# ADR-001: Background research and problem framing

## Status

Accepted as the project’s evidence boundary and product-framing record.

## Context

The project began from personal experience with neurodivergence and communication/access friction. That experience generated hypotheses, but it is not a participant study. We then assembled a broader evidence base from public discussions, including Reddit, published studies, market/alternative research, and domain-oriented literature.

The evidence repeatedly points to friction when a person must understand, remember, organize, or communicate under changing conditions: conversation pace, sensory load, fragmented instructions, uncertain requirements, executive-function load, and the cost of explaining needs repeatedly.

The evidence package is distributed across:

- `product-specs/opportunity-atlas/research-summary.md`
- `product-specs/opportunity-atlas/research-log.md`
- `product-specs/opportunity-atlas/evidence-ledger.json`
- `product-specs/opportunity-atlas/methods-and-evidence.html`
- `communication-tool/docs/market-assessment/initial-findings.md`
- `communication-tool/docs/market-assessment/evidence.json`
- `communication-tool/docs/market-assessment/decision-report.md`

## Decision

Frame the opportunity around a specific access task rather than a diagnosis: help a person move from fragmented or difficult information to a user-controlled, source-grounded, resumable next step and a reviewable communication artifact.

The first engineering directions are:

1. communication-access and phrase preparation;
2. visit/appointment question preparation;
3. Study Bridge for fragmented academic instructions;
4. recovery and continuity across interruption.

## Evidence interpretation

| Evidence | What it contributes | What it cannot establish |
| --- | --- | --- |
| Personal experience | Origin story and problem hypotheses | Population need or product benefit |
| Reddit/public discussions | Qualitative language, recurring pain points, substitute behaviors | Prevalence, representativeness, or demand |
| Published interview studies | External context about lived barriers and coping/workflow needs | Evidence that this product works |
| Market/alternative audits | Existing substitutes and workflow gaps | Willingness to pay or market size |
| Synthetic benchmarks | Engineering regression and safety checks | Human usability, clinical impact, or accessibility benefit |

## Consequences

- Product claims must stay task-centered and non-diagnostic.
- Privacy, local-first operation, provenance, visible uncertainty, confirmation, and recovery are core design requirements—not optional polish.
- Research documents must keep source excerpts and private material out of runtime bundles.
- Human review is the next evidence gate before claiming usefulness.

## Rejected interpretations

- “Reddit proves this is a large market.”
- “The project interviewed children or ADHD participants.”
- “A successful automated test proves accessibility or clinical benefit.”
- “The product should infer a diagnosis or automatically speak/send for the user.”

## Follow-up

Use [`ADR-002`](ADR-002-product-direction-and-support.md) to connect this framing to the implemented product and presentation story.
