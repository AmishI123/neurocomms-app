# Device-transfer delivery record

Status: engineering delivery complete. User benefit remains unverified.

## Delivered

- One private 20 MiB transfer file for saved visits, preparation/results, completion receipts, requests, focus and optional current reading choices.
- Explicit inclusion/exclusion of unsaved visit/preparation snapshots, kept separately from saved records. Recently removed objects, recovery history and local restored-file records are excluded.
- Read-only preview with expandable private details, different-copy comparison, actual focus/request wording and separate receiving-side choices for focus/settings.
- Correct links for saved destinations, missing sources, independent copied items and distinct retained temporary results. Conflicting completed results retain their own records; older pending batches cannot replay completed additions.
- Notes and the import record commit together under the existing lock. Optional settings save separately with truthful failure/retry feedback. Current open work stays unchanged until deliberate guarded continuation.
- Duplicate-file protection after later edits/deletion and a separate confirmed forgetting action for local fingerprints/identifiers.
- Collection 6, visit 3 and shell v9; prior supported collection/backup formats remain readable without opening-time writes.
- Full PRD, ten fictional journeys, shared help/README/decision/verification documents, twelve-section executive/talk HTML with speaker notes and T1–T7 acceptance evidence.

## Verified evidence

All 193 current-source checks passed: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 15 transfer, 67 model and six communication-card checks. Browser error lists are empty; report source hashes match.

The 152-file extracted archive passed all file hashes, identical rebuilding, original workflows, and a real export/import/continued-edit/transfer-back journey between two isolated browser contexts. The original records stay unchanged; incoming copied items link to the changed imported source version rather than the older local version. Ten HTML documents passed local-link/image/narrow/wide checks. Actual transfer screens and the presentation opening were visually inspected.

The exact current archive and its verification are in releases/manifest.json and releases/verification.json. Their checksums must match; later source edits invalidate the previous package. No test process remains needed for this completed delivery.

## Important audit fixes

Retained temporary results now have separate identities from same-ID saved visits, including multiple retained versions with different results. Completion records follow those result identities.

Identical copied wording is kept separately when its source resolves to a different imported version. Source chains are resolved before reusing existing records, so deduplication cannot redirect a copy to the wrong source.

Reading-setting failure does not undo saved notes or cause a retry to duplicate them. Transfer records retain only fingerprints/identifiers and can be forgotten separately with a clear warning about older files restoring deleted content.

## Limits

No accounts, cloud storage, automatic syncing/sending, notifications or medical interpretation. Transfer files are unencrypted. A download is not proof of safe storage elsewhere. Temporary message drafts need their own copy/download.

No participants were recruited or simulated. Physical-phone use, screen-reader use and usefulness remain unverified. CSS enlargement and desktop narrow-screen tests are not manual browser-zoom or physical-device audits.
