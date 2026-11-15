# One clear appointment journey

Status: delivered as an engineering release. All J1–J7 requirements passed the documented checks; see journey-acceptance-audit.md and the matching release manifest/verification. Usefulness for people remains unverified.

## Why this goal

The app has preparation, a conversation display, review, follow-up, recovery and transfer. Its main page puts several supporting tools above the current visit. This is an observed interface structure, not evidence from people using it. The goal is to connect existing capabilities and make their order and consequences clear.

## J1 — Home without private wording

Separate three purposes: start a visit, continue work, and follow up. Starting includes typing questions, bringing notes and an optional fictional example. Continuing includes saved visits and saved preparations, with counts or neutral empty messages rather than question text, source notes, titles or dates on initial load. Follow-up opens the existing unfinished-work tool explicitly. Do not automatically reopen the last visit after reload. If an open visit exists in memory, offer a clear return to it without changing its words or position.

## J2 — Focused workspace and reachable tools

Keep the visit steps, active task and save status before supporting explanations. Provide consistent Home and Tools and settings controls. Group recovery, transfer, reading choices and offline setup without removing any capability. Opening recovery from an error must reveal its target and focus it even when the tools group was closed. Returning home closes private lists, but does not delete their data. Reopening tools must not unexpectedly expose previously expanded private lists.

## J3 — Connected preparation

Starting with questions and bringing existing notes must lead to the same visit flow. Resuming preparation preserves source, chosen passages, destination and completion records. Show whether passages will enter the open visit, another saved visit or a new visit before confirmation. Never silently retarget an unfinished preparation merely because the person opened another visit. Keep existing replacement and conflict guards. Home should distinguish an unfinished visit from unfinished preparation; neither is automatically saved by navigation.

## J4 — Ready for the conversation

Provide a clear route from preparation to communication requests and the existing chosen-word preview. No automatic selection of private answer notes or communication messages. Preserve requests-only use and direct access to the fuller during-visit workspace. The conversation view remains a limited display, not a lock. Leaving it retains its deliberate private-return choice.

## J5 — Finish and return deliberately

After-visit review keeps the existing question states, personal notes and next steps. Offer a clear finish/return-home route that reports saved, saving, failed or temporary work accurately. Show unfinished work counts without deciding importance or automatically marking anything answered. The person may continue their open visit, open saved work or use cross-visit follow-up. Downloading is not equivalent to saving, and navigating home is not equivalent to closing the browser safely.

## J6 — Consistent navigation and preservation

Home is navigation, not replacement: retain in-memory visit edits, preparation and message drafts. Keep browser-close warnings for all unfinished work. Starting/replacing a visit still needs the existing explicit warning when appropriate. Back/return controls return to a known task and focus a heading or the originating control. Cancellation changes no content or save consent. A new tab's conflict is not dismissed by home navigation. Do not show a saved badge for a temporary draft. Keep a visible indication that unsaved work remains even while the workspace is hidden.

## J7 — Evidence and release

Add named whole-journey tests and current-source evidence. Cover no-data first use, return with saved data, empty lists, typed and imported preparation, resuming saved preparation, temporary visit return, unfinished message return, failed and waiting saves, conflicts, offline reload, keyboard focus, long wording, narrow/enlarged layouts and the conversation/private-review boundary. Existing capability tests must still exercise their original behavior through the new navigation. Update obsolete layout assertions to reflect the approved design rather than preserving a confusing layout to keep tests green.

Deliver ten or more fictional journeys, detailed executive/conference HTML with speaker notes and real screenshots, updated help, a requirement/evidence map, the full regression gate and an extracted-release journey. Do not claim user benefit, physical-phone behavior or screen-reader usability from automated browser checks.

## Design direction

Use a small shell module to arrange the existing tools and home groups. Keep visit records and save/restore rules in their existing modules. Add only session navigation state unless persisted data is genuinely required. Review every programmatic route to saved lists and recovery so hidden containers cannot strand a user. Avoid duplicating records or moving private wording onto the home screen.
