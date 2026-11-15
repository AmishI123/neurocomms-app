# Community production API handoff

This document describes the server-side reference boundary for the supervised community layer. It is an engineering handoff, not a launch approval.

## Runtime

From `communication-tool/`:

```bash
npm run community:api:test
npm run community:server:test
npm run community:integration:test
npm run community:production-audit
npm run community:recovery-check
npm run community:server
```

`deploy/Dockerfile.community` and `deploy/community.env.example` provide the non-secret container/configuration baseline. Mount `/var/lib/phrase-studio-community` as encrypted persistent storage, inject secrets through the deployment platform, run as the non-root `node` user, and put TLS, WAF/request limits, network policy, and identity-aware provisioning in front of the listener.

`tests/fixtures/` contains synthetic-only provider and repository adapters used by `community:server:test`; they are test fixtures, not launch credentials or a substitute for an approved provider.

## Try the whole thing on one machine

`npm run community:full-stack` (from `communication-tool/`) starts the real community server with encrypted storage, the real app, and stand-in sign-in, age-check and parent-consent services that approve on request. It prints one link per person: young person, parent or carer (`?as=parent-1`), moderator (`?as=moderator-1`) and safety lead (`?as=lead-1`). Use a separate browser profile for each. The stand-ins are for local testing only; test data is deleted when it stops.

Journey 8 (`tests/e2e-08-community.test.cjs`) runs the same stack in a real browser: ask to join, closed until the age check and a parent's yes, join Drawing, make a stamp picture, a moderator sees it and a school-name warning and approves or removes, another young person reacts kindly (no numbers) and reports and blocks, the moderator takes the report, the author sees "People reacted kindly", a support link is asked for, confirmed and checked, the server going down keeps the words, data export has no words, and leaving deletes the account and its posts from the rooms.

## Public demo anyone can open

`server/live-demo-server.mjs` (`npm run community:public-demo`) serves the app and the community server at one address for a public test. It is not a launch: real sign-in, age check and parent consent are replaced by safe stand-ins.

- Each visitor gets a signed identity for their own join request only, kept in their browser. Nobody can claim another account; forged identities are refused.
- There is no real parent step: a visitor plays their own parent ("Play my parent and say yes"), and only for their own request.
- The moderator view opens only with `MODERATOR_PASSCODE`, which the owner sets (5 tries per 15 minutes). Nothing anyone posts is seen by others until the moderator approves it.
- Everything is in memory and wiped every `WIPE_HOURS` (default 24) and on every restart. A banner on every page says it is a public test.

Hosting: `render.yaml` at the repository root is a one-click Render blueprint (free plan, Node, no build step). It serves the app at `/` and the slides, handout and plan at `/presentation/`; a copy without the `presentation` folder sends `/presentation/` to the GitHub Pages copy. The presentation's feedback form (`/feedback`, `/presentation/feedback.html`) saves replies to Render's free Postgres (`DATABASE_URL`, declared in `render.yaml`; Render deletes free databases after about 30 days, so download the CSV first) and falls back to memory if the database is missing. Only the passcode holder reads them at `/demo/feedback/read` (`FEEDBACK_PASSCODE`, or the moderator passcode). Demo safeguards: client address from the last `X-Forwarded-For` entry (the one Render adds); wrong passcodes limited to 5 per address per 15 minutes, with a wide overall cap of 200; signed identities end at the daily wipe, expire (moderator after 8 hours) and end when the passcode changes; a deleted demo account's posts, reactions, links, memberships and blocks are erased at once; replies hide when the post they answer is taken back; the audit log keeps the newest 5,000 events. `deploy/Dockerfile.live` runs the same server on any Docker host. Journey 10 (`tests/e2e-10-public-demo.test.cjs`) runs the public demo in a browser, including the impersonation and passcode refusals.

## Rooms, activities and reactions

`community-rooms.mjs` is the one list of rooms for the app and the server (ids are `<age group>-<key>`, for example `13-15-drawing`). The server checks every activity with the same `validateActivity` the app uses (stamps from the stamp box, the preset sound grid, fact cards, short template cards; links are refused). Posting, replying and reading need membership of the room.

| Route | Who | What |
| --- | --- | --- |
| `GET /v1/rooms` | young person | Interest and support rooms for their age group, with `joined` |
| `GET /v1/rooms/:id/posts` | member | Approved posts with the author's made-up name, `mine`, `myReaction`, `reactedKindly` (own posts only, never a count), plus `held` (how many of yours are waiting). Blocked people and deleted accounts are left out |
| `POST /v1/posts` | member | Text or `activity`; always held for a moderator |
| `POST /v1/posts/:id/reaction` | member | One preset kind word or `null`; not on your own post |
| `GET /v1/moderation/posts/:id` | moderator | Opens one held post's content; every view is in the audit log. The queue itself still never contains post text |
| `POST /v1/staff-accounts` | provisioning service | Creates parent, support adult, moderator, safety lead or administrator accounts |

The server also accepts paths with a leading `/community`, so it can sit behind a proxy that does or does not strip it. Signed-in requests are rate-limited per account (a whole class behind one school network is not blocked by one busy device) and anonymous requests per network address.

On the device, live mode keeps only the join request while it waits (a code, made-up name and age group) so the young person can show the code to a parent; it is removed once the rooms open, on sign-out, and by "delete everything". It is never backed up.

## Whole-app integration

The static app loads `community-config.js` before the community module. The committed configuration is deliberately `mode:'demo'`, preserving the fictional presentation path. A production host must inject `globalThis.__PHRASE_STUDIO_CONFIG__.community` before that file loads, with `mode:'api'`, the same-origin API base, and an identity assertion callback supplied by the approved identity integration. API mode keeps bearer tokens in memory, does not write community content to `localStorage`, and fails closed when the identity/consent session is unavailable. A deployment may also replace the config file, but it must not put credentials or bearer tokens in static assets.

The app stores one separate, versioned recovery record for API mode. It contains only the mode, two accessibility preference flags, and `reauthenticationRequired:true`; it never contains a token, identity assertion, account ID, post, reply, report, or support-link content. The record is included in the transactional device backup so a restored device can preserve the accessibility boundary while requiring a fresh approved identity exchange. Demo community content remains local presentation data and is not converted into an API backup.

`community:integration:test` exercises both paths: the existing synthetic presentation journey and the API-mode browser journey through account request, session exchange, room join, approved-post loading, and local-storage isolation. The browser test requires the configured Chromium runtime libraries in the test environment.

The reference server binds to `127.0.0.1` and must sit behind an authenticated TLS reverse proxy, network policy, request-size limits, and an operational service manager. It is not a public internet listener by itself.

Required environment variables:

- `COMMUNITY_TOKEN_SECRET`: at least 32 random characters; rotate through a planned session-revocation procedure.
- `COMMUNITY_STORAGE_KEY_HEX`: 64 hex characters for the AES-256-GCM encrypted single-node store.
- `COMMUNITY_STORAGE_PATH`: protected path for the encrypted store.
- `COMMUNITY_PROVISIONING_SECRET`: secret for the internal age-assurance provisioning endpoint; use a workload identity or mTLS in a real deployment.
- `COMMUNITY_PROVIDER_MODULE`: deployment-private ESM module exporting `identityProvider`, `ageProvider`, and `consentProvider` adapters. Production startup fails if it is absent.
- `COMMUNITY_REPOSITORY_MODULE`: deployment-private ESM module exporting `createRepository({filePath, keyHex})`. Production startup fails if it is absent; the encrypted JSON adapter is reference-only.
- `PORT`: local listener port, normally supplied by the service manager.

The service intentionally reports `ready: false` until identity, age-assurance, and consent providers are injected. A deployment must not route user traffic when `/readyz` is non-200. `/healthz` is liveness only.

## Provider contracts

The API accepts narrow adapters rather than raw provider SDK objects:

```js
identityProvider.verify(identityAssertion) // {accountId}
ageProvider.verify(providerAssertion)      // {approved, ageBand}
consentProvider.verify(assertion, childId, guardianId) // {approved}
supportLinkProvider.verify(assertion, link, adultId, adultRole) // {approved}
```

Providers must return the minimum decision needed by the state machine. Do not retain identity documents, biometric material, raw assertions, voice recordings, or unnecessary provider payloads in this repository.

The private provider module is loaded only by the deployment runtime and must never be committed with credentials or raw provider SDK payloads. The private repository adapter must implement `get`, `put`, `delete`, `list`, and `appendAudit` with transactional writes and encrypted backup support.

## Authorization and safety boundary

Sessions are signed, short-lived bearer tokens. Every protected request checks the account record, account status, and role claim. Child participation requires `active` status. Posts and replies are held until human moderation. Safety reports are severity-classified, assigned, actioned, appealable, and closable only through the safeguarding roles.

The safety-case lifecycle is executable as `received → assigned → investigating → actioned → notified → closed`, with a child appeal returning the case to an explicit `appealed` state and a safeguarding-only appeal decision route. P0/P1 categories are represented separately and remain human-owned.

Room join/leave, account block/mute, and access appeal operations are explicit and audited. They do not create discovery, direct messaging, or contact-import capabilities.

Trusted-adult links follow `requested → child-confirmed → active → revoked`. Adult verification requires an external support-link provider and a guardian/support-adult role; the child can inspect or revoke the link, and adult identity is not exposed through room discovery.

The first production scope deliberately has no child-to-child direct messages, adult discovery, public profiles, location sharing, diagnosis badges, rankings, or targeted advertising. Moderation queues redact message bodies and report details by default; operators retrieve sensitive evidence only through a separately approved case workflow.

## Persistence and operations

`createEncryptedJsonRepository` is a protected single-node reference adapter. It uses authenticated AES-256-GCM envelopes and atomic replacement, but it does not provide multi-writer locking or high availability by itself. `deploy/migrations/001-community.sql` defines the database contract to adapt to a reviewed production adapter with encrypted backups, transaction boundaries, audit immutability, restore drills, and tenant/service isolation. Do not run the single-node adapter for a multi-instance production deployment.

Run `server/community-retention.mjs` from a scheduled worker after legal holds are loaded from the case-management system. Deleted accounts and expired closed cases are candidates for purge; legal holds always win. Deletion requests currently mark an account deleted and create an operational follow-up; the worker and verified retention policy must complete the purge.

The service emits structured request telemetry through `server/community-observability.mjs`. Route identifiers are normalized, request bodies and authorization headers are never logged, and metrics contain status counts only. The recovery check proves encrypted-store corruption is detected and a synthetic backup can be restored; production still requires an encrypted, access-controlled backup service, restore drills, and alerting. Moderation queues redact evidence; only safeguarding leads and administrators can retrieve case evidence, and every retrieval is audited.

## Deployment gate

1. Configure real provider adapters in a private deployment module; do not commit credentials.
2. Verify `/healthz` and `/readyz` from the service manager.
3. Run API, security, accessibility, backup/restore, migration, rollback, and synthetic end-to-end tests with no real child data.
4. Confirm logs and metrics exclude body text, report details, identity assertions, precise location, diagnosis, and raw audio.
5. Confirm rate limiting exists at the proxy and service layers, with alerting for abuse and provider failures.
6. Complete named human approvals in the production-readiness goal before admitting any participant data.

