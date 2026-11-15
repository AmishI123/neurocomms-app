# Conversation-view delivery record

Status: engineering delivery complete.

## Delivered

- Chosen-word setup, exact preview and a separate conversation view.
- Editable session requests, requests-only use and question/request return.
- Hide/resume, Escape hiding, page-visibility handling and deliberate private return.
- Existing saved question position, honest failed/waiting/conflicting-save messages and existing after-visit review.
- Detailed C1–C7 requirements, ten fictional journeys, twelve-section executive/conference HTML with speaker notes, updated help and acceptance map.
- Current shell v10; collection 6 and visit 3 unchanged.

## Verification

All 207 required checks passed against current sources: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 15 transfer, 14 conversation, 67 model and six card checks. No recorded browser script errors.

The 165-file archive passed extracted offline conversation, request/question return, hide/resume, private answer entry, answer exclusion and existing review. Previous release journeys also passed. Eleven HTML documents passed local-link, image and 320px/1280px layout checks. File hashes matched source and extraction, and rebuilding produced an identical archive. Final identity is recorded in releases/manifest.json with its matching releases/verification.json.

The shown and hidden narrow app views and desktop/narrow presentation were visually inspected. The presentation has twelve sections and twelve sets of speaker notes.

## Audit findings

The requests-only exit no longer offers a nonexistent selected answer note. Delayed save status refreshes during pause and exit. A stale resume never opens setup in place of the hidden display. Existing generic-dialog assertions now target the original workspace dialog. A recovery test now waits for the explicit asynchronous completion message before checking the restored title; the same title and restart assertions passed.

One combined test runner ended after the phone suite had written its complete passing report. The terminal handle was confirmed, the report was checked, and unfinished suites ran separately. Failed or stale intermediate records were not accepted for the final build.

## Limits

No participants, real appointments, physical-phone review, screen-reader review or clinical outcomes. CV11 injects page visibility; it does not verify an operating-system app switcher. Browser width, CSS enlargement and accessibility-tree checks are limited engineering evidence. This view is not an unlocked-device security barrier. Session display choices and edited requests do not survive closing the page.

No required work remains for this goal. Future user-benefit or physical-device evaluation is separate.
