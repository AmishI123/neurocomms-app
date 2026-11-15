# Next meaty goal: Helper Jobs, fully specified and shipped

Status: active  
Source of truth: `Helper Jobs — App Specification.pdf` (9 pages, 25 October 2026)  
Product repository: `mehtama1234/neurocomms`  
Prototype: `helper-jobs/`  
Visual source: `archive/communication-tool/` and `archive/presentation/`

Current implementation evidence (26 October 2026): `helper-jobs/` contains the static app in Next Step’s visual layer (its own style sheets loaded as they are), the local store, offline shell, helper/lead/coordinator journeys, the live link to the lead’s phone (`link.js`, `lead-phone.html`, `server/server.mjs`), and the full presentation set in `presentation/` (landing page, 12 slides with notes and presenter view, handout, PDFs). The release gate `.github/workflows/helper-jobs.yml` runs the contract and server tests, a one-tablet browser journey and a two-device journey (Help reaches the phone in under a second; “I’m here” closes it on the tablet). `render.yaml` defines the static site and the free `helper-jobs-live` service.

Gate status:

- Done and tested: helper journey with picture steps, read aloud, Help/Stop/Done, smiley and derived badges; at most four job choices; 64px helper targets; lead PIN (chosen per tablet, hashed), outing setup, presence, valid-only assignments, live board, alert acknowledgment, wrap-up; coordinator records, consent (parent consent required before a kid job), unlocks, snack permission with allergy confirmation, audit, retention clearing, minimum-data summary export and recovery copy; red snack cards change the steps and are read first; offline reload; alert delivery to the lead’s phone under five seconds when connected; end-to-end encryption of everything sent; accessibility scan of every screen with no remaining violations.
- Done since: several helper tablets on one outing (hub and spoke through the live link), photos with a recorded yes, family page with a family yes, head count, Help notes, break reminders, Hindi and Spanish drafts, practice runs, certificates, locked copies and laptop backup, paper backup. Verified by `features_smoke.py` and `devices_smoke.py`.
- Open: a real outing; a native speaker’s check of the Hindi and Spanish; the family page and photos need the coordinator’s consent forms to be updated before use.

## Outcome

Ship a production-ready, offline-first Helper Jobs product for three Sunday outings with three to five adult helpers each. The app must let Pragnya adults take on a clear, dignified role while giving volunteer leads the controls and safety visibility needed to run the outing. It must remain a genuinely different product from the archived communication app while using that app’s exact visual language and presentation system.

## Product boundaries

There are four roles:

1. **Helper** — uses the shared tablet to choose an unlocked job, follow picture steps, ask for help, stop, finish, choose a smiley, and earn badges.
2. **Volunteer lead** — sets up the outing, matches helpers to kids/jobs/nearby volunteers, sees live status, answers Help alerts, checks snacks, and writes wrap-up notes.
3. **Coordinator** — manages helpers, kids, consent, training levels, job unlocks, safe tips, snack permissions, and history.
4. **Family (later phase)** — sees badges and consented photos; not part of the first tablet MVP.

Kids never use the app. Helpers never see last names, diagnoses, family details, unrestricted medical data, or coordinator-only snack records.

## Required journeys

### Helper journey

Landing → Helper mode → “Who are you?” photo grid → job catalogue → unlocked job → optional kid card (first name/photo/up to three tips) → one picture step per screen → read aloud → Next → Done → Happy/Okay/Hard → star/badge → another job or finish.

The red Help button is fixed in the same bottom-right position on every helper screen. Stop anytime is available on every job. Help and Stop never punish the helper or silently discard their state.

### Job catalogue

Level 1: Snack Helper, Walk Leader, Clean-Up Crew.  
Level 2: Play Partner, Talk Friend.  
Level 3: Buddy.

Unlocks are coordinator-approved and never automatic. Locked jobs explain “Coming soon for you!” without revealing sensitive training information.

### Safety-critical flows

- An assignment involving a kid cannot save without a named nearby volunteer.
- Buddy explicitly instructs helpers not to chase a child who runs off and to press Help.
- Helpers never take a kid to the bathroom or provide changing help.
- Snack tiles are coordinator-owned. The lead cannot turn a red snack green on outing day.
- Help creates a persistent alert that remains red until the lead taps “I’m here”; target alert delivery is under five seconds in the connected case.
- Stop creates a lead-visible stop request and leaves the helper in a safe waiting state.
- Consent and retention state are explicit before an outing can use kid records or photos.

### Lead journey

Lead entry → four-digit PIN → outing place/date → mark present helpers/kids → match helper to kid/job/nearby volunteer → validation warnings → save only valid matches → live board with green/on-job, grey/waiting, red/help/stop states → snack check → two-minute wrap-up note and thumbs up/down per helper.

### Coordinator journey

Coordinator web surface → manage helper first name/photo/level/unlocked jobs/voice/language → manage kid first name/photo/tips/snack allow and deny lists/parent consent → inspect assignment, smiley, lead note, Help alert, and unlock history → export only the minimum permitted operational record.

## Data contract

The implementation must represent these records with stable IDs, timestamps, actor IDs, schema version, and conflict metadata:

- `Helper`: id, first name, photo reference, level 1–3, unlocked job IDs, voice setting, language, consent state.
- `Kid`: id, first name, photo reference, up to three tips, snack allow list, snack deny list, parent consent state.
- `Job`: id, name, level, picture reference, steps containing picture/words/audio, needs-volunteer flag.
- `Outing`: id, date, place, lead volunteer, present kids, present helpers, lifecycle state.
- `Assignment`: outing, helper, job, optional kid, named volunteer, start/end times, smiley, lead note, state.
- `HelpAlert`: outing, helper, assignment, time pressed, time answered, lead note, alert type, state.
- `AuditEvent`: actor, action, record type/id, timestamp, reason, before/after redacted summary.

Badges are derived from assignments; they are not an independently editable record.

## Offline and sync contract

The tablet must boot and run Helper mode without network access. All read/write operations use a local versioned store. Mutations append to an outbox with idempotency key, actor, timestamp, and schema version. Reconnect retries safely. Conflicts never overwrite kid safety data silently; the lead/coordinator receives a clear reconcile state. A local export/import recovery path must be tested.

## Accessibility and visual fidelity contract

Use the archived visual files as source code, not as loose inspiration:

- Load the copied `theme-atlas.css` and bundled Fraunces files as the final visual layer.
- Preserve coffee/cream palette, rust accent, paper surfaces, square-ish borders, editorial headings, condensed/sans controls, focus rings, reduced-motion treatment, and responsive breakpoints.
- Keep the landing page, slide deck, handout, and app shell in the same hierarchy and illustration language; replace only the words, icons, and story for Helper Jobs.
- Picture-first: every job, step, and important action has a meaningful icon/image and no more than five words beneath it.
- Touch targets are at least 64px in Helper mode; no more than four choices appear at once.
- No scrolling is required to understand a single Helper step.
- Sound effects are off by default. Read aloud is user-invoked and can be turned off.
- Talk Friend’s 10-second wait circle is supportive, never a failure timer.
- Test keyboard focus, screen-reader names, high contrast, reduced motion, text scaling, and forced colors.

## Delivery slices

1. **Foundation:** retain the current MVP, add test fixtures, shared design tokens, app shell, local store, routing/state contract, and explicit privacy banner.
2. **Helper MVP:** all Level 1 jobs plus Play Partner, picture steps, speech, Help/Stop/Done, smiley, stars, and offline persistence.
3. **Lead MVP:** PIN, outing setup, assignment validation, live board, alert acknowledgment, snack immutability, and wrap-up.
4. **Full catalogue:** Talk Friend countdown, Buddy safety steps, coordinator unlock approvals, badges, language/voice settings, and richer kid cards.
5. **Coordinator surface:** CRUD with consent boundaries, audit history, minimum-data exports, retention controls, and safe photo handling.
6. **Hardening:** sync queue, conflict recovery, security/privacy review, responsive visual review, realistic three-outing rehearsal, and deploy verification.

## Acceptance gates

- A fresh helper can complete two jobs in one outing without a login or network.
- A lead can create an outing and cannot save an invalid kid-facing assignment.
- A red Help alert remains visible until acknowledged.
- A red snack permission cannot be changed by a helper or lead.
- A helper can stop safely at every stage.
- A coordinator can unlock a job and the helper sees the change only after the approved sync.
- Sensitive kid fields never appear in Helper mode, URL fragments, public logs, or exported static fixtures.
- Local reload, offline mode, reconnect, duplicate submission, and conflict recovery all have automated tests.
- Landing page, app, presentation, handout, GitHub Pages, and Render assets all use the same exact visual source layer.
- GitHub Actions passes the contract/build/accessibility gates and the deployed URL serves the expected Helper Jobs artifact.

## Verification commands

At minimum, the repository must provide and pass:

```sh
node --check helper-jobs/app.js
node --test helper-jobs/tests/*.test.mjs
python3 helper-jobs/tests/browser_smoke.py
python3 -m http.server 8765 --directory helper-jobs
```

The final implementation must add a deterministic test command covering the data contract and safety invariants, plus a static bundle check that proves `archive/` is not copied into Pages or Render output.

## Non-goals

- No diagnosis, clinical claim, or automated inference about helpers or kids.
- No direct child account or child-facing login.
- No helper access to unrestricted allergy/medical records.
- No automatic training-level promotion.
- No public publication of the archived research workspace.
- No family-facing phase until consent, photo retention, and coordinator review are proven.
