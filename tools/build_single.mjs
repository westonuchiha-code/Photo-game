// Builds ONE self-contained file: dist/photo-town.html. Everything is inside it (game code, texture packs, fonts),
// so it can be downloaded and opened straight from disk in a browser: no server, no internet.
//   node tools/build_web.mjs && node tools/build_single.mjs
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), DIST = path.join(ROOT, 'dist');
let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const idx = JSON.parse(fs.readFileSync(path.join(DIST, 'packs/packs.json'), 'utf8'));
const b64 = (f) => fs.readFileSync(f).toString('base64');
const fonts = {}; for (const f of fs.readdirSync(path.join(DIST, 'assets/fonts'))) fonts[f] = b64(path.join(DIST, 'assets/fonts', f));
let data = `<script>window.__packIndex=${JSON.stringify(idx)};window.__fonts=${JSON.stringify(fonts)};window.__fontURL=function(f){return window.__fonts[f]?'data:font/woff2;base64,'+window.__fonts[f]:'assets/fonts/'+f;};</script>\n`;
idx.packs.forEach((_, i) => { data += `<script type="text/plain" id="pk${i}">${b64(path.join(DIST, `packs/pack${i}.wasm`))}</script>\n`; });
data += `<script type="text/plain" id="gamecode">${b64(path.join(DIST, 'game.js'))}</script>\n`;
const at = html.lastIndexOf('<script>');   // the boot script is the last inline script
if (at < 0 || !html.slice(at).includes('__boot(')) throw new Error('boot script not found');
html = html.slice(0, at) + data + html.slice(at);
// the model viewer is a second page: not part of the single file
html = html.replace(/<a [^>]*href="viewer\.html"[^>]*>[\s\S]*?<\/a>/g, '');
const out = path.join(DIST, 'photo-town.html'); fs.writeFileSync(out, html);
console.log('single file:', out, (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
