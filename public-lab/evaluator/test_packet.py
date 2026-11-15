import json,unittest,tempfile
from pathlib import Path
from build_packet import build
class PacketTests(unittest.TestCase):
 def test_packet_contains_rubric_and_records(self):
  with tempfile.NamedTemporaryFile(suffix='.json') as f:
   x=build(f.name);self.assertEqual(len(x['records']),9);self.assertEqual(len(x['rubric']['dimensions']),5)
