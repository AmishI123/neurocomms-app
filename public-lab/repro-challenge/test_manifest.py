import hashlib, json, unittest
from pathlib import Path
ROOT=Path(__file__).parent
class ManifestTests(unittest.TestCase):
    def test_manifest_hash_matches_frozen_cases(self):
        m=json.loads((ROOT/'manifest.json').read_text()); h=hashlib.sha256((ROOT.parent/'cases'/'cases.json').read_bytes()).hexdigest()
        self.assertEqual(m['case_sha256'],h)
    def test_reference_has_one_record_per_case(self):
        rows=[json.loads(x) for x in (ROOT/'reference-control.jsonl').read_text().splitlines() if x.strip()]
        self.assertEqual({x['case_id'] for x in rows},{'unknown-preference','third-party-transfer','sensory-choice'})
if __name__=='__main__':unittest.main()
