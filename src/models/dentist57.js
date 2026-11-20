// Dentist office waiting room (queue item 57, photos/dentist/dentist01..15) on its lot on Cedar Avenue.
// Practice name made up: BRIGHTWATER DENTAL. Surfaces are the photos' own (tools/tex_57.py): herringbone carpet,
// walnut counter top, tan + grey leather, ribbed cabinet glass, the framed forest photo, the cube table's wood,
// the coffee table's rustic top and the tooth figurine's face (the cow pumpkin's patches are painted in its colours).
//   makeDentistOffice()  local frame: 22 m wide (x -11..11) x 26 m deep (z -13..13), the glass storefront at
//     z = +13 facing the street, floor y = 0. The waiting room fills z 0.3..13; behind the back partition (z < 0)
//     is kept for the treatment rooms (queue item 58) behind a closed door.
//     userData: colliders [[x0, x1, z0, z1]] (local), areas (local rects), door {x0, x1}
// Exported pieces for the model viewer: makeMassageChair, makeLoungeChair, makeTanSofa, makeStackChair,
// makeWireCoffeeTable, makeCubeTable, makeCoffeeCabinet, makeReceptionCounter, makeToothFigurine, makeCowPumpkin,
// makeFlaskPlant, makeFakeBamboo, makeWaitingTV
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = `${name}|${rx}|${ry}`; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BLACK = () => std({ color: '#141516', roughness: 0.45, metalness: 0.3 });
const leather = (name, rep = 1.5) => std({ map: tex(name, rep, rep), roughness: 0.42 });

// ---- seating ---------------------------------------------------------------------------------------------------
// massage chair: black leather shell, tall rounded back with side wings, leg-rest sloping to the floor
export function makeMassageChair() {
  const g = new THREE.Group(); g.name = 'massage_chair';
  const blk = std({ color: '#121314', roughness: 0.35 }), pad = std({ color: '#1e1f21', roughness: 0.5 }), trim = std({ color: '#5a5c60', metalness: 0.6, roughness: 0.3 });
  rbox(0.78, 0.18, 1.0, 0.06, blk, 0, 0.1, 0, g);                                  // base
  rbox(0.56, 0.16, 0.62, 0.06, pad, 0, 0.5, 0.05, g);                              // seat
  const back = rbox(0.58, 0.95, 0.2, 0.08, pad, 0, 0.98, -0.32, g); back.rotation.x = -0.28;
  for (const s of [-1, 1]) {
    const wing = rbox(0.13, 1.25, 0.95, 0.06, blk, s * 0.36, 0.78, -0.12, g); wing.rotation.x = -0.12;   // side shells
    rbox(0.16, 0.12, 0.62, 0.05, blk, s * 0.37, 0.66, 0.12, g);                     // armrests
    box(0.01, 0.5, 0.3, trim, s * 0.43, 0.6, -0.2, g);
  }
  const leg = rbox(0.5, 0.55, 0.18, 0.06, blk, 0, 0.3, 0.48, g); leg.rotation.x = 0.55;   // calf/foot rest
  for (const s of [-1, 1]) rbox(0.2, 0.42, 0.06, 0.03, pad, s * 0.12, 0.3, 0.53, g).rotation.x = 0.55;
  const head = rbox(0.42, 0.22, 0.12, 0.05, pad, 0, 1.38, -0.42, g); head.rotation.x = -0.28;
  const remote = box(0.05, 0.12, 0.02, std({ color: '#222', roughness: 0.3 }), 0.44, 0.75, 0.25, g); remote.rotation.x = -0.3;
  g.userData.collider = [-0.45, 0.45, -0.55, 0.7];
  return g;
}
// grey leather lounge chair on a black square-tube sled frame
export function makeLoungeChair() {
  const g = new THREE.Group(); g.name = 'lounge_chair';
  const fr = BLACK(), lea = leather('dn_grey', 1.2); lea.color.set('#a9a7a2');
  for (const s of [-1, 1]) {
    const x = s * 0.34;
    rod(V(x, 0.02, -0.38), V(x, 0.02, 0.36), 0.014, fr, g); rod(V(x, 0.02, 0.36), V(x, 0.6, 0.3), 0.014, fr, g);   // runner + front post
    rod(V(x, 0.02, -0.38), V(x, 0.62, -0.33), 0.014, fr, g); rod(V(x, 0.6, 0.3), V(x, 0.62, -0.33), 0.014, fr, g);  // back post + arm
    box(0.06, 0.03, 0.55, fr, x, 0.63, 0.0, g);                                         // arm pad
  }
  rod(V(-0.34, 0.3, -0.34), V(0.34, 0.3, -0.34), 0.012, fr, g);
  rbox(0.62, 0.14, 0.62, 0.05, lea, 0, 0.4, 0.02, g);                                   // seat cushion
  const bk = rbox(0.62, 0.5, 0.13, 0.05, lea, 0, 0.72, -0.3, g); bk.rotation.x = -0.18;
  g.userData.collider = [-0.4, 0.4, -0.42, 0.4];
  return g;
}
export function makeTanSofa() {
  const g = new THREE.Group(); g.name = 'tan_sofa';
  const lea = leather('dn_tan', 1.5), wood = std({ color: '#5a3a1e', roughness: 0.5 });
  rbox(1.86, 0.24, 0.84, 0.05, lea, 0, 0.3, 0, g);
  for (const s of [-1, 1]) { rbox(0.86, 0.14, 0.64, 0.05, lea, s * 0.44, 0.48, 0.07, g); const b = rbox(0.86, 0.46, 0.18, 0.07, lea, s * 0.44, 0.72, -0.28, g); b.rotation.x = -0.12; rbox(0.16, 0.36, 0.84, 0.06, lea, s * 0.86, 0.52, 0, g); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = cyl(0.02, 0.014, 0.18, wood, sx * 0.84, 0.09, sz * 0.34, g, 8); l.rotation.z = sx * 0.12; }
  g.userData.collider = [-0.95, 0.95, -0.44, 0.44];
  return g;
}
// black fabric stacking chair: tube sled frame with arms, padded seat + back
export function makeStackChair() {
  const g = new THREE.Group(); g.name = 'stack_chair';
  const fr = BLACK(), fab = std({ color: '#1b1b1d', roughness: 0.95 });
  for (const s of [-1, 1]) { const x = s * 0.27; rod(V(x, 0.01, 0.25), V(x, 0.01, -0.25), 0.01, fr, g); rod(V(x, 0.01, 0.25), V(x, 0.62, 0.18), 0.01, fr, g); rod(V(x, 0.01, -0.25), V(x, 0.84, -0.3), 0.01, fr, g); rod(V(x, 0.62, 0.18), V(x, 0.62, -0.22), 0.01, fr, g); }
  rbox(0.5, 0.07, 0.46, 0.03, fab, 0, 0.46, 0.0, g);
  const bk = rbox(0.5, 0.36, 0.06, 0.03, fab, 0, 0.75, -0.26, g); bk.rotation.x = -0.12;
  g.userData.collider = [-0.3, 0.3, -0.3, 0.28];
  return g;
}
// ---- tables / cabinets -------------------------------------------------------------------------------------------
export function makeWireCoffeeTable() {
  const g = new THREE.Group(); g.name = 'wire_coffee_table';
  const fr = BLACK();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.035, 40), [std({ color: '#5a3a1e', roughness: 0.5 }), std({ map: tex('dn_rustic'), roughness: 0.5 }), std({ color: '#3a2412' })]); top.position.y = 0.45; top.castShadow = true; g.add(top);
  // geometric base: a pentagon ring at the top and a rotated one at the floor, zig-zag struts between
  const N = 5, rT = 0.3, rB = 0.27, ring = (r, y, off) => Array.from({ length: N }, (_, i) => V(Math.cos(i / N * 6.283 + off) * r, y, Math.sin(i / N * 6.283 + off) * r));
  const A = ring(rT, 0.43, 0), M = ring(0.36, 0.22, Math.PI / N), B = ring(rB, 0.01, 0);
  for (let i = 0; i < N; i++) { const j = (i + 1) % N; rod(A[i], A[j], 0.006, fr, g); rod(B[i], B[j], 0.006, fr, g); rod(A[i], M[i], 0.006, fr, g); rod(A[j], M[i], 0.006, fr, g); rod(B[i], M[i], 0.006, fr, g); rod(B[j], M[i], 0.006, fr, g); }
  // picture books with made-up titles
  const covers = [['THE BRAVE LITTLE MOLAR', '#2a8ad0', '#f2e24a'], ['OCEAN FRIENDS', '#1a9a6a', '#ffffff'], ['COUNTING STARS', '#c8262a', '#ffe6a8']];
  covers.forEach(([t, bg, ink], i) => {
    const ct = canvasT(256, 320, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.25)'; for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(30 + k * 36, 230 + (k % 2) * 30, 18, 0, 7); x.fill(); } x.fillStyle = ink; x.lineJoin = 'round'; x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 5; const words = t.split(' '); words.forEach((wd, k) => fitText(x, wd, w / 2, 50 + k * 46, w - 30, 40, F.heavy, { stroke: 1 })); if (i === 0) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(128, 250, 34, 40, 0, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(116, 244, 4, 0, 7); x.arc(140, 244, 4, 0, 7); x.fill(); } });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.018, 0.32), [std({ color: '#f2f0ea' }), std({ color: '#f2f0ea' }), std({ map: ct }), std({ color: bg }), std({ color: bg }), std({ color: bg })]);
    b.position.set(-0.04 + i * 0.03, 0.477 + i * 0.019, 0.02 - i * 0.02); b.rotation.y = 0.25 - i * 0.3; b.castShadow = true; g.add(b);
  });
  g.userData.collider = [-0.42, 0.42, -0.42, 0.42];
  return g;
}
export function makeCubeTable() {
  const g = new THREE.Group(); g.name = 'cube_table';
  const w = std({ map: tex('dn_cube', 1, 1), roughness: 0.55 });
  box(0.46, 0.5, 0.46, w, 0, 0.25, 0, g);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.006, 0.28), std({ map: canvasT(210, 280, (x, ww, hh) => { x.fillStyle = '#5a5ab8'; x.fillRect(0, 0, ww, hh); x.fillStyle = '#f2e6a8'; x.beginPath(); x.arc(105, 150, 50, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'KIDS WORLD', 105, 34, 190, 30, F.heavy); }) }));
  mag.position.set(0.02, 0.503, 0); mag.rotation.y = 0.4; g.add(mag);
  g.userData.collider = [-0.25, 0.25, -0.25, 0.25];
  return g;
}
// black coffee cabinet with ribbed-glass doors, a pod coffee maker, a pod drawer, wire basket of snacks, sanitizer
export function makeCoffeeCabinet() {
  const g = new THREE.Group(); g.name = 'coffee_cabinet';
  const blk = std({ color: '#1c1d1f', roughness: 0.55 }), rib = std({ map: tex('dn_ribbed'), roughness: 0.15, metalness: 0.1 });
  box(0.8, 0.9, 0.4, blk, 0, 0.45, 0, g);
  for (const s of [-1, 1]) for (const y of [0.25, 0.65]) plane(0.28, 0.3, rib, s * 0.19, y, 0.201, 0, g);
  for (const s of [-1, 1]) box(0.012, 0.2, 0.02, std({ color: '#0c0c0c' }), s * 0.03, 0.45, 0.215, g);
  // pod coffee maker
  const cm = new THREE.Group(); cm.position.set(0.05, 0.98, -0.02); g.add(cm);
  const pl = std({ color: '#2a2b2e', roughness: 0.3, metalness: 0.4 }), sil = std({ color: '#b8bcc0', metalness: 0.8, roughness: 0.25 });
  rbox(0.2, 0.3, 0.3, 0.02, pl, 0, 0.15, 0, cm); rbox(0.2, 0.06, 0.32, 0.02, pl, 0, 0.33, 0.01, cm);
  box(0.16, 0.1, 0.02, sil, 0, 0.27, 0.16, cm); rbox(0.08, 0.26, 0.08, 0.02, std({ color: '#c8d8e0', transparent: true, opacity: 0.5, roughness: 0.1 }), 0.13, 0.15, -0.06, cm);
  box(0.12, 0.01, 0.1, sil, 0, 0.04, 0.12, cm);
  // pod drawer + wire basket + sanitizer
  const dr = new THREE.Group(); dr.position.set(0.05, 0.92, 0); g.add(dr); box(0.3, 0.07, 0.3, std({ color: '#1a1a1a', metalness: 0.5, roughness: 0.4 }), 0, 0, 0, dr);
  box(0.29, 0.01, 0.29, std({ map: tex('dn_rustic'), roughness: 0.5 }), 0, 0.04, 0, dr);
  const bk = new THREE.Group(); bk.position.set(-0.27, 0.99, 0); g.add(bk); const wire = std({ color: '#111', metalness: 0.6 });
  for (let i = 0; i <= 4; i++) { rod(V(-0.11 + i * 0.055, -0.07, -0.08), V(-0.11 + i * 0.055, 0.07, -0.08), 0.003, wire, bk); rod(V(-0.11 + i * 0.055, -0.07, 0.08), V(-0.11 + i * 0.055, 0.07, 0.08), 0.003, wire, bk); }
  for (const y of [-0.07, 0.07]) { rod(V(-0.11, y, -0.08), V(0.11, y, -0.08), 0.003, wire, bk); rod(V(-0.11, y, 0.08), V(0.11, y, 0.08), 0.003, wire, bk); rod(V(-0.11, y, -0.08), V(-0.11, y, 0.08), 0.003, wire, bk); rod(V(0.11, y, -0.08), V(0.11, y, 0.08), 0.003, wire, bk); }
  ['#d8a24a', '#c8262a', '#e8e0c8', '#4a8ad0'].forEach((c, i) => { const s = box(0.08, 0.05, 0.05, std({ color: c, roughness: 0.4 }), -0.06 + (i % 2) * 0.1, -0.03 + Math.floor(i / 2) * 0.04, -0.02 + (i % 3) * 0.02, bk); s.rotation.z = 0.2 * i; });
  const san = cyl(0.03, 0.03, 0.15, std({ color: '#a8d8f0', transparent: true, opacity: 0.6, roughness: 0.1 }), 0.33, 0.98, 0.05, g); void san; cyl(0.008, 0.008, 0.05, std({ color: '#f2f2f2' }), 0.33, 1.08, 0.05, g);
  g.userData.collider = [-0.42, 0.42, -0.22, 0.22];
  return g;
}
// reception counter: black base, walnut top with a raised transaction ledge, brochure holders
export function makeReceptionCounter(L = 5.4) {
  const g = new THREE.Group(); g.name = 'reception_counter';
  const blk = std({ color: '#151618', roughness: 0.5 }), top = std({ map: tex('dn_walnut', L / 1.2, 0.5), roughness: 0.35 });
  box(L, 1.05, 0.7, blk, 0, 0.525, 0, g);
  box(L + 0.1, 0.05, 0.42, top, 0, 1.08, 0.22, g);                                 // raised ledge on the waiting side
  box(L, 0.04, 0.6, top, 0, 0.76, -0.62, g);                                        // desk on the staff side
  box(L, 0.76, 0.05, blk, 0, 0.38, -0.9, g);
  // "Treasure!" sign (redrawn): a chest of coins and an arrow pointing to the prize drawer
  const ts = canvasT(256, 330, (x, w, h) => { x.fillStyle = '#f8f6f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, 'Treasure!', w / 2, 52, w - 30, 52, F.marker); x.fillStyle = '#8a5a2a'; x.fillRect(70, 120, 116, 70); x.fillStyle = '#6a3a1a'; x.beginPath(); x.ellipse(128, 120, 58, 34, 0, Math.PI, 0); x.fill(); x.fillStyle = '#f2c21a'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(60 + i * 17, 196 + (i % 2) * 6, 12, 6, 0, 0, 7); x.fill(); } x.fillStyle = '#d8a01a'; x.fillRect(118, 140, 20, 18); x.fillStyle = '#222'; x.beginPath(); x.moveTo(128, 300); x.lineTo(100, 255); x.lineTo(118, 255); x.lineTo(118, 230); x.lineTo(138, 230); x.lineTo(138, 255); x.lineTo(156, 255); x.closePath(); x.fill(); x.strokeStyle = '#c81e28'; x.lineWidth = 6; x.beginPath(); x.arc(30, 30, 18, 0, 7); x.stroke(); });
  plane(0.26, 0.34, std({ map: ts, roughness: 0.8 }), 1.4, 0.72, 0.352, 0, g);
  // clear acrylic brochure holders on the ledge
  const acr = std({ color: '#e8f2f4', transparent: true, opacity: 0.3, roughness: 0.05 });
  [['#2a6ac8', 'SMILE CARE'], ['#1a8a6a', 'ORTHO 101'], ['#c8a01a', 'SLEEP WELL']].forEach(([c, t], i) => {
    const h = new THREE.Group(); h.position.set(-1.8 + i * 0.28, 1.1, 0.3); g.add(h);
    box(0.24, 0.2, 0.08, acr, 0, 0.1, 0, h);
    const br = canvasT(128, 200, (x, w, hh) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, hh); x.fillStyle = c; x.fillRect(0, 0, w, 70); x.fillStyle = '#fff'; fitText(x, t, w / 2, 36, w - 10, 22, F.label); x.fillStyle = '#999'; for (let k = 0; k < 6; k++) x.fillRect(12, 90 + k * 16, w - 24, 5); });
    const p = plane(0.2, 0.26, std({ map: br }), 0, 0.15, 0.01, 0, h); p.rotation.x = -0.15;
  });
  // monitor + keyboard on the staff side
  const mon = new THREE.Group(); mon.position.set(-0.6, 0.78, -0.7); g.add(mon);
  box(0.55, 0.34, 0.03, std({ color: '#111' }), 0, 0.32, 0, mon); plane(0.5, 0.29, std({ color: '#cfe0f0', emissive: '#6a8ab0', emissiveIntensity: 0.6 }), 0, 0.32, 0.016, 0, mon); cyl(0.02, 0.02, 0.15, std({ color: '#222' }), 0, 0.08, 0, mon);
  box(0.42, 0.02, 0.14, std({ color: '#1a1a1a' }), 0, 0.01, 0.22, mon);
  g.userData.collider = [-L / 2, L / 2, -0.95, 0.45];
  return g;
}
// ---- little things on the counter ---------------------------------------------------------------------------------
// smiling tooth figurine: white tooth (two roots) with the photo's face, black wire arms + legs, glove hands, shoes
export function makeToothFigurine() {
  const g = new THREE.Group(); g.name = 'tooth_figurine';
  const wht = std({ color: '#f2f0ea', roughness: 0.35 }), cream = std({ color: '#f4ecc8', roughness: 0.4 }), wire = std({ color: '#111', roughness: 0.4 });
  const s = new THREE.Shape(); // front outline, metres (0.22 tall incl. legs)
  s.moveTo(-0.045, 0.06); s.bezierCurveTo(-0.05, 0.11, -0.065, 0.15, -0.06, 0.19); s.bezierCurveTo(-0.055, 0.215, -0.035, 0.22, -0.025, 0.21); s.bezierCurveTo(-0.012, 0.222, 0.0, 0.205, 0.008, 0.215); s.bezierCurveTo(0.02, 0.225, 0.04, 0.22, 0.05, 0.21); s.bezierCurveTo(0.064, 0.19, 0.06, 0.15, 0.05, 0.11); s.bezierCurveTo(0.045, 0.085, 0.042, 0.07, 0.038, 0.06); s.bezierCurveTo(0.03, 0.05, 0.015, 0.05, 0.008, 0.075); s.bezierCurveTo(0.0, 0.09, -0.01, 0.09, -0.015, 0.075); s.bezierCurveTo(-0.022, 0.05, -0.04, 0.05, -0.045, 0.06);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 5, curveSegments: 24 }), wht); body.position.z = -0.02; body.castShadow = true; g.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.04), std({ map: tex('dn_toothface'), roughness: 0.35, transparent: true })); face.position.set(0.004, 0.16, 0.0385); g.add(face);
  for (const sd of [-1, 1]) {
    rod(V(sd * 0.05, 0.15, 0.0), V(sd * 0.1, 0.165, 0.01), 0.002, wire, g);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), cream); hand.scale.set(1.1, 0.9, 0.7); hand.position.set(sd * 0.112, 0.168, 0.012); g.add(hand);
    rod(V(sd * 0.025, 0.055, 0.0), V(sd * 0.03, 0.012, 0.0), 0.002, wire, g);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), cream); shoe.scale.set(1.2, 0.55, 1.3); shoe.position.set(sd * 0.032, 0.009, 0.008); g.add(shoe);
  }
  return g;
}
// cow-painted pumpkin: the photo's brown pumpkin with black/white patches, snout, ears, little legs
export function makeCowPumpkin() {
  const g = new THREE.Group(); g.name = 'cow_pumpkin';
  const geo = new THREE.SphereGeometry(0.16, 40, 24); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x); const rib = 1 + 0.05 * Math.cos(a * 10); p.setXYZ(i, x * rib * 1.15, y * 0.82, z * rib); }
  geo.computeVertexNormals();
  // cow patches in the photo's colours (the photo itself smears around a sphere): chestnut pumpkin, black blobs
  const t = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#6a3420'; x.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) { x.fillStyle = 'rgba(40,16,8,0.35)'; x.fillRect(i * 25.6, 0, 3, h); }
    const r = (k) => (Math.sin(k * 12.9898) * 43758.5453) % 1; x.fillStyle = '#141010';
    for (let i = 0; i < 13; i++) { const cx = Math.abs(r(i + 1)) * w, cy = 40 + Math.abs(r(i + 7)) * (h - 80), rr = 14 + Math.abs(r(i + 3)) * 26; x.beginPath(); for (let a = 0; a < 6.3; a += 0.4) { const q = rr * (0.7 + 0.4 * Math.abs(r(i * 9 + a))); x.lineTo(cx + Math.cos(a) * q * 1.3, cy + Math.sin(a) * q); } x.fill(); } });
  const body = new THREE.Mesh(geo, std({ map: t, roughness: 0.6 })); body.position.y = 0.17; body.rotation.y = -Math.PI / 2; body.castShadow = true; g.add(body);
  const brown = std({ color: '#5a2e18', roughness: 0.6 }), blk = std({ color: '#1a1414', roughness: 0.6 });
  const snout = cyl(0.055, 0.06, 0.06, brown, 0.19, 0.16, 0, g, 20); snout.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const n = cyl(0.008, 0.008, 0.01, blk, 0.222, 0.165, s * 0.02, g, 8); n.rotation.z = Math.PI / 2; const e = cyl(0.04, 0.04, 0.012, std({ color: '#f2ece0' }), 0.06, 0.29, s * 0.11, g, 16); e.rotation.x = Math.PI / 2 - s * 0.4; }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.025, 0.028, 0.06, sx > 0 ? blk : brown, sx * 0.09, 0.03, sz * 0.08, g, 10);
  const stem = cyl(0.012, 0.018, 0.05, std({ color: '#4a5a2a' }), -0.02, 0.32, 0, g, 8); stem.rotation.z = 0.3;
  return g;
}
// Erlenmeyer flask of water with a rooted cutting of big heart leaves
export function makeFlaskPlant() {
  const g = new THREE.Group(); g.name = 'flask_plant';
  const prof = [V(0.0, 0, 0), V(0.1, 0, 0), V(0.105, 0.01, 0), V(0.035, 0.2, 0), V(0.028, 0.24, 0), V(0.032, 0.25, 0)].map((v) => new THREE.Vector2(v.x, v.y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), new THREE.MeshPhysicalMaterial({ color: '#e8f4f2', roughness: 0.03, transmission: 0.0, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })); g.add(glass);
  const wprof = [new THREE.Vector2(0, 0.005), new THREE.Vector2(0.097, 0.008), new THREE.Vector2(0.06, 0.11), new THREE.Vector2(0, 0.11)];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(wprof, 32), std({ color: '#c8e0d8', transparent: true, opacity: 0.35, roughness: 0.05 })));
  const root = std({ color: '#d8d2b8', roughness: 0.8 });
  for (let i = 0; i < 9; i++) { const a = i * 0.7; rod(V(0, 0.2, 0), V(Math.cos(a) * 0.05, 0.03 + (i % 3) * 0.02, Math.sin(a) * 0.05), 0.0015, root, g, 4); }
  const stemM = std({ color: '#4a7a2a', roughness: 0.6 });
  const leafT = canvasT(128, 160, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#3a7a2a'; x.beginPath(); x.moveTo(64, 155); x.bezierCurveTo(5, 120, 0, 40, 40, 10); x.quadraticCurveTo(64, 30, 64, 30); x.quadraticCurveTo(64, 30, 88, 10); x.bezierCurveTo(128, 40, 123, 120, 64, 155); x.fill(); x.strokeStyle = '#7ab05a'; x.lineWidth = 2; x.beginPath(); x.moveTo(64, 150); x.lineTo(64, 35); x.stroke(); });
  const leafM = std({ map: leafT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.5 });
  [[0.0, 0.5, 0.05, 0.3, 0.2], [-0.12, 0.42, 0.03, -0.5, 0.18], [0.1, 0.62, -0.02, 0.6, 0.24], [0.05, 0.36, 0.08, 1.2, 0.14]].forEach(([x, y, z, ry, s]) => {
    rod(V(0, 0.24, 0), V(x * 0.7, y - s * 0.4, z), 0.004, stemM, g, 5);
    const lf = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.8, s), leafM); lf.position.set(x, y, z); lf.rotation.set(-0.4, ry, 0.2); g.add(lf);
  });
  return g;
}
export function makeFakeBamboo() {
  const g = new THREE.Group(); g.name = 'fake_bamboo';
  cyl(0.2, 0.16, 0.35, std({ color: '#e8e6e0', roughness: 0.4 }), 0, 0.175, 0, g, 24);
  const cane = std({ color: '#c8b860', roughness: 0.5 });
  const lt = canvasT(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = ['#2a7a2a', '#3a8a32', '#4a9a3a'][i % 3]; x.save(); x.translate(Math.random() * w, Math.random() * h); x.rotate(Math.random() * 6); x.beginPath(); x.ellipse(0, 0, 40, 6, 0, 0, 7); x.fill(); x.restore(); } });
  const lm = std({ map: lt, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1, r = 0.06 + (i % 2) * 0.05, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 1.6 + (i % 3) * 0.25;
    cyl(0.012, 0.014, h, cane, x, 0.35 + h / 2, z, g, 8);
    for (let k = 1; k < 5; k++) cyl(0.016, 0.016, 0.02, std({ color: '#a89840' }), x, 0.35 + k * h / 5, z, g, 8);
    for (let k = 0; k < 3; k++) { const p = plane(0.55, 0.55, lm, x, 0.35 + h * (0.55 + k * 0.17), z, a + k, g); p.rotation.x = 0.3; }
  }
  return g;
}
// wall TV with a made-up kids' program
export function makeWaitingTV(kind = 0, w = 1.65) {
  const g = new THREE.Group(); g.name = 'waiting_tv';
  const h = w * 9 / 16;
  box(w + 0.04, h + 0.04, 0.05, std({ color: '#0c0c0e', roughness: 0.3 }), 0, 0, 0, g);
  const scr = canvasT(640, 360, (x, W, H) => {
    if (kind === 0) {   // "TOOTH TOWN" cartoon: a tooth hero with a toothbrush under a sun, a title band
      const sk = x.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#5ac8f0'); sk.addColorStop(1, '#bfeaf8'); x.fillStyle = sk; x.fillRect(0, 0, W, H);
      x.fillStyle = '#7ac84a'; x.beginPath(); x.ellipse(320, 400, 420, 130, 0, 0, 7); x.fill();
      x.fillStyle = '#ffd84a'; x.beginPath(); x.arc(560, 70, 40, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(250, 200, 62, 72, 0, 0, 7); x.fill(); x.fillRect(205, 220, 40, 70); x.fillRect(255, 220, 40, 70);
      x.fillStyle = '#111'; x.beginPath(); x.arc(230, 190, 7, 0, 7); x.arc(270, 190, 7, 0, 7); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 4; x.beginPath(); x.arc(250, 212, 20, 0.2, Math.PI - 0.2); x.stroke();
      x.fillStyle = '#2a8ad0'; x.save(); x.translate(340, 170); x.rotate(-0.6); x.fillRect(0, -6, 110, 12); x.fillStyle = '#fff'; x.fillRect(80, -20, 30, 14); x.restore();
      x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, H - 60, W, 60); x.fillStyle = '#ffe14a'; fitText(x, 'TOOTH TOWN · Brush Brush Brush!', W / 2, H - 30, W - 40, 32, F.heavy);
    } else if (kind === 1) {   // practice slides
      x.fillStyle = '#123a5a'; x.fillRect(0, 0, W, H); x.fillStyle = '#5ad0e8'; fitText(x, 'BRIGHTWATER DENTAL', W / 2, 70, W - 60, 46, F.heavy, { spacing: 4 });
      x.fillStyle = '#fff'; ['Ask us about clear aligners', 'Snoring? Ask about sleep care', 'Kids 12 & under: prize drawer!'].forEach((t, i) => fitText(x, '• ' + t, W / 2, 150 + i * 60, W - 80, 30, F.label));
      x.fillStyle = '#5ad0e8'; fitText(x, '(555) 017-2264', W / 2, H - 34, 400, 30, F.label);
    } else {   // nature program
      const sk = x.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#f2a86a'); sk.addColorStop(1, '#3a5a7a'); x.fillStyle = sk; x.fillRect(0, 0, W, H);
      x.fillStyle = '#1a2a3a'; x.beginPath(); x.moveTo(0, H); x.lineTo(150, 170); x.lineTo(260, 240); x.lineTo(400, 120); x.lineTo(640, H); x.fill();
      x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, H - 46, W, 46); x.fillStyle = '#fff'; fitText(x, 'WILD PEAKS  ·  episode 4', W / 2, H - 23, W - 40, 26, F.label);
    }
  });
  plane(w, h, new THREE.MeshStandardMaterial({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.9, roughness: 0.2 }), 0, 0, 0.027, 0, g);
  return g;
}
// console table under the big TV: lamp, potted fern, scarecrow doll, tissue box
function makeConsole() {
  const g = new THREE.Group(); g.name = 'console_table';
  const blk = BLACK();
  box(1.5, 0.03, 0.36, blk, 0, 0.78, 0, g); box(1.5, 0.02, 0.32, blk, 0, 0.12, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.025, 0.78, 0.025, blk, sx * 0.73, 0.39, sz * 0.16, g);
  const lamp = new THREE.Group(); lamp.position.set(-0.55, 0.8, 0); g.add(lamp);
  cyl(0.07, 0.09, 0.32, std({ color: '#8a8c90', roughness: 0.3, metalness: 0.4 }), 0, 0.16, 0, lamp, 20);
  cyl(0.17, 0.19, 0.28, std({ color: '#f2efe6', emissive: '#ffe8c0', emissiveIntensity: 0.8, roughness: 0.9, side: THREE.DoubleSide }), 0, 0.5, 0, lamp, 28);
  const fern = new THREE.Group(); fern.position.set(0.55, 0.8, 0); g.add(fern); cyl(0.09, 0.07, 0.14, std({ color: '#2a2a2a' }), 0, 0.07, 0, fern, 16);
  const fm = std({ color: '#3a7a2a', side: THREE.DoubleSide, roughness: 0.7 });
  for (let i = 0; i < 12; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.32), fm); f.geometry.translate(0, 0.16, 0); f.position.y = 0.13; f.rotation.set(0.6 + (i % 3) * 0.2, i * 0.52, 0); fern.add(f); }
  // scarecrow doll: straw body, plaid shirt, hat
  const sc = new THREE.Group(); sc.position.set(0.05, 0.8, 0.02); g.add(sc);
  cyl(0.05, 0.06, 0.14, std({ color: '#a8423a' }), 0, 0.1, 0, sc, 12); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), std({ color: '#d8c8a0' })); hd.position.y = 0.21; sc.add(hd);
  cyl(0.07, 0.07, 0.01, std({ color: '#3a2a1a' }), 0, 0.25, 0, sc, 14); cyl(0.035, 0.045, 0.05, std({ color: '#3a2a1a' }), 0, 0.28, 0, sc, 14);
  for (const s of [-1, 1]) { rod(V(s * 0.05, 0.14, 0), V(s * 0.1, 0.08, 0.02), 0.012, std({ color: '#d8b860' }), sc, 6); cyl(0.018, 0.018, 0.06, std({ color: '#3a4a7a' }), s * 0.025, 0.01, 0.02, sc, 8); }
  box(0.2, 0.09, 0.1, std({ color: '#f2f2ee' }), 0.3, 0.845, 0, g);
  return g;
}
// "WELCOME" pumpkin sign: white weathered wood pumpkin with a burlap bow and a black board
function makeWelcomeSign() {
  const t = canvasT(300, 300, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ece8de'; x.beginPath(); x.ellipse(150, 170, 140, 110, 0, 0, 7); x.fill(); x.strokeStyle = '#b8b2a4'; x.lineWidth = 5; for (const dx of [-60, 0, 60]) { x.beginPath(); x.ellipse(150 + dx * 0.4, 170, Math.abs(dx) > 0 ? 70 : 30, 108, 0, 0, 7); x.stroke(); } x.fillStyle = '#5a4a2a'; x.fillRect(140, 30, 20, 40); x.fillStyle = '#c8a878'; x.beginPath(); x.ellipse(120, 60, 40, 14, -0.4, 0, 7); x.ellipse(180, 60, 40, 14, 0.4, 0, 7); x.fill(); x.fillStyle = '#1e1e1e'; x.fillRect(30, 140, 240, 56); x.fillStyle = '#f2efe6'; fitText(x, 'WELCOME', 150, 170, 220, 40, F.roman, { spacing: 3 }); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), std({ map: t, transparent: true, alphaTest: 0.2 })); m.name = 'welcome_sign'; return m;
}
// fall wreath: ring of orange / gold / brown leaves
function makeWreath() {
  const g = new THREE.Group(); g.name = 'fall_wreath';
  const cols = ['#d86a1a', '#e8a82a', '#a8421a', '#c8902a', '#6a3a1a'];
  const leafG = new THREE.CircleGeometry(0.05, 6); leafG.scale(1, 0.55, 1);
  for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2 * 3, r = 0.2 + 0.05 * Math.sin(i * 2.3); const l = new THREE.Mesh(leafG, std({ color: cols[i % 5], side: THREE.DoubleSide })); l.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02 * Math.sin(i)); l.rotation.z = a + 1.2; g.add(l); }
  return g;
}
// redrawn generic cough-etiquette poster
function coughPoster() {
  return canvasT(300, 400, (x, w, h) => {
    x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a4aa8'; fitText(x, 'Cover', 95, 40, 120, 40, F.heavy); x.fillStyle = '#c81e28'; x.beginPath(); x.arc(160, 40, 18, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'your', 160, 41, 30, 13, F.label); x.fillStyle = '#2a4aa8'; fitText(x, 'Cough', 235, 40, 120, 40, F.heavy);
    x.fillStyle = '#444'; fitText(x, 'Stop the spread of germs', w / 2, 78, w - 30, 18, F.label);
    const pts = [[80, 150], [220, 150], [80, 270], [220, 270], [150, 350]];
    pts.forEach(([cx, cy], i) => { x.strokeStyle = '#c81e28'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 42, 0, 7); x.stroke(); x.fillStyle = '#e8c0a0'; x.beginPath(); x.arc(cx, cy - 6, 16, 0, 7); x.fill(); x.fillStyle = '#5a7ab8'; x.fillRect(cx - 18, cy + 10, 36, 20); x.fillStyle = '#333'; fitText(x, ['tissue', 'elbow', 'toss it', 'wash', 'sanitize'][i], cx, cy + 56, 90, 14, F.label); });
    x.strokeStyle = '#c81e28'; x.lineWidth = 2; x.beginPath(); x.moveTo(80, 150); x.lineTo(220, 150); x.lineTo(80, 270); x.lineTo(220, 270); x.lineTo(150, 350); x.stroke();
  });
}

// ---- the office -----------------------------------------------------------------------------------------------
export function makeDentistOffice() {
  const g = new THREE.Group(); g.name = 'dentist_office';
  const W = 22, D = 26, X0 = -11, X1 = 11, Z0 = -13, Z1 = 13, CH = 3.0, BH = 6.2;
  const white = std({ color: '#f2f1ec', roughness: 0.9 }), blackWall = std({ color: '#1c1d20', roughness: 0.85 }), trim = std({ color: '#2a2c30', roughness: 0.5, metalness: 0.4 });
  const ext = std({ map: tex('th_plaster', W / 1.6, BH / 1.6), roughness: 0.9 });
  // floor: carpet in the waiting room, plain behind the partition
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(W, 13), std({ map: tex('dn_carpet', W / 1.1, 13 / 1.1), roughness: 0.98 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.005, 6.5); carpet.receiveShadow = true; g.add(carpet);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, 13), std({ color: '#b8b0a2', roughness: 0.8 })); back.rotation.x = -Math.PI / 2; back.position.set(0, 0.004, -6.5); g.add(back);
  // exterior shell: side + back walls (inner faces white), roof
  for (const [x, ry] of [[X0, Math.PI / 2], [X1, -Math.PI / 2]]) { plane(D, CH, white, x + Math.sign(-x) * 0.01, CH / 2, 0, ry, g); plane(D, BH, ext, x - Math.sign(-x) * 0.01, BH / 2, 0, -ry, g); }
  plane(W, CH, white, 0, CH / 2, Z0 + 0.01, 0, g); plane(W, BH, ext, 0, BH / 2, Z0 - 0.01, Math.PI, g);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#2c2d30', roughness: 0.95 })); roof.rotation.x = -Math.PI / 2; roof.position.y = BH; g.add(roof);
  // ---- storefront: aluminum mullions, floor-to-ceiling glass, transom, frosted lettering, a glass double door
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#a8c0c8', roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  const GZ = Z1;
  const bays = [-11, -8.8, -6.6, -4.4, -2.2, -1.1, 1.1, 3.4, 5.7, 8.0, 11];   // door between -1.1 and 1.1
  for (const x of bays) box(0.1, 3.6, 0.14, trim, x, 1.8, GZ, g);
  box(W, 0.12, 0.16, trim, 0, 0.06, GZ, g); box(W, 0.1, 0.14, trim, 0, 2.7, GZ, g); box(W, 0.12, 0.16, trim, 0, 3.6, GZ, g);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(W, 3.5), glassM); glass.position.set(0, 1.8, GZ); g.add(glass);
  // frosted vinyl: the big name on the transom, a service band at waist height (white, semi-opaque)
  const frost = canvasT(2048, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(245,248,250,0.85)'; fitText(x, 'BRIGHTWATER   DENTAL', w / 2, 66, w - 200, 96, F.wayfind, { spacing: 30 }); });
  plane(W - 0.6, 0.75, std({ map: frost, emissive: '#ffffff', emissiveMap: frost, emissiveIntensity: 0.45, transparent: true, depthWrite: false, roughness: 0.6, side: THREE.DoubleSide }), 0, 3.15, GZ + 0.02, 0, g);
  const band = canvasT(2048, 80, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(235,240,242,0.55)'; x.fillRect(0, 10, w, 60); x.fillStyle = 'rgba(40,50,60,0.0)'; x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; fitText(x, 'FAMILY  ·  ORTHODONTICS  ·  IMPLANTS  ·  SLEEP APNEA  ·  KIDS WELCOME', w / 2, 42, w - 200, 38, F.wayfind, { spacing: 10 }); x.globalCompositeOperation = 'source-over'; });
  plane(W - 0.2, 0.32, std({ map: band, emissive: '#ffffff', emissiveMap: band, emissiveIntensity: 0.3, transparent: true, depthWrite: false, roughness: 0.6, side: THREE.DoubleSide }), 0, 1.25, GZ + 0.021, 0, g);
  // the double door: two glass leaves with pull bars, an OPEN-hours decal
  for (const s of [-1, 1]) { rod(V(s * 0.12, 0.9, GZ + 0.06), V(s * 0.12, 1.7, GZ + 0.06), 0.015, std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 }), g); }
  box(0.05, 2.6, 0.08, trim, 0, 1.3, GZ, g);
  const hours = canvasT(256, 200, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.9)'; fitText(x, 'OFFICE HOURS', w / 2, 24, 220, 22, F.label, { spacing: 2 }); ['Mon–Thu  8–5', 'Fri  8–2', 'Sat–Sun  closed'].forEach((t, i) => fitText(x, t, w / 2, 70 + i * 38, 220, 24, F.label)); });
  plane(0.42, 0.33, std({ map: hours, transparent: true, depthWrite: false }), -0.55, 1.55, GZ + 0.03, 0, g);
  // facade above the storefront: plaster parapet with a dark metal band and lit channel letters
  plane(W, BH - 3.66, ext, 0, 3.66 + (BH - 3.66) / 2, GZ + 0.08, 0, g);
  box(W + 0.2, 0.5, 0.2, trim, 0, 4.0, GZ + 0.15, g);
  const letters = canvasT(2048, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f4fbff'; fitText(x, 'BRIGHTWATER', w * 0.36, 120, 1250, 170, F.heavy, { spacing: 18 }); x.fillStyle = '#5ac8e8'; fitText(x, 'DENTAL', w * 0.82, 120, 560, 170, F.heavy, { spacing: 18 }); });
  plane(13, 1.6, std({ map: letters, transparent: true, emissive: '#ffffff', emissiveMap: letters, emissiveIntensity: 1.2, depthWrite: false }), 0, 5.0, GZ + 0.2, 0, g);
  box(W + 0.3, 0.2, 0.35, std({ color: '#d8d4cc' }), 0, BH + 0.1, GZ, g);
  // ---- interior walls: back partition (black accent behind reception), right wall black accent bays
  const PZ = 0.3, PX = 1.6;   // back partition (z) and the side partition to the orthodontics wing (x)
  plane(X1 + 7.15, CH, white, (X1 - 7.15) / 2, CH / 2, PZ, 0, g); plane(-6.05 - X0, CH, white, (X0 - 6.05) / 2, CH / 2, PZ, 0, g); plane(1.1, CH - 2.2, white, -6.6, 2.2 + (CH - 2.2) / 2, PZ, 0, g);
  box(4.6, CH, 0.02, blackWall, -0.9, CH / 2, PZ + 0.02, g);                                    // behind reception
  plane(Z1 - PZ, CH, white, PX - 0.01, CH / 2, (Z1 + PZ) / 2, -Math.PI / 2, g);
  plane(Z1 - PZ, CH, white, PX + 0.01, CH / 2, (Z1 + PZ) / 2, Math.PI / 2, g);
  const film = std({ color: '#e8eef0', transparent: true, opacity: 0.82, roughness: 0.7, side: THREE.DoubleSide });
  plane(X1 - PX - 0.2, 3.3, film, (X1 + PX) / 2, 1.75, GZ - 0.03, 0, g);                         // frosted film on the wing's glass
  const wing = canvasT(1024, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(40,60,70,0.85)'; fitText(x, 'ORTHODONTICS  &  SLEEP CENTER', w / 2, 64, w - 60, 52, F.wayfind, { spacing: 8 }); });
  plane(X1 - PX - 1.0, 0.4, std({ map: wing, transparent: true, depthWrite: false }), (X1 + PX) / 2, 2.0, GZ + 0.025, 0, g);
  box(0.02, CH, 3.8, blackWall, X0 + 0.02, CH / 2, 8.0, g);                                       // the big-TV accent wall
  box(0.6, CH, 1.4, blackWall, X0 + 0.3, CH / 2, 4.1, g);                                         // accent column (pilaster)
  // door to the treatment rooms (item 58): wood door in a black frame, closed
  // the door stands open into the treatment hallway (item 58)
  const door = new THREE.Group(); door.position.set(-7.15, 0, PZ); door.rotation.y = 1.45; g.add(door);
  box(1.1, 2.2, 0.05, std({ map: tex('dn_walnut', 1, 2), roughness: 0.4 }), 0.55, 1.1, -0.03, door);
  for (const zz of [0.02, -0.08]) cyl(0.012, 0.012, 0.16, std({ color: '#c8ccd0', metalness: 0.9 }), 0.95, 1.05, zz, door, 8).rotation.z = Math.PI / 2;
  box(1.24, 0.08, 0.08, trim, -6.6, 2.24, PZ + 0.03, g); for (const s of [-1, 1]) box(0.08, 2.24, 0.08, trim, -6.6 + s * 0.6, 1.12, PZ + 0.03, g);
  const tag = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#1c1d20'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e6e0'; fitText(x, 'TREATMENT ROOMS', w / 2, 33, 230, 26, F.wayfind, { spacing: 3 }); });
  plane(0.5, 0.125, std({ map: tag }), -5.6, 1.55, PZ + 0.03, 0, g);
  // ---- drop ceiling: 2x2 ft tiles, recessed lights, square diffusers, round speakers, a soffit along the glass
  const tileT = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(150,150,140,${Math.random() * 0.25})`; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } x.fillStyle = '#d8d8d2'; x.fillRect(0, 0, w, 4); x.fillRect(0, 0, 4, h); });
  tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(W / 0.61, 12.7 / 0.61);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, 12.7), std({ map: tileT, roughness: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CH, 6.65); g.add(ceil);
  const ceilB = new THREE.Mesh(new THREE.PlaneGeometry(W, 13), std({ color: '#ecebe6' })); ceilB.rotation.x = Math.PI / 2; ceilB.position.set(0, CH, -6.5); g.add(ceilB);
  box(W, 0.4, 1.0, white, 0, CH - 0.2, 12.45, g);                                                 // soffit at the glass
  const canM = std({ color: '#fffaf0', emissive: '#fff2d8', emissiveIntensity: 2.2 });
  for (const x of [-8.8, -5.6, -2.4, 0.4, 4, 8]) for (const z of [3, 6.4, 9.8]) { const c = cyl(0.09, 0.09, 0.02, canM, x, CH - 0.005, z, g, 20); c.castShadow = false; }
  const diffT = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8c8c2'; x.lineWidth = 3; for (let i = 1; i < 4; i++) x.strokeRect(i * 14, i * 14, w - i * 28, h - i * 28); });
  for (const [x, z] of [[-7.2, 4.7], [-1.0, 4.7], [-7.2, 8.2], [-1.0, 8.2]]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), std({ map: diffT })); d.rotation.x = Math.PI / 2; d.position.set(x, CH - 0.01, z); g.add(d); }
  const spkT = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#d0d0cc'; x.beginPath(); x.arc(64, 64, 50, 0, 7); x.fill(); x.fillStyle = '#9a9a96'; for (let i = 0; i < 400; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 48; x.fillRect(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 2, 2); } });
  for (const [x, z] of [[-4.0, 6.4], [-0.6, 10.6]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), std({ map: spkT })); s.rotation.x = Math.PI / 2; s.position.set(x, CH - 0.012, z); g.add(s); }
  // lights: warm-white room light (a few point lights) + the lamp
  for (const [x, z] of [[-7.5, 3.5], [-2.0, 3.5], [-7.5, 9.5], [-2.0, 9.5], [6.3, 6.5]]) { const l = new THREE.PointLight('#fff1dc', 2.6, 10, 1.4); l.position.set(x, 2.3, z); g.add(l); }

  // ---- furniture (local positions), with colliders
  const cols = [];
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); const c = o.userData.collider; if (c) { const cs = Math.abs(Math.cos(ry)) > 0.5; const [a, b, c0, c1] = c; cols.push(cs ? [x + Math.min(a, b), x + Math.max(a, b), z + Math.min(c0, c1), z + Math.max(c0, c1)] : [x + Math.min(c0, c1), x + Math.max(c0, c1), z + Math.min(a, b), z + Math.max(a, b)]); } return o; };
  // along the glass: black stacking chairs (left of the door as you face out) and the tan sofa
  for (let i = 0; i < 4; i++) put(makeStackChair(), -9.6 + i * 0.68, 12.1, Math.PI);
  put(makeTanSofa(), -4.6, 12.0, Math.PI);
  // the coffee cabinet + forest photo + cough poster on the right wall near the front
  put(makeCoffeeCabinet(), -6.4, 12.4, Math.PI);
  const ff = new THREE.Group(); ff.position.set(PX - 0.03, 1.8, 10.6); ff.rotation.y = -Math.PI / 2; g.add(ff);
  box(0.95, 1.1, 0.04, std({ color: '#3a2618', roughness: 0.5 }), 0, 0, 0, ff); plane(0.8, 0.95, std({ color: '#f4f2ec' }), 0, 0, 0.021, 0, ff); plane(0.6, 0.78, std({ map: tex('dn_forest') }), 0, 0, 0.023, 0, ff);
  plane(0.45, 0.6, std({ map: coughPoster(), roughness: 0.8 }), PX - 0.02, 1.6, 9.3, -Math.PI / 2, g);
  // big TV on the black accent wall, console + lamp under it; two grey lounge chairs + cube table facing it
  const tv = makeWaitingTV(0, 1.9); tv.position.set(X0 + 0.06, 1.85, 8.0); tv.rotation.y = Math.PI / 2; g.add(tv);
  put(makeConsole(), X0 + 0.25, 8.0, Math.PI / 2);
  put(makeLoungeChair(), -6.4, 9.0, -Math.PI / 2 - 0.3);
  put(makeLoungeChair(), -6.4, 7.0, -Math.PI / 2 + 0.3);
  put(makeCubeTable(), -6.6, 8.0);
  // accent column: second TV + WELCOME sign; two massage chairs, two grey chairs, black cabinet with a basket
  const tv2 = makeWaitingTV(1, 1.25); tv2.position.set(X0 + 0.62, 2.15, 4.1); tv2.rotation.y = Math.PI / 2; g.add(tv2);
  const ws = makeWelcomeSign(); ws.position.set(X0 + 0.62, 1.3, 4.1); ws.rotation.y = Math.PI / 2; g.add(ws);
  put(makeMassageChair(), X0 + 0.9, 6.0, Math.PI / 2);
  put(makeMassageChair(), X0 + 1.4, 2.6, Math.PI / 2);
  put(makeLoungeChair(), -3.9, 6.0, Math.PI);
  put(makeLoungeChair(), -2.9, 6.0, Math.PI);
  put(makeWireCoffeeTable(), -3.4, 7.4);
  put(makeLoungeChair(), -2.2, 9.6, Math.PI / 2 + 0.4);
  put(makeLoungeChair(), 0.3, 9.6, -Math.PI / 2 - 0.4);
  put(makeCubeTable(), -0.95, 10.1);
  const cab = new THREE.Group(); cab.name = 'basket_cabinet'; box(1.2, 0.82, 0.42, std({ color: '#151618', roughness: 0.5 }), 0, 0.41, 0, cab);
  const weave = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#c8a060'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a6a30'; x.lineWidth = 2; for (let i = 0; i < w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 6) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } });
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(4, 1);
  const bsk = cyl(0.3, 0.26, 0.18, std({ map: weave, roughness: 0.9, side: THREE.DoubleSide }), 0, 0.91, 0, cab, 24); bsk.scale.set(1.5, 1, 0.8); bsk.material.side = THREE.DoubleSide;
  const tc = makeToothFigurine(); tc.scale.setScalar(1.3); tc.position.set(0.3, 0.84, 0.05); cab.add(tc);
  cab.userData.collider = [-0.6, 0.6, -0.22, 0.22]; put(cab, X0 + 0.25, 1.2, Math.PI / 2);
  // reception counter in front of the black partition, with the cow pumpkin, the flask plant, the tooth figurine
  const rc = put(makeReceptionCounter(4.4), -1.0, 1.5);
  const cow = makeCowPumpkin(); cow.position.set(-1.25, 1.105, 0.25); cow.rotation.y = -0.4; rc.add(cow);
  const fl = makeFlaskPlant(); fl.position.set(-1.85, 1.105, 0.2); rc.add(fl);
  const tf = makeToothFigurine(); tf.position.set(1.5, 1.105, 0.22); tf.rotation.y = -0.2; rc.add(tf);
  // left wall: small TV with a nature show, fall wreath, thermostat + fake bamboo in the back corner
  const tv3 = makeWaitingTV(2, 1.1); tv3.position.set(PX - 0.06, 2.1, 6.4); tv3.rotation.y = -Math.PI / 2; g.add(tv3);
  const wr = makeWreath(); wr.position.set(PX - 0.05, 1.8, 12.0); wr.rotation.y = -Math.PI / 2; g.add(wr);
  const th = new THREE.Group(); th.position.set(PX - 0.03, 1.5, 3.4); th.rotation.y = -Math.PI / 2; g.add(th);
  box(0.13, 0.1, 0.02, std({ color: '#f2f2ee' }), 0, 0, 0, th); plane(0.07, 0.045, std({ color: '#9ab0a8', emissive: '#3a6a5a', emissiveIntensity: 0.6 }), 0, 0.005, 0.011, 0, th);
  box(0.2, 0.16, 0.08, std({ color: '#ffffff', transparent: true, opacity: 0.15, roughness: 0.05 }), 0, 0, 0.035, th);
  put(makeFakeBamboo(), PX - 0.5, 11.2);
  const fb = put(makeFakeBamboo(), -10.4, 12.3); fb.scale.setScalar(0.9);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: X0 + 0.25, maxX: PX - 0.25, minZ: PZ + 0.3, maxZ: Z1 - 0.2 }, { minX: -1.05, maxX: 1.05, minZ: Z1 - 0.4, maxZ: Z1 + 0.6 }];
  g.userData.door = { x0: -1.1, x1: 1.1 };
  return g;
}
