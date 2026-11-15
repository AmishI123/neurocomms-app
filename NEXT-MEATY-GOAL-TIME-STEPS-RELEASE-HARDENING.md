# Next meaty end-to-end goal

## Make Time Steps release-ready without overstating what is known

The next goal is to turn the working Time Steps prototype into a clean,
repeatable release candidate for web and mobile packaging. This goal does not
pretend that automated checks are human research. It makes the technical
evidence complete and keeps every remaining limitation visible.

### Why this is the next goal

The product calculation and local data behavior are already tested. The main
technical risk now is not another feature: it is allowing the test record,
model report, web bundle, and native handoff to disagree. A release candidate
needs one clear account of what passed, what did not run, and what still needs
an authorized device or reviewer.

### Work included

1. Keep one current evidence count for the standalone app, shared shell, and
   product contract.
2. Make the local model judge receive those current counts and preserve the
   human-review boundary.
3. Add regression checks that fail when the judge report drifts from the
   current evidence.
4. Keep malformed local data, delete cancellation, daylight-saving refusal,
   narrow layout, focus, and print behavior in the release checks.
5. Rebuild and audit the Android package without claiming native acceptance
   when the target is offline or unauthorized.
6. Keep the iOS handoff executable and clearly marked as waiting for macOS,
   Xcode, and CocoaPods.
7. Produce one plain-language decision record that says: continue, revise,
   or stop.

### Current progress in this goal

- The judge source now reports the current 8 standalone and 4 shared-shell
  checks.
- The stored judge report now carries those same counts.
- A regression test checks the judge report counts and its human-evidence
  boundary.
- The stored judge report is now identified as stale by
  `time-steps:judge-freshness`: it still names 8 standalone and 4 shared-shell
  checks, while the current suites have 10 and 6. A real loopback model is
  required to regenerate it; the report must not be edited by hand.
- The runtime preflight now checks for the pinned local model binary, model
  file, and loopback proxy. This host has none of them, so it records the setup
  gate rather than pretending a judge ran.
- The standalone Time Steps suite passes 10/10 in the current checkout.
- The earlier focused combined run passed 14/14 across standalone, shell, and
  product-contract checks.

The browser runtime preflight now passes when the documented host library
directory is supplied. A fresh scoped run then passed:

- 10/10 standalone Time Steps browser checks;
- 7/7 shared-shell, product-contract, and judge-report checks.

The current scoped release audit is 20/20 overall, including the browser
rendering check for the release-status handoff.

The direct browser failures seen without `LD_LIBRARY_PATH` were Chromium
startup errors for a missing host library, not product assertions. The
release command must continue to use the documented browser-library setting.

A repeatable scoped command now gathers these gates in one place:

```bash
PHRASE_STUDIO_BROWSER_LIBS=/path/to/browser-libs \
  npm run time-steps:release-audit
```

It writes
`communication-tool/ai-evaluation/results/time-steps-release-audit.json`.
The current run passed all six engineering checks: browser preflight, the
Time Steps browser/integration checks, the mobile bundle, the static
accessibility audit, the Android package, and packaged permissions. It
explicitly lists native Android execution, iOS execution, and human
usefulness/accessibility review as not tested.

The end-to-end technical-preview command now rebuilds the Android package,
runs the audit, creates the handoff package, and verifies its archive and
file hashes:

```bash
PHRASE_STUDIO_BROWSER_LIBS=/path/to/browser-libs \
  npm run time-steps:release-candidate
```

This command completed successfully in the current checkout. It prevents an
older APK from being mistaken for the latest web or shared-shell code.

The separate `npm run time-steps:handoff-verify` command passed all archive,
file-set, file-hash, and evidence-boundary checks.

The technical-preview handoff package is now reproducible with:

```bash
npm run time-steps:handoff-package
```

It contains 36 explicit product, requirement, audit, signing, and handoff files.
The current archive is
`artifacts/time-steps/time-steps-technical-preview.tar.gz`. Use
`communication-tool/ai-evaluation/results/time-steps-handoff-manifest.json` for
the current archive SHA-256; the manifest records `fictionalOnly: true` and
`containsPrivateUserData: false`.

The package command normalizes entry order, timestamps, and ownership. Two
consecutive builds from the same checkout produced the same archive hash, and
the package test now guards those normalization options.

The dedicated `PhraseStudio_API_34` AVD was also attempted with software
emulation. It initialized, but ADB kept reporting `emulator-5554 offline`
after an ADB server refresh. The native runner therefore failed closed with
zero completed journey steps. The resulting record is
`communication-tool/ai-evaluation/results/android-time-steps-journey.json`;
it is a limitation record, not native acceptance evidence.

The native runner now records the target state, the ADB listing, and a
specific next action when the target is missing, offline, or unauthorized.
Its parser handles both tab- and space-separated `adb devices -l` output, so
the current record correctly says `offline` rather than `missing`.
This makes the handoff repeatable without weakening the fail-closed rule.
The runner guard passed 4/4, and the scoped release audit passed 20/20.

An iOS source-readiness audit is now available as
`npm run time-steps:ios-audit`. It confirms the iOS shell and synced Time
Steps runtime match (both passed here), while recording Xcode and CocoaPods
as unavailable on this Linux host. Its report is
`communication-tool/ai-evaluation/results/time-steps-ios-audit.json`.

### Required final evidence

- Standalone browser checks pass.
- Shared shell checks pass.
- Product contract checks pass.
- Mobile bundle and Android package audits pass.
- The model report is advisory and says human review is still needed.
- Any Android run has `passed: true` and all five journey steps, or remains
  explicitly unverified.
- iOS is recorded only after a real macOS/Xcode run.
- No claim is made about usefulness, accessibility benefit, or outcomes until
  an approved human review exists.

### Release decision rule

Release only as a clearly labelled technical preview after the automated and
package checks pass. Do not call it useful, accessible for everyone, native-
verified, or ready for broad use until the missing human and platform gates
are actually completed.

### Current decision

**Continue technical hardening.** The web and shared-shell slice is strong
enough to preserve. Android native acceptance, iOS execution, and human
review remain open gates; none is being silently inferred from the tests.

### Latest repository self-review

The repository release self-review was run after the Android rebuild. Its
software-release checks passed, including the platform contract, release
Android build, APK bundle audit, dependency checks, package checks, and
fictional-data boundaries.

The recorded self-review correctly did **not** pass: at the time of that run
browser execution was blocked by missing host-library configuration, no
authorized Android device or emulator was connected, iOS tools were
unavailable, and human/domain review had not happened. The generated record
is
`communication-tool/ai-evaluation/results/release-hardening-self-review.json`.

The browser configuration issue has since been resolved and the scoped Time
Steps checks pass. The broader repository self-review was not allowed to
finish because it entered a long unrelated device-recovery test; its record
should therefore not be read as a fresh full-suite result.

Its publication blockers also include regenerating the broader review judge
after unrelated benchmark evidence changes. That is separate from the Time
Steps arithmetic and must not be presented as a Time Steps usefulness result.
