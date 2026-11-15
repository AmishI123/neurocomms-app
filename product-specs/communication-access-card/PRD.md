# Communication-access card — product requirements document

## 1. Product decision

Build a local-first web app that lets a person make a short card explaining what helps communication for them. The person chooses the words, the sections, and the audience. The app provides editable starting points, but it never decides what a person means or why they communicate in a particular way.

The first release is deliberately narrow: it creates a useful card, makes the selected content easy to read, and gives the person control over saving, printing, exporting, sharing, and deleting it.

## 2. The problem

In a conversation, a person may know what would help but have no quick way to explain it. The other person may interrupt, rush, speak indirectly, assume silence means agreement, or treat speech as the only valid communication. The cost is not just inconvenience: the person may lose access to healthcare, education, work, services, relationships, privacy, or a decision they wanted to make themselves.

A card can make a few chosen instructions visible before the interaction becomes difficult. It cannot force another person to listen, and it must not put the responsibility for every access failure onto the person using it.

## 3. Target users and use settings

Primary users are people who want to explain communication preferences or access needs in their own words. This includes people who use speech, writing, typing, AAC (augmentative and alternative communication), signs, gestures, or more than one method. A person may create the card alone or with optional support from someone they trust.

Likely settings include a healthcare visit, school or college, workplace, transport, public service, appointment, social situation, or an unfamiliar conversation.

The product does not require the user to name a diagnosis. It must not assume that people with the same diagnosis communicate in the same way.

## 4. Product principles

- The user is the author and final editor of shared content.
- A suggestion is never a fact about the user.
- Speech is one communication method, not the default measure of understanding.
- Silence, delay, movement, eye contact, or a device state is not interpreted as consent, emotion, intelligence, or preference.
- The user can hide, change, delete, print, export, or stop using the card.
- The app supports existing communication systems and does not replace them.
- Private data stays local by default.
- A card is an access aid, not a clinical record or emergency instruction.

## 5. Release-one user stories

1. As a person who communicates in more than one way, I can make a card without selecting a diagnosis.
2. As the card author, I can write my own sentences instead of accepting a fixed label.
3. As the card author, I can hide a sentence while keeping it available for later editing.
4. As the card author, I can see the exact content before I print, export, or share it.
5. As the card author, I can save the card on this device and delete it later.
6. As the card author, I can print a readable card without editor controls.
7. As the card author, I can export a self-contained HTML or text copy.
8. As a keyboard or assistive-technology user, I can complete the main flow without a mouse.
9. As a person who changes how I communicate across situations, I can revise the card at any time.

## 6. Main user flow

Open app → read the privacy boundary → start blank or load an example → write or edit statements → choose shown/hidden content → preview → save, print, export, or share → revise or delete later.

The example is content, not a prescription. The interface tells the user to edit it before sharing.

## 7. Functional requirements

### FR-01: Card identity

The app provides optional fields for a card title and name or identifier. It must work when both are blank or when the user uses a nickname.

### FR-02: Sections and statements

The app provides editable sections for getting attention, communication methods, understanding, turn-taking, breakdown recovery, and assumptions. The user can add a section, rename a section, add a statement, edit a statement, reorder sections and statements, hide content, and delete content.

### FR-03: Preview

The preview updates as content changes and shows only visible, non-empty sections and statements. It offers large-print and compact layouts. The preview contains a clear message that the information was chosen by the person sharing it.

### FR-04: Save and delete

The user can explicitly save to browser local storage. The app displays the saved state. The user can delete the saved card after confirmation. The app handles missing or malformed saved data without crashing.

### FR-05: Print and export

Print output contains only the card. HTML export is self-contained and opens without the app or an internet connection. Text export contains the visible card content. The app shows a sharing review before HTML export, text export, or share/copy.

### FR-06: Share or copy

The app uses the device share sheet only after the user chooses to continue. Where sharing is unavailable, it copies the selected text or downloads a text file. It never posts publicly or sends data to a product server.

### FR-07: Offline core

After the first load over HTTP, a service worker caches the app shell. Editor, preview, local save, deletion, print, and export do not need a network connection.

### FR-08: No inference

The code contains no classifier, background listener, emotion model, diagnosis selector, consent inference, behavioural score, or hidden partner note.

## 8. Accessibility requirements

- One logical heading structure and meaningful landmarks.
- Visible focus for every keyboard control.
- Labels for every input, textarea, select, and checkbox.
- Buttons use text or an accessible label; icon meaning is not colour-only.
- The shown/hidden state is written as text as well as represented by a checkbox.
- Dialog has a name, modal semantics, Escape and close actions, and focus return.
- Text remains usable at 200% zoom and 320px width.
- Print output has readable contrast and no controls.
- No feature depends on speech, hearing, eye gaze, colour perception, fine motor control, or a single literacy level.

## 9. Privacy and safety requirements

No external network request is needed for core use. The app stores only the card the user explicitly saves, in local storage. It does not collect analytics, accounts, diagnoses, health records, audio, video, device identifiers, or usage histories.

The app must explain that an exported file or printout can be copied by its recipient. The person must be able to inspect visible content before sharing. The product must not present its suggestions as medical, legal, emergency, or treatment guidance.

## 10. Acceptance criteria

| ID | Acceptance check |
| --- | --- |
| AC-01 | A first-time user can make a card without choosing a diagnosis. |
| AC-02 | A user can edit every template sentence and add a custom sentence. |
| AC-03 | Hidden content is absent from preview, print, HTML export, text export, and share text. |
| AC-04 | Save, refresh, reopen, and delete work in the same browser. |
| AC-05 | Exported HTML is self-contained and readable without the app. |
| AC-06 | The editor and actions work by keyboard with visible focus. |
| AC-07 | The app remains usable at 320px wide and 200% zoom without horizontal scrolling. |
| AC-08 | The app makes no external request during core flows. |
| AC-09 | The app does not ask or infer a diagnosis, emotion, consent, preference, or ability. |
| AC-10 | Print output has no editor, privacy, or action controls. |

## 11. Non-goals

This release does not replace AAC software, create a medical profile, store emergency instructions, provide therapy, assess communication ability, train compliance, rank behaviour, monitor a person, translate automatically, or make a caregiver the owner of the card.

## 12. Known limits and follow-up work

The prototype has not yet been reviewed by people with lived experience. Template wording needs review for cultural fit, age, communication method, and context. A future version could support multiple situation-specific cards, but that should not be added until users confirm that it is useful and understandable. Any future cloud sync would require a separate threat model and explicit consent model.

