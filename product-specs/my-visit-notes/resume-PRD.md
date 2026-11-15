# Save unfinished preparation and return to it

## The problem being addressed

The current existing-notes flow keeps source text and selected passages only in the open page. Closing or reloading the browser loses unfinished work. A source-text download does not include edits made to individual selected passages. A visit backup protects the visit, not unfinished preparation.

This release adds an optional saved preparation. It does not claim that the new flow is easier for everyone. That remains a question for future user review.

## What a preparation contains

A preparation has an optional name, the source text, selected passages with their current wording and types, an intended destination, and a record of batches already added. It can also contain a copy of the destination draft or the result of a completed batch so that temporary visit work can be recovered.

An empty selected passage is valid unfinished work and must survive saving. It is still not valid to confirm as a question or next step until edited or removed. Spelling and spacing must not change on save. The source retains the existing plain-text size and control-character rules.

The source is not a shared summary. Saving preparation can include sensitive material never intended for a visit. Explain that anyone using this browser may be able to read it, and that downloaded preparation backups are unencrypted.

## Saving is a choice

Keep temporary-only use available. Opening intake, entering source, choosing passages or reviewing must not save preparation without permission.

Offer Save this preparation on this device. Before the first save, show exactly which kinds of content will be kept: source, edited passages, destination information and a destination draft copy where applicable. Explain that keeping a preparation is separate from saving a visit.

Use explicit saves for preparation edits in this release. After a later edit, show Changes to preparation are not saved and offer saving again. Do not imply automatic protection. Request a browser leave warning while preparation has unsaved work. Browser closing warnings are not reliable on every device, so the message beside the save control must tell the person to save before leaving.

If saving is refused, blocked or conflicts with another tab, keep the current work in memory. Offer a private preparation backup. Do not claim that a previous saved copy includes failed edits. A save that finishes after another edit may keep its captured snapshot but must not mark the newer edit saved.

## Returning to saved preparation

Provide a discoverable Saved preparations area from the main app, separate from Saved visits. Show the name and enough state to choose the right preparation: count of pending passages and count of previously completed batches. Do not display private source text merely to list preparations.

Opening a preparation must not change a saved visit or replay an addition. If replacing unfinished preparation in memory, ask first and offer saving or a backup. Cancel keeps the existing work. Multiple preparations can be kept; do not force unrelated appointments into one saved workspace.

Restore source, edited passages, types and destination. A completed batch is shown as already added, not as pending work. Give a clear way to open its existing saved visit or recovered temporary result. Opening a recovered temporary result must ask before replacing unsaved visit work.

## Destinations remain attached to the right visit

Store a destination by visit identifier and a snapshot, not the label current visit. The current open visit may be different when the person returns.

For a saved destination, compare the current saved visit with the earlier snapshot. If it changed, explain that review must use its latest content. Recompute matching passages and show a fresh exact preview. Do not carry old duplicate overrides into a new review. If it no longer exists, ask the person to choose a destination; do not silently send passages to a new or unrelated visit.

For a temporary draft destination, keep the draft copy within saved preparation after explicit permission. Restoring preparation must not immediately overwrite the open visit. The person chooses when to open or add to that retained draft.

## Finish without repeating a batch

A reviewed batch has its own identifier. Saved preparation records which batches were completed. When adding to a saved visit, save the changed visit, cleared pending list, recovered result and completion record in a single locked browser-storage write.

If the destination is temporary, save the result inside preparation without putting it in the saved-visits collection. Explain the distinction: the result is recoverable through saved preparation, but is not a separately saved visit yet.

If the write fails, none of those saved fields changes. Keep source and choices available. If the browser stops after a successful write but before showing success, reopening must show the completed batch and its result. Repeated clicks must not apply it twice.

Retain minimal completion identifiers when deleting a preparation, so restoring an older pending backup on the same device cannot repeat a recorded batch. These records hold batch, preparation and visit identifiers, not source text. If the corresponding visit/result was later deleted, explain that it is no longer available; do not silently recreate it.

An older preparation backup restored on an entirely different browser cannot prove what was added on the original browser unless the backup includes its completion state. Require review and text matching rather than promising cross-device knowledge the app does not have.

## Private backup and restore

Download private preparation backup exports the current preparation, including unsaved edits and destination draft context. Explain this before downloading. Keep its file format distinct from visit backups. The ordinary source-text download continues to export only the source.

Restore must validate file size, format, identifiers, passage types, destination copies and completion records before changing anything. Show the name, pending count and completed state before opening it. Do not silently overwrite another saved preparation or the open visit. Opening an imported preparation is temporary until explicitly saved.

Visit-library backups continue to include saved visits and reusable communication requests, not preparation. Label the separation in help and export controls. A user seeking to protect both must download both kinds of backup.

## Finish, clear and delete

Clearing source or selections in the working area is different from deleting a saved preparation. Make the distinction explicit. Confirm destructive choices.

Deleting a saved preparation removes its source, selected passages and retained draft/result copies. It must not remove or revert any separately saved visit. Warn that a result kept only inside that preparation will be lost; offer opening or backing it up first.

Visit deletion does not quietly delete preparation. If that leaves a preparation pointing to a missing saved visit, the next review asks for a destination. Existing clear-all-visit controls must accurately explain whether preparations remain.

## Storage and compatibility

Use collection format version 3 for preparations and completion records. Keep the current storage key so old runtimes encounter an unsupported format rather than writing to a separate stale collection. Read versions 1 and 2 into memory with empty preparation lists, without rewriting merely on load. Individual visit format stays version 2.

Keep the existing safe write lock, revision checks and queued-visit protections. New writes must preserve unrelated preparations and visits. The service worker must include preparation modules for a full offline restart. It must not force an open page to reload during an update.

## Required release evidence

Verify first-save permission; preservation of source, edited/empty passages and types; multiple saved preparations; replacement cancellation; saved and temporary destinations; changed/missing targets; complete offline browser restart; failed, interrupted and queued writes; stale tabs; repeated clicks and old backup replay; private backup/restore; separate deletion; keyboard access; narrow layouts; and no outbound source content.

Deliver fictional walkthroughs, an executive HTML presentation with actual screens, current test reports, an acceptance map, and a reproducible archive checked through its extracted app. Preserve prior visit and intake behavior. Participant testing remains deferred. Do not describe emulated phone dimensions or automated checks as physical-device or screen-reader testing.
