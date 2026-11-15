# Bring existing notes — product requirements

The [save-and-resume extension](resume-PRD.md) now adds optional saved preparation and private preparation backups. It supersedes the original memory-only retention rules below. Selection, matching, explicit review and visit-sharing boundaries continue to apply.

## What this adds

Someone may already have appointment concerns in a text file or another notes app. My Visit Notes should let them choose useful passages without retyping the whole document. This is a product hypothesis, not a finding that everyone wants this flow. We have not compared it with ordinary copy and paste in participant sessions.

The person supplies the text, chooses each passage, decides what it becomes, reviews the result, and confirms where it goes. The app does not decide what matters or what a clinician meant.

## Who controls it

The person using the app controls every selection. They do not need a diagnosis, account, subscription, helper or participant session to use this feature. A helper can assist with typing, but the software must not treat a helper's interpretation as the person's confirmed wishes. No feature claims to work equally well for every disability or communication preference.

## Starting and returning

Add Bring existing notes to the first screen and the open-visit toolbar. Opening it does not change or save a visit. Closing its dialog leaves the source and chosen passages in memory so the person can return. There is one working area per browser tab, not one per visit. Name this plainly rather than implying that the work has been saved.

The working area has a source box, file opener, passage choices, a list of chosen passages, a destination selector, and a review button. Explain the data rules before the person pastes anything. Source text is private from outgoing summaries, but remains visible to someone looking at the device. This is not encrypted storage or protection from browser extensions.

## Bringing in text

Support pasted text and UTF-8 files ending in .txt. Accept at most 1 MiB of UTF-8 source text. Reject larger files before decoding. Reject invalid UTF-8 and binary control characters. Do not load PDFs, images, word-processing documents or recordings. Explain the problem without deleting the current source, choices or visit.

Keep spelling, punctuation, spaces and line breaks. Browser text boxes normalize Windows and old-style line endings to newlines. UTF-8 decoding may remove a byte-order marker. Therefore, promise preserved wording, not an identical copy of the original file's bytes.

When a file would replace source text already in the box, ask first. Offer downloading the old source. Replacing the source does not replace chosen passages. If source text changes while a file is loading, refuse the stale result and ask the person to choose the file again.

## Choosing passages

Allow native pointer or keyboard selection in the source box. Explain Shift plus arrow keys. Provide Select all source text as an alternative to selecting a range. Three explicit buttons create a passage:

- Make this a question.
- Make this a next step.
- Keep as a private note.

Refuse empty or whitespace-only selections. A chosen passage is a snapshot of the selected wording, not a live link to the source. Changing source text never changes that snapshot. Each chosen item has an editable text box, a type selector and a remove button. Removing it leaves the source untouched. Empty edited items must be corrected or removed before review.

The app does not change a statement into a question automatically. A person can choose question and edit the wording themselves. It does not detect dates, infer priorities, generate answers, extract medication instructions or claim clinical confirmation.

## Destination choices

Offer a new temporary visit, the open visit if one exists, and each other saved visit. Label saved entries with title and date. Do not list the saved copy of the open visit as a separate destination: changes belong to the open editing copy.

For a new visit, use a new identifier and blank title/date. Explain that it replaces the open draft and unsaved work will be lost; the person can cancel and back it up first. Confirmation is required even if the open draft is empty. The result is temporary until explicitly saved.

For the open visit, append to its current content, including unsaved edits. If it was already saved, normal automatic saving applies. If saving fails, the updated draft remains open for backup and the normal unsaved warning must remain truthful. Do not add the same batch again as a retry for failed saving.

For another saved visit, write the changes under the existing safe-write lock, checking the stored record against the preview. Preserve the open draft, its sharing choices and its saved/unsaved status. A failed write leaves the stored destination unchanged and keeps the source and selections for another review. Another tab's changes must not be overwritten.

## Matching and review

Show the destination and every selected item with its complete text and destination type. Show whether it will be added or skipped. Preserve whitespace in the displayed text. Explain what is temporary and what will be saved on confirmation.

Compare selected text with existing question and next-step text after collapsing whitespace. Also flag a selected passage contained within the destination's private preparation notes. Flag repeats among the additions accepted earlier in the same batch. Comparison is case-sensitive and does not infer meaning. It may flag a short passage within a longer private note; the message must not imply exact record identity.

Skip matches by default. Provide an individual Add matching passage anyway checkbox. Changing that choice updates the preview. Do not hide or delete either existing content or the selected source. Refuse confirmation if every item is skipped. The person may go back, change the choices, or deliberately keep a duplicate.

Nothing enters a visit while selecting or reviewing. Cancel closes the review without discarding the working area. Returning to source allows further edits. Confirmation must use the reviewed snapshot; changes to the open editing session or destination invalidate the operation.

## Resulting visit data

Append questions in selection order with new identifiers, Open state and empty personal answer notes. Append next steps in selection order with new identifiers, To do state and blank date/contact. Append private passages to existing private preparation notes with a blank line between entries. Do not change existing question states, dates, contacts, requests, notes or the current question. If a visit has no current question, use its first question after additions.

On success, clear the chosen-item list to avoid an accidental repeated confirmation. Keep the source available until the person explicitly clears it or closes/reloads the page. Tell them both facts. Clearing the working area requires confirmation and never removes content already added to visits.

## Privacy, backups and closing

Unselected source and unconfirmed choices exist only in page memory. They are not written to visit storage, app caches, logs, analytics or backups. Offer a source-text download with a private filename and label. That download contains the source, not separate edits made to chosen items. Warn on page exit while source or chosen items remain; browsers control whether they show the warning.

Confirmed private passages become ordinary private preparation notes. Complete visit and library backups include them; selected summaries and carry-forward do not. Questions and next steps use the existing sharing controls. No content is sent automatically when the person creates it or previews a summary.

The existing version-2 visit format remains unchanged. No source field is added. The app shell must cache both new modules for offline use. Updating the app must not force an open page to reload or delete saved visits.

## Required evidence

Check the whole new-to-saved-to-offline journey, partial and whole-text selection, file validation, replacement cancellation, passage editing/removal, all three destinations, duplicates and deliberate overrides. Check rapid repeated confirmation, changed destinations, failed writes, private source downloads, backups and restored notes, selected summary download/print, carry-forward, keyboard focus and narrow-screen layout. Run prior tests as well as the new ones. A model test cannot establish browser focus behavior; a screenshot cannot establish data preservation.

Release with actual screenshots, a plain-language executive HTML presentation, fictional walkthroughs, an acceptance table mapping requirements to evidence, and an extracted-package check. State technical limits and missing real-device/user evidence. The previous phone-release checks are historical until rerun against this version.
