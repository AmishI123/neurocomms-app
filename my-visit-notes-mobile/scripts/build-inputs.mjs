import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

export function captureInputs(root, files) {
 return Object.fromEntries(files.map(file=>[file,createHash('sha256').update(readFileSync(resolve(root,file))).digest('hex')]));
}

export function verifyInputs(root, expected) {
 const actual=captureInputs(root,Object.keys(expected));
 for(const [file,hash] of Object.entries(expected))assert.equal(actual[file],hash,'Build input changed during compilation: '+file);
}
