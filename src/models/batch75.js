// Batch 75 (photos/batch75/): an old indoor mall passage ("Nakamachi Arcade") with painted shutters and a junk-game
// stall at the far end. Shop names, characters, film posters and magazine titles are all made up.
//   makeCRTConsoleTV, makeMagazineRack, makeLakeShutter, makeKaijuShutter, makeMallPassage
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';
import { makeComicStack } from './batch82.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 6) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// corrugated roll shutter carrying a painted texture (ridges in the geometry)
let _ridge = null;
function paintedShutter(w, h, t) { const g = new THREE.PlaneGeometry(w, h, 1, Math.round(h / 0.012)); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.0012 * Math.sin(p.getY(i) * 2 * Math.PI / 0.07)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, std({ map: t, metalness: 0.15, roughness: 0.7 })); m.receiveShadow = true;
  // a soft slat shading overlay (light top edge, dark seam) repeated every 7 cm
  if (!_ridge) { _ridge = canvasT(4, 64, (x, cw, ch) => { const gr = x.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(0.85, 'rgba(0,0,0,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)'); x.fillStyle = gr; x.fillRect(0, 0, cw, ch); }); _ridge.wrapS = _ridge.wrapT = THREE.RepeatWrapping; }
  const rt = _ridge.clone(); rt.needsUpdate = true; rt.repeat.set(1, h / 0.07); const ov = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: rt, transparent: true, depthWrite: false })); ov.position.z = 0.003; m.add(ov);
  return m; }
// a neon-yellow hand-lettered card
function priceCard(lines, w = 128, h = 256, color = '#e8ff3a', ink = '#c81e1e') { return canvasT(w, h, (x, cw, ch) => { x.fillStyle = color; x.fillRect(0, 0, cw, ch); x.fillStyle = ink; const n = lines.length; lines.forEach((l, i) => fitText(x, l, cw / 2, (i + 0.6) * ch / n, cw - 12, ch / n * 0.85, F.marker)); }); }

export function makeCRTConsoleTV() {
  const g = new THREE.Group(); g.name = 'crt_console_tv';
  const blk = std({ color: '#1c1c1e', roughness: 0.45 }), grey = std({ color: '#3a3a3c', roughness: 0.4 });
  // body: a deep tapered box (front 0.5 x 0.42, back smaller)
  const shape = new THREE.BoxGeometry(0.52, 0.44, 0.45, 1, 1, 1); const p = shape.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) < 0) { p.setX(i, p.getX(i) * 0.7); p.setY(i, p.getY(i) * 0.75 - 0.02); } shape.computeVertexNormals();
  const body = new THREE.Mesh(shape, blk); body.position.y = 0.3; body.castShadow = true; g.add(body);
  box(0.52, 0.08, 0.1, blk, 0, 0.04, 0.17, g);   // the chin with controller ports + the brand-free badge
  for (const x of [-0.12, 0.06]) box(0.08, 0.025, 0.01, std({ color: '#0a0a0a' }), x, 0.045, 0.222, g);
  const scr = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 16, Math.PI / 2 - 0.2, 0.4, Math.PI / 2 - 0.16, 0.32), std({ color: '#5a6060', roughness: 0.12, metalness: 0.2, emissive: '#203028', emissiveIntensity: 0.4 })); scr.position.set(0, 0.3, -0.76); g.add(scr);
  // console built into the top: a grey hump, cartridge slot with a cartridge sticking out, buttons
  box(0.36, 0.06, 0.2, grey, 0, 0.55, 0.05, g); box(0.16, 0.012, 0.03, std({ color: '#0a0a0a' }), 0, 0.585, 0.02, g);
  const cart = canvasT(128, 96, (x, w, h) => { x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8402a'; x.fillRect(8, 8, w - 16, h - 24); x.fillStyle = '#f2e04a'; fitText(x, 'KICK FIGHTER', w / 2, 40, w - 24, 22, F.retro); x.fillStyle = '#fff'; fitText(x, 'II', w / 2, 62, 40, 20, F.heavy); });
  box(0.13, 0.1, 0.018, [std({ color: '#2a2a2c' }), std({ color: '#2a2a2c' }), std({ color: '#2a2a2c' }), std({ color: '#2a2a2c' }), std({ map: cart }), std({ map: cart })], 0, 0.635, 0.02, g);
  for (const x of [-0.14, 0.14]) box(0.035, 0.015, 0.025, std({ color: '#5a5a5c' }), x, 0.585, 0.1, g);
  // the hand-lettered cards (neon yellow, red marker) taped over the front, a no-touching sticker
  const tape = std({ color: '#f4f0e0', transparent: true, opacity: 0.6 });
  const card = (lines, w, h, x, y, rz) => { const m = plane(w, h, std({ map: priceCard(lines) }), x, y, 0.232, 0, g); m.rotation.z = rz; plane(0.05, 0.018, tape, x, y + h / 2 - 0.01, 0.234, 0, g).rotation.z = rz; return m; };
  card(['ゲ', 'ム', 'ソ', 'フ', 'ト'], 0.07, 0.24, -0.21, 0.36, 0.05); card(['ゲーム機', '買取', 'します!!'], 0.08, 0.17, -0.2, 0.16, 0.0);
  card(['ビック', 'リ', '価格'], 0.09, 0.15, 0.22, 0.44, -0.1); card(['動作', 'OK'], 0.07, 0.08, 0.23, 0.31, 0.08);
  const nt = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.strokeStyle = '#d81e1e'; x.lineWidth = 12; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke(); x.fillStyle = '#111'; x.beginPath(); x.moveTo(44, 96); x.lineTo(44, 50); x.lineTo(52, 34); x.lineTo(58, 50); x.lineTo(62, 30); x.lineTo(68, 50); x.lineTo(74, 34); x.lineTo(80, 52); x.lineTo(86, 44); x.lineTo(84, 96); x.fill(); x.strokeStyle = '#d81e1e'; x.lineWidth = 12; x.beginPath(); x.moveTo(28, 28); x.lineTo(100, 100); x.stroke(); });
  plane(0.08, 0.08, std({ map: nt, transparent: true }), 0.19, 0.12, 0.233, 0, g);
  g.userData.collider = [-0.27, 0.27, -0.25, 0.25];
  return g;
}
// a white wire magazine rack: angled tiers, magazines with made-up mastheads
export function makeMagazineRack(seed = 75) {
  const g = new THREE.Group(); g.name = 'magazine_rack';
  const W = 0.9, wire = std({ color: '#f0f0ec', metalness: 0.4, roughness: 0.4 }), r = rng(seed);
  const titles = [['NEWTYPO', '#e8402a'], ['ANIMAGE+', '#2a6ad8'], ['MODEL ART', '#f2c21a'], ['RAIL FAN', '#1e5a3a'], ['TOKYO WALK', '#c81e8a'], ['COMIC BAM', '#e8702a'], ['TUTITONE', '#111'], ['MECHA MONTHLY', '#5a2ab8']];
  const cover = (k) => canvasT(160, 220, (x, w, h) => { const [t, c] = titles[k % titles.length]; const rr = rng(k * 7 + 1); x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = `hsl(${rr() * 360},50%,${40 + rr() * 30}%)`; x.fillRect(0, 40, w, h - 40);
    if (t === 'RAIL FAN') { x.fillStyle = '#f2c21a'; x.fillRect(10, 110, w - 20, 50); x.fillStyle = '#2a2a2a'; for (let i = 0; i < 5; i++) x.fillRect(16 + i * 28, 120, 20, 16); } else { x.fillStyle = `hsl(${rr() * 360},60%,70%)`; x.beginPath(); x.arc(w / 2, 120, 40, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(w / 2 - 16, 112, 8, 8); x.fillRect(w / 2 + 8, 112, 8, 8); }
    x.fillStyle = c; fitText(x, t, w / 2, 24, w - 10, 36, F.heavy); x.fillStyle = '#fff'; fitText(x, `No.${Math.floor(rr() * 300)}  ¥${400 + Math.floor(rr() * 6) * 50}`, w / 2, h - 16, w - 20, 16, F.label); });
  const tiers = 6;
  for (let k = 0; k < tiers; k++) { const y = 0.3 + k * 0.25, z = 0.15 - k * 0.04;
    rod(V(-W / 2, y, z), V(W / 2, y, z), 0.005, wire, g); rod(V(-W / 2, y + 0.06, z + 0.03), V(W / 2, y + 0.06, z + 0.03), 0.004, wire, g);
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.205, 0.28, 0.006), [std({ color: '#ddd' }), std({ color: '#ddd' }), std({ color: '#ddd' }), std({ color: '#ddd' }), std({ map: cover(Math.floor(r() * 40)), roughness: 0.35 }), std({ color: '#ddd' })]); m.position.set(-W / 2 + 0.115 + i * 0.225, y + 0.13, z - 0.02); m.rotation.x = -0.25; m.rotation.z = (r() - 0.5) * 0.04; m.castShadow = true; g.add(m); } }
  for (const s of [-1, 1]) { rod(V(s * W / 2, 0.08, 0.2), V(s * W / 2, 1.9, -0.05), 0.008, wire, g); rod(V(s * W / 2, 0.08, -0.25), V(s * W / 2, 1.9, -0.1), 0.008, wire, g); }
  // bottom crate of rail magazines lying flat
  box(W, 0.02, 0.45, wire, 0, 0.1, -0.02, g); for (let i = 0; i < 4; i++) { const m = box(0.2, 0.03, 0.28, [std({ color: '#ddd' }), std({ color: '#ddd' }), std({ map: cover(3 + i * 8) }), std({ color: '#ddd' }), std({ color: '#ddd' }), std({ color: '#ddd' })], -W / 2 + 0.115 + i * 0.225, 0.13 + (i % 2) * 0.02, 0.0, g); m.rotation.y = (r() - 0.5) * 0.2; }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.025, 0.025, 0.03, std({ color: '#222' }), sx * (W / 2 - 0.03), 0.03, sz * 0.2, g, 10).rotation.x = Math.PI / 2;
  g.userData.collider = [-W / 2, W / 2, -0.28, 0.25];
  return g;
}
// painted shutter: a flat cartoon lake (trees, reeds, a red bridge, ducks), plus a hand-painted shop line along the bottom
function lakeArt() { return canvasT(1024, 512, (x, w, h) => { const r = rng(9);
  const sky = x.createLinearGradient(0, 0, 0, h * 0.5); sky.addColorStop(0, '#8ad0f0'); sky.addColorStop(1, '#d8f0f8'); x.fillStyle = sky; x.fillRect(0, 0, w, h);
  x.fillStyle = '#5ab84a'; x.beginPath(); x.moveTo(0, h * 0.5); for (let i = 0; i <= 10; i++) x.lineTo(i * w / 10, h * (0.38 + 0.08 * Math.sin(i * 1.7))); x.lineTo(w, h); x.lineTo(0, h); x.fill();
  for (let i = 0; i < 16; i++) { const tx = r() * w, ty = h * (0.3 + r() * 0.15), s = 30 + r() * 40; x.fillStyle = '#6a4a2a'; x.fillRect(tx - 5, ty, 10, s); x.fillStyle = ['#2a8a3a', '#3ab84a', '#8ac83a', '#f2c21a'][i % 4]; x.beginPath(); x.ellipse(tx, ty, s * 0.6, s * 0.9, 0, 0, 7); x.fill(); }
  x.fillStyle = '#3a8ad8'; x.beginPath(); x.ellipse(w * 0.5, h * 0.72, w * 0.42, h * 0.14, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 12; i++) x.fillRect(w * 0.2 + r() * w * 0.6, h * 0.66 + r() * h * 0.12, 40, 3);
  x.strokeStyle = '#d82a1e'; x.lineWidth = 10; x.beginPath(); x.arc(w * 0.62, h * 0.74, 90, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(w * 0.62 - 75 + i * 30, h * 0.74 - 30 - Math.sin(i / 5 * Math.PI) * 30); x.lineTo(w * 0.62 - 75 + i * 30, h * 0.74); x.stroke(); }
  for (const [dx, dy] of [[0.3, 0.74], [0.34, 0.76], [0.44, 0.7]]) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(w * dx, h * dy, 16, 9, 0, 0, 7); x.fill(); x.beginPath(); x.arc(w * dx + 12, h * dy - 8, 6, 0, 7); x.fill(); x.fillStyle = '#f2a01a'; x.fillRect(w * dx + 17, h * dy - 9, 6, 3); }
  x.fillStyle = '#7ac85a'; for (let i = 0; i < 80; i++) { const rx = r() * w; x.fillRect(rx, h * 0.82 + r() * 20, 3, -20 - r() * 30); }
  x.fillStyle = '#3a8a3a'; x.fillRect(0, h * 0.92, w, h * 0.08); x.fillStyle = '#f2e8c8'; fitText(x, '←  中 町 商 店 街  →', w / 2, h * 0.962, w * 0.5, 24, F.antique); }); }
export function makeLakeShutter(w = 4.2, h = 2.8) {
  const g = new THREE.Group(); g.name = 'lake_shutter';
  const s = paintedShutter(w, h, lakeArt()); s.position.y = h / 2; g.add(s);
  box(w + 0.2, 0.5, 0.35, std({ color: '#5a5c60', metalness: 0.5 }), 0, h + 0.25, 0.05, g);
  // brick header with hanging ivy, SALE flags, a string of triangular bunting, two notices taped to the shutter
  box(w + 0.4, 0.5, 0.15, std({ map: tex('i4_brick_red', 2, 0.3), roughness: 0.9 }), 0, h + 0.75, 0.18, g);
  const ivy = std({ color: '#3a7a2a', roughness: 0.7, side: THREE.DoubleSide }), r = rng(3);
  for (let i = 0; i < 60; i++) { const l = plane(0.07, 0.07, ivy, -w / 2 + r() * w, h + 0.5 - r() * 0.4, 0.27, 0, g); l.rotation.z = r() * 3; }
  const sale = canvasT(128, 96, (x, cw, ch) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, cw, ch); x.fillStyle = '#d81e1e'; fitText(x, 'SALE', cw / 2, 50, cw - 16, 56, F.heavy); });
  for (const sx of [-0.35, 0.35]) plane(0.4, 0.3, std({ map: sale, side: THREE.DoubleSide }), sx * w, h + 0.25, 0.3, 0, g);
  const flagC = ['#d81e1e', '#f2c21a', '#2a6ad8', '#3ab84a', '#f4f2ea'];
  for (let i = 0; i < 18; i++) { const x0 = -w / 2 + 0.1 + i * (w - 0.2) / 18; const tri = new THREE.Shape(); tri.moveTo(-0.08, 0); tri.lineTo(0.08, 0); tri.lineTo(0, -0.16); tri.closePath(); const f = new THREE.Mesh(new THREE.ShapeGeometry(tri), std({ color: flagC[i % 5], side: THREE.DoubleSide })); f.position.set(x0 + 0.1, h + 0.05 - 0.06 * Math.sin(i / 17 * Math.PI), 0.3); g.add(f); }
  const nt = canvasT(256, 360, (x, cw, ch) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, cw, ch); x.fillStyle = '#111'; fitText(x, 'お知らせ', cw / 2, 40, cw - 40, 34, F.antique); for (let i = 0; i < 9; i++) x.fillRect(24, 80 + i * 28, 150 + (i * 37) % 60, 6); fitText(x, '中町商店街振興組合', cw / 2, 340, cw - 30, 20, F.antique); });
  plane(0.3, 0.42, std({ map: nt }), -w / 2 - 0.05, 1.5, 0.15, 0, g); plane(0.3, 0.42, std({ map: nt }), w / 2 + 0.05, 1.5, 0.15, 0, g);
  return g;
}
// the monster-movie shutter: red shutters either side, a yellow middle with a black-ink hero swinging a sword at a
// rearing lizard kaiju; a row of small framed old film posters above (all invented)
function kaijuArt() { return canvasT(1024, 768, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111';
  // hero (left): silhouette with a raised blade
  x.beginPath(); x.ellipse(280, 230, 42, 50, 0, 0, 7); x.fill(); x.fillRect(240, 270, 90, 200); x.beginPath(); x.moveTo(240, 470); x.lineTo(200, 700); x.lineTo(250, 700); x.lineTo(285, 500); x.lineTo(320, 700); x.lineTo(370, 700); x.lineTo(330, 470); x.fill();
  x.lineWidth = 34; x.strokeStyle = '#111'; x.beginPath(); x.moveTo(320, 300); x.lineTo(400, 200); x.stroke(); x.lineWidth = 10; x.beginPath(); x.moveTo(400, 200); x.lineTo(470, 60); x.stroke(); x.fillStyle = '#fff'; x.fillRect(270, 220, 14, 6);
  // kaiju (right): a rearing lizard with dorsal plates, open jaw
  x.fillStyle = '#111'; x.beginPath(); x.moveTo(700, 700); x.lineTo(720, 420); x.bezierCurveTo(700, 300, 760, 200, 820, 180); x.lineTo(900, 150); x.lineTo(880, 210); x.lineTo(930, 230); x.lineTo(860, 250); x.bezierCurveTo(840, 320, 880, 420, 860, 520); x.lineTo(900, 700); x.fill();
  for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(740 - i * 4, 230 + i * 60); x.lineTo(690 - i * 6, 250 + i * 60); x.lineTo(730 - i * 4, 270 + i * 60); x.fill(); }
  x.fillStyle = '#fff'; x.beginPath(); x.arc(850, 190, 8, 0, 7); x.fill(); for (let i = 0; i < 4; i++) x.fillRect(870 + i * 12, 212, 5, 10);
  x.fillStyle = '#d81e1e'; fitText(x, '怪獣大決戦', w / 2 + 40, 420, 360, 110, F.brush); x.fillStyle = '#111'; fitText(x, 'ほしぞら活動写真館', w / 2 + 40, 520, 420, 52, F.antique); x.fillStyle = '#d81e1e'; x.fillRect(380, 560, 300, 40); x.fillStyle = '#fff'; fitText(x, 'OPEN 12:00–20:00', 530, 582, 280, 28, F.label); }); }
export function makeKaijuShutter() {
  const g = new THREE.Group(); g.name = 'kaiju_shutter';
  const red = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 20; i++) x.fillRect((i * 53) % w, (i * 97) % h, 30, 3); });
  const sL = paintedShutter(2.4, 2.8, red); sL.position.set(-3.0, 1.4, 0); g.add(sL);
  const sR = paintedShutter(2.4, 2.8, red); sR.position.set(3.0, 1.4, 0); g.add(sR);
  const sM = paintedShutter(3.6, 2.8, kaijuArt()); sM.position.set(0, 1.4, 0); g.add(sM);
  const wm = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, '● HOSHIZORA', w / 2, 70, w - 40, 70, F.heavy); }); plane(1.8, 0.45, std({ map: wm, transparent: true }), 3.0, 2.0, 0.02, 0, g);
  box(8.6, 0.55, 0.35, std({ color: '#141414' }), 0, 3.08, 0.05, g);
  const hd = canvasT(512, 64, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, 'ほしぞら活動写真館  21', w / 2, 34, w - 40, 36, F.antique); });
  plane(2.4, 0.3, std({ map: hd, emissive: '#ffffff', emissiveMap: hd, emissiveIntensity: 0.4 }), -1.6, 3.1, 0.23, 0, g);
  // the framed posters: 10 small invented film posters in black frames
  for (let i = 0; i < 10; i++) { const pt = canvasT(96, 136, (x, w, h) => { const r = rng(i * 13 + 5); x.fillStyle = `hsl(${r() * 360},45%,${45 + r() * 25}%)`; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.beginPath(); x.arc(w / 2, 56, 22 + r() * 10, 0, 7); x.fill(); x.fillStyle = '#f4f2ea'; fitText(x, ['月光剣', '海底城', '鉄の巨人', '夜霧', '星の恋人', '大怪鳥', '赤い港', '忍び雲', '春嵐', '火山島'][i], w / 2, 112, w - 10, 22, F.brush); });
    const fx = 0.6 + i * 0.36; box(0.3, 0.4, 0.03, std({ color: '#111' }), fx, 3.6, 0.15, g); plane(0.26, 0.36, std({ map: pt }), fx, 3.6, 0.166, 0, g); }
  return g;
}
// the whole passage: a street front with glass doors at local z = 0 (facing +z), a 4 m corridor running back to z = -16,
// shops on both sides (shutters down), the junk-game stall open at the far end
export function makeMallPassage() {
  const g = new THREE.Group(); g.name = 'mall_passage';
  const W = 13, D = 16, H = 4.4, CW = 4.2, cols = [];
  const wall = std({ color: '#e8e4d8', roughness: 0.8 });
  box(W, H + 1.5, 0.3, std({ map: tex('tx_stucco', 4, 2), color: '#e8dcc8' }), 0, (H + 1.5) / 2, -D - 0.15, g);
  for (const s of [-1, 1]) box(0.3, H + 1.5, D, std({ map: tex('tx_stucco', 4, 2), color: '#e8dcc8' }), s * (W / 2 - 0.15), (H + 1.5) / 2, -D / 2, g);
  box(W, 0.3, D, std({ color: '#5a5a5c' }), 0, H + 1.5, -D / 2, g);
  // the front: stucco with a canopy + sign over the glass doors in the corridor's width
  for (const s of [-1, 1]) box((W - CW) / 2, H + 1.5, 0.3, std({ map: tex('tx_stucco', 2, 2), color: '#e8dcc8' }), s * (CW / 2 + (W - CW) / 4), (H + 1.5) / 2, -0.15, g);
  box(CW, 1.6, 0.3, std({ map: tex('tx_stucco', 1, 1), color: '#e8dcc8' }), 0, H + 0.7, -0.15, g);
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#1e3a6a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2e8c8'; fitText(x, '中町アーケード', w / 2, 100, w - 100, 120, F.antique); fitText(x, 'NAKAMACHI ARCADE  ·  B1 GAMES · BOOKS · CINEMA', w / 2, 210, w - 120, 36, F.label, { spacing: 3 }); });
  box(5.6, 1.4, 0.2, std({ map: sg, emissive: '#ffffff', emissiveMap: sg, emissiveIntensity: 0.5 }), 0, H + 0.7, 0.15, g);
  const gl = new THREE.MeshPhysicalMaterial({ color: '#c8d8e0', transparent: true, opacity: 0.18, roughness: 0.04, depthWrite: false, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const d = new THREE.Group(); d.position.set(s * CW / 2, 0, 0); d.rotation.y = s * 1.3; g.add(d); plane(1.0, 2.6, gl, -s * 0.5, 1.3, 0, 0, d); box(0.05, 2.6, 0.05, std({ color: '#c8ccd0', metalness: 0.8 }), -s * 1.0, 1.3, 0, d); }
  box(CW, 0.15, 0.2, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 2.65, 0, g);
  // corridor floor: cream terrazzo tiles with pastel accent squares, a floor sticker; ceiling with fluorescent strips
  const ft = canvasT(512, 512, (x, w, h) => { const r = rng(5); x.fillStyle = '#e8e4da'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const c = r(); x.fillStyle = c < 0.15 ? '#a8d8c8' : c < 0.25 ? '#c8d0c8' : '#ece8de'; x.fillRect(i * 128 + 2, j * 128 + 2, 124, 124); } x.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 400; i++) x.fillRect(r() * w, r() * h, 2, 2); }); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(CW / 2.4, D / 2.4);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(CW, D), phys({ map: ft, roughness: 0.3, clearcoat: 0.3 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -D / 2); fl.receiveShadow = true; g.add(fl);
  const fs = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#d81e1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, '一方通行', w / 2, 40, w - 30, 40, F.antique); x.fillRect(30, 70, w - 60, 60); x.fillStyle = '#d81e1e'; fitText(x, '← 映画館 · ゲーム →', w / 2, 100, w - 80, 26, F.antique); });
  const st = plane(0.6, 0.38, std({ map: fs, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0.015, -4.5, 0, g); st.rotation.x = -Math.PI / 2;
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(CW, D), std({ color: '#f2f0ea' })); cl.rotation.x = Math.PI / 2; cl.position.set(0, 3.4, -D / 2); g.add(cl);
  for (let k = 0; k < 6; k++) box(0.15, 0.05, 1.2, std({ color: '#fff', emissive: '#f4f8ff', emissiveIntensity: 2 }), 0, 3.37, -1.5 - k * 2.6, g);
  for (const z of [-3, -9, -14]) { const p = new THREE.PointLight('#f4f8ff', 7, 9, 1.4); p.position.set(0, 3.1, z); g.add(p); }
  // corridor walls behind/around the shutters, and the shutters themselves
  for (const s of [-1, 1]) box(0.2, 3.4, D, wall, s * (CW / 2 + 0.1), 1.7, -D / 2, g);
  const lake = makeLakeShutter(4.6, 2.8); lake.position.set(-CW / 2 + 0.03, 0, -4.2); lake.rotation.y = Math.PI / 2; g.add(lake);
  const kai = makeKaijuShutter(); kai.scale.setScalar(0.9); kai.position.set(CW / 2 - 0.03, 0, -7.8); kai.rotation.y = -Math.PI / 2; g.add(kai);
  // a framed print beside the lake shutter, a fire extinguisher box
  const pr = canvasT(256, 320, (x, w, h) => { x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e4d8'; x.fillRect(20, 20, w - 40, h - 40); x.fillStyle = '#5a5a5a'; x.beginPath(); x.moveTo(40, 260); x.lineTo(110, 120); x.lineTo(150, 190); x.lineTo(180, 150); x.lineTo(220, 260); x.fill(); });
  plane(0.7, 0.9, std({ map: pr }), -CW / 2 + 0.01, 1.7, -8.6, Math.PI / 2, g);
  box(0.3, 0.5, 0.15, std({ color: '#d81e1e' }), -CW / 2 + 0.08, 0.6, -10.5, g);
  // the junk-game stall at the far end: a counter-height steel shelf with the CRT console TV, game boxes, plush bags,
  // the magazine rack beside it, a hand-lettered buy-sell banner
  const stall = new THREE.Group(); stall.position.set(0, 0, -D + 1.2); g.add(stall);
  const shelf = std({ color: '#c8ccd0', metalness: 0.5, roughness: 0.4 });
  box(2.0, 0.04, 0.6, shelf, -0.6, 0.75, 0, stall); box(2.0, 0.04, 0.6, shelf, -0.6, 0.25, 0, stall); for (const sx of [-1.58, 0.38]) for (const sz of [-0.28, 0.28]) box(0.04, 0.8, 0.04, shelf, sx, 0.4, sz, stall);
  const tv = makeCRTConsoleTV(); tv.position.set(-0.9, 0.77, 0.02); stall.add(tv);
  const r = rng(8); for (let i = 0; i < 9; i++) { const b = canvasT(64, 96, (x, w, h) => { x.fillStyle = `hsl(${r() * 360},60%,50%)`; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.fillRect(6, 6, w - 12, 20); x.fillStyle = '#111'; x.fillRect(10, 40, w - 20, 40); }); const bx = box(0.14, 0.2, 0.04, std({ map: b }), -1.45 + i * 0.16, 0.37, 0.2, stall); bx.rotation.x = -0.1; }
  for (const [x, c] of [[-0.25, '#f08a1a'], [0.15, '#2a6ad8'], [-0.1, '#3ab84a']]) { const bag = sphere(0.22, std({ color: c, roughness: 0.9 }), x, 1.0, -0.05, stall); bag.scale.set(0.8, 1.2, 0.7); }
  const mr = makeMagazineRack(); mr.position.set(1.2, 0, 0.05); stall.add(mr);
  const cs = makeComicStack(); cs.position.set(-1.82, 0, 0.1); stall.add(cs);   // item 82
  const ban = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#e8ff3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; fitText(x, 'レトロゲーム 買取・販売', w / 2, 68, w - 40, 70, F.marker); });
  plane(2.6, 0.62, std({ map: ban }), 0, 2.6, -0.55, 0, stall);
  plane(CW, 3.4, std({ color: '#3a3a3c' }), 0, 1.7, -0.6, 0, stall);
  cols.push([-W / 2, -CW / 2 - 0.0, -D, 0], [CW / 2, W / 2, -D, 0], [-CW / 2, CW / 2, -D, -D + 1.55], [-CW / 2, CW / 2 - 0.0, -D - 0.3, -D]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -CW / 2 + 0.25, maxX: CW / 2 - 0.25, minZ: -D + 1.6, maxZ: 0.3 }];
  return g;
}
