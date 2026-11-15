"""Build the shareable PhraseLab archive without external zip tooling."""
from pathlib import Path
import argparse
import hashlib
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent
EXCLUDED_FILES = {ROOT / 'release-check.json'}

def package(output):
    output = Path(output).resolve()
    files = sorted(p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p not in EXCLUDED_FILES)
    with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
        for path in files:
            name = str(path.relative_to(ROOT.parent))
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    return files

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', '--output', default=str(ROOT.parent / 'phraselab-platform.zip'))
    parser.add_argument('--sha256-output', help='write the archive SHA-256 to this file')
    args = parser.parse_args()
    files = package(args.output)
    digest = hashlib.sha256(Path(args.output).read_bytes()).hexdigest()
    if args.sha256_output:
        Path(args.sha256_output).write_text(f'{digest}  {Path(args.output).name}\n')
    print({'output': str(Path(args.output).resolve()), 'files': len(files), 'sha256': digest})

if __name__ == '__main__':
    main()
