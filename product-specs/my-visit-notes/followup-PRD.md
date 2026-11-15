# Know what still needs doing after the visit

Status: engineering delivery complete. The requirement-level evidence and limits are in followup-acceptance-audit.md. The release manifest and matching verification identify the checked package.

## Why this belongs in the product

The app already stores questions and next steps inside individual visits. A person returning after several appointments still has to open those visits separately to work out what remains. Recovery protects against mistakes but does not bring unfinished work together.

The next feature should answer: What is still open? Which item do I want to handle now? What happened when I tried? What do I need to ask at my next appointment?

This is a known product gap, not evidence that people prefer this approach or that a particular diagnosis predicts how they organise work. No medical importance is inferred from dates, wording or history.

## F1 — One place to review unfinished work

Add **What still needs doing** as an optional entry point. It lists non-empty unanswered questions and unfinished next steps from saved visits. Temporary drafts and results retained only inside preparation are not saved visits; explain that boundary instead of pretending they are included.

Each row identifies its visit, optional visit date, exact item wording and current progress. Opening the list, searching and viewing history never writes data. Keep saved order rather than an invented urgency ranking. Search matches visit title/date, item wording and action contact, not private preparation, answer notes or private progress notes.

Done and no-longer-needed items are hidden by default. A clearly labelled option includes them so a person can review history or reopen work. A source link opens the exact original visit and question when it is still present. Warn before replacing an unsaved open draft.

## F2 — Record what happened

Offer To do, Contacted, Waiting for reply, Done and No longer needed. Contacted means the person explicitly records contact; it is not inferred from copying a message. Waiting has no automatic time limit. Dates are optional and do not trigger warnings or notifications.

Questions keep their existing Open, Ask later and Answered states. In the follow-up view, Open and Ask later appear as To do; Done marks the question Answered, and the interface says so. No longer needed closes the question without claiming an answer. Reopening sets it to Open. Next steps use the same follow-up states directly.

An explicit save records the chosen state, an optional date and an optional private note of up to 5,000 characters. Keep the latest 50 events per item and explain the limit. A later event does not silently replace earlier history. State changes made through the original visit screens also enter history, without inventing a call, date or note.

These are personal records, not clinician-confirmed instructions. History is kept with its item in saved visits, retained preparation copies and full backups. It is never automatically included in summaries, messages or copied items. Recovery and permanent deletion must handle it honestly: removing an item to recovery retains its history; permanently deleting a visit removes its recovery copies too, subject to the already stated separate-copy limits.

## F3 — Choose one focus

A person can choose one unfinished saved item to focus on. Show that choice without ranking the remaining items. Focus is a device-local convenience, not an appointment, deadline or reminder.

Choosing or clearing focus is explicit. Completion or removal clears an unavailable focus on the next successful write. Opening the overview must not write merely to clean it up. A copied item does not inherit focus. Focus need not be copied through visit or library backups; say it is device-local.

## F4 — Prepare a message or call note

Start with no items selected. A person chooses one or more questions/next steps, then explicitly chooses whether to include visit titles/dates and next-step contacts. Build a short plain-text draft using only that selection. Never include private preparation, personal answer notes, follow-up notes or history automatically.

The person can rewrite every word. A separate exact preview precedes clipboard or download output. Returning to edit must preserve wording, including newlines. Repeated downloads produce the reviewed text. If clipboard access fails, explain the failure and leave download available.

The draft stays in page memory. Explain that it must be copied or downloaded before closing; warn on leaving while a draft is open where the browser supports such warnings. No automatic sending, recipient lookup or network service is added. Creating, editing, previewing, copying or downloading does not change item status or record contact. The person records what actually happened separately.

## F5 — Prepare the next appointment

Select unfinished items across one or more saved visits, review the complete proposed content, then create a new temporary visit. The new visit and each copied item get fresh identities. Questions begin Open with empty answer notes; next steps begin To do. Progress history and private preparation notes are not copied. Action dates and contacts are copied and shown before confirmation.

Each copy records the source visit identity, item identity, type, title and date. Show **Copied from** in the overview and item editors. The copy and original change independently. Completing the copy must not complete the original. Opening the source should locate it when available and explain clearly when it was removed or is absent on this browser.

Keeping an original title/date in a copied item's source record is a separate retained copy of that context. Backup and deletion explanations must mention it. Do not copy private history under the label of source context. Library imports must preserve/remap source links when IDs collide, rather than link to an unrelated visit.

## F6 — Safe persistence and compatibility

Use visit format 3 for history, source information and expanded states. Older visit formats gain empty history and no source in memory without a write just from opening them. Use collection format 5 for device-local focus. Keep the existing key so earlier apps reject newer unsupported data instead of silently discarding it.

Individual backups use format 3; visit-library backups use format 2. Continue reading supported older files. Full backups include history and copied-source context but not recovery history or local focus. Private preparation backups preserve any embedded visit format 3. Summary formats remain explicit projections, not whole-object serialization.

Writes use the existing lock and revision checks. Saving follow-up must not overwrite unsaved edits to the same open visit; protect that draft first. Other open drafts remain unchanged. Stale item previews, failed writes, duplicate clicks and cancellation while a write waits must not create false events or success messages. A closed tab must not later apply a queued action.

Offline and full-browser-restart journeys must preserve saved progress and focus. Updating the app must not rewrite existing data until an explicit write. Recovery records from the previous release must still restore removed items after migration.

## F7 — Access and plain language

Provide labelled buttons, controls and headings. Do not rely on colour, gestures, tooltips or short-lived notices. Keep long item text and message previews usable at narrow widths and enlarged text settings. Support keyboard selection, progress editing, preview and export with sensible focus return.

Completed work remains reviewable. There are no scores, streaks, shame messages or automatic claims that a date is late. Optional details must not become mandatory steps before reading an item.

## F8 — Full delivery and proof

Deliver working code, these detailed requirements, fictional end-to-end walkthroughs, an executive/conference HTML presentation with speaker notes, a requirement-level acceptance map and an extracted release tested against exact source hashes.

Model evidence must cover multi-visit projection, progress transitions, bounded history, stale data, privacy projection, copy identity, source remapping, backup and migration. Browser evidence must cover the two-appointment journey, selected focus, waiting then completion, exact message editing/output, no automatic status change, copy/source independence, failures, concurrent tabs, cancellation, recovery, offline restart, keyboard/narrow layout and no outgoing personal content.

Existing visit, continuity, intake, save/resume, recovery and phone regression suites remain release gates. Tests of implementation do not prove usefulness, clinical benefit, physical-phone usability or screen-reader usability. No participants are required for this engineering goal.

## Not included

No accounts, cloud storage, notifications, automatic messages, medical recommendations, inferred deadlines, automatic document interpretation or hidden syncing between copied items. No claim that message export proves contact or that a personal note is an official medical record.
