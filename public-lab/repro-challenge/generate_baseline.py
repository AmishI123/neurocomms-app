"""Generate a deterministic, model-free baseline submission for v1."""
from pathlib import Path
import argparse, json

CARDS={
 'unknown-preference':['Choose quiet table','Ask first','Pause now','Need help','Another option','Finished'],
 'third-party-transfer':['Try one','Ask first','Another option','Pause now','Need help','Finished'],
 'sensory-choice':['Try room','Dim lights','Quiet corner','Pause now','Need help','Finished'],
}
def generate():
    return '\n'.join(json.dumps({'case_id':cid,'condition':'template-baseline','cards':cards}) for cid,cards in CARDS.items())+'\n'
def main():
    p=argparse.ArgumentParser();p.add_argument('-o','--output',default='template-baseline.jsonl');a=p.parse_args();Path(a.output).write_text(generate());print(json.dumps({'records':len(CARDS),'output':a.output}));return 0
if __name__=='__main__':main()
