# Device transfer: fictional complete journeys

These are fictional examples for reviewing software behaviour. They are not participant accounts, testimonials or evidence of benefit.

## 1. Prepare here, continue elsewhere, bring changes back

Alex saves appointment questions and preparation on a computer, chooses one follow-up item as a focus, and opens **Move to another device**. The review explains that the file includes private source notes and progress history. Alex chooses to include current reading choices and downloads the private file.

In a second browser, Alex selects that file. The preview lists the saved visits and preparation without changing anything. Alex explicitly chooses the incoming focus and reading settings, then confirms. Notes save first; reading choices save separately with their own result.

Alex resumes the imported preparation, reviews the chosen passages and adds them to the intended appointment. Later, Alex records Waiting for reply and a private note. The second browser can return offline and export the updated work.

Back on the first browser, the changed appointment and preparation are kept as separate versions. The original questions are not overwritten. The imported preparation points to its corresponding imported appointment, not the older local version.

Check: both directions, preserved original, correct links, follow-up and offline continuation.

## 2. An unsaved visit is not the same as its saved copy

Priya has a saved visit but has newer words in an unsaved draft. Priya also has unfinished source notes in Bring existing notes. Transfer asks separately what to do with each unsaved piece. Download review cannot proceed until Priya chooses to include or leave out each one.

Priya includes both. The original browser does not save them merely because it downloads a file. The file keeps these snapshots separately from earlier saved records.

On the receiving browser, the preview explains that the unsaved visit will be retained inside a separate saved preparation copy, not silently turned into a normal saved visit. The unfinished preparation also becomes a separate saved copy. Priya can open the transferred draft as temporary work and choose later whether to save it as a visit.

Check: newer words survive without changing the meaning of an earlier saved record.

## 3. Keep the receiving browser's unfinished work

Noah is writing a new visit when a transfer file arrives. Importing the file adds the reviewed records without replacing Noah's open visit or unfinished preparation.

Choosing to open a transferred draft asks before replacing the current draft. Noah cancels; the local title and question remain. Resuming transferred preparation likewise respects the separate preparation replacement warning.

Noah can finish or back up the local work first, then deliberately continue the imported record.

Check: import and opening are separate choices; cancellation preserves the work already on screen.

## 4. Notes save, but reading settings do not

Kim confirms an import and asks to apply its reading choices. The notes and local import record save successfully, but the browser refuses the separate settings write.

The result says that notes are saved and reading choices are not. Kim can retry only the settings; this does not import the notes a second time.

If another tab changed the reading choices after the preview, the app preserves that newer setting and asks Kim to review again rather than overwriting it. The already saved notes remain available.

Check: the app never presents two separate storage operations as one all-or-nothing transaction.

## 5. A save fails, waits or is cancelled

Lee previews a transfer, but the browser rejects the note write. No partial set of visits, preparation, focus or import identifiers should remain. The file is still available for another attempt.

If the save is waiting for another tab to release storage, cancelling the dialog must cancel that pending import. Closing the tab must do the same. Repeated clicks must create no extra copies or duplicate import record.

A different tab that changes saved notes invalidates the old preview. Lee must review the file against the new local data.

Check: no late writes, partial imports or false success messages.

## 6. Do not bring deleted notes back by reopening an old file

Robin imports a file, then deliberately deletes one of its visits. Selecting the same transfer again reports that it was already restored. It does not recreate the deleted visit or replace later edits.

The browser retains a file fingerprint and item identifiers for this purpose, not a second copy of the wording. Transfer explains this retention. Robin can choose **Forget previously restored files**, review the warning and erase only those identifiers.

Forgetting does not delete current notes, preparation, focus or settings. If Robin later imports the old file again, its contents will be reviewed anew and may include previously deleted records. Downloaded files themselves remain outside the app's deletion controls.

Check: deletion is respected, retained metadata is disclosed, and deliberate forgetting has a clear consequence.

## 7. An old preparation must not repeat completed work

Taylor completed a preparation on one browser. A transfer includes the completed result and a small record that the batch was already added.

An older file contains the same preparation when its passages were still pending. Restoring that older copy must not make the batch eligible to run again. The earlier completion record continues to block replay; the app can offer the recorded result when it remains available.

If both browsers recorded different results for the same batch, transfer keeps both results and their own links. It does not add passages merely to resolve the difference.

Check: completion is preserved as well as text, including after transfer back to the original browser.

## 8. A source or destination is missing

Sam transfers a copied question whose original visit is no longer in the file. The copy retains its recorded source title and date. The app does not link it to an unrelated local visit that happens to use the same identifier.

A saved preparation can also refer to a destination not present in the file or receiving browser. Its source and chosen passages survive, but the destination is reported as unavailable. Sam chooses an available destination before applying those passages.

Temporary results kept inside preparation remain separate from normal saved visits. The presence of an embedded copy is not proof that the original saved visit exists.

Check: missing relationships are reported honestly instead of guessed.

## 9. Leave something out deliberately

Morgan wants to move saved appointments but keep an unfinished private source on the current browser. Transfer asks about unsaved work, and Morgan explicitly leaves that source out. The outgoing file contains none of that temporary source text.

The source stays in the original page. Excluding it is not a save; Morgan still needs to save preparation or keep a separate backup before closing. Temporary follow-up message drafts are not included in transfer and must be copied or downloaded in their own tool.

Incoming focus and reading choices are not automatically selected on the receiving browser. Morgan can retain the local choices.

Check: explicit exclusion, truthful temporary-work warnings and no hidden preference replacement.

## 10. Reject the wrong file without disturbing current work

Casey selects a damaged file, an unsupported newer format or a file above the documented 20 MiB limit. The app refuses it before saving any notes and explains what happened.

Current visits and the open draft remain unchanged. Cancelling a valid preview also leaves them untouched. Supported earlier visit, library and preparation backups continue to use their existing restore controls; a transfer file is not interchangeable with those narrower files.

Check: file validation, cancellation and clear distinctions between backup types.

## Evidence boundaries

Browser and model tests can check these specific journeys and failures. They cannot establish preference, reduced effort, medical benefit or real-phone/screen-reader usability. No participant recruitment is required for this engineering goal.
