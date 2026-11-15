# My Visit Notes: native acceptance runbook

This runbook is for the first real Android and iPhone acceptance pass. It uses
fictional notes only. It does not need participant sessions and it does not
prove medical usefulness.

## The result we need

Run the same checks on Android and iPhone and record the result separately. A
browser test, a source audit or an APK inspection cannot be used as a native
pass.

For each platform, record:

- app build hash;
- phone or simulator name, operating-system version and screen size;
- date and tester name;
- each step as **Pass**, **Fail**, or **Not run**;
- a screenshot, screen recording or log for every failure and every privacy,
  sharing, printing or data-recovery check;
- what happened to the fictional data after the test installation is removed.

Do not clear an existing installation to make a test pass. Use a new test
installation or a dedicated test profile.

## Before starting

1. From the repository root, check out the validation branch and run `npm ci`
   in `my-visit-notes-mobile`.
2. Run `npm run build`, then `npx --no-install cap copy ios` and
   `npx --no-install cap sync android`.
3. Run the native source audit and APK asset audit after building Android.
4. Confirm that the test installation contains no notes before beginning.
5. Disable network access only at the step that asks for it. Record whether the
   app was using Wi-Fi, mobile data or an offline simulator setting.

## Android and iPhone test steps

Run all ten steps on Android, then start a separate clean iPhone installation
and run all ten again.

### 1. Prepare and save

Create three questions, one private preparation note and one communication
request. Save the visit, close the app completely and reopen it.

Pass only if the saved questions, request and private note return unchanged.

### 2. Show and hide selected words

Select one question for conversation view. Confirm that the other questions and
private notes are absent. Put the app in the background and inspect the app
switcher. Return to the app.

Pass only if the words remain hidden until the user deliberately shows them.

### 3. Use Back safely

Press Back with the keyboard open, inside a dialog, while showing words and from
the visit screen.

Pass only if Back closes or moves away from the current layer without erasing
unfinished work or revealing private content.

### 4. Save every question outcome

Record the supported outcomes, including **Partly answered**. Add a personal
answer note and a next step. Save, force-close the app and reopen it.

Pass only if the outcome, note and next step return exactly and no duplicate
question or history entry appears.

### 5. Keep a follow-up draft private

Prepare a follow-up message. Save it as a draft, close and reopen it, edit it,
then review and copy or download the exact message.

Pass only if creating, editing or sharing the draft does not mark it sent or
done, and the copied/downloaded text contains only the reviewed words.

### 6. Prepare the next appointment

Select unfinished questions and next steps for a new appointment. Edit the new
copy and inspect its preview.

Pass only if the original visit remains unchanged and private notes, answer
notes and follow-up history are not copied by default.

### 7. Export and restore

Export a private backup and a transfer file. Cancel one export and complete
another. Confirm the file exists in the chosen destination. Restore it into a
separate fresh test installation.

Pass only if the restored visits, preparation, drafts and source links match,
and a cancelled operation leaves no partial file or partial import.

### 8. Copy and print

Copy and print a reviewed summary. Inspect the clipboard and the real print or
PDF result. Cancel once, then retry.

Pass only if private notes and unselected text are absent, and retry does not
duplicate or change the saved visit.

### 9. Offline and failed-save behavior

Disable network access. Restart the app, reopen the saved visit and save a new
change. Then simulate or induce a failed save using the platform test method.

Pass only if offline reopening works, the latest unsaved words stay visible
after failure, the message clearly says they were not saved, and retry saves
once without duplication.

### 10. Update without data loss

Install the updated build over the same test installation without clearing its
data. Reopen visits, drafts and recovery items.

Pass only if the app identity is unchanged, saved data remains readable and no
private data appears in an unselected display.

## Evidence table

Copy this table once for Android and once for iPhone.

| Step | Result | Evidence file or log | Notes and failure details |
|---|---|---|---|
| 1 Prepare and save | Not run | — | — |
| 2 Show and hide | Not run | — | — |
| 3 Back safely | Not run | — | — |
| 4 Question outcomes | Not run | — | — |
| 5 Follow-up draft | Not run | — | — |
| 6 Next appointment | Not run | — | — |
| 7 Export and restore | Not run | — | — |
| 8 Copy and print | Not run | — | — |
| 9 Offline and failed save | Not run | — | — |
| 10 Update | Not run | — | — |

## Release decision

Choose one result for each platform:

- **Pass:** all ten steps pass and the build/source checks pass.
- **Pass with limits:** all required steps pass, but a clearly named optional
  device feature could not be checked.
- **Fix required:** any required step fails.
- **Not run:** the platform or required device was unavailable.

The overall release cannot be called native-ready while either platform is
marked **Fix required** or **Not run**. Until then the honest state is
**build-ready, native review waiting**.

## Commands

From `my-visit-notes-mobile`:

```sh
npm ci
npm run build
npx --no-install cap copy ios
npx --no-install cap sync android
node scripts/native-source-audit.mjs
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk \
  PATH=/path/to/jdk/bin:$PATH \
  ./android/gradlew -p android test lint assembleDebug --no-daemon
PATH=/path/to/jdk/bin:$PATH \
  node scripts/audit-bundle.mjs android/app/build/outputs/apk/debug/app-debug.apk
```

The automated Android journey is a useful first pass, but it covers only the
steps listed in its output. It does not replace this ten-step acceptance run.
