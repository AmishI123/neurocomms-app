# Recovery acceptance audit

Status: accepted as an engineering release. All 139 checks passed and their source hashes matched the packaged files. The 122-file extracted archive passed recovery after reopening, existing workflows, deterministic rebuilds and eight HTML documents' links, images and 320px/1280px layouts. Its checksum and matching verification are recorded in `releases/manifest.json` and `releases/verification.json`.

| Requirement | Evidence inspected | Result |
| --- | --- | --- |
| R1: complete question / next-step recovery | Model checks restore notes, dates, contacts and states; RC-01 saved question/offline recovery; RC-12 complete next-step restoration preserves a newer title; extracted app removes and restores a question across reloads | Passed |
| R2: removed visits / preparations | RC-03 recoverable visit removal and permanent deletion; RC-05 preparation recovery preserves receipts; RC-14 permanent preparation deletion removes result history | Passed |
| R3: earlier wording without unrelated loss | Model per-field and stale-preview checks; RC-02 cancellation/title restoration; RC-06 conflict; RC-13 failed open-draft edits cannot be overwritten | Passed |
| R4: selective batch undo | Model selective additions/newer private text; RC-04 first-save transfer; RC-05 kept result; RC-11 exact text and keyboard; RC-16 saved-target ambiguity refused while other items remain recoverable | Passed |
| R5: bounded retention and erasure | Model count/age limits; RC-07 erase-all keeps current notes; RC-09 expired records unavailable and pruned on successful write; app/help/requirements explain cleanup timing | Passed |
| R6: temporary work | RC-04 transfers temporary batch history; RC-11 no storage before saving; RC-05 retains result without a saved visit; RC-13 first-save failure/retry preserves history | Passed |
| R7: privacy and backups | RC-07 current-visit backup and summary exclude earlier private text; RC-14 library/preparation outputs exclude history and ordinary print hides recovery; all 24 baseline scenarios including summary/print pass | Passed |
| R8: safe writes | RC-06 failed write/tab conflict; RC-08 cancelled locked write; model consumes selections; RC-10 full browser restart offline; RC-15 double confirmation/tab close; model v3 migration preserves visits/preparations/receipts without modifying source | Passed |
| R9: access | RC-11 keyboard/320px; actual 390px preview visually inspected; 12 phone scenarios passed including reading modes and real standalone offline launch; rendered executive opening visually inspected and all eight documents checked at narrow/wide widths | Passed within documented limits |
| Complete delivery | Requirements, eight walkthroughs, 12-section executive/talk HTML with speaker notes, updated help/PRD/README, decision/status and verified 122-file archive | Delivered |

## Current limits

Physical-phone use, screen-reader use and benefit to people remain unverified. No participants or clinical results are claimed. These limits must remain visible in the final briefing.

## Regression findings already addressed

- IN-06 exposed a changed failed-autosave path. Open-visit additions again remain in the draft and full backup when automatic saving fails. The full intake suite then passed.
- NC-09 still expected collection version 3. It now expects version 4 and checks the recovery array while retaining unchanged-before-save and visit-preservation assertions. All 15 continuity scenarios passed on rerun.
- RC-11 exposed HTML's initial-newline removal inside textareas. Editors now assign exact values after rendering. All 16 recovery scenarios passed against the updated files.

## Release rule

Every row must be closed with authoritative evidence, and all report source hashes must match the packaged files. An old successful archive does not verify this working tree.
