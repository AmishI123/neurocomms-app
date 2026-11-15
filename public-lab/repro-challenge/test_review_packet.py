import json, unittest
from pathlib import Path
from build_review_packet import build, fingerprint
class ReviewPacketTests(unittest.TestCase):
    def test_packet_pairs_both_conditions_and_stays_blank(self):
        p=build('/tmp/phraselab-review-packet.json');self.assertEqual(len(p['records']),6);self.assertEqual({x['condition'] for x in p['records']},{'reference-control','template-baseline'})
        self.assertTrue(all(all(v is None for v in x['annotation_template']['scores'].values()) for x in p['records']))
        self.assertEqual(p['packet_fingerprint'],fingerprint(p))
if __name__=='__main__':unittest.main()
