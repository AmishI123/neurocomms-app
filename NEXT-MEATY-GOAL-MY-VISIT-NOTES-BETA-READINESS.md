# My Visit Notes: beta-readiness package

Status: build-ready and evidence-reviewed; native runtime approval is pending.

## The goal

Prepare one clear, repeatable package that another person can use to build,
review and test My Visit Notes safely. The package must explain what is ready,
what is not ready, how notes are protected, and what evidence is needed before
calling the Android or iPhone app ready.

This is an engineering beta package. It does not claim medical benefit, replace
professional care, or prove that the product works for every person.

## What the product does

My Visit Notes helps a person:

1. Prepare questions before an appointment.
2. Choose which questions or requests to show during the appointment.
3. Keep personal preparation and answer notes separate from shared words.
4. Record what happened in the person's own terms.
5. Save follow-up work as a draft.
6. Prepare a new appointment from selected unfinished items.
7. Save, restore, transfer and review notes deliberately.

The product does not diagnose, interpret symptoms, send information by itself,
or mark a question complete without the person's choice.

## Package contents

| Item | Location | State |
|---|---|---|
| Web application source | `product-specs/my-visit-notes/` | Ready and tested |
| Android project | `my-visit-notes-mobile/android/` | Builds; runtime pending |
| iOS project | `my-visit-notes-mobile/ios/` | Prepared; Mac build pending |
| Web release archive | `product-specs/my-visit-notes/releases/` | Hash and manifest recorded |
| Native acceptance sheet | `my-visit-notes-mobile/NATIVE-ACCEPTANCE-RUNBOOK.md` | Ready to run |
| LLM evidence review | `my-visit-notes-mobile/LLM-ACCEPTANCE-JUDGE.html` | Complete with limits |
| Machine-readable LLM result | `my-visit-notes-mobile/llm-acceptance-judgment.json` | Guarded by a release check |

## Current evidence

- The web checks cover the complete visit, follow-up, recovery, transfer and
  next-appointment flows.
- The web release contains 229 files and has a recorded archive hash in
  `product-specs/my-visit-notes/releases/manifest.json`.
- The Android debug package builds and its 35 application files match the
  source and native project copies.
- The LLM judge reviewed the written results, outputs and screenshots. It gave
  the web and simulated native evidence a conditional pass.
- No Android native journey has passed. Two local emulators failed to boot.
- iOS has not compiled here because this machine is Linux without Xcode.
- GitHub hosted jobs are currently blocked before starting by account billing.

## Data safety rules

### What stays on the device

- Visits, questions, answers, preparation notes, drafts, recovery history and
  reading choices stay in the app's local storage.
- The app has no server account or automatic cloud copy.
- The app requests no network permission in the Android package.

### What leaves the device

Only content the person deliberately chooses to export, copy, share or print.
Each output must be reviewed before the operation is confirmed.

### What must never be included by accident

- Private preparation notes in conversation view
- Private answer notes in selected review output
- Unselected questions or requests
- Recovery history in a normal transfer
- Data from another visit when preparing a new visit

### Safe test data

Use fictional names, questions, answers and contact details. Do not put real
medical notes, real contact details, credentials or browser profiles in the
repository, release archive or test screenshots.

## Simple install paths

### Web

1. Extract the archive from `product-specs/my-visit-notes/releases/`.
2. Serve the extracted files from a local web server.
3. Open the local address in a current browser.
4. Check that the app says its files are ready offline.
5. Use the browser acceptance reports for the first review.

### Android

1. Use a dedicated test phone or emulator with no real notes.
2. From `my-visit-notes-mobile/`, run `npm ci` and `npm run build`.
3. Run `npx --no-install cap sync android`.
4. Run the Gradle test, lint, build and APK audit commands in the README.
5. Install the debug APK only on the dedicated test target.
6. Run the Android journey and then the wider ten-step acceptance sheet.

Do not clear an existing installation to make a test pass. Use a new test
profile or a separate test installation.

### iPhone

1. Use a Mac with Xcode and CocoaPods.
2. From `my-visit-notes-mobile/`, run `npm ci`.
3. Run `node scripts/build-ios.mjs`.
4. Open a clean simulator installation.
5. Run the same ten acceptance steps used for Android.
6. Record the simulator name, iOS version, build hash and every result.

## Beta acceptance gates

The beta package is complete only when each gate has a recorded result:

| Gate | Pass condition | Current state |
|---|---|---|
| Source and model | All current logic checks pass | Pass |
| Browser journey | Current browser reports pass with no page errors | Pass |
| Package integrity | Archive manifest and files match | Pass |
| Android build | Tests, lint, APK build and asset audit pass | Pass |
| LLM evidence safety | Ten steps exist and native approval is false | Pass |
| Android runtime | Ten native steps recorded | Pending target |
| iOS build | Mac/Xcode build and asset check pass | Pending Mac |
| iOS runtime | Ten native steps recorded | Pending Mac |
| Data recovery | Restore, retry, delete and rollback instructions exercised | Web only |

The beta may be shared for engineering review with the pending items clearly
shown. It must not be described as a native release until both platform runtime
gates pass.

## Recovery and deletion

### Before changing anything

Export a private backup and store it in a location chosen by the person. Check
the file name and destination before confirming. Never use a backup belonging to
someone else.

### If a save fails

Keep the words visible, read the failure message, do not close the page, and
retry once the storage problem is fixed. Confirm that one retry creates one
record and does not duplicate a question or history entry.

### If a transfer looks wrong

Cancel before saving. The receiving visit and draft must remain unchanged. Keep
the original file and try again only after reviewing its contents.

### If notes must be removed

Download a backup only if it is wanted. Then use the app's clear or delete
controls, confirm the intended scope, close and reopen the app, and verify that
the selected local data is gone. Delete exported files separately from the
device's file manager or share destination.

### If an update causes trouble

Stop using the updated copy. Keep the old backup, record the build hashes, and
do not overwrite the only readable copy. Restore into a separate test
installation first. Do not recommend a public update until the update gate
passes on Android and iOS.

## Release decision

Choose one state and show the evidence behind it:

- **Engineering beta, web verified:** web and package evidence pass; native
  runtime is pending.
- **Android beta reviewed:** Android runtime passes; iOS remains pending.
- **Cross-platform beta reviewed:** Android and iOS runtime checks pass.
- **Fix required:** any required check fails.
- **Blocked:** the required test environment cannot be used.

Current decision: **Engineering beta, web verified; native runtime pending.**

## Next action

Run the native workflow with `platform: both` when GitHub billing is restored,
or give the package to an engineer with a working Android target and a Mac.
Attach the Android and iOS results to the native runbook. The LLM judge can
review those records and explain failures, but the device evidence remains the
authority for the native release decision.
