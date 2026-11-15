# Stop halfway through and come back without starting over

## End-to-end goal

Build and verify private preparation that a person can deliberately save, close, reopen offline, continue and finish without losing edits or adding the same passages twice. Deliver working software, detailed plain-language requirements, fictional walkthroughs, an executive HTML presentation, an acceptance audit and a verified release archive.

## Complete scope

1. Offer Save this preparation on this device. Explain that saved preparation includes private source text, edited selections, their types, intended destination, and any draft copy needed to resume. Do not save before permission.
2. Allow named preparations to be opened again. Restore exact text and choices, including empty items still being edited. Make temporary, changed-but-unsaved and saved states clear. Saving a preparation must not silently save the visit itself.
3. Distinguish unconfirmed passages from previously applied batches. Reopen completed work without applying it again. Preserve the resulting temporary visit draft when the person has chosen to keep preparation but has not separately saved the visit.
4. Save an applied batch and its completion record together. A browser interruption must leave either the earlier saved state or the complete new state, not a misleading half-finished state. Repeated clicks and old preparation backups must not silently repeat a recorded batch.
5. Keep the intended destination stable by visit identity, not whichever visit happens to be open later. If the saved destination changed, show that fact and require a fresh review. If it disappeared, ask for a destination; do not silently choose a replacement.
6. Provide a clearly labelled, unencrypted private preparation backup containing source, edited choices, destination information and completion state. Validate restoration, preview what will be opened, and do not overwrite other work without confirmation. Visit-summary sharing never includes this private workspace.
7. Let the person finish, keep, or delete preparation separately from visits. Deleting preparation must not remove visits created or changed from it. Preserve the no-account, no-upload and offline behavior.

## Safety and compatibility

- Use one atomic browser-storage write for confirmed saved preparation changes and any affected saved visit. Keep existing write locking and revision checks.
- Version stored data if adding fields an older app would otherwise discard. Read older supported visit collections without rewriting on load. Older apps must refuse unsupported writes.
- A preparation save may hold sensitive source and draft context. Explain the full contents in the save and backup confirmations. Browser storage and downloaded files are not encrypted by this app.
- Keep temporary-only use available. Explicitly saved preparation may save later edits automatically only after that behavior has been explained. Never label a failed write saved.
- Conflicts preserve current work for a preparation backup. Do not merge text automatically or infer intent from duplicates.
- No cloud accounts, notifications, PDFs, automatic interpretation, medical advice or participant recruitment.

## Verification and completion

Check a full browser restart offline; partial selection edits; empty unfinished items; cancelled save/restore/delete; blocked storage; interrupted and queued writes; repeated confirmations; changed and missing destinations; another tab; private backup restoration; applied-batch recovery; separate cleanup; keyboard and narrow layouts; and no outgoing content.

Run all previous suites against the new source, updating assertions only for intentional contract changes. Check migration and old-app refusal with historical fixtures. Verify a reproducible archive by using its extracted app and checking presentation links, screenshots and layout. State that automated software checks do not establish user preference, clinical benefit or physical-device accessibility.

Completion requires the whole journey and all deliverables, not only a save button or a passing model test.
