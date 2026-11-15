# Turn existing notes into a prepared visit

## Goal

Build and verify a private, easy-to-understand way to bring existing written notes into My Visit Notes without retyping them. A person chooses what each passage becomes. Nothing is rewritten, interpreted as medical advice, or shared automatically.

## Complete journey

1. Choose Bring existing notes from the starting screen or an open visit.
2. Paste text or open a UTF-8 plain-text file. Explain that this working area is temporary, not part of saved visits or backups. Offer a private source-text download before leaving.
3. Select text using the keyboard or pointer. Offer a whole-text selection for people who cannot easily select a passage. Choose Make this a question, Make this a next step, or Keep as a private note.
4. Keep selected passages as separate, editable items. Editing the source does not silently change items already selected. Removing an item does not remove source text.
5. Choose a new draft, the open visit, or a saved visit. Review exact text and destination. Flag matching text in the destination and within the chosen items. Skip matches by default; allow deliberate duplicates.
6. Confirm before creating or adding anything. Preserve existing visit fields and saved visits. Warn before replacing unsaved work. Refuse stale confirmations if the destination changes. Failed saving must preserve recoverable work and must not invite accidental repeat additions.
7. Edit, save, reopen offline, share selected content, back up, restore, and carry selected questions and next steps into another visit using the normal app flows.

## Data rules

- Original source text stays only in the open page's memory unless the person downloads it. Reloading or closing loses it; warn while work remains. No account, upload, analytics, or model call.
- Only confirmed chosen passages enter a visit. Private passages append to private preparation notes, separated by a blank line; existing private text is preserved. Those notes never enter shared summaries or carry-forward.
- Preserve wording and spacing. Browser text editing normalizes line endings to newlines; do not promise byte-identical file preservation. Reject unreadable UTF-8 and binary control characters. First release limit: 1 MiB of UTF-8 source text. File opening requires a .txt extension.
- Matching compares text with whitespace differences ignored, without changing the stored text. It is a warning, not a claim that two items have the same meaning. Search questions, next steps and contained private-note passages; do not expose private matching text in an outgoing summary.
- Added questions start Open, with no answer note. Added next steps start To do, with blank date/contact. Do not infer dates, contacts, diagnoses, instructions, or consent.
- No new visit schema is required. The source and unconfirmed selections are not backup fields. Explain this distinction beside the intake controls.

## Deliverables

- Working intake, selection, duplicate review, destination confirmation and safe return to the visit.
- Detailed plain-language product requirements and fictional walkthroughs.
- Executive HTML presentation explaining the problem hypothesis, complete flow, decisions, limits, actual screenshots and test evidence.
- Model and browser checks for every step, privacy boundaries, cancellation, invalid files, repeated additions, storage failure and stale edits.
- Existing browser/model/card checks still pass. Verify offline installation/update behavior with the new runtime assets.
- Updated acceptance audit and reproducible release archive, verified by opening the extracted app and exercising the new flow.

## Not included

Photos, PDFs, recordings, automated text interpretation, cloud accounts, medical advice, recruitment, and claims of proven benefit. Participant review is deferred, not simulated. Technical checks establish behavior, not whether people prefer this to ordinary notes.

## Completion rule

Finish only after the whole journey and deliverables above have direct evidence. A working import button, a requirements document, or old passing tests do not complete this goal.
