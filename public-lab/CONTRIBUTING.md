# Contributing to PhraseLab

Contributions should use fictional data and include a reproducible command. New cases must state confirmed facts, unknown facts, word limits, forbidden topics, and expected behaviors. New scoring rules need an example that passes and an example that fails.

Model submissions use the JSONL format in `challenge/SUBMISSION.md`. Include the model name, version or revision, runtime settings, and a checksum where possible. Do not submit personal communication logs, diagnoses, identifying details, or claims of clinical effectiveness.

Please describe limitations and known failure modes alongside improvements. A lower deterministic failure rate is not sufficient evidence that a system is more useful to a person.

To propose a case, use the repository issue form **Propose a fictional red-team case**. Once a proposal is accepted, convert it to the JSON shape in `red-team/README.md`, run `python3 red-team/validate.py your-cases.json`, and include the command output with the pull request. The case studio at `red-team/studio.html` can create a six-card submission and the local runner can produce a report.
