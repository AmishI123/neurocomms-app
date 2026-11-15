import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readDisplay,defaultDisplay,DISPLAY_KEY} from '../display.mjs';
test('reading settings accept every supported combination without changing input',()=>{for(const size of ['standard','large','largest'])for(const spacing of ['standard','roomy'])for(const contrast of ['soft','high','dark']){const value={version:1,size,spacing,contrast};const raw=JSON.stringify(value);assert.deepEqual(readDisplay(raw),value);assert.equal(JSON.stringify(value),raw);}assert.deepEqual(readDisplay(null),defaultDisplay());assert.notEqual(DISPLAY_KEY,'my-visit-notes.v1');});
test('unknown, damaged and arbitrary reading settings are rejected',()=>{for(const raw of ['bad','null','[]',JSON.stringify({...defaultDisplay(),version:2}),JSON.stringify({...defaultDisplay(),size:'100000'}),JSON.stringify({...defaultDisplay(),contrast:'<script>'})])assert.throws(()=>readDisplay(raw));});
