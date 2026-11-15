"""Assemble a complete human-review release only after all gates pass."""
from pathlib import Path
import argparse, json, os, sys, tempfile

PUBLIC_LAB = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PUBLIC_LAB))
sys.path.insert(0, str(PUBLIC_LAB / 'evaluator'))

from build_report import build
from verify_review import verify
from evaluator.score_annotations import validate
from atlas.import_review import merge_review


def annotation_report(path):
    rows = [json.loads(line) for line in Path(path).read_text().splitlines() if line.strip()]
    checked = validate(rows)
    valid = [row for row in checked if row['valid']]
    rubric = json.loads((PUBLIC_LAB / 'evaluator' / 'rubric.json').read_text())
    means = {
        dimension['id']: round(sum(row['scores'][dimension['id']] for row in valid) / len(valid), 3) if valid else None
        for dimension in rubric['dimensions']
    }
    return {'schema_version': '1.0', 'rubric': 'evaluator/rubric.json',
            'records': len(checked), 'valid_records': len(valid),
            'invalid_records': len(checked) - len(valid),
            'dimension_means': means, 'rows': checked,
            'interpretation': 'Reviewer annotations are contextual judgments, not clinical outcomes.'}


def assemble(reviewer_a, reviewer_b, packet, atlas, output):
    output = Path(output)
    if output.exists():
        raise ValueError(f'output directory already exists: {output}')
    verification = verify([reviewer_a, reviewer_b], packet)
    if not verification['valid']:
        raise ValueError('review pair failed verification: ' + '; '.join(verification['errors']))
    atlas_data = json.loads(Path(atlas).read_text())
    merged_atlas = merge_review(atlas_data, verification)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent, prefix=output.name + '.tmp-') as staging_name:
        staging = Path(staging_name)
        for source, name in ((reviewer_a, 'reviewer-a.jsonl'), (reviewer_b, 'reviewer-b.jsonl')):
            (staging / name).write_text(Path(source).read_text())
        (staging / 'reviewer-a-report.json').write_text(json.dumps(annotation_report(reviewer_a), indent=2) + '\n')
        (staging / 'reviewer-b-report.json').write_text(json.dumps(annotation_report(reviewer_b), indent=2) + '\n')
        (staging / 'review-verification.json').write_text(json.dumps(verification, indent=2) + '\n')
        (staging / 'agreement.json').write_text(json.dumps(verification['agreement'], indent=2) + '\n')
        (staging / 'REPORT.md').write_text(build(verification))
        (staging / 'atlas-with-review.json').write_text(json.dumps(merged_atlas, indent=2) + '\n')
        os.replace(staging, output)
    return {'output': str(output), 'reviewers': verification['reviewers'],
            'annotations': verification['records'],
            'packet_fingerprint': verification['packet_fingerprint']}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('reviewer_a')
    parser.add_argument('reviewer_b')
    parser.add_argument('--packet', required=True)
    parser.add_argument('--atlas', default=str(PUBLIC_LAB / 'atlas/atlas.json'))
    parser.add_argument('-o', '--output', default='review-release')
    args = parser.parse_args()
    print(json.dumps(assemble(args.reviewer_a, args.reviewer_b, args.packet, args.atlas, args.output)))


if __name__ == '__main__':
    main()
