# My Visit Notes: controlled beta run

Run date: 2026-09-16
Run type: web-only engineering beta preflight
Data: fictional test data only
Decision: **Hold full beta closeout; web browser environment needs repair**

## What was run

| Check | Result | Evidence |
|---|---|---|
| Rebuilt release archive | Pass | 229 files; SHA-256 `6d719227d743a439794f018630c5afedf3a18684e9a6081931758ac662f374da` |
| Model checks | Pass | 3 of 3 tests passed |
| Native-boundary checks | Pass | 4 of 4 tests passed |
| LLM acceptance gate | Pass | 10 steps present; native approval remains false |
| Full release gate | Not completed | Browser could not start because `libnspr4.so` is missing |
| Android native journey | Not run | No usable native target |
| iOS native journey | Not run | No Mac/Xcode |

## Browser gate result

`tests/release.mjs` first found and corrected a stale archive manifest: the
current `README.md`, `acceptance.md` and `progress.md` were newer than the
previous archive. `build-release.mjs` rebuilt the archive and fixed that
source/archive mismatch.

The rerun then reached the browser checks but Playwright Chromium exited before
opening a page. Its error was:

```text
error while loading shared libraries: libnspr4.so: cannot open shared object file
```

No product assertion ran after browser startup failed. This is an environment
failure, not a product pass or product defect.

## LLM judgment

The LLM judge accepts the model, native-boundary and archive evidence listed
above. It does not accept the full web beta gate because the browser never ran.
It keeps every Android/iOS result as **Not run**.

## Required repair before closeout

Install or provide a browser runtime with its required system libraries, then
rerun `node tests/release.mjs` from `product-specs/my-visit-notes`. Do not edit
the application or weaken the test because of this host-library failure.

After the web gate passes, run the controlled beta tasks from
`NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONTROLLED-BETA.md` and record each task. Native
expansion remains on hold until Android and iOS runtime evidence exists.
