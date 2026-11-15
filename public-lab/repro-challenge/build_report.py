"""Build the readable v1 challenge report from archived artifacts."""
from pathlib import Path
import argparse, json
ROOT=Path(__file__).parent
def build(review_verification=None):
    m=json.loads((ROOT/'manifest.json').read_text()); c=json.loads((ROOT/'condition-comparison.json').read_text()); p=json.loads((ROOT/'review-packet.json').read_text())
    verified=bool(review_verification and review_verification.get('valid') and review_verification.get('packet_fingerprint') == p.get('packet_fingerprint'))
    if verified:
        reviewers=', '.join(f"`{x}`" for x in review_verification['reviewers'])
        review_status=f"- Semantic annotations archived: yes ({review_verification['records']} annotations; reviewers: {reviewers})"
    else:
        review_status='- Semantic annotations archived: no (packet is intentionally blank)'
    lines=['# PhraseLab Public Reproducibility Challenge v1','', '> This release uses fictional cases and descriptive engineering measurements. It does not establish usefulness, clinical effectiveness, or model superiority.','', '## Frozen protocol','',f"- Case manifest SHA-256: `{m['case_sha256']}`",f"- Review packet records: {len(p['records'])}",f"- Review packet fingerprint: `{p.get('packet_fingerprint','not recorded')}`",review_status,'', '## Deterministic comparison','', '| Condition | Records | Accepted | Rejected |','|---|---:|---:|---:|']
    for x in c['conditions']: lines.append(f"| {x['condition']} | {x['records']} | {x['accepted']} | {x['rejected']} |")
    lines += ['', '## Interpretation', '', 'Both archived conditions pass the deterministic format checks on all three fictional cases. This says that the outputs satisfy the parser and firewall constraints; it does not say that the wording is wanted, useful, accessible, or appropriate for a real person.']
    if verified:
        lines += ['', '## Independent semantic review', '', f"Two independent reviewers completed the declared six-record packet: {', '.join(review_verification['reviewers'])}. The paired agreement output reports descriptive per-dimension kappa for this sample; it is not participant validation or a clinical measure.", '', 'Raw annotations, reviewer reports, and the complete verification output are archived alongside this report.']
    else:
        lines += ['', '## Remaining release step', '', 'Two independent reviewers must annotate the declared six-record packet using the five-dimension rubric. Their raw annotations, rationales, missingness, and agreement must be added before making any semantic comparison claim.']
    lines.append('')
    return '\n'.join(lines)
def main():
    p=argparse.ArgumentParser();p.add_argument('-o','--output',default='REPORT.md');p.add_argument('--review-verification',help='verified review JSON produced by verify_review.py');a=p.parse_args()
    verification=json.loads(Path(a.review_verification).read_text()) if a.review_verification else None
    out=build(verification);Path(a.output).write_text(out);print(json.dumps({'bytes':len(out.encode()),'output':a.output,'review_verified':bool(verification and verification.get('valid'))}));return 0
if __name__=='__main__':main()
