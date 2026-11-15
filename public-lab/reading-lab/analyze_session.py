"""Summarize explicit Reading Lab choices."""
from pathlib import Path
import argparse, json, sys
from validate_session import validate
def analyze(data):
    events=data.get('events',[]); counts={}
    for e in events: counts[e.get('choice','unknown')]=counts.get(e.get('choice','unknown'),0)+1
    return {'schema_version':'1.0','event_count':len(events),'choice_counts':dict(sorted(counts.items())), 'interpretation':'Descriptive counts of explicit interface feedback. They do not assess reading ability or identify a best setting.'}
def main():
    p=argparse.ArgumentParser();p.add_argument('session');p.add_argument('-o','--output',default='reading-summary.json');a=p.parse_args();data=json.loads(Path(a.session).read_text());errors=validate(data)
    if errors: print('\n'.join(errors));return 1
    out=analyze(data);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'events':out['event_count'],'choices':out['choice_counts']}));return 0
if __name__=='__main__':sys.exit(main())
