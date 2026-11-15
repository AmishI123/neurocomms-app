# Engineering verification — native work in progress

## Current web checks — passed; native checks incomplete

The corrected gate passed 100 logic checks, 182 browser scenarios and six card
checks (288 total), with matching source hashes. The expanded extracted-package
workflow also passed, directly checking Partly answered persistence, private-note
exclusion, exact review download, offline reopening and after-review documents.
Approval of any rebuilt archive requires a passing receipt in
`releases/verification.json` whose archive hash matches `releases/manifest.json`.
The
logic suite includes the native-boundary checks and the corrected saving test
for “Partly answered.” Run `node tests/platform-browser.mjs` separately for the
simulated-native journey; it is not real Android or iOS evidence.

The previous completion claim missed a saving failure and does not approve the
current source. Current regression runs and the preserved first transfer timeout
are recorded in [mobile progress](../../my-visit-notes-mobile/progress.md).
See the [native delivery checklist](../../my-visit-notes-mobile/acceptance.md)
for the separate native requirements. All passed-gate descriptions below are
historical; do not use their totals or archive as current approval.

## Historical after-review gate — superseded

All 283 current-source checks passed: 95 model checks, 182 browser checks and 6 card checks. The complete commands below include the after-review tests. They cover clear outcomes, private answer notes, selected requests, exact exports, editable next steps, independent copies, source loss, two tabs, failed storage, full offline restart, two-way transfer, conversation, keyboard/layout and the reordered starting question. The 222-file extracted-release workflow passed the after-review flow, presentation/help package, matching file hashes and identical rebuilding. Read [acceptance evidence](after-review-acceptance-audit.md). Native Android/iOS and participant usefulness remain untested.

## Saved-draft gate — passed

All 250 current-source checks passed: the previous 219 plus fifteen new draft-model checks and sixteen draft browser scenarios. Run the complete command list below. Reports and shared navigation hashes include the new draft modules and compatibility fixtures. The 195-file extracted release passed saved-draft saving, offline reopening, progress recording, isolated-browser transfer, thirteen HTML documents, file matching and identical rebuilding. See [the acceptance audit](drafts-acceptance-audit.md). Package approval requires matching hashes in releases/manifest.json and releases/verification.json. Earlier gate descriptions below are historical.

## Whole-journey gate — passed

The required gate is now 219 checks: the previous 207 plus twelve JY scenarios. Run `node tests/journey-browser.mjs` from this directory with the same browser library environment as the commands below. The new report records source hashes and script errors. Regression tests use tests/navigation.mjs to open public Home, Tools and disclosure controls; they do not force hidden clicks. The build and extraction verifier check both original and navigation source hashes. All suites and the 178-file extracted full journey passed, including identical rebuilding and twelve HTML documents. Read journey-acceptance-audit.md for the requirement map and releases/manifest.json plus matching releases/verification.json for the approved archive. Prior completed gates below are historical.

### Complete current command list

Run from `product-specs/my-visit-notes`. Browser tests use Playwright from the parent project's `communication-tool/node_modules`; those dependencies are not included in the downloadable app. In this workspace the browser needs the library path below. Run each command separately and inspect its result before packaging.

```sh
export LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu
node tests/record-model.mjs
node tests/browser.mjs
node tests/continuity-browser.mjs
node tests/phone-browser.mjs
node tests/intake-browser.mjs
node tests/resume-browser.mjs
node tests/recovery-browser.mjs
node tests/followup-browser.mjs
node tests/transfer-browser.mjs
node tests/conversation-browser.mjs
node tests/journey-browser.mjs
node tests/drafts-browser.mjs
node tests/next-appointment-browser.mjs
node tests/card-regression.mjs
node build-release.mjs
node tests/release.mjs
```

The current 250 checks comprise 24 baseline, 15 continuity, 12 phone-layout, 12 existing-notes, 13 save/resume, 16 recovery, 13 follow-up, 15 transfer, 14 conversation, 12 journey, 16 saved-draft, 82 data-model and six communication-card checks. The extracted-release journey is an additional gate, not included in that count. It checks matching file hashes, an identical rebuild, previous workflows, offline conversation and Home return, retained and saved messages/progress, isolated-browser draft transfer and completion, and thirteen HTML documents at 320px and 1280px.

The journey tests also dispatch a cancelable browser-close event to check the warning handler for retained messages and progress. This is not a promise that a physical phone will show a warning when its browser is closed.

## Conversation gate — passed

Run `LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node tests/conversation-browser.mjs` from this directory. CV01–CV14 record current-source hashes in qa/conversation-results.json. They include real browser lock delays and failed writes, keyboard-only operation, an accessibility-tree check, private print exclusion and offline reload. CV11 injects a visibility event; it does not exercise a physical phone's app switcher. No screen-reader certification or user benefit is claimed. The complete gate passed all 207 checks, including the existing 193. The 165-file extracted-release check also passed: offline conversation, private return, previous journeys, eleven HTML documents, exact file checks and identical rebuilding. Read conversation-acceptance-audit.md for current status. Earlier milestone descriptions below are historical.

## Previous device-transfer gate

The current required gate is 193 checks: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 15 transfer, 67 model and six communication-card checks. Every report must pass with matching current source hashes. Add `node product-specs/my-visit-notes/tests/transfer-browser.mjs` to the commands below before building.

The transfer suite includes two isolated browsers and transfer back, unsaved inclusion/exclusion, concurrent tabs, interrupted writes, settings-only retry, duplicate/deleted-record protection, deliberate forgetting, older collection migration, unsupported/oversized files, two full offline restarts, exact retained results and completed-batch replay prevention. Physical devices and screen readers remain unverified.

Final approval is recorded in the [transfer acceptance audit](transfer-acceptance-audit.md) and matching release manifest/verification. The extracted package must exercise export, import, continued editing and transfer back between separate browser contexts, in addition to the existing journeys. Ten HTML documents must pass local-link/image/layout checks. Historical results below do not approve this source.

Final transfer result: all 193 checks passed with matching source hashes and zero recorded browser script errors. The 152-file extracted archive passed the two-browser return journey, unchanged-original/source-link assertions, original workflows, identical rebuilding and ten-document checks. Rendered transfer screens and the executive opening were visually inspected. The exact final archive is identified by the matching release manifest/verification.

## Previous follow-up release gate

The follow-up release required 162 checks: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 51 model and six communication-card checks. All reports must pass and match current source hashes. The extracted-package check also exercises saved waiting progress and focus after reload, an exact private-safe message download, and a fresh copy with source information and unchanged originals. It checks nine HTML documents, deterministic rebuilding and all archived file hashes.

Run `node product-specs/my-visit-notes/tests/followup-browser.mjs` alongside every command below before building. The [follow-up acceptance audit](followup-acceptance-audit.md) records the current approval status. Historical results below do not approve the new source. `releases/verification.json` is valid only when its checksum matches the current manifest and all archived files match the working tree.

Final follow-up result: all 162 checks passed with matching source hashes. The 137-file extracted archive passed the complete journey, deterministic rebuild and nine-document checks. The rendered overview, exact-message screen and executive opening were visually inspected. See the matching release manifest/verification and [closed acceptance audit](followup-acceptance-audit.md).

## Previous recovery release gate

The recovery gate requires 139 checks: 24 baseline browser, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 41 model and six unchanged communication-card checks. The builder rejects failed reports and source hashes that no longer match. The extracted-package check verifies hashes, deterministic rebuilds, the existing workflows, actual removed-question recovery after reload, and eight HTML documents' links, images and narrow/wide layouts.

Final result: all 139 checks passed with zero recorded browser script errors and matching source hashes. The 122-file archive passed extracted recovery after reopening, existing workflows, deterministic rebuilding and all document checks. `releases/verification.json` ties the extracted-package result to the exact archive checksum in `releases/manifest.json`. The narrow recovery preview and rendered executive opening were visually inspected. The [acceptance audit](recovery-acceptance-audit.md) is closed within the stated technical scope. Earlier results below describe previous releases.

From the repository root, run:

```bash
export LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu
node product-specs/my-visit-notes/tests/record-model.mjs
node product-specs/my-visit-notes/tests/browser.mjs
node product-specs/my-visit-notes/tests/continuity-browser.mjs
node product-specs/my-visit-notes/tests/phone-browser.mjs
node product-specs/my-visit-notes/tests/intake-browser.mjs
node product-specs/my-visit-notes/tests/resume-browser.mjs
node product-specs/my-visit-notes/tests/recovery-browser.mjs
node product-specs/my-visit-notes/tests/card-regression.mjs
node product-specs/my-visit-notes/build-release.mjs
node product-specs/my-visit-notes/tests/release.mjs
```

Tests use the parent project's Playwright dependency. The phone suite additionally exercises a full Chromium installation. Physical-phone hardware, screen-reader use and benefit to people remain unverified.

## Previous save-and-resume release gate

Final result: all 110 checks passed with zero recorded browser script errors. The 107-file archive passed its extracted-app journey, deterministic rebuild, file-hash and presentation checks. `releases/verification.json` ties that result to the exact archive checksum in `releases/manifest.json`. The executive presentation and completed-preparation screen were visually inspected.

The current gate requires 110 passing checks: 24 baseline browser, 15 continuity browser, 12 phone browser, 12 intake browser, 13 resume browser, 28 model and six unchanged card tests. The release builder rejects failed or stale evidence. The extracted-package verifier checks file hashes, deterministic rebuilding, saving/resuming preparation, reopening completed results, and presentation images, links and layout.

Add `node product-specs/my-visit-notes/tests/resume-browser.mjs` to the command list below. Browser commands require the documented `LD_LIBRARY_PATH` in this environment. See [the resume acceptance map](resume-acceptance-audit.md) for complete coverage. Prior-release results below are historical until checks are rerun against the current source.

## Historical existing-notes release

## Current release gate

Final result: all 87 checks passed, with zero recorded browser script errors. The 94-file archive passed extracted-package verification and deterministic rebuilding. The current checksum is in `releases/manifest.json`; `releases/verification.json` ties the final extracted-package result to that checksum. The executive presentation was also visually inspected.

The new goal adds 12 existing-notes browser scenarios and seven model tests. Together with the prior suites, the gate requires 87 checks: 24 baseline browser, 15 continuity browser, 12 phone browser, 12 intake browser, 18 model and six communication-card regression checks. Release verification also checks matching source hashes, deterministic archive rebuilding, the extracted intake flow, local links, screenshots and presentation layout. Do not treat the historical results below as certification of changed files.

Run from the repository root. Browser commands in this environment need `LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu` before `node`.

```sh
node product-specs/my-visit-notes/tests/record-model.mjs
node product-specs/my-visit-notes/tests/intake-browser.mjs
node product-specs/my-visit-notes/tests/browser.mjs
node product-specs/my-visit-notes/tests/continuity-browser.mjs
node product-specs/my-visit-notes/tests/phone-browser.mjs
node product-specs/my-visit-notes/tests/card-regression.mjs
node product-specs/my-visit-notes/build-release.mjs
node product-specs/my-visit-notes/tests/release.mjs
```

See [the intake acceptance map](existing-notes-acceptance-audit.md) for requirement-level coverage. The archive includes test sources but uses the parent project's Playwright dependency when running browser checks.

## Historical phone-release verification

## Recorded results

Final release result: all 68 checks passed, with zero recorded browser script errors. The extracted 81-file release passed its checksum, source/extracted-file, reproducibility, app-flow, manifest/icon, local-link, image, and narrow-document checks. A real standalone full-Chromium window launched offline with the same saved notes. The executive presentation and phone visit screenshot were also visually inspected.

The phone release requires 24 existing browser scenarios, 15 continuity browser scenarios, 12 phone-release scenarios, 11 model tests, and six unchanged card regression tests — 68 checks in total. Current pass/fail evidence is in the recorded results and command output, not this count alone. The extracted-release verifier checks the matching source, actual app flow, reading/recovery controls, manifest/icons, local HTML links, images, layout, and identical archive rebuild.

The phone suite records a complete first-use → offline browser restart → private library export → clean-browser restore → next-visit journey. It also performs an actual install and standalone offline launch in full Chromium, using temporary browser/XDG folders. `qa/phone-results.json` records the observed standalone mode and the method; this is not a physical phone or a simulated media-query claim. Its install-prompt UI cases are separately labelled as simulated events.

Phone dimensions and touch are emulated; reduced viewport height represents keyboard space, not a native keyboard. The primary body-text contrast check does not certify all UI states. Read [the phone acceptance audit](phone-acceptance-audit.md) for the full mapping and limits. The original [continuity audit](acceptance-audit.md) remains product background.

The continuity suite contains 15 browser scenarios, NC-01 through NC-15. The phone suite adds PH-01 through PH-12 and two reading-settings model tests. The combined model suite contains 11 tests. Counts, failures, timestamps, browser versions and source hashes are recorded in `qa/phone-results.json`, `qa/continuity-results.json`, `qa/browser-results.json`, and `qa/model-results.json`. The release builder/verifier rejects failed, missing, incomplete, or stale records.

Read [the acceptance audit](acceptance-audit.md) for a requirement-by-requirement mapping. The new tests cover actual v1 runtime upgrade, repeated and conflicting library imports, empty-library recovery, close-while-saving, private-note exclusion, action-only drafts, keyboard use, and long-content dialogs at narrow/enlarged sizes. A previous test run lost its browser process; another card run lacked its local HTTP server. Those incomplete runs are not accepted as release evidence; final successful runs must be recorded after restoring the test environment.

The browser suite passed VN-01 through VN-19 plus five deeper checks, for 24 passing scenarios with no page script errors. The added checks cover a complete keyboard-only journey, an offline restart of a persistent browser profile, cancellation of waiting saves and deletions when switching drafts, and sharing selections across navigation. Read [browser-results.json](qa/browser-results.json) for the actual run and each result. The original communication-card suite was also run against the unchanged app: six tests passed, zero failed (VN-20 regression evidence). No original card runtime files were changed.

The delayed-operation checks deliberately hold the storage lock while switching visits, then release it and inspect the saved records and current draft. This covers the timing boundary that ordinary sequential save tests did not exercise. The sharing-navigation check verifies both a previously excluded question and removal of an earlier request in the list.

The visit checks include 20-question editing, reversible states, saved reopening, blocked writes, damaged-data recovery, summary download/clipboard/print projection, backup roundtrip, offline reopening, a waiting worker update, repeated exports, and a two-tab conflict. Summary file contents are inspected directly. Three model tests also passed, independently checking 100 summary-selection combinations, full backup roundtrips, and damaged data.

## How to repeat

From the repository root:

```sh
node --test product-specs/my-visit-notes/tests/model.test.mjs
node product-specs/my-visit-notes/tests/record-model.mjs
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/tests/browser.mjs
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/tests/continuity-browser.mjs
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/tests/phone-browser.mjs
```

The browser test starts its own temporary HTTP server and uses the existing Playwright dependency in `communication-tool/node_modules`. The library path above is specific to this environment. On a host with installed Chromium dependencies it can be omitted.

Run the browser suites sequentially. The phone suite also needs Playwright's full Chromium executable (`channel: chromium`) for its install/standalone check, not only the headless shell. It uninstalls its temporary test app after checking it. Temporary test profiles contain fictional data only. Rebuild icon files from the versioned SVG if the artwork changes:

```sh
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/build-icons.mjs
```

To repeat and record the unchanged card checks, use the wrapper, which starts its own server on port 8765 when that port is available. This avoids relying on a server left running by an earlier turn:

```sh
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/tests/card-regression.mjs
```

The wrapper records `qa/card-results.json` and `qa/card-results.txt`, including hashes of unchanged parent-project card files. The parent card runtime and test dependencies are not bundled inside My Visit Notes. The builder checks that recorded regression evidence also matches current source.

Build the review page and deterministic archive after checks:

```sh
node product-specs/my-visit-notes/build-release.mjs
```

The archive is reproducible for identical source and recorded-result files. Re-running browser checks changes their timestamp and therefore changes the archive checksum.

Verify the archive after building:

```sh
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node product-specs/my-visit-notes/tests/release.mjs
```

This checks the archive checksum, every packaged file against source and extracted copies, source hashes from all three browser suites and the model suite, and an identical second build. It serves a fresh temporary extraction and opens first use, next steps, carry-forward, reading settings, recovery guidance, summary preview, HTML review, both product presentations, and help in Chromium. It checks local links, images, manifest/icon responses, and 320px/1280px document layout. External reference links are documented sources, not required network dependencies of this offline release check. The builder regenerates both presentations.

## Coverage limits still requiring attention

- Narrow-layout checks cover 320px and desktop width. The enlargement test uses CSS zoom at 200%, not a manual browser-settings test.
- The keyboard-only test prepares questions, saves, navigates the visit, changes a state, reviews, downloads a summary, and cancels the dialog with focus return. Screen-reader review and user-selected access methods remain untested.
- Offline tests include both reopening a page and a full persistent-browser restart. Several real devices and browsers remain to be checked.
- The update test changes the cached shell version and checks that saved data survives. It is not a test of every future data migration.
- Clipboard output is checked with an instrumented clipboard writer. Actual platform permissions can fail; the app offers text download.
- No real appointments, participant comparisons, or adoption tests have occurred.

These limits remain visible in the engineering release. Under the user's 15 September 2026 amendment, participant review is deferred and does not block completion. This is not a full accessibility certification or evidence of user benefit.
