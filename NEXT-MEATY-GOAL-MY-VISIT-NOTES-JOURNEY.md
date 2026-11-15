# Make the whole app easy to use from first opening to the next appointment

Status: engineering delivery complete. All 219 current-source checks and the 178-file extracted-release journey passed. See product-specs/my-visit-notes/journey-acceptance-audit.md and the matching release manifest/verification. No participant benefit, physical-phone or screen-reader claim is made.

## Outcome

Someone can start or continue work, prepare for an appointment, show chosen words during it, record what happens next and return later without having to understand the app's separate tools.

## Required delivery

1. A home screen separating starting, continuing and following up, with useful empty states and no automatically exposed private wording.
2. A focused visit workspace. Put recovery, backups, transfer and settings in reachable places without lengthy explanations above the active task.
3. Connected preparation: type questions, bring existing notes or resume saved preparation. Clearly identify the destination before adding text and preserve unfinished work when switching paths.
4. A clear preparation-to-conversation transition using the existing exact-word preview and private-content boundary.
5. A useful finish: review unanswered questions and next steps, understand what is saved, deliberately choose what to continue and reopen without automatically exposing private wording.
6. Consistent navigation, focus, cancellation and save warnings across the complete journey. Home must not silently discard an open draft, unsaved preparation or a message draft.
7. Detailed plain-language requirements, fictional walkthroughs, executive/conference HTML with speaker notes, help, acceptance evidence and a verified downloadable release.

## Finish line

Test fresh start, returning visit, saved preparation, temporary work, interruption, storage failure, conflicting tabs, keyboard operation, narrow/enlarged views and offline return. Retest existing capabilities; update navigation in existing tests where the deliberate redesign changes the route, without weakening their assertions. Build and exercise an extracted package, inspect rendered screens/documents and map every requirement to evidence.

No accounts, clinical guidance, participant recruitment or new question-state system. Do not claim that a browser-tested redesign is proven easier for people. Physical devices and screen-reader use remain separate unless actually tested.
