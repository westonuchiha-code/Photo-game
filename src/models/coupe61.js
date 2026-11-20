// Sport coupe (queue item 61, photos/car/car01..05): a white 90s hatchback coupe on the real 2nd-generation dimensions
// (4.385 x 1.745 x 1.295 m, 2.51 m wheelbase), no badges, a made-up plate.
// The body is one lofted shell: cross-sections built along the car from a traced side profile (roof line, belt line,
// sill line) and plan outline, the greenhouse swelling up out of the deck between the hatch base and the cowl, wheel
// arches cut into the sides. Regions are assigned per triangle: white paint, the black aftermarket kit (front + rear
// bumpers, side skirts, the scoop behind the front wheel), the black roof and pillars, tinted glass.
// Modelled parts: teardrop clear headlights with chrome reflectors, the kit's lower intakes and the taped-up lip,
// the clear tail-light bar with eight round red lamps in chrome rings, the wing spoiler on stands, 5-spoke silver wheels
// on low-profile tyres, a big chrome exhaust tip, mirrors, handles, fuel door, wiper, antenna, a basic interior.
//   makeCoupe({ crashed })  front toward +x, axle line along z, ground y = 0, centred on the wheelbase.
//     crashed: the front crumpled back and to the right, hood buckled, bumper torn and dragging, a headlight gone,
//     cracked windshield, deflated airbag, wing snapped on one stand, a wheel knocked in.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const L = 4.385, XR = 0.875, XF = 3.385, WR = 0.316, TRACK = 0.745;   // rear/front axle x (from the tail), tyre radius
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
// smooth 1-D profile through (x, y) points
function profile(pts) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => V(x, y, 0)), false, 'centripetal'); const s = c.getPoints(600);
  return (x) => { if (x <= s[0].x) return s[0].y; for (let i = 1; i < s.length; i++) if (s[i].x >= x) { const a = s[i - 1], b = s[i], t = (x - a.x) / (b.x - a.x || 1); return a.y + (b.y - a.y) * t; } return s[s.length - 1].y; };
}
// ---- the traced outline (x from the tail, metres) ---------------------------------------------------------------
const TOP = profile([[0, 0.74], [0.1, 0.85], [0.35, 0.91], [0.55, 0.97], [1.0, 1.12], [1.5, 1.25], [1.9, 1.295], [2.25, 1.285], [2.5, 1.22], [2.8, 1.06], [3.05, 0.93], [3.4, 0.865], [3.8, 0.785], [4.12, 0.69], [4.3, 0.59], [4.385, 0.46]]);
const BOT = profile([[0, 0.31], [0.12, 0.21], [0.4, 0.175], [2.0, 0.165], [4.1, 0.16], [4.3, 0.135], [4.385, 0.3]]);
const BELT = profile([[0, 0.88], [0.6, 0.95], [1.6, 0.935], [2.6, 0.915], [3.05, 0.905], [4.385, 0.85]]);
const HW = profile([[0, 0.7], [0.12, 0.8], [0.35, 0.855], [0.9, 0.8725], [2.2, 0.8725], [3.4, 0.862], [3.9, 0.82], [4.2, 0.72], [4.33, 0.56], [4.385, 0.4]]);
const RW = profile([[0.4, 0.66], [1.0, 0.6], [1.6, 0.6], [2.3, 0.62], [3.05, 0.72]]);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// one cross-section at x: right half from the bottom centre round to the top centre (fixed control count, so it lofts)
function section(x) {
  const yt = TOP(x), belt = BELT(x), hw = HW(x);
  let yb = BOT(x);
  for (const xa of [XR, XF]) { const d = Math.abs(x - xa), R = 0.365; if (d < R) yb = Math.max(yb, WR + Math.sqrt(R * R - d * d) * 0.98); }   // wheel arches
  const gh = smooth(0.0, 0.11, yt - belt);
  const yS = gh > 0 ? belt * gh + (yt - 0.05) * (1 - gh) : yt - 0.05;
  const rw = RW(x), gw = hw * 0.86;
  const deck = [[0.5 * hw, yt], [0.85 * hw, yt - 0.02]], green = [[rw, yt - 0.03], [gw, yS + 0.05]];
  const c6 = [deck[1][0] * (1 - gh) + green[1][0] * gh, deck[1][1] * (1 - gh) + green[1][1] * gh];
  const c7 = [deck[0][0] * (1 - gh) + green[0][0] * gh, deck[0][1] * (1 - gh) + green[0][1] * gh];
  const ctrl = [[0, yb], [0.72 * hw, yb], [0.96 * hw, yb + 0.035], [hw, yb + 0.33 * (yS - yb)], [hw * 1.003, yb + 0.72 * (yS - yb)], [0.975 * hw, yS], c6, c7, [0, yt]];
  const c = new THREE.CatmullRomCurve3(ctrl.map(([z, y]) => V(0, y, z)), false, 'centripetal');
  return c.getPoints(22).map((p) => [p.z, p.y]);   // 23 points, bottom centre -> top centre
}

// which part of the car a body triangle belongs to, from its x and its row k round the section (0 = bottom centre,
// 22 = top centre; the rows run along the car, so region edges are clean lines): 0 paint, 1 black kit,
// 2 black roof/pillars, 3 glass
function region(x, k) {
  const gh = TOP(x) - BELT(x) > 0.06;
  if (gh && k > 14.2) {
    if (x > 2.5 && x < 3.04 && k > 15.6) return 3;                                                // windshield
    if (k > 14.7 && k < 19.2 && ((x > 1.68 && x < 2.47) || (x > 1.18 && x < 1.58))) return 3;   // door + quarter glass
    if (x > 0.58 && x < 1.45 && k > 16.4) return 3;                                               // hatch glass
    return 2;
  }
  return 0;   // paint (the black kit is cut out of it per pixel in the paint shader: kitShader)
}
// the body surface's top at (x, |z|) (for seating parts on it)
export function surfY(x, z) { const h = section(x); let best = h[h.length - 1][1]; for (let i = h.length - 1; i > 0; i--) { const [z0, y0] = h[i], [z1, y1] = h[i - 1]; if ((z0 - z) * (z1 - z) <= 0) { const t = (z - z0) / ((z1 - z0) || 1); best = y0 + (y1 - y0) * t; break; } } return best; }

function bodyGeometry(deform) {
  const NS = 150, pos = [], idx = [], ring = []; let N = 0;
  for (let i = 0; i <= NS; i++) {
    const x = L * i / NS, half = section(x), full = [...half, ...half.slice(1, -1).reverse().map(([z, y]) => [-z, y])];
    N = full.length; ring.push(full.map(([z, y]) => [x, y, z]));
  }
  const H = 22, kOf = (k) => (k <= H ? k : 2 * H - k);   // row index -> height-row 0..22 (mirrored)
  const vx = [], vk = [];
  ring.forEach((r, i) => r.forEach((p, k) => { pos.push(...p); vx.push(p[0]); vk.push(kOf(k)); }));
  const quadReg = [];   // one region per quad (both its triangles), so region edges follow the grid
  for (let i = 0; i < NS; i++) for (let k = 0; k < N; k++) { const a = i * N + k, b = i * N + (k + 1) % N, c = (i + 1) * N + k, d = (i + 1) * N + (k + 1) % N; idx.push(a, c, b, b, c, d); const r = region(L * (i + 0.5) / NS, (kOf(k) + kOf((k + 1) % N)) / 2); quadReg.push(r, r); }
  for (const [i, flip] of [[0, true], [NS, false]]) { const r = ring[i]; const cx = r[0][0], cy = r.reduce((s, p) => s + p[1], 0) / N; const ci = pos.length / 3; pos.push(cx + (flip ? -0.01 : 0.01), cy, 0); vx.push(cx); vk.push(9); for (let k = 0; k < N; k++) { const a = i * N + k, b = i * N + (k + 1) % N; flip ? idx.push(ci, a, b) : idx.push(ci, b, a); } }
  if (deform) for (let v = 0; v < pos.length; v += 3) { const p = deform(pos[v], pos[v + 1], pos[v + 2]); pos[v] = p[0]; pos[v + 1] = p[1]; pos[v + 2] = p[2]; }
  const buckets = [[], [], [], []];
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; const reg = t / 3 < quadReg.length ? quadReg[t / 3] : region((vx[a] + vx[b] + vx[c]) / 3, (vk[a] + vk[b] + vk[c]) / 3); buckets[reg].push(a, b, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const all = []; let start = 0; buckets.forEach((b, m) => { all.push(...b); g.addGroup(start, b.length, m); start += b.length; });
  g.setIndex(all); g.computeVertexNormals(); return g;
}

// the black aftermarket kit, cut out of the white paint per pixel from the body-local position, so its edges are
// clean curves: side skirts below 0.33 m, the front bumper rising to the headlights, the rear bumper up to the
// tail-light bar, the triangular scoop behind each front wheel
function kitShader(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float kitY = 0.33 + 0.29 * smoothstep(3.70, 4.06, vLoc.x) + 0.36 * (1.0 - smoothstep(0.10, 0.42, vLoc.x));
        float kit = 1.0 - smoothstep(kitY - 0.003, kitY + 0.003, vLoc.y);
        float sc = step(2.74, vLoc.x) * step(vLoc.x, 3.02) * step(vLoc.y, 0.6 - (vLoc.x - 2.74) * 0.95) * step(0.8, abs(vLoc.z));
        kit = max(kit, sc);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.011, 0.011, 0.012), kit);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.78, kit);')
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\nmaterial.clearcoat *= (1.0 - kit);');
  };
  mat.customProgramCacheKey = () => 'coupe-kit';
}
// ---- parts ------------------------------------------------------------------------------------------------------
function wheel(side) {
  const g = new THREE.Group();
  // tyre: low-profile, rounded shoulders (lathe around the axle)
  const prof = []; const R = WR, Ri = 0.205, W = 0.205;
  for (let k = 0; k <= 16; k++) { const a = -Math.PI / 2 + k / 16 * Math.PI; prof.push(new THREE.Vector2(R - 0.025 + Math.cos(a) * 0.025, Math.sin(a) * W / 2)); }
  prof.unshift(new THREE.Vector2(Ri, -W / 2 + 0.01)); prof.push(new THREE.Vector2(Ri, W / 2 - 0.01));
  const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), std({ color: '#1a1a1a', roughness: 0.85 })); tyre.rotation.x = Math.PI / 2; tyre.castShadow = true; g.add(tyre);
  const sil = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.25 });
  const face = side * 0.07;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(Ri, Ri, 0.17, 32, 1, true), std({ color: '#8a8e92', metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide })); barrel.rotation.x = Math.PI / 2; g.add(barrel);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(Ri - 0.005, 0.012, 8, 40), sil); lip.position.z = face; g.add(lip);
  // five spokes, each a tapered, slightly dished bar from the hub to the lip
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * Math.PI * 2, sp = new THREE.Shape(); sp.moveTo(0.045, -0.028); sp.lineTo(Ri - 0.01, -0.042); sp.lineTo(Ri - 0.01, 0.042); sp.lineTo(0.045, 0.028); sp.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sp, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), sil);
    m.rotation.z = a; m.position.z = face - side * 0.0125 - 0.0125; m.castShadow = true; g.add(m);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.04, 24), sil); hub.rotation.x = Math.PI / 2; hub.position.z = face; g.add(hub);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 20), std({ color: '#2a2c2e', metalness: 0.5 })); cap.rotation.x = Math.PI / 2; cap.position.z = face + side * 0.02; g.add(cap);
  for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4; const n = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), sil); n.rotation.x = Math.PI / 2; n.position.set(Math.cos(a) * 0.045, Math.sin(a) * 0.045, face + side * 0.015); g.add(n); }
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.022, 28), std({ color: '#6a6c6e', metalness: 0.7, roughness: 0.5 })); disc.rotation.x = Math.PI / 2; disc.position.z = -side * 0.02; g.add(disc);
  return g;
}
function headlight(side) {
  const g = new THREE.Group();
  // a long clear teardrop lying in the corner between the hood and the bumper
  const lens = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), phys({ color: '#f4f8fa', transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1, depthWrite: false }));
  lens.scale.set(0.3, 0.05, 0.085); g.add(lens);
  const back = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), std({ color: '#d8dce0', metalness: 0.9, roughness: 0.15 })); back.scale.set(0.28, 0.037, 0.072); back.position.y = -0.006; g.add(back);
  for (const [dx, r] of [[0.07, 0.034], [-0.05, 0.03]]) { const bowl = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#f2f4f6', metalness: 1, roughness: 0.1, side: THREE.DoubleSide })); bowl.position.set(dx, 0.02, 0); g.add(bowl); const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 10, 8), std({ color: '#fff', emissive: '#fff8e8', emissiveIntensity: 0.4 })); bulb.position.set(dx, 0.03, 0); g.add(bulb); }
  const amber = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), std({ color: '#e89a2a', transparent: true, opacity: 0.8 })); amber.scale.set(0.035, 0.02, 0.03); amber.position.set(-0.16, 0.01, 0); g.add(amber);
  g.rotation.set(0, side * 0.62, 0);
  return g;
}
function plateTex() {
  return canvasT(300, 150, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(60,110,200,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1a3a8a'; fitText(x, 'ELM COUNTY', w / 2, 20, 200, 18, F.label, { spacing: 3 }); fitText(x, 'PTW 4417', w / 2, 82, 270, 74, F.label, { weight: 700 }); fitText(x, 'drive safe', w / 2, 134, 160, 14, F.label); });
}

export function makeCoupe({ crashed = false } = {}) {
  const g = new THREE.Group(); g.name = crashed ? 'coupe_crashed' : 'coupe';
  const car = new THREE.Group(); car.position.x = -(XR + XF) / 2; g.add(car);   // origin centred between the axles
  const r = rng(61);
  // crash: crush the front back (more on the right, +z), buckle the hood up, ripple everything forward of the A-pillar
  const deform = crashed ? (x, y, z) => {
    const c = Math.max(0, (x - 3.15) / (L - 3.15)); if (c <= 0) return [x, y, z];
    const side = 0.55 + 0.45 * (z / 0.87);
    const nx = x - 0.55 * Math.pow(c, 1.4) * side;
    const buckle = y > 0.6 ? 0.1 * Math.sin(c * Math.PI) * (1 - Math.abs(z) / 1.2) : 0;
    const crumple = 0.025 * Math.sin(x * 37 + z * 23) * c + 0.018 * Math.sin(y * 41) * c;
    // the torn kit bumper: its left corner has come away and sags to the ground
    const sag = y < 0.56 && z < 0 ? 0.16 * smooth(0.25, 0.9, c) * (-z / 0.87) * (0.56 - y) / 0.4 + 0.06 * smooth(0.6, 1, c) * (-z / 0.87) : 0;
    return [nx + crumple + sag * 0.3, Math.max(0.02, y + buckle + crumple * 0.5 - sag), z * (1 + 0.05 * c) + crumple - sag * 0.4];
  } : null;
  const paint = phys({ color: '#f2f1ec', roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15 }); kitShader(paint);
  const kit = std({ color: '#151617', roughness: 0.75 });
  const roofBlk = phys({ color: '#0e0f10', roughness: 0.2, clearcoat: 1 });
  const glass = phys({ color: '#1a2228', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const body = new THREE.Mesh(bodyGeometry(deform), [paint, kit, roofBlk, glass]); body.castShadow = true; body.receiveShadow = true; car.add(body);
  const D = (x, y, z) => (deform ? V(...deform(x, y, z)) : V(x, y, z));
  // under-body: floor pan + inner wheel wells
  const dark = std({ color: '#0c0c0c', roughness: 0.9 });
  const FL = crashed ? 3.0 : 3.6; const floor = new THREE.Mesh(new THREE.BoxGeometry(FL, 0.06, 1.5), dark); floor.position.set(0.4 + FL / 2, 0.2, 0); car.add(floor);
  for (const xa of [XR, XF]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.32, 24, 1, true, Math.PI / 2, Math.PI), std({ color: '#0a0a0a', side: THREE.DoubleSide })); w.rotation.set(Math.PI / 2, 0, 0); w.position.copy(D(xa, WR, s * 0.68)); if (crashed && xa === XF) w.scale.set(0.85, 1, 0.8); car.add(w); }
  // wheels (one front wheel knocked in when crashed)
  for (const [xa, s] of [[XR, 1], [XR, -1], [XF, 1], [XF, -1]]) {
    const w = wheel(s); w.position.set(xa, WR, s * TRACK); car.add(w);
    if (crashed && xa === XF && s === 1) { w.position.x -= 0.18; w.position.z -= 0.08; w.rotation.set(0.22, 0.35, 0); }
  }
  // headlights
  for (const s of [-1, 1]) { if (crashed && s === 1) continue; const h = headlight(s); h.position.copy(D(4.06, surfY(4.06, 0.58) - 0.012, s * 0.58)); h.rotation.z = -0.36; car.add(h); if (crashed) { h.rotation.x = 0.2; h.position.y -= 0.03; } }
  if (crashed) { const bucket = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#d8dce0', metalness: 1, roughness: 0.2, side: THREE.DoubleSide })); bucket.position.copy(D(4.0, 0.64, 0.6)); car.add(bucket);
    for (let i = 0; i < 26; i++) { const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.012 + r() * 0.02), phys({ color: '#e8f0f4', transparent: true, opacity: 0.6, roughness: 0.05 })); sh.position.set(3.9 + r() * 1.2, 0.005, 0.2 + r() * 1.1); sh.rotation.set(r() * 3, r() * 3, r() * 3); sh.scale.y = 0.3; car.add(sh); } }
  // the kit's lower front intakes (dark mesh) + taped lip (silver duct tape strips)
  const mesh = canvasT(64, 64, (x, w, h) => { x.fillStyle = '#050505'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2a2a'; x.lineWidth = 3; for (let i = -64; i < 128; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); } });
  mesh.wrapS = mesh.wrapT = THREE.RepeatWrapping; mesh.repeat.set(4, 1);
  const meshM = std({ map: mesh, roughness: 0.8 });
  const frontX = (az) => { for (let x = L; x > 3.5; x -= 0.005) if (HW(x) > az + 0.02) return x; return 3.5; };   // the bumper face at |z|
  for (const [z, w] of [[0, 0.62], [-0.52, 0.22], [0.52, 0.22]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.12), meshM); p.position.copy(D(frontX(Math.abs(z)) + 0.004, 0.36, z)); p.rotation.y = Math.PI / 2 + (z ? -Math.sign(z) * 0.75 : 0); car.add(p); }
  const tape = std({ color: '#a8aaa8', metalness: 0.4, roughness: 0.45 });
  if (!crashed) for (const [z, rot] of [[-0.3, 0.1], [0.05, -0.05], [0.42, 0.15]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.006, 0.2), tape); t.position.set(4.3, 0.14, z); t.rotation.set(0, rot, 0.35); car.add(t); }
  // tail-light bar: a clear strip wrapping the tail between the bumper and the deck, eight round red lamps in chrome rings
  const tz = [], tx = (az) => (az < 0.7 ? -0.005 : -0.005 + 0.35 * Math.pow((az - 0.7) / 0.16, 1.6));
  for (let k = 0; k <= 40; k++) tz.push(-0.855 + k / 40 * 1.71);
  const bandPos = [], bandIdx = [];
  tz.forEach((z, k) => { const x = tx(Math.abs(z)) - 0.012; bandPos.push(x, 0.69, z, x, 0.815, z); if (k) { const a = (k - 1) * 2; bandIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bandPos, 3)); bg.setIndex(bandIdx); bg.computeVertexNormals();
  car.add(new THREE.Mesh(bg, std({ color: '#d8dade', metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide })));
  const bandGlass = new THREE.Mesh(bg.clone(), phys({ color: '#ffffff', transparent: true, opacity: 0.3, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false })); bandGlass.position.x = -0.012; car.add(bandGlass);
  const redM = phys({ color: '#c8101a', emissive: '#6a0008', emissiveIntensity: 0.6, roughness: 0.15, clearcoat: 1 }), ringM = std({ color: '#e8eaec', metalness: 1, roughness: 0.12 });
  for (const z of [-0.79, -0.6, -0.4, -0.18, 0.18, 0.4, 0.6, 0.79]) {
    const az = Math.abs(z), x = tx(az) - 0.02, ang = az < 0.7 ? 0 : Math.sign(z) * Math.atan(0.35 * 1.6 * Math.pow((az - 0.7) / 0.16, 0.6) / 0.16) * 0.5;
    const lg = new THREE.Group(); lg.position.set(x, 0.752, z); lg.rotation.y = -Math.PI / 2 - ang; car.add(lg);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.009, 8, 24), ringM); lg.add(ring);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.044, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), redM); lamp.rotation.x = Math.PI / 2; lamp.scale.z = 0.5; lg.add(lamp);
  }
  // made-up plate on the rear bumper, a big chrome exhaust tip under it
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.305, 0.152), std({ map: plateTex(), roughness: 0.4, metalness: 0.2 })); plate.position.set(-0.012, 0.47, 0.18); plate.rotation.y = -Math.PI / 2; car.add(plate);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.055, 0.2, 24, 1, true), std({ color: '#d8dcde', metalness: 1, roughness: 0.15, side: THREE.DoubleSide })); tip.rotation.z = Math.PI / 2; tip.position.set(0.02, 0.24, -0.5); car.add(tip);
  const soot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), std({ color: '#0a0a0a' })); soot.rotation.y = -Math.PI / 2; soot.position.set(0.0, 0.24, -0.5); car.add(soot);
  // wing spoiler across the hatch base on two stands (snapped on one side when crashed)
  const af = new THREE.Shape(); af.moveTo(0, 0); af.bezierCurveTo(0.04, 0.03, 0.15, 0.03, 0.24, 0.006); af.lineTo(0.24, -0.004); af.bezierCurveTo(0.15, 0.005, 0.04, -0.012, 0, 0);
  const wing = new THREE.Mesh(new THREE.ExtrudeGeometry(af, { depth: 1.42, bevelEnabled: false, curveSegments: 12 }), kit); wing.geometry.translate(0, 0, -0.71); wing.geometry.rotateY(Math.PI);
  const wg = new THREE.Group(); wg.position.set(0.48, 1.01, 0); car.add(wg); wing.castShadow = true; wg.add(wing);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.025), kit); st.position.set(-0.08, -0.04, s * 0.55); wg.add(st); }
  if (crashed) { wg.rotation.x = 0.18; wg.position.y -= 0.03; }
  // mirrors, door handles, the door cut line, fuel door, wiper, antenna
  for (const s of [-1, 1]) {
    const mg = new THREE.Group(); mg.position.copy(D(2.56, 0.97, s * 0.86)); car.add(mg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.06), kit); arm.position.z = s * 0.03; mg.add(arm);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), kit); hd.scale.set(0.06, 0.055, 0.1); hd.position.set(-0.02, 0.02, s * 0.1); mg.add(hd);
    const hdl = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.025, 0.02), kit); hdl.position.set(1.72, 0.84, s * 0.875); car.add(hdl);
    const cut = []; for (const [x, y] of [[2.6, 0.92], [2.62, 0.5], [2.55, 0.34], [1.62, 0.34], [1.62, 0.92]]) cut.push(V(x, y, s * (HW(x) + 0.002)));
    car.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cut), new THREE.LineBasicMaterial({ color: '#7a7a76' })));
  }
  const fuel = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), std({ color: '#e8e7e2', roughness: 0.3 })); fuel.position.set(0.95, 0.83, -HW(0.95) - 0.004); fuel.rotation.y = Math.PI; car.add(fuel);
  const wip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.008, 0.012), kit); wip.position.set(0.7, 1.03, 0.05); wip.rotation.set(0, 0.6, -0.38); car.add(wip);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.55, 6), kit); ant.position.set(0.35, 1.2, 0.6); ant.rotation.z = 0.5; car.add(ant);
  // interior, seen through the tint: two bucket seats, a rear bench, the dash with a wheel
  const trim = std({ color: '#1e1e20', roughness: 0.9 });
  for (const s of [-1, 1]) { const seat = new THREE.Group(); seat.position.set(1.9, 0.3, s * 0.38); car.add(seat); const cu = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.46), trim); cu.position.y = 0.06; seat.add(cu); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.46), trim); bk.position.set(-0.25, 0.38, 0); bk.rotation.z = -0.25; seat.add(bk); }
  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 1.1), trim); bench.position.set(1.15, 0.45, 0); car.add(bench);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 1.5), trim); dash.position.set(2.75, 0.8, 0); car.add(dash);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 24), trim); sw.position.set(2.45, 0.86, 0.38); sw.rotation.y = Math.PI / 2; sw.rotation.x = 0.4; car.add(sw);
  if (crashed) {
    const bag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), std({ color: '#ecebe4', roughness: 0.95, flatShading: true })); bag.scale.set(0.35, 0.8, 1); bag.position.set(2.38, 0.8, 0.38); car.add(bag);
    // cracked windshield: a spider web drawn over the glass at the impact point
    const crack = canvasT(512, 512, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(235,240,245,0.85)'; x.lineWidth = 2; const cx = 300, cy = 260; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + Math.random() * 0.3; x.beginPath(); x.moveTo(cx, cy); let px = cx, py = cy; for (let k = 0; k < 8; k++) { px += Math.cos(a + (Math.random() - 0.5) * 0.5) * 30; py += Math.sin(a + (Math.random() - 0.5) * 0.5) * 30; x.lineTo(px, py); } x.stroke(); } for (let rr = 25; rr < 160; rr += 30 + Math.random() * 20) { x.beginPath(); for (let a = 0; a < 6.3; a += 0.35) x.lineTo(cx + Math.cos(a) * rr * (0.8 + Math.random() * 0.4), cy + Math.sin(a) * rr * (0.8 + Math.random() * 0.4)); x.stroke(); } x.fillStyle = 'rgba(235,240,245,0.5)'; x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.fill(); });
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.15), std({ map: crack, transparent: true, depthWrite: false, roughness: 0.2 }));
    ws.position.set(2.76, 1.085, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-(Math.PI / 2 - Math.atan2(0.29, 0.55))); car.add(ws);
    // fluid puddle under the nose
    const pud = new THREE.Mesh(new THREE.CircleGeometry(0.55, 28), phys({ color: '#14181a', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 })); pud.rotation.x = -Math.PI / 2; pud.scale.set(1.3, 1, 1); pud.position.set(3.6, 0.006, 0.15); car.add(pud);
  }
  g.userData.collider = [-L / 2 - 0.1, L / 2 + 0.1, -0.92, 0.92];
  return g;
}
