# My Visit Notes: clean local launch closeout

Run date: 2026-09-16
Decision: **Web beta package is reproducible and ready for controlled engineering use**

## What changed

Added `product-specs/my-visit-notes/serve-local.mjs` so a reviewer can launch
the app from its folder with:

```sh
node serve-local.mjs
```

It listens only on `127.0.0.1:8765`, serves the app files, returns a clear 404
for missing files, rejects encoded path traversal and does not publish the app
to the local network.

## Evidence

| Check | Result |
|---|---|
| Local server root page | Pass |
| Missing file response | Pass, HTTP 404 |
| Encoded path traversal | Pass, HTTP 404 |
| Release archive | Pass, 230 files |
| Full extracted release gate | Pass |
| Browser | Chromium 145.0.7632.6 |
| Archive SHA-256 | `9194f50a63ea932a6cef8658d8a487a5a2bbd9aae06614486bdbed272162a491` |

The archive was rebuilt after adding the server and README instructions. The
full `tests/release.mjs` gate passed using temporary browser libraries loaded
through `LD_LIBRARY_PATH`; no system packages were installed.

## Beta decision

The web package is ready for controlled engineering use with fictional or
explicitly approved test data. Use the controlled beta plan for task records,
severity levels, stop rules and rollback.

Android and iOS are still separate pending native build and runtime evidence.
