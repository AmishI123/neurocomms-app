# Move to another device without starting over

Status: completed as an engineering release. All 193 current-source checks and the 152-file extracted-release verification passed, including transfer back between isolated browsers and ten HTML documents. See product-specs/my-visit-notes/transfer-acceptance-audit.md and its matching release manifest/verification. User benefit remains unverified.

## Outcome

Someone can prepare on one browser, download one private transfer file, preview it in another browser, continue offline with their questions and unfinished preparation intact, then bring the updated work back without overwriting different copies.

This is a deliberate file transfer, not automatic syncing, an account or a shared workspace.

## Full delivery

1. One guided file containing saved visits, follow-up history, saved preparation and its completed results, reusable communication requests, focus and reading choices. Explicitly account for unsaved visit and preparation work; never silently omit it.
2. A read-only restore preview showing additions, identical content, different copies, absent references, omitted recovery material and optional settings before confirmation.
3. Preserve both versions of different records. Keep copied-source links, preparation destinations, completed results and replay-prevention records attached to the correct imported records. Repeated import must not repeat additions.
4. Offer deliberate continuation of an imported saved visit, saved preparation or included temporary draft. Preserve the receiving browser's open work until the person explicitly replaces it. Explain anything that cannot be continued.
5. Keep existing data intact on damaged files, unsupported versions, oversized input, failed writes, stale previews, cancellation, repeated clicks, interrupted writes and concurrent tabs. Do not restore recently deleted material automatically.
6. Demonstrate two isolated browser profiles: prepare, save, export, restore, continue offline, record progress, export back and preserve both versions. Include complete browser restarts and old-file compatibility.
7. Deliver working software, plain-language PRD, fictional walkthroughs, executive/conference HTML with speaker notes, requirement-level acceptance evidence, current regression checks and an extracted verified release.

## Boundaries

No cloud storage, automatic synchronisation, notifications, medical interpretation or sending. Files are private and unencrypted; say so before download/import. Do not describe an exported file as proof it was stored safely elsewhere. No participants are required. Software tests cannot establish usefulness, physical-phone usability or screen-reader usability.
