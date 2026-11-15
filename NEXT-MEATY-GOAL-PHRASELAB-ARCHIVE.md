# Next meaty end-to-end goal

## PhraseLab Public Reproducibility Challenge v1

Turn the existing PhraseLab platform into a citable, independently reviewed evidence release.

The software and deterministic portion is already prepared. The next goal is to complete the review handoff, archive the results, and publish one final release that a mentor, student researcher, or contributor can reproduce from a clean checkout.

## Definition of done

- Two independent reviewers use different pseudonymous reviewer codes.
- Each reviewer scores all six records in `public-lab/repro-challenge/review-packet.json`.
- Every annotation has all five rubric dimensions and a rationale.
- Both annotation files pass `public-lab/evaluator/score_annotations.py`.
- `public-lab/repro-challenge/verify_review.py` accepts the pair.
- Agreement is calculated with the existing kappa tool and reported with the raw annotations.
- `public-lab/repro-challenge/REPORT.md` is regenerated to include the review status and limitations.
- The Atlas receives the final challenge report as clearly labeled community/review data.
- The release gate, static-link check, and package build pass.
- A versioned Git commit, `phraselab-platform.zip`, and its SHA-256 sidecar are pushed to `main`.

## Current evidence

Already complete:

- Frozen case manifest and protocol: `public-lab/repro-challenge/manifest.json` and `PROTOCOL.md`.
- Reference control: `reference-control.jsonl` and `reference-control-report.json`.
- Independent deterministic baseline: `template-baseline.jsonl` and `template-report.json`.
- Deterministic comparison: `condition-comparison.json`.
- Blank six-record review packet: `review-packet.json`.
- Browser reviewer: `review.html`.
- Complete-pair verifier: `verify_review.py`.
- Author-only preflight: `author-preflight.jsonl` and `author-preflight-report.json`.
- Current release report: `REPORT.md`.
- Current release gate: **24 checks**, including package tests and a temporary archive build.
- Separate Atlas review importer and browser surface: `atlas/import_review.py` and `atlas/index.html`.
- Exploratory two-model judgment run: `MODEL-ASSISTED-REVIEW.md` and `model-assisted-review.jsonl`; 0/12 outputs passed the rubric schema, so this is not human-review evidence.

The author preflight is only an implementation check. It must not be used as independent reviewer evidence.

## Exact handoff

1. Open `public-lab/repro-challenge/review.html`.
2. Reviewer A and Reviewer B use separate codes and review independently.
3. Download one JSONL file per reviewer after all six records are complete.
4. Run:

```bash
python3 public-lab/evaluator/score_annotations.py reviewer-a.jsonl -o reviewer-a-report.json
python3 public-lab/evaluator/score_annotations.py reviewer-b.jsonl -o reviewer-b-report.json
python3 public-lab/repro-challenge/verify_review.py reviewer-a.jsonl reviewer-b.jsonl --packet public-lab/repro-challenge/review-packet.json -o review-verification.json
```

5. Add the raw files, reports, agreement output, and regenerated `REPORT.md` to a release commit.

After the report and Atlas inputs are complete, build and verify the shareable archive and checksum:

```bash
make -C public-lab package
```

The package command normalizes ZIP metadata so repeated builds are byte-identical and writes `phraselab-platform.zip.sha256`.

## Boundaries

Use fictional cases only. Do not add participant logs, diagnoses, identifying details, or claims of clinical effectiveness. Formatting acceptance and reviewer agreement are engineering and annotation measurements; they do not prove that a phrase is wanted, useful, accessible, or beneficial.

## If reviewers are not yet available

Keep the goal open and recruit through the repository issue form **Volunteer as a challenge reviewer**. Do not create synthetic “independent” annotations to make the report look complete.

## Useful entry points

- [PhraseLab public site](public-lab/site/index.html)
- [Challenge report](public-lab/repro-challenge/REPORT.md)
- [Review runbook](public-lab/repro-challenge/REVIEW-RUNBOOK.md)
- [Reviewer page](public-lab/repro-challenge/review.html)
- [Model-assisted review note](public-lab/repro-challenge/MODEL-ASSISTED-REVIEW.md)
- [Atlas review importer](public-lab/atlas/import_review.py)
- [Environment Lab](public-lab/environment-lab/index.html)
- [Reading Lab](public-lab/reading-lab/index.html)
