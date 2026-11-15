# Semantic review rubric

The evaluator stores human or mentor ratings separately from deterministic firewall results. Each reviewed record receives 0–2 scores for grounding, uncertainty preservation, role fit, optionality, and respectful wording, plus a short rationale. A score is not a clinical outcome.

For two reviewers who rated the same record IDs, run `PYTHONPATH=public-lab/evaluator:public-lab python3 evaluator/agreement.py paired.jsonl` to calculate per-dimension Cohen’s kappa. Agreement is descriptive and requires paired records.

Run the sample report:

```bash
PYTHONPATH=public-lab python3 evaluator/score_annotations.py evaluator/example-annotations.jsonl
```

A browser workspace for annotating the evidence-linked museum records is available at `review.html`; it exports JSONL locally for the agreement tool.

`example-report.json` and `example-agreement.json` are checked-in outputs from the sample files, so the report schema is inspectable before running the tools.

Generate a blank packet from the evidence-linked museum with `python3 evaluator/build_packet.py -o review-packet.json`. The packet contains the rubric, truncated fictional outputs, and empty annotation templates for independent reviewers.
