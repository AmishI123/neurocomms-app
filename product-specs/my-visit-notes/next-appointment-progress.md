# Next appointment — delivery record

Status: engineering delivery complete. All 271 current-source checks and the 209-file extracted-release workflow passed. See [N1–N7 acceptance evidence](next-appointment-acceptance-audit.md). The approved downloadable package is identified by matching archive hashes in releases/manifest.json and releases/verification.json; the final documentation-bearing archive is checked again by the same verifier.

## Delivered

- Home and after-visit entry points; deliberate saved-visit choice, unfinished/closed item separation and separately chosen communication requests.
- Independent ordinary visit copies, edited through the existing editor. Private preparation notes, answers and history do not carry over. Source versions are checked before confirmation; cancellation and repeated confirmation do not replace or duplicate work.
- Exact short-plan preview, download, copy and print. Ordered questions, visible requests and next steps are included; private notes, answers, history and source context are excluded. Exporting is separate from saving or sending.
- Read-only source inspection, with explicit current wording, captured title/date and missing-source explanations. Transferred copies refer to their own source version.
- Offline saving/reopening and full browser restart through existing visit storage; private backup and device transfer remain available. A working plan remains downloadable when saved storage is unreadable.
- Reordering resets the saved starting question; later conversation movement still keeps the saved place. The complete second-appointment journey preserves the original visit.
- Detailed requirements, twelve fictional journeys, twelve presentation sections with speaker notes and actual screenshots, help, shared status and an acceptance map.

## Verification and corrections

Eight new model cases bring the model total to ninety. Thirteen next-appointment browser scenarios cover selection, editing, exact exports, source edits/deletion, cancellation, source inspection, offline reload/restart, conversation, two-way isolated-browser transfer, storage failure, clipboard/print boundaries, closed-item disclosure, two tabs, keyboard/layout and the reordered starting question. Combined with existing suites, all 271 checks pass against current source hashes, with no recorded page errors.

Visual review found selection dialogs could open scrolled past their introduction. They now focus the heading and begin at the top. Behavior review found question ordering could retain the old conversation starting position; NA13 now proves the corrected position after saving/reopening.

Two new test selectors were corrected without weakening assertions. The standalone-install test now waits for its launched page to finish loading before reading initialization text. Recovery tests now wait for the existing completion screen or expected saved result before asserting the recovered contents; they no longer race asynchronous writes. All affected suites were rerun successfully.

The extracted package passed the earlier complete workflow plus next-appointment creation, exact plan download, offline return, source inspection, transfer and second conversation with interruption/answer recording. Earlier receiver visits remain unchanged and the sender remains untouched. All fourteen HTML documents passed links, images and 320/1280px width checks. All 209 files matched and identical inputs rebuilt an identical archive.

## Starting point and limits

The previous saved-draft release passed 250 checks and a 195-file extracted audit. Existing carry-forward, ordering, requests, saved visits, transfer and conversation were reused rather than introducing another saved-record type. Current shell is v13; collection 7, transfer 2 and visit 3 are unchanged.

Selection dialogs are temporary. Only successfully saved visits survive closing. Source context does not preserve a historic quotation of the original question; inspected wording is current. Files and browser storage are unencrypted, with no server recovery or automatic syncing. Native Android/iOS packaging is deferred. No participant, real-appointment, usefulness, physical-device or screen-reader result is claimed.
