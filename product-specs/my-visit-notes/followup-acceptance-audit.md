# Follow-up acceptance audit

Status: engineering acceptance complete. All 162 current-source checks passed, including the final focus and enlargement checks. The 137-file extracted-release journey passed. The final documented package is approved only by the matching manifest and releases/verification.json; the release verifier rejects a stale package.

## Requirement evidence

| Requirement | Direct evidence | Scope |
| --- | --- | --- |
| F1: cross-visit unfinished work | Model workList/findWork checks; FU-01 read-only search, two visits, closed-item filtering; FU-06 original navigation; FU-10 missing source | Saved visits only; draft/preparation boundary stated in the overview |
| F2: deliberate progress/history | Model transitions, valid dates, 5,000-character note and 50-event limits, existing-screen history; FU-01 waiting/completion; FU-04 failure/conflict; FU-06 closure/reopening; FU-11 old recovery and private backup | Personal records, not verified contact or medical instructions |
| F3: chosen focus | FU-01 choice and completion cleanup; FU-08 full offline restart; FU-09 failed focus save; extracted-release reload check | Device-local; no urgency ranking, notifications or export |
| F4: exact private message | Model selected-content projection; FU-02 selection required, edit/preview/download and unchanged storage; FU-07 explicit context, clipboard failure, exact newlines; extracted exact-download check | Temporary draft; no sending, inferred contact or private history added |
| F5: independent copies | Model fresh identities, empty notes/history and source remapping; FU-03 multi-visit originals unchanged; FU-06 independent progress; FU-10 missing source; FU-13 collision/reimport; extracted carry-forward | Source title/date remains a separate copy; no hidden synchronisation |
| F6: persistence/compatibility | Backup/migration model checks; FU-04/05/08/09/11/12/13 failure, locks, full restart, old recovery and draft safety; NC-09/PH-08 actual old-shell updates; all existing regression suites | Opening older data alone does not rewrite it; previous apps refuse unsupported new formats |
| F7: access/plain language | FU-01 overview focus; FU-07 keyboard selection, 320px and CSS enlargement; baseline keyboard/enlargement and phone reading-mode checks; rendered screens and presentation inspected | Automated desktop browser evidence, not physical-phone or screen-reader certification |
| F8: full delivery | followup-PRD.md, eight fictional walkthroughs, 12-section executive/talk HTML with speaker notes, shared help/README/PRD/decision report, 162-check release gate and extracted-package verifier | Archive approval requires current source hashes and matching manifest/verification checksum |

## Completed regression repairs

- NC-09 expects collection 5 and empty history/source on migrated old questions. Its unchanged-before-save and content-preservation assertions remain.
- The original next-step keyboard order is preserved: To do, Done and No longer needed remain first; Contacted and Waiting for reply follow.
- Library restore adds relocation metadata only when needed. Clean round trips remain exact and repeated imports add no duplicates.
- VN-19 explicitly checks the new review headings while retaining exact summary assertions.
- RC-02 and RC-12 wait for the actual persisted recovery before checking exact content; a completed click is not a completed asynchronous save.
- NC-09 and PH-08 check that the new worker itself is active before opening the updated app. The earlier helper could mistake the old active worker for completion of the new worker's activation.

## Release proof

The builder requires 24 baseline, 15 continuity, 12 phone, 12 intake, 13 resume, 16 recovery, 13 follow-up, 51 model and six card checks: 162 in total. Failed, missing or stale reports stop packaging.

The extracted-package verifier checks every archived file against source and manifest, identical rebuilding, original workflows, preparation completion, removed-question recovery, follow-up waiting/focus after reload, exact message download without state changes or private history, and independent source-linked copying. Nine HTML documents are checked for local links, loaded images and narrow/wide layouts. The current executive presentation must contain 12 sections.

Use releases/manifest.json and releases/verification.json together. The latter must report passed with the current archive checksum; all archived source files must still match the manifest. Historical package results cannot approve later edits.

## Limits

All examples are fictional. No participants were recruited or simulated. Software checks do not establish usefulness, demand, clinical benefit, physical-phone usability or screen-reader usability. CSS enlargement is not a manual browser-zoom audit. No accounts, automatic messages, notifications, medical advice or external data service are included.
