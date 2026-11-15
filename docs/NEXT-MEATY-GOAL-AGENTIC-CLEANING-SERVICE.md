# Next Meaty Goal: Complete Agentic Commercial-Cleaning Service

## Objective

Build the first complete local agentic service business, using a commercial-cleaning company as the concrete example. The result must be a usable browser application backed by a real local service runtime—not a collection of mock screens, static fixtures, or schema-only tests.

The system must operate the full business loop:

> accept customer work → commit scope and price → schedule visits → allocate a crew → deliver and capture evidence → detect exceptions → choose and execute a permitted remedy → handle disputes and revisits → issue an invoice → apply simulated payment → reconcile credits, cash, and remaining balance.

Execution is local and deterministic enough to test. Customers, crews, payments, messages, and service evidence are simulated. No real customer, payment provider, physical service, or external side effect is permitted. Within the bounded acceptance scenario, no human approval step is required.

## Starting point and source contracts

Start from the existing frontend in this repository and preserve its established visual language, interaction quality, responsive behavior, accessibility conventions, and presentation style where applicable.

The implementation must incorporate and complete the contracts in:

- `agentic-businesses/docs/business-vision/service-delivery-spec.md`
- `agentic-businesses/docs/business-vision/service-scenario-spec.md`

If the delivery specification is absent from the checkout, record that as a source-integrity issue, locate the authoritative copy in the sibling `agentic-businesses` repository or its pinned evidence, and preserve the exact source path/revision in the implementation handoff. Do not silently replace it with an invented summary.

The scenario specification is a foundation, not a ceiling. Missing wire formats, persistence rules, command semantics, agent policies, UI states, and verification contracts belong in this goal and must be written down as part of the implementation.

## Product surface

### Business setup

The browser must allow an operator to configure and inspect a simulated cleaning business:

- business identity, service area, timezone, currency, tax mode, and operating hours;
- customer and site records;
- cleaning service templates and task-level scope;
- recurring commitments, price, service period, included remedies, and extra-work rules;
- crew members, equipment/capabilities, availability, and assignment constraints;
- permitted communication channels and simulated counterparties;
- payment terms and local payment fixtures.

Every committed value must have an owner, immutable identifier, revision/version, effective time, and audit event. Editing a setup record creates a new revision or explicit amendment; it must not rewrite historical work.

### Commitments and schedule

The system must turn an accepted commitment into durable scheduled work:

- preserve the original commitment as the root record;
- materialize each original visit or milestone exactly once;
- calculate local service times with an explicit timezone and UTC representation;
- keep contractual dates, simulated service time, and wall-clock observation time separate;
- show planned, dispatched, in-progress, completed, disputed, missed, remedial, cancelled, and unresolved states;
- prevent a revisit or extra job from being counted as an additional original visit;
- preserve the lineage from commitment → visit → task → evidence → response → financial obligation.

### Crew allocation and execution

The operator and agent must be able to inspect:

- available crews and capability matches;
- competing bookings and allocation exclusions;
- dispatch claims and assignment generations;
- completion evidence per task;
- delivery manifests and customer-response rounds;
- unknown/in-flight operations after interruption.

Duplicate dispatch, duplicate completion, duplicate delivery, and duplicate payment application must be rejected or safely replay the original result without creating a second effect.

### Exceptions, disputes, and remedies

The backend must represent exceptions as first-class records, not UI messages. It must support at least:

- access failure or missed visit;
- crew unavailability and replacement allocation;
- partial completion or missing task evidence;
- customer dispute of a visit or task;
- permitted included revisit/remedial attempt;
- extra work outside the original commitment;
- unresolved work when no permitted remedy or qualified capacity exists;
- customer acceptance, rejection, clarification, and response timeout.

The agent decision layer must:

1. detect the problem from committed facts and current owner readbacks;
2. explain the detected issue in plain language;
3. choose only from declared permitted remedies;
4. show the facts and policy rule that justified the choice;
5. execute the remedy through the owning backend contract;
6. record the decision, policy revision, inputs, output, action identity, and result;
7. stop safely when the remedy is not permitted, evidence is missing, capacity is unavailable, or the state is unknown.

The agent must never fabricate completion, customer acceptance, payment, capacity, evidence, source rights, or a predecessor record required by a future event.

### Invoices, credits, payments, and evidence

The financial surface must include:

- invoice obligations linked to the correct accepted scope or extra job;
- credit notes or service credits linked to the disputed duty and authorized remedy;
- simulated payment proposals and local cash application;
- exact integer minor-unit amounts and explicit currency/exponent;
- invoice, credit, applied cash, residual balance, and payment status as separate fields;
- evidence references for service and finance claims;
- reconciliation that proves the arithmetic from backend readbacks rather than frontend calculations.

The application must distinguish “service resolved,” “customer accepted,” and “financially settled.” A completed service with unpaid money is not settled; a paid invoice with unresolved service work is not a successful delivery.

## Canonical end-to-end scenario

Implement a deterministic fixture for one simulated cleaning company, customer, site, and recurring commitment.

### Ordinary path

- Four original visits are accepted for the declared service period.
- Each visit has task-level scope, a qualified crew assignment, completion evidence, a delivery manifest, and a simulated customer response.
- The base commitment is billed once for `200000` minor units.
- A simulated payment of `200000` is applied to that base invoice.
- The final state shows four original visit roots, complete evidence, accepted service, one invoice, applied cash, and zero residual balance.

### Exception path

Run a second simulation with the same business shape and an injected failure:

1. the first visit cannot access the site;
2. the original visit remains recorded as missed—it is never deleted or rewritten;
3. the first replacement crew is unavailable because of a booking conflict;
4. an eligible replacement crew performs an included revisit but leaves one task incomplete;
5. the customer disputes that missing task;
6. the agent identifies the dispute, explains the permitted remedy, and schedules a second included remedial attempt;
7. the remaining task is completed and new evidence is linked to the original duty;
8. the customer accepts the corrected delivery;
9. a `20000` credit is authorized against the base invoice;
10. a separate extra job is accepted for `30000` and billed independently;
11. simulated cash of `180000` is applied to the credited base invoice and `30000` to the extra-job invoice;
12. reconciliation proves:

    - base: `200000 - 20000 - 180000 = 0`;
    - extra: `30000 - 0 - 30000 = 0`;
    - combined applied cash: `210000`;
    - four original base roots plus one extra-job root;
    - revisits are remedial lineage, not extra original visits;
    - every task, exception, decision, evidence item, invoice, credit, and cash application remains inspectable.

The UI must provide a guided way to run this scenario and then inspect each stage. A reviewer must be able to refresh or restart the local process and recover the same business state without duplicate visits, duplicate credits, duplicate invoices, or duplicate cash applications.

## Missing implementation contracts to define

Before claiming completion, document and implement the following contracts where the source specifications do not already define them:

- versioned business, customer, site, commitment, visit, task, crew, assignment, exception, remedy, evidence, response, invoice, credit, payment, reconciliation, decision, audit, and snapshot records;
- command envelope with scoped idempotency key, actor, capability, expected revision, correlation ID, and original command;
- typed owner ports for service delivery, resource/capacity allocation, communications, and finance;
- event/operation lifecycle for accepted, claimed, committed, acknowledged, failed, unknown, reconciled, and replayed effects;
- deterministic agent decision input/output envelope and permitted-remedy registry;
- local persistence, migrations, snapshots, outbox, restart recovery, and conflict behavior;
- read models for operator overview, service detail, exception detail, agent decision detail, and financial reconciliation;
- error codes and user-facing explanations for stale, denied, unavailable, duplicate, unknown, wrong-scope, wrong-view, and unresolved states;
- fixture registry and scenario driver that withholds future events and expected results from acting components;
- evidence and provenance rules that distinguish design fixtures from actual local owner execution;
- accessibility and responsive interaction rules for loading, empty, partial, stale, denied, unknown, and recovered states.

## Frontend requirements

The browser experience must be operational, not demonstrative. It must include:

- business setup and fixture selection;
- commitment creation and acceptance;
- schedule/calendar and visit detail;
- crew availability and allocation;
- live exception queue;
- agent decision explanation and remedy execution;
- service evidence and customer-response inspection;
- invoice/credit/payment/reconciliation views;
- restart/reload recovery indicator;
- duplicate-action feedback;
- scenario controls for injecting the missed visit and dispute;
- a complete end-state summary with links to every retained record.

All meaningful actions must have pending, success, failure, duplicate, denied, stale, and unknown states. Keyboard navigation, visible focus, semantic headings, labels, status announcements, sufficient contrast, reduced-motion behavior, narrow-screen layout, and large-text usability are required.

## Backend requirements

Use a real local backend or service runtime behind the frontend. It must:

- persist state durably for the local run;
- expose typed commands and read models;
- enforce ownership and invariants server-side;
- derive schedules from accepted commitments;
- allocate crews under capability and conflict rules;
- create service evidence and customer responses;
- detect and record exceptions;
- apply agent remedies only within policy;
- issue invoices and credits from qualified obligations;
- apply simulated cash exactly once;
- survive process restart;
- expose audit and reconciliation evidence;
- reject invalid or duplicate commands deterministically.

Do not make the frontend the source of truth for scheduling, decisions, billing, credits, or payment arithmetic.

## Verification and acceptance gates

The goal is complete only when all gates pass:

1. **Browser-to-backend journey:** a browser test performs setup, acceptance, scheduling, allocation, completion, failure injection, dispute, remedy, revisit, invoice, credit, payment, and reconciliation through the real UI and backend.
2. **Ordinary and exception paths:** both canonical scenarios complete with the expected retained lineage and money arithmetic.
3. **Restart recovery:** stop/restart at defined interruption points and recover the same state with no lost debt or duplicate effect.
4. **Duplicate protection:** repeat every mutating command with the same idempotency key and verify one effect; repeat with a conflicting payload and verify rejection.
5. **Agent auditability:** every decision shows inputs, policy, permitted remedy, explanation, command identity, and outcome.
6. **Financial conservation:** invoice, credit, applied cash, and residual amounts match authoritative backend records in minor units.
7. **Evidence conservation:** no completion or acceptance is shown without the required task/service evidence and response disposition.
8. **Access and privacy:** each view exposes only the fields allowed for its actor and scope.
9. **Accessibility:** automated checks plus keyboard/screen-reader-oriented browser assertions cover all primary screens and state changes.
10. **Build and contract checks:** unit, contract, backend integration, browser, persistence, and release checks pass from a clean checkout.
11. **Inspectability:** a reviewer can operate the journey in the browser and drill from business result to underlying records, events, decisions, evidence, and money.

Required verification commands and their outputs must be recorded in a release evidence document. A passing schema test, a static fixture, or a screenshot alone does not satisfy this goal.

## Delivery slices

1. Inspect and pin the source specs, existing frontend, and current runtime boundaries.
2. Define the missing contracts and canonical fixture registry.
3. Implement persistence, command envelopes, idempotency, snapshots, and restart recovery.
4. Implement commitment → schedule → crew allocation → service evidence.
5. Implement exception detection, agent decisions, remedy policy, disputes, and revisits.
6. Implement invoices, credits, simulated payments, and reconciliation.
7. Connect the operational frontend to real backend reads and commands.
8. Add scenario controls and the complete ordinary/exception walkthrough.
9. Add browser-to-backend, restart, duplicate-action, accessibility, and contract tests.
10. Run the full release audit, write evidence, and hand off the locally operable service.

## Explicit non-goals

- real customer accounts or personal data;
- real payment processing or bank connectivity;
- real messaging, dispatch, or physical cleaning operations;
- autonomous decisions outside the declared remedy policy;
- hidden future-event access or fabricated evaluation evidence;
- claiming profitability, production readiness, or real-world service quality from the simulation;
- replacing the existing visual system with an unrelated design language.

## Current implementation evidence

The first local implementation slice is in the sibling `agentic-businesses` checkout:

- `employee_workspace_integration/cleaning.py` provides durable SQLite state, revision-fenced commands, idempotent receipts, ordinary settlement, exception recovery, service-domain projections, and reconciliation.
- `design/employee-workspace/service-workbench/` is connected to the loopback backend and uses the existing workspace visual shell.
- `scripts/run_cleaning_browser_smoke.py` exercises both exception and ordinary browser journeys, including accessibility, keyboard focus, narrow viewport, and page-error checks.
- `docs/business-vision/contracts/cleaning-command.schema.json` defines the closed command envelope.
- `docs/business-vision/cleaning-business-release.md` documents local operation and the evidence commands.
- The focused contract/persistence/schema/restart suite currently passes 72 tests; the impacted existing workspace integration subset passes 36 tests; both browser journeys currently pass with inspectability, accessibility, keyboard, responsive, and page-error assertions.

These results are local simulated evidence only. The remaining gates are still active until the full owner-boundary implementation, clean-checkout release qualification, and final requirement-by-requirement audit are complete.

## Definition of done

Done means a reviewer can open the local application, configure or load the commercial-cleaning fixture, accept work, watch it become scheduled and crew-assigned, inject a missed visit and customer dispute, inspect the agent’s permitted remedy and explanation, complete the recovery visit, view evidence and customer acceptance, inspect the generated credit and invoices, apply simulated payment, and see a backend-derived zero residual balance. They can refresh or restart the process, repeat actions safely, and inspect the complete audit trail and reconciliation without encountering mock-only screens or unexplained state.
