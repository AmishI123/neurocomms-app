# My Visit Notes: from one appointment to the next

## Outcome and boundary

Complete the appointment journey: prepare, use questions during the conversation, record personal next steps, return later, and deliberately carry chosen items into another visit. Build on the existing app. Participant sessions are not a prerequisite. Software checks and fictional examples establish behaviour, not benefit, demand, or medical outcomes.

## Required product work

1. Search saved visits by title, date, questions, and next steps. Show dates and counts of unanswered questions and unfinished actions. Merely opening or searching a saved visit must not write to storage.
2. Add editable next steps with a description, optional date and contact, and To do / Done / No longer needed states. Nothing is inferred from answer notes. No overdue warnings, scores, or automatic reminders.
3. Start a new visit from an earlier one using explicit selections and a preview. Give copied items new identifiers, reset questions to Open and actions to To do, and leave the source unchanged. Never copy private preparation or answer notes in this flow. Selected action dates and contacts must be visible in the preview.
4. Explicitly save reusable communication requests on this device. Offer them for later visits through selection and preview; never silently apply them or select them for shared summaries. Allow clearing saved preferences separately.
5. Keep individual backups and add a whole-library backup. Warn about private content and the fact that an unsaved draft is not part of the saved library. Validate imports before mutation, preview duplicates and conflicts, preserve existing visits and the current draft, and import only after confirmation. Repeat imports must not keep multiplying identical visits.
6. Read current v1 visits and backups safely; write the upgraded format only on an explicit saving action. Unknown or damaged data must remain recoverable, not be silently replaced. Old app tabs must not overwrite the newer format. Keep the existing locking, revision checks, queued-draft protections, and offline update rules.
7. Extend selected summaries to include only explicitly selected next steps. All output paths share the same previewed text. No private preparation notes enter summaries or carry-forward output.

## Required deliverables

- Updated plain-language PRD: screens, fields, persistence, sharing, migration, cancellation, and failure cases.
- Working app and safe upgrade from the current version.
- Fictional multiple-appointment walkthroughs, clearly labelled.
- Tests for every new flow, duplicates, conflicts, interrupted saves, offline return, private-content exclusion, old-backup compatibility, keyboard use, and narrow screens; retain the existing tests.
- Executive-level HTML presentation with the problem, full journey, real screenshots with fictional data, design decisions, results, and unknowns.
- Updated HTML build review, readable verification and decision reports, downloadable deterministic release, checksums, and start instructions.

## Completion audit

Map each requirement to direct source and runtime evidence. Required tests must pass against the delivered source. Verify the archive separately and run the extracted app. No participants, recruitment, public deployment, accounts, AI-generated advice, recording, caregiver portals, or diagnosis-specific versions are required or authorised by this goal.

Done means someone can prepare a visit, record their own next steps, close the app, return offline, and prepare another visit without losing information or unexpectedly sharing private notes. State untested access methods and devices explicitly.
