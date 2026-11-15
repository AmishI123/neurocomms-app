# PhraseBench v2: held-out model comparison

A reproducible second-model run using 12 new fictional cases authored after the first benchmark was frozen. It repeats three workflows—basic prompting, context-aware prompting and generation followed by structured review—using Qwen2.5-0.5B-Instruct-GGUF. The original v1 archive remains under `benchmark/`.

## Read and inspect the completed experiment

- `dashboard.html`: standalone interactive results explorer; open directly in a browser after the run is complete.
- `REPORT.md`, `REPORT.html`, `REPORT.pdf`: technical report with measured outcomes and limitations.
- `results/raw/`: all 108 actual request/response records. Each ID is case + seed + condition.
- `results/analysis.json`: computed measures, paired comparisons and resource accounting.
- `results/audit.json`: condition-visible assistant inspection of prespecified outputs, with any extra examples labeled post-hoc.
- `data/frozen-manifest.json`: inputs/settings frozen before experimental requests.
- `docs/protocol.md`: question, sampling schedule, rules and interpretation boundaries.

All cases are original fiction. These are measured model outputs, not participant outcomes. Automatic flags are narrow screening proxies and do not certify correctness or useful communication.

## Recompute without any model download

From the repository root:

```bash
python3 -m unittest discover -s benchmark/tests -v
python3 benchmark/analyze.py
python3 benchmark/plot_results.py
python3 benchmark/build_report.py
```

The analysis refuses an incomplete schedule or changed frozen cases/prompts/scoring/runner/protocol. The report builder requires the audit. The workspace uses Python 3.12. Scoring and report generation use the Python standard library and saved raw records. Plotting additionally requires Matplotlib, available in this workspace; its version is pinned in requirements-figures.txt and recorded in qa/runtime-environment.json. Rendering the optional PDF and browser tests uses the benchmark's pinned Playwright development dependency. Run `npm ci` and `npx playwright install chromium` inside `benchmark/`, then `npm run test:browser`; Linux browser system dependencies must also be available. The browser test produces REPORT.pdf. Optional `qa/check_pdf.py` uses PyMuPDF to inspect PDF bounds and render pages; it is available in the parent project’s local research tools in this workspace. See `qa/verification.md` for this workspace's command.

## Run the pinned local model

This run uses Linux x86_64, two CPU inference threads and no GPU. The approximately 522 MB Qwen2.5 model file and runtime archive are stored in the ignored `.benchmark-runtime/` directory. Allow additional memory for inference. No API key or paid account is needed.

```bash
python3 benchmark/setup_local.py
.benchmark-runtime/llama-b10853/llama-server \
  -m .benchmark-runtime/qwen2.5-0.5b-instruct-q5_k_m.gguf \
  --host 127.0.0.1 --port 8791 -t 2 -tb 2 -c 4096 -np 1 \
  --reasoning off --no-cache-prompt --cache-ram 0 \
  --alias qwen2.5-0.5b-q5_k_m
```

In a second terminal:

```bash
python3 benchmark/run.py run
```

The supplied run is already complete, so this command verifies and skips existing records. To replicate inference independently, copy the benchmark directory to a new sibling directory and remove that copy's `results/raw/`, `results/server-props.json` and derived results/report artifacts before running its runner. Preserve the original data. The copied frozen manifest identifies the same experiment inputs; record the replication's hardware/runtime details separately. A seed alone does not guarantee identical text across different builds/hardware.

For a **new experiment**, copy the directory, modify the design, remove that copy's frozen manifest and output records, and freeze anew before running. Do not edit the archived experiment's frozen inputs or relabel its outcomes. Model comparison needs a separately identified lock/configuration and compatible runner; no additional model has been evaluated here.

`setup_local.py` downloads fixed public release/model URLs, verifies their published digests, and writes model-lock.json. It does not run downloaded install scripts or install system packages. Model license: Apache-2.0; llama.cpp: MIT. See their upstream repositories for complete terms.

## Design in one paragraph

Twelve cases × three seeds × three workflows yield 108 final outputs. Context drafts are reused as inputs to their paired review, so there are also 108 actual calls. All generation conditions receive the same public facts and style. Metadata for the lexical scorer is excluded. Each request has a fresh conversation history. No semantic judge model or human expert rating is used. All poor, malformed or truncated responses remain in the archive.

## What a low flag count means

It means the frozen patterns detected fewer candidates. They miss many unsupported assertions, misread some fictional framing, and do not distinguish every phrase usable by a person from advice about that person. Reference examples and the output audit make those weaknesses visible. Exact duplicates, length limits and lexical function indicators are separate measures, not an overall quality score.

## Data and cost conventions

A record's `wall_seconds` and response `usage` describe that call. Review's **workflow** totals add its context parent, because a practical two-pass method needs both. Experiment cost totals sum each actual call once. API fees were zero for local inference; electricity, hardware and development time were not priced. All raw output text is inert data; dashboard rendering uses text nodes and escapes embedded JSON.
