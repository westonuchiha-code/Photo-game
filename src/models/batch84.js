// Batch 84 (photos/batch84/): a red dry-barrel fire hydrant, a wall-pack light over a grey steel access door, a worn
// yellow bollard, a bakery table of cake slices in clamshells, a cut stump in leaf litter and trees in the photos'
// barks. Textures from tools/tex_84.py. Bakery name, prices and the cast number are made up.
//   b84Mat, makeFireHydrant, makeWallPack, makeSteelDoor, makeWornBollard, makeCakeSlice, makeCakeTable, makeStump,
//   makeBarkTree
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
function cyl(rt, rb, h, mat, x, y, z, p, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
let _ra = null;
function radialAlpha() { if (_ra) return _ra; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 20, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(0.7, '#ddd'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); _ra = new THREE.CanvasTexture(c); return _ra; }
export function b84Mat(name, rx = 1, ry = 1, extra = {}) { return std({ map: tex(name, rx, ry), normalMap: tex(name + '_n', rx, ry, false), roughness: 0.9, ...extra }); }

// ---- fire hydrant -----------------------------------------------------------------------------------------------------
// a dry-barrel hydrant (about 0.8 m above grade, 0.2 m barrel): ground flange, barrel, a bolted upper flange ring, a
// bonnet dome with the pentagon operating nut, a big pumper nozzle to the front and two hose nozzles to the sides, each
// with a cap on a chain. Red enamel, cast number on the barrel. Front (pumper) faces +z.
export function makeFireHydrant(seed = 1) {
  const g = new THREE.Group(); g.name = 'fire_hydrant'; const red = std({ color: '#d0281e', roughness: 0.38, metalness: 0.15 }), dark = std({ color: '#8a1a12', roughness: 0.5 });
  const lp = [[0, 0], [0.16, 0], [0.16, 0.035], [0.12, 0.05], [0.105, 0.07], [0.1, 0.1], [0.1, 0.5], [0.105, 0.53], [0.15, 0.545], [0.15, 0.585], [0.11, 0.6], [0.11, 0.63], [0.1, 0.66], [0.085, 0.7], [0.06, 0.725], [0.03, 0.735], [0, 0.735]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(lp, 40), red); body.castShadow = true; body.receiveShadow = true; g.add(body);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; cyl(0.012, 0.012, 0.03, dark, Math.cos(a) * 0.135, 0.585, Math.sin(a) * 0.135, g, 6); cyl(0.012, 0.012, 0.03, dark, Math.cos(a + 0.4) * 0.14, 0.045, Math.sin(a + 0.4) * 0.14, g, 6); }
  const nut = cyl(0.03, 0.035, 0.05, red, 0, 0.76, 0, g, 5); void nut; cyl(0.045, 0.045, 0.012, red, 0, 0.737, 0, g, 24);
  // cast number on the barrel's front-left (made up)
  const cn = canvasT(256, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#a81a12'; fitText(x, '2017', w / 2, 56, w - 30, 70, F.stencil); });
  const cnm = new THREE.Mesh(new THREE.CylinderGeometry(0.1015, 0.1015, 0.05, 24, 1, true, -0.9, 0.9), std({ map: cn, transparent: true, roughness: 0.5 })); cnm.position.y = 0.45; g.add(cnm);
  // nozzles: (angle around the barrel, height, radius, length)
  const noz = (ang, y, r, len, capR) => { const n = new THREE.Group(); n.position.set(0, y, 0); n.rotation.y = ang; g.add(n);
    const c = cyl(r, r * 1.08, len, red, 0, 0, 0.09 + len / 2, n, 24); c.rotation.x = Math.PI / 2;
    const rim = cyl(r * 1.2, r * 1.2, 0.02, red, 0, 0, 0.09 + len, n, 24); rim.rotation.x = Math.PI / 2;
    const cap = cyl(capR, capR, 0.05, red, 0, 0, 0.09 + len + 0.035, n, 24); cap.rotation.x = Math.PI / 2;
    const cnut = cyl(capR * 0.45, capR * 0.45, 0.025, red, 0, 0, 0.09 + len + 0.07, n, 5); cnut.rotation.x = Math.PI / 2;
    // the cap chain: a sagging run of small links to an eye on the barrel
    const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(V(capR * 0.9 + t * 0.02, -capR * 0.6 - Math.sin(t * Math.PI) * 0.09, 0.09 + len + 0.03 - t * (len + 0.02))); }
    const cc = new THREE.CatmullRomCurve3(pts); for (let i = 0; i < 18; i++) { const p = cc.getPoint(i / 17); const l = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0022, 4, 8), dark); l.position.copy(p); l.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, 0); n.add(l); } };
  noz(0, 0.36, 0.068, 0.07, 0.078);                 // 4.5" pumper
  noz(Math.PI / 2, 0.38, 0.045, 0.06, 0.052); noz(-Math.PI / 2, 0.38, 0.045, 0.06, 0.052);   // 2.5" hose nozzles
  // cracked dry clay pad around the base
  const clay = canvasT(256, 256, (x, w, h) => { const r = rng(seed); x.fillStyle = '#a89a88'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5a5044'; x.lineWidth = 2; for (let i = 0; i < 30; i++) { x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 60; py += (r() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); } x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.arc(w / 2, h / 2, 30, 0, 7); x.fill(); });
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.34, 28), std({ map: clay, alphaMap: radialAlpha(), roughness: 1, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.004; g.add(pad);
  g.userData.collider = [-0.2, 0.2, -0.2, 0.28];
  return g;
}
// ---- wall pack light + steel door -----------------------------------------------------------------------------------
export function makeWallPack(on = true) {
  const g = new THREE.Group(); g.name = 'wall_pack'; const bronze = std({ color: '#4a3e30', metalness: 0.6, roughness: 0.45 });
  // a sloped hood (a box with the front top edge pulled back), a frosted lens under it, two screws
  const hood = new THREE.BoxGeometry(0.32, 0.16, 0.2); const p = hood.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0 && p.getZ(i) > 0) p.setZ(i, p.getZ(i) - 0.06); hood.computeVertexNormals();
  const h = new THREE.Mesh(hood, bronze); h.position.set(0, 0.06, 0.1); h.castShadow = true; g.add(h);
  box(0.3, 0.1, 0.02, std({ color: '#1a1a1a' }), 0, -0.04, 0.19, g);
  plane(0.26, 0.08, std({ color: '#f4f2e8', emissive: on ? '#ffe8c0' : '#000000', emissiveIntensity: 1.6, roughness: 0.4 }), 0, -0.04, 0.201, 0, g);
  for (const s of [-1, 1]) cyl(0.006, 0.006, 0.01, std({ color: '#c8ccd0', metalness: 0.9 }), s * 0.1, 0.11, 0.07, g, 8);
  if (on) { const l = new THREE.SpotLight('#ffe0b0', 6, 7, 1.0, 0.7, 1.4); l.position.set(0, -0.05, 0.25); l.target.position.set(0, -3, 1.6); g.add(l, l.target); }
  return g;
}
export function makeSteelDoor() {
  const g = new THREE.Group(); g.name = 'steel_access_door';
  box(1.0, 2.15, 0.05, std({ color: '#7a7c74', metalness: 0.5, roughness: 0.4 }), 0, 1.075, 0.0, g);   // frame
  plane(0.9, 2.05, std({ map: tex('b84_steeldoor'), roughness: 0.55, metalness: 0.35 }), 0, 1.04, 0.027, 0, g);
  const lever = new THREE.Group(); lever.position.set(0.33, 1.0, 0.04); g.add(lever); cyl(0.03, 0.03, 0.02, std({ color: '#b8bcc0', metalness: 0.9 }), 0, 0, 0, lever, 16).rotation.x = Math.PI / 2; box(0.13, 0.02, 0.02, std({ color: '#b8bcc0', metalness: 0.9 }), -0.05, 0, 0.02, lever);
  const sg = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#c81e1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'NO ENTRY · STAFF ONLY', w / 2, 50, w - 20, 26, F.label); });
  plane(0.3, 0.11, std({ map: sg }), 0, 1.6, 0.028, 0, g);
  return g;
}
// worn steel bollard: the peeling yellow paint wrap (blue + grey under-layers, rust at the base), a dome cap
export function makeWornBollard(seed = 1) {
  const g = new THREE.Group(); g.name = 'worn_bollard'; const r = rng(seed);
  const m = b84Mat('b84_bollard', 3, 1, { roughness: 0.7 }); m.map.offset.x = r(); m.normalMap.offset.x = m.map.offset.x;
  const b = cyl(0.11, 0.11, 1.05, m, 0, 0.525, 0, g, 28); void b;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#e8c840', roughness: 0.6 })); cap.position.y = 1.05; cap.castShadow = true; g.add(cap);
  g.userData.collider = [-0.13, 0.13, -0.13, 0.13];
  return g;
}

// ---- bakery cake slices -------------------------------------------------------------------------------------------
const CAKES = {
  strawberry: { layers: ['#f4d8d0', '#e8a8b0', '#f4d8d0', '#e8a8b0'], icing: '#f8f0e4', crumbs: '#e86a8a', name: 'STRAWBERRY CAKE', price: '4.49' },
  fudge: { layers: ['#f2d070', '#5a2a14', '#f2d070', '#5a2a14'], icing: '#3a1a0c', crumbs: null, pearls: true, name: 'YELLOW CAKE · FUDGE', price: '4.49' },
  redvelvet: { layers: ['#9a1a24', '#f4ece0', '#9a1a24', '#f4ece0'], icing: '#f4ece0', crumbs: '#8a1a1e', name: 'RED VELVET', price: '4.99' },
  caramel: { layers: ['#f2e0b0', '#c88a3a', '#f2e0b0', '#c88a3a'], icing: '#c8823a', crumbs: '#f4e8d0', name: 'SALTED CARAMEL', price: '4.99' },
  confetti: { layers: ['#f8f0e0', '#f4ece0', '#f8f0e0', '#f4ece0'], icing: '#fbf8f0', sprinkles: true, name: 'CONFETTI CAKE', price: '3.99' },
  chocolate: { layers: ['#3a1a0e', '#6a3a1e', '#3a1a0e', '#6a3a1e'], icing: '#2a1208', crumbs: '#5a2a14', name: 'TRIPLE CHOCOLATE', price: '4.99' } };
// one slice: a rectangular slab of layer bands with combed icing ridges on top (a ridged plane), crumbs/pearls/sprinkles,
// in a clear clamshell with a round bakery sticker and a white SELL BY label
export function makeCakeSlice(kind = 'strawberry', seed = 1) {
  const g = new THREE.Group(); g.name = 'cake_slice_' + kind; const c = CAKES[kind], r = rng(seed); const W = 0.11, D = 0.085, H = 0.06;
  const band = canvasT(64, 128, (x, w, h) => { const n = c.layers.length; c.layers.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * h / n, w, h / n); }); for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.12})`; x.fillRect(r() * w, r() * h, 2, 2); } });
  const side = std({ map: band, roughness: 0.85 }), top = std({ color: c.layers[0] });
  box(W, H, D, [side, side, top, top, side, side], 0, H / 2 + 0.006, 0, g);
  const ic = new THREE.PlaneGeometry(W, D, 40, 4); const p = ic.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.004 + 0.0025 * Math.sin(p.getX(i) * 380)); ic.computeVertexNormals();
  const icing = new THREE.Mesh(ic, phys({ color: c.icing, roughness: 0.35, clearcoat: 0.3 })); icing.rotation.x = -Math.PI / 2; icing.position.y = H + 0.006; g.add(icing);
  box(W, 0.008, 0.002, std({ color: c.icing }), 0, H + 0.008, D / 2, g);
  if (c.crumbs) for (let i = 0; i < 40; i++) { const s = sphere(0.0018 + r() * 0.002, std({ color: c.crumbs, roughness: 0.9 }), (r() - 0.5) * W * 0.9, H + 0.011, (r() - 0.5) * D * 0.9, g, 5, 4); s.scale.y = 0.6; }
  if (c.pearls) for (let i = 0; i < 9; i++) sphere(0.004, phys({ color: i % 3 ? '#f4ece0' : '#5a2a14', roughness: 0.25, clearcoat: 1 }), (r() - 0.5) * W * 0.8, H + 0.013, (r() - 0.5) * D * 0.8, g, 8, 6);
  if (c.sprinkles) for (let i = 0; i < 30; i++) { const s = box(0.005, 0.0015, 0.0015, std({ color: ['#e8402a', '#2a8ad8', '#f2c21a', '#3ab84a', '#f28ab8'][i % 5] }), (r() - 0.5) * W * 0.9, H + 0.011, (r() - 0.5) * D * 0.9, g); s.rotation.y = r() * 3; }
  // the clamshell: a clear base tray + a hinged domed lid (rounded boxes), a bakery sticker + a SELL BY label on the lid
  const clear = phys({ color: '#ffffff', transparent: true, opacity: 0.07, roughness: 0.03, clearcoat: 1, depthWrite: false, side: THREE.FrontSide });
  const base = new THREE.Mesh(new RoundedBoxGeometry(W + 0.03, 0.03, D + 0.03, 3, 0.008), clear); base.position.y = 0.015; g.add(base);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W + 0.034, H + 0.025, D + 0.034, 3, 0.015), clear); lid.position.y = 0.03 + (H + 0.025) / 2; lid.renderOrder = 2; g.add(lid);
  const st = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#c8e8ec'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.strokeStyle = '#3a5a60'; x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.stroke(); x.fillStyle = '#3a5a60'; fitText(x, 'SUGARLEAF', 64, 50, 96, 18, F.label); fitText(x, 'BAKERY', 64, 72, 80, 16, F.label); fitText(x, '♥', 64, 94, 20, 18, F.label); });
  const s1 = plane(0.04, 0.04, std({ map: st, transparent: true }), -0.035, 0.03 + H + 0.026, 0.0, 0, g); s1.rotation.x = -Math.PI / 2;
  const lb = canvasT(160, 96, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, c.name, w / 2, 18, w - 12, 14, F.label); fitText(x, 'SELL BY 11/24', w / 2, 44, w - 30, 16, F.label); x.font = `bold 26px ${F.label}`; x.textAlign = 'center'; x.fillText('$' + c.price, w / 2, 82); });
  const l2 = plane(0.05, 0.03, std({ map: lb }), 0.03, 0.03 + H + 0.026, 0.012, 0, g); l2.rotation.x = -Math.PI / 2; l2.rotation.z = 0.1;
  return g;
}
// a bakery table: two wood shelves on a black frame, rows of slices on top, chocolate slabs on the lower shelf, a black
// sign stand with the bakery card
export function makeCakeTable(seed = 84) {
  const g = new THREE.Group(); g.name = 'cake_table'; const r = rng(seed); const W = 1.5, D = 0.75;
  const wood = std({ map: tex('wood_floor', 1, 0.5), roughness: 0.6 }), blk = std({ color: '#1a1a1c', metalness: 0.5 });
  box(W, 0.035, D, wood, 0, 0.82, 0, g); box(W - 0.06, 0.03, D - 0.06, wood, 0, 0.3, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.035, 0.82, 0.035, blk, sx * (W / 2 - 0.03), 0.41, sz * (D / 2 - 0.03), g);
  const kinds = Object.keys(CAKES); let n = 0;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { if (r() < 0.12) continue; const k = kinds[(i + j * 3 + Math.floor(r() * 2)) % kinds.length]; const s = makeCakeSlice(k, ++n); s.position.set(-W / 2 + 0.11 + i * 0.18, 0.8375, -D / 2 + 0.12 + j * 0.17); s.rotation.y = (r() - 0.5) * 0.2; if (j < 3 && r() < 0.3) s.position.y += 0.002; g.add(s); }
  // a second, stacked layer on the back row
  for (let i = 0; i < 6; i++) { const s = makeCakeSlice(kinds[i % kinds.length], 100 + i); s.position.set(-W / 2 + 0.2 + i * 0.22, 0.8375 + 0.118, -D / 2 + 0.12); s.rotation.y = 0.1; g.add(s); }
  // lower shelf: chocolate slabs in big clear boxes
  for (let i = 0; i < 4; i++) { const cb = new THREE.Group(); cb.position.set(-0.5 + i * 0.33, 0.315, 0.05); g.add(cb); box(0.26, 0.07, 0.2, std({ color: '#2a140a', roughness: 0.5 }), 0, 0.035, 0, cb); for (let k = 0; k < 6; k++) box(0.04, 0.004, 0.18, std({ color: '#3a1e10' }), -0.1 + k * 0.04, 0.072, 0, cb); const lid = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.09, 0.22, 3, 0.01), phys({ color: '#fff', transparent: true, opacity: 0.15, roughness: 0.05, depthWrite: false })); lid.position.y = 0.045; cb.add(lid); }
  // the sign stand: a black post + frame with a card
  const card = canvasT(256, 192, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a5a60'; fitText(x, 'SUGARLEAF BAKERY', w / 2, 40, w - 30, 28, F.label); x.fillStyle = '#111'; fitText(x, 'single slices', w / 2, 90, w - 60, 30, F.script); x.fillStyle = '#c81e1e'; fitText(x, '2 for $8', w / 2, 146, w - 60, 40, F.heavy); });
  const ss = new THREE.Group(); ss.position.set(W / 2 - 0.12, 0.8375, 0.1); g.add(ss); cyl(0.07, 0.07, 0.01, blk, 0, 0.005, 0, ss, 20); rod(V(0, 0, 0), V(0, 0.3, 0), 0.006, blk, ss); box(0.22, 0.17, 0.008, blk, 0, 0.4, 0, ss); plane(0.2, 0.15, std({ map: card }), 0, 0.4, 0.005, 0, ss);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
// ---- stump + bark trees ---------------------------------------------------------------------------------------------
export function makeStump(seed = 1) {
  const g = new THREE.Group(); g.name = 'cut_stump'; const R = 0.24, H = 0.14;
  const side = b84Mat('b84_bark_scored', 2, 0.3); const top = std({ map: tex('b84_stumptop'), transparent: true, alphaTest: 0.5, roughness: 0.8 });
  const s = cyl(R * 0.97, R * 1.08, H, side, 0, H / 2, 0, g, 28); void s;
  const t = new THREE.Mesh(new THREE.CircleGeometry(R * 1.02, 32), top); t.rotation.x = -Math.PI / 2; t.position.y = H + 0.001; g.add(t);
  const ch = cyl(0.11, 0.12, 0.05, side, 0.38, 0.025, -0.25, g, 18); void ch; const t2 = new THREE.Mesh(new THREE.CircleGeometry(0.115, 24), top); t2.rotation.x = -Math.PI / 2; t2.position.set(0.38, 0.051, -0.25); g.add(t2);
  const litter = new THREE.Mesh(new THREE.CircleGeometry(1.4, 28), b84Mat('b84_litter', 2, 2, { transparent: true, alphaMap: radialAlpha(), depthWrite: false })); litter.rotation.x = -Math.PI / 2; litter.position.y = 0.02; litter.receiveShadow = true; g.add(litter);
  const r = rng(seed), twig = std({ color: '#c8b8a0', roughness: 0.9 }); for (let i = 0; i < 10; i++) { const a = r() * 6.28, d = 0.3 + r() * 0.9; rod(V(Math.cos(a) * d, 0.03, Math.sin(a) * d), V(Math.cos(a) * d + (r() - 0.5) * 0.6, 0.03, Math.sin(a) * d + (r() - 0.5) * 0.6), 0.006, twig, g, 4); }
  g.userData.collider = [-R, R, -R, R];
  return g;
}
// a broadleaf tree with one of the three barks (scored, shaggy, split): a lathe trunk with a flare, two main limbs, a
// clumped crown
export function makeBarkTree(kind = 'shaggy', seed = 1, H = 6) {
  const g = new THREE.Group(); g.name = 'bark_tree_' + kind; const r = rng(seed);
  const bark = b84Mat('b84_bark_' + kind, 1.5, H / 1.2);
  const pr = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pr.push(new THREE.Vector2(0.17 + 0.16 * Math.pow(1 - t, 6) - 0.06 * t, t * H * 0.6)); }
  const tr = new THREE.Mesh(new THREE.LatheGeometry(pr, 18), bark); tr.castShadow = true; g.add(tr);
  const tops = []; for (let k = 0; k < 3; k++) { const a = k * 2.1 + r(); const end = V(Math.cos(a) * 1.4, H * 0.85, Math.sin(a) * 1.4); rod(V(0, H * 0.55, 0), end, 0.08, bark, g, 10); tops.push(end); }
  const leaf = std({ color: '#5a7a3a', roughness: 0.9, flatShading: true }), leaf2 = std({ color: '#7a8a3a', roughness: 0.9, flatShading: true });
  for (const t of [...tops, V(0, H * 0.95, 0)]) for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.5, 1), i % 2 ? leaf : leaf2); c.position.set(t.x + (r() - 0.5) * 1.2, t.y + (r() - 0.3) * 0.8, t.z + (r() - 0.5) * 1.2); c.scale.y = 0.75; c.castShadow = true; g.add(c); }
  g.userData.collider = [-0.3, 0.3, -0.3, 0.3];
  return g;
}
