"""Create a descriptive cross-run table without implying a causal model comparison."""
from pathlib import Path
import json,argparse
ROOT=Path(__file__).resolve().parents[2]
def read(label,path):
 x=json.loads(Path(path).read_text()); return {'run':label,'model':x['model'].get('filename',x['model'].get('model','unknown')),'cases':len(x['cases']),'workflows':{k:{'valid':v['valid'],'outputs':v['outputs'],'invalid_or_risk_rate':round(v['invalid_or_risk_rate'],4)} for k,v in x['summaries'].items()}}
def main():
 p=argparse.ArgumentParser();p.add_argument('-o','--output',default='comparison.json');a=p.parse_args();runs=[read('v1',ROOT/'benchmark/results/analysis.json'),read('v2',ROOT/'benchmark-v2/results/analysis.json'),read('v3',ROOT/'benchmark-v3/results/analysis.json')];out={'schema_version':'1.0','comparison_type':'descriptive','caveat':'Runs use different fictional case sets and therefore do not isolate model effects. Rates are not a leaderboard of clinical usefulness.','runs':runs};Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'runs':len(runs),'caveat':out['caveat']}))
if __name__=='__main__':main()
