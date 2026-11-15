import unittest
import json
from pathlib import Path
from build_report import build
class ChallengeReportTests(unittest.TestCase):
    def test_report_keeps_review_step_open(self):
        out=build();self.assertIn('Semantic annotations archived: no',out);self.assertIn('Two independent reviewers',out);self.assertIn('fictional cases',out)
        self.assertIn('Review packet fingerprint:',out)
    def test_report_can_include_verified_review(self):
        packet=json.loads((Path(__file__).parent/'review-packet.json').read_text())
        out=build({'valid':True,'records':12,'reviewers':['reviewer-a','reviewer-b'],'packet_fingerprint':packet['packet_fingerprint']})
        self.assertIn('Semantic annotations archived: yes',out)
        self.assertIn('reviewer-a',out)
        self.assertIn('Independent semantic review',out)
        self.assertNotIn('## Remaining release step',out)
    def test_report_does_not_trust_verification_from_another_packet(self):
        out=build({'valid':True,'records':12,'reviewers':['reviewer-a','reviewer-b'],'packet_fingerprint':'wrong'})
        self.assertIn('Semantic annotations archived: no',out)
        self.assertIn('## Remaining release step',out)
if __name__=='__main__':unittest.main()
