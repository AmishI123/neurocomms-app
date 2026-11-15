# PhraseLab Live Atlas report

Generated from `build_atlas.py`.

> This is a descriptive index of fictional benchmark records. Runs use different case sets; rates do not establish model superiority, communication benefit, or clinical effectiveness.

## Run inventory

| Run | Model | Cases | Workflows |
|---|---|---:|---|
| v1 | Qwen3.5-0.8B | 12 | basic: 31/36 valid, context: 33/36 valid, review: 31/36 valid |
| v2 | Qwen2.5-0.5B | 12 | basic: 5/36 valid, context: 9/36 valid, review: 0/36 valid |
| v3 | Qwen2.5-0.5B constrained | 12 | basic: 16/36 valid, context: 16/36 valid, review: 7/36 valid |

## Validator tags

| Tag | Records |
|---|---:|
| card count | 150 |
| overlong card | 139 |
| parse failure | 122 |
| truncated | 54 |
| risk flag | 6 |
| repetition | 1 |

## How to read this

A `valid format` tag means the deterministic parser accepted the record. Other tags describe parse, length, count, repetition, or risk-flag findings. These checks say nothing about whether a phrase is useful, wanted, or appropriate for a real person.

The interactive view can load local community reports. Those records are user-supplied and remain separate from the controlled benchmark inventory.
