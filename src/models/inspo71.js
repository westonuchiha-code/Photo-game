// Inspiration 6 (queue item 71, photos/inspo6/). Modelled; made-up brands, game titles, house numbers, phone numbers.
//   makeBaler()          green vertical cardboard baler: cabinet, a mesh door window, a ram housing, warning labels
//   makeClearBag(s)      a big clear plastic bag stuffed with crumpled film and bottles
//   makeWalkInCooler()   a 3 x 3 m walk-in egg cooler: insulated panels, open door, blue + black crates, an EGGS box, a cart
//   makeStripBox()       a cardboard box of white shelf-strip boards on stacked pallets with a spray bottle
//   makeBollard()        a yellow steel bollard
//   makeBackroomCorner() the Bulk Barn staff corner: the above behind a yellow floor line, taped notices on the wall
//   makeGameShelf()      a used-games shelf: rows of case spines, an open case with a black disc + a printed disc, a
//                        closed case with drawn cover art (made-up titles)
//   makeClearBin() / makeYakisobaPack() / makeYakisobaBin()   storage bins + noodle packs in a shelf bin
//   makePinkCRT()        a pink crown-topped CRT TV on a wooden stand with a console under it, a game end screen
//   makePinkHouse()      a pink clapboard bungalow with a front door, two windows, concrete steps, a bottle tree, flower
//                        pots, a ghost cutout, river-rock landscaping; the pink TV seen through the front window
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clearM = () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.2, roughness: 0.06, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
function warnLabel(lines, bg = '#f2c21a') { return canvasT(256, 192, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.fillRect(0, 0, w, 44); x.fillStyle = bg; fitText(x, 'WARNING', w / 2, 23, 200, 32, F.heavy, { spacing: 3 }); x.fillStyle = '#111'; lines.forEach((l, i) => fitText(x, l, w / 2, 76 + i * 30, w - 30, 22, F.label)); }); }

// ---- backroom -------------------------------------------------------------------------------------------------
export function makeBaler() {
  const g = new THREE.Group(); g.name = 'baler';
  const green = std({ color: '#2a7a3a', roughness: 0.45, metalness: 0.3 }), steel = std({ color: '#6a6c70', metalness: 0.6 });
  box(1.6, 2.4, 1.1, green, 0, 1.2, 0, g);
  box(1.2, 0.9, 1.2, green, 0, 2.85, -0.05, g);   // ram housing
  for (let i = 0; i < 6; i++) box(1.62, 0.05, 1.12, std({ color: '#1e5a2a' }), 0, 0.35 + i * 0.38, 0, g);
  const mesh = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#1a1a1a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a8c8e'; x.lineWidth = 2; for (let i = 0; i < w; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } });
  plane(1.1, 0.8, std({ map: mesh, metalness: 0.5 }), 0, 1.8, 0.56, 0, g);
  box(0.08, 0.5, 0.1, steel, 0.65, 1.2, 0.6, g);   // door latch lever
  [[['DO NOT ENTER', 'CRUSH HAZARD'], 0.45, 1.0], [['KEEP HANDS', 'CLEAR'], -0.4, 1.0], [['TRAINED STAFF', 'ONLY'], -0.4, 0.55]].forEach(([l, x, y]) => plane(0.32, 0.24, std({ map: warnLabel(l) }), x, y, 0.556, 0, g));
  const btn = cyl(0.04, 0.04, 0.03, std({ color: '#d81e1e' }), 0.62, 1.55, 0.57, g, 16); btn.rotation.x = Math.PI / 2;
  g.userData.collider = [-0.82, 0.82, -0.6, 0.6];
  return g;
}
export function makeClearBag(s = 1) {
  const g = new THREE.Group(); g.name = 'clear_bag'; const r = rng(s * 7);
  const geo = new THREE.SphereGeometry(0.6, 20, 14); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 + 0.12 * Math.sin(x * 9 + s) * Math.cos(y * 7) + 0.08 * Math.sin(z * 11); p.setXYZ(i, x * k, (y * k + 0.6) * 1.15, z * k * 0.9); }
  geo.computeVertexNormals();
  const bag = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#f4f6f8', transparent: true, opacity: 0.55, roughness: 0.2, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })); bag.renderOrder = 2; g.add(bag);
  const film = std({ color: '#e8eef2', roughness: 0.4, flatShading: true });
  for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + r() * 0.1, 0), film); c.position.set((r() - 0.5) * 0.7, 0.25 + r() * 0.85, (r() - 0.5) * 0.6); c.rotation.set(r() * 3, r() * 3, r() * 3); g.add(c); }
  for (let i = 0; i < 6; i++) { const b = cyl(0.035, 0.035, 0.22, std({ color: ['#2a8ad0', '#f2f2ee', '#3ab84a'][i % 3], transparent: true, opacity: 0.8 }), (r() - 0.5) * 0.6, 0.3 + r() * 0.7, (r() - 0.5) * 0.5, g, 10); b.rotation.set(r() * 3, 0, r() * 3); }
  g.userData.collider = [-0.6, 0.6, -0.55, 0.55];
  return g;
}
function crate(color, p, x, y, z) { const c = std({ color, roughness: 0.6 }); const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); box(0.5, 0.03, 0.34, c, 0, 0.015, 0, g); for (const [w, d, xx, zz] of [[0.5, 0.02, 0, 0.16], [0.5, 0.02, 0, -0.16], [0.02, 0.34, 0.24, 0], [0.02, 0.34, -0.24, 0]]) box(w, 0.28, d, c, xx, 0.14, zz, g); return g; }
export function makeWalkInCooler() {
  const g = new THREE.Group(); g.name = 'walkin_cooler';
  const W = 3.2, D = 3.2, H = 2.6, panel = std({ color: '#e8eaec', roughness: 0.4, metalness: 0.2 });
  const seam = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#e8eaec'; x.fillRect(0, 0, w, h); x.fillStyle = '#b8bcc0'; x.fillRect(0, 0, 3, h); }); seam.wrapS = THREE.RepeatWrapping; seam.repeat.set(W / 1.2, 1);
  const pm = std({ map: seam, roughness: 0.4, metalness: 0.2 });
  box(W, H, 0.1, pm, 0, H / 2, -D / 2, g); box(0.1, H, D, pm, -W / 2, H / 2, 0, g); box(0.1, H, D, pm, W / 2, H / 2, 0, g); box(W, 0.1, D, panel, 0, H, 0, g);
  box(W - 1.1, H, 0.1, pm, 0.55, H / 2, D / 2, g); box(0.15, H, 0.1, pm, -W / 2 + 0.07, H / 2, D / 2, g);
  const door = new THREE.Group(); door.position.set(-W / 2 + 0.15, 0, D / 2); door.rotation.y = 1.2; g.add(door); box(0.95, 2.1, 0.1, panel, 0.48, 1.05, 0.05, door); box(0.05, 0.3, 0.06, std({ color: '#888', metalness: 0.8 }), 0.85, 1.05, 0.12, door);
  const strip = std({ color: '#d8e4ea', transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide }); for (let i = 0; i < 5; i++) plane(0.18, 2.0, strip, -W / 2 + 0.25 + i * 0.18, 1.05, D / 2 - 0.08, 0, g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#a8a4a0', roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.02; g.add(fl);
  const light = new THREE.PointLight('#e8f4ff', 2.5, 5, 1.6); light.position.set(0, H - 0.3, 0); g.add(light); box(0.6, 0.05, 0.15, std({ emissive: '#ffffff', emissiveIntensity: 2 }), 0, H - 0.05, 0, g);
  // stacks of blue and black crates along the back + left, the EGGS box, a shopping cart
  for (let k = 0; k < 4; k++) { crate('#2a5ad8', g, -1.1, k * 0.3, -1.2); crate('#2a5ad8', g, -0.5, k * 0.3, -1.2); crate('#1a1a1c', g, 0.4, k * 0.3, -1.2); crate('#1a1a1c', g, 1.0, k * 0.3, -1.2); }
  for (let k = 0; k < 3; k++) crate('#1a1a1c', g, 1.1, k * 0.3, -0.4);
  const eg = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#d8b888'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'EGGS', w / 2, 70, w - 40, 80, F.heavy); });
  const ebox = box(0.5, 0.35, 0.35, std({ map: eg, roughness: 0.8 }), 1.0, 1.08, -0.4, g); void ebox;
  const cart = new THREE.Group(); cart.position.set(-0.7, 0, 0.6); cart.rotation.y = 0.3; g.add(cart); const w = std({ color: '#8e9294', metalness: 0.7 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { rod(V(sx * 0.4, 0.15, sz * 0.25), V(sx * 0.42, 0.9, sz * 0.27), 0.008, w, cart); cyl(0.04, 0.04, 0.03, std({ color: '#222' }), sx * 0.4, 0.04, sz * 0.25, cart, 10).rotation.x = Math.PI / 2; }
  for (let i = 0; i <= 8; i++) rod(V(-0.42, 0.3 + i * 0.075, 0.27), V(0.42, 0.3 + i * 0.075, 0.27), 0.004, w, cart);
  for (let i = 0; i <= 8; i++) rod(V(-0.42, 0.3 + i * 0.075, -0.27), V(0.42, 0.3 + i * 0.075, -0.27), 0.004, w, cart);
  for (let i = 0; i < 2; i++) { const c = box(0.3, 0.07, 0.11, std({ color: '#f2c83a' }), -0.15 + i * 0.32, 0.36, 0, cart); void c; }
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
export function makeStripBox() {
  const g = new THREE.Group(); g.name = 'strip_box';
  const blue = std({ color: '#2a5ad8', roughness: 0.5 }), wood = std({ color: '#b89a6a', roughness: 0.85 });
  for (let k = 0; k < 4; k++) { const p = new THREE.Group(); p.position.y = k * 0.15; g.add(p); const m = k % 2 ? wood : blue; for (let i = 0; i < 6; i++) box(0.14, 0.02, 1.0, m, -0.5 + i * 0.2, 0.135, 0, p); for (const zz of [-0.45, 0, 0.45]) box(1.2, 0.1, 0.1, m, 0, 0.06, zz, p); }
  const card = std({ map: tex('cardboard', 1, 1), color: '#c8a070', roughness: 0.9 });
  const bx = new THREE.Group(); bx.position.set(0.1, 0.6, 0); g.add(bx);
  box(0.6, 0.45, 0.4, card, 0, 0.225, 0, bx);
  const lbl = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'SHELF STRIPS', w / 2, 34, w - 20, 34, F.heavy); fitText(x, 'white · 48"', w / 2, 72, w - 40, 22, F.label); }); plane(0.4, 0.15, std({ map: lbl }), 0, 0.3, 0.201, 0, bx);
  const r = rng(5), wh = std({ color: '#f4f4f2', roughness: 0.4 });
  for (let i = 0; i < 14; i++) { const s = box(0.06 + r() * 0.05, 0.9 + r() * 0.4, 0.008, wh, -0.24 + i * 0.035, 0.6, (r() - 0.5) * 0.2, bx); s.rotation.z = (r() - 0.5) * 0.2; s.rotation.y = (r() - 0.5) * 0.3; }
  const sp = new THREE.Group(); sp.position.set(-0.35, 0.6, 0.25); g.add(sp); cyl(0.04, 0.045, 0.2, std({ color: '#eef4f8', transparent: true, opacity: 0.6 }), 0, 0.1, 0, sp, 16); cyl(0.015, 0.035, 0.05, std({ color: '#2a5ad8' }), 0, 0.225, 0, sp, 12); box(0.035, 0.06, 0.09, std({ color: '#2a5ad8' }), 0, 0.28, 0.025, sp);
  g.userData.collider = [-0.62, 0.62, -0.55, 0.55];
  return g;
}
export function makeBollard() { const g = new THREE.Group(); g.name = 'bollard'; cyl(0.1, 0.1, 1.1, std({ color: '#f2c21a', roughness: 0.45 }), 0, 0.55, 0, g, 20); const top = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#f2c21a', roughness: 0.45 })); top.position.y = 1.1; g.add(top); g.userData.collider = [-0.12, 0.12, -0.12, 0.12]; return g; }
export function makeTapedNotices() {
  const g = new THREE.Group(); g.name = 'taped_notices';
  const a = canvasT(256, 320, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'Property', w / 2, 90, 200, 40, F.roman); fitText(x, 'Management', w / 2, 140, 220, 40, F.roman); fitText(x, '(555) 014-9006', w / 2, 220, 220, 34, F.roman); });
  const b = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'STOP!!!', w / 2, 60, 200, 54, F.marker); fitText(x, 'close the cooler door', w / 2, 120, 220, 24, F.marker); });
  const tape = std({ color: '#e8d8a8', transparent: true, opacity: 0.85, roughness: 0.6 });
  const p1 = plane(0.28, 0.35, std({ map: a, roughness: 0.8 }), 0, 1.5, 0, 0, g); p1.rotation.z = 0.04; const p2 = plane(0.28, 0.18, std({ map: b, roughness: 0.8 }), 0.05, 1.1, 0, 0, g); p2.rotation.z = -0.06;
  for (const [x, y, rz, w] of [[-0.12, 1.68, 0.3, 0.12], [0.13, 1.66, -0.2, 0.1], [0.0, 1.32, 0, 0.3], [-0.08, 1.2, 0.6, 0.1], [0.17, 1.02, -0.5, 0.1], [0.05, 0.99, 0, 0.28]]) { const t = plane(w, 0.04, tape, x, y, 0.002, 0, g); t.rotation.z = rz; }
  return g;
}
export function makeBackroomCorner() {
  const g = new THREE.Group(); g.name = 'backroom_corner';
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 7), std({ color: '#f2c21a' })); line.rotation.x = -Math.PI / 2; line.position.set(-3.9, 0.015, 0); g.add(line);
  const sign = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'STAFF ONLY', w / 2, 50, w - 30, 56, F.heavy); });
  const cooler = makeWalkInCooler(); cooler.position.set(-1.9, 0, -1.7); g.add(cooler);
  const baler = makeBaler(); baler.position.set(1.8, 0, -2.6); g.add(baler);
  const bag = makeClearBag(2); bag.position.set(0.3, 0, -2.5); g.add(bag); const bag2 = makeClearBag(5); bag2.scale.setScalar(0.8); bag2.position.set(0.5, 0, -1.4); g.add(bag2);
  const sb = makeStripBox(); sb.position.set(2.0, 0, 1.4); g.add(sb);
  for (const z of [-3.0, -0.5, 2.0]) { const b = makeBollard(); b.position.set(-3.6, 0, z); g.add(b); }
  const tn = makeTapedNotices(); tn.position.set(3.69, 0, -0.4); tn.rotation.y = -Math.PI / 2; g.add(tn);
  const ss = plane(0.7, 0.26, std({ map: sign }), -3.9, 2.2, 3.3, -Math.PI / 2, g); void ss;
  g.userData.colliders = [[-3.5, -0.3, -3.3, -0.1], [0.98, 2.62, -3.2, -2.0], [-0.3, 0.9, -3.05, -0.85], [1.38, 2.62, 0.85, 1.95], [-3.72, -3.48, -3.12, -2.88], [-3.72, -3.48, -0.62, -0.38], [-3.72, -3.48, 1.88, 2.12]];
  return g;
}

// ---- games, bins, noodles ------------------------------------------------------------------------------------
const TITLES = [['STARBORNE', '#2a3a8a'], ['IRON TIDE', '#5a1a1a'], ['PIXEL KNIGHTS', '#1a5a3a'], ['MOON RACER', '#3a1a5a'], ['DUST CROWN', '#6a4a1a'], ['GHOST ALLEY', '#111'], ['TURBO DRIFT 2', '#8a1a1a'], ['SKY HARBOR', '#1a4a6a'], ['NEON SAMURAI', '#2a2a2a'], ['FARM DAYS', '#3a6a2a'], ['RUNE HOLLOW', '#111'], ['BLOCK PARTY', '#111'], ['DEEP SIGNAL', '#0a2a3a'], ['RALLY KINGS', '#111'], ['CANDY KART', '#c83a8a'], ['WAR OF ASH', '#111']];
const NSP = 32;   // spine atlas: 32 vertical spines of 64 x 1024 px (each a case's 14 mm edge, 190 mm tall)
let _spines = null;
function spineAtlas() { if (_spines) return _spines; _spines = canvasT(NSP * 64, 1024, (x, w, h) => { const r = rng(17);
  for (let i = 0; i < NSP; i++) { const [t, c] = TITLES[i % TITLES.length]; const px = i * 64; const black = i % 3 !== 1;
    x.fillStyle = black ? '#121214' : c; x.fillRect(px, 0, 64, h);
    x.fillStyle = ['#c81e28', '#f2c21a', '#2a6ad8', '#e8e8e8'][Math.floor(r() * 4)]; x.fillRect(px, 0, 64, 150);   // the console band at the top
    x.fillStyle = '#fff'; x.save(); x.translate(px + 32, 75); x.rotate(Math.PI / 2); x.font = `bold 26px ${F.label}`; x.textAlign = 'center'; x.fillText('GS', 0, 9); x.restore();
    x.save(); x.translate(px + 32, 600); x.rotate(Math.PI / 2); x.fillStyle = black ? '#f0f0f0' : '#fff'; fitText(x, t, 0, 0, 760, 40, F.heavy); x.restore();
    x.fillStyle = '#e8e8e8'; x.fillRect(px + 14, 960, 36, 36); x.fillStyle = '#111'; x.font = `bold 24px ${F.label}`; x.textAlign = 'center'; x.fillText(['E', 'T', 'M', 'E'][i % 4], px + 32, 988);
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(px, 0, 2, h); x.fillRect(px + 62, 0, 2, h); } }); return _spines; }
// one shelf row of game cases standing spine-out: real boxes merged into one geometry, the spine face mapped into the atlas
function caseRow(len, seed) {
  const r = rng(seed), geos = []; let x = -len / 2 + 0.01;
  while (x < len / 2 - 0.02) {
    const g = new THREE.BoxGeometry(0.0145, 0.19, 0.135); const i = Math.floor(r() * NSP); const uv = g.attributes.uv;
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 verts each). The spine is the +z face; every other face gets the
    // atlas's plain black strip at the bottom of slot i
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const j = f * 4 + k, u = uv.getX(j), v = uv.getY(j);
      if (f === 4) uv.setXY(j, (i + (1 - v) * 0.0 + u) / NSP, v); else uv.setXY(j, (i + 0.5) / NSP, 0.3); }
    // rotate the spine's UV so the text runs top to bottom: u across the 14 mm edge, v along the height
    const lean = r() < 0.06 ? 0.12 : 0; g.rotateZ(-lean); g.translate(x + 0.0075, 0.095 + lean * 0.01, 0); geos.push(g); x += 0.0155 + (lean ? 0.02 : 0); if (r() < 0.04) x += 0.03;
  }
  return mergeGeometries(geos);
}
export function makeGameShelf() {
  const g = new THREE.Group(); g.name = 'game_shelf';
  const W = 1.8, wood = std({ color: '#3a3c40', metalness: 0.4 });
  box(W, 1.6, 0.35, std({ color: '#2a2a2c' }), 0, 0.8, -0.17, g);
  const cm = std({ map: spineAtlas(), roughness: 0.35 });
  for (let k = 0; k < 4; k++) { box(W, 0.02, 0.35, wood, 0, 0.1 + k * 0.38, 0, g); const row = new THREE.Mesh(caseRow(W - 0.06, k * 7 + 3), cm); row.position.set(0, 0.11 + k * 0.38, 0.04); row.castShadow = true; g.add(row); }
  // a case lying open on the top: black disc in the left tray, a printed disc on the right; a closed case with cover art
  const top = new THREE.Group(); top.position.set(-0.3, 1.63, 0); g.add(top); const cl = clearM();
  const half = (x, disc) => { const h = new THREE.Group(); h.position.x = x; top.add(h); box(0.14, 0.012, 0.125, std({ color: '#141414', roughness: 0.3 }), 0, 0.006, 0, h); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.002, 40), disc); d.position.y = 0.014; h.add(d); cyl(0.008, 0.008, 0.003, std({ color: '#c8ccd0', metalness: 0.9 }), 0, 0.016, 0, h, 12); };
  const printed = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#c8a070'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill(); x.fillStyle = '#7a4a2a'; x.fillRect(60, 60, 140, 90); x.fillStyle = '#fff'; fitText(x, 'DUST CROWN', 128, 190, 160, 20, F.heavy); x.fillStyle = '#111'; x.beginPath(); x.arc(128, 128, 18, 0, 7); x.fill(); });
  half(0, std({ color: '#0c0c0e', roughness: 0.08, metalness: 0.4 })); half(0.145, [std({ color: '#c8ccd0' }), std({ map: printed, roughness: 0.3 }), std({ color: '#c8ccd0' })]);
  box(0.29, 0.012, 0.125, cl, 0.072, 0.02, 0, top);
  const cover = canvasT(256, 230, (x, w, h) => { const sky = x.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#3a2a6a'); sky.addColorStop(1, '#8a5ab8'); x.fillStyle = sky; x.fillRect(0, 0, w, h); x.fillStyle = '#f2e04a'; x.beginPath(); x.moveTo(140, 40); x.lineTo(175, 150); x.lineTo(105, 150); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(140, 40, 14, 0, 7); x.fill(); x.fillStyle = '#e8402a'; fitText(x, 'STARBORNE', w / 2 + 14, h - 40, w - 60, 34, F.retro); x.fillStyle = '#111'; x.fillRect(0, 0, 26, h); x.fillStyle = '#fff'; x.save(); x.translate(13, h / 2); x.rotate(-Math.PI / 2); fitText(x, 'GAME STATION', 0, 0, h - 20, 14, F.label); x.restore(); });
  const cc = box(0.14, 0.012, 0.125, [std({ color: '#111' }), std({ color: '#111' }), std({ map: cover }), std({ color: '#111' }), std({ color: '#111' }), std({ color: '#111' })], 0.45, 1.636, 0.02, g); cc.rotation.y = -0.2;
  g.userData.collider = [-W / 2, W / 2, -0.35, 0.2];
  return g;
}
export function makeClearBin() {
  const g = new THREE.Group(); g.name = 'clear_bin'; const c = clearM();
  for (const [w, h, d, x, y, z] of [[0.3, 0.005, 0.4, 0, 0.0025, 0], [0.3, 0.2, 0.005, 0, 0.1, 0.2], [0.3, 0.2, 0.005, 0, 0.1, -0.2], [0.005, 0.2, 0.4, 0.15, 0.1, 0], [0.005, 0.2, 0.4, -0.15, 0.1, 0]]) box(w, h, d, c, x, y, z, g);
  const lbl = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#333'; fitText(x, 'XL BIN', w * 0.3, 30, 120, 22, F.label, { weight: 700 }); x.fillStyle = '#e8402a'; fitText(x, 'clear storage', w * 0.3, 64, 140, 18, F.script); x.fillStyle = '#888'; for (let i = 0; i < 4; i++) x.fillRect(150, 30 + i * 18, 90, 6); });
  plane(0.2, 0.1, std({ map: lbl }), 0, 0.12, 0.203, 0, g);
  return g;
}
export function makeYakisobaPack(seed = 1) {
  const t = canvasT(256, 320, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, 60); x.fillStyle = '#c81e28'; fitText(x, 'SPEEDY', w / 2, 32, w - 30, 40, F.heavy); x.fillStyle = '#f2c21a'; fitText(x, 'YAKISOBA', w / 2, 100, w - 30, 42, F.heavy);
    x.fillStyle = '#c87a3a'; for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(${210},${130 + i % 40},${60},0.9)`; x.lineWidth = 4; x.beginPath(); x.moveTo(30 + i * 5, 160); x.bezierCurveTo(60 + i * 3, 230, 140 + i * 2, 160, 220 - i * 2, 260); x.stroke(); } x.fillStyle = '#3ab84a'; for (let i = 0; i < 12; i++) x.fillRect(40 + i * 16, 190 + (i % 3) * 20, 8, 5); x.fillStyle = '#fff'; fitText(x, 'with mayo + sauce', w / 2, 296, w - 40, 22, F.label); });
  const geo = new THREE.BoxGeometry(0.17, 0.035, 0.21, 4, 1, 4); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0) p.setY(i, y + 0.006 * Math.cos(p.getX(i) * 18) * Math.cos(p.getZ(i) * 14)); } geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, [std({ color: '#111' }), std({ color: '#111' }), std({ map: t, roughness: 0.3, metalness: 0.2 }), std({ color: '#111' }), std({ color: '#111' }), std({ color: '#111' })]); m.castShadow = true; m.name = 'yakisoba'; return m;
}
export function makeYakisobaBin() {
  const g = new THREE.Group(); g.name = 'yakisoba_bin'; const c = clearM();
  for (const [w, h, d, x, y, z] of [[0.6, 0.005, 0.4, 0, 0.0025, 0], [0.6, 0.18, 0.005, 0, 0.09, 0.2], [0.6, 0.18, 0.005, 0, 0.09, -0.2], [0.005, 0.18, 0.4, 0.3, 0.09, 0], [0.005, 0.18, 0.4, -0.3, 0.09, 0]]) box(w, h, d, c, x, y, z, g);
  const r = rng(71); for (let i = 0; i < 9; i++) { const p = makeYakisobaPack(i); p.position.set(-0.19 + (i % 3) * 0.19, 0.02 + Math.floor(i / 3) * 0.03, -0.1 + (Math.floor(i / 3) % 2) * 0.12); p.rotation.set(0.55 + r() * 0.3, (r() - 0.5) * 0.3, 0); g.add(p); }
  return g;
}

// ---- pink CRT + the pink house ----------------------------------------------------------------------------------
export function makePinkCRT() {
  const g = new THREE.Group(); g.name = 'pink_crt';
  const pink = std({ color: '#f2b8c8', roughness: 0.35 }), lilac = std({ color: '#b8a8e8', roughness: 0.35 }), wood = std({ color: '#a8743a', roughness: 0.6 });
  // wooden stand with a shelf; a black console on the shelf
  box(0.7, 0.03, 0.45, wood, 0, 0.55, 0, g); box(0.7, 0.03, 0.45, wood, 0, 0.12, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, 0.55, 0.04, wood, sx * 0.32, 0.275, sz * 0.2, g);
  box(0.28, 0.08, 0.22, std({ color: '#141416', roughness: 0.4 }), -0.1, 0.18, 0, g); cyl(0.03, 0.03, 0.005, std({ color: '#3a3c40' }), -0.1, 0.223, 0, g, 16);
  // the TV: rounded pink box, lilac screen bezel, a crown of hearts and loops on top
  const tv = new THREE.Group(); tv.position.y = 0.57; g.add(tv);
  rbox(0.48, 0.4, 0.42, 0.06, pink, 0, 0.2, -0.02, tv); rbox(0.42, 0.34, 0.03, 0.03, lilac, 0, 0.21, 0.19, tv);
  const scr = canvasT(320, 240, (x, w, h) => { x.fillStyle = '#0a0a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'TWINKLE STAR SPRITES', w * 0.38, 60, 200, 14, F.label); x.fillStyle = '#f2e04a'; fitText(x, 'THE END', w * 0.38, 100, 170, 34, F.engraved); x.fillStyle = '#e8702a'; x.fillRect(20, 124, w - 40, 14); x.fillStyle = '#9ad8ff'; x.beginPath(); x.moveTo(240, 40); x.lineTo(270, 120); x.lineTo(250, 180); x.lineTo(230, 120); x.fill(); x.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < h; i += 3) x.fillRect(0, i, w, 1); });
  const sm = plane(0.34, 0.26, std({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.9, roughness: 0.1 }), 0, 0.22, 0.207, 0, tv); void sm;
  const crown = new THREE.Group(); crown.position.set(0, 0.42, 0.0); tv.add(crown);
  const loop = (x, y, r2, m, rot = 0) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r2, 0.018, 8, 24), m); t.position.set(x, y, 0); t.rotation.z = rot; crown.add(t); };
  loop(-0.09, 0.07, 0.06, lilac); loop(0.09, 0.07, 0.06, lilac); loop(0, 0.06, 0.04, pink); loop(-0.19, 0.05, 0.05, lilac, 0.3); loop(0.19, 0.05, 0.05, lilac, -0.3);
  const heart = new THREE.Shape(); heart.moveTo(0, -0.04); heart.bezierCurveTo(-0.06, 0.0, -0.04, 0.05, 0, 0.025); heart.bezierCurveTo(0.04, 0.05, 0.06, 0.0, 0, -0.04);
  const hm = new THREE.Mesh(new THREE.ExtrudeGeometry(heart, { depth: 0.03, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }), pink); hm.position.set(0, 0.15, -0.015); crown.add(hm);
  for (let i = 0; i < 3; i++) { const b = cyl(0.012, 0.012, 0.01, std({ color: ['#f2e04a', '#ffffff', '#e8402a'][i] }), 0.12 + i * 0.03, 0.04, 0.2, tv, 10); b.rotation.x = Math.PI / 2; }
  // a little figure next to it, an A/V cable
  const fig = new THREE.Group(); fig.position.set(0.28, 0.57, 0.08); g.add(fig); cyl(0.02, 0.03, 0.08, std({ color: '#2a3a8a' }), 0, 0.04, 0, fig, 10); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), std({ color: '#f2dcc8' })); hd.position.y = 0.1; fig.add(hd);
  return g;
}
export function makePinkHouse() {
  const g = new THREE.Group(); g.name = 'pink_house';
  const W = 10, D = 8, H = 3.2;
  const sid = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#f6b8c0'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { x.fillStyle = 'rgba(150,70,80,0.3)'; x.fillRect(0, y, w, 2); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(0, y + 2, w, 3); } }); sid.wrapS = sid.wrapT = THREE.RepeatWrapping; sid.repeat.set(W / 0.8, H / 1.6);
  const siding = std({ map: sid, roughness: 0.8 }), trim = std({ color: '#f4f2ee', roughness: 0.5 });
  // the back of the house is a solid box; the front 2.4 m is hollow (the front rooms seen through the windows)
  const FR = 2.4;
  box(W, H, D - FR, siding, 0, H / 2, -FR - (D - FR) / 2, g);
  const sid2 = sid.clone(); sid2.repeat.set(1 / 0.8, 1 / 1.6); sid2.needsUpdate = true; const sidingU = std({ map: sid2, roughness: 0.8 });
  for (const sx of [-1, 1]) box(0.2, H, FR, sidingU, sx * (W / 2 - 0.1), H / 2, -FR / 2, g).material = [siding, siding, siding, siding, siding, siding];
  const fs = new THREE.Shape(); fs.moveTo(-W / 2, 0); fs.lineTo(W / 2, 0); fs.lineTo(W / 2, H); fs.lineTo(-W / 2, H); fs.closePath();
  const hole = (cx, w) => { const h2 = new THREE.Path(); h2.moveTo(cx - w / 2, 0.875); h2.lineTo(cx + w / 2, 0.875); h2.lineTo(cx + w / 2, 2.225); h2.lineTo(cx - w / 2, 2.225); h2.closePath(); fs.holes.push(h2); };
  hole(-2.6, 1.2); hole(2.9, 2.2);
  const fw = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.2, bevelEnabled: false }), sidingU); fw.position.z = -0.2; fw.castShadow = fw.receiveShadow = true; g.add(fw);
  const cream = std({ color: '#f2ece0', roughness: 0.9 });
  plane(W - 0.4, H, cream, 0, H / 2, -FR + 0.01, 0, g); plane(W - 0.4, H, std({ color: '#f2ece0', side: THREE.BackSide }), 0, H / 2, -0.21, 0, g);
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, FR - 0.2), std({ color: '#8a6a4a', roughness: 0.7 })); rf.rotation.x = -Math.PI / 2; rf.position.set(0, 0.02, -FR / 2 - 0.1); g.add(rf);
  const rc = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, FR), cream); rc.rotation.x = Math.PI / 2; rc.position.set(0, H - 0.01, -FR / 2); g.add(rc);
  // hip roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(W, D) / 2 + 0.4, 1.6, 4), std({ color: '#5a4a44', roughness: 0.9 })); roof.rotation.y = Math.PI / 4; roof.scale.set(W / D, 1, 1); roof.position.set(0, H + 0.8, -D / 2); roof.castShadow = true; g.add(roof);
  box(W + 0.5, 0.25, D + 0.5, trim, 0, H + 0.05, -D / 2, g);
  // front door (white storm door with glass), number, porch light; two windows left + right
  box(1.0, 2.15, 0.08, trim, 0.4, 1.075, 0.04, g); plane(0.75, 1.5, std({ color: '#2a3038', roughness: 0.1, metalness: 0.4 }), 0.4, 1.3, 0.085, 0, g);
  const num = canvasT(128, 48, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, '535', w / 2, 26, 100, 34, F.label, { weight: 700 }); }); plane(0.2, 0.08, std({ map: num, transparent: true }), 0.4, 2.55, 0.005, 0, g);
  box(0.1, 0.18, 0.1, std({ color: '#c8ccd0', metalness: 0.7, emissive: '#ffe8c0', emissiveIntensity: 0.6 }), 1.2, 1.9, 0.08, g);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#c8d4dc', roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false });
  const win = (x, w) => { for (const [bw, bh, bx, by] of [[w + 0.16, 0.08, x, 0.835], [w + 0.16, 0.08, x, 2.265], [0.08, 1.43, x - w / 2 - 0.04, 1.55], [0.08, 1.43, x + w / 2 + 0.04, 1.55]]) box(bw, bh, 0.06, trim, bx, by, 0.03, g); box(w + 0.3, 0.06, 0.18, trim, x, 0.8, 0.07, g);
    plane(w, 1.35, glass, x, 1.55, -0.1, 0, g); box(0.03, 1.35, 0.03, trim, x, 1.55, -0.08, g); box(w, 0.03, 0.03, trim, x, 1.55, -0.08, g);
    const cur = std({ color: '#f4e8f0', roughness: 0.9, side: THREE.DoubleSide }); for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.5, 6, 1), cur); const pp = c.geometry.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, 0.03 * Math.sin(pp.getX(i) * 40)); c.position.set(x + sx * (w / 2 - 0.1), 1.55, -0.3); g.add(c); } };
  win(-2.6, 1.2); win(2.9, 2.2);
  // the front room seen through the right window: the pink CRT on its stand, a lamp, a rug
  const room = new THREE.Group(); room.position.set(2.9, 0, -1.2); g.add(room);
  const crt = makePinkCRT(); crt.position.set(0.1, 0.02, 0.05); crt.scale.setScalar(1.1); crt.rotation.y = -0.15; room.add(crt);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), std({ color: '#c88ab8', roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(-0.2, 0.025, 0.1); room.add(rug);
  const lamp = new THREE.PointLight('#ffd8a8', 2.5, 5, 1.6); lamp.position.set(-0.8, 2.4, 0); room.add(lamp);
  // concrete steps, a little landing, metal hand rail
  const conc = std({ map: tex('lot_concrete', 1, 1), color: '#a8b0b8', roughness: 0.85 });
  for (let k = 0; k < 3; k++) box(1.6, 0.18, 0.35, conc, 0.4, 0.09 + k * 0.18, 1.2 - k * 0.32, g);
  box(1.6, 0.54, 0.5, conc, 0.4, 0.27, 0.3, g);
  rod(V(1.25, 0.55, 0.1), V(1.25, 1.4, 0.1), 0.02, std({ color: '#3a2a22', metalness: 0.5 }), g); rod(V(1.25, 1.4, 0.1), V(1.25, 0.9, 1.4), 0.02, std({ color: '#3a2a22', metalness: 0.5 }), g); rod(V(1.25, 0.9, 1.4), V(1.25, 0.1, 1.4), 0.02, std({ color: '#3a2a22', metalness: 0.5 }), g);
  // river-rock bed along the front with boulders, the bottle tree, flower pots, the ghost cutout
  const rock = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.08, 0), std({ color: '#b8aca0', roughness: 0.9 }), 300); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), C = new THREE.Color(); const r = rng(71);
  for (let i = 0; i < 300; i++) { const x = -W / 2 + r() * W, z = 0.3 + r() * 1.8; if (Math.abs(x - 0.4) < 1.0) { i--; continue; } const s = 0.6 + r() * 1.2; Q.setFromEuler(E.set(r() * 3, r() * 3, r() * 3)); M.compose(V(x, 0.03, z), Q, V(s, s * 0.6, s)); rock.setMatrixAt(i, M); rock.setColorAt(i, C.setHSL(0.06, 0.12, 0.45 + r() * 0.3)); }
  rock.receiveShadow = true; g.add(rock);
  for (const [x, z, s] of [[-3.8, 1.6, 0.35], [3.6, 1.5, 0.45], [4.5, 0.9, 0.3]]) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), std({ color: '#a8a098', flatShading: true })); b.scale.y = 0.6; b.position.set(x, s * 0.3, z); g.add(b); }
  // bottle tree: a black steel trunk with branches, a coloured bottle on each branch tip
  const bt = new THREE.Group(); bt.position.set(2.0, 0, 1.4); g.add(bt); const blk = std({ color: '#1a1a1a', metalness: 0.5 });
  rod(V(0, 0, 0), V(0, 1.9, 0), 0.025, blk, bt);
  for (let i = 0; i < 12; i++) { const a = i * 2.4, y = 0.6 + (i % 6) * 0.22, L = 0.35; const tip = V(Math.cos(a) * L, y + 0.25, Math.sin(a) * L); rod(V(0, y, 0), tip, 0.01, blk, bt); const b = cyl(0.035, 0.035, 0.22, std({ color: ['#2a6ad8', '#3ab8e8', '#2a8a4a', '#2a4ab8'][i % 4], transparent: true, opacity: 0.8, roughness: 0.1 }), tip.x, tip.y + 0.05, tip.z, bt, 12); b.rotation.x = Math.PI; }
  const pot = (x, z, c, f) => { const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p); cyl(0.16, 0.12, 0.25, std({ color: c, roughness: 0.6 }), 0, 0.125, 0, p, 16); for (let i = 0; i < 10; i++) { const fl2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), std({ color: i % 3 ? f : '#3a7a2a' })); fl2.position.set(Math.cos(i) * 0.1, 0.3 + (i % 3) * 0.04, Math.sin(i) * 0.1); p.add(fl2); } };
  pot(-0.6, 0.9, '#2a5ab8', '#d84ab8'); pot(1.25, 1.75, '#e8702a', '#f2c21a'); pot(-0.5, 1.6, '#c83a1a', '#e84a8a'); pot(1.4, 0.6, '#f2f2ee', '#c81e28');
  const gh = canvasT(256, 320, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f8f8f4'; x.beginPath(); x.moveTo(40, h); x.lineTo(40, 120); x.bezierCurveTo(40, 0, 216, 0, 216, 120); x.lineTo(216, h); x.lineTo(180, h - 30); x.lineTo(150, h); x.lineTo(110, h - 30); x.lineTo(75, h); x.closePath(); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.ellipse(100, 120, 14, 22, 0, 0, 7); x.ellipse(160, 120, 14, 22, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(130, 190, 18, 26, 0, 0, 7); x.fill(); });
  const ghost = plane(0.6, 0.75, std({ map: gh, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }), -2.4, 0.4, 1.4, 0.3, g); ghost.position.y = 0.4;
  rod(V(-2.4, 0, 1.4), V(-2.4, 0.1, 1.4), 0.01, blk, g);
  g.userData.collider = [-W / 2, W / 2, -D, 0.15];
  g.userData.colliders = [[-W / 2, W / 2, -D, 0.15], [-0.4, 1.3, 0.05, 1.4]];
  return g;
}
// a low steel shelf of clear storage bins (stacked, nested) with the yakisoba bin on top
export function makeBinShelf() {
  const g = new THREE.Group(); g.name = 'bin_shelf';
  const steel = std({ color: '#d8dade', metalness: 0.5, roughness: 0.4 });
  for (let k = 0; k < 3; k++) box(2.4, 0.03, 0.6, steel, 0, 0.12 + k * 0.5, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, 1.3, 0.04, steel, sx * 1.18, 0.65, sz * 0.28, g);
  for (let k = 0; k < 2; k++) for (let i = 0; i < 6; i++) { const b = makeClearBin(); b.rotation.y = Math.PI / 2; b.position.set(-1.0 + i * 0.4, 0.135 + k * 0.5, 0.05); g.add(b); if (i % 2 === 0) { const b2 = makeClearBin(); b2.rotation.y = Math.PI / 2; b2.position.set(-1.0 + i * 0.4, 0.155 + k * 0.5, 0.05); g.add(b2); } }
  const ys = makeYakisobaBin(); ys.position.set(-0.6, 1.135, 0); g.add(ys); const ys2 = makeYakisobaBin(); ys2.position.set(0.1, 1.135, 0); g.add(ys2);
  const tag = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'YAKISOBA', w * 0.35, 34, 150, 26, F.heavy); fitText(x, '3 for $2.49', w * 0.35, 70, 150, 22, F.label); x.fillStyle = '#c81e28'; fitText(x, '83¢', w * 0.82, 52, 80, 44, F.heavy); });
  plane(0.26, 0.1, std({ map: tag }), -0.25, 1.08, 0.305, 0, g);
  g.userData.collider = [-1.22, 1.22, -0.32, 0.32];
  return g;
}
