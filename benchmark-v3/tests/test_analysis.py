import sys,unittest,json,tempfile,shutil
from unittest.mock import patch
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analyze import paired_difference,percentile
import analyze,run
class AnalysisTests(unittest.TestCase):
 def test_pairs_are_cases_not_cards_or_seeds(self):
  rows=[]
  for case in ['a','b']:
   for _ in range(3):
    rows.extend([{'case_id':case,'condition':'review','score':{'risk_any':False}}, {'case_id':case,'condition':'context','score':{'risk_any':True}}])
  x=paired_difference(rows,'review','context','risk_any',100)
  self.assertEqual(x['cases'],2);self.assertEqual(x['difference'],-1);self.assertEqual(x['ci95'],[-1,-1])
 def test_missing_pair_not_counted_as_success(self):
  rows=[{'case_id':'a','condition':'review','score':{'risk_any':None}},{'case_id':'a','condition':'context','score':{'risk_any':True}}]
  self.assertEqual(paired_difference(rows,'review','context','risk_any',10)['cases'],0)
 def test_incomplete_archive_is_rejected(self):
  source=run.ROOT
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   for name in run.FROZEN+['data/frozen-manifest.json']:
    (root/name).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source/name,root/name)
   (root/'results/raw').mkdir(parents=True)
   with patch.object(run,'ROOT',root),patch.object(analyze,'ROOT',root):
    with self.assertRaisesRegex(AssertionError,'Expected full schedule'):analyze.analyze()
 def test_percentile_interpolates(self):self.assertEqual(percentile([0,10],.25),2.5)
if __name__=='__main__':unittest.main()
