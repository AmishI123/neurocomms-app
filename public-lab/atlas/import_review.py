"""Import verified reproducibility-review metadata into a separate Atlas section."""
from pathlib import Path
import argparse, json

def merge_review(atlas, verification, label='community-review:repro-challenge-v1'):
    if not verification.get('valid'):
        raise ValueError('review verification must be valid before Atlas import')
    reviewers = verification.get('reviewers', [])
    if len(reviewers) != 2 or len(set(reviewers)) != 2:
        raise ValueError('verified review must contain two distinct reviewers')
    packet_fingerprint = verification.get('packet_fingerprint')
    if not isinstance(packet_fingerprint, str) or len(packet_fingerprint) != 64:
        raise ValueError('verified review must identify its frozen packet fingerprint')
    out = json.loads(json.dumps(atlas))
    reports = out.setdefault('review_reports', [])
    reports.append({
        'label': label,
        'source_type': 'community independent-review metadata',
        'status': 'verified-pair',
        'reviewers': reviewers,
        'packet_fingerprint': packet_fingerprint,
        'annotations': verification.get('records'),
        'agreement': verification.get('agreement'),
        'caveat': 'Reviewer judgments are descriptive and separate from controlled benchmark records; they are not clinical validation.'
    })
    out['caveat'] = out.get('caveat', '') + ' Community review metadata is shown separately from controlled benchmark records.'
    return out

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('verification')
    parser.add_argument('-a', '--atlas', default='atlas.json')
    parser.add_argument('-l', '--label', default='community-review:repro-challenge-v1')
    parser.add_argument('-o', '--output', default='atlas-with-review.json')
    args = parser.parse_args()
    out = merge_review(json.loads(Path(args.atlas).read_text()), json.loads(Path(args.verification).read_text()), args.label)
    Path(args.output).write_text(json.dumps(out, indent=2) + '\n')
    print(json.dumps({'review_reports': len(out['review_reports']), 'output': args.output}))

if __name__ == '__main__': main()
