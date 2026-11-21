// Batch 79 (photos/batch79/): a street-corner group of free-paper boxes (made-up papers), a slatted steel trash can and
// a utility vault lid with a red locate mark.
//   makeFreeBoxDome, makeFreeBoxHouse, makeSlatTrashCan, makeVaultLid, makeFreePaperCorner
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const decal = (t) => std({ map: t, transparent: true, alphaTest: 0.05, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.45 });
// a window door: a framed clear panel with a stack of newspapers behind it, a pull lip
function windowDoor(p, w, h, y, z, paper, frameM) {
  box(w + 0.04, h + 0.04, 0.02, frameM, 0, y, z, p);
  const pg = canvasT(256, 320, (x, cw, ch) => { x.fillStyle = '#ece8dc'; x.fillRect(0, 0, cw, ch); x.fillStyle = '#111'; fitText(x, paper, cw / 2, 36, cw - 20, 34, F.engraved); x.fillRect(12, 56, cw - 24, 3); x.fillStyle = '#6a6a6a'; x.fillRect(14, 70, 130, 110); x.fillStyle = '#333'; for (let i = 0; i < 12; i++) x.fillRect(154, 70 + i * 10, 88, 4); for (let i = 0; i < 9; i++) x.fillRect(14, 196 + i * 12, cw - 28, 4); });
  plane(w - 0.02, h - 0.02, std({ map: pg, roughness: 0.9 }), 0, y, z + 0.005, 0, p);
  plane(w, h, phys({ color: '#d8e4ea', transparent: true, opacity: 0.25, roughness: 0.08, depthWrite: false }), 0, y, z + 0.016, 0, p);
  box(0.12, 0.025, 0.03, frameM, 0, y - h / 2 - 0.03, z + 0.02, p);
}
function stickers(p, w, y0, y1, z, seed, n = 7) { const r = rng(seed); for (let i = 0; i < n; i++) { const kind = i % 5; const t = canvasT(128, 128, (x, cw, ch) => { x.clearRect(0, 0, cw, ch);
    if (kind === 0) { x.fillStyle = '#f2e04a'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(42, 46, 10, 14); x.fillRect(76, 46, 10, 14); x.lineWidth = 6; x.beginPath(); x.arc(64, 70, 26, 0.2, Math.PI - 0.2); x.stroke(); }
    else if (kind === 1) { x.fillStyle = '#fff'; x.fillRect(6, 30, 116, 68); x.fillStyle = '#2a6ad8'; fitText(x, 'SKATE OR WALK', 64, 64, 104, 22, F.heavy); }
    else if (kind === 2) { x.fillStyle = '#111'; x.fillRect(10, 10, 108, 108); x.fillStyle = '#f28ab8'; fitText(x, 'zine!', 64, 70, 96, 40, F.marker); }
    else if (kind === 3) { x.fillStyle = '#e8e8e0'; x.beginPath(); x.moveTo(10, 20); x.lineTo(118, 14); x.lineTo(110, 70); x.lineTo(60, 60); x.lineTo(20, 100); x.fill(); }
    else { x.fillStyle = '#3ab84a'; x.beginPath(); x.ellipse(64, 64, 58, 36, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'PLANT MORE', 64, 68, 96, 20, F.label); } });
    const s = 0.06 + r() * 0.05; const m = plane(s, s, decal(t), (r() - 0.5) * (w - s), y0 + r() * (y1 - y0), z, 0, p); m.rotation.z = (r() - 0.5) * 0.6; } }

export function makeFreeBoxDome() {
  const g = new THREE.Group(); g.name = 'free_box_red';
  const red = std({ color: '#c8202a', roughness: 0.45 }), W = 0.42, D = 0.36;
  // pedestal: a tapered red column on a square foot
  box(0.32, 0.04, 0.32, red, 0, 0.02, 0, g); cyl(0.07, 0.09, 0.42, red, 0, 0.25, 0, g, 18);
  // body + the round domed top (a half cylinder lying front-to-back)
  rbox(W, 0.62, D, 0.04, red, 0, 0.77, 0, g);
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, D, 28, 1, false, 0, Math.PI), red); dome.rotation.set(Math.PI / 2, Math.PI / 2, 0); dome.rotation.order = 'YXZ'; dome.position.set(0, 1.08, 0); dome.castShadow = true; g.add(dome);
  for (const s of [-1, 1]) { const cap = new THREE.Mesh(new THREE.CircleGeometry(W / 2, 28, 0, Math.PI), red); cap.position.set(0, 1.08, s * D / 2); cap.rotation.y = s > 0 ? 0 : Math.PI; g.add(cap); }
  const wl = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'FREE · TAKE ONE', w / 2, 70, w - 40, 64, F.heavy); });
  const wm = plane(0.36, 0.09, decal(wl), 0, 1.15, D / 2 + 0.002, 0, g); void wm;
  windowDoor(g, 0.3, 0.34, 0.82, D / 2, 'THE ELM WEEKLY', std({ color: '#a81a22' }));
  stickers(g, W - 0.04, 0.5, 1.0, D / 2 + 0.003, 3, 6); stickers(g, 0.28, 0.08, 0.4, 0.094, 5, 3);
  const sideT = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#c8202a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'ELM', w / 2, 100, w - 60, 90, F.engraved); fitText(x, 'WEEKLY', w / 2, 170, w - 60, 50, F.engraved); });
  for (const s of [-1, 1]) plane(0.26, 0.26, decal(sideT), s * (W / 2 + 0.002), 0.8, 0, s * Math.PI / 2, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
export function makeFreeBoxHouse() {
  const g = new THREE.Group(); g.name = 'free_box_house';
  const speck = canvasT(256, 256, (x, w, h) => { const r = rng(2); x.fillStyle = '#7a8088'; x.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const c = r() < 0.5 ? 40 + r() * 30 : 170 + r() * 60; x.fillStyle = `rgb(${c},${c + 2},${c + 6})`; x.fillRect(r() * w, r() * h, 1.6, 1.6); } }); speck.wrapS = speck.wrapT = THREE.RepeatWrapping;
  const grey = std({ map: speck, roughness: 0.75 }), W = 0.46, D = 0.42;
  box(0.36, 0.05, 0.36, grey, 0, 0.025, 0, g); box(0.16, 0.55, 0.16, grey, 0, 0.3, 0, g); box(0.24, 0.06, 0.24, grey, 0, 0.58, 0, g);
  rbox(W, 0.62, D, 0.03, grey, 0, 0.91, 0, g);
  // the gable roof: two shingled slopes + a little chimney stub
  const shing = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#6a7078'; x.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { x.fillStyle = (i + j) % 3 ? '#80868e' : '#727880'; x.fillRect(i * 44 + (j % 2) * 22, j * 32, 40, 28); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(i * 44 + (j % 2) * 22, j * 32 + 26, 40, 4); } });
  const sm = std({ map: shing, roughness: 0.8 });
  for (const s of [-1, 1]) { const sl = box(W / 2 / Math.cos(0.6) + 0.06, 0.025, D + 0.06, sm, s * W / 4, 1.22 + Math.tan(0.6) * W / 4, 0, g); sl.rotation.z = -s * 0.6; }
  const gab = new THREE.Shape(); gab.moveTo(-W / 2, 0); gab.lineTo(W / 2, 0); gab.lineTo(0, Math.tan(0.6) * W / 2); gab.closePath();
  for (const s of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gab), grey); gm.position.set(0, 1.22, s * D / 2); gm.rotation.y = s > 0 ? 0 : Math.PI; g.add(gm); }
  box(0.07, 0.09, 0.07, grey, 0.1, 1.38, -0.05, g);
  const nm = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#20242a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e4d8'; fitText(x, 'CEDAR HOLLOW', w / 2, 70, w - 50, 70, F.engraved); });
  box(0.4, 0.08, 0.01, std({ map: nm }), 0, 1.15, D / 2 + 0.005, g);
  windowDoor(g, 0.3, 0.36, 0.86, D / 2, 'CEDAR HOLLOW', std({ color: '#4a5058' }));
  const side = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e8e4d8'; fitText(x, 'CEDAR HOLLOW', w / 2, 70, w - 30, 64, F.engraved); });
  for (const s of [-1, 1]) { const p = plane(0.38, 0.09, decal(side), s * (W / 2 + 0.002), 0.95, 0, s * Math.PI / 2, g); p.rotation.z = 0.5 * s; }
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
export function makeSlatTrashCan() {
  const g = new THREE.Group(); g.name = 'slat_trash_can'; const blk = std({ color: '#1c1c1e', metalness: 0.5, roughness: 0.45 });
  const R = 0.3, H = 0.85; for (const y of [0.08, H - 0.05]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.02, 6, 32), blk); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; const s = box(0.04, H - 0.1, 0.012, blk, Math.cos(a) * R, H / 2 + 0.02, Math.sin(a) * R, g); s.rotation.y = -a + Math.PI / 2; }
  cyl(R - 0.02, R - 0.02, 0.02, blk, 0, 0.06, 0, g, 28);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.03, R - 0.04, H - 0.1, 24, 1, true), std({ color: '#2a2a2a', roughness: 0.3, side: THREE.DoubleSide })); liner.position.y = H / 2 + 0.02; g.add(liner);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.04, 28), blk); lid.position.y = H + 0.02; g.add(lid); cyl(0.12, 0.12, 0.05, std({ color: '#0a0a0a' }), 0, H + 0.03, 0, g, 20);
  for (let k = 0; k < 3; k++) { const leg = box(0.05, 0.08, 0.05, blk, Math.cos(k * 2.09) * (R - 0.05), 0.04, Math.sin(k * 2.09) * (R - 0.05), g); void leg; }
  g.userData.collider = [-R - 0.03, R + 0.03, -R - 0.03, R + 0.03];
  return g;
}
export function makeVaultLid() {
  const g = new THREE.Group(); g.name = 'vault_lid';
  const t = canvasT(256, 192, (x, w, h) => { x.fillStyle = '#8a8a86'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a5a58'; x.fillRect(16, 16, w - 32, h - 32); x.fillStyle = '#6a6a68'; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(24 + i * 18, 24 + j * 18, 10, 6); x.fillStyle = '#2a2a28'; fitText(x, 'WATER', w / 2, h / 2, 100, 26, F.stencil); x.fillStyle = '#e8261e'; x.fillRect(w - 50, 10, 46, 8); x.fillRect(w - 20, 10, 8, 70); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), std({ map: t, metalness: 0.4, roughness: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.receiveShadow = true; g.add(m);
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.035), std({ color: '#e8261e', roughness: 0.8 })); mark.rotation.set(-Math.PI / 2, 0, 0.6); mark.position.set(0.45, 0.004, -0.25); g.add(mark);
  return g;
}
export function makeFreePaperCorner() {
  const g = new THREE.Group(); g.name = 'free_paper_corner';
  const tc = makeSlatTrashCan(); tc.position.set(-0.95, 0, -0.2); g.add(tc);
  const r = makeFreeBoxDome(); r.position.set(-0.2, 0, 0); r.rotation.y = 0.15; g.add(r);
  const h = makeFreeBoxHouse(); h.position.set(0.38, 0, 0.08); h.rotation.y = -0.2; g.add(h);
  const v = makeVaultLid(); v.position.set(0.55, 0, 0.75); v.rotation.y = 0.3; g.add(v);
  g.userData.colliders = [[-1.3, -0.6, -0.55, 0.15], [-0.45, 0.65, -0.25, 0.3]];
  return g;
}
