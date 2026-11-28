// The owner's PSX utilities pack, detailed by hand (owner: "get up in there"). The models are very low-poly blocks,
// so the detail is built two ways, library textures only: (1) a fitted skin per prop, a library texture painted over
// with what the real thing has (ribs, seams, stencils, stickers, rust running from the joints, scuffs), mapped round
// the object ('cyl') or onto each side ('fit'), not tiled; (2) modelled parts added on: hoops, lids, caps, handles,
// hinges, valves. Every model also gets grime from objDress (darker toward the ground). Names are made up.
import { THREE, objDress } from './psx_kit.js';
import { E } from './psx_auto.js';
import { P, M, T, glass, text } from './fill_kit.js';
import { canvasT } from './kit.js';
import { whenImages } from './texmix.js';

const F = (n) => 'px_o_utilities_' + n;
let SEED = 1; const rnd = () => ((SEED = (SEED * 16807) % 2147483647) / 2147483647);
// a skin: base colour, a library texture worked into it, then the drawn details (drawn again once the texture is in)
function skin(base, col, draw, { w = 512, h = 512, rep = 2, rough = 0.6, metal = 0.15, seed = 3, mix = 0.55 } = {}) {
  let img = null; const go = (x, W, H) => { SEED = seed; x.fillStyle = col; x.fillRect(0, 0, W, H);
    if (img) { x.globalAlpha = mix; x.globalCompositeOperation = 'multiply'; for (let i = 0; i < rep; i++) for (let j = 0; j < rep; j++) x.drawImage(img, i * W / rep, j * H / rep, W / rep, H / rep); x.globalCompositeOperation = 'overlay'; x.globalAlpha = 0.3; for (let i = 0; i < rep; i++) for (let j = 0; j < rep; j++) x.drawImage(img, i * W / rep, j * H / rep, W / rep, H / rep); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
    draw(x, W, H); scuffs(x, W, H, 60); };
  const t = canvasT(w, h, go), m = new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: metal });
  if (base) whenImages([base], ([i]) => { img = i; go(t.image.getContext('2d'), w, h); t.needsUpdate = true; }); return m; }
// ---- drawing helpers
function scuffs(x, W, H, n) { x.save(); for (let i = 0; i < n; i++) { x.strokeStyle = rnd() < 0.6 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)'; x.lineWidth = 1 + rnd() * 1.5; const sx = rnd() * W, sy = rnd() * H, a = rnd() * Math.PI, l = 6 + rnd() * 30; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); } x.restore(); }
function drips(x, W, y0, n, col = '90,50,24', len = 0.35, H = 512) { x.save(); for (let i = 0; i < n; i++) { const dx = rnd() * W, l = H * len * (0.4 + rnd()), wd = 2 + rnd() * 7, g = x.createLinearGradient(0, y0, 0, y0 + l); g.addColorStop(0, `rgba(${col},0.75)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(dx, y0, wd, l); } x.restore(); }
function stencil(x, s, cx, cy, size, col = '#e8e2d0', font = 'Arial') { text(x, s, cx, cy, `900 ${size}px ${font}`, col); wear(x, cx - size * s.length * 0.32, cy - size * 0.55, size * s.length * 0.64, size * 1.1, 0.5); }
function wear(x, x0, y0, w, h, k) { x.save(); for (let i = 0; i < w * h * 0.004 * k; i++) { x.fillStyle = `rgba(80,70,60,${0.25 + rnd() * 0.4})`; x.fillRect(x0 + rnd() * w, y0 + rnd() * h, 1 + rnd() * 3, 1 + rnd() * 2); } x.restore(); }
function sticker(x, cx, cy, w, h, rot, draw) { x.save(); x.translate(cx, cy); x.rotate(rot); x.translate(-w / 2, -h / 2); draw(x, w, h); x.fillStyle = 'rgba(200,190,170,0.5)'; for (const [a, b] of [[0, 0], [w - 10, h - 10]]) x.fillRect(a, b, 10, 10); wear(x, 0, 0, w, h, 0.6); x.restore(); }
const hazard = (sym, bg = '#e8b81e') => (x, w, h) => { x.fillStyle = bg; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w, h / 2); x.lineTo(w / 2, h); x.lineTo(0, h / 2); x.closePath(); x.fill(); x.strokeStyle = '#1a1a1a'; x.lineWidth = 4; x.stroke(); text(x, sym, w / 2, h / 2, `900 ${Math.round(h * 0.34)}px Arial`, '#1a1a1a'); };
const rib = (x, W, y, hgt, light = 'rgba(255,255,255,0.22)', dark = 'rgba(0,0,0,0.45)') => { x.fillStyle = dark; x.fillRect(0, y + hgt * 0.55, W, hgt * 0.45); x.fillStyle = light; x.fillRect(0, y, W, hgt * 0.45); };
const Y = (H, hy) => (1 - hy) * H;
// ---- modelled-part helpers (models are settled: centred on x/z, standing on y = 0)
const box = (g) => new THREE.Box3().setFromObject(g);
function ring(g, y, r, t, m, seg = 8) { const o = new THREE.Mesh(new THREE.TorusGeometry(r, t, 5, seg), m); o.rotation.x = Math.PI / 2; o.rotation.z = Math.PI / seg; o.position.y = y; o.castShadow = true; g.add(o); return o; }
function cyl(g, r, h, m, x, y, z, seg = 10, rx = 0, rz = 0) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; g.add(o); return o; }
function cube(g, w, h, d, m, x, y, z) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; }
const steelDark = () => P('#3a3c40', { roughness: 0.5, metalness: 0.6 }), chrome = () => P('#c8ccd0', { roughness: 0.22, metalness: 0.8 }), rust = () => M.rust(), rubber = () => P('#1c1c1e', { roughness: 0.9 });

// ---- barrels: 8-sided drums. Rolling hoops drawn and modelled, a lid rim with two bungs, stencil + hazard sticker, rust from the hoops
function barrelSkin(col, label, sym, symBg, seed) { return skin('g132_rustpaint', col, (x, W, H) => {
  for (const hy of [0.33, 0.66]) rib(x, W, Y(H, hy) - 10, 20); rib(x, W, 0, 14); rib(x, W, H - 16, 16);
  drips(x, W, Y(H, 0.66) + 10, 8, '110,52,20', 0.25); drips(x, W, Y(H, 0.33) + 10, 10, '110,52,20', 0.3); drips(x, W, 14, 6, '110,52,20', 0.15);
  stencil(x, label, W * 0.25, Y(H, 0.5), 38); stencil(x, 'ELM CHEMICAL CO.', W * 0.25, Y(H, 0.43), 16, '#d8d2c0');
  if (sym) sticker(x, W * 0.75, Y(H, 0.5), 110, 110, 0.06, hazard(sym, symBg));
  x.fillStyle = 'rgba(30,20,10,0.35)'; x.fillRect(0, Y(H, 0.12), W, H); }, { rep: 2, seed, rough: 0.55, metal: 0.25 }); }
const BARREL = (n, col, label, sym, symBg, seed) => async () => { const g = await objDress(F(n), { side: barrelSkin(col, label, sym, symBg, seed), top: skin('g132_rustpaint', col, (x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.arc(W / 2, H / 2, W * 0.42, 0, 7); x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,0.4)'; x.stroke(); drips(x, W, H * 0.3, 4); }, { seed: seed + 1 }) },
    (q) => (Math.abs(q.n.y) > 0.7 ? 'top' : 'side'), { uv: { side: 'cyl', top: 'fit' } });
  const b = box(g), r = (b.max.x - b.min.x) / 2, H = b.max.y, hm = P(col, { roughness: 0.5, metalness: 0.3 });
  ring(g, H - 0.01, r * 0.9, 0.02, hm);
  cyl(g, 0.035, 0.03, steelDark(), r * 0.5, H + 0.012, 0); cyl(g, 0.022, 0.03, steelDark(), -r * 0.55, H + 0.012, r * 0.1); return g; };
export const makePxBarrel01 = BARREL('barrel01', '#2a4a7a', 'TREATED WATER', null, null, 11);
export const makePxBarrel02 = BARREL('barrel02', '#9a2a1e', 'SOLVENT', 'FIRE', '#c8281e', 23);
export const makePxBarrel03 = BARREL('barrel03', '#4e6e3e', 'DRAIN CLEAR', 'ACID', '#e8e4d8', 37);
// a wooden barrel: staves (each a slightly different plank), two iron hoops each end, a lid of boards
export async function makePxBarrelWood01() { const g = await objDress(F('barrelwood01'), { side: skin('wd_plank_b', '#8a6440', (x, W, H) => { for (let i = 0; i < 16; i++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,240,220'},${0.05 + rnd() * 0.1})`; x.fillRect(i * W / 16, 0, W / 16, H); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(i * W / 16, 0, 2, H); }
      for (const hy of [0.1, 0.22, 0.78, 0.9]) { x.fillStyle = '#2a2420'; x.fillRect(0, Y(H, hy) - 9, W, 18); drips(x, W, Y(H, hy) + 9, 6, '80,40,18', 0.12); } stencil(x, 'ELM CIDER', W * 0.3, Y(H, 0.5), 30, '#2a1a10'); }, { rep: 1, seed: 5, rough: 0.85, metal: 0 }),
    top: skin('wd_plank_b', '#7a5838', (x, W, H) => { for (let i = 1; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(i * W / 6, 0, 3, H); } }, { seed: 6, rough: 0.9 }) }, (q) => (Math.abs(q.n.y) > 0.7 ? 'top' : 'side'), { uv: { side: 'cyl', top: 'fit' } });
  const b = box(g), r = (b.max.x - b.min.x) / 2, H = b.max.y; for (const [hy, k] of [[0.1, 0.96], [0.22, 1.0], [0.78, 1.0], [0.9, 0.96]]) ring(g, H * hy, r * k * 1.01, 0.015, rust(), 10); return g; }
// ---- the jerry can: olive drab, pressed X on each side, a weld seam all round, three handle bars, spout with clamp
export async function makePxJerryCan01() { const col = '#46502e';
  const sideSkin = skin('g132_rustpaint', col, (x, W, H) => { const L = 'rgba(255,255,230,0.16)', D = 'rgba(0,0,0,0.38)';
      for (const [c, o] of [[D, 4], [L, -2]]) { x.strokeStyle = c; x.lineWidth = 16; x.beginPath(); x.moveTo(W * 0.12 + o, H * 0.18); x.lineTo(W * 0.88 + o, H * 0.86); x.moveTo(W * 0.88 + o, H * 0.18); x.lineTo(W * 0.12 + o, H * 0.86); x.stroke(); x.strokeRect(W * 0.08 + o, H * 0.12, W * 0.84, H * 0.8); }
      x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(W * 0.49, 0, W * 0.02, H);   // the weld seam
      stencil(x, 'FUEL 20L', W * 0.5, H * 0.52, 44, '#d8d4c0'); stencil(x, 'ELM DEPOT 1987', W * 0.5, H * 0.95, 18, '#c8c4b0'); drips(x, W, H * 0.12, 5, '60,40,20', 0.2); }, { rep: 1, seed: 9, rough: 0.55, metal: 0.2 });
  const g = await objDress(F('jerrycan01'), { side: sideSkin, rest: skin('g132_rustpaint', col, (x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(W * 0.49, 0, W * 0.02, H); }, { seed: 10 }) },
    (q) => (Math.abs(q.n.z) > 0.75 ? 'side' : 'rest'), { uv: { side: 'fit', rest: 'fit' } });
  const b = box(g), H = b.max.y, W = b.max.x - b.min.x, m = P(col, { roughness: 0.5, metalness: 0.3 }), x0 = b.min.x + W * 0.38;
  for (const k of [-0.16, 0, 0.16]) cyl(g, 0.014, 0.1, m, x0 + k * W, H + 0.03, 0, 6); cyl(g, 0.012, W * 0.42, m, x0, H + 0.08, 0, 6, 0, Math.PI / 2);
  cyl(g, 0.045, 0.07, m, b.max.x - 0.08, H - 0.02, 0, 10, 0, 0.6); cyl(g, 0.05, 0.03, steelDark(), b.max.x - 0.06, H + 0.01, 0, 10, 0, 0.6); cube(g, 0.12, 0.06, 0.02, steelDark(), b.max.x - 0.13, H, 0.04); return g; }
// ---- crates: planks with gaps, cross braces, nail heads, stencils, metal corners
const crateSkin = (seed, words) => skin('wd_plank_b', '#9a7650', (x, W, H) => { const n = 5; for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,240,210'},${0.06 + rnd() * 0.08})`; x.fillRect(0, i * H / n, W, H / n); x.fillStyle = 'rgba(20,12,6,0.75)'; x.fillRect(0, i * H / n, W, 4); }
  x.fillStyle = 'rgba(70,46,26,0.9)'; x.save(); x.translate(W / 2, H / 2); x.rotate(Math.atan2(H, W)); x.fillRect(-W * 0.7, -14, W * 1.4, 28); x.restore(); for (const [a, b] of [[0, 0], [W - 30, 0], [0, H - 30], [W - 30, H - 30]]) { x.fillStyle = '#5a3a20'; x.fillRect(a, b, 30, 30); }
  x.fillStyle = '#2a2a2a'; for (let i = 0; i < n + 1; i++) for (const cx of [14, W - 14]) { x.beginPath(); x.arc(cx, i * H / n + 10, 3, 0, 7); x.fill(); }
  if (words) { stencil(x, words[0], W / 2, H * 0.44, 40, '#2a1a12'); if (words[1]) stencil(x, words[1], W / 2, H * 0.62, 22, '#2a1a12'); } }, { rep: 1, seed, rough: 0.85, metal: 0 });
const CRATE = (n, words, seed) => async () => { const g = await objDress(F(n), { s: crateSkin(seed, words), t: crateSkin(seed + 1, null) }, (q) => (q.n.y > 0.7 ? 't' : 's'), { uv: { s: 'fit', t: 'fit' } });
  const b = box(g), m = P('#6a6c70', { roughness: 0.45, metalness: 0.7 }), k = 0.04; for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]) for (const y of [k / 2, b.max.y - k / 2]) cube(g, k, k, k, m, x, y, z); return g; };
export const makePxCrate01 = CRATE('crate01', ['ELM HARDWARE', 'THIS SIDE UP'], 41), makePxCrate02 = CRATE('crate02', ['FRAGILE', 'GLASS — HANDLE WITH CARE'], 43), makePxCrate03a = CRATE('crate03a', ['NO. 7'], 45), makePxCrate03b = CRATE('crate03b', ['SEED'], 47);
// ---- fuse boxes: grey door outline, hinges, lock, lightning sticker, rating plate, a rust run; a handle and hinges modelled
const fuseSkin = (seed) => skin('g132_rustpaint', '#8a8e90', (x, W, H) => { x.strokeStyle = 'rgba(0,0,0,0.55)'; x.lineWidth = 6; x.strokeRect(W * 0.06, H * 0.05, W * 0.88, H * 0.9);
  sticker(x, W * 0.5, H * 0.28, 120, 120, -0.03, (q, w, h) => { q.fillStyle = '#e8c41e'; q.beginPath(); q.moveTo(w / 2, 4); q.lineTo(w - 4, h - 4); q.lineTo(4, h - 4); q.closePath(); q.fill(); q.strokeStyle = '#111'; q.lineWidth = 6; q.stroke(); text(q, '⚡', w / 2, h * 0.64, `900 ${h * 0.45}px Arial`, '#111'); });
  x.fillStyle = '#d8d4c8'; x.fillRect(W * 0.3, H * 0.55, W * 0.4, H * 0.12); text(x, 'DANGER  480V', W * 0.5, H * 0.585, 'bold 22px Arial', '#c8281e'); text(x, 'KEEP OUT', W * 0.5, H * 0.635, 'bold 18px Arial', '#1a1a1a');
  drips(x, W, H * 0.05, 7, '120,60,24', 0.4); x.fillStyle = '#1a1a1a'; x.fillRect(W * 0.86, H * 0.45, 10, 40); }, { rep: 1, seed, rough: 0.6, metal: 0.3 });
const FUSE = (n, seed) => async () => { const g = await objDress(F(n), { f: fuseSkin(seed), r: skin('g132_rustpaint', '#8a8e90', (x, W, H) => drips(x, W, 0, 6, '120,60,24', 0.3), { seed: seed + 1 }) }, (q) => (q.n.z > 0.75 ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit' } });
  const b = box(g); cube(g, 0.03, 0.14, 0.03, steelDark(), b.max.x * 0.72, b.max.y * 0.55, b.max.z + 0.015); for (const y of [0.2, 0.8]) cube(g, 0.025, 0.08, 0.02, steelDark(), b.min.x + 0.04, b.max.y * y, b.max.z + 0.01); return g; };
export const makePxFusebox01 = FUSE('fusebox01', 51), makePxFusebox02 = FUSE('fusebox02', 53);
// ---- lockers: two doors, vent louvres, number plates, handles; a padlock on one
export async function makePxLocker01() { const g = await objDress(F('locker01'), { f: skin('g132_rustpaint', '#5a6a60', (x, W, H) => { for (let d = 0; d < 2; d++) { const x0 = d * W / 2 + 10; x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 5; x.strokeRect(x0, 10, W / 2 - 20, H - 20);
        for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,0.65)'; x.fillRect(x0 + W * 0.08, 40 + i * 18, W * 0.3, 7); x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(x0 + W * 0.08, 47 + i * 18, W * 0.3, 3); }
        x.fillStyle = '#c8c4b0'; x.fillRect(x0 + W * 0.17, 175, 50, 26); text(x, String(14 + d), x0 + W * 0.17 + 25, 189, 'bold 20px Arial', '#1a1a1a'); x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(x0 + W / 2 - 50, H * 0.5, 10, 50); }
      drips(x, W, H * 0.92, 6, '90,50,24', 0.08); }, { rep: 1, seed: 61, rough: 0.6, metal: 0.3 }), r: skin('g132_rustpaint', '#5a6a60', () => {}, { seed: 62 }) }, (q) => (q.n.z > 0.75 ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit' } });
  const b = box(g); for (const x of [-0.1, 0.62]) cube(g, 0.025, 0.12, 0.03, chrome(), b.min.x + (b.max.x - b.min.x) * (0.5 + x * 0.5) - 0.06, b.max.y * 0.5, b.max.z + 0.015);
  const lk = cube(g, 0.05, 0.06, 0.02, P('#b89030', { metalness: 0.7, roughness: 0.3 }), b.max.x * 0.3, b.max.y * 0.47, b.max.z + 0.03); return g; }
// ---- trash containers: green, ELM SANITATION stencil, NO HOT ASHES sticker, drips, darker lid
const binSkin = (seed) => skin('g132_rustpaint', '#3a5a3a', (x, W, H) => { rib(x, W, H * 0.16, 16); stencil(x, 'ELM SANITATION', W * 0.5, H * 0.42, 40); stencil(x, 'DEPT. 4', W * 0.5, H * 0.52, 22);
  sticker(x, W * 0.78, H * 0.68, 130, 70, 0.04, (q, w, h) => { q.fillStyle = '#f0ece0'; q.fillRect(0, 0, w, h); q.fillStyle = '#c8281e'; q.fillRect(0, 0, w, 18); text(q, 'NO HOT ASHES', w / 2, 40, 'bold 15px Arial', '#1a1a1a'); text(q, 'no paint · no tyres', w / 2, 58, '11px Arial', '#3a3a3a'); });
  drips(x, W, H * 0.18, 10, '80,60,30', 0.4); drips(x, W, H * 0.55, 8, '60,40,20', 0.4); }, { rep: 1, seed, rough: 0.65, metal: 0.2 });
const BIN = (n, seed) => () => objDress(F(n), { f: binSkin(seed), r: skin('g132_rustpaint', '#3a5a3a', (x, W, H) => drips(x, W, H * 0.2, 9, '80,60,30', 0.5), { seed: seed + 1 }), lid: skin('g132_rustpaint', '#2a3a2a', (x, W, H) => { for (let i = 1; i < 6; i++) rib(x, W, i * H / 6, 10); }, { seed: seed + 2 }), rubber: rubber() },
  (q) => (/wheel/i.test(q.obj) ? 'rubber' : /lid/i.test(q.obj) || q.n.y > 0.5 ? 'lid' : Math.abs(q.n.z) > Math.abs(q.n.x) ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit', lid: 'fit' } });
export const makePxTrashContainer01 = BIN('trashcontainer01', 71), makePxTrashContainer02 = BIN('trashcontainer02', 73);
// ---- toolbox: red, chipped to the steel at the edges, latch, made-up maker's badge; black handle
export async function makePxToolbox01() { const g = await objDress(F('toolbox01'), { b: skin('g132_rustpaint', '#a8241c', (x, W, H) => { x.strokeStyle = 'rgba(180,180,180,0.5)'; x.lineWidth = 3; for (let i = 0; i < 40; i++) { const sx = rnd() < 0.5 ? rnd() * 20 : W - rnd() * 20; x.beginPath(); x.moveTo(sx, rnd() * H); x.lineTo(sx + 6, rnd() * H); x.stroke(); }
      x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, H * 0.32, W, 4); x.fillStyle = '#c8ccd0'; x.fillRect(W * 0.45, H * 0.28, W * 0.1, H * 0.12); x.fillStyle = '#e8e4d8'; x.fillRect(W * 0.32, H * 0.55, W * 0.36, H * 0.12); text(x, 'TRUE-GRIP', W * 0.5, H * 0.61, '900 26px Arial', '#a8241c'); }, { rep: 1, seed: 81, rough: 0.45, metal: 0.25 }), h: rubber() },
    (q) => (q.c.y > q.b.max.y - (q.b.max.y - q.b.min.y) * 0.16 && Math.abs(q.c.x - (q.b.min.x + q.b.max.x) / 2) < 0.06 ? 'h' : 'b'), { uv: { b: 'fit' } }); return g; }
// ---- postbox: blue, ELM COUNTY MAIL, slot, collection times
export const makePxPostbox01 = () => objDress(F('postbox01'), { f: skin('g132_rustpaint', '#24407a', (x, W, H) => { x.fillStyle = '#111'; x.fillRect(W * 0.2, H * 0.22, W * 0.6, H * 0.05); x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(W * 0.2, H * 0.27, W * 0.6, 4); stencil(x, 'ELM COUNTY', W * 0.5, H * 0.38, 40); stencil(x, 'MAIL', W * 0.5, H * 0.46, 44);
    x.fillStyle = '#e8e4d8'; x.fillRect(W * 0.28, H * 0.56, W * 0.44, H * 0.14); text(x, 'COLLECTION', W * 0.5, H * 0.59, 'bold 18px Arial', '#1a1a1a'); text(x, 'MON–FRI  4 PM', W * 0.5, H * 0.63, '16px Arial', '#1a1a1a'); text(x, 'SAT  noon', W * 0.5, H * 0.67, '16px Arial', '#1a1a1a'); drips(x, W, H * 0.03, 5, '90,60,30', 0.2); }, { rep: 1, seed: 91, rough: 0.5, metal: 0.25 }),
  r: skin('g132_rustpaint', '#24407a', (x, W, H) => drips(x, W, 0, 4, '90,60,30', 0.25), { seed: 92 }) }, (q) => (q.n.z > 0.75 ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit' } });
// ---- radiator: drawn columns with light and shade, a valve modelled
export async function makePxRadiator01() { const g = await objDress(F('radiator01'), { f: skin('g132_rustpaint', '#e4e0d4', (x, W, H) => { const n = 18; for (let i = 0; i < n; i++) { const x0 = i * W / n, g2 = x.createLinearGradient(x0, 0, x0 + W / n, 0); g2.addColorStop(0, 'rgba(0,0,0,0.3)'); g2.addColorStop(0.4, 'rgba(255,255,255,0.15)'); g2.addColorStop(1, 'rgba(0,0,0,0.35)'); x.fillStyle = g2; x.fillRect(x0, H * 0.06, W / n, H * 0.88); }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, W, H * 0.06); x.fillRect(0, H * 0.94, W, H * 0.06); drips(x, W, H * 0.9, 6, '120,70,30', 0.08); }, { rep: 1, seed: 95, rough: 0.5, metal: 0.2 }), r: skin('g132_rustpaint', '#e4e0d4', () => {}, { seed: 96 }) }, (q) => (Math.abs(q.n.z) > 0.75 ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit' } });
  const b = box(g); cyl(g, 0.03, 0.12, chrome(), b.max.x + 0.05, 0.12, 0, 8, 0, Math.PI / 2); cyl(g, 0.045, 0.03, P('#c8281e', { roughness: 0.5 }), b.max.x + 0.12, 0.12, 0, 10, 0, Math.PI / 2); return g; }
// ---- parcel lockers: a grid of small numbered doors, a screen, ELM PARCEL HUB header
export const makePxParcelDropOffStation01 = () => objDress(F('parceldropoffstation01'), { f: skin('g132_rustpaint', '#d8a81e', (x, W, H) => { x.fillStyle = '#1a1a1a'; x.fillRect(0, 0, W, H * 0.16); text(x, 'ELM PARCEL HUB', W * 0.5, H * 0.08, '900 46px Arial', '#e8b81e');
    let k = 1; for (let c = 0; c < 10; c++) for (let r = 0; r < 4; r++) { if (c === 4 && r < 3) continue; const x0 = c * W / 10 + 6, y0 = H * 0.2 + r * H * 0.2; x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 3; x.strokeRect(x0, y0, W / 10 - 12, H * 0.2 - 8); text(x, String(k++), x0 + 14, y0 + 14, 'bold 12px Arial', '#2a2a2a'); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(x0 + W / 10 - 26, y0 + H * 0.08, 6, 18); }
    x.fillStyle = '#0a1a24'; x.fillRect(W * 0.41, H * 0.24, W * 0.18, H * 0.2); text(x, 'TAP TO COLLECT', W * 0.5, H * 0.33, 'bold 13px Arial', '#5ad8f8'); }, { w: 1024, h: 512, rep: 1, seed: 99, rough: 0.5, metal: 0.25 }), r: skin('g132_rustpaint', '#d8a81e', () => {}, { seed: 100 }) },
  (q) => (q.n.z > 0.75 ? 'f' : 'r'), { uv: { f: 'fit', r: 'fit' } });
// ---- ducts and pipes: seams and rivet lines on galvanised sheet; pipes rusty with flange bands and drips
const ductSkin = (seed) => { const m = skin('gf_galv', '#a8acb0', (x, W, H) => { for (const y of [0, H / 2]) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, y, W, 6); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(0, y + 6, W, 3); for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(40,40,40,0.6)'; x.beginPath(); x.arc(i * W / 16 + 16, y + 18, 3, 0, 7); x.fill(); } } drips(x, W, H * 0.5, 4, '60,50,40', 0.2); }, { rep: 1, seed, rough: 0.45, metal: 0.55 }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; return m; };
const DUCT = (n, seed) => () => objDress(F(n), { d: ductSkin(seed) }, () => 'd', { tile: 2 });
export const makePxMAirDuctCurve4501 = DUCT('mairductcurve45_01', 111), makePxMAirDuctCurve9001 = DUCT('mairductcurve90_01', 113), makePxMAirDuctDiagonal01 = DUCT('mairductdiagonal01', 115), makePxMAirDuctStraight01 = DUCT('mairductstraight01', 117);
const pipeSkin = (seed) => { const m = skin('b84_rust', '#6a4a36', (x, W, H) => { for (const y of [0.1, 0.6]) { x.fillStyle = '#3a3c40'; x.fillRect(0, y * H, W, H * 0.06); } drips(x, W, H * 0.16, 8, '140,70,24', 0.4); }, { rep: 1, seed, rough: 0.8, metal: 0.35 }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; return m; };
const PIPE = (n, seed) => () => objDress(F(n), { p: pipeSkin(seed) }, () => 'p', { tile: 1.2 });
export const makePxPipe01Curve180 = PIPE('pipe01curve180', 121), makePxPipe01StraightLong = PIPE('pipe01straightlong', 123), makePxPipe01StraightShort = PIPE('pipe01straightshort', 125);
// ---- pallet: slats with gaps on top, stringer blocks on the sides
export const makePxPalette01 = () => objDress(F('palette01'), { t: skin('wd_plank_b', '#a8885a', (x, W, H) => { for (let i = 0; i < 7; i++) { x.fillStyle = 'rgba(20,14,8,0.85)'; x.fillRect(0, i * H / 7 + H / 7 - 16, W, 16); x.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`; x.fillRect(0, i * H / 7, W, H / 7 - 16); } stencil(x, 'EPAL', W * 0.15, H * 0.5, 22, '#3a2a18'); }, { rep: 1, seed: 131, rough: 0.9, metal: 0 }),
  s: skin('wd_plank_b', '#9a7a50', (x, W, H) => { x.fillStyle = 'rgba(12,8,4,0.9)'; for (const x0 of [0.18, 0.62]) x.fillRect(x0 * W, H * 0.25, W * 0.2, H * 0.55); }, { rep: 1, seed: 132, rough: 0.9 }) }, (q) => (q.n.y > 0.7 ? 't' : 's'), { uv: { t: 'fit', s: 'fit' } });
// ---- sink, toilet, storage box, wet floor sign
export async function makePxSink01() { const g = await objDress(F('sink01'), { c: P('#eceae4', { roughness: 0.12 }), f: P('#c8ccd0', { roughness: 0.2, metalness: 0.8 }) }, (q) => (/faucet/i.test(q.obj) ? 'f' : 'c'), {});
  const b = box(g), d = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), P('#2a2a2a', { metalness: 0.6 })); d.rotation.x = -Math.PI / 2; d.position.set(0, b.max.y * 0.8, 0); g.add(d); return g; }
export const makePxToilet01 = () => objDress(F('toilet01'), { c: P('#eceae4', { roughness: 0.12 }), lid: P('#e4e0d4', { roughness: 0.3 }) }, (q) => (/lid/i.test(q.obj) ? 'lid' : 'c'), {});
export const makePxStorageBoxPlastic01 = () => objDress(F('storageboxplastic01'), { b: skin(null, '#c8d0d8', (x, W, H) => { for (let i = 1; i < 8; i++) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(i * W / 8, 0, 5, H); } x.fillStyle = '#f4f2ea'; x.fillRect(W * 0.3, H * 0.4, W * 0.4, H * 0.18); text(x, 'XMAS', W * 0.5, H * 0.49, 'bold 30px Arial', '#2a2a2a'); }, { rep: 1, seed: 141, rough: 0.4 }) }, () => 'b', { uv: { b: 'fit' } });
export const makePxSignWetFloor01 = () => objDress(F('signwetfloor01'), { b: skin(null, '#e8c41e', (x, W, H) => { text(x, 'CAUTION', W * 0.5, H * 0.3, '900 52px Arial', '#1a1a1a'); x.strokeStyle = '#1a1a1a'; x.lineWidth = 8; x.beginPath(); x.moveTo(W * 0.5, H * 0.38); x.lineTo(W * 0.7, H * 0.68); x.lineTo(W * 0.3, H * 0.68); x.closePath(); x.stroke(); text(x, 'WET FLOOR', W * 0.5, H * 0.8, '900 40px Arial', '#1a1a1a'); }, { rep: 1, seed: 151, rough: 0.4 }) }, () => 'b', { uv: { b: 'fit' } });
// ---- bucket: galvanised with dents, a rim, steel handle, dirty water inside
export async function makePxBucket01() { const g = await objDress(F('bucket01'), { b: skin('gf_galv', '#9a9ea2', (x, W, H) => { rib(x, W, 0, 18); rib(x, W, H * 0.5, 10); for (let i = 0; i < 6; i++) { const gx = rnd() * W, gy = rnd() * H, gr = x.createRadialGradient(gx, gy, 0, gx, gy, 30); gr.addColorStop(0, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(gx - 30, gy - 30, 60, 60); } drips(x, W, H * 0.06, 6, '60,50,40', 0.3); }, { rep: 1, seed: 161, rough: 0.4, metal: 0.55 }), h: steelDark() },
    (q) => (/handle/i.test(q.obj) ? 'h' : 'b'), { uv: { b: 'cyl' } });
  const b = box(g), w = new THREE.Mesh(new THREE.CircleGeometry((b.max.x - b.min.x) * 0.34, 10), P('#3a3224', { roughness: 0.05, metalness: 0.3 })); w.rotation.x = -Math.PI / 2; w.position.y = b.max.y * 0.6; g.add(w); return g; }
// ---- left to the rule engine (shapes that read right as they are)
export const makePxBillboard01 = E(F('billboard01'), 'paint:#5a5a5e', { plate: { test: (q, h) => { const s = q.b.getSize(new THREE.Vector3()); return (s.x < s.z ? q.n.x : q.n.z) > 0.8 && h >= 0.45; }, face: { bg: '#e8e0cc', fg: '#1a1a1c', border: '#1a1a1c', lines: [['ELM COUNTY', 0.16, '900'], ['STAY ON THE ROAD', 0.1, 'bold'], ['it is not far now', 0.07, 'italic']] } } });
export const makePxFence03Long = E(F('fence03long'), 'galv', { parts: [[/^fence03$/i, 'net']] }), makePxFence03Medium = E(F('fence03medium'), 'galv', { parts: [[/^fence03$/i, 'net']] }), makePxFence03Short = E(F('fence03short'), 'galv', { parts: [[/^fence03$/i, 'net']] });
export const makePxFence04 = E(F('fence04'), 'oldpaint:#2a3a2c'), makePxFence04Gate = E(F('fence04gate'), 'oldpaint:#2a3a2c');
export const makePxGasPump01 = E(F('gaspump01'), 'paint:#b8281e', { low: 'paint:#e8e6e0' });
export const makePxInfoboard01 = E(F('infoboard01'), 'oldwood', { top: 'tin', plate: { test: (q, h) => { const s = q.b.getSize(new THREE.Vector3()); return (s.x < s.z ? q.n.x : q.n.z) > 0.8 && h >= 0.3 && h <= 0.8; }, face: { bg: '#d8ccb0', fg: '#2a2a2a', lines: [['NOTICES', 0.14, '900'], ['lost: grey cat', 0.08, 'italic'], ['the well is closed', 0.08, 'italic']] } } });
export const makePxShelf01 = E(F('shelf01'), 'galv');
