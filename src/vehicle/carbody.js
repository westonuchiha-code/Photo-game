// Parametric car bodies: every car is modelled from its proportions, not from photos. Paint is a clearcoated metallic
// MeshPhysicalMaterial in a colour taken from the photo; trim, wheels and interior use plain modelled materials plus a
// few library textures (brushed steel, rubber). Local frame: +z = forward, +x = left, y up, ground at y = 0.
//   makeCar(spec) -> Group with userData { spec, wheels: [{ pivot, spin, front, side }], body, brakeMats, lamps }
//   CAR_TYPES: preset specs (hatch, sedan, coupe, kei, wagon, pickup, van, taxi, police)
import * as THREE from 'three';
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
const paintMat = (color, metal = 0.45) => envd(new THREE.MeshPhysicalMaterial({ color, metalness: metal, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }), 0.8);
const MATS = {};
function mats() {
  if (MATS.glass) return MATS;
  MATS.glass = envd(new THREE.MeshPhysicalMaterial({ color: '#10161c', metalness: 0.1, roughness: 0.03, transparent: true, opacity: 0.78, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }), 1.0);
  MATS.black = new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.55 });
  MATS.trim = new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.4, metalness: 0.2 });
  MATS.chrome = envd(new THREE.MeshStandardMaterial({ color: '#e8ecf0', metalness: 1, roughness: 0.12 }), 1.0);
  MATS.steel = envd(new THREE.MeshStandardMaterial({ map: tex('b86_stainless', 0.3, 0.3), color: '#c8ccd0', metalness: 0.85, roughness: 0.3 }), 0.8);
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
  MATS.rubber = new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.88 });
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
  van:    { L: 4.95, W: 1.90, H: 2.05, WB: 3.00, R: 0.33, ovF: 0.70, clr: 0.18, belt: 1.12, hood: 1.05, nose: 0.86, deck: 1.15, tail: 1.10, cabin: [-2.35, 0.90], ws: 0.75, rw: 0.06, roofW: 0.88, box: 6.0, mass: 2000, power: 120 },
};

// loft a closed tube through rings of points. sections: [{ z, pts: [[x, y], ...] }] (same count per ring, closed loop,
// counter-clockwise seen from +z). Each ring's first point is bottom-centre. Ends are capped with fans.
function loft(sections) {
  const pos = [], idx = [], uv = [], n = sections[0].pts.length;
  sections.forEach((sc, i) => { for (let j = 0; j <= n; j++) { const [x, y] = sc.pts[j % n]; pos.push(x, y, sc.z); uv.push(j / n, i / (sections.length - 1)); } });
  for (let i = 0; i < sections.length - 1; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  for (const [si, back] of [[0, true], [sections.length - 1, false]]) { const sc = sections[si]; let cy = 0; sc.pts.forEach((q) => (cy += q[1] / n)); const c = pos.length / 3; pos.push(0, cy, sc.z); uv.push(0.5, si ? 1 : 0); for (let j = 0; j < n; j++) { const a = si * (n + 1) + j; if (back) idx.push(c, a, a + 1); else idx.push(c, a + 1, a); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// a rounded-trapezoid ring: bottom half-width wb at y0, top half-width wt at y1, corner radii rb (bottom) rt (top),
// a shoulder bulge `bulge` (extra half-width at mid-height). k points per corner. Returns points + which are "top".
function ring(wb, wt, y0, y1, rb, rt, bulge = 0, k = 5) {
  const pts = [], top = [], h = y1 - y0; rt = Math.min(rt, h * 0.45, wt * 0.9); rb = Math.min(rb, h * 0.45, wb * 0.9);
  const side = (t) => (wb + (wt - wb) * t) + bulge * Math.sin(Math.PI * t);
  const P = (x, y, isTop) => { pts.push([x, y]); top.push(isTop); };
  P(0, y0, false);
  for (let i = 0; i <= k; i++) { const a = -Math.PI / 2 + (i / k) * Math.PI / 2; P(side(rb / h) - rb + Math.cos(a) * rb, y0 + rb + Math.sin(a) * rb, false); }   // bottom-right corner
  for (let i = 1; i < 6; i++) { const t = rb / h + (i / 6) * (1 - (rb + rt) / h); P(side(t), y0 + t * h, false); }                                                   // right side
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
  const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, 36), [m.rubber]); tyre.rotation.z = Math.PI / 2; spin.add(tyre);
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
  const paint = paintMat(P.color || '#2a4a8a', P.metal ?? 0.45); const L = P.L, W = P.W / 2, zF = L / 2, zR = -L / 2;
  const axF = zF - P.ovF, axR = axF - P.WB, archR = P.R + 0.045, axY = P.R;
  // ---- lower body: sections along z, tops follow nose -> hood -> belt -> deck -> tail, bottoms cut for the arches
  const N = 52, secs = [];
  const halfW = (z) => { const end = Math.max(smooth(zF - 0.32, zF, z), smooth(zR + 0.22, zR, z)); return W * (1 - 0.07 * end ** 2) * (0.35 + 0.65 * Math.sqrt(Math.max(0, 1 - end ** 3 * 0.92))); };
  for (let i = 0; i <= N; i++) {
    const z = zR + 0.015 + (i / N) * (L - 0.03);
    const endF = smooth(zF - 0.32, zF, z), endR = smooth(zR + 0.22, zR, z);
    let top = P.belt; top += (P.hood - P.belt) * smooth(P.cabin[1] + P.ws * 0.75, axF - 0.1, z); top += (P.nose - P.hood) * smooth(axF + 0.05, zF - 0.02, z) ** 1.4;
    if (!P.bed) { top += (P.deck - P.belt) * smooth(P.cabin[0] - P.rw * 0.4, axR + 0.2, z); top += (P.tail - P.deck) * smooth(axR - 0.1, zR, z); }
    let bot = P.clr + 0.1 * Math.max(endF, endR) ** 1.5;
    for (const az of [axF, axR]) { const d = Math.abs(z - az); if (d < archR) bot = Math.max(bot, axY + Math.sqrt(archR * archR - d * d) * 0.97); }
    const end = Math.max(endF, endR); const w = W * (1 - 0.07 * end ** 2);
    const plan = Math.sqrt(Math.max(0.0, 1 - end ** 3 * 0.92));   // rounded corners in plan
    const ww = w * (0.35 + 0.65 * plan), h = Math.max(0.1, top - bot);
    const r = ring(ww * 0.95, ww * 0.93, bot, bot + h, 0.05, Math.min(0.12, h * 0.4), ww * 0.04);
    secs.push({ z, pts: r.pts });
  }
  const lower = new THREE.Mesh(loft(secs), paint); lower.castShadow = lower.receiveShadow = true; body.add(lower);
  // dark arch liners, sills
  for (const az of [axF, axR]) for (const s of [-1, 1]) { const lin = new THREE.Mesh(new THREE.CylinderGeometry(archR + 0.01, archR + 0.01, 0.34, 24, 1, true, 0, Math.PI), m.black); lin.material = lin.material.clone(); lin.material.side = THREE.DoubleSide; lin.rotation.z = Math.PI / 2; lin.position.set(s * (W - 0.19), axY, az); body.add(lin); }
  for (const s of [-1, 1]) { const sill = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, P.WB - archR * 2 - 0.05), m.trim); sill.position.set(s * (W * 0.97), P.clr + 0.07, (axF + axR) / 2); body.add(sill); }
  // ---- greenhouse: belt -> roof, raked windscreen + rear glass, roof narrower than the shoulders (tumblehome)
  const [c0, c1] = P.cabin; const gz0 = c0 - P.rw, gz1 = c1 + P.ws; const G = [], GN = 30; let topMask = null;
  const wbAt = (z) => halfW(z) * 0.94, wb = W * 0.94, wtR = W * P.roofW, yb = P.belt - 0.03;
  for (let i = 0; i <= GN; i++) {
    const z = gz0 + 0.01 + (i / GN) * (gz1 - gz0 - 0.02);
    const up = z < c0 ? ((z - gz0) / (c0 - gz0)) ** 0.85 : z > c1 ? ((gz1 - z) / (gz1 - c1)) ** 0.8 : 1;
    const crown = 0.03 * Math.sin(Math.PI * clamp01((z - gz0) / (gz1 - gz0)));
    const y1 = yb + (P.H - yb) * Math.max(0.02, up) + (up > 0.98 ? crown : crown * up);
    const wbz = wbAt(z), wt = wbz + (wtR - wbz) * Math.min(1, up * 1.15);
    const r = ring(wbz, wt, yb, y1, 0.0, 0.07 * up + 0.005, 0.01 * up); G.push({ z, pts: r.pts }); topMask = r.top;
  }
  const gh = loft(G);
  // material groups: the roof (top points of rings inside the cabin) = paint, everything else = glass
  const n1 = G[0].pts.length + 1, gi = gh.index.array, roofTri = [], glassTri = [];
  const isRoofV = (v) => { const ring_ = Math.floor(v / n1), j = (v % n1) % (n1 - 1); if (ring_ >= G.length) return false; const z = G[ring_].z; return topMask[j] && z >= c0 - 0.02 && z <= c1 + 0.02; };
  // ...plus the sheet-metal side panels: the sail behind the rear door glass (sedans/coupes) and the strip ahead of the
  // front door glass, where the windscreen wraps round
  const gpos = gh.attributes.position, _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  const sail = P.rw > 0.3;
  for (let t = 0; t < gi.length; t += 3) {
    _a.fromBufferAttribute(gpos, gi[t]); _b.fromBufferAttribute(gpos, gi[t + 1]); _c.fromBufferAttribute(gpos, gi[t + 2]);
    const nrm = new THREE.Vector3().subVectors(_b, _a).cross(new THREE.Vector3().subVectors(_c, _a)).normalize(); const zc = (_a.z + _b.z + _c.z) / 3;
    const side = Math.abs(nrm.x) > 0.6;
    const metal = (isRoofV(gi[t]) && isRoofV(gi[t + 1]) && isRoofV(gi[t + 2])) || (side && sail && zc < c0 + 0.04) || (side && zc > c1 + 0.04);
    (metal ? roofTri : glassTri).push(gi[t], gi[t + 1], gi[t + 2]);
  }
  gh.setIndex([...roofTri, ...glassTri]); gh.clearGroups(); gh.addGroup(0, roofTri.length, 0); gh.addGroup(roofTri.length, glassTri.length, 1);
  const green = new THREE.Mesh(gh, [opts.roofColor ? paintMat(opts.roofColor) : paint, m.glass]); green.renderOrder = 2; green.castShadow = true; body.add(green);
  // pillars (A, B, C) as thin paint strips along the glass, a roof skin slightly above, window frames
  const pillar = (zA, zB, yA, yB, s, wA, wB, t = 0.07) => { const a = V(s * wA, yA, zA), b = V(s * wB, yB, zB); const d = new THREE.Vector3().subVectors(b, a); const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, d.length() + 0.03, t), paint); p.position.copy(a).addScaledVector(d, 0.5); p.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); body.add(p); return p; };
  const yTop = P.H - 0.05;
  for (const s of [-1, 1]) {
    pillar(gz1 - 0.04, c1 + 0.03, yb + 0.02, yTop, s, wbAt(gz1 - 0.04) + 0.006, wtR + 0.004, 0.07);                       // A
    if (P.type !== 'van' && P.type !== 'pickup') { const zb = (c0 + c1) / 2 - 0.12; pillar(zb, zb, yb, yTop, s, wb + 0.008, wtR + 0.006, 0.09); }   // B
    const zc = gz0 + Math.min(0.06, P.rw * 0.3); if (!sail) pillar(zc, Math.max(zc, c0 - 0.02), yb + 0.02, yTop, s, wbAt(zc) + 0.006, wtR + 0.004, P.rw > 0.4 ? 0.2 : 0.12);    // C
    if (P.type === 'wagon' || P.type === 'van' || P.type === 'hatch') { const zd = c0 + (c1 - c0) * 0.18; pillar(zd, zd, yb, yTop, s, wb + 0.008, wtR + 0.006, 0.06); }
    // black window seals: belt line + drip rail along the roof edge
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.022, gz1 - gz0 - 0.1), m.trim); belt.position.set(s * (wb + 0.006), yb + 0.01, (gz0 + gz1) / 2); body.add(belt);
    const drip = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.018, c1 - c0 + 0.04), m.trim); drip.position.set(s * (wtR - 0.005), P.H - 0.075, (c0 + c1) / 2); body.add(drip);
  }

  // ---- pickup bed / van details
  if (P.bed) { const bz0 = zR + 0.08, bz1 = c0 - 0.15; const bed = new THREE.Mesh(new THREE.BoxGeometry(W * 1.8, 0.04, bz1 - bz0), m.black); bed.position.set(0, P.belt - 0.35, (bz0 + bz1) / 2); body.add(bed); for (const s of [-1, 1]) { const wall = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, bz1 - bz0), paint); wall.position.set(s * (W - 0.05), P.belt - 0.15, (bz0 + bz1) / 2); body.add(wall); } const tg = new THREE.Mesh(new THREE.BoxGeometry(W * 1.9, 0.42, 0.06), paint); tg.position.set(0, P.belt - 0.14, bz0); body.add(tg); }
  // ---- front: grille, headlamps, bumper lip, plate; rear: tail lamps, plate, exhaust; mirrors, handles, wipers
  const noseY = P.nose, gw = W * 1.05;
  const grille = new THREE.Mesh(new THREE.BoxGeometry(gw * 0.62, Math.max(0.1, (noseY - P.clr) * 0.3), 0.04), m.trim); grille.position.set(0, P.clr + (noseY - P.clr) * 0.5, zF - 0.045); body.add(grille);
  const gbar = new THREE.Mesh(new THREE.BoxGeometry(gw * 0.6, 0.014, 0.05), opts.chromeGrille ? m.chrome : paint); gbar.position.set(0, grille.position.y + 0.03, zF - 0.04); body.add(gbar);
  const lamps = { head: [], tail: [] };
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(W * 0.34, 0.07, 0.08), m.head); hl.position.set(s * W * 0.6, noseY - 0.07, zF - 0.14); hl.rotation.y = s * 0.12; body.add(hl); lamps.head.push(hl);
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(W * 0.38, 0.1, 0.02), m.lens); hlL.position.set(s * W * 0.6, noseY - 0.07, zF - 0.095); hlL.rotation.y = s * 0.12; body.add(hlL);
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
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.5 })); pf.position.set(0, P.clr + 0.26, zF + 0.002); body.add(pf);
  const pr = pf.clone(); pr.position.set(0, (P.bed ? P.belt : P.tail) - 0.28, zR - 0.002); pr.rotation.y = Math.PI; body.add(pr);
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 12), m.chrome); ex.rotation.x = Math.PI / 2; ex.position.set(-W * 0.6, P.clr + 0.06, zR + 0.02); body.add(ex);
  for (const s of [-1, 1]) { const wp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.02), m.black); wp.position.set(s * 0.25, P.belt + 0.03, gz1 - 0.05); wp.rotation.z = s * 0.1; body.add(wp); }
  // ---- interior: two front seats, a rear bench, dash, steering wheel (the left-hand seat drives: +x = left)
  const seatZ = (c0 + c1) / 2 + 0.05, floorY = P.clr + 0.18;
  for (const s of [-1, 1]) { const sb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), m.seat); sb.position.set(s * W * 0.45, floorY + 0.25, seatZ); body.add(sb); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.12), m.seat); bk.position.set(s * W * 0.45, floorY + 0.6, seatZ - 0.27); bk.rotation.x = -0.15; body.add(bk); }
  if (P.type !== 'coupe' && P.type !== 'pickup') { const rb = new THREE.Mesh(new THREE.BoxGeometry(W * 1.6, 0.5, 0.45), m.seat); rb.position.set(0, floorY + 0.45, seatZ - 0.95); body.add(rb); }
  const dash = new THREE.Mesh(new THREE.BoxGeometry(W * 1.8, 0.18, 0.4), m.dash); dash.position.set(0, P.belt - 0.04, c1 + 0.05); body.add(dash);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 24), m.black); sw.position.set(W * 0.45, P.belt + 0.02, c1 - 0.18); sw.rotation.x = -0.4; body.add(sw);
  // optional livery (taxi sign, police bar + doors)
  if (opts.livery) opts.livery(body, { paint, W, P, c0, c1, zF, zR, m });
  // ---- wheels: pivots on the unsprung root (so the body can roll over them)
  const wheels = []; const rimMat = opts.rim === 'black' ? m.darkAlloy : opts.rim === 'steel' ? envd(new THREE.MeshStandardMaterial({ color: '#9a9ca0', metalness: 0.75, roughness: 0.35 }), 0.8) : m.alloy;
  const tw = Math.min(0.26, P.W * 0.12), trackX = W - tw / 2 - 0.03;
  for (const [az, front] of [[axF, true], [axR, false]]) for (const s of [-1, 1]) { const w = makeWheel(P.R, tw, s, opts.rim === 'steel' ? 'steel' : 'alloy', rimMat); w.pivot.position.set(s * trackX, axY, az); g.add(w.pivot); wheels.push({ ...w, front, side: s }); }
  g.userData = { noStream: true, spec: P, wheels, body, lamps, paint, axF, axR, axY, half: { x: W, zF, zR } };
  return g;
}

// liveries (made-up wording only)
export const LIVERIES = {
  taxi(body, { W, P, c0, c1 }) { const t = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2d21a'; fitText(x, 'ELM CAB', w / 2, 52, w - 30, 60, F.heavy); }); const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.18), [new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ color: '#f2d21a' }), new THREE.MeshStandardMaterial({ color: '#111' }), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.7 }), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.7 })]); sign.position.set(0, P.H + 0.09, (c0 + c1) / 2); body.add(sign);
    const ch = canvasT(512, 32, (x, w, h) => { for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? '#111' : '#f4f4f0'; x.fillRect(i * 16, 0, 16, 16); x.fillStyle = i % 2 ? '#f4f4f0' : '#111'; x.fillRect(i * 16, 16, 16, 16); } }); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(P.WB * 0.8, 0.06), new THREE.MeshStandardMaterial({ map: ch, polygonOffset: true, polygonOffsetFactor: -2 })); st.position.set(s * (W + 0.003), P.belt - 0.2, 0.1); st.rotation.y = s * Math.PI / 2; body.add(st); } },
  police(body, { W, P, c0, c1 }) { const bar = new THREE.Group(); bar.position.set(0, P.H + 0.05, (c0 + c1) / 2 + 0.1); body.add(bar); const base = new THREE.Mesh(new THREE.BoxGeometry(W * 1.5, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: '#222' })); bar.add(base); const red = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#e0141e', emissive: '#a00008', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); red.position.set(W * 0.38, 0.07, 0); bar.add(red); const blue = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.09, 0.26), new THREE.MeshStandardMaterial({ color: '#1e4ae0', emissive: '#0820a0', emissiveIntensity: 1.4, transparent: true, opacity: 0.9 })); blue.position.set(-W * 0.38, 0.07, 0); bar.add(blue); body.userData.siren = [red, blue];
    const word = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'POLICE', w / 2, 70, w - 40, 90, F.heavy, { spacing: 8 }); }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshStandardMaterial({ map: word, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 })); p.position.set(s * (W + 0.004), P.belt - 0.25, (c0 + c1) / 2); p.rotation.y = s * Math.PI / 2; body.add(p); } },
};
