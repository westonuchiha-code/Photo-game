// Batch 82 (photos/batch82/): the texture library (tools/tex_82.py) as materials, plus the objects from the batch.
//   libMat82(name, rx, ry, extra), makeTreadToolbox, makeTreadRamp, makeScrewdriver, makeKnobCabinet, makeStickerCase,
//   makeComicStack, makePrimedCanvases
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1, srgb = true) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const NORMALS = new Set(['b82_blueplastic', 'b82_chenille', 'b82_oak', 'b82_rust', 'b82_impasto', 'b82_tread_purple', 'b82_tread_maroon']);
// a material from the batch-82 library; tread plate is metallic, the rest matte
export function libMat82(name, rx = 1, ry = 1, extra = {}) {
  const o = { map: tex(name, rx, ry), roughness: 0.7, ...extra };
  if (NORMALS.has(name)) { o.normalMap = tex(name + '_n', rx, ry, false); o.normalScale = new THREE.Vector2(1, 1); }
  if (name.startsWith('b82_tread')) { o.metalness = 0.75; o.roughness = 0.35; }
  return std(o);
}
// tread-plate toolbox: a crossover truck-box shape (sloped front lid), the maroon finish, two T-handle locks
export function makeTreadToolbox(finish = 'b82_tread_maroon') {
  const g = new THREE.Group(); g.name = 'tread_toolbox'; const W = 0.8, D = 0.42, H = 0.32;
  const m = libMat82(finish, W / 0.4, H / 0.4), lid = libMat82(finish, W / 0.4, D / 0.4);
  box(W, H, D, m, 0, H / 2, 0, g); const l = box(W + 0.02, 0.02, D + 0.03, lid, 0, H + 0.01, 0, g); void l;
  for (const s of [-1, 1]) { cyl(0.018, 0.018, 0.03, std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.25 }), s * 0.25, H - 0.06, D / 2 + 0.015, g, 14).rotation.x = Math.PI / 2; box(0.06, 0.012, 0.012, std({ color: '#c8ccd0', metalness: 0.9 }), s * 0.25, H - 0.06, D / 2 + 0.035, g); }
  for (const s of [-1, 1]) box(0.12, 0.025, 0.04, std({ color: '#1a1a1a' }), s * (W / 2 + 0.01), H - 0.03, 0, g).rotation.y = Math.PI / 2;
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
// a tread-plate ramp: a plank of plate from the ground up to a deck, with side lips + two little legs at the top
export function makeTreadRamp(L = 2.6, H = 1.2, W = 1.4, finish = 'b82_tread_purple') {
  const g = new THREE.Group(); g.name = 'tread_ramp'; const len = Math.hypot(L, H), ang = Math.atan2(H, L);
  const pl = new THREE.Group(); pl.position.set(L / 2, H / 2, 0); pl.rotation.z = ang; g.add(pl);
  box(len, 0.03, W, libMat82(finish, len / 0.4, W / 0.4), 0, 0, 0, pl); for (const s of [-1, 1]) box(len, 0.08, 0.03, libMat82(finish, len / 0.4, 0.2), 0, 0.04, s * (W / 2 - 0.015), pl);
  for (const s of [-1, 1]) box(0.06, H - 0.03, 0.06, std({ color: '#5a5c60', metalness: 0.6 }), L - 0.05, (H - 0.03) / 2, s * (W / 2 - 0.1), g);
  return g;
}
export function makeScrewdriver() {
  const g = new THREE.Group(); g.name = 'flathead_screwdriver';
  const rub = std({ color: '#1a1a1c', roughness: 0.75 }), wht = std({ color: '#f0f0ec', roughness: 0.5 }), chrome = std({ color: '#d8dce0', metalness: 0.95, roughness: 0.18 });
  // handle: a lathe profile with grip flutes (scaled ridges), two white rings
  const pr = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pr.push(new THREE.Vector2(0.012 + 0.005 * Math.sin(t * Math.PI) + (t > 0.85 ? -0.006 * (t - 0.85) / 0.15 : 0), t * 0.11)); }
  const hd = new THREE.Mesh(new THREE.LatheGeometry(pr, 8), rub); hd.rotation.z = -Math.PI / 2; g.add(hd);
  for (const x of [0.035, 0.088]) cyl(0.0158, 0.0158, 0.004, wht, x, 0, 0, g, 18).rotation.z = Math.PI / 2;
  const sh = cyl(0.003, 0.003, 0.1, chrome, 0.16, 0, 0, g, 10); sh.rotation.z = Math.PI / 2;
  const tip = box(0.012, 0.002, 0.007, chrome, 0.215, 0, 0, g); void tip; const tp = box(0.01, 0.0035, 0.005, chrome, 0.207, 0, 0, g); void tp;
  return g;
}
// white base cabinet: two doors with a dark gap, brushed-nickel mushroom knobs, paint spatter; off-white speckled sides
export function makeKnobCabinet(W = 0.9, H = 0.85, D = 0.5) {
  const g = new THREE.Group(); g.name = 'knob_cabinet';
  const side = libMat82('b82_speckle', D / 0.6, H / 0.6); box(W, H, D, side, 0, H / 2, 0, g);
  const door = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#ece8e0'; x.fillRect(0, 0, w, h); const r = rng(82); for (let i = 0; i < 26; i++) { x.fillStyle = ['rgba(90,80,70,0.5)', 'rgba(200,170,120,0.5)', 'rgba(60,60,60,0.6)'][i % 3]; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); x.fill(); } x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(0, h - 40, w, 40); });
  const dm = std({ map: door, roughness: 0.55 });
  for (const s of [-1, 1]) { box(W / 2 - 0.012, H - 0.12, 0.02, dm, s * (W / 4), H / 2 + 0.03, D / 2 + 0.01, g); const kb = new THREE.Group(); kb.position.set(s * 0.05, H - 0.2, D / 2 + 0.02); g.add(kb); const nk = std({ color: '#b8b4ae', metalness: 0.85, roughness: 0.35 }); cyl(0.008, 0.01, 0.018, nk, 0, 0, 0.009, kb, 12).rotation.x = Math.PI / 2; const cap = sphere(0.018, nk, 0, 0, 0.026, kb, 18, 10); cap.scale.z = 0.6; }
  box(0.012, H - 0.12, 0.01, std({ color: '#141414' }), 0, H / 2 + 0.03, D / 2 + 0.005, g);
  box(W + 0.02, 0.03, D + 0.03, libMat82('b82_quartz', 1, 0.6), 0, H + 0.015, 0, g);   // quartz top
  box(W, 0.08, D - 0.05, std({ color: '#2a2a2a' }), 0, 0.04, -0.02, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2 + 0.04];
  return g;
}
// a maroon plastic carry case covered in worn stickers (all redrawn generic: a dripping heart with a made-up slogan,
// a peeled band sticker, a postal label, a star)
export function makeStickerCase() {
  const g = new THREE.Group(); g.name = 'sticker_case'; const W = 0.46, H = 0.34, D = 0.14;
  const st = canvasT(512, 384, (x, w, h) => { x.fillStyle = '#4a1218'; x.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.05})`; x.fillRect(r() * w, r() * h, 2, 2); }
    // the heart sticker: black square, yellow heart dripping red, slogan in a blue box
    x.fillStyle = '#141414'; x.fillRect(40, 150, 260, 190); x.fillStyle = '#f2d21a'; x.beginPath(); x.moveTo(110, 220); x.bezierCurveTo(60, 170, 120, 140, 130, 190); x.bezierCurveTo(140, 140, 200, 170, 150, 220); x.lineTo(130, 260); x.closePath(); x.fill();
    x.fillStyle = '#e8263a'; for (const [dx, dl] of [[118, 40], [130, 60], [142, 30]]) x.fillRect(dx, 235, 6, dl);
    x.fillStyle = '#5ab8ff'; x.fillRect(170, 165, 70, 22); x.fillStyle = '#111'; fitText(x, 'gentle', 205, 177, 64, 16, F.hand); x.fillStyle = '#f2d21a'; fitText(x, 'KINDNESS', 230, 210, 120, 32, F.heavy); fitText(x, 'BREAKS NO', 230, 245, 120, 26, F.heavy); x.fillStyle = '#e8263a'; fitText(x, 'HEARTS!', 230, 280, 120, 30, F.marker);
    x.fillStyle = '#4a1218'; x.beginPath(); x.moveTo(300, 150); x.lineTo(270, 150); x.lineTo(300, 175); x.fill();   // a peeled corner
    x.fillStyle = '#e8e8e0'; x.fillRect(320, 40, 160, 70); x.fillStyle = '#c81e1e'; fitText(x, 'NIGHT OWLS', 400, 76, 140, 30, F.retro);
    x.fillStyle = '#d8e8f8'; x.fillRect(330, 260, 150, 100); x.fillStyle = '#1e3a8a'; x.fillRect(330, 260, 150, 22); x.fillStyle = '#333'; for (let i = 0; i < 5; i++) x.fillRect(340, 292 + i * 12, 90, 5);
    x.fillStyle = '#f2a8c8'; x.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 14 : 34; x.lineTo(100 + Math.cos(k * Math.PI / 5) * rr, 80 + Math.sin(k * Math.PI / 5) * rr); } x.fill(); });
  const mm = std({ color: '#4a1218', roughness: 0.5 });
  const c = rbox(W, H, D, 0.03, [mm, mm, mm, mm, std({ map: st, roughness: 0.5 }), mm], 0, H / 2, 0, g); void c;
  box(W + 0.005, 0.01, D + 0.005, std({ color: '#2a0a0e' }), 0, H * 0.82, 0, g);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), mm); hd.position.set(0, H + 0.0, 0); g.add(hd);
  for (const s of [-1, 1]) box(0.04, 0.03, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), s * 0.12, H * 0.82, D / 2 + 0.005, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
// a stack of thick comic volumes edge-on (yellowed page edges, coloured cover stripes, made-up titles) on a worn
// whitewashed wooden box, a coin beside it
export function makeComicStack(seed = 82) {
  const g = new THREE.Group(); g.name = 'comic_stack'; const r = rng(seed);
  box(0.46, 0.32, 0.36, libMat82('b82_whitewash', 0.6, 0.5), 0, 0.16, 0, g);
  const pages = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#d8c89a'; x.fillRect(0, 0, w, h); for (let i = 0; i < h; i += 2) { x.fillStyle = `rgba(120,90,40,${0.1 + (i % 6) * 0.03})`; x.fillRect(0, i, w, 1); } });
  let y = 0.32; const titles = ['STAR RONIN', 'DEEP WOODS', 'MOON CLUB', 'IRON PUP', 'NIGHT BUS', 'TIDE SPELL', 'NEON KITE'];
  for (let i = 0; i < 11; i++) { const th = 0.022 + r() * 0.02, w = 0.13 + r() * 0.04, d = 0.18 + r() * 0.02, c = `hsl(${r() * 360},55%,${40 + r() * 20}%)`;
    const spine = canvasT(256, 48, (x, cw, ch) => { x.fillStyle = c; x.fillRect(0, 0, cw, ch); x.fillStyle = '#fff'; fitText(x, titles[i % titles.length] + ' ' + (1 + Math.floor(r() * 20)), cw / 2, ch / 2 + 2, cw - 20, ch * 0.6, F.label); });
    const cov = std({ color: c, roughness: 0.5 }), pm = std({ map: pages, roughness: 0.9 });
    const b = box(w, th, d, [pm, std({ map: spine }), cov, cov, pm, pm], (r() - 0.5) * 0.03, y + th / 2, (r() - 0.5) * 0.03, g); b.rotation.y = (r() - 0.5) * 0.12; y += th; }
  const coin = cyl(0.012, 0.012, 0.002, std({ color: '#c8a060', metalness: 0.9, roughness: 0.3 }), 0.17, 0.321, 0.12, g, 20); void coin;
  g.userData.collider = [-0.24, 0.24, -0.19, 0.19];
  return g;
}
// two primed canvases leaning on a wall, painted in the user's brushed blue and grey
export function makePrimedCanvases() {
  const g = new THREE.Group(); g.name = 'primed_canvases';
  for (const [name, w, h, x, tilt] of [['b82_canvasblue', 0.6, 0.8, 0, 0.12], ['b82_canvasgrey', 0.5, 0.6, 0.12, 0.1]]) { const c = new THREE.Group(); c.position.set(x, 0, 0.05 + x); c.rotation.x = -tilt; g.add(c); const f = std({ color: '#d8c8a8' }); box(w, h, 0.03, [f, f, f, f, libMat82(name, w / 0.6, h / 0.6), f], 0, h / 2, 0, c); }
  return g;
}
