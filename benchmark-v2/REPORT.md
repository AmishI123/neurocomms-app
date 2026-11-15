# Held-out generalization benchmark

Run date: 2026-09-08. This is a descriptive engineering benchmark on 12 fictional held-out cases, three seeds, and three prompt workflows. It is not a clinical or efficacy study.

## Result

The Qwen2.5-0.5B-Instruct Q5_K_M model completed all 108 local requests, but format reliability was poor. Valid JSON was produced for 5/36 basic outputs, 9/36 context outputs, and 0/36 review outputs. The invalid-or-risk rate was 86.1%, 75.0%, and 100.0%, respectively. Because review had no valid outputs, it cannot support a quality comparison.

| workflow | outputs | valid JSON | invalid or flagged | duplicate cards | over-limit cards |
|---|---:|---:|---:|---:|---:|
| basic | 36 | 5 | 31 (86.1%) | 8 | 23 |
| context | 36 | 9 | 27 (75.0%) | 15 | 36 |
| review | 36 | 0 | 36 (100.0%) | 0 | 0 |

## Interpretation

- Added context reduced invalid-or-risk outputs by 11.1 percentage points relative to basic (12 paired cases; bootstrap 95% CI −22.2 to 0 points). This is a formatting and rule outcome, not evidence of improved communication usefulness.
- Review added prompt tokens but produced zero valid outputs. The selected audit shows repeated drafts, unsupported assumptions, and word-limit violations surviving review.
- Reference diagnostics are limited to constructed labels: precision 1.00 and recall 0.43 for the narrow automatic reference detector.

## Reproducibility and limits

The model and runtime are locally pinned in `setup_local.py` with SHA-256 locks. Raw responses, frozen manifest, scoring code, analysis JSON, and the 12-entry qualitative audit are included. The held-out cases differ from v1, so side-by-side rates are descriptive and cannot isolate model effects. The scoring rules are narrow, the references were authored by the benchmark designer, and no participant or clinical outcome was measured.

## Next decision

Do not proceed to participant testing or claim that review improves communication. The next useful engineering milestone is to improve constrained decoding and schema validation, then rerun the same held-out manifest to test whether format reliability—not prompt verbosity—is the bottleneck.
