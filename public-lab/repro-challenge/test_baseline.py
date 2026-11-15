import json, unittest
from generate_baseline import generate
class BaselineTests(unittest.TestCase):
    def test_generation_is_deterministic_and_complete(self):
        rows=[json.loads(x) for x in generate().splitlines()]
        self.assertEqual(len(rows),3);self.assertEqual(len({x['case_id'] for x in rows}),3);self.assertTrue(all(len(x['cards'])==6 for x in rows))
        self.assertEqual(generate(),generate())
if __name__=='__main__':unittest.main()
