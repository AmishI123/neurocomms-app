# Next meaty end-to-end goal

The next phase is documented in [Time Steps release hardening](NEXT-MEATY-GOAL-TIME-STEPS-RELEASE-HARDENING.md).

## Show me the time steps: a clear, local schedule calculator

Build a small web and mobile-ready tool that works backward from one
appointment and shows every time step in plain language.

### Delivered first slice

- Plain-English PRD with scope, privacy rules, failure cases, and acceptance
  checks.
- Local browser app at `product-specs/time-steps/index.html`.
- Appointment date/time, preparation, travel, spare time, and display choice.
- Visible calculation cards for preparing, leaving, and the appointment.
- Previous-day handling, invalid-input handling, local save/reload/delete, and
  print view.
- Responsive layout, labelled controls, visible focus, and no external core
  requests.
- Ten standalone browser tests covering the complete first slice, including
  invalid-edit warnings, markup-safe labels, daylight-saving refusal, and
  malformed-save handling.
- Shared Phrase Studio shell integration through `time-steps.mjs` and
  `time-steps.css`.
- Android debug bundle integration with 39 exact runtime files, 20 scoped
  browser/integration checks, and packaged permission audit.
- Pinned local LLM judge run with a six-part rubric, bounded safety checks, and
  JSON plus HTML reports. The report is advisory engineering evidence only.
- Source-free reviewer packet with a fictional task, plain-language guide,
  private download-only response form, stop conditions, and packet checks.
- Reviewer form browser journey verified required-field validation, private
  JSON download, clear-without-save, no external requests, narrow layout, and
  visible focus.
- Plain-language decision report consolidates the product decision, evidence,
  limits, and remaining gates in one readable HTML page.
- Dedicated native Android journey runner now covers Time Steps calculation,
  local save, force-stop/restart restore, and delete. It requires an
  explicitly named dedicated target and fails closed without one.
- Native platform handoff packet now gives the exact Android and iOS steps,
  evidence rules, and current environment status.

### What remains before calling it useful

- Run the app on an authorized Android device or emulator and verify the native
  WebView journey.
- Run the app on an authorized macOS/Xcode environment for iOS packaging and
  execution.
- Review the wording with an accessibility reviewer.
- Compare it with a person’s usual calculator or written method through an
  approved, accessible review.
- Record whether the visible steps help, add effort, or create confusion.
- Stop, revise, or continue based on that evidence. The current automated
  tests and model review are engineering checks only.

The model judge has now run, but it does not replace those human checks. Its
current report calls the evidence package `not-credible` because human review
and specialist review are missing; that label must not be read as a claim that
the arithmetic is wrong.

### Do not claim

Do not claim that this tool helps every person with dyscalculia, improves
punctuality, predicts travel, replaces support, or provides medical, financial,
or transportation advice. The current prototype has no participant data.
