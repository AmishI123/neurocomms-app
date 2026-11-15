# Reading Lab

An offline interface experiment for comparing presentation settings on short fictional text. Visitors can adjust text size, line spacing, and line width, then explicitly choose **clear**, **hard to read**, or **unsure**. The tool records the setting shown and the button pressed.

This is not a dyslexia screener, reading assessment, or recommendation engine. It contains no participant data and makes no claim that one setting works for anyone.

Validate and summarize an export with `python3 validate_session.py reading-session.json` and `python3 analyze_session.py reading-session.json`. The checked-in `demo-session.json` produces `demo-summary.json`; counts are descriptive only.

Compare two validated exports with `python3 compare_sessions.py left.json right.json`. See [PROTOCOL.md](PROTOCOL.md) for the question and interpretation limits.
