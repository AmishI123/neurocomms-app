"""Render the canonical research brief and perform structural PDF checks."""
from pathlib import Path
import html
import re
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.research-tools'))
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
import pymupdf

FONT = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('DejaVu', str(FONT / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuBold', str(FONT / 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('DejaVu', normal='DejaVu', bold='DejaVuBold', italic='DejaVu', boldItalic='DejaVuBold')
ink = colors.HexColor('#172B3A')
teal = colors.HexColor('#006B70')
styles = {
    'title': ParagraphStyle('title', fontName='DejaVuBold', fontSize=21, leading=26, textColor=ink, spaceAfter=17),
    'heading': ParagraphStyle('heading', fontName='DejaVuBold', fontSize=12, leading=17, textColor=teal, spaceBefore=8, spaceAfter=8, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='DejaVu', fontSize=10, leading=14.4, textColor=ink, spaceAfter=9, alignment=TA_LEFT),
    'source': ParagraphStyle('source', fontName='DejaVu', fontSize=8, leading=11.2, textColor=colors.HexColor('#415A67'), spaceAfter=10),
}

def inline(raw):
    s = html.escape(raw)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2" color="#006B70"><u>\1</u></a>', s)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)

def furniture(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(teal)
    canvas.setLineWidth(2)
    canvas.line(48, 802, 547, 802)
    canvas.setFont('DejaVu', 8)
    canvas.setFillColor(colors.HexColor('#415A67'))
    canvas.drawString(48, 816, 'NEURODIVERGENT CHILD SUPPORT / RESEARCH OPPORTUNITIES')
    canvas.line(48, 39, 547, 39)
    canvas.drawString(48, 25, '7 September 2026 • Evidence brief • Proposed projects, no results claimed')
    canvas.drawRightString(547, 25, str(doc.page))
    canvas.restoreState()

source = (ROOT / 'report-source.md').read_text()
story = []
pages = source.split('\n---\n')
for i, page in enumerate(pages):
    if i:
        story.append(PageBreak())
    for block in re.split(r'\n\s*\n', page.strip()):
        if block.startswith('# '):
            style, value = 'title', block[2:]
        elif block.startswith('## '):
            style, value = 'heading', block[3:]
        else:
            style = 'source' if block.startswith(('Source:', 'Sources:')) else 'body'
            value = block
        if re.match(r'^\d+\. ', value):
            for line in value.splitlines():
                story.append(Paragraph(inline(line), styles[style]))
        else:
            story.append(Paragraph(inline(value.replace('\n', ' ')), styles[style]))

output = ROOT / 'research-opportunities.pdf'
doc = SimpleDocTemplate(str(output), pagesize=(595.28, 841.89), rightMargin=48, leftMargin=48,
    topMargin=58, bottomMargin=54, title='Research opportunities in neurodivergent child support',
    author='Research brief prepared for the PRGN project', pageCompression=1)
doc.build(story, onFirstPage=furniture, onLaterPages=furniture)
pdf = pymupdf.open(output)
qa = ROOT / '.research-qa'
qa.mkdir(exist_ok=True)
links = []
for i, page in enumerate(pdf):
    text = page.get_text()
    assert len(text.strip()) > 200, f'Unexpected near-blank page {i+1}'
    assert '\ufffd' not in text, f'Unexpected replacement glyph on page {i+1}'
    for b in page.get_text('blocks'):
        assert b[0] >= 0 and b[1] >= 0 and b[2] <= page.rect.width + 1 and b[3] <= page.rect.height + 1, (i, b)
    links.extend(x.get('uri') for x in page.get_links() if x.get('uri'))
    page.get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(qa / f'page-{i+1}.png')
assert len(pdf) == len(pages), f'Unexpected page count {len(pdf)} vs {len(pages)}'
expected = re.findall(r'\]\((https?://[^)]+)\)', source)
assert set(expected) <= set(links), 'Missing PDF citation links'
(qa / 'extracted.txt').write_text('\n\n'.join(p.get_text() for p in pdf))
print(f'Created {output.name}: {len(pdf)} pages, {len(links)} linked citation regions, {output.stat().st_size} bytes')
