// Factory / warehouse set (95): machines, a conveyor, pipes + valves, tanks, a catwalk, pallets, crates, drums, a
// forklift, all from the texture library.  makeWorks() is "Elm Works": an open-fronted steel shed and a yard.
//   local: front +z, ground y = 0.  userData: colliders (local rects), area { minX, maxX, minZ, maxZ }
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V } from './kit.js';
import { F, fitText } from '../fonts.js';

const M = {
  galv: () => mat('gf_galv', { to: '#9aa2a8', rough: 0.45, metal: 0.6, side: THREE.DoubleSide }), steel: () => mat('wd_steel', { tint: '#c8ccd0', rough: 0.4, metal: 0.7 }), frame: () => mat('b84_rust', { to: '#3a4a5a', rough: 0.6, metal: 0.4 }),
  rust: () => mat('b82_rust', { rough: 0.9 }), yellow: () => mat('b85_zinc', { to: '#d8a818', rough: 0.55 }), green: () => mat('b85_zinc', { to: '#3a6a4a', rough: 0.55, metal: 0.2 }), red: () => mat('b85_zinc', { to: '#a8322a', rough: 0.5 }),
  blue: () => mat('b85_zinc', { to: '#2a4a7a', rough: 0.5, metal: 0.2 }), rubber: () => mat('pk_asphalt', { to: '#161616', rough: 0.95 }), wood: () => mat('i4_ply', { to: '#b08a58', rough: 0.9 }), card: () => mat('cardboard', { to: '#a8783e', rough: 0.95 }),
  conc: () => mat('b85_crackconc', { to: '#8a8a86', rough: 0.9 }), tread: () => mat('stair_tread', { tint: '#b0b4b8', rough: 0.5, metal: 0.5 }),
};

export function makePallet(load = 0, seed = 1) { const g = new THREE.Group(), w = M.wood(), r = rng(seed * 17 + 3);
  for (const z of [-0.5, 0, 0.5]) box(1.2, 0.09, 0.1, w, 0, 0.045, z, g, 0.8); for (let i = 0; i < 5; i++) box(0.14, 0.022, 1.1, w, -0.53 + i * 0.265, 0.101, 0, g, 0.8);
  if (load === 1) for (let l = 0; l < 3; l++) for (const [x, z] of [[-0.3, -0.26], [0.3, -0.26], [-0.3, 0.26], [0.3, 0.26]]) { if (l === 2 && r() < 0.4) continue; box(0.56, 0.36, 0.48, M.card(), x, 0.3 + l * 0.365, z, g, 0.7); }
  if (load === 2) for (const [x, z] of [[-0.3, -0.27], [0.3, -0.27], [-0.3, 0.27], [0.3, 0.27]]) { const d = makeDrum(Math.floor(r() * 3)); d.position.set(x, 0.112, z); g.add(d); }
  if (load === 3) { box(1.1, 0.9, 1.0, mat('store_crate_blue', { rough: 0.6 }), 0, 0.57, 0, g, 0.9); }
  return g; }
export function makeDrum(k = 0) { const g = new THREE.Group(), m = [M.blue, M.red, M.green][k % 3](); cyl(0.28, 0.28, 0.86, m, 0, 0.43, 0, g, 16); for (const y of [0.02, 0.3, 0.58, 0.85]) cyl(0.29, 0.29, 0.025, m, 0, y, 0, g, 16); cyl(0.03, 0.03, 0.03, M.steel(), 0.16, 0.875, 0, g, 8); return g; }
export function makeCrate(s = 1, k = 0) { const g = new THREE.Group(), w = k ? mat('i4_ply', { to: '#8a6a44', rough: 0.9 }) : M.wood(); box(s, s, s, w, 0, s / 2, 0, g, 0.9); for (const a of [-1, 1]) for (const b of [-1, 1]) { box(0.07, s + 0.02, 0.07, w, a * (s / 2), s / 2, b * (s / 2), g); box(s + 0.04, 0.07, 0.07, w, 0, s / 2 + a * (s / 2 - 0.035), b * (s / 2), g); box(0.07, 0.07, s + 0.04, w, b * (s / 2), s / 2 + a * (s / 2 - 0.035), 0, g); } return g; }
// a press / machine: a painted body on a plinth, a hopper, a motor, a control box with lamps, a guard cage
export function makeMachine(k = 0) { const g = new THREE.Group(), body = [M.green, M.blue, M.yellow][k % 3](), st = M.steel();
  box(2.6, 0.12, 1.5, M.conc(), 0, 0.06, 0, g, 1.5); rbox(2.2, 1.1, 1.1, 0.05, body, 0, 0.67, 0, g, 1.2); rbox(1.0, 0.9, 0.9, 0.05, body, -0.5, 1.65, 0, g, 1.2);
  { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.2, 0.6, 4, 1, true), M.galv()); h.rotation.y = Math.PI / 4; h.position.set(-0.5, 2.4, 0); g.add(h); }
  { const mo = cyl(0.26, 0.26, 0.7, M.frame(), 0.6, 1.5, 0, g, 14); mo.rotation.z = Math.PI / 2; for (let i = 0; i < 6; i++) { const f = cyl(0.275, 0.275, 0.02, M.frame(), 0.36 + i * 0.09, 1.5, 0, g, 14); f.rotation.z = Math.PI / 2; } const sh = cyl(0.05, 0.05, 0.4, st, 1.1, 1.5, 0, g, 8); sh.rotation.z = Math.PI / 2; const fl = cyl(0.3, 0.3, 0.08, st, 1.3, 1.5, 0, g, 18); fl.rotation.z = Math.PI / 2; }
  box(0.5, 0.7, 0.16, M.galv(), 0.6, 0.85, 0.63, g); for (const [x, c] of [[0.45, [0.2, 2.2, 0.4]], [0.6, [2.4, 1.6, 0.2]], [0.75, [2.4, 0.3, 0.2]]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), toneMapped: false })); l.material.userData.flat = true; l.position.set(x, 1.05, 0.72); g.add(l); }
  for (const y of [0.3, 0.9]) { const p = cyl(0.04, 0.04, 2.3, st, 0, y, -0.62, g, 8); p.rotation.z = Math.PI / 2; }
  for (const [x, z] of [[-1.25, 0.72], [1.25, 0.72]]) cyl(0.03, 0.03, 1.0, M.yellow(), x, 0.6, z, g, 8); bar(V(-1.25, 1.08, 0.72), V(1.25, 1.08, 0.72), 0.05, M.yellow(), g); bar(V(-1.25, 0.6, 0.72), V(0.3, 0.6, 0.72), 0.04, M.yellow(), g);
  g.userData.size = [2.6, 1.5]; return g; }
// roller conveyor, L long (along x), with legs, side rails, rollers (instanced) and a belt section
export function makeConveyor(L = 8) { const g = new THREE.Group(), st = M.steel(), fr = M.frame(), H = 0.85;
  for (const s of [-1, 1]) box(L, 0.12, 0.05, fr, 0, H, s * 0.36, g); for (let x = -L / 2 + 0.3; x <= L / 2 - 0.2; x += 1.6) for (const s of [-1, 1]) { box(0.06, H, 0.06, fr, x, H / 2, s * 0.36, g); box(0.06, 0.05, 0.72, fr, x, 0.3, 0, g); }
  const n = Math.floor(L / 0.16), rg = new THREE.CylinderGeometry(0.045, 0.045, 0.66, 10); rg.rotateX(Math.PI / 2); const im = new THREE.InstancedMesh(rg, st, n), m4 = new THREE.Matrix4(); for (let i = 0; i < n; i++) { m4.makeTranslation(-L / 2 + 0.08 + i * 0.16, H + 0.03, 0); im.setMatrixAt(i, m4); } g.add(im);
  box(L * 0.36, 0.02, 0.62, M.rubber(), -L * 0.3, H + 0.085, 0, g, 1); return g; }
// a vertical tank on legs with a domed top, banding, a ladder with hoops and a top rail
export function makeTank(R = 1.3, H = 5, col = '#c8ccc8') { const g = new THREE.Group(), m = mat('b85_zinc', { to: col, rough: 0.5, metal: 0.3 }), st = M.frame();
  cyl(R, R, H, m, 0, 0.7 + H / 2, 0, g, 28); { const d = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); d.scale.y = 0.35; d.position.y = 0.7 + H; g.add(d); const c = new THREE.Mesh(new THREE.ConeGeometry(R, 0.6, 28, 1, true), m); c.rotation.x = Math.PI; c.position.y = 0.4; g.add(c); }
  for (let y = 1.2; y < H + 0.6; y += 1.2) cyl(R + 0.015, R + 0.015, 0.06, m, 0, y, 0, g, 28); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; box(0.14, 0.9, 0.14, st, Math.cos(a) * R * 0.85, 0.45, Math.sin(a) * R * 0.85, g); }
  for (const s of [-1, 1]) box(0.04, H + 0.9, 0.04, st, s * 0.22, (H + 0.9) / 2 + 0.2, R + 0.12, g); for (let y = 0.5; y < H + 0.9; y += 0.3) box(0.44, 0.03, 0.03, st, 0, y, R + 0.12, g);
  for (let y = 2.6; y < H + 0.8; y += 0.9) { const hp = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.015, 5, 14, Math.PI), st); hp.rotation.x = Math.PI / 2; hp.position.set(0, y, R + 0.14); g.add(hp); }
  cyl(0.08, 0.08, 0.5, st, 0, 0.25, 0, g, 10); return g; }
// pipe run through points (straight legs + ball elbows), flanges at the ends, optional wheel valve at the mid leg
export function makePipe(pts, rad = 0.09, m = M.galv(), valve = false) { const g = new THREE.Group(), up = V(0, 1, 0);
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], d = new THREE.Vector3().subVectors(b, a), o = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, d.length(), 12), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.clone().normalize()); o.castShadow = true; g.add(o);
    const e = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.12, 10, 8), m); e.position.copy(b); g.add(e); const f = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.6, rad * 1.6, 0.04, 12), m); f.position.copy(a).addScaledVector(d, 0.5); f.quaternion.copy(o.quaternion); g.add(f);
    if (valve && i === Math.floor((pts.length - 1) / 2)) { const c = a.clone().addScaledVector(d, 0.3); const stem = cyl(0.02, 0.02, 0.3, M.steel(), c.x, c.y + 0.2, c.z, g, 6); const wh = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 6, 16), M.red()); wh.rotation.x = Math.PI / 2; wh.position.set(c.x, c.y + 0.36, c.z); g.add(wh); box(0.24, 0.02, 0.02, M.red(), c.x, c.y + 0.36, c.z, g); box(0.02, 0.02, 0.24, M.red(), c.x, c.y + 0.36, c.z, g); void stem; } }
  return g; }
// a counterbalance forklift: body, overhead guard, mast, forks, seat, wheels, a beacon
export function makeForklift() { const g = new THREE.Group(), y = M.yellow(), bl = M.frame(), rb = M.rubber();
  rbox(1.1, 0.6, 1.9, 0.08, y, 0, 0.6, -0.1, g, 1); rbox(1.14, 0.7, 0.6, 0.1, mat('b85_zinc', { to: '#2a2a2c', rough: 0.6 }), 0, 0.7, -0.95, g, 1); rbox(0.5, 0.12, 0.5, 0.04, rb, 0, 0.96, -0.3, g); rbox(0.5, 0.5, 0.1, 0.04, rb, 0, 1.2, -0.55, g);
  for (const [x, z] of [[-0.45, 0.62], [0.45, 0.62], [-0.45, -0.72], [0.45, -0.72]]) bar(V(x, 0.9, z), V(x, 2.05, z > 0 ? z - 0.15 : z), 0.05, bl, g); box(1.0, 0.04, 1.3, bl, 0, 2.07, -0.1, g); for (let i = -2; i <= 2; i++) box(0.03, 0.03, 1.3, bl, i * 0.2, 2.1, -0.1, g);
  for (const s of [-1, 1]) { box(0.09, 2.3, 0.12, bl, s * 0.36, 1.3, 0.92, g); const f = box(0.1, 0.04, 1.1, M.steel(), s * 0.26, 0.2, 1.55, g); void f; box(0.1, 0.5, 0.04, M.steel(), s * 0.26, 0.43, 1.02, g); } box(0.8, 0.06, 0.1, bl, 0, 2.42, 0.92, g); box(0.84, 0.5, 0.04, bl, 0, 0.55, 1.0, g);
  for (const [x, z, R] of [[-0.56, 0.55, 0.3], [0.56, 0.55, 0.3], [-0.5, -0.75, 0.24], [0.5, -0.75, 0.24]]) { const w = cyl(R, R, 0.2, rb, x, R, z, g, 16); w.rotation.z = Math.PI / 2; const h = cyl(R * 0.5, R * 0.5, 0.21, y, x, R, z, g, 10); h.rotation.z = Math.PI / 2; }
  { const st = cyl(0.015, 0.015, 0.35, bl, 0, 1.2, 0.2, g, 6); st.rotation.x = -0.5; const wh = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 6, 14), rb); wh.rotation.x = Math.PI / 2 - 0.5; wh.position.set(0, 1.36, 0.12); g.add(wh); const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.3, 0.2), toneMapped: false })); b.material.userData.flat = true; b.position.set(0.35, 2.16, -0.6); g.add(b); }
  return g; }

export function makeWorks() {
  const g = new THREE.Group(); g.name = 'elm_works'; const cols = [], W = 30, D = 8.4, hw = W / 2, zb = -4.6, zf = zb + D, EH = 5.2, RH = 6.6, fr = M.frame(), galv = M.galv(), C = (x0, x1, z0, z1) => cols.push([x0, x1, z0, z1]);
  flat(-hw - 0.5, hw + 9.5, zb - 0.2, zf + 2.2, 0.02, M.conc(), g, 3); for (let x = -hw; x <= hw; x += 3) flat(x - 0.06, x + 0.06, zf + 0.2, zf + 2.0, 0.024, plain('#c8a020', { roughness: 0.8 }), g);
  // portal frames: columns, rafters to a ridge, purlins; corrugated back + end walls + roof (sheet + instanced ribs)
  const ribs = []; const sheet = (ax, ay, az, bx, by, bz, ux, uy, uz) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([ax, ay, az, bx, by, bz, bx + ux, by + uy, bz + uz, ax + ux, ay + uy, az + uz], 3)); const len = Math.hypot(bx - ax, by - ay, bz - az), ul = Math.hypot(ux, uy, uz); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, len / 2, 0, len / 2, ul / 2, 0, ul / 2], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals(); const o = new THREE.Mesh(geo, galv); o.castShadow = true; o.receiveShadow = true; g.add(o); for (let t = 0.2; t < len; t += 0.4) ribs.push([V(ax + (bx - ax) * t / len, ay + (by - ay) * t / len, az + (bz - az) * t / len), V(ux, uy, uz)]); };
  const zc = (zb + zf) / 2;
  for (let x = -hw; x <= hw + 0.01; x += 6) { for (const z of [zb, zf]) box(0.22, EH, 0.22, fr, x, EH / 2, z, g); bar(V(x, EH, zb), V(x, RH, zc), 0.18, fr, g); bar(V(x, EH, zf), V(x, RH, zc), 0.18, fr, g); bar(V(x, EH - 0.1, zb), V(x, EH - 0.1, zf), 0.1, fr, g); if (x < hw) for (const z of [zb, zf]) C(x - 0.15, x + 0.15, z - 0.15, z + 0.15); }
  for (const [z, y] of [[zb, EH], [zf, EH], [zc, RH], [(zb + zc) / 2, (EH + RH) / 2], [(zf + zc) / 2, (EH + RH) / 2]]) box(W, 0.1, 0.1, fr, 0, y, z, g);
  sheet(-hw, 0.05, zb - 0.12, hw, 0.05, zb - 0.12, 0, EH, 0); sheet(-hw - 0.12, 0.05, zf, -hw - 0.12, 0.05, zb, 0, EH, 0); sheet(hw + 0.12, 0.05, zb, hw + 0.12, 0.05, zf, 0, EH, 0);
  sheet(-hw - 0.4, EH + 0.08, zb - 0.5, hw + 0.4, EH + 0.08, zb - 0.5, 0, RH - EH + 0.1, zc - zb + 0.5); sheet(hw + 0.4, EH + 0.08, zf + 0.5, -hw - 0.4, EH + 0.08, zf + 0.5, 0, RH - EH + 0.1, zc - zf - 0.5);
  { const rg = new THREE.CylinderGeometry(0.035, 0.035, 1, 5); rg.translate(0, 0.5, 0); const im = new THREE.InstancedMesh(rg, galv, ribs.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(0, 1, 0); ribs.forEach(([p, u], i) => { q.setFromUnitVectors(up, u.clone().normalize()); m4.compose(p, q, V(1, u.length(), 1)); im.setMatrixAt(i, m4); }); g.add(im); }
  C(-hw, hw, zb - 0.3, zb + 0.05); C(-hw - 0.3, -hw + 0.05, zb, zf); C(hw - 0.05, hw + 0.3, zb, zf);
  // hanging lamps
  for (let x = -hw + 3; x < hw; x += 6) { cyl(0.012, 0.012, 1.2, fr, x, RH - 0.9, zc, g, 5); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 14, 1, true), M.green()); sh.material.side = THREE.DoubleSide; sh.position.set(x, RH - 1.6, zc); g.add(sh); const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.3, 1.6), toneMapped: false })); b.material.userData.flat = true; b.position.set(x, RH - 1.72, zc); g.add(b); }
  // machines along the back wall, a conveyor in front of them carrying boxes, pipes along the wall with valves
  [-11, -6.2, -1.4].forEach((x, i) => { const m = makeMachine(i); m.position.set(x, 0.02, zb + 1.3); g.add(m); C(x - 1.3, x + 1.3, zb + 0.5, zb + 2.1); });
  { const cv = makeConveyor(13); cv.position.set(-6, 0.02, zb + 3.4); g.add(cv); C(-12.5, 0.5, zb + 3.0, zb + 3.8); const r = rng(95); for (let x = -11.5; x < 0; x += 1.1 + r() * 0.9) box(0.5, 0.34, 0.42, M.card(), x, 1.11, zb + 3.4, g, 0.7).rotation.y = 0; }
  g.add(makePipe([V(-hw + 0.4, 4.2, zb + 0.25), V(4, 4.2, zb + 0.25), V(4, 0.6, zb + 0.25)], 0.1, galv, true)); g.add(makePipe([V(-hw + 0.4, 3.8, zb + 0.3), V(-3.5, 3.8, zb + 0.3), V(-3.5, 2.6, zb + 0.3)], 0.07, M.red())); g.add(makePipe([V(-8.5, 3.5, zb + 0.3), V(-8.5, 2.8, zb + 0.3)], 0.07, M.blue())); g.add(makePipe([V(4, 0.6, zb + 0.25), V(hw - 0.4, 0.6, zb + 0.25)], 0.1, galv, true));
  // catwalk across the east bay: tread deck on posts, rails, a stair up
  { const x0 = 5, x1 = hw - 0.5, z0 = zb + 0.5, z1 = zb + 2.1, y = 2.6, tr = M.tread(); box(x1 - x0, 0.06, z1 - z0, tr, (x0 + x1) / 2, y, (z0 + z1) / 2, g, 1.2); for (const x of [x0 + 0.1, (x0 + x1) / 2, x1 - 0.1]) { box(0.1, y, 0.1, fr, x, y / 2, z1 - 0.05, g); C(x - 0.1, x + 0.1, z1 - 0.15, z1 + 0.05); }
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 6) box(0.04, 1.0, 0.04, M.yellow(), x, y + 0.5, z1 - 0.03, g); for (const h of [0.5, 1.0]) box(x1 - x0, 0.04, 0.04, M.yellow(), (x0 + x1) / 2, y + h, z1 - 0.03, g);
    const n = 12; for (let i = 0; i < n; i++) box(0.26, 0.04, 0.8, tr, x0 - 0.13 - i * 0.26, y - (i + 0.5) * (y / n) + 0.1, z1 - 0.45, g, 1.2); for (const s of [0.02, 0.78]) { bar(V(x0, y - 0.05, z1 - 0.85 + s), V(x0 - n * 0.26, 0.05, z1 - 0.85 + s), 0.06, fr, g); bar(V(x0, y + 0.95, z1 - 0.85 + s), V(x0 - n * 0.26, 1.0, z1 - 0.85 + s), 0.04, M.yellow(), g); } C(x0 - n * 0.26, x0, z1 - 0.9, z1);
    // under it: shelving of crates + drums
    for (let i = 0; i < 4; i++) { const c = makeCrate(0.8 + (i % 2) * 0.15, i % 2); c.position.set(x0 + 1.2 + i * 1.5, 0.02, zb + 1.2); c.rotation.y = (i * 0.37) % 0.3; g.add(c); } C(x0 + 0.6, x0 + 6.6, zb + 0.6, zb + 1.8); }
  // pallets with loads in the front bays, a pallet stack, the forklift carrying one
  const r = rng(951); [[2.5, 3.6, 1], [4.2, 3.7, 2], [7.5, 5.2, 1], [9.4, 5.1, 3], [11.4, 5.2, 1], [13.2, 5.0, 2]].forEach(([x, dz, k], i) => { const p = makePallet(k, i + 1); p.position.set(x, 0.02, zb + dz); p.rotation.y = (r() - 0.5) * 0.2; g.add(p); C(x - 0.65, x + 0.65, zb + dz - 0.6, zb + dz + 0.6); });
  for (let i = 0; i < 6; i++) { const p = makePallet(0); p.position.set(-13.4, 0.02 + i * 0.125, zb + 5.6); p.rotation.y = (r() - 0.5) * 0.12; g.add(p); } C(-14.1, -12.7, zb + 5.0, zb + 6.2);
  { const f = makeForklift(); f.position.set(-3.2, 0.02, zf + 0.4); f.rotation.y = 2.2; g.add(f); const p = makePallet(1, 9); p.position.set(-3.2 + Math.sin(2.2) * 1.55, 0.2, zf + 0.4 + Math.cos(2.2) * 1.55); p.rotation.y = 2.2; g.add(p); C(-4.4, -1.2, zf - 1.3, zf + 1.3); }
  // yard to the east: two tanks on a bund with pipes back to the shed, a row of drums, a skip of scrap
  { const bx = hw + 4.8; box(8.4, 0.25, 7.0, M.conc(), bx, 0.125, zc - 0.3, g, 2); const t1 = makeTank(1.5, 5.4, '#d0d2cc'); t1.position.set(bx - 1.9, 0.25, zc - 1.0); g.add(t1); const t2 = makeTank(1.2, 4.2, '#8aa0a8'); t2.position.set(bx + 2.0, 0.25, zc - 1.2); g.add(t2); C(bx - 4.2, bx + 4.2, zc - 3.8, zc + 3.2);
    g.add(makePipe([V(bx - 1.9, 1.0, zc - 1.0), V(bx - 1.9, 1.0, zc + 1.9), V(hw + 0.3, 1.0, zc + 1.9), V(hw + 0.3, 1.0, zb + 0.25)], 0.1, galv, true)); g.add(makePipe([V(bx + 2.0, 0.9, zc - 1.2), V(bx + 2.0, 0.9, zc + 2.3), V(bx - 1.9, 0.9, zc + 2.3)], 0.08, M.rust()));
    for (let i = 0; i < 5; i++) { const d = makeDrum(i); d.position.set(bx - 3.4 + i * 0.64, 0.25, zc + 2.7); g.add(d); } }
  // the sign over the open front
  { const t = canvasT(1024, 128, (x, w, h) => { x.fillStyle = '#1f2c3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8a818'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#f0e8d4'; fitText(x, 'ELM WORKS · PRESSINGS & PACKING', w / 2, 84, w - 60, 64, F.heavy); }); const s = new THREE.Mesh(new THREE.BoxGeometry(11, 1.3, 0.1), [fr, fr, fr, fr, new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), fr]); s.material[4].userData.flat = true; s.position.set(0, EH - 0.1, zf + 0.2); g.add(s); }
  g.userData = { colliders: cols, area: { minX: -hw - 0.4, maxX: hw + 9.4, minZ: zb, maxZ: zf + 2.2 }, noFinish: true };
  return g;
}
