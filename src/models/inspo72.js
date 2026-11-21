// Inspiration 7 (queue item 72, photos/inspo7/). Everything modelled; brands, game names, characters, markings and
// tail numbers are made up.
//   arcade:     makeAirHockey, makeFourPlayerCab, makeRacingCab, makeClawMachine, makeCoinChanger, makeBoardGameTable,
//               makeConsoleStack, makeArcade ("Pixel Den": a lounge, a black arch, the game room behind)
//   street:     makeShutterShop (a closed yakitori stall with a painted roll shutter), makeStreetDrum
//   temple:     makePaperLantern, makeIncenseBurner, makeNobori, makeTempleFront ("Hoshimi-dera")
//   fairground: makeJetTrainer, makePicnicShelter, makeDragonCoaster, makeKiddieTrain, makeRideTrailer, makeFairground
//   trail:      makeCairn
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { F, fitText } from '../fonts.js';
import { makeBoxTrailer } from './batch81.js';
import { makeTreadRamp, libMat82 } from './batch82.js';
import { makeBarrelTrashPost, makeCreekCrossing, b85Mat } from './batch85.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const glow = (t, i = 1) => std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: i, roughness: 0.3 });
// collider helper for groups placed with a quarter-turn rotation (local [x0,x1,z0,z1] -> parent space)
function rotRect([a, b, c0, c1], ry) { const q = Math.round(ry / (Math.PI / 2)) & 3; if (q === 0) return [a, b, c0, c1]; if (q === 2) return [-b, -a, -c1, -c0]; if (q === 1) return [c0, c1, -b, -a]; return [-c1, -c0, a, b]; }
function placer(g, cols) { return (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const r = rotRect(c, ry); cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; }; }

// ---- arcade machines --------------------------------------------------------------------------------------------
// screens: simple made-up game scenes drawn on canvas, lit
function screenT(kind) {
  return canvasT(320, 240, (x, w, h) => {
    if (kind === 'crypt') { x.fillStyle = '#1a1420'; x.fillRect(0, 0, w, h); x.fillStyle = '#4a3a5a'; for (let i = 0; i < 12; i++) for (let j = 0; j < 9; j++) if ((i * 7 + j * 3) % 5 === 0) x.fillRect(i * 28, j * 28, 26, 26);
      const hero = [['#e8402a', 80, 150], ['#2a8ae0', 130, 120], ['#f2c21a', 190, 160], ['#3ab84a', 240, 130]]; for (const [c, px, py] of hero) { x.fillStyle = c; x.fillRect(px, py, 14, 22); x.fillStyle = '#f2dcc8'; x.fillRect(px + 3, py - 8, 8, 8); }
      x.fillStyle = '#c8c8c8'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(40 + i * 48, 60 + (i % 2) * 20, 8, 0, 7); x.fill(); }
      x.fillStyle = '#000'; x.fillRect(0, 0, w, 22); x.fillStyle = '#f2e04a'; x.font = `bold 14px ${F.led}`; x.fillText('P1 4200   P2 3150   P3 900   P4 INSERT COIN', 6, 16); return; }
    if (kind === 'taxi') { const sk = x.createLinearGradient(0, 0, 0, h * 0.5); sk.addColorStop(0, '#5ab8f0'); sk.addColorStop(1, '#c8e8f8'); x.fillStyle = sk; x.fillRect(0, 0, w, h);
      x.fillStyle = '#9aa0a8'; x.beginPath(); x.moveTo(0, h); x.lineTo(w * 0.45, h * 0.5); x.lineTo(w * 0.55, h * 0.5); x.lineTo(w, h); x.fill(); x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) x.fillRect(w / 2 - 2, h * 0.55 + i * 22, 4, 12 + i * 2);
      x.fillStyle = '#d8b88a'; x.fillRect(10, 60, 60, 70); x.fillRect(250, 50, 60, 80); x.fillStyle = '#f2c21a'; x.fillRect(120, 170, 80, 40); x.fillStyle = '#111'; x.fillRect(130, 178, 60, 12);
      x.fillStyle = '#e8402a'; x.font = `bold 22px ${F.heavy}`; x.fillText('LET\'S GO!', 100, 40); return; }
    // 'scooter': cel-shaded street with characters
    x.fillStyle = '#ffd84a'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a8ad8'; x.fillRect(0, 0, w, 90); x.fillStyle = '#8a8a8a'; x.fillRect(0, 150, w, 90);
    const cs = ['#e8402a', '#2a2a2a', '#3ab84a', '#c83ab8']; cs.forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(50 + i * 70, 130, 18, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(38 + i * 70, 148, 24, 30); });
    x.fillStyle = '#fff'; x.font = `bold 18px ${F.retro}`; x.fillText('READY?', 120, 40);
  });
}
function marqueeT(title, sub, bg, fg) { return canvasT(512, 160, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 20; i++) { x.beginPath(); x.arc(i * 31 % w, (i * 53) % h, 6 + (i % 4) * 4, 0, 7); x.fill(); } x.fillStyle = fg; x.strokeStyle = '#111'; x.lineWidth = 8; fitText(x, title, w / 2, 76, w - 50, 92, F.retro, { stroke: '#111' }); x.fillStyle = '#fff'; fitText(x, sub, w / 2, 136, w - 120, 24, F.label); }); }

export function makeAirHockey() {
  const g = new THREE.Group(); g.name = 'air_hockey';
  const L = 2.1, W = 1.12, top = 0.8, blk = std({ color: '#141416', roughness: 0.4 }), al = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.25 });
  const surf = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#1e3ad8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,30,0.55)'; for (let i = 6; i < w; i += 12) for (let j = 6; j < h; j += 12) { x.beginPath(); x.arc(i, j, 1.4, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 40, 0, 7); x.stroke(); for (const s of [0, w]) { x.beginPath(); x.arc(s, h / 2, 60, 0, 7); x.stroke(); }
    x.strokeStyle = 'rgba(232,64,42,0.8)'; x.beginPath(); x.moveTo(w * 0.25, 0); x.lineTo(w * 0.25, h); x.moveTo(w * 0.75, 0); x.lineTo(w * 0.75, h); x.stroke(); });
  box(L - 0.12, 0.66, W - 0.12, blk, 0, 0.33 + 0.08, 0, g);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.12, W - 0.12), phys({ map: surf, roughness: 0.15, clearcoat: 1 })); s.rotation.x = -Math.PI / 2; s.position.y = top + 0.001; g.add(s);
  for (const sz of [-1, 1]) box(L, 0.1, 0.06, al, 0, top + 0.03, sz * (W / 2 - 0.03), g);
  for (const sx of [-1, 1]) { box(0.06, 0.1, 0.36, al, sx * (L / 2 - 0.03), top + 0.03, sz2(0.37), g); box(0.06, 0.1, 0.36, al, sx * (L / 2 - 0.03), top + 0.03, -0.37, g); box(0.1, 0.04, 0.3, blk, sx * (L / 2 + 0.02), top - 0.04, 0, g); }
  function sz2(v) { return v; }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.12, 0.08, 0.12, blk, sx * (L / 2 - 0.15), 0.04, sz * (W / 2 - 0.15), g);
  const sb = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8302a'; x.font = `40px ${F.led}`; x.fillText('3', 40, 48); x.fillText('5', 190, 48); x.fillStyle = '#888'; x.font = `16px ${F.label}`; x.fillText('HOME   GUEST', 70, 38); });
  plane(0.5, 0.12, glow(sb, 0.8), 0, 0.6, W / 2 - 0.059, 0, g);
  const mal = std({ color: '#e8e8e8', roughness: 0.35 }); for (const [x0, z0] of [[-0.7, 0.1], [0.65, -0.15]]) { cyl(0.05, 0.05, 0.02, mal, x0, top + 0.01, z0, g, 24); cyl(0.022, 0.028, 0.06, mal, x0, top + 0.05, z0, g, 16); sphere(0.026, mal, x0, top + 0.085, z0, g); }
  cyl(0.032, 0.032, 0.006, std({ color: '#f4f4f0' }), 0.12, top + 0.004, 0.08, g, 20);
  g.userData.collider = [-L / 2 - 0.05, L / 2 + 0.05, -W / 2, W / 2];
  return g;
}
export function makeFourPlayerCab() {
  const g = new THREE.Group(); g.name = 'four_player_cab';
  const purple = std({ color: '#5a2a9a', roughness: 0.45 }), blk = std({ color: '#141416', roughness: 0.5 }), gold = std({ color: '#d8a83a', metalness: 0.6, roughness: 0.35 });
  const W = 1.3;
  // side panels: a profile extruded across (the classic cab shape: kick, control-panel ledge, screen recess, marquee hood)
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.75, 0); sh.lineTo(0.75, 1.85); sh.lineTo(0.2, 1.85); sh.lineTo(0.2, 1.62); sh.lineTo(0.05, 1.55); sh.lineTo(0.1, 1.05); sh.lineTo(-0.28, 0.98); sh.lineTo(-0.3, 0.9); sh.lineTo(0.05, 0.82); sh.closePath();
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), purple); m.rotation.y = -Math.PI / 2; m.position.set(sx * W / 2 + (sx > 0 ? 0.03 : 0), 0, 0); m.castShadow = true; g.add(m); }
  // the profile runs along -z from the front (x = 0 maps to z = 0, x = 0.75 to z = -0.75); fill in the box between
  box(W, 0.82, 0.1, blk, 0, 0.41, -0.02, g);                             // kick panel + coin door area
  const cd = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, w, h); x.fillStyle = '#888'; x.fillRect(10, 10, w - 20, h - 20); for (const yy of [40, 100]) { x.fillStyle = '#e8302a'; x.fillRect(30, yy, 22, 34); x.fillRect(76, yy, 22, 34); x.fillStyle = '#fff'; x.font = `10px ${F.small}`; x.fillText('25¢', 32, yy + 22); x.fillText('25¢', 78, yy + 22); } });
  plane(0.3, 0.38, std({ map: cd, metalness: 0.4 }), 0, 0.45, 0.031, 0, g);
  // control panel: a sloped deck with four colour-coded stations
  const cp = new THREE.Group(); cp.position.set(0, 0.95, 0.15); cp.rotation.x = 0.18; g.add(cp);
  box(W, 0.06, 0.4, std({ color: '#2a1a4a' }), 0, 0, 0, cp);
  const pc = ['#e8302a', '#2a6ad8', '#f2c21a', '#3ab84a'];
  pc.forEach((c, i) => { const x0 = -W / 2 + 0.16 + i * 0.325; const m = std({ color: c, roughness: 0.3 });
    cyl(0.012, 0.012, 0.09, std({ color: '#111' }), x0, 0.07, 0.04, cp, 10); sphere(0.026, m, x0, 0.12, 0.04, cp);
    for (let b = 0; b < 3; b++) cyl(0.017, 0.017, 0.02, m, x0 + 0.07 + (b % 2) * 0.05, 0.035, -0.06 + b * 0.04, cp, 14); });
  // screen recess, CRT with a slight bulge, bezel art
  box(W, 0.6, 0.6, blk, 0, 1.3, -0.4, g);
  const scr = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16, Math.PI / 2 - 0.25, 0.5, Math.PI / 2 - 0.19, 0.38), glow(screenT('crypt'), 0.9)); scr.position.set(0, 1.3, -1.28); g.add(scr);
  const bz = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#0a0a12'; x.fillRect(0, 0, w, h); x.clearRect(70, 30, w - 140, h - 60); x.fillStyle = '#d8a83a'; x.font = `bold 16px ${F.label}`; x.fillText('1-4 PLAYERS', 10, h - 10); x.fillText('JOIN ANYTIME', w - 130, h - 10); });
  const bzm = std({ map: bz, transparent: true }); plane(W - 0.06, 0.6, bzm, 0, 1.3, -0.09, 0, g);
  // marquee: lit box under the hood
  box(W, 0.26, 0.2, blk, 0, 1.73, -0.12, g);
  plane(W - 0.06, 0.22, glow(marqueeT('CRYPT RAIDERS', 'legends of the deep vault', ['#3a1a6a', '#8a2ab8'], '#f2c21a'), 1.1), 0, 1.73, -0.019, 0, g);
  box(W + 0.06, 0.03, 0.78, gold, 0, 1.865, -0.37, g); box(W, 1.85, 0.03, blk, 0, 0.925, -0.75, g);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.05, -0.78, 0.35];
  return g;
}
// sit-down racing cabinet: big monitor in a moulded cabinet, a seat on a plinth, wheel + pedals
export function makeRacingCab(variant = 'taxi') {
  const g = new THREE.Group(); g.name = 'racing_cab_' + variant;
  const body = std({ color: variant === 'taxi' ? '#f2b81a' : '#e8702a', roughness: 0.35 }), blk = std({ color: '#141416', roughness: 0.5 }), grey = std({ color: '#d8d8d4', roughness: 0.5 });
  rbox(1.0, 1.25, 0.8, 0.06, body, 0, 0.625, -0.4, g);
  box(0.92, 0.62, 0.05, blk, 0, 1.25, -0.02, g);
  plane(0.8, 0.52, glow(screenT(variant), 0.95), 0, 1.25, 0.006, 0, g);
  const mq = variant === 'taxi' ? marqueeT('RUSH HOUR RUN', 'pick up · drop off · beat the clock', ['#f2b81a', '#e8402a'], '#fff') : marqueeT('STREET SCOOTER', 'ride the whole city', ['#2a8ad8', '#e8702a'], '#f2e04a');
  box(1.02, 0.3, 0.3, body, 0, 1.75, -0.2, g); plane(0.96, 0.26, glow(mq, 1.0), 0, 1.75, -0.049, 0, g);
  // dash with the wheel, a shifter, start button, speaker grilles
  const dash = new THREE.Group(); dash.position.set(0, 0.9, 0.15); dash.rotation.x = -0.35; g.add(dash);
  rbox(0.9, 0.12, 0.35, 0.03, body, 0, 0, 0, dash);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 10, 36), blk); wheel.position.set(0, 0.16, 0.12); wheel.rotation.x = -0.9; dash.add(wheel); cyl(0.04, 0.04, 0.12, blk, 0, 0.08, 0.1, dash, 12);
  for (let i = 0; i < 3; i++) { const sp = rod(V(0, 0.16, 0.12), V(Math.cos(i * 2.1 + 0.5) * 0.15, 0.16 + Math.sin(i * 2.1 + 0.5) * 0.15 * 0.6, 0.12 + Math.sin(i * 2.1 + 0.5) * 0.1), 0.012, blk, dash); void sp; }
  cyl(0.025, 0.025, 0.02, std({ color: '#e8302a', emissive: '#a00', emissiveIntensity: 0.8 }), 0.34, 0.07, 0.05, dash, 16);
  rod(V(0.32, 0.06, -0.08), V(0.32, 0.2, -0.05), 0.01, std({ color: '#c8ccd0', metalness: 0.8 }), dash); sphere(0.03, blk, 0.32, 0.21, -0.05, dash);
  for (const sx of [-1, 1]) { const sp = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), std({ color: '#2a8ad8', roughness: 0.7 })); sp.position.set(sx * 0.32, 0.55, 0.005); g.add(sp); }
  // pedal box + seat plinth with a bucket seat
  box(0.6, 0.12, 0.35, blk, 0, 0.06, 0.45, g); for (const sx of [-0.1, 0.1]) { const p = box(0.08, 0.14, 0.03, std({ color: '#8a8c90', metalness: 0.7 }), sx, 0.17, 0.42, g); p.rotation.x = -0.6; }
  box(0.7, 0.32, 0.8, grey, 0, 0.16, 1.15, g);
  const seat = new THREE.Group(); seat.position.set(0, 0.32, 1.2); g.add(seat);
  rbox(0.5, 0.12, 0.5, 0.05, blk, 0, 0.12, 0, seat); const back = rbox(0.5, 0.65, 0.12, 0.05, blk, 0, 0.5, 0.25, seat); back.rotation.x = -0.2;
  for (const sx of [-1, 1]) rbox(0.08, 0.3, 0.55, 0.03, blk, sx * 0.25, 0.25, 0.05, seat);
  g.userData.collider = [-0.52, 0.52, -0.82, 1.58];
  return g;
}
export function makeClawMachine(seed = 1) {
  const g = new THREE.Group(); g.name = 'claw_machine';
  const W = 0.95, D = 0.95, pink = std({ color: '#f25aa8', roughness: 0.35 }), white = std({ color: '#f4f2ee', roughness: 0.4 }), chrome = std({ color: '#d8dce0', metalness: 0.9, roughness: 0.2 });
  box(W, 0.85, D, white, 0, 0.425, 0, g); box(W + 0.02, 0.06, D + 0.02, pink, 0, 0.85, 0, g);
  const glass = phys({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.03, depthWrite: false, side: THREE.DoubleSide });
  for (const [w, x, z, ry] of [[W, 0, D / 2, 0], [W, 0, -D / 2, 0], [D, W / 2, 0, Math.PI / 2], [D, -W / 2, 0, Math.PI / 2]]) plane(w - 0.04, 1.0, glass, x, 1.38, z, ry, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, 1.0, 0.04, pink, sx * (W / 2 - 0.02), 1.38, sz * (D / 2 - 0.02), g);
  box(W + 0.02, 0.32, D + 0.02, white, 0, 2.04, 0, g);
  const mq = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#ffe8f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#f25aa8'; fitText(x, 'CATCH-A-PAL', w / 2, 70, w - 60, 80, F.rounded, { weight: 700 }); x.fillStyle = '#2a6ad8'; fitText(x, 'grab · lift · win!', w / 2, 130, w - 120, 28, F.label); });
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; plane(W - 0.02, 0.28, glow(mq, 0.6), Math.sin(a) * (D / 2 + 0.012), 2.04, Math.cos(a) * (D / 2 + 0.012), a, g); }
  // prize pile: soft plush balls + boxes, the drop chute in a corner
  const r = rng(seed * 13), cols = ['#f2c21a', '#8ad8f2', '#f28ab8', '#ffffff', '#b8f28a', '#c8a0f2'];
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * (W - 0.25), z = (r() - 0.5) * (D - 0.25); if (x > 0.15 && z > 0.15) continue; const s = 0.07 + r() * 0.05; const b = sphere(s, std({ color: cols[i % 6], roughness: 0.95 }), x, 0.9 + s + r() * 0.12, z, g, 12, 8); b.scale.y = 0.85; if (i % 4 === 0) { sphere(s * 0.35, b.material, x - s * 0.6, b.position.y + s * 0.8, z, g, 8, 6); sphere(s * 0.35, b.material, x + s * 0.6, b.position.y + s * 0.8, z, g, 8, 6); } }
  const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 20, 1, true), glass); chute.position.set(W / 2 - 0.22, 0.94, D / 2 - 0.22); g.add(chute);
  // gantry + claw
  for (const sz of [-1, 1]) box(W - 0.06, 0.03, 0.03, chrome, 0, 1.86, sz * (D / 2 - 0.08), g); box(0.04, 0.04, D - 0.12, chrome, -0.1, 1.84, 0, g);
  rod(V(-0.1, 1.82, 0.05), V(-0.1, 1.45, 0.05), 0.004, std({ color: '#222' }), g); cyl(0.04, 0.05, 0.07, chrome, -0.1, 1.42, 0.05, g, 14);
  for (let k = 0; k < 3; k++) { const a = k * 2.094; const p0 = V(-0.1 + Math.cos(a) * 0.03, 1.39, 0.05 + Math.sin(a) * 0.03); const p1 = V(-0.1 + Math.cos(a) * 0.08, 1.31, 0.05 + Math.sin(a) * 0.08); const p2 = V(-0.1 + Math.cos(a) * 0.05, 1.25, 0.05 + Math.sin(a) * 0.05); rod(p0, p1, 0.007, chrome, g); rod(p1, p2, 0.007, chrome, g); }
  // front panel: joystick + button, coin slot, prize door
  const fp = new THREE.Group(); fp.position.set(0, 0.86, D / 2); g.add(fp); box(W - 0.1, 0.05, 0.14, pink, 0, 0, 0.06, fp);
  cyl(0.008, 0.008, 0.08, std({ color: '#111' }), -0.2, 0.06, 0.06, fp, 8); sphere(0.024, std({ color: '#e8302a', roughness: 0.3 }), -0.2, 0.1, 0.06, fp); cyl(0.03, 0.03, 0.02, std({ color: '#3ab84a', emissive: '#1a6a2a', emissiveIntensity: 0.6 }), 0.15, 0.03, 0.06, fp, 16);
  box(0.3, 0.25, 0.01, std({ color: '#2a2a2c' }), W / 2 - 0.25, -0.5, 0.005, fp); box(0.06, 0.12, 0.02, chrome, -0.3, -0.25, 0.01, fp);
  const lt = new THREE.PointLight('#ffd8f0', 1.2, 2.5, 1.5); lt.position.set(0, 1.75, 0); g.add(lt);
  g.userData.collider = [-W / 2 - 0.02, W / 2 + 0.02, -D / 2 - 0.02, D / 2 + 0.15];
  return g;
}
export function makeCoinChanger() {
  const g = new THREE.Group(); g.name = 'coin_changer';
  const W = 0.5, D = 0.42, H = 1.85;
  const face = canvasT(256, 960, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f08a1a'; for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(40 + (i * 67) % 200, 200 + i * 90, 30, 0, 7); x.fill(); }
    x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, 150); x.fillStyle = '#fff'; fitText(x, '両替', w / 2, 75, w - 40, 110, F.brush);
    x.fillStyle = '#1e4ab8'; x.fillRect(20, 170, w - 40, 70); x.fillStyle = '#fff'; fitText(x, 'CHANGE', w / 2, 205, w - 60, 54, F.heavy, { spacing: 4 });
    x.fillStyle = '#111'; x.fillRect(48, 290, 160, 60); x.fillStyle = '#3ab84a'; x.font = `40px ${F.led}`; x.fillText('$ 0.00', 62, 335);
    x.fillStyle = '#2a2a2c'; x.fillRect(60, 380, 136, 30); x.fillStyle = '#7a7c80'; x.fillRect(70, 390, 116, 8); x.fillStyle = '#111'; fitText(x, 'BILLS IN  $1 $5 $10', w / 2, 440, w - 40, 20, F.label);
    x.fillStyle = '#1e4ab8'; x.fillRect(20, 480, w - 40, 260); x.fillStyle = '#fff'; fitText(x, 'COINS', w / 2, 520, w - 80, 34, F.heavy); fitText(x, '↓', w / 2, 600, 80, 90, F.label); x.fillStyle = '#111'; x.fillRect(58, 650, 140, 70);
    x.fillStyle = '#e8402a'; fitText(x, 'ARCADE TOKENS · 4 FOR $1', w / 2, 800, w - 30, 22, F.label); x.fillStyle = '#111'; fitText(x, 'no refunds · ask staff', w / 2, 840, w - 40, 18, F.small); });
  const side = canvasT(256, 960, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, 150); x.save(); x.translate(w / 2, h / 2 + 60); x.rotate(-Math.PI / 2); x.fillStyle = '#1e4ab8'; fitText(x, 'CHANGER', 0, 0, h - 300, 120, F.heavy); x.restore(); });
  const mats = [std({ map: side }), std({ map: side }), std({ color: '#1a1a1c' }), std({ color: '#1a1a1c' }), std({ map: face, roughness: 0.4 }), std({ color: '#1a1a1c' })];
  box(W, H, D, mats, 0, H / 2, 0, g);
  const brass = std({ map: tex('i7_brass', 0.5, 0.5), metalness: 0.8, roughness: 0.35 });
  box(0.18, 0.12, 0.12, brass, 0, 0.62, D / 2 + 0.06, g);   // coin cup
  box(W + 0.02, 0.05, D + 0.02, std({ color: '#111' }), 0, 0.025, 0, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2 + 0.12];
  return g;
}
export function makeBoardGameTable() {
  const g = new THREE.Group(); g.name = 'board_game_table';
  const top = std({ color: '#2a2422', roughness: 0.5 }); const L = 1.8, W = 1.0, Y = 0.74;
  box(L, 0.05, W, top, 0, Y, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.06, Y, 0.06, top, sx * (L / 2 - 0.08), Y / 2, sz * (W / 2 - 0.08), g);
  box(L - 0.2, 0.03, W - 0.2, std({ color: '#3a302a' }), 0, 0.25, 0, g);
  const board = canvasT(1024, 640, (x, w, h) => { x.fillStyle = '#c8b480'; x.fillRect(0, 0, w, h); const r = rng(72);
    for (let i = 0; i < 60; i++) { x.fillStyle = ['#2a4a6a', '#6a8a5a', '#a89060', '#5a5a5a'][i % 4]; x.beginPath(); const cx = r() * w, cy = r() * h * 0.7; x.moveTo(cx, cy); for (let k = 0; k < 7; k++) x.lineTo(cx + Math.cos(k) * (30 + r() * 60), cy + Math.sin(k) * (30 + r() * 50)); x.fill(); }
    x.strokeStyle = '#2a1a10'; x.lineWidth = 2; for (let i = 0; i < 30; i++) { x.beginPath(); x.moveTo(r() * w, r() * h * 0.7); x.lineTo(r() * w, r() * h * 0.7); x.stroke(); }
    x.fillStyle = '#3a2a1e'; x.fillRect(0, h * 0.72, w, h * 0.28); x.fillStyle = '#d8c8a0'; for (let i = 0; i < 20; i++) { x.fillRect(30 + i * 48, h * 0.78, 40, 50); x.fillStyle = i % 2 ? '#d8c8a0' : '#c8b890'; } x.fillStyle = '#e8402a'; x.fillRect(30, h * 0.92, w - 60, 8);
    x.fillStyle = '#111'; x.font = `28px ${F.engraved}`; x.fillText('ASHEN REALMS', 40, h * 0.76); });
  plane(1.3, 0.81, std({ map: board, roughness: 0.7 }), 0, 0, 0, 0, g).rotation.set(-Math.PI / 2, 0, 0); g.children[g.children.length - 1].position.set(0, Y + 0.027, -0.05);
  // player boards, tokens, figures, cards
  const pb = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#5a3a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8c8a0'; for (let i = 0; i < 6; i++) x.fillRect(20 + i * 80, 30, 60, 90); x.fillStyle = '#111'; x.font = `22px ${F.engraved}`; x.fillText('MARCH  ·  BUILD  ·  TRADE', 30, 150); });
  for (const sz of [-1, 1]) { const p = plane(0.6, 0.19, std({ map: pb }), 0, 0, 0, 0, g); p.rotation.set(-Math.PI / 2, 0, sz > 0 ? 0 : Math.PI); p.position.set(-0.3, Y + 0.028, sz * 0.43); }
  const r = rng(9);
  for (let i = 0; i < 14; i++) { const c = ['#111', '#e8e8e8', '#8a1a1a'][i % 3]; const m = std({ color: c, roughness: 0.4 }); const x = (r() - 0.5) * 1.1, z = (r() - 0.5) * 0.6 - 0.05; cyl(0.014, 0.018, 0.035, m, x, Y + 0.045, z, g, 10); sphere(0.012, m, x, Y + 0.07, z, g, 8, 6); }
  for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(0.1 + i * 0.09, Y + 0.025, 0.4); g.add(f); const m = std({ color: '#141414', roughness: 0.4 }); box(0.05, 0.03, 0.08, m, 0, 0.015, 0, f); box(0.025, 0.05, 0.05, m, 0, 0.055, 0.0, f); box(0.04, 0.02, 0.03, m, 0, 0.08, 0.03, f); }
  const card = canvasT(128, 180, (x, w, h) => { x.fillStyle = '#c8402a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c21a'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20); x.beginPath(); x.arc(w / 2, h / 2, 26, 0, 7); x.stroke(); x.beginPath(); x.moveTo(w / 2, h / 2 - 26); x.lineTo(w / 2, h / 2 + 26); x.moveTo(w / 2 - 26, h / 2); x.lineTo(w / 2 + 26, h / 2); x.stroke(); });
  for (let i = 0; i < 3; i++) { const c = plane(0.063, 0.088, std({ map: card }), 0, 0, 0, 0, g); c.rotation.set(-Math.PI / 2, 0, 0.1 * i); c.position.set(0.58 + i * 0.07, Y + 0.03 + i * 0.001, 0.3); }
  box(0.25, 0.04, 0.18, std({ color: '#f2f2ee' }), -0.75, Y + 0.045, 0.25, g);   // rulebook
  for (let i = 0; i < 4; i++) cyl(0.02, 0.02, 0.006, std({ color: '#c8a070' }), 0.65 + (i % 2) * 0.05, Y + 0.03 + Math.floor(i / 2) * 0.006, -0.2, g, 14);
  // stools
  for (const [sx, sz] of [[-0.5, 1], [0.4, 1], [-0.5, -1], [0.4, -1]]) { const st = new THREE.Group(); st.position.set(sx, 0, sz * 0.78); g.add(st); cyl(0.17, 0.17, 0.05, std({ color: '#141416', roughness: 0.4 }), 0, 0.46, 0, st, 20); cyl(0.025, 0.025, 0.44, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.22, 0, st, 10); cyl(0.2, 0.2, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.01, 0, st, 20); }
  g.userData.collider = [-L / 2, L / 2, -W / 2, W / 2];
  return g;
}
// a console stack: a grey CRT, a VCR on it, a black disc console, a white tower console standing up, a slim black
// console on a red riser with a cartridge and two little figures
export function makeConsoleStack() {
  const g = new THREE.Group(); g.name = 'console_stack';
  const blk = std({ color: '#141416', roughness: 0.35 }), grey = std({ color: '#3a3c40', roughness: 0.5 });
  // low TV cabinet + the CRT
  box(0.9, 0.5, 0.5, std({ color: '#2a2420' }), 0, 0.25, 0, g);
  rbox(0.72, 0.5, 0.55, 0.05, grey, 0, 0.75, -0.02, g);
  const vcrT = canvasT(512, 96, (x, w, h) => { x.fillStyle = '#18181a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ddd'; x.font = `bold 20px ${F.label}`; x.fillText('VIDEOLINE', 16, 30); x.font = `12px ${F.small}`; x.fillText('Hi-Fi STEREO  ·  4 HEAD', 16, 52);
    x.fillStyle = '#0a0a0a'; x.fillRect(150, 36, 200, 26); x.fillStyle = '#3ad8f2'; x.font = `18px ${F.led}`; x.fillText('12:00', 380, 40); x.fillStyle = '#555'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(380 + i * 20, 70, 6, 0, 7); x.fill(); } });
  const vcr = box(0.43, 0.09, 0.32, [blk, blk, blk, blk, std({ map: vcrT, roughness: 0.4 }), blk], 0, 1.045, 0.02, g); void vcr;
  // the black disc console (round lid, two ports) + a memory cart
  const c1 = new THREE.Group(); c1.position.set(0, 1.09, 0.02); g.add(c1);
  box(0.26, 0.08, 0.24, blk, 0, 0.04, 0, c1); cyl(0.085, 0.09, 0.015, std({ color: '#222', roughness: 0.3 }), 0, 0.087, -0.01, c1, 32);
  const mem = canvasT(128, 64, (x, w, h) => { x.fillStyle = '#2a4ab8'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, 'SAVE', w / 2, 34, w - 20, 36, F.heavy); }); box(0.06, 0.04, 0.012, std({ map: mem }), 0, 0.1, -0.1, c1);
  // white tower console standing on its side, a black one on the left
  rbox(0.05, 0.2, 0.2, 0.01, std({ color: '#f2f2ee', roughness: 0.35 }), 0.32, 1.19, 0.02, g); rbox(0.05, 0.2, 0.2, 0.01, blk, -0.32, 1.19, 0.02, g);
  // red riser shelf with the slim black console, a green cart box, little figures
  const rs = std({ color: '#c8402a', roughness: 0.4 }); box(0.8, 0.03, 0.26, rs, 0, 1.31, 0.02, g); for (const sx of [-1, 1]) box(0.03, 0.03, 0.26, blk, sx * 0.39, 1.29, 0.02, g);
  rbox(0.32, 0.06, 0.2, 0.02, blk, 0, 1.355, 0.02, g); cyl(0.04, 0.04, 0.01, std({ color: '#2a2a2a' }), 0.08, 1.39, 0.02, g, 20);
  const gb = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#3ab84a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'GAME', w / 2, 50, w - 20, 34, F.heavy); fitText(x, 'COMBO 6', w / 2, 90, w - 20, 26, F.label); x.fillStyle = '#111'; x.fillRect(10, 110, w - 20, 36); });
  box(0.12, 0.15, 0.025, std({ map: gb }), 0, 1.46, -0.02, g);
  box(0.07, 0.02, 0.05, std({ color: '#f2c21a' }), -0.12, 1.39, 0.06, g);
  for (const [sx, c] of [[-0.33, '#3ab88a'], [0.33, '#5a8ad8']]) { sphere(0.035, std({ color: c, roughness: 0.4 }), sx, 1.36, 0.06, g); sphere(0.02, std({ color: '#e8402a' }), sx, 1.41, 0.06, g); }
  g.userData.collider = [-0.45, 0.45, -0.3, 0.27];
  return g;
}

// ---- the arcade building -------------------------------------------------------------------------------------------
// painted mural walls: glowing orange bubble clusters over a dark green / blue starry wash (inspired by the photo)
function muralT(seed) { return canvasT(1024, 512, (x, w, h) => { const r = rng(seed); const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a2a3a'); gr.addColorStop(0.5, '#123a2a'); gr.addColorStop(1, '#0a0a1a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 18; i++) { const cx = r() * w, cy = r() * h * 0.6, rr = 40 + r() * 70; const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); rg.addColorStop(0, 'rgba(60,200,140,0.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
  for (let i = 0; i < 260; i++) { const cx = r() * w, cy = h * (0.45 + r() * 0.55), rr = 8 + r() * 26; const rg = x.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 1, cx, cy, rr); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(0.5, '#f08a1a'); rg.addColorStop(1, '#6a2a0a'); x.fillStyle = rg; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); }
  x.fillStyle = '#fff'; for (let i = 0; i < 120; i++) x.fillRect(r() * w, r() * h * 0.5, 2, 2); }); }
export function makeArcade() {
  const g = new THREE.Group(); g.name = 'arcade_pixel_den';
  const W = 20, D = 16, H = 4.4, X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
  const cols = [], put = placer(g, cols);
  const brick = std({ map: tex('i4_brick_red', W / 2.2, H / 1.6), roughness: 0.9 }), blk = std({ color: '#0e0e10', roughness: 0.25, metalness: 0.2 });
  // shell: brick outside, the mural inside (back + sides), dark ceiling, black glossy floor tiles
  box(W + 0.4, H + 0.6, 0.2, brick, 0, (H + 0.6) / 2, Z0 - 0.1, g); for (const sx of [-1, 1]) box(0.2, H + 0.6, D, std({ map: tex('i4_brick_red', D / 2.2, H / 1.6), roughness: 0.9 }), sx * (X1 + 0.1), (H + 0.6) / 2, 0, g);
  box(W + 0.4, 0.2, D + 0.2, std({ color: '#2a2a2c' }), 0, H + 0.7, 0, g);
  const mm = std({ map: muralT(3), roughness: 0.8 }), mm2 = std({ map: muralT(8), roughness: 0.8 });
  plane(W, H, mm, 0, H / 2, Z0 + 0.01, 0, g); plane(D, H, mm2, X0 + 0.01, H / 2, 0, Math.PI / 2, g); plane(D, H, mm2, X1 - 0.01, H / 2, 0, -Math.PI / 2, g);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#141418' })); cl.rotation.x = Math.PI / 2; cl.position.y = H; g.add(cl);
  const tile = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#121214'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2a30'; x.lineWidth = 3; x.strokeRect(0, 0, w, h); x.fillStyle = 'rgba(80,80,120,0.25)'; for (let i = 0; i < 40; i++) x.fillRect((i * 97) % w, (i * 53) % h, 3, 3); }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(W / 0.6, D / 0.6);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), phys({ map: tile, roughness: 0.25, clearcoat: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
  // the foil-shard ceiling panel over the lounge, neon strips
  const foil = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), std({ map: tex('i7_foil', 3, 1.5), metalness: 0.9, roughness: 0.15, emissive: '#ffffff', emissiveMap: tex('i7_foil', 3, 1.5), emissiveIntensity: 0.15 })); foil.rotation.x = Math.PI / 2; foil.position.set(0, H - 0.02, 4.5); g.add(foil);
  const neon = (c) => std({ color: c, emissive: c, emissiveIntensity: 2.5 });
  for (const [x, z, l, c, ry] of [[0, Z0 + 0.08, W - 1, '#3af2a8', 0], [X0 + 0.08, 0, D - 1, '#c83af2', Math.PI / 2], [X1 - 0.08, 0, D - 1, '#c83af2', Math.PI / 2]]) { const n = box(l, 0.04, 0.04, neon(c), x, H - 0.3, z, g); n.rotation.y = ry; n.castShadow = false; }
  // front: brick piers, big glass, double door, the sign
  for (const x of [X0 + 0.6, X1 - 0.6]) box(1.2, H + 0.6, 0.35, brick, x, (H + 0.6) / 2, Z1, g);
  box(W, 0.9, 0.35, brick, 0, H + 0.15, Z1, g);
  const gl = new THREE.MeshPhysicalMaterial({ color: '#a8c8d8', transparent: true, opacity: 0.22, roughness: 0.04, depthWrite: false, side: THREE.DoubleSide });
  for (const [x0, x1] of [[X0 + 1.2, -1.2], [1.2, X1 - 1.2]]) { plane(x1 - x0, H - 0.3, gl, (x0 + x1) / 2, (H - 0.3) / 2, Z1, 0, g); box(x1 - x0, 0.3, 0.3, blk, (x0 + x1) / 2, 0.15, Z1, g); }
  for (const x of [-1.2, 1.2, X0 + 4.5, X1 - 4.5]) box(0.08, H - 0.3, 0.12, blk, x, (H - 0.3) / 2, Z1, g);
  box(2.4, 0.12, 0.14, blk, 0, 2.5, Z1, g);
  for (const sx of [-1, 1]) { const d = new THREE.Group(); d.position.set(sx * 1.15, 0, Z1); d.rotation.y = sx * 1.1; g.add(d); plane(1.1, 2.4, gl, -sx * 0.55, 1.22, 0, 0, d); box(0.04, 0.5, 0.04, std({ color: '#c8ccd0', metalness: 0.9 }), -sx * 1.0, 1.1, 0.06, d); }
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#0a0a12'; x.fillRect(0, 0, w, h); x.shadowColor = '#f23ab8'; x.shadowBlur = 30; x.fillStyle = '#ff5ad8'; fitText(x, 'PIXEL DEN', w / 2, 110, w - 160, 150, F.retro, { spacing: 8 }); x.shadowColor = '#3af2e8'; x.fillStyle = '#7af8f0'; fitText(x, 'ARCADE · TABLE GAMES · PRIZES', w / 2, 212, w - 240, 40, F.label, { spacing: 4 }); });
  box(9, 1.6, 0.2, std({ map: sg, emissive: '#ffffff', emissiveMap: sg, emissiveIntensity: 1.2 }), 0, H + 0.1, Z1 + 0.3, g);
  const hours = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'HOURS', w / 2, 40, w - 40, 30, F.label); ['MON-THU 2PM-11PM', 'FRI 2PM-1AM', 'SAT 11AM-1AM', 'SUN 11AM-10PM'].forEach((l, i) => fitText(x, l, w / 2, 90 + i * 36, w - 30, 22, F.small)); x.fillStyle = '#ff5ad8'; fitText(x, '(555) 018-7720', w / 2, 236, w - 50, 22, F.label); });
  plane(0.4, 0.4, std({ map: hours, transparent: true }), 1.8, 1.4, Z1 + 0.012, 0, g);
  // the black arch partition (lounge in front, the game room behind)
  const AZ = 1.0;
  const ash = new THREE.Shape(); ash.moveTo(X0, 0); ash.lineTo(X1, 0); ash.lineTo(X1, H); ash.lineTo(X0, H); ash.closePath();
  const ap = new THREE.Path(); ap.moveTo(-1.3, 0); ap.lineTo(1.3, 0); ap.lineTo(1.3, 2.3); ap.absarc(0, 2.3, 1.3, 0, Math.PI, false); ap.lineTo(-1.3, 0); ash.holes.push(ap);
  const ap2 = new THREE.Path(); ap2.moveTo(-7.8, 0.9); ap2.lineTo(-4.2, 0.9); ap2.lineTo(-4.2, 2.6); ap2.lineTo(-7.8, 2.6); ap2.closePath(); ash.holes.push(ap2);   // a window into the game room
  const aw = new THREE.Mesh(new THREE.ExtrudeGeometry(ash, { depth: 0.3, bevelEnabled: false, curveSegments: 24 }), blk); aw.position.z = AZ - 0.15; aw.castShadow = true; aw.receiveShadow = true; g.add(aw);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 10, 40, Math.PI), std({ color: '#18181c', roughness: 0.2, metalness: 0.4 })); trim.position.set(0, 2.3, AZ + 0.17); g.add(trim); for (const sx of [-1, 1]) box(0.16, 2.3, 0.1, trim.material, sx * 1.42, 1.15, AZ + 0.17, g);
  // mural panels on the arch wall front (the photo's orange-cloud pillars)
  for (const sx of [-1, 1]) plane(2.2, 3.4, std({ map: muralT(20 + sx), roughness: 0.8 }), sx * 2.8, 1.8, AZ + 0.16, 0, g);
  cols.push([X0, -1.4, AZ - 0.15, AZ + 0.15], [1.4, X1, AZ - 0.15, AZ + 0.15]);
  // game room (behind the arch): the four-player cab facing the arch, racing cabs, claw machines + the changer
  put(makeFourPlayerCab(), 0, Z0 + 1.1);
  put(makeRacingCab('taxi'), -7.6, Z0 + 1.1); put(makeRacingCab('scooter'), -6.3, Z0 + 1.1); put(makeRacingCab('taxi'), -5.0, Z0 + 1.1);
  put(makeClawMachine(1), 5.0, Z0 + 0.7); put(makeClawMachine(2), 6.1, Z0 + 0.7); put(makeCoinChanger(), 6.9, Z0 + 0.5); put(makeClawMachine(3), 7.8, Z0 + 0.7);
  put(makeFourPlayerCab(), X1 - 0.85, -3.0, -Math.PI / 2); put(makeClawMachine(4), X1 - 0.6, -0.4, -Math.PI / 2);
  // lounge (in front of the arch): air hockey, the board-game table, the console stack + a sofa, a bar table
  put(makeAirHockey(), -1.0, 4.4, 0.08);
  put(makeBoardGameTable(), -6.2, 4.0);
  put(makeConsoleStack(), 6.8, AZ + 0.55);
  const sofa = new THREE.Group(); const sm = libMat82('b82_chenille', 2, 1, { color: '#8a78c8', roughness: 0.95 });   // item 82: chenille upholstery rbox(2.2, 0.42, 0.9, 0.1, sm, 0, 0.21, 0, sofa); rbox(2.2, 0.5, 0.25, 0.1, sm, 0, 0.55, -0.33, sofa); for (const sx of [-1, 1]) rbox(0.25, 0.6, 0.9, 0.1, sm, sx * 1.0, 0.3, 0, sofa); sofa.userData.collider = [-1.1, 1.1, -0.45, 0.45];
  put(sofa, 6.8, 3.6, Math.PI);
  const bt = new THREE.Group(); cyl(0.32, 0.32, 0.03, std({ color: '#141416', roughness: 0.2 }), 0, 1.05, 0, bt, 28); cyl(0.03, 0.03, 1.05, std({ color: '#c8ccd0', metalness: 0.9 }), 0, 0.525, 0, bt, 10); cyl(0.25, 0.25, 0.02, std({ color: '#c8ccd0', metalness: 0.9 }), 0, 0.01, 0, bt, 24); bt.userData.collider = [-0.32, 0.32, -0.32, 0.32];
  put(bt, -3.6, 6.4);
  // lights: two in the game room (coloured), one warm in the lounge
  for (const [x, z, c, i] of [[-5, -4, '#b89aff', 28], [5, -4, '#8af2d8', 28], [0, -4, '#ffffff', 18], [-5, 4.5, '#ffe8d0', 26], [5, 4.5, '#ffe8d0', 26]]) { const p = new THREE.PointLight(c, i, 14, 1.4); p.position.set(x, H - 0.6, z); g.add(p); }
  cols.push([X0 - 0.3, X0, Z0, Z1], [X1, X1 + 0.3, Z0, Z1], [X0, X1, Z0 - 0.3, Z0], [X0, -1.25, Z1 - 0.2, Z1 + 0.2], [1.25, X1, Z1 - 0.2, Z1 + 0.2]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.2 }, { minX: -1.2, maxX: 1.2, minZ: Z1 - 0.4, maxZ: Z1 + 1.5 }];
  return g;
}

// ---- the shuttered yakitori stall + street props -------------------------------------------------------------------
// the roll shutter: a corrugated sheet (geometry ridges) carrying an original painting: a woman in a starry indigo
// kimono seen from behind, a gold obi and hairpin, a crescent moon, stars over a deep blue night
function shutterArt() { return canvasT(1024, 768, (x, w, h) => {
  const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#0a0e2a'); gr.addColorStop(0.45, '#1a2a6a'); gr.addColorStop(1, '#2a7ad8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  const r = rng(77); x.fillStyle = '#fff'; for (let i = 0; i < 260; i++) { const sx = r() * w * 0.6, sy = r() * h, s = r() < 0.1 ? 3 : 1.5; x.beginPath(); x.arc(sx, sy, s, 0, 7); x.fill(); }
  x.fillStyle = '#f8f0c0'; x.beginPath(); x.arc(170, 150, 60, 0, 7); x.fill(); x.fillStyle = '#0e1438'; x.beginPath(); x.arc(195, 135, 56, 0, 7); x.fill();
  // the figure: kimono silhouette widening to the hem, a long sleeve, a bun with a pin
  x.save(); x.translate(560, 0);
  x.fillStyle = '#1a2058'; x.beginPath(); x.moveTo(30, 200); x.bezierCurveTo(-40, 260, -70, 480, -110, 768); x.lineTo(260, 768); x.bezierCurveTo(220, 520, 200, 300, 150, 200); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(150, 230); x.bezierCurveTo(260, 260, 300, 380, 280, 520); x.lineTo(200, 520); x.bezierCurveTo(210, 400, 190, 320, 140, 300); x.fill();   // sleeve
  x.fillStyle = '#e8eef8'; for (let i = 0; i < 70; i++) { const px = -80 + r() * 330, py = 220 + r() * 540; x.save(); x.translate(px, py); x.rotate(r()); x.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 3 : 8; x.lineTo(Math.cos(k * Math.PI / 5) * rr, Math.sin(k * Math.PI / 5) * rr); } x.fill(); x.restore(); }
  x.fillStyle = '#e8b83a'; x.fillRect(10, 380, 170, 60); x.fillStyle = '#c8402a'; x.fillRect(10, 405, 170, 10);   // obi
  x.fillStyle = '#f4e0c8'; x.beginPath(); x.moveTo(60, 200); x.lineTo(120, 200); x.lineTo(110, 150); x.lineTo(70, 150); x.fill();   // nape
  x.fillStyle = '#141018'; x.beginPath(); x.ellipse(90, 120, 52, 46, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(90, 70, 34, 26, 0, 0, 7); x.fill();
  x.strokeStyle = '#f2c21a'; x.lineWidth = 6; x.beginPath(); x.moveTo(40, 60); x.lineTo(150, 84); x.stroke(); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(152, 85, 9, 0, 7); x.fill();
  x.restore();
  x.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 20; i++) x.fillRect(r() * w, r() * h, 60 + r() * 120, 3); }); }
export function makeShutterShop() {
  const g = new THREE.Group(); g.name = 'shutter_shop';
  const W = 4.6, H = 3.0, D = 6;
  const teal = std({ color: '#2a9ab8', roughness: 0.6 }), stucco = std({ map: tex('tx_stucco', 2, 2), roughness: 0.9 });
  box(W, H + 1.6, D, stucco, 0, (H + 1.6) / 2, -D / 2 - 0.3, g);
  box(W, 0.35, 0.3, teal, 0, H + 0.1, 0, g); for (const sx of [-1, 1]) box(0.3, H, 0.3, teal, sx * (W / 2 - 0.15), H / 2, 0, g);
  box(W - 0.6, 0.12, 0.12, std({ color: '#8a8c90', metalness: 0.7 }), 0, H - 0.25, 0.05, g);
  // corrugated shutter: a plane with sine ridges in z
  const sw = W - 0.7, shH = H - 0.4; const sg = new THREE.PlaneGeometry(sw, shH, 1, 120); const p = sg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.012 * Math.sin(p.getY(i) * 2 * Math.PI / 0.075)); sg.computeVertexNormals();
  const sh = new THREE.Mesh(sg, std({ map: shutterArt(), roughness: 0.5, metalness: 0.3 })); sh.position.set(0, shH / 2, -0.05); sh.receiveShadow = true; g.add(sh);
  box(sw, 0.06, 0.08, std({ color: '#5a5c60', metalness: 0.7 }), 0, 0.03, -0.03, g);
  // the red vertical sign on a black board, mounted on the left pier
  const ys = canvasT(160, 640, (x, w, h) => { x.fillStyle = '#141416'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8261e'; '炭火焼鳥'.split('').forEach((c, i) => fitText(x, c, w / 2, 90 + i * 150, w - 20, 130, F.brush)); });
  box(0.42, 1.8, 0.25, [std({ color: '#141416' }), std({ color: '#141416' }), std({ color: '#141416' }), std({ color: '#141416' }), std({ map: ys, emissive: '#ffffff', emissiveMap: ys, emissiveIntensity: 0.25 }), std({ color: '#141416' })], -W / 2 + 0.15, 1.9, 0.35, g);
  const nr = canvasT(512, 96, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2a2a'; fitText(x, '本日休業  ·  closed today', w / 2, 52, w - 40, 40, F.antique); });
  plane(1.2, 0.22, std({ map: nr }), 0.6, H + 0.1, 0.16, 0, g);
  g.userData.collider = [-W / 2, W / 2, -D - 0.3, 0.5];
  return g;
}
// a grey steel drum with a rusted lid, a red pole, a red fire extinguisher cylinder and a leaning board
export function makeStreetDrum() {
  const g = new THREE.Group(); g.name = 'street_drum';
  const grey = std({ color: '#8a8e92', roughness: 0.6, metalness: 0.4 });
  const lp = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 0.88; let r = 0.29; if (Math.abs(y - 0.29) < 0.02 || Math.abs(y - 0.59) < 0.02) r = 0.3; lp.push(new THREE.Vector2(r, y)); }
  const drum = new THREE.Mesh(new THREE.LatheGeometry(lp, 32), grey); drum.castShadow = true; g.add(drum);
  cyl(0.3, 0.3, 0.03, std({ map: tex('rusty_paint', 1, 1), color: '#c88a5a', roughness: 0.9 }), 0, 0.895, 0, g, 32);
  const sticker = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8261e'; fitText(x, '危', w / 2, 70, 100, 90, F.brush); x.fillStyle = '#111'; fitText(x, 'KEEP CLOSED', w / 2, 138, w - 16, 20, F.label); });
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.292, 0.292, 0.16, 32, 1, true, -0.3, 0.6), std({ map: sticker, transparent: true })); st.position.y = 0.45; g.add(st);
  cyl(0.05, 0.05, 3.6, std({ color: '#d8261e', roughness: 0.4 }), 0.45, 1.8, -0.1, g, 16);
  const red = std({ color: '#d8261e', roughness: 0.35 }); const ex = new THREE.Group(); ex.position.set(0.55, 0, 0.3); g.add(ex);
  cyl(0.1, 0.1, 0.5, red, 0, 0.25, 0, ex, 24); sphere(0.1, red, 0, 0.5, 0, ex); ex.children[1].scale.y = 0.5; cyl(0.03, 0.035, 0.08, std({ color: '#2a2a2a' }), 0, 0.58, 0, ex, 12);
  box(0.1, 0.012, 0.03, std({ color: '#2a2a2a' }), 0.05, 0.63, 0, ex); const band = cyl(0.102, 0.102, 0.06, std({ color: '#f4f2ea' }), 0, 0.3, 0, ex, 24); void band;
  const bd = box(0.7, 1.1, 0.03, std({ map: tex('slat_wood', 1, 1), color: '#7a6a5a', roughness: 0.9 }), -0.15, 0.55, -0.42, g); bd.rotation.x = -0.12;
  g.userData.collider = [-0.32, 0.7, -0.48, 0.42];
  return g;
}

// ---- temple ---------------------------------------------------------------------------------------------------------
// white paper lantern (chōchin): a lathe body with black rings top/bottom, made-up donor names brushed on
const LANT_PROFILE = (() => { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, y = t * 0.62; pts.push(new THREE.Vector2(0.06 + 0.17 * Math.sin(Math.PI * (0.08 + t * 0.84)), y)); } return pts; })();
function lanternPaper() { return canvasT(512, 256, (x, w, h) => { x.fillStyle = '#f8f6ee'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(160,150,130,0.25)'; for (let y = 0; y < h; y += 9) x.fillRect(0, y, w, 1.5);
  const names = ['星見講', '奉納', '商店会', '青年部', '有志一同', '和田家', '中村家']; x.fillStyle = '#141414'; x.font = `48px ${F.brush}`; x.textAlign = 'center';
  for (let k = 0; k < 2; k++) { const n = names[k * 3 % names.length]; n.split('').forEach((c, i) => x.fillText(c, 128 + k * 256, 70 + i * 44)); } x.fillStyle = '#c8261e'; x.fillRect(0, 0, w, 14); x.fillRect(0, h - 14, w, 14); }); }
export function makePaperLantern() { const g = new THREE.Group(); g.name = 'paper_lantern'; const m = new THREE.Mesh(new THREE.LatheGeometry(LANT_PROFILE, 24), std({ map: lanternPaper(), emissive: '#fff4d8', emissiveIntensity: 0.6, roughness: 0.9, side: THREE.DoubleSide })); g.add(m); for (const y of [0, 0.62]) cyl(0.075, 0.075, 0.04, std({ color: '#141414' }), 0, y, 0, g, 20); return g; }
export function makeIncenseBurner() {
  const g = new THREE.Group(); g.name = 'incense_burner';
  const bronze = std({ map: tex('i7_brass', 1, 1), color: '#4a4440', metalness: 0.8, roughness: 0.45 }), stone = std({ map: tex('i5_stone', 1, 1), color: '#8a8884', roughness: 0.9 });
  cyl(0.9, 0.95, 0.5, stone, 0, 0.25, 0, g, 32);
  const bowl = []; for (let i = 0; i <= 14; i++) { const t = i / 14; bowl.push(new THREE.Vector2(0.25 + 0.5 * Math.sin(t * Math.PI * 0.55), 0.55 + t * 0.6)); } bowl.push(new THREE.Vector2(0.72, 1.18));
  const b = new THREE.Mesh(new THREE.LatheGeometry(bowl, 32), bronze); b.castShadow = true; g.add(b);
  for (let k = 0; k < 3; k++) { const a = k * 2.094; const leg = rod(V(Math.cos(a) * 0.35, 0.72, Math.sin(a) * 0.35), V(Math.cos(a) * 0.52, 0.5, Math.sin(a) * 0.52), 0.06, bronze, g); void leg; }
  for (const s of [-1, 1]) { const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 16, Math.PI), bronze); hnd.position.set(s * 0.75, 1.15, 0); hnd.rotation.y = Math.PI / 2; g.add(hnd); }
  cyl(0.68, 0.68, 0.02, std({ color: '#8a8278', roughness: 1 }), 0, 1.12, 0, g, 32);   // the ash bed
  for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 0.2 + (i % 3) * 0.12; rod(V(Math.cos(a) * r, 1.12, Math.sin(a) * r), V(Math.cos(a) * r * 1.05, 1.36, Math.sin(a) * r * 1.05), 0.004, std({ color: '#3a6a3a' }), g, 4); sphere(0.007, std({ color: '#ff6a2a', emissive: '#ff4a0a', emissiveIntensity: 2 }), Math.cos(a) * r * 1.05, 1.36, Math.sin(a) * r * 1.05, g, 6, 4); }
  // the little roof on a central post
  cyl(0.05, 0.05, 1.9, bronze, 0, 2.05, 0, g, 12);
  const rf = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.45, 6, 1, true), std({ color: '#2a2826', metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide })); rf.position.y = 3.05; g.add(rf);
  sphere(0.1, bronze, 0, 3.32, 0, g); cyl(0.02, 0.02, 0.4, bronze, 0, 3.55, 0, g, 8);
  // smoke: a few soft translucent puffs
  const smoke = std({ color: '#d8d8d8', transparent: true, opacity: 0.12, depthWrite: false, roughness: 1 }); for (let i = 0; i < 5; i++) sphere(0.15 + i * 0.06, smoke, Math.sin(i) * 0.1, 1.5 + i * 0.28, 0, g, 10, 8).castShadow = false;
  g.userData.collider = [-0.95, 0.95, -0.95, 0.95];
  return g;
}
export function makeNobori(text = '大願成就', color = '#d8261e') {
  const g = new THREE.Group(); g.name = 'nobori';
  const t = canvasT(160, 800, (x, w, h) => { x.fillStyle = color; x.fillRect(0, 0, w, h); x.fillStyle = '#f8f6ee'; x.fillRect(16, 50, w - 32, h - 100); x.fillStyle = '#141414'; text.split('').forEach((c, i) => fitText(x, c, w / 2, 130 + i * 160, w - 50, 130, F.brush)); x.fillStyle = color; x.beginPath(); x.arc(w / 2, 30, 18, 0, 7); x.fill(); });
  const cl = new THREE.PlaneGeometry(0.5, 2.5, 4, 12); const p = cl.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.03 * Math.sin(p.getY(i) * 3 + p.getX(i) * 4)); cl.computeVertexNormals();
  const flag = new THREE.Mesh(cl, std({ map: t, side: THREE.DoubleSide, roughness: 0.9 })); flag.position.set(0.27, 2.0, 0); g.add(flag);
  cyl(0.02, 0.025, 3.5, std({ color: '#c8c8c0', metalness: 0.6 }), 0, 1.75, 0, g, 8); rod(V(0, 3.25, 0), V(0.52, 3.25, 0), 0.012, std({ color: '#c8c8c0', metalness: 0.6 }), g);
  cyl(0.12, 0.14, 0.2, std({ map: tex('i5_stone', 1, 1), color: '#8a8884' }), 0, 0.1, 0, g, 12);
  g.userData.collider = [-0.14, 0.14, -0.14, 0.14];
  return g;
}
// a curved hip roof: four panels lofted from the eave rectangle up to the ridge, concave, with upturned corners
function hipRoof(W, D, rise, ridge) {
  const pos = [], idx = [], uvs = [], NU = 16, NV = 10, hw = W / 2, hd = D / 2, rl = ridge / 2;
  const sides = [[[-hw, hd], [hw, hd], [-rl, 0], [rl, 0]], [[hw, -hd], [-hw, -hd], [rl, 0], [-rl, 0]], [[hw, hd], [hw, -hd], [rl, 0], [rl, 0]], [[-hw, -hd], [-hw, hd], [-rl, 0], [-rl, 0]]];
  for (const [a, b, c, d] of sides) { const base = pos.length / 3;
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const u = i / NU, v = j / NV; const ex = a[0] + (b[0] - a[0]) * u, ez = a[1] + (b[1] - a[1]) * u, rx = c[0] + (d[0] - c[0]) * u, rz = c[1] + (d[1] - c[1]) * u;
      const x = ex + (rx - ex) * v, z = ez + (rz - ez) * v; const up = 0.35 * Math.pow(Math.abs(u - 0.5) * 2, 5) * (1 - v); const y = rise * Math.pow(v, 1.7) + up; pos.push(x, y, z); uvs.push(u * 6, v * 4); }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const k = base + j * (NU + 1) + i; idx.push(k, k + 1, k + NU + 1, k + 1, k + NU + 2, k + NU + 1); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
}
export function makeTempleFront() {
  const g = new THREE.Group(); g.name = 'temple_front';
  const cols = [];
  const stone = std({ map: tex('i5_stone', 6, 2), color: '#a8a6a0', roughness: 0.9 }), verm = std({ color: '#d8401e', roughness: 0.55 }), white = std({ color: '#f2eee4', roughness: 0.85 }), dark = std({ color: '#1a1614', roughness: 0.6 });
  const copper = std({ color: '#4a8a72', roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide });
  // plaza: big granite slabs
  const slabs = canvasT(1024, 1024, (x, w, h) => { const r = rng(5); x.fillStyle = '#7a7874'; x.fillRect(0, 0, w, h); let y = 0; while (y < h) { const rh = 90 + r() * 70; let px = -r() * 100; while (px < w) { const sw = 120 + r() * 160; const c = 150 + r() * 40; x.fillStyle = `rgb(${c},${c - 2},${c - 6})`; x.fillRect(px + 3, y + 3, sw - 6, rh - 6); for (let k = 0; k < 60; k++) { x.fillStyle = `rgba(0,0,0,${r() * 0.12})`; x.fillRect(px + r() * sw, y + r() * rh, 3, 3); } px += sw; } y += rh; } }); slabs.wrapS = slabs.wrapT = THREE.RepeatWrapping; slabs.repeat.set(3, 2.2);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), std({ map: slabs, roughness: 0.85 })); pl.rotation.x = -Math.PI / 2; pl.position.set(0, 0.02, -9); pl.receiveShadow = true; g.add(pl);
  // platform + hall
  const PZ = -22.5, PW = 18, PD = 9, PH = 1.3;
  box(PW, PH, PD, stone, 0, PH / 2, PZ, g);
  const HZ = PZ - 0.5, HW = 15, HD = 7, HH = 4.6;
  box(HW, HH, HD, white, 0, PH + HH / 2, HZ, g);
  // front: vermilion posts, beams, latticed doors in the bays
  const front = HZ + HD / 2;
  for (let i = 0; i <= 6; i++) { if (i === 3) continue; const x = -HW / 2 + i * HW / 6; cyl(0.2, 0.22, HH, verm, x, PH + HH / 2, front + 0.35, g, 16); cols.push([x - 0.25, x + 0.25, front + 0.1, front + 0.6]); }
  for (const y of [PH + HH - 0.2, PH + 2.9]) box(HW + 0.6, 0.3, 0.3, verm, 0, y, front + 0.35, g);
  const lat = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#2a1410'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8401e'; x.lineWidth = 6; for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } });
  for (let i = 0; i < 6; i++) { if (i === 2 || i === 3) continue; plane(HW / 6 - 0.45, 2.6, std({ map: lat, emissive: '#ffb070', emissiveIntensity: 0.25 }), -HW / 2 + (i + 0.5) * HW / 6, PH + 1.3, front + 0.01, 0, g); }
  plane(HW / 3 - 0.45, 2.8, std({ color: '#1a0e0a', emissive: '#ff9a50', emissiveIntensity: 0.35 }), 0, PH + 1.4, front + 0.01, 0, g);
  // eave fascia + the roof, a smaller upper roof, the finial
  box(HW + 3.4, 0.35, HD + 3.4, dark, 0, PH + HH + 0.15, HZ, g);
  const r1 = new THREE.Mesh(hipRoof(HW + 4, HD + 4, 2.4, HW - HD), copper); r1.position.set(0, PH + HH + 0.32, HZ); r1.castShadow = true; g.add(r1);
  box(HW - HD + 0.4, 0.5, 0.6, std({ color: '#2a5a4a' }), 0, PH + HH + 2.8, HZ, g);
  box(5, 1.2, 3.2, white, 0, PH + HH + 3.4, HZ, g);
  const r2 = new THREE.Mesh(hipRoof(6.4, 4.6, 1.3, 1.8), copper); r2.position.set(0, PH + HH + 4.0, HZ); g.add(r2);
  const fin = new THREE.Group(); fin.position.set(0, PH + HH + 5.3, HZ); g.add(fin); const gold = std({ color: '#c8a03a', metalness: 0.8, roughness: 0.3 }); cyl(0.12, 0.25, 0.4, dark, 0, 0.2, 0, fin, 12); for (let k = 0; k < 4; k++) cyl(0.16 - k * 0.02, 0.16 - k * 0.02, 0.06, gold, 0, 0.5 + k * 0.14, 0, fin, 16); sphere(0.18, gold, 0, 1.2, 0, fin); cyl(0.02, 0.02, 0.6, gold, 0, 1.5, 0, fin, 8);
  // the name board under the eave
  const nb = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8a03a'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#e8c86a'; fitText(x, '星見寺', w / 2, 84, w - 80, 110, F.brush); });
  box(2.4, 0.75, 0.08, std({ map: nb }), 0, PH + HH - 0.75, front + 0.55, g);
  // lantern walls: rows of white lanterns hung along the front, both sides of the stairs (instanced)
  const lantern = makePaperLantern(); const lm = lantern.children[0];
  const xs = []; for (let x = -HW / 2 - 1.5; x <= HW / 2 + 1.5; x += 0.5) if (Math.abs(x) > 1.6) xs.push(x);
  const rows = [PH + 3.5, PH + 2.85, PH + 2.2]; const N = xs.length * rows.length;
  const inst = new THREE.InstancedMesh(lm.geometry, lm.material, N); const M = new THREE.Matrix4(); let n = 0;
  for (const y of rows) for (const x of xs) { M.makeTranslation(x, y - 0.31, front + 1.25); inst.setMatrixAt(n++, M); }
  g.add(inst);
  for (const sx of [-1, 1]) { box(HW / 2 - 1.2 + 1.5, 0.06, 0.06, std({ color: '#3a2a20' }), sx * (HW / 4 + 1.1), PH + 3.95, front + 1.25, g); for (const x of [sx * 2, sx * (HW / 2 + 1.6)]) { cyl(0.06, 0.06, 4.0, std({ color: '#3a2a20' }), x, PH + 2.0 - 0.0, front + 1.25, g, 8); cols.push([x - 0.1, x + 0.1, front + 1.15, front + 1.35]); } }
  const ll = new THREE.PointLight('#fff0d0', 10, 14, 1.5); ll.position.set(0, PH + 2.8, front + 3); g.add(ll);
  // central stairs with red side walls
  const SW = 3.2, steps = 7; for (let k = 0; k < steps; k++) { const h = PH * (k + 1) / steps; box(SW, h, 0.36, stone, 0, h / 2, PZ + PD / 2 + (steps - k) * 0.36 - 0.18, g); }
  for (const sx of [-1, 1]) { const w = box(0.3, 1.0, steps * 0.36 + 0.4, verm, sx * (SW / 2 + 0.15), 0.9, PZ + PD / 2 + steps * 0.18, g); void w; }
  // the incense burner, banners, a donation box, low stone posts at the plaza edge
  const ib = makeIncenseBurner(); ib.position.set(0, 0, -9.5); g.add(ib); cols.push([-0.95, 0.95, -10.45, -8.55]);
  [['大願成就', '#d8261e', -6.5], ['商売繁盛', '#d8261e', -4.6], ['家内安全', '#f8f6ee', 4.6], ['奉納', '#d8261e', 6.5]].forEach(([t, c, x], i) => { const nbn = makeNobori(t, c === '#f8f6ee' ? '#d8261e' : c); nbn.position.set(x, 0, PZ + PD / 2 + 1.6); cols.push([x - 0.15, x + 0.15, PZ + PD / 2 + 1.45, PZ + PD / 2 + 1.75]); nbn.rotation.y = i % 2 ? 0.2 : -0.2; g.add(nbn); });
  const dbx = new THREE.Group(); dbx.position.set(0, PH, front + 0.95); g.add(dbx); box(1.6, 0.7, 0.6, std({ color: '#5a3a22', roughness: 0.7 }), 0, 0.35, 0, dbx); for (let i = 0; i < 8; i++) box(1.5, 0.02, 0.04, dark, 0, 0.71, -0.25 + i * 0.07, dbx);
  const db = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#5a3a22'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8c86a'; fitText(x, '奉納', w / 2, 50, 140, 60, F.brush); }); plane(0.6, 0.22, std({ map: db }), 0, 0.42, 0.301, 0, dbx);
  for (let x = -12; x <= 12; x += 3) { if (Math.abs(x) < 3) continue; box(0.3, 0.6, 0.3, stone, x, 0.3, -0.4, g); }
  // pine trees + modern blocks behind are left to the town
  cols.push([-1.9, -1.6, PZ + PD / 2, PZ + PD / 2 + steps * 0.36], [1.6, 1.9, PZ + PD / 2, PZ + PD / 2 + steps * 0.36]);
  // platform: solid either side of the stairs; the top is walkable from the stairs to the hall (a ground height in main)
  cols.push([-PW / 2, -SW / 2, PZ - PD / 2, PZ + PD / 2], [SW / 2, PW / 2, PZ - PD / 2, PZ + PD / 2], [-SW / 2, SW / 2, PZ - PD / 2, front], [-0.8, 0.8, front + 0.65, front + 1.25]);
  g.userData.colliders = cols;
  g.userData.stairs = { x0: -SW / 2, x1: SW / 2, z0: PZ + PD / 2, z1: PZ + PD / 2 + steps * 0.36, top: PH, front: HZ + HD / 2, zTop: PZ + PD / 2 };
  return g;
}

// ---- fairground ---------------------------------------------------------------------------------------------------
// a two-seat jet trainer: lofted fuselage on real-ish dimensions (14.1 m long, 7.7 m span, 3.9 m to the fin tip),
// tandem canopy, swept wing, tall fin, tricycle gear; white with a black anti-glare nose and made-up markings
export function makeJetTrainer() {
  const g = new THREE.Group(); g.name = 'jet_trainer';
  const L = 14.1, white = phys({ color: '#f2f2ee', roughness: 0.35, clearcoat: 0.6 }), black = std({ color: '#141414', roughness: 0.4 }), grey = std({ color: '#8a8c90', metalness: 0.6, roughness: 0.4 });
  // fuselage stations (x from the tail at 0 to the nose at L): half-width, half-height, centre height
  const st = [[0, 0.42, 0.42, 1.85], [0.4, 0.5, 0.5, 1.85], [2.5, 0.62, 0.62, 1.85], [5, 0.72, 0.66, 1.85], [7.5, 0.62, 0.66, 1.88], [9.3, 0.52, 0.62, 1.92], [10.8, 0.44, 0.52, 1.92], [12.3, 0.3, 0.34, 1.88], [13.4, 0.15, 0.17, 1.85], [14.1, 0.01, 0.01, 1.85]];
  const lerp = (x) => { for (let i = 0; i < st.length - 1; i++) if (x <= st[i + 1][0]) { const a = st[i], b = st[i + 1], t = (x - a[0]) / (b[0] - a[0]), s = t * t * (3 - 2 * t); return [a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s, a[3] + (b[3] - a[3]) * s]; } return [0, 0, 1.85]; };
  const NS = 60, NR = 28, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) { const x = (i / NS) * L, [w, h, cy] = lerp(x); for (let j = 0; j <= NR; j++) { const a = (j / NR) * Math.PI * 2; pos.push(x - L / 2, cy + Math.sin(a) * h, Math.cos(a) * w); uv.push(i / NS, j / NR); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const k = i * (NR + 1) + j; idx.push(k, k + NR + 1, k + 1, k + 1, k + NR + 1, k + NR + 2); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); fg.setIndex(idx); fg.computeVertexNormals();
  // the paint: a canvas wrapped on the body (u along the length, v around): black nose top, the stencils
  const skin = canvasT(2048, 512, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h);
    // v = 0.25 is the top centre line (sin = 1), 0.75 the belly. anti-glare panel: top of the nose ahead of the canopy
    x.fillStyle = '#141414'; x.beginPath(); x.moveTo(w * 0.79, h * 0.25); x.bezierCurveTo(w * 0.82, h * 0.08, w * 0.9, h * 0.02, w, h * 0.0); x.lineTo(w, h * 0.5); x.bezierCurveTo(w * 0.9, h * 0.48, w * 0.82, h * 0.42, w * 0.79, h * 0.25); x.fill();
    x.fillStyle = '#1e3a8a'; for (const vv of [0.0, 0.5]) { x.save(); x.translate(w * 0.55, h * vv + (vv ? -60 : 60)); x.scale(1, vv ? -1 : 1); x.font = `bold 48px ${F.label}`; x.textAlign = 'center'; x.fillText('ELM COUNTY AIR GUARD', 0, 14); x.restore(); }
    x.fillStyle = '#c81e28'; for (const vv of [0.06, 0.44]) x.fillRect(w * 0.18, h * vv, w * 0.05, 8);
    x.fillStyle = '#333'; x.font = `20px ${F.small}`; x.fillText('NO STEP', w * 0.6, h * 0.22); x.fillText('RESCUE', w * 0.72, h * 0.12); x.fillStyle = '#f2c21a'; x.fillRect(w * 0.7, h * 0.1, 30, 30); });
  skin.wrapS = THREE.ClampToEdgeWrapping;
  const body = new THREE.Mesh(fg, phys({ map: skin, roughness: 0.35, clearcoat: 0.6 })); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // intakes beside the rear cockpit, the twin exhausts
  for (const s of [-1, 1]) { const ik = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 2.2, 20, 1, true), white); ik.rotation.z = Math.PI / 2; ik.position.set(2.2, 1.78, s * 0.62); ik.scale.set(1, 1, 0.75); g.add(ik); const lip = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 8, 20), grey); lip.rotation.y = Math.PI / 2; lip.position.set(3.3, 1.78, s * 0.62); lip.scale.set(1, 1, 0.75); g.add(lip); cyl(0.26, 0.26, 0.05, black, 3.28, 1.78, s * 0.62, g, 20).rotation.z = Math.PI / 2; }
  for (const s of [-1, 1]) { const ex = cyl(0.22, 0.24, 0.5, std({ color: '#3a3430', metalness: 0.8, roughness: 0.5 }), -L / 2 + 0.1, 1.85, s * 0.22, g, 20); ex.rotation.z = Math.PI / 2; cyl(0.18, 0.18, 0.02, black, -L / 2 - 0.15, 1.85, s * 0.22, g, 20).rotation.z = Math.PI / 2; }
  // canopy: a long blister in two frames
  const can = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), phys({ color: '#9ab0c0', transparent: true, opacity: 0.55, roughness: 0.04, metalness: 0.2, clearcoat: 1 })); can.scale.set(2.2, 0.6, 0.46); can.position.set(4.3, 2.35, 0); g.add(can);
  for (const x of [2.9, 4.25, 5.6]) { const fr = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.03, 6, 20, Math.PI), grey); fr.position.set(x, 2.35, 0); fr.rotation.y = Math.PI / 2; fr.scale.set(1, Math.max(0.2, 1.3 * Math.sqrt(Math.max(0, 1 - ((x - 4.3) / 2.2) ** 2))), 1); g.add(fr); }
  for (const [x, z] of [[5.0, 0], [3.4, 0]]) { box(0.5, 0.5, 0.55, black, x, 2.3, z, g); }   // seats behind the glass
  // wing (thin extruded planform), horizontal stabilisers, the fin
  const wing = new THREE.Shape(); wing.moveTo(0, 0); wing.lineTo(3.3, 0); wing.lineTo(1.1, 3.85); wing.lineTo(0.0, 3.85); wing.lineTo(-1.0, 0); wing.closePath();
  for (const s of [-1, 1]) { const wm = new THREE.Mesh(new THREE.ExtrudeGeometry(wing, { depth: 0.08, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 2 }), white); wm.rotation.x = s * Math.PI / 2; wm.position.set(-1.2, 1.55, s * 0.0); if (s < 0) wm.position.y += 0.08; wm.castShadow = true; g.add(wm); }
  const hs = new THREE.Shape(); hs.moveTo(0, 0); hs.lineTo(1.6, 0); hs.lineTo(0.5, 2.0); hs.lineTo(-0.3, 2.0); hs.closePath();
  for (const s of [-1, 1]) { const hm = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.05, bevelEnabled: false }), white); hm.rotation.x = s * Math.PI / 2; hm.position.set(-L / 2 + 0.4, 1.8 + (s < 0 ? 0.05 : 0), 0); g.add(hm); }
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(3.0, 0); fin.lineTo(0.8, 1.95); fin.lineTo(0.0, 1.95); fin.lineTo(-0.3, 0); fin.closePath();
  const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02 }), phys({ color: '#f2f2ee', roughness: 0.35, clearcoat: 0.6 })); fm.position.set(-L / 2 + 0.6, 2.2, -0.04); fm.castShadow = true; g.add(fm);
  const tn = canvasT(512, 160, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1e3a8a'; fitText(x, 'EC 60-552', w / 2, 70, w - 40, 70, F.stencil); x.fillStyle = '#c81e28'; x.fillRect(40, 120, w - 80, 12); });
  for (const s of [-1, 1]) { const tp = plane(1.5, 0.48, std({ map: tn, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }), -L / 2 + 1.6, 3.2, s * 0.065, s > 0 ? 0 : Math.PI, g); void tp; }
  // roundel-like disc (made up: a blue ring with a yellow star) on both sides of the rear fuselage
  const rd = canvasT(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1e3a8a'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 128, 84, 0, 7); x.fill(); x.fillStyle = '#f2c21a'; x.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 30 : 74; x.lineTo(128 + Math.cos(-Math.PI / 2 + k * Math.PI / 5) * rr, 128 + Math.sin(-Math.PI / 2 + k * Math.PI / 5) * rr); } x.fill(); });
  for (const s of [-1, 1]) { const [w0] = lerp(4.0); plane(0.7, 0.7, std({ map: rd, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }), 4.0 - L / 2, 1.95, s * (w0 + 0.01), s > 0 ? 0 : Math.PI, g); }
  // landing gear: nose strut + wheel, two mains with doors
  const strut = std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3 }), tyre = std({ color: '#141414', roughness: 0.8 });
  const wheel = (x, z, r, wd) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 0.75, r * 0.28, 10, 24), tyre); t.position.set(x, r, z); g.add(t); cyl(r * 0.5, r * 0.5, wd, strut, x, r, z, g, 16).rotation.x = Math.PI / 2; };
  rod(V(4.8, 1.4, 0), V(4.9, 0.32, 0), 0.05, strut, g); wheel(4.9, 0, 0.3, 0.14);
  for (const s of [-1, 1]) { rod(V(-0.6, 1.4, s * 1.25), V(-0.6, 0.38, s * 1.35), 0.06, strut, g); wheel(-0.6, s * 1.42, 0.36, 0.18); const dr = box(0.9, 0.7, 0.03, white, -0.6, 0.95, s * 1.05, g); dr.rotation.x = s * 0.25; }
  // pitot on the nose
  rod(V(L / 2 - 0.1, 1.85, 0), V(L / 2 + 0.6, 1.85, 0), 0.012, strut, g);
  g.userData.collider = [-L / 2, L / 2 + 0.6, -0.8, 0.8];
  g.userData.colliders = [[-L / 2, L / 2, -0.8, 0.8], [-1.2, 1.4, -3.9, 3.9]];
  return g;
}
export function makePicnicShelter() {
  const g = new THREE.Group(); g.name = 'picnic_shelter';
  const W = 9, D = 6.5, H = 2.7, post = std({ color: '#6a4a32', roughness: 0.7 });
  const cols = [];
  for (const x of [-W / 2, 0, W / 2]) for (const z of [-D / 2, D / 2]) { box(0.2, H, 0.2, post, x, H / 2, z, g); cols.push([x - 0.12, x + 0.12, z - 0.12, z + 0.12]); }
  for (const z of [-D / 2, D / 2]) box(W + 0.3, 0.25, 0.15, post, 0, H, z, g); for (const x of [-W / 2, 0, W / 2]) box(0.15, 0.25, D + 0.3, post, x, H, 0, g);
  const rf = new THREE.Mesh(hipRoof(W + 1.4, D + 1.4, 1.7, W - D + 1), std({ color: '#f4f4f0', roughness: 0.7, side: THREE.DoubleSide })); rf.position.y = H + 0.12; rf.castShadow = true; g.add(rf);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(W + 1, D + 1), std({ map: tex('lot_concrete', 3, 2), color: '#c8c4bc' })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.025; pad.receiveShadow = true; g.add(pad);
  const steel = std({ color: '#2a5a3a', roughness: 0.5, metalness: 0.4 });
  for (const [x, z] of [[-2.6, -1.4], [0.0, -1.4], [2.6, -1.4], [-1.3, 1.5], [1.3, 1.5]]) { const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t); box(1.9, 0.05, 0.8, steel, 0, 0.76, 0, t); for (const s of [-1, 1]) { box(1.9, 0.04, 0.3, steel, 0, 0.45, s * 0.62, t); rod(V(-0.7, 0, s * 0.75), V(-0.7, 0.76, 0), 0.03, steel, t); rod(V(0.7, 0, s * 0.75), V(0.7, 0.76, 0), 0.03, steel, t); } cols.push([x - 0.95, x + 0.95, z - 0.8, z + 0.8]); }
  g.userData.colliders = cols;
  return g;
}
// a dragon kiddie coaster train: four tub cars, the lead car carrying a dragon head on a curled neck, a tail on the last
export function makeDragonCoaster() {
  const g = new THREE.Group(); g.name = 'dragon_coaster';
  const blue = phys({ color: '#2a6ad8', roughness: 0.3, clearcoat: 1 }), green = phys({ color: '#3ab86a', roughness: 0.3, clearcoat: 1 }), yel = phys({ color: '#f2c21a', roughness: 0.3, clearcoat: 1 }), orange = std({ color: '#f08a1a', roughness: 0.5 }), blk = std({ color: '#141414' });
  const scales = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#2a6ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#3ab86a'; for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(i * 30 + (j % 2) * 15, j * 32 + 16, 14, 0, Math.PI); x.fill(); } x.fillStyle = '#f2c21a'; x.fillRect(0, h - 18, w, 18); });
  const tub = phys({ map: scales, roughness: 0.35, clearcoat: 1 });
  for (let i = 0; i < 4; i++) { const c = new THREE.Group(); c.position.x = -i * 1.25; g.add(c);
    rbox(1.1, 0.5, 0.95, 0.18, tub, 0, 0.45, 0, c); rbox(0.9, 0.12, 0.75, 0.05, orange, 0, 0.55, 0, c); rbox(0.12, 0.45, 0.75, 0.05, orange, -0.4, 0.75, 0, c);
    cyl(0.025, 0.025, 0.7, std({ color: '#d8dce0', metalness: 0.8 }), 0.25, 0.85, 0, c, 8).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) for (const x of [-0.35, 0.35]) cyl(0.11, 0.11, 0.08, blk, x, 0.13, s * 0.42, c, 14).rotation.x = Math.PI / 2;
    if (i < 3) box(0.2, 0.06, 0.08, std({ color: '#888', metalness: 0.7 }), -0.63, 0.28, 0, c); }
  // the neck: a tube along a curve rising from the front car, the head on top
  const neck = new THREE.CatmullRomCurve3([V(0.5, 0.6, 0), V(0.85, 1.1, 0), V(0.8, 1.6, 0), V(1.05, 1.95, 0), V(1.35, 2.0, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(neck, 24, 0.16, 12), green));
  for (let k = 0; k < 6; k++) { const p = neck.getPoint(k / 6); const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), yel); sp.position.set(p.x - 0.12, p.y + 0.12, 0); sp.rotation.z = 0.6; g.add(sp); }
  const head = new THREE.Group(); head.position.set(1.4, 2.0, 0); g.add(head);
  const hd = sphere(0.3, green, 0, 0, 0, head, 20, 14); hd.scale.set(1.2, 0.85, 0.9);
  const snout = sphere(0.2, green, 0.35, -0.08, 0, head, 16, 12); snout.scale.set(1.4, 0.7, 0.8);
  const jaw = sphere(0.17, yel, 0.33, -0.2, 0, head, 16, 10); jaw.scale.set(1.4, 0.4, 0.75);
  for (const s of [-1, 1]) { sphere(0.09, std({ color: '#fff' }), 0.15, 0.12, s * 0.2, head, 12, 10); sphere(0.045, blk, 0.2, 0.13, s * 0.25, head, 10, 8); const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 10), yel); horn.position.set(-0.15, 0.3, s * 0.15); horn.rotation.z = 0.6; head.add(horn); sphere(0.03, blk, 0.58, -0.02, s * 0.08, head, 8, 6); }
  for (let k = 0; k < 4; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 6), std({ color: '#fff' })); t.position.set(0.25 + k * 0.08, -0.15, 0.12 * (k % 2 ? 1 : -1)); t.rotation.x = Math.PI; head.add(t); }
  // tail on the last car
  const tail = new THREE.CatmullRomCurve3([V(-4.3, 0.6, 0), V(-4.7, 0.75, 0), V(-4.9, 1.05, 0.1), V(-4.75, 1.3, 0.2)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(tail, 16, 0.1, 10), green)); const tt = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), yel); tt.position.set(-4.72, 1.42, 0.2); g.add(tt);
  return g;
}
export function makeKiddieTrain() {
  const g = new THREE.Group(); g.name = 'kiddie_train';
  const red = phys({ color: '#d8261e', roughness: 0.3, clearcoat: 1 }), green = phys({ color: '#2a8a4a', roughness: 0.3, clearcoat: 1 }), blk = std({ color: '#141414', roughness: 0.5 }), gold = std({ color: '#e8c03a', metalness: 0.7, roughness: 0.3 }), blue = phys({ color: '#2a5ad8', roughness: 0.3, clearcoat: 1 });
  const eng = new THREE.Group(); g.add(eng);
  box(2.0, 0.2, 0.9, blk, 0, 0.35, 0, eng);
  cyl(0.38, 0.38, 1.2, green, 0.35, 0.82, 0, eng, 24).rotation.z = Math.PI / 2; cyl(0.4, 0.4, 0.06, gold, 0.95, 0.82, 0, eng, 24).rotation.z = Math.PI / 2;
  for (const x of [0.0, 0.5]) cyl(0.39, 0.39, 0.05, gold, x, 0.82, 0, eng, 24).rotation.z = Math.PI / 2;
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.5, 16), blk); stack.position.set(0.75, 1.42, 0); eng.add(stack); cyl(0.2, 0.2, 0.06, gold, 0.75, 1.68, 0, eng, 16);
  sphere(0.13, gold, 0.25, 1.2, 0, eng, 14, 10);
  box(0.8, 1.2, 0.95, red, -0.6, 1.0, 0, eng); box(1.0, 0.08, 1.15, blk, -0.6, 1.64, 0, eng);
  for (const s of [-1, 1]) plane(0.35, 0.35, std({ color: '#141a20', roughness: 0.1 }), -0.6, 1.2, s * 0.481, s > 0 ? 0 : Math.PI, eng);
  const cc = new THREE.Shape(); cc.moveTo(0, 0); cc.lineTo(0.45, 0); cc.lineTo(0, 0.5); cc.closePath(); const cw = new THREE.Mesh(new THREE.ExtrudeGeometry(cc, { depth: 0.9, bevelEnabled: false }), red); cw.position.set(1.0, 0.1, -0.45); eng.add(cw);
  sphere(0.1, std({ color: '#fff8d0', emissive: '#ffe080', emissiveIntensity: 1.5 }), 0.98, 0.95, 0, eng, 12, 10);
  for (const s of [-1, 1]) for (const [x, r] of [[0.7, 0.2], [0.15, 0.26], [-0.55, 0.26]]) { const w = cyl(r, r, 0.06, red, x, r + 0.04, s * 0.47, eng, 20); w.rotation.x = Math.PI / 2; cyl(r * 0.3, r * 0.3, 0.08, gold, x, r + 0.04, s * 0.47, eng, 12).rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) rod(V(0.7, 0.25, s * 0.52), V(-0.55, 0.3, s * 0.52), 0.02, gold, eng);
  for (let i = 0; i < 2; i++) { const c = new THREE.Group(); c.position.x = -2.1 - i * 1.6; g.add(c); box(1.4, 0.2, 0.9, blk, 0, 0.35, 0, c); box(1.4, 0.45, 0.9, i ? blue : green, 0, 0.67, 0, c); box(1.2, 0.1, 0.7, std({ color: '#f2c21a' }), 0, 0.72, 0, c);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.025, 0.025, 0.7, gold, sx * 0.65, 1.2, sz * 0.4, c, 8); box(1.5, 0.08, 1.0, red, 0, 1.58, 0, c);
    for (const s of [-1, 1]) for (const x of [-0.45, 0.45]) cyl(0.18, 0.18, 0.06, red, x, 0.2, s * 0.47, c, 16).rotation.x = Math.PI / 2; }
  return g;
}
// a flatbed ride trailer (deck, tandem axles, landing legs, kingpin plate) with a steel canopy frame + string lights
export function makeRideTrailer(ride = 'dragon') {
  const g = new THREE.Group(); g.name = 'ride_trailer_' + ride;
  const L = 12, W = 2.55, DH = 1.15, steel = std({ color: '#5a5c60', metalness: 0.6, roughness: 0.45 }), blk = std({ color: '#141414', roughness: 0.6 });
  box(L, 0.18, W, std({ map: tex('lot_concrete', 4, 1), color: '#6a6864', metalness: 0.3 }), 0, DH, 0, g);
  for (const s of [-1, 1]) box(L, 0.35, 0.12, steel, 0, DH - 0.2, s * (W / 2 - 0.06), g);
  box(2.0, 0.3, W, steel, L / 2 + 0.8, DH + 0.3, 0, g); box(0.4, 0.4, W, steel, L / 2 + 0.05, DH + 0.15, 0, g);   // gooseneck
  for (const x of [-L / 2 + 1.0, -L / 2 + 2.3]) for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.17, 10, 24), blk); t.position.set(x, 0.53, s * (W / 2 - 0.15)); g.add(t); cyl(0.22, 0.22, 0.3, steel, x, 0.53, s * (W / 2 - 0.15), g, 16).rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) { box(0.12, DH - 0.25, 0.12, steel, L / 2 - 2.0, (DH - 0.25) / 2 + 0.1, s * 0.9, g); box(0.4, 0.06, 0.4, steel, L / 2 - 2.0, 0.03, s * 0.9, g); }
  for (const s of [-1, 1]) { const tl = std({ color: '#c81e28', emissive: '#c81e28', emissiveIntensity: 0.6 }); box(0.05, 0.12, 0.25, tl, -L / 2 - 0.02, DH - 0.2, s * 1.0, g); }
  // canopy frame: posts along both sides, a peaked truss on top, string lights along the eaves
  const top = DH + 3.0;
  for (let i = 0; i <= 4; i++) { const x = -L / 2 + 0.5 + i * (L - 1) / 4; for (const s of [-1, 1]) box(0.1, 3.0, 0.1, steel, x, DH + 1.5, s * (W / 2 - 0.1), g); rod(V(x, top, -W / 2 + 0.1), V(x, top + 0.6, 0), 0.04, steel, g); rod(V(x, top, W / 2 - 0.1), V(x, top + 0.6, 0), 0.04, steel, g); }
  for (const s of [-1, 1]) box(L - 1, 0.08, 0.08, steel, 0, top, s * (W / 2 - 0.1), g); box(L - 1, 0.08, 0.08, steel, 0, top + 0.6, 0, g);
  const bulbs = [], bm = std({ color: '#fff4c8', emissive: '#ffd880', emissiveIntensity: 2.2 });
  for (const s of [-1, 1]) for (let i = 0; i < 30; i++) { const x = -L / 2 + 0.5 + i * (L - 1) / 29; bulbs.push([x, top - 0.12 - 0.08 * Math.sin((i % 6) / 6 * Math.PI), s * (W / 2 - 0.1)]); }
  const bi = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), bm, bulbs.length); const M = new THREE.Matrix4(); bulbs.forEach((b, i) => { M.makeTranslation(...b); bi.setMatrixAt(i, M); }); g.add(bi);
  const lt = new THREE.PointLight('#ffd890', 6, 12, 1.5); lt.position.set(0, top - 0.5, 0); g.add(lt);
  // the ride on the deck: a small oval of track + the train
  const track = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 6, 48), std({ color: '#c8ccd0', metalness: 0.8 })); track.rotation.x = Math.PI / 2; track.scale.set(5.0, 1.0, 1); track.position.y = DH + 0.12; g.add(track);
  const ride3 = ride === 'dragon' ? makeDragonCoaster() : makeKiddieTrain(); ride3.position.set(ride === 'dragon' ? 2.2 : 2.4, DH + 0.1, 0); g.add(ride3);
  const sign = canvasT(512, 128, (x, w, h) => { x.fillStyle = ride === 'dragon' ? '#2a6ad8' : '#d8261e'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, ride === 'dragon' ? 'LITTLE DRAGON' : 'CHOO-CHOO EXPRESS', w / 2, 66, w - 40, 70, F.retro, { stroke: '#111' }); });
  for (const s of [-1, 1]) plane(3.2, 0.8, glow(sign, 0.6), 0, top + 0.5, s * (W / 2 - 0.05), s > 0 ? 0 : Math.PI, g);
  g.userData.collider = [-L / 2 - 0.1, L / 2 + 1.8, -W / 2 - 0.1, W / 2 + 0.1];
  return g;
}
// chain-link fence run (alpha-tested diamond mesh between round steel posts, a top rail)
function chainLink(len, h = 1.8) {
  const g = new THREE.Group(); const t = canvasT(128, 128, (x, w, h2) => { x.clearRect(0, 0, w, h2); x.strokeStyle = '#a8acb0'; x.lineWidth = 5; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h2); x.moveTo(w, 0); x.lineTo(0, h2); x.stroke(); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 0.12, h / 0.12);
  plane(len, h, std({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, metalness: 0.6 }), 0, h / 2, 0, 0, g);
  const st = std({ color: '#9a9ea2', metalness: 0.7, roughness: 0.35 }); for (let x = -len / 2; x <= len / 2 + 0.01; x += 3) cyl(0.04, 0.04, h + 0.1, st, x, (h + 0.1) / 2, 0, g, 10); const tr = cyl(0.025, 0.025, len, st, 0, h, 0, g, 8); tr.rotation.z = Math.PI / 2;
  return g;
}
export function makeFairground() {
  const g = new THREE.Group(); g.name = 'fairground';
  const W = 60, D = 33, cols = [], put = placer(g, cols);
  for (const [x0, x1] of [[-W / 2, W / 2]]) { const gm = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, D), std({ map: tex('hs_grass', (x1 - x0) / 4, D / 4), roughness: 0.95 })); gm.rotation.x = -Math.PI / 2; gm.position.set((x0 + x1) / 2, 0.012, 0); gm.receiveShadow = true; g.add(gm); }
  const conc = b85Mat('b85_pinkconc', 1, 6);   // item 85: pink broom-finish concrete
  const path = (x0, x1, z0, z1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), conc); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.02, (z0 + z1) / 2); m.receiveShadow = true; g.add(m); };
  path(-1.2, 1.2, -6, D / 2); path(-29.5, 26, -7.2, -4.8);
  // item 85: a creek runs along the west fence under the cross path (twin culvert), a barrel trash can on a post by it
  { const ck = put(makeCreekCrossing(30), -26.2, -6.0); void ck; put(makeBarrelTrashPost(), -23.4, -3.4, 0.3); }
  // the jet on a gravel bed with a concrete border, angled toward the street; info plaque
  const bed = new THREE.Mesh(new THREE.CircleGeometry(1, 6), std({ map: tex('gravel', 4, 4), color: '#d8cab8' })); bed.rotation.x = -Math.PI / 2; bed.scale.set(9.5, 6.5, 1); bed.position.set(-13, 0.025, 6); g.add(bed);
  put(makeJetTrainer(), -13, 6, 0.45);
  const pq = new THREE.Group(); const pt = canvasT(512, 320, (x, w, h) => { x.fillStyle = '#2a3a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e4d8'; fitText(x, 'TWO-SEAT JET TRAINER', w / 2, 50, w - 40, 40, F.label); ['flew with the Elm County Air Guard', 'trainer squadron, retired here', 'length 14.1 m · span 7.7 m', 'top speed about Mach 1.3'].forEach((l, i) => fitText(x, l, w / 2, 120 + i * 46, w - 60, 28, F.small)); });
  box(0.08, 0.9, 0.08, std({ color: '#2a2a2c' }), 0, 0.45, 0, pq); const pp = box(0.9, 0.56, 0.05, std({ map: pt }), 0, 1.05, 0.03, pq); pp.rotation.x = -0.4; pq.userData.collider = [-0.45, 0.45, -0.1, 0.1]; put(pq, -6.5, 11.5, 0.2);
  // the picnic shelter + fence at the back
  put(makePicnicShelter(), -18.2, -12);   // (moved east off the creek bank, item 85)
  for (const [x, z, l, ry] of [[0, -D / 2 + 0.3, W - 1, 0], [-W / 2 + 0.3, 0, D - 1, Math.PI / 2], [W / 2 - 0.3, 0, D - 1, Math.PI / 2]]) { const f = chainLink(l); f.position.set(x, 0, z); f.rotation.y = ry; g.add(f); cols.push(ry ? [x - 0.08, x + 0.08, -l / 2, l / 2] : [-l / 2, l / 2, z - 0.08, z + 0.08]); }
  // the ride trailers, parked in the gravel yard on the east side
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), std({ map: tex('tr_gravel', 6, 4), color: '#9a948a', roughness: 1 })); yard.rotation.x = -Math.PI / 2; yard.position.set(15, 0.022, -6.5); g.add(yard);
  put(makeBoxTrailer(), 14, 9, 0);
  { const rp = makeTreadRamp(2.6, 1.2, 1.4); rp.position.set(14 + 8.08 + 2.6, 0, 9); rp.rotation.y = Math.PI; g.add(rp); }   // item 82: tread-plate ramp up into it   // item 81: a 53 ft van with its rear doors open (the fair's supply trailer)
  put(makeRideTrailer('dragon'), 13, -10.5, 0); put(makeRideTrailer('train'), 14, -3.5, Math.PI);
  // the entrance arch + name
  const nm = canvasT(1024, 192, (x, w, h) => { x.fillStyle = '#1e4a2a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c21a'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = '#f2c21a'; fitText(x, 'ELM COUNTY FAIRGROUNDS', w / 2, 86, w - 80, 90, F.slab); x.fillStyle = '#fff'; fitText(x, 'air park · picnic shelter · summer fair', w / 2, 152, w - 160, 32, F.label); });
  for (const s of [-1, 1]) { cyl(0.15, 0.15, 4.2, std({ color: '#2a2a2c', metalness: 0.5 }), s * 2.6, 2.1, D / 2 - 0.8, g, 12); cols.push([s * 2.6 - 0.2, s * 2.6 + 0.2, D / 2 - 1.0, D / 2 - 0.6]); }
  box(5.6, 1.05, 0.12, std({ map: nm }), 0, 3.7, D / 2 - 0.8, g);
  g.userData.colliders = cols;
  return g;
}

// ---- trail ----------------------------------------------------------------------------------------------------------
export function makeCairn(seed = 3) {
  const g = new THREE.Group(); g.name = 'cairn'; const r = rng(seed);
  let y = 0; const st = std({ map: tex('i5_stone', 1, 1), color: '#a8846a', roughness: 0.95, flatShading: true });
  for (let i = 0; i < 9; i++) { const s = 0.42 - i * 0.035 + r() * 0.05, h = 0.09 + r() * 0.05; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), st); m.scale.set(s, h, s * (0.7 + r() * 0.3)); m.rotation.y = r() * 3; m.position.set((r() - 0.5) * 0.05, y + h * 0.8, (r() - 0.5) * 0.05); m.castShadow = true; g.add(m); y += h * 1.5; }
  g.userData.collider = [-0.45, 0.45, -0.4, 0.4];
  return g;
}
