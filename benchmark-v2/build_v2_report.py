import json, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent
out = ROOT / 'results'
a = json.loads((out/'analysis.json').read_text())
audit = json.loads((out/'audit.json').read_text())
s = a['summaries']
lines = [
 '# Held-out generalization benchmark', '',
 'Run date: 2026-09-08. This is a descriptive engineering benchmark on 12 fictional held-out cases, three seeds, and three prompt workflows. It is not a clinical or efficacy study.', '',
 '## Result', '',
 'The Qwen2.5-0.5B-Instruct Q5_K_M model completed all 108 local requests, but format reliability was poor. Valid JSON was produced for 5/36 basic outputs, 9/36 context outputs, and 0/36 review outputs. The invalid-or-risk rate was 86.1%, 75.0%, and 100.0%, respectively. Because review had no valid outputs, it cannot support a quality comparison.', '',
 '| workflow | outputs | valid JSON | invalid or flagged | duplicate cards | over-limit cards |',
 '|---|---:|---:|---:|---:|---:|',
 *[f"| {k} | {s[k]['outputs']} | {s[k]['valid']} | {s[k]['invalid_or_risk']} ({100*s[k]['invalid_or_risk_rate']:.1f}%) | {s[k]['duplicate_cards']} | {s[k]['over_limit_cards']} |" for k in ['basic','context','review']], '',
 '## Interpretation', '',
 '- Added context reduced invalid-or-risk outputs by 11.1 percentage points relative to basic (12 paired cases; bootstrap 95% CI −22.2 to 0 points). This is a formatting and rule outcome, not evidence of improved communication usefulness.',
 '- Review added prompt tokens but produced zero valid outputs. The selected audit shows repeated drafts, unsupported assumptions, and word-limit violations surviving review.',
 '- Reference diagnostics are limited to constructed labels: precision 1.00 and recall 0.43 for the narrow automatic reference detector.', '',
 '## Reproducibility and limits', '',
 'The model and runtime are locally pinned in `setup_local.py` with SHA-256 locks. Raw responses, frozen manifest, scoring code, analysis JSON, and the 12-entry qualitative audit are included. The held-out cases differ from v1, so side-by-side rates are descriptive and cannot isolate model effects. The scoring rules are narrow, the references were authored by the benchmark designer, and no participant or clinical outcome was measured.', '',
 '## Next decision', '',
 'Do not proceed to participant testing or claim that review improves communication. The next useful engineering milestone is to improve constrained decoding and schema validation, then rerun the same held-out manifest to test whether format reliability—not prompt verbosity—is the bottleneck.'
]
(ROOT/'REPORT.md').write_text('\n'.join(lines)+'\n')
rows=''.join(f"<tr><td>{k}</td><td>{s[k]['outputs']}</td><td>{s[k]['valid']}</td><td>{s[k]['invalid_or_risk']} ({100*s[k]['invalid_or_risk_rate']:.1f}%)</td></tr>" for k in ['basic','context','review'])
(ROOT/'REPORT.html').write_text('<!doctype html><meta charset="utf-8"><title>Held-out benchmark</title><style>body{font:16px system-ui;max-width:900px;margin:40px auto;line-height:1.5}table{border-collapse:collapse}td,th{padding:8px;border:1px solid #ccc}</style><h1>Held-out generalization benchmark</h1><p>Qwen2.5-0.5B-Instruct Q5_K_M; 108 local requests; fictional cases only.</p><table><tr><th>Workflow</th><th>Outputs</th><th>Valid JSON</th><th>Invalid or flagged</th></tr>'+rows+'</table><h2>Decision</h2><p>Improve constrained decoding and schema validation before any participant work. Review produced zero valid outputs in this run.</p>')
print('wrote', ROOT/'REPORT.md', ROOT/'REPORT.html')
