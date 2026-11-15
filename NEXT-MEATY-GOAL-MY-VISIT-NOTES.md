# Next meaty end-to-end goal: build and evaluate My Visit Notes

## Scope amendment — 15 September 2026

The user has asked to move forward without participants. Finish this goal as an engineering release checked with fictional scenarios and software tests. Participant comparison is deferred, not a completion requirement. No recruitment, publication, or claim of proven user benefit is authorised by this change. This amendment replaces the earlier participant-dependent completion rule.

## The outcome

Build a small browser app that helps an adult prepare questions for a routine appointment, keep those questions visible during the conversation, and leave with a clear record of what was answered and what still needs asking.

Prepare a future comparison with the person's usual method, such as paper or a phone notes app. Conducting that comparison is outside this release; whether it helps people remains unknown.

The final deliverable is a working app, a repeatable set of engineering checks, an accessible review plan, and a decision report stating whether to continue, revise, or stop. Completing the code establishes that it works as specified. User review is needed to establish whether it is useful.

## 1. Who the first version is for

Start with autistic adults who already prepare notes for routine appointments but sometimes lose their place, need more time to answer, or leave with questions unasked. The app does not require a diagnosis or ask someone to prove eligibility.

The first design supports people who can use written questions independently or with help they choose. It must remain compatible with their existing ways of communicating. Do not claim this text-based first version meets every reading, language, motor, or communication need.

People with aphasia, Down syndrome, developmental language disorder, or other communication needs may benefit from related tools. Test those adaptations separately after the first flow has been reviewed.

## 2. A concrete example

A person writes three questions before a routine visit. The waiting room is noisy. Once the appointment starts, they remember only one question and have trouble finding the other two in a long note.

With My Visit Notes, they open the prepared visit, show a request such as “Please give me time” if useful, and work through one question at a time. They can jump to another question when the conversation changes. A question stays open until they explicitly mark it answered. At the end, they review what is still open and choose what to save or print.

This is a fictional example used to define the task. It is not a participant result.

## 3. Why this is the next product

The saved atlas describes barriers involving conversation pace, sensory conditions, expressing questions, and being understood. The project already has a communication-access card app with editing, preview, local saving, printing, and selected sharing.

My Visit Notes extends that starting point into a full task: prepare → use during the conversation → review afterward. The central question is whether keeping unanswered questions visible adds enough value beyond an ordinary card or notes app.

Use these project references:

- [Autism findings](product-specs/opportunity-atlas/autism.html).
- [Executive report and source links](product-specs/opportunity-atlas/presentation/executive-report.html#autism).
- [Existing communication-access card](product-specs/communication-access-card/index.html).
- [Existing card PRD](product-specs/communication-access-card/PRD.md).
- [Broader research and product goal](product-specs/opportunity-atlas/NEXT-MEATY-GOAL.md).

Check the exact supporting sources before publishing research claims. The current evidence supports a product idea to test; it does not establish demand or benefit for this app.

## 4. The complete first-version journey

### Screen 1: Prepare my visit

- Start with an empty visit or load a clearly labelled fictional example.
- Add an optional title and date. Neither is required to start.
- Add, edit, reorder, and remove questions. There is no fixed limit of three; test longer lists too.
- Provide optional private preparation notes in a separate, clearly labelled place.
- Show whether work is temporary, saved, or has changes that have not been saved.
- Let the person leave preparation and enter the conversation view as soon as one non-empty question exists.

### Screen 2: What helps me communicate

- Offer editable starting points such as “Please ask one question at a time,” “Written answers help,” and “Please give me time.”
- Allow custom wording and a choice to skip the whole screen.
- Let the person choose which requests are visible during this visit.
- Show an exact preview of what another person will see.
- Make private preparation notes absent from that preview and from the conversation display.

### Screen 3: During the visit

- Show the current question in large, adjustable text.
- Keep a clear way to open the full question list and jump to any question.
- Provide Previous, Next, Add question, and a return-to-preparation action.
- Keep separate question states: Open, Answered, and Ask later.
- Moving to the next question never marks the current one answered.
- Make marking a question answered reversible. An answer note is optional.
- Allow a short answer note, clearly labelled as the user's note and hidden from the large display until deliberately shown.
- Make the selected communication request easy to display and return from.
- Support stopping and reopening the same saved visit at the same question.
- Handle new questions and changes in order during the conversation.
- Keep open questions visible as neutral reminders, without countdowns, overdue warnings, or failure scores.

### Screen 4: After the visit

- Show Answered, Open, and Ask later as separate groups, preserving the user's order within each group.
- Let the person edit notes, change a question's state, or add a follow-up question.
- Label answer notes as personal notes; do not imply they have been confirmed by a clinician.
- Let the person choose questions, answer notes, and communication requests to include in a summary.
- Keep private preparation notes excluded from all outgoing summaries in version one.
- Preview the exact output before printing, copying, or downloading it.
- Offer save, start a new visit, delete this visit, and clear all saved visits with distinct labels.
- Preserve old saved visits when a new one is started. Confirm the choice before replacing unsaved work.

## 5. Behaviour and information rules

### Saving

Work starts in memory. The person can choose “Save on this device.” Once saving is enabled for that visit, subsequent changes save automatically and the screen reports their status. A failed save leaves the current draft usable and offers a download.

Store only a local visit identifier, optional title and date, questions and order, question state, personal answer notes, private preparation notes, selected communication requests, and the last open question. Use version information in the saved format so later updates can read or explain older records.

Version one keeps saved visits until the user deletes them or the browser removes them. Explain this at the save choice. Browser storage is not a private account or a guaranteed backup, especially on a shared device.

### Sharing and backup

Provide two visibly different actions:

1. **Share a summary:** chosen questions and approved notes only; private preparation notes are always excluded.
2. **Download a backup:** the complete visit, including private notes, for the user's own recovery. State that it contains private content before creating it.

If backup import is implemented, validate it, show which visit it contains, and ask before replacing existing work. Text inside a file must be treated as text, never executable page code. Importing a file must not automatically expose its private notes.

Saving and exporting must not send content to a product server. Printing, copying, or sharing creates a copy outside the app's control. Deleting the app's copy cannot remove copies held by someone else.

### Privacy and optional features

The first version has no accounts, cloud sync, analytics, appointment recording, remote AI calls, automatic question generation, or connection to medical records. These features are outside this milestone.

Speech output is not required for version one. If reused from existing code, check its actual privacy and offline behaviour before offering it or making promises about it.

The app does not offer medical advice, interpret symptoms, recommend treatment, determine consent, or handle emergencies. The goal is to keep the person's own questions and notes available.

### Access and comfort

The full flow must work with a keyboard and visible focus. Inputs need labels. Buttons need familiar words. Status must use text as well as colour. Text must remain usable at 200% zoom and at 320px width. Large text should wrap rather than be clipped.

Do not require a timed action, precise dragging, speech, or an explanation for pausing. Use buttons for reordering. Respect reduced-motion preferences. Test long questions, long notes, and different text directions if supported; record unsupported cases.

## 6. Work packages and required outputs

### A. Confirm the task and reuse plan

Inspect the existing card app and its tests. Identify which editing, privacy preview, print, and storage code can be reused, and which visit behaviours need new work. Prefer small shared components where that helps; preserve the existing card flow.

Write `product-specs/my-visit-notes/PRD.md` with the screen plan, exact fields, question states, saving rules, and acceptance checks. Add a short decision record explaining the intended user, the comparison with ordinary notes, and the limits of the saved evidence.

Done when the main behaviour can be implemented without guessing and the reuse decision names the actual files involved.

### B. Build the complete working flow

Create a standalone browser app under `product-specs/my-visit-notes/`. Implement preparation, communication requests, conversation view, post-visit review, saving, selected output, deletion, and recovery.

Choose a clear offline delivery method. If using a service worker, state that the first load must complete online and show when offline use is ready. Check the saved offline app after a restart and a version update. Do not silently claim a cache update succeeded.

Include fictional sample visits, a local run command, and instructions for clearing sample data. The app must also start empty.

Done when the whole journey works with real saved state, rather than only linked screen mockups.

### C. Check reliability, privacy, and access

Run the scenario set below. Keep machine-readable results and a short readable report. Check exported file contents directly; a preview screenshot alone does not prove that private content stayed out.

Test existing card functionality if shared code changes. Record the version, runtime, browser, command, and results. Separate known issues from passing checks.

Done when required scenarios pass and another person can repeat them.

### D. Prepare materials; defer participant sessions

Prepare an accessible invitation, consent explanation, fictional task script, feedback form, and data-deletion plan. Recruiting or contacting people requires a separate instruction; preparing materials is part of the build goal.

For an initial small review, propose five to eight autistic adults who already use appointment notes. This is a planning target, not a claim that the sample proves effectiveness. Allow participation with chosen communication support and without collecting medical histories. Use fictional routine visits before considering real appointments.

Have each person try comparable tasks with My Visit Notes and their usual method. Vary the order so everyone does not try the app second. Let participants use their normal aids, take breaks, stop, or decline to share content. Record any help from the reviewer. Report only sessions actually completed.

If participants are unavailable, finish the working app and review materials and label the release “engineering checks complete; usefulness untested.” Record participant review as deferred. The amended goal can finish when the engineering release requirements pass; this does not establish usefulness.

### E. Deliver the release and decision report

Create a review page with the product promise, screenshots of all four screens, test results, known limits, evidence status, and links to the app and PRD. Provide a reproducible release bundle with a checksum and clear start instructions.

Write a decision report after the available checks and review. Explain what worked, what failed, what participants said if sessions occurred, what should change, and why the project should continue, revise, or stop.

## 7. Acceptance scenarios

| ID | Scenario | Required result |
| --- | --- | --- |
| VN-01 | Prepare three questions and skip communication requests. | The conversation view opens without a diagnosis, name, date, or request being required. |
| VN-02 | Add, reorder, edit, and delete questions; test 20 questions and long text. | Content remains intact; order is stable; controls and text stay usable. |
| VN-03 | Jump from question one to question three. | Question one stays Open until explicitly changed. |
| VN-04 | Mark a question Answered by mistake. | Change it back to Open without losing an answer note. |
| VN-05 | Add a new question during the conversation. | It joins the list without changing other states or losing the current place. |
| VN-06 | Show a communication request and return. | The same current question remains available; private notes are never shown. |
| VN-07 | Save, close, and reopen a visit. | Restore questions, order, states, selected requests, notes, and current place. |
| VN-08 | Leave changes unsaved, or block storage. | Status is truthful; the draft remains usable while open and can be downloaded. |
| VN-09 | Open damaged saved data or an unsupported backup. | Explain the problem; do not crash or overwrite intact visits. |
| VN-10 | Add distinctive private text and export a summary. | Private text is absent from print, copy, and every summary file. |
| VN-11 | Download and, if supported, restore a full backup. | Explain that private notes are included; validate restoration without silent replacement. |
| VN-12 | Delete one visit, then clear all. | Remove the intended records only; test confirmation, cancellation, and any undo. |
| VN-13 | Reopen offline after the stated setup. | All promised core actions work; no draft is lost because the network is absent. |
| VN-14 | Update the app with saved visits present. | Saved content survives or an explicit recovery path is offered before destructive changes. |
| VN-15 | Complete the flow by keyboard, at 320px width, and at 200% zoom. | Controls are reachable, focus is visible, and text is readable without page-level horizontal scrolling. |
| VN-16 | Double-click save/export and cancel a preview. | Content remains consistent and cancellation returns to the same draft. |
| VN-17 | Open the same saved visit in two tabs and edit both. | Detect or prevent conflicting writes; do not silently discard newer changes. |
| VN-18 | Watch network traffic through the full flow. | No visit content, private notes, analytics, or remote-model requests leave the app. |
| VN-19 | Review a visit with answered and unanswered questions. | Correct groups appear, and the person chooses exactly what the summary includes. |
| VN-20 | Run the existing card checks after shared-code changes. | The earlier card's editing, preview, privacy, and export behaviour still passes. |

These are proposed checks. None should be marked passed before being run against the implementation.

## 8. How to judge whether the product helps

For each review task, record:

- Whether the person could find and ask the questions they intended.
- Whether any intended question was lost, wrongly marked answered, or hard to return to.
- Whether they could add a question or correct a mistake during the conversation.
- Whether they could see what remained unanswered afterward.
- Whether private content stayed out of the shared summary.
- How much preparation and reviewer help were needed.
- How the person described effort and whether they preferred the app, their usual method, or neither.

Time can be recorded for preparation if the person agrees, but speed is not the main measure of a successful conversation. Report individual patterns and actual session counts. Do not turn a small review into a population percentage or a clinical claim.

Before sessions begin, write down what will count as a useful improvement for each chosen task. Use the same task definition for the comparison method. A reviewer should not change success criteria afterward to favour the app.

## 9. Decision rules

**Release decision now:** complete the engineering release when required software checks pass and the documentation states its limits. Do not treat this as evidence of demand or benefit.

**Future product decision:** continue wider development if actual reviews show a specific benefit over the current method that people consider worth the effort. Describe who benefited and in which task. The following revise/stop rules apply when that evidence becomes available.

**Revise:** people find the idea helpful but encounter confusing steps, hard-to-find controls, excess preparation, or poor handling of changing questions.

**Stop or change direction:** ordinary notes or paper work as well with less effort, people do not want a separate app, or the main obstacle is the appointment setting and the product does not meaningfully help.

Any unintended exposure of private content or silent loss of saved work prevents a release until corrected. A lack of participant evidence means usefulness remains untested, even if engineering checks pass.

## 10. Definition of done and handoff

The engineering release is complete when the app, PRD, repeatable checks, review page, release bundle, and accessible user-review materials are available; required checks pass; and remaining limits are visible.

Under the user's scope amendment, this end-to-end goal is complete at the engineering release endpoint above. The decision report must separate the release decision from the untested question of user benefit. Participant comparison remains a possible future task, not a blocker.

Build and review files belong under `product-specs/my-visit-notes/`. Link the app and review page from the product index when they exist. Begin with the existing card code and the PRD; implement the question-state and privacy rules before adding optional features.

Implementation was subsequently authorised and completed. This goal does not authorise recruitment, public deployment, or submission of research.
