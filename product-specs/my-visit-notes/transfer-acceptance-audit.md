# Device-transfer acceptance audit

Status: engineering acceptance complete. All 193 current-source checks passed. The 152-file extracted package passed the two-browser transfer-back journey, original workflows, hashes, identical rebuilding and ten-document checks. The matching release manifest and verification identify the approved final package; later edits invalidate that approval.

| Requirement | Evidence | Verified scope |
| --- | --- | --- |
| T1: one deliberate private file | Transfer round-trip and exclusion model checks; TR-01 saved preparation/focus/reading; TR-02 explicit unsaved choices; TR-10 exclusions; real recovery-content projection test | Private, unencrypted file; explicit snapshots; recovery and local import records excluded |
| T2: inspect before changing | Read-only model planning; TR-01 preview with no write; TR-04 malformed/cancelled files; TR-13 unsupported/oversized files; expandable private details and different-copy comparison | Rendered preview inspected; TR-09 expanded long unbroken text fits narrow/enlarged views |
| T3: preserve meaning and links | Model conflict, source/focus/destination mapping, retained-result versions and completion receipts; TR-01 transfer back; TR-07 repeat/deletion; TR-11 forgetting; TR-14 retained temporary result; TR-15 old pending batch | Extracted return preserves originals and keeps a separate copy when its source version changed |
| T4: deliberate continuation | TR-01 resumed preparation and follow-up; TR-02 receiving draft unchanged and guarded opening; TR-03 separate settings retry; TR-09 changed settings preserved; TR-10 defaults | Current preparation and reading regression suites passed; no automatic replacement of open work |
| T5: honest failures and privacy | TR-03 failed writes; TR-05 stale preview; TR-06 cancellation/closed tab; TR-07 double confirmation; TR-08 only local GET requests; private summary projection in baseline/model suites | All prior suites passed with matching source hashes; no remote parsing or sending |
| T6: offline/access/compatibility | TR-08 full offline restart after import and continued edit; TR-09 keyboard/320px/desktop CSS enlargement; TR-12 collection-5 read-only migration; existing old-shell update and old backup checks | Current phone/continuity suites and ten rendered HTML documents passed within stated limits |
| T7: complete delivery | Detailed PRD, ten fictional journeys, shared help/docs, 12-section executive/talk HTML with speaker notes | 193-check gate, 152-file extracted verification and visual inspection completed |

## Issues found by the audit

A retained temporary result could initially share its imported identifier with an older saved visit. The completed-result opener prefers a saved record when one exists, so preserving the text alone was not enough. Dedicated model tests now require distinct temporary result identities and matching completion links, including two retained versions. TR-14 exercises the actual result-opening flow.

Reading settings use a separate storage key from notes. The implementation intentionally reports their result separately rather than claiming one atomic write. TR-03 checks a settings-only retry; TR-09 checks a newer setting from another tab.

Unchanged copied wording is not necessarily an identical record: its source may resolve to a different retained visit version after transfer back. The planner now resolves source chains before reusing local records. A dedicated model test and the extracted-return check require separate copies with correct links, leaving the earlier local versions unchanged.

The import preview now shows actual new request wording and focus text, not just a count. Local restored-file records are disclosed in transfer and deletion prompts, with a separate confirmed forgetting action.

## Required release gate

193 checks: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 15 transfer, 67 model and six communication-card checks. Each report must pass and match current source. An earlier report or archive is not approval of later edits.

The extracted-release test must verify all archived files, identical rebuilding, the original workflows, and a two-browser export/import/continue/export-back journey with unchanged originals and correct preparation links. Ten HTML documents must have working local links, loaded images and no narrow/wide overflow. Inspect the actual presentation and transfer screens.

## Limits

No participants were recruited or simulated. Fictional engineering checks do not prove preference, demand, reduced effort, medical benefit, physical-phone usability or screen-reader usability. CSS enlargement is not a manual browser-zoom audit. No automatic syncing, accounts, cloud storage or external sending is included.
