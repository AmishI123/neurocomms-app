import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from generate import generate
class GenerateTests(unittest.TestCase):
 def test_seed_is_reproducible(self): self.assertEqual(generate(4,5),generate(4,5))
 def test_fixtures_are_explicitly_fictional(self):
  x=generate(4,3);self.assertTrue(x['fictional_only']);self.assertEqual(len(x['cases']),3)
