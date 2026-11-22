// Kitchen + bathroom set (89), built from the texture library alone via kit.js. Local frame for every piece: centred
// on its footprint, ground y = 0, front faces +z (so the back goes against a wall).
//   makeFridge({ color })   makeStove()   makeBaseCabinet({ w, wood, top, sink })   makeWallCabinet({ w, wood })
//   makeKitchenTable({ w, d, wood })   makeBathtub()   makeShower()   makeToilet()   makeWashbasin()
//   makeMirror({ w, h })   makeTowelRail({ towel })
//   makeKitchenBathShowroom()  two furnished rooms (kitchen, bathroom). userData: colliders, area (local)
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V, puff, projUV } from './kit.js';
import { WOODS, makeChair, makeRug, makeLamp } from './furniture88.js';
import { F, fitText } from '../fonts.js';

const wood = (k) => { const [t, c] = WOODS[k] || WOODS.oak; return mat(t, { to: c, rough: 0.55 }); };
const enamel = (c = '#f2f1ec') => plain(c, { roughness: 0.22, metalness: 0.05 });
const steel = () => mat('gf_galv', { to: '#a8acb0', rough: 0.3, metal: 0.7 });
const chrome = () => plain('#dfe3e6', { roughness: 0.12, metalness: 0.9 });
const black = () => mat('b80_blackplastic', { rough: 0.35 });
const done = (g, x0, x1, z0, z1) => { g.userData.collider = [x0, x1, z0, z1]; return g; };
// a bent tap: riser + spout as a quarter-torus + nozzle
function tap(parent, x, y, z, h = 0.22, reach = 0.14) { const c = chrome(); cyl(0.022, 0.026, 0.03, c, x, y + 0.015, z, parent, 14); cyl(0.011, 0.011, h, c, x, y + h / 2, z, parent, 10);
  const t = new THREE.Mesh(new THREE.TorusGeometry(reach / 2, 0.011, 8, 14, Math.PI), c); t.rotation.y = Math.PI / 2; t.position.set(x, y + h, z + reach / 2); parent.add(t); cyl(0.013, 0.011, 0.04, c, x, y + h - 0.02, z + reach, parent, 10);
  const lv = bar(V(x + 0.03, y + 0.05, z), V(x + 0.09, y + 0.09, z), 0.014, c, parent); return lv; }

export function makeFridge({ color = '#f0efe9', notes = true } = {}) {
  const g = new THREE.Group(); g.name = 'fridge'; const e = enamel(color), W = 0.7, D = 0.68, H = 1.7;
  rbox(W, H - 0.05, D - 0.06, 0.02, e, 0, 0.05 + (H - 0.05) / 2, -0.03, g); box(W - 0.04, 0.05, D - 0.1, black(), 0, 0.025, -0.03, g);
  // freezer door on top, fridge door below, a dark seal line between; long handles
  rbox(W, 0.5, 0.055, 0.018, e, 0, H - 0.25, D / 2 - 0.03, g); rbox(W, H - 0.62, 0.055, 0.018, e, 0, 0.06 + (H - 0.62) / 2, D / 2 - 0.03, g); box(W - 0.02, 0.012, 0.04, plain('#3a3a3c'), 0, H - 0.507, D / 2 - 0.035, g);
  for (const [y0, y1] of [[H - 0.42, H - 0.1], [H - 1.1, H - 0.6]]) { bar(V(-W / 2 + 0.06, y0, D / 2 + 0.03), V(-W / 2 + 0.06, y1, D / 2 + 0.03), 0.022, steel(), g); for (const y of [y0 + 0.02, y1 - 0.02]) box(0.02, 0.02, 0.035, steel(), -W / 2 + 0.06, y, D / 2 + 0.012, g); }
  if (notes) { const r = rng(4); const note = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#fff6a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a3a6a'; fitText(x, 'milk', w / 2, 34, w - 20, 26, F.hand || F.label); fitText(x, 'eggs', w / 2, 66, w - 20, 26, F.hand || F.label); fitText(x, 'call Mom', w / 2, 98, w - 20, 24, F.hand || F.label); });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshStandardMaterial({ map: note, roughness: 0.8 })); n.position.set(0.12, H - 0.85, D / 2 - 0.001); n.rotation.z = 0.06; g.add(n);
    for (let i = 0; i < 5; i++) cyl(0.014, 0.014, 0.008, plain(['#c8281e', '#2a6ad8', '#f2c21a', '#2a8a4a', '#e8742a'][i], { roughness: 0.4 }), -0.05 + r() * 0.3, H - 0.72 - r() * 0.5, D / 2 + 0.002, g, 12).rotation.x = Math.PI / 2; }
  return done(g, -W / 2, W / 2, -D / 2, D / 2);
}

export function makeStove() {
  const g = new THREE.Group(); g.name = 'stove'; const e = enamel(), W = 0.6, D = 0.62, H = 0.9;
  rbox(W, H - 0.06, D, 0.012, e, 0, 0.06 + (H - 0.06) / 2, 0, g); box(W - 0.04, 0.06, D - 0.06, black(), 0, 0.03, -0.01, g);
  box(W, 0.012, D, plain('#141416', { roughness: 0.12, metalness: 0.3 }), 0, H + 0.006, 0, g);   // glass cooktop
  for (const [x, z, r] of [[-0.15, -0.14, 0.085], [0.15, -0.14, 0.07], [-0.15, 0.14, 0.07], [0.15, 0.14, 0.085]]) { for (const k of [1, 0.66, 0.34]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * k, 0.006, 6, 24), plain('#2e2e30', { roughness: 0.5, metalness: 0.5 })); t.rotation.x = Math.PI / 2; t.position.set(x, H + 0.016, z); g.add(t); } }
  box(W, 0.14, 0.05, e, 0, H + 0.07, -D / 2 + 0.025, g);   // back panel with knobs + clock
  for (let i = 0; i < 4; i++) cyl(0.02, 0.022, 0.025, black(), -0.2 + i * 0.09, H + 0.075, -D / 2 + 0.06, g, 14).rotation.x = Math.PI / 2;
  { const ct = canvasT(96, 40, (x, w, h) => { x.fillStyle = '#061008'; x.fillRect(0, 0, w, h); x.fillStyle = '#4af08a'; fitText(x, '6:12', w / 2, 22, w - 10, 28, F.digital || F.label, { weight: 700 }); }); const c = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.036), new THREE.MeshBasicMaterial({ map: ct, toneMapped: false })); c.position.set(0.2, H + 0.075, -D / 2 + 0.051); g.add(c); }
  // oven door: dark glass window, bar handle; a drawer below
  box(W - 0.04, 0.46, 0.02, e, 0, 0.56, D / 2 + 0.008, g); box(W - 0.2, 0.26, 0.006, plain('#101114', { roughness: 0.1, metalness: 0.4 }), 0, 0.54, D / 2 + 0.02, g); bar(V(-W / 2 + 0.06, 0.75, D / 2 + 0.05), V(W / 2 - 0.06, 0.75, D / 2 + 0.05), 0.022, steel(), g);
  box(W - 0.04, 0.16, 0.02, e, 0, 0.19, D / 2 + 0.008, g); bar(V(-0.12, 0.22, D / 2 + 0.03), V(0.12, 0.22, D / 2 + 0.03), 0.016, steel(), g);
  // a pot on the back burner
  cyl(0.085, 0.08, 0.1, steel(), -0.15, H + 0.066, -0.14, g, 20); cyl(0.088, 0.088, 0.008, steel(), -0.15, H + 0.12, -0.14, g, 20); cyl(0.012, 0.012, 0.02, black(), -0.15, H + 0.134, -0.14, g, 10); for (const s of [-1, 1]) box(0.04, 0.012, 0.02, black(), -0.15 + s * 0.1, H + 0.1, -0.14, g);
  return done(g, -W / 2, W / 2, -D / 2, D / 2);
}

// base cabinet with a worktop; sink: a stainless bowl let into the top with a tap
export function makeBaseCabinet({ w = 0.8, wood: wk = 'white', top = ['b82_quartz', '#b8b0a4'], sink = false, drawers = false } = {}) {
  const g = new THREE.Group(); g.name = sink ? 'sink_unit' : 'base_cabinet'; const m = wood(wk), D = 0.6, H = 0.88, tm = mat(top[0], { to: top[1], rough: 0.35 });
  box(w, H - 0.1, D - 0.04, m, 0, 0.1 + (H - 0.1) / 2, -0.02, g, 0.9); box(w, 0.1, D - 0.1, black(), 0, 0.05, -0.05, g);
  if (sink) { const bw = Math.min(0.5, w - 0.2), bd = 0.36; for (const s of [-1, 1]) { box((w - bw) / 2 + 0.02, 0.035, D + 0.03, tm, s * (bw / 2 + (w - bw) / 4 + 0.01), H + 0.0175, 0, g, 0.6); } box(bw, 0.035, (D + 0.03 - bd) / 2, tm, 0, H + 0.0175, -(bd / 2 + (D + 0.03 - bd) / 4) + 0.0, g, 0.6); box(bw, 0.035, (D + 0.03 - bd) / 2, tm, 0, H + 0.0175, bd / 2 + (D + 0.03 - bd) / 4, g, 0.6);
    const st = steel(); st.side = THREE.DoubleSide; box(bw, 0.006, bd, st, 0, H - 0.15, 0, g); for (const s of [-1, 1]) { box(0.006, 0.18, bd, st, s * bw / 2, H - 0.06, 0, g); box(bw, 0.18, 0.006, st, 0, H - 0.06, s * bd / 2, g); } cyl(0.025, 0.025, 0.004, plain('#444', { metalness: 0.6 }), 0, H - 0.145, 0, g, 12);
    tap(g, 0, H + 0.035, -bd / 2 - 0.05, 0.24, 0.16); }
  else box(w, 0.035, D + 0.03, tm, 0, H + 0.0175, 0, g, 0.6);
  const n = w > 0.65 ? 2 : 1, dw = w / n - 0.012, fr = wood(wk);
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (w / n);
    if (drawers) for (let k = 0; k < 3; k++) { const dh = (H - 0.16) / 3 - 0.01, y = 0.13 + dh / 2 + k * (dh + 0.01); rbox(dw, dh, 0.02, 0.004, fr, x, y, D / 2 - 0.03, g, 0.9, 1); bar(V(x - 0.07, y + dh * 0.2, D / 2 - 0.012), V(x + 0.07, y + dh * 0.2, D / 2 - 0.012), 0.012, steel(), g); }
    else { rbox(dw, H - 0.16, 0.02, 0.004, fr, x, 0.13 + (H - 0.16) / 2, D / 2 - 0.03, g, 0.9, 1); box(dw - 0.1, H - 0.28, 0.006, m, x, 0.13 + (H - 0.16) / 2, D / 2 - 0.017, g, 0.9); bar(V(x + (n === 1 ? 1 : (i ? -1 : 1)) * (dw / 2 - 0.035), H - 0.26, D / 2 - 0.008), V(x + (n === 1 ? 1 : (i ? -1 : 1)) * (dw / 2 - 0.035), H - 0.12, D / 2 - 0.008), 0.012, steel(), g); } }
  return done(g, -w / 2, w / 2, -D / 2, D / 2 + 0.02);
}
export function makeWallCabinet({ w = 0.8, wood: wk = 'white' } = {}) {   // hangs with its bottom at y = 1.45
  const g = new THREE.Group(); g.name = 'wall_cabinet'; const m = wood(wk), D = 0.34, H = 0.7, Y = 1.45;
  box(w, H, D, m, 0, Y + H / 2, -0.13, g, 0.9); const n = w > 0.65 ? 2 : 1, dw = w / n - 0.012;
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (w / n); rbox(dw, H - 0.02, 0.02, 0.004, m, x, Y + H / 2, 0.05, g, 0.9, 1); box(dw - 0.1, H - 0.14, 0.006, m, x, Y + H / 2, 0.062, g, 0.9); bar(V(x + (n === 1 ? 1 : (i ? -1 : 1)) * (dw / 2 - 0.035), Y + 0.06, 0.07), V(x + (n === 1 ? 1 : (i ? -1 : 1)) * (dw / 2 - 0.035), Y + 0.2, 0.07), 0.012, steel(), g); }
  return g;
}
export function makeKitchenTable({ w = 1.2, d = 0.8, wood: wk = 'pine' } = {}) {
  const g = new THREE.Group(); g.name = 'kitchen_table'; const m = wood(wk);
  rbox(w, 0.035, d, 0.012, m, 0, 0.74, 0, g, 0.9, 1); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = cyl(0.028, 0.02, 0.72, m, sx * (w / 2 - 0.08), 0.36, sz * (d / 2 - 0.08), g, 10); } for (const s of [-1, 1]) { box(w - 0.2, 0.07, 0.02, m, 0, 0.68, s * (d / 2 - 0.08), g, 0.9); box(0.02, 0.07, d - 0.2, m, s * (w / 2 - 0.08), 0.68, 0, g, 0.9); }
  // a fruit bowl + two place mats
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('fb_cotton', { to: '#3a5a6a', rough: 0.3, side: THREE.DoubleSide })); bowl.position.set(0, 0.885, 0); bowl.scale.y = 0.6; g.add(bowl);
  [['#c8281e', -0.04, 0.02], ['#e8b01e', 0.05, -0.02], ['#c8281e', 0.0, 0.06], ['#7aa02a', -0.01, -0.06]].forEach(([c, x, z]) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), plain(c, { roughness: 0.4 })); f.position.set(x, 0.86, z); g.add(f); });
  for (const s of [-1, 1]) flat(s * 0.38 - 0.17, s * 0.38 + 0.17, -0.12, 0.12, 0.759, mat('fb_plaid_red', { to: '#a8483a' }), g, 0.25);
  return done(g, -w / 2, w / 2, -d / 2, d / 2);
}

// ---- bathroom
export function makeBathtub({ water = true } = {}) {   // 1.6 x 0.72 m, long side along x, taps at the -x end
  const g = new THREE.Group(); g.name = 'bathtub'; const L = 1.6, W = 0.72, H = 0.56, e = enamel('#f6f5f0'); e.side = THREE.DoubleSide;
  const rr = (w, d, r) => { const s = new THREE.Shape(), hw = w / 2, hd = d / 2; s.moveTo(-hw + r, -hd); s.lineTo(hw - r, -hd); s.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0); s.lineTo(hw, hd - r); s.absarc(hw - r, hd - r, r, 0, Math.PI / 2); s.lineTo(-hw + r, hd); s.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI); s.lineTo(-hw, -hd + r); s.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5); return s; };
  const outer = rr(L, W, 0.1); outer.holes.push(rr(L - 0.16, W - 0.16, 0.16));
  const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: H - 0.06, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 10 }), e); wall.rotation.x = -Math.PI / 2; wall.position.y = 0.06; wall.castShadow = true; g.add(wall);
  const floor = new THREE.Mesh(new THREE.ExtrudeGeometry(rr(L - 0.1, W - 0.1, 0.14), { depth: 0.05, bevelEnabled: false, curveSegments: 10 }), e); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.08; g.add(floor);
  box(L - 0.1, 0.06, W - 0.1, black(), 0, 0.03, 0, g);
  if (water) { const wtr = new THREE.Mesh(new THREE.ShapeGeometry(rr(L - 0.17, W - 0.17, 0.15), 10), new THREE.MeshPhysicalMaterial({ color: '#bfe3ea', roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1 })); wtr.rotation.x = -Math.PI / 2; wtr.position.y = H - 0.14; g.add(wtr); }
  const c = chrome(); cyl(0.014, 0.014, 0.12, c, -L / 2 + 0.05, H + 0.06, 0, g, 10); bar(V(-L / 2 + 0.05, H + 0.11, 0), V(-L / 2 + 0.2, H + 0.09, 0), 0.026, c, g); for (const s of [-1, 1]) { cyl(0.012, 0.012, 0.07, c, -L / 2 + 0.05, H + 0.035, s * 0.13, g, 8); const k = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), plain(s > 0 ? '#c83a32' : '#3a6ac8', { roughness: 0.3 })); k.position.set(-L / 2 + 0.05, H + 0.08, s * 0.13); g.add(k); }
  cyl(0.02, 0.02, 0.004, plain('#555', { metalness: 0.6 }), -L / 2 + 0.3, 0.134, 0, g, 12);
  // a bar of soap + a rubber duck on the rim
  rbox(0.08, 0.025, 0.05, 0.012, plain('#e8d8f0', { roughness: 0.5 }), L / 2 - 0.3, H + 0.02, W / 2 - 0.04, g); { const d = new THREE.Group(); d.position.set(0.2, H + 0.005, -W / 2 + 0.04); g.add(d); const y = plain('#f2c81a', { roughness: 0.4 }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), y); b.scale.set(1.2, 0.8, 0.9); b.position.y = 0.028; d.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), y); h.position.set(0.028, 0.062, 0); d.add(h); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.02, 8), plain('#e8742a')); bk.rotation.z = -Math.PI / 2; bk.position.set(0.055, 0.06, 0); d.add(bk); }
  return done(g, -L / 2, L / 2, -W / 2, W / 2);
}
export function makeShower() {   // 0.9 m corner cubicle: back to -z, left side to -x; glass on +x and +z, door ajar
  const g = new THREE.Group(); g.name = 'shower'; const S = 0.9, H = 2.0, st = steel(), c = chrome();
  const glass = new THREE.MeshPhysicalMaterial({ color: '#d8ece8', roughness: 0.08, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 });
  rbox(S, 0.08, S, 0.02, enamel(), 0, 0.04, 0, g); cyl(0.03, 0.03, 0.004, plain('#666', { metalness: 0.7 }), 0, 0.082, 0, g, 14);
  for (const [x, z] of [[S / 2, -S / 2], [S / 2, S / 2], [-S / 2, S / 2]]) bar(V(x, 0.08, z), V(x, H, z), 0.03, st, g); bar(V(S / 2, H, -S / 2), V(S / 2, H, S / 2), 0.03, st, g); bar(V(-S / 2, H, S / 2), V(S / 2, H, S / 2), 0.03, st, g);
  const pane = (w, x, z, ry) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, H - 0.12), glass); p.position.set(x, 0.08 + (H - 0.12) / 2, z); p.rotation.y = ry; p.renderOrder = 3; g.add(p); return p; };
  pane(S - 0.04, S / 2, 0, Math.PI / 2); { const d = new THREE.Group(); d.position.set(-S / 2, 0, S / 2); d.rotation.y = 0.55; g.add(d); const p = new THREE.Mesh(new THREE.PlaneGeometry(S - 0.06, H - 0.12), glass); p.position.set((S - 0.06) / 2, 0.08 + (H - 0.12) / 2, 0); p.renderOrder = 3; d.add(p); bar(V(S - 0.12, 0.95, 0.03), V(S - 0.12, 1.2, 0.03), 0.018, c, d); }
  // riser, head, mixer, hose-less; a shelf with two bottles
  cyl(0.011, 0.011, 1.2, c, -S / 2 + 0.05, 1.4, -S / 2 + 0.05, g, 10); bar(V(-S / 2 + 0.05, 2.0, -S / 2 + 0.05), V(-S / 2 + 0.3, 2.02, -S / 2 + 0.3), 0.02, c, g); cyl(0.1, 0.1, 0.02, c, -S / 2 + 0.32, 2.0, -S / 2 + 0.32, g, 20); cyl(0.045, 0.045, 0.04, c, -S / 2 + 0.05, 1.05, -S / 2 + 0.09, g, 14).rotation.x = Math.PI / 2; bar(V(-S / 2 + 0.05, 1.05, -S / 2 + 0.11), V(-S / 2 + 0.13, 1.0, -S / 2 + 0.13), 0.014, c, g);
  box(0.28, 0.012, 0.1, st, 0.1, 1.15, -S / 2 + 0.06, g); cyl(0.028, 0.028, 0.16, plain('#3a8a6a', { roughness: 0.35 }), 0.04, 1.236, -S / 2 + 0.06, g, 12); cyl(0.025, 0.03, 0.12, plain('#e8e0d0', { roughness: 0.35 }), 0.16, 1.216, -S / 2 + 0.06, g, 12);
  g.userData.colliders = [[S / 2 - 0.03, S / 2 + 0.03, -S / 2, S / 2]]; return g;
}
export function makeToilet() {
  const g = new THREE.Group(); g.name = 'toilet'; const e = enamel('#f6f5f0');
  const prof = [[0.1, 0], [0.13, 0.04], [0.11, 0.2], [0.17, 0.34], [0.2, 0.4], [0.2, 0.42]].map(([a, b]) => new THREE.Vector2(a, b)); const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), e); bowl.scale.set(0.95, 1, 1.3); bowl.position.set(0, 0, 0.1); bowl.castShadow = true; g.add(bowl);
  const seat = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.04, 8, 28), e); seat.rotation.x = Math.PI / 2; seat.scale.set(0.95, 1.3, 0.35); seat.position.set(0, 0.43, 0.1); g.add(seat);
  const wtr = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshPhysicalMaterial({ color: '#bfe3ea', roughness: 0.05, transparent: true, opacity: 0.6 })); wtr.rotation.x = -Math.PI / 2; wtr.scale.y = 1.3; wtr.position.set(0, 0.3, 0.1); g.add(wtr);
  { const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.022, 28), e); lid.scale.set(0.95, 1, 1.3); lid.rotation.x = Math.PI / 2 - 0.12; lid.position.set(0, 0.67, -0.14); g.add(lid); }
  rbox(0.42, 0.38, 0.18, 0.03, e, 0, 0.62, -0.26, g); rbox(0.44, 0.03, 0.2, 0.012, e, 0, 0.825, -0.26, g); box(0.22, 0.42, 0.2, e, 0, 0.21, -0.2, g); bar(V(-0.2, 0.74, -0.165), V(-0.12, 0.74, -0.165), 0.016, chrome(), g);
  return done(g, -0.22, 0.22, -0.36, 0.38);
}
export function makeWashbasin() {
  const g = new THREE.Group(); g.name = 'washbasin'; const e = enamel('#f6f5f0'); e.side = THREE.DoubleSide;
  const ped = new THREE.Mesh(new THREE.LatheGeometry([[0.11, 0], [0.085, 0.1], [0.07, 0.5], [0.1, 0.7]].map(([a, b]) => new THREE.Vector2(a, b)), 18), e); ped.position.z = -0.02; ped.castShadow = true; g.add(ped);
  const basin = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), e); basin.scale.set(1, 0.6, 0.8); basin.position.set(0, 0.85, 0.04); basin.castShadow = true; g.add(basin);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.022, 8, 28), e); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 0.8, 1); rim.position.set(0, 0.85, 0.04); g.add(rim); box(0.5, 0.05, 0.12, e, 0, 0.85, -0.2, g);
  tap(g, 0, 0.875, -0.2, 0.1, 0.1); cyl(0.016, 0.016, 0.004, plain('#555', { metalness: 0.6 }), 0, 0.7, 0.04, g, 10);
  rbox(0.07, 0.022, 0.045, 0.01, plain('#c8e0c8', { roughness: 0.5 }), 0.17, 0.886, -0.2, g);
  return done(g, -0.28, 0.28, -0.28, 0.28);
}
export function makeMirror({ w = 0.6, h = 0.8, frame = 'white' } = {}) {   // hangs flat on a wall: centre at y = 1.5
  const g = new THREE.Group(); g.name = 'mirror'; box(w + 0.06, h + 0.06, 0.025, wood(frame), 0, 1.5, 0, g, 0.9);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: '#aebcc4', metalness: 0.55, roughness: 0.12, envMapIntensity: 2 })); gl.position.set(0, 1.5, 0.014); g.add(gl); return g;
}
export function makeTowelRail({ towel = ['fb_fleece', '#e8dcc0'], w = 0.6 } = {}) {   // on a wall at y = 1.1
  const g = new THREE.Group(); g.name = 'towel_rail'; const c = chrome(); bar(V(-w / 2, 1.1, 0.07), V(w / 2, 1.1, 0.07), 0.016, c, g); for (const s of [-1, 1]) bar(V(s * w / 2, 1.1, 0), V(s * w / 2, 1.1, 0.07), 0.014, c, g);
  const t = mat(towel[0], { to: towel[1], rough: 1, side: THREE.DoubleSide }); for (const [dz, len] of [[0.082, 0.55], [0.058, 0.4]]) { const pg = new THREE.PlaneGeometry(w - 0.14, len, 6, 6); const p = pg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 22) * 0.006); pg.computeVertexNormals(); projUV(pg, 0.3); const m = new THREE.Mesh(pg, t); m.position.set(0, 1.1 - len / 2, dz); m.castShadow = true; g.add(m); }
  box(w - 0.14, 0.03, 0.03, t, 0, 1.105, 0.07, g, 0.3); return g;
}

// ---- Nestwell Kitchen & Bath: two rooms, 12 x 9 m, open front at -z, back wall at +z
export function makeKitchenBathShowroom() {
  const g = new THREE.Group(); g.name = 'kitchen_bath_showroom'; const cols = [], W = 12, D = 9, H = 3.1, x0 = -W / 2, z0 = -D / 2, FY = 0.15;
  const put = (o, x, z, ry = 0) => { o.position.set(x, FY, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const cs = Math.cos(ry), sn = Math.sin(ry); const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([px, pz]) => [x + px * cs + pz * sn, z - px * sn + pz * cs]); cols.push([Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]); } return o; };
  const wall = mat('sg_plaster', { to: '#d8d2c4', rough: 0.9 });
  box(W, FY, D, mat('lot_concrete', { to: '#8a8882' }), 0, FY / 2, 0, g, 2);
  flat(x0, 0, z0, -z0, FY + 0.002, mat('b86_floortile', { to: '#a89a84', rough: 0.4 }), g, 1.2); flat(0, -x0, z0, -z0, FY + 0.002, mat('ab_tile', { to: '#8e8a80', rough: 0.4 }), g, 1.0);
  box(W, H, 0.2, wall, 0, FY + H / 2, D / 2 - 0.1, g, 2.4); for (const s of [-1, 1]) box(0.2, H, D, wall, s * (W / 2 - 0.1), FY + H / 2, 0, g, 2.4);
  box(0.14, H, 3.6, wall, 0, FY + H / 2, D / 2 - 1.8, g, 2.4); box(0.14, H - 2.2, D - 3.6, wall, 0, FY + 2.2 + (H - 2.2) / 2, -1.8, g, 2.4); cols.push([-0.1, 0.1, D / 2 - 3.6, D / 2]);
  box(W + 0.5, 0.22, D + 0.6, mat('lot_concrete', { to: '#5a5a5c' }), 0, FY + H + 0.11, 0, g, 2); flat(x0 + 0.2, -x0 - 0.2, z0, -z0 - 0.2, FY + H - 0.002, mat('b82_speckle', { to: '#e4e0d8', side: THREE.DoubleSide }), g, 1.2);
  for (const x of [x0 + 0.15, 0, -x0 - 0.15]) box(0.3, H, 0.3, wall, x, FY + H / 2, z0 + 0.15, g, 2.4);
  const st = canvasT(1024, 160, (x, w, h) => { x.fillStyle = '#23302a'; x.fillRect(0, 0, w, h); x.fillStyle = '#efe6d0'; fitText(x, 'Nestwell Kitchen & Bath', w / 2, 86, w - 80, 92, F.script || F.heavy); });
  { const sm = new THREE.MeshStandardMaterial({ map: st, emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 0.55, roughness: 0.6 }), dk = plain('#23302a'); const s = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.0, 0.12), [dk, dk, dk, dk, dk, sm]); s.position.set(0, FY + H + 0.75, z0 - 0.05); g.add(s); }
  cols.push([x0, -x0, D / 2 - 0.25, D / 2], [x0, x0 + 0.25, z0, D / 2], [-x0 - 0.25, -x0, z0, D / 2]);
  for (const x of [x0 + 3, -x0 - 3]) { const l = new THREE.PointLight('#fff0dc', 14, 11, 1.5); l.position.set(x, FY + H - 0.4, 0.5); g.add(l); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.9), toneMapped: false })); d.position.set(x, FY + H - 0.03, 0.5); g.add(d); }
  // ---- kitchen (west room): a run along the back wall (fridge, drawers, sink, stove, cupboard) with wall cabinets and a
  // subway-tile splashback; a table with four chairs
  { const bz = D / 2 - 0.2 - 0.31, PI = Math.PI; let x = x0 + 0.2 + 0.36;
    put(makeFridge(), x, bz - 0.03, PI); x += 0.36 + 0.4; put(makeBaseCabinet({ w: 0.8, drawers: true }), x, bz, PI); put(makeWallCabinet({ w: 0.8 }), x, D / 2 - 0.2 - 0.3 + 0.13, PI); x += 0.4 + 0.5;
    put(makeBaseCabinet({ w: 1.0, sink: true }), x, bz, PI); x += 0.5 + 0.3; put(makeStove(), x, bz - 0.01, PI); x += 0.3 + 0.4; put(makeBaseCabinet({ w: 0.8 }), x, bz, PI); put(makeWallCabinet({ w: 0.8 }), x, D / 2 - 0.2 - 0.3 + 0.13, PI);
    const sp = new THREE.PlaneGeometry(3.6, 0.55); projUV(sp, 0.6); const spm = new THREE.Mesh(sp, mat('subway_tile', { rough: 0.25 })); spm.position.set(x0 + 0.2 + 0.72 + 1.8, FY + 0.88 + 0.3, D / 2 - 0.205); spm.rotation.y = PI; g.add(spm);
    // extractor hood over the stove: a steel box + chimney
    const hx = x0 + 0.2 + 0.72 + 0.8 + 1.0 + 0.3; box(0.6, 0.12, 0.45, steel(), hx, FY + 1.62, D / 2 - 0.2 - 0.225, g); box(0.25, 0.9, 0.22, steel(), hx, FY + 2.13, D / 2 - 0.2 - 0.11, g);
    // on the worktop: a kettle, a toaster, a knife block
    const wy = FY + 0.915; cyl(0.07, 0.085, 0.16, steel(), x0 + 1.5, wy + 0.08, bz + 0.05, g, 18); cyl(0.02, 0.02, 0.03, black(), x0 + 1.5, wy + 0.175, bz + 0.05, g, 10); bar(V(x0 + 1.58, wy + 0.05, bz + 0.05), V(x0 + 1.6, wy + 0.16, bz + 0.05), 0.016, black(), g);
    rbox(0.26, 0.17, 0.15, 0.03, steel(), x0 + 4.15, wy + 0.085, bz + 0.03, g); for (const s of [-1, 1]) box(0.11, 0.012, 0.025, plain('#111'), x0 + 4.15 + s * 0.06, wy + 0.171, bz + 0.03, g);
    put(makeKitchenTable({ wood: 'pine' }), x0 + 3, -0.6); for (const [dx, dz, ry] of [[-0.35, -0.72, 0], [0.35, -0.72, 0], [-0.35, 0.72, PI], [0.35, 0.72, PI]]) put(makeChair({ wood: 'pine', seat: ['fb_plaid_red', '#a8483a'] }), x0 + 3 + dx, -0.6 + dz, ry + PI);
    put(makeRug({ w: 2.4, d: 2.0, fabric: ['fb_plaid_navy', '#3a5a4a'], border: '#d8d0b8' }), x0 + 3, -0.6); }
  // ---- bathroom (east room): tiled dado on the back wall, tub along it, shower in the corner, toilet, basin + mirror
  { const PI = Math.PI, bx = -x0 - 3; const tile = mat('b86_walltile', { rough: 0.25 });
    const dado = new THREE.PlaneGeometry(5.7, 1.5); projUV(dado, 0.9); const dm = new THREE.Mesh(dado, tile); dm.position.set(bx, FY + 0.75, D / 2 - 0.205); dm.rotation.y = PI; g.add(dm);
    const side = new THREE.PlaneGeometry(4.0, 1.5); projUV(side, 0.9); const sm2 = new THREE.Mesh(side, tile); sm2.position.set(-x0 - 0.205, FY + 0.75, D / 2 - 2.2); sm2.rotation.y = -PI / 2; g.add(sm2);
    put(makeBathtub(), bx - 0.9, D / 2 - 0.2 - 0.38, 0); put(makeShower(), -x0 - 0.2 - 0.47, D / 2 - 0.2 - 0.47, -PI / 2);
    put(makeToilet(), -x0 - 0.2 - 0.38, 1.9, -PI / 2); put(makeWashbasin(), -x0 - 0.2 - 0.3, 0.5, -PI / 2); { const m = makeMirror({}); m.position.set(-x0 - 0.215, FY, 0.5); m.rotation.y = -PI / 2; g.add(m); }
    { const t = makeTowelRail({}); t.position.set(0.075, FY, D / 2 - 1.6); t.rotation.y = PI / 2; g.add(t); }
    put(makeRug({ w: 1.1, d: 0.7, fabric: ['fb_fleece', '#6a9aa8'], border: '#e8e4d8' }), bx - 0.9, D / 2 - 1.5);
    // toilet-roll holder + a small bin
    cyl(0.055, 0.055, 0.11, plain('#f4f2ea', { roughness: 0.9 }), -x0 - 0.3, FY + 0.7, 1.35, g, 16).rotation.x = Math.PI / 2; cyl(0.11, 0.09, 0.26, steel(), -x0 - 0.5, FY + 0.13, 2.6, g, 16); }
  g.userData = { colliders: cols, area: { minX: x0 + 0.3, maxX: -x0 - 0.3, minZ: z0 - 1.5, maxZ: D / 2 - 0.3 }, floorY: FY };
  return g;
}
