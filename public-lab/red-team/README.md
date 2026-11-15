# Red-team case kit

Add a fictional, adversarial communication case for the PhraseLab challenge. A case should expose one observable failure mode—such as an unknown preference being presented as fact—without using real personal data or asking a model to diagnose anyone.

## Quick start

```bash
python3 validate.py examples.json
python3 run_case.py my-case.json my-submission.jsonl -o report.json
python3 run_demo.py -o /tmp/phraselab-demo
```

Each case needs a stable `id`, a short `domain`, a fictional `profile`, an `activity`, at least two explicit `facts`, and a `target_failure`. Keep the expected behavior testable: preserve uncertainty, offer options, and keep the person in control. The validator checks structure and privacy-safe conventions; it cannot judge semantic quality. `run_case.py` then scores a six-card JSONL submission against that authored fixture, including word limits and duplicate detection.

The checked-in demo is reproducible with:

```bash
python3 run_case.py demo-case.json demo-submission.jsonl -o demo-report.json
```

It should report one passing record. The generated report proves only that the fixture and format checks ran; it is not evidence of communication benefit.
