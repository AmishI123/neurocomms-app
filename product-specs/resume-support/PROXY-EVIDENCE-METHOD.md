# Proxy validation amendment v2

This amendment records the decision to continue without recruiting or interviewing participants. The validation endpoint is therefore a **proxy decision** based on the frozen public LinkedIn/Reddit corpus and a static, local-only prototype audit. It does not convert public posts into interviews, consent, or representative prevalence estimates.

## Decision method

- Deduplicate the 1,555 text-bearing records by URL (or normalized text when no URL exists).
- Score three concept directions with transparent phrase dictionaries: resume after interruption, workplace/communication accommodation, and energy/sensory pacing.
- Report counts, platform split, request-language hits, privacy-risk language, and representative source links. Counts are directional signals, not population estimates.
- Audit the prototype source for local-only behavior, undo/delete controls, export transparency, and visible concept coverage.
- Recommend the strongest proxy-supported direction for the next build, while retaining participant validation as an open requirement before any high-confidence product or clinical claim.

## Limitations

The corpus is query-selected, public, and partly duplicated across searches. Phrase matching misses implicit experiences and can include posts that mention a topic without describing a need. No participant consent, demographic verification, interview, or observed task session is present. The report must be read as a prioritization artifact for deciding what to test next.
