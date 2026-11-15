import unittest
from analyze_session import analyze
from validate_session import validate
class ReadingAnalysisTests(unittest.TestCase):
    def test_unsure_is_retained(self):
        d={'fictional':True,'events':[{'choice':'clear','font_px':20,'line_height':1.6,'measure_chars':55},{'choice':'unsure','font_px':28,'line_height':2,'measure_chars':45}]}
        self.assertEqual(analyze(d)['choice_counts'],{'clear':1,'unsure':1})
    def test_invalid_setting_fails(self):
        self.assertTrue(validate({'fictional':True,'events':[{'choice':'clear','font_px':9,'line_height':1.6,'measure_chars':55}]}))
if __name__=='__main__':unittest.main()
