"""Merge an offline case-run report into an Atlas copy as community data."""
from pathlib import Path
import argparse, json

def merge(atlas, report, label):
    out=json.loads(json.dumps(atlas)); community=out.setdefault("community_reports", [])
    rows=[]
    for row in report.get("records", []):
        rows.append({"run":label,"case_id":report.get("case_id","unknown"),"workflow":"community",
                     "seed":None,"tags":["community pass" if row.get("allowed") else "community needs review"],
                     "finish_reason":None,"valid":bool(row.get("allowed"))})
    community.append({"label":label,"case_id":report.get("case_id"),"records":len(rows),"passed":bool(report.get("passed"))})
    out["records"] = out.get("records", []) + rows
    out["caveat"] = out.get("caveat", "") + " Community reports are user-supplied and are shown separately from controlled benchmark runs."
    return out

def main():
    p=argparse.ArgumentParser();p.add_argument("report");p.add_argument("-a","--atlas",default="atlas.json");p.add_argument("-l","--label",default="local-community");p.add_argument("-o","--output",default="atlas-with-community.json");a=p.parse_args()
    out=merge(json.loads(Path(a.atlas).read_text()),json.loads(Path(a.report).read_text()),a.label);Path(a.output).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({"records":len(out["records"]),"community_reports":len(out["community_reports"])}))
if __name__ == "__main__": main()
