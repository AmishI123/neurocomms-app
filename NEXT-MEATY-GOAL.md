# Next meaty end-to-end goal

> **Historical/expanded goal index.** The canonical current handoff is [`PROJECT-STATUS.md`](PROJECT-STATUS.md). This file preserves the accumulated milestone history and links; do not use its first “active” section as the sole source of current scope.

## Latest completed engineering goal: one Communication Access Card across every supported surface

The selected first product now has a repeatable cross-surface gate covering the
standalone web app, the main web/mobile shell, the copied mobile bundle, the iOS
public web assets, and the Android source permission boundary. See
[the goal and current checkpoint](communication-tool/docs/next-meaty-goal-communication-card-cross-surface.md)
and the [machine-readable report](communication-tool/ai-evaluation/results/communication-card-cross-surface-audit.json).
This remains engineering evidence only; native-device execution, participant
review, usefulness, and market demand are not claimed.

The follow-on native handoff is recorded in
[the current Android/iOS package record](communication-tool/docs/next-meaty-goal-communication-card-native-handoff.md).
It contains rebuilt Android debug and unsigned release APKs, exact 39-file
runtime checks, the artifact manifest, and the remaining device/build limits.

## Latest completed engineering goal: self-contained local-first beta release

The completed engineering gate covered the local beta release: clean install,
offline use, local backup and restore, erase, interrupted-work recovery,
update/rollback, and a clear release record. See the [full goal and current
limits](communication-tool/docs/next-meaty-goal-local-beta-release.md), the
[controlled-beta gate](communication-tool/docs/controlled-beta-release-gate.md),
and the latest [controlled-beta audit](communication-tool/ai-evaluation/results/controlled-beta-audit.json).

The final audit passed all seven engineering steps. The decision is
**engineering gate passed / beta-ready with environment limits**. Android
device execution, iOS execution, signing, human review, and usefulness remain
open gates; no public release or human-benefit claim follows from this result.

## Active engineering goal: native mobile execution

Run the same fictional-data journey in an installed Android app and an
installed iOS app: launch, review, confirm, work offline, interrupt, reopen,
revise, export, and retain confirmed work across an update. Browser and copied
native assets do not count as native acceptance. The detailed goal is in
[native mobile beta goal](communication-tool/docs/native-mobile-beta-goal.md),
and the current operator record is the [native execution handoff](communication-tool/docs/native-beta-execution-handoff-2026-09-17.html).

The current Android attempt failed closed because no authorized dedicated
target was available. iOS still requires macOS, Xcode, and CocoaPods. These are
open environment gates, not completed device results.

The unified environment record is
[native-environment-readiness.json](communication-tool/ai-evaluation/results/native-environment-readiness.json): the Android toolchain and AVD are present, the copied iOS runtime is complete, but there is no authorized Android target, no usable KVM acceleration, and no Xcode or CocoaPods on this host.

Latest completed engineering goal: [Prepare for the next appointment without rebuilding everything](NEXT-MEATY-GOAL-MY-VISIT-NOTES-NEXT-APPOINTMENT.md). Delivered deliberate carry-forward, editing/ordering, communication needs, exact plan review, offline return, source inspection and the second appointment. All 271 current-source checks and the 209-file extracted-release workflow passed. Read [requirements](product-specs/my-visit-notes/next-appointment-PRD.md), [presentation](product-specs/my-visit-notes/next-appointment-presentation.html) and [acceptance evidence](product-specs/my-visit-notes/next-appointment-acceptance-audit.md). Native Android/iOS packaging remains deferred. Earlier milestones below are historical; usefulness remains unverified.

Latest completed engineering goal: [Stop halfway through and safely continue another day](NEXT-MEATY-GOAL-MY-VISIT-NOTES-DRAFTS.md). Delivered optional saved follow-up messages and progress drafts, safe reopening, private backup/transfer and deliberate completion. All 250 current-source checks and the 195-file extracted-release workflow passed. Follow [D1–D7](product-specs/my-visit-notes/drafts-PRD.md), the [delivery record](product-specs/my-visit-notes/drafts-progress.md) and [presentation](product-specs/my-visit-notes/drafts-presentation.html). This is a shared desktop/mobile web-app release; native Android/iOS packaging remains deferred. All earlier milestone descriptions below are historical; usefulness remains unverified.

Latest completed engineering goal: [Make the whole app easy to use from first opening to the next appointment](NEXT-MEATY-GOAL-MY-VISIT-NOTES-JOURNEY.md). Follow the [detailed requirements](product-specs/my-visit-notes/journey-PRD.md) and [delivery record](product-specs/my-visit-notes/journey-progress.md). All 219 current-source checks and the 178-file extracted-release verification passed. Read the [executive/conference presentation](product-specs/my-visit-notes/journey-presentation.html) and [acceptance evidence](product-specs/my-visit-notes/journey-acceptance-audit.md). Usefulness remains unverified.

Previously completed engineering goal: [Help me get through the conversation](NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONVERSATION.md). The selected-word display, private return and interruption handling are delivered. All 207 current-source checks and the 165-file extracted-release verification passed. Read the [requirements](product-specs/my-visit-notes/conversation-PRD.md) and [executive/talk presentation](product-specs/my-visit-notes/conversation-presentation.html). Completed milestones below are historical.

## Selected next product: My Visit Notes

The latest completed engineering goal is [Move to another device without starting over](NEXT-MEATY-GOAL-MY-VISIT-NOTES-TRANSFER.md): one private file for saved notes and preparation, explicit unsaved snapshots, safe preview, preserved different copies, correct source/result links and deliberate continuation. All 193 current-source checks and the 152-file extracted-release verification passed. Read the [executive/talk presentation](product-specs/my-visit-notes/transfer-presentation.html) and [acceptance evidence](product-specs/my-visit-notes/transfer-acceptance-audit.md). User benefit remains unverified.

The preceding completed engineering goal is [Know what still needs doing after the visit](NEXT-MEATY-GOAL-MY-VISIT-NOTES-FOLLOW-UP.md): cross-visit unfinished work, chosen focus, private progress history, exact message drafts and independent source-linked copies. All 162 current-source checks and the 137-file extracted release passed. Read the [executive/talk presentation](product-specs/my-visit-notes/followup-presentation.html) and [acceptance evidence](product-specs/my-visit-notes/followup-acceptance-audit.md). User benefit remains unverified.

The preceding completed build goal is [Fix a mistake without starting over](NEXT-MEATY-GOAL-MY-VISIT-NOTES-RECOVERY.md): selected-item recovery, earlier wording, batch removal, recoverable deletion and bounded private history. All 139 current-source checks and the 122-file extracted-release audit passed. See the [recovery requirements](product-specs/my-visit-notes/recovery-PRD.md), [executive presentation](product-specs/my-visit-notes/executive-presentation.html) and [acceptance evidence](product-specs/my-visit-notes/recovery-acceptance-audit.md). User benefit remains unverified.

The preceding completed goal is [Stop halfway through and come back without starting over](NEXT-MEATY-GOAL-MY-VISIT-NOTES-RESUME.md): optional saved preparation, exact resumption, private preparation backups, safe completion records and separate cleanup. All 110 checks for that release and the extracted-release audit passed. See [current deliverables and status](product-specs/my-visit-notes/goal-status.md). User benefit remains unverified.

The preceding completed build goal is [Turn existing notes into a prepared visit](NEXT-MEATY-GOAL-MY-VISIT-NOTES-EXISTING-NOTES.md): private text intake, deliberate passage selection, duplicate review, safe addition to a visit, and the complete save/share/recovery journey. That release passed 87 software checks and its extracted-release audit. The completed [phone goal](NEXT-MEATY-GOAL-MY-VISIT-NOTES-PHONE.md), [appointment-to-appointment goal](NEXT-MEATY-GOAL-MY-VISIT-NOTES-CONTINUITY.md) and [first-release goal](NEXT-MEATY-GOAL-MY-VISIT-NOTES.md) remain background. Participant review is deferred; usefulness remains unverified.

## Current follow-on goal: findings, presentation, and complete product plans

The expanded next milestone is [From findings to a tested product choice](product-specs/opportunity-atlas/NEXT-MEATY-GOAL.md). Its [presentation package](product-specs/opportunity-atlas/presentation/index.html) includes the executive report, conference-style talk, product comparison, and nine detailed product briefs. The original atlas goal is retained below as background. The follow-on goal covers source review, selecting one build, checking the full flow, and evaluating usefulness; those future stages are not completed by the presentation package.

## Neurodivergent communication and learning product opportunity atlas v1

Research the everyday problems and possible product opportunities connected with:

- autism;
- Down syndrome;
- dyslexia;
- augmentative and alternative communication (AAC), including speech-generating devices and communication apps.

Also run a smaller comparison scan for developmental language disorder, dyscalculia, developmental coordination disorder (dyspraxia), intellectual disability, and aphasia. AAC is a cross-cutting area: different diagnoses may involve AAC, and the important product questions concern communication access, vocabulary, privacy, speed, portability, reliability, and control—not a diagnosis label alone.

The result will be a set of clear, detailed HTML product-requirements pages that a first-time reader can understand. Each page will explain the problems people describe, show what those problems look like in daily life, separate evidence from interpretation, and turn possible solutions into buildable product requirements.

## Why this is the next goal

The previous research focused on ADHD and broader neurodivergent executive-function problems. It produced a task-support specification, but it did not give the project a comparable view of communication, literacy, speech, learning, and access problems across other groups.

This milestone answers four practical questions:

1. What problems recur in each area?
2. Who reports each problem: the person directly, a family member, a teacher, a clinician, or a service provider?
3. What could a product do to reduce a specific difficulty while leaving control with the person?
4. Which ideas are safe and feasible to build, and which need specialist partners or stronger evidence first?

## Definition of done

### Research coverage

- Autism has a focused review of communication, sensory and environmental access, transitions, social and service navigation, education, and employment.
- Down syndrome has a focused review of speech and language, intelligibility, literacy and learning, school-to-adult transitions, health or service access, and communication-partner behaviour.
- Dyslexia has a focused review of reading effort, comprehension, writing and spelling, documents and forms, education and work, assistive reading, and disclosure or stigma.
- AAC has a focused review of access to a device, vocabulary and language growth, message creation, speed, device availability, partner support, privacy, portability, repair, and funding.
- Developmental language disorder, dyscalculia, dyspraxia, intellectual disability, and aphasia each have a short comparison scan. The scan says whether the area deserves a separate product page or should remain a future research lane.
- Children, teenagers, and adults are distinguished when their needs, control, risks, or settings differ.
- The review includes the voices of people with the condition or who use AAC wherever accessible. Caregiver, teacher, clinician, and provider accounts are labelled separately.

### Evidence collection

- For each main area, collect a documented set of public Reddit or comparable community posts when a relevant public community exists.
- For each main area, collect recent primary research, official guidance, and official service or device information. Prefer 2024–2026 sources while keeping older foundational work when needed.
- Record the source type, date, population, setting, and claim supported.
- Keep public-post evidence separate from research evidence. A post shows that a person described a problem; it cannot establish prevalence, clinical benefit, or what everyone with a diagnosis wants.
- Mark provider or company claims as provider claims. Do not treat a marketing page as independent proof that a problem is common or that a feature works.
- Record negative findings, access limits, disagreement between sources, and important missing evidence.
- Do not collect names, handles, private messages, personal health information, or identifying details beyond what is needed to link to a public source.

### Product pages

Create these pages under `product-specs/opportunity-atlas/`:

- `index.html` — comparison page and reading guide;
- `autism.html` — autism product opportunities;
- `down-syndrome.html` — Down syndrome product opportunities;
- `dyslexia.html` — dyslexia product opportunities;
- `aac.html` — AAC product opportunities;
- `comparison.html` — cross-area comparison and product selection;
- `methods-and-evidence.html` — sources, limits, coding method, and claim boundaries.

Each main page must contain, in this order:

1. what the page covers;
2. who is represented in the evidence and who is not;
3. major pain points in plain everyday language;
4. one everyday example for each pain point;
5. the likely reason the problem occurs, without diagnosing anyone;
6. what the problem costs the person in time, access, control, privacy, money, or relationships;
7. two or more possible product responses;
8. what each product would do in a normal user flow;
9. detailed production requirements;
10. acceptance checks that do not claim medical benefit;
11. risks, non-goals, and questions that still need user research;
12. evidence links beside the claims they support.

The pages must use everyday words. Define AAC, speech-generating device, and developmental language disorder the first time they appear. Do not assume the reader knows the diagnosis, service system, or research vocabulary.

## Shared production requirements

Every proposed product must meet these requirements:

- The person can communicate, refuse, pause, change, or stop without silence being treated as agreement.
- The product supports the person’s existing communication system. It does not replace speech, sign, writing, gestures, symbols, or a current AAC system.
- Suggestions are optional and editable. An old preference is not presented as the person’s current choice.
- The product does not infer a diagnosis, emotion, pain, consent, preference, intelligence, or ability from behaviour alone.
- The product does not make a caregiver, teacher, clinician, employer, or parent the only decision-maker when the person can participate.
- Personal information, communication content, and device data stay private by default.
- The person can see what is stored, who can access it, how long it remains, and how to delete or export it.
- No automatic sharing, public posting, surveillance, compliance scoring, eye-gaze recording, or background listening is included without a separately justified and consented design.
- Core use works when the internet is unavailable if the product claims to be local or offline.
- Core use does not require a paid subscription, diagnosis, particular device, or single communication method unless the scope explicitly requires it.
- Any product involving children, clinical treatment, protected health data, or device prescription is marked as needing qualified adult supervision, review, or regulatory advice.

## Evidence plan

### Search lanes

Use the same five search lanes for autism, Down syndrome, dyslexia, and AAC so the pages can be compared:

1. first-person experiences and requests for help;
2. school, work, and daily-life barriers;
3. communication, literacy, or learning tools people actually use;
4. access, funding, training, and service failures;
5. privacy, autonomy, stigma, harm, and unwanted assumptions.

Use relevant communities, research papers, official organisations, and official service or device pages. Do not force equal sample sizes. Down syndrome and AAC evidence may be easier to find in advocacy organisations, interviews, and specialist sources than in a large Reddit corpus; that difference must be reported.

### Claim ledger

Create `product-specs/opportunity-atlas/evidence-ledger.json` with one record per important claim:

```json
{
  "claim": "A short plain-English statement",
  "area": "autism | down-syndrome | dyslexia | aac | comparison",
  "sourceType": "first-person | caregiver | research | official | provider",
  "source": "URL or local source identifier",
  "population": "Who the source describes",
  "setting": "Home, school, work, clinic, public service, or online",
  "date": "YYYY-MM-DD or unknown",
  "supports": "What the source supports",
  "doesNotSupport": "What must not be claimed from it",
  "confidence": "high | medium | low"
}
```

Also create `sources.json`, `theme-coding.md`, `research-summary.md`, and `open-questions.md` in the same folder.

## Product questions by area

These are starting questions for the research, not conclusions.

### Autism

Investigate how people communicate sensory, environmental, and transition needs; when visual schedules, written information, scripts, or predictable choices help or become another demand; how a person can ask for a change without proving an internal state; what makes a tool respect autonomy; and how adults experience employment, healthcare, and public-service access.

Possible products include a private environment or transition support tool, a user-controlled request builder, and a service-navigation tool. Each must avoid guessing feelings or treating a routine as mandatory.

### Down syndrome

Investigate where speech clarity, language processing, memory, hearing, reading, and communication-partner behaviour create barriers; what support helps with school, work, healthcare, travel, and everyday decisions; how tools let adults communicate directly; which supports remain useful after school; and what device, training, funding, and service gaps block access.

Possible products include a person-controlled communication and participation aid, a healthcare-visit preparation tool, and a partner-support tool that helps others wait, listen, and confirm meaning. The person’s own voice must be sought directly wherever possible.

### Dyslexia

Investigate which parts of reading create the largest practical cost—decoding, line tracking, speed, working memory, comprehension, fatigue, or document layout—and how writing, spelling, forms, email, PDFs, scanned documents, and workplace software create barriers. Test which text-to-speech, speech-to-text, spacing, highlighting, and document-conversion features help in real tasks. Study disclosure, assessment, school support, and work accommodations.

Possible products include a document-access layer for scanned and badly formatted documents, a reading and comprehension workspace, and a private accommodation-request builder. Do not assume a font or colour setting works for everyone.

### AAC

Investigate how people get a device, app, vocabulary set, training, funding, repair, and backup method; what makes a message hard to create; how people express private, novel, emotional, or complex messages; how users keep ownership of their words, voice, vocabulary, and device settings; and what happens when a device is unavailable, broken, out of battery, ignored, or not allowed in a setting.

Possible products include a device-independent message and vocabulary backup, a partner training and waiting tool, a communication-access log owned by the user, and a repair or funding navigator. These should support existing AAC systems rather than forcing migration to a new one.

## Comparison areas

The smaller scan should determine whether each area deserves a full page:

- **Developmental language disorder:** language understanding and expression problems that may be missed when a person appears to speak fluently.
- **Dyscalculia:** number sense, money, time, measurement, forms, and work tasks where ordinary numeracy assumptions create barriers.
- **Developmental coordination disorder / dyspraxia:** motor planning, handwriting, device access, travel, self-care, and the gap between knowing and physically doing.
- **Intellectual disability:** accessible information, decision support, healthcare communication, consent, and independent participation. Avoid designing only for caregivers.
- **Aphasia:** acquired communication loss, with different causes, recovery questions, and adult service needs. Do not merge it casually with developmental disability research.

Rank these areas by evidence quality, distinctness of the product problem, feasibility of a safe first prototype, and need for specialist partnership.

## End-to-end work sequence

1. Freeze the scope, search dates, source rules, and evidence record format.
2. Build a source map for autism, Down syndrome, dyslexia, and AAC.
3. Run the five search lanes for each main area.
4. Read the primary and official sources behind the strongest recurring claims.
5. Code the pain points and record who reported each one.
6. Run the comparison scan for the five additional areas.
7. Draft a plain-English synthesis for each main area.
8. Turn each synthesis into product opportunities with normal user flows.
9. Write requirements, non-goals, risks, and acceptance checks for every proposed product.
10. Build the linked HTML pages and comparison index.
11. Check evidence links, anchors, headings, tables, and mobile layout.
12. Review every page for invented claims, diagnosis language, caregiver-only assumptions, and confusion between an observed finding and a proposed feature.
13. Package the research files and provide a local HTTP serving command and entry URL.

## Verification requirements

The milestone is complete only when:

- every main area has a finished HTML page;
- every page includes pain points, examples, possible products, requirements, acceptance checks, limits, and source links;
- the comparison page explains why AAC cuts across diagnoses;
- every important factual claim has a ledger record;
- every community signal is labelled as a public-post signal;
- every provider claim is labelled as a provider claim;
- no page presents a product idea as an established treatment or proven benefit;
- all local links return HTTP 200;
- all internal anchors resolve;
- the pages render without horizontal scrolling at desktop and phone widths;
- the pages can be read by keyboard and have visible focus states;
- a static link and HTML check passes;
- the source files, research notes, and generated pages are committed together;
- the final handoff names what is complete, what is uncertain, and which product idea should be investigated next.

Suggested local checks:

```bash
python3 -m http.server 8765 --directory /home/mehta/neuro-divergent
curl -I http://localhost:8765/product-specs/opportunity-atlas/index.html
```

The final handoff URL will be:

`http://localhost:8765/product-specs/opportunity-atlas/index.html`

## Boundaries

- Do not diagnose anyone from a post, page, or interaction.
- Do not turn a public post into a participant interview or prevalence estimate.
- Do not build or test a child-facing intervention without adult supervision, consent, assent, and applicable review.
- Do not infer a person’s current preference from an old choice, a caregiver’s report, or a model-generated suggestion.
- Do not build a device or app that controls, restrains, monitors, or rewards a person for appearing compliant.
- Do not claim an AAC tool gives a person a voice unless the person can control the message and the evidence supports the claim.
- Do not claim a reading, speech, language, or learning product treats a condition.
- Do not publish identifiable quotes or health details when a paraphrase and public source link are sufficient.

## Useful existing files

- [Previous detailed findings](product-specs/resume-support/FINDINGS.md)
- [Previous task-support specification](product-specs/resume-support/PRODUCT-SPEC.md)
- [Current plain-English product requirements page](product-specs/PRODUCTION-REQUIREMENTS.html)
- [Research opportunities brief](research-opportunities.pdf)
- [Evidence ledger](evidence-ledger.md)

The old PhraseLab release milestone is preserved in [NEXT-MEATY-GOAL-PHRASELAB-ARCHIVE.md](NEXT-MEATY-GOAL-PHRASELAB-ARCHIVE.md).
