// Builds the model + texture viewer as ONE self-contained file: dist-viewer/photo-town-library.html.
//   node tools/build_viewer.mjs
// Every texture in assets/textures is packed (the viewer's texture page shows them all), and every model file is
// bundled. Same recipe as build_phone.mjs.
import { build } from './node/node_modules/esbuild/lib/main.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), DIST = path.join(ROOT, 'dist-viewer'), TEX = path.join(ROOT, 'assets/textures');
fs.rmSync(DIST, { recursive: true, force: true }); fs.mkdirSync(path.join(DIST, 'packs'), { recursive: true });
execFileSync('python3', [path.join(ROOT, 'tools/list_textures.py')], { cwd: ROOT, stdio: 'inherit' });
const listFile = path.join(DIST, 'textures.json'); fs.writeFileSync(listFile, JSON.stringify(fs.readdirSync(TEX)));
execFileSync('python3', [path.join(ROOT, 'tools/pack_textures.py'), TEX, path.join(DIST, 'packs'), listFile], { stdio: 'inherit' });
const threePlugin = { name: 'three', setup(b) {
  b.onResolve({ filter: /^three$/ }, () => ({ path: path.join(ROOT, 'vendor/three/three.module.js') }));
  b.onResolve({ filter: /^three\/addons\// }, (a) => ({ path: path.join(ROOT, 'vendor/three/addons', a.path.slice('three/addons/'.length)) })); } };
const vhtml = fs.readFileSync(path.join(ROOT, 'viewer.html'), 'utf8');
const vsrc = vhtml.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/for \(const p of \['\.\/src\/materials\.js', '\.\/src\/world\/materials\.js'\]\)/, "for (const p of ['./src/materials.js'])").replace('const m = await import(p);', "const m = await import('./src/materials.js');");
const ventry = path.join(ROOT, '.viewer-entry.js'); fs.writeFileSync(ventry, vsrc);
try { await build({ bundle: true, format: 'esm', target: 'es2022', minifyWhitespace: true, minifySyntax: true, legalComments: 'none', plugins: [threePlugin], logLevel: 'warning', entryPoints: [ventry], outfile: path.join(DIST, 'viewer.js') }); } finally { fs.rmSync(ventry, { force: true }); }
const boot = fs.readFileSync(path.join(ROOT, 'tools/boot.js'), 'utf8'), idx = JSON.parse(fs.readFileSync(path.join(DIST, 'packs/packs.json'), 'utf8')), b64 = (f) => fs.readFileSync(f).toString('base64');
const fonts = {}; for (const f of fs.readdirSync(path.join(ROOT, 'assets/fonts'))) fonts[f] = b64(path.join(ROOT, 'assets/fonts', f));
let data = `<script>window.__packIndex=${JSON.stringify(idx)};window.__fonts=${JSON.stringify(fonts)};window.__fontURL=function(f){return window.__fonts[f]?'data:font/woff2;base64,'+window.__fonts[f]:'assets/fonts/'+f;};</script>\n`;
idx.packs.forEach((n, i) => { data += `<script type="text/plain" id="pk${i}">${b64(path.join(DIST, `packs/pack${i}.wasm`))}</script>\n`; });
data += `<script type="text/plain" id="gamecode">${b64(path.join(DIST, 'viewer.js'))}</script>\n`;
const html = vhtml.replace(/<script type="importmap">[\s\S]*?<\/script>/, '').replace(/<script type="module">[\s\S]*?<\/script>/, () => `${data}<script>${boot}\nwindow.__boot('./viewer.js');</script>`);
if (!html.includes('__boot(')) throw new Error('page script not found');
const out = path.join(DIST, 'photo-town-library.html'); fs.writeFileSync(out, html);
console.log('viewer single file:', out, (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
