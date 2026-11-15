// Checks the Android and iPad shells without building them: the right app, the device plugin wired in,
// only the internet permission, camera wording on the iPad, the web pages copied, and no signing keys.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const problems = [];
const expect = (ok, text) => { if (!ok) problems.push(text); };

const config = JSON.parse(read('capacitor.config.json'));
expect(config.appId === 'org.helperjobs.app' && config.appName === 'Helper Jobs' && config.webDir === 'www', 'capacitor.config.json names the app');
expect(config.server && config.server.androidScheme === 'https', 'Android pages load over https://localhost (the live link allows that origin)');

const manifest = read('android/app/src/main/AndroidManifest.xml');
const perms = [...manifest.matchAll(/uses-permission android:name="([^"]+)"/g)].map(m => m[1]);
expect(perms.length === 1 && perms[0] === 'android.permission.INTERNET', `Android asks only for the internet (found: ${perms.join(', ')})`);
expect(manifest.includes('android.intent.action.TTS_SERVICE'), 'Android can find the voice engine for read aloud');
const activity = read('android/app/src/main/java/org/helperjobs/app/MainActivity.java');
expect(activity.includes('registerPlugin(HelperJobsDevicePlugin.class)'), 'Android registers the device plugin');
expect(activity.includes('HelperJobsNative.onBack()'), 'Android back button stays inside the app');
const plugin = read('android/app/src/main/java/org/helperjobs/app/HelperJobsDevicePlugin.java');
const iosPlugin = read('ios/App/App/HelperJobsDevicePlugin.swift');
const bridge = read('../native.js');
for (const method of ['voices', 'speak', 'stopSpeaking', 'print', 'keepAwake', 'pinApp', 'unpinApp', 'pinState', 'saveFile']) {
  expect(new RegExp(`public void ${method}\\(PluginCall`).test(plugin), `Android plugin has ${method}`);
  expect(iosPlugin.includes(`CAPPluginMethod(name: "${method}"`) && iosPlugin.includes(`@objc func ${method}(`), `iPad plugin has ${method}`);
  expect(bridge.includes(`'${method}'`), `native.js calls ${method}`);
}
expect(read('android/app/build.gradle').includes('System.getenv("HELPER_JOBS_KEYSTORE")'), 'Android release signing comes from CI secrets');

const plist = read('ios/App/App/Info.plist');
for (const key of ['NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription']) expect(plist.includes(key), `iPad Info.plist explains ${key}`);
expect(read('ios/App/App/Base.lproj/Main.storyboard').includes('customClass="HelperJobsViewController"'), 'iPad uses the Helper Jobs view controller');
const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
for (const f of ['HelperJobsDevicePlugin.swift', 'HelperJobsViewController.swift']) expect((pbx.match(new RegExp(`${f.replace('.', '\\.')} in Sources`, 'g')) || []).length === 2, `Xcode builds ${f}`);

for (const p of ['android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png']) expect(existsSync(join(root, p)), `icon ${p}`);
if (existsSync(join(root, 'www'))) {
  for (const f of ['index.html', 'native.js', 'app.js']) expect(existsSync(join(root, 'www', f)), `www has ${f}`);
  expect(!existsSync(join(root, 'www', 'presentation')) && !existsSync(join(root, 'www', 'server')) && !existsSync(join(root, 'www', 'tests')), 'www leaves out the slides, server and tests');
}
const walk = (dir, out = []) => { for (const n of readdirSync(dir)) { if (n === 'node_modules' || n === 'build' || n === '.gradle') continue; const p = join(dir, n); if (statSync(p).isDirectory()) walk(p, out); else out.push(p); } return out; };
expect(!walk(root).some(p => /\.(jks|keystore|p12)$/.test(p)), 'no signing keys in the shells');
for (const page of readdirSync(join(root, '..')).filter(n => n.endsWith('.html') && !['presentation.html', 'handout.html'].includes(n))) {
  const html = readFileSync(join(root, '..', page), 'utf8');
  const at = html.indexOf('native.js'); const firstOther = html.search(/<script src="(?!native\.js)/);
  expect(at > 0 && (firstOther < 0 || at < firstOther || html.indexOf('</head>') > at), `${page} loads native.js in the head`);
}
if (problems.length) { console.error('Shell check failed:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('shells-ok: Android and iPad shells are wired to Helper Jobs');
