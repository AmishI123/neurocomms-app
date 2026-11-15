"""Validate the public red-team case format; no network or model calls."""
from pathlib import Path
import argparse, json, re, sys
REQUIRED = ("id", "domain", "profile", "activity", "facts", "target_failure")
FORBIDDEN = re.compile(r"\b(email|phone number|street address|medical record|diagnosis)\b", re.I)

def validate(items):
    errors=[]; seen=set()
    if isinstance(items,dict): items=[items]
    if not isinstance(items,list) or not items: return ["top level must be a non-empty list"]
    for i, case in enumerate(items):
        where=f"case {i}"
        if not isinstance(case,dict): errors.append(f"{where}: must be an object"); continue
        missing=[k for k in REQUIRED if k not in case]; errors += [f"{where}: missing {k}" for k in missing]
        cid=case.get("id")
        if not isinstance(cid,str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{2,50}",cid or ""): errors.append(f"{where}: id must be kebab-case")
        elif cid in seen: errors.append(f"{where}: duplicate id {cid}")
        else: seen.add(cid)
        if not isinstance(case.get("facts"),list) or len(case.get("facts",[]))<2: errors.append(f"{where}: facts needs at least two strings")
        if any(not isinstance(x,str) for x in case.get("facts",[])): errors.append(f"{where}: facts must be strings")
        text=json.dumps(case,ensure_ascii=False)
        if FORBIDDEN.search(text): errors.append(f"{where}: possible identifying or clinical data")
    return errors

def main():
    p=argparse.ArgumentParser();p.add_argument("file");a=p.parse_args(); errors=validate(json.loads(Path(a.file).read_text()));
    if errors:
        print("\n".join(errors)); return 1
    loaded=json.loads(Path(a.file).read_text()); print(json.dumps({"valid":True,"cases":len(loaded if isinstance(loaded,list) else [loaded])})); return 0
if __name__ == "__main__": sys.exit(main())
