"""Score a PhraseLab JSONL submission against fictional cases."""
from pathlib import Path
import argparse,json
from firewall.core import inspect
ROOT=Path(__file__).resolve().parents[1]
def load_cases(): return {c['id']:c for c in json.loads((ROOT/'cases/cases.json').read_text())['cases']}
def score(path):
 cases=load_cases(); rows=[]; seen=set()
 for n,line in enumerate(Path(path).read_text().splitlines(),1):
  if not line.strip(): continue
  try: rec=json.loads(line)
  except Exception: rows.append({'line':n,'allowed':False,'reasons':[{'code':'invalid_record_json'}]}); continue
  cid=rec.get('case_id'); c=cases.get(cid); reasons=[]
  if not c: reasons.append({'code':'unknown_case'})
  if not rec.get('condition'): reasons.append({'code':'missing_condition'})
  key=(cid,rec.get('condition'))
  if key in seen: reasons.append({'code':'duplicate_submission'})
  seen.add(key)
  decision=inspect(json.dumps({'cards':rec.get('cards')}),word_limit=c['word_limit'] if c else 8,forbidden_topics=c.get('forbidden_topics',[]) if c else [])
  reasons.extend(decision.reasons)
  rows.append({'line':n,'case_id':cid,'condition':rec.get('condition'),'allowed':not reasons,'reasons':reasons,'normalized':decision.normalized})
 return rows
def main():
 p=argparse.ArgumentParser();p.add_argument('submission');p.add_argument('-o','--output',default='submission-report.json');p.add_argument('--html',default=None);a=p.parse_args();rows=score(a.submission); report={'schema_version':'1.0','submission':a.submission,'records':len(rows),'accepted':sum(r['allowed'] for r in rows),'rejected':sum(not r['allowed'] for r in rows),'rows':rows};Path(a.output).write_text(json.dumps(report,indent=2)+'\n');
 if a.html:
  cells=''.join(f"<tr><td>{r.get('line')}</td><td>{r.get('case_id','')}</td><td>{'Accepted' if r['allowed'] else 'Rejected'}</td><td>{', '.join(x.get('code','') for x in r['reasons'])}</td></tr>" for r in rows)
  Path(a.html).write_text('<!doctype html><meta charset="utf-8"><title>PhraseLab submission report</title><style>body{font:16px system-ui;max-width:900px;margin:40px auto}table{border-collapse:collapse}td,th{padding:8px;border:1px solid #ccc}</style><h1>PhraseLab submission report</h1><p>'+str(report['accepted'])+' accepted · '+str(report['rejected'])+' rejected</p><table><tr><th>Line</th><th>Case</th><th>Status</th><th>Reasons</th></tr>'+cells+'</table><p>Fictional fixtures only. Deterministic checks are not clinical judgments.</p>')
 print(json.dumps({k:report[k] for k in ['records','accepted','rejected']}))
if __name__=='__main__':main()
