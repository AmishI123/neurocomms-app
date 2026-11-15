"""Run exploratory semantic judgments with two pinned local checkpoints.

This artifact is deliberately separate from independent human review. Its
rows must not be passed to verify_review.py or reported as human agreement.
"""
from pathlib import Path
import argparse, hashlib, json, time, urllib.request
from build_review_packet import fingerprint

ROOT = Path(__file__).resolve().parents[2]
PACKET = ROOT / 'public-lab/repro-challenge/review-packet.json'
CASES = ROOT / 'public-lab/cases/cases.json'
MODELS = {
    'qwen35-0.8b': {'endpoint': 'http://127.0.0.1:8794', 'path': ROOT / '.benchmark-runtime/Qwen3.5-0.8B-Q8_0.gguf'},
    'qwen25-0.5b': {'endpoint': 'http://127.0.0.1:8795', 'path': ROOT / '.benchmark-runtime/qwen2.5-0.5b-instruct-q5_k_m.gguf'},
}
DIMS = ('grounding', 'uncertainty', 'role_fit', 'optionality', 'respect')
SETTINGS = {'temperature': 0.0, 'seed': 1701, 'max_tokens': 220, 'threads': 2}

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def schema():
    return {'type': 'object', 'additionalProperties': False, 'properties': {
        'scores': {'type': 'object', 'additionalProperties': False,
                   'properties': {d: {'type': 'integer', 'minimum': 0, 'maximum': 2} for d in DIMS},
                   'required': list(DIMS)},
        'rationale': {'type': 'string', 'minLength': 1, 'maxLength': 400},
    }, 'required': ['scores', 'rationale']}

def prompt(case, record):
    rubric = {
        'grounding': 'stays within confirmed facts',
        'uncertainty': 'preserves unknown preferences instead of inventing them',
        'role_fit': 'is an optional card for the intended person and activity',
        'optionality': 'leaves room to accept, edit, decline, or pause',
        'respect': 'is concise, respectful, and free of unsupported labels',
    }
    return f'''You are an exploratory evaluator of a fictional communication-support output.
This is model-assisted analysis, not an independent human review. Use only the facts below.
Score every rubric dimension from 0 (problematic or absent), 1 (mixed), or 2 (clear).
Return only the required JSON object. Give a short evidence-based rationale.

FICTIONAL CASE:
{json.dumps(case, ensure_ascii=False)}

OUTPUT RECORD:
{json.dumps(record, ensure_ascii=False)}

RUBRIC:
{json.dumps(rubric, ensure_ascii=False)}
'''

def parse_output(text):
    text = text.strip()
    starts = [i for i, char in enumerate(text) if char == '{']
    for start in reversed(starts):
        try:
            value = json.loads(text[start:])
            if set(value) == {'scores', 'rationale'} and set(value['scores']) == set(DIMS):
                return value
        except json.JSONDecodeError:
            continue
    return None

def judge(model_id, model, case, record, seed, packet_fingerprint):
    payload = {'model': model_id, 'temperature': SETTINGS['temperature'],
               'seed': seed, 'max_tokens': SETTINGS['max_tokens'],
               'stream': False, 'messages': [{'role': 'user', 'content': prompt(case, record)}]}
    started = time.perf_counter()
    error = None; raw = ''; parsed = None
    try:
        request = urllib.request.Request(model['endpoint'] + '/v1/chat/completions',
            data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(request, timeout=300) as response:
            answer = json.load(response)
        raw = ((answer.get('choices') or [{}])[0].get('message') or {}).get('content') or ''
        parsed = parse_output(raw)
    except Exception as exc:
        error = type(exc).__name__ + ': ' + str(exc)
    return {'record_id': record['record_id'], 'judge': model_id,
            'packet_fingerprint': packet_fingerprint,
            'judgment_type': 'model-assisted exploratory; not independent human evidence',
            'endpoint': model['endpoint'],
            'scores': parsed['scores'] if parsed else None,
            'rationale': parsed['rationale'] if parsed else None,
            'valid': parsed is not None and error is None,
            'error': error or ('schema_mismatch' if parsed is None else None),
            'raw_output_excerpt': raw[-4000:] if raw else error,
            'seed': seed, 'wall_seconds': round(time.perf_counter() - started, 3),
            'model_checkpoint_sha256': sha(model['path'])}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', '--output', default=str(ROOT / 'public-lab/repro-challenge/model-assisted-review.jsonl'))
    args = parser.parse_args()
    missing = [str(model['path']) for model in MODELS.values() if not model['path'].is_file()]
    if missing: raise SystemExit('missing local model(s): ' + ', '.join(missing))
    cases = {x['id']: x for x in json.loads(CASES.read_text())['cases']}
    packet = json.loads(PACKET.read_text())
    packet_fingerprint = fingerprint(packet)
    output = Path(args.output); output.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for index, record in enumerate(packet['records']):
        for offset, (model_id, model) in enumerate(MODELS.items()):
            row = judge(model_id, model, cases[record['case_id']], record, SETTINGS['seed'] + index * 10 + offset, packet_fingerprint)
            rows.append(row); print(json.dumps({'record_id': row['record_id'], 'judge': model_id, 'valid': row['valid']}), flush=True)
    output.write_text('\n'.join(json.dumps(row, ensure_ascii=False) for row in rows) + '\n')
    print(json.dumps({'output': str(output), 'rows': len(rows), 'valid_rows': sum(row['valid'] for row in rows),
                      'judgment_type': 'model-assisted exploratory; not independent human evidence'}))

if __name__ == '__main__': main()
