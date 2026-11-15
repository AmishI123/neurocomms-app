# Next end-to-end goal: from findings to a tested product choice

## Outcome

Give a reader enough clear evidence and product detail to choose one useful tool, build a small working version, and explain what the test did and did not show.

Cover autism, Down syndrome, dyslexia, communication aids (AAC), developmental language disorder (DLD), dyscalculia, developmental coordination disorder (DCD), intellectual disability, and aphasia. Explain each name when first used. AAC is a set of communication methods. Aphasia has an acquired condition context. The nine areas are not nine separate markets or mutually exclusive groups.

## Deliverables

1. An executive HTML report covering each area, the main findings, everyday examples, source links, missing evidence, and choices facing the project.
2. A conference talk in HTML with a clear story, readable slides, speaker notes, references, and print support. Label it as a research and product proposal. Conference submission or acceptance is a separate step.
3. Nine complete product briefs in HTML. Each compares three possible products and specifies one proposed first version: users, problem, screens, features, saved information, error handling, privacy, testing, build order, ownership, and open questions.
4. A shared product comparison explaining overlap, existing project work, likely effort, and what evidence would change the choice. Estimates are planning assumptions, not market findings.
5. One working product slice, a record of engineering checks, and a decision report after testing. This is future work; writing the briefs does not complete it.

## Stage 1: make the evidence reviewable

Use the saved atlas as the starting point. Maintain a source record with URL, source type, date, who contributed, setting, claim supported, and limits. Reopen primary sources before publication and check that the precise claim is supported. Check publication dates rather than search-engine labels. Mark a source that cannot be read as an unresolved lead.

Build a reproducible community collection for each area where suitable public material exists. Save the query, collection date, inclusion rule, duplicate rule, and speaker role. Review the posts manually before counting themes. Where adult self-reports are scarce, record the gap and use accessible self-advocate publications or research. Do not claim equal coverage with the earlier ADHD collection.

Keep observed findings, invented teaching examples, proposed features, and engineering results visibly distinct. Do not invent quotes, participant numbers, effect sizes, or market size. Small studies and supporter accounts need their own limits.

Stage complete when every presentation claim has a traceable source or an explicit design-proposal label; unresolved claims remain visible.

## Stage 2: make the products concrete

For all nine briefs, compare three concepts and explain the proposed first version. Write the exact sequence of user choices. Specify what happens on empty input, an edit, cancellation, loss of saved data, unavailable device features, and export. Explain what information stays on the device and what leaves when someone shares a file.

Separate the person using the product, anyone helping them, and any possible paying organisation. Buying the tool does not grant access to personal content. Treat willingness to pay and adoption as unanswered questions until tested.

Stage complete when a builder can implement the first flow without guessing the main behaviour, and a reviewer can check each feature against a stated result.

## Stage 3: choose one build

Start with the existing communication-access card app as the first candidate for review. Its implementation and PRD already exist. Compare it with the reading desk and everyday-number helper. Use observed task difficulty, added effort, user control, and fit with existing tools to choose. A paper card, ordinary notes app, calculator, or current communication aid is a valid alternative.

Do not begin nine apps at once. Record why one product is selected, what remains uncertain, what will be deferred, and the result that would cause a change of direction.

Stage complete when the decision record identifies a user, a specific situation, a first task, and a comparison method.

## Stage 4: build and check the full flow

Implement one useful task from start to finish. Reuse working project code where it meets the brief. Add the chosen product's feature checks and common checks for keyboard use, narrow screens, save/reopen, edit, deletion, export, and offline use where promised.

Keep failed checks and known limits in the release record. Show the version tested, how to run it, and the exact results. A screenshot alone is not evidence that deletion, exports, or saved content work.

Stage complete when the selected task works, failures have been fixed or clearly bounded, and another person can repeat the checks.

## Stage 5: learn whether people would use it

Prepare an accessible review session and invitation materials. Use fictional tasks first. Obtain consent before sessions or recording; explain withdrawal and deletion. Include people who would use the product directly, with support they choose. Contacting or recruiting people requires a separate instruction.

Compare the product with each person's existing way of handling the same task. Record completion, errors, corrections, help required, effort described by the person, and whether they prefer the new tool. Let participants stop. Do not use speed alone to rank communication or success.

Choose the first small review group for varied relevant needs; do not treat it as a population sample. Any reported counts must state the number of sessions actually completed. If no sessions occur, publish the package as a proposal with engineering checks only.

## Final decision

- Continue when the target task works and people find a useful benefit worth the added effort.
- Revise when the idea helps but its wording, steps, access method, or sharing controls cause difficulty.
- Stop or change direction when an existing method works as well with less effort, the main barrier is outside the app's control, or people do not want it.

## Presentation quality

Use short sentences, familiar words, clear headings, and concrete examples. Define necessary terms. Avoid slogans and claims such as “revolutionary,” “empowering platform,” or “proven solution.” Print the report and slides without clipped text. All local links must resolve. Source limitations must remain visible in exported pages.

## Current handoff

The report, talk, product briefs, and comparison are the documentation deliverables for the current task. Source revalidation, a larger community collection, new product implementation, participant sessions, and conference submission remain separate stages. Start at `presentation/index.html` and follow its links to each brief. Run `node presentation/build.mjs` to rebuild the HTML after editing the source content.

## Current progress

Stage 3 has an engineering decision: review the existing communication-access
card first, before building the reading desk or time-step helper. The decision
is recorded in [decision-report.html](decision-report.html) and
[decision-record.json](decision-record.json). Its complete first task now has
an explicit 320px/1280px browser check in `decision-flow.test.cjs`. This is
engineering evidence only; no participant, demand, medical, or market result
is claimed.

Stage 5 preparation is now recorded in [review-protocol.html](review-protocol.html)
and [review-protocol.json](review-protocol.json). The protocol has two clearly
described conditions, a fictional task, consent and stopping rules, a results
schema, and decision rules. It starts with zero sessions and does not recruit
or invent participant findings.
