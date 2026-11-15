# PhraseLab public platform

PhraseLab is a local-first, fictional-data platform for evaluating and designing communication-support software. It combines the safety firewall, adversarial case laboratory, model challenge format, failure museum, accessibility components, synthetic fixtures, and a research-in-a-box teaching kit.

See [ROADMAP.md](ROADMAP.md) for the end-to-end status of each project.

## Projects

- `firewall/` — validate and explain model outputs before they reach an interface.
- `cases/` — machine-readable adversarial fictional cases and expected behaviors.
- `museum/` — curated failure cards plus a catalog of truncated, evidence-linked fictional benchmark records.
- `challenge/` — browser scorer, CLI scorer, example submission, and reproducibility rules for model comparisons.
- `design-system/` — accessible interface patterns and usage guidance.
- `research-in-a-box/` — student protocol, rubric, and analysis workflow.
- `evaluator/` — structured semantic-review rubric and annotation report generator.
- `atlas/` — searchable, descriptive index of benchmark runs and validator findings; local reports can be loaded for comparison.
- `red-team/` — offline kit for authoring and validating fictional adversarial cases.
- `environment-lab/` — sensor-free room-condition simulator with explicit feedback export.
- `reading-lab/` — fictional reading-presentation experiment with local feedback export.
- `repro-challenge/` — frozen v1 protocol and reference submission for independent reproduction.
- `site/` — a static entry point for all public materials.

Everything uses fictional examples. The platform does not infer a real person’s wishes, diagnose anyone, or claim clinical effectiveness.

The code is released under the MIT license. See [CONTRIBUTING.md](CONTRIBUTING.md) before adding cases or model results.

The release manifest is in [RELEASE-MANIFEST.json](RELEASE-MANIFEST.json); repository citation metadata is in the root [CITATION.cff](../CITATION.cff).

Open `site/index.html` for the public entry point, `museum/index.html` for the interactive failure cards, `challenge/index.html` to score a JSONL file entirely in the browser, or `red-team/studio.html` to author and export a fictional case.

The [Environment Lab](environment-lab/index.html) demonstrates explicit room-condition feedback, and [CONTRIBUTING.md](CONTRIBUTING.md) describes the path for proposing new fictional cases.

Rebuild the evidence catalog with `python3 museum/build_catalog.py` after a benchmark report changes.

Build the readable Atlas report with `python3 atlas/build_report.py -a atlas/atlas.json -o atlas/ATLAS-REPORT.md`.

After a verified review pair exists, import its metadata without mixing it into benchmark records: `python3 atlas/import_review.py review-verification.json -a atlas/atlas.json -o atlas/atlas-with-review.json`.

Run the complete offline release gate with `python3 release_check.py`; it writes `release-check.json`.

Build the shareable platform archive with `make package` from this directory; the target runs the gate, writes `../phraselab-platform.zip`, and records its SHA-256 in `../phraselab-platform.zip.sha256`.

The same gate runs in GitHub Actions for pushes and pull requests (`.github/workflows/phraselab.yml`).

The semantic evaluator intentionally keeps reviewer judgments separate from deterministic firewall results. It validates annotation structure and summarizes dimensions; it does not convert ratings into clinical claims.

## First local check

```bash
python3 -m unittest discover -s firewall/tests -v
python3 validate_cases.py
```
