# My Visit Notes: controlled beta release plan

Status: plan and materials ready to run; native platform checks remain a gate.

## The goal

Run a small, reversible engineering beta of My Visit Notes. The beta should
answer one narrow question:

> Can a person prepare, use, review and continue a fictional appointment note
> without losing work or accidentally showing private words?

This beta is for finding software problems. It does not measure medical
benefit, diagnosis, treatment, or whether the product helps everyone.

## Who can run it

No participant session is needed to prepare or run the first engineering wave.
Use the LLM judge for supplied evidence and use engineers or reviewers for the
runtime checks when a device is available. Any later human review needs its own
consent and privacy process; do not collect real medical notes for this beta.

## Entry conditions

Start only when all of these are true:

- The source branch and release archive have matching hashes.
- The web checks and LLM acceptance gate pass.
- The tester has a fresh browser profile or dedicated native installation.
- The tester understands that the app is not medical advice and has no server
  copy or automatic sending.
- Android and iOS are labeled separately. A web pass cannot stand in for a
  native pass.
- A backup and rollback path has been tested with fictional data.

If native devices are unavailable, run the web-only engineering wave and label
the result **web beta only**.

## The beta journey

Use the same fictional visit for every run:

- Visit title: `Fictional routine visit`
- Questions: `What happens next?`, `Who can I contact?`, `What should I bring?`
- Private preparation note: `PRIVATE_PREPARATION_TEST`
- Private answer note: `PRIVATE_ANSWER_TEST`
- Request: `Please give me a moment to write things down.`
- Next step: `Call the fictional office`

The tester records only results and error details. Do not paste the fictional
or real note text into an external issue system unless the test record requires
it; use the case ID instead.

### Required tasks

1. Prepare and save the visit.
2. Close and reopen it.
3. Select one question for conversation view.
4. Confirm private words are absent.
5. Put the app in the background and return.
6. Mark one item Partly answered and add a private answer note.
7. Save a follow-up draft and reopen it.
8. Prepare a new appointment from one unfinished item.
9. Preview, copy, export and restore selected content.
10. Work offline, force one failed save, retry once and check for duplicates.
11. Install the next build over the test copy and check saved data.

Record each task as Pass, Fail or Not run. A task is not a pass when the tester
only read source code or a browser report for a native claim.

## Feedback record

Use one record per run:

| Field | What to write |
|---|---|
| Case ID | Non-identifying ID such as `BETA-WEB-001` |
| Build hash | Exact archive, APK or iOS build hash |
| Surface | Web, Android or iOS |
| Device | Browser name, phone model or simulator name |
| OS/version | Exact version if available |
| Task results | 1–11 as Pass, Fail or Not run |
| Data result | Saved, restored, missing, duplicated or unclear |
| Privacy result | Private words stayed hidden, leaked, or unclear |
| Evidence | Screenshot or log path, without real note content |
| Severity | S0, S1, S2 or S3 using the table below |
| Next action | Fix, rerun, monitor or close |

## Issue severity

| Level | Meaning | Action |
|---|---|---|
| S0 stop | Data loss, private words sent or an unsafe update | Stop the beta, preserve backup, investigate immediately |
| S1 release blocker | A required task fails or creates duplicate/misleading data | Do not expand beta; fix and rerun |
| S2 important | A task is confusing, hard to finish or fails an optional device feature | Fix before wider beta or document a clear limit |
| S3 polish | Small wording, spacing or visual issue with a safe workaround | Record and schedule |

Any suspected privacy leak, lost data or wrong restore result is at least S0 or
S1 until checked. Do not downgrade it because it happened only once.

## Stop and rollback rules

Stop the beta immediately if:

- A private note appears in conversation view, a selected summary or an output
  that did not include it.
- A save, restore or update loses a visit, draft, answer or recovery item.
- A retry creates a duplicate record.
- An export or import changes data before confirmation.
- The app sends data without an explicit user action.
- A native build has a different app identity or package contents than the
  recorded candidate.

Rollback steps:

1. Stop using the affected build.
2. Preserve the error log and build hash.
3. Keep the original backup; do not overwrite it.
4. Restore the backup into a separate test installation.
5. Confirm the restored data and privacy boundary.
6. Mark the build blocked until a fix and full rerun pass.

## LLM judge role

The LLM judge may compare a feedback record with the acceptance rules, check
whether screenshots show the claimed state, inspect exact exported text, group
issues by severity and explain likely failure points.

It must not:

- Turn “Not run” into “Pass”.
- Infer native Back, keyboard, print, file-picker or app-switcher behavior.
- Treat a pleasant screenshot as proof of usefulness.
- Read or retain real medical notes.
- Approve a release after a privacy or data-loss failure.

## Exit criteria

Close the engineering beta only when:

- Every run has a complete record.
- All S0 and S1 issues are fixed and rerun.
- No required task is still unexplained.
- The LLM judge confirms that the written evidence matches the claims.
- Web, Android and iOS decisions are listed separately.
- The final report names known limits and the next product decision.

Possible outcomes:

- **Expand web beta:** web evidence passes; native is not yet available.
- **Expand Android only:** Android runtime passes; iOS is waiting.
- **Expand both platforms:** Android and iOS runtime passes.
- **Hold:** a required issue remains or the test environment is unavailable.

## Current starting decision

**Run web-only engineering beta when desired. Hold native beta expansion until
the hosted runner, an Android target and a Mac/iOS target are available.**

The beta package is not a public app-store release. It is a controlled test of
software safety, saving, privacy and recovery.
