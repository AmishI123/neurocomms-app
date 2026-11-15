# My Visit Notes

## Web checks passed; native work active

The [after-visit goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-AFTER-REVIEW.md) connects clear outcome labels, private answer notes, editable next steps and an exact after-visit review. Earlier tests missed a failure when saving “Partly answered.” That failure is corrected: all 288 source checks pass, and the expanded extracted-app workflow directly verifies the saved outcome, private-note exclusion and offline reopening. Read [A1–A7 requirements](after-review-PRD.md), [presentation](after-review-presentation.html), [plain-language help](after-review-help.html) and [acceptance evidence](after-review-acceptance-audit.md). An archive is approved only when its [manifest](releases/manifest.json) and passing [verification receipt](releases/verification.json) have matching archive hashes.

The [Android and iOS goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES-NATIVE.md) is active. See [current mobile evidence and limits](../../my-visit-notes-mobile/progress.md). Android compilation and packaged-file checks have passed; real native journeys and iOS compilation are not yet verified. Earlier milestone descriptions below are historical, not current release approval.

## Saved follow-up drafts — engineering release

Messages and progress entries can now be saved privately by choice and reopened from Home, including offline after setup. Saving a draft does not send anything or record progress. Later edits need another explicit save. Saved drafts are separate from visits and preparation; deleting one does not delete the others. Structured draft backups preserve fields, while full device transfer carries saved drafts with their source visits. Unsaved editor changes are not transferred automatically.

Read [D1–D7 requirements](drafts-PRD.md), [twelve fictional journeys](drafts-walkthroughs.md), [the executive/conference presentation](drafts-presentation.html) and [acceptance evidence](drafts-acceptance-audit.md). All 250 current-source checks and the 195-file extracted-release workflow passed. Download [the release](releases/my-visit-notes.tar.gz); its [manifest](releases/manifest.json) and [verification](releases/verification.json) must have matching archive hashes. Current formats are collection 7, transfer file 2, shell v12 and unchanged visit format 3. The target remains the shared desktop/mobile web app; native Android/iOS packaging is deferred. Earlier milestone descriptions below are historical, including their format and test counts.

## Previous milestone: one clear appointment journey

Home separates starting, continuing and following up. Returning Home hides the visit without replacing its in-memory work. Saved lists open only by choice. Tools and settings keeps recovery, transfer, reading choices and offline setup below the current task.

Unfinished preparation, messages and progress entries have Home return controls. Temporary messages and progress drafts last only in this page; copy/download before closing. They are not included in transfer files. Creating another draft or discarding one asks first. Existing save conflicts still apply. Review shows unfinished counts and honest save status without marking items done.

Read the [journey requirements](journey-PRD.md), [twelve fictional journeys](journey-walkthroughs.md), [executive/conference presentation](journey-presentation.html) and [acceptance status](journey-acceptance-audit.md). All 219 current-source checks and the 178-file extracted-package verification passed. Download [the release](releases/my-visit-notes.tar.gz); its exact identity is in the matching [manifest](releases/manifest.json) and [verification](releases/verification.json). Earlier completed-release descriptions below are historical.

## Show chosen words during a conversation

Open a visit and choose **Choose words for conversation view**. Select questions and optional editable requests, preview them, then show one at a time. Hide or Escape removes the words without exposing the workspace. Leaving asks before returning to private notes or review. This is a limited display, not a lock on an unlocked device.

Saved visits keep the last successfully saved question position. Display selections and edited session requests do not survive page closure. Failed saves are reported on pause and exit. No answers are marked automatically and personal answer notes stay out of the display.

Read the [requirements](conversation-PRD.md), [ten fictional journeys](conversation-walkthroughs.md), [executive/talk presentation](conversation-presentation.html) and [acceptance status](conversation-acceptance-audit.md). All 207 current-source checks and the 165-file extracted-release verification passed. Earlier release descriptions below are historical.

## Move to another device

Open **Move to another device → Open device transfer**. One unencrypted private file can carry saved visits, follow-up history, saved preparation and its results, saved communication requests and focus. Optionally include current reading choices. If you have unsaved visit or preparation work, choose explicitly whether to include it or leave it out. Downloading does not save that work on this browser.

On the receiving browser, select the file and review what will be added or kept separately. Expand a record to inspect its private contents; different local and incoming versions are shown separately. Nothing is replaced automatically. Incoming focus and reading choices start unchecked. Notes save first, then optional reading settings; a settings failure can be retried without importing notes again.

Included unsaved visits are retained inside separate saved preparation copies. **Open transferred draft** opens one as a temporary visit, not an automatically saved visit. Included unsaved preparation becomes a separate saved preparation. Opening transferred work uses the usual warning before replacing an unfinished local draft.

Transfer works offline once the app files are ready. Transfer files have a 20 MiB limit. They exclude recovery history and recently removed objects; recover wanted content first. Preparation copies can still contain earlier words. Temporary message drafts are not included—copy or download those in the follow-up tool. Files are not encrypted and there is no cloud recovery or automatic syncing.

The browser records which exact files were restored using file fingerprints and item identifiers, without duplicate wording. These records remain after deleting notes to avoid recreating deleted content from the same file. **Forget previously restored files** separately erases those identifiers after a warning. It does not erase notes or downloaded files; importing an old file afterward may bring back deleted records.

Read the [transfer requirements](transfer-PRD.md), [ten fictional journeys](transfer-walkthroughs.md), [executive/talk presentation](transfer-presentation.html) and [acceptance status](transfer-acceptance-audit.md). Current collection format is 6, visits remain format 3, and the offline shell is v9. Earlier release descriptions below are background.

## Know what still needs doing

Open **What still needs doing** to review unfinished questions and next steps across saved visits. Unsaved drafts and results kept only inside preparation are not included. Choose one focus if helpful; the app does not rank importance or send reminders.

Open an item to record To do, Contacted, Waiting for reply, Done or No longer needed. For questions, Done means Answered. Optional dates and private notes stay in the latest 50 events per item. Earlier events are dropped when that limit is reached. State changes through the original visit screens are recorded too.

Select items to prepare an editable message or call note. Titles, dates and contacts are included only by choice. Review the exact text before copying or downloading. Messages are temporary: keep your copy before closing. Nothing is sent, and export never marks an item contacted.

Select unresolved items to prepare another visit. Copies start fresh, without answer notes or follow-up history. They keep source titles/dates and links when the original is available; original and copy change independently. Deleting the source does not erase this separate source context.

Full visit/library backups contain private follow-up history and copied-source context, but not recovery history or device-local focus. Preparation backups also retain this content in embedded visit copies. Keep all full backups private. Supported older files remain readable; new files are not intended for older app versions.

See [detailed requirements](followup-PRD.md), [fictional journeys](followup-walkthroughs.md), [executive/talk presentation](followup-presentation.html) and [acceptance status](followup-acceptance-audit.md). The follow-up release used collection 5, visit 3 and offline shell v8. The current transfer formats are described above.

**Fix a mistake** lets you review removed items, earlier wording and additions before changing selected content. Recovery copies may contain private notes. They remain for up to seven days, limited to the latest 100 changes; expired stored copies are cleaned on the next successful write. You can erase them now without deleting current notes. Temporary draft history stays only in the page until you save the visit.

Use **Remove to recovery** for a recoverable saved visit or preparation removal. **Delete permanently** removes that saved object and its recovery records. Other preparation copies and downloaded files are separate. Backups contain current content, not recovery history; recover needed content first. See [recovery requirements](recovery-PRD.md), [walkthroughs](recovery-walkthroughs.md), [presentation](recovery-presentation.html) and [acceptance audit](recovery-acceptance-audit.md).

The save-and-resume extension lets you explicitly keep named preparation, return offline, and reopen completed results without repeating additions. Later preparation edits require another save. Preparation has its own private backup, separate from visit backups. See [the requirements](resume-PRD.md), [fictional walkthroughs](resume-walkthroughs.md), and [executive presentation](executive-presentation.html).

Prepare questions, use them during a routine appointment, and review what still needs asking.

This version adds Bring existing notes: paste or open a UTF-8 .txt file, choose passages, review matches, and add them to a new or existing visit. Source text and unfinished selections stay only in the open page unless you explicitly save preparation. They are not in visit backups. The [detailed requirements](existing-notes-PRD.md), [fictional walkthroughs](existing-notes-walkthroughs.md) and [executive presentation](executive-presentation.html) explain the flow. Reading choices, guided recovery, optional installation and selective preparation for another appointment remain available.

From `/home/mehta/neuro-divergent`, or from the root folder created by extracting the release archive, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://localhost:8765/product-specs/my-visit-notes/`.

For a shorter launch from this app folder, run `node serve-local.mjs`. It serves
only this app on `127.0.0.1:8765`, does not publish it to the network, and keeps
browser data in the browser profile. Use `node serve-local.mjs --port=9000` if
the default port is already in use.

The app uses browser modules and an offline worker. Serve it through localhost or HTTPS; double-clicking its HTML file is not a supported launch method.

## Use it

Choose Prepare my visit, Open a saved visit, or Try a fictional example. Reading choices and recovery tools are outside the main working area. Saved visits and recovery contains the saved list and a help guide. Open its Backup files and data controls section for file import, library download, reload, and confirmed deletion.

Start blank or try the labelled fictional example. Add your questions. Optionally choose requests such as “Please give me time.” During the visit, move freely between questions; mark an answer only when you choose. Afterward, choose the exact questions and notes to include in a summary.

Work is temporary until you choose Save on this device. Saving then continues automatically for that visit. Saved visits remain until deleted or removed by the browser. Open them through Saved visits and recovery. New visit does not remove older saved visits.

Private preparation notes never appear in a shared summary. A full backup includes them and must be kept privately. Download the backup to recover if browser data is lost; restore validates it and opens a new unsaved draft. The app has no account or cloud recovery.

Your sharing selections stay in place while moving between screens in the same visit. If you edit or remove a communication request, choose the outgoing requests again before sharing. Switching to a different visit starts a new set of sharing selections.

Delete this visit removes the current saved visit and open draft after confirmation. Clear all removes all saved visits. To remove only fictional sample data, open that saved sample and use Delete this visit. Cancelling confirmation leaves content unchanged. There is no undo after permanent deletion.

If another tab changes saved data, writing stops. Download your current draft if needed, then reload saved visits to work from the new state. Do not rely on this browser to keep content private from other people using the same device.

## Between appointments

On After the visit, add next steps in your own words. Each has an optional date/contact and To do, Done, or No longer needed state. Dates do not trigger reminders or overdue warnings. Select each next step separately if you want its text, state, date, and contact included in a summary.

Use Saved visits and recovery to search titles, dates, questions, and next steps. Private preparation and answer notes are not searched. Opening or searching a saved visit does not change it.

Choose Prepare another visit from a saved entry. Nothing is checked by default. Select the questions and next steps you want, inspect the preview, and create a new draft. Copied questions start Open; copied steps start To do. Their dates and contacts are shown before copying. Private notes, answer notes, and communication requests are not copied. The earlier visit stays unchanged. Cancel to back up unsaved work before replacing your open draft.

On What helps, explicitly select and save requests for future visits. Choose saved requests to add selected text to a later visit. Saving, applying, and sharing a request are separate choices. Clear saved requests removes reusable text, not copies already inside visits.

## Library backups and older versions

Download saved library includes all saved visits, private notes, and saved communication requests. It does not include preparation, an unsaved draft or edits that failed to save. Download private preparation backups separately. Download a full backup of the open visit separately when needed. Both file types are unencrypted; keep them privately. Imports are limited to 10 MB.

Library import previews what will be added or skipped. Exact repeat visits are skipped. A matching identifier with different content is imported as a separate copy, without replacing the existing record. The open draft remains unchanged. If saved data changes while the preview is open, cancel and select the file again.

The new version reads older visits and individual backups. Opening an old visit does not rewrite it. The next saving action upgrades the format. Older app versions cannot save that new format; close old app tabs after saving rather than trying their damaged-data reset.

## Offline use

Wait for “Offline app files are ready” after the first connected load. Core actions then use cached files. Updates take effect after old app tabs close. The first version uses plain text; there is no speech output or automated medical advice.

The help page, reading choices, manifest and icons are also cached. Offline status and downloaded-update messages remain visible without opening an advanced section. Close old app tabs only after saving or backing up; updates do not force a reload.

## Reading and installation

Reading choices offers text size, spacing, and contrast options. They change the display, not your words. Save reading choices on this device to keep them after closing. Reset affects only display settings. They are separate from visit/library backups.

Installation is optional. Open Offline use and installation for guidance. If your browser provides an install prompt, an Install this app button appears. Otherwise use the browser's own Install app or Add to Home Screen option if offered, or keep using the browser page. Installation is not a backup and does not add an account.

The automated install test uses full desktop Chromium in temporary test folders, including actual standalone launch while offline. It is not a physical Android or iOS install test. Phone-sized screens and reduced typing space are emulated. A real phone needs a reachable HTTPS address: localhost on the phone refers to the phone itself, not this development computer. This release does not publish a public site.

## If something goes wrong

Help me recover my notes explains how to find saved visits, protect a draft that failed to save, restore an older backup, keep conflicting copies separately, or download unreadable saved data before an explicit reset. It does not remove anything just by choosing a help topic.

A Temporary message means work is only on this open page. Saved on this device means the latest edit was written. Changes not saved means keep the page open and download an individual backup before reloading. Phone browsers may close without showing a warning. If both browser data and all backup copies are gone, the app cannot recover the notes; it has no server copy. [Offline help](help.html) explains each recovery branch.

## Project documents

- [Product requirements](PRD.md)
- [Reuse and product decision](decision-record.md)
- [End-to-end goal](../../NEXT-MEATY-GOAL-MY-VISIT-NOTES.md)
- [Build review and screenshots](review.html)
- [Checks and commands](verification.md)
- [User-review materials](research/review-plan.md)
- [Decision report](decision-report.md)

If saved storage is damaged, open Saved visits and recovery. Recover from damaged storage lets you download the unreadable data before explicitly clearing that saved collection. Your open draft stays available. Downloaded recovery data may contain private notes.

Participant review is deferred at the user's request; this release is checked through software tests and fictional examples. Usefulness is untested until intended users compare the app with their existing method. Engineering and participant-review results must remain distinct.

The extracted copy runs without installing packages. Its review page's archive/manifest download links refer to the original release folder; the archive does not contain another copy of itself. Running the development test suite requires the parent project's Playwright installation.
