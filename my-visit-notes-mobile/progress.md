# Native visit app progress

Status: active; the complete native goal is not delivered.

Current web evidence: all 288 source checks pass, and the expanded 229-file
extracted workflow passed from a fresh checkout. It directly verifies the repaired
Partly answered save, private-note exclusion, exact review download and offline
reopening. Final documentation changes require a fresh archive/receipt pair;
approve only matching manifest and passing verification hashes. Earlier entries
below record the progression, including failures and stale reports.

## Latest native environment check — 2026-09-16

A second, fresh Android 34 software AVD (`my-visit-notes-local`) was created in
an isolated temporary AVD home and started on `emulator-5558` with acceleration
disabled. It remained `offline` after more than a minute; `getprop` could not
run and `sys.boot_completed` was unavailable. It was stopped cleanly without
installing the app or changing any existing AVD. This confirms the local host
cannot provide usable Android runtime evidence in the current environment. No
Android journey step is counted from this attempt.

The installed Android 34 software AVD `PhraseStudio_API_34` was started on the
dedicated `emulator-5556` port with hardware acceleration disabled because this
account cannot read or write `/dev/kvm`. It stayed `offline` for about two
minutes and never returned `sys.boot_completed=1`. The emulator was stopped
without installing the app or changing the AVD data. No Android journey step is
counted from this attempt. No iOS build was attempted because Xcode is not
available on this Linux host.

## Verified foundation

- Android and iOS projects use `org.myvisitnotes.app` and the name My Visit Notes.
- The explicit bundle contains 35 shared application assets with file hashes.
- Dependencies are pinned to the locally installed Capacitor 6.2.1 baseline.
  Framework upgrades and store target requirements need review before distribution.
- The Android debug APK compiled successfully with the corrected native bridge;
  all 35 packaged files match source and both native projects.
- The Xcode project was generated. CocoaPods installation and iOS compilation did
  not run on this Linux host.
- The shared Partly answered saving defect was fixed by giving visit validation
  and recovery validation the same state list. All 100 logic tests pass (96 model
  checks plus four native-boundary checks). Seven
  restored after-review browser scenarios passed, including actual saved state
  after a later answer and private notes/state after offline reopening.

## Remaining delivery

Native adapters are implemented for export through the system share sheet,
clipboard, printing, Back navigation and background concealment. Android compiles
with these adapters. Their native OS behavior and the complete mobile journey
still need execution checks. iOS code has not been compiled here. These are
development builds, not release candidates.

## Native behavior implementation

- `platform.mjs` keeps the browser paths and chooses plugins only inside the
  installed app. Each export gets its own cache file. Failed writes cannot open
  sharing; repeated taps cannot overwrite an in-flight export. Startup cleanup
  targets only the managed export folder, and export waits for that cleanup.
- Clipboard receives only the selected text. Android printing builds a separate,
  script-disabled WebView from escaped selected text. iOS printing uses a plain
  text formatter. Neither implementation reads the private editor DOM.
- Android Back cancels the active dialog or returns Home, preserving the open
  visit. Background events hide conversation words; resuming does not reveal them.
  Native Android and iOS views cover the app during inactivity. App-switcher
  snapshot behavior remains unverified on both platforms.
- Installed apps show offline readiness without a service worker and hide browser
  installation instructions. Phone dialogs use dynamic viewport height; forms
  have scroll margins, controls have touch-sized targets, and Android uses
  keyboard resize. Physical keyboard and cutout behavior remains unverified.
- Android automatic backup is disabled. The merged manifest requests no
  Internet permission and uses only the generated internal receiver permission;
  no broad file-storage permission is requested. iOS includes the filesystem
  timestamp privacy declaration as an Xcode resource. Complete platform
  storage/backup behavior still needs review.

Verification added: four native-boundary unit checks (exact bytes, write failure,
retry, duplicate taps/cancellation, clipboard failure), and a browser scenario
with simulated plugins covering startup, export, copy, printing, Back, failed
export, concealment and narrow layout. Simulated plugins do not prove OS behavior.
The Android APK builds, and all 35 packaged assets match source, dist and both
native projects. Use `scripts/audit-bundle.mjs` with `JAVA_HOME` and the APK path.

Implementation references: [Capacitor Share](https://capacitorjs.com/docs/v6/apis/share),
[Filesystem](https://capacitorjs.com/docs/v6/apis/filesystem),
[App events](https://capacitorjs.com/docs/v6/apis/app),
[custom iOS code](https://capacitorjs.com/docs/v6/ios/custom-code), and
[Android printing](https://developer.android.com/training/printing/html-docs).

No physical Android device is connected. A read-only software-emulated run of
`PhraseStudio_API_34` was started on port 5580 because this process cannot access
KVM. It reached adb device state but boot-completion shell checks are still slow
or timing out. Inspect that running process before starting another emulator.
iOS build and simulator checks require a macOS host.

The `scripts/android-journey.mjs` runner was executed against emulator-5580.
It stopped at the boot-completion guard with no journey checks completed and no
app installation. The package-manager probe returned `Service package: not found`.
The emulator process remains running (PID 1916912 at the last check); continue
checking that instance rather than creating duplicates. The runner requires
`--serial=emulator-5580 --dedicated-test-target` and refuses existing visit data.

Affected web checks passed during this implementation: 24 baseline browser
scenarios and seven after-review scenarios. The final native wording changes
passed the simulated native browser journey again. Four platform unit checks
passed. Phone Home and review renders were inspected; the test server's missing
SVG MIME type was corrected. No whole-release approval is claimed from these
affected checks.

The earlier web archive is historical. Its after-review test weakened assertions
around the failing state, so its green report did not establish correct saving.
The acceptance document has been reopened. The corrected source needs a fresh
full release gate after mobile changes settle.

## Continuation: startup controls and refreshed regression checks

Temporary export cleanup no longer delays Back and background concealment
listeners. Export still waits for cleanup, preventing the cleanup task from
removing a new export. The simulated-native browser journey now holds cleanup
open and verifies that listeners are available, exports wait, and the exact
review reaches the share boundary after cleanup finishes. This check passed.

The recorded logic suite now includes the four native-boundary tests and the
recovery-state regression: 100 checks passed. The release gates now require
100 rather than the obsolete 95 and fingerprint platform.mjs. The shared app
README no longer describes the old archive as current approval. The resulting
web gate expects 288 checks; that is a requirement, not a current pass claim.

A sequential browser regression run is live in command session 58541. Baseline
(24), continuity (15), and phone (12) completed; intake was running at the last
poll. The baseline run preceded the final startup-listener change, so check all
report hashes and rerun stale suites before release. The Android rebuild for
that change is live in command session 22036; do not claim its result until it
finishes. Both native project asset directories have been recopied.

The same emulator PID 1916912 is still live. Its package service now responds,
but boot-completion probes still return empty or time out. No journey install
or native runtime approval follows from that partial boot.

## Latest continuation: build evidence and transfer timeout

Android rebuild session 22036 completed successfully (186 tasks). The APK audit
then confirmed all 35 assets match current source, dist, Android, iOS and APK.
This includes the startup cleanup/listener fix. It is not native journey proof.

Added `scripts/build-ios.mjs` and the separate manual workflow
`.github/workflows/my-visit-notes-mobile.yml`. The script requires a Mac, builds
an unsigned simulator app, verifies app identity, the packaged privacy declaration
and every shared app asset, then records build evidence with explicit runtime
exclusions. JavaScript syntax and workflow YAML parsing passed. Its Linux guard
was exercised and correctly refused to build. No remote workflow was dispatched
and no iOS compilation has occurred.

Regression session 58541 stopped after transfer tests: TR-13 timed out attaching
the oversized (20 MiB + 1 byte) file; TR-01–12 and TR-14–15 passed. Preserved the
failure report in `product-specs/my-visit-notes/qa/transfer-timeout-2026-09-16.json`.
Do not count that suite as passing. Rerun unchanged when the current tests finish
and investigate if it repeats. The remaining conversation, journey, drafts,
next-appointment, after-review, platform and card suites were not reached by
that sequential command and still need a current run.

Preparation/resume (13), recovery (16), follow-up (13) and intake (12) completed
with matching current hashes. Session 9972 is rerunning baseline and continuity
after the startup source change: baseline (24) passed; continuity is still live.
The same software emulator remains live at PID 1916912 after more than 30 minutes;
boot-completion stays empty/timeouts. No native installation was attempted.

## Latest continuation: correct the packaged native bridge

Found a real integration mismatch by inspecting the installed Capacitor Android
`JSExport.java` / `native-bridge.js` and iOS `JSExport.swift`. These unbundled
pages receive `Capacitor.Plugins` proxies; they do not load the JS SDK that
provides `registerPlugin`. The app and Android journey runner now use the
injected proxies. The simulated-native fixtures now expose that same interface
without a made-up registration method. All 100 logic checks and the updated
simulated-native journey passed. Actual OS execution is still required.

The unchanged transfer suite passed all 15 checks on rerun (session 76489),
including TR-13's same oversized-file payload and timeout. The first timeout
report remains preserved. No assertion or timeout was relaxed; its exact cause
is not established by a successful rerun.

Session 29048 completed conversation (14), whole journey (12), drafts (16),
next appointment (13), after-review (7), simulated native and card (6) checks.
Session 9972 completed baseline and continuity before the bridge fix. Five
reports fingerprint the changed platform file and need refreshing: session
77668 is running baseline, continuity, phone, intake and resume in sequence.
Do not package until all hashes and results match current source.

Session 55975 is rebuilding Android with the bridge fix. Both native asset
folders have been recopied; poll the build and audit the resulting APK before
claiming this build passed. The previously successful APK predates this fix.

Added `acceptance.md` with the seven delivery requirements, evidence gaps and
the complete native test journey. Corrected the web verification document to
mark old approval as historical. The same emulator remains live but has not
reported completed boot; no native journey has run.

## Latest evidence: corrected bridge build and full source gate

Session 55975 built the corrected-bridge Android APK successfully. The 35-file
APK/source/project audit passed. The software emulator is still live but has
not completed boot; KVM is not readable/writable by this account. No host
permissions were changed and no native installation was attempted.

All 288 source checks now pass with matching hashes: 100 logic checks, 182 browser
scenarios and six card checks. Session 77668 ended with signal status 143 after
writing a complete passing phone report; its intake and resume steps never ran.
Those two suites were run separately in session 75680 and passed. The recorded
phone report has all 12 passes, no page errors and the current file hashes.

The 230-file web archive passed the previous extracted workflow in session
76714. Its previous released archive, manifest and receipt were preserved in
`/tmp/my-visit-release-before-native-yrNkzv`. The extraction verifier has since
been strengthened to save Partly answered with a private note, download the
exact private-safe review and reopen offline inside the extracted app, and to
check the after-review presentation/help links and layouts. Rebuild and run
that expanded verifier before approving a corrected web archive.

## Build commands

Run `npm ci`, `npm run build`, and `npx cap copy android`. From this directory:

```sh
ANDROID_HOME=/home/mehta/Android/Sdk JAVA_HOME=/home/mehta/Android/jdk ./android/gradlew -p android assembleDebug --offline --no-daemon
```

These SDK paths are specific to this workstation. The APK is generated at
`android/app/build/outputs/apk/debug/app-debug.apk`.
