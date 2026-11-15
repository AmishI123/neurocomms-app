import unittest
from import_review import merge_review

class ReviewImportTests(unittest.TestCase):
    def test_keeps_review_metadata_separate(self):
        atlas={'records':[{'run':'v1'}], 'caveat':'controlled only'}
        verification={'valid':True,'reviewers':['green','blue'],'packet_fingerprint':'a'*64,'records':12,'agreement':{'kappa':{'respect':0.5}}}
        out=merge_review(atlas,verification)
        self.assertEqual(len(out['records']),1)
        self.assertEqual(out['review_reports'][0]['source_type'],'community independent-review metadata')
        self.assertEqual(out['review_reports'][0]['annotations'],12)
        self.assertEqual(out['review_reports'][0]['packet_fingerprint'],'a'*64)
        self.assertIn('shown separately',out['caveat'])

    def test_rejects_unverified_pair(self):
        with self.assertRaises(ValueError): merge_review({}, {'valid':False,'reviewers':['a','b']})

    def test_rejects_review_without_packet_fingerprint(self):
        with self.assertRaises(ValueError): merge_review({}, {'valid':True,'reviewers':['a','b'],'records':12})

if __name__ == '__main__': unittest.main()
