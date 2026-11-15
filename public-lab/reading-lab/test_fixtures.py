import json, unittest
from pathlib import Path
class ReadingFixtureTests(unittest.TestCase):
    def test_fixture_is_fictional_and_bounded(self):
        x=json.loads((Path(__file__).parent/'fixtures.json').read_text());self.assertTrue(x['fictional']);self.assertTrue(x['text'])
        self.assertTrue(12<=x['settings']['font_px']<=40);self.assertTrue(1<=x['settings']['line_height']<=3);self.assertTrue(25<=x['settings']['measure_chars']<=90)
if __name__=='__main__':unittest.main()
