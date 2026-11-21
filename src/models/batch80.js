// Batch 80 (photos/batch80/): a yellow free-paper box, a road-message trailer with a dot-matrix LED board, and a
// little takeout shop ("Calzone Kid") with a checker floor, logo door mat, red textured wall, a condiment station and a
// three-tank iced drink dispenser. Shop, mascot, drinks and the street on the board are made up.
//   makeYellowFreeBox, makeMessageTrailer, makeCondimentStation, makeDrinkDispenser, makeTakeoutShop
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeFortuneCookies } from './batch81.js';
import { b84Mat } from './batch84.js';

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
function rotRect([a, b, c0, c1], ry) { const q = Math.round(ry / (Math.PI / 2)) & 3; if (q === 0) return [a, b, c0, c1]; if (q === 2) return [-b, -a, -c1, -c0]; if (q === 1) return [c0, c1, -b, -a]; return [-c1, -c0, a, b]; }
function placer(g, cols) { return (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const r = rotRect(c, ry); cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; }; }

// ---- yellow free-paper box -------------------------------------------------------------------------------------------
export function makeYellowFreeBox() {
  const g = new THREE.Group(); g.name = 'yellow_free_box'; const y = std({ color: '#f2d21a', roughness: 0.5 });
  box(0.4, 0.04, 0.36, y, 0, 0.02, 0, g); box(0.14, 0.72, 0.12, y, 0, 0.4, 0, g); box(0.26, 0.05, 0.22, y, 0, 0.78, 0, g);
  const fr = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; 'FREE'.split('').forEach((c, i) => fitText(x, c, w / 2, 40 + i * 56, w - 10, 52, F.heavy)); });
  plane(0.13, 0.6, std({ map: fr }), 0, 0.42, 0.061, 0, g);
  // the open-front hopper: back, sides, a sloped lid over a shelf of free papers
  const hp = new THREE.Group(); hp.position.y = 0.8; g.add(hp);
  box(0.4, 0.04, 0.3, y, 0, 0.02, 0, hp); box(0.4, 0.5, 0.03, y, 0, 0.25, -0.135, hp); for (const s of [-1, 1]) box(0.03, 0.5, 0.3, y, s * 0.185, 0.25, 0, hp);
  const lid = box(0.42, 0.03, 0.34, y, 0, 0.51, 0.01, hp); lid.rotation.x = 0.12; box(0.4, 0.08, 0.03, y, 0, 0.44, 0.135, hp);
  const paper = canvasT(256, 320, (x, w, h) => { x.fillStyle = '#e8e4d8'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; fitText(x, 'CITY BEAT', w / 2, 40, w - 20, 40, F.slab); x.fillStyle = '#333'; x.fillRect(12, 64, w - 24, 120); for (let i = 0; i < 10; i++) x.fillRect(12, 200 + i * 11, w - 24, 4); });
  const st = box(0.32, 0.06, 0.24, [std({ color: '#ddd' }), std({ color: '#ddd' }), std({ map: paper }), std({ color: '#ddd' }), std({ color: '#ddd' }), std({ color: '#ddd' })], 0, 0.07, 0.0, hp); st.rotation.x = 0.05;
  const sk = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#c8a070'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'TAKE ONE', w / 2, 34, w - 10, 30, F.marker); }); const sp = plane(0.16, 0.08, std({ map: sk }), 0.06, 0.32, -0.118, 0, hp); sp.rotation.z = 0.5;
  g.userData.collider = [-0.21, 0.21, -0.18, 0.18];
  return g;
}

// a 5x7 dot-matrix font (the board's own character set): each glyph is 7 rows of 5 bits
const DOT = { A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'], C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'], D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'], G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'], J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'], K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'], M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'], Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'], S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'], U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'], W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'], Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], 1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'], 2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], 3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'], 4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], 5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'], 6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], 7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'], 8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], 9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'], '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'], ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'] };
// ---- road message trailer ------------------------------------------------------------------------------------------
export function makeMessageTrailer(lines = ['ELM ST', 'CLOSING', '11/04']) {
  const g = new THREE.Group(); g.name = 'message_trailer';
  const orange = std({ color: '#e8901a', roughness: 0.5 }), yel = std({ color: '#f2c21a', roughness: 0.5 }), blk = std({ color: '#141414', roughness: 0.6 });
  // chassis: an A-frame tongue to a hitch, an axle with two wheels, four outrigger jacks
  box(1.8, 0.1, 1.2, yel, 0, 0.45, 0, g); rod(V(-0.6, 0.45, 0.9), V(0, 0.45, 2.1), 0.05, yel, g); rod(V(0.6, 0.45, 0.9), V(0, 0.45, 2.1), 0.05, yel, g); cyl(0.06, 0.06, 0.1, std({ color: '#888', metalness: 0.7 }), 0, 0.45, 2.15, g, 12);
  rod(V(0, 0.45, 1.85), V(0, 0.05, 1.85), 0.03, yel, g);
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.09, 10, 24), blk); t.rotation.y = Math.PI / 2; t.position.set(s * 0.95, 0.31, 0); g.add(t); cyl(0.13, 0.13, 0.12, std({ color: '#c8ccd0', metalness: 0.7 }), s * 0.95, 0.31, 0, g, 16).rotation.z = Math.PI / 2; const fd = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 20, 1, true, -Math.PI / 2, Math.PI), std({ color: '#2a2a2a', side: THREE.DoubleSide })); fd.rotation.x = Math.PI / 2; fd.rotation.z = Math.PI / 2; fd.position.set(s * 0.95, 0.31, 0); g.add(fd); }
  for (const [x, z] of [[-1.3, -0.9], [1.3, -0.9], [-1.3, 0.9], [1.3, 0.9]]) { rod(V(Math.sign(x) * 0.85, 0.45, z * 0.6), V(x, 0.45, z), 0.04, yel, g); rod(V(x, 0.5, z), V(x, 0.02, z), 0.035, std({ color: '#888', metalness: 0.6 }), g); box(0.18, 0.02, 0.18, std({ color: '#888', metalness: 0.6 }), x, 0.01, z, g); }
  // battery box + the orange mast with a solar panel on top, the board on the mast
  box(0.9, 0.5, 0.6, orange, 0, 0.75, 0.2, g); const ventT = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#e8901a'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a4a0a'; for (let i = 0; i < 8; i++) x.fillRect(10 + i * 14, 14, 6, 36); }); plane(0.5, 0.25, std({ map: ventT }), 0, 0.78, 0.501, 0, g);
  for (const s of [-1, 1]) rod(V(s * 0.2, 0.5, -0.1), V(s * 0.2, 3.2, -0.1), 0.05, orange, g); box(0.5, 0.08, 0.08, orange, 0, 1.4, -0.1, g); box(0.5, 0.08, 0.08, orange, 0, 2.3, -0.1, g);
  const sol = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#1a2a4a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8aa0c8'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.stroke(); } for (let j = 0; j <= 5; j++) { x.beginPath(); x.moveTo(0, j * h / 5); x.lineTo(w, j * h / 5); x.stroke(); } });
  const sp = box(1.4, 0.04, 0.9, [blk, blk, std({ map: sol, metalness: 0.4, roughness: 0.25 }), blk, blk, blk], 0, 3.3, -0.1, g); sp.rotation.x = -0.35;
  // the dot-matrix board: dark face, amber LED dots for the three lines (drawn as a dot grid)
  // the board: 3 lines of up to 8 characters in the 5x7 font, 1 dot between characters, 2 between lines
  const BW = 2.2, BH = 1.3, cols = 8 * 6 + 1, rows = 3 * 9 + 1;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  lines.forEach((l, li) => { const txt = l.toUpperCase().slice(0, 8), x0 = Math.floor((cols - (txt.length * 6 - 1)) / 2), y0 = 1 + li * 9;
    [...txt].forEach((ch, ci) => { const gl = DOT[ch] || DOT[' ']; gl.forEach((row, ry) => [...row].forEach((bit, rx) => { if (bit === '1') grid[y0 + ry][x0 + ci * 6 + rx] = 1; })); }); });
  const led = canvasT(980, 560, (x, w, h) => { x.fillStyle = '#0c0c0c'; x.fillRect(0, 0, w, h); const cw = w / cols, ch = h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const on = grid[j][i]; x.fillStyle = on ? '#ffc21a' : '#2a2410'; x.beginPath(); x.arc((i + 0.5) * cw, (j + 0.5) * ch, Math.min(cw, ch) * 0.38, 0, 7); x.fill(); } });
  const board = new THREE.Group(); board.position.set(0, 2.2, 0.0); g.add(board);
  box(BW + 0.12, BH + 0.12, 0.25, blk, 0, 0, -0.05, board);
  plane(BW, BH, std({ map: led, emissive: '#ffffff', emissiveMap: led, emissiveIntensity: 1.6, roughness: 0.5 }), 0, 0, 0.076, 0, board);
  const lt = new THREE.PointLight('#ffb030', 1.6, 6, 1.6); lt.position.set(0, 0, 1.0); board.add(lt);
  // an orange cone beside it
  const cone = new THREE.Group(); cone.position.set(1.5, 0, 1.4); g.add(cone); box(0.36, 0.03, 0.36, blk, 0, 0.015, 0, cone); const cn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.7, 20), std({ color: '#f26a1a', roughness: 0.5 })); cn.position.y = 0.38; cone.add(cn); const band = cyl(0.095, 0.11, 0.1, std({ color: '#f4f4f0', roughness: 0.3 }), 0, 0.4, 0, cone, 20); void band;
  g.userData.colliders = [[-1.45, 1.45, -1.05, 1.05], [-0.15, 0.15, 1.0, 2.25], [1.3, 1.7, 1.2, 1.6]];
  return g;
}

// ---- takeout shop pieces ----------------------------------------------------------------------------------------------
export function makeCondimentStation() {
  const g = new THREE.Group(); g.name = 'condiment_station';
  // butcher-block top on a grey/teal cabinet, a stainless swing-lid bin, labelled black bins, a pump ketchup dispenser
  const bb = canvasT(512, 64, (x, w, h) => { const r = rng(3); for (let i = 0; i < w; i += 14) { x.fillStyle = `hsl(${28 + r() * 8},${45 + r() * 15}%,${38 + r() * 14}%)`; x.fillRect(i, 0, 14, h); } x.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < w; i += 14) x.fillRect(i, 0, 1, h); });
  box(1.6, 0.05, 0.6, std({ map: bb, roughness: 0.4 }), 0, 0.92, 0, g); box(1.56, 0.9, 0.56, std({ color: '#6a7a80', roughness: 0.6 }), 0, 0.45, 0, g);
  const steel = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.3 }), blkP = std({ map: tex('b80_blackplastic', 0.3, 0.3), roughness: 0.6 });
  const bin = cyl(0.1, 0.1, 0.3, steel, -0.65, 1.1, 0.0, g, 24); void bin; const sl = box(0.14, 0.05, 0.02, std({ color: '#141414' }), -0.65, 1.2, 0.1, g); void sl; const logo = canvasT(64, 64, (x, w, h) => { x.fillStyle = '#c81e1e'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'CK', 32, 34, 44, 26, F.heavy); }); plane(0.06, 0.06, std({ map: logo, transparent: true }), -0.65, 1.05, 0.102, 0, g);
  const labels = ['LIDS', 'FORKS', 'STRAWS', 'NAPKINS', 'SPOONS', 'KNIVES'];
  labels.forEach((l, i) => { const x0 = -0.38 + (i % 3) * 0.19, z0 = Math.floor(i / 3) * 0.17 - 0.08; const b = new THREE.Group(); b.position.set(x0, 0.945, z0); g.add(b);
    box(0.17, 0.12, 0.15, blkP, 0, 0.06 + (i < 3 ? 0.04 : 0), 0, b); const lt = canvasT(128, 32, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, l, w / 2, 17, w - 10, 22, F.label); }); plane(0.1, 0.025, std({ map: lt }), 0, 0.08 + (i < 3 ? 0.04 : 0), 0.076, 0, b);
    const r = rng(i + 3); for (let k = 0; k < 6; k++) { const it = box(0.012, 0.08 + r() * 0.04, 0.01, std({ color: l === 'STRAWS' ? '#f4f4f0' : l === 'LIDS' ? '#e8e8e4' : '#f8f8f4' }), (r() - 0.5) * 0.12, 0.15 + (i < 3 ? 0.04 : 0), (r() - 0.5) * 0.1, b); it.rotation.z = (r() - 0.5) * 0.4; } });
  // the pump dispenser: red body, white face label, the pump head
  const pd = new THREE.Group(); pd.position.set(0.45, 0.945, 0); g.add(pd); const red = std({ color: '#c81e1e', roughness: 0.35 });
  rbox(0.22, 0.32, 0.22, 0.03, red, 0, 0.16, 0, pd); cyl(0.05, 0.05, 0.12, red, 0, 0.38, -0.02, pd, 16); const hd = rbox(0.06, 0.04, 0.16, 0.015, std({ color: '#f4f2ea' }), 0, 0.46, 0.03, pd); void hd; box(0.03, 0.05, 0.03, std({ color: '#f4f2ea' }), 0, 0.42, 0.1, pd);
  const kl = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#c81e1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(w / 2, 60, 46, 30, 0, 0, 7); x.fill(); x.fillStyle = '#c81e1e'; fitText(x, 'RUBY', w / 2, 62, 80, 26, F.heavy); x.fillStyle = '#fff'; fitText(x, 'tomato ketchup', w / 2, 120, w - 20, 16, F.label); });
  plane(0.16, 0.2, std({ map: kl }), 0, 0.17, 0.111, 0, pd);
  box(0.24, 0.02, 0.2, std({ color: '#2a2a2a' }), 0, 0.01, 0.12, pd);
  // a thermostat on the wall behind
  rbox(0.1, 0.12, 0.025, 0.01, std({ color: '#f4f4f0' }), 0.2, 1.65, -0.29, g);
  g.userData.collider = [-0.82, 0.82, -0.31, 0.31];
  return g;
}
export function makeDrinkDispenser() {
  const g = new THREE.Group(); g.name = 'drink_dispenser';
  const steel = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.3 });
  box(0.8, 0.05, 0.45, std({ map: canvasT(512, 64, (x, w, h) => { for (let i = 0; i < w; i += 14) { x.fillStyle = `hsl(30,50%,${38 + (i % 3) * 5}%)`; x.fillRect(i, 0, 14, h); } }) }), 0, 0.92, 0, g);
  box(0.76, 0.9, 0.42, std({ color: '#6a7a80' }), 0, 0.45, 0, g);
  // the base unit with three spigots and a drip tray, three tall tanks with printed sleeves on top
  rbox(0.7, 0.32, 0.4, 0.02, steel, 0, 1.11, 0, g); box(0.62, 0.025, 0.2, std({ color: '#2a2a2c', metalness: 0.5 }), 0, 0.96, 0.12, g);
  const drinks = [['FRESH', 'LEMONADE', '#f2e04a'], ['ROOIBOS', 'PEACH TEA', '#e8902a'], ['ORGANIC', 'BLACK TEA', '#5a2a12']];
  drinks.forEach(([a, b, c], i) => { const x0 = -0.22 + i * 0.22; const tank = new THREE.Group(); tank.position.set(x0, 1.27, 0); g.add(tank);
    const sleeve = canvasT(160, 360, (x, w, h) => { x.fillStyle = '#1a1a1c'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, a, w / 2, 40, w - 16, 26, F.heavy); fitText(x, b, w / 2, 72, w - 16, 26, F.heavy); x.strokeStyle = '#fff'; x.lineWidth = 4; x.beginPath(); x.arc(w / 2, 170, 42, 0, 7); x.stroke(); x.fillStyle = c; x.beginPath(); x.arc(w / 2, 170, 30, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'CALZONE KID', w / 2, 280, w - 20, 18, F.label); fitText(x, 'brewed in-house', w / 2, 310, w - 20, 14, F.small); });
    box(0.2, 0.5, 0.2, [std({ color: '#1a1a1c' }), std({ color: '#1a1a1c' }), std({ color: '#2a2a2c' }), std({ color: '#2a2a2c' }), std({ map: sleeve }), std({ color: '#1a1a1c' })], 0, 0.25, 0, tank);
    box(0.17, 0.04, 0.17, std({ color: '#e8e8e4' }), 0, 0.52, 0, tank); box(0.06, 0.03, 0.04, std({ color: '#e8e8e4' }), 0, 0.55, 0, tank);
    const sp = new THREE.Group(); sp.position.set(x0, 1.05, 0.2); g.add(sp); cyl(0.022, 0.022, 0.06, steel, 0, 0, 0.02, sp, 12).rotation.x = Math.PI / 2; const hdl = rod(V(0, 0, 0.05), V(0, 0.1, 0.09), 0.012, std({ color: '#141414' }), sp); void hdl; const loop = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 14, Math.PI), steel); loop.position.set(0, -0.04, 0.06); loop.rotation.z = Math.PI; sp.add(loop); });
  const cup = cyl(0.04, 0.032, 0.12, std({ color: '#c8ccd0', metalness: 0.7 }), 0.47, 1.01, 0.05, g, 16); void cup;
  g.userData.collider = [-0.4, 0.4, -0.23, 0.23];
  return g;
}
// the shop: 10 x 9 m, front glass at local z = 0 facing +z
export function makeTakeoutShop() {
  const g = new THREE.Group(); g.name = 'takeout_calzone_kid'; const cols = [], put = placer(g, cols);
  const W = 10, D = 9, H = 3.4;
  const teal = std({ color: '#2a6a5e', roughness: 0.75 }), redwall = std({ map: tex('b80_redwall', 3, 1.2), roughness: 0.9 }), cream = std({ color: '#f0e8d4' });
  const tb = (w, h) => b84Mat('b84_tanbrick', w / 0.92, h / 0.6, { roughness: 0.9 });   // item 84: tan face brick outside
  box(W, H + 0.8, 0.2, tb(W, H + 0.8), 0, (H + 0.8) / 2, -D - 0.1, g); box(0.2, H + 0.8, D, tb(D, H + 0.8), -W / 2 - 0.1, (H + 0.8) / 2, -D / 2, g); box(0.2, H + 0.8, D, tb(D, H + 0.8), W / 2 + 0.1, (H + 0.8) / 2, -D / 2, g); box(W + 0.4, 0.2, D + 0.2, std({ color: '#2a2a2c' }), 0, H + 0.9, -D / 2, g);
  // inner faces: red textured wall on the left, teal at the back + right
  plane(D, H, std({ map: tex('b80_redwall', 4, 1.6), roughness: 0.9 }), -W / 2 + 0.01, H / 2, -D / 2, Math.PI / 2, g);
  plane(W, H, teal, 0, H / 2, -D + 0.01, 0, g); plane(D, H, teal, W / 2 - 0.01, H / 2, -D / 2, -Math.PI / 2, g);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#e8e4dc' })); cl.rotation.x = Math.PI / 2; cl.position.set(0, H, -D / 2); g.add(cl);
  for (const [x, z] of [[-2.5, -3], [2.5, -3], [0, -6.5]]) { const p = new THREE.PointLight('#fff4e0', 9, 9, 1.5); p.position.set(x, H - 0.3, z); g.add(p); box(0.7, 0.04, 0.7, std({ color: '#fff', emissive: '#fff4e0', emissiveIntensity: 1.5 }), x, H - 0.02, z, g); }
  // checker floor: cream and black speckled vinyl tiles
  const ck = canvasT(512, 512, (x, w, h) => { const r = rng(8); const t = 64; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const blk = (i + j) % 2 === 0; x.fillStyle = blk ? '#1a1a1c' : '#ece4d0'; x.fillRect(i * t, j * t, t, t); for (let k = 0; k < 70; k++) { x.fillStyle = blk ? `rgba(200,200,200,${r() * 0.25})` : `rgba(60,50,40,${r() * 0.25})`; x.fillRect(i * t + r() * t, j * t + r() * t, 2, 2); } } x.strokeStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * t, 0); x.lineTo(i * t, h); x.stroke(); x.beginPath(); x.moveTo(0, i * t); x.lineTo(w, i * t); x.stroke(); } }); ck.wrapS = ck.wrapT = THREE.RepeatWrapping; ck.repeat.set(W / 2.4, D / 2.4);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), phys({ map: ck, roughness: 0.35, clearcoat: 0.4 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -D / 2); fl.receiveShadow = true; g.add(fl);
  // the logo door mat inside the door: black with a red ring, a running chef carrying a calzone (original mascot)
  const mat = canvasT(512, 340, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; x.beginPath(); x.arc(160, 160, 120, 0, 7); x.fill(); x.fillStyle = '#ece4d0'; x.beginPath(); x.arc(160, 160, 100, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.ellipse(160, 70, 34, 24, 0, 0, 7); x.fill(); x.fillStyle = '#f2c8a0'; x.beginPath(); x.arc(160, 110, 26, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(150, 104, 5, 5); x.fillRect(166, 104, 5, 5); x.beginPath(); x.arc(160, 118, 8, 0, Math.PI); x.fill();
    x.fillStyle = '#c81e1e'; x.fillRect(138, 136, 44, 50); x.strokeStyle = '#111'; x.lineWidth = 10; x.beginPath(); x.moveTo(148, 186); x.lineTo(126, 236); x.moveTo(172, 186); x.lineTo(200, 228); x.stroke(); x.fillStyle = '#e8a040'; x.beginPath(); x.ellipse(214, 150, 40, 22, -0.3, 0, Math.PI); x.fill();
    x.fillStyle = '#ece4d0'; fitText(x, 'CALZONE KID', 380, 140, 230, 46, F.slab); x.fillStyle = '#c81e1e'; x.fillRect(270, 176, 230, 46); x.fillStyle = '#fff'; fitText(x, 'the original folded pie', 385, 200, 210, 20, F.label); });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), std({ map: mat, roughness: 1 })); dm.rotation.x = -Math.PI / 2; dm.position.set(0, 0.018, -0.8); g.add(dm);
  // counter: red and black trimmed, a register, a menu board over it
  const ctr = new THREE.Group(); ctr.position.set(0.5, 0, -6.2); g.add(ctr);
  box(4.6, 1.0, 0.7, std({ color: '#c81e1e', roughness: 0.5 }), 0, 0.5, 0, ctr); box(4.7, 0.06, 0.8, std({ color: '#141414', roughness: 0.4 }), 0, 1.03, 0, ctr); box(4.6, 0.12, 0.72, std({ color: '#141414' }), 0, 0.06, 0, ctr);
  for (let i = 0; i < 5; i++) box(0.04, 0.9, 0.01, std({ color: '#141414' }), -2 + i, 0.5, 0.356, ctr);
  rbox(0.35, 0.25, 0.3, 0.03, std({ color: '#2a2a2c' }), -1.2, 1.18, 0.0, ctr); box(0.3, 0.2, 0.02, std({ color: '#0a1a2a', emissive: '#1a4a8a', emissiveIntensity: 0.6 }), -1.2, 1.4, 0.0, ctr).rotation.x = -0.4;
  const fc = makeFortuneCookies(); fc.position.set(-0.4, 1.06, 0.15); fc.rotation.y = 0.3; ctr.add(fc);   // item 81
  cols.push([0.5 - 2.35, 0.5 + 2.35, -6.6, -5.8]);
  const menu = canvasT(1024, 384, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.fillStyle = '#ece4d0'; fitText(x, 'CALZONE KID', w / 2, 50, w - 200, 56, F.slab); const items = [['The Classic', '9.49'], ['Pepperoni Rush', '10.49'], ['Garden Fold', '9.99'], ['Meatball Sub', '8.99'], ['Breakfast Sub', '7.49'], ['Iced Tea / Lemonade', '2.79']]; x.font = `30px ${F.label}`; items.forEach(([n, p], i) => { const cx = i < 3 ? 60 : 540, cy = 140 + (i % 3) * 70; x.fillStyle = '#ece4d0'; x.fillText(n, cx, cy); x.fillStyle = '#f2c21a'; x.fillText(p, cx + 330, cy); }); });
  plane(3.6, 1.35, std({ map: menu, emissive: '#ffffff', emissiveMap: menu, emissiveIntensity: 0.6 }), 0.5, 2.55, -D + 0.02, 0, g);
  // condiment station + drink dispenser against the right (teal) wall, two tables with chairs
  put(makeCondimentStation(), W / 2 - 0.32, -2.3, -Math.PI / 2); put(makeDrinkDispenser(), W / 2 - 0.25, -4.0, -Math.PI / 2);
  for (const [x, z] of [[-3.3, -2.0], [-3.3, -4.2]]) { const t = new THREE.Group(); box(0.8, 0.04, 0.8, std({ color: '#141414', roughness: 0.4 }), 0, 0.74, 0, t); cyl(0.04, 0.04, 0.74, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.37, 0, t, 10); cyl(0.25, 0.25, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.01, 0, t, 20);
    for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(s * 0.65, 0, 0); ch.rotation.y = s * Math.PI / 2; t.add(ch); box(0.42, 0.05, 0.42, std({ color: '#c81e1e' }), 0, 0.46, 0, ch); box(0.42, 0.4, 0.04, std({ color: '#c81e1e' }), 0, 0.7, -0.19, ch); for (const a of [-1, 1]) for (const b of [-1, 1]) rod(V(a * 0.18, 0, b * 0.18), V(a * 0.18, 0.45, b * 0.18), 0.012, std({ color: '#c8ccd0', metalness: 0.8 }), ch); }
    t.userData.collider = [-0.9, 0.9, -0.42, 0.42]; put(t, x, z); }
  // front: glass + a door, red-and-black fascia sign
  const gl = new THREE.MeshPhysicalMaterial({ color: '#c8d8e0', transparent: true, opacity: 0.2, roughness: 0.04, depthWrite: false, side: THREE.DoubleSide });
  for (const [x0, x1] of [[-W / 2, -0.7], [0.7, W / 2]]) { plane(x1 - x0, 2.6, gl, (x0 + x1) / 2, 1.5, 0, 0, g); box(x1 - x0, 0.2, 0.15, std({ color: '#141414' }), (x0 + x1) / 2, 0.1, 0, g); cols.push([x0, x1, -0.1, 0.1]); }
  const dr = new THREE.Group(); dr.position.set(-0.7, 0, 0); dr.rotation.y = -1.2; g.add(dr); plane(1.3, 2.4, gl, 0.65, 1.2, 0, 0, dr); box(0.04, 2.4, 0.04, std({ color: '#141414' }), 1.3, 1.2, 0, dr);
  box(W + 0.2, H + 0.8 - 2.8, 0.2, std({ color: '#141414' }), 0, 2.8 + (H + 0.8 - 2.8) / 2, 0, g);
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; x.fillRect(0, h - 40, w, 40); x.fillStyle = '#ece4d0'; fitText(x, 'CALZONE KID', w / 2, 110, w - 200, 130, F.slab, { spacing: 4 }); x.fillStyle = '#fff'; fitText(x, 'calzones · subs · iced tea', w / 2, h - 18, w - 300, 26, F.label); });
  box(7, 1.4, 0.15, std({ map: sg, emissive: '#ffffff', emissiveMap: sg, emissiveIntensity: 0.6 }), 0, 3.5, 0.18, g);
  cols.push([-W / 2 - 0.2, -W / 2, -D, 0], [W / 2, W / 2 + 0.2, -D, 0], [-W / 2, W / 2, -D - 0.2, -D]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -W / 2 + 0.25, maxX: W / 2 - 0.25, minZ: -D + 0.25, maxZ: -0.15 }, { minX: -0.7, maxX: 0.7, minZ: -0.4, maxZ: 0.6 }];
  return g;
}
