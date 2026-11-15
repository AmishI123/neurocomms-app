# Time Steps — native platform handoff

This packet is for the person who has an authorized Android target or a
macOS/Xcode machine. It is an execution checklist, not a claim that either
native platform has passed.

## Android

The current local APK is intentionally unsigned. Use the repository's
[Android signing handoff](../../communication-tool/docs/android-release-signing.md)
only on a release-owner machine with credentials in its secret store. Never
put a keystore or password in this checkout or in review evidence.

### Required conditions

- Use the fresh debug APK built from the current checkout.
- Use one dedicated fictional-data device or emulator.
- The target must appear as `device`, not `offline` or `unauthorized`.
- Do not run while another device is connected.
- Do not clear data or uninstall before the runner checks for existing work.

### Commands

From `communication-tool`:

```bash
npm run mobile:build:android
npm run mobile:audit -- --apk=android/app/build/outputs/apk/debug/app-debug.apk
npm run mobile:android:time-steps -- \
  --serial=<authorized-target> --dedicated-test-target
```

### Journey covered

The runner checks:

1. the fictional example shows 09:00 preparation and 09:20 departure for a
   10:00 appointment;
2. changing travel to 45 minutes changes the visible result;
3. saving stores the calculation locally;
4. force-stop and relaunch restore the same local calculation;
5. deleting removes the fictional calculation.

The report is
`communication-tool/ai-evaluation/results/android-time-steps-journey.json`.
Only a report with `passed: true` and all five completed steps is native
Android journey evidence. A report with `passed: false` is a limitation
record, not a partial pass.

## iOS

Before handing this checkout to a macOS reviewer, run the source-only check
from `communication-tool`:

```bash
npm run time-steps:ios-audit
```

Its report is
`communication-tool/ai-evaluation/results/time-steps-ios-audit.json`. It
checks that the iOS shell exists and that the iOS Time Steps files match the
current mobile bundle. A failing Xcode or CocoaPods check is expected on
Linux; it is not an iOS product failure and it is not a native acceptance
result.

### Required conditions

- Use macOS with Xcode and CocoaPods installed.
- Open the current checkout on that machine; do not use a copied stale `dist`
  directory.
- Use a dedicated simulator or device with fictional data.
- Confirm the iOS shell and plugin sync before opening Xcode.

### Commands

From `communication-tool` on macOS:

```bash
npm ci
npm run build:mobile
npx cap sync ios
npm run mobile:doctor
npx cap open ios
```

In Xcode:

1. choose the `App` scheme and an authorized simulator or device;
2. build and run;
3. open Phrase Studio support tools;
4. run the same fictional Time Steps journey listed above;
5. record whether calculation, save, relaunch, and delete work;
6. keep the exported evidence outside this repository.

There is no iOS acceptance script in this Linux checkout. Do not write a
passing iOS result by hand. Record the Xcode version, iOS version, device or
simulator name, build result, and each journey result in a private handoff
record.

## Evidence rules

- Native platform testing does not establish accessibility benefit or general
  usefulness.
- Do not enter a real appointment, diagnosis, health detail, or private story.
- Do not report a device as passed if it was offline, unauthorized, or the
  journey stopped early.
- Keep private reviewer responses, device identifiers, and screenshots outside
  the repository unless an approved process says otherwise.
- A successful web test, APK build, or model judge is not a substitute for
  native execution.

## Current status at handoff

- Web app: verified.
- Shared web/mobile shell: verified.
- Android build and package: verified.
- Android native journey: waiting for an authorized target.
- iOS shell: present.
- iOS build and execution: waiting for macOS/Xcode/CocoaPods.
- Human accessibility/usefulness review: not yet run.
