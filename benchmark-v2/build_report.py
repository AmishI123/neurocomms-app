from pathlib import Path
import html,json,re,hashlib
ROOT=Path(__file__).resolve().parent

def pct(x):return 'N/A' if x is None else f'{100*x:.1f}%'
def build():
 data=json.loads((ROOT/'results/analysis.json').read_text());audit_path=ROOT/'results/audit.json'
 if not audit_path.exists():raise RuntimeError('Output audit must be completed before publishing the dashboard/report')
 data['audit']=json.loads(audit_path.read_text())
 expected={f'{cid}--s17--{cond}' for cid in ['craft-glue','food-unknown','social-story','routine-change'] for cond in ['basic','context','review']}
 assert {e['id'] for e in data['audit']['entries']}==expected,'Prespecified audit is incomplete'
 assert len(data['audit']['entries'])==12,'Duplicate audit IDs'
 for entry in data['audit']['entries']+data['audit'].get('posthoc_examples',[]):
  assert entry['source_sha256']==hashlib.sha256((ROOT/'results/raw'/ (entry['id']+'.json')).read_bytes()).hexdigest(),'Audited source changed'
 encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 (ROOT/'dashboard.html').write_text((ROOT/'dashboard-template.html').read_text().replace('__DATA__',encoded))
 s=data['summaries'];cost=data['cost'];ref=data['reference_diagnostics']
 rows='\n'.join(f"| {k} | {v['valid']}/{v['outputs']} | {v['risk_outputs']}/{v['valid']} | {v['invalid_or_risk']}/{v['outputs']} | {v['duplicate_cards']} | {v['over_limit_cards']} | {v['workflow_seconds_total']/v['outputs']:.1f} |" for k,v in s.items())
 comparisons=[]
 for key,metrics in data['comparisons'].items():
  for metric,r in metrics.items():
   if r['difference'] is None:comparisons.append(f"- {key.replace('_', ' ')}, {'flags among valid outputs' if metric == 'risk_any' else 'invalid output or a risk flag'}: no defined case pairs.")
   else:comparisons.append(f"- {key.replace('_', ' ')}, {'flags among valid outputs' if metric == 'risk_any' else 'invalid output or a risk flag'}: {100*r['difference']:+.1f} percentage points; exploratory 95% case-bootstrap interval [{100*r['ci95'][0]:.1f}, {100*r['ci95'][1]:.1f}]; {r['cases']} case pairs.")
 findings=data['audit']['summary']
 report=f'''# PhraseBench: a constructed-case evaluation of communication-suggestion prompting

Technical report · 8 September 2026 · Benchmark v1.0.0

## Abstract

We evaluated basic prompting, explicit context-aware prompting, and a subsequent structured-review pass using a pinned local Qwen3.5-0.8B Q8_0 model. Twelve original English fictional cases across six domains were each evaluated with three fixed seeds, producing {cost['actual_model_calls']} actual model calls and 36 final outputs per condition. Output format, lexical consistency-risk flags, exact duplicates, word limits and resource use were measured with frozen rules. Valid outputs numbered {s['basic']['valid']}/36, {s['context']['valid']}/36 and {s['review']['valid']}/36 for basic, context and review respectively. {findings} These constructed-case results do not establish communication usefulness or benefit for people.

## 1. Motivation and relationship to prior work

The earlier project concerned whether an adult review interface improves preparation of supplemental communication materials. This autonomous experiment examines model prompting, not that human-interface effect. The closest inspected authoring study used fictional cases to compare AI-assisted VSD creation with Snap Scene and reported mixed quality alongside efficiency gains ([Zastudil et al., ASSETS 2025](https://arxiv.org/html/2507.21811v1)). Personalization and review are not claimed as new categories. [Frisch et al.'s 2026 workshop paper](https://arxiv.org/html/2606.24854v1) argues for evaluation beyond narrow technical measures; our limited proxies must be interpreted accordingly.

## 2. Methods

The prerequest specification is in docs/protocol.md and data/frozen-manifest.json. All public case information is shared across conditions; private annotations are excluded. Basic uses a short generation instruction. Context adds explicit grounding, uncertainty, nonrepetition and communication-function instructions. Review consumes the exact context output plus the same case in a fresh request. Context drafts are reused, making review a paired extension rather than a newly regenerated draft. Extra computation and review content are not experimentally separated.

Cases cover crafts, food, music, outdoor activity, social activity and routines. Half request at most three words per card and half eight; all request six optional supplemental cards. Profiles contain preferences, alternatives and uncertainty rather than real participant records. They are original constructed materials, not a population sample or validated communication scenarios.

Model: [Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B), using the [ggml-org GGUF conversion](https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF) at revision `{data['model']['model']['revision']}`, Q8_0, model SHA256 `{data['model']['model']['sha256']}`. Runtime: [llama.cpp](https://github.com/ggml-org/llama.cpp) {data['model']['runtime']['tag']}, CPU, two threads, one slot, 4096-token context and disabled reasoning. Temperature 0.7, top_p 0.8, top_k 20, min_p 0, repeat penalty 1, maximum 256 generated tokens. Generation seeds were 17, 29 and 43; review used each seed +1000. A fixed shuffled schedule mixed cases and conditions. Inference used independent chat histories and disabled prompt caching. The smoke test is excluded from results.

Complete request payloads, raw responses, token counts, finish reasons, timings and seeds are retained in results/raw. Malformed, truncated or noncompliant outputs were not repaired or regenerated. The analysis requires all expected record IDs and verifies the frozen input hashes.

## 3. Measurements and analysis

Rule-flagged consistency risks are narrow lexical candidates, not semantic truth labels. Detectors recognize some positive liking assertions about known disliked topics and selected unsupported autobiographical/medical assertions. Negation handling is deliberately simple. Format errors count separately. The all-output composite combines invalid output or a risk flag; a lower value does not guarantee better material. Duplicates normalize case and punctuation. Word-limit violations measure requested-format compliance, not linguistic suitability. Function indicators detect selected words/forms and do not validate communicative intent.

For condition contrasts, the three seeds are averaged within each case; bootstrap intervals resample the cases 10,000 times with seed 20260907. Conditional risk metrics omit undefined pairs and report denominators. Raw output counts remain visible. These exploratory intervals reflect variation across our constructed cases, not general population uncertainty.

## 4. Results

| Workflow | Valid outputs | Risk-flagged / valid | Invalid or risk / all | Duplicate cards | Over-limit cards | Mean workflow seconds |
|---|---|---|---|---|---|---|
{rows}

![Descriptive measurement rates across three prompting workflows](figures/measurements.png)

Review workflow time includes its parent context generation. Duplicate and over-limit counts use valid outputs only; they are not comparable without considering those denominators.

{chr(10).join(comparisons)}

![Case-level paired differences with exploratory bootstrap intervals](figures/paired-differences.png)

An interval of [0, 0] for a conditional contrast reflects identical observed case-level differences under this metric. It does not establish equivalence beyond these constructed cases or compensate for an insensitive detector.

The narrow detector's authored reference set contained {ref['n']} cards. Against the benchmark designer's reference interpretation it produced {ref['true_positive']} true positives, {ref['false_positive']} false positives, {ref['true_negative']} true negatives and {ref['false_negative']} false negatives (precision {pct(ref['precision'])}, recall {pct(ref['recall'])}). These are deliberately diagnostic examples with known weaknesses, not an estimate of accuracy on generated material. The tests verify implementation behavior even where the semantic interpretation and rule output differ.

## 5. Inspecting what the rules miss

{findings}

The prespecified audit covers seed 17 in craft-glue, food-unknown, social-story and routine-change across all three conditions. Full findings are in results/audit.json and the dashboard. It was performed by the assistant building this benchmark, with condition visible. It is neither independent expert review nor evidence from human participants. Additional post-hoc examples, if present, are explicitly labeled. Frozen rules were not revised to fit observed outputs.

## 6. Resources and reproducibility

Actual calls: {cost['actual_model_calls']}. Total measured request wall time: {cost['actual_request_wall_seconds']/60:.1f} minutes. Input tokens: {cost['actual_prompt_tokens']:,}; output tokens: {cost['actual_completion_tokens']:,}. API fees: USD 0 because inference was local; electricity, hardware and development effort were not priced. The model file is {data['model']['model']['bytes']:,} bytes. Observed runtime includes prompt processing and host contention and is not a controlled hardware benchmark.

Run setup_local.py, start the pinned server as described in README.md, and use run.py run, analyze.py, plot_results.py and build_report.py. The saved run can be rescored and its report rebuilt without downloading a model or calling an API. Exact text reproducibility across different hardware/compiler/runtime configurations is not promised by a sampling seed alone. Model/runtime content hashes and all original outputs provide a checkable record.

## 7. Limitations and next experiment

This is one small quantized model, 12 constructed English cases and three seeds. The benchmark designer authored both cases and measurement rules. Review has more computation, and neither automatic flags nor phrase-count compliance establishes usefulness. A zero risk-flag rate cannot establish an absence of hallucination. Some outputs may describe the person or give advice to an adult rather than supply usable first-person choices; no automatic rule fully captures that mismatch. A short-form word limit is an experimental instruction, not a recommendation to restrict a person's vocabulary.

A stronger extension would use independently authored held-out cases, qualified raters, broader semantic assessment and additional models under documented budgets. Any real-user benefit or graphical-review-interface effect requires a separate study. No clinical, universal model-ranking or global-novelty claim is made.
'''
 (ROOT/'REPORT.md').write_text(report)
 # Render the controlled Markdown subset used by this report without external dependencies.
 def inline(s):
  s=html.escape(s);s=re.sub(r'\[([^\]]+)\]\((https://[^)]+)\)',r'<a href="\2">\1</a>',s);s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s);return s
 parts=[]
 for block in report.strip().split('\n\n'):
  if block.startswith('# '):parts.append('<h1>'+inline(block[2:])+'</h1>')
  elif block.startswith('## '):parts.append('<h2>'+inline(block[3:])+'</h2>')
  elif block.startswith('!['):
   m=re.fullmatch(r'!\[([^\]]+)\]\(([^)]+)\)',block)
   if m:parts.append('<figure><img style="width:100%" src="'+html.escape(m[2],quote=True)+'" alt="'+html.escape(m[1],quote=True)+'"><figcaption>'+html.escape(m[1])+'</figcaption></figure>')
  elif block.startswith('|'):
   cells=[line.strip('|').split('|') for line in block.splitlines()];parts.append('<table><thead><tr>'+''.join('<th>'+inline(c.strip())+'</th>' for c in cells[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+inline(c.strip())+'</td>' for c in row)+'</tr>' for row in cells[2:])+'</tbody></table>')
  elif block.startswith('- '):parts.append('<ul>'+''.join('<li>'+inline(line[2:])+'</li>' for line in block.splitlines())+'</ul>')
  else:parts.append('<p>'+inline(block.replace('\n',' '))+'</p>')
 css='body{max-width:950px;margin:40px auto;padding:0 24px;font:15px/1.6 system-ui;color:#213b35}h1{font:38px/1.15 Georgia}h2{font-size:22px;break-after:avoid}table{border-collapse:collapse;font-size:12px;width:100%}td,th{padding:8px;border:1px solid #ccd4ca;text-align:left}code{overflow-wrap:anywhere;font-size:11px}a{color:#285e4c}p{orphans:3;widows:3}figure{margin:20px 0;break-inside:avoid}figcaption{font-size:10px;color:#556}@media print{body{font-size:10pt;line-height:1.45;margin:0}h1{font-size:23pt}h2{font-size:14pt}table{font-size:8pt}@page{size:A4;margin:17mm}}'
 (ROOT/'REPORT.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PhraseBench technical report</title><style>'+css+'</style><main>'+''.join(parts)+'</main></html>')
 print('Built dashboard.html, REPORT.md and REPORT.html')
if __name__=='__main__':build()
