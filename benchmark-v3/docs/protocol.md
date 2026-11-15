# Frozen experiment specification

7 September 2026 · Benchmark v1.0.0 · Constructed-case engineering experiment

## Question and scope

For one pinned local model, how do basic prompting, explicit context-aware instructions, and a second structured-review pass differ in detectable scenario-consistency risks, repeated cards and output compliance? This is a model/interface benchmark, not research with human participants and not a test of clinical benefit. All cases are authored fiction.

The completed authoring review remains relevant: [ASSETS 2025](https://arxiv.org/html/2507.21811v1) reported mixed quality alongside preparation efficiency in a different VSD task. Our work neither replicates that human study nor establishes a novel clinical intervention. [Qwen's model card](https://huggingface.co/Qwen/Qwen3.5-0.8B) describes the 0.8B model as suited to prototyping/research. [llama.cpp server documentation](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) documents the local inference interface. Model, conversion and runtime revisions are recorded in model-lock.json.

## Cases and conditions

Twelve original English cases across six domains: craft, food, music, outdoors, social activity and routines. Six cases ask for at most three words per card; six permit eight. Profiles vary in age, stated preferences and uncertainty. Some have a known dislike; others include another person's preference, a past choice or unspecified personal history. These are not a representative sample of neurodivergent people or languages. No diagnosis is inferred from a communication style.

All conditions receive the same complete public case, including facts and style. Annotation fields used by the scorer are excluded from model input. Basic receives a concise generation instruction. Context receives that same instruction plus explicit grounding, variety and agency considerations. Review receives the exact context-condition output and case in a new request, plus a review instruction. This tests a prompting workflow; it does not separate extra compute from review content. No claim about the original graphical editor's effect follows.

Request exactly six strings in a JSON object under `cards`; no JSON grammar constraint is applied. Invalid JSON, missing cards and truncation count as failures, never silently repaired or discarded. Cases are held fixed after preregistration. Three predetermined generation seeds (17, 29, 43) yield 36 outputs per condition, 108 final outputs and 108 model calls, since the context draft is reused for its paired review. Review seeds are the generation seed + 1000. Basic and context generation use the same seed as a blocking label, not an assertion of identical randomness under different prompts. Each call uses a fresh message history; no chat history crosses cases.

Case-seed pairs are shuffled with schedule seed 20260907. Basic/context order alternates by scheduled pair; review follows its context parent. Cache is disabled in requests where supported. Temporal dependence and CPU contention can remain. Record runtime settings and timing; timings are observed engineering measurements, not controlled throughput benchmarks.

## Configuration and stopping rule

Model: Qwen3.5-0.8B converted by ggml-org, Q8_0 quantization; exact content SHA256 and repository revision in data/model-lock.json. llama.cpp runtime release b10853; CPU, two inference threads, one server slot, 4096-token context. Text-only use, thinking disabled, temperature 0.7, top_p 0.8, top_k 20, min_p 0, repeat_penalty 1, maximum 256 output tokens. Keep complete request payloads, responses, finish reasons, token counts, wall duration and seeds. Fixed software-smoke case is outside the benchmark and cannot inform score/prompt tuning.

Freeze cases, prompts, scorer, references and protocol in a timestamped SHA256 manifest before benchmark requests. Complete the 108-call schedule unless an external interruption prevents it. Save each result atomically. Resume only missing IDs under the same frozen configuration. Network/runtime errors are recorded as failed attempts; do not regenerate valid but poor outputs. Any substantive change after freezing requires a new experiment version and disclosure, not overwriting the original trial. Smoke infrastructure fixes are allowed before freezing.

No API fee is incurred by local inference. Record model download size, tokens and measured inference wall time. Electricity and hardware costs are not measured and are not zero just because API fees are zero.

## Prespecified measurements

Primary descriptive endpoint: proportion of case-seed outputs with at least one **rule-flagged consistency risk** among parseable outputs, alongside the invalid-output denominator. The rules detect only explicit positive liking assertions about known negative topics and a narrow set of unsupported autobiographical/medical assertions. These are candidates for inspection, not a semantic oracle or a validated hallucination metric. Zero flags is not proof of factual correctness. Flag precision/recall is assessed on authored reference examples only, not extrapolated to generated data.

Secondary: JSON/card-count validity, exact normalized duplicate cards, over-limit card count, lexical refusal/question/comment/social indicators, interest-word mentions, total input/output tokens and wall time. Function indicators overlap, omit synonyms and cannot establish usefulness or true communicative function. Scores are separate; no aggregate “quality” score or automatic winner is defined.

Compare review minus context and context minus basic within each case after averaging the three seed runs. Report raw numerators/denominators and mean paired differences with exploratory 95% bootstrap intervals resampling the 12 cases (10,000 draws, seed 20260907). Cases, not cards or repeated draws, are the resampling unit. When invalid outputs make a pair undefined, omit that pair for the corresponding conditional metric and report its denominator; never treat missing text as error-free. Also report an all-output composite of invalid output OR any risk flag, so improving parseability cannot hide denominator changes.

## Reference labels and audit

Reference examples include clearly conflicting cards, grounded alternatives, negations, harmless requests and known detector blind spots. Expected labels and rationale are fixed before running the model. Tests establish implementation behavior on these examples; they do not validate the instrument clinically. The model never receives the reference labels or annotation fields.

Inspect a prespecified illustrative subset after scoring: seed 17 for craft-glue, food-unknown, social-story and routine-change in all three conditions (12 outputs). The assistant preparing the benchmark performs the audit with access to condition; it is not independent, human expert or blinded annotation. Record observed failures, false positives and missed issues without retroactively changing frozen score rules. Keep all raw outputs available for independent review.

## Interpretation limits

One tiny quantized model, 12 constructed English cases and three seeds cannot characterize frontier models or everyday AAC use. The designer knows the cases and rules. Review uses extra compute and may improve structure while reducing useful variety or introducing assertions. A future study should independently author held-out cases, use qualified raters and compare additional models. No treatment, child-benefit, global-novelty or deployment claim is supported.
