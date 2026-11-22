// Office set (90), built from the texture library alone via kit.js. Local frame: centred on the footprint, ground
// y = 0, front faces +z (the side you sit at / open).
//   makeOfficeDesk({ w, top })   makeOfficeChair({ fabric })   makeComputer({ kind: 'crt' | 'flat' })  (sits on a desk)
//   makeDeskPhone()   makeFilingCabinet({ drawers: 2 | 4, color })   makeCopier()   makeWaterCooler()
//   makePartition({ w, h, fabric })   makeWhiteboard({ w })   makeWasteBin()   makeCorkBoard({ w })
//   makeOfficeShowroom()  a small newsroom-style office: four desks, cabinets, copier, cooler, meeting corner
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V, puff, projUV } from './kit.js';
import { WOODS, makeRug, makeLamp, makeBookshelf, makeSofa, makeCoffeeTable } from './furniture88.js';
import { F, fitText } from '../fonts.js';

const steel = (c = '#9a9ea2') => mat('gf_galv', { to: c, rough: 0.4, metal: 0.55 });
const black = () => mat('b80_blackplastic', { rough: 0.4 });
const beige = () => plain('#d8d2c0', { roughness: 0.5 });
const cloth = ([t, c]) => mat(t, { to: c, rough: 0.95 });
const done = (g, x0, x1, z0, z1) => { g.userData.collider = [x0, x1, z0, z1]; return g; };

export function makeOfficeDesk({ w = 1.5, top = ['laminate_oak', '#b89468'] } = {}) {
  const g = new THREE.Group(); g.name = 'office_desk'; const D = 0.75, H = 0.73, st = steel('#5a5e64'), tm = mat(top[0], { to: top[1], rough: 0.45 });
  rbox(w, 0.03, D, 0.008, tm, 0, H, 0, g, 0.9, 1); box(w + 0.004, 0.012, D + 0.004, black(), 0, H - 0.02, 0, g);   // top + dark edge band
  // steel panel legs, a modesty panel, a hanging drawer pedestal on the right
  for (const s of [-1, 1]) { box(0.03, H - 0.03, D - 0.1, st, s * (w / 2 - 0.04), (H - 0.03) / 2, 0, g); box(0.07, 0.025, D - 0.02, st, s * (w / 2 - 0.04), 0.0125, 0, g); }
  box(w - 0.1, 0.35, 0.015, st, 0, H - 0.22, -D / 2 + 0.08, g);
  const px = w / 2 - 0.27; box(0.4, 0.5, D - 0.16, st, px, H - 0.28, 0.02, g); for (let i = 0; i < 3; i++) { const y = H - 0.11 - i * 0.165; box(0.37, 0.15, 0.012, steel('#6a6e74'), px, y, D / 2 - 0.055, g); bar(V(px - 0.06, y + 0.03, D / 2 - 0.045), V(px + 0.06, y + 0.03, D / 2 - 0.045), 0.012, steel('#c8ccd0'), g); }
  return done(g, -w / 2, w / 2, -D / 2, D / 2);
}

export function makeOfficeChair({ fabric = ['fb_denim', '#2a3a5a'] } = {}) {
  const g = new THREE.Group(); g.name = 'office_chair'; const blk = black(), f = cloth(fabric);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; bar(V(0, 0.09, 0), V(Math.cos(a) * 0.3, 0.06, Math.sin(a) * 0.3), 0.035, blk, g); const c = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), blk); c.position.set(Math.cos(a) * 0.3, 0.028, Math.sin(a) * 0.3); g.add(c); }
  cyl(0.025, 0.03, 0.34, steel('#c8ccd0'), 0, 0.26, 0, g, 12); cyl(0.045, 0.045, 0.06, blk, 0, 0.42, 0, g, 12);
  puff(rbox(0.46, 0.08, 0.46, 0.035, f, 0, 0.49, 0, g, 0.3, 4), 0.02, 3);
  bar(V(0, 0.44, -0.2), V(0, 0.72, -0.27), 0.04, blk, g); const b = puff(rbox(0.42, 0.46, 0.07, 0.03, f, 0, 0, 0, g, 0.3, 4), 0.012, 5); b.position.set(0, 0.86, -0.27); b.rotation.x = -0.1;
  for (const s of [-1, 1]) { bar(V(s * 0.25, 0.46, -0.05), V(s * 0.25, 0.66, -0.05), 0.025, blk, g); rbox(0.05, 0.03, 0.26, 0.012, blk, s * 0.25, 0.67, 0, g); }
  return done(g, -0.3, 0.3, -0.3, 0.3);
}

// made-up screens: a word processor with a headline, a spreadsheet
const screenT = (kind) => canvasT(256, 192, (x, w, h) => { if (kind === 'doc') { x.fillStyle = '#e8ecf0'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a4a8a'; x.fillRect(0, 0, w, 18); x.fillStyle = '#fff'; x.font = `11px ${F.label}`; x.fillText('story_draft.doc', 6, 13); x.fillStyle = '#111'; fitText(x, 'LIGHTS OVER ELM LOOP', w / 2, 44, w - 30, 20, F.heavy); x.fillStyle = '#555'; for (let i = 0; i < 9; i++) x.fillRect(16, 62 + i * 13, (i % 4 === 3 ? 0.5 : 0.86 + (i % 3) * 0.04) * (w - 32), 4); }
  else { x.fillStyle = '#f4f6f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a6a4a'; x.fillRect(0, 0, w, 18); x.strokeStyle = '#b8c0b8'; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(0, 18 + i * 22); x.lineTo(w, 18 + i * 22); x.stroke(); } for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(i * 52, 18); x.lineTo(i * 52, h); x.stroke(); } x.fillStyle = '#333'; x.font = `11px ${F.label}`; for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) x.fillText(String((r * 37 + c * 91) % 900 + 100), 8 + c * 52, 34 + r * 22); } });
export function makeComputer({ kind = 'crt', screen = 'doc' } = {}) {   // origin at the desk surface
  const g = new THREE.Group(); g.name = 'computer_' + kind; const be = kind === 'crt' ? beige() : black(); const scr = new THREE.MeshBasicMaterial({ map: screenT(screen), toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) });
  if (kind === 'crt') { rbox(0.4, 0.09, 0.4, 0.012, be, 0, 0.045, -0.12, g); box(0.12, 0.012, 0.004, plain('#888'), 0.1, 0.05, 0.082, g); cyl(0.008, 0.008, 0.004, plain('#3aa83a', { emissive: '#2a8a2a' }), -0.15, 0.05, 0.082, g, 8).rotation.x = Math.PI / 2;   // desktop case under the monitor
    rbox(0.38, 0.32, 0.12, 0.02, be, 0, 0.27, 0.0, g); const back = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 0.26, 4, 1), be); back.rotation.set(Math.PI / 2, Math.PI / 4, 0); back.scale.set(1.1, 1, 0.92); back.position.set(0, 0.27, -0.18); g.add(back);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.24), scr); s.position.set(0, 0.28, 0.062); g.add(s); }
  else { box(0.5, 0.31, 0.022, be, 0, 0.3, -0.12, g); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.47, 0.28), scr); s.position.set(0, 0.3, -0.108); g.add(s); box(0.04, 0.14, 0.03, be, 0, 0.08, -0.13, g); rbox(0.2, 0.012, 0.14, 0.004, be, 0, 0.006, -0.12, g); rbox(0.17, 0.4, 0.4, 0.01, be, 0.5, 0.2, -0.05, g); }
  // keyboard (keys as a lighter slab with a grid), mouse + cable
  const kt = canvasT(256, 96, (x, w, h) => { x.fillStyle = kind === 'crt' ? '#cfc8b4' : '#1a1a1c'; x.fillRect(0, 0, w, h); x.fillStyle = kind === 'crt' ? '#ece6d6' : '#2e2e32'; for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) x.fillRect(6 + c * 16.4 + (r % 2) * 4, 6 + r * 17, 13, 13); });
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.15), [be, be, new THREE.MeshStandardMaterial({ map: kt, roughness: 0.6 }), be, be, be]); kb.position.set(0, 0.012, 0.22); kb.rotation.x = 0.06; g.add(kb);
  const mo = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), be); mo.scale.set(0.8, 0.5, 1.3); mo.position.set(0.3, 0.012, 0.22); g.add(mo);
  return g;
}
export function makeDeskPhone() {   // origin at the desk surface
  const g = new THREE.Group(); g.name = 'desk_phone'; const b = plain('#2a2a2e', { roughness: 0.45 });
  const base = rbox(0.2, 0.05, 0.22, 0.012, b, 0, 0.03, 0, g); base.rotation.x = 0.12;
  const kt = canvasT(96, 128, (x, w, h) => { x.fillStyle = '#2a2a2e'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8d8d2'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) x.fillRect(12 + c * 26, 14 + r * 27, 20, 18); x.fillStyle = '#c83a32'; x.fillRect(12, 122, 8, 4); });
  const k = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.12), new THREE.MeshStandardMaterial({ map: kt, roughness: 0.6 })); k.rotation.x = -Math.PI / 2 + 0.12; k.position.set(0.04, 0.062, 0.02); g.add(k);
  const hs = new THREE.Group(); hs.position.set(-0.065, 0.075, 0); hs.rotation.x = 0.12; g.add(hs); rbox(0.045, 0.03, 0.2, 0.012, b, 0, 0, 0, hs); for (const s of [-1, 1]) rbox(0.055, 0.04, 0.055, 0.015, b, 0, -0.012, s * 0.08, hs);
  // coiled cord: a little helix from the handset to the base
  const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(V(-0.065 - 0.05 * Math.sin(t * Math.PI) + Math.cos(t * 40) * 0.008, 0.05 - 0.035 * Math.sin(t * Math.PI) + Math.sin(t * 40) * 0.008, 0.1 + t * 0.06)); }
  const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.0025, 4), b); g.add(cord);
  return g;
}
export function makeFilingCabinet({ drawers = 4, color = '#8a8c84' } = {}) {
  const g = new THREE.Group(); g.name = 'filing_cabinet'; const W = 0.46, D = 0.62, H = drawers * 0.33 + 0.04, st = steel(color), fr = steel('#a8aaa2');
  box(W, H, D, st, 0, H / 2, 0, g, 0.9);
  for (let i = 0; i < drawers; i++) { const y = 0.02 + 0.165 + i * 0.33, open = i === drawers - 2 ? 0.16 : 0; box(W - 0.03, 0.3, 0.02 + open, fr, 0, y, D / 2 + 0.006 + open / 2, g, 0.9); bar(V(-0.07, y + 0.05, D / 2 + 0.03 + open), V(0.07, y + 0.05, D / 2 + 0.03 + open), 0.014, steel('#d8dce0'), g);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.04), plain('#f2efe4')); lb.position.set(0, y - 0.03, D / 2 + 0.017 + open); g.add(lb);
    if (open) { for (let k = 0; k < 6; k++) box(W - 0.08, 0.2, 0.004, plain(['#d8c890', '#c8d8b0', '#e0d0a8'][k % 3], { roughness: 0.9 }), 0, y + 0.03, D / 2 - 0.02 + k * 0.022, g); } }
  return done(g, -W / 2, W / 2, -D / 2, D / 2 + 0.05);
}
export function makeCopier() {
  const g = new THREE.Group(); g.name = 'copier'; const be = beige(), dk = plain('#4a4c50', { roughness: 0.5 });
  rbox(0.65, 0.62, 0.6, 0.015, be, 0, 0.36, 0, g); box(0.6, 0.05, 0.55, dk, 0, 0.025, 0, g); for (let i = 0; i < 2; i++) { box(0.56, 0.2, 0.012, plain('#c8c2b0', { roughness: 0.5 }), 0, 0.2 + i * 0.24, 0.302, g); box(0.16, 0.025, 0.02, dk, 0, 0.26 + i * 0.24, 0.31, g); }
  rbox(0.7, 0.14, 0.62, 0.015, be, 0, 0.74, 0, g); const lid = rbox(0.6, 0.035, 0.5, 0.012, plain('#e4dfd0', { roughness: 0.5 }), 0, 0, 0, g); lid.position.set(-0.02, 0.83, -0.02); lid.rotation.x = -0.06;
  const pt = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#3a3c40'; x.fillRect(0, 0, w, h); x.fillStyle = '#9ad8a8'; x.fillRect(8, 8, 60, 26); x.fillStyle = '#123'; x.font = `12px ${F.label}`; x.fillText('READY  01', 12, 26); x.fillStyle = '#3aa83a'; x.beginPath(); x.arc(100, 22, 10, 0, 7); x.fill(); x.fillStyle = '#ddd'; for (let i = 0; i < 6; i++) x.fillRect(8 + i * 12, 44, 9, 9); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.1), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.5 })); p.rotation.x = -Math.PI / 2 + 0.5; p.position.set(0.2, 0.83, 0.26); g.add(p);
  box(0.36, 0.012, 0.28, be, -0.5, 0.56, 0, g).rotation.z = 0.12; for (let k = 0; k < 4; k++) box(0.22, 0.002, 0.3, plain('#f8f8f4'), -0.5, 0.575 + k * 0.002, 0.0, g).rotation.z = 0.12;   // output tray + sheets
  return done(g, -0.68, 0.36, -0.32, 0.32);
}
export function makeWaterCooler() {
  const g = new THREE.Group(); g.name = 'water_cooler'; rbox(0.32, 1.0, 0.32, 0.02, plain('#eceae4', { roughness: 0.4 }), 0, 0.5, 0, g);
  const bottle = new THREE.Mesh(new THREE.LatheGeometry([[0.03, 0], [0.04, 0.05], [0.13, 0.12], [0.135, 0.42], [0.11, 0.46], [0.0, 0.47]].map(([a, b]) => new THREE.Vector2(a, b)), 20), new THREE.MeshPhysicalMaterial({ color: '#9ad0e8', roughness: 0.08, transparent: true, opacity: 0.5, side: THREE.DoubleSide })); bottle.position.y = 0.98; g.add(bottle);
  box(0.2, 0.16, 0.02, plain('#3a3c40'), 0, 0.72, 0.161, g); for (const [x, c] of [[-0.05, '#3a6ac8'], [0.05, '#c83a32']]) { box(0.03, 0.05, 0.03, plain(c, { roughness: 0.4 }), x, 0.76, 0.18, g); } box(0.2, 0.012, 0.08, plain('#888', { metalness: 0.5 }), 0, 0.62, 0.19, g);
  cyl(0.035, 0.03, 0.2, plain('#f4f4f0', { roughness: 0.6 }), 0.19, 0.6, 0.05, g, 12);   // cup dispenser
  return done(g, -0.17, 0.17, -0.17, 0.2);
}
export function makePartition({ w = 1.6, h = 1.5, fabric = ['b82_canvasgrey', '#7a8088'] } = {}) {
  const g = new THREE.Group(); g.name = 'partition'; box(w - 0.06, h - 0.12, 0.04, cloth(fabric), 0, 0.08 + (h - 0.12) / 2, 0, g, 0.5); const fr = steel('#5a5e64'); for (const s of [-1, 1]) { box(0.03, h, 0.05, fr, s * (w / 2 - 0.015), h / 2, 0, g); box(0.05, 0.02, 0.4, fr, s * (w / 2 - 0.015), 0.01, 0, g); } box(w, 0.03, 0.05, fr, 0, h - 0.015, 0, g); box(w, 0.03, 0.05, fr, 0, 0.07, 0, g);
  return done(g, -w / 2, w / 2, -0.05, 0.05);
}
export function makeWhiteboard({ w = 1.8 } = {}) {   // on a wall: bottom at y = 0.95
  const g = new THREE.Group(); g.name = 'whiteboard'; const h = 1.05;
  const t = canvasT(512, 300, (x, W, H) => { x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, W, H); x.strokeStyle = '#1a3a8a'; x.lineWidth = 3; x.font = `34px ${F.hand || F.label}`; x.fillStyle = '#1a3a8a'; x.fillText('MONDAY EDITION', 24, 46); x.fillStyle = '#b8281e'; x.font = `26px ${F.hand || F.label}`; ['1. Loop lights — who saw them?', '2. Market fire follow-up', '3. School bus routes', '4. Garden opens Sat'].forEach((s, i) => x.fillText(s, 30, 96 + i * 42)); x.strokeStyle = '#2a7a3a'; x.beginPath(); x.arc(420, 210, 46, 0, 7); x.stroke(); x.fillStyle = '#2a7a3a'; x.font = `22px ${F.hand || F.label}`; x.fillText('5pm!', 396, 218); });
  box(w + 0.05, h + 0.05, 0.025, steel('#c8ccd0'), 0, 0.95 + h / 2, 0, g); const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.25 })); b.position.set(0, 0.95 + h / 2, 0.014); g.add(b); box(w * 0.6, 0.02, 0.07, steel('#c8ccd0'), 0, 0.94, 0.04, g); for (let i = 0; i < 3; i++) cyl(0.008, 0.008, 0.11, plain(['#1a3a8a', '#b8281e', '#2a7a3a'][i]), -0.2 + i * 0.16, 0.958, 0.045, g, 8).rotation.z = Math.PI / 2;
  return g;
}
export function makeCorkBoard({ w = 1.1 } = {}) {   // on a wall: centre at y = 1.5
  const g = new THREE.Group(); g.name = 'cork_board'; const h = 0.8, r = rng(8); box(w + 0.05, h + 0.05, 0.02, mat(WOODS.pine[0], { to: WOODS.pine[1] }), 0, 1.5, 0, g, 0.9); box(w, h, 0.012, mat('b82_canvasgrey', { to: '#9a7a52', rough: 1 }), 0, 1.5, 0.008, g, 0.4);
  for (let i = 0; i < 9; i++) { const pw = 0.14 + r() * 0.1, ph = 0.1 + r() * 0.14; const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), plain(['#f8f6ea', '#fff6a8', '#d8ecf8', '#f8d8d8'][i % 4], { roughness: 0.9 })); p.position.set((r() - 0.5) * (w - 0.3), 1.5 + (r() - 0.5) * (h - 0.25), 0.016 + i * 0.0006); p.rotation.z = (r() - 0.5) * 0.3; g.add(p); const pin = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), plain(['#c8281e', '#2a6ad8', '#f2c21a'][i % 3])); pin.position.set(p.position.x, p.position.y + ph / 2 - 0.015, 0.024); g.add(pin); }
  return g;
}
export function makeWasteBin() { const g = new THREE.Group(); g.name = 'waste_bin'; const m = steel('#5a5e64'); m.side = THREE.DoubleSide; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.3, 18, 1, true), m); b.position.y = 0.15; g.add(b); cyl(0.11, 0.11, 0.01, m, 0, 0.005, 0, g, 18); for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), plain('#f2f0e6', { roughness: 1, flatShading: true })); p.position.set((i - 1) * 0.05, 0.2 + i * 0.03, (i % 2) * 0.04); g.add(p); } return done(g, -0.14, 0.14, -0.14, 0.14); }

// a furnished workstation: desk + chair + computer + phone (+ optional partition behind). Reused by the interiors kit.
export function makeWorkstation({ kind = 'crt', screen = 'doc', partition = false, seed = 1 } = {}) {
  const g = new THREE.Group(); g.name = 'workstation'; const d = makeOfficeDesk({}); g.add(d); const ch = makeOfficeChair({ fabric: seed % 2 ? ['fb_denim', '#2a3a5a'] : ['fb_velour', '#5a2a2a'] }); ch.position.set(-0.15, 0, 0.7); ch.rotation.y = Math.PI + (seed % 3 - 1) * 0.3; g.add(ch);
  const c = makeComputer({ kind, screen }); c.position.set(-0.3, 0.745, 0.02); g.add(c); const p = makeDeskPhone(); p.position.set(0.45, 0.745, -0.15); p.rotation.y = -0.3; g.add(p);
  for (let k = 0; k < 4; k++) box(0.21, 0.004, 0.29, plain('#f6f4ea', { roughness: 0.9 }), 0.38, 0.747 + k * 0.004, 0.18, g).rotation.y = 0.1 * k;   // a stack of paper
  cyl(0.035, 0.03, 0.09, plain(['#c83a32', '#2a5a8a', '#e8e2d4'][seed % 3], { roughness: 0.35 }), 0.1, 0.79, -0.22, g, 14);                        // mug
  if (partition) { const pa = makePartition({ w: 1.6 }); pa.position.set(0, 0, -0.45); g.add(pa); }
  g.userData.collider = [-0.78, 0.78, -0.5, 1.0]; return g;
}

// ---- Nestwell Office: 11 x 9 m, open front at -z, back wall at +z
export function makeOfficeShowroom() {
  const g = new THREE.Group(); g.name = 'office_showroom'; const cols = [], W = 11, D = 9, H = 3.1, x0 = -W / 2, z0 = -D / 2, FY = 0.15, PI = Math.PI;
  const put = (o, x, z, ry = 0) => { o.position.set(x, FY, z); o.rotation.y = ry; g.add(o); const c = o.userData.collider; if (c) { const cs = Math.cos(ry), sn = Math.sin(ry); const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([px, pz]) => [x + px * cs + pz * sn, z - px * sn + pz * cs]); cols.push([Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]); } return o; };
  const wall = mat('sg_plaster', { to: '#cfd2cc', rough: 0.9 });
  box(W, FY, D, mat('lot_concrete', { to: '#8a8882' }), 0, FY / 2, 0, g, 2); flat(x0, -x0, z0, -z0, FY + 0.002, mat('dn_carpet', { to: '#4a5560', rough: 1 }), g, 1.2);
  box(W, H, 0.2, wall, 0, FY + H / 2, D / 2 - 0.1, g, 2.4); for (const s of [-1, 1]) box(0.2, H, D, wall, s * (W / 2 - 0.1), FY + H / 2, 0, g, 2.4);
  box(W + 0.5, 0.22, D + 0.6, mat('lot_concrete', { to: '#5a5a5c' }), 0, FY + H + 0.11, 0, g, 2); flat(x0 + 0.2, -x0 - 0.2, z0, -z0 - 0.2, FY + H - 0.002, mat('b82_speckle', { to: '#e4e0d8', side: THREE.DoubleSide }), g, 1.2);
  for (const x of [x0 + 0.15, -x0 - 0.15]) box(0.3, H, 0.3, wall, x, FY + H / 2, z0 + 0.15, g, 2.4);
  const st = canvasT(1024, 160, (x, w, h) => { x.fillStyle = '#23302a'; x.fillRect(0, 0, w, h); x.fillStyle = '#efe6d0'; fitText(x, 'Nestwell Office', w / 2, 86, w - 80, 92, F.script || F.heavy); });
  { const sm = new THREE.MeshStandardMaterial({ map: st, emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 0.55, roughness: 0.6 }), dk = plain('#23302a'); const s = new THREE.Mesh(new THREE.BoxGeometry(7, 1.0, 0.12), [dk, dk, dk, dk, dk, sm]); s.position.set(0, FY + H + 0.75, z0 - 0.05); g.add(s); }
  cols.push([x0, -x0, D / 2 - 0.25, D / 2], [x0, x0 + 0.25, z0, D / 2], [-x0 - 0.25, -x0, z0, D / 2]);
  // strip lights
  for (const x of [-2.6, 2.6]) { const l = new THREE.PointLight('#f0f4ff', 14, 11, 1.5); l.position.set(x, FY + H - 0.4, 0.3); g.add(l); const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.3, 2.5), toneMapped: false })); d.position.set(x, FY + H - 0.03, 0.3); g.add(d); }
  // two pairs of facing workstations with a partition between each pair
  let k = 0; for (const x of [-3.0, -1.0]) for (const [z, ry] of [[1.9, 0], [0.35, PI]]) { put(makeWorkstation({ kind: k % 2 ? 'flat' : 'crt', screen: k % 2 ? 'sheet' : 'doc', seed: ++k }), x + (ry ? 0 : 0), z, ry + PI); }
  put(makePartition({ w: 1.6 }), -3.0, 1.125); put(makePartition({ w: 1.6 }), -1.0, 1.125); put(makePartition({ w: 1.6, h: 1.5 }), -2.0, 1.125, PI / 2).scale.z = 1;
  // back wall: filing cabinets, whiteboard, cork board; copier + cooler on the east wall; meeting corner
  for (let i = 0; i < 3; i++) put(makeFilingCabinet({ drawers: i === 2 ? 2 : 4, color: ['#8a8c84', '#6a7a6a', '#8a8c84'][i] }), x0 + 0.6 + i * 0.5, D / 2 - 0.2 - 0.33, PI);
  { const wb = makeWhiteboard({}); wb.position.set(-0.6, FY, D / 2 - 0.215); wb.rotation.y = PI; g.add(wb); const cb = makeCorkBoard({}); cb.position.set(2.1, FY, D / 2 - 0.212); cb.rotation.y = PI; g.add(cb); }
  put(makeCopier(), -x0 - 0.2 - 0.36, 2.4, -PI / 2); put(makeWaterCooler(), -x0 - 0.2 - 0.2, 0.9, -PI / 2); put(makeWasteBin(), -x0 - 0.5, 1.5); put(makeWasteBin(), -2.0, 2.9);
  put(makeRug({ w: 2.6, d: 2.0, fabric: ['dn_carpet', '#6a4a3a'], border: '#c8c0b0' }), 3.0, -1.6); put(makeSofa({ seats: 2, fabric: ['op_leather', '#3a3230'], cushions: [] }), 3.0, -0.5, PI); put(makeCoffeeTable({ wood: 'black', w: 0.9 }), 3.0, -1.7); put(makeSofa({ seats: 1, fabric: ['op_leather', '#3a3230'], cushions: [] }), 4.4, -1.7, -PI / 2);
  put(makeBookshelf({ wood: 'black', seed: 14, w: 1.0 }), 3.6, D / 2 - 0.4, PI); put(makeLamp({ kind: 'floor', shade: '#e8e0d0' }), 1.5, -0.4);
  g.userData = { colliders: cols, area: { minX: x0 + 0.3, maxX: -x0 - 0.3, minZ: z0 - 1.5, maxZ: D / 2 - 0.3 }, floorY: FY };
  return g;
}
