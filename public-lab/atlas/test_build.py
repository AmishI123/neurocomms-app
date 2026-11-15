import unittest
from pathlib import Path
from build_atlas import build

class AtlasTests(unittest.TestCase):
    def test_index_is_descriptive_and_complete(self):
        data = build()
        self.assertEqual(len(data["runs"]), 3)
        self.assertEqual(len(data["records"]), 324)
        self.assertIn("truncated", data["failure_counts"])
        self.assertIn("not a causal model leaderboard", data["caveat"])
    def test_records_have_traceable_fields(self):
        for row in build()["records"]:
            self.assertTrue(row["run"] and row["case_id"] and row["workflow"])
            self.assertTrue(row["tags"])
    def test_browser_has_separate_review_metadata_surface(self):
        source = Path(__file__).with_name('index.html').read_text()
        self.assertIn('review_reports', source)
        self.assertIn('source_type', source)
        self.assertIn('packet_fingerprint', source)
        self.assertIn('aria-live', source)

if __name__ == "__main__": unittest.main()
