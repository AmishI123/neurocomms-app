# Next meaty end-to-end goal

## Prove every journey works, click by click, before the Sunday 25 October 2026 review

The app is now called **Next Step** (formerly Phrase Studio). It has a landing page for first visits, study planning, voice on the Study screens and in Phrases, phrase cards, the "what helps me" card, restart notes, first-step help, time steps and moderated community rooms, all in the coffee-and-cream look. Internal storage keys still start with `phrase-studio-`; do not rename them (saved work must survive). Each piece has its own tests, but nobody has walked every journey from the first screen to the last click, on a phone and a laptop, with the real built site.

This goal is to do exactly that: use the app the way a person would, every screen and every button, find what breaks, fix it, and leave behind an automated suite that keeps proving it.

The live site is https://mehtama1234.github.io/neuro-divergent/. The build that ships is `communication-tool/dist/` (`node scripts/build-mobile.mjs`). Test the built `dist/`, not just the source folder, because that is what people get.

## Rules that do not change

These come from `AGENTS.md` and the product decisions. A fix that breaks one of these is not a fix.

- Nothing becomes a task, message, card or export unless the person chooses it.
- Nothing is sent, submitted or shared automatically. Drafts stay drafts.
- Pasted text stays on the device. The research export leaves out pasted text.
- AI help is off until turned on, removes emails and links, and shows what it will send first.
- The microphone starts only on a tap. Speech is shown for checking before it is added. No recording is kept.
- No diagnosis is asked for, guessed or shown.
- Fictional data only. No real names, schools, health details or child data in fixtures, screenshots or logs.
- Do not delete old research files. Do not weaken a test to make it pass; fix the app or explain why the test was wrong.
- Never put API keys in source.

## Definition of done

The work is done only when all of the following are true:

1. Every journey below has an automated end-to-end test that clicks through it in a real browser (Playwright), against the built `dist/` served over HTTP.
2. Each journey test runs at two sizes: phone (390×844, plus 320×700 for the narrowest phone) and laptop (1280×800).
3. Each journey also passes with **largest text** and **high contrast** turned on (Display & privacy menu), and with **reduced motion**.
4. Each journey can be completed with the **keyboard only** (Tab, Shift+Tab, Enter, Space, Escape), with a visible focus ring at every step and no keyboard traps.
5. No page errors and no console errors during any journey. Any network request that is not to the site itself fails the test (except a voice request the browser itself makes when the person taps the microphone).
6. Nothing overflows sideways at 320px. No button is smaller than 44×44px. No text is covered by the bottom navigation on phones.
7. Text contrast is at least 4.5:1 everywhere in normal and high-contrast modes.
8. After a reload, and after closing and reopening the browser context, saved work is exactly where the person left it.
9. The app still opens and every local journey works **offline** after the first visit (service worker).
10. A screen recording or screenshot set exists for each journey on phone and laptop, saved under `communication-tool/qa/end-to-end/` with a short index page, so a human can look through it in ten minutes.
11. A plain-English report `communication-tool/qa/end-to-end/REPORT.md` lists: every journey, pass or fail, every bug found, what was fixed, what is still broken, and anything that could not be tested here (for example Safari on a real iPhone, or a real microphone).
12. The full suite (`CHROMIUM_PATH=... npm test`) is no worse than before. Any test that was already failing is listed with its reason.
13. The fixed build is merged to `main`. Publishing to GitHub Pages is manual (the workflow is paused to save Actions minutes); run it once at the end and confirm the live site shows the fixes.

## The journeys

Use the fictional demo assignment in `communication-tool/examples/presentation-demo-fixture.json` and the conflict files in `communication-tool/qa/adversarial-ux/fixtures.json`. The rehearsed demo order is in `docs/DEMO-CLICK-SCRIPT.md`; journey 1 must match it exactly.

### 1. The Sunday demo, start to finish (must never fail)

Follow `docs/DEMO-CLICK-SCRIPT.md` exactly; it is the source of truth. In short: landing (four moments) → skip → energy **A little** → Add my instructions → Try a made-up example → Find the tasks → check the stamps and untick the optional item → Use this plan → low-energy banner, whole list hidden → I'm stuck (four choices) → Take a break → pause note → Save & pause → Home shows the note → Return to paused step → Mark complete → Say: card starter + Save card → Ask for a change (teacher, name, two helps, add from card) → Copy message → People: made-up name → Join Drawing → Make something → two stamps → Send to the moderator → Approve in room → Love this on Kit's picture.

### 2. Home screen

- First visit, returning visit with a plan, returning visit with a paused note, visit after finishing every step.
- Landing page: shows every time the standard app opens on Home, for new and returning people; workspace mode may keep its assignment chooser as the primary Home surface. It hides once the person moves to Study or Tools, and comes back from "What is this?".
- First visit: the main button reads "Start with my instructions" and opens Study. Returning visit (saved plan or unfinished review): it reads "Continue where you left off" ("Check your saved plan" when recovery is needed) and opens the saved work, with the pause note visible.
- "Try it with a made-up assignment" and "I know how it works — skip this" each do what they say.
- The four tiles each scroll to and focus their feature card without changing the address; works by keyboard and at 320px width.
- Exactly one visible main (filled) button on Home in every state: first visit, unfinished review, saved plan, finished plan, recovery.
- Study: "Try a made-up example" fills the made-up assignment; if the box already has text it asks first.
- "Start the practice run" and "Not now": the practice run makes a separate practice assignment and never touches existing saved work.
- My assignments: create a workspace, switch between two assignments, back up all assignments, download the recovery file, restore from it in a clean browser.
- Open tools goes to Tools; Add my instructions goes to Study.

### 3. Study: instructions

- Paste text; load one file; load several files at once (text, and PDF via the bundled reader); load a file that is empty, huge, or not text, and check the message is clear and nothing crashes.
- Conflicting files: the conflict note appears above the fold on a phone and confirming is blocked until each conflict is checked.
- The "What should the first step respect?" box is used in the suggested first step.
- Discard unfinished review asks first and really clears it.

### 4. Study: review

- Tick and untick every kind of suggestion; edit task, due date, prerequisite and first step; reload mid-review and check every edit is still there ("Unfinished review saved on this device").
- The save-error paths: Retry saving, Replace saved review, Reload saved review, Restore reviewed instructions. Force a storage failure (fill storage or stub `localStorage.setItem` to throw) and check each message and button.
- Ask AI to double-check: off by default; when turned on with no endpoint, the message is clear; the request preview shows emails and links removed before anything is sent.

### 5. Study: work

- Mark complete, Undo last completion, Save changes, Save & pause on every step, through to the finish screen and "Back to tools".
- Edit a step's next action, then reload: the edit is kept.
- Draft a question from a step and from the top button ("Draft a question to ask").
- Voice on Study: "Speak instead" under the instructions box, "How I will begin" and "Where I paused"; "Read this step aloud" on the current step. Nothing is added until "Use these words"; "Throw away" adds nothing; without speech support the button is off and says so.

### 6. Tools: each tool from its tab and from the "All tools" view

For every tool: open it, use every button, reload, check saved state, then use its delete or clear button and confirm it is really gone.

- **Phrases** (Practice words for an activity): ordinary and personal workspace, add / remove / reorder cards, change card type, Pause, Resume draft, Discard draft, Finish activity, Explore another version, Quick Board (Read all, Stop speaking, Focus mode, Show my support card, Back to start), and the downloads for the research team.
- **My card** (Explain what helps me): add a section, Save, Show / Hide card, Copy, Share (the confirm dialog shows exactly what will be shared; Cancel shares nothing), Print (print view shows only the card), Export HTML (the file opens on its own and matches).
- **Restart notes** (Remember what I said I’d do): paste a made-up message → Find what I said I would do → save only what you approve; the original text is not stored; Export and Delete all.
- **First step** (Find a smaller next step): Find a first step, pick an option, history dashboard updates, reload keeps it.
- **Time** (Plan my time backwards): Try an example, Show time steps, Save on this device, Delete saved calculation; check the arithmetic by hand for two cases, including one that crosses midnight.
- **Community** (Meet others safely): see journey 8.
- Library and device data: Export library, Clear library, Back up device data, restore that backup in a clean browser, Erase all local data (asks first, then everything is gone, including service-worker caches it owns).

### 7. Voice

- Phrases → Speak and listen panel (first inside the phrase tools, before Optional AI help): before the tap the microphone is off; after the tap the screen says it is listening; the words appear in "Check the words before adding"; Add this card adds exactly the edited text; Throw these words away adds nothing.
- Study voice (see journey 5) follows the same rules; `tests/study-voice.test.cjs` is the starting point.
- When the browser has no speech recognition, the voice button explains this and typing still works.
- Read aloud on the Quick Board works with speech synthesis stubbed; Stop speaking stops it.
- Keyboard only: the whole voice flow works without a mouse.
- No audio is stored anywhere (check localStorage, IndexedDB and caches after the journey).

### 8. Community

Test both modes.

**Demo mode** (the default, fully on the device):

- Pick an age group (13–15, 16–17) and a made-up name → Go to the rooms.
- Each age band only sees its own rooms. Posts start as "held" and only show after a moderator approves. Replies stay inside the room.
- There is no way to send a private message, see a public feed, see likes or follower counts, or add a diagnosis badge. Check the markup has no controls for these.
- The composer warns about names, school, address, phone number and moving off the platform.
- Trusted adult, moderator and resource paths: each is clearly labelled and shows what will be shared before it is shared.
- Report a post: the reporter sees a safe status update that does not reveal another child's details.
- Device recovery for the community account works as designed, and leaving clears local community data.
- Rooms show made-up posts and replies before you write anything, with "You can just read". Joined rooms switch with "Open room"; the open one says "You are here".
- Reply starters ("Me too.", "That helps, thanks.", "Can you say more?", "I tried this:") only insert words; nothing sends until "Send reply to the moderator".
- Before you send: a post or reply naming a school, address, phone, email, link or user name, another app, or a plan to meet shows a warning with "Edit my words" and "Send anyway; the moderator will check". Nothing reaches the moderator before the choice. The moderator view flags the same details.
- Report shows "Reported. A moderator will look." Block hides that person's posts and replies, with "Undo block".
- "Quiet work together" room: 25-minute timer (Start / Stop), check-in and check-out starters, made-up check-ins.
- The moderator queue sits in a separate "Moderator view (demo only)" box.

**Server mode** (`server/community-server.mjs` with `globalThis.__PHRASE_STUDIO_CONFIG__.community = {mode:'api', ...}`):

- Start the server locally with fictional config, point the app at it, and repeat the demo-mode journey.
- Sign-in and guardian flow, moderator screens by role, held → approved / removed, retention rules.
- If the server is down or misconfigured, the app fails closed with a clear message and no data is lost.
- The `community-api` list-read path must remain green, including its 422/error handling and safe structured-clone behavior. Keep `tests/community-api.test.cjs` green.

### 9. Display, privacy and install

- Display & privacy menu: every text size and contrast choice, on every screen, kept after reload.
- Offline badge shows the right state; the app works with the network cut after the first visit.
- Install app button (where the browser offers it) and the manifest name, colours and icon are the new coffee-and-cream ones.
- The app works when opened as a shared link (share target) with text.

### 10. The four moments (18 October redesign)

- Bottom bar: Home · Study · Say · People · Tools. Say and People are the Tools page filtered to one moment; `#say` and `#people` open them directly; Tools shows every tool grouped under Start, Come back, Say what you need, Find your people.
- Energy check on Home (A little / Some / Plenty, optional, forgotten the next day). A little: Study shows only the current step (the step list and "How I will begin" are hidden) with a banner. Plenty: the step list opens. Tapping the chosen level again clears it.
- Home shows a "Say what you need" card (Make my card / Open my card, plus Ask for a change) and a "Find your people" card (rooms joined or Have a look).
- I'm stuck on the current step: Make it smaller (opens First step with the step filled in), Ask a question about it (drafts a question), Ask others for a way in (People, composer filled if a room is open), Take a break (focuses Where I paused). Nothing is sent by any of them.
- What next? appears when the plan is finished: Check out in Quiet make-together, Tell someone what helped, Start a new plan.
- Ask for a change (Say): who, name, help chips, about (Use my current step), add from card, editable message, Copy, Read it aloud, Start again. The message never names a diagnosis and nothing is sent.
- My card: starter words under each field add text once.
- Journey 9 (`tests/e2e-09-four-moments.test.cjs`) runs this in demo order on every variant: A little energy, the example plan with one step, I'm stuck, a card starter, Ask for a change copied, a Drawing room stamp approved by the moderator, and Love this on Kit's picture.
- People: interest rooms (Drawing, Animals, Music, Games, Making, Stories) and support rooms (Small starts, Sensory-friendly ideas, Quiet make-together), each with this week's prompt. Activities: Stamp Studio (preset stamps on a grid), Loop Lab (preset sounds, Play stops by itself, Watch without sound), Creature of the Week (pick a fact and a feeling), template cards (game, making, story, pet). Everything goes to the moderator first. Kind reactions (Love this, So cool, Me too, Tell me more, Calm vibes) never show a number. No uploads, microphone, photos or free drawing.

### 11. Plain wording (18 October sweep)

Labels were rewritten in plain words on 18 October. Use the current names: "Draft a question", "Save as a restart note", "Show where this came from", "Where this step came from", "Check this:", "Throw away this review", "Add my instructions", "Open tools", "Start editing" (phrases), "Plain editor" / "Editor with questions", "Save as a web page", "See what is saved" / "Check again". On the review record the states read "In your plan", "Left out" and "Kept for later". Sources read "From your pasted instructions, line N" (files keep "file name, page N, line N"). Import library and Restore device data must work by keyboard (Tab, then Enter).

## How to work

1. Read `AGENTS.md`, `docs/DEMO-CLICK-SCRIPT.md`, `docs/PRESENTATION-RUNBOOK-SUNDAY.md`, `docs/community-layer-spec.md` and the voice goal linked from the project status.
2. Write the journey tests first under `communication-tool/tests/e2e-*.test.cjs`, one file per journey, sharing one small helper for serving `dist/`, viewport sizes, display modes, error capture and the "no outside requests" guard. Reuse the patterns in `tests/adversarial-ux-header.test.cjs`.
3. Run them, record every failure in `REPORT.md` before fixing anything, then fix in small commits, one bug per commit, with a test that would have caught it.
4. Look at the screenshots yourself. A passing test with a broken-looking screen is still a bug (cut-off text, overlapping buttons, wrong colours, green left over from the old look).
5. Keep words plain on screen. If you find jargon in the app ("age-banded", "pseudonymous", "open DMs", "applicability"), list it in the report and suggest an everyday replacement.
6. Push to `main` with fast-forward only. Do not re-enable Pages on every push; run the publish once at the end.

## Hand-off

Finish with: the report, the screenshot index, the commit list, the live URL checked after publishing, and a short list of anything a person must still try by hand (real iPhone Safari, a real microphone, a real screen reader).
