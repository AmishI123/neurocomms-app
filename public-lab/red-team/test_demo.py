import json, tempfile, unittest
from pathlib import Path
from run_demo import main

class DemoTests(unittest.TestCase):
    def test_pipeline_leaves_report_and_atlas(self):
        with tempfile.TemporaryDirectory() as d:
            import sys
            old=sys.argv;sys.argv=['run_demo.py','-o',d]
            try: self.assertEqual(main(),0)
            finally: sys.argv=old
            self.assertTrue(json.loads((Path(d)/'demo-report.json').read_text())['passed'])
            self.assertEqual(len(json.loads((Path(d)/'atlas-with-community.json').read_text())['community_reports']),1)
            self.assertIn('community', (Path(d)/'ATLAS-REPORT.md').read_text())
if __name__=='__main__':unittest.main()
