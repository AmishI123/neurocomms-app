import contextlib,io,json,shutil,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import run
class FakeHealth(io.BytesIO):
 def __enter__(self):return self
 def __exit__(self,*args):self.close()
class RunnerTests(unittest.TestCase):
 def test_resumption_and_frozen_inputs(self):
  source=run.ROOT
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   for name in run.FROZEN:
    (root/name).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source/name,root/name)
   (root/'results').mkdir()
   calls=[]
   def request(endpoint,messages,seed):
    calls.append((messages,seed))
    text=json.dumps({'cards':[f'optional {len(calls)} {i}' for i in range(6)]})
    return {'request':{**run.SETTINGS,'messages':messages,'seed':seed},'response':{'choices':[{'finish_reason':'stop','message':{'content':text}}],'usage':{'total_tokens':10}},'wall_seconds':.1,'error':None}
   with patch.object(run,'ROOT',root),patch.object(run,'request',side_effect=request),patch.object(run,'request_props',return_value={'test_fixture':True}),patch.object(run.urllib.request,'urlopen',side_effect=lambda *args,**kw:FakeHealth(b'{"status":"ok"}')),contextlib.redirect_stdout(io.StringIO()):
    run.run('http://fixture');self.assertEqual(len(calls),108)
    raw={p.stem:json.loads(p.read_text()) for p in (root/'results/raw').glob('*.json')}
    for record in raw.values():
     if record['condition']=='review':
      parent=run.content(raw[record['parent_id']]);self.assertIn(json.dumps(parent,ensure_ascii=False),record['request']['messages'][0]['content'])
      self.assertEqual(record['request']['seed'],record['trial_seed']+1000)
    before={p.name:p.read_bytes() for p in (root/'results/raw').glob('*.json')}
    run.run('http://fixture');self.assertEqual(len(calls),108)
    after={p.name:p.read_bytes() for p in (root/'results/raw').glob('*.json')};self.assertEqual(before,after)
    (root/'prompts/basic.txt').write_text('changed')
    with self.assertRaises(AssertionError):run.run('http://fixture')
if __name__=='__main__':unittest.main()
