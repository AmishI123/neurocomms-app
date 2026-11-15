"""Download pinned public runtime/model artifacts outside version control."""
from pathlib import Path
import urllib.request,json,hashlib,tarfile
BENCHMARK=Path(__file__).resolve().parent
ROOT=BENCHMARK.parent
CACHE=ROOT/'.benchmark-runtime'
CACHE.mkdir(exist_ok=True)
TAG='b10853'
REV='8fea620810c4afa23dd6443f999a48574c1611a3'
MODEL='qwen2.5-0.5b-instruct-q5_k_m.gguf'
def get(url):
    with urllib.request.urlopen(url,timeout=60) as r:return json.load(r)
def download(url,path):
    if path.exists():return
    tmp=path.with_suffix(path.suffix+'.part')
    print('Downloading',path.name,flush=True)
    with urllib.request.urlopen(url,timeout=120) as r, tmp.open('wb') as f:
        while block:=r.read(1024*1024):f.write(block)
    tmp.rename(path)
def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while block:=f.read(1024*1024):h.update(block)
    return h.hexdigest()
release=get('https://api.github.com/repos/ggml-org/llama.cpp/releases/tags/'+TAG)
asset=next(a for a in release['assets'] if a['name']==f'llama-{TAG}-bin-ubuntu-x64.tar.gz')
archive=CACHE/asset['name'];download(asset['browser_download_url'],archive)
sha=digest(archive)
assert asset.get('digest')=='sha256:'+sha, 'Runtime digest differs from release metadata'
with tarfile.open(archive) as t:t.extractall(CACHE,filter='data')
REV='main'
url=f'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/{REV}/{MODEL}'
model=CACHE/MODEL;download(url,model)
info=get(f'https://huggingface.co/api/models/Qwen/Qwen2.5-0.5B-Instruct-GGUF/tree/{REV}')
entry=next(e for e in info if e['path']==MODEL)
model_sha=digest(model)
assert entry['lfs']['oid']==model_sha,'Model digest differs from repository LFS metadata'
manifest={'runtime':{'repository':'ggml-org/llama.cpp','tag':TAG,'url':asset['browser_download_url'],'sha256':sha},'model':{'repository':'Qwen/Qwen2.5-0.5B-Instruct-GGUF','upstream':'Qwen/Qwen2.5-0.5B-Instruct','revision':REV,'filename':MODEL,'sha256':model_sha,'bytes':model.stat().st_size,'url':url},'license':'Model Apache-2.0; llama.cpp MIT. Consult linked repositories.'}
(BENCHMARK/'data/model-lock.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest),flush=True)
