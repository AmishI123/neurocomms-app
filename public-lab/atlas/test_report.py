import unittest
from build_report import render

class ReportTests(unittest.TestCase):
    def test_report_has_caveat_and_inventory(self):
        out=render({'generated_by':'test','runs':[{'id':'v1','model':'demo','cases':1,'workflows':{'basic':{'valid':1,'outputs':1}}}], 'failure_counts':{'valid format':1}})
        self.assertIn('Run inventory',out); self.assertIn('different case sets',out); self.assertIn('valid format',out)
if __name__=='__main__':unittest.main()
