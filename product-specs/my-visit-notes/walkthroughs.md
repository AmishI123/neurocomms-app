# Fictional walkthroughs: one appointment to the next

These are invented tasks for checking software. No participant has completed or endorsed them. Use no real medical details when repeating them.

## 1. Two unanswered questions and a phone call

1. Open the app over localhost. Choose Try a fictional example. Change the title to Fictional first visit. Keep the three example questions.
2. Open Private preparation notes and write `PRIVATE_PREP_EXAMPLE`. This is a test marker, not a medical history.
3. Choose Save on this device and confirm. Wait for the saved status and the offline-ready message.
4. Start the visit. Mark the first question Answered. Move to the next question and mark it Ask later. Leave the third Open.
5. On After the visit, add the next step `Call the fictional office`. Optionally set a date and write `Fictional service desk` as contact. Leave it To do.
6. Preview a summary without selecting the next step. Check that it and the private marker are absent. Cancel, select the next-step sharing box, and preview again. Its date and contact should now be present; the private marker should still be absent.
7. Close the app after it reports saved. Reopen offline. Open Saved visits and recovery, then the saved visit. Check that the question states and next step remain.
8. In the saved list, choose Prepare another visit from Fictional first visit. Select only the two unanswered questions and the phone-call action. Preview the proposed draft. Check that questions are Open, the action is To do, and no private or answer notes appear.
9. Create the new draft, title it Fictional follow-up visit, and save. Open the earlier visit again: its original states and notes should be unchanged. There should now be two saved visits.

Expected software behaviour: selective copying, preserved source, offline recovery, and no private marker in shared or carried-forward content. This does not show whether the process is easier than paper.

## 2. Reuse a communication request without sharing it automatically

1. Start a blank visit and go to What helps. Add an editable request: `Please give me time to answer.`
2. Choose Save requests for future visits. Nothing should be checked. Select that request, preview it, and confirm saving on this device.
3. Notice that the visit itself remains temporary unless separately saved. Start another blank visit, confirming replacement if required.
4. Go to What helps. No request should have been applied automatically. Choose saved requests, explicitly select the saved text, preview, and add it.
5. On After the visit, preview the summary. The request should be absent until its sharing box is selected.
6. Clear saved requests after confirmation. The request already added to the open visit should remain.

Expected software behaviour: saving a reusable preference, applying it to a visit, and sharing it are three separate choices.

## 3. Restore a library without overwriting newer work

1. Save a fictional visit and download the saved library. Read the privacy notice. If there are unsaved changes, download an individual backup as well.
2. Reimport the same library. The preview should say Skip identical visit. Confirm: the visit count and saved revision should not change.
3. Edit the saved visit's title. Reimport the older file. Its identifier matches but its content differs, so the preview should offer a separate copy while keeping the current visit.
4. Cancel first and check nothing changed. Reimport and confirm to keep both versions. Repeating the same import should then skip the already imported copy.
5. Start a new unsaved draft, then import a different fictional library. Check that the draft stays open and temporary; imported records should only appear in the saved list.
6. Try an invalid JSON file. Check for a readable error and verify both the saved library and current draft remain unchanged.

Expected software behaviour: imports are previewed, exact repeats are skipped, differing versions coexist, and a failed import does not destroy work. The file is unencrypted; treat a real library as private.
