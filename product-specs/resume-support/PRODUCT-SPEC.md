# Product specification: Resume support

**Status:** build next as a local-first prototype
**Evidence basis:** proxy-only analysis of the frozen ScrapeCreators LinkedIn/Reddit corpus
**Audience:** adults who experience ADHD or neurodivergent executive-function friction; the product must not require a diagnosis

## Product decision

Build a small, private “resume support” tool. When a task is interrupted or feels impossible to start, the user can capture the task, choose one smallest next step, and optionally set a short-lived prompt. The tool should reduce restart friction without turning attention, productivity, diagnosis, or mood into a score.

The evidence snapshot reports 1,296 canonical records from 1,555 text-bearing records. The resume concept has 271 signal records (124 LinkedIn, 147 Reddit), 87 records containing support/request language, and 60 containing privacy-risk language. Energy/sensory pacing is a close adjacent need at 266 records; workplace accommodation has 151. These are query-selected directional signals, not prevalence estimates or participant findings.

## User outcome

Within 60 seconds of opening the tool, a user can leave with one concrete, doable restart step and a choice about whether any reminder exists. Success means reduced decision load and preserved control, not more tasks completed or longer engagement.

## Version-one scope

1. **Capture interruption**
   - One optional free-text field, labelled “What were you trying to do?”
   - No required diagnosis, emotion, calendar, employer, or identity fields.
   - Save locally only after an explicit user action.

2. **Choose the smallest restart step**
   - Offer three editable suggestions: open the relevant file/page, gather one item, or write the first sentence.
   - User can replace, skip, or mark a step as not useful.
   - Never auto-complete work or imply that one step is clinically appropriate.

3. **Optional time-bounded prompt**
   - Off by default.
   - Choices: no prompt, 10 minutes, 25 minutes, or custom up to 24 hours.
   - Explain exactly when it will appear; no recurring notifications in v1.

4. **Control and privacy**
   - Show “stored on this device” at capture and in settings.
   - Per-item delete, clear all, undo after delete, and export before deletion.
   - Retention is visible and editable; default to seven days for unfinished items.
   - No network calls, analytics, account, cloud sync, social import, or background model calls in v1.

5. **Quiet completion**
   - A user may mark a step done, snooze it, or abandon it without a failure state.
   - Completion copy must avoid streaks, points, shame, urgency, or comparative language.

## Data-driven requirements

| Requirement | Corpus signal | Acceptance measure |
|---|---|---|
| One-step restart instead of a full planner | 271 resume-friction records; 87 support-language records | Scripted scenario reaches a restart step in ≤3 decisions and ≤60 seconds |
| Cross-platform usefulness | Resume signals: 124 LinkedIn / 147 Reddit | At least one scenario works with a work-context record and one personal-context record |
| Prompt is optional and bounded | 60 privacy-language records in resume signals | Default prompt is off; every prompt has a visible expiry; no recurring prompt path exists |
| No attention surveillance | Privacy language appears in all three concept directions | Static audit finds no `fetch`, XHR, beacon, analytics SDK, or remote script; delete/clear/export tests pass |
| Low-energy tolerance | 266 pacing signals, including 94 privacy-language records | Low-energy and sensory-load scenarios allow skip/snooze without penalty or required explanation |
| Adjacent workplace use without forced disclosure | 151 accommodation signals, 33 privacy-language records | Work scenario never asks for diagnosis or disclosure; copy frames accommodation as user-controlled |

## Interaction contract

- Every action has a visible result and a reversible path.
- Keyboard flow: capture → next step → prompt choice → save; Escape closes non-destructive surfaces.
- Focus is never moved without explanation. Motion is optional and respects `prefers-reduced-motion`.
- Empty states offer one concrete action, not a dashboard of metrics.
- Copy uses “if useful,” “you can,” and “skip” more often than “should,” “must,” or “stay on track.”

## Scenario acceptance suite

The implementation must ship a machine-readable run for these scenarios:

- **S1 interruption:** returning to an unfinished writing task after a meeting.
- **S2 initiation freeze:** knowing the task but not knowing the first action.
- **S3 low energy:** needing a smaller step and no prompt.
- **S4 sensory load:** choosing to pause without an explanation.
- **S5 workplace privacy:** capturing a work task without diagnosis or employer metadata.
- **S6 deletion:** exporting and deleting an item, then undoing before the retention window closes.
- **S7 expiry:** confirming an unfinished item disappears at its stated retention boundary.
- **S8 no-network:** running with network access disabled and retaining all core behavior.

Required evidence: a JSON result for all eight scenarios, a static network audit, and a browser smoke run. These are engineering checks, not usability evidence.

## Explicit non-goals and stop conditions

Do not add diagnosis, treatment advice, productivity scoring, mood inference, workplace surveillance, social scraping inside the product, or persuasive notification loops. Stop and revise if deletion is hard to find, prompts recur without consent, data leaves the device, or the flow cannot produce a concrete restart step in three decisions.

## Evidence boundary

This specification is grounded in public, query-selected social posts and a heuristic phrase matcher. It supports what to test next. It does not establish clinical benefit, prevalence, user preference, or safety for any individual. The original participant protocol remains the required path for high-confidence product claims.
