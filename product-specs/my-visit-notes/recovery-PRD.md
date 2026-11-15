# My Visit Notes: fix a mistake without starting over

Status: implemented and technically verified. The [acceptance audit](recovery-acceptance-audit.md) maps each requirement to the 139-check release gate and extracted-package evidence. This is not proof of benefit to people, physical-phone usability or screen-reader usability.

## 1. What this is for

A person may remove the wrong question, replace wording they wanted to keep, delete a saved visit, or bring in passages they later decide not to use. A confirmation can stop some mistakes. It cannot help after someone has already confirmed.

The product should provide a calm way back. Show what is available, let the person choose the exact content, show what will change, and make the change only after confirmation. Keep unrelated newer work.

This feature is not a medical service. It does not decide whether a question, answer or next step is correct. It does not claim that people with any particular diagnosis make more mistakes. These requirements address ordinary mistakes when handling personal notes.

## 2. The complete journey

1. A person prepares or opens a visit.
2. They edit notes, remove an item or add reviewed passages.
3. They notice a mistake, immediately or after returning later.
4. They open the always-available **Fix a mistake** control.
5. They choose a recorded change and select the items they want to recover.
6. The app shows current content beside the proposed result. Later edits are called out explicitly.
7. They cancel with no change or confirm only the selected changes.
8. They return to their notes. Nothing is shared or selected for sharing because of recovery.
9. They can erase recovery copies without deleting current notes.

## 3. What must be recoverable

### R1 — Removed questions and next steps

Restore the complete removed item, not just its title. A question includes its wording, answer note and Open/Answered/Ask later state. A next step includes wording, date, contact and state. Use the original position when practical. Preserve current question position if that question still exists.

Restoring one item must not replace a newer visit title, another question, an answer note on another item or a next step. If an item with the same identity already exists, refuse an ambiguous restore rather than create a hidden duplicate or overwrite it.

### R2 — Removed visits and preparations

Deleting a saved visit offers two clearly different actions: **Remove to recovery** and **Delete permanently**. Removing a saved preparation offers the same distinction. The prompt states what is kept, for how long, and which separate copies remain.

Recovering a preparation restores its source, pending choices, destination and completion records. It must not apply its passages again. Completion identifiers remain after removal so an old backup cannot silently repeat an earlier addition.

Permanent deletion removes the selected saved object and recovery records containing it. Copies inside other saved preparations and files outside the app are separate; explain that boundary in the prompt. Clearing all saved visits is explicitly permanent and clears their recovery history too. It does not claim to erase preparations.

### R3 — Earlier wording

Visit title, date, private preparation notes, question wording and answer notes, and next-step wording, dates and contacts can be reviewed separately. Restoring one field does not replace the entire visit.

Consecutive typing in the same field may be grouped to avoid a list of individual keystrokes. Group only consecutive, matching changes within one minute. Keep the original wording at the start of that group. Changes in other fields break the group.

An earlier version is not automatically more correct. Show current and proposed content in full. If current content has changed since the record, explain that before confirmation. If it changes again after the preview, stop and ask for a fresh preview.

### R4 — Unwanted additions

Keep a record of items added together from existing notes. Let the person choose which additions to remove. Do not delete an entire visit to undo a batch. Show any later edits to each chosen item before removal, including answer notes and next-step details.

Keep additions the person does not select. Keep unrelated changes made after the addition. Private-note additions need special care because they share a text field: do not silently discard later unrelated private wording when undoing an addition. If the original addition cannot be safely separated, explain the problem and allow an explicit wording review instead of pretending it is a safe batch undo.

## 4. Storage and privacy

### R5 — Time and size limits

Keep recovery records for up to seven days, with a maximum of the latest 100 recorded changes. These are maximums, not a guarantee that every change stays for seven days. Grouped typing counts as one recorded change. A multi-item batch counts as one record.

Expired records must not appear or be restorable. The browser cannot run cleanup while the app is closed. Explain that expired stored copies are removed on the next successful app write. Erasing records now must be possible without waiting for expiry.

If saving fails, do not show a saved message, delete the original stored collection or silently remove recovery records to force a successful save. Keep the open draft available and explain how to download a private backup. Test low-storage failures.

### R6 — Temporary work

An unsaved draft and its recovery records stay in page memory only. Display that limitation. Saving the visit transfers its available recovery history in the same successful write. Changing to another draft must not be presented as a saved recovery path. The existing replace-draft warning still applies.

Saved preparations can retain a completed result without separately saving a visit. Recovery of additions in that result must follow that same storage boundary; do not secretly create a saved visit.

### R7 — Backups and shared output

Individual visit backups contain the current visit, not its recovery history. Library backups contain current saved visits and reusable requests, not preparation or recovery records. Preparation backups retain the current preparation, not removed copies. Explain this before download; recover needed content first if it must be included.

Shared summaries, ordinary printing, conversation display and search results must not expose recovery records. Opening recovery is an explicit private-content action. Recovery never selects restored material for sharing. Existing downloaded files, clipboard content, browser-level copies and another device cannot be erased by this app.

## 5. Reliability and access

### R8 — Safe changes

Write the current result and its recovery record together. Use the existing shared write lock and collection revision check. Another tab's change must stop stale writes. A failed or cancelled confirmation leaves saved content unchanged. Repeated confirmation must not duplicate a recovered item.

Validate recovery input before trusting it. Reject unsupported paths, duplicate record identifiers and malformed items. Older saved collections can be read without a write just from opening the page. Older app versions must not silently discard newer recovery fields.

### R9 — Accessible controls

Use labelled buttons and checkboxes. Keep the recovery entry point visible and usable on a narrow screen. No time-limited toast, gesture-only operation or colour-only warning. Long personal text must wrap or scroll within the dialog without hiding the confirmation and cancellation controls. Test keyboard use, focus return and narrow layouts.

## 6. Evidence needed before release

- Model checks for item restoration, per-field restoration, batching, retention, malformed data, migration and non-mutating failures.
- Browser checks for saved and temporary work, reload, fully offline use and a persistent-browser restart.
- Browser checks for preparation removal/recovery, preserved completion records, and completed temporary results.
- Failed-write, cancellation, double-click and two-tab checks.
- Privacy checks for summary, print, backups, permanent erasure and separate copies.
- Existing product regression checks, rendered screenshots, an executive presentation and a packaged release tested after extraction.

No user participants are needed for these checks. Passing them demonstrates tested software behaviour, not improved wellbeing, clinical benefit or successful use on a physical phone.

## 7. What is deliberately not included

No account, cloud history, automatic sending, medical guidance, unlimited history or promise to recover cleared browser storage without a backup. No claim of secure forensic erasure from a device. No diagnosis-specific assumptions about who needs this feature.
