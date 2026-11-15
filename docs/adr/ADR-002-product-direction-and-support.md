# ADR-002: Product direction and how the project supports users

## Status

Accepted for the current internal engineering beta and Sunday presentation.

## Decision

Build a local-first workspace that supports the following loop:

`import or write information` → `inspect source and uncertainty` → `confirm or correct` → `choose a small next action` → `pause/resume` → `prepare a communication draft` → `export privately`

The user remains the authority. The system may organize, show provenance, preserve state, and offer bounded suggestions; it must not silently commit, diagnose, submit, send, or impersonate.

## How it supports the identified problem

| Research/problem signal | Product response | Verification boundary |
| --- | --- | --- |
| Fragmented instructions are hard to reconstruct | Local document import and structured requirements | Fictional documents and source-grounding tests |
| Uncertainty is costly when presented as fact | Evidence, inference, and user choice are visibly separated | Confirmation and rejection tests |
| Interruptions destroy context | Durable drafts, pause state, Context Anchor, and recovery | Recovery simulations and workflow tests |
| Explaining needs repeatedly is effortful | Communication card and Phrase Studio drafts | Local storage/export and bounded provider contract |
| Privacy matters in sensitive contexts | Offline default, redaction, request preview, opt-in provider | Release and privacy audits |
| Different users need different control levels | Editable cards, focus modes, text size, contrast, silent mode, speech controls | Contract/accessibility checks; human accessibility still pending |

## Scope for the current beta

Included:

- local-first web runtime;
- Study Bridge review and confirmation workflow;
- Phrase Studio editing, review, phrase library, Quick Board, and communication card;
- backup/restore/erase paths;
- optional, explicitly configured provider boundary;
- fictional evaluation and release audits;
- native packaging paths.

Excluded from claims:

- diagnosis, therapy, clinical treatment, or AAC replacement;
- automatic messaging, graded-work submission, or policy invention;
- demonstrated benefit, demand, or participant validation;
- production hosted backend;
- completed real-device and iOS runtime acceptance.

## Implementation references

- Runtime entry: `communication-tool/index.html`, `study-bridge.mjs`, `study-workspace*.mjs`, `context-anchor.mjs`, `firewall.js`.
- Product architecture: `communication-tool/docs/architecture.md`.
- End-to-end goal: `communication-tool/docs/end-to-end-goal.md`.
- My Visit Notes decision: `product-specs/my-visit-notes/decision-record.md`.
- Release gate: `communication-tool/docs/controlled-beta-release-gate.md`.

## Consequences

The frontend can be polished independently as long as the state and privacy contracts remain intact. Backend/data work can improve persistence, document adapters, evaluation, and provider boundaries without inventing new user-facing claims. Every new capability needs a corresponding contract test and an explicit limitation statement if it is not human-validated.

## Next evidence gate

Run a properly approved, human-centered review with domain/accessibility oversight. Record participant evidence separately from public-source research and synthetic evaluation.
