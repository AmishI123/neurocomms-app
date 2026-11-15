import json
from pathlib import Path
data=json.loads((Path(__file__).parent/'cases/cases.json').read_text())
assert data['schema_version']=='1.0' and len(data['cases'])>=3
for c in data['cases']:
 assert c['id'] and c['known_facts'] and c['unknown_facts'] and c['word_limit']>0
 assert set(c['expected_behaviors']) >= {'preserve uncertainty'} if c['id']=='unknown-preference' else True
print(f"validated {len(data['cases'])} fictional adversarial cases")
