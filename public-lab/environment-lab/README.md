# Environment Lab

An offline simulator for testing how a room-preference interface could represent sound and light conditions. It uses fictional presets and records only the buttons a visitor presses in their browser. The export is an interaction log, not a measurement of sensory sensitivity and not a recommendation for a real person.

Open `index.html` directly, adjust the sliders, select **comfortable**, **too much**, or **unsure**, and download the JSON session. No sensors, network requests, or accounts are required.

Read [PROTOCOL.md](PROTOCOL.md) for the question, measured fields, interpretation limits, and next review step.

Summarize an exported session with `python3 analyze_session.py environment-session.json`. The checked-in demo uses `demo-session.json` and produces `demo-summary.json`. The output keeps **unsure** separate and reports counts only; it does not infer sensitivity or recommend an environment.

Validate an export before analysis with `python3 validate_session.py environment-session.json`.

Compare two exports in the browser with `compare.html`, or with `python3 compare_sessions.py left.json right.json`. The result contains count differences only and is not a statistical test.

For a future hardware integration, `import_sensor_csv.py` accepts a user-owned CSV with `timestamp,preset,sound_db,light_pct,choice` columns and emits the same validated session schema. It does not connect to hardware or verify sensor calibration.
