# Previous release test fixture

These five runtime files are copied unchanged from the previously verified archive, SHA-256 `682a8ff2acc253966da698ffd64a6667786366859d24ddd0baf0440d7df226fc`.

They are test inputs, not the current app. The continuity browser suite first serves this actual earlier app, saves a visit, then serves the current app and updates the offline worker. It also opens the old app against upgraded saved data to check that old code refuses to overwrite it. Do not update these fixtures to make new tests pass.
