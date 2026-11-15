import unittest
from analyze_model_assisted_review import analyze, category

class ModelAssistedAnalysisTests(unittest.TestCase):
    def test_classifies_empty_and_echo_failures(self):
        rows=[{'judge':'a','valid':False,'raw_output_excerpt':None},{'judge':'b','valid':False,'raw_output_excerpt':'{"annotation_template": {}}'}]
        self.assertEqual(category(rows[0]),'empty_output')
        self.assertEqual(category(rows[1]),'packet_or_rubric_echo')
        result=analyze(rows)
        self.assertEqual(result['valid_rows'],0)
        self.assertEqual(result['by_judge']['b']['failure_categories']['packet_or_rubric_echo'],1)

if __name__ == '__main__': unittest.main()
