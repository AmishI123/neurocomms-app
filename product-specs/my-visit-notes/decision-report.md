# Decision report — one complete appointment journey

## Next-appointment decision — engineering delivery approved

Connect existing carry-forward and visit tools around a complete second appointment. Keep copying deliberate, private notes out of the short plan, originals independent and sources inspectable without replacing the open visit. Use the existing saved-visit format so backup, offline return and transfer do not require a separate kind of record. Reordering deliberately resets the starting question; later conversation movement still preserves the saved place. Read [requirements](next-appointment-PRD.md), [presentation](next-appointment-presentation.html) and [acceptance status](next-appointment-acceptance-audit.md). This responds to observed software gaps, not a proven user need. Native packaging remains deferred.

All 271 current-source checks and the 209-file extracted-release workflow passed. This approves the stated software behavior, not usefulness or demand. The checked package is identified by matching release manifest and verification hashes. Earlier decisions below are historical.

## Saved-draft decision — engineering delivery approved

Extend explicit saving to unfinished follow-up messages and progress notes. Keep exact editor words and the original progress item; do not treat saving as sending or recording progress. Use one guarded write to record progress and remove only the expected saved draft. The verified gap is page-only retention, not a claim about participant needs. Draft-only backups stay detached from guessed source visits; full transfer carries source links. Requirements and limits are in [drafts-PRD.md](drafts-PRD.md), with delivery evidence in [drafts-acceptance-audit.md](drafts-acceptance-audit.md). Native Android/iOS work is deferred as agreed.

All 250 current-source checks and the 195-file extracted-release workflow passed. Approval covers the stated software behavior, not usefulness or demand. The archive identity is recorded by matching release manifest and verification hashes. Earlier decisions below are historical.

## Whole-app journey decision — engineering delivery approved

Connect existing capabilities through Home, a focused workspace and a clear finish. Do not create another question-state system or automatically reopen private content. Moving between tools must preserve unfinished work. Session messages and progress stay temporary and separate from saved notes and transfer files. Twelve fictional journeys and the [executive/conference briefing](journey-presentation.html) explain the delivered design; the [acceptance audit](journey-acceptance-audit.md) maps requirements to evidence. All 219 current-source checks and the 178-file extracted release passed. Usefulness remains unverified. Earlier decisions below are historical.

## Current conversation decision

Deliver a separate, explicitly chosen display within My Visit Notes. Reuse existing questions, personal answers and progress rather than maintaining another record. Questions and optional editable requests need selection and preview. Escape hides; leaving deliberately returns to private work. The display is not a device lock, and no participant or medical benefit is claimed. The [requirements](conversation-PRD.md), [presentation](conversation-presentation.html) and [acceptance audit](conversation-acceptance-audit.md) define delivery and evidence. All 207 current-source checks and the 165-file extracted-release verification passed. Earlier decisions below are historical.

## Device-transfer decision

Deliver a deliberate local file transfer rather than accounts or automatic syncing. The earlier software split saved visits, saved preparation and reading choices across separate backups. The new flow gathers current work while keeping inclusion, import and continuation under the person's control.

The main risks are overwriting a different version, reopening the wrong retained result, repeating completed preparation and implying that reading settings and notes save atomically. Preserve different versions, map references explicitly, keep completion receipts, and report the separate settings operation honestly. Temporary results kept inside preparation must remain separate from same-ID saved visits.

The engineering release passed all 193 current-source checks and the 152-file extracted-package verification, including transfer back and preserved source versions. The [T1–T7 acceptance map](transfer-acceptance-audit.md) records the evidence; the matching release manifest/verification identifies the checked archive. No participants were needed or simulated. No usefulness, medical benefit or device-accessibility claim follows from software tests.

## Follow-up decision

Complete the existing appointment journey by making unfinished work visible across saved visits. Keep focus, contact records and message content under the person's control. Do not add automatic reminders, sending, medical priority or shared accounts.

The reason is a concrete limitation in the earlier product: people had to open each visit to review unfinished work. Whether this new overview is useful or preferred remains untested. Software checks cannot answer that question.

The engineering release passed all 162 current-source checks and the 137-file extracted-package audit. This approves the stated software delivery, not usefulness or demand. The exact checked archive is identified by the matching release manifest and verification file.

Approval requires the [follow-up acceptance map](followup-acceptance-audit.md), all current-source regression gates, a verified extracted release and visual inspection of the app and presentation. The history/privacy tradeoff is explicit: retain up to 50 personal events per item, include them in private full backups, exclude them from ordinary summaries/messages/copies, and explain separate copies during deletion. No participants are required or simulated.

## Recovery decision

Extend the existing product with selected-item recovery, not a replacement of the whole visit. Keep earlier wording private, bounded and erasable. Separate recoverable removal from permanent deletion. Preserve the existing boundary between visits and results kept inside preparation.

This responds to the previous software's explicit no-undo limitation. It is not a claim about how frequently people make mistakes or which group would value the feature most. The design trades a limited amount of retained private history for the ability to recover recent work. The app explains that tradeoff before saving and beside the recovery entry point.

The engineering release passed all 139 current-source checks and the 122-file extracted-package verification. The [acceptance audit](recovery-acceptance-audit.md) records the evidence and stated limits. No participant recruitment is required for this goal, and no user benefit is asserted.

## Previous save-and-resume decision

Deliver the optional saved-preparation workflow after its current-source checks and extracted-release audit pass. Use explicit preparation saves, separate private backups, stable visit identity and one write for an applied batch plus its completion record. Keep temporary-only use available.

The reason is a verified product limitation: unfinished preparation previously disappeared when the page closed. The new behavior makes that work recoverable after an explicit save. It does not establish whether people prefer this workflow, how often they need it, or whether it reduces effort. No participant results are claimed.

Collection version 3 prevents older app versions from silently dropping preparation fields. Individual visits remain version 2. Preparation deletion remains separate from visit deletion, with clear warnings about draft-only results. See [requirements](resume-PRD.md), [walkthroughs](resume-walkthroughs.md) and [acceptance evidence](resume-acceptance-audit.md).

## Existing-notes decision

Deliver the existing-notes extension only after the current-source release gate and extracted-package verification pass. It adds deliberate selection rather than automatic document interpretation. Keep plain text as the only input format in this release; do not infer medical instructions or claim that matching text means matching intent.

The value hypothesis is reduced re-entry of existing notes while retaining control over private content. This remains untested with participants. Engineering evidence covers preservation, explicit review, failures, offline use and recovery, not usefulness, demand or clinical outcomes. Detailed behavior is in [the requirements](existing-notes-PRD.md), with [fictional walkthroughs](existing-notes-walkthroughs.md) and [acceptance evidence](existing-notes-acceptance-audit.md).

## Previous phone-release decision

## Current decision

Deliver the phone-focused engineering release once the complete current-source test and extracted-package checks pass. The product now provides a three-choice first screen, grouped phone visit controls, saved reading choices, a recovery guide, and optional installation. These changes make the specified flow available; they do not prove that people find it easier.

The release uses actual previous/current runtime screenshots to explain changes. Full desktop Chromium installation and a real standalone offline launch are checked separately from phone-size emulation and simulated install-prompt events. No physical Android/iOS or participant result is claimed.

Deliver the engineering release. On 15 September 2026, the user asked to proceed without participants. The working app and fictional software checks are the completion endpoint; participant review is deferred. Passing browser checks alone does not establish usefulness.

The implementation now covers the four-screen visit journey plus personal next steps, searchable visits, selective carry-forward, reusable requests, and whole-library recovery. It keeps the original local saving, selected summaries, and privacy protections. Read actual results in [qa/browser-results.json](qa/browser-results.json), [qa/continuity-results.json](qa/continuity-results.json), and [qa/model-results.json](qa/model-results.json); failed or missing checks must stay visible.

## Why extend this product

After completing the appointment-to-appointment journey, the next task was to improve how someone starts and returns to it. New product features were not needed for that goal. The previous first screen showed editing controls immediately; the new one explains the purpose and saving choice first. Advanced file and deletion controls remain available behind deliberate disclosure. Reading settings alter presentation rather than rewriting the person's words. Recovery explains the remaining copies before offering a reset.

The earlier build stopped at recording unanswered questions. It did not provide a separate next-step list or a way to select content for another visit. These additions complete that task using the same local data and privacy rules. The hypothesis is that they reduce repeated copying and make earlier work easier to find. That hypothesis has not been tested with people.

The app does not interpret notes or recommend medical actions. It preserves the person's words and choices. We have not added another diagnosis-specific app, accounts, recording, AI, reminders, or third-party integrations.

## What changed after testing

The phone pass found that reading dropdowns needed explicit accessible names independent of their option text. Guided recovery also needed a deliberate focus destination when leaving its dialog. Both were corrected and covered by browser tests. Restored title/date-only drafts now receive the same replacement/closing warning as other unsaved work. The installability check exposed that a relative explicit manifest identifier resolved too broadly; omitting that identifier correctly uses the app's start URL as its identity. Actual standalone operation was then verified through the browser's app-opening setting, not through a forced CSS-media value.

An answer-note check exposed unstable control naming after notes were entered. Explicit input names now stay stable. Focus returns to a question's state control after a rerender. A recovery path now allows downloading unreadable saved data before explicitly resetting it, while keeping the current draft.

A subsequent code review found that returning to the review screen reset sharing choices and that waiting storage actions read the currently open draft rather than remaining tied to the original one. Sharing selections now survive screen changes. Saves use captured content and editing-session checks; waiting deletions are also cancelled when the open visit changes. Three added browser regressions exercise these cases, bringing the visit suite to 24 passing scenarios.

For this release, format migration is read-only until a saving action, conflicting library records become separate copies, and repeat imports skip identical content. The new tests use the actual prior app as an upgrade fixture. Long unbroken question/request text exposed a need for consistent word wrapping in selection dialogs; the app now applies it to labels, buttons, articles, and paragraphs. A CSS-enlarged dialog also exceeded the visible screen, leaving its confirmation unreachable; dialog height now accounts for its rendered scale and the visible viewport. An old import test checked a dialog before the asynchronous file read finished; it now waits for the dialog before asserting. A keyboard test needed a unique target when several checkboxes were present. These test corrections do not weaken the product assertions.

## What remains unproven

No user sessions have occurred. We do not know whether the app reduces effort, helps during an interruption, or is preferred to ordinary notes. We have no evidence about payment or long-term use. Browser tests are narrower than a full accessibility evaluation and testing on users' own devices.

## Next decision

If participant review is requested later, use the prepared review plan after an organiser and participant arrangements are confirmed. Report actual results, access barriers, and preferences. Continue if people find a specific benefit worth the effort; revise confusing behaviour; stop or change direction if their existing method works as well with less work.

The amended goal ends with the checked engineering release and this decision report. Participant comparison is not required for this handoff. Outreach and public deployment have not been authorised or performed.
