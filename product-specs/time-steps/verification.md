# Show me the time steps — verification

Checked 17 September 2026.

## Automated browser evidence

Command:

```bash
PHRASE_STUDIO_BROWSER_LIBS=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu \
  npm run time-steps:release-audit --prefix communication-tool
```

Result: 20 scoped browser and integration checks passed, including 10
standalone Time Steps checks.

The checks cover:

- labelled controls and no external page requests;
- the 10:00 fictional example;
- visible preparation, departure, travel, spare-time, and appointment steps;
- recalculation after changing travel time;
- missing and unsafe input rejection without invented values;
- previous-date display when the calculation crosses midnight;
- refusal when the calculation crosses a daylight-saving offset change;
- rejection of malformed saved data and cancellation-safe delete;
- local save, reload, and delete;
- no horizontal overflow at 320px;
- visible focus;
- print output that hides the editor and shows the result.

## Product boundary

This is arithmetic under the assumptions entered by the person. It does not
predict traffic, confirm readiness, connect to a calendar, handle time-zone or
daylight-saving changes, or provide money or medical advice.

No participant, accessibility specialist, clinician, or independent reviewer
has tested this prototype. The checks do not establish usefulness, preference,
comprehension, clinical benefit, or demand.

## Scoped shell and mobile bundle evidence

The scoped release audit reported 19 tests passed. This includes the
standalone app, the Phrase Studio support-tools panel, local
save/reload/delete in the shared shell, malformed-save handling, the runtime
contract, and the evidence-boundary regression check.

The mobile web bundle also passed its build, exact-file audit, source
permission audit, and static accessibility audit. A debug Android APK was
built and its packaged bundle audit passed.

## Native Android attempt

A dedicated `PhraseStudio_API_34` emulator was started with the project
wrapper. It stayed `offline` in ADB during the bounded boot attempt, so the
native WebView journey was not run. This is an environment limitation, not
evidence that the native app works or fails. No native Android acceptance claim
is made.

## Model-based review contract

A dedicated bounded judge is available at
`communication-tool/scripts/time-steps-judge.mjs`, with its rubric at
`communication-tool/ai-evaluation/time-steps-judge-rubric.json`. It can write a
JSON report and a readable HTML report only when given a loopback model
endpoint. The safety gateway checks six required scores and refuses certainty,
decision substitution, and missing evidence boundaries.

At initial setup the judge had not run because the pinned local model runtime
and model file were missing. No verdict was claimed before the runtime was
installed and verified.

The pinned runtime and model were then installed and checksum-verified. The
judge ran with `qwen3.5-0.8b-q8_0` and produced:

- [JSON judge report](../../communication-tool/ai-evaluation/results/time-steps-judge.json)
- [HTML judge report](../../communication-tool/ai-evaluation/results/time-steps-judge.html)

The report passed its bounded-output check. It returned `not-credible` with
all six scores at `1`, naming the tested browser journey and narrow-layout
focus support as strengths, and naming the absence of participant and
specialist review as gaps. Treat that label as an advisory model judgment of
the evidence package, not as a finding that the arithmetic is false or that
the product has no value.

## Human-review packet

The source-free [reviewer guide](reviewer-guide.md) and [private response
form](reviewer-form.html) are ready for an approved reviewer. The packet uses
only a fictional 10:00 appointment task, downloads the response locally, and
does not request diagnosis, names, real appointments, or private stories. Its
static packet check and browser journey passed. The browser journey covered
required-field validation, private JSON download, clear-without-save, no
external requests, narrow layout, and visible focus. A prepared form is not
evidence that a review has occurred.

The [decision report](decision-report.html) consolidates the current product
state, engineering evidence, model-review caveat, claims we cannot make, and
the remaining Android, iOS, and human-review gates. Its boundary checks and
desktop/narrow browser rendering checks passed with no external requests.

## Broader repository check

The full `communication-tool` test command was also run with the required
Playwright library path. Every Time Steps test passed during that run. The
repository command exited nonzero because unrelated existing suites failed in
the Study header, communication-card package count, device recovery, Study
revision workflow, and Study work-experience areas. Those failures are not
counted as Time Steps failures and were not changed as part of this goal.

## Native Android journey runner

The dedicated runner is available as:

```bash
npm run mobile:android:time-steps -- \
  --serial=<authorized-target> --dedicated-test-target
```

It checks the fictional calculation, changed travel assumption, local save,
force-stop/restart restoration, and local delete. It refuses to run unless the
named target is the only authorized device and the APK passes the bundle and
permission audits. Its guard tests passed. No native acceptance result exists
yet because the available emulator remained offline in ADB. The latest APK was
rebuilt and passed the 39-file exact bundle audit and packaged permission
audit. The runner recorded a fail-closed report at
`communication-tool/ai-evaluation/results/android-time-steps-journey.json`
with no completed native steps.

The current mobile doctor reports Android build readiness as true but no
authorized Android target. It reports the iOS shell as present, while
`xcodebuild` and CocoaPods are unavailable. Therefore iOS packaging and
execution remain unverified and are correctly not claimed.

The [native platform handoff](native-platform-handoff.md) contains the exact
commands and evidence rules for the next authorized Android or macOS run.

## Next decision test

Compare one fictional appointment task with a person’s usual calculator or
written schedule. Ask whether the visible steps add enough control to justify
another tool. Do not collect diagnosis information unless an approved study
specifically requires it.
