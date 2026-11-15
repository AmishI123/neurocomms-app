# Next appointment acceptance audit

Status: engineering delivery approved. All 271 current-source checks passed with no recorded browser page errors. The 209-file extracted-release workflow passed, including identical rebuilding. The approved package is identified by matching `sha256` in [manifest](releases/manifest.json) and `archiveSHA256` in [verification](releases/verification.json). A mismatch means the package is not approved.

## Requirement evidence

| Requirement | Delivered behavior and passing evidence |
| --- | --- |
| N1 Choose earlier work | NA01/NA10: deliberate saved-visit choice, no default selection, unfinished/closed separation, empty-library and blank-plan paths. Home contains an entry point rather than private titles. Visual review confirms selection dialogs begin at the heading and explanation. |
| N2 Deliberate independent copies | Model tests and NA01/NA02/NA03/NA11: new identities, reset states, selected requests, no private answers/history, unchanged originals, expected-source checks, cancellation and two tabs. Repeated confirmation is consumed once. |
| N3 Editable ordered plan | NA01/NA06/NA13: editing, adding questions, ordering, conversation and after-visit continuation. Reordering resets the saved starting question; normal visit and conversation views begin there after reopening. Existing editor regression checks remain intact. |
| N4 Exact private-safe preview | Projection tests and NA01/NA09/NA12: exact text download, private-content exclusion, literal markup, clipboard refusal, inspected print content, keyboard and long/narrow/enlarged layouts. Export works even when saved storage becomes unreadable. Extracted download exactly matches its preview. |
| N5 Offline and transfer | NA05/NA07/NA08/NA09: offline reload, complete persistent-browser restart, isolated transfer/return with a changed source, and failed storage. Existing baseline VN-17-draft-switch and VN-12-delayed-delete guard queued writes against replacing unrelated work. Full backup round trips pass model tests; earlier backup/transfer suites pass unchanged capability assertions. |
| N6 Read-only source inspection | Model tests cover remapped and explicitly missing sources without fallback. NA04/NA08: current-source projection without private answers/history, missing-source explanation and correct returned-version links. The extracted app inspects the linked source before and after transfer. Inspection does not replace or write the open visit. |
| N7 Complete delivery | Twelve fictional journeys; twelve presentation sections with speaker notes and actual app screenshots; help and shared completion documents. NA06 completes the second appointment without changing the original. All 271 checks match source hashes. The extracted package checks next-appointment creation, offline return, transfer, conversation/interruption/answer recording, unchanged earlier visits, fourteen HTML documents, matching files and identical rebuilding. |

Evidence: [next-appointment browser report](qa/next-appointment-results.json), [model report](qa/model-results.json), [verification commands](verification.md), [fictional journeys](next-appointment-walkthroughs.md), [executive/conference presentation](next-appointment-presentation.html) and [delivery record](next-appointment-progress.md). Scenario identifiers describe software checks, not participants.

## Regression count

24 baseline + 15 continuity + 12 phone + 12 existing-notes + 13 preparation save/resume + 16 recovery + 13 follow-up + 15 transfer + 14 conversation + 12 whole-journey + 16 saved-draft + 13 next-appointment + 90 model + 6 communication-card checks = **271**. The extracted-release workflow is additional.

Final reports include source hashes. Intermediate failures, interrupted runs and older reports are not approval evidence. Installation and recovery assertions now wait for their relevant loading/completion events; expected outcomes were not removed or weakened.

## Visual review and boundaries

Inspected the actual plan preview, narrow selection screen and desktop/narrow presentation. The selection dialog initially scrolled past its introduction; heading focus and scroll position were corrected and retested. Long text and enlarged layouts passed automated width checks. Presentation screenshots use fictional words.

Source references preserve captured titles/dates, not the exact original question wording. Inspection labels available source wording as current. Missing or explicitly detached mappings never fall back to a similar or same-ID unrelated item.

Selection dialogs do not survive closure. Saved visits survive only confirmed successful writes; offline use needs completed setup. Browser data and downloaded files are unencrypted. The short plan is not a full recovery backup. There is no automatic sending, scheduling, cloud recovery, syncing or medical ranking.

Phone layout/touch checks are emulated, and standalone installation was observed in desktop Chromium. Clipboard refusal and printing are simulated with inspected output. No physical-device, native Android/iOS, screen-reader, participant, real-appointment or usefulness result is claimed. Native packaging remains deferred as agreed.
