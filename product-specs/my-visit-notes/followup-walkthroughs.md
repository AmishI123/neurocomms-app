# Follow-up: fictional end-to-end walkthroughs

These examples describe expected behaviour for product review. They are not participant stories or evidence of benefit.

## 1. Two appointments, one unanswered question

Alex has questions in two saved visits. One question asks who to contact about the next appointment. Another visit has a next step to call an office.

Alex opens **What still needs doing**. Both visits' unfinished items appear, each with its source title and date. Reading and searching do not mark anything done. Alex chooses the contact question as the one item to focus on.

After calling, Alex opens that item's follow-up view, chooses Contacted and writes a private note. Later Alex records Waiting for reply with an optional date. The history keeps both events. Closing the browser and returning offline preserves the waiting state, private history and chosen focus.

When an answer arrives, Alex explicitly chooses Done. For a question, the interface explains that this marks it Answered. The item leaves the default unfinished list and focus clears. **Include done and no-longer-needed items** makes it available for review or reopening.

Check: complete cross-visit, focus, contact, waiting, restart and completion journey.

## 2. Write a message without sharing private notes

Priya has a private preparation note and a personal answer note in the same visit as a question. In the overview, Priya selects only that question, chooses **Prepare a message or call note**, and leaves extra context unchecked.

The initial draft includes the chosen wording, not the visit title, private preparation note, answer note or follow-up history. Priya edits the text, previews the exact result and downloads it. Returning to edit retains every line.

The app does not send the message or mark Priya as having contacted anyone. Priya can record contact later, after it actually happens. If clipboard access is refused, the draft and download remain available.

Check: deliberate selection, private-output boundaries, exact edit/preview/export and no false contact event.

## 3. Bring two unresolved items into another visit

Noah selects a question from one appointment and a next step from another. The carry-forward preview shows both, including any copied next-step date/contact and each source visit.

Noah confirms a new temporary visit. The originals stay unchanged. The copies have new identities, fresh progress, no old answer notes and no old follow-up history. Each copy says **Copied from** and identifies its source.

Saving the new visit keeps those links. Completing a copied question does not complete the original. Source links open the original if it remains available. The app does not silently synchronise the two records.

Check: multi-visit selection, clear preview, fresh identities, explicit provenance and independent progress.

## 4. Keep the open draft when checking an older visit

Kim is writing an unsaved visit and opens the unfinished-work list to find an older question. Choosing **Open original visit** asks before replacing the open draft. Kim cancels and returns to the draft with its title and questions intact.

If saved-visit edits have failed to save, follow-up must not overwrite those newer edits to the same visit. The app asks Kim to save or back up that work first. Recording progress on a different saved visit must not replace the open draft either.

Check: navigation and follow-up writes respect unfinished work already on the page.

## 5. Saving fails or another tab changes the notes

Lee records Contacted and writes a private note, but the browser rejects the save. The panel says the follow-up was not saved and leaves the entered note visible. The stored item and history stay unchanged.

Lee can retry after saving becomes available. A successful retry creates one event, not a duplicate. If another tab changes saved notes in the meantime, the panel reports the conflict and refuses the stale write. Lee can keep a copy of the unsaved note before reloading.

Cancelling while a save waits for a lock, or closing that tab, must not cause a delayed progress update afterward.

Check: honest failure messages, retained input, conflict protection and cancelled queued writes.

## 6. No longer needed does not mean answered

Robin decides a question no longer applies. **No longer needed** removes it from the default unfinished list without claiming that an answer was received. Its private history remains reviewable.

Later Robin changes their mind, includes closed items and chooses To do. The question reopens. No automatic urgency, penalty or reminder is created. Dates remain information Robin entered, not a measure of how well Robin is doing.

Check: reversible closure with plain meaning and no invented medical conclusion.

## 7. Restore a library containing copied items

Taylor imports a visit library on a browser that already has a different visit with the same stored identity. The import preview explains that it will keep both as separate visits.

When a copied item refers to a source included in that file, its local source link follows the imported source's new identity, not the unrelated existing visit. Importing the same file again skips identical content instead of creating another set of copies.

If the original is absent or permanently deleted, the app explains that it cannot open it. The source title/date already kept inside the copy remain visible; deletion of the original is not a claim to erase that separate copy of context.

Check: correct source links, repeatable imports and honest missing-source handling.

## 8. Recover an old item, then follow up

Sam has data from the earlier app, including a removed question in recovery. Merely opening the new app or unfinished-work view does not rewrite that stored data.

Sam restores the removed question. The app keeps its wording and personal answer note, adds empty follow-up history, and writes the supported new format. Sam records Contacted with a private note.

A current full backup preserves that history. The shared summary does not include it. The focus choice is device-local and is not part of that backup. Recovery history stays outside normal visit-library exports.

Check: migration, previous recovery compatibility and clear backup boundaries.

## Evidence limits

These are fictional checks, not testimonials. Automated browser and model tests can verify specific software behaviour. They cannot establish user preference, clinical benefit, physical-phone usability or screen-reader usability.
