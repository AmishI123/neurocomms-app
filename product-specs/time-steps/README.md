# Show me the time steps

A small local-first tool for working backward from an appointment. It shows
the preparation, travel, spare-time, and departure steps separately.

## Complete product packet

- [Open the app](index.html)
- [Product requirements](PRD.md)
- [Decision report](decision-report.html)
- [Release status](release-status.html)
- [Verification record](verification.md)
- [Reviewer guide](reviewer-guide.md)
- [Private reviewer form](reviewer-form.html)
- [Native Android and iOS handoff](native-platform-handoff.md)

Open it at:

`http://localhost:8765/product-specs/time-steps/index.html`

From `/home/mehta/neuro-divergent`, serve the repository with:

```bash
python3 -m http.server 8765
```

The tool has no account, analytics, calendar connection, traffic prediction,
remote model, or network request from the core calculation. It saves only when
the person chooses “Save on this device.”

Run its browser checks with:

```bash
LD_LIBRARY_PATH=/home/mehta/.cache/sdl-browser-libs/usr/lib/x86_64-linux-gnu \
  node --test product-specs/time-steps/tests/time-steps.test.cjs
```

This is engineering evidence only. It does not show that the tool is useful,
understood, or better than a calculator or written schedule.
