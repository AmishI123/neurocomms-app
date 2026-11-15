# Exploratory model-assisted semantic review

This is a separate exploratory artifact. It is **not independent human review** and must not be used to close the PhraseLab reproducibility release gate.

## Run

- Sample: the six fictional records in `review-packet.json`.
- Judges: pinned local `Qwen3.5-0.8B` and `Qwen2.5-0.5B` checkpoints.
- Calls: 12 total, two per record.
- Endpoint: local `llama-server`, one endpoint per checkpoint.
- Temperature: 0; deterministic per-record seeds derived from 1701.
- Raw result: `model-assisted-review.jsonl`.
- Offline failure summary: `model-assisted-review-summary.json`.
- Packet fingerprint for the archived run: `9b313b3c8a61484239e104b519ff14d5fab7fb0d35540c4bfbf39f2dd8a0f6ab`.
- Future runner rows also carry `packet_fingerprint`; this provenance field does not change the judgment type.

## Result

| Judge | Calls | Valid rubric judgments | Main outcome |
|---|---:|---:|---|
| Qwen3.5-0.8B | 6 | 0 | No usable structured content returned |
| Qwen2.5-0.5B | 6 | 0 | Echoed or reinterpreted the packet instead of returning the requested scores |

No scores or agreement values are reported. The small local checkpoints were not reliable enough for this rubric under the tested prompt and runtime. This result is a model-format/reliability observation, not evidence about the fictional communication outputs and not a substitute for independent human review.

The offline categorizer records Qwen3.5’s six empty outputs and Qwen2.5’s six packet/rubric-echo outputs separately. These categories describe output behavior only; they are not quality scores.
