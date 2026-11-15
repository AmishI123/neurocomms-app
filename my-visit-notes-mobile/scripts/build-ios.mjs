// Run on a Mac with Xcode and CocoaPods. This proves compilation and packaging,
// not simulator interaction, accessibility, or device behavior.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {captureInputs,verifyInputs} from './build-inputs.mjs';

if(process.platform!=='darwin')throw Error('The iOS build check requires macOS, Xcode and CocoaPods. No build was attempted.');
const root=fileURLToPath(new URL('../',import.meta.url));
const run=(command,args,options={})=>execFileSync(command,args,{cwd:root,stdio:'inherit',...options});
const output=(command,args)=>run(command,args,{stdio:'pipe',encoding:'utf8'}).trim();
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const xcode=output('xcodebuild',['-version']);
const pods=output('pod',['--version']);
run('npm',['run','build']);
run('npx',['--no-install','cap','copy','android']);
run('npx',['--no-install','cap','sync','ios']);
// Snapshot compiler inputs before compilation; hashing only afterwards could
// incorrectly attribute an existing executable to files edited during a build.
function appInputs(directory){return readdirSync(resolve(root,directory),{withFileTypes:true}).flatMap(entry=>{
 const file=directory+'/'+entry.name;
 return entry.isDirectory()?appInputs(file):[file];
});}
const inputs=['package.json','package-lock.json','capacitor.config.json','ios/App/Podfile','ios/App/Podfile.lock','ios/App/App.xcodeproj/project.pbxproj','scripts/build-ios.mjs','scripts/build-inputs.mjs',...appInputs('ios/App/App')];
const sourceHashes=captureInputs(root,inputs);
run('xcodebuild',['-workspace','ios/App/App.xcworkspace','-scheme','App','-sdk','iphonesimulator','-configuration','Debug','-derivedDataPath','ios/App/build','CODE_SIGNING_ALLOWED=NO','build']);
verifyInputs(root,sourceHashes);
const app=resolve(root,'ios/App/build/Build/Products/Debug-iphonesimulator/App.app');
assert.equal(output('/usr/libexec/PlistBuddy',['-c','Print :CFBundleIdentifier',resolve(app,'Info.plist')]),'org.myvisitnotes.app');
assert.equal(output('/usr/libexec/PlistBuddy',['-c','Print :CFBundleDisplayName',resolve(app,'Info.plist')]),'My Visit Notes');
run('plutil',['-lint',resolve(app,'PrivacyInfo.xcprivacy')]);
const plist=file=>JSON.parse(output('plutil',['-convert','json','-o','-',file]));
assert.deepEqual(plist(resolve(app,'PrivacyInfo.xcprivacy')),plist(resolve(root,'ios/App/App/PrivacyInfo.xcprivacy')),'Compiled privacy declaration must match source');
const manifest=JSON.parse(readFileSync(resolve(root,'dist/bundle-manifest.json')));
for(const [file,expected] of Object.entries(manifest.files)){
 assert.equal(sha(resolve(app,'public',file)),expected,'Stale iOS asset: '+file);
 assert.equal(sha(resolve(root,'../product-specs/my-visit-notes',file)),expected,'Source changed during build: '+file);
}
const receipt={date:new Date().toISOString(),xcode,pods,app,compilationPassed:true,assetsVerified:Object.keys(manifest.files).length,executableSHA256:sha(resolve(app,'App')),sourceHashes,notTested:['simulator journey','native file import/export','clipboard','print output','offline restart','keyboard and cutouts','background privacy','app update','physical devices']};
writeFileSync(resolve(root,'ios/App/build/visit-build-evidence.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
