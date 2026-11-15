# My Visit Notes — preparation through follow-up

## Delivered extension: the next appointment

The delivered [after-visit goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-AFTER-REVIEW.md) is defined by [A1–A7](after-review-PRD.md). It connects clear outcome labels, private answer notes, editable next steps, selected communication requests, an exact review and the next appointment. It uses existing visit storage/backup/transfer; no new saved record type is introduced. All 283 current-source checks and the 222-file extracted-release workflow passed; [the acceptance audit](after-review-acceptance-audit.md) maps the evidence and limits. Native Android/iOS work is deferred.

## Delivered extension: saved follow-up drafts

The [saved-draft goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-DRAFTS.md) is defined by [D1–D7](drafts-PRD.md). It adds optional saving, exact offline reopening, stale-source protection, structured backup/restore, transfer of saved drafts and one-write progress completion. Collection 7 stores follow-up drafts independently; transfer file 2 carries them while preserving old file recognition. Shell v12 caches the new modules. All 250 current-source checks and the 195-file extracted-release workflow passed; see [acceptance evidence](drafts-acceptance-audit.md). This is the shared desktop/mobile web app; native packaging is a separate future decision. Earlier completed descriptions are historical.

## Current extension: one clear appointment journey

The delivered [whole-app journey goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-JOURNEY.md) is defined by [J1–J7](journey-PRD.md). Home separates starting, continuing and following up. Supporting tools sit below the workspace. Unfinished preparation, messages and progress have deliberate return paths; conversation keeps its existing explicit preview and private-return boundary. Shell v11 adds the journey module; saved collection 6 and visit 3 are unchanged. All 219 current-source checks and the 178-file extracted-release journey passed. See journey-acceptance-audit.md for the complete requirement map and limits; earlier completed milestone descriptions below are historical.

## Current extension: conversation view

The completed goal is [Help me get through the conversation](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONVERSATION.md). Its [C1–C7 requirements](conversation-PRD.md) are part of this specification: unchecked selection, exact preview, a separate display, optional requests, hide/resume, honest save messages and deliberate return to private work. No additional question-state system or saved-data format is introduced. Collection 6 and visit 3 remain current; shell v10 adds the offline conversation module. Earlier version descriptions below describe their respective milestones.

## Move between browsers or devices

The current extension is [Move to another device without starting over](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-TRANSFER.md). Its [full T1–T7 requirements](transfer-PRD.md) are part of this specification: one private file, explicit unsaved snapshots, read-only preview, preserved different versions, correct source/preparation/result links, replay prevention and guarded continuation.

Collection format 6 adds local restored-file records; visit format 3 remains unchanged and shell v9 includes transfer offline assets. A version-1 transfer file projects all current saved content except recovery and local transfer records, plus explicitly selected temporary snapshots and reading choices. Maximum file size is 20 MiB. Individual, library and preparation backups keep their existing narrower formats and scopes.

Notes and the restored-file record save together. Reading choices save as a separate optional operation with separate success/failure feedback. Import never replaces current open work; the user chooses whether to open an imported record afterward. A temporary visit included in the file is retained inside a separate saved preparation copy, not silently saved as a visit.

Local transfer records contain file fingerprints and identifiers, not private wording. They remain after note deletion to prevent repeating the same file. A separate confirmed forgetting action clears only those records and explains that an older file may then restore previously deleted content. These format/transfer rules supersede earlier version numbers below.

## Follow through after the visit

The previous extension is [Know what still needs doing after the visit](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-FOLLOW-UP.md). Its [full requirements](followup-PRD.md) cover cross-visit unfinished work, chosen focus, deliberate private history, exact message previews and independent source-linked copies. They are part of this product specification, not optional future work.

The follow-up release used collection 5, visit 3 and offline shell v8. Individual backups use version 3; library wrappers use version 2. Older supported records gain empty history and source fields without a write merely from opening. Individual visit and library backups preserve follow-up history and source context but exclude recovery history and local focus; the newer transfer file can carry focus. Preparation backups preserve that content in their embedded visit copies. These rules supersede earlier format numbers below.

## Fix a mistake

The previous extension is [Fix a mistake without starting over](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-RECOVERY.md). Its [detailed requirements](recovery-PRD.md) define item and wording recovery, selective batch removal, recoverable versus permanent deletion, bounded private history and failure handling. That release used collection version 4, visit version 2 and shell v7. Visit, library and preparation backups exclude recovery history. These rules supersede earlier no-undo behaviour.

## Save and resume preparation

The previous extension was [Stop halfway through and come back without starting over](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-RESUME.md). Its [detailed requirements](resume-PRD.md) define explicit preparation saving, separate backups, stable destinations, atomic completion and cleanup. These rules supersede earlier memory-only preparation retention. That release used collection version 3 and shell v6. Preparation is not included in visit-library backups.

## Existing-notes addition

The preceding extension was [Turn existing notes into a prepared visit](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-EXISTING-NOTES.md). Its [detailed requirements](existing-notes-PRD.md) define text intake, deliberate passage selection, matching review, safe append to new/open/saved visits, privacy and failure behavior. That release used shell v5 and visit version 2. The rules below continue to apply to confirmed imported passages.

## Purpose

Help an adult prepare their own questions for a routine appointment, keep a place while talking, and review what still needs asking. First reviews should involve autistic adults who already prepare appointment notes, with support they choose. A diagnosis is not required in the app.

The completed [phone-focused goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-PHONE.md) improved the [appointment-to-appointment product](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONTINUITY.md) built from the [first-release goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES.md). This document records the shared product rules, with the existing-notes extension linked above. Participant review is deferred; completion requires the software and release checks, not recruitment.

## First open

The first screen explains the task and local storage in plain language. It offers four starting choices: Prepare my visit, Bring existing notes, Open a saved visit, and Try a fictional example. It does not collect a diagnosis or identity. The visit editor is hidden until the person starts, opens, restores or creates a visit from selected passages. Starting a blank draft, opening intake or looking at the welcome page does not write to saved storage.

Open a saved visit expands the saved list and focuses its search field. It does not create or modify a visit. The fictional example is also available while working; replacing unsaved work still requires confirmation.

The main working area contains the four visit steps and the current screen. Save, full backup, new visit, and the example remain below the work. Saved visits and recovery, Reading choices, and Offline use and installation are separate closed sections. Destructive and file-import controls sit inside a second closed section, Backup files and data controls. These controls are not removed; the person can deliberately open them.

## Phone layout and reading

The phone view uses a compact header and a two-column step selector. The current question is shown as large wrapping text. Previous, Next, and the question state sit together after the question. Optional question-size controls are inside Question display. The app avoids a fixed overlay that could cover an editor or an on-screen keyboard. Long pages remain scrollable; main controls do not depend on a hover action.

Portrait and landscape are both supported. Reduced screen height does not clear inputs, change the current question, or alter states. Focusing and editing text do not reformat the person's words. The release checks resize the viewport to represent keyboard space and switch tabs, but those checks are not tests of a native phone keyboard or operating-system suspension.

Reading choices offers Standard, Larger, and Largest text; Standard or More space; and Soft background, Black on white, or Light on dark. Changes apply immediately to the current page. Save reading choices on this device explicitly keeps the selected display settings for future visits and browser sessions. The interface says when a change is page-only or saved. These settings never rewrite notes, questions, dates, or requests.

Display settings use their own versioned browser key, containing only the allowed setting names. They are not included in visit or library backups. A damaged setting record uses the default display and reports the problem without replacing the stored record. A failed settings write leaves the selected display usable on the current page and leaves visits untouched. Reset reading choices removes only display settings, never visits or communication requests. Another tab's reading changes update the display without triggering a visit-save conflict.

The display-size controls have stable accessible names independent of their selected options. Keyboard focus remains visible in each contrast mode. Primary body-text colour contrast is measured in automated checks; this is not a complete accessibility certification. System forced-colour mode retains control boundaries and focus outlines.

## Saving status and guided recovery

The app distinguishes Temporary visit, Saved on this device, and Changes not saved through text, not just colour. The first welcome screen does not show a redundant temporary-draft status, but damaged-data and conflict warnings remain visible. While working, the status describes the current draft. Only a successful storage write can produce the saved message for the latest edit.

Closing a phone browser does not reliably produce a warning. Instructions tell the person to save or download a backup before closing. The app still requests a closing warning when supported, including restored drafts containing only a title or date. A waiting write that is interrupted must not be described as complete.

Help me recover my notes opens a non-destructive choice list:

- Find a saved visit clears the search and focuses the saved list's search control, without writing notes.
- Browser data was cleared explains there is no server copy. It directs the person to their downloaded backup and states that recovery without any copy is not possible.
- Restore a backup or an older file explains individual-draft replacement, library merging, supported older files, and rejection of unreadable or newer unsupported formats. It then reveals and focuses the restore controls.
- I cannot save or copies conflict first offers a private backup of the current draft, including the latest failed edits. It explains that reloading should happen only after protecting that draft. It describes keeping differing library copies separately.
- Saved data looks damaged explains raw download before explicit reset, and warns against using an old app's reset on newer data. It reveals the data-recovery controls without performing a reset.

Every branch can be cancelled without changing saved data. Moving from the guide to the restore controls places keyboard focus there rather than returning it to the previous guide button. Individual restore, library merge, deletion and damaged-storage reset retain their existing previews and confirmation rules below. The offline help page explains the same branches without requiring a network request.

## Installation and updates

The app provides a manifest, a code-drawn icon, 192px/512px PNG icons, and a home-screen icon. The app identity defaults to its start URL, so serving it in a subfolder does not claim another app's origin-wide identity. Its scope is the app folder. Installation is optional and is not a backup or an account.

An Install this app button appears only when the browser supplies an installation prompt. The button asks the browser to show that prompt. Refusal and failure leave the notes unchanged and retain browser use as the fallback. Browser acceptance and a reported completed installation are described separately. Opening in a real standalone window produces a standalone-use message; the app does not infer installation merely from a manifest or simulated phone screen.

Where the prompt is unavailable, the app explains that a browser may offer Install app or Add to Home Screen in its own menu. It does not promise that every browser or phone offers the same option. Localhost supports local testing; a separate phone needs a reachable HTTPS address. This goal does not publish such an address.

The offline shell is version 6. It includes the preparation, intake, reading and install modules, help page, manifest and icons alongside the existing runtime. A completed first load is required. An update waits until old tabs close after saving; it does not force a reload or delete visit data. Installation, standalone launch, offline use, and data preservation are checked separately. Available full Chromium installation tests use a temporary browser profile and temporary operating-system integration folders. Real Android and iOS home-screen testing remains outside the available environment.

## Screens

1. Prepare: optional title and date, editable questions, reordering buttons, removal confirmation, and private preparation notes in a closed section.
2. What helps: optional editable requests, shown/hidden choices, and a preview of selected requests. Skip this step if it is not useful.
3. During: one large question, adjustable text size, previous/next, a question list, state changes, optional personal answer notes, separate deliberate note display, new questions, pause, and return to preparation.
4. After: questions grouped by state, editable questions and notes, follow-up questions, personal next steps, and explicit selections for outgoing summaries.

Saved visits and recovery sits above these steps. It offers search, visit opening, preparing another visit, individual and library restore, library download, and confirmed removal. It does not become a fifth mandatory step.

## Return to earlier visits

Each saved visit shows its optional title/date, number of non-empty questions that are Open or Ask later, and number of non-empty next steps that are To do. Search checks titles, visit dates, question text, next-step text, next-step dates, and contacts. It ignores letter case. It does not search private preparation or answer notes. Search results remain in saved order; there is no ranking, urgency score, or diagnosis filter.

Opening or searching a visit does not save, mark items complete, or change its date. Ordinary edits to an explicitly saved visit continue to save automatically. Opening a saved visit while an unsaved draft is present requires confirmation before replacing the draft.

## Personal next steps

The After screen offers Add next step. Every item has its own identifier, editable description, optional date, optional contact, and a state: To do, Done, or No longer needed. The initial state is To do. All changes are reversible until the item is removed; removal asks for confirmation. Empty items may remain while editing, but do not appear in outgoing summaries or carry-forward choices.

The person writes each item. The app never turns a personal answer note into an instruction, never suggests medical actions, and never presents these notes as clinician-approved. Dates are plain reminders within the list: no notifications, overdue warnings, scores, or calendar integration.

Next steps belong to their visit and follow its saving rules. A standalone unsaved next-step draft receives the same replacement/closing warnings as unsaved questions. Each next step has a separate unchecked sharing box; selecting it includes its description, state, date, and contact. The preview shows all of those fields. Selections stay across screens in the same open visit, but reset when another visit opens.

## Prepare another visit

Choose Prepare another visit from a saved entry. The flow reads that saved visit, not unsaved changes in another draft. First show its non-empty questions and actions with nothing checked. Allow any combination, including actions without questions. Require at least one selection. Preview the proposed new content before creating it.

The new visit has a new identifier, blank title/date, fresh question/action identifiers, Open questions, and To do actions. Selected action dates and contacts are copied and shown in the preview; the person may edit them afterward. Private preparation notes, personal answer notes, and communication requests are never copied by this flow. Even an Answered question can be deliberately selected as a reusable question; its old answer and state do not follow it.

The source remains unchanged. Creating the new draft replaces the open draft only after a warning about unsaved work. Cancelling either dialog changes nothing. The new draft stays temporary until saved. In-visit display still requires a non-empty question; a draft containing only actions remains usable in Prepare and After.

## Reusable communication requests

On What helps, Save requests for future visits lists non-empty visible requests with nothing checked. Preview selected text before saving it on this device. This adds distinct text to existing saved requests; it does not save the open visit or change its temporary status.

Choose saved requests similarly starts with no selection, shows a preview, and adds only selected text to the current visit. Identical request text already in the visit is not duplicated. Outgoing sharing selections are cleared, not silently granted. No request is applied merely because a new visit was created. These saved requests contain no diagnosis or identity field.

Clear saved requests requires confirmation and leaves requests inside existing visits unchanged. Clear all saved visits explicitly includes saved requests and the open draft. Saved requests are part of the private library backup.

## Question rules

Each question has a stable local identifier, text, state, and personal answer note. The three states are Open, Answered, and Ask later. Only changing the state control changes that state. Next and jump actions do not mark anything answered. Changing state does not remove notes. Reordering preserves identifiers and the current question.

An empty question may exist during editing. At least one non-empty question is needed to enter the visit view. No artificial question-count limit is imposed. Long content must wrap.

## Data

A visit contains version, local identifier, optional title/date, private notes, ordered questions, communication requests with visible flags, next steps, and current question identifier. Nothing is sent to an app server. The browser's saved collection has its own revision number, incremented after each successful change.

Individual visits use version 3. The saved collection uses version 6 and contains reusable requests, saved preparations, completion identifiers, bounded recovery records, local focus and restored-file records. The existing storage key is retained so older apps reject the unsupported format rather than write a separate stale collection. Version 1 visits and backups gain empty next steps; older collections gain the missing preparation, completion and recovery lists in memory. Reading alone does not rewrite storage. Successful writes use version 6 under the shared write lock. A deliberately confirmed reset in an old app can still delete data, so close old tabs and keep backups.

Work starts in memory. Saving requires confirmation explaining local retention and shared-device access. After that, changes save automatically. Saved visits stay until deletion or browser clearing. A backup is needed to protect against browser loss.

The browser Web Locks feature serializes writes across tabs. Before writing, the app compares the stored revision with the revision it last read. A mismatch stops the write. A storage event also marks the open state as conflicted. The user can download their draft and reload saved visits. Browsers without safe write locking retain temporary editing and backup downloads, but cannot save locally.

Every queued save holds its own visit snapshot and identifies the open editing session that requested it. Replacing the draft cancels that session's waiting writes. A completed earlier write cannot mark later edits as saved. A queued deletion likewise stays tied to the visit and editing session confirmed by the user; switching visits cancels it.

There are no hidden behavioural logs, recording, accounts, analytics, or remote model calls. The first version does not use speech output.

## Summaries and backups

Summary output is plain text. It contains an optional title/date and only selected non-empty questions, selected answer notes belonging to included questions, selected visible requests, and explicitly selected next steps. Private preparation notes are structurally excluded. Answer notes and next steps carry personal-note labels. Preview, text download, clipboard, and print all use the same explicit summary projection.

Sharing choices remain in memory when the user moves between screens in the same open visit. They reset when another visit or draft is opened. Editing or removing a communication request clears outgoing request selections so a changed request or shifted list position is not silently included. Re-select the intended requests on the review screen.

A complete backup is a versioned JSON file that includes private notes. A separate confirmation explains this. Restore validates the format and presents the visit title before replacing the open draft. It creates a new visit identifier so existing saved visits are not overwritten. Imported strings are displayed as text, with HTML escaping in editor templates. The import limit is 10 MB; the app reports larger files without replacing work.

## Whole-library backup and restore

Download saved library waits for already queued saves, reads the saved collection, and explains that the file includes private notes and saved requests. It does not include preparation, an unsaved draft or failed edits. Download private preparation backups separately. A separate individual backup remains available for the open visit. Files are ordinary unencrypted JSON and should be stored privately.

Library restore validates the complete file before changing anything; malformed data, duplicate identifiers within a file, unknown versions, invalid states, or files over 10 MB are refused. The preview lists each incoming visit's title/date and one of three results: add visit, skip identical visit, or add a separate copy while keeping the existing visit. It also lists new saved request text. Nothing is overwritten. The current open draft is untouched.

Identical means all recognised visit fields match except the visit identifier. Question and next-step identifiers remain part of that comparison. A different visit with an existing identifier receives a fresh visit identifier. Reimporting the same file then skips the copy rather than creating it again. Requests are added only when their exact text is not already saved. An all-duplicate import performs no write.

The preview is tied to the saved collection's revision. If saved data changes before confirmation, reject the import and ask the person to select the file again. Confirmation writes the merged collection in one locked storage operation. Failed writes leave the previous stored text and the open draft intact. There is no automatic cloud recovery or overwrite mode.

## Deletion and cancellation

Removing a question, deleting a visit, clearing all visits, and replacing unsaved work require confirmation. Fix a mistake recovers recorded item removals, wording changes and selected additions. Saved visits and preparations offer recoverable removal separately from permanent deletion. Permanent deletion clears the object's recovery records; clearing all visits clears visit recovery too. Other preparation copies and exported files remain separate. Recovery records last up to seven days and the latest 100 changes; expiry cleanup occurs on the next successful write. Temporary recovery stays in memory until the visit is saved. Print output contains only the confirmed summary; ordinary printing must not print editors, recovery records or private notes.

## Offline behaviour

Serve the app over localhost or HTTPS. The first visit downloads the app shell. The app announces when the service worker is ready. Cached core screens then work offline. A new worker waits until existing pages close before taking over, so loaded pages use one version. Saved data uses a separate browser storage key and is not deleted during app updates.

## Required checks

Implement and run the 20 VN scenarios in the full goal, covering the question lifecycle, saving/reopening, failed or damaged storage, selected output, backups, deletion, offline use, updates, keyboard and narrow layouts, repeated actions, two-tab conflicts, and network activity. Test results belong in `qa/`; a written requirement is not a passing check.

## Research and release status

This is an initial implementation. Engineering checks and review status are recorded separately. User comparison sessions are required to decide whether it helps more than ordinary notes or paper. No user benefit, clinical outcome, or adoption claim is established by the code.
