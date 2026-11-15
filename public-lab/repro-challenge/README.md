# PhraseLab Public Reproducibility Challenge v1

This package freezes the next evidence milestone for the platform. It names the fictional case fixture, reference submission, deterministic scorer, semantic-review rubric, and reporting boundaries before new runs are added.

## Reproduce the reference control

```bash
PYTHONPATH=public-lab python3 public-lab/challenge/score_submission.py \
  public-lab/repro-challenge/reference-control.jsonl \
  --output /tmp/reference-report.json
```

The expected result is three accepted records. The control is a wording reference, not a human-performance benchmark. New submissions must include model/runtime metadata and a checksum where possible, as described in `challenge/SUBMISSION.md`.

Generate and score the independent template baseline:

```bash
python3 public-lab/repro-challenge/generate_baseline.py -o /tmp/template-baseline.jsonl
PYTHONPATH=public-lab python3 public-lab/challenge/score_submission.py \
  /tmp/template-baseline.jsonl --output /tmp/template-report.json
```

This baseline is a deterministic software control, not a model or human benchmark.

Build the declared semantic-review sample with:

```bash
python3 public-lab/repro-challenge/build_review_packet.py \
  -o /tmp/repro-review-packet.json
```

The packet contains six records (three per condition) with blank annotations. Independent reviewers can open the packet-specific [browser reviewer](review.html); no scores are prefilled.

Use [REVIEW-RUNBOOK.md](REVIEW-RUNBOOK.md) for the independent-review sequence and commands.

After both reviewers finish, use the guarded release assembler to create the complete review bundle in a new directory:

```bash
python3 public-lab/repro-challenge/assemble_review_release.py reviewer-a.jsonl reviewer-b.jsonl \
  --packet public-lab/repro-challenge/review-packet.json -o review-release
```

It refuses incomplete or mismatched files and writes the raw annotations, per-reviewer reports, agreement, verified report, and separate Atlas metadata together.

Interested contributors can use the repository’s [Volunteer as a challenge reviewer](https://github.com/mehtama1234/neuro-divergent/issues/new?template=reviewer-volunteer.yml) form. Reviewers should submit only a pseudonymous code and general experience; never include participant data, diagnoses, or personal communication logs.

`author-preflight.jsonl` and `author-preflight-report.json` exercise the annotation pipeline with an author-coded pass. They are implementation checks only; they must not be reported as independent reviewer agreement.

See [PROTOCOL.md](PROTOCOL.md) for the pre-specified comparison and review plan. Results remain descriptive on fictional cases and do not establish clinical or communication benefit.

The archived score reports can be compared with `python3 public-lab/repro-challenge/compare_conditions.py -o condition-comparison.json`.

Read [REPORT.md](REPORT.md) for the current citable status and the remaining review dependency.

## Optional model-assisted exploration

Two pinned local checkpoints can provide exploratory rubric judgments with:

```bash
python3 public-lab/repro-challenge/model_assisted_review.py
```

The output is explicitly labeled model-assisted and is not independent human evidence. Do not pass it to `verify_review.py` or use it to close the human-review release gate.

See [MODEL-ASSISTED-REVIEW.md](MODEL-ASSISTED-REVIEW.md) for the recorded exploratory result and limitations.
