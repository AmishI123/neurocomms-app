# Whole-journey acceptance audit

Status: engineering requirements passed. All 219 current-source checks and the 178-file extracted-release journey passed. Final archive identity and approval are recorded together in `releases/manifest.json` and `releases/verification.json`; their archive hashes must match. Documentation-only updates require another package build and extracted verification before handoff.

| Requirement | Current evidence | Result |
| --- | --- | --- |
| J1 Home | JY01 temporary/saved return, JY07 private-list closing, JY08 empty states, JY11 full offline restart; extracted Home/selected saved return | Passed: three purposes, neutral counts, no automatic private reopening |
| J2 Focused workspace | Tools below workspace in journey-ui.mjs; JY07/JY12 keyboard routes; RC-01–RC-16 recovery; PH-04/PH-05/PH-09 guided recovery and focused import; inspected Home/review screenshots | Passed: controls remain reachable through actual public navigation |
| J3 Preparation | JY01 earlier temporary destination plus edits made after choosing it; JY06 saved preparation offline; IN-01–IN-12 and RP-01–RP-13; intake destinationRecord/pinOpenDestination audit; extracted saved preparation/completion journey | Passed: explicit destination, retained work, guarded replacement and no repeated additions |
| J4 Conversation | CV01–CV14; JY06 preparation-to-display; JY12 keyboard journey; extracted offline chosen words, request, hide/resume, private answer and review | Passed: selection/preview and deliberate private return remain; requests-only supported |
| J5 Finish | JY01/JY06 review, Home and unfinished counts; JY02/JY03 failed/waiting save messages; FU-01–FU-13; extracted review-to-Home-to-review | Passed: no automatic completion or saving through navigation |
| J6 Preservation | JY01 retained message/progress and focus after discard; JY04 conflict; JY05 queued-write cancellation and close-warning handler; JY09 exact draft/replacement/close-warning handler; JY10 stale deletion and discard cancellation; extracted retained message/progress save | Passed: navigation preserves work and original save guards; session-only limits are explicit |
| J7 Delivery | Detailed J1–J7 requirements, twelve fictional journeys, twelve presentation sections and twelve speaker-note sets, current screenshots, help, complete command list, all 219 checks, 178-file extracted verification and twelve-document checks | Passed within the stated engineering scope |

## Gate and source evidence

Every report below passed without recorded browser script errors. `build-release.mjs` and `tests/release.mjs` require all counts and all recorded source hashes to match, including the shared public-navigation helpers. A prior release's passing report cannot approve changed tracked files.

| Report in qa/ | Passed checks |
| --- | ---: |
| browser-results.json | 24 |
| continuity-results.json | 15 |
| phone-results.json | 12 |
| intake-results.json | 12 |
| resume-results.json | 13 |
| recovery-results.json | 16 |
| followup-results.json | 13 |
| transfer-results.json | 15 |
| conversation-results.json | 14 |
| journey-results.json | 12 |
| model-results.json | 67 |
| card-results.json | 6 |
| Total | 219 |

The extracted-release gate is additional. It verifies every packaged file against the manifest and working source, rebuilds identical bytes, then serves the extracted files. Its browser journey covers preparation, sharing, saving, carry-forward, reading choices, guided recovery, saved preparation/completion, selected recovery, follow-up, two-browser transfer and return, offline conversation, private review, Home and retained message/progress. It also checks twelve HTML documents for narrow/desktop overflow, loaded images and local links. `releases/verification.json` records the exact tested archive and extracted directory.

## Artifact and visual audit

- `journey-PRD.md` and the root journey goal preserve all seven requested requirements.
- `journey-walkthroughs.md` contains twelve fictional journeys, including an earlier destination, unfinished work, failed saves and keyboard use.
- `journey-presentation.html` and the current `executive-presentation.html` contain twelve sections with speaker notes, real fictional-data screenshots and explicit evidence limits.
- `help.html` describes Home, Tools, destination preservation, session-only drafts, separate deletion and finish/save meanings.
- `verification.md` lists every current test command, the build command and extracted-release command. `README.md`, `PRD.md`, `decision-report.md` and `goal-status.md` identify the current delivery and retain earlier milestones as history.
- The current Home and full review screenshots were visually inspected. The presentation opening was inspected at desktop and narrow widths during delivery, and the extracted desktop opening was inspected again. Automated document checks cover 320px and 1280px. This is not a visual inspection of every possible screen or a physical-phone test.

## Safety and cancellation audit

Home changes visibility, not visit records. App close warnings include unfinished visit, preparation, message and progress work. Explicit warning-handler checks cover retained message/progress after dialog closure; mobile browsers can still close without delivering a warning. Recovery reveals its containing Tools controls before focus. Opening a replacement visit pins the earlier preparation destination before changing the current visit.

Saved-visit removal, clear-all and damaged-data reset retain separate session drafts. Deletion warnings and help explain how to discard them separately. Retained progress keeps its original saved item/version, so deletion or another tab's change cannot redirect its save. Existing damaged-data, delayed-deletion, conflict and cancellation scenarios remain in the full regression gate. No new destructive operation was used to perform this delivery.

## Findings addressed so far

- Closing a message formerly removed its return path. Session retention and explicit replacement/discard now preserve user control.
- Unsaved progress entries also needed retention. They retain their fields and original save checks, with a private download when saving is unavailable.
- An Open visit preparation destination could follow a later open visit. It now retains the earlier destination and captures later edits before switching.
- Home state and the existence of an open visit are different. Rendering now respects which screen is visible without discarding the open visit.
- Existing tests assumed four Home buttons and directly visible tools. Their routes now use public controls; content, persistence, privacy and conflict assertions remain. Recovery count assertions wait for the actual completed recovery instead of reading while its asynchronous write is pending.

## Limits

No participants, physical devices, real appointments or screen readers. The app is not a clinical tool or a device lock. Session message/progress drafts do not survive closing the page and are not automatically added to transfer files. A stored backup and a downloaded draft are separate things.
