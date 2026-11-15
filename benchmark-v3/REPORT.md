# Held-out generalization benchmark

Run date: 2026-09-08. This is a descriptive engineering benchmark on 12 fictional held-out cases, three seeds, and three prompt workflows. It is not a clinical or efficacy study.

## Result

The Qwen2.5-0.5B-Instruct Q5_K_M model completed all 108 local requests. Valid JSON was produced for 16/36 basic outputs, 16/36 context outputs, and 7/36 review outputs. The invalid-or-risk rates were 55.6%, 55.6%, and 80.6%, respectively. Schema normalization and bounded repair improved parseability relative to v2, but over-limit and repeated-card failures remain.

| workflow | outputs | valid JSON | invalid or flagged | duplicate cards | over-limit cards |
|---|---:|---:|---:|---:|---:|
| basic | 36 | 16 | 20 (55.6%) | 20 | 50 |
| context | 36 | 16 | 20 (55.6%) | 17 | 54 |
| review | 36 | 7 | 29 (80.6%) | 0 | 10 |

## Interpretation

- Context versus basic changed invalid-or-risk by 0.0 percentage points on paired held-out cases. This is a formatting and rule outcome, not evidence of improved communication usefulness.
- Review remained the weakest workflow at 7/36 valid outputs. The selected audit records residual repetition and word-limit violations after repair.
- Reference diagnostics are limited to constructed labels: precision 1.00 and recall 0.43 for the narrow automatic reference detector.

## Reproducibility and limits

The model and runtime are locally pinned in `setup_local.py` with SHA-256 locks. Raw responses, frozen manifest, scoring code, analysis JSON, and the 12-entry qualitative audit are included. The held-out cases differ from v1, so side-by-side rates are descriptive and cannot isolate model effects. The scoring rules are narrow, the references were authored by the benchmark designer, and no participant or clinical outcome was measured.

## Next decision

Do not proceed to participant testing or claim that review improves communication. The next useful engineering milestone is to improve constrained decoding and schema validation, then rerun the same held-out manifest to test whether format reliability—not prompt verbosity—is the bottleneck.
