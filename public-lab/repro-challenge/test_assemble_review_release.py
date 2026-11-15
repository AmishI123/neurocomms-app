import json
import tempfile
import unittest
from pathlib import Path

from assemble_review_release import assemble


def rows(reviewer, fingerprint):
    return [{'record_id': f'{condition}--{case}', 'reviewer': reviewer,
             'packet_fingerprint': fingerprint,
             'scores': {d: 1 for d in ('grounding', 'uncertainty', 'role_fit', 'optionality', 'respect')},
             'rationale': 'The wording remains optional.'}
            for condition in ('reference-control', 'template-baseline')
            for case in ('unknown-preference', 'third-party-transfer', 'sensory-choice')]


class AssembleReviewReleaseTests(unittest.TestCase):
    def test_complete_pair_writes_all_release_outputs(self):
        root = Path(__file__).parent
        packet = json.loads((root / 'review-packet.json').read_text())
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            a, b = directory / 'a.jsonl', directory / 'b.jsonl'
            a.write_text('\n'.join(json.dumps(row) for row in rows('a', packet['packet_fingerprint'])) + '\n')
            b.write_text('\n'.join(json.dumps(row) for row in rows('b', packet['packet_fingerprint'])) + '\n')
            output = directory / 'release'
            result = assemble(a, b, root / 'review-packet.json', root.parent / 'atlas/atlas.json', output)
            self.assertEqual(result['annotations'], 12)
            self.assertEqual(result['packet_fingerprint'], packet['packet_fingerprint'])
            for name in ('reviewer-a.jsonl', 'reviewer-b.jsonl', 'reviewer-a-report.json',
                         'reviewer-b-report.json', 'review-verification.json', 'agreement.json',
                         'REPORT.md', 'atlas-with-review.json'):
                self.assertTrue((output / name).is_file(), name)

    def test_invalid_pair_writes_nothing(self):
        root = Path(__file__).parent
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            a, b = directory / 'a.jsonl', directory / 'b.jsonl'
            a.write_text('{}\n')
            b.write_text('{}\n')
            output = directory / 'release'
            with self.assertRaises(ValueError):
                assemble(a, b, root / 'review-packet.json', root.parent / 'atlas/atlas.json', output)
            self.assertFalse(output.exists())

    def test_existing_output_is_never_overwritten(self):
        root = Path(__file__).parent
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            a, b = directory / 'a.jsonl', directory / 'b.jsonl'
            a.write_text('{}\n')
            b.write_text('{}\n')
            output = directory / 'release'
            output.mkdir()
            marker = output / 'keep.txt'
            marker.write_text('keep')
            with self.assertRaises(ValueError):
                assemble(a, b, root / 'review-packet.json', root.parent / 'atlas/atlas.json', output)
            self.assertEqual(marker.read_text(), 'keep')


if __name__ == '__main__':
    unittest.main()
