# Helper Jobs

Helper Jobs is the new product surface for Sunday kids’ outings. It is separate from the archived research/communication app while literally loading its archived visual layer: `theme-atlas.css`, Fraunces display fonts, icon treatment, paper-and-rust palette, tactile borders, picture-led cards, responsive layout, and calm accessibility defaults.

## Prototype journeys

- Landing page: purpose, safety promise, Helper mode and Lead mode entry points.
- Helper mode: picture identity → permitted Level 1 jobs → one step per screen → read aloud → Help/Stop → smiley and badge.
- Lead mode: a 4-digit lead PIN, chosen on each tablet the first time and stored only as a hash → live board with a persistent help state → snack check → wrap-up notes. The coordinator chooses a separate PIN the same way. Five wrong tries wait 30 seconds.
- Kid-facing jobs start only after the lead matches the helper with a kid and a named nearby volunteer. A “no snack” card turns the Snack job into no-snack steps, and read aloud says it first.
- The lead can pair their own phone (Live board → Lead’s phone → scan the code). Help and Stop then reach the phone in about a second, and “I’m here” on the phone closes them on the tablet. The board is locked (AES-GCM) on the tablet before it is sent; the key travels only in the pairing link’s #fragment, so the live link server (`server/server.mjs`) only ever holds scrambled data. Without internet the tablet keeps working and the board shows alerts as before.
- Helpers see at most four jobs at once; jobs not open yet fold away. Helper buttons are at least 64px.
- Kid records need a parent’s yes before they can be used for a job. Old alerts, notes and history clear after the days the coordinator sets. The coordinator can download an outing summary with no kid details.
- The coordinator adds and removes helpers and kids. New people start with no consent and “no snack”. Removing someone removes their history, notes and photo.
- Real photos only with a recorded yes (the helper’s, or a parent’s for a kid): cropped to 160px on the tablet, never sent to the phone or other tablets, removed when the yes is taken back or after the retention days.
- Wrap-up needs a head count: every kid here today is marked “back with a volunteer” or “went home with family” before the outing can finish.
- After “I’m here” (on the tablet or the phone) the lead can leave a short note. Only the coordinator sees notes; they are never in the summary.
- A helper 20 minutes into one job shows “offer a break” on the board and the phone.
- Helper screens in English, Hindi or Spanish (steps, jobs and read aloud), with bigger text, stronger contrast and a slower voice, set per helper. The Hindi and Spanish are first drafts and need a native speaker’s check before a real outing.
- Practice runs of next-level jobs, with no kid and no star; the coordinator sees them. Printable certificates for stars and badges.
- More helper tablets (Live board → More tablets): a second tablet shows the same helpers, jobs and matches; Help, Stop, Done and smileys on it reach the main tablet, which applies each one once. Allergy notes, consent records and photos stay on the main tablet.
- The lead’s phone can also make matches and mark who is here; the main tablet checks each one with the same rules.
- Family page per helper (needs a family yes): stars, badges, certificates, the lead’s kind note and the photo if there is a yes. No kids, other helpers or Help notes.
- Copies: a locked copy (words of the coordinator’s choosing, PBKDF2 + AES-GCM) to download and restore, and a laptop backup that keeps the newest locked copy while the outing runs.
- Paper backup: printable job cards in all three languages, and an “if the tablet stops” page with a paper match sheet and head count.
- The lead's phone can buzz even when locked (Web Push). The push carries no message; tapping it opens the board, which the phone unlocks with its own key. On iPhone it needs “Add to Home Screen” first. `VAPID_SECRET` on the live service keeps the push key stable.
- Feedback after each outing (volunteers from the board, the lead at wrap-up): a face for the day, a face for the app, and a few words. No names; the coordinator downloads it.
- Helper-only mode hides lead buttons and links out of the app; the lead holds the “h.” for 2 seconds. Left on the job list for 2 minutes, the tablet goes back to “Who are you today?”. `tablet-setup.html` is a printable checklist, iPad Guided Access and Android App pinning steps, and an observation sheet.
- `wording.html`: a native speaker hears, fixes and ticks every Hindi and Spanish line; fixes apply on that tablet and download as a file.
- On the day: unanswered Help wakes the lead's phone again every minute, with a chime and a banner on every screen and tablet; the lead can change a match's volunteer or end it; volunteers are added by the coordinator and ticked as here; updates wait until wrap-up; a printable Sunday report (no kid names); a volunteer card, family sheet and consent form.
- For helpers: a picture day plan with “now” and “next” (the lead or the lead's phone moves it on), “I need a break”, practising the Help button with nothing sent, “next time I'd like to try”, real pictures of things and places in steps, outdoor mode, and a printable helper card.
- For the coordinator: make jobs for new places (name, picture, level, up to 8 picture steps; locked until unlocked per helper; shared with second tablets and printed cards), progress across Sundays with a “might be ready” hint (`progress.html`), a date on every yes with a yearly review, “download what we hold” for one person (others appear only as “a kid” or “a helper”), tick everyone or no one at setup, and a quiet main tablet can be replaced by a second tablet from the laptop's locked copy.
- Start again: Coordinator tools → “Start again with the made-up example”, or open the app with `?fresh=1`.

The app is dependency-free and static, and works offline after its service-worker shell has been cached. It uses browser speech synthesis when available, keeps Help in a fixed, consistent location, persists versioned local state, queues idempotent mutations for later sync, preserves recoverable conflicts, supports recovery export, and enforces the safety invariants in `store.js`. The current fixtures are deliberately made-up and are the test/demo seed, not production records.

## Contract tests

```sh
npm test --prefix helper-jobs
python3 helper-jobs/tests/browser_smoke.py      # one tablet, all three roles
python3 helper-jobs/tests/live_link_smoke.py    # the tablet and the lead's phone
python3 helper-jobs/tests/features_smoke.py     # people, photos, languages, practice, head count, copies
python3 helper-jobs/tests/devices_smoke.py      # two tablets, phone, family page, laptop backup
python3 helper-jobs/tests/ready_smoke.py        # feedback, helper-only mode, wording check, waking the phone
python3 helper-jobs/tests/day_smoke.py          # Help that can't be missed, matches, PINs, report
python3 helper-jobs/tests/helpers_smoke.py      # day plan, breaks, practising Help, wishes, step pictures
python3 helper-jobs/tests/coordinator_smoke.py  # making jobs, progress, yes dates, exports, taking over
```

The tests cover the live link server (locked data only, delivery under a second, wrong keys refused), privacy projection, job levels, nearby-volunteer assignment validation, coordinator-only snack permissions, persistent Help acknowledgement, recovery export, and consent fixtures. The implementation plan and acceptance gates are in [`docs/NEXT-MEATY-GOAL-HELPER-JOBS-FULL-IMPLEMENTATION.md`](../docs/NEXT-MEATY-GOAL-HELPER-JOBS-FULL-IMPLEMENTATION.md).

## Run locally

```sh
node helper-jobs/server/server.mjs   # the app and the live link, on http://127.0.0.1:8790/
```

The app alone also runs from any static server (`python3 -m http.server 8765 --directory helper-jobs`); pairing a phone then needs the live link server.

## Presentation materials

Everything for a talk is in [`presentation/`](presentation/), in the same look as the app and as Next Step’s presentation set:

- [`presentation/index.html`](presentation/index.html): the landing page for the talk.
- [`presentation/slides.html`](presentation/slides.html), [`present.html`](presentation/present.html) (full screen; press N for the presenter view with notes, the next slide and a timer) and [`helper-jobs-slides.pdf`](presentation/helper-jobs-slides.pdf).
- [`presentation/handout.html`](presentation/handout.html), [`handout-view.html`](presentation/handout-view.html) and [`helper-jobs-handout.pdf`](presentation/helper-jobs-handout.pdf): a one-page summary and a page of plain answers.
- [`presentation/video.html`](presentation/video.html): the video in three versions, each with captions: full (2 min 25 s), short (27 s, for WhatsApp, `?v=short`) and Hindi (`?v=hi`, a computer voice; a Hindi speaker still needs to check it).

The slide and handout pictures use real screens from the app with made-up people. The PDFs have real text, so they can be searched and read aloud.

## Before the first Sunday

- **Put it on the home screen.** The first time Helper Jobs opens in a browser tab on a phone or tablet, a card shows the steps for that device (Safari on an iPad, Chrome on Android, or Chrome's own Install button). After that it opens full screen from its icon. "Not now" hides the card.
- **The screen stays on** while an outing is live, in the browser too (Wake Lock), and Coordinator tools → This tablet says whether this browser can do it.
- **Wording check from anywhere.** Coordinator tools → Hindi and Spanish wording → *Send it to someone's phone* makes a link for a native speaker. On their phone they hear each line, fix it and tick it; each fix goes to the tablet straight away (locked like every other link, and only the app's words, no people). Offline fixes wait on their phone and are sent when it is back online.
- **Practice Sunday** (`rehearsal.html`, Coordinator tools → Paper backup): a printed 20-minute run of a whole outing for four adults, with a "ready for Sunday?" checklist and a sheet for what went wrong.
- **No internet:** the tablet keeps working from its saved copy, Help shows on the board, and the lead's phone gets it as soon as the tablet is back online. `tests/sunday_ready_smoke.py` checks all of this in a browser; the Android journey also checks Help in airplane mode.

## Android and iPad apps

Helper Jobs also comes as an Android app and an iPad app, made the same way as Next Step: [Capacitor](https://capacitorjs.com) wraps the very same pages as the website (`helper-jobs/native/`). The website keeps working as before.

What the app adds on the tablet:

- **Read aloud with the tablet's own voice.** Android's built-in browser view has no voices, so the app uses the device's voice engine (English, Hindi and Spanish when they are installed).
- **Pin the app.** In Coordinator tools → This tablet, the coordinator pins Helper Jobs so helpers cannot leave it (Android screen pinning). On an iPad, the same card explains Guided Access.
- **The screen stays on** while an outing is live.
- **Printing and saving** use the tablet's print screen and share sheet (job cards, certificates, summaries, locked copies).
- **The back button** moves back inside Helper Jobs and never closes it in the middle of an outing.
- Pairing codes for the lead's phone, a second tablet or a family page open the public website, and the live link uses the same locked relay. The relay allows the app's origins (`https://localhost` on Android, `capacitor://localhost` on the iPad).

The Android app asks only for the internet. Records stay inside the app on the tablet, as on the website.

**Builds.** The workflow `.github/workflows/helper-jobs-native.yml` builds the APKs, installs the app on an Android tablet emulator and runs a journey through it (helper step read aloud, live board with the screen kept on, pin and unpin, share sheet, printing, the back button, the live link), builds the iPad app and opens it on an iPad simulator. It publishes the APKs, screenshots and `report.json` to the `helper-jobs-native-builds` branch.

**Signing.** A release APK that can update itself over an earlier install needs the same key every time. Add these repository secrets once (Settings → Secrets and variables → Actions): `HELPER_JOBS_KEYSTORE_BASE64`, `HELPER_JOBS_KEYSTORE_PASSWORD`, `HELPER_JOBS_KEY_ALIAS` and `HELPER_JOBS_KEY_PASSWORD`. Without them, CI still builds a debug APK for trying the app. The key never goes in the repository. Keep a copy of it somewhere safe: an app signed with a different key cannot update the installed one without removing it, and removing the app removes the tablet's records.

**Installing on an Android tablet.** Download `helper-jobs.apk` (signed) or `helper-jobs-debug.apk` from the builds branch, open it on the tablet, and allow installing from that source when Android asks.

**iPad.** Installing on a real iPad needs a Mac with Xcode and an Apple developer account: run `npm ci && npm run sync` in `helper-jobs/native`, open `ios/App/App.xcworkspace`, choose your team, and run it on the iPad (or send it through TestFlight).

**Working on the shells locally:** `cd helper-jobs/native && npm ci && npm run sync` (copies the web app into `www/` and both shells), `npm run check` (wiring, permissions, no keys). `node scripts/make-art.mjs` redraws the app icon and launch screen.

## Hosting

`render.yaml` defines two Render services:

- `helper-jobs`, a static site: this directory without the tests, server, README or package file. `/presentation/` opens the slides and handout. The archived research workspace is never published.
- `helper-jobs-live`, a small free Node service (`server/server.mjs`, no dependencies) that passes the locked board and the lead’s answers between the tablet and the phone. Rooms are kept in memory and deleted after 12 idle hours; after a restart the tablet registers its room again by itself. A free service sleeps after 15 quiet minutes; while a phone is paired, the tablet sends the board every 30 seconds, which keeps it awake during an outing.

The app on `helper-jobs.onrender.com` talks to `https://helper-jobs-live.onrender.com`. If Render gives the live service a different address, set it with `<meta name="helper-jobs-api" content="https://…">` in `index.html` and `lead-phone.html`, and add the app’s address to the service’s `ALLOWED_ORIGINS`.

The live copies at `helper-jobs.onrender.com` and `helper-jobs-live.onrender.com` still deploy from the original private repository. To run your own copy from this public repository, use [Deploy to Render](https://render.com/deploy?repo=https://github.com/AmishI123/neurocomms-app). Render will give the new services their own addresses, so set `helper-jobs-api` in `index.html` and `lead-phone.html` and the live service's `ALLOWED_ORIGINS` to match (see above). After later changes to `render.yaml`, open the Blueprint in Render and press **Manual sync**.
