// Dentist treatment rooms (queue item 58, photos/dentist/operatory01..09), behind the waiting room's
// "TREATMENT ROOMS" door at Brightwater Dental. Surfaces from the photos (tools/tex_58.py): light-wood plank floor,
// taupe chair upholstery, tan stool leather, the tool chest's butcher-block top and the trees through the window.
// The tray's instruments are modelled from operatory06.
//   makeTreatmentWing()  same local frame as makeDentistOffice (waiting-room partition at z = 0.3): a hallway along
//     the partition (z -2.0..0.3), operatory 1 (x -11..-7.4) fully dressed from the photos, operatory 2
//     (x -7.4..-3.8) with a second chair. userData: colliders (local rects), areas (local rects)
// Pieces for the viewer: makeDentalChair, makeWallUnit, makeToolChest, makeMayoStand, makeSaddleStool,
// makeBucketStool, makeDeskFan
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
function tube(pts, r, mat, p, seg = 40) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 6), mat); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const chrome = () => std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 });
const WHITE = () => std({ color: '#f2f2ee', roughness: 0.35 });
// five-star caster base (stools, mayo stand)
function starBase(p, r = 0.3, y = 0.06) { const c = chrome(), blk = std({ color: '#1a1a1a' }); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; rod(V(0, y + 0.02, 0), V(Math.cos(a) * r, y, Math.sin(a) * r), 0.016, c, p); cyl(0.025, 0.025, 0.03, blk, Math.cos(a) * r, 0.025, Math.sin(a) * r, p, 10).rotation.z = Math.PI / 2; } }

// ---- the dental chair: one continuous upholstered couch (headrest -> reclined back -> seat -> leg rest sloping to a
// rounded foot end) built from a side profile and given its width, so every part is joined; white pedestal on a
// floor plate under the seat, chrome-stalk armrests, a clear sleeve over the foot end, the headrest pad in a plastic
// bag, the round foot control on a coiled cable, a floor power box. Head toward -z, foot toward +z.
export function makeDentalChair() {
  const g = new THREE.Group(); g.name = 'dental_chair';
  const wht = WHITE(), plate = std({ color: '#3a3c40', roughness: 0.5, metalness: 0.3 }), up = std({ map: tex('op_leather', 2.2, 2.2), roughness: 0.45 });
  const clear = std({ color: '#e8eef0', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false });
  // top-surface centre line along the chair (z, y) and the cushion thickness under it
  const top = new THREE.CatmullRomCurve3([V(-0.98, 0.93, 0), V(-0.7, 0.82, 0), V(-0.35, 0.68, 0), V(-0.08, 0.6, 0), V(0.2, 0.585, 0), V(0.38, 0.6, 0), V(0.75, 0.52, 0), V(1.08, 0.44, 0)]);
  const pts = top.getPoints(40), TH = 0.12, sh = new THREE.Shape();
  const nrm = (k) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); return [dy / l, -dx / l]; };   // downward normal
  pts.forEach((q, k) => (k ? sh.lineTo(q.x, q.y) : sh.moveTo(q.x, q.y)));
  const last = pts[pts.length - 1], [lnx, lny] = nrm(pts.length - 1);
  sh.quadraticCurveTo(last.x + 0.09, last.y - TH / 2, last.x + lnx * TH, last.y + lny * TH);                 // rounded foot end
  for (let k = pts.length - 1; k >= 0; k--) { const [nx, ny] = nrm(k); sh.lineTo(pts[k].x + nx * TH, pts[k].y + ny * TH); }
  sh.quadraticCurveTo(pts[0].x - 0.06, pts[0].y - TH / 2, pts[0].x, pts[0].y);
  const W = 0.54, geo = new THREE.ExtrudeGeometry(sh, { depth: W - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 4, curveSegments: 12 });
  geo.translate(0, 0, -(W - 0.08) / 2); geo.rotateY(-Math.PI / 2);   // profile x -> chair z, extrusion -> across the chair
  // the wider shoulders of the backrest: push the side faces out a little where z < -0.25
  const gp = geo.attributes.position; for (let k = 0; k < gp.count; k++) { const z = gp.getZ(k), x = gp.getX(k); if (z < -0.25) gp.setX(k, x * (1 + 0.12 * Math.min(1, (-0.25 - z) / 0.3))); }
  geo.computeVertexNormals();
  const couch = new THREE.Mesh(geo, up); couch.castShadow = true; couch.receiveShadow = true; g.add(couch);
  // headrest: a pad sitting on the top end of the back, joined to it, in a plastic bag
  const head = rbox(0.3, 0.08, 0.24, 0.035, up, 0, 0.97, -1.02, g); head.rotation.x = 0.35;
  const bag = rbox(0.34, 0.13, 0.3, 0.05, clear, 0, 0.97, -1.03, g); bag.rotation.x = 0.35; bag.castShadow = false;
  // pedestal + lift arm meeting the underside of the seat
  rbox(0.62, 0.04, 1.3, 0.02, plate, 0, 0.02, 0.1, g);
  rbox(0.4, 0.44, 0.55, 0.06, wht, 0, 0.24, -0.05, g);
  rbox(0.34, 0.08, 0.62, 0.035, wht, 0, 0.46, 0.08, g);
  // armrests on chrome stalks rising from the seat sides
  for (const s of [-1, 1]) { rod(V(s * 0.28, 0.55, 0.0), V(s * 0.33, 0.76, -0.02), 0.012, chrome(), g); rbox(0.07, 0.04, 0.32, 0.015, std({ color: '#5a4a3a', roughness: 0.4 }), s * 0.33, 0.78, -0.02, g); }
  // clear sleeve over the foot end, following the leg-rest slope
  const sleeve = rbox(W + 0.04, 0.17, 0.32, 0.05, clear, 0, 0.42, 0.98, g); sleeve.rotation.x = 0.24; sleeve.castShadow = false;
  // foot control on its coiled cable
  const fc = new THREE.Group(); fc.position.set(0.55, 0, 0.75); g.add(fc);
  cyl(0.15, 0.17, 0.05, std({ color: '#141414', roughness: 0.5 }), 0, 0.025, 0, fc, 28); cyl(0.07, 0.07, 0.02, std({ color: '#9a9ea0', metalness: 0.5 }), 0, 0.06, 0, fc, 20);
  const cable = std({ color: '#c8c8c4', roughness: 0.5 }); const cp = [];
  for (let k = 0; k <= 50; k++) { const t = k / 50, a = t * 6.283 * 2.5; cp.push(V(0.55 - t * 0.4 + Math.cos(a) * 0.1 * (1 - t), 0.015, 0.75 - t * 0.6 + Math.sin(a) * 0.1 * (1 - t))); }
  tube(cp, 0.008, cable, g, 120);
  rbox(0.18, 0.12, 0.26, 0.02, wht, -0.36, 0.06, -0.2, g);
  g.userData.collider = [-0.4, 0.4, -1.15, 1.2];
  return g;
}
// ---- the white wall unit: a tall built-in tower with an open top cabinet, a black panel of small icons, a monitor with
// a made-up colour-coded schedule, a keyboard shelf, a water flosser, delivery hoses hanging down
export function makeWallUnit() {
  const g = new THREE.Group(); g.name = 'wall_unit';
  const wht = WHITE(), blk = std({ color: '#141518', roughness: 0.4 });
  const W = 1.0, H = 2.5, D = 0.4;
  box(0.06, H, D, wht, -W / 2, H / 2, 0, g); box(0.06, H, D, wht, W / 2, H / 2, 0, g); box(W, 0.06, D, wht, 0, H, 0, g); box(W, H, 0.02, std({ color: '#ecece8' }), 0, H / 2, -D / 2, g);
  for (const y of [0.85, 1.35, 1.95]) box(W - 0.06, 0.03, D - 0.02, wht, 0, y, 0, g);
  box(W - 0.06, 0.85, D - 0.02, wht, 0, 0.425, 0.0, g);                                 // closed base
  const lid = box(W - 0.08, 0.46, 0.02, wht, 0, H + 0.2, 0.25, g); lid.rotation.x = -1.2;   // flipped-up cabinet door
  // black panel with icons (upper) and the schedule monitor (lower)
  const icons = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#16181c'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2f2f2'; for (let i = 0; i < 5; i++) { x.fillRect(30 + i * 42, 60, 22, 22); } x.fillStyle = '#8a8a8a'; fitText(x, 'BRIGHTWATER', w / 2, 120, 160, 16, F.label, { spacing: 3 }); });
  plane(W - 0.14, 0.42, std({ map: icons, emissive: '#ffffff', emissiveMap: icons, emissiveIntensity: 0.4 }), 0, 1.68, -0.08, 0, g);
  const sched = canvasT(512, 300, (x, w, h) => { x.fillStyle = '#f4f6f8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a4a6a'; x.fillRect(0, 0, w, 28); x.fillStyle = '#fff'; fitText(x, 'SCHEDULE · TUE', 120, 15, 220, 18, F.label);
    const cols = ['#e86a8a', '#5ac85a', '#f2c21a', '#5aa8e8', '#c87ae8', '#f28a3a']; for (let c = 0; c < 4; c++) { x.fillStyle = '#d8dde2'; x.fillRect(60 + c * 110, 30, 1, h); for (let r = 0; r < 6; r++) if ((c * 7 + r * 3) % 4 !== 0) { x.fillStyle = cols[(c + r) % 6]; x.fillRect(66 + c * 110, 40 + r * 42, 98, 34); } }
    x.fillStyle = '#7a8a9a'; for (let r = 0; r < 7; r++) fitText(x, `${8 + r}:00`, 30, 50 + r * 42, 50, 14, F.label); });
  box(0.78, 0.48, 0.04, blk, 0, 1.12, -0.06, g); plane(0.74, 0.44, std({ map: sched, emissive: '#ffffff', emissiveMap: sched, emissiveIntensity: 0.7 }), 0, 1.12, -0.038, 0, g);
  box(0.42, 0.02, 0.14, std({ color: '#1a1a1a' }), -0.1, 0.875, 0.05, g); box(0.07, 0.02, 0.1, std({ color: '#1a1a1a' }), 0.22, 0.875, 0.06, g);   // keyboard + mouse
  // water flosser + a small battery candle on the top shelf
  const fl = new THREE.Group(); fl.position.set(0.32, 1.97, 0.0); g.add(fl); rbox(0.12, 0.22, 0.12, 0.03, wht, 0, 0.11, 0, fl); cyl(0.045, 0.045, 0.12, std({ color: '#b8e0f0', transparent: true, opacity: 0.6 }), 0, 0.28, 0, fl, 16); rod(V(-0.04, 0.05, 0.06), V(-0.04, 0.2, 0.08), 0.008, wht, fl);
  cyl(0.04, 0.04, 0.1, std({ color: '#f2ead8', emissive: '#ffd890', emissiveIntensity: 0.3 }), -0.32, 2.03, 0, g, 16);
  // delivery hoses looping down from the base unit
  const hose = std({ color: '#d8d8d4', roughness: 0.45 });
  for (let k = 0; k < 4; k++) { const x0 = -0.3 + k * 0.12; tube([V(x0, 0.8, 0.18), V(x0 + 0.05, 0.55, 0.32 + k * 0.02), V(x0 + 0.1, 0.35, 0.3), V(x0 + 0.04, 0.5, 0.22), V(x0, 0.7, 0.2)], 0.007, hose, g, 30); cyl(0.012, 0.01, 0.12, chrome(), x0, 0.86, 0.19, g, 8); }
  g.userData.collider = [-W / 2 - 0.03, W / 2 + 0.03, -D / 2, D / 2 + 0.2];
  return g;
}
// ---- rolling tool chest: white drawers with blue trim (made-up brand), butcher-block top with the clutter from
// the photos: blood-pressure monitor + cuff, wipes tub, spray bottle, glove box, safety glasses, bib clips, papers,
// a pen, the desk fan
export function makeToolChest() {
  const g = new THREE.Group(); g.name = 'tool_chest';
  const W = 1.2, H = 0.92, D = 0.5;
  const front = canvasT(512, 400, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); const rows = [0, 60, 110, 160, 210, 270, 330, 400];
    for (let i = 0; i < rows.length - 1; i++) { const y0 = rows[i]; x.fillStyle = '#d8dade'; x.fillRect(0, y0, w, 3); x.fillStyle = '#2a5ab8'; x.fillRect(12, y0 + 8, w - 24, 4); x.fillStyle = '#b8bcc0'; x.fillRect(20, y0 + 16, w - 40, 7); }
    x.fillStyle = '#2a5ab8'; x.fillRect(w - 150, 22, 120, 22); x.fillStyle = '#fff'; fitText(x, 'LOCKSTONE', w - 90, 33, 110, 16, F.label, { spacing: 2 }); });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [WHITE(), WHITE(), WHITE(), WHITE(), std({ map: front, roughness: 0.35 }), WHITE()]); body.position.y = 0.08 + H / 2; body.castShadow = true; g.add(body);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(0.04, 0.04, 0.03, std({ color: '#1a1a1a' }), sx * 0.5, 0.04, sz * 0.18, g, 14).rotation.z = Math.PI / 2; }
  const top = box(W + 0.04, 0.04, D + 0.06, std({ map: tex('op_block', 1.2, 1), roughness: 0.5 }), 0, 0.08 + H + 0.02, 0, g); void top;
  const T = 0.08 + H + 0.04, p = new THREE.Group(); p.position.y = T; g.add(p);
  // blood pressure monitor + black cuff + grey tube
  rbox(0.13, 0.06, 0.1, 0.015, WHITE(), -0.2, 0.03, 0.05, p).rotation.y = 0.3; plane(0.07, 0.045, std({ color: '#9aa8a0', emissive: '#2a3a30', emissiveIntensity: 0.3 }), -0.2, 0.062, 0.05, 0, p).rotation.x = -Math.PI / 2;
  rbox(0.28, 0.02, 0.16, 0.01, std({ color: '#141414' }), -0.32, 0.01, 0.06, p).rotation.y = 0.5;
  tube([V(-0.15, 0.02, 0.05), V(-0.1, 0.01, -0.05), V(-0.3, 0.01, -0.12), V(-0.42, 0.01, 0.0)], 0.005, std({ color: '#8a8c90' }), p, 20);
  // wipes tub (made-up label), spray bottle, glove box with purple gloves
  const lab = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f8f8f6'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a4a9a'; fitText(x, 'CLEANWIPE', w / 2, 40, 220, 34, F.heavy); x.fillStyle = '#5a6a8a'; for (let i = 0; i < 5; i++) x.fillRect(20, 66 + i * 11, w - 40, 4); });
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.22, 24), [std({ map: lab }), WHITE(), WHITE()]); tub.position.set(-0.05, 0.11, -0.15); g.add(tub); tub.position.y += T;
  cyl(0.078, 0.078, 0.04, WHITE(), -0.05, T + 0.24, -0.15, g, 24);
  const sb = new THREE.Group(); sb.position.set(0.12, 0, -0.15); p.add(sb); cyl(0.035, 0.04, 0.2, std({ color: '#eef4f4', transparent: true, opacity: 0.55, roughness: 0.05 }), 0, 0.1, 0, sb, 16); cyl(0.015, 0.03, 0.05, WHITE(), 0, 0.22, 0, sb, 12); box(0.03, 0.05, 0.08, std({ color: '#d81e1e' }), 0, 0.27, 0.02, sb);
  const gb = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#1e2a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'NITRILE · M', w / 2, 30, 200, 24, F.label, { spacing: 2 }); x.fillStyle = '#c8d0e8'; for (let i = 0; i < 4; i++) x.fillRect(20, 60 + i * 14, 90, 6); });
  box(0.24, 0.1, 0.13, std({ map: gb }), 0.32, 0.05, -0.08, p).rotation.y = -0.3;
  for (let i = 0; i < 4; i++) { const gl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), std({ color: '#4a3ab8', roughness: 0.5 })); gl.scale.set(1.2, 0.6, 1); gl.position.set(0.3 + (i % 2) * 0.05 - 0.02, 0.12 + i * 0.012, -0.08 + (i - 1.5) * 0.02); p.add(gl); }
  // safety glasses, purple bib clip chain, papers, pen
  const gm = std({ color: '#141414', roughness: 0.3 }); for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8, 0, 6.283, 0, 1.2), gm); l.scale.set(1.2, 0.6, 1); l.position.set(0.05 + s * 0.04, 0.012, 0.12); p.add(l); } rod(V(0.05, 0.02, 0.15), V(0.1, 0.01, 0.25), 0.003, gm, p); rod(V(0.13, 0.02, 0.15), V(0.18, 0.01, 0.25), 0.003, gm, p);
  tube([V(0.15, 0.005, 0.0), V(0.22, 0.005, 0.08), V(0.32, 0.005, 0.05), V(0.38, 0.005, 0.12)], 0.004, std({ color: '#b88ae0' }), p, 16);
  const paper = canvasT(170, 220, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#9a9a9a'; for (let i = 0; i < 14; i++) x.fillRect(14, 20 + i * 13, w - 28 - (i % 3) * 20, 3); });
  plane(0.21, 0.28, std({ map: paper }), 0.42, 0.003, 0.08, 0, p).rotation.set(-Math.PI / 2, 0, 0.1);
  rod(V(0.3, 0.008, 0.02), V(0.36, 0.008, 0.12), 0.005, std({ color: '#7a5ac8' }), p);
  // desk fan: black round bladeless fan on a stand, at the back corner
  const fan = makeDeskFan(); fan.position.set(0.48, 0, -0.16); fan.rotation.y = -0.4; p.add(fan);
  g.userData.collider = [-W / 2 - 0.02, W / 2 + 0.02, -D / 2 - 0.03, D / 2 + 0.03];
  return g;
}
export function makeDeskFan() {
  const g = new THREE.Group(); g.name = 'desk_fan';
  const blk = std({ color: '#141416', roughness: 0.35 });
  rbox(0.11, 0.02, 0.09, 0.008, blk, 0, 0.01, 0, g); box(0.03, 0.08, 0.03, blk, 0, 0.06, 0, g);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 12, 30), blk); ring.position.y = 0.17; g.add(ring);
  const grille = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), std({ color: '#2a2a2c', side: THREE.DoubleSide })); grille.position.y = 0.17; g.add(grille);
  return g;
}
// mayo stand: chrome pole on a five-star base, an L arm holding a steel tray with the instrument cassette
export function makeMayoStand() {
  const g = new THREE.Group(); g.name = 'mayo_stand';
  starBase(g, 0.28); const c = chrome();
  cyl(0.02, 0.02, 0.85, c, 0, 0.5, 0, g, 12); rod(V(0, 0.92, 0), V(0, 0.92, 0.3), 0.016, c, g);
  const tray = new THREE.Group(); tray.position.set(0, 0.94, 0.32); g.add(tray);
  const steel = std({ color: '#b8bcc0', metalness: 0.7, roughness: 0.35 });
  box(0.46, 0.008, 0.33, steel, 0, 0, 0, tray); for (const [w, d, x, z] of [[0.46, 0.012, 0, 0.165], [0.46, 0.012, 0, -0.165], [0.012, 0.33, 0.23, 0], [0.012, 0.33, -0.23, 0]]) box(w, 0.035, d, steel, x, 0.016, z, tray);
  // what's on the tray (as in the photo): a paper liner, a steel instrument cassette with colour-banded handles,
  // loose instruments, a white suction tip, cotton rolls and gauze squares
  const liner = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.27), std({ color: '#e6d9b8', roughness: 0.9 })); liner.rotation.x = -Math.PI / 2; liner.position.y = 0.006; tray.add(liner);
  const cas = new THREE.Group(); cas.position.set(-0.04, 0.007, -0.05); tray.add(cas);
  const perf = canvasT(128, 96, (x, w, h) => { x.fillStyle = '#c8ccd0'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a5e62'; for (let i = 4; i < w; i += 8) for (let j = 4; j < h; j += 8) { x.beginPath(); x.arc(i, j, 2, 0, 7); x.fill(); } });
  box(0.26, 0.004, 0.16, std({ map: perf, metalness: 0.6, roughness: 0.35 }), 0, 0.002, 0, cas);
  const st = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.25 });
  for (const zz of [-0.08, 0.08]) box(0.26, 0.022, 0.004, st, 0, 0.011, zz, cas);
  for (const xx of [-0.13, 0.13]) box(0.004, 0.022, 0.16, st, xx, 0.011, 0, cas);
  for (const xx of [-0.08, 0.08]) box(0.006, 0.012, 0.16, st, xx, 0.016, 0, cas);   // the clip racks
  ['#f2c21a', '#f2c21a', '#f08a1a', '#e8402a', '#3ac85a', '#9a5ad8', '#2a8ad8'].forEach((c, k) => {
    const z = -0.06 + k * 0.02, h = cyl(0.0048, 0.0048, 0.13, std({ color: c, roughness: 0.4 }), 0, 0.012, z, cas, 10); h.rotation.z = Math.PI / 2;
    for (const sd of [-1, 1]) { const tip = cyl(0.0012, 0.003, 0.03, st, sd * 0.08, 0.012, z, cas, 6); tip.rotation.z = sd * Math.PI / 2; }
  });
  const loose = [[0.13, 0.07, 0.3, '#b8bcc0'], [0.12, 0.1, -0.2, '#9a5ad8'], [0.07, 0.12, 0.1, '#b8bcc0']];
  loose.forEach(([x, z, r, c]) => { const h = cyl(0.0045, 0.0045, 0.14, std({ color: c, metalness: c === '#b8bcc0' ? 0.85 : 0, roughness: 0.3 }), x - 0.06, 0.011, z, tray, 10); h.rotation.set(0, r, Math.PI / 2); });
  const mir = cyl(0.011, 0.011, 0.003, std({ color: '#dfe6ea', metalness: 0.3, roughness: 0.15 }), 0.13, 0.012, 0.03, tray, 16); mir.rotation.x = 0.2;
  tube([V(0.03, 0.012, 0.11), V(0.1, 0.012, 0.115), V(0.16, 0.02, 0.1), V(0.17, 0.035, 0.07)], 0.004, std({ color: '#f4f4f2', roughness: 0.4 }), tray, 16);   // suction tip
  for (let k = 0; k < 3; k++) { const cr = cyl(0.005, 0.005, 0.035, std({ color: '#fbfbf8', roughness: 1 }), 0.15 + k * 0.012, 0.011, -0.1, tray, 8); cr.rotation.x = Math.PI / 2; }
  for (let k = 0; k < 2; k++) { const gz = box(0.05, 0.003, 0.05, std({ color: '#fbfbf8', roughness: 1 }), -0.17 + k * 0.02, 0.009 + k * 0.003, 0.09 - k * 0.01, tray); gz.rotation.y = 0.3 * k; }
  const bib = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), std({ color: '#a8d8f0', roughness: 0.8 })); bib.rotation.set(-1.2, 0, 0); bib.position.set(0, -0.04, 0.2); tray.add(bib);
  g.userData.collider = [-0.3, 0.3, -0.3, 0.5];
  return g;
}
export function makeSaddleStool() {
  const g = new THREE.Group(); g.name = 'saddle_stool';
  starBase(g, 0.3); cyl(0.03, 0.035, 0.45, chrome(), 0, 0.3, 0, g, 12);
  const geo = new THREE.SphereGeometry(0.22, 32, 16); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const saddle = y > 0 ? 0.25 + 0.6 * (x * x) / 0.05 - 0.2 * (z > 0 ? z * z / 0.05 : 0) : 0.35; p.setXYZ(i, x * 1.0, y * saddle, z * (z > 0 ? 0.8 : 1.15)); }
  geo.computeVertexNormals(); const seat = new THREE.Mesh(geo, std({ color: '#141416', roughness: 0.35 })); seat.position.y = 0.6; seat.castShadow = true; g.add(seat);
  g.userData.collider = [-0.32, 0.32, -0.32, 0.32];
  return g;
}
// tan leather bucket stool on a black sled frame (the corner chair in the photo): seat + one curved back shell
export function makeBucketStool() {
  const g = new THREE.Group(); g.name = 'bucket_stool';
  const fr = std({ color: '#141416', metalness: 0.5, roughness: 0.4 }), lea = std({ map: tex('op_tan', 1.2, 1.2), roughness: 0.45, side: THREE.DoubleSide });
  const SY = 0.64;
  for (const s of [-1, 1]) { const x = s * 0.18; rod(V(x, 0.01, 0.2), V(x, 0.01, -0.2), 0.009, fr, g); rod(V(x, 0.01, 0.2), V(x, SY - 0.03, 0.16), 0.009, fr, g); rod(V(x, 0.01, -0.2), V(x, SY - 0.03, -0.16), 0.009, fr, g); rod(V(x, SY - 0.03, 0.16), V(x, SY - 0.03, -0.16), 0.009, fr, g); }
  rod(V(-0.18, 0.24, 0.185), V(0.18, 0.24, 0.185), 0.009, fr, g);                         // foot bar
  rbox(0.42, 0.05, 0.4, 0.02, lea, 0, SY, 0.0, g);
  // back shell: a half-cylinder wrapping the back of the seat, leaning back a little
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.34, 28, 1, true, Math.PI * 0.5, Math.PI), lea);
  sh.scale.set(1, 1, 0.85); sh.position.set(0, SY + 0.19, -0.02); sh.rotation.x = -0.12; sh.castShadow = true; g.add(sh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.012, 6, 28, Math.PI), lea); rim.rotation.set(Math.PI / 2, 0, Math.PI); rim.scale.set(1, 0.85, 1); rim.position.set(0, SY + 0.36, -0.04); g.add(rim);
  g.userData.collider = [-0.25, 0.25, -0.25, 0.25];
  return g;
}

// ---- the wing -------------------------------------------------------------------------------------------------------
export function makeTreatmentWing() {
  const g = new THREE.Group(); g.name = 'treatment_wing';
  const CH = 2.9, white = std({ color: '#f2f1ec', roughness: 0.9 }), black = std({ color: '#1c1d20', roughness: 0.85 }), base = std({ color: '#141414', roughness: 0.6 });
  const HZ0 = -2.0, HZ1 = 0.28, RZ0 = -6.0;       // hallway z range, rooms from RZ0 to HZ0
  // floors: planks in the rooms + the hallway
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14.8, 6.3), std({ map: tex('op_floor', 14.8 / 1.4, 6.3 / 1.4), roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.position.set(-3.6, 0.008, -2.85); floor.receiveShadow = true; g.add(floor);
  // walls: hallway back wall (= rooms' front wall) with two doorways, rooms' back wall, divider, hallway end walls
  const wall = (x0, z0, x1, z1, mat = white) => { const L = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.BoxGeometry(L, CH, 0.1), mat); m.position.set((x0 + x1) / 2, CH / 2, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.receiveShadow = true; g.add(m); };
  wall(-11, HZ0, -9.6, HZ0); wall(-8.6, HZ0, -6.0, HZ0); wall(-5.0, HZ0, 3.8, HZ0);                // doorways at x -9.6..-8.6 and -6.0..-5.0
  for (const [a, b] of [[-9.6, -8.6], [-6.0, -5.0]]) { const lint = new THREE.Mesh(new THREE.BoxGeometry(b - a, CH - 2.2, 0.1), white); lint.position.set((a + b) / 2, 2.2 + (CH - 2.2) / 2, HZ0); g.add(lint); }
  wall(-11, RZ0, -3.8, RZ0); wall(-7.4, RZ0, -7.4, HZ0); wall(-3.8, RZ0, -3.8, HZ0); wall(1.55, HZ0, 1.55, HZ1);   // back, divider, end walls
  wall(-3.8, RZ0, 3.8, RZ0); wall(3.8, RZ0, 3.8, HZ0);                                              // staff rooms beyond (closed)
  // the waiting-room partition seen from the hallway (with the doorway at x -7.15..-6.05)
  plane(1.55 + 6.05, CH, white, (1.55 - 6.05) / 2, CH / 2, HZ1 - 0.01, Math.PI, g); plane(11 - 7.15, CH, white, (-11 - 7.15) / 2, CH / 2, HZ1 - 0.01, Math.PI, g);
  // operatory 1: the outside wall is a black accent wall with the window onto trees; a TV above the tool chest
  box(0.02, CH, 4.0, black, -10.97, CH / 2, -4.0, g);
  const win = new THREE.Group(); win.position.set(-10.94, 1.55, -3.2); win.rotation.y = Math.PI / 2; g.add(win);
  box(1.3, 0.95, 0.04, std({ color: '#d8d8d4', roughness: 0.5 }), 0, 0, 0, win); plane(1.2, 0.85, std({ map: tex('op_window'), emissive: '#ffffff', emissiveMap: tex('op_window'), emissiveIntensity: 0.25, roughness: 0.1 }), 0, 0, 0.022, 0, win);
  // skirting
  for (const [x0, z0, x1, z1] of [[-11, -5.94, -3.8, -5.94], [-11, -2.06, -3.8, -2.06]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(x1 - x0, z1 - z0), 0.1, 0.02), base); s.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2); g.add(s); }
  // ceilings + lights
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14.8, 6.3), std({ color: '#f4f4f0', roughness: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(-3.6, CH, -2.85); g.add(ceil);
  const canM = std({ color: '#fffaf0', emissive: '#fff2d8', emissiveIntensity: 2.2 });
  for (const [x, z] of [[-9.2, -4.0], [-5.6, -4.0], [-9.0, -1.0], [-5.0, -1.0], [-1.0, -1.0]]) { cyl(0.09, 0.09, 0.02, canM, x, CH - 0.005, z, g, 20).castShadow = false; }
  for (const [x, z, i] of [[-9.2, -3.8, 3.2], [-5.6, -3.8, 2.4], [-5.0, -1.0, 1.6]]) { const l = new THREE.PointLight('#fff4e4', i, 7, 1.4); l.position.set(x, CH - 0.5, z); g.add(l); }
  // ---- operatory 1 (photos): chair head toward the back wall, wall unit behind the head
  const cols = [];
  const put = (o, x, z, ry = 0, parent = g) => { o.position.set(x, 0, z); o.rotation.y = ry; parent.add(o); const c = o.userData.collider; if (c) { const q = Math.round(ry / (Math.PI / 2)) & 3; const [a, b, c0, c1] = c; let r; if (q === 0) r = [a, b, c0, c1]; else if (q === 2) r = [-b, -a, -c1, -c0]; else if (q === 1) r = [c0, c1, -b, -a]; else r = [-c1, -c0, a, b]; cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; };
  put(makeDentalChair(), -9.2, -3.95);
  put(makeWallUnit(), -9.2, -5.75);
  put(makeToolChest(), -10.68, -3.4, Math.PI / 2);
  put(makeMayoStand(), -8.3, -4.75, -Math.PI / 2 + 0.4);
  put(makeSaddleStool(), -9.95, -4.95);
  put(makeBucketStool(), -7.75, -5.6, -Math.PI / 4);
  const bin = cyl(0.14, 0.13, 0.42, std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.25 }), -7.75, 0.21, -2.4, g, 24); void bin; cols.push([-7.92, -7.58, -2.57, -2.23]);
  const tv = new THREE.Group(); tv.position.set(-10.94, 2.35, -4.75); tv.rotation.y = Math.PI / 2; g.add(tv);
  box(1.0, 0.58, 0.04, std({ color: '#0c0c0e' }), 0, 0, 0, tv);
  const tvT = canvasT(512, 288, (x, w, h) => { const sk = x.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#2a7ad8'); sk.addColorStop(1, '#8ad0f0'); x.fillStyle = sk; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(60 + i * 100, 60 + (i % 2) * 30, 40, 16, 0, 0, 7); x.fill(); } x.fillStyle = '#2a8a3a'; x.fillRect(0, h - 70, w, 70); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, h - 36, w, 36); x.fillStyle = '#fff'; fitText(x, 'RELAX · ocean & meadow sounds', w / 2, h - 18, w - 40, 20, F.label); });
  plane(0.96, 0.54, std({ map: tvT, emissive: '#ffffff', emissiveMap: tvT, emissiveIntensity: 0.8 }), 0, 0, 0.022, 0, tv);
  // a spare coil of hoses on the floor by the wall unit (photo 1's corner)
  const hose = std({ color: '#d8d8d4', roughness: 0.45 }); for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.283; pts.push(V(-8.35 + Math.cos(a) * (0.16 + k * 0.03), 0.01 + k * 0.01 + 0.25 * Math.max(0, Math.sin(a)) * (k === 1 ? 1 : 0.4), -5.55 + Math.sin(a) * 0.12)); } tube(pts, 0.006, hose, g, 60); }
  // ---- operatory 2: the second chair + wall unit + saddle stool
  put(makeDentalChair(), -5.6, -3.95);
  put(makeWallUnit(), -5.6, -5.75);
  put(makeSaddleStool(), -6.5, -4.9);
  put(makeMayoStand(), -4.8, -3.7, -Math.PI / 2 + 0.3);
  // hallway: a coat hook rail + a framed print, room numbers by the doorways
  for (const [x, n] of [[-9.85, '1'], [-6.25, '2']]) { const t = canvasT(128, 128, (c, w, h) => { c.fillStyle = '#1c1d20'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8e6e0'; fitText(c, n, w / 2, 70, 90, 80, F.wayfind); }); plane(0.16, 0.16, std({ map: t }), x, 1.55, HZ0 + 0.055, 0, g); }
  g.userData.colliders = cols;
  g.userData.areas = [
    { minX: -10.75, maxX: 1.3, minZ: HZ0 + 0.3, maxZ: HZ1 - 0.25 },            // hallway
    { minX: -7.1, maxX: -6.1, minZ: HZ1 - 0.4, maxZ: HZ1 + 0.6 },               // through the waiting-room door
    { minX: -10.75, maxX: -7.65, minZ: RZ0 + 0.3, maxZ: HZ0 - 0.25 },          // operatory 1
    { minX: -7.15, maxX: -4.05, minZ: RZ0 + 0.3, maxZ: HZ0 - 0.25 },           // operatory 2
    { minX: -9.5, maxX: -8.7, minZ: HZ0 - 0.4, maxZ: HZ0 + 0.4 }, { minX: -5.9, maxX: -5.1, minZ: HZ0 - 0.4, maxZ: HZ0 + 0.4 },   // doorways
  ];
  return g;
}
