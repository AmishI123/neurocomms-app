# Save-and-resume release — acceptance evidence

Final result: all 110 software checks passed against matching source. The 107-file extracted release also passed its independent app-flow, checksum, rebuild, local-link, image and layout checks. The exact archive identity is recorded in `releases/verification.json` and `releases/manifest.json`.

This maps the full goal to direct checks. Passing text in this document is not a substitute for recorded results. The release builder requires every suite to pass and verifies source hashes. The extracted-package test checks the distributable separately.

| Requirement | Evidence |
|---|---|
| No saving before permission; cancelled save leaves no stored preparation | RP-01 |
| Preserve source, edited/empty items, name and passage types | RP-01, RP-09; preparation round-trip model test |
| Explicit later saves and truthful unsaved state | RP-01, RP-09, RP-13 |
| Multiple named preparations; replacement cancellation | RP-10 |
| Return offline after a complete browser restart | RP-07 uses a persistent profile, closes the browser, then launches it offline |
| Completed result is recoverable without separately saving a visit | RP-02, RP-07; temporary-result model test |
| Preserve destination identity when another visit is opened | RP-13 |
| Changed destination gets a fresh review; missing destination is not silently replaced | RP-03, RP-11; destination model test |
| Save additions and completion together; no half-applied saved state | RP-04, RP-08; atomic-transition model tests |
| Cancel or close while a completion write waits | RP-08 |
| Already-recorded batches cannot replay from an older pending backup | RP-05, including a completed backup saved in a clean browser; receipt model tests |
| Repeated ordinary confirmation is guarded | IN-11; the same busy flag wraps saved-preparation confirmation |
| Failed first save remains temporary and recoverable through a private backup | RP-09 |
| Restore private backup into a clean browser without automatically saving | RP-09 |
| Malformed backup changes nothing | RP-12; preparation validation tests |
| Conflicting tabs cannot overwrite newer preparation | RP-11 |
| Delete preparation separately; cancel deletion; keep saved visit | RP-06 |
| Clear-visit and library-backup wording distinguishes preparation | `app.mjs` confirmations; preparation-library model test |
| No source in visit summary or individual visit backup | RP-12; existing summary projection model tests |
| No outbound source content during the new flow | RP-12 records request URLs, methods and bodies |
| Keyboard activation and narrow layout | RP-12; existing IN-09 keyboard and focus checks |
| Earlier collections migrate in memory; old runtime refuses version 3 | Preparation migration and previous-runtime model tests; NC-09 and NC-12 browser upgrade checks |
| Existing visit/intake/continuity/phone behavior | 24 baseline, 12 intake, 15 continuity and 12 phone browser scenarios |
| Real installation and standalone offline opening | PH-10, full desktop Chromium in a temporary profile |
| Detailed requirements and fictional walkthroughs | `resume-PRD.md`, `resume-walkthroughs.md` |
| Executive presentation with real screens | `build-resume-presentation.mjs`, generated `executive-presentation.html`; RP-01/RP-02 screenshots |
| Final archive matches source and rebuilds identically | `build-release.mjs`, `tests/release.mjs`, `releases/manifest.json` |
| Extracted app supports saving, resuming and completed-result reopening | `tests/release.mjs`; final result recorded in `releases/verification.json` |
| Presentation images, local links and narrow document layout | Extracted-release verifier checks current and retained presentations at 320 and 1280 pixels |

## Full release gate

110 checks: 24 baseline browser, 15 continuity browser, 12 phone browser, 12 intake browser, 13 resume browser, 28 model and six unchanged communication-card regression checks. In addition, the extracted archive is exercised and rebuilt identically.

## Limits

All examples are fictional. No participant study, physical-phone test, screen-reader audit, clinical benefit or demand is claimed. Browser closing-warning checks establish that the app requests a warning, not that every operating system shows one. Phone dimensions are emulated; installation uses desktop Chromium.

Minimal completion identifiers remain after deleting preparation. They hold identifiers rather than source text. A browser holding only an old pending backup cannot know about later work elsewhere. A completed backup saved in a new browser does bring its own completion records; RP-05 checks that distinction.

Preparation source and retained draft copies are sensitive. Downloaded files and browser storage are not encrypted by this app. Deleting a preparation loses a result kept only inside it; the deletion confirmation explains that. Separate visit backups do not include preparation.
