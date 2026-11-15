"""Create a descriptive comparison of archived challenge score reports."""
from pathlib import Path
import argparse, json
ROOT=Path(__file__).parent
def summarize(path,label):
    d=json.loads((ROOT/path).read_text() if not Path(path).is_absolute() else Path(path).read_text()); reasons={}
    for row in d.get('rows',[]):
        for reason in row.get('reasons',[]):
            code=reason.get('code','unknown') if isinstance(reason,dict) else str(reason);reasons[code]=reasons.get(code,0)+1
    return {'condition':label,'records':d.get('records',0),'accepted':d.get('accepted',0),'rejected':d.get('rejected',0),'reason_counts':dict(sorted(reasons.items()))}
def main():
    p=argparse.ArgumentParser();p.add_argument('-o','--output',default='condition-comparison.json');a=p.parse_args();out={'schema_version':'1.0','comparison_type':'descriptive','caveat':'Formatting acceptance is an engineering measurement on fictional cases, not usefulness or clinical benefit.','conditions':[summarize('reference-control-report.json','reference-control'),summarize('template-report.json','template-baseline')]};Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));return 0
if __name__=='__main__':main()
