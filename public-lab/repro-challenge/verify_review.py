"""Verify two complete reviewer files and compute descriptive agreement."""
from pathlib import Path
import argparse, json, sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'evaluator'))
from evaluator.score_annotations import validate
from evaluator.agreement import compare
from build_review_packet import fingerprint

def verify(paths, packet_path=None):
    rows=[]; file_rows=[]
    for path in paths:
        current=[json.loads(x) for x in Path(path).read_text().splitlines() if x.strip()]
        file_rows.append(current); rows += current
    checked=validate(rows); reviewers=sorted({r.get('reviewer') for r in rows}); ids={r.get('record_id') for r in rows}
    errors=[]
    packet_fingerprint=None
    packet_ids=None
    if packet_path:
        packet=json.loads(Path(packet_path).read_text())
        packet_fingerprint=packet.get('packet_fingerprint')
        packet_ids={r.get('record_id') for r in packet.get('records', [])}
        if packet_fingerprint != fingerprint(packet): errors.append('review packet fingerprint is invalid')
        for n, current in enumerate(file_rows, 1):
            row_fingerprints={r.get('packet_fingerprint') for r in current}
            if row_fingerprints != {packet_fingerprint}: errors.append(f'file {n} must identify the supplied review packet')
            if {r.get('record_id') for r in current} != packet_ids: errors.append(f'file {n} record IDs do not match the supplied review packet')
    if len(paths)!=2: errors.append('expected exactly two annotation files')
    if len(reviewers)!=2: errors.append('expected exactly two reviewer codes')
    if any(not x['valid'] for x in checked): errors.append('one or more annotations failed validation')
    file_ids=[]
    for n, current in enumerate(file_rows, 1):
        file_reviewers={r.get('reviewer') for r in current}
        current_ids={r.get('record_id') for r in current}
        file_ids.append(current_ids)
        if len(file_reviewers)!=1: errors.append(f'file {n} must contain exactly one reviewer code')
        if len(current)!=6 or len(current_ids)!=6: errors.append(f'file {n} must contain six unique records')
    if len(file_ids)==2 and file_ids[0] != file_ids[1]: errors.append('reviewers must annotate the same six records')
    if len(ids)!=6: errors.append('expected the declared six-record sample')
    return {'valid':not errors,'errors':errors,'reviewers':reviewers,'records':len(rows),'packet_fingerprint':packet_fingerprint,'agreement':compare_from_rows(rows) if not errors else None}

def compare_from_rows(rows):
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w+',suffix='.jsonl') as f:
        f.write('\n'.join(json.dumps(x) for x in rows)+'\n');f.flush();return compare(f.name)
def main():
    p=argparse.ArgumentParser();p.add_argument('reviewer_a');p.add_argument('reviewer_b');p.add_argument('--packet',required=True,help='frozen review packet used for these annotations');p.add_argument('-o','--output',default='review-verification.json');a=p.parse_args();out=verify([a.reviewer_a,a.reviewer_b],a.packet);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'valid':out['valid'],'reviewers':out['reviewers'],'records':out['records'],'packet_fingerprint':out['packet_fingerprint']}));return 0 if out['valid'] else 1
if __name__=='__main__':sys.exit(main())
