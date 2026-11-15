import json
from pathlib import Path

root = Path(__file__).resolve().parent
data = json.loads((root/'results/analysis.json').read_text())
data['audit'] = json.loads((root/'results/audit.json').read_text())
template = (root/'dashboard-template.html').read_text()
template = template.replace('Actual local model outputs · v1.0.0', 'Actual local model outputs · held-out v2')
template = template.replace('__DATA__', json.dumps(data, separators=(',', ':')))
(root/'dashboard.html').write_text(template)
print('wrote dashboard.html')
