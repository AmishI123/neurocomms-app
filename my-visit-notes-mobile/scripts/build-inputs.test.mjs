import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {captureInputs,verifyInputs} from './build-inputs.mjs';

test('unchanged inputs verify; changed and missing inputs fail',()=>{
 const root=mkdtempSync(join(tmpdir(),'visit-build-input-test-'));
 const file=join(root,'fictional-source.swift');
 writeFileSync(file,'before');
 const hashes=captureInputs(root,['fictional-source.swift']);
 assert.match(hashes['fictional-source.swift'],/^[a-f0-9]{64}$/);
 verifyInputs(root,hashes);
 writeFileSync(file,'after');
 assert.throws(()=>verifyInputs(root,hashes),/Build input changed during compilation/);
 unlinkSync(file);
 assert.throws(()=>verifyInputs(root,hashes),/ENOENT/);
});
