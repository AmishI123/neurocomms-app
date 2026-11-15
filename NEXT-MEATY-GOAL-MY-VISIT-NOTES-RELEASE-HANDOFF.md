# Next meaty goal: hand My Visit Notes to another engineer safely

Status: active. This goal creates a clear, repeatable handoff for the current
web app and native projects. It does not call the product ready for an app store.

## The outcome

Another engineer should be able to open the project, understand what My Visit
Notes does, build the Android app, inspect the iPhone project, run the web checks,
and see the exact boundary between software evidence and missing device evidence.

The handoff must protect the existing Phrase Studio work and must not include
real notes, credentials, local machine settings, browser profiles, caches or
generated release archives unless a release archive is explicitly requested.

## What the handoff must contain

1. A plain product explanation: prepare questions, use them during an appointment,
   record answers, keep personal notes private, save follow-up work, and prepare
   the next appointment.
2. Separate instructions for the web app, Android project and iOS project.
3. One list of commands for web checks and one list for Android build, tests,
   lint, source audit and APK audit.
4. A native acceptance checklist covering saving, restart, offline use, Back,
   keyboard, privacy cover, export, import, copy, share and print.
5. A file and data-safety statement: what stays on the device, what is shared
   only after a choice, what is excluded from backups, and what is never sent.
6. A test evidence table with dates, commands, results and limits.
7. A clear stop point for iOS compilation and native runtime checks when no Mac
   or device is available.
8. A final artifact list containing the source branch, web archive, Android APK,
   build hashes and the exact next action.

## Work sequence

### 1. Freeze the scope

Keep My Visit Notes in `product-specs/my-visit-notes` and
`my-visit-notes-mobile`. Do not mix it with `communication-tool`, which is the
separate Phrase Studio product.

Use only fictional notes in all checks. Do not add accounts, cloud storage,
recording, automated medical advice or hidden analytics.

### 2. Run the web gate

Run the browser and model checks, then the extracted-package check. Confirm that
all current source hashes, the archive manifest and the verification receipt
agree. Rebuild the archive if any included document changes.

### 3. Run the Android gate

Set the Android SDK and JDK paths, then run Gradle tests, lint and the debug build.
Run the native source audit and the APK asset audit. Inspect the APK manifest for
the correct app identity, no network permission, no backup, and explicit backup
rules.

### 4. Run the iOS gate when a Mac exists

Run the iOS build script, compile the simulator app, compare the app identity and
privacy declaration, and verify every packaged web file. Then run the native
journey in a clean simulator installation.

### 5. Run the native journey

Use a new installation containing fictional data. Record each step separately
for Android and iOS. A browser result or a source audit cannot replace a native
result.

### 6. Make the handoff decision

Choose one of these honest states:

- **Ready for native review:** builds and native journey evidence exist for both
  platforms.
- **Android reviewed, iOS waiting:** Android journey passes; iOS needs a Mac.
- **Build-ready, native review waiting:** source, web checks and Android build
  pass, but no native device or Mac was available.
- **Not ready:** a required build or journey check failed and needs correction.

## Done means

- A new engineer can follow the instructions from a clean checkout.
- The web package and native projects are separate and reproducible.
- Every claimed pass has a command or recorded runtime result behind it.
- Private wording is absent from unselected output and no network permission is
  granted without a future feature requiring it.
- Failed saves, interruptions and updates have an explicit test path.
- The handoff names every missing native check instead of hiding it.

## Current starting evidence

- The web release has 288 passing source checks.
- The extracted 229-file web package has passed verification.
- Android build, unit tests, lint, native source audit and 35-file APK audit pass.
- The Android package identity is `org.myvisitnotes.app` and its label is
  `My Visit Notes`.
- The current local candidate is commit `a821ef2` on
  `codex/my-visit-notes-native-validation`. Its rebuilt 229-file web archive
  has SHA-256
  `c70997f55e1221f9a26eb93ec364e05e09365394394575eaa735da01d6df6a5b`.
  Its Android debug APK has SHA-256
  `cdc46a4cd09db5408b59d995aeb7b32ce41fe3ce087fb25036572e46bf2c988a`.
- No Android device is connected, no usable local emulator acceleration is
  available, and Xcode is not installed on the current Linux host.
- The private branch `codex/my-visit-notes-native-validation` contains the
  prepared native workflow, web source, test source and required native source.
  No paid workflow run is planned.

The next action after this handoff is to give the branch to an engineer with an
Android device and a Mac, or to run the native checks in an already-paid test
environment. Until then, the correct state is build-ready but native-review
waiting.
