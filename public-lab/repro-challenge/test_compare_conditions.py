import json, tempfile, unittest
from pathlib import Path
from compare_conditions import summarize
class ConditionComparisonTests(unittest.TestCase):
    def test_summary_counts_reasons(self):
        with tempfile.NamedTemporaryFile(mode='w+',suffix='.json') as f:
            json.dump({'records':2,'accepted':1,'rejected':1,'rows':[{'reasons':[]},{'reasons':[{'code':'duplicate'}]}]},f);f.flush();x=summarize(f.name,'x')
        self.assertEqual(x['accepted'],1);self.assertEqual(x['reason_counts'],{'duplicate':1})
if __name__=='__main__':unittest.main()
