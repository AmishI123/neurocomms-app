# v1 protocol

## Frozen inputs

- Cases: `public-lab/cases/cases.json`, SHA-256 recorded in `manifest.json`.
- Conditions: one submitted condition per case, six cards per record.
- Deterministic checks: schema, card count, word limits, duplicates, forbidden topics, and firewall findings.
- Semantic review: the five-dimension rubric in `public-lab/evaluator/rubric.json`, scored 0–2 by independent reviewers on a declared sample.

## Planned comparison

Report accepted/rejected records and each deterministic reason by condition. For the review sample, report dimension scores, missingness, and reviewer agreement. Keep **unsure** and any uncertainty-preserving language visible in the raw records. Do not rank systems by a single number or treat formatting validity as usefulness.

## Reproducibility requirements

Every new submission should provide the case manifest hash, model or author condition, runtime/settings, date, and output JSONL. A report must state whether the case set, prompts, and scorer match this protocol. Community submissions are labeled separately from frozen reference material.

## Stopping and limits

The release is complete when the reference control, at least one independently reproducible submission, deterministic reports, and a declared semantic-review packet are archived. This protocol uses fictional data only. It does not authorize recruitment, diagnosis, inference of a real person’s wishes, or claims of clinical effectiveness.
