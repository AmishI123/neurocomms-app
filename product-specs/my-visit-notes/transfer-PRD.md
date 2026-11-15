# Move to another device without starting over

Status: engineering delivery complete. All 193 current-source checks passed. The 152-file extracted release and requirement-level evidence are recorded in transfer-acceptance-audit.md and the matching release manifest/verification. Usefulness remains unverified.

## The problem in the current product

Visit-library backup excludes saved preparation and chosen focus. Preparation has its own backup, and reading choices are separate. Someone moving browsers must assemble these pieces themselves. The new transfer flow should keep that work together without turning different copies into a single silently overwritten record.

This is a verified software gap, not evidence of how frequently people change devices or whether they prefer file transfer. Existing individual backups remain supported.

## T1 — One deliberate private transfer

Add a separate transfer entry point without changing the four first-use choices. Explain that the file is unencrypted and contains private source notes, answer notes, follow-up history, copied-source context and preparation results. Show counts and exact inclusion choices before download.

Include all current saved visits, preparations, completion identifiers, reusable requests and the chosen focus. Include reading choices with a clear distinction between current page choices and saved choices. Reading choices can be left out. Do not download or change storage merely by opening the flow.

An unsaved visit or unsaved preparation must be visible in the review. Let the person explicitly include an independent snapshot or explicitly leave it out. Never substitute the last saved version for newer unsaved work while calling the file complete. Temporary follow-up message drafts must be copied/downloaded in their own tool before opening transfer; if they cannot be retained by the transfer, say so.

Recovery records and removed objects are excluded. Explain how to recover wanted material first. Current preparation copies can independently retain old source content; disclose this rather than claiming the file contains no older words. Downloaded files remain outside the app's deletion controls.

## T2 — Inspect before changing the receiving browser

Read a supported transfer file with a documented byte limit, validate every included record and reject malformed or unsupported data before any write. Show additions, exact matches and differing records with enough wording/title/source to distinguish them. Show missing references and never silently redirect them to an unrelated local visit.

Nothing starts selected for replacement because import does not replace existing records. Different copies are added separately, with new identities as needed. The preview must disclose private contents and retain the user's choice to cancel. An identical file already imported should report that fact without adding records again, even when its earlier imported records were subsequently edited or deleted.

## T3 — Preserve meaning and links

Map each source visit identity to the correct added or identical local visit. Carry this mapping into copied-item source links, saved preparation destinations, embedded draft snapshots, completed-result links, completion records and focus. Preserve immutable original source context while changing only the local link.

Preserve different preparations as separate records. Keep their pending passages, source text, selected destinations and retained results intact. A missing saved destination stays unavailable; it must not connect to an unrelated same-ID record already on the receiving browser. A temporary result remains temporary unless separately saved by choice.

Completion identifiers must still prevent replaying an old pending batch. A collision between two recorded results must preserve both results and their own completion records without allowing an older pending file to repeat a completed addition. Include explicit tests of transfer back to the first browser, not just fresh-browser imports.

Keep a small local import record atomically with the imported notes so the same transfer is not silently applied again. The import record contains identities and mappings, not duplicate private wording. It is not proof a file exists on another device. It must remain compatible with permanent deletion: re-opening an already imported file does not resurrect deleted notes.

Explain that those local fingerprints/identifiers remain after note deletion. Offer a separate confirmed **Forget previously restored files** action that erases only these records, not notes/settings. Warn that importing a file again after forgetting may deliberately bring back previously deleted records. No separate record of forgotten transfers is retained.

## T4 — Continue intentionally

After successful restore, show what was saved and offer to open an imported visit or resume a saved preparation. Included unsaved snapshots are labelled as such and must remain distinguishable from the older saved copy. A temporary draft must not quietly become a normal saved visit merely by previewing or downloading.

Do not replace the receiver's open draft or unsaved preparation as a side effect of import. Use existing replacement warnings before deliberately continuing imported work. A repeated import can offer surviving imported records; when an earlier imported record was deleted, explain that it is unavailable instead of recreating it.

Incoming focus and reading settings are optional receiving-side choices, not automatic replacements for local choices. Notes and their import record commit together under the existing storage lock. Reading settings use a separate storage key: apply them as a clearly reported second step after notes commit, with retry if settings fail. Do not claim that two separate browser writes are atomic. A settings failure must never roll back or duplicate already imported notes.

## T5 — Honest failures and privacy

Failed note writes leave visits, preparation, completion records, focus and import history unchanged. A settings-only failure reports exactly what was saved and what was not. Keep enough preview/file state to retry without repeating additions.

Refuse stale previews after either local edits or another tab changes saved notes. Cancelled queued work and a closed tab must not apply later. Repeated clicks must make at most one import. Invalid files leave the open draft and stored data untouched.

No external requests carry personal content. Export/import is explicit and local; no automatic sending, cloud recovery, compression service or remote parsing is added. Opening/searching imported notes must retain existing private-summary boundaries.

## T6 — Offline, access and compatibility

Transfer operates offline after the app shell is ready. Test a full browser restart after import and another after continued edits. Keep the previous supported visit/library/preparation file readers. Opening older data must not rewrite it; a versioned collection upgrade occurs only on an explicit successful write.

Label file inputs, checkboxes, buttons, errors and progress in simple words. Support keyboard review and confirmation, narrow screens, long source text and enlarged reading choices. Focus should land at the useful beginning of a preview and return sensibly after cancellation. Do not rely solely on colour or transient notices.

## T7 — Full proof and delivery

Model tests cover complete export/read, all reference types, conflicts, duplicates, missing sources, receipt safety, private boundaries, file validation and old collection migration. Browser tests cover two isolated profiles and transfer back, unsaved inclusions/exclusions, offline restart, exact restore preview, continuation, settings failure, saved-write failure, cancellation, closed tabs, stale edits and accessibility checks. Keep all existing regression suites as gates.

Deliver eight or more fictional full journeys, detailed shared help/README, executive/conference HTML with actual screens and speaker notes, requirement-level acceptance map and a deterministic archive. Exercise the transfer in the extracted release, check links/images/layout and visually inspect actual rendering.

No participant recruitment is required or implied. Passing checks establish specific software behaviour, not preference, demand, clinical benefit, physical-device usability or screen-reader certification.
