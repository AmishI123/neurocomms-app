"""Render a concise, caveated Markdown report from atlas.json."""
from pathlib import Path
import argparse, json

def render(data):
    lines=["# PhraseLab Live Atlas report", "", f"Generated from `{data.get('generated_by','atlas')}`.", "",
           "> This is a descriptive index of fictional benchmark records. Runs use different case sets; rates do not establish model superiority, communication benefit, or clinical effectiveness.", "",
           "## Run inventory", "", "| Run | Model | Cases | Workflows |", "|---|---|---:|---|"]
    for run in data.get("runs",[]):
        workflows=', '.join(f"{k}: {v.get('valid',0)}/{v.get('outputs',0)} valid" for k,v in run.get('workflows',{}).items())
        lines.append(f"| {run['id']} | {run['model']} | {run['cases']} | {workflows} |")
    lines += ["", "## Validator tags", "", "| Tag | Records |", "|---|---:|"]
    for tag,count in sorted(data.get("failure_counts",{}).items(),key=lambda x:(-x[1],x[0])):
        lines.append(f"| {tag} | {count} |")
    lines += ["", "## How to read this", "", "A `valid format` tag means the deterministic parser accepted the record. Other tags describe parse, length, count, repetition, or risk-flag findings. These checks say nothing about whether a phrase is useful, wanted, or appropriate for a real person.", "", "The interactive view can load local community reports. Those records are user-supplied and remain separate from the controlled benchmark inventory.", ""]
    return '\n'.join(lines)

def main():
    p=argparse.ArgumentParser();p.add_argument('-a','--atlas',default='atlas.json');p.add_argument('-o','--output',default='ATLAS-REPORT.md');a=p.parse_args();out=render(json.loads(Path(a.atlas).read_text()));Path(a.output).write_text(out);print(json.dumps({'bytes':len(out.encode()),'output':a.output}))
if __name__=='__main__':main()
