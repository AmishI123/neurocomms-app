# Saved follow-up draft acceptance audit

Status: engineering delivery approved. All 250 current-source checks passed with no recorded browser script errors. The 195-file extracted-release workflow passed, including identical rebuilding. The approved archive is identified by matching `sha256` in [manifest](releases/manifest.json) and `archiveSHA256` in [verification](releases/verification.json). A mismatch means the package is not approved.

| Requirement | Delivered behavior and passing evidence |
| --- | --- |
| D1 Optional saving | Explicit first-save privacy consent, manual later saves, separate draft status; no progress recorded by saving. DF01/DF04/DF05 cover exact saving, warning state, failures and cancelled waiting writes. |
| D2 Deliberate reopening | Neutral Home count, private list, preserved independent copies and replacement guards. DF01/DF07/DF12/DF15 cover these boundaries; DF14 checks keyboard use. |
| D3 Exact return | Message words/line breaks, original sources, progress state/date/note and optional names survive. DF01/DF02/DF08 cover offline reload and full browser restart. Model tests check migration without a write on read and refusal by the old collection-six reader. |
| D4 Changes/failures | Expected saved copies checked before changes. Changed/deleted sources block progress without losing drafts. DF03/DF09 cover source and two-tab conflicts; DF04/DF05/DF10/DF11 cover failed or queued saves/finishes/deletes and cancellation. Model tests cover stale copies and all-or-nothing completion. |
| D5 Backup/transfer | Private restore preview, validation, duplicate protection and retained differing copies. DF06/DF13/DF15/DF16 cover restore, isolated browsers, malformed files and old-file replay. Model tests cover source remapping, missing-source ID collisions and unchanged/differing transfer returns. All fifteen previous transfer scenarios pass. |
| D6 Separate finish/delete | Copy/download, save, discard, delete and record progress remain separate. DF02/DF07/DF10/DF11/DF12 check one-write completion, cancellation, preserved working edits and no repeated history. The extracted app finishes transferred progress without changing the sender, then independently deletes/finishes the sender's drafts. |
| D7 Delivery | D1–D7 requirements, twelve fictional journeys, twelve presentation sections with speaker notes and real screenshots, help and shared status. All 250 checks match current source hashes. The extracted workflow checks thirteen HTML documents, links, images, 320/1280px widths, 195 matching files and identical rebuilding. |

Evidence: [draft browser report](qa/drafts-results.json), [model report](qa/model-results.json), [verification commands](verification.md), [fictional journeys](drafts-walkthroughs.md) and [presentation](drafts-presentation.html). DF identifiers name scenarios, not participants.

## Regression count and visual review

24 baseline + 15 continuity + 12 phone + 12 existing-notes + 13 preparation save/resume + 16 recovery + 13 follow-up + 15 transfer + 14 conversation + 12 whole-journey + 16 saved-draft browser scenarios + 82 model checks + 6 communication-card checks = **250**. The extracted-release workflow is additional.

The phone migration scenario runs the old fixture before updating. Its status assertion distinguishes old and new wording; neither assertion was removed. Legacy transfer fingerprints came from the previous approved archive, not a guessed representation of old behavior.

Inspected rendered Home, saved message editor and presentation at desktop/narrow widths. Home does not show private draft names or text. Automatic-saving wording explicitly refers to visits; draft status says later edits need another save. The editor screenshot uses readable fictional wording. Automated checks include long content and enlarged text. These are actual web-app screenshots, not imagined native screens.

## Limits

The current design keeps restored draft-only backups detached from local source visits. They remain readable/editable/downloadable; progress cannot be applied to a guessed item. Full device transfer carries source visits and their draft links together. This limitation is explained before restoring.

No participants, real appointments, native-app release, physical-phone or screen-reader testing is claimed. The target remains the shared desktop/mobile web app.

Storage and downloads are unencrypted; anyone using the browser may open saved work. Clearing browser data can remove it; there is no server recovery or automatic syncing. Visit deletion does not erase independent drafts or downloads. Offline use requires completed setup. Browser-close warnings are supplementary and may not appear on phones. Phone layout/touch tests are emulated; standalone installation was observed in desktop Chromium. Native Android/iOS packaging remains deferred. Usefulness remains unverified.
