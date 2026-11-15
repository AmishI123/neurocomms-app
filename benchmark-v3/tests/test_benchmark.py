import json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import score,run
ROOT=Path(__file__).resolve().parents[1]
CASES={c['id']:c for c in json.loads((ROOT/'data/cases.json').read_text())['cases']}
class BenchmarkTests(unittest.TestCase):
 def test_authored_reference_behavior(self):
  for x in json.loads((ROOT/'data/references.json').read_text())['examples']:
   with self.subTest(text=x['text']):self.assertEqual(bool(score.flags_for_card(x['text'],CASES[x['case']])),x['expected_flag'])
 def test_invalid_outputs_are_not_error_free(self):
  for text in ['not json','{"cards":[]}','{"cards":[1,2,3,4,5,6]}','{"cards":["a","b","c","d","e",""]}']:
   result=score.score(text,CASES['library-return']);self.assertFalse(result['valid']);self.assertIsNone(result['risk_any']);self.assertTrue(result['invalid_or_risk'])
 def test_truncation_is_failure(self):
  self.assertFalse(score.score(json.dumps({'cards':['a']*6}),CASES['library-return'],'length')['valid'])
 def test_duplicates_length_and_indicators(self):
  r=score.score(json.dumps({'cards':['Hello!','hello','No','Can we go?','Look','one two three four']}),CASES['library-return'])
  self.assertEqual(r['duplicate_cards'],1);self.assertEqual(r['over_limit_cards'],1);self.assertTrue(all(r['lexical_functions'].values()))
 def test_private_annotations_never_reach_model(self):
  for c in CASES.values():
   public=run.public_case(c);self.assertNotIn('annotation',public)
   for condition in ['basic','context','review']:
    self.assertNotIn('negative_topics',run.messages(c,condition,'draft' if condition=='review' else None)[0]['content'])
 def test_case_balance(self):
  self.assertEqual(len(CASES),12);self.assertEqual(len({c['domain'] for c in CASES.values()}),6);self.assertEqual(sum(c['word_limit']==3 for c in CASES.values()),6)
if __name__=='__main__':unittest.main()
