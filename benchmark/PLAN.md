# Completed benchmark milestone

Completed 8 September 2026 after “start” authorized the independent benchmark proposal.

1. **Cases and scoring:** 12 original fictional cases across six domains; fixed reference examples, lexical rules and pre-request input hashes.
2. **Model and workflows:** pinned local Qwen3.5-0.8B Q8_0 and llama.cpp b10853; basic, context-aware and paired review prompts.
3. **Actual experiment:** 108 calls completed, 36 outputs per workflow, three seeds per case; complete raw requests/responses, timings and token usage archived.
4. **Analysis and artifacts:** paired case-bootstrap comparisons, prespecified 12-output audit, interactive dashboard, standalone figures, Markdown/HTML/PDF technical report.
5. **Verification and handoff:** Python tests, browser workflow tests, source/output consistency checks and PDF checks; see qa/verification.md and README.md.

The extra review pass did not establish a quality benefit on this constructed-case experiment. The audit documents weaknesses missed by the narrow automatic flags. These findings concern one small model/configuration and do not establish clinical usefulness or global novelty. No participant data or study is involved.

The next independent extension would strengthen held-out cases and semantic assessment, then evaluate another model as a separately identified experiment. Preserve this run unchanged. This milestone is saved locally; no new commit/push was requested.
