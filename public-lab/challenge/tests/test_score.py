import json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from challenge.score_submission import score
class ScoreTests(unittest.TestCase):
 def test_example_submission(self):
  rows=score(Path(__file__).parents[1]/'example-submission.jsonl');self.assertEqual(len(rows),3);self.assertEqual(sum(r['allowed'] for r in rows),3)
 def test_bad_submission_explains_failure(self):
  with tempfile.NamedTemporaryFile('w',suffix='.jsonl') as f:
   f.write(json.dumps({'case_id':'unknown-preference','condition':'bad','cards':['autism']*6})+'\n');f.flush(); rows=score(Path(f.name)); self.assertFalse(rows[0]['allowed']); self.assertTrue(rows[0]['reasons'])
