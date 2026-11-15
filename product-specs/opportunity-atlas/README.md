# Communication and learning product opportunity atlas

## Executive report, talk, and complete product briefs

Start at [presentation/index.html](presentation/index.html). It links to the detailed findings report, 17-slide conference-style talk with speaker notes, comparison, and nine full product briefs. The briefs include proposed features, screens, checks, data handling, failure cases, build order, and open questions.

The [next end-to-end goal](NEXT-MEATY-GOAL.md) carries this documentation into source review, selection of one build, implementation, and evaluation. The package is based on the saved evidence; it does not add a new Reddit collection, user study, or conference acceptance.

The first product-choice slice is recorded in [decision-report.html](decision-report.html) and [decision-record.json](decision-record.json). It selects the existing communication-access card for the first engineering review because its full local flow already exists and passed 6/6 browser checks. No participant or demand result is claimed.

Rebuild the presentation HTML with `node product-specs/opportunity-atlas/presentation/build.mjs` from the repository root. Edit `presentation/content.mjs` for area and product content, and `presentation/build.mjs` for report structure. Generated HTML is stored alongside its source for direct reading.

Open the reader-facing atlas here:

`http://localhost:8765/product-specs/opportunity-atlas/index.html`

Start with `index.html`. It links to the four main pages:

- `autism.html`
- `down-syndrome.html`
- `dyslexia.html`
- `aac.html`
- `dld.html`
- `dyscalculia.html`
- `dcd.html`
- `intellectual-disability.html`
- `aphasia.html`

Then read `comparison.html` to compare the product directions and `methods-and-evidence.html` to understand what the evidence can and cannot show.

The comparison area now also has detailed pages for DLD, dyscalculia, DCD, intellectual disability, and aphasia.

## Serve locally

From `/home/mehta/neuro-divergent`, run:

```bash
python3 -m http.server 8765
```

Then open the HTTP URL above.

## Research files

- `evidence-ledger.json` — claim-by-claim evidence record;
- `sources.json` — main source list;
- `comparison-sources.json` — source list for the additional comparison areas;
- `research-summary.md` — current synthesis;
- `research-log.md` — search lanes and source decisions;
- `comparison-scan.md` — DLD, dyscalculia, DCD, intellectual disability, and aphasia scan;
- `theme-coding.md` — how recurring themes are grouped;
- `open-questions.md` — unresolved research and product questions;
- `verification.md` — current checks and known limitations.

The pages are product hypotheses based on an initial research pass. They do not diagnose people or establish clinical benefit, prevalence, demand, or treatment effectiveness. The five comparison pages use smaller and more uneven evidence bases than the ADHD Reddit corpus; their source mix and limitations are explicit on each page.
