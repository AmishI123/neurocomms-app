# Time Steps — reviewer guide

## What this is

This is a short, source-free review of the Time Steps prototype. It asks
whether the visible steps are understandable, controllable, and respectful of
the limits stated in the product.

It is not a participant study, clinical assessment, approval, or demand test.
It must not collect a diagnosis, a person’s name, a real appointment, or a
private story.

## What the reviewer needs

- the app at `index.html`;
- a keyboard, if available;
- a narrow browser window around 320px wide, if available;
- the private response form at `reviewer-form.html`.

The reviewer may use the fictional task below. They do not need to enter any
personal information.

## Fictional task

Use these values:

- appointment: 10:00 on any date shown by the app;
- preparation: 20 minutes;
- travel: 30 minutes;
- spare time: 10 minutes.

The expected result is:

- start preparing: 09:00;
- leave: 09:20;
- appointment: 10:00.

Then change travel to 45 minutes. The leave time and preparation time should
move earlier while the appointment stays the same.

## Review sequence

1. Open the app and read the purpose before entering anything.
2. Complete the fictional task.
3. Change one value and check whether the visible steps update.
4. Try an empty or unsafe value and check whether the app explains the problem
   without making up a result.
5. If useful, save, reload, and delete the fictional calculation.
6. If useful, check keyboard focus, a narrow window, and print preview.
7. Record what happened in the private form.

## Questions to answer

Focus on what you observed:

- Could you tell what each input meant?
- Could you tell which time was for preparing, leaving, and the appointment?
- Could you tell which assumptions came from you?
- Did changing one value make the changed result easy to see?
- Did any message or control make you stop or guess?
- Was anything hard to use with a keyboard or narrow window?
- Did the local-only and no-prediction limits remain clear?
- What should be changed before another review?

## Stop and report

Stop the review if the product asks for a real person’s private information,
acts as if it knows a person’s diagnosis or needs, hides an assumption, or
shows a result after invalid input. Record the concern without copying private
content.

## What the result means

The response can identify wording, interaction, privacy, and review-protocol
problems. It cannot establish that the product helps people generally, works
for a diagnosis group, improves punctuality, or provides medical advice.

Keep the downloaded response outside the repository and send it only through
an approved private channel.
