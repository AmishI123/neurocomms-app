# Communication-access card release record — 2026-09-17

## Release identity

- Archive: `artifacts/communication-access-card/communication-access-card-4d6ad8e43d7915c1.tar.gz`
- Archive SHA-256: `c18d93bfb64b8f078e8da2ffc8252a9770a82f1b381d428d43ba3ce6edadd403`
- Runtime ID: `4d6ad8e43d7915c1b26ed867f6d7c863d1fc78f391af9fbb3f3780d01233ba85`
- Files in package: 9
- Independent normalized builds: 2; identical

The package contains the four app files, the PRD, README, verification record,
and the two repeatable browser test files. It contains no user data or secrets.

## Checks

- Source tree: 13/13 combined tests passed across feature, acceptance,
  decision-flow, and review-protocol checks.
- Fresh extracted package: 10/10 card browser tests passed at the package URL.
- Fresh extraction: exact 9-file set and all recorded hashes passed.
- Extracted `app.js` and `sw.js`: syntax checks passed.

Commands:

```bash
node product-specs/communication-access-card/package-release.mjs
node product-specs/communication-access-card/verify-release.mjs \
  --root=/path/to/extracted \
  --manifest=artifacts/communication-access-card/communication-access-card-4d6ad8e43d7915c1.tar.gz.manifest.json
```

The extracted browser run uses `COMMUNICATION_CARD_URL` to point the same tests
at the clean package rather than the source tree.

## Accessibility evidence refresh

The package was rebuilt after adding the standalone accessibility evidence suite
and the sharing dialog description. The new normalized package contains 10
files, has runtime ID `dbebbc68c56bb44a7e0bffbe1ab6e57d4bed9ef3f78ee1fe898e35a662a07a32`,
and has archive SHA-256:

```text
27c66eaeaa736b31de6cde881360c16202ba60dea758750592e487299ecb5edc
```

The complete source check set now passes 14/14. The added checks cover names
for initial and dynamic controls, the sharing dialog's title and description,
and live status regions. Fresh extraction verification passes with the exact
10-file set and matching hashes.

The keyboard-flow evidence was then added and the package was rebuilt again.
The current normalized package contains 11 files, has runtime ID
`28e4254042ca53643e8b195fc13d3d831301c520668a169825a47295f79570b4`, and has
archive SHA-256:

```text
7083abba0ab7e7abcb4b0a6ae2970abca4fe95a41c5dc467c2efa01d1919b9f9
```

The complete current source check set is 16/16, including the two keyboard
journey checks. The package build remains reproducible with two normalized
builds.

The accessibility-tree evidence was then added and the package was rebuilt
again. The current normalized package contains 12 files, has runtime ID
`eacb10955ade270084a54df77426de08801575eac7a53b961aa9fa1ad3bfea25`, and has
archive SHA-256:

```text
74d9826bc31d3eea1ea5077d5741745f4505fd150882a44a5413a523dcf6252a
```

The complete current source check set is 18/18. The added accessibility-tree
checks inspect the editor, preview, dynamic content, and sharing dialog
semantics. They do not claim a screen-reader session or human accessibility
outcome.

The accessibility-environment report was added to make the host boundary
explicit. The current normalized package contains 14 files, has runtime ID
`862da86dc43033e8ca4b0f74ec89ac8fc3aec9d5004e15f925739dff97ec0e01`, and has
archive SHA-256:

```text
39cf09369fefe16dbbdfd3ca3b6bd4854d264bd5483ea5f2e8137565c79986d4
```

Fresh extraction verification passes with the exact 14-file set. The report
found no screen-reader, switch-access, native Android, or native iOS execution
tool on this host; those results remain unclaimed.

## Boundaries

This is a reproducible local web package. It is not native Android/iOS
execution, a store submission, a security-vault certification, a participant
result, a clinical result, a demand estimate, or public deployment. The review
protocol remains prepared with zero sessions completed.

## Accessibility-focus refresh — 17 September 2026

The sharing-review dialog now keeps keyboard focus inside the dialog while it
is open. Forward and reverse tabbing stay within the close, cancel, and
continue controls, and Escape still closes the dialog and returns focus to the
button that opened it.

The current normalized package contains 14 files, has runtime ID
`27e3a4266f864c48610d5eec05db10728ce153e2a03e9921e1b5c411c3faed99`, and has
archive SHA-256:

```text
2d17d01a54df6f2edeef70ec21f8114aa480764de41e9c5550bc02a4fa7d0a38
```

The new focus-trap regression passed in the source and freshly extracted
package. The extracted package passed 19 browser checks across the core,
acceptance, accessibility, keyboard, accessibility-tree, and host-boundary
suites. This remains browser and accessibility-semantics evidence, not a
screen-reader session or human accessibility result.

## Current aggregate release audit

The current repeatable audit passed 22/22 checks. It verifies the selected
product decision, source files, full browser and decision-flow test set,
archive hash, fresh extraction, advisory LLM report, and the zero-session
review boundary.

- Audit: `communication-tool/ai-evaluation/results/communication-card-release-audit.json`
- Archive SHA-256: `e14cf1c67d09b4da074449b96832d6d2a3cc44df222d7737096b7820aae940c2`
- Participants: 0
- Human review: not completed
- Native Android/iOS execution: not verified

The LLM result is advisory engineering feedback only. It does not establish
usefulness, demand, clinical benefit, accessibility benefit, or approval.
