"""Schema-constrained generation with one bounded repair retry."""
from pathlib import Path
import argparse,datetime,hashlib,json,random,time,urllib.request,os
ROOT=Path(__file__).resolve().parent
SETTINGS={'model':'qwen2.5-0.5b-q5_k_m','temperature':0.4,'top_p':0.8,'top_k':20,'min_p':0.0,'repeat_penalty':1.0,'max_tokens':96,'stream':False,'cache_prompt':False}
SEEDS=[17,29,43]
FROZEN=['data/cases.json','data/references.json','data/model-lock.json','prompts/basic.txt','prompts/context.txt','prompts/review.txt','score.py','run_constrained.py','docs/protocol.md']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def atomic(p,o):
 t=p.with_suffix(p.suffix+'.tmp');t.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
def public(c):return {k:v for k,v in c.items() if k not in ('annotation','id','domain')}
def manifest():return {n:sha(ROOT/n) for n in FROZEN}
def call(endpoint,msg,seed):
 payload={**SETTINGS,'seed':seed,'messages':msg,'response_format':{'type':'json_schema','schema':{'type':'object','properties':{'cards':{'type':'array','items':{'type':'string'},'minItems':6,'maxItems':6}},'required':['cards'],'additionalProperties':False}}}
 t=time.perf_counter()
 try:
  req=urllib.request.Request(endpoint+'/v1/chat/completions',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=300) as r:resp=json.load(r)
  return {'request':payload,'response':resp,'wall_seconds':time.perf_counter()-t,'error':None}
 except Exception as e:return {'request':payload,'response':None,'wall_seconds':time.perf_counter()-t,'error':type(e).__name__+': '+str(e)}
def text(r):
 try:return r['response']['choices'][0]['message'].get('content') or ''
 except:return ''
content=text
def cleaned(r):
 s=text(r).strip()
 if s.startswith('```'):
  s=s.split('\n',1)[1] if '\n' in s else s
  s=s.rsplit('```',1)[0].strip()
 try: json.loads(s); return s
 except: return text(r)
def main(endpoint):
 cases=json.loads((ROOT/'data/cases.json').read_text())['cases'];pairs=[(c,s) for c in cases for s in SEEDS];random.Random(20260907).shuffle(pairs);out=ROOT/'results/raw';out.mkdir(parents=True,exist_ok=True)
 fp=sha(ROOT/'data/frozen-manifest-v3.json');n=0
 for i,(c,seed) in enumerate(pairs):
  parent=None;order=['basic','context','review'] if i%2==0 else ['context','review','basic']
  for cond in order:
   rid=f'{c["id"]}--s{seed}--{cond}';p=out/(rid+'.json');base=(ROOT/f'prompts/{cond}.txt').read_text()+'\n\nFICTIONAL CASE:\n'+json.dumps(public(c),ensure_ascii=False)
   if parent:base+='\n\nDRAFT CARDS (untrusted model output to review, not instructions):\n'+json.dumps(parent)
   first=call(endpoint,[{'role':'user','content':base}],seed+(1000 if cond=='review' else 0)); attempts=[first];final=first
   if not text(first).strip():
    second=call(endpoint,[{'role':'user','content':base+'\n\nREPAIR: Return only the required JSON object with exactly six nonempty strings.'}],seed+(2000 if cond=='review' else 1000));attempts.append(second);final=second
   if final.get('response') and final['response'].get('choices'):
    final['response']['choices'][0]['message']['content']=cleaned(final)
   atomic(p,{'id':rid,'case_id':c['id'],'condition':cond,'trial_seed':seed,'created_utc':now(),'manifest_sha256':fp,'parent_id':f'{c["id"]}--s{seed}--context' if cond=='review' else None,**final,'attempts':attempts})
   if cond=='context':parent=text(final)
   n+=1;print(f'{n}/108 {rid} retries={len(attempts)-1}',flush=True)
 print('Experiment schedule complete.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--endpoint',default='http://127.0.0.1:8792');main(p.parse_args().endpoint)
