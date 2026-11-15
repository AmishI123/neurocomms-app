import unittest, json, tempfile
from verify_review import verify
from build_review_packet import fingerprint
def rows(reviewer):
    return [{'record_id':f'{condition}--{case}','reviewer':reviewer,'scores':{d:1 for d in ('grounding','uncertainty','role_fit','optionality','respect')},'rationale':'preflight'} for condition in ('reference-control','template-baseline') for case in ('unknown-preference','third-party-transfer','sensory-choice')]
class VerifyReviewTests(unittest.TestCase):
    def packet_rows(self, reviewer):
        packet_path=__import__('pathlib').Path(__file__).with_name('review-packet.json')
        packet=json.loads(packet_path.read_text())
        return [{**row,'packet_fingerprint':packet['packet_fingerprint']} for row in rows(reviewer)], packet_path

    def test_packet_fingerprint_is_required_when_packet_supplied(self):
        a, packet_path=self.packet_rows('a'); b, _=self.packet_rows('b')
        with tempfile.NamedTemporaryFile(mode='w+') as af, tempfile.NamedTemporaryFile(mode='w+') as bf:
            for x in a: af.write(json.dumps(x)+'\n')
            for x in b: bf.write(json.dumps(x)+'\n')
            af.flush(); bf.flush(); out=verify([af.name,bf.name],packet_path)
            self.assertTrue(out['valid']); self.assertEqual(out['packet_fingerprint'],fingerprint(json.loads(packet_path.read_text())))
            af.seek(0); af.truncate();
            for x in a: x['packet_fingerprint']='wrong'; af.write(json.dumps(x)+'\n')
            af.flush(); out=verify([af.name,bf.name],packet_path)
            self.assertFalse(out['valid']); self.assertIn('supplied review packet', ' '.join(out['errors']))
            af.seek(0); af.truncate();
            packet_fingerprint=json.loads(packet_path.read_text())['packet_fingerprint']
            for x in a: x['packet_fingerprint']=packet_fingerprint
            a[0]['record_id']='substituted-record'
            for x in a: af.write(json.dumps(x)+'\n')
            af.flush(); out=verify([af.name,bf.name],packet_path)
            self.assertFalse(out['valid']); self.assertIn('record IDs do not match', ' '.join(out['errors']))

    def test_requires_complete_pair(self):
        with tempfile.NamedTemporaryFile(mode='w+') as a, tempfile.NamedTemporaryFile(mode='w+') as b:
            for x in rows('a')[0:3]: a.write(json.dumps(x)+'\n')
            for x in rows('b'): b.write(json.dumps(x)+'\n')
            a.flush();b.flush();out=verify([a.name,b.name]);self.assertFalse(out['valid'])
            a.seek(0);a.truncate();
            for x in rows('a'): a.write(json.dumps(x)+'\n')
            a.flush();out=verify([a.name,b.name]);self.assertTrue(out['valid']);self.assertEqual(out['agreement']['paired_records'],6)
    def test_rejects_mixed_reviewer_file(self):
        with tempfile.NamedTemporaryFile(mode='w+') as a, tempfile.NamedTemporaryFile(mode='w+') as b:
            for x in rows('a'): a.write(json.dumps(x)+'\n')
            for x in rows('b'): b.write(json.dumps(x)+'\n')
            a.seek(0); a.truncate();
            for x in rows('a')[:5] + rows('b')[:1]: a.write(json.dumps(x)+'\n')
            a.flush(); b.flush(); out=verify([a.name,b.name])
            self.assertFalse(out['valid']); self.assertIn('exactly one reviewer code', ' '.join(out['errors']))
    def test_rejects_duplicate_record_in_file(self):
        with tempfile.NamedTemporaryFile(mode='w+') as a, tempfile.NamedTemporaryFile(mode='w+') as b:
            for x in rows('a')[:5] + rows('a')[:1]: a.write(json.dumps(x)+'\n')
            for x in rows('b'): b.write(json.dumps(x)+'\n')
            a.flush(); b.flush(); out=verify([a.name,b.name])
            self.assertFalse(out['valid']); self.assertIn('six unique records', ' '.join(out['errors']))
if __name__=='__main__':unittest.main()
