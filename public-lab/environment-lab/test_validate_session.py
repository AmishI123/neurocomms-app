import unittest
from validate_session import validate

class SessionValidationTests(unittest.TestCase):
    def test_demo_shape_passes(self):
        self.assertEqual(validate({'fictional':True,'events':[{'choice':'unsure','sound_db_simulated':72,'light_pct_simulated':85}]}),[])
    def test_unknown_choice_and_range_fail(self):
        e=validate({'fictional':True,'events':[{'choice':'maybe','sound_db_simulated':2,'light_pct_simulated':101}]})
        self.assertEqual(len(e),3)
if __name__=='__main__':unittest.main()
