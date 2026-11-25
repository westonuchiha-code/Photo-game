// The things shops sell, as real objects: each is one small mesh (its parts merged, coloured by vertex) that sits on a
// shelf, can be looked at and can be taken.
//   makeGood(name)        -> Mesh, real size, standing on y = 0, or null for a name that has no model
//   stockShop(g, kind, U, V, seed, gone) -> [{ name, obj, slot, x, y, z }] (local to the interior group `g`)
//       puts two of each of the shop's goods on the wall shelving (models/interiors91.js: the shelves down the low-x wall),
//       clearing the filler stock out of the way first. `gone` is a Set of slot numbers already taken.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const M = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }); M.userData.flat = true;
const C = new THREE.Color(), PI = Math.PI;
const paint = (g, col) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); C.set(col); for (let i = 0; i < n; i++) { a[i * 3] = C.r; a[i * 3 + 1] = C.g; a[i * 3 + 2] = C.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const bx = (w, h, d, col, x = 0, y = 0, z = 0) => paint(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z), col);
const cy = (rt, rb, h, col, x = 0, y = 0, z = 0, seg = 12) => paint(new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y + h / 2, z), col);
const lay = (g, y) => g.rotateX(PI / 2).translate(0, y, 0);   // (a thing made standing, laid on its side along z)
const sp = (r, col, x, y, z) => paint(new THREE.SphereGeometry(r, 8, 6).translate(x, y, z), col);

const SHAPES = {
  bowl: (a, b) => [cy(0.085, 0.05, 0.06, a), cy(0.078, 0.078, 0.008, b, 0, 0.054)],
  box: (a, b, w = 0.1, h = 0.14, d = 0.05) => [bx(w, h, d, a), bx(w + 0.002, h * 0.3, d + 0.002, b, 0, h * 0.4)],
  bottle: (a, b) => [cy(0.03, 0.03, 0.15, a), cy(0.012, 0.028, 0.045, a, 0, 0.15), cy(0.015, 0.015, 0.018, b, 0, 0.195), cy(0.031, 0.031, 0.05, b, 0, 0.05)],
  cup: (a, b) => [cy(0.038, 0.028, 0.1, a), cy(0.04, 0.04, 0.012, b, 0, 0.1)],
  can: (a, b) => [cy(0.03, 0.03, 0.11, a), cy(0.0305, 0.0305, 0.035, b, 0, 0.04), cy(0.027, 0.027, 0.004, '#c8c8c8', 0, 0.11)],
  bag: (a, b) => [bx(0.11, 0.15, 0.06, a), bx(0.11, 0.03, 0.02, a, 0, 0.15), bx(0.07, 0.05, 0.062, b, 0, 0.05)],
  cloth: (a, b) => [bx(0.26, 0.045, 0.2, a), bx(0.1, 0.012, 0.05, b, 0, 0.045, 0.07)],
  coat: (a, b) => [bx(0.28, 0.07, 0.22, a), bx(0.12, 0.014, 0.07, b, 0, 0.07, 0.07), bx(0.012, 0.012, 0.012, '#c8b060', 0.05, 0.07, -0.02), bx(0.012, 0.012, 0.012, '#c8b060', 0.05, 0.07, -0.07)],
  scarf: (a, b) => [bx(0.16, 0.06, 0.12, a), bx(0.16, 0.062, 0.02, b, 0, 0, 0.02), bx(0.16, 0.062, 0.02, b, 0, 0, -0.03)],
  hammer: (a, b) => [lay(cy(0.012, 0.014, 0.26, a), 0.014), bx(0.09, 0.03, 0.03, b, 0, 0, -0.11)],
  torch: (a, b) => [lay(cy(0.02, 0.02, 0.13, a), 0.03), lay(cy(0.03, 0.021, 0.04, a, 0, 0.13), 0.03), lay(cy(0.026, 0.026, 0.004, b, 0, 0.17), 0.03)],
  roll: (a) => [paint(new THREE.TorusGeometry(0.04, 0.02, 8, 16).rotateX(PI / 2).translate(0, 0.02, 0), a)],
  jerry: (a, b) => [bx(0.16, 0.2, 0.09, a), bx(0.08, 0.02, 0.02, a, 0, 0.215), bx(0.015, 0.02, 0.02, a, -0.035, 0.2), bx(0.015, 0.02, 0.02, a, 0.035, 0.2), cy(0.014, 0.014, 0.03, b, 0.06, 0.2)],
  packet: (a, b) => [bx(0.07, 0.1, 0.008, a), bx(0.05, 0.04, 0.009, b, 0, 0.04)],
  ticket: (a, b) => [bx(0.09, 0.003, 0.05, a), bx(0.03, 0.004, 0.03, b, 0.02, 0)],
  umbrella: (a, b) => [lay(cy(0.022, 0.012, 0.62, a), 0.025), lay(cy(0.008, 0.008, 0.1, b, 0, 0.62), 0.025), bx(0.008, 0.008, 0.05, b, 0.02, 0.02, 0.72), lay(cy(0.004, 0.004, 0.05, '#b0b0b0', 0, -0.05), 0.025)],
  cart: (a, b) => [bx(0.06, 0.07, 0.012, a), bx(0.045, 0.035, 0.013, b, 0, 0.028)],
  pad: (a, b) => [bx(0.13, 0.025, 0.06, a), bx(0.035, 0.03, 0.07, a, -0.055, 0, 0.02), bx(0.035, 0.03, 0.07, a, 0.055, 0, 0.02), cy(0.008, 0.008, 0.006, b, 0.035, 0.025, -0.005), cy(0.008, 0.008, 0.006, '#d8b020', 0.05, 0.025, 0.005), bx(0.03, 0.006, 0.01, '#101010', -0.04, 0.025, 0)],
  mag: (a, b) => [bx(0.15, 0.006, 0.2, a), bx(0.12, 0.0065, 0.05, b, 0, 0, -0.06)],
  flowers: (a, b) => [lay(paint(new THREE.ConeGeometry(0.05, 0.22, 10).rotateX(PI), '#e8e4d8').translate(0, 0.11, 0), 0.05), sp(0.03, a, 0, 0.06, 0.2), sp(0.028, b, 0.035, 0.07, 0.19), sp(0.028, a, -0.035, 0.065, 0.19), sp(0.026, b, 0, 0.085, 0.17), sp(0.03, '#3a7a3a', 0, 0.05, 0.15)],
  pot: (a, b) => [cy(0.055, 0.04, 0.08, a), sp(0.07, b, 0, 0.14, 0), sp(0.05, b, 0.05, 0.12, 0.02), sp(0.05, b, -0.045, 0.13, -0.02), sp(0.045, b, 0, 0.2, 0)],
  comb: (a) => [bx(0.13, 0.005, 0.012, a, 0, 0, -0.01), ...[...Array(9)].map((_, i) => bx(0.006, 0.004, 0.022, a, -0.056 + i * 0.014, 0, 0.006))],
  book: (a, b) => [bx(0.11, 0.022, 0.17, a), bx(0.106, 0.018, 0.166, '#e8e2d0', 0.003, 0.002), bx(0.11, 0.0225, 0.03, b, 0, 0, -0.03)],
  pan: (a, b) => [cy(0.11, 0.1, 0.07, a, 0, 0, 0, 16), cy(0.1, 0.1, 0.006, b, 0, 0.066, 0, 16), bx(0.04, 0.012, 0.02, a, -0.125, 0.05), bx(0.04, 0.012, 0.02, a, 0.125, 0.05)],
  burger: (a, b) => [cy(0.05, 0.045, 0.02, a), cy(0.054, 0.054, 0.012, b, 0, 0.02), cy(0.056, 0.056, 0.006, '#4a9a3a', 0, 0.032), cy(0.04, 0.05, 0.03, a, 0, 0.038)],
  pie: (a, b) => [paint(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 8, 1, false, 0, PI / 3).translate(-0.03, 0.0175, -0.05), a), paint(new THREE.CylinderGeometry(0.1, 0.1, 0.004, 8, 1, false, 0, PI / 3).translate(-0.03, 0.037, -0.05), b)],
  tray: (a, b) => [bx(0.16, 0.02, 0.12, a), bx(0.14, 0.018, 0.1, b, 0, 0.012)],
  links: (a) => [0, 1, 2].map((i) => lay(cy(0.014, 0.014, 0.1, a, 0, -0.05), 0.014).translate(-0.035 + i * 0.035, 0, 0)).concat([bx(0.16, 0.004, 0.14, '#e8e4dc')]),
  tape: (a, b) => [bx(0.19, 0.025, 0.105, a), bx(0.12, 0.0255, 0.04, b)],
  tub: (a, b) => [cy(0.055, 0.038, 0.12, a), sp(0.03, b, 0, 0.125, 0), sp(0.028, b, 0.025, 0.12, 0.01), sp(0.028, b, -0.02, 0.12, -0.015), cy(0.0555, 0.05, 0.03, '#f0ece0', 0, 0.06)],
  radio: (a, b) => [bx(0.13, 0.08, 0.035, a), bx(0.05, 0.05, 0.036, b, -0.03, 0.015), cy(0.003, 0.003, 0.1, '#c0c0c0', 0.05, 0.08), cy(0.012, 0.012, 0.037, '#d8d8d0', 0.035, 0.04).rotateX(0)],
};
// name -> [shape, colour, second colour]
const GOODS = {
  'Bowl of noodles': ['bowl', '#e8e4dc', '#d8b46a'], 'Dumplings': ['tray', '#b08a5a', '#f0e8d8'], 'Bottle of tea': ['bottle', '#5a7a3a', '#e8e0c8'],
  'Coffee': ['cup', '#f0ece4', '#3a2a20'], 'Pastry': ['tray', '#f0ece4', '#c8904a'], 'Bag of coffee beans': ['bag', '#5a3a26', '#e8d8b0'],
  'Clean shirt': ['cloth', '#f2f0ea', '#c8d0dc'], 'Soap powder': ['box', '#2a6ad8', '#f4f2ea', 0.12, 0.17, 0.06],
  'Hammer': ['hammer', '#b08a5a', '#4a4c50'], 'Flashlight': ['torch', '#c8281e', '#f4f0d0'], 'Duct tape': ['roll', '#8a8c90'], 'Jerry can': ['jerry', '#b8281e', '#1a1a1c'],
  'Soda': ['can', '#c8281e', '#f4f2ea'], 'Snack bar': ['box', '#e8742a', '#3a2a20', 0.11, 0.022, 0.035], 'Lottery ticket': ['ticket', '#f2c21a', '#c8281e'], 'Umbrella': ['umbrella', '#1a1a1c', '#7a5a34'],
  'Game cartridge': ['cart', '#6a6c70', '#e8742a'], 'Controller': ['pad', '#3a3c40', '#c8281e'], 'Game magazine': ['mag', '#7a3a8a', '#f2c21a'],
  'Bouquet': ['flowers', '#d84a6a', '#f2e04a'], 'Potted fern': ['pot', '#a8583a', '#3a8a4a'], 'Packet of seeds': ['packet', '#e8e4d0', '#3a8a4a'],
  'Hair tonic': ['bottle', '#2a8a7a', '#1a1a1c'], 'Comb': ['comb', '#1a1a1c'],
  'Bandages': ['box', '#f4f2ea', '#c8281e', 0.09, 0.06, 0.04], 'Painkillers': ['box', '#f4f2ea', '#2a6ad8', 0.08, 0.05, 0.025], 'Vitamins': ['bottle', '#e8a02a', '#f4f2ea'],
  'Paperback': ['book', '#a8382a', '#e8d8a0'], 'Town map': ['mag', '#e8e0c4', '#3a6a9a'], 'Notebook': ['book', '#1a1a1c', '#c8281e'],
  'Hot pot': ['pan', '#4a4c50', '#b8402a'], 'Rice wine': ['bottle', '#e8e4d8', '#c8281e'],
  'Scarf': ['scarf', '#8a2a2a', '#d8c8a0'], 'Jacket': ['coat', '#27324a', '#1c2436'], 'Sewing kit': ['box', '#7a3a8a', '#f4f2ea', 0.12, 0.035, 0.08],
  'Burger': ['burger', '#c8904a', '#5a3020'], 'Slice of pie': ['pie', '#c8a05a', '#8a2a3a'], 'Milkshake': ['cup', '#f0c8d0', '#f4f2ea'],
  'Sausages': ['links', '#a8482a'], 'Steak': ['tray', '#f4f2ea', '#a82a2a'],
  'Video tape': ['tape', '#1a1a1c', '#f4f2ea'], 'Blank tape': ['tape', '#1a1a1c', '#2a6ad8'], 'Popcorn': ['tub', '#c8281e', '#f4e8a0'],
  'Pocket radio': ['radio', '#3a3c40', '#8a8c90'],
};
const cache = new Map();
export function goodGeo(name) { if (cache.has(name)) return cache.get(name); const s = GOODS[name]; if (!s) return null; const parts = SHAPES[s[0]](s[1], s[2], s[3], s[4], s[5]).map((g) => (g.index ? g.toNonIndexed() : g)); for (const g of parts) for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k); const geo = mergeGeometries(parts); geo.computeBoundingBox(); cache.set(name, geo); return geo; }
export function makeGood(name) { const geo = goodGeo(name); if (!geo) return null; const m = new THREE.Mesh(geo, M); m.name = 'good:' + name; m.castShadow = false; return m; }

// the wall shelving in a shop (interiors91): four boards at y = 0.3 + s * 0.42 down the low-x wall, z from 1.5 to V - 1.9.
// The goods go on the two boards nearest the eye, a clear stretch for each.
const T = 0.1, GAP = 0.34;
export function stockShop(g, kind, U, V, seed, gone) {
  const names = kind.goods.map((q) => q[0]).filter((n) => GOODS[n]), slots = [], z0 = 1.7, z1 = V - 2.2, per = Math.max(1, Math.floor((z1 - z0) / 0.62)); let k = 0;
  for (const s of [2, 3, 1]) for (let i = 0; i < per && k < names.length * 2; i++, k++) { const name = names[(k + seed) % names.length]; slots.push({ slot: k, name, s, z: z0 + (i + 0.5) * ((z1 - z0) / per), y: 0.3 + s * 0.42 + 0.014 }); }
  // clear the filler boxes off those stretches of board (they are instances: shrink the ones in the way to nothing)
  let im = null; g.traverse((o) => { if (o.isInstancedMesh && o.geometry.type === 'BoxGeometry' && !im) im = o; });
  if (im) { const m4 = new THREE.Matrix4(), p = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0); let ch = false; for (let i = 0; i < im.count; i++) { im.getMatrixAt(i, m4); p.setFromMatrixPosition(m4); if (p.x > T + 0.3) continue; if (slots.some((q) => Math.abs(p.z - q.z) < GAP && p.y > q.y - 0.02 && p.y < q.y + 0.4)) { im.setMatrixAt(i, zero); ch = true; } } if (ch) im.instanceMatrix.needsUpdate = true; }
  const out = [];
  for (const q of slots) { if (gone && gone.has(q.slot)) continue; const o = makeGood(q.name); const b = o.geometry.boundingBox, long = b.max.z - b.min.z > 0.3; o.position.set(T + 0.16, q.y, q.z); o.rotation.y = long ? 0 : PI / 2 + ((q.slot * 37) % 7 - 3) * 0.05; g.add(o); out.push({ name: q.name, obj: o, slot: q.slot, x: o.position.x, y: q.y + (b.max.y - b.min.y) / 2, z: q.z }); }
  return out;
}
