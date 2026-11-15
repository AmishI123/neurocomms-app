// Draws the app icon and launch screen for Android and the iPad from one design (rust tile, cream "h.").
// Run: node scripts/make-art.mjs  (needs Playwright's Chromium; the PNGs are committed, so CI does not run this).
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const font = readFileSync(join(root, '..', 'fraunces-normal.woff2')).toString('base64');
const FACE = `@font-face{font-family:F;src:url(data:font/woff2;base64,${font}) format('woff2')}*{margin:0;padding:0}html,body{background:transparent}`;
const RUST = '#9A4A22', CREAM = '#F3ECE1', PAPER = '#FBF6EE', INK = '#2B2622';
// The "h." mark, sized to a box; the period sits on the baseline like the website's logo.
const mark = (size, color) => `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center"><span style="font:400 ${size * 0.74}px/1 F;color:${color};letter-spacing:-.02em;transform:translateY(-${size * 0.04}px)">h.</span></div>`;
const pages = {
  legacy: s => `<div style="width:${s}px;height:${s}px;border-radius:${s * 0.22}px;background:${RUST};display:flex;align-items:center;justify-content:center">${mark(s * 0.8, PAPER)}</div>`,
  round: s => `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${RUST};display:flex;align-items:center;justify-content:center">${mark(s * 0.72, PAPER)}</div>`,
  // Adaptive icon foreground: only the middle 66% is always visible, so the mark stays inside it.
  fore: s => `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center">${mark(s * 0.5, PAPER)}</div>`,
  ios: s => `<div style="width:${s}px;height:${s}px;background:${RUST};display:flex;align-items:center;justify-content:center">${mark(s * 0.8, PAPER)}</div>`,
  splash: (w, h) => { const t = Math.min(w, h) * 0.2; return `<div style="width:${w}px;height:${h}px;background:${CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${t * 0.18}px"><div style="width:${t}px;height:${t}px;border-radius:${t * 0.12}px;background:${RUST};display:flex;align-items:center;justify-content:center">${mark(t * 0.8, PAPER)}</div><div style="font:400 ${t * 0.3}px/1 F;color:${INK}">Helper Jobs</div></div>`; }
};
const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, w, h, out, opaque = false) {
  mkdirSync(dirname(out), { recursive: true });
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><style>${FACE}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: !opaque, clip: { x: 0, y: 0, width: w, height: h } });
}
const res = join(root, 'android/app/src/main/res');
for (const [d, s] of Object.entries({ mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 })) {
  await shot(pages.legacy(s), s, s, join(res, `mipmap-${d}/ic_launcher.png`));
  await shot(pages.round(s), s, s, join(res, `mipmap-${d}/ic_launcher_round.png`));
  await shot(pages.fore(s * 2.25), s * 2.25, s * 2.25, join(res, `mipmap-${d}/ic_launcher_foreground.png`));
}
const splash = { '': [480, 320], 'land-mdpi': [480, 320], 'land-hdpi': [800, 480], 'land-xhdpi': [1280, 720], 'land-xxhdpi': [1600, 960], 'land-xxxhdpi': [1920, 1280], 'port-mdpi': [320, 480], 'port-hdpi': [480, 800], 'port-xhdpi': [720, 1280], 'port-xxhdpi': [960, 1600], 'port-xxxhdpi': [1280, 1920] };
for (const [d, [w, h]] of Object.entries(splash)) await shot(pages.splash(w, h), w, h, join(res, `drawable${d ? '-' + d : ''}/splash.png`), true);
const ios = join(root, 'ios/App/App/Assets.xcassets');
await shot(pages.ios(1024), 1024, 1024, join(ios, 'AppIcon.appiconset/AppIcon-512@2x.png'), true);
for (const n of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) await shot(pages.splash(2732, 2732), 2732, 2732, join(ios, 'Splash.imageset', n), true);
await browser.close();
console.log('icons and launch screens drawn');
