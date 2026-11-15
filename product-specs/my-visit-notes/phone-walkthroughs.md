# Fictional first-use and recovery walkthroughs

These are invented software tasks, not participant results. Do not enter a real medical history while following them.

## Full first-use to recovery journey

1. Open the app. Read where notes are kept. Choose Prepare my visit.
2. Title the draft Fictional phone visit. Add What happens next? and Who can I contact? Add `PRIVATE_PHONE_PREP` to private preparation notes.
3. Save on this device and confirm. Check the saved message. Open Offline use and installation and wait for offline files to be ready.
4. Start the visit. Add `PRIVATE_PHONE_ANSWER` as a personal answer note for the first question and mark that question Answered. Move to the second and mark it Ask later. Previous/Next alone must not mark answers.
5. On After the visit, add Call the fictional office as a next step with an optional date and fictional contact. Leave it To do. Wait for the saved message.
6. Close and reopen offline. Choose Open a saved visit and open this one. Its questions, current place, states, notes, and next step should remain.
7. Preview a summary without selecting answer notes. Neither private marker should appear. Exporting a private backup is different: it should include both markers for recovery.
8. In Saved visits and recovery, open Backup files and data controls. Download the saved library. Read that an unsaved draft or failed edits need their own individual backup.
9. Open the app in a separate clean browser profile. Use Help me recover my notes, then Restore a backup or an older file. Reveal the controls and choose the library file. Review additions before importing.
10. Open the restored visit. Check all original fields. Prepare another visit from only the second question and the action. Preview: no private notes, an Open question, and a To do action. Save it with a new title. The first visit should remain unchanged.

The automated journey uses phone-sized/touch browser settings and a full offline browser restart. It is not a physical-phone study.

## Reading choices without changing words

Open Reading choices. Try Largest text, More space, and each contrast option. Nothing in the questions or notes should change. Save the reading choices, close the page, reopen, and check they remain. Reset reading choices should affect only the display. A private library backup does not include display settings.

## A failed save

In a controlled test, block browser writes after saving a fictional visit. Edit the title. Check the unsaved message, keep the page open, and choose Help me recover my notes → I cannot save or copies conflict → Back up this open draft. The downloaded individual backup should contain the latest title even though the older saved visit does not. Never label this failure as a successful save.

## Damaged data or no remaining copy

Try a deliberately invalid JSON file. The app should report the error without replacing anything. Try an unsupported newer-format file; it should also be refused. Supported old files are restored with the normal preview.

If saved browser data itself is unreadable, first download the unreadable data before considering a confirmed reset. If the browser data was cleared and there is no downloaded backup, the guide should plainly say it cannot recover the notes. Do not invent a cloud copy.

## Install and open separately

Installation is optional. Where the browser offers it, install the app, choose standalone opening if the browser asks, and reopen it while offline after setup. The same saved notes should be available. Do not assume installation creates a backup. In the automated check, full desktop Chromium is installed into a temporary test profile; actual standalone mode is observed rather than forced through a CSS-media simulation. This is not an Android or iOS home-screen check.
