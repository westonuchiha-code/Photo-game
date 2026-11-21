// Bad-parker easter egg (queue item 50, photos/badparker/). A generic huge red heavy-duty pickup (no real
// badges; made-up plate "BIG-RIG 1") parked crooked across two compact spaces in front of a split-face block
// retaining wall (block from the photo) with a hedge on top, a river-rock strip, a yellow-painted light-pole
// base marked "8", and the wall sign "COMPACT CARS ONLY / NO TRUCKS PLEASE" with the "NO" taped over.
//   makePickup()       ~6.4 x 2.05 x 2.05 m, nose toward +x, ground y = 0
//   makeCompactCorner() the whole set: wall + hedge + rock strip + pole + sign + yellow lines + the truck.
//     Local: wall along x at z = 0 (spaces extend toward +z), origin at the wall's centre.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function makePickup() {
  const g = new THREE.Group(); g.name = 'pickup_truck';
  const red = std({ color: '#8e1a1e', roughness: 0.28, metalness: 0.35 }), black = std({ color: '#141414', roughness: 0.55 }), chrome = std({ color: '#d8dce0', metalness: 0.9, roughness: 0.2 });
  const glass = std({ color: '#1a2026', roughness: 0.08, metalness: 0.4 });
  const W = 2.03, hw = W / 2, R = 0.44, clr = 0.62;
  // cab + hood (side profile extruded), bed box
  const sh = new THREE.Shape(); sh.moveTo(0.4, clr); sh.lineTo(3.25, clr); sh.lineTo(3.25, 1.3); sh.lineTo(3.05, 1.38); sh.lineTo(2.1, 1.42); sh.lineTo(1.55, 2.02); sh.lineTo(0.12, 2.04); sh.lineTo(0.05, 1.95); sh.lineTo(0.05, clr); sh.closePath();
  const cg = new THREE.ExtrudeGeometry(sh, { depth: W - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }); cg.translate(0, 0, -(W - 0.08) / 2);
  const cab = new THREE.Mesh(cg, red); cab.castShadow = true; g.add(cab);
  const bed = new THREE.Group(); g.add(bed);
  box(2.45, 0.08, W, red, -1.25, clr + 0.04, 0, bed);
  for (const s of [-1, 1]) box(2.45, 0.72, 0.06, red, -1.25, clr + 0.36, s * (hw - 0.03), bed);
  box(0.06, 0.72, W, red, -2.47, clr + 0.36, 0, bed);                                         // tailgate
  box(0.07, 0.06, W, black, -2.48, clr + 0.7, 0, bed);
  // side rails on the bed + the black louvered headache rack behind the cab
  for (const s of [-1, 1]) box(2.3, 0.05, 0.06, black, -1.2, clr + 0.76, s * (hw - 0.03), bed);
  const rack = new THREE.Group(); rack.position.set(-0.08, clr + 0.72, 0); g.add(rack);
  for (const s of [-1, 1]) box(0.08, 1.0, 0.08, black, 0, 0.5, s * (hw - 0.08), rack);
  box(0.08, 0.08, W - 0.1, black, 0, 1.0, 0, rack);
  for (let i = 0; i < 7; i++) box(0.04, 0.1, W - 0.3, black, 0.02 - (i % 2) * 0.01, 0.2 + i * 0.11, 0, rack).rotation.z = 0.5;
  box(0.05, 0.3, 0.7, black, 0, 0.74, 0, rack);                                                   // the window gap frame
  // glass
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.24, 0.8), glass); ws.rotation.order = 'ZYX'; ws.rotation.y = Math.PI / 2; ws.rotation.z = Math.atan2(0.55, 0.6); ws.position.set(1.84, 1.73, 0); g.add(ws);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.5), glass); sw.position.set(0.82, 1.72, s * (hw + 0.002)); if (s < 0) sw.rotation.y = Math.PI; g.add(sw); }
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, 0.42), glass); bw.rotation.y = -Math.PI / 2; bw.position.set(0.004, 1.74, 0); g.add(bw);
  // grille (big black slats), headlights, bumpers, tail lamps, plate, hitch
  const gr = new THREE.Group(); gr.position.set(3.29, 1.0, 0); g.add(gr);
  box(0.04, 0.55, W - 0.5, black, 0, 0, 0, gr); for (let i = 0; i < 4; i++) box(0.05, 0.03, W - 0.55, chrome, 0.01, -0.2 + i * 0.13, 0, gr);
  for (const s of [-1, 1]) box(0.05, 0.22, 0.3, std({ color: '#e8eef2', emissive: '#555', roughness: 0.1 }), 3.28, 1.15, s * (hw - 0.22), g);
  box(0.25, 0.3, W + 0.04, std({ color: '#2a2a2c', roughness: 0.4, metalness: 0.5 }), 3.3, 0.7, 0, g);
  box(0.2, 0.25, W + 0.02, std({ color: '#2a2a2c', roughness: 0.4, metalness: 0.5 }), -2.55, 0.72, 0, g);
  for (const s of [-1, 1]) box(0.05, 0.42, 0.14, std({ color: '#c81e1e', emissive: '#300000', roughness: 0.3 }), -2.49, clr + 0.42, s * (hw - 0.09), g);
  const plate = canvasT(256, 128, (x) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#222'; x.lineWidth = 4; x.strokeRect(4, 4, 248, 120); x.fillStyle = '#1d3a8a'; fitText(x, 'BIG-RIG 1', 128, 72, 230, 66, F.condensed, { spacing: 4 }); x.font = `14px ${F.small}`; x.textAlign = 'center'; x.fillText('MADE-UP COUNTY', 128, 24); });
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), std({ map: plate })); pm.rotation.y = -Math.PI / 2; pm.position.set(-2.66, 0.72, 0); g.add(pm);
  box(0.25, 0.06, 0.06, chrome, -2.75, 0.55, 0, g); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), chrome); ball.position.set(-2.85, 0.6, 0); g.add(ball);
  // mirrors (tow mirrors), door seams, handles, step bars
  for (const s of [-1, 1]) { box(0.08, 0.35, 0.22, black, 1.6, 1.6, s * (hw + 0.2), g); box(0.4, 0.04, 0.05, black, 1.7, 1.55, s * (hw + 0.08), g); box(1.7, 0.06, 0.12, black, 0.9, 0.5, s * (hw + 0.08), g); for (const xs of [0.15, 1.5]) box(0.01, 1.0, 0.005, std({ color: '#3a0a0a' }), xs, 1.15, s * (hw + 0.001), g); box(0.18, 0.04, 0.03, chrome, 1.2, 1.3, s * (hw + 0.02), g); box(0.18, 0.04, 0.03, chrome, 0.0, 1.3, s * (hw + 0.02), g); }
  // big wheels (dark alloy, chunky tyres) + wheel well flares
  for (const ax of [2.55, -1.6]) for (const s of [-1, 1]) {
    const t = cyl(R, R, 0.33, std({ color: '#151515', roughness: 0.9 }), g, 32); t.rotation.x = Math.PI / 2; t.position.set(ax, R, s * (hw - 0.15));
    const rim = new THREE.Mesh(new THREE.CircleGeometry(R * 0.6, 24), std({ color: '#3a3c40', metalness: 0.7, roughness: 0.35 })); rim.position.set(ax, R, s * (hw + 0.017)); if (s < 0) rim.rotation.y = Math.PI; g.add(rim);
    const fl = new THREE.Mesh(new THREE.TorusGeometry(R + 0.06, 0.05, 6, 20, Math.PI), black); fl.position.set(ax, R, s * hw); g.add(fl);
  }
  box(5.4, 0.25, W - 0.5, std({ color: '#1a1a1a' }), 0.3, 0.5, 0, g);
  return g;
}

export function makeCompactCorner({ truck = true } = {}) {
  const g = new THREE.Group(); g.name = 'compact_corner';
  const L = 11, WH = 1.3, r = rng(50);
  // asphalt (wet sheen) + yellow space lines
  const asph = canvasT(256, 256, (x) => { x.fillStyle = '#2a2b2d'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2000; i++) { const v = 30 + Math.random() * 40; x.fillStyle = `rgb(${v},${v},${v + 2})`; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } });
  asph.wrapS = asph.wrapT = THREE.RepeatWrapping; asph.repeat.set(L / 2, 4);
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(L, 7), std({ map: asph, roughness: 0.25, metalness: 0.15 })); lot.rotation.x = -Math.PI / 2; lot.position.set(0, 0.006, 3.5 + 0.9); lot.receiveShadow = true; g.add(lot);
  const yel = std({ color: '#e8b81a', roughness: 0.5 });
  for (let i = -2; i <= 2; i++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 4.8), yel); ln.rotation.x = -Math.PI / 2; ln.position.set(i * 2.3, 0.009, 0.9 + 2.4); g.add(ln); }
  // river-rock strip at the foot of the wall + curb
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.06, 0), std({ color: '#8a7a68', roughness: 0.8 }), 600); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  for (let i = 0; i < 600; i++) { sc.setScalar(0.6 + r() * 0.9); q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)); m4.compose(new THREE.Vector3((r() - 0.5) * L, 0.03, 0.15 + r() * 0.6), q, sc); rocks.setMatrixAt(i, m4); } g.add(rocks);
  box(L, 0.15, 0.15, std({ color: '#a8a49c', roughness: 0.9 }), 0, 0.075, 0.9, g);
  // split-face block retaining wall (block from the photo) with the course joints drawn in, a cap course
  const blk = std({ map: tex('bp_block', L / 1.6, 3), roughness: 0.95 });
  box(L, WH, 0.35, blk, 0, WH / 2, -0.15, g);
  const joints = canvasT(512, 256, (x) => { x.clearRect(0, 0, 512, 256); x.strokeStyle = 'rgba(30,26,22,0.6)'; x.lineWidth = 3; for (let row = 0; row < 3; row++) { x.beginPath(); x.moveTo(0, row * 86 + 2); x.lineTo(512, row * 86 + 2); x.stroke(); for (let k = 0; k < 4; k++) { const xx = k * 128 + (row % 2) * 64; x.beginPath(); x.moveTo(xx, row * 86); x.lineTo(xx, row * 86 + 86); x.stroke(); } } });
  joints.wrapS = THREE.RepeatWrapping; joints.repeat.set(L / 1.6, 1);
  const jm = new THREE.Mesh(new THREE.PlaneGeometry(L, WH), std({ map: joints, transparent: true, depthWrite: false })); jm.position.set(0, WH / 2, 0.026); g.add(jm);
  box(L + 0.1, 0.12, 0.45, std({ map: tex('bp_block', L / 1.2, 1), roughness: 0.95 }), 0, WH + 0.06, -0.12, g);
  // hedge on top
  const hedge = std({ color: '#3a5a2a', roughness: 1 });
  for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + r() * 0.2, 1), hedge); b.position.set(-L / 2 + 0.3 + i * (L - 0.6) / 25, WH + 0.5, -0.45); b.scale.set(1, 0.9, 0.8); b.castShadow = true; g.add(b); }
  // the sign on the wall, "NO" taped over
  const sign = canvasT(256, 384, (x) => { x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, 256, 384); x.strokeStyle = '#222'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 372); x.fillStyle = '#111';
    fitText(x, 'COMPACT', 128, 62, 220, 64, F.condensed, { spacing: 2 }); fitText(x, 'CARS ONLY', 128, 128, 220, 64, F.condensed, { spacing: 2 });
    x.fillStyle = '#f2f0ea'; x.fillRect(64, 166, 128, 60); x.strokeStyle = 'rgba(0,0,0,0.12)'; x.lineWidth = 2; x.strokeRect(64, 166, 128, 60); x.fillStyle = 'rgba(0,0,0,0.14)'; fitText(x, 'NO', 128, 196, 100, 52, F.condensed);
    x.fillStyle = '#111'; fitText(x, 'TRUCKS', 128, 264, 220, 64, F.condensed, { spacing: 2 }); fitText(x, 'PLEASE', 128, 330, 220, 64, F.condensed, { spacing: 2 });
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(120,90,40,${Math.random() * 0.25})`; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 384, Math.random() * 6, 0, 7); x.fill(); } });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.45), std({ map: sign, roughness: 0.5 })); sg.position.set(1.15, 0.85, 0.03); g.add(sg);
  // light pole with the yellow-painted base marked "8"
  const pole = new THREE.Group(); pole.position.set(-2.3, 0, 1.4); g.add(pole);
  const base = cyl(0.32, 0.32, 0.9, std({ color: '#e8b81a', roughness: 0.6 }), pole, 24); base.position.y = 0.45;
  const n8 = canvasT(128, 128, (x) => { x.clearRect(0, 0, 128, 128); x.fillStyle = '#111'; fitText(x, '8', 64, 70, 100, 96, F.heavy); });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), std({ map: n8, transparent: true })); lab.position.set(0, 0.6, 0.322); pole.add(lab);
  const shaft = cyl(0.09, 0.12, 8, std({ color: '#5a5c60', metalness: 0.6 }), pole, 12); shaft.position.y = 4.9;
  const arm = cyl(0.05, 0.05, 1.6, std({ color: '#5a5c60', metalness: 0.6 }), pole, 8); arm.rotation.z = Math.PI / 2; arm.position.set(0.7, 8.7, 0);
  box(0.6, 0.14, 0.3, std({ color: '#3a3c40' }), 1.4, 8.65, 0, pole);
  // the truck, crooked across two spaces
  // (with truck: false the town builds it as a drivable car instead; truckPose is where it sits, nose toward +x)
  if (truck) { const tk = makePickup(); tk.position.set(2.2, 0, 4.0); tk.rotation.y = Math.PI / 2 + 0.13; g.add(tk); }
  g.userData.truckPose = { x: 2.2, z: 4.0, ry: Math.PI / 2 + 0.13 };
  g.userData.colliders = [[-L / 2, L / 2, -0.4, 0.95], [-2.6, -2.0, 1.1, 1.7], ...(truck ? [[1.0, 3.6, 0.7, 7.3]] : [])];
  return g;
}
