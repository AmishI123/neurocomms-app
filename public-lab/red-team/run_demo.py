"""Run the checked-in case -> report -> Atlas -> Markdown demo pipeline."""
from pathlib import Path
import argparse, json, shutil, subprocess, sys

HERE=Path(__file__).parent
ATLAS=HERE.parent/'atlas'

def main():
    p=argparse.ArgumentParser();p.add_argument('-o','--output',default='/tmp/phraselab-demo');a=p.parse_args();out=Path(a.output)
    out.mkdir(parents=True,exist_ok=True)
    case=out/'demo-case.json'; submission=out/'demo-submission.jsonl'; report=out/'demo-report.json'; merged=out/'atlas-with-community.json'
    shutil.copy2(HERE/'demo-case.json',case); shutil.copy2(HERE/'demo-submission.jsonl',submission)
    subprocess.run([sys.executable,str(HERE/'run_case.py'),str(case),str(submission),'-o',str(report)],check=True)
    subprocess.run([sys.executable,str(ATLAS/'import_report.py'),str(report),'-a',str(ATLAS/'atlas.json'),'-l','demo-community','-o',str(merged)],check=True)
    subprocess.run([sys.executable,str(ATLAS/'build_report.py'),'-a',str(merged),'-o',str(out/'ATLAS-REPORT.md')],check=True)
    print(json.dumps({'output':str(out),'report':str(report),'atlas':str(merged),'passed':json.loads(report.read_text())['passed']}));return 0
if __name__=='__main__':sys.exit(main())
