"""Summarize an exported Environment Lab session without inference."""
from pathlib import Path
import argparse, json, sys
from validate_session import validate

def analyze(data):
    events=data.get('events',[]) if isinstance(data,dict) else []
    by_choice={}; by_preset={}
    for e in events:
        choice=e.get('choice','unknown'); preset=e.get('preset','unknown')
        by_choice[choice]=by_choice.get(choice,0)+1
        by_preset.setdefault(preset,{})[choice]=by_preset.setdefault(preset,{}).get(choice,0)+1
    return {'schema_version':'1.0','event_count':len(events),'choice_counts':dict(sorted(by_choice.items())), 'preset_choice_counts':by_preset,
            'interpretation':'Descriptive counts of explicit simulator buttons. They do not infer sensory sensitivity, preference, or real-world action.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('session');p.add_argument('-o','--output',default='environment-summary.json');a=p.parse_args();data=json.loads(Path(a.session).read_text());errors=validate(data)
    if errors: print('\n'.join(errors)); return 1
    out=analyze(data);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'events':out['event_count'],'choices':out['choice_counts']}));return 0
if __name__=='__main__':sys.exit(main())
