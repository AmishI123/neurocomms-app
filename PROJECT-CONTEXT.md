# Neurodivergence research project

> **Historical context record.** For the current project state and agent handoff, read [`PROJECT-STATUS.md`](PROJECT-STATUS.md), [`AGENTS.md`](AGENTS.md), and [`docs/README.md`](docs/README.md) first. This file preserves the recovery history and should not be treated as the current product plan.

Recovered on 2026-09-07 from the previous conversation supplied by the user.

## User's intended direction

The user is a high-school student working with an institute called PRGN that supports neurodivergent children. They spend time with the children and want to brainstorm research grounded in that experience, examine recent literature, identify research gaps, and develop a high-school paper. Possible routes include apps, other technologies, experiments, and supervised wet-lab work. No project direction has been selected.

## Historical starting point (before the completed review)

The previous conversation suggested connecting an observed need to existing research, an unresolved question, and a feasible investigation. Candidate areas were communication of needs, activity transitions, comfortable interfaces, local-language adaptations, and children's participation in design. These are brainstorming directions, not verified research gaps.

At that recovery point, only an initial scan had been reported. The later review and prototype milestone below supersede that state.

## Information still needed

- PRGN's full name or website and the broad ages and support needs of the children.
- One or two non-identifying observations from the user's time there: what children enjoy, find difficult, or want help with.
- Timeline, coding experience, mentor access, and whether supervised wet-lab access exists.

Ask progressively rather than requiring all details at once. Do not record children's names or identifying details.

## Completed landscape-review milestone

The user explicitly asked to search other institutes and startups without waiting for PRGN details, then asked to start. A focused evidence review is now complete: research-opportunities.pdf, seven pages, with linked primary sources, 2024–2026 findings, competing solutions, two concrete project sketches, and ADHD/dyslexia/biology alternatives. Every rendered page was visually inspected, and page count, text bounds and citation-link presence were checked.

The review distinguishes specific study limitations from globally novel gaps. The two leading candidates are an adult review interface for communication materials and a child-directed room-preference interface with optional environmental sensing. No project has been selected, no empirical study has been run, and no app has been built. The biological route remains an exploratory mentor-dependent option.

The previously mentioned 2025 XR study was independently located in primary search text during this review: Alper and colleagues, 21 autistic and/or ADHD children aged 8–13, DOI 10.1016/j.ijcci.2025.100782. It was supplementary, not central to the final brief.

## Current state: Project A prototype and mentor package

After recovery, the user asked for the next end-to-end goal. The assistant proposed taking Project A from a focused gap check to a working prototype and a mentor-review proposal/protocol/rubric. The user then said “strt,” authorizing that work. The package is in `communication-tool/`.

Phrase Studio provides ordinary and review-assisted editors, two original fictional activities, editable/addable/removable cards, explicit pause timing, optional effort/reflection, and session/rating exports. It is also an offline-first mobile/PWA prototype with a local phrase board, speech input/output, support card, accessibility controls, optional consent-gated AI drafting/review/rehearsal/translation, redaction, and a local Ollama proxy. Fixed hand-written suggestions still isolate the research interface question; all research exports are labeled demonstration. The study title was narrowed to “Evaluating a personalization review step for suggested communication materials.”

The proposed study uses parallel allocation to one editor per adult, with case order counterbalanced within groups, because exposure to review prompts could contaminate a later ordinary-editor task. The draft sample target is a practical feasibility proposal, not a power calculation. Sources checked include the closest 2024/2025 authoring work and 2026 AAC personalization/evaluation research. No global novelty is asserted.

The working demo, focused evidence check, two-page mentor proposal PDF/HTML/Markdown, draft protocol, rubric with examples, data dictionary and verification records are saved. See `communication-tool/qa/verification.md` for the completion audit and technical limits. No human-participant study has been run, and no evidence of benefit has been obtained.

## Next step after the prototype milestone

Let the user try the demo and review the proposal with a suitable AAC/communication mentor. The next research phase is to refine/freeze the instrument and protocol, obtain applicable review, prepare a study release and recruit consenting adult preparers. Current demo controls/exports are for rehearsal, not enrollment or approved study records. Do not automatically choose or run child research. PRGN details would help refine population fit, but the user prefers autonomous progress on work that does not depend on those details.

## Completed independent model benchmark

On 7–8 September 2026, the user asked for a substantial project that can be completed independently and authorized “start” for a reproducible benchmark, actual model outputs, analyzed results, dashboard and technical report. The user then asked “model”; the assistant explained the local model choice. No API keys, GPU tooling or local inference runtime were configured. A pinned Qwen3.5-0.8B Q8_0 model and llama.cpp b10853 were downloaded into ignored `.benchmark-runtime/` and checksums verified against upstream metadata.

The benchmark is in `benchmark/`. Cases, prompts, scorer, references, model lock, runner and protocol were hashed before experimental requests. The design is 12 original fictional cases × 3 fixed seeds × basic/context/review workflows = 108 calls and final outputs. Context drafts are reused as review inputs. This tests model prompting, not the graphical editor's effect or clinical benefit.

The experiment completed on 8 September 2026 with all 108 calls (36 per condition) and no runtime errors. Cases/prompts/scorer/runner/protocol hashes match their pre-request manifest. Raw requests/responses are saved; model inference is stopped and no live service is needed to inspect results. Eleven Python tests, the browser workflow test, artifact consistency checks and PDF checks passed.

Deliverables: `benchmark/dashboard.html`, `benchmark/REPORT.pdf` (four pages), `benchmark/REPORT.md`, scientific figures, results/analysis.json, all raw records, the 12-output prespecified assistant audit and one labeled post-hoc example, reproducibility instructions, model/runtime lock and verification records. A shareable `benchmark-package.zip` contains the benchmark without local model weights or installed dependencies.

Observed valid-format outputs: basic 31/36, context 33/36, review 31/36. Each condition had two rule-flagged valid outputs. Context and review each had six exact duplicate cards, compared with thirteen for basic, but denominators and semantic redundancy differ. The audit found unsupported assumptions and output-role mismatches that survived review. Narrow rule flags are not a validated hallucination or quality score; these results do not establish a quality or clinical benefit. Actual local inference used 33,687 input and 8,174 output tokens and about 25.1 minutes of request time; no API fees were incurred, and hardware/electricity were not priced.

The independent benchmark milestone is complete. A next extension could improve held-out cases and semantic assessment and compare another model, preserving the archived run. No new commit/push was requested during this milestone; changes are local.

## Completed held-out generalization milestone

The v2 extension in `benchmark-v2/` froze 12 new fictional cases and ran Qwen2.5-0.5B-Instruct Q5_K_M across three seeds and the same three workflows (108 requests). All requests completed. Valid JSON was 5/36 basic, 9/36 context and 0/36 review; the review workflow therefore cannot support a quality comparison. A 12-record qualitative audit, analysis, figures, offline dashboard and reports are saved. Python tests and artifact consistency checks passed. Browser automation could not run because Chromium is unavailable in this environment. The held-out cases differ from v1, so rates are descriptive. The next independent engineering step is constrained decoding and schema validation, followed by a rerun on the frozen manifest.

## Completed constrained-generation milestone

The v3 pipeline in `benchmark-v3/` added JSON-schema requests, local fence normalization, a bounded repair path, and parallel execution of independent case chains. The full 108-call rerun completed and passed analysis, ten Python tests, and artifact consistency checks. Valid JSON improved to 16/36 basic, 16/36 context, and 7/36 review; over-limit and repetition failures remain, so this is a reliability improvement rather than evidence of communication benefit. Browser automation remains unavailable because Chromium is not installed. The next step is semantic evaluation with a rubric and independent reviewers before any participant study.

## Public showcase release

The static public landing page is in `site/`, linking to Phrase Studio and the v3 dashboard. `phrasebench-showcase.zip` packages the showcase, demo, reports, figures and benchmark artifacts without local dependencies or model weights. Static HTTP serving was smoke-tested for all four linked entry points. Phrase Studio browser workflows now run through the repository's Playwright suite with 20 passing tests; hosted native builds remain environment-dependent.

## PhraseLab platform expansion

The public platform now includes a deterministic firewall library, adversarial case fixtures, a CLI JSONL challenge scorer, a browser-only scorer that never uploads submissions, an interactive failure museum, design-pattern guidance, and research-in-a-box materials. Firewall and challenge unit tests pass. The platform remains fictional-data infrastructure and does not claim clinical usefulness.

The platform expansion now also includes a deterministic synthetic-case generator, a one-command classroom lab smoke workflow, and an offline-capable Phrase Studio PWA shell with a local-only service worker. Generator tests and the classroom workflow pass. The public release remains suitable for static hosting and local distribution; semantic evaluation and participant research remain future supervised work.

The public platform now has browser demos for the firewall, challenge scorer, failure museum, and design-system patterns. The classroom generator and all firewall/challenge/case tests pass. The next work remains a deeper integration of these shared checks into Phrase Studio and a richer evidence-linked failure catalog.

The Failure Museum now builds a nine-record catalog from real v3 fictional benchmark outputs, truncates them for display, and exposes the failure category and lesson in the browser. The catalog rebuild and all platform test suites pass. Latest release commit: `c01ed60`.

The semantic-evaluation layer now defines a five-dimension 0–2 reviewer rubric, validates annotation files, and produces machine-readable summaries while keeping human judgments separate from firewall metrics. Example annotations and tests pass. Latest evaluator commit: `7d743ac`.

## Current PhraseLab release state (8 September 2026)

The next meaty goal is still the PhraseLab Public Reproducibility Challenge v1 release, but its human-review gate is not complete. The frozen six-record packet has fingerprint `9b313b3c8a61484239e104b519ff14d5fab7fb0d35540c4bfbf39f2dd8a0f6ab`. The packet, reviewer browser, runbook, strict two-reviewer verifier, report, Atlas importer, and Atlas review-metadata surface are implemented and covered by the local release gate (24/24 checks passing). The shareable `phraselab-platform.zip` is rebuilt from the same source tree.

An owner-authored GitHub recruitment issue is open at https://github.com/mehtama1234/neuro-divergent/issues/1. It requests two independent pseudonymous reviewers; no external reviewer submissions have arrived yet. The report therefore remains explicitly pending and contains no fabricated annotations. GitHub Actions runs for the latest commits are visible but fail before starting because the account reports failed recent payments or an insufficient spending limit. Local verification is the reliable check until that account-level condition is resolved.

The model-assisted exploratory branch is archived separately in `public-lab/repro-challenge/`: two pinned local checkpoints made 12 attempts, with 0/12 passing the annotation schema. Those outputs are useful failure-analysis material only; they are not independent human evidence and must never be passed to the human-review verifier. The latest related commits are `917840e` (pivot record), `cdf8b0b` (failure classification), and `b7783ad` (packet fingerprint); later hardening is in `1497411` (exact packet record IDs), `e69e53f` (packet required by the CLI), and `0aa456b` (report status bound to packet verification).

The package builder now normalizes ZIP timestamps and permissions, tests byte-for-byte determinism, and writes `phraselab-platform.zip.sha256`. The current archive contains 146 files; the sidecar is the authoritative checksum because this context file is included in the archive.

Do not claim the citable independently reviewed release is complete until authentic independent annotations, agreement output, regenerated report, and a successful release/package check are all present. Good follow-up work can improve provenance or offline tooling without changing that boundary.
