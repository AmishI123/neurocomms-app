# Show me the time steps — product requirements

## Purpose

Help a person check one appointment schedule by showing each time subtraction
in words. The person enters the assumptions and decides whether they fit.

## First user and first task

The first user is an adult who wants to check when to start getting ready for
an appointment. The first task is:

1. enter the appointment date and time;
2. enter preparation, travel, and optional spare minutes;
3. see the departure and preparation times, including the date;
4. change an assumption and see the result change;
5. save locally or print if useful.

## In scope

- One appointment at a time.
- Local date and time input.
- Preparation, travel, and spare-time values in whole minutes.
- 12-hour or 24-hour display.
- Visible calculation steps and dates.
- Previous-day and midnight crossings.
- Input validation, local save, reload, delete, and print.
- Keyboard use, visible focus, labels, narrow screens, and text status.

## Out of scope

- Traffic or travel-time predictions.
- Calendar access, reminders, notifications, or location tracking.
- Money, medication, dosage, or financial calculations.
- Time-zone conversion or daylight-saving calculations.
- Judging punctuality, intelligence, ability, or mathematical skill.
- Accounts, cloud sync, analytics, advertising, or remote AI.

## Requirements

- `DC-01`: For a 10:00 appointment, 30 minutes travel, 20 minutes
  preparation, and 10 minutes spare time, show departure at 09:20 and start
  preparing at 09:00.
- `DC-02`: Empty, invalid, negative, or overlong minute values must produce a
  specific message and no result. The app must not invent a value.
- `DC-03`: A result crossing midnight must show the correct previous date.
- `DC-04`: If the local time-zone offset changes inside the calculation, the
  app must refuse the result and explain that this version does not support
  daylight-saving changes.
- `DC-05`: Saved work must be labeled as saved on this device. Malformed saved
  data must fail safely and allow a fresh start.
- `DC-06`: Delete must require confirmation and clear only this app’s local
  record.
- `DC-07`: Print must show the result and hide editor controls.
- `DC-08`: Every input and action must have an accessible name. Keyboard focus
  must remain visible and the result status must be available to assistive
  technology.

## Data and privacy

The saved record contains only the appointment date/time, three minute values,
display choice, and optional label. It is browser storage, not a secure vault.
No data leaves the page. Printed copies may be seen or copied by others.

## Limits

The calculation is arithmetic under the assumptions entered by the person. It
does not say whether travel will actually take that long or whether a person is
ready to leave. Engineering checks do not establish usefulness or benefit.
