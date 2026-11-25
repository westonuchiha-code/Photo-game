// Car bodies, second generation (the phone areas use these; the big town keeps carbody.js as it was).
// One shell is lofted through cross-sections that all share the same eleven points a side, so every panel line is an
// edge of the mesh: sill, body side, shoulder crease, belt, window, cant rail, roof. Glass, lamps, grille, cladding and
// the pickup bed are faces of that shell given another material, so they always follow the body. Bumpers, arch lips,
// shut lines and trim are swept along the same curves. Everything lands in one mesh per material (about a dozen draws
// a car, wheels included) and stays indexed, so crash dents keep the panels smooth.
// Local frame: +z = forward, +x = left, y up, ground at y = 0.
//   makeCar(spec) -> Group with userData { spec, wheels: [{ pivot, spin, front, side }], body, lamps, paint, half }
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { F, fitText } from '../fonts.js';

function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// a soft studio environment for the paint + chrome (the night scene has nothing bright to reflect)
let _env = null; const _envMats = [];
export function carEnv(renderer) { if (_env || !renderer) return _env; const pm = new THREE.PMREMGenerator(renderer); _env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); for (const m of _envMats) { m.envMap = _env; m.needsUpdate = true; } return _env; }
function envd(m, i = 0.6) { m.envMapIntensity = i; if (_env) m.envMap = _env; _envMats.push(m); return m; }
const paintMat = (color, metal = 0.45) => envd(new THREE.MeshPhysicalMaterial({ color, metalness: metal, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }), 0.38);
const MATS = {};
function mats() {
  if (MATS.glass) return MATS;
  MATS.glass = envd(new THREE.MeshPhysicalMaterial({ color: '#0d1318', metalness: 0.1, roughness: 0.03, transparent: true, opacity: 0.8, clearcoat: 1, depthWrite: false }), 0.55);
  MATS.misc = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.1 });            // plastics, rubber, cloth: coloured per part
  MATS.chrome = envd(new THREE.MeshStandardMaterial({ color: '#e8ecf0', metalness: 1, roughness: 0.18 }), 0.45);
  MATS.rim = envd(new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.85, roughness: 0.3 }), 0.85);   // wheel metal, coloured per wheel
  MATS.tyre = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  return MATS;
}
const C = { dark: new THREE.Color('#0d0d0f'), trim: new THREE.Color('#17181b'), liner: new THREE.Color('#060607'), cabin: new THREE.Color('#131316'), seat: new THREE.Color('#2a2a30'), amber: new THREE.Color('#e88a1e'),
  red: new THREE.Color('#8a0d12'), white: new THREE.Color('#d8dade'), rubber: new THREE.Color('#141416'), disc: new THREE.Color('#4a4c50'), steel: new THREE.Color('#8e9298'), alloy: new THREE.Color('#c2c6cc'), black: new THREE.Color('#2c2e32') };

// ---- the cars. Proportions in metres: belt = side-window sill, roof height H, hood = bonnet height at the screen,
// nose / tail = heights of the leading and trailing edges, deck = boot-lid height, cabin = roof start..end,
// ws / rw = how far the windscreen / rear glass rake. Style: rc / rcR = corner radius of the nose and tail seen from
// above, fz / fzR = how far the lamp panel leans back, lampH = lamp height, doors, quarter = a third side window,
// sail = a solid panel behind the rear door glass, bumper = 'paint' | 'dark' | 'chrome', clad = black lower body
export const CAR_TYPES = {
  hatch:  { L: 4.05, W: 1.74, H: 1.46, WB: 2.55, R: 0.31, ovF: 0.82, clr: 0.16, belt: 0.93, hood: 0.88, nose: 0.70, deck: 0.96, tail: 0.92, cabin: [-1.50, 0.25], ws: 0.82, rw: 0.36, roofW: 0.80, mass: 1150, power: 85, rc: 0.27, rcR: 0.2, fz: 0.15, fzR: 0.05, quarter: true },
  sedan:  { L: 4.75, W: 1.80, H: 1.44, WB: 2.75, R: 0.33, ovF: 0.95, clr: 0.16, belt: 0.95, hood: 0.92, nose: 0.72, deck: 0.99, tail: 0.93, cabin: [-1.00, 0.55], ws: 0.86, rw: 0.62, roofW: 0.80, mass: 1450, power: 120, rc: 0.24, rcR: 0.2, fz: 0.13, fzR: 0.06, sail: true },
  coupe:  { L: 4.45, W: 1.80, H: 1.28, WB: 2.58, R: 0.33, ovF: 0.92, clr: 0.12, belt: 0.87, hood: 0.86, nose: 0.66, deck: 0.90, tail: 0.84, cabin: [-0.92, 0.22], ws: 0.98, rw: 0.92, roofW: 0.76, mass: 1300, power: 155, rc: 0.3, rcR: 0.24, fz: 0.2, fzR: 0.07, lampH: 0.13, doors: 2, lampHR: 0.14 },
  kei:    { L: 3.39, W: 1.47, H: 1.62, WB: 2.40, R: 0.27, ovF: 0.52, clr: 0.15, belt: 0.95, hood: 0.93, nose: 0.80, deck: 0.97, tail: 0.95, cabin: [-1.36, 0.58], ws: 0.52, rw: 0.14, roofW: 0.87, mass: 850, power: 47, rc: 0.17, rcR: 0.13, fz: 0.08, fzR: 0.04, quarter: true, lampH: 0.2 },
  wagon:  { L: 4.70, W: 1.80, H: 1.48, WB: 2.72, R: 0.33, ovF: 0.95, clr: 0.16, belt: 0.95, hood: 0.92, nose: 0.72, deck: 0.98, tail: 0.95, cabin: [-1.90, 0.45], ws: 0.86, rw: 0.22, roofW: 0.82, mass: 1500, power: 110, rc: 0.24, rcR: 0.16, fz: 0.13, fzR: 0.05, quarter: true },
  pickup: { L: 5.30, W: 1.95, H: 1.85, WB: 3.25, R: 0.40, ovF: 0.95, clr: 0.26, belt: 1.18, hood: 1.16, nose: 1.06, deck: 1.10, tail: 1.10, cabin: [-0.55, 0.55], ws: 0.62, rw: 0.07, roofW: 0.86, mass: 2100, power: 220, bed: true, rc: 0.12, rcR: 0.06, fz: 0.05, fzR: 0.03, doors: 2, bumper: 'dark', lampH: 0.24, upright: true },
  van:    { L: 4.95, W: 1.90, H: 2.02, WB: 3.00, R: 0.33, ovF: 0.78, clr: 0.19, belt: 1.12, hood: 1.08, nose: 0.9, deck: 1.14, tail: 1.10, cabin: [-2.32, 0.85], ws: 0.7, rw: 0.06, roofW: 0.88, mass: 2000, power: 120, rc: 0.2, rcR: 0.12, fz: 0.12, fzR: 0.03, doors: 2, quarter: true, bumper: 'dark', upright: true },
  scout:  { L: 4.2, W: 1.78, H: 1.74, WB: 2.35, R: 0.38, ovF: 0.82, clr: 0.33, belt: 1.16, hood: 1.14, nose: 1.06, deck: 1.16, tail: 1.13, cabin: [-1.72, 0.3], ws: 0.3, rw: 0.05, roofW: 0.93, mass: 1700, power: 110, rc: 0.09, rcR: 0.07, fz: 0.04, fzR: 0.03, doors: 2, quarter: true, bumper: 'dark', clad: true, upright: true, lampH: 0.24 },
  bigtruck: { L: 6.2, W: 2.05, H: 2.05, WB: 3.9, R: 0.44, ovF: 1.05, clr: 0.34, belt: 1.36, hood: 1.34, nose: 1.22, deck: 1.3, tail: 1.3, cabin: [-0.95, 0.75], ws: 0.6, rw: 0.08, roofW: 0.88, mass: 3000, power: 320, bed: true, bedY: 0.98, rc: 0.12, rcR: 0.06, fz: 0.05, fzR: 0.03, bumper: 'chrome', upright: true, lampH: 0.26, clad: true },
  keitruck: { L: 3.395, W: 1.475, H: 1.78, WB: 1.90, R: 0.27, ovF: 0.62, clr: 0.18, belt: 1.02, hood: 1.0, nose: 0.92, deck: 1.0, tail: 0.95, cabin: [0.5, 1.12], ws: 0.42, rw: 0.04, roofW: 0.9, mass: 750, power: 46, bed: true, bedY: 0.72, rc: 0.12, rcR: 0.05, fz: 0.05, fzR: 0.03, doors: 2, bumper: 'dark', upright: true, lampH: 0.2 },
  keivan: { L: 3.33, W: 1.475, H: 1.88, WB: 2.40, R: 0.275, ovF: 0.45, clr: 0.17, belt: 1.02, hood: 1.0, nose: 0.9, deck: 1.02, tail: 1.0, cabin: [-1.52, 1.08], ws: 0.44, rw: 0.04, roofW: 0.92, mass: 900, power: 47, rc: 0.12, rcR: 0.1, fz: 0.05, fzR: 0.03, doors: 2, quarter: true, bumper: 'dark', upright: true, lampH: 0.2 },
  keiold: { L: 2.99, W: 1.295, H: 1.345, WB: 2.0, R: 0.27, ovF: 0.5, clr: 0.16, belt: 0.84, hood: 0.8, nose: 0.68, deck: 0.86, tail: 0.8, cabin: [-0.95, 0.22], ws: 0.5, rw: 0.4, roofW: 0.85, mass: 520, power: 28, rc: 0.15, rcR: 0.13, fz: 0.07, fzR: 0.05, doors: 2, bumper: 'chrome', lampH: 0.17 },
  keisport: { L: 3.4, W: 1.475, H: 1.4, WB: 2.36, R: 0.285, ovF: 0.56, clr: 0.13, belt: 0.86, hood: 0.82, nose: 0.64, deck: 0.9, tail: 0.84, cabin: [-1.1, 0.2], ws: 0.7, rw: 0.34, roofW: 0.82, mass: 700, power: 64, rc: 0.2, rcR: 0.16, fz: 0.13, fzR: 0.05, doors: 2, lampH: 0.14 },
  oldvan: { L: 4.3, W: 1.7, H: 1.8, WB: 2.45, R: 0.33, ovF: 0.55, clr: 0.3, belt: 1.02, hood: 0.98, nose: 0.88, deck: 1.02, tail: 1.0, cabin: [-1.95, 0.92], ws: 0.5, rw: 0.05, roofW: 0.9, mass: 1500, power: 70, rc: 0.14, rcR: 0.1, fz: 0.05, fzR: 0.03, doors: 2, quarter: true, bumper: 'chrome', upright: true, lampH: 0.2 },
};

// ---- geometry buckets: one indexed mesh per material at the end
function buckets() {
  const B = {}; const get = (k) => B[k] || (B[k] = { pos: [], idx: [], col: [], uv: [], n: 0 });
  const _v = new THREE.Vector3();
  const api = { B, get,
    // any three.js geometry, placed by a matrix (or position + rotation)
    geo(k, g, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, color = null, matrix = null } = {}) {
      const b = get(k), m = matrix || new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1)), p = g.attributes.position, base = b.n, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).applyMatrix4(m); b.pos.push(_v.x, _v.y, _v.z); const c = color || C.dark; b.col.push(c.r, c.g, c.b); b.uv.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); }
      if (g.index) for (let i = 0; i < g.index.count; i++) b.idx.push(base + g.index.array[i]); else for (let i = 0; i < p.count; i++) b.idx.push(base + i);
      b.n += p.count; g.dispose(); },
    box(k, w, h, d, x, y, z, o = {}) { api.geo(k, new THREE.BoxGeometry(w, h, d), { x, y, z, ...o }); },
    vert(k, x, y, z, color) { const b = get(k), c = color || C.dark; b.pos.push(x, y, z); b.col.push(c.r, c.g, c.b); b.uv.push(0, 0); return b.n++; },
    // a strip swept along a path: pts[i] + outs[i] * o + ups[i] * u for each profile point [o, u]. The profile is
    // listed so that the outside is on the right of its direction of travel. Each profile segment is its own band
    // (smooth along the path, crisp across it).
    sweep(k, pts, outs, ups, prof, color) {
      for (let j = 0; j < prof.length - 1; j++) { const a = prof[j], c = prof[j + 1], n2 = [c[1] - a[1], -(c[0] - a[0])], row = [];
        for (let i = 0; i < pts.length; i++) { const p = pts[i], o = outs[i], u = ups[i]; row.push([api.vert(k, p.x + o.x * a[0] + u.x * a[1], p.y + o.y * a[0] + u.y * a[1], p.z + o.z * a[0] + u.z * a[1], color), api.vert(k, p.x + o.x * c[0] + u.x * c[1], p.y + o.y * c[0] + u.y * c[1], p.z + o.z * c[0] + u.z * c[1], color)]); }
        const b = get(k), P3 = (i) => V(b.pos[i * 3], b.pos[i * 3 + 1], b.pos[i * 3 + 2]);
        for (let i = 0; i < pts.length - 1; i++) { const [a0, a1] = row[i], [b0, b1] = row[i + 1]; const want = outs[i].clone().multiplyScalar(n2[0]).addScaledVector(ups[i], n2[1]);
          const nrm = P3(a1).sub(P3(a0)).cross(P3(b0).sub(P3(a0))); if (nrm.dot(want) >= 0) b.idx.push(a0, a1, b0, a1, b1, b0); else b.idx.push(a0, b0, a1, a1, b0, b1); } } },
    mesh(k, mat) { const b = B[k]; if (!b || !b.idx.length) return null; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); if (mat.vertexColors) g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3)); if (mat.map) g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); g.setIndex(b.idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.name = 'car_' + k; return m; } };
  return api;
}

function plateT(text) { return canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a3a6a'; x.lineWidth = 6; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#2a3a6a'; fitText(x, 'ELM COUNTY', w / 2, 24, w - 60, 18, F.label, { spacing: 3 }); fitText(x, text, w / 2, 80, w - 30, 64, F.label, { weight: 700 }); }); }

// ---- a wheel: tyre with rounded shoulders, a dished rim with spokes (or a pressed steel wheel and hubcap), a brake
// disc behind. Two meshes: rubber and metal. Returns { pivot (steers), spin (rolls) }
function makeWheel(R, tw, side, style, rimC) {
  const m = mats(), pivot = new THREE.Group(), spin = new THREE.Group(); pivot.add(spin); const K = buckets(), rr = R * 0.64, o = side;
  const axial = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);   // a lathe's y axis -> the axle (+x)
  const lathe = (k, prof, color, seg = 22) => K.geo(k, new THREE.LatheGeometry(prof.map(([r, a]) => new THREE.Vector2(r, a)), seg), { matrix: axial, color });
  const h = tw / 2;
  lathe('tyre', [[rr, -h], [R * 0.9, -h], [R * 0.975, -h + 0.02], [R, -h + 0.055], [R, h - 0.055], [R * 0.975, h - 0.02], [R * 0.9, h], [rr, h]], C.rubber);
  // tread grooves: thin dark rings standing a hair off the tyre
  for (const a of [-0.3, 0, 0.3]) lathe('tyre', [[R * 1.002, a * tw - 0.006], [R * 1.002, a * tw + 0.006]], C.liner, 22);
  const f = o * h;   // the outer face
  // rim: lip, barrel going in, back plate
  lathe('rim', [[rr, f * 0.96], [rr * 0.97, f * 1.0], [rr * 0.93, f * 0.9], [rr * 0.9, f * 0.25]].map(([r, a]) => [r, a]), rimC, 24);
  lathe('tyre', [[rr * 0.9, f * 0.25], [rr * 0.3, f * 0.2]], C.disc, 18); lathe('tyre', [[rr * 0.3, f * 0.2], [0.001, f * 0.2]], C.liner, 10);
  if (style === 'steel') {   // pressed steel: a domed disc with slots, a small hubcap
    lathe('rim', [[rr * 0.92, f * 0.62], [rr * 0.78, f * 0.52], [rr * 0.5, f * 0.72], [rr * 0.3, f * 0.78]], rimC, 24);
    lathe('rim', [[rr * 0.3, f * 0.78], [rr * 0.26, f * 0.92], [rr * 0.1, f * 0.98], [0.001, f * 0.98]], C.alloy, 14);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; K.box('tyre', 0.012, rr * 0.13, rr * 0.2, o * (h * 0.57), Math.cos(a) * rr * 0.69, Math.sin(a) * rr * 0.69, { rx: a, color: C.liner }); }
  } else {   // alloy: tapered spokes from the hub to the lip
    const n = style === 'multi' ? 10 : style === 'six' ? 6 : 5, wS = style === 'multi' ? 0.028 : 0.06;
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, g = new THREE.BoxGeometry(0.03, rr * 0.78, wS), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0) { p.setZ(i, p.getZ(i) * 1.5); p.setX(i, p.getX(i) + o * 0.012); } }   // wider and proud at the hub
      K.geo('rim', g, { matrix: new THREE.Matrix4().makeRotationX(a).multiply(new THREE.Matrix4().makeTranslation(o * (h * 0.78), rr * 0.55, 0)), color: rimC }); }
    lathe('rim', [[rr * 0.24, f * 0.7], [rr * 0.22, f * 0.95], [rr * 0.1, f * 1.0], [0.001, f * 1.0]], rimC, 14);
  }
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; K.geo('rim', new THREE.CylinderGeometry(0.011, 0.011, 0.02, 6), { x: f * (style === 'steel' ? 0.86 : 0.98), y: Math.cos(a) * rr * 0.16, z: Math.sin(a) * rr * 0.16, rz: Math.PI / 2, color: C.steel }); }
  const t = K.mesh('tyre', m.tyre), r = K.mesh('rim', m.rim); t.castShadow = true; spin.add(t, r);
  return { pivot, spin };
}

// make a car. spec = { type, color, plate, rim ('alloy' | 'steel' | 'black' | 'six' | 'multi'), roofColor, livery, name, ... }
export function makeCar(opts = {}) {
  const P = { ...CAR_TYPES[opts.type || 'sedan'], ...opts }; P.type = opts.type || 'sedan';
  const m = mats(), g = new THREE.Group(); g.name = 'car_' + (opts.name || P.type);
  const body = new THREE.Group(); g.add(body);   // the sprung part: rolls and pitches on the suspension
  let paint = paintMat(P.color || '#2a4a8a', P.metal ?? 0.45);
  if (P.dust) { const c = new THREE.Color(P.color).lerp(new THREE.Color('#bdb5a5'), P.dust * 0.45); paint = envd(new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.15, roughness: 0.55 + P.dust * 0.35, clearcoat: Math.max(0, 0.6 - P.dust), clearcoatRoughness: 0.5 }), 0.22); }
  const paint2 = P.roofColor ? paintMat(P.roofColor, P.metal ?? 0.45) : null;
  const headM = new THREE.MeshStandardMaterial({ color: '#dfe6ee', emissive: '#e8f0ff', emissiveIntensity: 0.22, roughness: 0.12, metalness: 0.2 });   // (dim until someone drives it)
  const tailM = new THREE.MeshStandardMaterial({ color: '#b01218', emissive: '#7a0008', emissiveIntensity: 0.6, roughness: 0.18 });
  const K = buckets();
  const L = P.L, W = P.W / 2, zF = L / 2, zR = -L / 2, axF = zF - P.ovF, axR = axF - P.WB, axY = P.R, archR = P.R + 0.05;
  const [c0, c1] = P.cabin, zc = Math.min(c1 + P.ws, zF - 0.1), zb = Math.max(c0 - P.rw, zR + 0.05);
  const rcF = Math.min(P.rc ?? 0.24, W * 0.5), rcR = Math.min(P.rcR ?? 0.18, W * 0.5);
  const fz = Math.min(P.fz ?? 0.13, Math.max(0.03, (zF - zc) * 0.7)), fzR = Math.min(P.fzR ?? 0.06, Math.max(0.025, (zb - zR) * 0.6));
  const zLead = zF - fz, zLeadR = zR + fzR, bedY = P.bedY ?? P.belt - 0.42;
  const yBT = Math.max(P.clr + 0.26, P.nose - (P.lampH ?? 0.18)), yRT = Math.max(P.clr + 0.3, (P.bed ? P.belt : P.tail) - (P.lampHR ?? 0.2));
  const crownH = P.upright ? 0.02 : 0.035;
  // half-width seen from above: a slight taper to each end, then the rounded corners
  const Wz = (z) => { let w = W * (1 - 0.035 * smooth(axF - 0.2, zF, z) - 0.03 * smooth(axR + 0.2, zR, z));
    if (z > zF - rcF) { const d = z - (zF - rcF); w += -rcF + Math.sqrt(Math.max(0, rcF * rcF - d * d)); }
    if (z < zR + rcR) { const d = (zR + rcR) - z; w += -rcR + Math.sqrt(Math.max(0, rcR * rcR - d * d)); } return w; };
  // the height of the body's top edge where there is no cabin: nose -> bonnet -> (cabin) -> boot -> tail
  const E0 = (z) => { const k = crownH;
    if (z >= zLead) return lerp(P.nose - k, yBT, (z - zLead) / fz);
    if (z >= zc) { const s = (z - zc) / (zLead - zc); return lerp(P.hood, P.nose, s) - k + (P.upright ? 0.01 : 0.03) * Math.sin(Math.PI * s); }
    if (P.bed && z < zb) return z <= zLeadR ? lerp(yRT, P.belt, (z - zR) / fzR) : P.belt;
    if (z >= zb) return lerp(P.deck, P.hood, (z - zb) / (zc - zb)) - k;
    if (z > zLeadR) return lerp(P.tail, P.deck, (z - zLeadR) / (zb - zLeadR)) - k;
    return lerp(yRT, P.tail - k, (z - zR) / fzR); };
  const Yb = (z) => P.clr + 0.05 * smooth(zF - 0.3, zF, z) + 0.08 * smooth(zR + 0.35, zR, z);
  const d0 = Math.sqrt(archR * archR - (axY - P.clr) ** 2);
  const archY = (z) => { for (const az of [axF, axR]) { const d = Math.abs(z - az); if (d <= d0 + 1e-4) return axY + Math.sqrt(Math.max(0, archR * archR - d * d)); } return -1; };

  // ---- stations along the car
  const zs = []; const addZ = (z, kind) => { if (z < zR - 1e-6 || z > zF + 1e-6) return; const e = zs.find((q) => Math.abs(q.z - z) < 0.011); if (e) { if (kind) e.kind = kind; return; } zs.push({ z, kind }); };
  addZ(zR); addZ(zF); addZ(zLead); addZ(zLeadR); addZ(zc); addZ(zb); addZ(c0); addZ(c1);
  for (const a of [20, 40, 58, 74]) { addZ(zF - rcF + rcF * Math.sin(a * Math.PI / 180)); addZ(zR + rcR - rcR * Math.sin(a * Math.PI / 180)); } addZ(zF - rcF); addZ(zR + rcR);
  for (const az of [axF, axR]) { addZ(az - d0); addZ(az + d0); addZ(az - d0 - 0.03); addZ(az + d0 + 0.03); for (let a = 15; a <= 165; a += 18.75) { const d = archR * Math.cos(a * Math.PI / 180); if (Math.abs(d) < d0 - 0.012) addZ(az + d); } }
  // pillars: [z0, z1, material]
  const pillars = [], doors4 = (P.doors ?? 4) === 4, zBp = (c0 + c1) / 2 - (doors4 ? 0.1 : 0.32);
  pillars.push([zBp - 0.045, zBp + 0.045, 'dark']);
  if (P.quarter) { const zq = c0 + Math.max(0.3, (zBp - c0) * (doors4 ? 0.3 : 0.5)); pillars.push([zq - 0.04, zq + 0.04, doors4 ? 'paint' : 'dark']); P._zq = zq; }
  if (!P.sail) pillars.push([c0, c0 + 0.07, 'paint']);
  for (const [a, b] of pillars) { addZ(a); addZ(b); }
  const zD1 = Math.min(c1 + P.ws * 0.42, axF - d0 - 0.07), zDr = zBp + 0.045; addZ(zD1);   // the driver's door runs zDr..zD1 on the left (+x)
  const inDoor = (zm) => zm > zDr && zm < zD1;
  if (P.bed) { addZ(zb - 0.022, 'bed'); addZ(zR + 0.075, 'bed'); addZ(zR + 0.052); }
  zs.sort((a, b) => a.z - b.z);
  for (let i = zs.length - 2; i >= 0; i--) { const gap = zs[i + 1].z - zs[i].z, n = Math.ceil(gap / 0.26); for (let k = n - 1; k >= 1; k--) zs.splice(i + 1, 0, { z: zs[i].z + gap * k / n }); }
  for (const s of zs) { s.g = s.z <= zb || s.z >= zc ? 0 : s.z < c0 ? (s.z - zb) / (c0 - zb) : s.z > c1 ? (zc - s.z) / (zc - c1) : 1; if (P.bed && !s.kind && s.z < zb - 0.02 && s.z > zR + 0.074) s.kind = 'bed'; }
  // ---- one cross-section: eleven points from the centre of the floor, out, up the side and over to the centre of the top
  const section = (s) => { const z = s.z, gq = s.g, w = Wz(z), e0 = E0(z), e = lerp(e0, P.belt, gq), yb = Yb(z), lo = Math.max(yb, archY(z)), p = [];
    p[0] = [0, lo]; p[1] = [w - 0.09, lo]; p[2] = [w - 0.014, Math.max(lo, yb + 0.075)]; p[3] = [w, Math.max(lo + 0.004, yb + 0.075 + 0.3 * (e - yb - 0.075))];
    p[4] = [w - 0.003, Math.max(e - (P.upright ? 0.06 : 0.085), lo + 0.035)]; p[5] = [w - (P.upright ? 0.02 : 0.032), Math.max(e, lo + 0.07)];
    const k = crownH * (z > zLead ? lerp(1, 0.3, (z - zLead) / fz) : z < zLeadR ? lerp(0.3, 1, (z - zR) / fzR) : 1);
    const t = s.kind === 'bed' ? [[w - 0.05, e0 + 0.012], [w - 0.1, e0 + 0.012], [w - 0.1, bedY], [w * 0.4, bedY], [0, bedY]]
      : [[w - 0.085, Math.max(e0 + 0.014, p[5][1] + 0.014)], [w * 0.8, e0 + k * 0.55], [w * 0.72, e0 + k * 0.7], [w * 0.4, e0 + k * 0.94], [0, e0 + k]];
    const wr = w * P.roofW, T = P.H, r = [[w - (P.upright ? 0.035 : 0.05), P.belt + 0.02], [wr, T - 0.09], [wr - 0.07, T - 0.024], [wr * 0.45, T - 0.002], [0, T + 0.006]];
    for (let j = 0; j < 5; j++) p[6 + j] = [lerp(t[j][0], r[j][0], gq), lerp(t[j][1], r[j][1], gq)];
    return p; };
  const secs = zs.map(section), NS = zs.length;
  // ---- which material each face of the shell gets (i = between stations i and i + 1, c = between points c and c + 1)
  const inP = (zm) => pillars.find(([a, b]) => zm > a && zm < b);
  const zone = (zm) => zm > zLead ? 1 : zm > zc ? 2 : zm > c1 ? 3 : zm > c0 ? 4 : zm > zb ? 5 : zm > zLeadR ? 6 : 7;
  const roofK = paint2 ? 'paint2' : 'paint';
  const face = (i, c) => { const zm = (zs[i].z + zs[i + 1].z) / 2, zn = zone(zm), bed = zs[i].kind === 'bed' && zs[i + 1].kind === 'bed';
    if (c <= 1) return ['misc', 0, C.dark];
    if (c === 2 && P.clad) return ['misc', 1, C.trim];
    if (zn === 1 && c >= 4) return c === 9 ? ['misc', 2, C.liner] : P.roundLamps ? ['paint', 30] : c <= 5 ? ['misc', 5, C.amber] : ['head', 0];
    if (zn === 7 && c >= 4) return c === 9 || P.roundLamps ? ['paint', 31] : c === 4 ? ['misc', 6, C.amber] : c === 8 ? ['misc', 7, C.white] : ['tail', 0];
    if (c <= 3) return ['paint', 1];
    if (c === 4) return ['paint', 2];
    if (zn === 2) return ['paint', 10];
    if (zn === 6) return bed && c >= 7 ? ['misc', 3, C.trim] : ['paint', 11 + (bed ? c : 0)];
    if (c === 5) return ['paint', 12 + zn];
    if (zn === 3) return c === 7 ? ['paint', 20] : ['glass', c === 6 ? 1 : 2];
    if (zn === 5) return c === 7 || (c === 6 && P.sail) ? [P.sail ? 'paint' : roofK, 21] : ['glass', c === 6 ? 3 : 4];
    if (c === 6) { const pl = inP(zm); return pl ? (pl[2] === 'dark' ? ['misc', 4, C.trim] : ['paint', 22]) : ['glass', 5]; }
    return [roofK, 23]; };
  // ---- build the shell: vertices are shared inside a (material, smoothing group) and split between them
  const NP = 20, pt = (i, k) => { const q = k <= 10 ? secs[i][k] : secs[i][20 - k]; return [k <= 10 ? q[0] : -q[0], q[1], zs[i].z]; };
  const vmap = new Map(); const vid = (key, grp, i, k, col) => { const kk = (k === 0 || k === 10) ? k : k; const id = key + '|' + grp + '|' + i + '|' + kk; let v = vmap.get(id); if (v === undefined) { const q = pt(i, k); v = K.vert(key, q[0], q[1], q[2], col); vmap.set(id, v); } return v; };
  const lining = [];
  for (let i = 0; i < NS - 1; i++) for (let k = 0; k < NP; k++) { const c = k < 10 ? k : 19 - k; let [key, grp, col] = face(i, c); const k1 = (k + 1) % NP;
    const A = pt(i, k), Bq = pt(i, k1); if (Math.abs(A[0] - Bq[0]) + Math.abs(A[1] - Bq[1]) < 1e-5) { const A2 = pt(i + 1, k), B2 = pt(i + 1, k1); if (Math.abs(A2[0] - B2[0]) + Math.abs(A2[1] - B2[1]) < 1e-5) continue; }
    const zm0 = (zs[i].z + zs[i + 1].z) / 2, dr = k < 10 && c >= 2 && c <= 6 && inDoor(zm0), key0 = key; if (dr) key = 'd_' + key;
    const sg = grp, a = vid(key, sg, i, k, col), b = vid(key, sg, i, k1, col), cc = vid(key, sg, i + 1, k, col), d = vid(key, sg, i + 1, k1, col);
    K.get(key).idx.push(a, b, cc, b, d, cc);
    const zm = (zs[i].z + zs[i + 1].z) / 2; if (zm > zb && zm < zc && c >= 2 && key0 !== 'glass') lining.push([i, k, k1, dr]); }
  // the cabin's inside skin: the same panels seen from within
  for (const [i, k, k1, dr] of lining) { const kk = dr ? 'd_misc' : 'misc', a = vid(kk, 90, i, k, C.cabin), b = vid(kk, 90, i, k1, C.cabin), cc = vid(kk, 90, i + 1, k, C.cabin), d = vid(kk, 90, i + 1, k1, C.cabin); K.get(kk).idx.push(a, cc, b, b, cc, d); }
  // end faces (the panels behind the bumpers)
  for (const [i, front] of [[NS - 1, true], [0, false]]) { let cy = 0; for (let k = 0; k < NP; k++) cy += pt(i, k)[1] / NP; const ctr = K.vert('paint', 0, cy, zs[i].z); for (let k = 0; k < NP; k++) { const a = vid('paint', front ? 40 : 41, i, k), b = vid('paint', front ? 40 : 41, i, (k + 1) % NP); if (front) K.get('paint').idx.push(ctr, a, b); else K.get('paint').idx.push(ctr, b, a); } }

  // ---- bumpers: a bar swept round each end at bumper height
  const UP = V(0, 1, 0);
  const endPath = (front, off, zFrom) => { const zE = front ? zF : zR, sgn = front ? 1 : -1, rc = front ? rcF : rcR, pts = [], side = [];
    const zl = []; zl.push(zFrom); for (const a of [0, 15, 30, 45, 60, 75, 86]) { const z = zE - sgn * (rc - rc * Math.sin(a * Math.PI / 180)); if (sgn * (z - zFrom) > 0.01) zl.push(z); }
    zl.forEach((z, i) => { const w = Wz(z), dz = 0.004 * sgn, tx = Wz(z + dz) - Wz(z - dz), tz = 2 * dz, n = V(tz * sgn, 0, -tx * sgn).normalize(); side.push({ p: V(w, 0, z), n, o: i === 0 ? 0.25 : 1 }); });
    const wEnd = Wz(zE); side.push({ p: V(wEnd * 0.6, 0, zE), n: V(0, 0, sgn), o: 1 });
    const all = [...side, ...side.slice().reverse().map((q) => ({ p: V(-q.p.x, 0, q.p.z), n: V(-q.n.x, 0, q.n.z), o: q.o }))];
    return { pts: all.map((q) => q.p.clone().addScaledVector(q.n, off * q.o - off)), outs: all.map((q) => q.n), ups: all.map(() => UP) }; };
  const bumpKey = P.bumper === 'chrome' || opts.chromeGrille && P.bumper ? 'chrome' : P.bumper === 'dark' ? 'misc' : 'paint', bumpCol = C.trim;
  const bumper = (front) => { const sgn = front ? 1 : -1, ax = front ? axF : axR, zE = front ? zF : zR, rc = front ? rcF : rcR;
    const zFrom = front ? Math.max(zE - rc - 0.16, ax + d0 + 0.035) : Math.min(zE + rc + 0.16, ax - d0 - 0.035), top = front ? yBT : yRT, yv = Yb(zE), y0 = bumpKey === 'paint' ? yv + 0.07 : Math.max(yv + 0.1, top - 0.2), o = P.upright ? 0.05 : 0.032;
    const pa = endPath(front, o, zFrom); for (const p of pa.pts) p.y = 0;
    K.sweep(bumpKey, pa.pts, pa.outs, pa.ups, [[-0.02, y0], [o, y0 + 0.02], [o, top - 0.025], [-0.02, top + 0.004]], bumpCol);
    if (bumpKey === 'paint') K.sweep('misc', pa.pts, pa.outs, pa.ups, [[o + 0.004, lerp(y0, top, 0.42)], [o + 0.004, lerp(y0, top, 0.62)]], C.trim);   // a dark rubbing strip let into a painted bumper
    // the valance under it, tucked back
    const pv = endPath(front, 0.006, zFrom); K.sweep('misc', pv.pts, pv.outs, pv.ups, [[-0.03, yv - 0.01], [0.006, yv + 0.01], [0.006, Math.min(y0, yv + 0.08) + 0.01]], C.dark);
    if (y0 > yv + 0.09) K.sweep('paint', pv.pts, pv.outs, pv.ups, [[0.006, yv + 0.085], [0.006, y0 + 0.01]], C.dark);
    return { y0, top, o }; };
  const bF = bumper(true), bR = bumper(false);
  // grille: slats across the opening between the lamps, a lower intake in the valance; fog lamps
  { const wE = Wz(zF), gw = Wz(zLead) * 0.4; const n = P.upright ? 4 : 2;
    for (let k = 0; k < n; k++) { const t = (k + 0.6) / (n + 0.2), y = lerp(P.nose - crownH * 0.4, yBT, t), z = lerp(zLead, zF, t) + 0.006; K.box(opts.chromeGrille ? 'chrome' : 'misc', gw * 1.96, 0.014, 0.02, 0, y, z, { rx: -Math.atan2(P.nose - yBT, fz) + Math.PI / 2, color: C.black }); }
    K.box('misc', wE * 1.1, Math.max(0.05, (bF.y0 - Yb(zF)) * 0.55), 0.02, 0, (bF.y0 + Yb(zF)) / 2, zF + 0.008, { color: C.liner });
    if (P.fog) for (const s of [-1, 1]) K.geo('head', new THREE.CylinderGeometry(0.045, 0.045, 0.02, 14), { x: s * wE * 0.8, y: (bF.y0 + bF.top) / 2, z: zF + bF.o + 0.002, rx: Math.PI / 2 });
    // amber indicators at the bumper's corners, white reversing + red reflector strip at the back
    for (const s of [-1, 1]) { K.box('misc', 0.12, 0.035, 0.012, s * wE * 0.82, bF.top - 0.06, zF + bF.o + 0.003, { color: C.amber }); K.box('misc', 0.14, 0.03, 0.012, s * Wz(zR) * 0.78, bR.top - 0.06, zR - bR.o - 0.003, { color: C.red }); }
    if (P.roundLamps) for (const s of [-1, 1]) { const y = (P.nose + yBT) / 2 - 0.01, x = s * Wz(zLead) * 0.66, z = (zLead + zF) / 2 + 0.03; K.geo('head', new THREE.CylinderGeometry(0.082, 0.082, 0.05, 18), { x, y, z, rx: Math.PI / 2 }); K.geo('chrome', new THREE.TorusGeometry(0.088, 0.013, 6, 20), { x, y, z: z + 0.025 });
      K.box('tail', 0.16, 0.1, 0.03, s * Wz(zR) * 0.7, (P.tail + yRT) / 2 - 0.02, zR + fzR * 0.5 - 0.005); } }
  // ---- wheel arches: a lip round each opening and a dark liner inside
  for (const az of [axF, axR]) for (const s of [-1, 1]) { const pts = [], outs = [], ups = [];
    const aS = Math.asin(Math.max(-1, Math.min(1, (Yb(az) + 0.085 - axY) / archR))); for (let k = 0; k <= 14; k++) { const a = lerp(aS, Math.PI - aS, k / 14), zz = az + archR * Math.cos(a); pts.push(V(s * Wz(zz), axY + archR * Math.sin(a), zz)); outs.push(V(s, 0, 0)); ups.push(V(0, Math.sin(a), Math.cos(a))); }
    const fl = P.clad ? 0.028 : 0.009; K.sweep(P.clad ? 'misc' : 'paint', pts, outs, ups, [[-0.04, -0.002], [fl, -0.002], [fl, P.clad ? 0.06 : 0.028], [-0.004, P.clad ? 0.085 : 0.045]], C.trim);
    const rl = Math.min(archR + 0.006, E0(az) - axY); K.geo('misc', new THREE.CylinderGeometry(rl, rl, 0.32, 16, 1, true, -Math.PI / 2, Math.PI), { x: s * (W - 0.23), y: axY, z: az, rz: Math.PI / 2, color: C.liner });
    K.geo('misc', new THREE.CylinderGeometry(rl, rl, 0.32, 16, 1, true, Math.PI / 2, Math.PI), { x: s * (W - 0.23), y: axY, z: az, rz: Math.PI / 2, color: C.liner });
    { const top = Math.min(axY + archR, E0(az) - 0.06), bot = P.clr + 0.02; K.box('misc', 0.02, top - bot, archR * 2 + 0.04, s * (W - 0.4), (top + bot) / 2, az, { color: C.liner }); } }
  // ---- shut lines: thin dark strips that follow the panels (doors, bonnet, boot)
  const sideLine = (z, yTopMax = 9) => { const sc = section({ z, g: z <= zb || z >= zc ? 0 : z < c0 ? (z - zb) / (c0 - zb) : z > c1 ? (zc - z) / (zc - c1) : 1 }); for (const s of [-1, 1]) { const pts = [2, 3, 4, 5].map((j) => V(s * (sc[j][0] + 0.0025), Math.min(sc[j][1], yTopMax), z)); pts[0].y += 0.02; K.sweep('misc', pts, pts.map(() => V(s, 0, 0)), pts.map(() => V(0, 0, 1)), [[0, 0.006], [0, -0.006]], C.liner); } };
  const zD3 = doors4 ? Math.max(c0 + 0.02, Math.min(zBp - 0.75, axR + d0 * 0.5)) : null;
  sideLine(zD1); sideLine(zBp); if (zD3 !== null) sideLine(zD3); if (!doors4 && P.type === 'van' && P._zq) sideLine(P._zq);
  const topLine = (za, zb_, j, lift = 0.003) => { const st = zs.filter((q) => q.z >= za - 1e-6 && q.z <= zb_ + 1e-6); if (st.length < 2) return; for (const s of [-1, 1]) { const pts = st.map((q) => { const sc = secs[zs.indexOf(q)]; return V(s * sc[j][0], sc[j][1] + lift, q.z); }); K.sweep('misc', pts, pts.map(() => UP), pts.map(() => V(s, 0, 0)), [[0, -0.005], [0, 0.005]], C.liner); } };
  topLine(zc, zLead, 6); if (!P.bed && zb - zLeadR > 0.35) topLine(zLeadR, zb, 6);
  // ---- trim that follows the body. rail(j, z0, z1, ...) runs a strip along point j of the sections on both sides; where it
  // crosses the driver's door, that length belongs to the door
  const railRun = (key, st, j, s, prof, col, up) => { if (st.length < 2) return; const pts = st.map((q) => { const sc = secs[zs.indexOf(q)]; return V(s * sc[j][0], sc[j][1], q.z); }); K.sweep(key, pts, pts.map(() => V(s, 0, 0)), pts.map(() => up), prof, col); };
  const rail = (j, z0, z1, prof, key, col, up = UP) => { const st = zs.filter((q) => q.z >= z0 - 1e-6 && q.z <= z1 + 1e-6); railRun(key, st, j, -1, prof, col, up);
    railRun(key, st.filter((q) => q.z <= zDr + 1e-6), j, 1, prof, col, up); railRun('d_' + key, st.filter((q) => q.z >= zDr - 1e-6 && q.z <= zD1 + 1e-6), j, 1, prof, col, up); railRun(key, st.filter((q) => q.z >= zD1 - 1e-6), j, 1, prof, col, up); };
  const brightK = P.bumper === 'chrome' ? 'chrome' : 'misc';
  rail(6, zb, zc, [[0.004, -0.014], [0.009, 0], [0.004, 0.014]], brightK, C.trim);                         // belt moulding under the side glass
  rail(7, c0, c1, [[0.003, -0.012], [0.008, 0.004], [0.0, 0.016]], 'misc', C.trim);                        // drip rail over the doors
  if (!P.clad && P.rub !== false) rail(3, axR + d0 + 0.05, axF - d0 - 0.05, [[0.002, -0.022], [0.013, -0.013], [0.013, 0.013], [0.002, 0.022]], 'misc', C.trim);   // rubbing strip down the side
  // lines across the car: the bonnet's leading edge, the scuttle under the windscreen, the boot lid's trailing edge
  const cross = (z, lift, w, col, j0 = 5) => { const i = zs.findIndex((q) => Math.abs(q.z - z) < 1e-6); if (i < 0) return; const half = []; for (let j = j0; j <= 10; j++) half.push(V(secs[i][j][0], secs[i][j][1] + lift, z)); const pts = [...half, ...half.slice(0, -1).reverse().map((q) => V(-q.x, q.y, q.z))]; K.sweep('misc', pts, pts.map(() => UP), pts.map(() => V(0, 0, 1)), [[0, w], [0, -w]], col); };
  cross(zLead, 0.003, 0.006, C.liner); cross(zc, 0.004, 0.03, C.trim, 6); if (!P.bed && zb - zLeadR > 0.2) cross(zLeadR, 0.003, 0.006, C.liner);
  // small things: side repeaters, a high brake lamp, aerial, filler cap, plate surrounds, mud flaps, a silencer, a badge
  for (const s of [-1, 1]) K.box('misc', 0.012, 0.03, 0.07, s * (Wz(axF - d0 - 0.12) + 0.004), lerp(Yb(0), E0(axF), 0.72), axF - d0 - 0.12, { color: C.amber });
  if (!P.bed) K.box('tail', Math.min(0.3, W * 0.4), 0.022, 0.03, 0, P.H - 0.075, c0 - P.rw * 0.1 + 0.02); else K.box('tail', 0.3, 0.025, 0.02, 0, P.H - 0.03, c0 - P.rw - 0.01);
  K.geo('misc', new THREE.CylinderGeometry(0.003, 0.005, 0.36, 5), { x: -W * P.roofW * 0.8, y: P.H + 0.15, z: c0 + 0.1, rx: -0.35, color: C.liner });
  K.geo('misc', new THREE.TorusGeometry(0.07, 0.004, 4, 16), { x: -(Wz(axR - d0 - 0.2) + 0.002), y: lerp(Yb(0), P.belt, 0.7), z: Math.max(zR + 0.25, axR - d0 - 0.2), ry: Math.PI / 2, color: C.liner });
  K.box('misc', 0.4, 0.21, 0.006, 0, (bF.y0 + bF.top) / 2, zF + bF.o - 0.002, { color: C.liner });
  K.box('chrome', 0.07, 0.035, 0.012, 0, lerp(P.nose - crownH * 0.4, yBT, 0.18), lerp(zLead, zF, 0.18) + 0.012, { rx: -Math.atan2(P.nose - yBT, fz) + Math.PI / 2 });
  K.geo('misc', new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10), { x: -W * 0.45, y: Yb(zR) + 0.03, z: zR + 0.42, rz: Math.PI / 2, color: C.disc });
  if (P.clad || P.bed) for (const s of [-1, 1]) K.box('misc', 0.26, 0.26, 0.02, s * (W - 0.15), P.clr + 0.07, axR - d0 - 0.06, { rx: 0.12, color: C.dark });
  // ---- mirrors, door handles, wipers, plates, exhaust
  const zM = c1 + P.ws * 0.5, wM = Wz(zM) - 0.055, yM = lerp(P.belt, E0(zM), 0.5) + 0.06;
  for (const s of [-1, 1]) { K.box('misc', 0.09, 0.03, 0.05, s * (wM + 0.0), yM - 0.03, zM, { color: C.trim }); K.box(P.bumper === 'dark' ? 'misc' : 'paint', 0.17, 0.11, 0.07, s * (wM + 0.085), yM + 0.02, zM, { ry: s * -0.12, color: C.trim }); K.box('chrome', 0.14, 0.085, 0.004, s * (wM + 0.085), yM + 0.02, zM - 0.037, { ry: s * -0.12 });
    const hy = P.belt - 0.14, hk = P.bumper === 'dark' ? 'misc' : 'chrome'; K.box((s > 0 ? 'd_' : '') + hk, 0.018, 0.028, 0.15, s * (W + 0.006), hy, zBp + 0.2, { color: C.dark }); if (zD3 !== null) K.box(hk, 0.018, 0.028, 0.15, s * (Wz(zD3 + 0.16) + 0.006), hy, zD3 + 0.16, { color: C.dark });
    K.box('misc', 0.46, 0.012, 0.018, s * 0.27 - 0.08, lerp(E0(zc), P.H, 0.07) + 0.05, zc - P.ws * 0.07, { rz: 0.06, color: C.liner }); }
  const pt_ = plateT(opts.plate || 'ELM 4' + Math.floor(100 + Math.random() * 899)), plateM = new THREE.MeshStandardMaterial({ map: pt_, roughness: 0.5 });
  K.geo('plate', new THREE.PlaneGeometry(0.36, 0.18), { x: 0, y: (bF.y0 + bF.top) / 2, z: zF + bF.o + 0.004 });
  const plateRearHigh = !P.bed && !P.roundLamps && yRT - bR.y0 < 0.34; K.geo('plate', new THREE.PlaneGeometry(0.36, 0.18), { x: 0, y: plateRearHigh ? (P.tail + yRT) / 2 - 0.01 : (bR.y0 + bR.top) / 2, z: plateRearHigh ? zR + fzR * 0.5 + 0.0 - 0.012 : zR - bR.o - 0.004, ry: Math.PI, rx: 0 });
  const exR = P.bigExhaust ? 0.05 : 0.032; K.geo('chrome', new THREE.CylinderGeometry(exR, exR, 0.16, 12), { x: -W * 0.55, y: Yb(zR) + 0.0, z: zR + 0.03, rx: Math.PI / 2 });
  // ---- inside: floor, bulkheads, dashboard, wheel, seats
  let seat = null;
  { const fy = Math.min(P.clr + 0.16, P.H - 1.16), wI = W - 0.1, seatZ = Math.min(zBp + 0.42, c1 - 0.25), rear = doors4 || P.quarter;
    K.box('misc', wI * 2, 0.03, zc - zb - 0.1, 0, fy, (zc + zb) / 2, { color: C.cabin }); K.box('misc', wI * 2, P.belt - fy, 0.04, 0, (P.belt + fy) / 2, zb + 0.06, { color: C.cabin });
    K.box('misc', wI * 2, 0.2, Math.min(0.5, P.ws * 0.75), 0, lerp(E0(zc), P.belt, 0.5) - 0.07, c1 + P.ws * 0.52, { color: C.trim }); K.box('misc', wI * 2, lerp(E0(zc), P.belt, 0.5) - fy, 0.04, 0, (lerp(E0(zc), P.belt, 0.5) + fy) / 2 - 0.05, zc - 0.08, { color: C.cabin });
    K.geo('steer', new THREE.TorusGeometry(0.17, 0.018, 6, 16), { color: C.liner }); K.box('steer', 0.32, 0.035, 0.02, 0, 0, 0, { color: C.liner }); K.box('steer', 0.035, 0.17, 0.02, 0, -0.085, 0, { color: C.liner });
    K.box('misc', 0.05, 0.05, 0.3, W * 0.45, P.belt - 0.06, c1 + P.ws * 0.2 + 0.14, { rx: 0.45, color: C.liner }); K.box('misc', 0.2, 0.06, 0.03, 0, P.H - 0.14, c1 - 0.02, { color: C.liner });   // column; rear-view mirror
    seat = { x: W * 0.45, y: fy + 0.315, z: seatZ };
    for (const s of [-1, 1]) { K.box('misc', 0.48, 0.13, 0.5, s * W * 0.45, fy + 0.25, seatZ, { color: C.seat }); K.box('misc', 0.48, 0.62, 0.12, s * W * 0.45, fy + 0.6, seatZ - 0.28, { rx: -0.16, color: C.seat }); K.box('misc', 0.24, 0.16, 0.09, s * W * 0.45, fy + 1.0, seatZ - 0.35, { rx: -0.16, color: C.seat }); }
    if (rear && seatZ - 0.95 > zb + 0.25) { K.box('misc', wI * 1.8, 0.14, 0.46, 0, fy + 0.25, seatZ - 0.95, { color: C.seat }); K.box('misc', wI * 1.8, 0.56, 0.12, 0, fy + 0.56, seatZ - 1.2, { rx: -0.2, color: C.seat }); } }
  // ---- options: spoilers, a body kit, roof rails
  if (P.wing) { const zw = zR + 0.2; for (const s of [-1, 1]) K.box('misc', 0.03, 0.18, 0.1, s * W * 0.55, P.tail + 0.07, zw, { color: C.dark }); K.box(P.wingMat === 'paint' ? 'paint' : 'misc', W * 1.7, 0.025, 0.26, 0, P.tail + 0.17, zw - 0.02, { rx: -0.08, color: C.dark }); }
  if (P.roofSpoiler) K.box(roofK, W * P.roofW * 1.8, 0.03, 0.2, 0, P.H - 0.03, c0 - 0.06, { rx: 0.15 });
  if (P.lip || P.kit) K.box('misc', Wz(zF) * 2.1, 0.03, 0.12, 0, Yb(zF) - 0.01, zF - 0.02, { color: C.dark });
  if (P.rails) for (const s of [-1, 1]) { K.box('misc', 0.03, 0.03, (c1 - c0) * 0.8, s * W * P.roofW * 0.86, P.H + 0.05, (c0 + c1) / 2, { color: C.dark }); for (const t of [0.15, 0.85]) K.box('misc', 0.03, 0.06, 0.05, s * W * P.roofW * 0.86, P.H + 0.02, lerp(c0, c1, t), { color: C.dark }); }
  if (P.bed) for (const s of [-1, 1]) K.box('misc', 0.05, 0.02, zb - zR - 0.2, s * (W - 0.075), P.belt + 0.022, (zb + zR) / 2, { color: C.dark });   // bed-rail caps
  if (opts.livery) opts.livery({ K, body, P, W, c0, c1, zF, zR, Wz });
  // ---- one mesh per material
  const lookup = { paint, paint2, glass: m.glass, misc: m.misc, chrome: m.chrome, head: headM, tail: tailM, plate: plateM };
  // (the driver's door is three of them, hung on its front edge so it can swing; the steering wheel turns on its column)
  const door = [], hinge = [Wz(zD1) - 0.02, zD1]; let steer = null;
  for (const k of Object.keys(K.B)) { const dk = k.startsWith('d_'), me = K.mesh(k, k === 'steer' ? m.misc : lookup[dk ? k.slice(2) : k]); if (!me) continue; if (k.endsWith('glass')) me.renderOrder = 2; if (k === 'paint' || k === 'paint2') me.castShadow = true; body.add(me);
    if (dk) { me.geometry.translate(-hinge[0], 0, -hinge[1]); me.position.set(hinge[0], 0, hinge[1]); door.push(me); }
    if (k === 'steer') { me.position.set(W * 0.45, P.belt, c1 + P.ws * 0.2); me.rotation.set(-0.45, 0, 0); steer = me; } }
  // ---- wheels: pivots on the unsprung root, so the body can roll over them
  const wheels = [], style = opts.rim === 'steel' ? 'steel' : opts.rim === 'six' || opts.rim === 'multi' ? opts.rim : P.upright ? 'six' : 'five';
  const rimC = P.rimColor ? new THREE.Color(P.rimColor) : opts.rim === 'black' ? C.black : opts.rim === 'steel' ? C.steel : C.alloy;
  const tw = Math.min(0.27, P.W * 0.125) * (P.clad ? 1.1 : 1), trackX = W - tw / 2 - 0.035;
  for (const [az, front] of [[axF, true], [axR, false]]) for (const s of [-1, 1]) { const w = makeWheel(P.R, tw, s, style, rimC); w.pivot.position.set(s * trackX, axY, az); g.add(w.pivot); wheels.push({ ...w, front, side: s }); }
  const lamp = (mat) => ({ material: mat, userData: { own: true } });
  g.userData = { noStream: true, spec: P, wheels, body, lamps: { head: [lamp(headM)], tail: [lamp(tailM)] }, door, steer, seat, paint, axF, axR, axY, half: { x: W, zF, zR } };
  return g;
}

// liveries (made-up wording only)
export const LIVERIES = {
  taxi({ K, body, P, W, c0, c1 }) { const t = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2d21a'; fitText(x, 'ELM CAB', w / 2, 52, w - 30, 60, F.heavy); });
    const sm = new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.7 }); for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), sm); f.position.set(0, P.H + 0.1, (c0 + c1) / 2 + s * 0.091); if (s < 0) f.rotation.y = Math.PI; body.add(f); }
    K.box('misc', 0.5, 0.16, 0.18, 0, P.H + 0.1, (c0 + c1) / 2, { color: new THREE.Color('#c8a80e') }); K.box('misc', 0.56, 0.03, 0.22, 0, P.H + 0.015, (c0 + c1) / 2, { color: C.dark });
    for (const s of [-1, 1]) for (let k = 0; k < 24; k++) for (const r of [0, 1]) K.box('misc', 0.004, 0.03, 0.074, s * (W + 0.003), P.belt - 0.2 + r * 0.03, -0.75 + k * 0.074, { color: (k + r) % 2 ? C.dark : C.white }); },
  police({ K, body, P, W, c0, c1 }) { const zz = (c0 + c1) / 2 + 0.1; K.box('misc', W * 1.5, 0.05, 0.3, 0, P.H + 0.04, zz, { color: C.dark });
    const red = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#e0141e', emissive: '#a00008', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); red.position.set(W * 0.38, P.H + 0.11, zz); body.add(red);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#1e4ae0', emissive: '#0820a0', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); blue.position.set(-W * 0.38, P.H + 0.11, zz); body.add(blue); body.userData.siren = [red, blue];
    const word = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'POLICE', w / 2, 70, w - 40, 90, F.heavy, { spacing: 8 }); }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshStandardMaterial({ map: word, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })); p.position.set(s * (W + 0.004), P.belt - 0.25, (c0 + c1) / 2); p.rotation.y = s * Math.PI / 2; body.add(p); } },
};
