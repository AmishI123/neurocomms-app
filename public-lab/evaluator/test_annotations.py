import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from evaluator.score_annotations import validate
class AnnotationTests(unittest.TestCase):
 def test_example_valid(self):
  rows=[json.loads(x) for x in Path(Path(__file__).parent/'example-annotations.jsonl').read_text().splitlines()];self.assertEqual([r['valid'] for r in validate(rows)],[True,True])
 def test_missing_dimension_rejected(self):
  self.assertFalse(validate([{'record_id':'x','reviewer':'r','scores':{},'rationale':'x'}])[0]['valid'])
