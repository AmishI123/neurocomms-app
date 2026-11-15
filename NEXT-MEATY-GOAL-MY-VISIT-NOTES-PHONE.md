# My Visit Notes: easy to use on a phone, from first open to recovery

## Outcome

Make the existing appointment-to-appointment product easier to start, read, use on a phone, and recover. Complete the whole journey: first open, prepare, save, use offline, record next steps, close and return, export a backup, restore into a clean browser, and prepare another visit.

This is an engineering goal. Participants, recruitment, accounts, cloud storage, public deployment, app-store launch, and medical advice are not required. Software checks do not establish user benefit.

## Required product work

1. A clear first screen explains the purpose, local saving, and how to begin. Offer Prepare my visit, Open a saved visit, and a labelled fictional example. Move recovery tools out of the main working area without removing them.
2. A phone-focused appointment view keeps the current question and primary controls easy to reach. Keep optional controls available but secondary. Check long questions, portrait/landscape, reduced space while typing, interruptions, and reopening after browser closure.
3. Provide text-size, spacing, and contrast choices. Preserve chosen settings between visits and browser sessions. Do not rewrite any question or note. Keep action labels short and explain sharing, copying, and restoring before they happen.
4. Clearly distinguish temporary work, safely saved work, and failed saves. Provide guided recovery for browser-data loss, damaged/older backups, conflicting copies, and damaged saved data. Explain replacement and deletion before confirmation.
5. Add an app icon, manifest, installation guidance, and truthful offline/update status. Test installability and standalone operation where supported in this environment. Record unsupported real-device/installation checks as unavailable, not passed.

## Deliverables

- Updated detailed plain-language PRD, including every new state and recovery branch.
- Improved working app without losing the previous features or saved-data compatibility.
- Repeatable phone-layout/browser, keyboard, saving, migration, offline, backup, recovery and installation checks.
- Clearly fictional first-use and recovery walkthroughs.
- Updated executive HTML presentation with actual before/after screens and reasons for meaningful changes.
- Verified deterministic release archive, checksums, start instructions, and requirement-level completion audit.

## Definition of done

The entire fictional journey above must preserve questions, states, actions, and private notes without unexpectedly sharing them. All required checks available in this environment must pass against the delivered source. Preserve and rerun existing suites. Verify the extracted release and the presentation's links, images and narrow layout. Describe phone emulation, simulated keyboard space, installability diagnostics, actual standalone operation, and real-device tests separately. Do not call a simulation a physical-device check.
