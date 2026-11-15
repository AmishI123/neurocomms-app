# My Visit Notes: beta feedback safety closeout

Run date: 2026-09-16
Decision: **Beta feedback records are safe to use for engineering runs**

## Delivered

The beta package now includes:

- `product-specs/my-visit-notes/beta/record-template.json`
- `product-specs/my-visit-notes/beta/README.md`
- `product-specs/my-visit-notes/beta/validate-record.mjs`
- `product-specs/my-visit-notes/tests/beta-record.test.mjs`

The record keeps build, device, task results, severity, failure code and
evidence paths. It rejects fields that could hold visit questions, answers,
private notes, source text, medical text or contact details. It also rejects
absolute and traversal evidence paths.

## Verification

| Check | Result |
|---|---|
| Valid template rules | Pass |
| Private-content field rejection | Pass |
| Invalid surface rejection | Pass |
| Invalid task state rejection | Pass |
| Unsafe evidence path rejection | Pass |
| Full extracted release gate | Pass |
| Release archive | 234 files |
| Archive SHA-256 | `5885e3f621052a5465f74773926b9ea8a37e76ccfb3de33a182c4a036d63a9c2` |

## Safe operating rule

Store only the record and paths to controlled screenshots or logs. Keep note
content out of issues, reports and external LLM prompts. Use the severity and
rollback rules in the controlled beta plan. The LLM may judge supplied evidence
but must not turn `Not run` into `Pass`.

This completes the feedback-capture safety layer. Native runtime evidence is
still a separate Android/iOS requirement.
