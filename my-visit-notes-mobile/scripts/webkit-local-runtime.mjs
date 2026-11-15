import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';

export function localWebKitOptions(webkit,environmentFile,report={}){
 if(!environmentFile)return {};
 assert.equal(process.platform,'linux');
 const config=JSON.parse(readFileSync(environmentFile));
 for(const key of ['LD_LIBRARY_PATH','GST_PLUGIN_PATH_1_0'])if(config.environment[key])process.env[key]=config.environment[key];
 const libs=resolve(config.directory,'root/usr/lib/x86_64-linux-gnu');
 const bundle=resolve(dirname(webkit.executablePath()),'minibrowser-wpe');
 // The shipped wrapper replaces LD_LIBRARY_PATH. Use that exact installed
 // binary and its bundle paths, plus the libraries extracted without root.
 const env={...process.env,LD_LIBRARY_PATH:[join(bundle,'lib'),join(bundle,'sys/lib'),libs,join(libs,'blas'),join(libs,'lapack'),process.env.LD_LIBRARY_PATH].filter(Boolean).join(':'),WEBKIT_EXEC_PATH:join(bundle,'bin'),WEBKIT_INJECTED_BUNDLE_PATH:join(bundle,'lib'),WEBKIT_INSPECTOR_RESOURCES_PATH:join(bundle,'share'),WEBKIT_FORCE_COMPLEX_TEXT:'1'};
 const checked=[...readdirSync(join(bundle,'bin')).map(f=>join(bundle,'bin',f)),join(libs,'gstreamer-1.0/libgstlibav.so')];
 for(const file of checked){
  const linked=execFileSync('ldd',[file],{env,encoding:'utf8'});
  assert.doesNotMatch(linked,/not found/,'Unresolved user-local library: '+file);
 }
 // The stock dlopen preflight reads only the unchanged system ldconfig cache.
 // Actual dynamic linking above replaces it; no journey assertion is skipped.
 process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS='1';
 report.localDependencyValidation={method:'ldd against actual WPE executables and libgstlibav',checked,systemInstallChanged:false};
 return {executablePath:join(bundle,'bin/MiniBrowser'),env};
}
