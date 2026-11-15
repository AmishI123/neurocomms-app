# Backend/data ownership and contracts

## Important clarification

This repository does not currently contain a hosted production backend. “Backend” here means the local data and intelligence boundary: document adapters, state persistence, recovery, exports, local AI proxy, deterministic firewall, and evaluation/release scripts.

## Ownership for the backend workstream

- Preserve source provenance and uncertainty through every transformation.
- Keep raw document text and sensitive phrase content local by default.
- Make all writes revision-aware and recoverable.
- Keep provider calls explicit, consented, redacted, bounded, and observable through non-content metadata.
- Maintain import/export versioning and erase behavior.
- Add contract tests before changing runtime state shapes.
- Keep synthetic fixtures visibly synthetic and separate from research evidence.

## Existing contracts to protect

| Contract | Code/docs | Required invariant |
| --- | --- | --- |
| Study Bridge source grounding | `study-document.mjs`, `study-bridge.mjs`, `study-workspace*.mjs` | Proposed items retain source/provenance and require confirmation |
| Recovery | `context-anchor.mjs`, workspace session modules | An interruption can be resumed without silently replacing work |
| Privacy/firewall | `firewall.js`, provider scripts, `docs/ai-safety-gateway.md` | No provider call unless explicitly configured and invoked |
| Device data | `device-storage.mjs`, `device-backup.mjs`, `study-workspace-backup.mjs` | Backup/restore/erase are explicit and versioned |
| Provider boundary | `scripts/ollama-proxy.mjs`, assistant runtime/tests | Bounded JSON, local/opt-in defaults, no automatic insertion or sending |
| Communication handoff | `communication-handoff.mjs`, `device-data-transaction.mjs`, `device-backup.mjs` | Bounded, typed, unsent, editable handoff survives reload and follows backup/erase lifecycle |
| Evaluation | `scripts/*audit.mjs`, `tests/` | Engineering checks do not become human-outcome claims |

## Backend roadmap after Sunday

1. Consolidate the document and workspace state contracts into a short versioned schema reference.
2. Add fixture-based migration tests for every persisted version.
3. Separate local adapters from any future hosted service interface.
4. Add explicit telemetry policy only if a future product decision authorizes it; default remains no telemetry.
5. Prepare a domain-reviewed human-validation data boundary before collecting any participant data.

## Definition of done for backend work

The frontend can consume stable contracts, recover after interruption, demonstrate offline behavior, and explain exactly what leaves the device. Any future network service must be an explicit ADR, not an accidental extension of the prototype provider endpoint.
