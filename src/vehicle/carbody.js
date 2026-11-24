// Parametric car bodies: every car is modelled from its proportions, not from photos. Paint is a clearcoated metallic
// MeshPhysicalMaterial in a colour taken from the photo; trim, wheels and interior use plain modelled materials plus a
// few library textures (brushed steel, rubber). Local frame: +z = forward, +x = left, y up, ground at y = 0.
//   makeCar(spec) -> Group with userData { spec, wheels: [{ pivot, spin, front, side }], body, brakeMats, lamps }
//   CAR_TYPES: preset specs (hatch, sedan, coupe, kei, wagon, pickup, van, taxi, police)
import * as THREE from 'three';
import { mergeStatic } from '../stream.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// a soft studio environment for the car paint + chrome (the night scene has nothing bright to reflect)
let _env = null;
export function carEnv(renderer) { if (_env || !renderer) return _env; const pm = new THREE.PMREMGenerator(renderer); _env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); for (const m of _envMats) { m.envMap = _env; m.needsUpdate = true; } return _env; }
const _envMats = [];
function envd(m, i = 0.6) { m.envMapIntensity = i; if (_env) m.envMap = _env; _envMats.push(m); return m; }
const paintMat = (color, metal = 0.45) => envd(new THREE.MeshPhysicalMaterial({ color, metalness: metal, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }), 0.38);
const MATS = {};
function mats() {
  if (MATS.glass) return MATS;
  MATS.glass = envd(new THREE.MeshPhysicalMaterial({ color: '#10161c', metalness: 0.1, roughness: 0.03, transparent: true, opacity: 0.78, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }), 1.0);
  MATS.black = new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.55 });
  MATS.trim = new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.4, metalness: 0.2 });
  MATS.chrome = envd(new THREE.MeshStandardMaterial({ color: '#e8ecf0', metalness: 1, roughness: 0.18 }), 0.45);
  MATS.steel = envd(new THREE.MeshStandardMaterial({ map: tex('b86_stainless', 0.3, 0.3), color: '#aed8f4', metalness: 0.7, roughness: 0.3 }), 0.8);
  MATS.alloy = envd(new THREE.MeshStandardMaterial({ color: '#b8bcc2', metalness: 0.9, roughness: 0.28 }), 0.9);
  MATS.darkAlloy = envd(new THREE.MeshStandardMaterial({ color: '#3a3c40', metalness: 0.85, roughness: 0.32 }), 0.8);
  MATS.disc = new THREE.MeshStandardMaterial({ color: '#6a6c70', metalness: 0.8, roughness: 0.45 });
  MATS.seat = new THREE.MeshStandardMaterial({ color: '#1e1e22', roughness: 0.85 });
  MATS.dash = new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.7 });
  MATS.head = new THREE.MeshStandardMaterial({ color: '#f4f8ff', emissive: '#e8f0ff', emissiveIntensity: 1.6, roughness: 0.1 });
  MATS.lens = envd(new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, roughness: 0.02, clearcoat: 1, depthWrite: false }), 1.0);
  MATS.amber = new THREE.MeshStandardMaterial({ color: '#f09a2a', emissive: '#a85a10', emissiveIntensity: 0.6, roughness: 0.2 });
  // tyre sidewall + tread: a canvas with block tread and lettering-free sidewall rings
  const tread = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#18181a'; x.fillRect(0, 0, w, h); x.fillStyle = '#0a0a0b'; for (let i = 0; i < h; i += 16) { x.fillRect(6, i, 22, 9); x.fillRect(36, i + 8, 22, 9); } x.fillRect(30, 0, 4, h); });
  tread.wrapS = tread.wrapT = THREE.RepeatWrapping; tread.repeat.set(1, 6);
  MATS.tread = new THREE.MeshStandardMaterial({ map: tread, roughness: 0.92 });
  MATS.rubber = new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.88, side: THREE.DoubleSide });
  return MATS;
}

// ---- presets: proportions from real cars of each class (metres). belt = shoulder height, roof = roof height,
// hood/deck = heights at the nose/tail tops, ws/rw = windscreen / rear-glass rake lengths, cabin = roof start..end
export const CAR_TYPES = {
  hatch:  { L: 4.05, W: 1.74, H: 1.46, WB: 2.55, R: 0.31, ovF: 0.82, clr: 0.15, belt: 0.92, hood: 0.84, nose: 0.66, deck: 0.98, tail: 0.86, cabin: [-1.55, 0.25], ws: 0.85, rw: 0.35, roofW: 0.78, box: 4.5, mass: 1150, power: 85 },
  sedan:  { L: 4.75, W: 1.80, H: 1.44, WB: 2.75, R: 0.33, ovF: 0.95, clr: 0.15, belt: 0.95, hood: 0.90, nose: 0.70, deck: 1.02, tail: 0.92, cabin: [-1.05, 0.55], ws: 0.9, rw: 0.7, roofW: 0.80, box: 4.2, mass: 1450, power: 120 },
  coupe:  { L: 4.45, W: 1.79, H: 1.30, WB: 2.58, R: 0.33, ovF: 0.92, clr: 0.12, belt: 0.88, hood: 0.80, nose: 0.60, deck: 0.92, tail: 0.86, cabin: [-0.95, 0.30], ws: 1.05, rw: 0.95, roofW: 0.76, box: 4.0, mass: 1300, power: 155 },
  kei:    { L: 3.39, W: 1.47, H: 1.62, WB: 2.40, R: 0.27, ovF: 0.52, clr: 0.15, belt: 0.95, hood: 0.92, nose: 0.78, deck: 1.0, tail: 0.95, cabin: [-1.35, 0.60], ws: 0.55, rw: 0.12, roofW: 0.86, box: 5.5, mass: 850, power: 47 },
  wagon:  { L: 4.70, W: 1.80, H: 1.48, WB: 2.72, R: 0.33, ovF: 0.95, clr: 0.16, belt: 0.95, hood: 0.88, nose: 0.68, deck: 1.0, tail: 0.95, cabin: [-1.80, 0.45], ws: 0.9, rw: 0.18, roofW: 0.82, box: 4.6, mass: 1500, power: 110 },
  pickup: { L: 5.30, W: 1.95, H: 1.85, WB: 3.25, R: 0.40, ovF: 0.95, clr: 0.24, belt: 1.18, hood: 1.15, nose: 0.98, deck: 1.10, tail: 1.10, cabin: [-0.55, 0.55], ws: 0.75, rw: 0.08, roofW: 0.86, box: 5.0, mass: 2100, power: 220, bed: true },
  // the town's own cars (proportions from the photos they were made from)
  keitruck: { L: 3.395, W: 1.475, H: 1.78, WB: 1.90, R: 0.27, ovF: 0.62, clr: 0.18, belt: 1.02, hood: 1.0, nose: 0.92, deck: 1.0, tail: 0.95, cabin: [0.5, 1.12], ws: 0.42, rw: 0.04, roofW: 0.9, mass: 750, power: 46, bed: true, bedY: 0.72, cabover: true },
  keivan: { L: 3.33, W: 1.475, H: 1.88, WB: 2.40, R: 0.275, ovF: 0.45, clr: 0.17, belt: 1.02, hood: 1.0, nose: 0.9, deck: 1.02, tail: 1.0, cabin: [-1.52, 1.08], ws: 0.44, rw: 0.04, roofW: 0.92, mass: 900, power: 47, cabover: true },
  scout:  { L: 4.2, W: 1.78, H: 1.72, WB: 2.30, R: 0.37, ovF: 0.95, clr: 0.36, belt: 1.16, hood: 1.13, nose: 1.02, deck: 1.16, tail: 1.12, cabin: [-1.6, 0.32], ws: 0.3, rw: 0.05, roofW: 0.93, mass: 1700, power: 110, boxy: true },
  bigtruck: { L: 6.2, W: 2.05, H: 2.05, WB: 3.9, R: 0.44, ovF: 1.05, clr: 0.32, belt: 1.36, hood: 1.33, nose: 1.16, deck: 1.3, tail: 1.3, cabin: [-0.95, 0.75], ws: 0.7, rw: 0.08, roofW: 0.88, mass: 3000, power: 320, bed: true, bedY: 0.98, boxy: true },
  keiold: { L: 2.99, W: 1.295, H: 1.345, WB: 2.0, R: 0.27, ovF: 0.5, clr: 0.16, belt: 0.84, hood: 0.76, nose: 0.62, deck: 0.86, tail: 0.8, cabin: [-0.95, 0.22], ws: 0.55, rw: 0.42, roofW: 0.85, mass: 520, power: 28 },
  keisport: { L: 3.4, W: 1.475, H: 1.42, WB: 2.36, R: 0.285, ovF: 0.56, clr: 0.13, belt: 0.86, hood: 0.78, nose: 0.62, deck: 0.92, tail: 0.84, cabin: [-1.12, 0.2], ws: 0.72, rw: 0.32, roofW: 0.82, mass: 700, power: 64 },
  oldvan: { L: 4.3, W: 1.7, H: 1.8, WB: 2.45, R: 0.33, ovF: 0.55, clr: 0.3, belt: 1.02, hood: 0.98, nose: 0.84, deck: 1.02, tail: 1.0, cabin: [-1.95, 0.92], ws: 0.55, rw: 0.05, roofW: 0.9, mass: 1500, power: 70, cabover: true },
  van:    { L: 4.95, W: 1.90, H: 2.05, WB: 3.00, R: 0.33, ovF: 0.70, clr: 0.18, belt: 1.12, hood: 1.05, nose: 0.86, deck: 1.15, tail: 1.10, cabin: [-2.35, 0.90], ws: 0.75, rw: 0.06, roofW: 0.88, box: 6.0, mass: 2000, power: 120 },
};

// loft a closed tube through rings of points. sections: [{ z, pts: [[x, y], ...] }] (same count per ring, closed loop,
// counter-clockwise seen from +z). Each ring's first point is bottom-centre. Ends are capped with fans.
function loft(sections, colorAt = null) {
  const pos = [], idx = [], uv = [], n = sections[0].pts.length;
  sections.forEach((sc, i) => { for (let j = 0; j <= n; j++) { const [x, y] = sc.pts[j % n]; pos.push(x, y, sc.z); uv.push(j / n, i / (sections.length - 1)); } });
  for (let i = 0; i < sections.length - 1; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  for (const [si, back] of [[0, true], [sections.length - 1, false]]) { const sc = sections[si]; let cy = 0; sc.pts.forEach((q) => (cy += q[1] / n)); const c = pos.length / 3; pos.push(0, cy, sc.z); uv.push(0.5, si ? 1 : 0); for (let j = 0; j < n; j++) { const a = si * (n + 1) + j; if (back) idx.push(c, a, a + 1); else idx.push(c, a + 1, a); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  if (colorAt) { const col = []; for (let i = 0; i < pos.length; i += 3) { const c = colorAt(pos[i], pos[i + 1], pos[i + 2]); col.push(c.r, c.g, c.b); } g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  g.computeVertexNormals(); return g;
}
// a rounded-trapezoid ring: bottom half-width wb at y0, top half-width wt at y1, corner radii rb (bottom) rt (top),
// a shoulder bulge `bulge` (extra half-width at mid-height). k points per corner. Returns points + which are "top".
function ring(wb, wt, y0, y1, rb, rt, bulge = 0, k = 5, cuts = []) {
  const pts = [], top = [], h = y1 - y0; rt = Math.min(rt, h * 0.45, wt * 0.9); rb = Math.min(rb, h * 0.45, wb * 0.9);
  const side = (t) => (wb + (wt - wb) * t) + bulge * Math.sin(Math.PI * t);
  const P = (x, y, isTop) => { pts.push([x, y]); top.push(isTop); };
  P(0, y0, false);
  for (let i = 0; i <= k; i++) { const a = -Math.PI / 2 + (i / k) * Math.PI / 2; P(side(rb / h) - rb + Math.cos(a) * rb, y0 + rb + Math.sin(a) * rb, false); }   // bottom-right corner
  // side points: 5 even ones plus a pair hugging each colour cut (clamped into range so every ring has the same count)
  const ta = rb / h, tb = 1 - rt / h, ts = [];
  for (let i = 1; i < 6; i++) ts.push(ta + (i / 6) * (tb - ta));
  for (const c of cuts) for (const e of [-0.006, 0.006]) ts.push(Math.min(tb - 0.001, Math.max(ta + 0.001, (c + e - y0) / h)));
  ts.sort((a, b) => a - b); for (const t of ts) P(side(t), y0 + t * h, false);                                                   // right side
  for (let i = 0; i <= k; i++) { const a = (i / k) * Math.PI / 2; P(side(1 - rt / h) - rt + Math.cos(a) * rt, y1 - rt + Math.sin(a) * rt, true); }                    // top-right corner
  P(0, y1, true);
  const n = pts.length; for (let i = n - 2; i >= 1; i--) P(-pts[i][0], pts[i][1], top[i]);   // mirror to the left side
  return { pts, top };
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function plateT(text) { return canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a3a6a'; x.lineWidth = 6; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#2a3a6a'; fitText(x, 'ELM COUNTY', w / 2, 24, w - 60, 18, F.label, { spacing: 3 }); fitText(x, text, w / 2, 80, w - 30, 64, F.label, { weight: 700 }); }); }

// one wheel: tyre (lathe profile with a tread band), five-spoke rim, disc + caliper. Returns { pivot (steers), spin (rolls) }
function makeWheel(R, tw, side, rimStyle, rimMat) {
  const m = mats(); const pivot = new THREE.Group(), spin = new THREE.Group(); pivot.add(spin);
  const rr = R * 0.62;   // rim radius
  const prof = [[rr, -tw / 2], [rr * 1.04, -tw / 2 - 0.004], [R * 0.93, -tw / 2], [R, -tw / 2 + 0.03], [R, tw / 2 - 0.03], [R * 0.93, tw / 2], [rr * 1.04, tw / 2 + 0.004], [rr, tw / 2]].map(([r, y]) => new THREE.Vector2(r, y));
  const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, 36), m.rubber); tyre.rotation.z = Math.PI / 2; spin.add(tyre);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.002, R * 1.002, tw - 0.06, 36, 1, true), m.tread); band.rotation.z = Math.PI / 2; spin.add(band);
  // rim: a dished barrel + 5 spokes + hub + nuts, on the outer face
  const out = side;   // +1 left wheel faces +x, -1 right wheel faces -x
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, tw * 0.8, 28, 1, true), m.darkAlloy); barrel.rotation.z = Math.PI / 2; spin.add(barrel);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.012, 6, 32), rimMat); lip.rotation.y = Math.PI / 2; lip.position.x = out * tw * 0.4; spin.add(lip);
  const spokes = rimStyle === 'steel' ? 0 : 5;
  if (spokes) { for (let k = 0; k < spokes; k++) { const a = (k / spokes) * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, rr * 0.92, 0.05), rimMat); sp.position.set(out * tw * 0.36, Math.cos(a) * rr * 0.48, Math.sin(a) * rr * 0.48); sp.rotation.x = a; spin.add(sp); } }
  else { const face = new THREE.Mesh(new THREE.CircleGeometry(rr * 0.98, 28), rimMat); face.rotation.y = out * Math.PI / 2; face.position.x = out * tw * 0.32; spin.add(face); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const h = new THREE.Mesh(new THREE.CircleGeometry(0.025, 10), m.black); h.rotation.y = out * Math.PI / 2; h.position.set(out * tw * 0.33, Math.cos(a) * rr * 0.6, Math.sin(a) * rr * 0.6); spin.add(h); } }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.22, rr * 0.25, 0.04, 16), rimMat); hub.rotation.z = Math.PI / 2; hub.position.x = out * tw * 0.38; spin.add(hub);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; const n = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), m.chrome); n.rotation.z = Math.PI / 2; n.position.set(out * tw * 0.41, Math.cos(a) * rr * 0.15, Math.sin(a) * rr * 0.15); spin.add(n); }
  // brake disc + caliper sit on the pivot (they steer but don't spin)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.82, rr * 0.82, 0.022, 28), m.disc); disc.rotation.z = Math.PI / 2; disc.position.x = out * 0.02; pivot.add(disc);
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.06, rr * 0.5, rr * 0.3), new THREE.MeshStandardMaterial({ color: '#b81e1e', roughness: 0.4 })); cal.position.set(out * 0.04, rr * 0.55, -rr * 0.25); pivot.add(cal);
  tyre.castShadow = band.castShadow = true;
  return { pivot, spin };
}

// make a car. spec = { type, color, plate, rim ('alloy'|'steel'|'black'), trim, roofColor, livery(canvas fn), name }
export function makeCar(opts = {}) {
  const P = { ...CAR_TYPES[opts.type || 'sedan'], ...opts };
  const m = mats(); const g = new THREE.Group(); g.name = 'car_' + (opts.name || opts.type || 'sedan');
  const body = new THREE.Group(); g.add(body);   // the sprung part: rolls / pitches on the suspension
  let paint = paintMat(P.color || '#2a4a8a', P.metal ?? 0.45);
  if (P.dust) { const c = new THREE.Color(P.color).lerp(new THREE.Color('#bdb5a5'), P.dust * 0.45); paint = envd(new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.15, roughness: 0.55 + P.dust * 0.35, clearcoat: Math.max(0, 0.6 - P.dust), clearcoatRoughness: 0.5 }), 0.22); }
  const L = P.L, W = P.W / 2, zF = L / 2, zR = -L / 2;
  const axF = zF - P.ovF, axR = axF - P.WB, archR = P.R + 0.045, axY = P.R;
  // ---- lower body: sections along z, tops follow nose -> hood -> belt -> deck -> tail, bottoms cut for the arches
  const N = 52, secs = [];
  // colour bands painted onto the lower body by height (two-tone vans, stripe liveries): [[y0, y1, colour], ...]
  const bands = (P.bands || []).map(([a, b, c]) => [a, b, new THREE.Color(c)]), cuts = bands.flatMap(([a, b]) => [a, b]), white = new THREE.Color('#ffffff');
  const bandAt = (x, y) => { for (const [a, b, c] of bands) if (y > a && y < b) return c; return white; };
  const halfW = (z) => { const end = Math.max(smooth(zF - 0.32, zF, z), smooth(zR + 0.22, zR, z)); return W * (1 - 0.07 * end ** 2) * (0.35 + 0.65 * Math.sqrt(Math.max(0, 1 - end ** 3 * 0.92))); };
  for (let i = 0; i <= N; i++) {
    const z = zR + 0.015 + (i / N) * (L - 0.03);
    const endF = smooth(zF - 0.32, zF, z), endR = smooth(zR + 0.22, zR, z);
    let top = P.belt; { const ha = P.cabin[1] + P.ws * 0.75; top += (P.hood - P.belt) * smooth(ha, Math.max(ha + 0.08, axF - 0.1), z); } top += (P.nose - P.hood) * smooth(axF + 0.05, zF - 0.02, z) ** 1.4;
    if (P.bed) top += ((P.bedY ?? P.belt - 0.4) - P.belt) * smooth(P.cabin[0] - P.rw - 0.06, P.cabin[0] - P.rw - 0.14, z);
    if (!P.bed) { top += (P.deck - P.belt) * smooth(P.cabin[0] - P.rw * 0.4, axR + 0.2, z); top += (P.tail - P.deck) * smooth(axR - 0.1, zR, z); }
    let bot = P.clr + 0.1 * Math.max(endF, endR) ** 1.5;
    for (const az of [axF, axR]) { const d = Math.abs(z - az); if (d < archR) bot = Math.max(bot, axY + Math.sqrt(archR * archR - d * d) * 0.97); }
    const end = Math.max(endF, endR); const w = W * (1 - 0.07 * end ** 2);
    const plan = Math.sqrt(Math.max(0.0, 1 - end ** 3 * 0.92));   // rounded corners in plan
    const ww = w * (0.35 + 0.65 * plan), h = Math.max(0.1, top - bot);
    const r = ring(ww * (P.boxy ? 0.98 : 0.95), ww * (P.boxy ? 0.97 : 0.93), bot, bot + h, 0.05, Math.min(P.boxy ? 0.06 : 0.12, h * 0.4), ww * (P.boxy ? 0.01 : 0.04), 5, cuts);
    secs.push({ z, pts: r.pts });
  }
  const lowerGeo = loft(secs, bands.length ? bandAt : null); if (P.crash) crash(lowerGeo, P, zF, axF);
  const lowerMat = bands.length ? paint.clone() : paint; if (bands.length) { lowerMat.vertexColors = true; _envMats.push(lowerMat); }
  const lower = new THREE.Mesh(lowerGeo, lowerMat); lower.castShadow = lower.receiveShadow = true; body.add(lower);
  // dark arch liners, sills
  for (const az of [axF, axR]) for (const s of [-1, 1]) { const lin = new THREE.Mesh(new THREE.CylinderGeometry(archR + 0.01, archR + 0.01, 0.34, 24, 1, true, 0, Math.PI), m.black); lin.material = lin.material.clone(); lin.material.side = THREE.DoubleSide; lin.rotation.z = Math.PI / 2; lin.position.set(s * (W - 0.19), axY, az); body.add(lin); }
  for (const s of [-1, 1]) { const sill = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, P.WB - archR * 2 - 0.05), m.trim); sill.position.set(s * (W * 0.97), P.clr + 0.07, (axF + axR) / 2); body.add(sill); }
  // ---- greenhouse: belt -> roof, raked windscreen + rear glass, roof narrower than the shoulders (tumblehome)
  const [c0, c1] = P.cabin; const gz0 = c0 - P.rw, gz1 = c1 + P.ws; const G = [], GN = 30; let topMask = null;
  const wbAt = (z) => halfW(z) * 0.94, wb = W * 0.94, wtR = W * P.roofW, yb = P.belt - 0.03;
  // stations: even ones plus rings exactly at the roof's ends, so the paint/glass split runs along a clean line
  const zs = []; for (let i = 0; i <= GN; i++) zs.push(gz0 + 0.01 + (i / GN) * (gz1 - gz0 - 0.02));
  for (const zc of [c0, c1]) { const k = zs.findIndex((q) => Math.abs(q - zc) < 0.03); if (k > 0 && k < zs.length - 1) zs[k] = zc; else zs.push(zc); }
  zs.sort((a, b) => a - b);
  for (const z of zs) {
    const up = z < c0 ? ((z - gz0) / (c0 - gz0)) ** 0.85 : z > c1 ? ((gz1 - z) / (gz1 - c1)) ** 0.8 : 1;
    const crown = 0.03 * Math.sin(Math.PI * clamp01((z - gz0) / (gz1 - gz0)));
    const y1 = yb + (P.H - yb) * Math.max(0.02, up) + (up > 0.98 ? crown : crown * up);
    const wbz = wbAt(z), wt = wbz + (wtR - wbz) * Math.min(1, up * 1.15);
    const r = ring(wbz, wt, yb, y1, 0.0, 0.07 * up + 0.005, 0.01 * up); G.push({ z, pts: r.pts }); topMask = r.top;
  }
  const gh = loft(G); if (P.crash) crash(gh, P, zF, axF);
  // material groups: the roof (top points of rings inside the cabin) = paint, everything else = glass
  const n1 = G[0].pts.length + 1, gi = gh.index.array, roofTri = [], glassTri = [];
  const isRoofV = (v) => { const ring_ = Math.floor(v / n1), j = (v % n1) % (n1 - 1); if (ring_ >= G.length) return false; return topMask[j]; };
  // ...plus the sheet-metal side panels: the sail behind the rear door glass (sedans/coupes) and the strip ahead of the
  // front door glass, where the windscreen wraps round
  const gpos = gh.attributes.position, _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  const sail = P.rw > 0.3;
  // decide per quad (each pair of triangles along the loft), so region edges never zig-zag
  const nSide = (G.length - 1) * (n1 - 1) * 6;
  for (let t = 0; t < gi.length; t += 3) {
    const q = t < nSide ? t - (t % 6) : t;   // the quad's first triangle decides for both
    _a.fromBufferAttribute(gpos, gi[q]); _b.fromBufferAttribute(gpos, gi[q + 1]); _c.fromBufferAttribute(gpos, gi[q + 2]);
    const nrm = new THREE.Vector3().subVectors(_b, _a).cross(new THREE.Vector3().subVectors(_c, _a)).normalize(); const zc = (_a.z + _b.z + _c.z) / 3;
    const side = Math.abs(nrm.x) > 0.6;
    const metal = (isRoofV(gi[q]) && isRoofV(gi[q + 1]) && isRoofV(gi[q + 2]) && zc > c0 - 0.005 && zc < c1 + 0.005) || (sail && Math.abs(nrm.x) > 0.28 && zc < c0 + 0.04) || (side && zc > c1 + 0.04);
    (metal ? roofTri : glassTri).push(gi[t], gi[t + 1], gi[t + 2]);
  }
  gh.setIndex([...roofTri, ...glassTri]); gh.clearGroups(); gh.addGroup(0, roofTri.length, 0); gh.addGroup(roofTri.length, glassTri.length, 1);
  const green = new THREE.Mesh(gh, [opts.roofColor ? paintMat(opts.roofColor) : paint, m.glass]); green.renderOrder = 2; green.castShadow = true; body.add(green);
  // pillars (A, B, C) as thin paint strips along the glass, a roof skin slightly above, window frames
  const pillar = (zA, zB, yA, yB, s, wA, wB, t = 0.07) => { const a = V(s * wA, yA, zA), b = V(s * wB, yB, zB); const d = new THREE.Vector3().subVectors(b, a); const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, d.length() + 0.03, t), paint); p.position.copy(a).addScaledVector(d, 0.5); p.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); body.add(p); return p; };
  const yTop = P.H - 0.05;
  for (const s of [-1, 1]) {
    pillar(gz1 - 0.04, c1 + 0.03, yb + 0.02, yTop, s, wbAt(gz1 - 0.04) + 0.006, wtR + 0.004, 0.07);                       // A
    if (!['van', 'pickup', 'keivan', 'keitruck', 'oldvan', 'bigtruck'].includes(P.type)) { const zb = (c0 + c1) / 2 - 0.12; pillar(zb, zb, yb, yTop, s, wb + 0.008, wtR + 0.006, 0.09); }   // B
    const zc = gz0 + Math.min(0.06, P.rw * 0.3); if (!sail) pillar(zc, Math.max(zc, c0 - 0.02), yb + 0.02, yTop, s, wbAt(zc) + 0.006, wtR + 0.004, P.rw > 0.4 ? 0.2 : 0.12);    // C
    if (['wagon', 'van', 'hatch', 'keivan', 'oldvan', 'scout'].includes(P.type)) { const zd = c0 + (c1 - c0) * 0.18; pillar(zd, zd, yb, yTop, s, wb + 0.008, wtR + 0.006, 0.06); }
    // black window seals: belt line + drip rail along the roof edge
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.022, gz1 - gz0 - 0.1), m.trim); belt.position.set(s * (wb + 0.006), yb + 0.01, (gz0 + gz1) / 2); body.add(belt);
    const drip = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.018, c1 - c0 + 0.04), m.trim); drip.position.set(s * (wtR - 0.005), P.H - 0.075, (c0 + c1) / 2); body.add(drip);
  }

  // ---- pickup bed / van details
  if (P.bed) {   // the load bed: ribbed floor at bedY, side walls + tailgate + headboard up to the belt, rope hooks
    const by = P.bedY ?? P.belt - 0.4, bz0 = zR + 0.04, bz1 = c0 - P.rw - 0.06, bh = P.belt - by, bw = W * 0.97;
    const fl = new THREE.Mesh(new THREE.BoxGeometry(bw * 2 - 0.1, 0.02, bz1 - bz0 - 0.06), P.cabover ? paint : m.black); fl.position.set(0, by + 0.01, (bz0 + bz1) / 2); body.add(fl);
    for (let k = -3; k <= 3; k++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, bz1 - bz0 - 0.1), P.cabover ? paint : m.trim); rib.position.set(k * bw * 0.26, by + 0.025, (bz0 + bz1) / 2); body.add(rib); }
    for (const sd of [-1, 1]) { const wall = new THREE.Mesh(new THREE.BoxGeometry(0.05, bh + 0.02, bz1 - bz0), paint); wall.position.set(sd * (bw - 0.025), by + bh / 2, (bz0 + bz1) / 2); body.add(wall);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, bz1 - bz0), P.cabover ? m.steel : paint); rail.position.set(sd * (bw - 0.025), P.belt + 0.01, (bz0 + bz1) / 2); body.add(rail);
      for (let k = 0; k < 3; k++) { const hk = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 5, 10), m.steel); hk.position.set(sd * (bw + 0.003), P.belt - 0.08, bz0 + 0.3 + k * (bz1 - bz0 - 0.6) / 2); hk.rotation.y = Math.PI / 2; body.add(hk); } }
    const tg = new THREE.Mesh(new THREE.BoxGeometry(bw * 2, bh + 0.02, 0.05), paint); tg.position.set(0, by + bh / 2, bz0 + 0.025); body.add(tg);
    const hb = new THREE.Mesh(new THREE.BoxGeometry(bw * 2, bh + 0.02, 0.05), paint); hb.position.set(0, by + bh / 2, bz1 - 0.025); body.add(hb);
    if (P.cabover) { const gate = new THREE.Group(); gate.position.set(0, P.belt, bz1 - 0.06); body.add(gate); for (let k = -4; k <= 4; k++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.42, 0.018), m.black); bar.position.set(k * bw * 0.2, 0.21, 0); gate.add(bar); } const top = new THREE.Mesh(new THREE.BoxGeometry(bw * 1.7, 0.025, 0.025), m.black); top.position.y = 0.42; gate.add(top); }
  }
  // ---- front: grille, headlamps, bumper lip, plate; rear: tail lamps, plate, exhaust; mirrors, handles, wipers
  const noseY = P.nose, gw = W * 1.05;
  const grille = new THREE.Mesh(new THREE.BoxGeometry(gw * 0.62, Math.max(0.1, (noseY - P.clr) * 0.3), 0.04), m.trim); grille.position.set(0, P.clr + (noseY - P.clr) * 0.5, zF - 0.045); body.add(grille);
  const gbar = new THREE.Mesh(new THREE.BoxGeometry(gw * 0.6, 0.014, 0.05), opts.chromeGrille ? m.chrome : paint); gbar.position.set(0, grille.position.y + 0.03, zF - 0.04); body.add(gbar);
  const lamps = { head: [], tail: [] };
  for (const s of [-1, 1]) {
    if (P.roundLamps) {   // 70s round sealed beams in chrome bezels
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20), m.head); hl.rotation.x = Math.PI / 2; hl.position.set(s * W * 0.68, noseY - 0.13, zF - 0.02); body.add(hl); lamps.head.push(hl);
      const bz = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24), m.chrome); bz.position.set(s * W * 0.68, noseY - 0.13, zF + 0.0); body.add(bz);
    } else {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(W * 0.34, 0.07, 0.08), m.head); hl.position.set(s * W * 0.6, noseY - 0.07, zF - 0.14); hl.rotation.y = s * 0.12; if (!(P.crash && s < 0)) { body.add(hl); lamps.head.push(hl); }
      const hlL = new THREE.Mesh(new THREE.BoxGeometry(W * 0.38, 0.1, 0.02), m.lens); hlL.position.set(s * W * 0.6, noseY - 0.07, zF - 0.095); hlL.rotation.y = s * 0.12; if (!(P.crash && s < 0)) body.add(hlL);
    }
    const ind = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.03), m.amber); ind.position.set(s * W * 0.84, noseY - 0.12, zF - 0.17); body.add(ind);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(W * 0.34, 0.09, 0.05), new THREE.MeshStandardMaterial({ color: '#c8141a', emissive: '#7a0008', emissiveIntensity: 0.6, roughness: 0.15 })); tl.position.set(s * W * 0.64, (P.bed ? P.belt : P.tail) - 0.1, zR + 0.06); body.add(tl); lamps.tail.push(tl);
    const mir = new THREE.Group(); mir.position.set(s * W * 0.98, P.belt + 0.1, c1 + P.ws * 0.3); body.add(mir); const mh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.09), paint); mh.position.x = s * 0.1; mir.add(mh); const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.08), m.chrome); mg.position.set(s * 0.1, 0, -0.046); mg.rotation.y = Math.PI; mir.add(mg);
    for (const z of [c1 - 0.25, P.type === 'coupe' ? null : (c0 + c1) / 2 - 0.35]) if (z !== null) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.13), m.chrome); h.position.set(s * W * 0.985, P.belt - 0.08, z); body.add(h); }
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.004, P.belt - P.clr - 0.14, 0.006), m.black); seam.position.set(s * W * 0.99, (P.belt + P.clr) / 2, (c0 + c1) / 2 - 0.1); body.add(seam);
    const seam2 = seam.clone(); seam2.position.z = c1 + 0.1; body.add(seam2);
  }
  const bumperF = new THREE.Mesh(new THREE.BoxGeometry(W * 1.5, 0.07, 0.08), m.trim); bumperF.position.set(0, P.clr + 0.14, zF - 0.035); body.add(bumperF);
  const bumperR = bumperF.clone(); bumperR.position.z = zR + 0.035; body.add(bumperR);
  const pt = plateT(opts.plate || 'ELM 4' + Math.floor(100 + Math.random() * 899));
  extras(body, P, { paint, W, zF, zR, c0, c1, axF, axR, noseY, halfW, m });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.5 })); pf.position.set(0, P.clr + 0.26, zF + 0.002); body.add(pf);
  const pr = pf.clone(); pr.position.set(0, (P.bed ? P.belt : P.tail) - 0.28, zR - 0.002); pr.rotation.y = Math.PI; body.add(pr);
  const exR = P.bigExhaust ? 0.055 : 0.035; const ex = new THREE.Mesh(new THREE.CylinderGeometry(exR, exR, 0.14, 14), m.chrome); ex.rotation.x = Math.PI / 2; ex.position.set(-W * 0.6, P.clr + 0.06, zR + 0.02); body.add(ex);
  for (const s of [-1, 1]) { const wp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.02), m.black); wp.position.set(s * 0.25, P.belt + 0.03, gz1 - 0.05); wp.rotation.z = s * 0.1; body.add(wp); }
  // ---- interior: two front seats, a rear bench, dash, steering wheel (the left-hand seat drives: +x = left)
  const seatZ = (c0 + c1) / 2 + 0.05, floorY = P.clr + 0.18;
  for (const s of [-1, 1]) { const sb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), m.seat); sb.position.set(s * W * 0.45, floorY + 0.25, seatZ); body.add(sb); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.12), m.seat); bk.position.set(s * W * 0.45, floorY + 0.6, seatZ - 0.27); bk.rotation.x = -0.15; body.add(bk); }
  if (!['coupe', 'pickup', 'keitruck', 'bigtruck'].includes(P.type)) { const rb = new THREE.Mesh(new THREE.BoxGeometry(W * 1.6, 0.5, 0.45), m.seat); rb.position.set(0, floorY + 0.45, seatZ - 0.95); body.add(rb); }
  const dash = new THREE.Mesh(new THREE.BoxGeometry(W * 1.8, 0.18, 0.4), m.dash); dash.position.set(0, P.belt - 0.04, c1 + 0.05); body.add(dash);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 24), m.black); sw.position.set(W * 0.45, P.belt + 0.02, c1 - 0.18); sw.rotation.x = -0.4; body.add(sw);
  // optional livery (taxi sign, police bar + doors)
  if (opts.livery) opts.livery(body, { paint, W, P, c0, c1, zF, zR, m });
  // ---- wheels: pivots on the unsprung root (so the body can roll over them)
  const wheels = []; let rimMat = opts.rim === 'black' ? m.darkAlloy : opts.rim === 'steel' ? envd(new THREE.MeshStandardMaterial({ color: '#9a9ca0', metalness: 0.75, roughness: 0.35 }), 0.8) : m.alloy;
  if (P.rimColor) rimMat = envd(new THREE.MeshStandardMaterial({ color: P.rimColor, metalness: 0.6, roughness: 0.45 }), 0.6);
  const tw = Math.min(0.26, P.W * 0.12), trackX = W - tw / 2 - 0.03;
  for (const [az, front] of [[axF, true], [axR, false]]) for (const s of [-1, 1]) { const w = makeWheel(P.R, tw, s, opts.rim === 'steel' ? 'steel' : 'alloy', rimMat); w.pivot.position.set(s * trackX, axY, az); g.add(w.pivot); wheels.push({ ...w, front, side: s }); }
  if (P.flat !== undefined) { const w = wheels[P.flat]; w.yOff = -0.07; w.pivot.position.y += w.yOff; w.spin.scale.set(1, 0.84, 1); }   // a flat tyre
  if (P.crash) { const w = wheels[1]; w.pivot.rotation.set(0, 0.45, 0.16); w.knocked = true; }                                  // a wheel knocked in
  // one mesh per material for the sprung body and for each wheel (a car was ~130 separate pieces to draw). The body and
  // the wheels keep their own groups, so roll, steering and spin still work; lamps glow through their shared materials.
  for (const sm of body.userData.siren || []) sm.userData.noMerge = true;   // (the two beacons flash in turn)
  mergeStatic(body); for (const w of wheels) mergeStatic(w.spin);
  g.userData = { noStream: true, spec: P, wheels, body, lamps, paint, axF, axR, axY, half: { x: W, zF, zR } };
  return g;
}

// crash damage: crumple the front back (more on the right, -x), buckle the hood up, ripple it
function crash(geo, P, zF, axF) {
  const p = geo.attributes.position, z0 = axF - 0.25;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const c = Math.max(0, (z - z0) / (zF - z0)); if (c <= 0) continue;
    const side = 1 + 0.6 * clamp01(-x / (P.W / 2)); z -= c * c * 0.55 * side; y += Math.sin(x * 9 + z * 5) * 0.04 * c + (y > P.belt - 0.25 ? c * 0.09 : -c * 0.03); x *= 1 + 0.06 * c * Math.sin(y * 6); p.setXYZ(i, x, y, z); }
  geo.computeVertexNormals();
}
// optional parts: spoilers, body kit, fog lamps, brush guard, side lettering
function extras(body, P, { paint, W, zF, zR, c0, axF, noseY, halfW, m }) {
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); body.add(o); return o; };
  if (P.wing) { const zw = zR + 0.22; for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.03, 0.2, 0.1), m.black, s * W * 0.55, P.deck + 0.08, zw); const wing = add(new THREE.BoxGeometry(W * 1.7, 0.025, 0.26), P.wingMat === 'paint' ? paint : m.black, 0, P.deck + 0.19, zw - 0.02, -0.08); if (P.crash) { wing.rotation.z = 0.25; wing.position.x = 0.12; } }
  if (P.roofSpoiler) add(new THREE.BoxGeometry(W * 1.5, 0.03, 0.2), paint, 0, P.H - 0.04, P.cabin[0] - 0.06, 0.15);
  if (P.kit) {   // aftermarket kit: deep black front lip with intakes, side skirts, rear valance
    const lip = add(new THREE.BoxGeometry(W * 1.7, 0.1, 0.12), m.black, 0, P.clr + 0.06, zF - 0.1); if (P.crash) { lip.rotation.set(0.5, 0.2, -0.3); lip.position.y = 0.05; }
    for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.06, 0.1, P.WB - P.R * 2 - 0.15), m.black, s * W * 0.97, P.clr + 0.05, (axF + axF - P.WB) / 2); add(new THREE.BoxGeometry(0.22, 0.06, 0.03), m.trim, s * W * 0.5, P.clr + 0.07, zF - 0.035); }
    add(new THREE.BoxGeometry(W * 1.7, 0.1, 0.1), m.black, 0, P.clr + 0.06, zR + 0.08);
  }
  if (P.lip) add(new THREE.BoxGeometry(W * 1.6, 0.025, 0.1), m.black, 0, P.clr + 0.03, zF - 0.06);
  if (P.fog) for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), new THREE.MeshStandardMaterial({ color: '#fff4c8', emissive: '#ffe8a0', emissiveIntensity: 0.9 }), s * W * 0.55, P.clr + 0.12, zF - 0.02, Math.PI / 2); }
  if (P.brushGuard) {   // tube brush guard bolted to the bumper
    const tube = (a, b, r = 0.022) => { const d = new THREE.Vector3().subVectors(b, a); const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), m.black); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); body.add(o); };
    const zg = zF + 0.12, y0 = P.clr + 0.12, y1 = noseY + 0.05;
    for (const s of [-1, 1]) { tube(V(s * W * 0.45, y0, zg), V(s * W * 0.45, y1, zg)); tube(V(s * W * 0.45, y1, zg), V(s * W * 0.2, y1 + 0.06, zg)); tube(V(s * W * 0.45, y0, zg), V(s * W * 0.45, y0, zF - 0.05)); }
    tube(V(-W * 0.2, y1 + 0.06, zg), V(W * 0.2, y1 + 0.06, zg)); tube(V(-W * 0.45, (y0 + y1) / 2, zg), V(W * 0.45, (y0 + y1) / 2, zg));
  }
  for (const d of P.decals || []) {   // side lettering: { draw(ctx, w, h), y, z, w, h }
    const t = canvasT(Math.round(512 * d.w / d.h > 2048 ? 2048 : 512 * d.w / d.h), 512, d.draw);
    for (const s of [-1, 1]) { const pl = add(new THREE.PlaneGeometry(d.w, d.h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }), s * (halfW(d.z) * 0.985 + 0.012), d.y, d.z, 0, s * Math.PI / 2); pl.renderOrder = 1; }
  }
}

// liveries (made-up wording only)
export const LIVERIES = {
  taxi(body, { W, P, c0, c1 }) { const t = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2d21a'; fitText(x, 'ELM CAB', w / 2, 52, w - 30, 60, F.heavy); }); const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.18), [new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ color: '#f2d21a' }), new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.7 }), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.7 })]); sign.position.set(0, P.H + 0.09, (c0 + c1) / 2); body.add(sign);
    const ch = canvasT(512, 32, (x, w, h) => { for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? '#111' : '#f4f4f0'; x.fillRect(i * 16, 0, 16, 16); x.fillStyle = i % 2 ? '#f4f4f0' : '#111'; x.fillRect(i * 16, 16, 16, 16); } }); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(P.WB * 0.8, 0.06), new THREE.MeshStandardMaterial({ map: ch, polygonOffset: true, polygonOffsetFactor: -2 })); st.position.set(s * (W + 0.003), P.belt - 0.2, 0.1); st.rotation.y = s * Math.PI / 2; body.add(st); } },
  police(body, { W, P, c0, c1 }) { const bar = new THREE.Group(); bar.position.set(0, P.H + 0.05, (c0 + c1) / 2 + 0.1); body.add(bar); const base = new THREE.Mesh(new THREE.BoxGeometry(W * 1.5, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: '#222' })); bar.add(base); const red = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#e0141e', emissive: '#a00008', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); red.position.set(W * 0.38, 0.07, 0); bar.add(red); const blue = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#1e4ae0', emissive: '#0820a0', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); blue.position.set(-W * 0.38, 0.07, 0); bar.add(blue); body.userData.siren = [red, blue];
    const word = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'POLICE', w / 2, 70, w - 40, 90, F.heavy, { spacing: 8 }); }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshStandardMaterial({ map: word, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })); p.position.set(s * (W + 0.004), P.belt - 0.25, (c0 + c1) / 2); p.rotation.y = s * Math.PI / 2; body.add(p); } },
};
