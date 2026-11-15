"""Optional PDF layout check; requires PyMuPDF (not required for model/analysis)."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[1]
try:import pymupdf
except ImportError:
    sys.path.insert(0,str(ROOT.parent/'.research-tools'))
    import pymupdf
pdf=pymupdf.open(ROOT/'REPORT.pdf')
assert len(pdf)>=3,'Unexpectedly short technical report'
text='\n'.join(p.get_text() for p in pdf)
for expected in ['Abstract','Methods','Results','Limitations','108']:
    assert expected in text,expected
assert '\ufffd' not in text
links=[]
for n,page in enumerate(pdf):
    for word in page.get_text('words'):
        assert 0<=word[0]<word[2]<=page.rect.width+1 and 0<=word[1]<word[3]<=page.rect.height+1,(n,word)
    links.extend(link.get('uri','') for link in page.get_links())
    page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2)).save(ROOT/f'qa/report-page-{n+1}.png')
assert len(set(links))>=4 and all(link.startswith('https://') for link in links),links
result={'pages':len(pdf),'text_bounds':'pass','replacement_glyphs':'none','external_source_links':sorted(set(links)),'bytes':(ROOT/'REPORT.pdf').stat().st_size}
(ROOT/'qa/pdf-check.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
