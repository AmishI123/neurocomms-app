"""Build a blank semantic-review packet for the frozen challenge conditions."""
from pathlib import Path
import argparse, hashlib, json
ROOT=Path(__file__).parent
def fingerprint(packet):
    payload=json.dumps({'rubric':packet['rubric'],'records':packet['records']},sort_keys=True,separators=(',',':')).encode()
    return hashlib.sha256(payload).hexdigest()
def build(output):
    rubric=json.loads((ROOT.parent/'evaluator'/'rubric.json').read_text()); dims=[d['id'] for d in rubric['dimensions']]; records=[]
    for file in ('reference-control.jsonl','template-baseline.jsonl'):
        for row in (json.loads(x) for x in (ROOT/file).read_text().splitlines() if x.strip()):
            records.append({'record_id':f"{row['condition']}--{row['case_id']}",'case_id':row['case_id'],'condition':row['condition'],'output':row['cards'],'annotation_template':{'reviewer':'','scores':{d:None for d in dims},'rationale':''}})
    packet={'schema_version':'1.0','instructions':'Use fictional records only. Score each dimension 0–2 and provide a rationale. Do not infer diagnoses or personal wishes. This sample is declared before review; blank annotations are intentional.','rubric':rubric,'records':records}
    packet['packet_fingerprint']=fingerprint(packet)
    Path(output).write_text(json.dumps(packet,indent=2)+'\n');return packet
def main():
    p=argparse.ArgumentParser();p.add_argument('-o','--output',default='review-packet.json');a=p.parse_args();x=build(a.output);print(json.dumps({'records':len(x['records']),'output':a.output}));return 0
if __name__=='__main__':main()
