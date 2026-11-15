# First product and reuse decision

## Task

Prepare questions, keep them visible during a visit, and leave with unanswered questions still available. The first comparison is the person's usual paper or phone-note method.

## Evidence used

The saved [autism findings](../opportunity-atlas/autism.html) and [source ledger](../opportunity-atlas/evidence-ledger.json) describe conversation pace, sensory conditions, service access, and communication barriers. They support testing the task. They do not establish demand for this app. Sources have not all been revalidated in this implementation pass.

## Reuse inspection

- `../communication-access-card/app.js` supplies a working design precedent for editable statements, visible-only content, disclosure preview, plain-text exports, and browser storage. It is one closure tied to that app's DOM and state shape.
- `../communication-access-card/styles.css` and `index.html` supply the existing layout and keyboard-control precedent.
- `../communication-access-card/sw.js` caches the card shell, while its fetch handler also caches other successful responses. The visit app uses a smaller cache policy restricted to its declared shell.
- `../communication-access-card/tests/communication-access-card.test.cjs` exercises the original app's editor, hidden content, exports, storage, and narrow view.

Reused the interaction patterns and text-escaping approach. Wrote a separate small `model.mjs` for visit state, strict input validation, and summary projection. New `app.mjs` handles visit screens and revision-checked writes; these behaviours do not fit the card's section/item state. No original card files or shared runtime code were changed. Extracting shared code now would add regression work without a clear reduction in this small implementation.

## Choice

First implement the complete text-based visit task. Keep the scope narrow enough to compare with notes but include the full saving, recovery, privacy, and end-of-visit flow. Do not add recording, AI suggestions, or service integration before learning whether the core task helps.

## Unanswered questions

Does preparation add too much work? Is the list easier to use than existing notes? Will a person choose to show communication requests? Can they keep up when the conversation changes order? Which access needs require different controls or another communication method?
