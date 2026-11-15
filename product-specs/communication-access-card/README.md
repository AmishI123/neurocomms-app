# Communication-access card

Open the app at:

`http://localhost:8765/product-specs/communication-access-card/index.html`

Read the product requirements document at:

`http://localhost:8765/product-specs/communication-access-card/PRD.md`

## Run locally

From `/home/mehta/neuro-divergent`:

```bash
python3 -m http.server 8765
```

Then open the app URL above.

The app is local-first. It uses browser local storage only after the user chooses to save. It has no account, analytics, external API, or cloud database. The service worker caches the app shell after the first HTTP load so core editor, preview, save, print, and export flows can work offline.

## Files

- `index.html` — accessible app shell;
- `styles.css` — responsive, print, and focus styles;
- `app.js` — card editor, preview, persistence, export, and sharing;
- `sw.js` — app-shell cache for offline core use;
- `PRD.md` — requirements, user stories, acceptance criteria, and boundaries.
- `verification.md` — browser, offline, accessibility, and packaging checks.
- `package-release.mjs` and `verify-release.mjs` — reproducible standalone package and clean-extraction check.
- `release-record-2026-09-17.md` — the current archive identity and exact check results.

## Test

With the local server running:

```bash
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu \
  node --test product-specs/communication-access-card/tests/communication-access-card.test.cjs
```

## Build a standalone package

From `/home/mehta/neuro-divergent`:

```bash
node product-specs/communication-access-card/package-release.mjs
```

The command writes a deterministic archive and manifest under
`artifacts/communication-access-card/`. Extract the archive into a fresh
directory and run:

```bash
node product-specs/communication-access-card/verify-release.mjs \
  --root=/path/to/extracted \
  --manifest=/path/to/archive.tar.gz.manifest.json
```

The package contains the app, requirements, verification record, and repeatable
browser checks. It contains no user data or secrets. The browser checks accept
`COMMUNICATION_CARD_URL`, so the same checks can run against a freshly
extracted package rather than the source tree.
