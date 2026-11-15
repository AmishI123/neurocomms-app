"""Run the offline PhraseLab release gate and write a compact status report."""
from pathlib import Path
import json,re,subprocess,sys
ROOT=Path(__file__).resolve().parent
checks=[]
def stable_output(value):
 value=re.sub(r'/tmp/tmp[^/\s]*', '/tmp/<temporary>', value)
 value=re.sub(r'in \d+(?:\.\d+)?s', 'in <duration>s', value)
 return value
def run(name,cmd):
 p=subprocess.run(cmd,cwd=ROOT.parent,capture_output=True,text=True); checks.append({'name':name,'passed':p.returncode==0,'output':stable_output((p.stdout+p.stderr)[-1200:])}); return p.returncode==0
if __name__=='__main__':
 ok=True
 ok &= run('firewall tests',[sys.executable,'-m','unittest','discover','-s','public-lab/firewall/tests','-v'])
 ok &= run('challenge tests',[sys.executable,'-m','unittest','discover','-s','public-lab/challenge/tests','-v'])
 ok &= run('case tests',[sys.executable,'-m','unittest','discover','-s','public-lab/cases','-p','test_*.py','-v'])
 ok &= run('evaluator tests',[sys.executable,'-m','unittest','discover','-s','public-lab/evaluator','-p','test_*.py','-v'])
 ok &= run('atlas tests',[sys.executable,'-m','unittest','discover','-s','public-lab/atlas','-p','test_*.py','-v'])
 ok &= run('red-team tests',[sys.executable,'-m','unittest','discover','-s','public-lab/red-team','-p','test_*.py','-v'])
 ok &= run('atlas build',[sys.executable,'public-lab/atlas/build_atlas.py'])
 ok &= run('red-team examples',[sys.executable,'public-lab/red-team/validate.py','public-lab/red-team/examples.json'])
 ok &= run('environment lab tests',[sys.executable,'-m','unittest','discover','-s','public-lab/environment-lab','-p','test_*.py','-v'])
 ok &= run('reading lab tests',[sys.executable,'-m','unittest','discover','-s','public-lab/reading-lab','-p','test_*.py','-v'])
 ok &= run('package tests',[sys.executable,'-m','unittest','discover','-s','public-lab','-p','test_package_release.py','-v'])
 ok &= run('package build',[sys.executable,'public-lab/package_release.py','-o','/tmp/phraselab-platform-release-check.zip'])
 ok &= run('repro challenge tests',[sys.executable,'-m','unittest','discover','-s','public-lab/repro-challenge','-p','test_*.py','-v'])
 ok &= run('template baseline generation',[sys.executable,'public-lab/repro-challenge/generate_baseline.py','-o','/tmp/template-baseline.jsonl'])
 ok &= run('template baseline score',['bash','-lc','PYTHONPATH=public-lab python3 public-lab/challenge/score_submission.py /tmp/template-baseline.jsonl --output /tmp/template-report.json'])
 ok &= run('review packet build',[sys.executable,'public-lab/repro-challenge/build_review_packet.py','-o','/tmp/phraselab-review-packet.json'])
 ok &= run('challenge report build',[sys.executable,'public-lab/repro-challenge/build_report.py','-o','/tmp/phraselab-challenge-report.md'])
 ok &= run('condition comparison',[sys.executable,'public-lab/repro-challenge/compare_conditions.py','-o','/tmp/condition-comparison.json'])
 ok &= run('reference control score',['bash','-lc','PYTHONPATH=public-lab python3 public-lab/challenge/score_submission.py public-lab/repro-challenge/reference-control.jsonl --output /tmp/phraselab-reference-report.json'])
 ok &= run('Phrase Studio JavaScript syntax',["node","--check","communication-tool/app.js"])
 ok &= run('Phrase Studio firewall syntax',["node","--check","communication-tool/firewall.js"])
 ok &= run('static local links',[sys.executable,'public-lab/check_links.py'])
 required=['site/index.html','firewall/index.html','museum/index.html','challenge/index.html','evaluator/index.html','evaluator/review.html','design-system/index.html','cases/cases.json','atlas/index.html','atlas/atlas.json','atlas/ATLAS-REPORT.md','red-team/index.html','red-team/studio.html','red-team/examples.json','red-team/demo-case.json','red-team/demo-submission.jsonl','red-team/demo-report.json','environment-lab/index.html','environment-lab/compare.html','environment-lab/fixtures.json','environment-lab/demo-session.json','environment-lab/demo-summary.json','environment-lab/PROTOCOL.md','reading-lab/index.html','reading-lab/fixtures.json','reading-lab/demo-session.json','reading-lab/demo-summary.json','reading-lab/PROTOCOL.md','repro-challenge/README.md','repro-challenge/PROTOCOL.md','repro-challenge/manifest.json','repro-challenge/reference-control.jsonl','repro-challenge/template-baseline.jsonl','repro-challenge/template-report.json','repro-challenge/review-packet.json','repro-challenge/REVIEW-RUNBOOK.md','repro-challenge/review.html','repro-challenge/author-preflight.jsonl','repro-challenge/author-preflight-report.json','repro-challenge/reference-control-report.json','repro-challenge/condition-comparison.json','repro-challenge/REPORT.md','repro-challenge/verify_review.py','repro-challenge/assemble_review_release.py']
 missing=[x for x in required if not (ROOT/x).is_file()];checks.append({'name':'public artifacts','passed':not missing,'missing':missing});ok &= not missing
 root_showcase=(ROOT.parent/'index.html').read_text() if (ROOT.parent/'index.html').is_file() else ''
 pages=(ROOT.parent/'.github/workflows/pages.yml').read_text() if (ROOT.parent/'.github/workflows/pages.yml').is_file() else ''
 publish_ok='public-lab/site/index.html' in root_showcase and 'actions/deploy-pages' in pages and 'release-gate' in pages
 checks.append({'name':'Pages publishing wiring','passed':publish_ok}); ok &= publish_ok
 report={'schema_version':'1.0','passed':bool(ok),'checks':checks,'scope':'offline tests, JavaScript syntax, static link integrity, and artifact presence'}; (ROOT/'release-check.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps({'passed':bool(ok),'checks':len(checks)}));sys.exit(0 if ok else 1)
