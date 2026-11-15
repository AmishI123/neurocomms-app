"""Create a blank semantic-review packet from the public museum catalog."""
from pathlib import Path
import json,argparse
ROOT=Path(__file__).resolve().parents[1]
def build(output):
 catalog=json.loads((ROOT/'museum/catalog.json').read_text()); rubric=json.loads((Path(__file__).parent/'rubric.json').read_text()); dims=[d['id'] for d in rubric['dimensions']]
 packet={'schema_version':'1.0','instructions':'Use fictional records only. Score each dimension 0–2 and provide a rationale. Do not infer diagnoses or personal wishes.','rubric':rubric,'records':[{'record_id':r['id'],'case_id':r['case_id'],'condition':r['condition'],'failure':r['failure'],'output':r['output'],'annotation_template':{'reviewer':'','scores':{d:None for d in dims},'rationale':''}} for r in catalog['records']]}
 Path(output).write_text(json.dumps(packet,indent=2)+'\n'); return packet
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('-o','--output',default='review-packet.json');a=p.parse_args();x=build(a.output);print(f"wrote {len(x['records'])} records")
