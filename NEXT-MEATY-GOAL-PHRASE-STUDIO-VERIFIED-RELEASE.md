# Next meaty end-to-end goal: deliver one verified Phrase Studio journey

## The outcome

Deliver one coherent, local-first Phrase Studio release that lets a person:

1. open the app;
2. create or edit a small communication phrase set;
3. review the wording and keep or reject optional suggestions;
4. save unfinished work safely;
5. reopen it after an interruption or restart;
6. use the finished set in the Quick Phrase Board;
7. use speech, focus, text-size, and contrast controls when available;
8. export or back up the work privately;
9. restore it without silently losing existing data; and
10. complete the same fictional-data journey in the packaged mobile build when an authorized test device is available.

The release must have one plain-language report that says what passed, what was
not tested, and what still requires a human reviewer or participant study.

This is an engineering and usability-readiness milestone. It is not a clinical
study, a diagnosis tool, proof of usefulness, or proof that AI-generated phrases
are correct.

## Why this is the next goal

Phrase Studio already contains many useful pieces: phrase editing, a personal
workspace, a communication-access card, a Quick Phrase Board, local storage,
backup and restore, optional AI tools, a safety firewall, and mobile packaging.
The risk is now fragmentation. Individual features can pass tests while the
complete journey, copied mobile bundle, packaged app, safety gate, and release
report disagree.

This goal joins the pieces into one inspectable path instead of adding another
large feature family.

## Scope

### Core user journey

- Start with a clearly labelled fictional example or personal workspace.
- Create, edit, add, remove, and review phrase cards.
- Pause and resume without inflating active preparation time.
- Finish a set and open it in the Quick Phrase Board.
- Search and filter the board.
- Copy a phrase, read it aloud when browser support exists, and stop speech.
- Change text size, contrast, speech language, and focus mode.
- Save a draft, reload the app, and continue from the same state.
- Export a phrase library and a private device backup.
- Restore into an isolated browser profile while preserving unrelated data.
- Test malformed, oversized, stale, duplicated, cancelled, and repeated imports.

### Optional assistant boundary

- AI remains off by default.
- Provider configuration requires an explicit user action.
- Fictional provider testing remains available without real personal data.
- Request previews show what would be sent before transmission.
- Redaction remains enabled by default.
- Returned suggestions remain proposals until the user accepts them.
- Firewall failures block or clearly mark unsafe suggestions.
- No assistant result is described as a fact, diagnosis, preference, or clinical recommendation.

### Web and mobile surfaces

- Verify the source web app.
- Rebuild the copied web/mobile bundle from an explicit file list.
- Verify the Capacitor Android package and its permissions.
- Keep the iOS handoff reproducible.
- If an authorized Android target exists, run the installed journey.
- If macOS, Xcode, and CocoaPods exist, run the corresponding iOS checks.
- If a native environment is unavailable, record the blocked gate rather than
  claiming native acceptance.

## Definition of done

### Product behavior

- The complete fictional journey passes in a clean browser profile.
- The complete personal-workspace journey passes without exposing its content in
  research-rating exports.
- Drafts survive reload and a simulated interruption.
- Finished sets open in the Quick Phrase Board with the exact approved wording.
- Speech can be stopped deliberately and does not continue after the app is
  hidden when the privacy setting is enabled.
- Accessibility controls visibly affect the relevant interface.
- Empty, overlong, duplicated, and invalid cards receive understandable errors.

### Storage and recovery

- Local data is versioned and validated before use.
- Backup export is stable and excludes secrets and unsaved share-cache content
  unless the interface explicitly says otherwise.
- Restore uses a preview or equivalent confirmation step.
- Failed validation leaves existing data unchanged.
- Repeated restore does not duplicate records.
- Concurrent or stale writes fail safely.
- Erase controls remove the documented data and explain what remains outside the
  app, such as downloaded files.

### Safety and AI

- Firewall checks are covered by unit tests and browser checks.
- Invalid JSON, wrong card count, empty cards, duplicates, word-limit failures,
  and forbidden topics are all represented in tests.
- The app never silently turns an AI proposal into a user-approved phrase.
- Test fixtures contain fictional information only.
- Reports distinguish deterministic validation, model output inspection, human
  review, and participant evidence.

### Release evidence

Produce:

- a current product requirements and non-goals document;
- a fictional end-to-end walkthrough;
- a browser acceptance report;
- a storage, backup, and recovery report;
- a safety-firewall report;
- a web/mobile bundle manifest with hashes;
- an Android package and permission report when the toolchain permits it;
- an iOS handoff report or a clearly marked environment block;
- a plain-language release decision;
- a reproducible archive containing the intended release files.

The release decision must use one of these labels:

- **Engineering gate passed** — the tested scope works as specified;
- **Engineering gate passed with environment limits** — source and package
  checks passed, but native execution could not be run; or
- **Revise before release** — a required product, storage, safety, or packaging
  check failed.

## Required checks

Run the existing focused test suites and add missing coverage rather than
relying only on aggregate historical counts. At minimum, cover:

- clean start;
- ordinary editor;
- review editor;
- personal workspace;
- pause and resume;
- draft recovery;
- phrase-library export/import;
- complete device backup/restore;
- malformed and oversized backup rejection;
- data erasure;
- Quick Phrase Board use;
- speech stop behavior;
- text-size and contrast changes;
- offline reload;
- AI consent refusal;
- request preview without network transmission;
- firewall rejection;
- copied bundle equality;
- Android package permissions; and
- native execution only when a dedicated authorized target is available.

## Explicit non-goals

This goal does not include:

- diagnosing autism, ADHD, dyslexia, or any other condition;
- inferring a person's wishes, pain, consent, emotion, or communication ability;
- replacing an AAC system or professional support;
- background listening or surveillance;
- automatic cloud synchronisation;
- automatic message sending;
- collecting participant data;
- claiming clinical effectiveness;
- claiming that a phrase is safe merely because it passed a format check; or
- manufacturing human-review results when reviewers are unavailable.

## Handoff boundary

After this goal, a suitable mentor or accessibility reviewer should inspect the
wording, privacy explanations, and intended use. Any participant study would
require a separate approved protocol, consent process, recruitment plan, and
analysis plan. The engineering release must remain useful as a demo even if
that later research never happens.

## Useful entry points

- [Phrase Studio](communication-tool/index.html)
- [Phrase Studio README](communication-tool/README.md)
- [PhraseLab firewall](public-lab/firewall/)
- [Phrase Studio verification records](communication-tool/qa/)
- [Native mobile handoff](communication-tool/docs/native-beta-execution-handoff-2026-09-17.html)
- [Project context](PROJECT-CONTEXT.md)
