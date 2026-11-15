# Conversation view — product requirements

Status: engineering delivery complete. All 207 current-source checks and the 165-file extracted-release verification passed. See conversation-acceptance-audit.md and the matching release manifest/verification for the exact archive.

## What this is for

During an appointment someone may want another person to read a question, may need time to respond, or may want to return to a personal note. Today these actions sit beside a much larger workspace. The new view will show a small, chosen part of that workspace. It is an engineering proposal, not a finding from participant testing.

## C1 — Choose and preview

Offer the new view from the visit workflow without requiring a saved visit. List nonempty questions and editable communication requests. Start selections unchecked. Provide optional editable examples: “Please give me a moment”, “Please explain that another way”, and “Please write that down”. Examples are not automatically selected or saved as reusable preferences. Allow a requests-only display. Require at least one chosen nonempty item. Preview the exact text and order before entering. Cancel changes neither visit wording nor question state. Explain the unlocked-device limitation before entry.

## C2 — Show only selected wording

Show one selected question or request with large wrapping text and clearly labelled controls. Keep private preparation notes, answer notes, library content, titles, source details and other questions outside the conversation view. Background content must be hidden from keyboard navigation and the accessibility tree, not merely covered visually. Do not expose private content through print output while in this view. Do not inject note wording as HTML. This is a display boundary, not protection against browser tools, device access, screenshots or someone deliberately leaving the view.

## C3 — Ask for what helps

Make selected requests reachable without losing the current question. A request temporarily replaces the question; returning restores it. Do not read anything aloud automatically. Do not interpret silence or navigation as an answer. Preserve exact user wording. No diagnosis is needed or inferred.

## C4 — Interrupt and resume

Hide replaces the shown words with a neutral screen. Resume deliberately restores the same item. Returning from a backgrounded tab must not automatically reveal words: pause the display when the page becomes hidden. A browser reload returns to the ordinary app, never an automatically exposed conversation screen. For saved visits, reuse the existing saved current-question field; for temporary visits, state that closing can lose progress. Do not claim the conversation selection or edited session messages survive reload unless they are actually stored. Saving failure must not close the conversation or erase its in-memory place.

## C5 — Return to private work

Leaving the conversation view requires an explicit choice explaining that private workspace content will become visible. Escape must hide the message, not immediately expose the workspace. Return to the corresponding question for private answer entry, with the personal-note section opened only after that deliberate choice. Keep the selection in memory for a deliberate return to the conversation. Changes to visit identity or selected wording require a fresh preview; never show a stale snapshot as if it is the current question. Do not copy answer notes into the display.

## C6 — Finish the visit

Provide a deliberate exit to the existing after-visit review. Keep unanswered questions, personal notes and next steps in their existing records. No second question-state system, no automatic answered marks, no automatic summary selection of private notes. Existing summary and sharing choices remain authoritative.

## C7 — Access, evidence and release

Use native buttons and labelled choices, a predictable focus order and visible focus. Check keyboard-only operation, 320px width, enlarged text, long unbroken wording and all existing contrast choices. Confirm offline availability after initial setup. Test temporary and saved visits, interrupted sessions, storage failure, concurrent edits, selection cancellation and literal HTML-like wording. Record what was tested, what failed and what remains unverified. No screen-reader certification, medical benefit or physical-device claim from automated browser tests.

Deliver fictional full journeys, detailed acceptance evidence, help text, an executive/conference HTML presentation with speaker notes and real screenshots, and an extracted-release check that exercises the new journey. Existing app checks must still pass against current sources.

## Implementation direction

Keep selection and pause state in a dedicated conversation module. Pass only a minimal selected-content snapshot to the display. Use a separate modal view whose background is inert and whose cancellation is controlled. Integrate current-question navigation and private return through app callbacks so saving uses the existing write queue and conflict handling. Add the module to offline assets and update the shell version. Do not change the saved collection format merely to hold a short-lived display session.

## Delivery evidence

Implementation, fourteen named browser checks, presentation and walkthroughs are delivered. The current-source regression gate, rendered-document inspection and extracted-release verification passed. The acceptance audit separates observed behavior from unverified physical-device, screen-reader and participant outcomes. No required engineering work remains for this goal.
