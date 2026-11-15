# Communication-access card verification

Checked 17 September 2026.

## Automated browser tests

Command:

```bash
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu \
  node --test product-specs/communication-access-card/tests/communication-access-card.test.cjs
```

Result: 6 tests passed in the original feature suite. A separate acceptance suite adds 4 tests, the selected product-choice flow adds 1 test, the accessibility evidence suite adds 3 tests, the keyboard-flow suite adds 2 tests, the accessibility-tree suite adds 2 tests, and the environment-boundary check adds 1 test; 19 tests pass across the complete current check set.

The tests cover:

- page loading and accessible landmarks;
- labelled controls;
- example content and live preview;
- hidden content being excluded from preview and export review;
- explicit HTML and text export downloads;
- local save, reload, and deletion;
- narrow layout and focus-style presence.

## Additional checks

- `node --check app.js` passed.
- `node --check sw.js` passed.
- The app, PRD, README, stylesheet, scripts, and service worker all returned HTTP 200 from the local server.
- Browser audit passed at 1280px, 880px, 390px, and 320px with no horizontal overflow.
- Browser audit found 17 controls and all were labelled or had an accessible name.
- Browser audit found zero external page resources.
- The accessibility evidence suite found accessible names for every initial and
  dynamically created control, a labelled and described sharing dialog, and
  live status regions for save and feedback messages.
- The keyboard-flow suite completed blank setup, section and statement creation,
  editing, hiding, sharing review, Escape close, focus return, and visible-focus
  checks. This is browser keyboard evidence, not a screen-reader or switch
  access result.
- The accessibility-tree suite found the editor, preview, controls, dynamic
  example content, and sharing dialog in the browser accessibility tree. This
  inspects semantics; it is not a screen-reader session or human accessibility
  result.
- The accessibility-environment report confirms browser accessibility-tree
  checks are available but no screen-reader, switch-access, native Android, or
  native iOS session is available or claimed on this host.
- After the first load, the service worker controlled the page and the editor worked with the browser offline.
- Share/copy flow showed the review dialog and completed through the browser fallback when clipboard access was unavailable.
- The selected product-choice task was rerun at 320px and 1280px: example → edit → hide → preview → save → reload → reviewed text export → delete.
- The acceptance suite checks print visibility, hidden text in HTML export, malformed saved data, offline reload after service-worker caching, the clipboard share fallback, and dialog focus return.

## Limits

This is a working prototype, not a clinically validated tool. Template wording still needs review by people with lived experience. Local browser storage is not a secure vault; a person should avoid putting sensitive information into a card unless they understand the consequences of printing or exporting it.

The product-choice run has no participant data. It supports choosing what to build first, not a claim that this card is easier or more useful than paper, ordinary notes, or another communication aid.

## Current release audit

Run the repeatable audit with:

```bash
npm --prefix communication-tool run communication-card:release-audit
```

The current audit passed 22/22 browser and decision-flow checks and verified a
fresh extraction of the 14-file package. The authoritative archive SHA-256 is
kept in the adjacent package manifest and release audit so the packaged page
does not create a circular hash claim.
The machine-readable record is
`communication-tool/ai-evaluation/results/communication-card-release-audit.json`.

The advisory local LLM report is included only as bounded engineering
feedback. It does not replace a person’s review, participant evidence, or a
decision about usefulness.

Current commands:

```bash
node --test product-specs/communication-access-card/tests/communication-access-card.test.cjs
node --test product-specs/communication-access-card/tests/acceptance.test.cjs
node --test product-specs/opportunity-atlas/decision-flow.test.cjs
```

The standalone package is built with `package-release.mjs`, which performs two
normalized builds and compares them. Its manifest records every included file
and hash. `verify-release.mjs` checks the exact file set and hashes after a
fresh extraction.
