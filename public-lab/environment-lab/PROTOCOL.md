# Environment Lab protocol sketch

## Question

Can a room-preference interface let a person report comfort, discomfort, or uncertainty for simulated sound and light conditions without silently converting a single response into a lasting preference?

## Simulator design

The browser exposes two bounded fictional variables: simulated sound level (20–80 dB) and simulated light level (10–100%). A visitor can alter either variable and explicitly choose **comfortable**, **too much**, or **unsure**. Each event records the values shown and the button pressed. The tool has no sensors and no account.

## Primary descriptive outcomes

1. Number of explicit feedback events by choice.
2. Number of events by preset and choice.
3. Count of **unsure** responses retained as an independent category.

The CLI and browser summaries report counts only. They do not estimate thresholds, diagnose sensory differences, rank rooms, or predict future choices.

## Current evidence and limits

The checked-in fixtures and demo session verify data shape and analysis behavior. They are fictional and contain no participant observations. The simulator has not established usability, reliability, accessibility, or real-world benefit. Any future participant study would need supervision, consent, privacy controls, an approved protocol, and a comparison chosen before recruitment.

## Next testable step

The repository includes a source-level accessibility smoke check for labels and status regions. Have an accessibility reviewer inspect keyboard use, focus order, contrast, and whether the three response choices are understandable. Resolve interface issues before considering any participant-facing pilot.
