"""Analyze raw responses with frozen rules and case-level paired bootstrap."""
from pathlib import Path
import collections,datetime,json,random,statistics
import run,score
ROOT=Path(__file__).resolve().parent
CONDITIONS=['basic','context','review']
def avg(xs):return statistics.mean(xs) if xs else None
def percentile(xs,q):
 xs=sorted(xs);pos=(len(xs)-1)*q;lo=int(pos);hi=min(lo+1,len(xs)-1)
 return xs[lo]*(hi-pos)+xs[hi]*(pos-lo) if hi!=lo else xs[lo]
def paired_difference(rows,left,right,metric,draws=10000):
 values=[]
 for cid in sorted({r['case_id'] for r in rows}):
  a=[r['score'][metric] for r in rows if r['case_id']==cid and r['condition']==left and r['score'][metric] is not None]
  b=[r['score'][metric] for r in rows if r['case_id']==cid and r['condition']==right and r['score'][metric] is not None]
  if a and b:values.append(avg(a)-avg(b))
 if not values:return {'difference':None,'ci95':None,'cases':0}
 rng=random.Random(20260907);samples=[avg(rng.choices(values,k=len(values))) for _ in range(draws)]
 return {'difference':avg(values),'ci95':[percentile(samples,.025),percentile(samples,.975)],'cases':len(values),'unit':'case; three trials averaged within condition','contrast':left+' minus '+right}
def summarize(rows):
 valid=[r for r in rows if r['score']['valid']]
 return {'outputs':len(rows),'valid':len(valid),'invalid':len(rows)-len(valid),'risk_outputs':sum(r['score']['risk_any'] for r in valid),'risk_rate_valid':avg([r['score']['risk_any'] for r in valid]),'invalid_or_risk':sum(r['score']['invalid_or_risk'] for r in rows),'invalid_or_risk_rate':avg([r['score']['invalid_or_risk'] for r in rows]),'duplicate_cards':sum(r['score']['duplicate_cards'] for r in valid),'over_limit_cards':sum(r['score']['over_limit_cards'] for r in valid),'function_indicators':{key:sum(r['score']['lexical_functions'][key] for r in valid) for key in ['refusal','question','comment','social']},'wall_seconds_total':sum(r['wall_seconds'] for r in rows),'wall_seconds_median':statistics.median([r['wall_seconds'] for r in rows]) if rows else None,'prompt_tokens':sum(r['usage'].get('prompt_tokens',0) for r in rows),'completion_tokens':sum(r['usage'].get('completion_tokens',0) for r in rows),'workflow_tokens':sum(r['workflow_tokens'] for r in rows),'workflow_seconds_total':sum(r['workflow_seconds'] for r in rows)}
def reference_diagnostics(cases):
 refs=json.loads((ROOT/'data/references.json').read_text())['examples'];counts=collections.Counter()
 for ref in refs:
  actual=bool(score.flags_for_card(ref['text'],cases[ref['case']]))
  counts[('true_' if actual==ref['semantic_risk'] else 'false_')+('positive' if actual else 'negative')]+=1
 return {'n':len(refs),**dict(counts),'precision':counts['true_positive']/(counts['true_positive']+counts['false_positive']),'recall':counts['true_positive']/(counts['true_positive']+counts['false_negative']),'scope':'Constructed reference examples only; labels authored by benchmark designer, not independent expert validation.'}
def analyze():
 frozen=json.loads((ROOT/'data/frozen-manifest.json').read_text());assert frozen['sha256']==run.manifest(),'Frozen source changed'
 fingerprint=run.sha(ROOT/'data/frozen-manifest.json')
 cases={c['id']:c for c in json.loads((ROOT/'data/cases.json').read_text())['cases']}
 expected={f'{cid}--s{seed}--{cond}' for cid in cases for seed in run.SEEDS for cond in CONDITIONS}
 raw={p.stem:json.loads(p.read_text()) for p in (ROOT/'results/raw').glob('*.json')}
 assert set(raw)==expected,f'Expected full schedule; missing {len(expected-set(raw))}, extra {len(set(raw)-expected)}'
 rows=[]
 for rid,r in sorted(raw.items()):
  assert r['manifest_sha256']==fingerprint and r['id']==rid
  response=r.get('response') or {};choice=(response.get('choices') or [{}])[0];finish=choice.get('finish_reason','runtime_error')
  text=run.content(r);s=score.score(text,cases[r['case_id']],finish)
  usage=response.get('usage',{});parent=raw.get(r.get('parent_id'))
  total=usage.get('total_tokens',usage.get('prompt_tokens',0)+usage.get('completion_tokens',0))
  parent_usage=((parent or {}).get('response') or {}).get('usage',{})
  rows.append({'id':rid,'case_id':r['case_id'],'condition':r['condition'],'seed':r['trial_seed'],'content':text,'finish_reason':finish,'error':r['error'],'score':s,'usage':usage,'wall_seconds':r['wall_seconds'],'workflow_tokens':total+parent_usage.get('total_tokens',0),'workflow_seconds':r['wall_seconds']+(parent['wall_seconds'] if parent else 0)})
 summaries={condition:summarize([r for r in rows if r['condition']==condition]) for condition in CONDITIONS}
 comparisons={f'{a}_minus_{b}':{metric:paired_difference(rows,a,b,metric) for metric in ['risk_any','invalid_or_risk']} for a,b in [('review','context'),('context','basic')]}
 data={'generated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'experiment_manifest_sha256':fingerprint,'model':json.loads((ROOT/'data/model-lock.json').read_text()),'summaries':summaries,'comparisons':comparisons,'reference_diagnostics':reference_diagnostics(cases),'cost':{'api_fees_usd':0,'electricity_hardware_cost':'not measured','actual_model_calls':len(rows),'actual_prompt_tokens':sum(r['usage'].get('prompt_tokens',0) for r in rows),'actual_completion_tokens':sum(r['usage'].get('completion_tokens',0) for r in rows),'actual_request_wall_seconds':sum(r['wall_seconds'] for r in rows)},'cases':list(cases.values()),'rows':rows}
 run.atomic(ROOT/'results/analysis.json',data)
 print(json.dumps({k:data[k] for k in ['summaries','comparisons','reference_diagnostics','cost']},indent=2));return data
if __name__=='__main__':analyze()
