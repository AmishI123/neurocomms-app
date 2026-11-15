import csv, tempfile, unittest
from import_sensor_csv import convert

class SensorImportTests(unittest.TestCase):
    def test_csv_maps_to_valid_session_shape(self):
        with tempfile.NamedTemporaryFile(mode='w+',suffix='.csv') as f:
            f.write('timestamp,preset,sound_db,light_pct,choice\n2026-09-08T12:00:00Z,room-a,40,30,unsure\n');f.flush()
            out=convert(f.name)
        self.assertTrue(out['fictional']);self.assertEqual(out['events'][0]['choice'],'unsure');self.assertEqual(out['events'][0]['sound_db_simulated'],40.0)
if __name__=='__main__':unittest.main()
