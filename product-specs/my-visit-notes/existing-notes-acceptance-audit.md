# Existing-notes release — acceptance map

Use this map with the recorded results, not instead of them. `build-release.mjs` refuses a release unless all suites pass and their recorded source hashes match current files. `tests/release.mjs` checks the extracted archive, not only the working tree.

| Requirement | Direct evidence |
|---|---|
| Start from welcome or an open visit; no early write | IN-01, IN-02; PH-01 checks the four named starting choices |
| Paste text, UTF-8 .txt, preserve wording, reject invalid encoding/binary/size | Intake model tests 1–3; IN-03 and IN-12 |
| Select full source or a passage; keyboard selection | IN-01, IN-09, IN-12 |
| Edit type/text, remove choices, retain snapshots after source replacement | IN-03, IN-09, IN-12 |
| Questions, personal next steps and private notes enter correct fields | Model append test; IN-01 and IN-08 |
| Exact preview and cancellation before adding | IN-01, IN-02, IN-12; `intake.mjs` renders text nodes, not source HTML |
| Matching defaults and explicit duplicate override | Model matching/repeat tests; IN-02 |
| New draft; append to open visit; append to another saved visit | IN-01, IN-02, IN-04; new-draft replacement warning is in review |
| Preserve current draft while saving to another visit | IN-04 |
| Storage failure leaves stored destination unchanged and selections recoverable | IN-05 |
| Failed autosave retains updated open draft for backup without repeating batch | IN-06 |
| Stale saved-target preview cannot overwrite another tab | IN-07; write revision and snapshot checks in `app.mjs` |
| Repeated confirmation once; cancelling a queued write prevents late application | IN-11 |
| Source not stored or shared; source download, clear cancellation and leave warning | IN-01, IN-10; model backup/summary test |
| Offline reopening and new intake while offline | IN-01; SW v5 includes both intake modules |
| Save, full backup, restore and selective carry-forward | IN-01, IN-06, IN-08; existing continuity suites cover library recovery |
| Private notes excluded from summary and carry-forward | IN-01, IN-08; model downstream test |
| Keyboard access, focus return, narrow and enlarged layouts | IN-09 and IN-12; emulation, not physical-device or screen-reader testing |
| No outbound source content | IN-10 observes request URLs, methods and bodies during intake; modules contain no remote service calls |
| Previous app behavior | 24 baseline, 15 continuity and 12 phone scenarios; six unchanged communication-card checks |
| Updated runtime and installation | PH-08 performs a continuity-to-current worker upgrade; PH-10 installs and opens actual standalone Chromium offline |
| Detailed plain-language requirements | `existing-notes-PRD.md`, plus the existing full `PRD.md` |
| Fictional walkthroughs and executive HTML | `existing-notes-walkthroughs.md`, `build-existing-notes-presentation.mjs`, generated `executive-presentation.html` |
| Reproducible distributable and fresh extracted flow | `build-release.mjs`, `tests/release.mjs`; checks archive/source hashes, deterministic rebuild, new intake in extracted app, presentation images/links/layout |

## Boundaries of the evidence

Software tests use fictional notes. Browser leave-warning tests check that the app requests a warning, not that every browser will display one. CSS zoom is an automated enlargement check, not manual browser zoom. Installation uses full desktop Chromium in a temporary profile, not a physical Android or iOS device. The prior worker fixture predates both the phone improvements and intake; it checks an upgrade to the current shell, not every previously shipped shell combination.

No participant preference, clinical benefit, time saving, screen-reader audit, physical-phone audit or demand is established. No public service has been deployed. A source download does not include separately edited chosen passages; this is explained in requirements. File bytes may change because of newline normalization and UTF-8 decoding, while wording is retained.
