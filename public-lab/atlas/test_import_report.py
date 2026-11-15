import unittest
from import_report import merge

class ImportTests(unittest.TestCase):
    def test_community_rows_are_traceable(self):
        atlas={"records":[],"caveat":"controlled only"}; report={"case_id":"demo","passed":True,"records":[{"allowed":True}]}
        out=merge(atlas,report,"my-run")
        self.assertEqual(out["records"][0]["run"],"my-run")
        self.assertEqual(out["community_reports"][0]["case_id"],"demo")
        self.assertIn("user-supplied",out["caveat"])
if __name__=='__main__': unittest.main()
