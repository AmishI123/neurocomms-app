"""Compare two Environment Lab exports using descriptive choice counts only."""
from pathlib import Path
import argparse, json, sys
from analyze_session import analyze

def compare(left,right):
    a=analyze(left); b=analyze(right); choices=sorted(set(a['choice_counts'])|set(b['choice_counts']))
    return {'schema_version':'1.0','left_events':a['event_count'],'right_events':b['event_count'],
            'choice_differences':{c:b['choice_counts'].get(c,0)-a['choice_counts'].get(c,0) for c in choices},
            'interpretation':'Descriptive differences between two fictional session logs. Unequal counts do not establish a preference, threshold, effect, or generalization.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('left');p.add_argument('right');p.add_argument('-o','--output',default='environment-comparison.json');a=p.parse_args();out=compare(json.loads(Path(a.left).read_text()),json.loads(Path(a.right).read_text()));Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));return 0
if __name__=='__main__':sys.exit(main())
