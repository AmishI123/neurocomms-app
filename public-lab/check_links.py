from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys
ROOT=Path(__file__).resolve().parent
class Links(HTMLParser):
 def __init__(self): super().__init__(); self.hrefs=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ('href','src') and v:self.hrefs.append(v)
def check():
 errors=[]
 for page in ROOT.rglob('*.html'):
  p=Links();p.feed(page.read_text(errors='replace'))
  for href in p.hrefs:
   u=urlparse(href)
   if u.scheme or href.startswith('#') or href.startswith('data:'):continue
   target=(page.parent/u.path).resolve()
   if not target.exists(): errors.append(f'{page.relative_to(ROOT)} -> {href}')
 return errors
if __name__=='__main__':
 errors=check(); print('\n'.join(errors) if errors else 'all local HTML links resolve'); sys.exit(bool(errors))
