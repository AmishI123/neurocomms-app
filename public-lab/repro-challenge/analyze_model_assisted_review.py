"""Summarize failure modes in the exploratory model-assisted review JSONL."""
from pathlib import Path
import argparse, collections, json

def category(row):
    raw = row.get('raw_output_excerpt') or ''
    if not raw.strip(): return 'empty_output'
    if 'annotation_template' in raw or 'record_id' in raw: return 'packet_or_rubric_echo'
    return 'nonempty_schema_mismatch'

def analyze(rows):
    by_judge = {}
    for judge in sorted({row.get('judge') for row in rows}):
        mine = [row for row in rows if row.get('judge') == judge]
        counts = collections.Counter(category(row) for row in mine)
        by_judge[judge] = {'calls': len(mine), 'valid': sum(bool(row.get('valid')) for row in mine),
                           'failure_categories': dict(sorted(counts.items()))}
    return {'schema_version': '1.0', 'judgment_type': 'model-assisted exploratory; not independent human evidence',
            'rows': len(rows), 'valid_rows': sum(bool(row.get('valid')) for row in rows), 'by_judge': by_judge}

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('input'); parser.add_argument('-o', '--output', default='model-assisted-review-summary.json')
    args = parser.parse_args(); rows = [json.loads(line) for line in Path(args.input).read_text().splitlines() if line.strip()]
    result = analyze(rows); Path(args.output).write_text(json.dumps(result, indent=2) + '\n'); print(json.dumps(result))

if __name__ == '__main__': main()
