"""Build a small public catalog from fictional benchmark outputs."""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[2]
analysis=json.loads((ROOT/'benchmark-v3/results/analysis.json').read_text())
rows=[]
for row in analysis['rows']:
 s=row['score'];
 if not s['valid'] or s.get('duplicate_cards') or s.get('over_limit_cards'):
  rows.append({'id':row['id'],'condition':row['condition'],'case_id':row['case_id'],'failure':s.get('parse_error') or ('duplicate_cards' if s.get('duplicate_cards') else 'over_limit_cards'),'output':row['content'][:900]})
 if len(rows)>=9: break
out=Path(__file__).parent/'catalog.json';out.write_text(json.dumps({'scope':'fictional benchmark outputs; truncated for display','records':rows},indent=2)+'\n');print(f'wrote {len(rows)} museum records')
