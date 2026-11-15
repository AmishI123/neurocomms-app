from pathlib import Path
import json
root=Path(__file__).parent; d=json.loads((root/'comparison.json').read_text()); rows=''
for run in d['runs']:
 for w,x in run['workflows'].items(): rows+=f"<tr><td>{run['run']}</td><td>{run['model'].get('filename',run['model']) if isinstance(run['model'],dict) else run['model']}</td><td>{w}</td><td>{x['valid']}/{x['outputs']}</td><td>{x['invalid_or_risk_rate']*100:.1f}%</td></tr>"
(root/'comparison.html').write_text('<!doctype html><meta charset="utf-8"><title>PhraseLab descriptive comparison</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto}table{border-collapse:collapse}td,th{padding:8px;border:1px solid #ccc}.note{padding:12px;background:#fff8e8}</style><h1>Descriptive v1/v2/v3 comparison</h1><p class="note">'+d['caveat']+'</p><table><tr><th>Run</th><th>Model</th><th>Workflow</th><th>Valid JSON</th><th>Invalid or flagged</th></tr>'+rows+'</table>')
print('wrote comparison.html')
