// Batch 81 (photos/batch81/): grocery + street pieces. All brands, logos, product names and numbers are made up.
//   makeEnergyEndcap, makeCakeMixGondola, makeSpiceWall, makeStockingCart, makeDiscontinuedHandheld,
//   makeFortuneCookies, makeFoldingEbike, makeWaveRack, makeBoxTrailer
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeFoldingTote } from './batch77.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const glow = (t, i = 1) => std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: i, roughness: 0.4 });
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
// a texture atlas of N front faces in a row; returns per-instance UV offset by baking separate geometries per design
function atlasGeos(geo, n) { const out = []; for (let i = 0; i < n; i++) { const g = geo.clone(); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / n); out.push(g); } return out; }

// ---- energy drink end-cap --------------------------------------------------------------------------------------------
export function makeEnergyEndcap() {
  const g = new THREE.Group(); g.name = 'energy_endcap'; const W = 1.3, D = 0.7, H = 2.2;
  const navy = std({ color: '#1a2a5a', roughness: 0.4 }), led = std({ color: '#fff', emissive: '#bfe0ff', emissiveIntensity: 2.2 });
  box(W, 0.12, D, navy, 0, 0.06, 0, g); box(W, H, 0.05, navy, 0, H / 2, -D / 2 + 0.025, g); for (const s of [-1, 1]) box(0.05, H, D, navy, s * (W / 2 - 0.025), H / 2, 0, g);
  // lit header: a blue panel with a red/yellow wordmark + a lightning bolt (original)
  const hd = canvasT(512, 192, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a4ab8'); gr.addColorStop(1, '#14246a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; x.beginPath(); x.moveTo(60, 20); x.lineTo(100, 20); x.lineTo(80, 80); x.lineTo(110, 80); x.lineTo(50, 175); x.lineTo(66, 100); x.lineTo(40, 100); x.closePath(); x.fill(); x.fillStyle = '#e8302a'; fitText(x, 'Volt Rush', w / 2 + 50, 100, w - 170, 110, F.bubbly, { stroke: '#f2c21a' }); });
  const head = new THREE.Group(); head.position.set(0, H + 0.35, 0.05); g.add(head); box(W + 0.1, 0.62, 0.2, navy, 0, 0, 0, head); plane(W, 0.55, glow(hd, 0.9), 0, 0, 0.101, 0, head);
  // left half: water bottles on blue shelves with LED edges
  const bottle = new THREE.LatheGeometry([V(0, 0, 0), V(0.032, 0, 0), V(0.034, 0.01, 0), V(0.034, 0.17, 0), V(0.02, 0.21, 0), V(0.014, 0.23, 0), V(0, 0.23, 0)].map((v) => new THREE.Vector2(v.x, v.y)), 14);
  const btM = phys({ color: '#d8ecf8', transparent: true, opacity: 0.75, roughness: 0.05, clearcoat: 1 }); const capM = std({ color: '#2a6ad8' });
  const pts = [];
  for (let k = 0; k < 6; k++) { const y = 0.14 + k * 0.33; box(0.6, 0.02, D - 0.06, std({ color: '#2a5ad8' }), -0.33, y, 0, g); box(0.6, 0.015, 0.01, led, -0.33, y + 0.01, D / 2 - 0.03, g);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) pts.push([-0.6 + i * 0.08, y + 0.012, -0.25 + j * 0.15]); }
  const bi = new THREE.InstancedMesh(bottle, btM, pts.length); pts.forEach((p, i) => { M4.makeTranslation(...p); bi.setMatrixAt(i, M4); }); g.add(bi);
  const ci = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), capM, pts.length); pts.forEach((p, i) => { M4.makeTranslation(p[0], p[1] + 0.24, p[2]); ci.setMatrixAt(i, M4); }); g.add(ci);
  const wl = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#e8f4fa'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e4ab8'; fitText(x, 'SPRING PEAK water', w / 2, 34, w - 20, 30, F.label); }); for (let k = 0; k < 6; k++) plane(0.5, 0.05, std({ map: wl }), -0.33, 0.24 + k * 0.33, 0.23, 0, g);
  // right half: a glass-door can cooler with a little screen on top
  const cool = new THREE.Group(); cool.position.set(0.33, 0, 0); g.add(cool);
  box(0.58, 1.9, D - 0.04, std({ color: '#1a1a1c' }), 0, 1.07, 0, cool);
  const cans = canvasT(512, 1024, (x, w, h) => { x.fillStyle = '#f4f6f8'; x.fillRect(0, 0, w, h); const cs = [['#2a4ab8', '#c8ccd0'], ['#f2c21a', '#2a4ab8'], ['#e8302a', '#c8ccd0'], ['#3ab8a8', '#f4f4f0']]; for (let s = 0; s < 6; s++) { const y0 = s * 168 + 10; x.fillStyle = '#b8bcc0'; x.fillRect(0, y0 + 150, w, 8); for (let i = 0; i < 8; i++) { const [a, b] = cs[(i + s) % 4]; x.fillStyle = b; x.fillRect(8 + i * 62, y0 + 30, 52, 120); x.fillStyle = a; x.fillRect(8 + i * 62, y0 + 50, 52, 80); x.fillStyle = '#fff'; x.fillRect(8 + i * 62, y0 + 80, 52, 6); } } });
  plane(0.5, 1.75, glow(cans, 0.6), 0, 1.07, (D - 0.04) / 2 + 0.002, 0, cool);
  plane(0.54, 1.8, phys({ color: '#fff', transparent: true, opacity: 0.12, roughness: 0.02, depthWrite: false }), 0, 1.07, (D - 0.04) / 2 + 0.03, 0, cool); box(0.03, 0.8, 0.04, std({ color: '#c8ccd0', metalness: 0.8 }), 0.22, 1.1, (D - 0.04) / 2 + 0.05, cool);
  const sc = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#0a1a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, '2 for $5', w / 2, 70, w - 40, 54, F.heavy); x.fillStyle = '#fff'; fitText(x, 'ice cold · zero sugar', w / 2, 130, w - 40, 22, F.label); });
  box(0.42, 0.28, 0.04, std({ color: '#111' }), 0, 2.12, 0.15, cool); plane(0.38, 0.24, glow(sc, 0.9), 0, 2.12, 0.172, 0, cool);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}

// ---- cake-mix gondola: product boxes as instanced geometry on the +z face --------------------------------------------
const MIXES = [['Bake Bliss', "Devil's Food", '#5a2a1a', '#f2c8a0'], ['Bake Bliss', 'Funfetti Cake', '#f4f4f0', '#e8402a'], ['Bake Bliss', 'Lemon Supreme', '#f2e04a', '#2a8a4a'], ['Golden Oven', 'Yellow Cake', '#f2c21a', '#c81e28'], ['Golden Oven', 'Red Velvet', '#a81a2a', '#f4f2ea'], ['Golden Oven', 'Brownie Mix', '#3a1a10', '#f2c21a'], ['Sugar & Co.', 'Vanilla Frosting', '#f4f2ea', '#5a8ad8'], ['Sugar & Co.', 'Choc. Frosting', '#4a2412', '#f4f2ea']];
function mixAtlas() { return canvasT(MIXES.length * 128, 192, (x, w, h) => { MIXES.forEach(([br, nm, bg, fg], i) => { const x0 = i * 128; x.fillStyle = bg; x.fillRect(x0, 0, 128, h); x.fillStyle = fg; fitText(x, br, x0 + 64, 24, 110, 20, F.bubbly); x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.ellipse(x0 + 64, 100, 46, 34, 0, 0, 7); x.fill(); x.fillStyle = bg === '#f4f4f0' || bg === '#f4f2ea' ? '#c81e28' : bg; x.beginPath(); x.ellipse(x0 + 64, 104, 34, 18, 0, 0, 7); x.fill(); x.fillStyle = fg; fitText(x, nm, x0 + 64, 160, 116, 22, F.heavy); }); }); }
export function makeCakeMixGondola(L = 10, seed = 81) {
  const g = new THREE.Group(); g.name = 'cake_mix_gondola'; const H = 1.7, D = 1.0, r = rng(seed);
  const body = std({ color: '#e8e8e4' }); box(L, H, 0.06, body, 0, H / 2, 0, g); box(L, 0.15, D, body, 0, 0.075, 0, g);
  const atlas = mixAtlas(); const faceM = std({ map: atlas, roughness: 0.5 }), sideM = std({ color: '#c8c0b0' });
  const boxGeo = new THREE.BoxGeometry(0.19, 0.27, 0.05); const designs = atlasGeos(boxGeo, MIXES.length);
  // group instances per design (so each instanced mesh carries its slice of the atlas on its faces)
  const per = MIXES.map(() => []); const tubs = [], tags = [];
  for (let k = 0; k < 4; k++) { const y = 0.3 + k * 0.38; box(L, 0.025, 0.42, std({ color: '#d8dadc', metalness: 0.5 }), 0, y, 0.24, g); box(L, 0.04, 0.012, std({ color: '#f4f4f0' }), 0, y - 0.02, 0.455, g);
    let x = -L / 2 + 0.1; let d = Math.floor(r() * MIXES.length);
    while (x < L / 2 - 0.25) { if (r() < 0.06) { x += 0.4; continue; }   // a gap where a product sold out
      const facings = 2 + Math.floor(r() * 3); if (r() < 0.25) d = Math.floor(r() * MIXES.length);
      for (let f = 0; f < facings && x < L / 2 - 0.2; f++) { const depth = 2 + Math.floor(r() * 5); for (let q = 0; q < depth; q++) per[d].push([x, y + 0.148, 0.42 - q * 0.06, (r() - 0.5) * 0.04]); x += 0.2; }
      tags.push([x - facings * 0.1, y - 0.02]); x += 0.02; }
    if (k === 1) for (let i = 0; i < 14; i++) tubs.push([-L / 2 + 0.6 + i * 0.12, y + 0.0125]); }
  per.forEach((list, i) => { if (!list.length) return; const im = new THREE.InstancedMesh(designs[i], [sideM, sideM, sideM, sideM, faceM, sideM], list.length); list.forEach(([x, y, z, rz], j) => { Q.setFromEuler(E.set(0, 0, rz)); M4.compose(V(x, y, z), Q, V(1, 1, 1)); im.setMatrixAt(j, M4); }); im.castShadow = true; g.add(im); });
  // frosting tubs on the second shelf's right half (rounded cylinders)
  // e-ink shelf tags: small grey panels with a price
  const tagT = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#e4e6e2'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, '$2.29', 40, 30, 70, 30, F.label, { weight: 700 }); x.fillStyle = '#c81e28'; x.fillRect(84, 10, 36, 16); x.fillStyle = '#333'; x.fillRect(84, 34, 36, 3); x.fillRect(84, 42, 30, 3); });
  const tg = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.075, 0.038), std({ map: tagT }), tags.length); tags.forEach(([x, y], j) => { M4.makeTranslation(x, y, 0.462); tg.setMatrixAt(j, M4); }); g.add(tg);
  // back side: a plain printed face (snacks)
  const bt = canvasT(1024, 512, (x, w, h) => { const rr = rng(seed + 1); x.fillStyle = '#e8e8e4'; x.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) { const y0 = k * 124 + 8; x.fillStyle = '#c8ccd0'; x.fillRect(0, y0 + 110, w, 8); let px = 0; while (px < w) { const cw = 24 + rr() * 40, ch = 50 + rr() * 50; x.fillStyle = ['#e8402a', '#2a6ad8', '#f2c21a', '#3ab84a', '#c83a8a', '#f08a1a'][Math.floor(rr() * 6)]; x.fillRect(px, y0 + 110 - ch, cw - 3, ch); px += cw; } } }); bt.wrapS = THREE.RepeatWrapping; bt.repeat.set(L / 3, 1);
  plane(L, 1.5, std({ map: bt }), 0, 0.9, -0.42, Math.PI, g);
  const aisle = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#1e6a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'AISLE 7', w / 2, 46, w - 30, 44, F.heavy); fitText(x, 'baking · cake mix · spices', w / 2, 112, w - 20, 22, F.label); });
  const hs = plane(1.0, 0.62, std({ map: aisle, side: THREE.DoubleSide }), L / 2 + 0.1, 2.9, 0, Math.PI / 2, g); void hs; rod(V(L / 2 + 0.1, 3.21, 0), V(L / 2 + 0.1, 5.2, 0), 0.01, std({ color: '#888' }), g);
  g.userData.collider = [-L / 2, L / 2, -D / 2, D / 2];
  return g;
}
// a wall of spice jars: 6 shelves, little jars with coloured caps + labels (instanced)
export function makeSpiceWall(L = 6) {
  const g = new THREE.Group(); g.name = 'spice_wall'; const H = 2.1, r = rng(5);
  box(L, H, 0.35, std({ color: '#f4f2ee' }), 0, H / 2, -0.175, g);
  const jars = [], caps = [];
  for (let k = 0; k < 8; k++) { const y = 0.2 + k * 0.24; box(L, 0.02, 0.32, std({ color: '#d8dadc', metalness: 0.4 }), 0, y, 0.0, g); for (let i = 0; i < Math.floor(L / 0.06); i++) { if (r() < 0.07) continue; for (let d = 0; d < 2; d++) { jars.push([-L / 2 + 0.04 + i * 0.06, y + 0.06, 0.1 - d * 0.08, Math.floor(r() * 6)]); } } }
  const jarT = canvasT(384, 64, (x, w, h) => { const cs = ['#8a2a1a', '#c86a1a', '#3a6a2a', '#e8c040', '#5a3a2a', '#c81e28']; cs.forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 64, 0, 64, h); x.fillStyle = '#f4f2ea'; x.fillRect(i * 64 + 6, 18, 52, 28); x.fillStyle = '#333'; x.fillRect(i * 64 + 12, 26, 40, 4); x.fillRect(i * 64 + 12, 34, 30, 3); }); });
  const jg = atlasGeos(new THREE.CylinderGeometry(0.023, 0.023, 0.1, 12), 6);
  for (let t = 0; t < 6; t++) { const list = jars.filter((j) => j[3] === t); const im = new THREE.InstancedMesh(jg[t], std({ map: jarT, roughness: 0.4 }), list.length); list.forEach((j, n) => { M4.makeTranslation(j[0], j[1], j[2]); im.setMatrixAt(n, M4); }); g.add(im); }
  const cp = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.025, 12), std({ color: '#c81e28' }), jars.length); jars.forEach((j, n) => { M4.makeTranslation(j[0], j[1] + 0.062, j[2]); cp.setMatrixAt(n, M4); }); g.add(cp);
  g.userData.collider = [-L / 2, L / 2, -0.35, 0.18];
  return g;
}
export function makeStockingCart() {
  const g = new THREE.Group(); g.name = 'stocking_cart'; const W = 0.75, L = 1.4, blk = std({ color: '#1a1a1c', metalness: 0.4 });
  box(W, 0.05, L, blk, 0, 0.22, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(0.07, 0.07, 0.04, std({ color: '#2a2a2a' }), sx * (W / 2 - 0.08), 0.08, sz * (L / 2 - 0.1), g, 14).rotation.z = Math.PI / 2; box(0.05, 0.12, 0.05, blk, sx * (W / 2 - 0.08), 0.16, sz * (L / 2 - 0.1), g); }
  rod(V(-W / 2 + 0.03, 0.22, -L / 2 + 0.03), V(-W / 2 + 0.03, 1.1, -L / 2 + 0.03), 0.015, blk, g); rod(V(W / 2 - 0.03, 0.22, -L / 2 + 0.03), V(W / 2 - 0.03, 1.1, -L / 2 + 0.03), 0.015, blk, g); rod(V(-W / 2 + 0.03, 1.1, -L / 2 + 0.03), V(W / 2 - 0.03, 1.1, -L / 2 + 0.03), 0.015, blk, g);
  const r = rng(81); const card = std({ color: '#c8a070', roughness: 0.9 }); let y = 0.245;
  const lab = canvasT(128, 96, (x, w, h) => { x.fillStyle = '#c8a070'; x.fillRect(0, 0, w, h); x.fillStyle = '#fbfbf8'; x.fillRect(14, 14, w - 28, h - 28); x.fillStyle = '#111'; for (let i = 0; i < 4; i++) x.fillRect(22, 24 + i * 12, 60 + (i * 13) % 20, 4); x.fillRect(22, 72, 80, 8); });
  for (let k = 0; k < 4; k++) { let x = -W / 2 + 0.05; for (let i = 0; i < 2; i++) { const bw = 0.3 + r() * 0.05, bh = 0.18 + r() * 0.12, bd = 0.32 + r() * 0.1; box(bw, bh, bd, [card, card, card, card, std({ map: lab }), card], x + bw / 2, y + bh / 2, 0.25 + (r() - 0.5) * 0.05, g); x += bw + 0.02; } y += 0.3; }
  for (let k = 0; k < 3; k++) { const t = makeFoldingTote(k < 2, 900 + k); t.scale.setScalar(0.95); t.position.set(0, 0.245 + k * 0.31, -0.35); t.rotation.y = Math.PI / 2; g.add(t); }
  g.userData.collider = [-W / 2 - 0.02, W / 2 + 0.02, -L / 2, L / 2];
  return g;
}
export function makeDiscontinuedHandheld() {
  const g = new THREE.Group(); g.name = 'handheld_discontinued';
  const scr = canvasT(320, 600, (x, w, h) => { x.fillStyle = '#eef4fa'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e6ad8'; x.fillRect(0, 0, w, 64); x.fillStyle = '#fff'; fitText(x, 'Discontinued Product', w / 2, 34, w - 30, 26, F.label);
    x.fillStyle = '#c81e28'; x.beginPath(); x.roundRect(20, 90, w - 40, 60, 10); x.fill(); x.fillStyle = '#fff'; fitText(x, 'PULL THE TAG', w / 2, 120, w - 70, 32, F.heavy);
    x.fillStyle = '#111'; x.font = `bold 20px ${F.label}`; x.fillText('Bubble Fruit Jelly Cups', 20, 190); x.font = `16px ${F.label}`; ['UPC  0004418290', 'Aisle 7 · Bay R2 · Shelf 4', 'Last sold 11/02', 'On hand 0'].forEach((t, i) => x.fillText(t, 20, 230 + i * 30));
    x.strokeStyle = '#1e6ad8'; x.lineWidth = 3; x.beginPath(); x.roundRect(30, 400, w - 60, 44, 22); x.stroke(); x.fillStyle = '#1e6ad8'; fitText(x, 'Confirm tag removed', w / 2, 422, w - 90, 20, F.label); x.fillStyle = '#1e6ad8'; x.beginPath(); x.roundRect(30, 460, w - 60, 44, 22); x.fill(); x.fillStyle = '#fff'; fitText(x, 'Next item', w / 2, 482, w - 90, 20, F.label); });
  rbox(0.085, 0.16, 0.022, 0.01, std({ color: '#1a1a1c', roughness: 0.5 }), 0, 0, 0, g);
  plane(0.072, 0.135, std({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.8, roughness: 0.15 }), 0, 0.005, 0.0115, 0, g);
  rbox(0.07, 0.04, 0.03, 0.01, std({ color: '#c8401a' }), 0, 0.075, -0.01, g);
  return g;
}
export function makeFortuneCookies() {
  const g = new THREE.Group(); g.name = 'fortune_cookies'; const ck = std({ color: '#e8c088', roughness: 0.6 });
  for (const [x, ry] of [[-0.03, 0.4], [0.035, -0.8]]) { const c = new THREE.Group(); c.position.set(x, 0.018, 0); c.rotation.y = ry; g.add(c);
    // a folded disc: a half-torus-ish shell made from a bent sphere slice
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#e8c088', roughness: 0.6, side: THREE.DoubleSide })); const p = s.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const px = p.getX(i), pz = p.getZ(i); p.setY(i, p.getY(i) * 0.9 - Math.abs(px) * 0.4); p.setZ(i, pz * (1 - Math.abs(px) * 6)); } s.geometry.computeVertexNormals(); s.rotation.x = -Math.PI / 2; c.add(s);
    const paper = box(0.012, 0.004, 0.03, std({ color: '#f4f4f0' }), 0.03, 0.0, 0, c); void paper; void ck; }
  const bag = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.04, 0.11, 3, 0.015), phys({ color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.1, clearcoat: 1, depthWrite: false })); bag.position.y = 0.02; g.add(bag);
  return g;
}

// ---- e-bike + wave rack ------------------------------------------------------------------------------------------------
export function makeFoldingEbike() {
  const g = new THREE.Group(); g.name = 'folding_ebike'; const blk = std({ color: '#1a1a1c', roughness: 0.4, metalness: 0.4 }), tyre = std({ color: '#111', roughness: 0.85 });
  const R = 0.25;   // 20-inch fat tyres
  for (const x of [-0.55, 0.55]) { const t = new THREE.Mesh(new THREE.TorusGeometry(R - 0.04, 0.05, 10, 30), tyre); t.position.set(x, R, 0); g.add(t); const hub = cyl(0.05, 0.05, 0.08, blk, x, R, 0, g, 14); hub.rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; rod(V(x, R, 0), V(x + Math.cos(a) * (R - 0.08), R + Math.sin(a) * (R - 0.08), 0), 0.012, blk, g, 5); } }
  // frame: a fat folding main tube with the battery inside, seat post, stem + bars, rear rack, fenders, chainring
  rod(V(-0.55, R, 0), V(-0.1, 0.38, 0), 0.025, blk, g); rod(V(-0.1, 0.38, 0), V(0.4, 0.62, 0), 0.05, blk, g); rod(V(-0.55, R, 0), V(-0.15, 0.62, 0), 0.02, blk, g);
  rod(V(-0.1, 0.38, 0), V(-0.18, 0.85, 0), 0.025, blk, g); rbox(0.24, 0.06, 0.14, 0.03, std({ color: '#141414' }), -0.2, 0.89, 0, g);
  rod(V(0.55, R, 0), V(0.45, 0.75, 0), 0.022, blk, g); rod(V(0.45, 0.75, 0), V(0.43, 1.0, 0), 0.02, blk, g); rod(V(0.43, 1.0, -0.28), V(0.43, 1.0, 0.28), 0.014, blk, g); for (const s of [-1, 1]) cyl(0.018, 0.018, 0.1, std({ color: '#2a2a2a' }), 0.43, 1.0, s * 0.25, g, 8).rotation.x = Math.PI / 2;
  box(0.34, 0.02, 0.14, blk, -0.5, 0.62, 0, g); rod(V(-0.66, 0.62, 0.06), V(-0.55, R, 0.06), 0.01, blk, g); rod(V(-0.66, 0.62, -0.06), V(-0.55, R, -0.06), 0.01, blk, g);
  for (const x of [-0.55, 0.55]) { const fd = new THREE.Mesh(new THREE.TorusGeometry(R + 0.03, 0.035, 4, 20, Math.PI * 0.8), blk); fd.position.set(x, R, 0); fd.rotation.z = x < 0 ? 0.3 : 0.3; fd.scale.z = 1.5; g.add(fd); }
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 6, 24), std({ color: '#5a5c60', metalness: 0.7 })); cr.position.set(-0.08, 0.36, 0.07); g.add(cr); rod(V(-0.08, 0.36, 0.07), V(-0.08, 0.26, 0.12), 0.01, blk, g);
  box(0.06, 0.04, 0.04, std({ color: '#f4f4f0', emissive: '#ffffff', emissiveIntensity: 0.6 }), 0.5, 0.82, 0, g);
  // the U-lock to the rack
  const lock = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 14, Math.PI), std({ color: '#c8ccd0', metalness: 0.9 })); lock.position.set(0.2, 0.55, 0.12); lock.rotation.x = Math.PI / 2; g.add(lock);
  g.userData.collider = [-0.85, 0.85, -0.3, 0.3];
  return g;
}
export function makeWaveRack() {
  const g = new THREE.Group(); g.name = 'wave_rack'; const st = std({ color: '#2a2a2c', metalness: 0.6, roughness: 0.35 });
  const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(V(-1.1 + t * 2.2, 0.05 + 0.75 * Math.abs(Math.sin(t * Math.PI * 2.5)), 0)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.025, 8), st));
  g.userData.collider = [-1.15, 1.15, -0.08, 0.08];
  return g;
}

// ---- box trailer with its rear doors open -----------------------------------------------------------------------------
export function makeBoxTrailer(num = 'ELM 0418 205') {
  const g = new THREE.Group(); g.name = 'box_trailer'; const L = 16.15, W = 2.6, H = 2.75, FY = 1.2;   // 53 ft van
  const white = std({ color: '#eef0f0', roughness: 0.6 }), alum = std({ color: '#b8bcc0', metalness: 0.7, roughness: 0.4 });
  // the floor: ribbed aluminium + wood, at dock height
  const fl = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#8a7050'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 32) { x.fillStyle = '#b8bcc0'; x.fillRect(i, 0, 10, h); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(i + 10, 0, 2, h); } }); fl.wrapS = fl.wrapT = THREE.RepeatWrapping; fl.repeat.set(W / 0.4, L / 2);
  const flm = new THREE.Mesh(new THREE.PlaneGeometry(L, W), std({ map: fl, roughness: 0.6 })); flm.rotation.x = -Math.PI / 2; flm.rotation.z = Math.PI / 2; flm.position.y = FY + 0.01; flm.rotation.set(-Math.PI / 2, 0, 0); flm.geometry = new THREE.PlaneGeometry(L, W); fl.rotation = Math.PI / 2; g.add(flm);
  box(L, 0.25, W, std({ color: '#2a2a2c', metalness: 0.4 }), 0, FY - 0.12, 0, g);
  // walls (inside white panels with seams), roof, front wall
  const wallT = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#eef0f0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < w; i += 64) x.fillRect(i, 0, 2, h); x.fillStyle = 'rgba(140,120,90,0.15)'; for (let i = 0; i < 30; i++) x.fillRect((i * 97) % w, h - 30 + (i % 4) * 6, 40, 3); }); wallT.wrapS = THREE.RepeatWrapping; wallT.repeat.set(L / 2, 1);
  const wm = std({ map: wallT, roughness: 0.7, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { plane(L, H, wm, 0, FY + H / 2, s * W / 2, s > 0 ? Math.PI : 0, g); box(L, H + 0.1, 0.04, white, 0, FY + H / 2, s * (W / 2 + 0.02), g); }
  box(L, 0.05, W + 0.08, white, 0, FY + H + 0.02, 0, g); box(0.05, H, W, white, -L / 2, FY + H / 2, 0, g);
  // e-track: two horizontal galvanised rails each side with slot patterns, logistic posts every 1.2 m
  const et = canvasT(512, 32, (x, w, h) => { x.fillStyle = '#b8bcc0'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3a3c'; for (let i = 6; i < w; i += 20) x.fillRect(i, 8, 12, 16); }); et.wrapS = THREE.RepeatWrapping; et.repeat.set(L / 1.2, 1);
  const lp = canvasT(32, 512, (x, w, h) => { x.fillStyle = '#b8bcc0'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3a3c'; for (let i = 6; i < h; i += 20) x.fillRect(8, i, 16, 12); });
  for (const s of [-1, 1]) { for (const y of [1.1, 1.9]) plane(L, 0.13, std({ map: et, metalness: 0.6, roughness: 0.35 }), 0, FY + y, s * (W / 2 - 0.006), s > 0 ? Math.PI : 0, g); for (let x = -L / 2 + 1.2; x < L / 2 - 0.5; x += 1.2) plane(0.11, H - 0.1, std({ map: lp, metalness: 0.6, roughness: 0.35 }), x, FY + H / 2, s * (W / 2 - 0.007), s > 0 ? Math.PI : 0, g); }
  // the trailer number strip down the inside of the rear frame, the rear frame + open doors swung against the sides
  const ns = canvasT(64, 512, (x, w, h) => { x.fillStyle = '#eef0f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; [...num.replace(/ /g, '')].forEach((c, i) => fitText(x, c, w / 2, 30 + i * 46, w - 12, 42, F.label, { weight: 700 })); });
  for (const s of [-1, 1]) { box(0.12, H, 0.12, alum, L / 2, FY + H / 2, s * (W / 2 - 0.06), g); }
  plane(0.1, 1.2, std({ map: ns }), L / 2 - 0.06, FY + 1.6, W / 2 - 0.13, -Math.PI / 2, g);
  box(0.15, 0.25, W, alum, L / 2, FY + H - 0.1, 0, g);
  for (const s of [-1, 1]) { // hinged at the side, the leaf runs toward the centre when shut; swung ~100 degrees out it lies back along the side
    const d = new THREE.Group(); d.position.set(L / 2, FY, s * (W / 2 + 0.03)); d.rotation.y = s * (Math.PI / 2 + 0.1); g.add(d); box(0.05, H - 0.1, W / 2, white, 0, H / 2, -s * W / 4, d); for (const y of [0.4, 1.4, 2.4]) box(0.06, 0.04, W / 2 - 0.1, alum, 0.03, y, -s * W / 4, d); }
  // undercarriage: landing gear at the front, tandem axles at the rear, mud flaps, a rear bumper
  for (const s of [-1, 1]) { box(0.12, FY - 0.25, 0.12, alum, -L / 2 + 3.5, (FY - 0.25) / 2, s * 0.9, g); box(0.3, 0.05, 0.3, alum, -L / 2 + 3.5, 0.025, s * 0.9, g); }
  for (const x of [L / 2 - 2.0, L / 2 - 3.3]) for (const s of [-1, 1]) for (const k of [0, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.13, 10, 26), std({ color: '#141414', roughness: 0.8 })); t.position.set(x, 0.53, s * (0.75 + k * 0.32)); g.add(t); cyl(0.26, 0.26, 0.15, std({ color: '#c8ccd0', metalness: 0.7 }), x, 0.53, s * (0.75 + k * 0.32), g, 16).rotation.x = Math.PI / 2; }
  box(0.12, 0.12, W - 0.2, alum, L / 2 - 0.2, 0.55, 0, g);
  const lt = new THREE.PointLight('#fff8e8', 4, 10, 1.5); lt.position.set(L / 2 - 3, FY + H - 0.3, 0); g.add(lt);
  g.userData.colliders = [[-L / 2, L / 2, -W / 2 - 0.05, W / 2 + 0.05]];
  return g;
}
