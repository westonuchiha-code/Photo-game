// Home furniture set (88), built from the texture library alone via kit.js. Every piece takes options, so one maker
// gives many variants (sizes, woods, fabrics, colours) for furnishing any home.
// Local frame for every piece: centred on its footprint, ground y = 0, front faces +z.
//   makeBed({ size: 'single' | 'double', frame: 'wood' | 'metal', wood, blanket: [texture, colour], throwCol })
//   makeNightstand({ wood })      makeWardrobe({ w, wood })      makeDesk({ w, wood })      makeChair({ wood, seat })
//   makeSofa({ seats: 1 | 2 | 3, fabric: [texture, colour] })    makeCoffeeTable({ wood })
//   makeTV({ kind: 'crt' | 'flat', w })  (+ makeTVStand({ w, wood }))
//   makeLamp({ kind: 'floor' | 'table', shade, light })          makeBookshelf({ w, h, wood, seed })
//   makeRug({ w, d, fabric: [texture, colour], border })
//   makeFurnitureShowroom()  "Nestwell Home": three furnished rooms (bedroom, living room, study) to walk through
//     userData: colliders [[x0, x1, z0, z1]], area (local rect)
// each piece: userData.collider = [x0, x1, z0, z1] (local)
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V, puff, projUV } from './kit.js';
import { F, fitText } from '../fonts.js';

// woods: [texture, target colour] (the plank photos recoloured)
export const WOODS = { oak: ['laminate_oak', '#b88a5a'], walnut: ['dn_walnut', '#5a3a26'], pine: ['wood_floor', '#d0aa78'], cherry: ['wd_plank_a', '#7a3a22'], white: ['sg_plaster', '#e6e2d8'], black: ['wd_plank_b', '#2a2624'] };
const wood = (k) => { const [t, c] = WOODS[k] || WOODS.oak; return mat(t, { to: c, rough: 0.55 }); };
const cloth = ([t, c], rough = 0.95) => mat(t, { to: c, rough });
const steel = () => mat('gf_galv', { to: '#8a8e92', rough: 0.4, metal: 0.6 });
const brass = () => mat('i7_brass', { rough: 0.35, metal: 0.7 });
const done = (g, x0, x1, z0, z1) => { g.userData.collider = [x0, x1, z0, z1]; return g; };

export function makeBed({ size = 'double', frame = 'wood', wood: wk = 'walnut', blanket = ['b82_chenille', '#4a6a8a'], throwCol = ['fb_plaid_red', '#a8483a'], pillows = ['fb_cotton', '#ece8e0'] } = {}) {
  const g = new THREE.Group(); g.name = 'bed_' + size; const W = size === 'single' ? 0.95 : 1.5, L = 2.0, hw = W / 2;
  const fm = frame === 'metal' ? steel() : wood(wk);
  if (frame === 'metal') {   // tube frame: head + foot rails with bars, side rails
    for (const [z, h] of [[-L / 2, 1.05], [L / 2, 0.7]]) { for (const s of [-1, 1]) cyl(0.022, 0.022, h, fm, s * hw, h / 2, z, g, 10); bar(V(-hw, h, z), V(hw, h, z), 0.04, fm, g); bar(V(-hw, 0.42, z), V(hw, 0.42, z), 0.03, fm, g); for (let x = -hw + 0.14; x < hw; x += 0.14) cyl(0.009, 0.009, h - 0.42, fm, x, 0.42 + (h - 0.42) / 2, z, g, 6); for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), brass()); k.position.set(s * hw, h + 0.02, z); g.add(k); } }
    for (const s of [-1, 1]) box(0.04, 0.06, L, fm, s * hw, 0.3, 0, g, 0.8);
  } else {   // panel headboard with a cap rail, low footboard, side rails, block feet
    box(W + 0.08, 1.0, 0.05, fm, 0, 0.5, -L / 2 - 0.025, g, 0.9); box(W + 0.14, 0.05, 0.09, fm, 0, 1.025, -L / 2 - 0.025, g, 0.9); box(W - 0.2, 0.42, 0.012, wood(wk === 'walnut' ? 'cherry' : wk), 0, 0.72, -L / 2 + 0.006, g, 0.9);
    box(W + 0.08, 0.42, 0.05, fm, 0, 0.21, L / 2 + 0.025, g, 0.9); for (const s of [-1, 1]) box(0.04, 0.2, L, fm, s * (hw + 0.02), 0.26, 0, g, 0.9);
    for (const s of [-1, 1]) for (const z of [-L / 2 + 0.05, L / 2 - 0.05]) box(0.07, 0.16, 0.07, fm, s * hw, 0.08, z, g);
  }
  // mattress, fitted sheet, duvet folded back at the head, pillows, a throw across the foot
  rbox(W - 0.04, 0.22, L - 0.06, 0.06, cloth(['fb_cotton', '#e8e4dc']), 0, 0.42, 0, g, 0.5);
  puff(rbox(W + 0.06, 0.1, L * 0.7, 0.045, cloth(blanket), 0, 0.565, L * 0.14, g, 0.45, 5), 0.035, 3);
  rbox(W + 0.06, 0.05, 0.28, 0.024, cloth(pillows), 0, 0.6, -L * 0.21 + 0.1, g, 0.5);   // the turned-back sheet
  const np = size === 'single' ? 1 : 2; for (let i = 0; i < np; i++) { const p = puff(rbox(0.62, 0.13, 0.4, 0.06, cloth(pillows), 0, 0, 0, g, 0.5, 4), 0.03, 7 + i); p.position.set(np === 1 ? 0 : (i - 0.5) * 0.7, 0.6, -L / 2 + 0.3); p.rotation.set(-0.12, (i - 0.5) * 0.12, 0); }
  { const t = puff(rbox(W + 0.1, 0.045, 0.5, 0.02, cloth(throwCol), 0, 0, 0, g, 0.35, 4), 0.02, 9); t.position.set(0, 0.645, L / 2 - 0.42); t.rotation.y = 0.06; for (const s of [-1, 1]) box(0.012, 0.28, 0.5, cloth(throwCol), s * (hw + 0.045), 0.5, L / 2 - 0.42, g, 0.35); }
  return done(g, -hw - 0.06, hw + 0.06, -L / 2 - 0.06, L / 2 + 0.06);
}

export function makeNightstand({ wood: wk = 'walnut', clock = true } = {}) {
  const g = new THREE.Group(); g.name = 'nightstand'; const w = wood(wk);
  box(0.45, 0.5, 0.4, w, 0, 0.3, 0, g, 0.8); box(0.5, 0.03, 0.44, w, 0, 0.565, 0, g, 0.8); for (const s of [-1, 1]) for (const z of [-0.16, 0.16]) box(0.04, 0.06, 0.04, w, s * 0.19, 0.03, z, g);
  for (const y of [0.42, 0.2]) { box(0.4, 0.19, 0.012, wood(wk === 'white' ? 'white' : wk), 0, y, 0.206, g, 0.8); cyl(0.014, 0.014, 0.025, brass(), 0, y, 0.222, g, 10).rotation.x = Math.PI / 2; }
  if (clock) { const ct = canvasT(128, 64, (x, w2, h) => { x.fillStyle = '#0a0a0a'; x.fillRect(0, 0, w2, h); x.fillStyle = '#ff3a2a'; fitText(x, '11:47', w2 / 2, 36, w2 - 16, 44, F.digital || F.label, { weight: 700 }); });
    const c = box(0.16, 0.07, 0.07, plain('#18181a', { roughness: 0.4 }), 0.1, 0.615, 0.05, g); c.rotation.y = -0.3; const f = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.055), new THREE.MeshBasicMaterial({ map: ct, toneMapped: false })); f.position.set(0.1, 0.615, 0.086); g.add(f); }
  return done(g, -0.25, 0.25, -0.22, 0.22);
}

export function makeWardrobe({ w = 1.2, h = 1.95, wood: wk = 'oak' } = {}) {
  const g = new THREE.Group(); g.name = 'wardrobe'; const m = wood(wk), D = 0.58;
  box(w, h - 0.14, D, m, 0, 0.1 + (h - 0.14) / 2, 0, g, 0.9); box(w + 0.02, 0.1, D - 0.04, m, 0, 0.05, -0.01, g, 0.9); box(w + 0.08, 0.05, D + 0.05, m, 0, h - 0.015, 0.01, g, 0.9);
  const dw = w / 2 - 0.012; for (const s of [-1, 1]) { const x = s * (dw / 2 + 0.006);
    box(dw, h - 0.24, 0.022, m, x, 0.15 + (h - 0.24) / 2, D / 2 + 0.011, g, 0.9);
    for (const [y0, y1] of [[0.25, h * 0.52], [h * 0.56, h - 0.2]]) { const fr = wood(wk === 'oak' ? 'pine' : wk); box(dw - 0.12, y1 - y0, 0.01, fr, x, (y0 + y1) / 2, D / 2 + 0.026, g, 0.9); for (const yy of [y0, y1]) box(dw - 0.1, 0.02, 0.016, m, x, yy, D / 2 + 0.03, g); for (const xx of [-1, 1]) box(0.02, y1 - y0, 0.016, m, x + xx * (dw / 2 - 0.05), (y0 + y1) / 2, D / 2 + 0.03, g); }
    cyl(0.011, 0.011, 0.14, brass(), -s * 0.04, h * 0.54, D / 2 + 0.045, g, 8); }
  return done(g, -w / 2 - 0.04, w / 2 + 0.04, -D / 2, D / 2 + 0.06);
}

export function makeDesk({ w = 1.3, wood: wk = 'oak' } = {}) {
  const g = new THREE.Group(); g.name = 'desk'; const m = wood(wk), D = 0.62, H = 0.74;
  box(w, 0.035, D, m, 0, H, 0, g, 0.9);
  // drawer pedestal on the right, a panel leg on the left, a modesty panel at the back
  const px = w / 2 - 0.22; box(0.4, H - 0.07, D - 0.06, m, px, (H - 0.07) / 2 + 0.05, 0, g, 0.9); box(0.03, H - 0.02, D - 0.06, m, -w / 2 + 0.03, (H - 0.02) / 2, 0, g, 0.9); box(w - 0.5, 0.3, 0.02, m, -0.2, H - 0.2, -D / 2 + 0.05, g, 0.9);
  for (let i = 0; i < 3; i++) { const y = H - 0.14 - i * 0.2; box(0.36, 0.18, 0.014, wood(wk === 'oak' ? 'pine' : wk), px, y, D / 2 - 0.022, g, 0.9); bar(V(px - 0.07, y, D / 2 - 0.005), V(px + 0.07, y, D / 2 - 0.005), 0.012, steel(), g); }
  for (const z of [-0.2, 0.2]) box(0.03, 0.05, 0.03, plain('#222'), px, 0.025, z, g);
  return done(g, -w / 2, w / 2, -D / 2, D / 2);
}

export function makeChair({ wood: wk = 'oak', seat = ['fb_velour', '#6a3a34'] } = {}) {
  const g = new THREE.Group(); g.name = 'chair'; const m = wood(wk);
  for (const s of [-1, 1]) { box(0.035, 0.44, 0.035, m, s * 0.19, 0.22, 0.18, g); bar(V(s * 0.19, 0, -0.19), V(s * 0.185, 0.92, -0.24), 0.035, m, g); bar(V(s * 0.19, 0.2, 0.18), V(s * 0.19, 0.2, -0.19), 0.02, m, g); }
  box(0.42, 0.03, 0.42, m, 0, 0.45, 0, g, 0.8); puff(rbox(0.4, 0.045, 0.4, 0.02, cloth(seat), 0, 0.485, 0, g, 0.3, 3), 0.012, 4);
  bar(V(-0.185, 0.9, -0.24), V(0.185, 0.9, -0.24), 0.05, m, g); bar(V(-0.185, 0.62, -0.225), V(0.185, 0.62, -0.225), 0.03, m, g); for (const x of [-0.09, 0, 0.09]) bar(V(x, 0.62, -0.225), V(x, 0.9, -0.24), 0.02, m, g);
  return done(g, -0.22, 0.22, -0.26, 0.22);
}

export function makeSofa({ seats = 3, fabric = ['b82_chenille', '#5a6a5a'], cushions = [['fb_plaid_navy', '#3a4a6a'], ['fb_knit', '#c8a84a']], legs = 'walnut' } = {}) {
  const g = new THREE.Group(); g.name = seats === 1 ? 'armchair' : 'sofa_' + seats; const f = cloth(fabric), sw = 0.62, W = seats * sw + 0.36, D = 0.9, hw = W / 2;
  rbox(W, 0.26, D, 0.05, f, 0, 0.25, 0, g, 0.5);                                                      // base
  rbox(W, 0.6, 0.22, 0.08, f, 0, 0.56, -D / 2 + 0.11, g, 0.5);                                          // back
  for (const s of [-1, 1]) rbox(0.2, 0.42, D, 0.09, f, s * (hw - 0.1), 0.47, 0, g, 0.5);               // arms
  for (let i = 0; i < seats; i++) { const x = (i - (seats - 1) / 2) * sw; puff(rbox(sw - 0.02, 0.15, D - 0.3, 0.05, f, x, 0.45, 0.1, g, 0.5, 4), 0.03, 11 + i);   // seat cushions
    const b = puff(rbox(sw - 0.03, 0.42, 0.17, 0.07, f, 0, 0, 0, g, 0.5, 4), 0.02, 21 + i); b.position.set(x, 0.75, -D / 2 + 0.3); b.rotation.x = -0.14; }                // back cushions
  cushions.slice(0, seats === 1 ? 1 : 2).forEach((c, i) => { const p = puff(rbox(0.4, 0.4, 0.13, 0.06, cloth(c), 0, 0, 0, g, 0.3, 4), 0.02, 31 + i); p.position.set((i ? 1 : -1) * (hw - 0.42) * (seats === 1 ? 0 : 1), 0.74, -0.05); p.rotation.set(-0.3, (i ? -1 : 1) * 0.35, (i ? 1 : -1) * 0.12); });
  for (const s of [-1, 1]) for (const z of [-D / 2 + 0.08, D / 2 - 0.08]) cyl(0.022, 0.016, 0.12, wood(legs), s * (hw - 0.08), 0.06, z, g, 10);
  return done(g, -hw, hw, -D / 2, D / 2);
}

export function makeCoffeeTable({ w = 1.1, d = 0.55, wood: wk = 'walnut' } = {}) {
  const g = new THREE.Group(); g.name = 'coffee_table'; const m = wood(wk);
  box(w, 0.035, d, m, 0, 0.42, 0, g, 0.9); box(w - 0.14, 0.02, d - 0.14, m, 0, 0.16, 0, g, 0.9); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, 0.41, 0.05, m, sx * (w / 2 - 0.05), 0.205, sz * (d / 2 - 0.05), g);
  // on it: two magazines, a mug, a remote
  const mag = (c, t) => canvasT(128, 170, (x, W, H) => { x.fillStyle = c; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; fitText(x, t, W / 2, 30, W - 16, 26, F.heavy); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(14, 54, W - 28, 80); });
  [['#b8402a', 'TOWN'], ['#2a5a8a', 'HOME & PORCH']].forEach(([c, t], i) => { const mm = new THREE.MeshStandardMaterial({ map: mag(c, t), roughness: 0.5 }); const o = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.006, 0.28), [plain('#eee'), plain('#eee'), mm, plain('#eee'), plain('#eee'), plain('#eee')]); o.position.set(-0.25 + i * 0.05, 0.441 + i * 0.006, 0.02 - i * 0.03); o.rotation.y = 0.3 - i * 0.5; g.add(o); });
  cyl(0.04, 0.035, 0.09, plain('#e8e2d4', { roughness: 0.3 }), 0.28, 0.483, -0.06, g, 16); box(0.045, 0.018, 0.16, plain('#1a1a1c', { roughness: 0.5 }), 0.1, 0.447, 0.14, g).rotation.y = 0.5;
  return done(g, -w / 2, w / 2, -d / 2, d / 2);
}

// made-up test-card / weather screen for the TVs
const screenT = (kind) => canvasT(256, 192, (x, w, h) => { if (kind === 'crt') { ['#c8c8c8', '#c8c832', '#32c8c8', '#32c832', '#c832c8', '#c83232', '#3232c8'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * w / 7, 0, w / 7 + 1, h * 0.7); }); x.fillStyle = '#111'; x.fillRect(0, h * 0.7, w, h * 0.3); x.fillStyle = '#eee'; fitText(x, 'ELM TV · CHANNEL 6', w / 2, h * 0.86, w - 30, 22, F.label, { weight: 700 }); }
  else { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a3a6a'); gr.addColorStop(1, '#3a7ab8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'TONIGHT', w / 2, 40, w - 60, 30, F.heavy); fitText(x, 'Clear · 54°', w / 2, 100, w - 60, 44, F.label, { weight: 700 }); x.fillStyle = '#f2c21a'; x.fillRect(0, h - 26, w, 26); x.fillStyle = '#111'; fitText(x, 'ELM COUNTY WEATHER', w / 2, h - 12, w - 20, 16, F.label, { weight: 700 }); } });
export function makeTV({ kind = 'crt', w = 0.62 } = {}) {
  const g = new THREE.Group(); g.name = kind === 'crt' ? 'crt_tv' : 'flat_tv'; const blk = mat('b80_blackplastic', { rough: 0.45 }); const scr = new THREE.MeshBasicMaterial({ map: screenT(kind), toneMapped: false, color: new THREE.Color(0.8, 0.8, 0.8) });
  if (kind === 'crt') { const h = w * 0.82, d = w * 0.8; rbox(w, h, d * 0.45, 0.03, blk, 0, h / 2, d * 0.2, g, 0.4); const back = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w * 0.62, d * 0.6, 4, 1), blk); back.rotation.set(Math.PI / 2, Math.PI / 4, 0); back.scale.set(1, 1, h / w); back.position.set(0, h / 2, -d * 0.28); back.castShadow = true; g.add(back);
    const sg = new THREE.SphereGeometry(w * 0.9, 20, 14, Math.PI / 2 - 0.36, 0.72, Math.PI / 2 - 0.3, 0.6); const s = new THREE.Mesh(sg, scr); s.position.set(0, h * 0.56, d * 0.43 - w * 0.9 + 0.012); g.add(s);
    box(w * 0.9, h * 0.1, 0.012, plain('#2a2a2c', { roughness: 0.4 }), 0, h * 0.09, d * 0.43, g); for (let i = 0; i < 4; i++) cyl(0.012, 0.012, 0.012, plain('#888'), w * 0.2 + i * 0.045, h * 0.09, d * 0.44, g, 8).rotation.x = Math.PI / 2;
    for (const s2 of [-1, 1]) bar(V(s2 * 0.05, h, 0), V(s2 * 0.3, h + 0.42, -0.06), 0.006, steel(), g);   // rabbit ears
    return done(g, -w / 2, w / 2, -d * 0.6, d * 0.45); }
  const h = w * 0.58; box(w, h, 0.035, blk, 0, 0.09 + h / 2, 0, g, 0.4); const s = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.03, h - 0.03), scr); s.position.set(0, 0.09 + h / 2, 0.019); g.add(s); box(0.05, 0.09, 0.04, blk, 0, 0.05, -0.01, g); box(w * 0.4, 0.015, 0.2, blk, 0, 0.0075, 0, g, 0.4);
  return done(g, -w / 2, w / 2, -0.1, 0.1);
}
export function makeTVStand({ w = 1.2, wood: wk = 'walnut' } = {}) {
  const g = new THREE.Group(); g.name = 'tv_stand'; const m = wood(wk), D = 0.42, H = 0.5;
  box(w, 0.03, D, m, 0, H, 0, g, 0.9); box(w, 0.03, D, m, 0, 0.07, 0, g, 0.9); for (const x of [-w / 2 + 0.015, 0, w / 2 - 0.015]) box(0.03, H - 0.07, D, m, x, 0.07 + (H - 0.07) / 2, 0, g, 0.9); box(w, H - 0.07, 0.012, m, 0, 0.07 + (H - 0.07) / 2, -D / 2 + 0.006, g, 0.9);
  for (const s of [-1, 1]) for (const z of [-0.15, 0.15]) cyl(0.02, 0.015, 0.06, m, s * (w / 2 - 0.06), 0.03, z, g, 8);
  box(0.36, 0.07, 0.26, mat('b80_blackplastic', { rough: 0.4 }), -w / 4, 0.12, 0.02, g, 0.4); for (let i = 0; i < 6; i++) box(0.02 + (i % 2) * 0.006, 0.19, 0.13, plain(['#2a4a8a', '#8a2a2a', '#2a6a4a', '#b8902a', '#444', '#6a3a7a'][i]), w / 4 - 0.1 + i * 0.03, 0.18, 0.05, g);
  return done(g, -w / 2, w / 2, -D / 2, D / 2);
}

export function makeLamp({ kind = 'floor', shade = '#e8d8b8', light = false } = {}) {
  const g = new THREE.Group(); g.name = kind + '_lamp'; const H = kind === 'floor' ? 1.55 : 0.5, br = brass();
  cyl(kind === 'floor' ? 0.15 : 0.085, kind === 'floor' ? 0.16 : 0.095, 0.03, br, 0, 0.015, 0, g, 24);
  if (kind === 'floor') cyl(0.012, 0.012, H - 0.2, br, 0, (H - 0.2) / 2 + 0.03, 0, g, 10); else { const prof = [[0.03, 0], [0.085, 0.06], [0.07, 0.16], [0.025, 0.24], [0.015, 0.3]].map(([a, b]) => new THREE.Vector2(a, b)); const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), mat('fb_cotton', { to: '#3a5a6a', rough: 0.35 })); body.position.y = 0.03; body.castShadow = true; g.add(body); }
  const sr = kind === 'floor' ? 0.24 : 0.16, sh = kind === 'floor' ? 0.3 : 0.2; const sg = new THREE.CylinderGeometry(sr * 0.7, sr, sh, 24, 1, true); projUV(sg, 0.3);
  const sm = mat('liv_shade', { to: shade, rough: 0.9, side: THREE.DoubleSide, emissive: '#6a5028' }); const s = new THREE.Mesh(sg, sm); s.position.y = H - sh / 2 + 0.02; g.add(s);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.2, 1.5), toneMapped: false })); bulb.position.y = H - sh * 0.55; g.add(bulb);
  if (light) { const l = new THREE.PointLight('#ffd8a0', 4, 7, 1.7); l.position.y = H - sh * 0.5; g.add(l); }
  return done(g, -0.16, 0.16, -0.16, 0.16);
}

export function makeBookshelf({ w = 0.9, h = 1.9, wood: wk = 'oak', seed = 1 } = {}) {
  const g = new THREE.Group(); g.name = 'bookshelf'; const m = wood(wk), D = 0.3, r = rng(seed * 97 + 3), n = Math.max(2, Math.round(h / 0.36));
  for (const s of [-1, 1]) box(0.025, h, D, m, s * (w / 2 - 0.0125), h / 2, 0, g, 0.9); box(w, h, 0.012, m, 0, h / 2, -D / 2 + 0.006, g, 0.9); box(w + 0.03, 0.03, D + 0.02, m, 0, h - 0.015, 0, g, 0.9); box(w, 0.07, D - 0.02, m, 0, 0.035, 0, g, 0.9);
  const sp = (h - 0.1) / n, books = [];
  for (let i = 0; i < n; i++) { const y = 0.07 + i * sp; if (i) box(w - 0.05, 0.02, D - 0.015, m, 0, y, 0, g, 0.9);
    let x = -w / 2 + 0.04; const lean = r() < 0.5; while (x < w / 2 - 0.07) { const t = 0.018 + r() * 0.03, bh = Math.min(sp - 0.05, 0.17 + r() * 0.1), bd = 0.14 + r() * 0.07; if (r() < 0.08) { x += 0.06 + r() * 0.1; continue; } books.push([x + t / 2, y + 0.01 + bh / 2, D / 2 - 0.03 - bd / 2, t, bh, bd, lean && x > w / 2 - 0.2 ? 0.12 : 0]); x += t + 0.002; } }
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), plain('#ffffff', { roughness: 0.7 }), books.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), pal = ['#7a2a22', '#2a4a6a', '#3a5a3a', '#b8903a', '#4a3a5a', '#d8d0c0', '#222428', '#a8522a', '#5a7a8a'];
  books.forEach(([x, y, z, t, bh, bd, ln], i) => { q.setFromAxisAngle(V(0, 0, 1), -ln); m4.compose(V(x, y, z), q, V(t, bh, bd)); im.setMatrixAt(i, m4); im.setColorAt(i, c.set(pal[Math.floor(r() * pal.length)]).multiplyScalar(0.7 + r() * 0.5)); }); im.castShadow = true; g.add(im);
  return done(g, -w / 2, w / 2, -D / 2, D / 2);
}

export function makeRug({ w = 2.2, d = 1.5, fabric = ['dn_carpet', '#8a4a3a'], border = '#d8c8a8' } = {}) {
  const g = new THREE.Group(); g.name = 'rug'; flat(-w / 2, w / 2, -d / 2, d / 2, 0.012, cloth(['fb_knit', border]), g, 0.4); flat(-w / 2 + 0.12, w / 2 - 0.12, -d / 2 + 0.12, d / 2 - 0.12, 0.014, cloth(fabric), g, 0.6); flat(-w / 2 + 0.3, w / 2 - 0.3, -d / 2 + 0.3, d / 2 - 0.3, 0.016, cloth([fabric[0], border]), g, 0.6); flat(-w / 2 + 0.34, w / 2 - 0.34, -d / 2 + 0.34, d / 2 - 0.34, 0.018, cloth(fabric), g, 0.6);
  const fr = []; for (let z = -d / 2 + 0.02; z < d / 2; z += 0.03) fr.push(z); const fg = new THREE.BoxGeometry(0.07, 0.004, 0.008), im = new THREE.InstancedMesh(fg, plain(border, { roughness: 1 }), fr.length * 2), m4 = new THREE.Matrix4(); fr.forEach((z, i) => { for (const s of [0, 1]) { m4.makeTranslation((s ? 1 : -1) * (w / 2 + 0.035), 0.012, z); im.setMatrixAt(i * 2 + s, m4); } }); g.add(im);
  return g;   // (no collider: you walk on it)
}

// ---- Nestwell Home: an open-fronted showroom, three furnished rooms. 18 x 9 m, front (+z... here the open side) faces -x.
export function makeFurnitureShowroom() {
  const g = new THREE.Group(); g.name = 'furniture_showroom'; const cols = [], W = 18, D = 9, H = 3.1, x0 = -W / 2, z0 = -D / 2;
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0.15, z); o.rotation.y = ry; g.add(o); const c = o.userData.collider; if (c) { const cs = Math.cos(ry), sn = Math.sin(ry); const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([px, pz]) => [x + px * cs + pz * sn, z - px * sn + pz * cs]); cols.push([Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]); } return o; };
  const wall = mat('sg_plaster', { to: '#d8d2c4', rough: 0.9 }), trim = mat('wd_plank_c', { to: '#e8e4da', rough: 0.6 });
  box(W, 0.15, D, mat('lot_concrete', { to: '#8a8882' }), 0, 0.075, 0, g, 2);                                        // slab
  flat(x0, x0 + 6, z0, -z0, 0.152, mat('wood_floor', { to: '#a87a52', rough: 0.5 }), g, 1.6); flat(x0 + 6, x0 + 12, z0, -z0, 0.152, mat('walnut_floor', { to: '#7a5236', rough: 0.5 }), g, 1.5); flat(x0 + 12, -x0, z0, -z0, 0.152, mat('laminate_oak', { to: '#b89468', rough: 0.5 }), g, 1.2);
  // back wall (+z... the far side from the street is +x? no: rooms open toward -z, back wall at +z), end walls, two partitions with wide openings
  box(W, H, 0.2, wall, 0, 0.15 + H / 2, D / 2 - 0.1, g, 2.4); for (const s of [-1, 1]) box(0.2, H, D, wall, s * (W / 2 - 0.1), 0.15 + H / 2, 0, g, 2.4);
  for (const x of [x0 + 6, x0 + 12]) { box(0.14, H, 3.4, wall, x, 0.15 + H / 2, D / 2 - 1.7, g, 2.4); box(0.14, H - 2.2, D - 3.4, wall, x, 0.15 + 2.2 + (H - 2.2) / 2, -1.7, g, 2.4); cols.push([x - 0.1, x + 0.1, D / 2 - 3.4, D / 2]); }
  box(W + 0.5, 0.22, D + 0.6, mat('lot_concrete', { to: '#5a5a5c' }), 0, 0.15 + H + 0.11, 0, g, 2);                    // roof slab
  flat(x0 + 0.2, -x0 - 0.2, z0, -z0 - 0.2, 0.15 + H - 0.002, mat('b82_speckle', { to: '#e4e0d8', side: THREE.DoubleSide }), g, 1.2);   // ceiling
  for (let x = x0; x <= -x0 + 0.01; x += 6) box(0.3, H, 0.3, wall, x === x0 ? x + 0.15 : x === -x0 ? x - 0.15 : x, 0.15 + H / 2, z0 + 0.15, g, 2.4);   // front piers
  box(W, 0.07, 0.03, trim, 0, 0.15 + 0.035, D / 2 - 0.215, g);                                                          // skirting
  // sign over the front
  const st = canvasT(1024, 160, (x, w, h) => { x.fillStyle = '#23302a'; x.fillRect(0, 0, w, h); x.fillStyle = '#efe6d0'; fitText(x, 'Nestwell Home', w * 0.34, 86, w * 0.56, 96, F.script || F.heavy); fitText(x, 'beds · sofas · desks · lamps     555-0164', w * 0.76, 86, w * 0.4, 30, F.label, { spacing: 2 }); });
  { const sm = new THREE.MeshStandardMaterial({ map: st, emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 0.55, roughness: 0.6 }); const s = new THREE.Mesh(new THREE.BoxGeometry(11, 1.0, 0.12), [plain('#23302a'), plain('#23302a'), plain('#23302a'), plain('#23302a'), plain('#23302a'), sm]); s.position.set(0, 0.15 + H + 0.75, z0 - 0.05); g.add(s); }
  cols.push([x0, -x0, D / 2 - 0.25, D / 2], [x0, x0 + 0.25, z0, D / 2], [-x0 - 0.25, -x0, z0, D / 2]);
  // ceiling lights: one warm light per room + a glowing disc
  for (const x of [x0 + 3, 0, -x0 - 3]) { const l = new THREE.PointLight('#ffe6c4', 14, 11, 1.5); l.position.set(x, 0.15 + H - 0.4, 0.3); g.add(l); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.7), toneMapped: false })); d.position.set(x, 0.15 + H - 0.03, 0.3); g.add(d); }
  // ---- room 1: bedroom (west)
  { const cx = x0 + 3; put(makeRug({ w: 2.6, d: 2.0, fabric: ['dn_carpet', '#5a6a7a'] }), cx, 1.2);
    put(makeBed({ size: 'double', frame: 'wood', wood: 'walnut', blanket: ['b82_chenille', '#4a6a8a'] }), cx, D / 2 - 1.35, Math.PI); for (const s of [-1, 1]) { put(makeNightstand({ wood: 'walnut', clock: s > 0 }), cx + s * 1.1, D / 2 - 0.5, Math.PI); const l = makeLamp({ kind: 'table', shade: '#e8d8b8' }); l.position.set(cx + s * 1.1 + (s > 0 ? 0.1 : 0), 0.15 + 0.58, D / 2 - 0.5); g.add(l); }
    put(makeWardrobe({ wood: 'oak' }), x0 + 0.62, -0.6, Math.PI / 2); put(makeChair({ wood: 'walnut', seat: ['fb_velour', '#6a3a34'] }), cx + 1.9, -1.4, -2.2);
    put(makeBed({ size: 'single', frame: 'metal', blanket: ['fb_plaid_red', '#a8483a'], throwCol: ['fb_fleece', '#e8dcc0'] }), cx + 2.1, -2.9, Math.PI / 2 * 0); }
  // ---- room 2: living room (middle)
  { const cx = 0; put(makeRug({ w: 3.0, d: 2.2, fabric: ['dn_carpet', '#8a4a3a'] }), cx, 0.6);
    put(makeSofa({ seats: 3, fabric: ['b82_chenille', '#5a6a5a'] }), cx, 2.3, Math.PI); put(makeSofa({ seats: 1, fabric: ['op_leather', '#7a4a2a'], cushions: [['fb_knit', '#c8a84a']] }), cx - 2.0, 0.5, Math.PI / 2); put(makeSofa({ seats: 2, fabric: ['fb_denim', '#3a4a6a'], cushions: [['fb_plaid_red', '#a8483a'], ['fb_cotton', '#e8e0d0']] }), cx + 2.0, 0.4, -Math.PI / 2);
    put(makeCoffeeTable({ wood: 'walnut' }), cx, 0.7); put(makeTVStand({ wood: 'walnut' }), cx, -1.6); const tv = makeTV({ kind: 'crt' }); tv.position.set(cx - 0.05, 0.15 + 0.515, -1.6); g.add(tv);
    put(makeBookshelf({ wood: 'walnut', seed: 2 }), cx + 2.2, D / 2 - 0.4, Math.PI); put(makeLamp({ kind: 'floor', shade: '#e8d0a0' }), cx - 2.3, 2.6); }
  // ---- room 3: study (east)
  { const cx = -x0 - 3; put(makeRug({ w: 2.2, d: 1.5, fabric: ['fb_plaid_navy', '#3a4a6a'], border: '#c8c0b0' }), cx, 0.2);
    put(makeDesk({ wood: 'oak' }), cx - 0.6, D / 2 - 0.6, Math.PI); put(makeChair({ wood: 'oak', seat: ['fb_denim', '#3a4a6a'] }), cx - 0.3, D / 2 - 1.35, 0.15); { const l = makeLamp({ kind: 'table', shade: '#c8d8c8' }); l.position.set(cx - 0.1, 0.15 + 0.76, D / 2 - 0.5); g.add(l); const tv = makeTV({ kind: 'flat', w: 0.55 }); tv.position.set(cx - 0.75, 0.15 + 0.76, D / 2 - 0.42); tv.rotation.y = Math.PI; g.add(tv); }
    put(makeBookshelf({ wood: 'oak', seed: 5 }), cx + 1.3, D / 2 - 0.4, Math.PI); put(makeBookshelf({ wood: 'oak', seed: 9, w: 0.7 }), cx + 2.15, D / 2 - 0.4, Math.PI); put(makeWardrobe({ wood: 'white', w: 1.0 }), -x0 - 0.62, -0.8, -Math.PI / 2);
    put(makeSofa({ seats: 1, fabric: ['fb_velour', '#5a2a3a'], cushions: [['fb_cotton', '#e8e0d0']] }), cx - 1.6, -1.6, 0.6); put(makeLamp({ kind: 'floor', shade: '#e0c8a0' }), cx - 2.4, -0.8); }
  g.userData = { colliders: cols, area: { minX: x0 + 0.3, maxX: -x0 - 0.3, minZ: z0 - 1.5, maxZ: D / 2 - 0.3 }, floorY: 0.15 };
  return g;
}
