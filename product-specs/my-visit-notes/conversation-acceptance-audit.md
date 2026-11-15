# Conversation-view acceptance audit

Status: engineering delivery complete. All 207 required checks passed against current sources. The 165-file archive passed the extracted offline conversation journey, existing app journeys, matching file hashes, identical rebuilding and eleven HTML documents' local-link/image/layout checks. Final archive identity is in releases/manifest.json and its matching releases/verification.json.

| Requirement | Current evidence | Disposition |
| --- | --- | --- |
| C1 Choose and preview | CV01 exact wording and unchecked choice; CV02 empty choice/cancel; CV07 changed wording; CV14 cancel preserves saved data | Passed, including extracted preview/display |
| C2 Chosen-content boundary | CV01 private preparation/answer exclusion; CV08 keyboard confinement, private print exclusion; CV14 accessibility tree | Passed, including extracted private-answer exclusion |
| C3 Requests | CV01 temporary request and return; CV02 requests-only; CV13 keyboard-only request journey | Passed, including extracted request/question return |
| C4 Interrupt and resume | CV03 saved position/reload; CV04 failed write; CV05 delayed write; CV06 conflict; CV11 simulated visibility; CV12 close during waiting write | Physical-device interruption remains explicitly unverified, not a release claim |
| C5 Private return | CV01 answer entry and return preview; CV07 fresh choice after wording changes and second-question position; CV13 keyboard return | Passed, including extracted answer entry and deliberate return |
| C6 Existing review | CV01 reaches existing review; CV03 question contents/states unchanged; all existing 193 checks rerun | Passed; extracted review and prior journeys also passed |
| C7 Access and release | CV08 keyboard/print; CV09 narrow/large text/contrast; CV10 offline; CV13 keyboard journey; CV14 accessibility tree; extracted offline app and eleven documents | Passed within stated engineering scope; screenshots of shown/hidden app and desktop/narrow presentation inspected |

The report at qa/conversation-results.json records source hashes and individual results. Fourteen checks passed in the latest expanded run. CV11 simulates page visibility; CV12 closes a page while a position save is waiting; CV13 completes selection, request display and private return using the keyboard; CV14 inspects the browser accessibility tree and verifies cancelled setup leaves saved data unchanged. Their counts are not a claim of accessibility certification. The new release reran the existing 193 checks rather than relying on the previous transfer archive.

Delivered artifacts: conversation-PRD.md, conversation-walkthroughs.md (ten fictional journeys), conversation-presentation.html (twelve sections and twelve sets of speaker notes), help.html, current shared product records, current-source QA reports and the verified release. The generated executive-presentation.html points to this milestone while earlier presentations remain available.

## Problems found and addressed

- The initial smoke test tried to type into a collapsed private-note editor. The test now opens it through the actual summary control.
- A requests-only display offered an answer-note exit with no selected question. The exit now offers that action only when a question was selected.
- A delayed save left the paused save message stale. The existing save-status path now emits an update that refreshes the paused message. CV05 holds the real browser lock, verifies the unsaved state, releases it, and verifies the saved state.
- A stale resume could have opened selection setup, exposing unchosen questions. Resume now stays hidden and directs the person to leave deliberately before choosing again.
- The existing recovery restart test read storage immediately after an asynchronous confirmation click. One run observed the pre-recovery title. The test now waits for the app's explicit completion message before asserting the same title and restarting again; the rerun passed. Product behavior and the expected result were not weakened.
- Existing generic dialog assertions were made specific to the original workspace dialog because the new conversation view is a second dialog. Their original visibility/focus expectations remain unchanged.

## Limits

No participants, real appointments, physical phones, screen readers or clinical outcomes were tested. Width and CSS enlargement checks are browser engineering checks. A limited display is not a device lock, does not prevent screenshots and cannot hide browser data from someone deliberately accessing it.
