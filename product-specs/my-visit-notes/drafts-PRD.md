# Keep unfinished follow-up for another day

Status: engineering delivery complete. Requirements D1–D7 are mapped to passing evidence in [the acceptance audit](drafts-acceptance-audit.md). Usefulness and native-device behavior remain unverified.

## The verified gap

The previous release preserves a message or progress entry while its page stays open. Closing the page loses those drafts unless the person downloaded their text. Text downloads cannot reopen the structured entry. Saved preparation already has its own save/resume flow; this goal extends deliberate saving to follow-up without changing preparation into another kind of record.

## D1 — Save a draft without recording progress

Messages and progress editors offer an explicit Save draft on this device action. First save explains that the draft can contain private wording, source context and earlier item content, that anyone using this browser may open it, and that saving is local—not sending, cloud recovery or encryption. Give it an optional name. Nothing is saved just by opening or editing an unsaved draft.

Later edits need an explicit save again. Show temporary, saved, unsaved, failed or conflicting status based on the actual stored copy. Do not say saved while a write waits. Downloading is not saving. A successfully saved, unchanged draft alone should not cause a browser-close warning; unsaved edits still must. A browser may close without delivering that warning.

## D2 — Find and reopen deliberately

Home shows only a neutral count and Open saved follow-up drafts. Private names, source titles, dates and words appear only after choosing to open the list. The list distinguishes messages from progress notes. Empty lists explain that nothing is saved. No last draft opens automatically after reload, update or transfer.

Opening a draft preserves or explicitly asks before replacing a different unfinished editor. Merely listing, viewing, cancelling or reopening never changes saved content or records progress. Multiple saved drafts can coexist; the existing temporary message and progress return controls remain available.

## D3 — Keep the exact work

Retain exact message text, including blank lines and literal markup-like text; retain the selected source-item references and their captured context. Retain progress state, date, private note and the original saved item against which the entry was prepared. Retain optional draft name and identity independently of visit identity. Reopening does not rebuild a message from later visit wording or reset progress fields.

Drafts survive page reload, a complete browser restart and offline reopening after offline setup. Only confirmed successful writes may be described as surviving. Existing browser records upgrade in memory without a write on read; old app versions must refuse unsupported new saved data rather than discard it.

## D4 — Respect changes, loss and interruptions

If a source changed or was deleted, the draft remains readable, editable and downloadable. Explain why recording its progress is blocked. Do not substitute an item with similar text, attach a missing source to an unrelated same-ID local record, or silently refresh the original item used by the save check. The person can keep the draft and return to current saved work to start a new entry deliberately.

Before replacing or deleting a saved draft, compare it with the stored version. Concurrent tabs, deletion, a failed save or an outdated preview must not overwrite newer work. Closing/cancelling a queued operation must invalidate it before a storage lock is released. Double confirmation must not create repeated drafts or history entries. Storage failure preserves the working editor and offers a private download; no partial completion or misleading saved badge.

## D5 — Private backup and transfer

Offer a structured private draft backup, not just plain text. Preview restore before keeping it on this device. Validate its kind, source snapshots, fields and supported version. Reject damaged, unsupported or oversized files without changing current work. Preserve different copies rather than overwriting; repeated identical restores do not create duplicates. A backup without its visits remains readable but cannot bind progress to an unrelated local visit.

Device transfer includes saved follow-up drafts and says so before download. Unsaved message/progress edits remain excluded unless explicitly saved first; make this boundary clear. Transfer previews draft names/kinds and permits deliberate inspection of private contents. Preserve the exact source version when visits get new local identities; missing sources stay missing. Older supported transfer files still import. Preserve repeated-file protection across the saved-format upgrade so a previously restored old file cannot recreate later-deleted notes.

Visit-only and preparation-only backups keep their existing scopes and explicitly do not replace a follow-up draft backup. No automatic exporting or sending. All downloaded files are unencrypted and remain outside the app's deletion control.

## D6 — Finish, discard and delete separately

Copying/downloading a message sends nothing, changes no item state and does not silently delete its saved draft. Explicit delete asks for confirmation and removes only that saved draft; visits, history and downloaded files remain. Discarding unsaved editor changes is separate from deleting a saved copy. Cancelling either preserves both stored and working content.

Recording a saved progress draft checks the original item, records the chosen entry once and removes that exact saved draft in the same successful write. A failure or conflict does neither. If the saved draft has changed elsewhere, it cannot be deleted as a side effect of finishing an older open copy. Visit deletion does not delete independently saved follow-up drafts: warn that they may still contain earlier wording. Saved-data reset explains that drafts are part of that collection.

## D7 — Full delivery and evidence

Deliver the working desktop/mobile web-app feature, detailed requirements, ten or more fictional full journeys, executive/conference HTML with speaker notes and real screenshots, help and save/delete/transfer explanations, requirement-to-evidence map and verified download.

Test exact round trips, explicit consent, neutral Home, different drafts, editor replacement cancellation, saved/unsaved warnings, storage failures, queued saves/finishes/deletes, stale source and draft records, old data, backup restore, two-browser transfer/return, duplicate files, actual offline restart, keyboard and narrow/enlarged layouts. Keep all previous capability assertions, updating only deliberate new routes or clearly changed product behavior. Build and verify the extracted complete workflow, links/images/layouts, file hashes and identical rebuild. Report actual counts rather than assigning a new count before tests exist.

No participants or real appointment data are needed. Engineering checks do not establish usefulness, physical-phone behavior or screen-reader usability. Native Android/iOS work remains a separate later decision.
