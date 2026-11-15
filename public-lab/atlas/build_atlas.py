"""Build a compact, descriptive index of the checked-in benchmark runs."""
from pathlib import Path
import argparse, json

ROOT = Path(__file__).resolve().parents[2]
RUNS = [
    ("v1", "Qwen3.5-0.8B", ROOT / "benchmark/results/analysis.json"),
    ("v2", "Qwen2.5-0.5B", ROOT / "benchmark-v2/results/analysis.json"),
    ("v3", "Qwen2.5-0.5B constrained", ROOT / "benchmark-v3/results/analysis.json"),
]

def labels(row):
    score = row.get("score") or {}
    out = []
    if not score.get("valid"):
        err = str(score.get("parse_error") or "invalid output")
        out.append("truncated" if "length" in err else "parse failure")
    if score.get("valid") and score.get("risk_any"):
        out.append("risk flag")
    cards = score.get("cards")
    if isinstance(cards, list):
        if len(cards) != 3:
            out.append("card count")
        normalized = [json.dumps(c, sort_keys=True) for c in cards]
        if len(cards) != len(set(normalized)):
            out.append("repetition")
        if any(len(str(c).split()) > 12 for c in cards):
            out.append("overlong card")
    return out or ["valid format"]

def build():
    runs, records, counts = [], [], {}
    for label, model, path in RUNS:
        data = json.loads(path.read_text())
        summaries = data.get("summaries", {})
        run = {"id": label, "model": model, "cases": len(data.get("cases", [])),
               "generated_utc": data.get("generated_utc"), "workflows": {}}
        for workflow, summary in summaries.items():
            run["workflows"][workflow] = {k: summary.get(k) for k in
                ("outputs", "valid", "invalid", "risk_outputs", "invalid_or_risk")}
        runs.append(run)
        for row in data.get("rows", []):
            tags = labels(row)
            for tag in tags:
                counts[tag] = counts.get(tag, 0) + 1
            records.append({"run": label, "case_id": row.get("case_id"),
                            "workflow": row.get("condition"), "seed": row.get("seed"),
                            "tags": tags, "finish_reason": row.get("finish_reason"),
                            "valid": bool((row.get("score") or {}).get("valid"))})
    return {"schema_version": "1.0", "generated_by": "build_atlas.py",
            "type": "descriptive benchmark index",
            "caveat": "Runs use different fictional case sets and are not a causal model leaderboard. Tags describe format and validator findings; they do not measure clinical usefulness.",
            "runs": runs, "failure_counts": dict(sorted(counts.items())),
            "records": records}

def main():
    p = argparse.ArgumentParser(); p.add_argument("-o", "--output", default=str(Path(__file__).parent / "atlas.json"))
    a = p.parse_args(); out = build(); Path(a.output).write_text(json.dumps(out, indent=2) + "\n")
    print(json.dumps({"runs": len(out["runs"]), "records": len(out["records"])}))

if __name__ == "__main__": main()
