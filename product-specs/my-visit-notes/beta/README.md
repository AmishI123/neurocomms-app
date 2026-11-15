# Safe beta feedback records

Copy `record-template.json` for each engineering beta run. Store results,
build/device details, severity and paths to screenshots or logs. Do not store
visit questions, answers, private notes, source text, contact details or other
note content in this record.

Validate a record with:

```sh
node beta/validate-record.mjs beta/my-run.json
```

Allowed surfaces are `web`, `android` and `ios`. Each task must be `Pass`,
`Fail` or `Not run`. A native claim may not be recorded as a pass unless its
separate native runbook contains runtime evidence.

Use the severity rules in
`NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONTROLLED-BETA.md`. A suspected privacy leak
or data loss is at least S0/S1 until checked.
