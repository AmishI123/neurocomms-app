import json, unittest
from pathlib import Path
from validate import validate

class RedTeamTests(unittest.TestCase):
    def test_examples_pass(self):
        self.assertEqual(validate(json.loads((Path(__file__).parent / 'examples.json').read_text())), [])
    def test_duplicate_and_identifying_data_fail(self):
        x={"id":"bad-case","domain":"x","profile":{"name":"A"},"activity":"x","facts":["a","b"],"target_failure":"x"}
        self.assertTrue(validate([x,x]))
        x['activity']='Call the phone number 555-0100'; self.assertTrue(validate([x]))
if __name__ == '__main__': unittest.main()
