import unittest
from analyze_session import analyze

class AnalysisTests(unittest.TestCase):
    def test_unsure_is_preserved_as_a_choice(self):
        out=analyze({'events':[{'preset':'quiet-dim','choice':'unsure'},{'preset':'quiet-dim','choice':'comfortable'}]})
        self.assertEqual(out['choice_counts'],{'comfortable':1,'unsure':1})
        self.assertEqual(out['preset_choice_counts']['quiet-dim']['unsure'],1)
        self.assertIn('do not infer',out['interpretation'])
if __name__=='__main__':unittest.main()
