# Next meaty end-to-end goal

## Communication-access card: PRD, build, and tested local release

Build the first product from the opportunity atlas: a private communication-access card that a person can create and control themselves.

The card explains what helps communication in a particular situation. It may say, for example, “Please give me extra time to answer,” “You can ask me to write or type,” “Do not assume silence means yes,” or “Please speak directly to me.” It must not diagnose the person, guess their feelings, or claim that one communication method works all the time.

The product is a practical access tool, not a medical record, behaviour tracker, therapy product, compliance tool, or replacement for AAC, speech, sign, writing, typing, gestures, or human support.

## Why this is the first build

It addresses a clear access problem across several areas in the atlas while keeping the first implementation small and testable. It can be useful in healthcare, school, work, travel, public services, and everyday interactions. The core version can work locally without an account or server database, which reduces privacy risk.

## Definition of done

The work is complete only when all of the following exist:

- a plain-English PRD that explains the user, problem, scope, user flows, requirements, data rules, accessibility requirements, risks, non-goals, and acceptance criteria;
- a working browser application under `product-specs/communication-access-card/`;
- a person can create a card without an account;
- a person can add, remove, reorder, and edit communication preferences in everyday language;
- a person can choose which sections appear on the final card;
- a person can preview the card as another person will see it;
- a person can print the card and export it as a self-contained HTML file or text file;
- a person can save and reopen the card locally on the same device;
- a person can clear all saved data;
- the core editor and preview work without an internet connection after the page is loaded;
- the product works with keyboard navigation, visible focus, screen readers, zoom, and small screens;
- the product does not require a diagnosis, account, subscription, cloud sync, or caregiver approval;
- sharing is an intentional user action and the app clearly shows what will be shared;
- no data is sent to an external service;
- no automatic diagnosis, emotion, consent, preference, or ability inference exists in the code;
- automated checks cover the core flows, privacy boundary, persistence, export, and accessibility basics;
- the product is served over a local HTTP URL and the URL is included in the final handoff;
- the PRD, source code, tests, and verification notes are packaged together.

## First release scope

### In scope

1. Create a card with a title and optional name or preferred identifier.
2. Add communication statements from editable templates or from scratch.
3. Group statements into sections such as:
   - How to get my attention;
   - How I may communicate;
   - What helps me understand;
   - Time and turn-taking;
   - What to do if communication breaks down;
   - Things I do not want assumed;
   - How to confirm meaning;
   - My chosen contact or support information.
4. Mark each statement as visible or hidden from the shared card.
5. Reorder statements.
6. Preview a large-print card and a compact card.
7. Print with a clean print stylesheet.
8. Export a self-contained HTML card and plain text card.
9. Save locally and restore locally.
10. Delete all saved card data.
11. Start from a blank card or a clearly labelled example card.
12. Show a privacy summary before export or sharing.

### Explicitly out of scope for release one

- accounts, cloud storage, analytics, advertising, or social sharing;
- background listening, speech analysis, eye tracking, emotion detection, or diagnosis;
- automatic generation of a card from a person’s behaviour or medical label;
- clinical notes, medication lists, emergency medical instructions, or treatment advice;
- replacing an AAC app or changing a person’s AAC vocabulary;
- caregiver-only editing or a hidden administrator mode;
- automatic translation without human review;
- public card directories;
- collecting names, diagnoses, health information, or usage telemetry by default.

## Core user flows

### Flow A: make a first card

1. The user opens the app and sees what it does, what it stores, and what it does not do.
2. The user chooses “Start a blank card” or “Try an example.”
3. The user enters an optional title and optional identifier.
4. The user selects useful statements from templates or writes their own.
5. The user edits every statement in plain language.
6. The user hides anything they do not want to share.
7. The user previews the final card.
8. The user saves locally, prints, or exports.

### Flow B: use the card in a real interaction

1. The user opens the saved card or printed copy.
2. The other person reads the selected instructions.
3. The card reminds the other person to communicate directly with the user.
4. The user can revise, replace, or stop using the card at any time.

### Flow C: recover from a communication breakdown

1. The user or communication partner opens the “If communication breaks down” section.
2. The card offers only the instructions the user chose, such as waiting, rephrasing, writing, or asking one question at a time.
3. The card tells the partner to confirm meaning rather than treating a guess as correct.
4. The user remains the final authority over their message where they can participate.

### Flow D: inspect and remove data

1. The user opens privacy settings.
2. The app shows whether a card is saved on this device.
3. The user can export a copy or delete the saved card.
4. Delete removes the local record and gives a clear confirmation.

## Functional requirements

### Card editing

- The editor must use ordinary labels and instructions.
- Every statement must be editable after selection.
- A statement must be removable without deleting the whole section.
- The user must be able to add a custom statement.
- The user must be able to reorder statements with buttons; drag and drop may be an additional option but cannot be the only method.
- The user must be able to hide a statement without losing its text.
- Hidden statements must never appear in preview, print, or export.
- Empty sections must not appear on the shared card.
- The app must not require the user to select a diagnosis or explain why a statement applies.

### Preview and sharing

- Preview must show exactly what print and export will contain.
- The app must provide a large-print layout and a compact layout.
- The user must see a plain-language list of included sections before export.
- Export must be initiated by an explicit button.
- The exported file must contain only selected card content and the minimum app attribution needed for context.
- The app must warn the user that exported files can be copied by anyone who receives them.

### Local storage

- The app must save only after a clear user action or an explicitly enabled local autosave setting.
- The app must show when the card was last saved locally.
- The app must handle an empty, corrupt, or unavailable local record without crashing.
- Clear-data must remove the card and any local settings created by the app.
- The app must not make network requests for core functionality.

### Accessibility

- All controls must be keyboard reachable in a logical order.
- Focus must be visible.
- Every input must have a visible label.
- Status messages must be announced or otherwise available to assistive technology.
- Colour must not be the only way to show visible or hidden state.
- Text must remain usable at increased zoom and on a narrow screen.
- The card must have sufficient contrast and a print-friendly layout.
- The app must not assume speech, vision, hearing, fine motor control, literacy level, or a single input method.

## Data model

The first release should use a small local data structure:

```text
Card
  id
  title
  identifier
  layout
  sections[]
  createdAt
  updatedAt

Section
  id
  title
  sortOrder
  visible
  items[]

Item
  id
  text
  sortOrder
  visible
  source: template | custom
```

The data model must not contain diagnosis, inferred emotion, inferred ability, behavioural scores, audio recordings, eye-gaze data, or hidden partner notes.

## Acceptance checks

- A new user can create a useful card in under ten minutes without instructions from another person.
- A user can create a card entirely with a keyboard.
- A user can create a card without choosing a diagnosis.
- A user can make a statement private and verify that it is absent from preview, print, and export.
- A user can edit wording rather than being forced to accept a template.
- A user can reopen a locally saved card after refreshing the page.
- A user can delete the saved card and verify that it is gone after reopening the app.
- Exported HTML opens without the application or an internet connection.
- Printed output contains only visible content and has no editor controls.
- The app makes zero external network requests during editor, preview, save, delete, print, and export flows.
- The app never asks for a diagnosis, emotion, consent state, or reason for a communication preference.
- A screen-reader or keyboard user can identify every control and its state.
- The app remains usable at 320px width and at 200% zoom without horizontal scrolling.

## Research and usability work before wider release

- Review wording with autistic people, AAC users, people with Down syndrome, people with dyslexia, and people who communicate in more than one way.
- Test both self-authored cards and cards made with optional support from another person.
- Check whether templates accidentally sound like rules, deficits, medical instructions, or claims about everyone in a group.
- Test printed cards in healthcare, school, work, transport, and public-service contexts.
- Test whether users understand exactly what local saving and exporting mean.
- Test whether the card helps partners change their behaviour without making the user responsible for teaching every interaction.

## Build sequence

1. Inspect the existing repository and choose the smallest compatible web stack.
2. Write the detailed PRD and trace each major requirement to an acceptance check.
3. Build the local-only editor and data model.
4. Build preview, print, and export.
5. Add privacy controls, deletion, and failure handling.
6. Add accessibility states and responsive styling.
7. Add automated browser and unit-level checks.
8. Run manual keyboard and screen-reader-oriented checks.
9. Serve the product over HTTP and verify all core flows.
10. Document what works, what is untested, and what requires lived-experience review.

## Final handoff

The final response must include:

- the direct HTTP URL to the working product;
- the direct HTTP URL to the PRD;
- the local run command;
- a short list of completed requirements;
- test results;
- known limitations and unresolved safety questions;
- the next research or build decision.

