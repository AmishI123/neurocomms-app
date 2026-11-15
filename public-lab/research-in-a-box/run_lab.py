"""One-command classroom lab: generate fixtures and score an example submission."""
from pathlib import Path
import sys,json
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from cases.generate import generate
from challenge.score_submission import score
if __name__=='__main__':
 root=Path(__file__).resolve().parent; fixtures=generate(17,12); (root/'generated-cases.json').write_text(json.dumps(fixtures,indent=2)+'\n')
 rows=score(root.parent/'challenge/example-submission.jsonl'); report={'fixture_count':len(fixtures['cases']),'example_records':len(rows),'example_accepted':sum(x['allowed'] for x in rows),'fictional_only':True}; (root/'lab-run.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps(report))
