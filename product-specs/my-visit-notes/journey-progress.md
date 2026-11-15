# Whole-app journey delivery record

Status: engineering delivery complete. All 219 current-source checks and the 178-file extracted-release journey passed. The delivered archive is approved only when releases/manifest.json and releases/verification.json have matching archive hashes. Historical work notes below retain the failures and unfinished states that preceded delivery.

## Final delivery

- Completed the new Home, focused workspace, connected preparation, finish section and session return controls. Retained messages and progress use explicit discard/replacement and keep their original save guards. The earlier preparation destination remains pinned when another visit is opened.
- All twelve suites passed: baseline 24, continuity 15, phone-layout 12, intake 12, resume 13, recovery 16, follow-up 13, transfer 15, conversation 14, journey 12, data-model 67 and communication-card six. Reports match the current recorded source hashes and have no recorded browser script errors.
- The final journey run includes focus after discarding a message and explicit close-warning-handler assertions for retained messages/progress. Recovery waits for completed writes before checking restored counts. Recovery and follow-up keyboard tests navigate the actual new Home/Tools structure.
- The initial 178-file journey archive passed extraction, all file hashes, identical rebuilding, prior workflows, two-browser transfer and return, offline conversation and review, neutral Home, retained messages and saved progress. Twelve HTML documents passed 320px/1280px overflow, image and local-link checks.
- Inspected current Home/review screenshots and the extracted executive opening. Twelve fictional journeys and twelve presentation sections with speaker notes are present. The detailed acceptance map covers J1–J7, artifacts, command list, safety and evidence limits.
- Updated current goal, README, requirements, decision, verification and index introductions; previous milestones remain historical. The package is rebuilt and the extracted verifier rerun after these documentation changes so the final archive includes them. The matching release records, not an earlier checksum quoted in a work note, identify the handoff.

No participant recruitment, physical-phone test, screen-reader test, external deployment or clinical benefit claim was added. Browser-engineering checks do not establish that people find the product useful or easier.

## Current verification pass

- Added a dialog-close focus fallback in journey-ui.mjs for cases where discarding a session draft removes the originating Home button. JY01 now checks focus returns to the Home heading; its fresh run is underway.
- Intake 12/12 and resume 13/13 passed with the current navigation and focus code.
- Recovery 16/16 now passes. RC03/RC04 needed to wait for the recovery dialog to return after the asynchronous write before reading saved counts. RC11 now reveals the closed Tools section through public controls before focusing the recovery button; the original keyboard and content assertions remain.
- Model checks passed 67/67. Follow-up and transfer reruns are underway. FU07 now explicitly returns Home before focusing its follow-up button; no saved-content or privacy assertion was removed.
- Current requirements, decision report and product-specs index identify the journey as unfinished rather than reusing the earlier release approval.

No new journey archive has been approved. Remaining gates include current-source baseline, continuity, phone, conversation, journey and card evidence, final documents, and extracted-release verification. Earlier turn notes below are historical snapshots.

## Third-turn work

Final state of this turn: no live sessions. The latest JY01–JY12 run passed after a genuine privacy fix: showWorkspace now closes the saved-visit and preparation lists themselves, not just their outer Tools group. JY07 now tests opening a saved visit then reopening Tools directly, as well as returning through Home. All twelve pass with current hashes.

Phone rerun passed all twelve after its keyboard/contrast routes were updated. Intake ran all twelve: eleven passed and IN08 could not reach its carry-forward button because restoring a visit now closes the saved list. IN08 has been patched to explicitly reopen Saved visits; its rerun is still pending. Resume, recovery, follow-up and transfer still need their adapted-suite runs. Baseline/continuity/phone/conversation reports need a final fresh run where their recorded runtime/navigation/help hashes are stale after the last list-closing/help changes.

Next commands should start with `tests/intake-browser.mjs` then the remaining adapted suites, preferably one command per exec session. Multi-suite shells have twice terminated with 143 after the first suite wrote its completed report; confirm handles/reports before restarting only the unfinished suite.

Further audit item: check focus after discarding a session draft then closing follow-up. Its original Home return button disappears; ensure focus lands on a useful heading instead of body. This has not yet been tested/fixed. Current release.mjs includes Home and retained message/progress paths but is unexecuted until all gates are ready.

- Expanded tests/journey-browser.mjs to twelve named JY01–JY12 scenarios and a hashed JSON report. All twelve passed: full return flow, failed/waiting saves, stale progress and private download, cancellation of queued progress, saved preparation offline, closed private lists, empty/large layouts, deliberate message replacement and exact download, progress deletion/replacement, complete offline browser restart and a keyboard-only start-to-finish journey.
- Adapted baseline, continuity, phone, intake, resume, recovery, follow-up, transfer and release test navigation to shared public-control helpers. Helpers prefer the active modal when Home and dialog actions share a label. No forced clicks or UI-state mutation is used to reveal new groups. Assertions about saved content, privacy and conflicts remain.
- Baseline 24 checks passed after adaptation. Continuity 15 checks passed after reopening its now-collapsed saved-list screenshot and making the first-write wait tolerate absent storage until the expected value exists. Phone 12 checks passed after explicit keyboard opening of Tools before reading choices and reopening reading settings between screen changes. PH01 now checks the three Home groups instead of the obsolete four-button layout.
- Those earlier passes are not yet the final gate: subsequent help and runtime warning-copy edits make some earlier reports stale. All current hashes must pass at final build.
- Updated deletion and transfer warnings to explain that temporary message/progress drafts remain separate and are not transferred. Added Home and session-draft help plus current README/verification introductions.
- Added build-journey-presentation.mjs and journey-presentation.html: twelve sections and twelve sets of speaker notes. Desktop and 320px openings were visually inspected and narrow overflow was false. Added partial journey-acceptance-audit.md. The twelve fictional walkthroughs already exist.
- Build/release tooling now expects 219 checks (previous 207 + twelve journey), checks both original and navigation hash records, includes the new goal/presentation and checks twelve HTML documents. The extracted journey adds offline Home/private reopening and message/progress retention. This release verifier has NOT yet been run against a newly built journey archive.

Remaining priority: finish running intake/resume/recovery/follow-up/transfer after the navigation adaptation; address actual failures without weakening checks. Freeze final help/runtime/test sources, then rerun stale suites and all required reports. Complete shared docs/acceptance status, inspect final app screens, build and verify the extracted package, and audit J1–J7 before declaring completion. Do not treat the previous conversation archive as current.

## Second-turn implementation

- Unsaved follow-up progress entries now retain their exact fields in memory and can be reopened from Home. Editing another item asks before discarding the retained entry. Added private-draft download and confirmed discard; retained progress contributes to browser-close warnings. Saving still uses the captured item/revision and write guards, not a silent rebase.
- The preparation destination now stays pinned when the open visit changes. For a temporary destination it retains a draft copy; for a saved destination it keeps that visit identifier. `openVisit` calls `intake.pinOpenDestination()` before replacement so edits made after destination selection are included. The destination is restated before confirmation.
- Added an explicit preparation-to-conversation explanation around the existing selection/preview entry, finish counts for unanswered questions/next steps, shorter Home introduction, and Home-aware body screen state during background rendering.
- Added twelve fictional journeys in journey-walkthroughs.md.
- Added tests/navigation.mjs, which opens actual Home/tools/disclosure controls without forcing hidden clicks or mutating app state. The conversation suite now uses it and includes its hash and new runtime files in its evidence.

The expanded journey smoke test passed, including progress close/resume/save, message discard cancellation, private home wording exclusion and preservation of the earlier destination after a later title edit. An intermediate smoke run read Home immediately before the asynchronous dialog-close event refreshed its return buttons. The test now waits for the actual visible/hidden return control rather than asserting in that event gap.

All fourteen conversation checks passed again against the final destination-freshness patch; qa/conversation-results.json records current-source hashes and zero errors. The combined journey/conversation process exited successfully, and no test sessions remain live. Other suites have NOT been adapted or rerun yet. In particular, older tests still assume four Home buttons and direct access to tools/example controls.

Next work remains: named comprehensive journey evidence with source hashes; review every hidden-tool recovery route; test stale/deleted-source progress drafts, waiting-save cancellation and replacement paths; adapt all other existing suites through public navigation; build and inspect the executive presentation; update help and current shared docs; integrate and verify the full release. The earlier required-work list is historical detail where the above work supersedes it.

## Implemented in the first turn

- Added the root journey goal and detailed J1–J7 requirements.
- Added journey-ui.mjs: Home groups for starting, continuing and following up; neutral saved counts; session return controls; a Tools and settings group below the workspace; a before-leaving section in review.
- Home hides the workspace and closes private lists without replacing the in-memory visit. Opening a saved visit explicitly reveals its list, and opening that visit closes the tool group. Recovery's programmatic controls reveal their containing tools.
- Home gives explicit access to unfinished preparation and a temporary follow-up message without showing their text.
- Follow-up messages now retain their editor in memory after closing the dialog. New-message creation asks before replacing a retained message. Explicit discard has confirmation. Browser-close warnings include retained messages. This is session retention, not saving or transfer.
- Shell v11 includes the new module; saved data formats are unchanged.

## Evidence so far

tests/journey-browser.mjs passed after the latest changes. It exercises initial empty Home, temporary visit return, saved reopen, review-to-home, reload without exposed wording, tool access, unfinished preparation return, message return with exact text, discard cancellation and confirmed discard. No script errors were recorded in that run. The initial narrow Home screenshot was visually inspected; the layout is readable, but its wording and length need further review.

This is one smoke journey, not the final named evidence suite. No release or full-regression claim is made. All 207-check reports and the existing archive belong to the previous conversation release and are stale for changed runtime files.

## Required next work

1. Complete J3/J4: connected preparation and clearly named destinations; an intentional preparation-to-conversation route. Audit every route to saved lists, backups and recovery inside the new closed tool group.
2. Audit unfinished follow-up progress entry as well as message drafts. The existing follow-up close listener still clears its `working` flag and progress fields are not retained; prevent loss on close/navigation or retain it with deliberate return. Test message replacement, preview/download, stale saved source and source/visit switches.
3. Tighten navigation/focus/empty-state/save-status behavior. Current rendering still derives body screen state from `started`, which now differs from whether Home is visible; check render paths while Home is open. Review duplicated status wording and lengthy Home introduction.
4. Adapt existing test navigation to the deliberate new design without weakening behavior assertions: fictional example is now in a disclosure; recovery/reading/transfer/saved-list controls are inside Tools and settings; follow-up is on Home and review; Home now has more than four buttons. Prefer shared explicit navigation helpers. Do not simply force hidden controls or restore the old layout to satisfy outdated checks.
5. Add named whole-journey scenarios with hashes and report output: interrupted/waiting/failed saves, conflicting tabs, saved preparation, destinations, requests-only conversation, private return, keyboard, narrow/enlarged/long content, offline and full restart, preservation of all unfinished work.
6. Deliver at least ten fictional walkthroughs, executive/conference HTML with speaker notes and real screenshots, help and acceptance map. Update current shared records and release tooling, preserving older milestones as historical.
7. Run all regression suites, build the package, verify the extracted complete journey and all documents, inspect rendered artifacts and audit each J requirement before completion.

No live test sessions remain from this turn. Latest smoke command: `LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node tests/journey-browser.mjs` from this directory.
