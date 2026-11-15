"""Compare two Reading Lab exports using descriptive counts only."""
from pathlib import Path
import argparse, json, sys
from analyze_session import analyze
from validate_session import validate
def compare(left,right):
    a=analyze(left);b=analyze(right);keys=sorted(set(a['choice_counts'])|set(b['choice_counts']))
    return {'schema_version':'1.0','left_events':a['event_count'],'right_events':b['event_count'],'choice_differences':{k:b['choice_counts'].get(k,0)-a['choice_counts'].get(k,0) for k in keys},'interpretation':'Descriptive differences between fictional interface logs. They do not assess reading ability or establish a best setting.'}
def main():
    p=argparse.ArgumentParser();p.add_argument('left');p.add_argument('right');p.add_argument('-o','--output',default='reading-comparison.json');a=p.parse_args();left=json.loads(Path(a.left).read_text());right=json.loads(Path(a.right).read_text());errors=validate(left)+validate(right)
    if errors: print('\n'.join(errors));return 1
    out=compare(left,right);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));return 0
if __name__=='__main__':sys.exit(main())
