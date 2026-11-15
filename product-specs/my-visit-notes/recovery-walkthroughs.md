# Recovery walkthroughs

These are fictional examples for product review and testing, not accounts from participants.

## 1. The wrong question was removed

Sam has three questions ready. One already has an answer note and is marked Answered. Sam removes that question while trying to remove a different one.

Sam opens **Fix a mistake**, reviews the removal and selects the question. The preview shows that it is currently absent and displays the complete question that would return, including the answer note and state. Sam confirms.

The question returns near its original position. A newer title and the other questions stay unchanged. Nothing is selected for sharing because it was recovered. Sam can close the browser and reopen the saved visit with the recovered question intact.

Check: recover the whole item, preserve unrelated newer work, and keep the recovered answer note private.

## 2. An edit removed useful wording

Lee shortens a question, then realises the earlier wording was clearer. In the meantime, Lee has written an answer note on that question.

The recovery list offers the wording change. The preview shows the current wording and the earlier version. Lee cancels once to think, then returns and confirms. Only the wording changes. The answer note remains.

If another tab changes that question after the preview, confirmation must stop. The app must not apply a decision based on content Lee has not seen.

Check: per-field recovery, cancellation and stale-preview protection.

## 3. Only one of the added questions should go

Ari brings three passages into a visit. Two become questions and one becomes a private note. Later Ari adds an answer note to the first question and decides the second question does not belong in this visit.

Ari reviews the **Added passages** record and selects only the second question. The first question, its answer note and the private note are not selected. Confirmation removes only the second question.

If Ari selects a question that has since been edited, the preview shows the complete current item and explicitly says it has changed. Removing it means removing those later edits too; that must be a visible decision, never a hidden consequence.

Check: select individual additions, preserve unselected additions and disclose later changes.

## 4. A private addition sits between older and newer notes

Before adding a passage, Jo's private note says “Ask about transport.” The imported passage adds “Bring the earlier letter.” Jo then adds “Ask Pat for a lift.”

Undoing the imported private passage removes “Bring the earlier letter.” It keeps both the earlier and later wording. The preview shows the resulting private note before Jo confirms.

If Jo has changed the imported wording, or it appears more than once, the app cannot know which words to remove safely. It explains this and lets Jo recover other items separately. Jo can edit the private note directly. The app does not present replacement of the whole note as a safe undo of one addition.

Check: preserve newer private wording and refuse ambiguous removal.

## 5. A saved preparation contains the only copy of a result

Ren saves preparation and confirms its passages into a temporary visit. The completed result is kept inside the preparation, but Ren has not separately saved a visit.

Ren later reviews its batch record in **Fix a mistake**. The preview clearly says this changes the result inside the preparation, not a separately saved visit or the open draft. Ren removes one unwanted addition.

The preparation still has its completion record. Opening the completed result shows the recovered copy. The app does not add the original passages again and does not create a saved visit behind the scenes.

Check: preserve the preparation storage boundary and prevent replay.

## 6. Removal is not the same as permanent deletion

Mo no longer needs a saved visit in the main list. Mo chooses **Remove to recovery**, which explains that the saved copy can remain for up to seven days and may be displaced by the 100-record limit. Mo can recover it during that period.

For a different visit containing sensitive notes, Mo chooses **Delete permanently**. The prompt explains that this removes that saved visit and its recovery records now. Files already downloaded and copies kept inside preparations are separate and must be handled separately.

Mo can also erase all recovery records while keeping current visits. Expired records are unavailable for recovery; because the app cannot run while closed, stored expired records are cleaned on the next successful write.

Check: honest retention, distinct actions and no claim to erase external copies.

## 7. Saving fails during recovery

Dev previews an earlier title and confirms, but browser storage rejects the write. The saved visit and its recovery record remain unchanged. The interface reports the failure rather than saying the recovery succeeded.

Dev can preserve the open draft in a private backup. A backup contains current content, not recovery history, so the app tells Dev to recover needed content first when saving is available. It does not silently discard history to make room.

Check: an unsuccessful write does not lose either copy.

## 8. Temporary work is not yet protected after closing

Kim brings two questions into a new temporary visit. While the page remains open, its batch can be reviewed and individual additions removed. Closing without saving would lose both the draft and its temporary recovery records.

Kim chooses to save. The visit and its available recovery history are saved together. After reopening, Kim can still remove just one of the original additions.

Check: explicit temporary status, no hidden storage before consent and transfer on first save.

## What these examples do not prove

They define behaviour to check. They do not show that someone prefers this app, understands every warning or can use it without help. A physical-phone review and a screen-reader review remain separate from automated browser checks.
