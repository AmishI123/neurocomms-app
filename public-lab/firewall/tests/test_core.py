import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1].parent))
from firewall.core import inspect

class FirewallTests(unittest.TestCase):
    def test_accepts_clean_object(self):
        d=inspect('{"cards":["one","two","three","four","five","six"]}')
        self.assertTrue(d.allowed); self.assertEqual(len(d.cards),6)
    def test_normalizes_fence_but_reports_length(self):
        d=inspect('```json\n{"cards":["one two","two","three","four","five","six"]}\n```',word_limit=1)
        self.assertFalse(d.allowed); self.assertTrue(d.normalized); self.assertEqual(d.reasons[0]['code'],'word_limit')
    def test_rejects_inference_topic(self):
        d=inspect('{"cards":["a","b","c","d","e","my diagnosis is autism"]}',forbidden_topics=['autism'])
        self.assertFalse(d.allowed); self.assertEqual(d.reasons[-1]['code'],'forbidden_topic')

if __name__=='__main__': unittest.main()
