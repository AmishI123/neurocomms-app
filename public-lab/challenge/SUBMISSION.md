# PhraseLab challenge submission format

Submit a JSON Lines file with one record per case and condition:

```json
{"case_id":"unknown-preference","condition":"your-model","cards":["..."]}
```

The runner checks schema validity, card count, word limits, duplicates, forbidden topics, uncertainty preservation, and reproducibility metadata. Scores are engineering measurements on fictional fixtures; they are not rankings of clinical usefulness.

Run the reference scorer locally:

```bash
PYTHONPATH=public-lab python3 public-lab/challenge/score_submission.py \
  public-lab/challenge/example-submission.jsonl \
  --output submission-report.json --html submission-report.html
```

The HTML report is a static artifact suitable for attaching to a model submission or opening on a local machine.

For the repository’s existing runs, `PYTHONPATH=public-lab python3 public-lab/challenge/compare_runs.py -o comparison.json` creates a descriptive v1/v2/v3 table. The case sets differ, so it must not be read as a causal model leaderboard.
