# Stop halfway through and safely continue another day

Status: engineering delivery complete. All 250 current-source checks and the 195-file extracted-release workflow passed. See [acceptance evidence](product-specs/my-visit-notes/drafts-acceptance-audit.md). The final downloadable archive is approved only when releases/manifest.json and releases/verification.json contain the same archive hash. Usefulness remains unverified.

## Outcome

Someone can start a follow-up message or progress note, choose to keep it privately, close the browser, and return later—even offline—with their exact words intact. Saving a draft does not send a message or record completed progress.

## Required delivery

1. Optional private saving for unfinished messages and progress entries, with truthful saved/unsaved status and explicit first-save consent.
2. Neutral saved-draft counts and a deliberate list/open route from Home; no private wording on initial load.
3. Exact reopening after reload and full browser restart, including message wording, selected source items, progress state, date and private note.
4. Safe handling of changed or removed source visits, saved draft conflicts, two tabs, failed writes and interrupted operations. Never retarget or silently overwrite newer work.
5. Private draft backup/restore and inclusion of saved drafts in device transfer, with exact preview, separate differing copies, source-link preservation and repeated-file protection.
6. Separate save-draft, record-progress, download/copy-message and delete-draft actions. Finishing progress and removing the corresponding saved draft must not leave half-applied work.
7. Detailed plain-language requirements, at least ten fictional journeys, executive/conference HTML with speaker notes, updated help, current-source tests, requirement audit and an extracted verified release.

## Finish line

Demonstrate start → save draft → close browser → reopen offline → resume → finish or discard. Check failed saves, two tabs, source edits/deletion, delayed writes and cancellation, older data, private backups, two-browser transfer and return, keyboard, narrow/enlarged screens and exact private-content boundaries. Retest every existing capability against the final code, build the package, verify the extracted app and inspect its rendered presentation.

This remains the shared desktop/mobile web app. Native Android and iOS packaging can be added later if needed; it is not part of this goal. No accounts, automatic sending, medical advice, participant recruitment, physical-device or screen-reader claim is included.
