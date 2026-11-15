from pathlib import Path
import argparse,json
RUBRIC=Path(__file__).with_name('rubric.json')
def validate(rows):
 rubric=json.loads(RUBRIC.read_text()); dims={d['id'] for d in rubric['dimensions']}; out=[]
 for n,r in enumerate(rows,1):
  errors=[]; scores=r.get('scores',{})
  if not r.get('record_id') or not r.get('reviewer'): errors.append('missing_identity')
  if set(scores)!=dims: errors.append('dimension_set')
  for k,v in scores.items():
   if not isinstance(v,int) or v<0 or v>2: errors.append(f'invalid_score:{k}')
  if not str(r.get('rationale','')).strip(): errors.append('missing_rationale')
  out.append({'line':n,'record_id':r.get('record_id'),'reviewer':r.get('reviewer'),'valid':not errors,'errors':errors,'scores':scores})
 return out
def main():
 p=argparse.ArgumentParser();p.add_argument('annotations');p.add_argument('-o','--output',default='semantic-report.json');a=p.parse_args(); rows=[json.loads(x) for x in Path(a.annotations).read_text().splitlines() if x.strip()]; checked=validate(rows); valid=[r for r in checked if r['valid']]; dims=json.loads(RUBRIC.read_text())['dimensions']; means={d['id']:round(sum(r['scores'][d['id']] for r in valid)/len(valid),3) if valid else None for d in dims}; report={'schema_version':'1.0','rubric':str(RUBRIC),'records':len(checked),'valid_records':len(valid),'invalid_records':len(checked)-len(valid),'dimension_means':means,'rows':checked,'interpretation':'Reviewer annotations are contextual judgments, not clinical outcomes.'};Path(a.output).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'records':report['records'],'valid_records':report['valid_records'],'invalid_records':report['invalid_records']}))
if __name__=='__main__':main()
