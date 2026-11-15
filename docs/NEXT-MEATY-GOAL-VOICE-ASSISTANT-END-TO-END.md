# Meaty end-to-end goal: review-first voice support

## Status

Ready for a dedicated implementation thread. This is an engineering goal for the one-week presentation sprint; it is not a human-study or clinical-validation goal.

## Objective

Build and verify a voice-assisted interaction inside Phrase Studio that lets a person move from spoken input to a user-reviewed, editable, saved, read-aloud, or privately exported communication artifact without automatic sharing or loss of control.

## One-sentence product promise

When typing is difficult or slow, the person can speak, see what was understood, correct it, choose bounded help if wanted, and decide what happens next.

## Complete end-to-end journey

`choose voice action` → `explicitly start microphone` → `speak` → `visible transcript` → `edit/correct` → `confirm intended text` → `optional bounded reply help` → `review candidate` → `read aloud, save, copy, or export` → `pause/resume or discard`

The same task must remain possible with touch and keyboard controls.

## User problems addressed

- Typing a full thought can add avoidable interaction load.
- A person may need to preserve their own wording while preparing communication.
- Speech recognition can be wrong, so the raw transcript cannot become an accepted message automatically.
- Reading generated text aloud can help rehearsal, but the person must be able to stop it immediately.
- A microphone or provider boundary can expose sensitive material if its state is unclear.

## Workstreams

### Voice interaction

- explicit start/stop/cancel;
- listening, processing, success, empty, denied, unsupported, and error states;
- editable transcript;
- retry without duplicate records;
- no raw-audio persistence.

### Read-aloud

- language, voice, and speed controls;
- stop, replay, and interruption;
- visible speaking state;
- text remains unchanged by speech controls.

### Bounded assistant handoff

- user chooses whether to request help;
- request preview/redaction follows the existing provider contract;
- suggestions are clearly labeled and editable;
- user accepts individual text deliberately;
- no automatic save, send, or share.

### Data and recovery

- transcript/draft state survives an intentional pause;
- cancellation does not create an accepted card;
- saved output remains in the existing local workspace model;
- backup/restore/erase semantics remain intact.

### Presentation

- fictional, short, repeatable voice demo;
- fallback path if microphone permission or browser speech support fails;
- architecture and privacy explanation;
- known limitations shown in the talk.

## Implementation checkpoints

1. Inspect the current speech/read-aloud implementation and document the real entry points.
2. Freeze the voice state model and event transitions.
3. Implement explicit input and transcript review.
4. Implement error, denial, unsupported, cancellation, and duplicate-completion handling.
5. Integrate read-aloud stop/replay without changing saved text.
6. Connect optional reviewed reply help through the existing provider boundary.
7. Add unit/contract/browser tests.
8. Run the full release audit and manual fictional demo.
9. Produce screenshots and a short demo script.
10. Merge only after the acceptance gates pass.

## Acceptance gates

### Functional

- Start voice input explicitly.
- Show a clear active-listening state.
- Stop and cancel immediately.
- Display and edit the transcript.
- Save only after user confirmation.
- Retry after no speech or recognition error.
- Read aloud and stop speech.
- Copy/save/export only through explicit user actions.

### Safety and privacy

- No always-on listening.
- No raw audio saved by default.
- No provider call from microphone activation or read-aloud.
- No automatic communication.
- No diagnosis, intent, emotion, consent, or ability inference.
- Typed/touch alternatives remain available.
- Sensitive data handling is explained in plain language.

### Recovery

- A paused draft can resume with its transcript and review status.
- A cancelled recognition attempt cannot become an accepted phrase.
- Repeated events do not duplicate cards or messages.
- Restore and erase continue to work for voice-derived text.

### Verification

- `npm test` passes, or the host-specific blocker is documented.
- `npm run beta:release-audit` passes.
- Voice-specific tests cover permission denial, unsupported API, no speech, recognition error, cancellation, duplicate completion, transcript editing, provider opt-in, and stop-speaking.
- A clean fictional demo can be repeated by another agent.

## Non-goals

- an always-on personal assistant;
- a conversational companion that speaks without a user request;
- automated appointment, school, or workplace communication;
- speech diagnosis or communication assessment;
- AAC replacement or device integration;
- production cloud speech infrastructure;
- a claim that voice is easier, more accurate, or more accessible for everyone.

## Evidence boundary

This goal tests software behavior and safety contracts. It does not prove voice usability, speech-recognition accuracy across populations, accessibility benefit, clinical value, educational value, or market demand. Those require appropriately reviewed human evaluation.

## Definition of done

The goal is complete when a fictional user can speak a short input, review and correct the transcript, optionally request bounded reply help, inspect the candidate, read it aloud or save/export it, stop any speech immediately, recover after interruption, and complete the same task without voice—and the repository contains passing tests, release-audit evidence, a demo script, and an honest limitations record.

## Handoff

The implementation thread must finish with:

- branch name and final commit;
- changed-file list;
- state/contract summary;
- test and audit output;
- screenshots or recording;
- browser/device support notes;
- unresolved issues;
- confirmation that no existing privacy or evidence boundaries were weakened.
