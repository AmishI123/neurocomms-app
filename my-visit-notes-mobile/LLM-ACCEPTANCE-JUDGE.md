# My Visit Notes: LLM acceptance review

Reviewed: 2026-09-16

## What this review does

This is an evidence review by an LLM. It reads the recorded test results,
source checks and simulated native checks and asks whether each acceptance rule
is supported by the evidence that exists.

It can judge saved data, displayed text, privacy boundaries, error messages,
file contents, and test logs that are actually recorded. It cannot see an
Android or iPhone that was never run. It cannot turn a source audit, a browser
test or a simulated plugin into proof of native operating-system behavior.

## Judging rule

- **Supported by current evidence** means the recorded evidence directly checks
  the behavior in a browser or simulated native environment.
- **Not proven on native** means the behavior is implemented or simulated, but
  no real Android/iOS runtime evidence exists.
- **Fail** means current evidence shows the requirement did not hold.
- A native release pass requires every required step to be proven on each
  platform. This review cannot grant that pass by itself.

## Ten-step review

| Step | LLM judgment from current evidence | Native judgment | Evidence used | What is still needed |
|---|---|---|---|---|
| 1. Prepare and save | Supported in web and simulated flows | Not proven | Browser restart tests; logic tests; simulated native startup | Save and reopen in Android and iOS apps |
| 2. Show and hide selected words | Supported in simulated native flow | Not proven | Background concealment test; private-note exclusion checks | App-switcher and resume check on both platforms |
| 3. Use Back safely | Supported in browser/simulated native flow | Not proven | Back-event tests and dialog navigation checks | Hardware/system Back on Android and equivalent interruption behavior on iOS |
| 4. Save every question outcome | Supported, including Partly answered | Not proven | Logic and recovery regression tests; browser journey | Save, force-close and reopen in both native apps |
| 5. Keep a follow-up draft private | Supported in web evidence | Not proven | Draft and follow-up browser suites | Native draft, edit and reviewed-output run |
| 6. Prepare the next appointment | Supported in web evidence | Not proven | Next-appointment tests and private-note exclusion checks | Native copy, edit and original-visit comparison |
| 7. Export and restore | Supported for browser file paths | Not proven | Transfer/export tests and exact-file checks | Native picker, cancellation, destination and restore checks |
| 8. Copy and print | Copy and simulated print are supported | Not proven | Native-boundary and simulated-plugin tests | Real clipboard, print sheet/PDF and cancellation on both platforms |
| 9. Offline and failed save | Supported by web and simulated failure checks | Not proven | Offline restart, failed-write and retry tests | Native offline restart and failed-save behavior |
| 10. Update without data loss | Supported by browser update evidence | Not proven | Browser update/reopen checks | Install-over-existing-data test on Android and iOS |

## Overall decision

**Pre-native evidence: CONDITIONAL PASS.** The web product, shared data model,
native bridge contract and simulated native behavior have strong recorded
support. The evidence also includes privacy checks that keep private notes out
of selected conversation and review output.

**Native release: NOT PROVEN / DO NOT RELEASE AS NATIVE-READY.** No Android
journey step has been completed on a real native runtime, and iOS has not been
compiled or run. The local Android emulator failed to boot twice. The hosted
workflow is now on the default branch, but GitHub jobs are blocked before
starting by the account billing limit.

## Visual evidence review

The available browser screenshots support a calm, readable presentation at a
narrow phone width. The page uses short labels, large controls, visible step
numbers and clear status text. The “Message hidden” screen makes the privacy
state obvious and offers two plain choices. The transfer review explains that
nothing has changed yet and shows what will be added before the user confirms.

The long after-visit screen is usable but dense. It places many sections and
actions on one scrollable page, so a native run should check keyboard movement,
focus after dialogs, small-screen scrolling and screen-reader order. The
screenshots support a **visual preflight pass**, not a phone-accessibility pass.

No screenshot shows a real Android or iOS system share sheet, file picker,
clipboard, print result, app-switcher snapshot or update. Those remain
**Not proven**.

## What an LLM judge must not do

The judge must not mark native Back behavior, app-switcher privacy, native
printing, native file picking, keyboard behavior, offline restart or update
data migration as passed merely because source code or browser tests look
correct. Those items remain **Not proven** until a platform run supplies logs,
screenshots or recordings.

## Next decision point

Once a working Android target and Mac/iOS runner are available, attach their
ten-step evidence to `NATIVE-ACCEPTANCE-RUNBOOK.md`. The LLM can then review
the evidence and explain failures, but the platform evidence remains the
authority for the final release decision.
