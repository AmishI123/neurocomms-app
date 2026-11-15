"""Analyze the constrained/retry run using the frozen v3 manifest."""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parent
src=(ROOT/'analyze.py').read_text()
src=src.replace('import run','import run_constrained as run')
src=src.replace("data/frozen-manifest.json","data/frozen-manifest-v3.json")
src=src.replace("'data/frozen-manifest.json'","'data/frozen-manifest-v3.json'")
ns={'__file__':str(ROOT/'analyze.py'),'__name__':'__main__'}
exec(compile(src,str(ROOT/'analyze.py'),'exec'),ns)
