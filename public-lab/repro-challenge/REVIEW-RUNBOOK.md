# Review runbook

This is the next human step after the deterministic reference and baseline scores.

Potential reviewers can use the repository issue form **Volunteer as a challenge reviewer**. The form requests only a pseudonymous reviewer code and an optional general experience note.

1. Give each reviewer a copy of `review-packet.json` and a different reviewer code.
2. Open `review.html` for the packet-specific browser rubric, or use the packet records as the source and write JSONL annotations matching `score_annotations.py`.
3. Do not discuss scores until both reviewers have finished the declared six records.
4. Validate and summarize each annotation file:

```bash
python3 ../evaluator/score_annotations.py reviewer-a.jsonl -o reviewer-a-report.json
python3 ../evaluator/score_annotations.py reviewer-b.jsonl -o reviewer-b-report.json
python3 ../evaluator/agreement.py paired-annotations.jsonl -o agreement.json
```

The agreement result is descriptive and sample-dependent. It is not participant validation. Retain raw annotations, rationales, missingness, and any disagreements with the final challenge release.

Verify completeness and compute agreement in one step:

```bash
python3 verify_review.py reviewer-a.jsonl reviewer-b.jsonl --packet review-packet.json -o review-verification.json
```

After the verifier reports `valid: true`, regenerate the report from that output:

```bash
python3 build_report.py --review-verification review-verification.json -o REPORT.md
```

For a complete release bundle, the assembler performs the verification first and then writes both reviewer reports, agreement, verification metadata, the regenerated report, and separately labeled Atlas metadata into a new directory. It refuses to use an existing output directory:

```bash
python3 assemble_review_release.py reviewer-a.jsonl reviewer-b.jsonl \
  --packet review-packet.json -o review-release
```
