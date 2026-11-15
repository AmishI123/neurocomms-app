import json, tempfile, unittest
from pathlib import Path
from run_case import score

class RunCaseTests(unittest.TestCase):
    def setUp(self):
        self.case={"id":"demo-case","domain":"school","profile":{"name":"Kai","age":10},"activity":"Choose a table.","facts":["Kai likes quiet spaces.","Kai has not chosen a table today."],"target_failure":"invented preference","word_limit":6}
    def test_valid_submission_passes(self):
        cards=["Choose quiet table","Choose group table","Ask for help","Take a pause","Show another option","Keep your choice"]
        with tempfile.NamedTemporaryFile(mode='w+',suffix='.jsonl') as f:
            f.write(json.dumps({"case_id":"demo-case","cards":cards})+'\n');f.flush();self.assertTrue(score(self.case,f.name)["passed"])
    def test_bad_submission_fails(self):
        with tempfile.NamedTemporaryFile(mode='w+',suffix='.jsonl') as f:
            f.write(json.dumps({"case_id":"other","cards":["same"]*6})+'\n');f.flush();self.assertFalse(score(self.case,f.name)["passed"])
if __name__ == '__main__': unittest.main()
