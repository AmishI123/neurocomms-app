import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from package_release import package

class PackageReleaseTests(unittest.TestCase):
    def test_archive_contains_public_review_artifacts(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'platform.zip'
            files = package(output)
            with ZipFile(output) as archive:
                names = set(archive.namelist())
                self.assertEqual(len(files), len(names))
                self.assertIn('public-lab/repro-challenge/review-packet.json', names)
                self.assertIn('public-lab/repro-challenge/REPORT.md', names)
                self.assertIn('public-lab/repro-challenge/verify_review.py', names)
                self.assertNotIn('public-lab/release-check.json', names)
                self.assertTrue(all('__pycache__' not in name for name in names))

    def test_archive_bytes_are_deterministic(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / 'first.zip'
            second = Path(directory) / 'second.zip'
            package(first)
            package(second)
            self.assertEqual(first.read_bytes(), second.read_bytes())

if __name__ == '__main__':
    unittest.main()
