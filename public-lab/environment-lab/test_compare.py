import unittest
from compare_sessions import compare

class CompareTests(unittest.TestCase):
    def test_missing_choice_is_zero_and_caveated(self):
        out=compare({'events':[{'choice':'comfortable'}]},{'events':[{'choice':'unsure'},{'choice':'unsure'}]})
        self.assertEqual(out['choice_differences'],{'comfortable':-1,'unsure':2})
        self.assertIn('do not establish',out['interpretation'])
if __name__=='__main__':unittest.main()
