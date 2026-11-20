// Builds the published / downloadable version of Photo Town into dist/ (the repo keeps the full-resolution PNGs and
// the unbundled source as the masters; nothing here changes them).
//   node tools/build_web.mjs [page]     page: 'publish' (tools/publish_page.html, default) or 'index' (index.html)
// What it does:
//   1. every texture -> WebP: photographic colour maps lossy at a high quality, everything where exact values matter
//      (normal maps, alpha cut-outs, small/flat graphics) lossless; packed into a few .bin packs (+ packs.json index)
//   2. the game (src/main.js) and the model viewer bundled into one script each (three.js included)
//   3. a tiny boot script: downloads the packs with a progress bar, then serves every 'assets/textures/...' request
//      (images, texture loads, fetch) from them, so no game code has to change
// Outputs: dist/index.html, dist/viewer.html, dist/game.js, dist/viewer.js, dist/packs/*.wasm, dist/packs/packs.json,
// dist/assets/fonts/* (fonts stay as files: the browser loads them itself)
import { build } from './node/node_modules/esbuild/lib/main.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const page = process.argv[2] === 'index' ? 'index.html' : 'tools/publish_page.html';
fs.rmSync(DIST, { recursive: true, force: true }); fs.mkdirSync(path.join(DIST, 'packs'), { recursive: true });

// 1. textures -> WebP packs (python + Pillow does the encoding)
execFileSync('python3', [path.join(ROOT, 'tools/pack_textures.py'), path.join(ROOT, 'assets/textures'), path.join(DIST, 'packs')], { stdio: 'inherit' });

// 2. bundles. 'three' and 'three/addons/...' resolve to the vendored copy.
const threePlugin = { name: 'three', setup(b) {
  b.onResolve({ filter: /^three$/ }, () => ({ path: path.join(ROOT, 'vendor/three/three.module.js') }));
  b.onResolve({ filter: /^three\/addons\// }, (a) => ({ path: path.join(ROOT, 'vendor/three/addons', a.path.slice('three/addons/'.length)) }));
} };
const common = { bundle: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none', plugins: [threePlugin], logLevel: 'warning' };
await build({ ...common, entryPoints: [path.join(ROOT, 'src/main.js')], outfile: path.join(DIST, 'game.js') });
// the viewer's code lives inline in viewer.html: lift it into a temporary entry next to it so its relative imports work
const vhtml = fs.readFileSync(path.join(ROOT, 'viewer.html'), 'utf8');
const m = vhtml.match(/<script type="module">([\s\S]*?)<\/script>/);
let vsrc = m[1].replace(/for \(const p of \['\.\/src\/materials\.js', '\.\/src\/world\/materials\.js'\]\)/, "for (const p of ['./src/materials.js'])")
  .replace("const m = await import(p);", "const m = await import('./src/materials.js');");
const ventry = path.join(ROOT, '.viewer-entry.js'); fs.writeFileSync(ventry, vsrc);
try { await build({ ...common, entryPoints: [ventry], outfile: path.join(DIST, 'viewer.js') }); } finally { fs.rmSync(ventry, { force: true }); }

// 3. pages: drop the import map, load boot.js inline, then the bundle
const boot = fs.readFileSync(path.join(ROOT, 'tools/boot.js'), 'utf8');
const pageOut = (html, bundle) => html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace(/<script type="module" src="src\/main\.js"><\/script>/, `<script>${boot}\nwindow.__boot('${bundle}');</script>`)
  .replace(/<script type="module">[\s\S]*?<\/script>/, `<script>${boot}\nwindow.__boot('${bundle}');</script>`);
// the publish page is a fragment (the artifact host adds the document skeleton); give it a full one so it also works served as-is
let main = fs.readFileSync(path.join(ROOT, page), 'utf8');
if (!/<body/i.test(main)) fs.writeFileSync(path.join(DIST, 'publish.html'), pageOut(main, './game.js'));   // fragment for the artifact host
if (!/<body/i.test(main)) { const t = (main.match(/<title>[\s\S]*?<\/title>/) || [''])[0]; main = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">\n${t}\n</head>\n<body>\n${main.replace(t, '')}\n</body>\n</html>\n`; }
fs.writeFileSync(path.join(DIST, 'index.html'), pageOut(main, './game.js'));
fs.writeFileSync(path.join(DIST, 'viewer.html'), pageOut(vhtml, './viewer.js'));
fs.cpSync(path.join(ROOT, 'assets/fonts'), path.join(DIST, 'assets/fonts'), { recursive: true });
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(DIST);
const mb = files.reduce((s, f) => s + fs.statSync(f).size, 0) / 1e6;
console.log(`dist: ${files.length} files, ${mb.toFixed(1)} MB`);
