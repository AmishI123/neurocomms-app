# Fix a mistake without starting over

Status: complete as an engineering release. All 139 current-source checks passed; the 122-file archive passed extracted-app recovery, deterministic rebuilding, file hashes and document checks. The final archive identity is recorded in `product-specs/my-visit-notes/releases/manifest.json` and its matching `verification.json`. User benefit, physical-phone use and screen-reader use remain unverified.

## Outcome

Someone who removes a question, changes important wording, deletes a visit or preparation, or adds the wrong passages can inspect what happened and recover the needed content without replacing unrelated newer work. Nothing is shared as a result of recovery.

## Required delivery

1. Persistent, visible recovery for removed questions and next steps, including their notes, dates, contacts and states. No disappearing deadline button.
2. A recovery area for removed visits and saved preparations, with explicit retention, privacy and permanent-erasure controls.
3. Preview earlier wording and restore individual fields without replacing unrelated changes.
4. Review additions made together, select unwanted additions and show their current edited content before removing them.
5. Offline and restart support; safe writes across tabs; failure and cancellation leave saved data intact; explicit backup boundaries; no automatic sharing.
6. Detailed plain-language requirements, fictional walkthroughs, executive HTML presentation, automated acceptance evidence and a verified release.

## Boundaries

No accounts, cloud storage, medical advice or unlimited sensitive history. No participant dependency. Technical checks do not prove benefit to people or physical-phone accessibility.

## Completion audit

Map every requirement above to current code, test results and the packaged release. Exercise both successful recovery and rejected stale recovery. Inspect the rendered product and presentation. Preserve earlier product behaviours and report remaining limits honestly.
