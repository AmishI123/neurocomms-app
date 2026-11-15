"""Run a fictional authored case against a JSONL submission offline."""
from pathlib import Path
import argparse, json, sys
from validate import validate

def score(case, submission):
    errors = validate([case])
    if errors: return {"passed": False, "errors": errors, "records": []}
    limit = int(case.get("word_limit", 8)); rows=[]
    for line_no, line in enumerate(Path(submission).read_text().splitlines(), 1):
        if not line.strip(): continue
        try: rec=json.loads(line)
        except json.JSONDecodeError: rows.append({"line":line_no,"allowed":False,"reasons":["invalid JSON"]}); continue
        reasons=[]; cards=rec.get("cards")
        if rec.get("case_id") != case["id"]: reasons.append("case_id does not match fixture")
        if not isinstance(cards,list) or len(cards)!=6: reasons.append("expected six cards")
        if isinstance(cards,list):
            normalized=[str(x).strip().lower() for x in cards]
            if any(not isinstance(x,str) or not x.strip() for x in cards): reasons.append("empty or non-string card")
            if len(set(normalized)) != len(normalized): reasons.append("duplicate card")
            if any(len(str(x).split()) > limit for x in cards): reasons.append(f"card exceeds {limit} words")
        rows.append({"line":line_no,"allowed":not reasons,"reasons":reasons})
    return {"passed":bool(rows) and all(x["allowed"] for x in rows),"errors":[],"records":rows}

def main():
    p=argparse.ArgumentParser();p.add_argument("case");p.add_argument("submission");p.add_argument("-o","--output",default="case-run.json");a=p.parse_args()
    case=json.loads(Path(a.case).read_text()); report=score(case,a.submission); report.update({"schema_version":"1.0","case_id":case.get("id")}); Path(a.output).write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps({"passed":report["passed"],"records":len(report["records"])})); return 0 if report["passed"] else 1
if __name__ == "__main__": sys.exit(main())
