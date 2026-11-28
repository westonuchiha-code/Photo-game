// Builds the phone test area as ONE self-contained file: dist-phone/photo-town-phone.html.
//   node tools/build_phone.mjs
// Same recipe as build_web.mjs + build_single.mjs, for src/phone.js + phone.html, with one difference that matters on
// a phone: only the textures this build can ask for are packed. Two ways of finding them, used together:
//   - reading the source of the GENERATOR pieces (district, interiors, furniture, street, people...): every texture
//     name in those files, with its normal / roughness / glow maps. Rooms are built later with random variety, so
//     what one run asks for is not the whole set; reading the source can't miss one.
//   - running the game for the HAND-BUILT sets (the photo batches): they are built whole when their area loads, and
//     their files also hold many pieces the phone build doesn't place, so reading them would pack far too much.
//     The build opens the dev page in a headless browser, visits every area and notes each texture requested.
// Needs: python3 (a throwaway local server) and Playwright's Chromium.
import { build } from './node/node_modules/esbuild/lib/main.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), DIST = path.join(ROOT, 'dist-phone'), TEX = path.join(ROOT, 'assets/textures');
fs.rmSync(DIST, { recursive: true, force: true }); fs.mkdirSync(path.join(DIST, 'packs'), { recursive: true });

// 1. which textures
const files = new Set(), todo = [path.join(ROOT, 'src/phone.js')];
while (todo.length) { const f = todo.pop(); if (files.has(f)) continue; files.add(f); const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*['"](\.{1,2}\/[^'"]+)['"]/g)) todo.push(path.resolve(path.dirname(f), m[1])); }
const all = fs.readdirSync(TEX), base = new Map(all.filter((n) => n.endsWith('.png')).map((n) => [n.slice(0, -4), n]));
const normalOf = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/normals.js'), 'utf8').match(/NORMAL_OF = (\{[\s\S]*?\});/)[1]);
const want = new Set();
const GENERATORS = /[\\/](phone|district|interiors|interiors91|furniture88|kitchen89|office90|civic93|street92|kit|people96|body97|carbody|trees|sky|house94|factory95|garden87)\.js$/;   // read by scanning; every other file by running
for (const f of files) { if (!GENERATORS.test(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/['"`]([A-Za-z0-9_]+)['"`]/g)) if (base.has(m[1])) want.add(m[1]);          // 'name'
  for (const m of src.matchAll(/([A-Za-z0-9_]+)\.png/g)) if (base.has(m[1])) want.add(m[1]);               // .../name.png
  // names built from parts, e.g. `bark_${kind}` or `${kind}_leaf`: every texture with that fixed start / end
  for (const m of src.matchAll(/([A-Za-z0-9_]*)\$\{[^}]+\}([A-Za-z0-9_]*)/g)) { const [, pre, suf] = m; if (pre.length < 3 && (suf.length < 4 || /^_(n|e|normal|rough)$/.test(suf))) continue;
    for (const n of base.keys()) if (n.startsWith(pre) && n.endsWith(suf) && (pre.length >= 3 || suf.length >= 4)) want.add(n); } }
for (const n of [...want]) for (const c of [normalOf[n], n + '_n', n + '_normal', n + '_e', n + '_rough']) if (c && base.has(c)) want.add(c);
const scanned = want.size;
{ const PORT = 8137, srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
  try { const { chromium } = createRequire(import.meta.url)('playwright'); await new Promise((r) => setTimeout(r, 1200));
    const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 412, height: 800 } }), seen = new Set();
    pg.on('request', (q) => { const m = q.url().match(/assets\/textures\/([A-Za-z0-9_]+)\.png/); if (m) seen.add(m[1]); });
    await pg.goto(`http://localhost:${PORT}/phone.html`, { waitUntil: 'commit', timeout: 300000 }); await pg.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
    const ids = await pg.evaluate(() => window.__scene.areaIds);
    for (const id of ids.slice(1)) { await pg.evaluate((to) => window.__scene.travel(to), id); await pg.waitForTimeout(600); await pg.waitForFunction(() => !window.__scene.busy, null, { timeout: 300000, polling: 300 }); await pg.waitForTimeout(2500); }
    await br.close(); for (const n of seen) if (base.has(n)) want.add(n);
    console.log(`recorded ${seen.size} textures requested across ${ids.length} areas (${want.size - scanned} beyond the source scan)`);
  } finally { srv.kill(); } }
// the PSX pack (px_*): models only when an imported file names them; the crowd's textures (names built at run time) whenever psx_rig is in
const srcAll = [...files].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
if ([...files].some((f) => /psx_rig\.js$/.test(f))) for (const n of base.keys()) if (n.startsWith('px_ch_')) want.add(n);
const list = [...want].map((n) => base.get(n)).concat(all.filter((n) => !n.endsWith('.png') && (!n.startsWith('px_') || srcAll.includes(n.replace(/\.\w+$/, '')))));
const listFile = path.join(DIST, 'textures.json'); fs.writeFileSync(listFile, JSON.stringify(list));
console.log(`phone build: ${files.size} source files, ${want.size} of ${base.size} textures`);
execFileSync('python3', [path.join(ROOT, 'tools/pack_textures.py'), TEX, path.join(DIST, 'packs'), listFile], { stdio: 'inherit' });

// 2. bundle
const threePlugin = { name: 'three', setup(b) {
  b.onResolve({ filter: /^three$/ }, () => ({ path: path.join(ROOT, 'vendor/three/three.module.js') }));
  b.onResolve({ filter: /^three\/addons\// }, (a) => ({ path: path.join(ROOT, 'vendor/three/addons', a.path.slice('three/addons/'.length)) })); } };
await build({ bundle: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none', plugins: [threePlugin], logLevel: 'warning', entryPoints: [path.join(ROOT, 'src/phone.js')], outfile: path.join(DIST, 'game.js') });

// 3. one file: the page with the boot script, the packs, the fonts and the game code inside it
const boot = fs.readFileSync(path.join(ROOT, 'tools/boot.js'), 'utf8'), idx = JSON.parse(fs.readFileSync(path.join(DIST, 'packs/packs.json'), 'utf8')), b64 = (f) => fs.readFileSync(f).toString('base64');
const usedFonts = new Set(); for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/['"]([\w-]+\.woff2)['"]/g)) usedFonts.add(m[1]);
const fonts = {}; for (const f of fs.readdirSync(path.join(ROOT, 'assets/fonts'))) if (!usedFonts.size || usedFonts.has(f)) fonts[f] = b64(path.join(ROOT, 'assets/fonts', f));
let data = `<script>window.__packIndex=${JSON.stringify(idx)};window.__fonts=${JSON.stringify(fonts)};window.__fontURL=function(f){return window.__fonts[f]?'data:font/woff2;base64,'+window.__fonts[f]:'assets/fonts/'+f;};</script>\n`;
idx.packs.forEach((n, i) => { data += `<script type="text/plain" id="pk${i}">${b64(path.join(DIST, `packs/pack${i}.wasm`))}</script>\n`; });
data += `<script type="text/plain" id="gamecode">${b64(path.join(DIST, 'game.js'))}</script>\n`;
let html = fs.readFileSync(path.join(ROOT, 'phone.html'), 'utf8').replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace(/<script type="module" src="src\/phone\.js"><\/script>/, () => `${data}<script>${boot}\nwindow.__boot('./game.js');</script>`);
if (!html.includes('__boot(')) throw new Error('page script not found');
const out = path.join(DIST, 'photo-town-phone.html'); fs.writeFileSync(out, html);
console.log('phone single file:', out, (fs.statSync(out).size / 1e6).toFixed(1), 'MB;', 'packs', (idx.packs.reduce((a, b) => a + b, 0) / 1e6).toFixed(1), 'MB, code', (fs.statSync(path.join(DIST, 'game.js')).size / 1e6).toFixed(1), 'MB, fonts', (Object.values(fonts).reduce((a, s) => a + s.length, 0) * 0.75 / 1e6).toFixed(1), 'MB');
