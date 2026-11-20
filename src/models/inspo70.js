// Inspiration 5 (queue item 70, photos/inspo5/). Modelled; surfaces from the photos where they are surfaces
// (tools/tex_70.py). Made-up text, names and prices; stickers redrawn generic (no real characters / bands / logos).
//   makeAqueductGarden()  16 x 10 m pocket garden: two mossy rough-hewn stone aqueduct blocks (one with a square
//                         window through it), a tied bamboo fence, an info board, ferns, hydrangeas, a mushroom-cap
//                         stone lantern, a small tree
//   makeIzakaya()         a weathered two-storey izakaya, 7.5 m wide: tan plaster upper floor with two windows and
//                         lamps on arms, a board fascia with cut-out lettering, a cloth awning, lattice doors covered in
//                         taped labels, charred board walls, a red post box, a little window with an orange hood
//   makePotteryGallery()  9 x 7 m white room with a concrete floor: rough timber wall shelves of tea bowls, a sawhorse
//                         table, black-glazed lumpy ceramic sculptures on the table and the floor
//   makeBookTree()        a tower of stacked old books with candles and a birdcage on top
//   makeBarrelPlanter() / makeCurvedBench() / makeWifiStand() / makeWeepingMaple()   station plaza pieces
//   makePizzaAFrame()     a black A-frame poster for a made-up pizzeria (drawn pizza)
//   makeComicVending()    a vending machine in a comic-style wrap with a street-sign topper (made-up)
//   makeBunBag()          a bun in a clear bag with a round sticker   makeStickerPost()   a pole with street stickers
//   makeMural()           the faded rainbow mural block wall (the photo)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.75, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// a box whose vertices are jittered: rough-hewn stone
function hewn(w, h, d, mat, seed, p) {
  const geo = new THREE.BoxGeometry(w, h, d, 8, 8, 8); const q = geo.attributes.position, r = rng(seed);
  for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i); const n = 0.03 * Math.sin(x * 7 + seed) * Math.cos(y * 6) + 0.02 * Math.sin(z * 9 + y * 4) + (r() - 0.5) * 0.015; q.setXYZ(i, x * (1 + n), y * (1 + n * 0.5), z * (1 + n)); }
  geo.computeVertexNormals(); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(w, d) / 1.2, uv.getY(i) * h / 1.2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
}
// fern + hydrangea + shrub helpers
let _frond = null; function frondTex() { if (_frond) return _frond; _frond = canvasT(64, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#3a6a22'; x.lineWidth = 3; x.beginPath(); x.moveTo(32, h); x.lineTo(32, 4); x.stroke(); for (let i = 0; i < 22; i++) { const y = h - 8 - i * 11, l = 26 * Math.sin(Math.PI * (i + 2) / 25); x.fillStyle = i % 2 ? '#4a8a2a' : '#5a9a32'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(32, y); x.quadraticCurveTo(32 + s * l * 0.6, y - 6, 32 + s * l, y - 2); x.quadraticCurveTo(32 + s * l * 0.6, y + 2, 32, y + 3); x.fill(); } } }); return _frond; }
function fern(p, x, z, s, seed) { const r = rng(seed), m = std({ map: frondTex(), alphaTest: 0.4, side: THREE.DoubleSide }); for (let i = 0; i < 9; i++) { const L = (0.5 + r() * 0.3) * s, geo = new THREE.PlaneGeometry(0.16 * s, L, 1, 5); geo.translate(0, L / 2, 0); const q = geo.attributes.position; for (let k = 0; k < q.count; k++) { const t = q.getY(k) / L; q.setZ(k, t * t * L * 0.5); } const f = new THREE.Mesh(geo, m); f.position.set(x, 0, z); f.rotation.set(-0.4 - r() * 0.3, i / 9 * 6.28, 0, 'YXZ'); p.add(f); } }
function hydrangea(p, x, z, seed) {
  const r = rng(seed), leaf = std({ color: '#3a7a2a', side: THREE.DoubleSide, roughness: 0.6 }), bloom = std({ color: '#5a7ae8', roughness: 0.7 });
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  for (let i = 0; i < 26; i++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), leaf); l.scale.set(0.7, 1, 1); l.position.set((r() - 0.5) * 0.9, 0.2 + r() * 0.7, (r() - 0.5) * 0.9); l.rotation.set(-1.0 + r(), r() * 6, 0); g.add(l); }
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), bloom); b.position.set((r() - 0.5) * 0.7, 0.75 + r() * 0.25, (r() - 0.5) * 0.7); b.scale.y = 0.8; g.add(b); }
}
export function makeStoneLantern() {
  const g = new THREE.Group(); g.name = 'mushroom_lantern'; const s = std({ map: tex('i5_stone', 0.6, 0.6), color: '#a8a89a', roughness: 0.95 });
  cyl(0.18, 0.22, 0.3, s, 0, 0.15, 0, g, 8); cyl(0.12, 0.14, 0.5, s, 0, 0.55, 0, g, 8);
  box(0.36, 0.3, 0.36, s, 0, 0.95, 0, g); const win = box(0.2, 0.16, 0.38, std({ color: '#1a1a14' }), 0, 0.95, 0, g); void win;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), s); cap.scale.y = 0.55; cap.position.y = 1.1; cap.castShadow = true; g.add(cap);
  cyl(0.06, 0.08, 0.1, s, 0, 1.36, 0, g, 10);
  g.userData.collider = [-0.3, 0.3, -0.3, 0.3];
  return g;
}
export function makeAqueductGarden() {
  const g = new THREE.Group(); g.name = 'aqueduct_garden';
  const W = 16, D = 10;
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: tex('tx_mulch', W / 1.5, D / 1.5), color: '#7a6a5a', roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.02; soil.receiveShadow = true; g.add(soil);
  const stone = std({ map: tex('i5_stone'), roughness: 0.95 });
  // the two blocks (2.0 x 1.7 x 1.4 m and 1.9 x 1.5 x 1.3 m), the first with a square window through it
  const b1 = new THREE.Group(); b1.position.set(-1.6, 0, -1.5); g.add(b1);
  for (const [w, h, d, x, y] of [[1.9, 0.5, 1.3, 0, 0.25], [1.9, 0.6, 1.3, 0, 1.4], [0.65, 0.6, 1.3, -0.63, 0.8], [0.65, 0.6, 1.3, 0.63, 0.8]]) { const b = hewn(w, h, d, stone, Math.round(x * 10 + y * 10) + 3, b1); b.position.set(x, y, 0); }
  const back = box(0.62, 0.6, 0.05, std({ color: '#2a2418' }), 0, 0.8, -0.3, b1); void back;
  const b2 = new THREE.Group(); b2.position.set(1.0, 0, -1.6); b2.rotation.y = -0.08; g.add(b2); const bb = hewn(2.0, 1.5, 1.3, stone, 9, b2); bb.position.y = 0.75;
  // tied bamboo fence in front: low posts with two rails and crossed tie-knots
  const bam = std({ color: '#c8a050', roughness: 0.55 }), tie = std({ color: '#2a1a10' });
  for (let x = -4.5; x <= 3.5; x += 0.45) { cyl(0.025, 0.025, 0.7, bam, x, 0.35, 0.2, g, 8); cyl(0.028, 0.028, 0.03, bam, x, 0.7, 0.2, g, 8); }
  for (const y of [0.28, 0.55]) { const r1 = rod(V(-4.6, y, 0.24), V(3.6, y, 0.24), 0.02, bam, g, 8); void r1; for (let x = -4.5; x <= 3.5; x += 0.45) { const k = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 8), tie); k.position.set(x, y, 0.24); g.add(k); } }
  // info board: a navy panel on two posts, made-up text, a small diagram
  const info = canvasT(512, 384, (x, w, h) => { x.fillStyle = '#2a3a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e8e0'; x.fillRect(16, 16, w - 32, h - 32); x.fillStyle = '#1a2a4a'; fitText(x, 'OLD STONE AQUEDUCT REMAINS', w / 2, 50, w - 60, 28, F.label, { weight: 700 }); x.font = `15px ${F.small}`; x.textAlign = 'left'; ['These dressed stone blocks once carried fresh', 'water to the town in a covered channel. The', 'square opening let workers clear the flow.', 'They were moved here when the street was built.'].forEach((l, i) => x.fillText(l, 36, 100 + i * 24)); x.strokeStyle = '#555'; x.strokeRect(36, 210, 200, 130); x.fillStyle = '#888'; x.fillRect(60, 260, 150, 50); x.fillStyle = '#e8e8e0'; x.fillRect(110, 270, 40, 30); x.fillStyle = '#333'; fitText(x, 'cross-section', 136, 330, 160, 14, F.small); });
  const ib = new THREE.Group(); ib.position.set(-4.2, 0, 0.9); ib.rotation.y = 0.3; g.add(ib); for (const s of [-1, 1]) box(0.08, 1.4, 0.08, std({ color: '#5a5a5c', metalness: 0.4 }), s * 0.42, 0.7, 0, ib); box(0.92, 0.7, 0.04, std({ map: info }), 0, 1.1, 0.03, ib);
  for (const [x, z, s] of [[-3.2, -2.8, 1.4], [3.0, -2.8, 1.3], [-0.2, -3.4, 1.2], [4.0, -0.4, 1.0], [-5.6, -1.6, 1.3], [5.6, -2.6, 1.2]]) fern(g, x, z, s, Math.round(x * 7 + z * 3));
  for (const [x, z] of [[5.0, 1.0], [6.4, -0.6], [-6.2, 0.6]]) hydrangea(g, x, z, Math.round(x * 5 + z));
  const lan = makeStoneLantern(); lan.position.set(5.6, 0, -2.0); g.add(lan);
  // a slender tree behind
  const trunk = std({ color: '#5a4a3a' }); cyl(0.08, 0.12, 3.5, trunk, -6, 1.75, -3.8, g, 8); const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), std({ color: '#3a6a2a', flatShading: true })); crown.position.set(-6, 4, -3.8); crown.castShadow = true; g.add(crown);
  g.userData.colliders = [[-2.6, -0.6, -2.2, -0.8], [0, 2.0, -2.3, -0.9], [-4.6, 3.6, 0.15, 0.3], [5.3, 5.9, -2.3, -1.7], [-4.7, -3.7, 0.7, 1.1]];
  return g;
}

// ---- izakaya ------------------------------------------------------------------------------------------------------
export function makeIzakaya() {
  const g = new THREE.Group(); g.name = 'old_izakaya';
  const W = 7.5, D = 6, H1 = 2.9, H2 = 2.8;
  const plaster = std({ map: tex('i5_plaster', W / 1.3, H2 / 1.3), roughness: 0.95 }), char = std({ map: tex('i5_char', 3, 1), roughness: 0.9 }), dark = std({ color: '#2a2622', roughness: 0.85 });
  box(W, H1 + H2, D, dark, 0, (H1 + H2) / 2, -D / 2, g);
  plane(W, H2, plaster, 0, H1 + H2 / 2, 0.005, 0, g);
  box(W + 0.3, 0.12, 0.6, dark, 0, H1 + H2 + 0.06, 0.1, g);
  // upper windows: aluminium frames with sashes, lamps on curved arms
  const alu = std({ color: '#b8bcc0', metalness: 0.6, roughness: 0.35 }), glass = std({ color: '#3a4048', roughness: 0.1, metalness: 0.3 });
  for (const x of [-1.8, 1.8]) { box(1.9, 1.2, 0.06, alu, x, H1 + 1.45, 0.03, g); plane(1.8, 1.1, glass, x, H1 + 1.45, 0.065, 0, g); box(0.04, 1.1, 0.04, alu, x, H1 + 1.45, 0.08, g);
    const lp = new THREE.CatmullRomCurve3([V(x - 1.1, H1 + 1.3, 0.05), V(x - 1.1, H1 + 1.8, 0.25), V(x - 0.85, H1 + 2.0, 0.45)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(lp, 10, 0.012, 5), std({ color: '#111' }))); cyl(0.04, 0.06, 0.12, std({ color: '#111' }), x - 0.82, H1 + 1.95, 0.47, g, 10).rotation.x = 0.8; }
  // fascia: overlapping weathered boards of different lengths with cut-out cursive lettering in gold rope-like strokes
  const r = rng(70);
  for (let k = 0; k < 6; k++) { const L = 4.2 + r() * 1.5; box(L, 0.17, 0.035, std({ color: new THREE.Color().setHSL(0.07, 0.12, 0.2 + r() * 0.1), roughness: 0.95 }), -0.4 + (r() - 0.5) * 0.6, H1 + 0.15 + k * 0.155, 0.04 + (k % 2) * 0.012, g); }
  const lett = canvasT(1024, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#c8902a'; x.lineWidth = 12; x.lineCap = 'round'; x.lineJoin = 'round'; fitText(x, 'Yoimachi', w / 2, h / 2 + 10, w - 120, 180, F.script, { stroke: 1 }); x.fillStyle = 'rgba(0,0,0,0)'; });
  plane(4.2, 1.05, std({ map: lett, transparent: true, alphaTest: 0.2 }), -0.4, H1 + 0.55, 0.075, 0, g);
  // cloth awning over the doors
  const aw = box(4.5, 0.06, 0.8, std({ color: '#d8ccb0', roughness: 0.9 }), -0.6, H1 - 0.15, 0.4, g); aw.rotation.x = 0.18;
  // lattice doors (two leaves) covered in taped labels, the shutter window, charred board walls either side
  const lat = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#3a2a1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1612'; for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) x.fillRect(10 + i * 40, 10 + j * 36, 32, 28); x.fillStyle = '#c8b898'; for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) if ((i + j * 3) % 4) x.fillRect(12 + i * 40, 12 + j * 36, 28, 24);
    const rr = rng(5); for (let i = 0; i < 18; i++) { x.fillStyle = ['#f2f0e8', '#e8d880', '#f2b8b8', '#c8e8f2', '#f2f0e8'][i % 5]; x.save(); x.translate(20 + rr() * (w - 40), 20 + rr() * (h - 40)); x.rotate((rr() - 0.5) * 0.3); x.fillRect(-14, -10, 28, 20); x.fillStyle = '#555'; x.fillRect(-10, -4, 20, 2); x.fillRect(-10, 2, 14, 2); x.restore(); } });
  for (const x of [-2.3, -1.25]) { box(1.0, 2.3, 0.06, std({ map: lat, roughness: 0.8 }), x, 1.15, 0.03, g); }
  box(1.4, 1.6, 0.05, std({ color: '#2a2a2a' }), 0.2, 1.75, 0.025, g);
  const sh = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#5a5a58'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3a38'; for (let i = 0; i < h; i += 8) x.fillRect(0, i, w, 3); }); sh.wrapS = THREE.RepeatWrapping; sh.repeat.set(4, 1);
  plane(1.2, 1.4, std({ map: sh, metalness: 0.4 }), 0.2, 1.75, 0.055, 0, g);
  box(1.6, 1.0, 0.05, char, 0.2, 0.5, 0.04, g); box(2.7, H1 - 0.05, 0.05, char, 2.4, (H1 - 0.05) / 2, 0.04, g); box(0.8, H1 - 0.2, 0.05, char, -3.35, (H1 - 0.2) / 2, 0.04, g);
  for (let i = 0; i < 8; i++) { const lb = plane(0.08 + r() * 0.06, 0.06 + r() * 0.05, std({ color: ['#f2f0e8', '#e8d880', '#c8e8f2'][i % 3] }), -0.4 + r() * 3.5, 0.6 + r() * 1.8, 0.07, (r() - 0.5) * 0.2, g); void lb; }
  // red post box, the little window with an orange hood, a gas meter
  const pb = new THREE.Group(); pb.position.set(-3.35, 1.0, 0.18); g.add(pb); rbox(0.26, 0.38, 0.2, 0.03, std({ color: '#d82a2a', roughness: 0.4 }), 0, 0, 0, pb); box(0.18, 0.02, 0.01, std({ color: '#222' }), 0, 0.08, 0.1, pb);
  box(0.9, 0.9, 0.06, alu, 2.6, 1.95, 0.04, g); plane(0.8, 0.8, glass, 2.6, 1.95, 0.075, 0, g);
  const hood = box(0.6, 0.25, 0.35, std({ color: '#e8702a', roughness: 0.5 }), 2.0, 2.75, 0.25, g); hood.rotation.x = 0.3;
  rbox(0.25, 0.32, 0.15, 0.02, std({ color: '#e8e8e4' }), 3.3, 1.8, 0.1, g);
  // the stone steps
  box(1.6, 0.12, 0.6, std({ map: tex('lot_concrete', 1, 0.5), color: '#c8c6c0' }), -1.8, 0.06, 0.4, g);
  g.userData.collider = [-W / 2, W / 2, -D, 0.15];
  return g;
}

// ---- pottery gallery ---------------------------------------------------------------------------------------------
function teaBowl(seed) { const r = rng(seed); const prof = []; for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push(new THREE.Vector2(0.025 + 0.045 * Math.sin(t * Math.PI / 2) + 0.004 * Math.sin(t * 9 + seed), 0.07 * t)); } const c = new THREE.Color().setHSL(0.08, 0.1 + r() * 0.15, 0.25 + r() * 0.35); const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), std({ color: c, roughness: 0.4 + r() * 0.4, side: THREE.DoubleSide })); m.scale.setScalar(1.5); m.castShadow = true; return m; }
function lump(seed, s, mat) { const geo = new THREE.IcosahedronGeometry(s, 3); const q = geo.attributes.position, r = rng(seed); const bumps = Array.from({ length: 12 }, () => [new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), 0.1 + r() * 0.25, 0.4 + r() * 0.4]);
  for (let i = 0; i < q.count; i++) { const v = new THREE.Vector3(q.getX(i), q.getY(i), q.getZ(i)), n = v.clone().normalize(); let d = 0; for (const [c, a, w] of bumps) d += a * Math.max(0, 1 - n.distanceTo(c) / w); v.multiplyScalar(1 + d); v.y *= 0.5; q.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; }
export function makePotteryGallery() {
  const g = new THREE.Group(); g.name = 'pottery_gallery';
  const W = 9, D = 7, H = 3.2, white = std({ color: '#f2f2ee', roughness: 0.9 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: tex('lot_concrete', W / 3, D / 3), color: '#b8b6b2', roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
  plane(W, H, white, 0, H / 2, -D / 2, 0, g); plane(D, H, white, -W / 2, H / 2, 0, Math.PI / 2, g); plane(D, H, white, W / 2, H / 2, 0, -Math.PI / 2, g);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), white); cl.rotation.x = Math.PI / 2; cl.position.y = H; g.add(cl);
  // rough timber shelving on the left wall: four shelves of tea bowls
  const wood = std({ color: '#7a5a3a', roughness: 0.9 });
  for (let k = 0; k < 5; k++) { box(0.35, 0.05, 4.4, wood, -W / 2 + 0.2, 0.2 + k * 0.52, -0.6, g); for (let i = 0; i < 14; i++) if (k < 4) { const b = teaBowl(k * 20 + i); b.position.set(-W / 2 + 0.2, 0.225 + k * 0.52, -2.6 + i * 0.3); g.add(b); } }
  for (const z of [-2.8, -0.6, 1.6]) box(0.08, 2.4, 0.08, wood, -W / 2 + 0.38, 1.2, z, g);
  // sawhorse table with sculptures, more on the floor
  const t = new THREE.Group(); t.position.set(1.0, 0, -0.8); g.add(t); box(2.0, 0.06, 0.9, wood, 0, 0.95, 0, t);
  for (const s of [-1, 1]) { box(0.08, 0.08, 0.8, wood, s * 0.75, 0.88, 0, t); for (const z of [-1, 1]) { const l = box(0.07, 0.95, 0.07, wood, s * 0.75, 0.45, z * 0.3, t); l.rotation.x = -z * 0.22; } }
  const glaze = std({ map: tex('i5_glaze', 1, 1), color: '#9a9a9a', roughness: 0.25, metalness: 0.3 });
  const s1 = lump(3, 0.28, glaze); s1.position.set(0.2, 1.1, 0); t.add(s1); const s2 = lump(5, 0.18, std({ color: '#8a6a4a', roughness: 0.6 })); s2.position.set(-0.55, 1.05, 0.1); t.add(s2);
  for (const [x, z, s, sd] of [[-0.6, 1.4, 0.45, 7], [0.3, 1.8, 0.35, 8]]) { const l = lump(sd, s, glaze); l.position.set(x, s * 0.4, z); g.add(l); }
  // shell + glass front with a hand-lettered name, the book tree in the corner, a bun on the counter
  const ext = std({ map: tex('tx_stucco', 3, 1.5), color: '#e8e2d4', roughness: 0.9 });
  box(W + 0.4, H + 0.6, 0.2, ext, 0, (H + 0.6) / 2, -D / 2 - 0.13, g); box(0.2, H + 0.6, D, ext, -W / 2 - 0.13, (H + 0.6) / 2, 0, g); box(0.2, H + 0.6, D, ext, W / 2 + 0.13, (H + 0.6) / 2, 0, g);
  box(1.2, H + 0.6, 0.25, ext, -W / 2 + 0.6, (H + 0.6) / 2, D / 2, g); box(1.2, H + 0.6, 0.25, ext, W / 2 - 0.6, (H + 0.6) / 2, D / 2, g); box(W, 0.6, 0.25, ext, 0, H + 0.3, D / 2, g);
  plane(W - 2.4, H, new THREE.MeshPhysicalMaterial({ color: '#dfe8ec', transparent: true, opacity: 0.12, roughness: 0.02, depthWrite: false, side: THREE.DoubleSide }), 0, H / 2, D / 2, 0, g);
  for (const x of [-3.3, -1.1, 1.1, 3.3]) box(0.05, H, 0.08, std({ color: '#5a4a3a' }), x, H / 2, D / 2, g);
  const nm = canvasT(1024, 160, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2a2420'; fitText(x, 'KILN & CO.', w / 2, 70, w - 300, 96, F.roman, { spacing: 10 }); fitText(x, 'handmade tea bowls · ceramic sculpture', w / 2, 136, w - 300, 28, F.label); });
  plane(6, 0.95, std({ map: nm, transparent: true }), 0, H + 0.3, D / 2 + 0.13, 0, g);
  const bt = makeBookTree(); bt.position.set(W / 2 - 1.2, 0, -D / 2 + 1.2); bt.scale.setScalar(0.85); g.add(bt);
  const desk = new THREE.Group(); desk.position.set(W / 2 - 1.3, 0, 2.2); g.add(desk); box(1.2, 0.9, 0.5, wood, 0, 0.45, 0, desk); const bun = makeBunBag(); bun.position.set(-0.2, 0.9, 0); bun.rotation.y = 0.6; desk.add(bun);
  // a small desk with a card reader by the door, the light
  const lt = new THREE.PointLight('#fff8f0', 5, 10, 1.4); lt.position.set(0, H - 0.3, 0); g.add(lt);
  g.userData.colliders = [[-W / 2, -W / 2 + 0.45, -3, 1.8], [0, 2.0, -1.3, -0.3], [-1.2, 0.0, 0.9, 1.9], [-0.1, 0.7, 1.4, 2.2], [W / 2 - 2.0, W / 2, -D / 2, -D / 2 + 2.0], [W / 2 - 1.9, W / 2 - 0.7, 1.95, 2.45], [-W / 2, -W / 2 + 1.2, D / 2 - 0.15, D / 2 + 0.15], [W / 2 - 1.2, W / 2, D / 2 - 0.15, D / 2 + 0.15]];
  g.userData.areas = [{ minX: -W / 2 + 0.3, maxX: W / 2 - 0.3, minZ: -D / 2 + 0.3, maxZ: D / 2 - 0.2 }, { minX: -2.3, maxX: 2.3, minZ: D / 2 - 0.4, maxZ: D / 2 + 1.0 }];
  return g;
}

// ---- smaller pieces -----------------------------------------------------------------------------------------------
export function makeBookTree() {
  const g = new THREE.Group(); g.name = 'book_tree'; const r = rng(77);
  const covers = ['#2a5a3a', '#e8e0c8', '#5a3a2a', '#c8b890', '#2a3a5a', '#7a2a2a', '#d8d0b8'];
  let y = 0;
  for (let layer = 0; layer < 18; layer++) {
    const rad = 0.9 * (1 - layer / 20); const n = Math.max(2, Math.round(rad * 9));
    let hMax = 0;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + layer * 0.7, rr = rad * (0.4 + r() * 0.6); const w = 0.18 + r() * 0.1, d = 0.24 + r() * 0.08, h = 0.035 + r() * 0.04; hMax = Math.max(hMax, h);
      const c = covers[Math.floor(r() * covers.length)]; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [std({ color: '#f2ecd8' }), std({ color: c }), std({ color: c }), std({ color: c }), std({ color: '#f2ecd8' }), std({ color: '#f2ecd8' })]);
      b.position.set(Math.cos(a) * rr, y + h / 2, Math.sin(a) * rr); b.rotation.set((r() - 0.5) * 0.25, r() * 6, (r() - 0.5) * 0.25); b.castShadow = true; g.add(b); }
    y += hMax * 0.85;
  }
  // candles on a few ledges, a birdcage on top
  const wax = std({ color: '#f2e8c8', emissive: '#ffd890', emissiveIntensity: 0.15 });
  for (let i = 0; i < 6; i++) { const a = i * 1.1, h = 0.1 + r() * 0.15; const yy = 0.3 + i * 0.25; cyl(0.03, 0.03, h, wax, Math.cos(a) * 0.6 * (1 - yy / 2), yy + h / 2, Math.sin(a) * 0.6 * (1 - yy / 2), g, 12); }
  const cage = new THREE.Group(); cage.position.y = y; g.add(cage); const brass = std({ color: '#c8a050', metalness: 0.8, roughness: 0.3 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rod(V(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12), V(Math.cos(a) * 0.12, 0.25, Math.sin(a) * 0.12), 0.003, brass, cage, 4); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#c8a050', metalness: 0.8, wireframe: true })); dome.position.y = 0.25; cage.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 6, 20), brass); ring.rotation.x = Math.PI / 2; cage.add(ring);
  g.userData.collider = [-0.9, 0.9, -0.9, 0.9];
  return g;
}
export function makeBarrelPlanter(seed = 1) {
  const g = new THREE.Group(); g.name = 'barrel_planter'; const r = rng(seed);
  const staves = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#7a5a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4a3420'; x.lineWidth = 2; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } }); staves.wrapS = THREE.RepeatWrapping; staves.repeat.set(2, 1);
  cyl(0.42, 0.38, 0.5, std({ map: staves, roughness: 0.85 }), 0, 0.25, 0, g, 24);
  for (const y of [0.08, 0.42]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.012, 4, 24), std({ color: '#2a2a2a', metalness: 0.6 })); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); }
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), std({ color: '#3a2a1e' })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.48; g.add(soil);
  const fcol = ['#e84a8a', '#f2f2f2', '#9a4ad8', '#f2c21a'];
  for (let i = 0; i < 30; i++) { const a = r() * 6.28, rr = r() * 0.35; const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), std({ color: i % 3 ? fcol[i % 4] : '#3a7a2a' })); f.position.set(Math.cos(a) * rr, 0.52 + r() * 0.12, Math.sin(a) * rr); f.scale.y = 0.6; g.add(f); }
  g.userData.collider = [-0.45, 0.45, -0.45, 0.45];
  return g;
}
export function makeCurvedBench() {
  const g = new THREE.Group(); g.name = 'curved_bench';
  const wood = std({ color: '#8a6a4a', roughness: 0.8 }), steel = std({ color: '#3a3c40', metalness: 0.5 });
  for (let i = 0; i < 9; i++) { const a = -0.8 + i * 0.2; const sl = box(0.18, 0.04, 0.42, wood, Math.sin(a) * 1.4, 0.45, Math.cos(a) * 1.4 - 1.4, g); sl.rotation.y = a; }
  for (const a of [-0.7, 0, 0.7]) { const l = box(0.06, 0.45, 0.35, steel, Math.sin(a) * 1.4, 0.225, Math.cos(a) * 1.4 - 1.4, g); l.rotation.y = a; }
  g.userData.collider = [-1.15, 1.15, -0.35, 0.25];
  return g;
}
export function makeWifiStand() {
  const g = new THREE.Group(); g.name = 'wifi_stand';
  const teal = std({ color: '#2ab8a8', roughness: 0.4 });
  cyl(0.18, 0.2, 0.05, teal, 0, 0.025, 0, g, 24); cyl(0.04, 0.05, 1.3, teal, 0, 0.67, 0, g, 12);
  const sign = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.strokeStyle = '#2ab8a8'; x.lineWidth = 14; x.lineCap = 'round'; for (const rr of [30, 60, 90]) { x.beginPath(); x.arc(128, 170, rr, -Math.PI * 0.75, -Math.PI * 0.25); x.stroke(); } x.fillStyle = '#2ab8a8'; x.beginPath(); x.arc(128, 170, 10, 0, 7); x.fill(); x.fillStyle = '#2a6a6a'; fitText(x, 'FREE Wi-Fi', 128, 214, 180, 26, F.label, { weight: 700 }); });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 32), [teal, std({ map: sign }), std({ map: sign })]); disc.rotation.x = Math.PI / 2; disc.position.y = 1.45; g.add(disc);
  g.userData.collider = [-0.2, 0.2, -0.2, 0.2];
  return g;
}
export function makeWeepingMaple() {
  const g = new THREE.Group(); g.name = 'weeping_maple'; const r = rng(31);
  const bark = std({ color: '#3a2a22', roughness: 0.9 }), leaf = std({ color: '#7a2a2a', roughness: 0.8, side: THREE.DoubleSide });
  cyl(0.08, 0.14, 1.4, bark, 0, 0.7, 0, g, 8);
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; rod(V(0, 1.3, 0), V(Math.cos(a) * 0.7, 1.9 + r() * 0.3, Math.sin(a) * 0.7), 0.035, bark, g); }
  const lg = new THREE.PlaneGeometry(0.12, 0.12), lm = new THREE.InstancedMesh(lg, leaf, 900); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color();
  for (let i = 0; i < 900; i++) { const a = r() * 6.28, rr = 0.3 + r() * 1.1; const y = 2.3 - rr * rr * 0.9 + r() * 0.4; Q.setFromEuler(E.set(r() * 3, r() * 3, r() * 3)); M.compose(V(Math.cos(a) * rr, Math.max(0.5, y), Math.sin(a) * rr), Q, V(1, 1, 1)); lm.setMatrixAt(i, M); lm.setColorAt(i, C.setHSL(0.0 + r() * 0.03, 0.5, 0.25 + r() * 0.15)); }
  lm.castShadow = true; g.add(lm);
  g.userData.collider = [-0.25, 0.25, -0.25, 0.25];
  return g;
}
export function makePizzaAFrame() {
  const g = new THREE.Group(); g.name = 'pizza_aframe';
  const art = canvasT(512, 720, (x, w, h) => { x.fillStyle = '#141416'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2f2ee'; fitText(x, 'PIZZERIA & BAR', w / 2, 70, w - 120, 34, F.engraved, { spacing: 4 }); fitText(x, 'FORNO', w / 2, 150, w - 100, 110, F.roman, { spacing: 10 });
    // a drawn pizza: charred rim, tomato, mushroom slices, cheese, basil
    const cx = w / 2, cy = 470; x.fillStyle = '#c8803a'; x.beginPath(); x.arc(cx, cy, 200, 0, 7); x.fill(); for (let i = 0; i < 26; i++) { x.fillStyle = 'rgba(40,20,10,0.6)'; x.beginPath(); x.arc(cx + Math.cos(i) * 190, cy + Math.sin(i) * 190, 8 + (i % 3) * 4, 0, 7); x.fill(); }
    x.fillStyle = '#c83a1a'; x.beginPath(); x.arc(cx, cy, 165, 0, 7); x.fill(); x.fillStyle = '#f2e0b0'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(cx + Math.cos(i * 0.9) * 100 * (i % 2 ? 0.5 : 1), cy + Math.sin(i * 0.9) * 100 * (i % 2 ? 0.5 : 1), 40, 28, i, 0, 7); x.fill(); }
    x.fillStyle = '#d8c8a8'; for (let i = 0; i < 14; i++) { x.save(); x.translate(cx + Math.cos(i * 2.3) * 120 * Math.sqrt((i + 1) / 14), cy + Math.sin(i * 2.3) * 120 * Math.sqrt((i + 1) / 14)); x.rotate(i); x.beginPath(); x.arc(0, 0, 18, Math.PI, 0); x.fill(); x.fillRect(-5, 0, 10, 14); x.restore(); }
    x.fillStyle = '#2a7a2a'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(cx + Math.cos(i * 1.3 + 0.4) * 70, cy + Math.sin(i * 1.3 + 0.4) * 70, 16, 8, i, 0, 7); x.fill(); } });
  const blk = std({ color: '#141416', metalness: 0.4 });
  for (const s of [-1, 1]) { const leaf = new THREE.Group(); leaf.position.set(0, 1.1, 0); leaf.rotation.x = s * 0.17; g.add(leaf); box(0.66, 0.92, 0.025, blk, 0, -0.5, 0, leaf); plane(0.6, 0.84, std({ map: art, roughness: 0.4 }), 0, -0.5, -s * 0.014, s > 0 ? Math.PI : 0, leaf); }
  g.userData.collider = [-0.35, 0.35, -0.22, 0.22];
  return g;
}
export function makeComicVending() {
  const g = new THREE.Group(); g.name = 'comic_vending';
  const wrap = canvasT(512, 1024, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); const r = rng(9);
    for (let i = 0; i < 9; i++) { const px = (i % 3) * 170 + 6, py = Math.floor(i / 3) * 330 + 6; x.fillStyle = ['#f2e04a', '#4ac8f2', '#f28ab0', '#a8f28a', '#f2a04a'][i % 5]; x.fillRect(px, py, 160, 320); x.strokeStyle = '#111'; x.lineWidth = 5; x.strokeRect(px, py, 160, 320);
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(px + 80, py + 70, 60, 40, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#111'; fitText(x, ['POW!', 'COLD!', 'FIZZ!', 'WOW', 'YES!'][i % 5], px + 80, py + 72, 100, 30, F.heavy);
      x.fillStyle = '#111'; x.beginPath(); x.arc(px + 80, py + 210, 40, 0, 7); x.stroke(); x.beginPath(); x.arc(px + 66, py + 200, 5, 0, 7); x.arc(px + 94, py + 200, 5, 0, 7); x.fill(); x.beginPath(); x.arc(px + 80, py + 220, 16, 0.2, Math.PI - 0.2); x.stroke(); } });
  const front = canvasT(512, 512, (x, w, h) => { x.fillStyle = '#e8eef2'; x.fillRect(0, 0, w, h); const r = rng(4); for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) { x.fillStyle = ['#e8402a', '#2a8ad0', '#3ab84a', '#f2c21a', '#ffffff', '#f08a2a', '#1a1a1a'][Math.floor(r() * 7)]; x.fillRect(12 + i * 55, 20 + row * 120, 36, 80); x.fillStyle = '#222'; x.fillRect(12 + i * 55, 104 + row * 120, 36, 12); x.fillStyle = '#4af'; x.fillRect(18 + i * 55, 106 + row * 120, 10, 6); } });
  const red = std({ color: '#d83a1a', roughness: 0.5 });
  const body = box(1.0, 1.85, 0.75, red, 0, 0.925, 0, g); body.material = [std({ map: wrap }), std({ map: wrap }), red, red, red, red];
  plane(0.82, 1.1, std({ map: front, emissive: '#ffffff', emissiveMap: front, emissiveIntensity: 0.35, roughness: 0.2 }), 0, 1.25, 0.376, 0, g);
  box(0.86, 0.5, 0.02, std({ map: wrap }), 0, 0.42, 0.37, g);
  // a green street-name sign topper (made-up) on a short post
  rod(V(0.35, 1.85, 0), V(0.35, 2.45, 0), 0.02, std({ color: '#c8ccd0', metalness: 0.7 }), g);
  const ss = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#1e7a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 3; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#fff'; fitText(x, 'SODA ST', w / 2, 34, w - 30, 40, F.label, { weight: 700 }); });
  box(0.6, 0.15, 0.02, std({ map: ss }), 0.35, 2.4, 0, g);
  g.userData.collider = [-0.52, 0.52, -0.4, 0.4];
  return g;
}
export function makeBunBag() {
  const g = new THREE.Group(); g.name = 'bun_bag';
  const bun = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.06, 0.2, 4, 0.03), std({ color: '#c8843a', roughness: 0.6 })); bun.position.y = 0.035; g.add(bun);
  for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 4), std({ color: '#2a1810', roughness: 0.4 })); c.position.set(-0.03 + (i % 3) * 0.03, 0.065, -0.07 + i * 0.016); g.add(c); }
  const bag = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.075, 0.26, 4, 0.035), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false })); bag.position.y = 0.038; g.add(bag);
  const st = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#2a8ad8'; x.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, rr = k % 2 ? 56 : 62; x.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr); } x.fill(); x.fillStyle = '#fff'; fitText(x, 'FRESH', 64, 56, 90, 24, F.heavy); fitText(x, 'daily', 64, 82, 70, 18, F.script); });
  const sm = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), std({ map: st })); sm.rotation.x = -Math.PI / 2; sm.position.set(0.02, 0.077, 0.06); g.add(sm);
  return g;
}
export function makeStickerPost() {
  const g = new THREE.Group(); g.name = 'sticker_post';
  const st = canvasT(256, 1024, (x, w, h) => { const grad = x.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, '#8a8e92'); grad.addColorStop(0.5, '#d8dcde'); grad.addColorStop(1, '#8a8e92'); x.fillStyle = grad; x.fillRect(0, 0, w, h); const r = rng(42);
    // a round black-and-white band-style sticker (made-up), a trading-card style sticker, a no-smoking sticker with a
    // drawn mascot, a doodle face, scraps of torn older ones
    x.fillStyle = '#111'; x.beginPath(); x.arc(128, 160, 90, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 160, 80, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(128, 140, 38, Math.PI, 0); x.fill(); x.fillRect(90, 140, 76, 20); fitText(x, 'LOUD & LOW', 128, 210, 140, 22, F.heavy);
    x.fillStyle = '#f2e04a'; x.fillRect(40, 300, 176, 240); x.fillStyle = '#8ac8f2'; x.fillRect(52, 330, 152, 110); x.fillStyle = '#2a6ac8'; x.beginPath(); x.arc(128, 395, 34, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(118, 388, 7, 0, 7); x.arc(140, 388, 7, 0, 7); x.fill(); x.fillStyle = '#111'; fitText(x, 'Little Grumble', 128, 316, 160, 18, F.label, { weight: 700 }); for (let i = 0; i < 5; i++) x.fillRect(56, 460 + i * 14, 140, 4);
    x.fillStyle = '#fff'; x.fillRect(48, 600, 160, 210); x.strokeStyle = '#c81e28'; x.lineWidth = 12; x.beginPath(); x.arc(128, 700, 52, 0, 7); x.stroke(); x.beginPath(); x.moveTo(92, 664); x.lineTo(164, 736); x.stroke(); x.fillStyle = '#333'; x.fillRect(100, 694, 50, 12); x.fillStyle = '#111'; fitText(x, 'NO SMOKING', 128, 785, 140, 22, F.label, { weight: 700 }); x.fillStyle = '#2a2a6a'; x.beginPath(); x.arc(128, 616, 24, 0, 7); x.fill();
    x.fillStyle = '#e8e4dc'; x.fillRect(60, 860, 140, 130); x.strokeStyle = '#111'; x.lineWidth = 5; x.beginPath(); x.moveTo(80, 900); x.quadraticCurveTo(130, 870, 180, 900); x.moveTo(90, 950); x.lineTo(170, 950); x.stroke();
    for (let i = 0; i < 12; i++) { x.fillStyle = `rgba(240,240,230,${0.4 + r() * 0.4})`; x.fillRect(r() * w, r() * h, 10 + r() * 30, 6 + r() * 20); } });
  cyl(0.05, 0.05, 2.6, std({ map: st, metalness: 0.5, roughness: 0.35 }), 0, 1.3, 0, g, 20);
  g.userData.collider = [-0.08, 0.08, -0.08, 0.08];
  return g;
}
export function makeMural() {
  const g = new THREE.Group(); g.name = 'rainbow_mural';
  const W = 10, H = 3.2;
  box(W, H, 0.3, std({ map: tex('i5_mural'), roughness: 0.9 }), 0, H / 2, 0, g).material = [std({ color: '#a8988a' }), std({ color: '#a8988a' }), std({ color: '#a8988a' }), std({ color: '#a8988a' }), std({ map: tex('i5_mural'), roughness: 0.9 }), std({ color: '#a8988a' })];
  box(W + 0.1, 0.12, 0.38, std({ color: '#8a8478' }), 0, H + 0.06, 0, g);
  g.userData.collider = [-W / 2, W / 2, -0.16, 0.16];
  return g;
}
