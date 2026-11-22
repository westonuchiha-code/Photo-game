// Batch 85 (photos/batch85/): store-front pieces (cookie tower, flyer shelf + service counter, laundry/bleach aisle, a
// folded wet-floor sign + concrete bollard), park pieces (domed trash can, barrel can on a post, a slatted bench with a
// white ball) and a creek with a twin-culvert headwall. All stores, brands, prices and offers made up.
//   b85Mat, makeCookieTower, makeFlyerShelf, makeServiceCounter, makeLaundryGondola, makeWetFloorFolded,
//   makeConcreteBollard, makeDomedTrashCan, makeBarrelTrashPost, makeSlatBench, makeCreekCrossing
import * as THREE from 'three';
import { NORMAL_OF } from '../normals.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1, srgb = true) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M4 = new THREE.Matrix4();
export function b85Mat(name, rx = 1, ry = 1, extra = {}) { const o = { map: tex(name, rx, ry), roughness: 0.85, ...extra }; if (NORMAL_OF[name]) o.normalMap = tex(NORMAL_OF[name], rx, ry, false); return std(o); }
// a printed flyer sheet (weekly ad / coupons / pamphlet) — made-up store "Hearth Market"
function flyerT(kind, seed) { return canvasT(256, 330, (x, w, h) => { const r = rng(seed);
  if (kind === 'weekly') { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, 40); x.fillStyle = '#fff'; fitText(x, 'WEEKLY DEALS', w / 2, 22, w - 30, 26, F.heavy);
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) { x.fillStyle = `hsl(${r() * 360},55%,60%)`; x.fillRect(10 + i * 82, 50 + j * 54, 34, 34); x.fillStyle = '#c81e1e'; x.font = `bold 15px ${F.label}`; x.fillText('$' + (1 + Math.floor(r() * 9)) + '.' + (Math.floor(r() * 9)) + '9', 48 + i * 82, 70 + j * 54); x.fillStyle = '#333'; x.fillRect(48 + i * 82, 76 + j * 54, 30, 4); } }
  else if (kind === 'big') { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'big week', w / 2, 40, w - 40, 40, F.script); fitText(x, 'DEALS', w / 2, 84, w - 40, 46, F.heavy); x.fillStyle = '#fff'; x.fillRect(20, 120, 100, 90); x.fillRect(136, 120, 100, 90); x.fillStyle = '#c81e1e'; x.beginPath(); x.arc(70, 250, 34, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, '$14⁹⁹', 70, 252, 60, 22, F.heavy); for (let i = 0; i < 4; i++) { x.fillStyle = '#333'; x.fillRect(130, 230 + i * 14, 100, 6); } }
  else { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = `hsl(${r() * 360},50%,45%)`; x.fillRect(0, 0, w, 60); x.fillStyle = '#fff'; fitText(x, ['COUPONS', 'PHARMACY', 'FUEL POINTS', 'RECIPES'][seed % 4], w / 2, 32, w - 30, 26, F.heavy); x.fillStyle = '#333'; for (let i = 0; i < 14; i++) x.fillRect(16, 80 + i * 16, 100 + r() * 110, 5); } }); }
const paperEdge = std({ color: '#f2f0ea', roughness: 0.9 });
function flyerStack(p, kind, seed, x, y, z, w = 0.22, d = 0.28, n = 30, ry = 0) { const m = box(w, n * 0.0012, d, [paperEdge, paperEdge, std({ map: flyerT(kind, seed), roughness: 0.8 }), paperEdge, paperEdge, paperEdge], x, y + n * 0.0006, z, p); m.rotation.y = ry; return m; }

// ---- cookie tower ------------------------------------------------------------------------------------------------
// a four-tier pale-blue corrugated display: each tier a tray with a printed front lip, clamshells of frosted sugar
// cookies with red + chocolate sprinkles, a yellow $5 tag
function cookiePack(p, x, y, z, seed) { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); const r = rng(seed);
  const clear = phys({ color: '#fff', transparent: true, opacity: 0.2, roughness: 0.05, clearcoat: 1, depthWrite: false });
  for (let i = 0; i < 6; i++) { const c = cyl(0.035, 0.035, 0.012, std({ color: '#f6e8d8', roughness: 0.7 }), -0.08 + (i % 3) * 0.08, 0.012, -0.035 + Math.floor(i / 3) * 0.07, g, 18); const ic = cyl(0.03, 0.033, 0.006, std({ color: ['#fbf4f0', '#f4c8d8'][i % 2], roughness: 0.4 }), c.position.x, 0.021, c.position.z, g, 18); void ic;
    for (let k = 0; k < 6; k++) { const s = box(0.006, 0.002, 0.002, std({ color: k % 2 ? '#c81e1e' : '#4a2412' }), c.position.x + (r() - 0.5) * 0.045, 0.025, c.position.z + (r() - 0.5) * 0.045, g); s.rotation.y = r() * 3; } }
  const lid = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.05, 0.16, 3, 0.012), clear); lid.position.y = 0.025; g.add(lid); return g; }
export function makeCookieTower() {
  const g = new THREE.Group(); g.name = 'cookie_tower'; const blue = std({ color: '#7ac8d8', roughness: 0.85 }), W = 0.6, D = 0.42;
  const lip = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#7ac8d8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'baked here', w * 0.3, 50, 220, 40, F.script); fitText(x, 'FRESH  |  FOR YOU', w * 0.3, 98, 240, 26, F.label); x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < w; i += 6) x.fillRect(i, 0, 2, h); });
  for (let k = 0; k < 4; k++) { const y = 0.12 + k * 0.32; box(W, 0.02, D, blue, 0, y, 0, g); box(W, 0.12, 0.02, [blue, blue, blue, blue, std({ map: lip }), blue], 0, y + 0.05, D / 2, g); for (const s of [-1, 1]) box(0.02, 0.32, D, blue, s * W / 2, y + 0.16, 0, g); box(W, 0.32, 0.02, blue, 0, y + 0.16, -D / 2, g);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) cookiePack(g, -0.14 + i * 0.28, y + 0.01, -0.09 + j * 0.18, k * 10 + i * 2 + j); }
  box(W + 0.04, 0.12, D + 0.04, blue, 0, 0.06, 0, g);
  const tag = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'Frosted Sugar Cookies', w * 0.4, 30, 180, 18, F.label); fitText(x, '6 ct', w * 0.4, 56, 100, 16, F.small); fitText(x, '$5', w * 0.78, 92, 90, 90, F.heavy); });
  plane(0.22, 0.14, std({ map: tag }), 0.1, 1.2, D / 2 + 0.014, 0, g);
  const bx = box(0.62, 0.3, 0.44, std({ color: '#c8a070', roughness: 0.9 }), 0, 1.45 + 0.04, 0, g); bx.scale.set(1, 0.6, 1);
  g.userData.collider = [-W / 2 - 0.02, W / 2 + 0.02, -D / 2 - 0.02, D / 2 + 0.02];
  return g;
}
// oak flyer shelf: rounded sides, three shelves, brass corner caps, stacks of flyers + coupon pads
export function makeFlyerShelf() {
  const g = new THREE.Group(); g.name = 'flyer_shelf'; const oak = std({ map: tex('b82_oak', 1, 1), color: '#a86a3a', roughness: 0.5 }), brass = b85Mat('b85_bronze', 0.3, 0.3, { metalness: 0.85, roughness: 0.3, color: '#e8c070' });
  const W = 1.0, D = 0.42, H = 0.85;
  const sd = new THREE.Shape(); sd.moveTo(0, 0); sd.lineTo(D, 0); sd.lineTo(D, H - 0.12); sd.quadraticCurveTo(D, H, D - 0.12, H); sd.lineTo(0, H); sd.closePath();
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sd, { depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }), oak); m.rotation.y = -Math.PI / 2; m.position.set(s * W / 2 + (s > 0 ? 0.03 : 0), 0, -D / 2); m.castShadow = true; g.add(m); const cap = box(0.045, 0.03, 0.045, brass, s * (W / 2 + 0.015), H - 0.01, D / 2 - 0.02, g); void cap; }
  box(W, H, 0.02, oak, 0, H / 2, -D / 2 + 0.01, g);
  const kinds = ['weekly', 'big', 'other']; let n = 0;
  for (let k = 0; k < 3; k++) { const y = 0.06 + k * 0.28; box(W, 0.025, D, oak, 0, y, 0, g); box(W, 0.05, 0.02, oak, 0, y + 0.03, D / 2 - 0.01, g);
    for (let i = 0; i < 3; i++) { const fs = flyerStack(g, kinds[(k + i) % 3], ++n, -0.32 + i * 0.32, y + 0.013, 0.0, 0.24, 0.3, 20 + (n * 7) % 30, (i - 1) * 0.06); fs.rotation.x = -0.12; } }
  g.userData.collider = [-W / 2 - 0.04, W / 2 + 0.04, -D / 2, D / 2];
  return g;
}
// the service counter behind it: wood front, granite-look (quartz) top, taped notices, a NOW HIRING stand-up card
export function makeServiceCounter() {
  const g = new THREE.Group(); g.name = 'service_counter'; const W = 2.6, D = 0.7, H = 1.05;
  box(W, H, D, std({ color: '#e8e0cc', roughness: 0.7 }), 0, H / 2, 0, g); box(W + 0.06, 0.04, D + 0.06, std({ map: tex('b82_quartz', 3, 1), color: '#c8bca8', roughness: 0.35 }), 0, H + 0.02, 0, g);
  box(W, 0.06, 0.03, std({ map: tex('b82_oak', 3, 0.2), color: '#a86a3a' }), 0, H - 0.03, D / 2 + 0.03, g);
  const note = (t1, s) => canvasT(256, 330, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, t1, w / 2, 30, w - 30, 22, F.label); const r = rng(s); for (let i = 0; i < 18; i++) x.fillRect(16, 60 + i * 14, 120 + r() * 100, 4); });
  const tape = std({ color: '#f4ecd0', transparent: true, opacity: 0.6 });
  [['Return policy', -0.9], ['Gift cards', -0.4], ['Lottery hours', 0.6]].forEach(([t, x], i) => { const p = plane(0.28, 0.36, std({ map: note(t, i + 3) }), x, H + 0.042, 0.05, 0, g); p.rotation.x = -Math.PI / 2; plane(0.06, 0.02, tape, x, H + 0.043, -0.12, 0, g).rotation.x = -Math.PI / 2; });
  const nh = canvasT(256, 320, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; x.fillRect(0, 0, w, 70); x.fillStyle = '#fff'; fitText(x, 'NOW HIRING', w / 2, 38, w - 30, 40, F.heavy); x.fillStyle = '#1e4ab8'; ['Clerks · Cashiers', 'Bakery · Deli', 'Night Stock'].forEach((l, i) => fitText(x, l, w / 2, 110 + i * 40, w - 40, 26, F.label)); x.fillStyle = '#111'; fitText(x, 'ask at the service desk', w / 2, 270, w - 40, 18, F.small); });
  const card = new THREE.Group(); card.position.set(0.0, H + 0.04, 0.1); g.add(card); const cm = std({ map: nh, side: THREE.DoubleSide }); const a = plane(0.22, 0.28, cm, 0, 0.14, 0.03, 0, card); a.rotation.x = -0.15; const b = plane(0.22, 0.28, std({ color: '#fbfbf8', side: THREE.DoubleSide }), 0, 0.14, -0.03, 0, card); b.rotation.x = 0.15;
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2 + 0.05];
  return g;
}
// laundry aisle gondola: bleach gallon jugs (lathe bodies + handle) on the lower shelves, sanitizer bottles with coloured
// caps on the top shelves, e-ink price strips — made-up brands (BRIGHTWAY, PURELINE, store brand HEARTH)
export function makeLaundryGondola(L = 10, seed = 85) {
  const g = new THREE.Group(); g.name = 'laundry_gondola'; const H = 1.8, D = 1.0, r = rng(seed);
  box(L, H, 0.06, std({ color: '#e8e8e4' }), 0, H / 2, 0, g); box(L, 0.15, D, std({ color: '#e8e8e4' }), 0, 0.075, 0, g);
  // jug geometry: a rounded box body with a neck, and a handle loop; instanced per label design
  const jugBody = new RoundedBoxGeometry(0.15, 0.24, 0.15, 3, 0.03); jugBody.translate(0, 0.12, 0);
  const labelDesigns = [['BRIGHTWAY', 'BLEACH', '#1e4ab8', '#e8302a'], ['BRIGHTWAY', 'NO-SPLASH', '#1e4ab8', '#2a8ad8'], ['PURELINE', 'LAVENDER', '#7a4ab8', '#c8a8e8'], ['HEARTH', 'BLEACH', '#2a6a5a', '#f2c21a']];
  const labT = canvasT(512, 128, (x, w, h) => { labelDesigns.forEach(([b, n, c1, c2], i) => { const x0 = i * 128; x.fillStyle = '#f4f6f8'; x.fillRect(x0, 0, 128, h); x.fillStyle = c1; x.fillRect(x0 + 6, 30, 116, 70); x.fillStyle = c2; x.beginPath(); x.moveTo(x0 + 6, 70); x.bezierCurveTo(x0 + 40, 40, x0 + 80, 100, x0 + 122, 60); x.lineTo(x0 + 122, 100); x.lineTo(x0 + 6, 100); x.fill(); x.fillStyle = '#fff'; fitText(x, b, x0 + 64, 46, 104, 18, F.heavy); fitText(x, n, x0 + 64, 84, 104, 16, F.label); }); });
  const jugGeos = labelDesigns.map((_, i) => { const gg = jugBody.clone(); const uv = gg.attributes.uv, pos = gg.attributes.position, nm = gg.attributes.normal; for (let k = 0; k < uv.count; k++) { if (nm.getZ(k) > 0.7) uv.setXY(k, (i + (pos.getX(k) + 0.075) / 0.15) / 4, (pos.getY(k) - 0.02) / 0.2); else uv.setXY(k, (i + 0.05) / 4, 0.05); } return gg; });
  const jugM = std({ map: labT, roughness: 0.45 }); const capM = std({ color: '#1e4ab8', roughness: 0.4 }), white = std({ color: '#f4f6f8', roughness: 0.45 });
  const bottle = new THREE.LatheGeometry([[0, 0], [0.055, 0], [0.06, 0.02], [0.06, 0.2], [0.04, 0.25], [0.025, 0.27], [0, 0.27]].map(([a, b]) => new THREE.Vector2(a, b)), 16);
  const buckets = labelDesigns.map(() => []), bottles = [], caps = [], tags = [];
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const y = 0.17 + k * 0.33; box(L, 0.02, 0.42, std({ color: '#d8dadc', metalness: 0.5 }), 0, y, s * 0.24, g);
      let x = -L / 2 + 0.1; while (x < L / 2 - 0.15) { const d = Math.floor(r() * 4), facings = 2 + Math.floor(r() * 4);
        for (let f = 0; f < facings && x < L / 2 - 0.12; f++) { for (let q = 0; q < 2; q++) { const zz = s * (0.38 - q * 0.17); if (k < 3) buckets[d].push([x, y + 0.01, zz, s]); else { bottles.push([x, y + 0.01, zz]); caps.push([x, y + 0.29, zz, ['#2a6ad8', '#3ab84a', '#7a4ab8'][d % 3]]); } } x += k < 3 ? 0.165 : 0.13; }
        tags.push([x - facings * 0.08, y - 0.02, s * 0.46, s]); x += 0.03; } }
  buckets.forEach((list, i) => { const im = new THREE.InstancedMesh(jugGeos[i], jugM, list.length); const q = new THREE.Quaternion(); list.forEach(([x, y, z, s], j) => { q.setFromAxisAngle(V(0, 1, 0), s > 0 ? 0 : Math.PI); M4.compose(V(x, y, z), q, V(1, 1, 1)); im.setMatrixAt(j, M4); }); im.castShadow = true; g.add(im);
    const ci = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), capM, list.length); list.forEach(([x, y, z], j) => { M4.makeTranslation(x + 0.03, y + 0.25, z); ci.setMatrixAt(j, M4); }); g.add(ci);
    const hi = new THREE.InstancedMesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12, Math.PI), white, list.length); list.forEach(([x, y, z], j) => { M4.makeTranslation(x - 0.03, y + 0.22, z); hi.setMatrixAt(j, M4); }); g.add(hi); });
  const bi = new THREE.InstancedMesh(bottle, std({ color: '#f4f6f8', roughness: 0.4 }), bottles.length); bottles.forEach(([x, y, z], j) => { M4.makeTranslation(x, y, z); bi.setMatrixAt(j, M4); }); g.add(bi);
  for (const c of ['#2a6ad8', '#3ab84a', '#7a4ab8']) { const list = caps.filter((q) => q[3] === c); const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12), std({ color: c, roughness: 0.4 }), list.length); list.forEach(([x, y, z], j) => { M4.makeTranslation(x, y, z); im.setMatrixAt(j, M4); }); g.add(im); }
  const tagT = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#e4e6e2'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, '$7.79', 44, 32, 76, 30, F.label, { weight: 700 }); x.fillStyle = '#c81e28'; x.fillRect(88, 12, 30, 14); });
  const ti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.075, 0.038), std({ map: tagT, side: THREE.DoubleSide }), tags.length); const q = new THREE.Quaternion(); tags.forEach(([x, y, z, s], j) => { q.setFromAxisAngle(V(0, 1, 0), s > 0 ? 0 : Math.PI); M4.compose(V(x, y, z), q, V(1, 1, 1)); ti.setMatrixAt(j, M4); }); g.add(ti);
  const aisle = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#1e6a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'AISLE 9', w / 2, 46, w - 30, 44, F.heavy); fitText(x, 'laundry · bleach · paper', w / 2, 112, w - 20, 22, F.label); });
  plane(1.0, 0.62, std({ map: aisle, side: THREE.DoubleSide }), L / 2 + 0.1, 2.9, 0, Math.PI / 2, g); rod(V(L / 2 + 0.1, 3.21, 0), V(L / 2 + 0.1, 5.2, 0), 0.01, std({ color: '#888' }), g);
  g.userData.collider = [-L / 2, L / 2, -D / 2, D / 2];
  return g;
}
// a yellow A-frame CAUTION / WET FLOOR sign folded flat and lying on the ground, and a fat grey concrete bollard
export function makeWetFloorFolded() {
  const g = new THREE.Group(); g.name = 'wet_floor_folded'; const y = std({ color: '#f2d21a', roughness: 0.45 });
  const t = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.beginPath(); x.roundRect(80, 16, 96, 40, 18); x.fill(); x.fillStyle = '#f2d21a'; x.beginPath(); x.roundRect(92, 26, 72, 20, 10); x.fill(); x.fillStyle = '#111'; fitText(x, 'CAUTION', w / 2, 110, w - 30, 44, F.heavy); fitText(x, 'PRECAUCIÓN', w / 2, 150, w - 40, 22, F.label);
    x.lineWidth = 8; x.strokeStyle = '#111'; x.beginPath(); x.moveTo(w / 2, 190); x.lineTo(w / 2 + 80, 330); x.lineTo(w / 2 - 80, 330); x.closePath(); x.stroke(); x.beginPath(); x.arc(w / 2 + 8, 228, 10, 0, 7); x.fill(); x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2 + 6, 240); x.lineTo(w / 2 - 6, 280); x.lineTo(w / 2 + 20, 300); x.moveTo(w / 2 - 6, 280); x.lineTo(w / 2 - 34, 300); x.moveTo(w / 2 + 2, 252); x.lineTo(w / 2 + 34, 262); x.stroke();
    fitText(x, 'WET FLOOR', w / 2, 380, w - 30, 40, F.heavy); fitText(x, 'PISO MOJADO', w / 2, 420, w - 40, 22, F.label); });
  const s = box(0.3, 0.025, 0.62, [y, y, std({ map: t, roughness: 0.45 }), y, y, y], 0, 0.0125, 0, g); s.rotation.y = 0.35;
  return g;
}
export function makeConcreteBollard() { const g = new THREE.Group(); g.name = 'concrete_bollard'; const c = b85Mat('b85_crackconc', 1, 1, { color: '#b8b4ac' });
  cyl(0.22, 0.24, 0.8, c, 0, 0.4, 0, g, 28); const d = new THREE.Mesh(new THREE.SphereGeometry(0.22, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), c); d.scale.y = 0.45; d.position.y = 0.8; d.castShadow = true; g.add(d);
  g.userData.collider = [-0.25, 0.25, -0.25, 0.25]; return g; }

// ---- park pieces -----------------------------------------------------------------------------------------------------
// domed park trash can: brown steel dome with a pull lid + a white "TRASH ONLY" disc (cracked), brown straps holding an
// orange liner over a ribbed galvanized can, on a concrete pad
export function makeDomedTrashCan() {
  const g = new THREE.Group(); g.name = 'domed_trash_can'; const brown = std({ color: '#4a2e1e', metalness: 0.4, roughness: 0.5 }), zinc = b85Mat('b85_zinc', 2, 1, { metalness: 0.7, roughness: 0.35 });
  box(0.9, 0.08, 0.9, b85Mat('b85_crackconc', 0.6, 0.6), 0, 0.04, 0, g);
  const lp = []; for (let i = 0; i <= 16; i++) { const y = 0.08 + i / 16 * 0.55; lp.push(new THREE.Vector2(0.24 + (i % 2 ? 0.008 : 0), y)); }
  const can = new THREE.Mesh(new THREE.LatheGeometry(lp, 28), zinc); can.castShadow = true; g.add(can);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.3, 28, 4, true), std({ color: '#f2601a', roughness: 0.55, side: THREE.DoubleSide })); const p = liner.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 + 0.04 * Math.sin(a * 7) * (p.getY(i) < 0 ? 1.5 : 0.5); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } liner.geometry.computeVertexNormals(); liner.position.y = 0.62; g.add(liner);
  for (const y of [0.52, 0.74]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.283, 0.283, 0.05, 28, 1, true), brown); st.position.y = y; g.add(st); }
  // the dome: a half-capsule standing on end (front opening) with a lid flap
  const dm = new THREE.Group(); dm.position.y = 0.77; g.add(dm);
  box(0.5, 0.5, 0.42, brown, 0, 0.25, 0, dm); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.42, 24, 1, false, 0, Math.PI), brown); top.rotation.set(Math.PI / 2, Math.PI / 2, 0); top.rotation.order = 'YXZ'; top.position.y = 0.5; dm.add(top);
  const disc = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#e8e8e4'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.fillStyle = '#4a2e1e'; fitText(x, 'TRASH', 128, 110, 180, 44, F.heavy); fitText(x, 'ONLY', 128, 160, 130, 40, F.heavy); x.strokeStyle = '#8a8a86'; x.lineWidth = 2; x.beginPath(); x.moveTo(20, 140); x.lineTo(90, 130); x.lineTo(130, 170); x.lineTo(236, 150); x.stroke(); x.fillStyle = '#c8c8c4'; x.beginPath(); x.moveTo(30, 180); x.lineTo(70, 200); x.lineTo(40, 220); x.fill(); });
  plane(0.34, 0.34, std({ map: disc, transparent: true, roughness: 0.4 }), 0, 0.28, 0.212, 0, dm);
  const flap = box(0.3, 0.12, 0.02, brown, 0, 0.6, 0.2, dm); flap.rotation.x = 0.25; box(0.12, 0.03, 0.02, std({ color: '#2a1a10' }), 0, 0.53, 0.225, dm);
  g.userData.collider = [-0.45, 0.45, -0.45, 0.45];
  return g;
}
// a rusted steel barrel with a black liner knotted over its rim, tied to a weathered square wooden post
export function makeBarrelTrashPost() {
  const g = new THREE.Group(); g.name = 'barrel_trash_post'; const rust = b85Mat('b84_rust', 2, 1, { roughness: 0.9 });
  const lp = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 0.75; let r = 0.27; if (Math.abs(y - 0.25) < 0.02 || Math.abs(y - 0.5) < 0.02) r = 0.285; lp.push(new THREE.Vector2(r, y)); }
  const b = new THREE.Mesh(new THREE.LatheGeometry(lp, 28), rust); b.castShadow = true; g.add(b);
  const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.29, 0.26, 28, 3, true), phys({ color: '#141414', roughness: 0.25, clearcoat: 0.6, side: THREE.DoubleSide })); const p = bag.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 + 0.06 * Math.sin(a * 9 + p.getY(i) * 8); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } bag.geometry.computeVertexNormals(); bag.position.y = 0.7; g.add(bag);
  const knot = sphere(0.05, phys({ color: '#141414', roughness: 0.25 }), 0.3, 0.6, 0.08, g, 10, 8); knot.scale.set(1.4, 0.8, 1);
  box(0.12, 1.4, 0.12, b85Mat('b82_whitewash', 0.3, 1.4, { color: '#8a6a4a' }), 0.42, 0.7, 0, g);
  g.userData.collider = [-0.3, 0.5, -0.3, 0.3];
  return g;
}
// a black steel bench (curved flat-bar slats, cast ends) with a glossy white ball resting on it
export function makeSlatBench(withBall = true) {
  const g = new THREE.Group(); g.name = 'slat_bench'; const blk = std({ color: '#1a1a1c', metalness: 0.5, roughness: 0.55 }); const L = 1.8;
  for (let i = 0; i < 6; i++) { const a = -0.25 + i * 0.12; const s = box(L, 0.012, 0.06, blk, 0, 0.45 + Math.sin(a) * 0.05 + (i > 3 ? (i - 3) * 0.13 : 0), -0.15 + i * 0.07 - (i > 3 ? (i - 3) * 0.04 : 0), g); s.rotation.x = i > 3 ? -1.2 : 0; }
  for (const s of [-1, 1]) { const end = new THREE.Shape(); end.moveTo(-0.25, 0); end.lineTo(-0.2, 0.45); end.lineTo(-0.28, 0.85); end.lineTo(-0.2, 0.86); end.lineTo(-0.1, 0.45); end.lineTo(0.2, 0.45); end.lineTo(0.25, 0); end.lineTo(0.15, 0); end.lineTo(0.08, 0.36); end.lineTo(-0.08, 0.36); end.lineTo(-0.15, 0); end.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(end, { depth: 0.04, bevelEnabled: false }), blk); m.rotation.y = Math.PI / 2; m.position.set(s * (L / 2 - 0.1) - 0.02, 0, 0.05); m.castShadow = true; g.add(m); }
  if (withBall) { const b = sphere(0.11, phys({ color: '#f4f6f8', roughness: 0.15, clearcoat: 1 }), 0.3, 0.57, 0.02, g, 28, 20); void b; const dimple = new THREE.Mesh(new THREE.CircleGeometry(0.008, 10), std({ color: '#c8ccd0' })); dimple.position.set(0.3, 0.6, 0.128); g.add(dimple); }
  g.userData.collider = [-L / 2, L / 2, -0.3, 0.3];
  return g;
}

// ---- creek + twin culvert -------------------------------------------------------------------------------------------
// a shallow creek running along local z (length Lz) at grade, between raised earth banks (berms 0.55 m high) with dry
// grass + watercress; the path crosses at z = 0 over a concrete headwall with two round pipes, the deck 0.6 m up with
// ramps 2 m long either side (main.js gives the walk height). The ground plane can't be cut, so the creek is built up.
export function makeCreekCrossing(Lz = 30) {
  const g = new THREE.Group(); g.name = 'creek_crossing'; const W = 2.0, BH = 0.55, BW = 1.0, r = rng(85), HALF = 1.4;
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(W, Lz), b85Mat('b85_creekbed', 1, Lz / 2)); bed.rotation.x = -Math.PI / 2; bed.position.y = 0.02; bed.receiveShadow = true; g.add(bed);
  const ripN = tex('b85_creekbed_n', 1.5, Lz / 1.5, false).clone(); ripN.needsUpdate = true; ripN.repeat.set(1.5, Lz / 1.5);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W, Lz), phys({ color: '#6a8a7a', transparent: true, opacity: 0.38, roughness: 0.06, clearcoat: 1, normalMap: ripN, normalScale: new THREE.Vector2(0.35, 0.35), depthWrite: false })); water.rotation.x = -Math.PI / 2; water.position.y = 0.09; g.add(water);
  g.userData.tick = (t) => { ripN.offset.set(Math.sin(t * 0.3) * 0.02, -t * 0.12); };   // polish pass: the creek flows
  // berms: a trapezoid cross-section extruded along z, split at the crossing
  const bermM = b85Mat('b83_sandydirt', 1, 6, { color: '#a89878' });
  for (const s of [-1, 1]) for (const [z0, z1] of [[-Lz / 2, -HALF], [HALF, Lz / 2]]) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.35, BH); sh.lineTo(0.65, BH); sh.lineTo(BW, 0); sh.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }), bermM); m.position.set(s > 0 ? W / 2 : -W / 2 - BW, 0, z0); if (s < 0) { m.scale.x = -1; m.position.x = -W / 2; } m.castShadow = true; m.receiveShadow = true; g.add(m); }
  // headwalls with two pipes, the deck between them, ramps off both ends
  const conc = b85Mat('b85_crackconc', 2, 0.6, { color: '#c8c4bc' }), HW = W / 2 + BW;
  for (const s of [-1, 1]) { const hw = new THREE.Shape(); hw.moveTo(-HW, 0); hw.lineTo(HW, 0); hw.lineTo(HW, 0.6); hw.lineTo(-HW, 0.6); hw.closePath();
    for (const px of [-0.5, 0.5]) { const h = new THREE.Path(); h.absarc(px, 0.25, 0.22, 0, Math.PI * 2, true); hw.holes.push(h); }
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(hw, { depth: 0.25, bevelEnabled: false, curveSegments: 24 }), conc); m.position.z = s > 0 ? HALF - 0.25 : -HALF; m.castShadow = true; m.receiveShadow = true; g.add(m); }
  for (const px of [-0.5, 0.5]) { const pp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, HALF * 2, 24, 1, true), std({ color: '#8a8882', roughness: 0.8, side: THREE.DoubleSide })); pp.rotation.x = Math.PI / 2; pp.position.set(px, 0.25, 0); g.add(pp); }
  box(HW * 2, 0.12, HALF * 2, conc, 0, 0.6, 0, g);
  const pink = b85Mat('b85_pinkconc', 1, 1);
  for (const s of [-1, 1]) { const len = Math.hypot(2.0, 0.66); const rp = box(len, 0.08, 2.4, pink, s * (HW + 1.0), 0.33, 0, g); rp.rotation.z = -s * Math.atan2(0.66, 2.0); }
  // dry grass on the berm tops + slopes, watercress at the water's edge, pale branches in the water
  const grass = std({ color: '#c8a878', roughness: 1, side: THREE.DoubleSide }), cress = std({ color: '#4a8a3a', roughness: 0.8 });
  const blade = new THREE.PlaneGeometry(0.03, 0.6); blade.translate(0, 0.3, 0); const gi = new THREE.InstancedMesh(blade, grass, 1100); const Q = new THREE.Quaternion(), E = new THREE.Euler();
  for (let i = 0; i < 1100; i++) { const s = r() < 0.5 ? -1 : 1, z = (r() - 0.5) * Lz; if (Math.abs(z) < HALF + 0.1) { i--; continue; } const u = r(); const x = s * (W / 2 + u * BW); const y = u < 0.35 ? BH * u / 0.35 : u < 0.65 ? BH : BH * (1 - u) / 0.35; Q.setFromEuler(E.set((r() - 0.5) * 0.6, r() * 6, (r() - 0.5) * 0.6)); M4.compose(V(x, y, z), Q, V(1, 0.6 + r() * 0.9, 1)); gi.setMatrixAt(i, M4); } g.add(gi);
  const ci = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12, 0), cress, 70); for (let i = 0; i < 70; i++) { const s = r() < 0.5 ? -1 : 1, z = (r() - 0.5) * Lz; if (Math.abs(z) < HALF + 0.2) continue; M4.compose(V(s * (W / 2 - 0.1 - r() * 0.15), 0.08, z), Q.setFromEuler(E.set(0, r() * 6, 0)), V(1.2, 0.45, 1.2)); ci.setMatrixAt(i, M4); } g.add(ci);
  for (let i = 0; i < 6; i++) { const z = (r() - 0.5) * (Lz - 6); if (Math.abs(z) < 2.5) continue; rod(V(-0.8 + r() * 0.2, 0.06, z), V(0.7 + r() * 0.2, 0.14, z + (r() - 0.5) * 1.5), 0.025, std({ color: '#d8d0c0', roughness: 0.9 }), g, 6); }
  g.userData.colliders = [[-HW, HW, -Lz / 2, -HALF], [-HW, HW, HALF, Lz / 2]];
  g.userData.crossing = { halfDeck: HW, ramp: 2.0, height: 0.66, halfWidth: 1.2 };
  return g;
}

// polish pass: a kids' slide in the blue pebbled plastic (the unused batch-85 texture): a ladder, a little deck with
// rails, and a curved chute
export function makeKidsSlide() {
  const g = new THREE.Group(); g.name = 'kids_slide'; const blue = b85Mat('b85_blueplastic', 1, 2, { roughness: 0.5 }), yel = std({ color: '#f2c21a', roughness: 0.5 }), steel = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.4 });
  for (const s of [-1, 1]) { rod(V(s * 0.3, 0, -0.9), V(s * 0.3, 1.2, -0.5), 0.03, steel, g); rod(V(s * 0.3, 1.2, -0.5), V(s * 0.3, 1.85, -0.5), 0.025, steel, g); }
  for (let k = 0; k < 5; k++) { const t = (k + 0.5) / 5; rod(V(-0.3, t * 1.2, -0.9 + t * 0.4), V(0.3, t * 1.2, -0.9 + t * 0.4), 0.02, yel, g); }
  box(0.7, 0.06, 0.6, yel, 0, 1.2, -0.2, g); for (const s of [-1, 1]) box(0.04, 0.5, 0.6, blue, s * 0.35, 1.45, -0.2, g);
  // chute: a U-section swept down a curve
  const path = new THREE.CatmullRomCurve3([V(0, 1.22, 0.1), V(0, 0.9, 0.7), V(0, 0.45, 1.4), V(0, 0.28, 2.0)]); const N = 40, pos = [], idx = [];
  for (let i = 0; i <= N; i++) { const p = path.getPoint(i / N); for (let j = 0; j <= 10; j++) { const a = Math.PI * (j / 10); pos.push(-Math.cos(a) * 0.28, p.y + 0.18 - Math.sin(a) * 0.18, p.z); } }
  for (let i = 0; i < N; i++) for (let j = 0; j < 10; j++) { const k = i * 11 + j; idx.push(k, k + 11, k + 1, k + 1, k + 11, k + 12); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const uv = []; for (let i = 0; i <= N; i++) for (let j = 0; j <= 10; j++) uv.push(j / 10, i / N * 3); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cg.setIndex(idx); cg.computeVertexNormals();
  const ch = new THREE.Mesh(cg, Object.assign(blue, { side: THREE.DoubleSide })); ch.castShadow = true; g.add(ch);
  for (const s of [-1, 1]) rod(V(s * 0.28, 0, 1.9), V(s * 0.28, 0.42, 1.9), 0.03, steel, g);
  const mulch = new THREE.Mesh(new THREE.CircleGeometry(2.0, 28), std({ color: '#8a5a32', roughness: 1 })); mulch.rotation.x = -Math.PI / 2; mulch.position.set(0, 0.018, 0.5); mulch.receiveShadow = true; g.add(mulch);
  g.userData.collider = [-0.45, 0.45, -1.0, 2.1];
  return g;
}
