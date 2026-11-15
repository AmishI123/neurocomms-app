import json, unittest
from pathlib import Path

class FixtureTests(unittest.TestCase):
    def test_fixtures_are_fictional_presets_with_bounded_values(self):
        xs=json.loads((Path(__file__).parent/'fixtures.json').read_text()); self.assertEqual(len(xs),3)
        self.assertEqual(len({x['id'] for x in xs}),3)
        for x in xs:
            self.assertGreaterEqual(x['sound_db'],0); self.assertLessEqual(x['sound_db'],100)
            self.assertGreaterEqual(x['light_pct'],0); self.assertLessEqual(x['light_pct'],100)
if __name__=='__main__':unittest.main()
