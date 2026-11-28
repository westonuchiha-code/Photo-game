// Things from the owner's high-plains photos (photos/1000137317..322; textures: tools/tex_141.py). A library: none is
// placed yet. The billboard's advertiser is invented; the speed sign is the ordinary road sign.
//   makeArchBarn, makeJunkPile, makeBillboard, makeSpeedLimitSign, makeBareTree, makeTumbleweed, makeDryLot,
//   makeHorizonBackdrop
import * as THREE from 'three';
import { mat, plain, canvasT, rng } from './kit.js';

const PI = Math.PI;
const B = (w, h, d, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); parent.add(o); return o; };
const C = (rt, rb, h, m, x, y, z, parent, seg = 14, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); parent.add(o); return o; };
const tube = (g, a, b, r0, m, r1 = r0) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A), o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), 7), m); o.position.copy(A).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(o); return o; };
const tiled = (name, rx, ry, o = {}) => { const src = mat(name, o), m = src.clone(); m.map = src.map.clone(); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; if (src.normalMap) { m.normalMap = src.normalMap.clone(); m.normalMap.repeat.set(rx, ry); m.normalMap.needsUpdate = true; } m.userData.flat = true; return m; };
const text = (x, s, cx, cy, font, col, maxW) => { x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy, maxW); };
const sheet = (w, h, draw, o = {}) => new THREE.MeshStandardMaterial({ map: canvasT(w, h, draw), roughness: 0.7, ...o });
const ground = (name, w, d, size, parent, o = {}) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), tiled(name, w / size, d / size, { rough: 0.95, ...o })); p.rotation.x = -PI / 2; p.position.y = 0.004; p.receiveShadow = true; parent.add(p); return p; };
const shadows = (g) => { g.traverse((o) => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
const steel = () => plain('#8a8e92', { roughness: 0.4, metalness: 0.35 }), brown = () => plain('#5a3e2e', { roughness: 0.55, metalness: 0.25 });

// ---- an arched barn: white corrugated walls, a curved roof of rusted sheet in long strips, a timber fascia along the eave
export function makeArchBarn({ L = 14, W = 10, H = 3.2, rise = 2.4 } = {}) { const g = new THREE.Group(), side = tiled('g141_siding_white', L / 1.6, H / 1.2, { rough: 0.5 }), end = tiled('g141_siding_white', W / 1.6, (H + rise) / 1.2, { rough: 0.5 });
  for (const s of [-1, 1]) B(L, H, 0.08, side, 0, H / 2, s * W / 2, g);
  // ends: a rectangle with an arch on top
  const R = (W * W / 4 + rise * rise) / (2 * rise), cy = H + rise - R, sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); const a0 = Math.asin((W / 2) / R); sh.absarc(0, cy, R, PI / 2 - a0, PI / 2 + a0, false); sh.lineTo(-W / 2, 0);
  for (const s of [-1, 1]) { const geo = new THREE.ShapeGeometry(sh, 24), p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 1.6, p.getY(i) / 1.2); const m = new THREE.Mesh(geo, end); m.material.side = THREE.DoubleSide; m.rotation.y = s * PI / 2; m.position.x = s * L / 2; g.add(m); }
  // the roof: the arc swept along the length, in strips with seams; a fascia board at each eave
  const roof = new THREE.CylinderGeometry(R + 0.06, R + 0.06, L + 0.4, 40, 1, true, PI / 2 - a0 - 0.03, 2 * a0 + 0.06), p = roof.attributes.position, uv = roof.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getY(i) / 7, Math.atan2(p.getX(i), p.getZ(i)) * R / 2);   /* (made round the y axis, centred on +x; turned so the axis runs along the barn and the crown is up. u: along the barn, so the seams between strips fall across it) */
  const rm = tiled('g141_rust_roof', 1, 1, { rough: 0.75, metal: 0.2 }); rm.side = THREE.DoubleSide; const rf = new THREE.Mesh(roof, rm); rf.rotation.z = PI / 2; rf.position.set(0, cy, 0); g.add(rf);
  for (const s of [-1, 1]) B(L + 0.3, 0.22, 0.06, mat('wood_floor', { to: '#9a948a', rough: 0.9 }), 0, H + 0.02, s * (W / 2 + 0.06), g, s * 0.25);
  // a big sliding door on one end
  B(3.4, 3.0, 0.05, tiled('g141_siding_white', 2, 2.5, { tint: '#c8c4bc', rough: 0.6 }), L / 2 + 0.05, 1.5, 0.4, g, 0, PI / 2); B(0.06, 0.08, 4.2, steel(), L / 2 + 0.08, 3.08, 0.4, g);
  g.userData.colliders = [[-L / 2, L / 2, -W / 2, W / 2]]; return shadows(g); }

// ---- what piles up against such a barn: plywood sheets on end, a broken pallet, planks and offcuts heaped, a coil of
// black hose, a length of white pipe, dry brush grown up through all of it
export function makeJunkPile() { const g = new THREE.Group(), r = rng(19), ply = mat('g141_plywood', { rough: 0.9 }), gray = (c) => mat('wood_floor', { to: c, rough: 0.95 });
  ground('g141_sand_pebbles', 6, 4, 2.2, g); B(6, 3, 0.08, tiled('g141_siding_white', 3.6, 2.5, { rough: 0.5 }), 0, 1.5, -1.2, g);
  B(1.2, 2.0, 0.04, ply, -1.8, 1.0, -1.0, g, -0.08); B(1.2, 1.4, 0.04, gray('#9a8e78'), 0.2, 0.7, -1.02, g, -0.06); B(0.12, 2.2, 0.08, gray('#6a6458'), -0.6, 1.0, -0.85, g, 0.1, 0, -0.4);
  for (let i = 0; i < 6; i++) B(0.1, 1.2, 0.025, gray('#8a8270'), -1.95 + i * 0.13, 0.6, -0.85, g, 0, 0, (r() - 0.5) * 0.06);   // the pallet on end
  for (let i = 0; i < 28; i++) { const l = 0.8 + r() * 2.2; B(l, 0.04 + r() * 0.05, 0.1 + r() * 0.12, gray(['#8a8270', '#6a6458', '#a8a090', '#5a5040'][i % 4]), 0.4 + r() * 2.0 - 0.3, 0.06 + Math.floor(i / 5) * 0.08 + r() * 0.04, -0.4 + r() * 0.8, g, (r() - 0.5) * 0.15, (r() - 0.5) * 0.5, (r() - 0.5) * 0.12); }
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.34 - i * 0.015, 0.02, 6, 22), plain('#16161a', { roughness: 0.7 })); t.rotation.set(PI / 2 + 0.25, 0, 0); t.position.set(2.3 + (r() - 0.5) * 0.06, 0.55 + i * 0.03, -0.3); g.add(t); }
  C(0.04, 0.04, 1.3, plain('#eceae4', { roughness: 0.4 }), -0.9, 0.2, 0.4, g, 10, 0.2, 1.3);
  g.add(makeTumbleweed({ R: 0.9, seed: 3 })); g.children[g.children.length - 1].position.set(-1.4, 0, 0.6); const t2 = makeTumbleweed({ R: 0.7, seed: 8 }); t2.position.set(1.0, 0, 0.9); g.add(t2); const t3 = makeTumbleweed({ R: 0.55, seed: 11 }); t3.position.set(-2.5, 0, 0.0); g.add(t3);
  g.userData.colliders = [[-2.6, 2.8, -1.2, 0.6]]; return shadows(g); }

// ---- a billboard on one steel pole over a dry hillside: a catwalk, a caged ladder, the face (advertiser invented)
export function makeBillboard() { const g = new THREE.Group(), pole = brown(), Hp = 9, W = 6.4, Hf = 3.2;
  C(0.32, 0.36, Hp, pole, 0, Hp / 2, 0, g, 20); C(0.6, 0.7, 0.4, plain('#9a948a', { roughness: 0.9 }), 0, 0.2, 0, g, 20);
  for (const x of [-2.4, 0, 2.4]) B(0.14, 0.2, 2.0, pole, x, Hp - 0.1, -0.2, g); B(W + 0.6, 0.18, 0.16, pole, 0, Hp, -0.9, g); B(W + 0.6, 0.18, 0.16, pole, 0, Hp, 0.6, g);
  B(W + 0.6, 0.04, 1.1, plain('#4a3a2e', { roughness: 0.6, metalness: 0.3 }), 0, Hp + 0.1, 0.2, g); for (let x = -W / 2 - 0.2; x <= W / 2 + 0.25; x += 0.9) tube(g, [x, Hp + 0.1, 0.75], [x, Hp + 1.0, 0.75], 0.02, pole); tube(g, [-W / 2 - 0.3, Hp + 1.0, 0.75], [W / 2 + 0.3, Hp + 1.0, 0.75], 0.02, pole);
  // the ladder up the pole, with its cage
  for (const s of [-1, 1]) tube(g, [s * 0.2, 2.2, 0.5], [s * 0.2, Hp, 0.5], 0.02, plain('#2a2c30')); for (let y = 2.4; y < Hp; y += 0.3) tube(g, [-0.2, y, 0.5], [0.2, y, 0.5], 0.012, plain('#2a2c30')); for (let y = 3; y < Hp; y += 0.9) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.012, 5, 16, PI), plain('#2a2c30')); c.rotation.x = PI / 2; c.position.set(0, y, 0.5); g.add(c); }
  // the face
  const fy = Hp + 0.25 + Hf / 2; B(W + 0.3, Hf + 0.3, 0.2, plain('#eeece6', { roughness: 0.6 }), 0, fy, -1.0, g);
  const face = sheet(1280, 640, (x, w, h) => { x.fillStyle = '#f8f6f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#b8322a'; x.beginPath(); x.moveTo(90, 250); x.lineTo(240, 110); x.lineTo(330, 190); x.lineTo(420, 90); x.lineTo(560, 250); x.closePath(); x.fill(); x.fillStyle = '#3a3c40'; x.beginPath(); x.moveTo(150, 250); x.lineTo(240, 160); x.lineTo(330, 240); x.closePath(); x.fill();
    text(x, 'Ridgeline', 325, 330, 'bold 104px Georgia, serif', '#2a2a2e', 560); text(x, 'Roofing', 325, 430, 'bold 104px Georgia, serif', '#2a2a2e', 560); text(x, 'three generations up a ladder', 325, 500, 'italic 30px Georgia, serif', '#5a5a5e', 560);
    x.fillStyle = '#d8a01e'; x.fillRect(680, 70, 540, 120); text(x, 'ROOFS OVER THE PLAINS', 950, 110, 'bold 40px Arial, sans-serif', '#2a2a2e', 520); text(x, 'SINCE 1987', 950, 160, '900 48px Arial, sans-serif', '#2a2a2e');
    for (let i = 0; i < 6; i++) { x.strokeStyle = '#3a6ad8'; x.lineWidth = 6; x.beginPath(); x.arc(740 + i * 80, 280, 34, 0, 7); x.stroke(); text(x, '★', 740 + i * 80, 282, '38px Arial', '#3a6ad8'); }
    x.fillStyle = '#16161a'; x.fillRect(0, 540, w, 100); text(x, '555-0172', 250, 590, '900 62px Arial, sans-serif', '#f8f6f0'); text(x, 'quality · a fair price · we come back', 860, 590, 'bold 36px Arial, sans-serif', '#d8a01e', 700);
    x.fillStyle = '#c8322a'; x.fillRect(0, 528, w, 12); }, { roughness: 0.55 });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(W, Hf), face); f.position.set(0, fy, -0.89); g.add(f); for (const s of [-1, 1]) { tube(g, [s * 1.6, Hp + 0.12, 0.7], [s * 1.6, Hp + 0.5, 1.4], 0.03, plain('#3a3c40')); B(0.35, 0.12, 0.18, plain('#3a3c40'), s * 1.6, Hp + 0.55, 1.45, g, 0.6); }
  // the hillside under it
  const hill = new THREE.Mesh(new THREE.PlaneGeometry(16, 12, 16, 12), tiled('g141_dry_grass', 6, 4.5, { rough: 1 })), hp = hill.geometry.attributes.position; for (let i = 0; i < hp.count; i++) hp.setZ(i, Math.max(0, hp.getY(i) + 1) * 0.12 + Math.sin(hp.getX(i) * 0.6) * 0.1); hill.geometry.computeVertexNormals(); hill.rotation.x = -PI / 2; hill.position.set(0, -0.05, 2); hill.receiveShadow = true; g.add(hill);
  g.userData.colliders = [[-0.45, 0.45, -0.45, 0.45]]; return shadows(g); }

// ---- the ordinary road sign, on its post
export function makeSpeedLimitSign({ limit = 50 } = {}) { const g = new THREE.Group(); tube(g, [0, 0, 0], [0, 2.8, 0], 0.035, steel()); const face = sheet(300, 384, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#16161a'; x.lineWidth = 10; x.beginPath(); x.roundRect(14, 14, w - 28, h - 28, 18); x.stroke(); text(x, 'SPEED', w / 2, 74, '900 64px Arial, sans-serif', '#16161a'); text(x, 'LIMIT', w / 2, 146, '900 64px Arial, sans-serif', '#16161a'); text(x, String(limit), w / 2, 268, '900 150px Arial, sans-serif', '#16161a'); }, { roughness: 0.35, metalness: 0.15 });
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.61, 0.76, 0.012), [steel(), steel(), steel(), steel(), face, steel()]); p.position.set(0, 2.4, 0.04); g.add(p); for (const y of [2.12, 2.68]) C(0.012, 0.012, 0.02, steel(), 0, y, 0.05, g, 8, PI / 2); g.userData.colliders = [[-0.06, 0.06, -0.06, 0.06]]; return shadows(g); }

// ---- a leafless tree: one trunk, limbs forking upward into a fine crown of twigs
export function makeBareTree({ h = 6, seed = 7 } = {}) { const g = new THREE.Group(), r = rng(seed * 31 + 4), bark = tiled('g131_bark', 1, 2, { tint: '#9a948c', rough: 1 }), twig = plain('#4a443e', { roughness: 0.9 });
  const grow = (a, dir, len, rad, depth) => { const b = [a[0] + dir.x * len, a[1] + dir.y * len, a[2] + dir.z * len]; tube(g, a, b, rad, depth > 1 ? bark : twig, rad * 0.65); if (depth === 0) return; const n = depth > 2 ? 2 + (r() < 0.4 ? 1 : 0) : 2 + Math.floor(r() * 2); for (let i = 0; i < n; i++) { const t = r() * PI * 2, sp = 0.3 + r() * 0.4, d = new THREE.Vector3(dir.x + Math.cos(t) * sp, dir.y + 0.15, dir.z + Math.sin(t) * sp).normalize(); grow(b, d, len * (0.65 + r() * 0.2), rad * 0.62, depth - 1); } };
  tube(g, [0, 0, 0], [0, h * 0.35, 0], 0.16, bark, 0.13); for (let i = 0; i < 3; i++) { const t = i / 3 * PI * 2 + r(), d = new THREE.Vector3(Math.cos(t) * 0.35, 1, Math.sin(t) * 0.35).normalize(); grow([0, h * 0.35, 0], d, h * 0.25, 0.1, 5); }
  g.userData.colliders = [[-0.18, 0.18, -0.18, 0.18]]; return shadows(g); }

// ---- tumbleweed: a dome of grey-brown twigs, see-through
export function makeTumbleweed({ R = 0.6, seed = 5 } = {}) { const g = new THREE.Group(), r = rng(seed * 13 + 2), m = plain('#8a7a64', { roughness: 1 }), n = Math.round(260 * R), im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, n), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { const a = r() * PI * 2, el = r() * PI * 0.5, rr = R * (0.3 + r() * 0.7); q.setFromEuler(e.set(r() * PI, r() * PI, r() * PI)); M.compose(new THREE.Vector3(Math.cos(a) * Math.cos(el) * rr, Math.sin(el) * rr * 0.8 + 0.05, Math.sin(a) * Math.cos(el) * rr), q, new THREE.Vector3(0.004, 0.004, 0.1 + r() * 0.2)); im.setMatrixAt(i, M); im.setColorAt(i, c.set(['#8a7a64', '#6a5e4e', '#a8987e', '#5a5044'][i % 4])); }
  im.castShadow = true; g.add(im); return g; }

// ---- a dry lot: sand and pebbles, dead stalks lying about, brush along one edge, a stone or two
export function makeDryLot({ W = 8, D = 6 } = {}) { const g = new THREE.Group(), r = rng(27); ground('g141_sand_pebbles', W, D, 2.2, g); const brush = new THREE.Mesh(new THREE.PlaneGeometry(W, 1.4), tiled('g141_dry_brush', W / 2.4, 0.6, { rough: 1 })); brush.rotation.x = -PI / 2; brush.position.set(0, 0.008, D / 2 - 0.7); g.add(brush);
  for (let i = 0; i < 18; i++) { const x = (r() - 0.5) * W, z = (r() - 0.5) * D, a = r() * PI; tube(g, [x, 0.012, z], [x + Math.cos(a) * (0.4 + r() * 0.8), 0.012, z + Math.sin(a) * (0.4 + r() * 0.8)], 0.008, plain('#4a4640', { roughness: 1 })); }
  for (let i = 0; i < 6; i++) { const t = makeTumbleweed({ R: 0.35 + r() * 0.35, seed: i + 20 }); t.position.set((r() - 0.5) * W, 0, D / 2 - 0.6 - r() * 0.5); g.add(t); }
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + r() * 0.15, 0), plain(['#8a8278', '#6a645c', '#a8a094'][i % 3], { roughness: 1 })); s.scale.y = 0.5; s.position.set((r() - 0.5) * W, 0.04, (r() - 0.5) * D); g.add(s); }
  return shadows(g); }

// ---- the sky and the mountains, as a ring hung far off round whatever it is put round (open at top and bottom)
export function makeHorizonBackdrop({ R = 60, H = 22, kind = 'horizon' } = {}) { const g = new THREE.Group(), t = mat({ clouds: 'g141_clouds', snow: 'g147_snow_forest' }[kind] || 'g141_horizon').map.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); t.needsUpdate = true; const m = new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false }); const ring = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true), m); ring.position.y = H / 2 - 1; g.add(ring); ground(kind === 'snow' ? 'g131_concrete' : 'g141_dry_grass', R * 2, R * 2, 3, g); return g; }
// the other backdrops (147): a snowy pine forest; and an orange harvest moon to hang in a sky
export function makeSnowForestBackdrop() { return makeHorizonBackdrop({ kind: 'snow' }); }
export function makeHarvestMoon({ R = 6 } = {}) { const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ map: mat('g147_moon_orange').map, transparent: true, depthWrite: false, fog: false, toneMapped: false }), p = new THREE.Mesh(new THREE.PlaneGeometry(R, R), m); p.position.y = R; g.add(p); const halo = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.2, R * 2.2), new THREE.MeshBasicMaterial({ map: canvasT(256, 256, (x, w, h) => { const gr = x.createRadialGradient(128, 128, 40, 128, 128, 128); gr.addColorStop(0, 'rgba(255,170,80,0.35)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); halo.position.set(0, R, -0.01); g.add(halo); return g; }
