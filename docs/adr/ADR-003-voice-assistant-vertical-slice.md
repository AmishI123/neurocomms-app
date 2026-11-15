# ADR-003: Voice assistant vertical slice

## Status

Accepted for the one-week presentation sprint. This is a focused product extension of Phrase Studio, not a new standalone product.

## Context

Phrase Studio already contains local speech recognition/read-aloud controls, phrase selection, language and speed settings, stop-speaking behavior, and an optional provider boundary. The existing product direction is to help a person prepare, review, and use communication materials while retaining control.

Voice can reduce typing and interaction load, but it also introduces risks: accidental listening, transcription errors, unclear microphone state, unwanted disclosure, and generated language being mistaken for the user’s own words.

## Decision

Build one review-first voice workflow:

`choose voice action → explicit microphone start → speak → visible transcript → edit/confirm → optional bounded assistance → user chooses read/copy/save/export`

The voice slice must be useful in local/offline mode for speech input and read-aloud where the browser/device supports it. Provider-backed assistance remains optional, explicitly configured, redacted, and user-invoked.

## In scope

- voice entry into a Phrase Studio card or reply draft;
- visible listening, processing, success, and failure states;
- transcript editing before it becomes a card or draft;
- explicit stop/cancel controls;
- local read-aloud with selected language, voice, and speed;
- interruption of speech and replay;
- optional “Help me reply” after the user reviews the input;
- microphone permission guidance and privacy copy;
- keyboard/touch alternatives for every voice action;
- fictional demo path and contract tests.

## Out of scope

- always-on listening or background recording;
- silent microphone activation;
- automatic sending, posting, or sharing;
- emotion, intent, diagnosis, consent, or ability inference;
- replacing AAC, speech, signing, writing, or an existing communication system;
- storing raw audio by default;
- a hosted speech backend;
- claims of transcription accuracy, clinical value, or accessibility benefit without human evaluation.

## Safety and privacy invariants

1. The microphone starts only after an explicit user action.
2. The interface clearly indicates when listening is active.
3. The user can stop or cancel immediately.
4. Transcript text is editable before save, provider use, or export.
5. Raw audio is not persisted by the application.
6. Speech recognition and read-aloud remain local browser/device capabilities unless a separate, visible provider flow is deliberately invoked.
7. Provider requests are opt-in, redacted according to the existing boundary, and previewable where applicable.
8. No generated response is inserted or sent automatically.
9. Every voice action has a non-voice equivalent.

## Acceptance criteria

- A user can start, stop, cancel, and retry voice input.
- A user can correct a transcript before saving it.
- Unsupported speech recognition produces a clear fallback rather than a dead end.
- Read-aloud can be stopped and restarted without changing saved text.
- A provider is never contacted by microphone activation or read-aloud alone.
- The voice path works with fictional content in the Sunday demo.
- Existing non-voice Phrase Studio flows remain green.
- Tests cover permission denial, no speech, recognition error, cancellation, duplicate completion, provider opt-in, and transcript editing.

## Consequences

The voice thread should prefer a small, reliable vertical slice over a broad conversational agent. The final presentation can demonstrate voice as an additional access mode while preserving the product’s central promise: the person reviews and controls the output.

## Related records

- [`ADR-002`](ADR-002-product-direction-and-support.md)
- [`VOICE-AGENT-HANDOFF.md`](../VOICE-AGENT-HANDOFF.md)
- [`FRONTEND-AGENT-HANDOFF.md`](../FRONTEND-AGENT-HANDOFF.md)
