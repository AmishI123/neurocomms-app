import unittest
from model_assisted_review import parse_output

class ModelAssistedReviewTests(unittest.TestCase):
    def test_accepts_only_complete_five_dimension_object(self):
        valid = '{"scores":{"grounding":2,"uncertainty":2,"role_fit":1,"optionality":2,"respect":2},"rationale":"The cards stay optional."}'
        self.assertIsNotNone(parse_output(valid))

    def test_rejects_partial_or_wrong_shape(self):
        self.assertIsNone(parse_output('{"score":2,"dimensions":[]}'))
        self.assertIsNone(parse_output('{"scores":{"grounding":2},"rationale":"x"}'))

if __name__ == '__main__': unittest.main()
