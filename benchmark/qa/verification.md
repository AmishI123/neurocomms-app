# Benchmark verification

8 September 2026 · Completion audit for the independently runnable model experiment

## Requirements and evidence

| Requirement | Evidence and status |
|---|---|
| Diverse original fictional benchmark | data/cases.json: 12 cases in six domains, six short-word-limit and six phrase cases; case-balance test passes. No real participant records. |
| Scoring rules and reference labels fixed before inference | Timestamped data/frozen-manifest.json hashes cases, prompts, references, model lock, score.py, run.py and protocol. Inputs rechecked during work. Reference tests deliberately preserve known blind spots rather than claiming perfect semantic accuracy. |
| Three prompt approaches | basic/context/review prompt files; same public case passed to all; annotation-exclusion test passes. Review receives the recorded context draft with its parent ID and separate seed. |
| Actual model/version provenance | Published model and runtime digests verified by setup_local.py; data/model-lock.json records exact revisions/hashes. qa/runtime-environment.json records software and hardware. One live-slot snapshot confirms effective requested sampling settings and zero prompt-cache tokens in the observed call. |
| Repeated actual-model trials and cost records | Fixed 108-call schedule, seeds 17/29/43 and paired review seeds. All 108 records are complete (36 per condition), with no runtime errors or output-token-limit finishes. The run used 33,687 input and 8,174 output tokens; measured request time totaled 1,508.4 seconds. Actual calls and practical two-pass workflow costs are counted separately. |
| Reproducible analysis | analyze.py refuses incomplete archives, verifies frozen hashes and resamples cases, not cards/trials. Tests cover case-level pairing and missing outcomes. |
| Independent reproducibility without another inference run | Saved request/response files can be rescored and reports rebuilt using documented commands. Runner-resumption test uses mocked calls and checks no saved record is regenerated; this test fixture is not empirical data. |
| Output inspection and score limitations | results/audit.json contains the 12 prespecified condition-visible assistant inspections plus one labeled post-hoc example. Each entry records its raw-source hash. No independent human-expert review is claimed. |
| Dashboard, scientific figures and report | Standalone dashboard, six scientific figure artifacts (PNG/SVG/PDF), and Markdown/HTML/four-page PDF report generated. Browser tests and visual inspection cover desktop/mobile layout, filters, raw output, download and report figures. PDF text bounds and source links pass. |
| Recoverable handoff | README.md, PLAN.md, protocol, environment record and root PROJECT-CONTEXT.md describe the artifacts, scope and workflow. Completion state and artifact locations are updated. |

## Execution evidence

Eleven Python tests pass. They cover authored-reference behavior, invalid/truncated output handling, duplicates and word limits, exclusion of scorer annotations from model prompts, case balance, case-level bootstrap pairing, missing comparisons, rejection of incomplete archives, and runner resumption/frozen-input enforcement. qa/test-results.txt contains the execution output.

The runner test uses a temporary mocked endpoint and temporary files. The recorded experiment uses the actual pinned local model. The separate smoke case is excluded from the benchmark.

## Interpretation limits

Technical checks cannot establish useful communication or clinical benefit. The detector misses unsupported negative statements, presuppositions, role mismatches and semantic redundancy. Its reference precision/recall are limited to authored diagnostic examples. The audit was performed by the same assistant that built the benchmark, with condition visible. One small quantized model and constructed English cases do not characterize all models, languages or people.

## Final artifact checks

The browser test passed for all 108 embedded results: filters, paging, raw-text matching, download contents, mobile page-width bounds, no remote requests, literal rendering of injected markup, and embedded report figures. `qa/browser-test-results.txt` records the result. The test renders `REPORT.pdf`; all four report pages were visually inspected and checked by `qa/check_pdf.py`. `qa/pdf-check.json` records five distinct external source URLs, no replacement glyphs and in-page text bounds. These are practical layout checks, not a complete accessibility audit.

`qa/check_artifacts.py` rechecks all frozen input hashes, 108 expected record IDs, per-condition counts, scores against raw text, review-parent content, cost totals, audit source hashes, dashboard-data equality, project-local document links and named deliverables. `qa/artifact-check.json` records a pass. An initial link scan included an upstream dependency README; the scanner was corrected to scope the audit to project files, excluding node_modules.

Actual browser command from the repository root:

```bash
CHROMIUM_PATH=/home/mehta/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu node --test benchmark/tests/dashboard.test.cjs
```

The local inference server was stopped after the complete schedule to release memory. Archived results can be explored and rescored without a running model. Browser/runtime downloads remain in ignored directories. No findings were changed to obtain a favorable outcome.

After stopping inference, an offline rescore reproduced all numerical results exactly (excluding only the regeneration timestamp) and rebuilt identical report text. The dashboard was rebuilt with that timestamp; its complete embedded analysis object matches results/analysis.json. No additional model calls were made during artifact verification.
