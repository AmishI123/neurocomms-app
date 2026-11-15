# Continue native work without owning test hardware

## Available route

Read-only checks found an existing signed-in GitHub account and admin access to
the private repository `mehtama1234/neuro-divergent`. Existing workflows are
enabled. No new account or user-owned Mac is necessary to use hosted runners.
This establishes an available route, not that our native jobs have passed.

GitHub offers [hosted Macs and accelerated Linux Android runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
Private-repository runs use the account's allowance and can incur
[charges](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
Remaining allowance and billing limits have not been verified. Do not promise
that the run is free, and do not dispatch a run without approval.

## Prepared locally

`.github/workflows/my-visit-notes-mobile.yml` now has a manual platform choice:

- Android: build, verify packaged files, start a dedicated accelerated emulator,
  then test saving, native clipboard, Back and process restart. The runner's
  output lists the wider native journey steps that remain untested.
- iOS: compile the unsigned simulator app on a Mac and verify its identity,
  privacy declaration and bundled files. This does not yet run the iOS journey.

Android jobs time out after 25 minutes and iOS jobs after 30. Artifacts are kept
for one day. These bounds reduce exposure; they do not by themselves establish
the account's total cost. The workflow has read-only repository permissions and
does not publish to either app store or deploy the website.

The Android wrapper refuses local execution, non-accelerated runners, another
attached device and an existing AVD with the same name. It stops only the
dedicated emulator it creates. Shell syntax and YAML structure checks passed;
the refusal guard was checked locally. Hosted execution remains unverified.

## Approval needed

The user was asked whether to upload a separate branch containing the required
app/test source and run hosted checks, with an extra-cost ceiling of $5, or to
keep preparation local. No answer is assumed from a preselected option.
Nothing has been committed, pushed or dispatched for this plan.

If approved, first inspect the existing dirty worktree and the branch's exact
file list. Do not upload unrelated research, local configuration, credentials,
real notes, caches or generated release archives. Check runner pricing and
account billing controls before running; if the approved ceiling cannot be
enforced or bounded, stop and explain instead of spending beyond it.

## Additional local check

Playwright's WebKit 26.0 now runs locally. `scripts/prepare-local-webkit.mjs`
downloads and extracts the missing Ubuntu libraries into a fresh temporary
folder without installing system packages or running package setup scripts.
`scripts/webkit-journey.mjs` uses the installed WebKit binary with those library
paths. It checks actual dynamic linking instead of relying on the unchanged
system library cache. Linux WebKit helps find browser differences; it is
[not an actual Safari/iOS device](https://playwright.dev/docs/browsers).

Seven journey stages pass: all supported saved outcomes, conversation privacy,
exact review export, failed-save recovery, saved follow-up drafts, a separate
next appointment, and large text at narrow/rotated sizes. Full browser restart
offline fails with a WebKit internal navigation error. The report remains failed.
Reopening online recovers both visits and the follow-up draft unchanged; the
offline cache also remains present. This does not establish why offline launch
failed and does not prove offline iPhone use. See `qa/webkit-journey.json` and the
preserved failure reports.

The first WebKit run also found a test-helper mistake: a nested Reading choices
disclosure had a bounding box even though its parent Tools disclosure was closed.
The helper now opens closed ancestors through real summary clicks. All 24
Chromium baseline scenarios pass with that correction. Other source-hash reports
must be refreshed before claiming a new whole-release gate.

The full goal still includes Android and iOS. A web-only release has not been
substituted for that goal, and native readiness is not claimed.

## Offline isolation check — 2026-09-16

`scripts/webkit-offline-probe.mjs` now tests a tiny independent page, with no
product code, using both simulated offline mode and a stopped local HTTP server.
Both warm reload and full persistent-browser restart fail in local WebKit.
The worker's installation cache write resolves, but both worker and page report
an empty cache. A separate page-written canary also cannot be read immediately
after its awaited write. The canary never supplies the tested root document.
This is earlier than the offline navigation failure and is the next diagnostic
target. Disk space is not exhausted (734 GB available at this check).

The same fixture passes all four warm/cold cases in Chromium, serving the page
from the worker and retaining its localStorage value. Reports are
`qa/webkit-offline-probe.json` and `qa/chromium-offline-probe.json`.
This narrows the problem to the WebKit/runtime combination; it does not identify
the underlying cause, establish a Safari defect, or approve native offline use.
No product offline assertions were removed and no product behavior was changed.
The broader Chromium regression run remains in progress; its completed recovery,
follow-up, transfer, conversation and journey suites pass.

An additional run with `--memory-profile` creates a fresh profile under Linux
`/dev/shm`, without changing existing profiles. It fails the same four offline
cases and immediate cache readback. See `qa/webkit-offline-probe-memory.json`.
This excludes a failure limited to the usual temporary-directory filesystem;
it is diagnostic evidence only, not durable-storage acceptance. Browser debug
output points to WebKit's generic internally-failed-load path, not a specific
root cause. The attempted CacheStorage logging channel is unsupported by this
build and supplied no useful cache diagnosis.

The Chromium regression subsequently completed with exit code zero, including
all 16 saved-draft, 13 next-appointment and seven after-review scenarios. A final
audit of all 15 result files confirms 288 passing source checks, matching current
source/helper hashes and no reported browser errors. The release archive was then
regenerated; all 229 extracted files and the expanded release workflow passed.
Archive SHA-256: `c70997f55e1221f9a26eb93ec364e05e09365394394575eaa735da01d6df6a5b`.
The prior archive and receipts remain in
`/tmp/my-visit-release-before-refresh-mlfRPB/releases/`.
The Android package audit was rerun with the local JDK on PATH: all 35 shared
assets match current source, bundle, both native folders and APK. A first attempt
without the JDK on PATH could not find `jar`; that was an invocation issue, not
a package mismatch. Native acceptance and the failing WebKit journey remain
separate and incomplete. No Android device is attached, KVM remains inaccessible
to this account, and Xcode is unavailable. No remote run was authorized or started.

## Build report integrity

The iOS builder now snapshots its source inputs after Capacitor sync and before
Xcode starts, then rejects changed or missing inputs after compilation. The
snapshot includes the full App directory (Swift, configuration, storyboards,
icons and copied web files), project settings, dependency locks and build scripts.
Previously it hashed a shorter list only after compilation, which could wrongly
associate a build with a source edit made during compilation.
`node --test scripts/build-inputs.test.mjs` passes for unchanged, modified and
missing synthetic inputs. The builder passes JavaScript syntax checking and
still refuses Linux without attempting Xcode. These checks validate the report
guard only, not an iOS build or simulator journey. The verified web archive is
unchanged by these native-script edits.

## Native source audit

The Android activity now ignores repeated pause callbacks while its privacy cover
already exists, preventing stacked covers during interruptions. A local source
audit checks the app identity and backup setting, Android/iOS print registration,
network blocking and text escaping, print-busy guards, and background privacy
cover guards. `node scripts/native-source-audit.mjs` passes. This is a source
check, not proof that the operating systems display the print sheet or app
switcher correctly.

The Android Gradle `test` task also passes for debug and release variants. The
project's current unit-test set is small, so this proves Java/build integration
but does not simulate a WebView, Android lifecycle, clipboard, sharing, printing,
or a real installation.

Android lint now passes after moving the permission declaration to the standard
manifest position, adding explicit Android 12+ and legacy no-backup rules, and
using a resource for the privacy-cover title. Remaining lint output is limited
to generated/unused starter resources, launcher and splash asset suggestions,
and dependency-version notices; none points to the app Java, manifest security
policy or native print code.

The prepared Android job runs the Gradle unit tests and lint before building the
debug APK, then runs the 35-file APK audit. The local equivalents pass. The
workflow remains manual and has not been uploaded or dispatched.
