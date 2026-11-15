# Appointment-to-appointment release audit

The contract is [the continuity goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONTINUITY.md), not merely the list of tests that happens to pass. Result counts are accepted only when their recorded source hashes match the release. The archive verifier enforces that check.

| Requirement | Implementation and direct evidence |
| --- | --- |
| Prepare, use, review, return, prepare another visit | Existing VN browser suite; NC-03 creates and saves a second visit while preserving the source; NC-10 repeats the later journey after a full offline browser restart. |
| Search and unfinished counts; opening is read-only | `findVisits` in model; `renderList` in app; NC-02 compares exact stored text before and after search/open. Search model test excludes private-note canaries. |
| Editable next steps, optional date/contact, reversible states, confirmed removal | `renderActions` and input/change handlers; NC-01 edits all states, cancels and confirms removal, and inspects saved content. |
| No automatic advice, pressure, or inferred completion | Model actions begin To do and change only through input handlers. UI uses the person's own text; no inference, notification, overdue, or remote-service code was added. VN-03 checks question navigation never answers questions. |
| Selective carry-forward and preview, new identifiers, reset states | `carryForward` and `showCarry`; model test compares source before/after and verifies new identifiers; NC-03 inspects both preview and saved source/new visits. NC-15 permits an action-only draft. |
| No private preparation or answer notes copied | `carryForward` constructs a blank record and explicitly copies text/date/contact only; model and NC-03 private canaries must be absent. |
| Reusable requests require save/apply/share choices | `choosePreferences`; NC-04 checks defaults, separate persistence, explicit addition, sharing exclusion, and independent clearing. |
| Individual and whole-library backups, clear privacy notice | `backup`, `libraryBackup`, UI notices; VN-11 and NC-05 inspect actual downloaded JSON. NC-15 restores all visits/preferences into an empty browser. |
| Import validation, preview, duplicate/conflict handling, no overwrite | `restoreLibrary` and `planLibraryImport`; model tests reject damaged records and check repeat imports; NC-05 checks cancellation, repeated imports, identifier conflicts, and preservation of an unsaved draft. |
| Failed/interrupted writes and concurrent edits | NC-06 simulates storage failure, NC-07 edits in another tab during import preview, NC-08 switches draft while an action save waits, NC-14 closes a tab while a write waits. Existing VN delayed-save/delete and two-tab cases remain required. |
| Old visits/backups and actual worker upgrade | NC-09 runs the frozen previous-release runtime, upgrades the worker, compares original saved text until a saving action, and restores an actual old backup. NC-12 opens old code against upgraded data and checks no overwrite. |
| Offline return and saved continuation | NC-10 closes and relaunches a persistent browser offline, verifies stored content, and creates/saves the next visit without a network. |
| Selected summaries across preview, download, copy, print | `summary` explicitly projects chosen fields; NC-01 compares all output paths including next-step date/contact. Existing VN checks cover preparation-note exclusion and other sharing selections. |
| No outgoing private content | VN-18 records runtime requests; NC-13 monitors the new selection, backup, and import flows with a canary and rejects external, non-GET, or content-bearing requests. Runtime uses no external dependency. |
| Keyboard, narrow layout, enlargement | VN-15 and keyboard journey; NC-11 uses keyboard action/carry controls and checks labels/320px layout; NC-13 checks long-content dialogs at 320px and CSS zoom 200%. Screen-reader and manual browser-zoom tests are not claimed. |
| Detailed PRD and fictional multiple-visit walkthroughs | `PRD.md` describes screens, fields, state changes, migration, saving, imports, sharing and failure cases. `walkthroughs.md` contains three labelled fictional tasks and expected software behaviour. |
| Executive HTML presentation and build review | `build-presentation.mjs` produces a 12-section `executive-presentation.html` using real screenshots with fictional content and recorded result counts. `review.html` links current tests, decisions, requirements and the presentation. Release checks open both, inspect images/links/layout, and validate the section count. |
| Repeatable, runnable release and start instructions | `build-release.mjs`, `tests/release.mjs`, README. Verify archive and extracted-file hashes, repeat the build, then run the extracted app through the new next-step/carry-forward flow. |

## Boundary of the evidence

Participants, recruitment, public deployment, demand, payment, clinical benefit, and preference over ordinary notes are not part of completion. No such results are claimed. The release is not a full accessibility certification. Imports remain limited to 10 MB, backups are unencrypted, and browser storage can be cleared externally. A deliberately confirmed old-version data reset can still remove newer data; close old tabs and keep backups.
