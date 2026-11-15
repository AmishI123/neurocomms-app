# Prepare the next appointment

Status: engineering delivery complete. N1–N7 are covered by [the acceptance audit](next-appointment-acceptance-audit.md): 271 current-source checks and the 209-file extracted-release workflow passed. User benefit and physical-device accessibility remain unverified.

## Existing behavior and missing connection

The previous app already copies selected questions/next steps and retains their source references. It has question ordering, communication requests, saved visits, offline use, transfer, conversation view and follow-up. The new work connects those capabilities with deliberate next-appointment selection, a short pre-visit plan and source inspection. It does not create another kind of saved visit or a second question-status system.

## N1 — Choose earlier work

Provide an understandable entry from Home and the completed-visit journey. Show a deliberate list of previous saved visits, not private titles on Home itself. Choosing one shows unfinished questions and next steps with current states, optional dates and contacts. Start with nothing selected. Closed items can be revealed deliberately. Empty and no-remaining-work states explain how to start fresh. Returning or cancelling must not replace the current visit.

## N2 — Keep control of what carries over

Questions, next steps and communication requests require explicit selection. Preview exactly what will be copied before creating the new visit. Question copies start Open; next steps start To do. Copies get new item identities and retain source visit/item references. Private preparation notes, personal answer notes and follow-up history do not carry over. Requests are independent editable copies, never automatically selected for later sharing. Duplicate item choices are rejected; repeated confirmation creates at most one new working visit.

Capture the source version used for selection. If the saved source changes or disappears before confirmation, do not create an outdated plan silently: keep the choices visible, explain the change and require reviewing the source again. Creation must not write to the source or to local storage. Clearly warn before replacing unsaved open work and allow cancellation. The existing carry-forward routes remain supported.

## N3 — Make a usable new plan

Use the existing visit editor to change copied wording, add new questions, remove unwanted items, move questions up/down, edit communication requests and enter an optional title/date. Explain that the first question is what the person chose to discuss first, not a medical ranking. Next steps retain selected dates/contacts until edited. Editing copies never edits the original. Avoid automatic rewriting or summarizing.

Moving a question resets the visit's starting position to the first question in the new order. Save that position with the visit so ordinary visit mode and a conversation containing that question both begin there after reopening. Later movement during a conversation still keeps the person's saved place.

## N4 — Review exact words before the appointment

Provide a short-plan preview from preparation: title/date, questions in their chosen order, deliberately visible communication requests and next steps with their dates/contacts. Explain what is included before exporting. Exclude private preparation notes, answer notes, history and copied-source titles/dates. Keep literal text and line breaks; render text safely. Copy/download/print operate on the exact preview and do not save, send, answer or mark contacted. Cancellation returns to the unchanged editor. Empty plans and failed clipboard writes have clear feedback. Nothing is shown in conversation view automatically.

## N5 — Save, interrupt, return and transfer

The new plan is a normal temporary visit until explicit save consent. Existing visit changes then save automatically; report failures honestly. Support full backup, saved-library backup and device transfer without a new storage island. Saved plans survive reload and complete offline restart after setup. Preserve question order, requests, next steps and source references. Different transferred copies remain separate and link to the correct transferred source version. Old files remain readable. Queued saves must not capture a replacement visit; failed writes retain working content. Do not claim unsaved selection dialogs survive browser closure.

## N6 — Inspect where an item came from

For a copied question or next step, offer a deliberate source-context action. Show the captured source title/date and explain that original and copy change independently. Resolve an explicit local source mapping first, including an explicit missing/null mapping. Never attach a missing source to a similar item or a same-ID unrelated record. Show current source wording/state only after choosing inspection; never automatically show the source's private answer or history. If source wording differs, identify it as current wording, not the exact words originally copied. If unavailable, retain the captured context and explain the limit. Inspection is read-only and must not replace the current plan or leak source context into exported plans.

## N7 — Complete journey and evidence

Use the saved plan in the existing chosen-word conversation flow, pause/resume, return to private notes, record answers/next steps and review remaining work. Both appointments remain separately editable; no automatic closing of their linked items. Deliver twelve fictional end-to-end journeys, a twelve-or-more-section executive/conference HTML presentation with notes and real screenshots, help, an acceptance map and a downloadable verified release.

New tests must cover N1–N6 plus a complete two-appointment journey, source changes/deletion, different transfer versions, privacy, repeated confirmation, cancellation, failed writes, offline restart, keyboard, long content, 320px and enlarged layouts. Retain the previous 250 checks and source matching; add actual new counts after tests exist. Verify the extracted package, all HTML documents/links/images, file hashes and identical rebuilding. Inspect rendered screens. Native packaging, physical-device/screen-reader testing and usefulness remain unverified.
