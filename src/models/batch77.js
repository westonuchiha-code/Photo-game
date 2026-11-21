// Batch 77 (photos/batch77/): "Hearth Market", a small supermarket with an open dairy-case aisle under a blue scroll
// mural, a drink-case end display, a deli corner with corn dogs, and an online-pickup staging corner (shrink-wrapped
// tote pallet, counted tote stacks, a labelled case, a picker's handheld). All brands, codes and numbers made up.
//   makeCornDogTray, makeCaseLabelBox, makeHandheldScanner, makeFoldingTote, makeWrappedTotePallet, makeToteStacks,
//   makeOpenDairyCase, makeDrinkCaseCube, makeHearthMarket
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const glow = (t, i = 1) => std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: i, roughness: 0.4 });
function rotRect([a, b, c0, c1], ry) { const q = Math.round(ry / (Math.PI / 2)) & 3; if (q === 0) return [a, b, c0, c1]; if (q === 2) return [-b, -a, -c1, -c0]; if (q === 1) return [c0, c1, -b, -a]; return [-c1, -c0, a, b]; }
function placer(g, cols) { return (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const r = rotRect(c, ry); cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; }; }
const cardM = (map) => { const c = std({ color: '#c8a070', roughness: 0.9 }); return [c, c, c, c, map ? std({ map, roughness: 0.85 }) : c, c]; };
function barcode(x, x0, y0, w, h, seed) { const r = rng(seed); let px = x0; x.fillStyle = '#111'; while (px < x0 + w - 4) { const bw = 1 + Math.floor(r() * 4); if (r() < 0.6) x.fillRect(px, y0, bw, h); px += bw + 1; } }

// ---- food --------------------------------------------------------------------------------------------------------------
function paperBoat(w, d, h) { const g = new THREE.Group(); const m = std({ color: '#f4f2ea', roughness: 0.9, side: THREE.DoubleSide });
  box(w, 0.002, d, m, 0, 0.001, 0, g); for (const s of [-1, 1]) { const sd = plane(w, h, m, 0, h / 2, s * d / 2, 0, g); sd.rotation.x = s * 0.35; sd.position.z = s * (d / 2 + Math.sin(0.35) * h / 2); const en = plane(d, h, m, s * w / 2, h / 2, 0, Math.PI / 2, g); en.rotation.z = s * 0.35; en.position.x = s * (w / 2 + Math.sin(0.35) * h / 2); } return g; }
function cornDog(potato, seed) { const g = new THREE.Group(); const r = rng(seed);
  cyl(0.003, 0.003, 0.3, std({ color: '#d8c090', roughness: 0.9 }), 0, 0, 0.1, g, 6).rotation.x = Math.PI / 2;
  const body = sphere(0.032, std({ color: potato ? '#d8a050' : '#c87a2a', roughness: 0.9 }), 0, 0, -0.02, g, 18, 12); body.scale.set(1, 0.9, 2.6);
  // crumb coat: little bumps all over
  const crumbM = std({ color: '#d88a3a', roughness: 0.95, flatShading: true }), fryM = std({ color: '#f2c870', roughness: 0.7 }), geos = [];
  for (let i = 0; i < (potato ? 60 : 140); i++) { const a = r() * Math.PI * 2, t = (r() - 0.5) * 1.8; const pz = -0.02 + t * 0.075, rad = 0.032 * Math.sqrt(Math.max(0.05, 1 - t * t * 0.8));
    const gg = potato ? new THREE.BoxGeometry(0.014, 0.014, 0.014) : new THREE.IcosahedronGeometry(0.004 + r() * 0.003, 0); gg.rotateX(r() * 3); gg.rotateY(r() * 3); gg.translate(Math.cos(a) * rad, Math.sin(a) * rad * 0.9, pz); geos.push(gg); }
  g.add(new THREE.Mesh(mergeGeometries(geos), potato ? fryM : crumbM));
  if (potato) { const s = std({ color: '#c8401a', roughness: 0.6 }); for (let i = 0; i < 30; i++) { const d = sphere(0.003, s, (r() - 0.5) * 0.06, 0.02 + r() * 0.015, -0.1 + r() * 0.16, g, 5, 4); void d; } }
  return g; }
export function makeCornDogTray() {
  const g = new THREE.Group(); g.name = 'corn_dog_tray';
  rbox(0.42, 0.02, 0.3, 0.008, std({ map: tex('wood_floor', 0.4, 0.3), roughness: 0.6 }), 0, 0.01, 0, g);
  for (const s of [-1, 1]) for (const z of [-0.15, 0.15]) { const l = box(0.42, 0.015, 0.01, std({ map: tex('wood_floor', 0.4, 0.05) }), 0, 0.027, z, g); void l; }
  const b1 = paperBoat(0.1, 0.2, 0.035); b1.position.set(-0.08, 0.02, -0.02); b1.rotation.y = 0.15; g.add(b1); const d1 = cornDog(false, 3); d1.position.set(-0.08, 0.055, -0.03); d1.rotation.y = 0.15; g.add(d1);
  const b2 = paperBoat(0.1, 0.2, 0.035); b2.position.set(0.07, 0.02, 0.01); b2.rotation.y = -0.1; g.add(b2); const d2 = cornDog(true, 7); d2.position.set(0.07, 0.058, 0.0); d2.rotation.y = -0.1; g.add(d2);
  const cup = cyl(0.028, 0.022, 0.03, std({ color: '#f4f4f0', transparent: true, opacity: 0.85 }), 0.16, 0.035, -0.08, g, 20); void cup; cyl(0.026, 0.026, 0.004, std({ color: '#f2a890', roughness: 0.3 }), 0.16, 0.047, -0.08, g, 20);
  return g;
}

// ---- pickup staging ----------------------------------------------------------------------------------------------------
export function makeCaseLabelBox(seed = 1) {
  const g = new THREE.Group(); g.name = 'case_label_box';
  const lab = canvasT(512, 320, (x, w, h) => { x.fillStyle = '#c8a070'; x.fillRect(0, 0, w, h); x.fillStyle = '#fbfbf8'; x.beginPath(); x.roundRect(40, 30, w - 80, h - 60, 16); x.fill();
    x.fillStyle = '#111'; x.font = `bold 26px ${F.label}`; x.fillText('4882.07', 60, 80); x.textAlign = 'center'; x.fillText('BEST IF USED BY', 330, 72); x.fillText('MAR 11 2027', 330, 102); x.fillText('LOT 330918274', 330, 132); x.textAlign = 'left';
    x.font = `20px ${F.label}`; x.fillText('24ct. 12oz. Bag Harvest Mix Display', 60, 170); barcode(x, 70, 185, w - 140, 60, seed); x.font = `bold 28px ${F.label}`; x.textAlign = 'center'; x.fillText('00048830 19274' + seed, w / 2, 274); });
  box(0.6, 0.4, 0.4, cardM(lab), 0, 0.2, 0, g); box(0.6, 0.004, 0.06, std({ color: '#b89a6a', transparent: true, opacity: 0.8 }), 0, 0.402, 0, g);
  g.userData.collider = [-0.3, 0.3, -0.2, 0.2];
  return g;
}
export function makeHandheldScanner() {
  const g = new THREE.Group(); g.name = 'picker_handheld';
  const scr = canvasT(320, 600, (x, w, h) => { x.fillStyle = '#eef4fa'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e6ad8'; x.fillRect(0, 0, w, 70); x.fillStyle = '#fff'; fitText(x, '←  Picking', 90, 40, 160, 30, F.label); x.fillStyle = '#5ab8ff'; x.beginPath(); x.roundRect(220, 22, 40, 24, 12); x.fill(); x.beginPath(); x.roundRect(266, 22, 44, 24, 12); x.fill(); x.fillStyle = '#fff'; x.font = `14px ${F.label}`; x.fillText('41s', 228, 39); x.fillText('97%', 274, 39);
    x.fillStyle = '#1e6ad8'; x.font = `20px ${F.label}`; x.fillText('▣  Scan Item', 20, 104); x.fillStyle = '#333'; x.font = `16px ${F.label}`; x.fillText('Cart  B  07 - QX2240', 20, 140); x.fillText('Order 38117', 200, 140);
    x.fillStyle = '#fff'; x.fillRect(16, 156, w - 32, 70); x.fillStyle = '#d8e8fa'; x.fillRect(90, 160, 60, 62); x.fillStyle = '#111'; x.font = `bold 34px ${F.label}`; x.fillText('12', 100, 206); x.font = `12px ${F.label}`; x.fillText('Aisle', 104, 172); ['Bay L4', 'Shelf 2', 'Pos 6'].forEach((t, i) => x.fillText(t, 170 + i * 46, 196)); x.fillText('Stay in aisle', 20, 196);
    x.font = `bold 18px ${F.label}`; x.fillText('Orchard Way Sparkling', 20, 252); x.fillText('Raspberry Lime Tea', 20, 274);
    x.fillStyle = '#f2e04a'; x.beginPath(); x.roundRect(20, 290, 50, 70, 10); x.fill(); x.fillStyle = '#111'; x.font = `14px ${F.label}`; x.fillText('Qty', 32, 310); x.font = `bold 32px ${F.label}`; x.fillText('2', 36, 348);
    x.fillStyle = '#c81e3a'; x.fillRect(90, 290, 40, 90); x.fillStyle = '#3ab84a'; x.fillRect(140, 300, 30, 80); x.fillStyle = '#333'; x.font = `16px ${F.label}`; ['BOH   5', 'Size  16 fl oz', 'UPC   0004418827'].forEach((t, i) => x.fillText(t, 186, 310 + i * 28));
    x.strokeStyle = '#1e6ad8'; x.lineWidth = 3; x.beginPath(); x.roundRect(30, 420, w - 60, 40, 20); x.stroke(); x.fillStyle = '#1e6ad8'; fitText(x, 'Item Unavailable', w / 2, 440, 200, 20, F.label);
    x.fillStyle = '#fff'; x.fillRect(0, h - 70, w, 70); x.fillStyle = '#555'; ['Select', 'Weigh', 'Review'].forEach((t, i) => fitText(x, t, 50 + i * 110, h - 22, 80, 16, F.label)); x.fillStyle = '#1e6ad8'; x.beginPath(); x.arc(286, h - 58, 12, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = `12px ${F.label}`; x.fillText('74', 279, h - 54); });
  rbox(0.085, 0.16, 0.022, 0.01, std({ color: '#1a1a1c', roughness: 0.5 }), 0, 0, 0, g);
  plane(0.072, 0.135, std({ map: scr, emissive: '#ffffff', emissiveMap: scr, emissiveIntensity: 0.8, roughness: 0.15 }), 0, 0.005, 0.0115, 0, g);
  rbox(0.07, 0.04, 0.03, 0.01, std({ color: '#c8401a' }), 0, 0.075, -0.01, g);   // the scan head
  return g;
}
// black folding tote (60 x 40 x 32 cm), perforated sides; optional groceries poking out, the counted sheet in a sleeve
const toteSide = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#18181a'; x.fillRect(0, 0, w, h); x.fillStyle = '#050505'; for (let j = 0; j < 4; j++) for (let i = 0; i < 12; i++) { x.beginPath(); x.ellipse(14 + i * 20, 20 + j * 28, 4, 9, 0, 0, 7); x.fill(); } x.fillStyle = '#2a2a2c'; x.fillRect(0, 0, w, 6); x.fillRect(0, h - 6, w, 6); });
const toteM = () => std({ map: toteSide, roughness: 0.55 });
function countSheet(loc) { return canvasT(256, 330, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = `bold 20px ${F.label}`; x.fillText('LOCATION', 20, 40); x.font = `28px ${F.hand}`; x.fillText(loc, 140, 42); x.font = `bold 18px ${F.label}`; x.fillText('COUNTED BY', 20, 94); x.font = `26px ${F.hand}`; x.fillText('R.K.', 150, 96); x.font = `bold 18px ${F.label}`; x.fillText('DATE', 20, 140); x.font = `24px ${F.hand}`; x.fillText('11/19', 150, 142);
  x.fillStyle = '#c81e1e'; x.font = `bold 22px ${F.label}`; x.fillText('DO NOT ADD', 50, 220); x.fillText('OR REMOVE', 54, 252); x.fillStyle = '#111'; x.font = `14px ${F.small}`; x.fillText('items in this location', 62, 284); }); }
export function makeFoldingTote(full = true, seed = 1, sheet = null) {
  const g = new THREE.Group(); g.name = 'folding_tote'; const W = 0.6, D = 0.4, H = 0.32, m = toteM(), dk = std({ color: '#141416' });
  box(W, 0.02, D, dk, 0, 0.01, 0, g); for (const s of [-1, 1]) { box(W, H, 0.012, m, 0, H / 2, s * (D / 2 - 0.006), g); const e = box(D, H, 0.012, m, s * (W / 2 - 0.006), H / 2, 0, g); e.rotation.y = Math.PI / 2; }
  for (const s of [-1, 1]) box(0.12, 0.04, 0.014, std({ color: '#050505' }), s * (W / 2 - 0.004), H - 0.05, 0, g).rotation.y = Math.PI / 2;
  if (full) { const r = rng(seed * 17); for (let i = 0; i < 10; i++) { const c = ['#e8402a', '#2a6ad8', '#f2c21a', '#f4f2ea', '#3ab84a', '#c83a8a', '#f08a1a'][Math.floor(r() * 7)]; if (r() < 0.5) cyl(0.035, 0.035, 0.18 + r() * 0.12, std({ color: c, roughness: 0.4 }), -0.22 + (i % 5) * 0.11, 0.12 + r() * 0.08, -0.1 + Math.floor(i / 5) * 0.2, g, 12); else box(0.1, 0.16 + r() * 0.12, 0.08, std({ color: c, roughness: 0.6 }), -0.22 + (i % 5) * 0.11, 0.12 + r() * 0.06, -0.1 + Math.floor(i / 5) * 0.2, g); } }
  if (sheet) plane(0.12, 0.155, std({ map: countSheet(sheet) }), 0.12, H / 2, D / 2 + 0.008, 0, g);
  if (full && r_(seed)) { const tag = std({ color: '#f2e04a' }); box(0.04, 0.04, 0.002, tag, -0.2, H - 0.06, D / 2 + 0.008, g); }
  return g;
}
function r_(seed) { return (seed * 7) % 3 === 0; }
function pallet(p, x, z) { const wood = std({ color: '#2a5ab8', roughness: 0.7 }); const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g); for (let i = 0; i < 7; i++) box(0.14, 0.02, 1.0, wood, -0.55 + i * 0.183, 0.135, 0, g); for (const zz of [-0.42, 0, 0.42]) box(1.2, 0.1, 0.1, wood, 0, 0.06, zz, g); return g; }
export function makeWrappedTotePallet(seed = 1) {
  const g = new THREE.Group(); g.name = 'wrapped_tote_pallet'; pallet(g, 0, 0);
  let n = 0; for (let k = 0; k < 6; k++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const t = makeFoldingTote(true, seed * 50 + n++, k === 3 && i === 1 && j === 1 ? 'S-4 / B2' : null); t.position.set(-0.3 + i * 0.6, 0.145 + k * 0.32, -0.21 + j * 0.42); g.add(t); }
  // the stretch wrap: a wobbly translucent sleeve with a few streaks, and a sheet slipped under it
  const geo = new THREE.CylinderGeometry(1, 1, 1.95, 4, 12, true, Math.PI / 4); geo.scale(0.9, 1, 0.66); const p = geo.attributes.position; const r = rng(seed); for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) * (1 + (r() - 0.5) * 0.04)); p.setZ(i, p.getZ(i) * (1 + (r() - 0.5) * 0.04)); } geo.computeVertexNormals();
  const wrapT = canvasT(256, 512, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; const rr = rng(4); for (let i = 0; i < 40; i++) { x.beginPath(); const y0 = rr() * h; x.moveTo(0, y0); x.bezierCurveTo(w * 0.3, y0 + (rr() - 0.5) * 60, w * 0.7, y0 + (rr() - 0.5) * 60, w, y0 + (rr() - 0.5) * 40); x.stroke(); } });
  const wrap = new THREE.Mesh(geo, phys({ map: wrapT, transparent: true, roughness: 0.15, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide })); wrap.position.y = 0.145 + 0.98; g.add(wrap);
  plane(0.18, 0.23, std({ map: countSheet('PICKUP 2 / B4') }), 0.0, 1.55, 0.43, 0, g).rotation.z = 0.05;
  g.userData.collider = [-0.62, 0.62, -0.5, 0.5];
  return g;
}
export function makeToteStacks() {
  const g = new THREE.Group(); g.name = 'tote_stacks'; pallet(g, 0, 0);
  const heights = [[6, 5], [5, 3]]; let n = 0;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const hgt = heights[i][j]; for (let k = 0; k < hgt; k++) { const t = makeFoldingTote(true, 700 + n++, k === hgt - 1 && j === 1 ? ['F-1 / A3', 'F-1 / A4', 'F-2 / A1', 'F-2 / A2'][i * 2 + j] : null); t.position.set(-0.3 + i * 0.6, 0.145 + k * 0.32, -0.21 + j * 0.42); g.add(t); } }
  g.userData.collider = [-0.62, 0.62, -0.5, 0.5];
  return g;
}

// ---- store fixtures ----------------------------------------------------------------------------------------------------
// an open multideck dairy case (no doors): a curved canopy, five lit shelves of yogurt/milk/cheese, a deep well
export function makeOpenDairyCase(L = 8, seed = 1) {
  const g = new THREE.Group(); g.name = 'open_dairy_case'; const D = 0.95, H = 2.1, body = std({ color: '#3a3c40', roughness: 0.5, metalness: 0.3 });
  box(L, H, 0.1, body, 0, H / 2, -D + 0.05, g); box(L, 0.6, D, body, 0, 0.3, -D / 2, g); box(L, 0.25, D * 0.6, std({ color: '#f4f4f2' }), 0, H - 0.05, -D * 0.7, g);
  const stock = canvasT(1024, 512, (x, w, h) => { const r = rng(seed); x.fillStyle = '#eef2f4'; x.fillRect(0, 0, w, h); for (let s = 0; s < 5; s++) { const y0 = s * 100 + 6; x.fillStyle = '#c8ccd0'; x.fillRect(0, y0 + 88, w, 6); let px = 0; while (px < w) { const cw = 14 + r() * 24, ch = 30 + r() * 50, c = ['#f4f4f0', '#2a6ad8', '#e8402a', '#f2c21a', '#8ad8f2', '#f28ab8', '#3ab84a', '#f08a1a'][Math.floor(r() * 8)]; x.fillStyle = c; x.fillRect(px, y0 + 88 - ch, cw - 2, ch); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, y0 + 88 - ch, cw - 2, 5); px += cw; } x.fillStyle = '#f2e04a'; for (let k = 0; k < 8; k++) x.fillRect(40 + k * 128, y0 + 90, 26, 10); } });
  stock.wrapS = THREE.RepeatWrapping; stock.repeat.set(L / 4, 1);
  const back = plane(L, 1.4, glow(stock, 0.35), 0, 1.3, -D + 0.12, 0, g); void back;
  for (let k = 0; k < 5; k++) { const sh = box(L, 0.02, 0.34 + k * 0.03, std({ color: '#d8dadc', metalness: 0.6 }), 0, 0.62 + k * 0.28, -D + 0.3 + k * 0.015, g); void sh; box(L, 0.04, 0.01, std({ color: '#f2e04a' }), 0, 0.6 + k * 0.28, -D + 0.47 + k * 0.03, g); }
  const tile = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.3), std({ color: '#fff', emissive: '#f0f8ff', emissiveIntensity: 1.5 })); tile.rotation.x = Math.PI / 2; tile.position.set(0, H - 0.18, -0.55); g.add(tile);
  // snack boxes stacked on top of the canopy
  const r = rng(seed + 9); let px = -L / 2 + 0.3; while (px < L / 2 - 0.4) { const bw = 0.4 + r() * 0.3, bh = 0.25 + r() * 0.2; const c = ['#f2c21a', '#e8402a', '#2a8ad8', '#3ab84a', '#c83a8a', '#f4f2ea'][Math.floor(r() * 6)]; box(bw, bh, 0.35, std({ color: c, roughness: 0.6 }), px + bw / 2, H + 0.07 + bh / 2, -0.75, g); if (r() < 0.5) box(bw * 0.8, bh * 0.8, 0.3, std({ color: ['#f2c21a', '#e8402a', '#2a8ad8'][Math.floor(r() * 3)] }), px + bw / 2, H + 0.07 + bh + bh * 0.4, -0.75, g); px += bw + 0.05; }
  // front: a chrome bumper + price strip
  box(L, 0.08, 0.06, std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.25 }), 0, 0.62, 0.0, g);
  const lt = new THREE.PointLight('#f0f8ff', 3, 5, 1.6); lt.position.set(0, 1.6, 0.4); g.add(lt);
  g.userData.collider = [-L / 2, L / 2, -D, 0.05];
  return g;
}
// a cube end display of drink cases (shrink-wrapped flats of cans), with a sign on a stick
export function makeDrinkCaseCube(seed = 1) {
  const g = new THREE.Group(); g.name = 'drink_case_cube'; const r = rng(seed);
  for (let k = 0; k < 4; k++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const c = ['#8ad8f2', '#f2f4f8', '#2a8ad8'][(k + i + j) % 3]; const t = canvasT(256, 128, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.fillStyle = '#1e3a8a'; fitText(x, ['FIZZ BRIGHT', 'COASTAL WATER', 'CLOUD SODA'][(k + i + j) % 3], w / 2, 50, w - 30, 40, F.heavy); x.fillStyle = '#e8402a'; fitText(x, '12 × 12 fl oz', w / 2, 100, w - 60, 24, F.label); }); box(0.4, 0.13, 0.27, [std({ color: c }), std({ color: c }), std({ color: c }), std({ color: c }), std({ map: t }), std({ map: t })], -0.2 + i * 0.4, 0.07 + k * 0.13, -0.135 + j * 0.27, g); }
  const st = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#f2e04a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e1e'; fitText(x, '3 for $12', w / 2, 70, w - 30, 60, F.heavy); x.fillStyle = '#111'; fitText(x, 'with card', w / 2, 130, w - 60, 26, F.label); });
  cyl(0.008, 0.008, 0.5, std({ color: '#c8ccd0', metalness: 0.8 }), 0.3, 0.75, 0.2, g, 8); plane(0.3, 0.19, std({ map: st, side: THREE.DoubleSide }), 0.3, 1.05, 0.2, 0, g);
  g.userData.collider = [-0.42, 0.42, -0.3, 0.3];
  return g;
}
// a basic gondola (two-sided shelving) with printed product faces
function gondola(L, seed) { const g = new THREE.Group(); const H = 1.7, D = 1.0; const body = std({ color: '#e8e8e4' }); box(L, H, 0.06, body, 0, H / 2, 0, g); box(L, 0.15, D, body, 0, 0.075, 0, g);
  for (const s of [-1, 1]) { const t = canvasT(1024, 512, (x, w, h) => { const r = rng(seed * 3 + s); x.fillStyle = '#e8e8e4'; x.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) { const y0 = k * 124 + 8; x.fillStyle = '#c8ccd0'; x.fillRect(0, y0 + 110, w, 8); let px = 0; while (px < w) { const cw = 24 + r() * 40, ch = 50 + r() * 50; x.fillStyle = ['#e8402a', '#2a6ad8', '#f2c21a', '#3ab84a', '#c83a8a', '#f08a1a', '#f4f2ea', '#5a2ab8'][Math.floor(r() * 8)]; x.fillRect(px, y0 + 110 - ch, cw - 3, ch); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(px + 4, y0 + 110 - ch + 10, cw - 11, 8); px += cw; } } }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(L / 3, 1);
    plane(L, 1.5, std({ map: t, roughness: 0.6 }), 0, 0.9, s * 0.42, s > 0 ? 0 : Math.PI, g); for (let k = 0; k < 4; k++) box(L, 0.025, 0.4, std({ color: '#d8dadc', metalness: 0.5 }), 0, 0.3 + k * 0.38, s * 0.24, g); }
  g.userData.collider = [-L / 2, L / 2, -D / 2, D / 2]; return g; }

export function makeHearthMarket() {
  const g = new THREE.Group(); g.name = 'hearth_market'; const cols = [], put = placer(g, cols);
  const W = 28, D = 22, H = 5.2, X0 = -W / 2, X1 = W / 2, Z0 = -D;
  const brick = std({ map: tex('i4_brick_tan', W / 2.2, H / 1.6), roughness: 0.9 });
  box(W + 0.4, H + 1, 0.2, brick, 0, (H + 1) / 2, Z0 - 0.1, g); for (const s of [-1, 1]) box(0.2, H + 1, D, std({ map: tex('i4_brick_tan', D / 2.2, H / 1.6), roughness: 0.9 }), s * (X1 + 0.1), (H + 1) / 2, -D / 2, g);
  box(W + 0.4, 0.2, D + 0.2, std({ color: '#3a3a3c' }), 0, H + 1.1, -D / 2, g);
  // inside: polished warm concrete floor, white ceiling with light panels; the blue wall + cream scroll mural above the dairy run
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), phys({ map: tex('lot_concrete', W / 4, D / 4), color: '#c8a078', roughness: 0.3, clearcoat: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -D / 2); fl.receiveShadow = true; g.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#d8d8d4' })); cl.rotation.x = Math.PI / 2; cl.position.set(0, H, -D / 2); g.add(cl);
  for (let i = -2; i <= 2; i++) for (let j = 1; j <= 4; j++) box(1.2, 0.05, 0.6, std({ color: '#fff', emissive: '#f8fbff', emissiveIntensity: 1.8 }), i * 5, H - 0.03, -j * 4.6, g);
  for (const [x, z] of [[-7, -6], [7, -6], [-7, -15], [7, -15]]) { const p = new THREE.PointLight('#f8f4ec', 22, 18, 1.4); p.position.set(x, H - 0.6, z); g.add(p); }
  const mural = canvasT(2048, 256, (x, w, h) => { x.fillStyle = '#3a5a9a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2ead0'; x.lineWidth = 6; x.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const cx = 180 + k * 340; x.beginPath(); x.moveTo(cx - 160, 150); x.bezierCurveTo(cx - 80, 60, cx, 220, cx + 40, 120); x.stroke(); x.beginPath(); x.arc(cx + 40, 100, 20, Math.PI * 0.5, Math.PI * 2.2); x.stroke(); x.beginPath(); x.moveTo(cx - 60, 130); x.bezierCurveTo(cx - 40, 80, cx + 10, 90, cx - 10, 70); x.stroke(); for (let l = 0; l < 3; l++) { x.beginPath(); x.ellipse(cx - 120 + l * 60, 110 - l * 10, 16, 7, -0.5, 0, 7); x.stroke(); } }
    x.fillStyle = '#f2ead0'; fitText(x, 'dairy  ·  fresh from nearby farms', w / 2, 220, 700, 36, F.script); });
  plane(16.4, 2.0, std({ map: mural, roughness: 0.85 }), X1 - 0.02, 3.45, -10, -Math.PI / 2, g);
  plane(D, 1.0, std({ color: '#3a5a9a' }), X1 - 0.03, 2.4, -D / 2, -Math.PI / 2, g);
  put(makeOpenDairyCase(16, 4), X1 - 1.05, -10, -Math.PI / 2);
  put(makeDrinkCaseCube(2), X1 - 0.6, -1.3, 0);
  // gondolas in the middle
  for (let i = 0; i < 3; i++) put(gondola(10, i + 1), -1.5, -6 - i * 4.2);
  // front: glass, doors, the sign
  const gl = new THREE.MeshPhysicalMaterial({ color: '#c8d8e0', transparent: true, opacity: 0.2, roughness: 0.04, depthWrite: false, side: THREE.DoubleSide });
  for (const [x0, x1] of [[X0 + 0.6, -1.6], [1.6, X1 - 0.6]]) { plane(x1 - x0, 3.2, gl, (x0 + x1) / 2, 1.6, 0, 0, g); box(x1 - x0, 0.4, 0.3, brick, (x0 + x1) / 2, 0.2, 0, g); box(x1 - x0, H - 3.2 + 1, 0.3, brick, (x0 + x1) / 2, 3.2 + (H + 1 - 3.2) / 2, 0, g); cols.push([x0, x1, -0.2, 0.2]); }
  for (const x of [X0 + 0.3, X1 - 0.3]) { box(0.6, H + 1, 0.3, brick, x, (H + 1) / 2, 0, g); cols.push([x - 0.3, x + 0.3, -0.2, 0.2]); }
  box(3.2, H - 2.8 + 1, 0.3, brick, 0, 2.8 + (H + 1 - 2.8) / 2, 0, g);
  for (const s of [-1, 1]) plane(1.5, 2.7, gl, s * 0.8, 1.35, 0.1, 0, g);
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#2a1e14'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2b84a'; fitText(x, 'Hearth Market', w / 2, 120, w - 160, 150, F.couture, { weight: 700 }); x.fillStyle = '#f4ead8'; fitText(x, 'groceries · deli · pickup', w / 2, 212, w - 360, 36, F.label, { spacing: 6 }); });
  box(11, 1.6, 0.2, glow(sg, 0.8), 0, H - 0.2, 0.25, g);
  // deli corner front-left: two little tables, the corn dogs on one
  for (const [x, z, food] of [[-11.5, -2.2, true], [-9.2, -2.2, false]]) { const t = new THREE.Group(); cyl(0.38, 0.38, 0.03, std({ map: tex('wood_floor', 0.4, 0.4) }), 0, 0.74, 0, t, 28); cyl(0.04, 0.04, 0.74, std({ color: '#2a2a2c', metalness: 0.6 }), 0, 0.37, 0, t, 10); cyl(0.25, 0.25, 0.02, std({ color: '#2a2a2c', metalness: 0.6 }), 0, 0.01, 0, t, 20); for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(s * 0.6, 0, 0); ch.rotation.y = s * Math.PI / 2; t.add(ch); box(0.4, 0.04, 0.4, std({ color: '#6a4a32' }), 0, 0.45, 0, ch); box(0.4, 0.4, 0.04, std({ color: '#6a4a32' }), 0, 0.68, -0.18, ch); for (const a of [-1, 1]) for (const b of [-1, 1]) box(0.03, 0.45, 0.03, std({ color: '#2a2a2c' }), a * 0.17, 0.225, b * 0.17, ch); }
    if (food) { const cd = makeCornDogTray(); cd.position.y = 0.755; cd.rotation.y = 0.4; t.add(cd); }
    t.userData.collider = [-0.8, 0.8, -0.4, 0.4]; put(t, x, z); }
  const deli = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'HOT DELI · CORN DOGS $3.49', w / 2, 66, w - 40, 54, F.heavy); }); plane(4, 1.0, glow(deli, 0.5), -10.4, 3.4, -4.6, 0, g);
  box(4.2, 1.1, 0.9, std({ color: '#5a3a22' }), -10.4, 0.55, -5.2, g); box(4.2, 0.05, 1.0, std({ color: '#e8e4dc' }), -10.4, 1.12, -5.2, g); plane(4.0, 0.6, phys({ color: '#fff', transparent: true, opacity: 0.2, depthWrite: false }), -10.4, 1.45, -4.75, 0, g); cols.push([-12.5, -8.3, -5.65, -4.75]);
  // online-pickup staging corner, back-left, behind a half wall with a sign
  const pw = std({ color: '#e8e4dc' }); box(0.15, 1.4, 6, pw, -7.2, 0.7, -18.5, g); box(5.5, 1.4, 0.15, pw, -9.95, 0.7, -15.5, g); cols.push([-7.3, -7.1, -21.5, -15.5], [-12.7, -7.2, -15.6, -15.4]);
  const ps = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#1e6ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'ONLINE PICKUP · STAFF ONLY', w / 2, 66, w - 40, 50, F.heavy); }); plane(3.6, 0.9, glow(ps, 0.5), -10.5, 3.2, -15.4, 0, g);
  put(makeWrappedTotePallet(3), -12.6, -20.6); put(makeToteStacks(), -10.9, -20.6); put(makeToteStacks(), -9.2, -20.6, 0.0);
  const cl1 = makeCaseLabelBox(5); put(cl1, -8.2, -17.0, -0.3); const cl2 = makeCaseLabelBox(6); cl2.scale.setScalar(1); put(cl2, -8.3, -16.9, 0.2, 0.4); cl2.userData.collider = null;
  const hs = makeHandheldScanner(); hs.position.set(-9.5, 0.145 + 0.32 * 6 + 0.02, -20.81); hs.rotation.set(-Math.PI / 2 + 0.05, 0, 0.3); g.add(hs);
  cols.push([X0 - 0.2, X0 + 0.1, Z0, 0], [X1 - 0.1, X1 + 0.2, Z0, 0], [X0, X1, Z0 - 0.2, Z0 + 0.1]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: -0.2 }, { minX: -1.55, maxX: 1.55, minZ: -0.4, maxZ: 0.7 }];
  return g;
}
