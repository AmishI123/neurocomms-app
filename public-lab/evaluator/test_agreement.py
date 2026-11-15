import json,unittest
from pathlib import Path
from agreement import compare,kappa
class AgreementTests(unittest.TestCase):
 def test_kappa_perfect(self): self.assertEqual(kappa([1,2,0],[1,2,0]),1.0)
 def test_example_pairing(self):
  x=compare(Path(__file__).parent/'example-paired.jsonl');self.assertEqual(x['paired_records'],2);self.assertEqual(set(x['kappa']),{'grounding','uncertainty','role_fit','optionality','respect'})
