import unittest
from pathlib import Path

ROOT=Path(__file__).parent
class AccessibilitySmokeTests(unittest.TestCase):
    def test_environment_page_has_named_controls_and_status(self):
        s=(ROOT/'index.html').read_text()
        for token in ('lang="en"','<title>','for="preset"','for="sound"','for="light"','role="status"','id="download"'):
            self.assertIn(token,s)
    def test_case_studio_has_named_form_fields(self):
        s=(ROOT.parent/'red-team'/'studio.html').read_text()
        for token in ('<title>','for="id"','for="domain"','for="activity"','for="facts"','role="status"'):
            self.assertIn(token,s)
if __name__=='__main__':unittest.main()
