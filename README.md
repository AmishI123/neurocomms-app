# Neurocomms

> **About this repository.** This is a clean public copy of a private working repository, with the history and a 1.7 GB archive of earlier prototypes left out. The work was built with AI coding tools, with advice and guidance from my father. Everything uses fictional cases and made-up demo data. It makes no clinical, participant or market claims. It sits alongside my mouse visual-cortex study: https://github.com/AmishI123/neuroscience-project

## Neurodivergence research workspace

## Start here

This repository is now organized around a canonical handoff layer:

1. [`PROJECT-STATUS.md`](PROJECT-STATUS.md) — what is current, what is proven, and what remains open.
2. [`AGENTS.md`](AGENTS.md) — rules for any coding/research agent.
3. [`docs/README.md`](docs/README.md) — documentation index.
4. [`docs/adr/ADR-001-background-research-and-problem.md`](docs/adr/ADR-001-background-research-and-problem.md) — background research and evidence limits.
5. [`docs/adr/ADR-002-product-direction-and-support.md`](docs/adr/ADR-002-product-direction-and-support.md) — product decision and support model.
6. [`docs/PRESENTATION-RUNBOOK-SUNDAY.md`](docs/PRESENTATION-RUNBOOK-SUNDAY.md) — presentation story and demo steps.

The detailed historical documents remain available, but an agent should not infer the current plan from filenames such as `NEXT-MEATY-GOAL-*` without checking `PROJECT-STATUS.md` first. See [`docs/WORKSTREAMS.md`](docs/WORKSTREAMS.md) for ownership and [`docs/ARCHIVE-MAP.md`](docs/ARCHIVE-MAP.md) for the naming transition.

## Public showcase

[Open the PhraseBench showcase](site/index.html) · [Download the showcase package](phrasebench-showcase.zip)

The showcase links to the local-first Phrase Studio demo and the inspectable PhraseBench v3 benchmark. It uses fictional cases and makes no clinical or participant-data claims.

## PhraseLab platform

[Open the PhraseLab lab](public-lab/site/index.html) · [Platform README](public-lab/README.md)

PhraseLab is the next public project layer: a deterministic communication safety firewall, adversarial fictional fixtures, a model-submission format, accessible interaction patterns, a failure museum, and a research-in-a-box teaching kit.

The current showcase also includes the [Live Atlas](public-lab/atlas/index.html), [red-team Case Studio](public-lab/red-team/studio.html), and [Environment Lab](public-lab/environment-lab/index.html) simulator.

The repository includes a GitHub Pages workflow. Configure Pages to use **GitHub Actions**; pushes to `main` run the release gate and publish the repository-root showcase, including Phrase Studio and the PhraseLab tools.

Research and technical prototypes exploring communication support, using clearly separated evidence, fictional examples and proposed participant studies.

## PhraseBench: independent model benchmark

[Benchmark guide](benchmark/README.md) · [Frozen protocol](benchmark/docs/protocol.md)

Compares basic prompting, context-aware instructions and a structured model review pass on original fictional cases. Actual local-model outputs, a results dashboard and a technical report live in `benchmark/`. See `benchmark/PLAN.md` for completion status. No human-participant outcomes or clinical benefit are claimed.

## Phrase Studio: adult authoring prototype

[Open the app](communication-tool/index.html) · [Guide](communication-tool/README.md) · [Mentor proposal](communication-tool/docs/mentor-brief.pdf)

Two editor versions support preparing supplemental communication cards. The package includes fictional cases, a draft scoring rubric and a proposed adult study. The prototype is complete; a participant study has not been conducted.

## Starting evidence review

[Research opportunities PDF](research-opportunities.pdf) · [Report source](report-source.md) · [Evidence ledger](evidence-ledger.md)

A focused opportunity review of communication, sensory environments and broader alternatives. It is not an exhaustive systematic review or a claim of global novelty.

`PROJECT-CONTEXT.md` records decisions and the current handoff. Local model weights, downloaded runtimes and development dependencies are ignored by Git.

When returning to the project, start with [`NEXT-MEATY-GOAL.md`](NEXT-MEATY-GOAL.md). It records the next end-to-end milestone, current evidence, exact commands, and the remaining independent-review handoff.
