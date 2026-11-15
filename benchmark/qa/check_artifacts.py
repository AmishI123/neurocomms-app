"""Completion audit of archived results, protocol, report links and source hashes."""
from pathlib import Path
import collections,hashlib,json,re,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import run,score
from analyze import summarize

def check():
 frozen=json.loads((ROOT/'data/frozen-manifest.json').read_text());assert frozen['sha256']==run.manifest()
 data=json.loads((ROOT/'results/analysis.json').read_text());assert len(data['rows'])==108
 assert collections.Counter(r['condition'] for r in data['rows'])=={'basic':36,'context':36,'review':36}
 assert len({r['id'] for r in data['rows']})==108
 cases={c['id']:c for c in data['cases']}
 for r in data['rows']:
  raw=json.loads((ROOT/'results/raw'/(r['id']+'.json')).read_text())
  assert r['content']==run.content(raw)
  assert r['score']==score.score(r['content'],cases[r['case_id']],r['finish_reason'])
  if raw['condition']=='review':
   parent=json.loads((ROOT/'results/raw'/(raw['parent_id']+'.json')).read_text())
   assert json.dumps(run.content(parent),ensure_ascii=False) in raw['request']['messages'][0]['content']
   assert r['workflow_tokens']==raw['response']['usage']['total_tokens']+parent['response']['usage']['total_tokens']
 assert data['cost']['actual_prompt_tokens']==sum(r['usage']['prompt_tokens'] for r in data['rows'])
 assert data['cost']['actual_completion_tokens']==sum(r['usage']['completion_tokens'] for r in data['rows'])
 for condition in ['basic','context','review']:assert data['summaries'][condition]==summarize([r for r in data['rows'] if r['condition']==condition])
 audit=json.loads((ROOT/'results/audit.json').read_text());assert len(audit['entries'])==12
 for e in audit['entries']+audit['posthoc_examples']:
  assert hashlib.sha256((ROOT/'results/raw'/(e['id']+'.json')).read_bytes()).hexdigest()==e['source_sha256']
 dashboard=(ROOT/'dashboard.html').read_text();embedded=json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>',dashboard,re.S)[1]);assert embedded.pop('audit')==audit;assert embedded==data
 for file in ['REPORT.md','REPORT.html','REPORT.pdf','figures/measurements.png','figures/measurements.svg','figures/measurements.pdf','figures/paired-differences.png','figures/paired-differences.svg','figures/paired-differences.pdf','README.md','docs/protocol.md']:
  assert (ROOT/file).is_file() and (ROOT/file).stat().st_size>0,file
 for p in ROOT.rglob('*.md'):
  if 'node_modules' in p.parts:continue
  for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
   if not link.startswith(('https://','http://','#')):assert (p.parent/link).exists(),str(p)+': '+link
 result={'status':'pass','records':108,'conditions':3,'cases':12,'trials_per_condition_case':3,'audit_entries':12,'frozen_inputs_match':True,'raw_scores_match':True,'parent_drafts_match':True,'dashboard_matches_analysis':True,'token_totals_match':True}
 (ROOT/'qa/artifact-check.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':check()
