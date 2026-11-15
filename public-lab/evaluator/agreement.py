"""Cohen's kappa for paired semantic-review annotations."""
from collections import Counter
from pathlib import Path
import argparse,json
from score_annotations import validate
def kappa(a,b):
 if not a:return None
 po=sum(x==y for x,y in zip(a,b))/len(a); ca,cb=Counter(a),Counter(b); pe=sum(ca[k]*cb[k] for k in set(ca)|set(cb))/(len(a)*len(b)); return None if pe==1 else round((po-pe)/(1-pe),3)
def compare(path):
 rows=[json.loads(x) for x in Path(path).read_text().splitlines() if x.strip()]; checked=validate(rows); by={}
 for raw,ok in zip(rows,checked):
  if ok['valid']: by.setdefault(raw['record_id'],{})[raw['reviewer']]=raw['scores']
 reviewers=sorted({r for x in by.values() for r in x}); out={}
 if len(reviewers)>=2:
  left,right=reviewers[:2]; common=[x for x in by.values() if left in x and right in x]
  for d in ['grounding','uncertainty','role_fit','optionality','respect']: out[d]=kappa([x[left][d] for x in common],[x[right][d] for x in common])
 return {'reviewers':reviewers,'paired_records':sum(len(x)>=2 for x in by.values()),'kappa':out,'interpretation':'Agreement is descriptive and depends on the reviewed sample; it is not clinical validation.'}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('annotations');p.add_argument('-o','--output',default='agreement.json');a=p.parse_args();out=compare(a.annotations);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
