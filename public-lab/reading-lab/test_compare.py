import unittest
from compare_sessions import compare
class ReadingCompareTests(unittest.TestCase):
    def test_unsure_difference_is_explicit(self):
        a={'events':[{'choice':'clear'}]};b={'events':[{'choice':'unsure'},{'choice':'unsure'}]}
        self.assertEqual(compare(a,b)['choice_differences'],{'clear':-1,'unsure':2})
if __name__=='__main__':unittest.main()
