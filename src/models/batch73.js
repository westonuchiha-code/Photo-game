// Batch 73 (photos/batch73/): an old-town street row and a pocket park. All modelled; shop names, brands, signs and
// characters are made up.
//   makeGyudonBowl, makeSickle, makeOvergrownVending, makeCapsuleMachine, makeSandwichBoard, makeSitDownCab,
//   makeCornerShop ("Coconut Raft"), makeWoodIzakaya ("Tsurukame"), makeJunkBalconyShop, makeClubNovaFront,
//   makeDomeBurner, makeDomeShed, makeParkingKiosk, makeOldTownRow, makePocketPark
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { b83Mat } from './batch83.js';
import { b84Mat, makeStump, makeBarkTree } from './batch84.js';

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
const glow = (t, i = 1) => std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: i, roughness: 0.4 });
function rotRect([a, b, c0, c1], ry) { const q = Math.round(ry / (Math.PI / 2)) & 3; if (q === 0) return [a, b, c0, c1]; if (q === 2) return [-b, -a, -c1, -c0]; if (q === 1) return [c0, c1, -b, -a]; return [-c1, -c0, a, b]; }
function placer(g, cols) { return (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const r = rotRect(c, ry); cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; }; }
// a corrugated steel roll shutter (geometry ridges), optional paste-up posters
function shutter(w, h, color = '#a8acb0', posters = 0, seed = 1) {
  const g = new THREE.PlaneGeometry(w, h, 1, Math.round(h / 0.012)); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.01 * Math.sin(p.getY(i) * 2 * Math.PI / 0.07)); g.computeVertexNormals();
  const t = canvasT(512, 512, (x, cw, ch) => { const r = rng(seed); x.fillStyle = color; x.fillRect(0, 0, cw, ch); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(60,40,20,${r() * 0.15})`; x.fillRect(r() * cw, r() * ch, 6 + r() * 30, 2); }
    for (let k = 0; k < posters; k++) { const px = 30 + r() * (cw - 150), py = ch * 0.45 + r() * ch * 0.35, pc = ['#e8402a', '#f2c21a', '#2a6ad8', '#f4f2ea'][k % 4]; x.fillStyle = pc; x.fillRect(px, py, 90, 120); x.fillStyle = '#111'; fitText(x, ['LIVE!', '祭', 'SALE', '募集'][k % 4], px + 45, py + 50, 80, 40, k % 2 ? F.brush : F.heavy); x.fillRect(px + 10, py + 80, 70, 6); x.fillRect(px + 10, py + 94, 50, 6); } });
  const m = new THREE.Mesh(g, std({ map: t, metalness: 0.4, roughness: 0.55 })); m.receiveShadow = true; return m;
}

// ---- small things ---------------------------------------------------------------------------------------------------
export function makeGyudonBowl() {
  const g = new THREE.Group(); g.name = 'gyudon_bowl';
  const tray = rbox(0.42, 0.015, 0.32, 0.006, std({ color: '#141414', roughness: 0.3 }), 0, 0.0075, 0, g); void tray;
  const pr = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pr.push(new THREE.Vector2(0.045 + 0.085 * Math.sin(t * Math.PI / 2), 0.015 + t * 0.075)); } pr.push(new THREE.Vector2(0.126, 0.09));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pr, 40), phys({ color: '#121212', roughness: 0.25, clearcoat: 1, side: THREE.DoubleSide })); bowl.castShadow = true; g.add(bowl);
  cyl(0.045, 0.045, 0.015, std({ color: '#121212' }), 0, 0.0225, 0, g, 24);
  const rice = sphere(0.115, std({ color: '#f4f2ea', roughness: 0.9 }), 0, 0.055, 0, g, 24, 12); rice.scale.y = 0.35;
  const r = rng(73), beef = phys({ color: '#7a3a18', roughness: 0.35, clearcoat: 0.8 }), onion = phys({ color: '#d8a860', roughness: 0.3, clearcoat: 0.6, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.095; if (Math.cos(a) * d > 0.04 && Math.sin(a) * d < 0) continue;
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.03 + r() * 0.03, 0.004, 0.018 + r() * 0.012, 3, 1, 2), i % 5 ? beef : onion); const pp = s.geometry.attributes.position; for (let k = 0; k < pp.count; k++) pp.setY(k, pp.getY(k) + 0.004 * Math.sin(pp.getX(k) * 120 + i)); s.geometry.computeVertexNormals();
    s.position.set(Math.cos(a) * d, 0.088 + (0.095 - d) * 0.25 + r() * 0.01, Math.sin(a) * d); s.rotation.set((r() - 0.5) * 0.8, r() * 3, (r() - 0.5) * 0.8); g.add(s); }
  // greens on one side, the mayo mound with chili threads, a little pile of white rice exposed
  const green = std({ color: '#2a6a2a', roughness: 0.5 }); for (let i = 0; i < 6; i++) { const l = sphere(0.022, green, -0.05 + (i % 3) * 0.018, 0.1, -0.06 + Math.floor(i / 3) * 0.02, g, 8, 6); l.scale.set(1.4, 0.25, 0.7); l.rotation.y = i; }
  const mayo = new THREE.Group(); mayo.position.set(0.045, 0.105, -0.035); g.add(mayo); const mm = phys({ color: '#fbf6e8', roughness: 0.3, clearcoat: 0.5 }); for (let i = 0; i < 7; i++) sphere(0.016 - i * 0.0012, mm, Math.cos(i * 1.7) * 0.008, i * 0.006, Math.sin(i * 1.7) * 0.008, mayo, 10, 8);
  const chili = std({ color: '#d82a1a' }); for (let i = 0; i < 14; i++) { const a = r() * 6.28; rod(V(0.045 + Math.cos(a) * 0.01, 0.13, -0.035 + Math.sin(a) * 0.01), V(0.045 + Math.cos(a) * 0.035, 0.115 + r() * 0.02, -0.035 + Math.sin(a) * 0.035), 0.0007, chili, g, 3); }
  for (let i = 0; i < 10; i++) { const gr = sphere(0.004, std({ color: '#ffffff', roughness: 0.8 }), 0.06 + r() * 0.03, 0.085, 0.03 + r() * 0.03, g, 6, 4); gr.scale.set(1.6, 0.7, 0.7); }
  const lbl = canvasT(128, 48, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, '牛丼 大盛', w / 2, 26, w - 10, 30, F.brush); });
  const lb = plane(0.08, 0.03, std({ map: lbl, side: THREE.DoubleSide }), 0, 0.075, 0.122, 0, g); lb.rotation.x = -0.25;
  return g;
}
export function makeSickle() {
  const g = new THREE.Group(); g.name = 'rusty_sickle';
  const wood = std({ color: '#8a7a68', roughness: 0.95, map: tex('slat_wood', 0.3, 1) });
  const h = cyl(0.016, 0.018, 0.34, wood, 0, 0, 0, g, 12); h.rotation.z = Math.PI / 2; h.position.x = -0.17;
  cyl(0.02, 0.02, 0.03, std({ map: tex('rusty_paint', 0.3, 0.3), metalness: 0.5 }), 0.005, 0, 0, g, 12).rotation.z = Math.PI / 2;
  // blade: a crescent with a serrated inner edge, extruded thin
  const s = new THREE.Shape(); s.moveTo(0, -0.01); const N = 40, outer = [], inner = [];
  for (let i = 0; i <= N; i++) { const t = i / N, a = -0.2 + t * 2.3; outer.push([0.02 + Math.cos(a) * 0.17 + 0.0, Math.sin(a) * 0.17 + 0.03]); }
  for (let i = N; i >= 0; i--) { const t = i / N, a = -0.2 + t * 2.3, rr = 0.17 - 0.035 * Math.sin(t * Math.PI) - (i % 2 ? 0.004 : 0); inner.push([0.02 + Math.cos(a) * rr + 0.012, Math.sin(a) * rr + 0.022]); }
  s.moveTo(...outer[0]); for (const p of outer) s.lineTo(...p); for (const p of inner) s.lineTo(...p); s.closePath();
  const bm = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: false }), std({ map: tex('rusty_paint', 4, 4), color: '#c8784a', metalness: 0.5, roughness: 0.75 })); bm.rotation.x = -Math.PI / 2; bm.position.set(-0.17, 0.0, 0); bm.castShadow = true; g.add(bm);
  return g;
}
export function makeOvergrownVending() {
  const g = new THREE.Group(); g.name = 'overgrown_vending';
  const W = 1.0, D = 0.72, H = 1.83, yel = std({ color: '#f2c21a', roughness: 0.55 }), wht = std({ color: '#f0ece0' });
  const side = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a9a4a'; x.fillRect(0, h * 0.62, w, h * 0.38); x.fillStyle = '#e8402a'; x.beginPath(); x.ellipse(w / 2, h * 0.3, 90, 110, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; '缶らーめん'.split('').forEach((c, i) => fitText(x, c, w / 2, 110 + i * 42, 80, 40, F.brush)); x.fillStyle = 'rgba(90,60,20,0.35)'; for (let i = 0; i < 30; i++) x.fillRect((i * 37) % w, (i * 71) % h, 20, 4); });
  box(W, H, D, [std({ map: side }), std({ map: side }), yel, yel, wht, yel], 0, H / 2, 0, g);
  // the front: a window of canned drinks/ramen in three rows, a lit header, buttons, the coin unit, the drop slot
  const front = new THREE.Group(); front.position.z = D / 2; g.add(front);
  box(0.8, 0.95, 0.02, std({ color: '#e8e4d8' }), -0.05, 1.25, 0.01, front);
  plane(0.76, 0.9, phys({ color: '#ffffff', transparent: true, opacity: 0.18, roughness: 0.05 }), -0.05, 1.25, 0.06, 0, front);
  const cans = ['#e8402a', '#2a8ad8', '#f2f2ee', '#f2a8c8', '#3ab84a', '#f2c21a']; const r = rng(7);
  for (let row = 0; row < 3; row++) { box(0.76, 0.015, 0.06, std({ color: '#8a8c90', metalness: 0.6 }), -0.05, 0.86 + row * 0.3, 0.04, front);
    for (let i = 0; i < 8; i++) { const c = cyl(0.03, 0.03, 0.11, std({ color: cans[Math.floor(r() * 6)], metalness: 0.5, roughness: 0.3 }), -0.4 + i * 0.1, 0.93 + row * 0.3, 0.04, front, 12); void c; const pb = box(0.035, 0.018, 0.012, std({ color: '#f4f2ea', emissive: '#3a3a3a' }), -0.4 + i * 0.1, 0.87 + row * 0.3, 0.075, front); void pb; } }
  const hd = canvasT(512, 96, (x, w, h) => { x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'HOT & COLD · ラーメン缶', w / 2, 52, w - 30, 50, F.heavy); });
  plane(0.8, 0.14, glow(hd, 0.25), -0.05, 1.78, 0.02, 0, front);
  box(0.16, 0.5, 0.04, std({ color: '#c8ccd0', metalness: 0.6 }), 0.38, 1.25, 0.02, front); box(0.06, 0.02, 0.02, std({ color: '#222' }), 0.38, 1.4, 0.045, front);
  box(0.7, 0.2, 0.05, std({ color: '#2a2a2c' }), -0.05, 0.32, 0.025, front); plane(0.6, 0.12, std({ color: '#0a0a0a' }), -0.05, 0.32, 0.052, 0, front);
  // vines: tubes crawling up the front edge and over the top, leaves instanced along them; dry grass at the foot
  const vine = std({ color: '#5a4a32', roughness: 0.9 }), leafM = std({ color: '#3a7a2a', roughness: 0.6, side: THREE.DoubleSide });
  const curves = [[V(0.52, 0, 0.3), V(0.55, 0.6, 0.38), V(0.48, 1.2, 0.4), V(0.4, 1.7, 0.38), V(0.1, 1.86, 0.2), V(-0.3, 1.88, 0.0)], [V(-0.55, 0, 0.2), V(-0.52, 0.5, 0.37), V(-0.45, 1.0, 0.39), V(-0.2, 1.5, 0.39), V(0.15, 1.7, 0.4)], [V(0.5, 0, -0.3), V(0.52, 0.9, -0.36), V(0.5, 1.88, -0.1), V(0.2, 1.88, 0.2)]].map((p) => new THREE.CatmullRomCurve3(p));
  const leafPts = [];
  for (const c of curves) { g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.008, 5), vine)); for (let i = 0; i < 26; i++) { const p = c.getPoint(r()); leafPts.push(p); } }
  const lg = new THREE.PlaneGeometry(0.06, 0.08); lg.translate(0, 0.04, 0); const li = new THREE.InstancedMesh(lg, leafM, leafPts.length); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  leafPts.forEach((p, i) => { Q.setFromEuler(E.set(r() * 2 - 1, r() * 6, r() * 2 - 1)); const s = 0.7 + r() * 0.7; M.compose(p, Q, V(s, s, s)); li.setMatrixAt(i, M); }); g.add(li);
  const dry = std({ color: '#b8a070', roughness: 1, side: THREE.DoubleSide }); for (let i = 0; i < 40; i++) { const x0 = (r() - 0.5) * 1.6, z0 = 0.4 + r() * 0.5; rod(V(x0, 0, z0), V(x0 + (r() - 0.5) * 0.3, 0.3 + r() * 0.6, z0 + (r() - 0.5) * 0.3), 0.004, dry, g, 3); }
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2 + 0.1];
  return g;
}
export function makeCapsuleMachine(seed = 1) {
  const g = new THREE.Group(); g.name = 'capsule_machine';
  const W = 0.48, D = 0.5, r = rng(seed * 11);
  for (let k = 0; k < 2; k++) { const u = new THREE.Group(); u.position.y = k * 0.78; g.add(u);
    const col = ['#f4f2ee', '#e8402a', '#2a6ad8', '#f2c21a'][(seed + k) % 4];
    box(W, 0.4, D, std({ color: col, roughness: 0.4 }), 0, 0.2, 0, u); box(W, 0.04, D, std({ color: col }), 0, 0.76, 0, u);
    plane(W - 0.04, 0.34, phys({ color: '#fff', transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }), 0, 0.58, D / 2, 0, u);
    for (let i = 0; i < 16; i++) { const cx = (r() - 0.5) * (W - 0.12), cy = 0.45 + r() * 0.25, cz = (r() - 0.5) * (D - 0.15); const top = sphere(0.035, std({ color: ['#e8402a', '#2a8ad8', '#f2c21a', '#f28ab8', '#3ab84a'][i % 5], roughness: 0.3 }), cx, cy, cz, u, 10, 6); top.scale.y = 1; }
    const card = canvasT(256, 192, (x, w, h) => { x.fillStyle = ['#ffe8f4', '#e8f4ff', '#fff4d8', '#e8ffe8'][(seed + k) % 4]; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2a2a'; fitText(x, ['MINI SUSHI CATS', 'ROBO PALS', 'TINY RAMEN', 'DESK FROGS'][(seed + k) % 4], w / 2, 30, w - 20, 26, F.rounded, { weight: 700 }); for (let i = 0; i < 4; i++) { x.fillStyle = ['#f2a8c8', '#8ad8f2', '#f2c21a', '#a8e88a'][i]; x.beginPath(); x.arc(40 + i * 58, 100, 24, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(32 + i * 58, 94, 4, 4); x.fillRect(44 + i * 58, 94, 4, 4); } x.fillStyle = '#e8402a'; fitText(x, '¥300 ×3', w / 2, 168, w - 60, 30, F.heavy); });
    plane(W - 0.08, 0.17, std({ map: card }), 0, 0.29, D / 2 + 0.002, 0, u);
    const knob = cyl(0.05, 0.05, 0.03, std({ color: '#c8ccd0', metalness: 0.8 }), 0.0, 0.1, D / 2 + 0.015, u, 20); knob.rotation.x = Math.PI / 2; box(0.08, 0.016, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.1, D / 2 + 0.035, u);
    box(0.1, 0.06, 0.02, std({ color: '#2a2a2c' }), 0.15, 0.06, D / 2 + 0.01, u); }
  box(W, 0.04, D, std({ color: '#2a2a2c' }), 0, 0.02, 0, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2 + 0.05];
  return g;
}
export function makeSandwichBoard(kind = 'buysell') {
  const g = new THREE.Group(); g.name = 'sandwich_board';
  const t = canvasT(256, 512, (x, w, h) => { if (kind === 'buysell') { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2e04a'; fitText(x, '買取', w / 2, 90, w - 30, 110, F.brush); fitText(x, '販売', w / 2, 220, w - 30, 110, F.brush); x.fillStyle = '#fff'; fitText(x, 'BUY · SELL', w / 2, 310, w - 30, 40, F.heavy); fitText(x, 'games · figures · retro', w / 2, 360, w - 30, 24, F.label); fitText(x, '2F →', w / 2, 440, w - 60, 54, F.heavy); }
    else { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e4ab8'; fitText(x, 'PC PARTS', w / 2, 60, w - 30, 50, F.heavy); x.fillStyle = '#111'; ['GPU · SSD · RAM', 'cables 3 for ¥500', 'repairs inside'].forEach((l, i) => fitText(x, l, w / 2, 150 + i * 60, w - 30, 30, F.label)); x.fillStyle = '#e8402a'; fitText(x, 'OPEN', w / 2, 430, w - 60, 80, F.heavy); } });
  const m = std({ map: t, roughness: 0.5 }), frame = std({ color: '#2a2a2c', metalness: 0.5 });
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(0, 0, s * 0.18); p.rotation.x = s * 0.18; g.add(p); box(0.5, 1.0, 0.025, frame, 0, 0.5, 0, p); plane(0.44, 0.9, m, 0, 0.52, s * 0.0135, s > 0 ? 0 : Math.PI, p); }
  g.userData.collider = [-0.27, 0.27, -0.3, 0.3];
  return g;
}
// white sit-down video cabinet (the "candy" style): rounded white shell, tilted monitor, a control deck, a stool
export function makeSitDownCab(seed = 1) {
  const g = new THREE.Group(); g.name = 'sitdown_cab';
  const white = std({ color: '#f2f0ea', roughness: 0.35 }), blk = std({ color: '#141416' });
  rbox(0.7, 0.75, 0.75, 0.05, white, 0, 0.375, -0.2, g);
  const top = new THREE.Group(); top.position.set(0, 0.75, -0.25); top.rotation.x = -0.18; g.add(top);
  rbox(0.72, 0.7, 0.62, 0.08, white, 0, 0.35, -0.05, top); box(0.6, 0.48, 0.02, blk, 0, 0.38, 0.27, top);
  const sc = canvasT(320, 240, (x, w, h) => { const r = rng(seed); x.fillStyle = ['#0a1a3a', '#1a0a2a', '#0a2a1a'][seed % 3]; x.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { x.fillStyle = ['#f2c21a', '#e8402a', '#3af2e8', '#fff'][i % 4]; x.fillRect(r() * w, r() * h, 6 + r() * 30, 6 + r() * 20); } x.fillStyle = '#fff'; x.font = `20px ${F.led}`; x.fillText('INSERT COIN', 90, 225); x.fillText('HI 98450', 10, 20); });
  plane(0.56, 0.42, glow(sc, 0.9), 0, 0.38, 0.282, 0, top);
  const deck = new THREE.Group(); deck.position.set(0, 0.76, 0.2); deck.rotation.x = 0.12; g.add(deck); rbox(0.7, 0.06, 0.28, 0.02, white, 0, 0, 0, deck);
  cyl(0.009, 0.009, 0.07, blk, -0.17, 0.06, 0.02, deck, 8); sphere(0.022, std({ color: '#e8302a' }), -0.17, 0.1, 0.02, deck);
  ['#3ab84a', '#3ab84a', '#f2c21a', '#2a6ad8'].forEach((c, i) => cyl(0.018, 0.018, 0.02, std({ color: c }), 0.0 + (i % 3) * 0.06, 0.035, -0.02 + Math.floor(i / 3) * 0.06, deck, 14));
  const st = new THREE.Group(); st.position.set(0, 0, 0.75); g.add(st); cyl(0.17, 0.17, 0.08, std({ color: '#1a1a1c', roughness: 0.5 }), 0, 0.55, 0, st, 20); cyl(0.03, 0.03, 0.5, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.27, 0, st, 10); cyl(0.2, 0.2, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.01, 0, st, 20);
  g.userData.collider = [-0.37, 0.37, -0.6, 0.35];
  return g;
}

// ---- shopfronts (front face at local z = 0, building back to z = -D) ------------------------------------------------
export function makeCornerShop() {
  const g = new THREE.Group(); g.name = 'corner_shop_coconut_raft';
  const W = 8, D = 9, H = 6.4, cols = [];
  const brick = std({ map: tex('i4_brick_red', W / 2.2, 1.2), roughness: 0.9 }), yellow = std({ color: '#f2c21a', roughness: 0.85 });
  // the yellow side wall faces the street corner on the right (+x) and carries the mural
  const mural = canvasT(1024, 768, (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h);
    // an original mural: a grinning cartoon coconut with sunglasses paddling a raft, splashes, palm leaves
    x.fillStyle = '#2a8ad8'; x.beginPath(); x.ellipse(w * 0.5, h * 0.78, w * 0.42, h * 0.12, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(w * 0.12 + i * 95, h * 0.7, 22, Math.PI, 0); x.fill(); }
    x.fillStyle = '#8a5a2a'; x.fillRect(w * 0.25, h * 0.62, w * 0.5, 50); x.fillStyle = '#6a4220'; for (let i = 0; i < 6; i++) x.fillRect(w * 0.25 + i * 85, h * 0.62, 8, 50);
    x.fillStyle = '#6a3a1a'; x.beginPath(); x.arc(w * 0.5, h * 0.4, 170, 0, 7); x.fill(); x.fillStyle = '#f4ead8'; x.beginPath(); x.arc(w * 0.5, h * 0.44, 130, 0.1, Math.PI - 0.1); x.fill();
    x.fillStyle = '#111'; x.fillRect(w * 0.5 - 140, h * 0.3, 280, 50); x.beginPath(); x.arc(w * 0.5 - 70, h * 0.36, 55, 0, Math.PI); x.arc(w * 0.5 + 70, h * 0.36, 55, 0, Math.PI); x.fill();
    x.strokeStyle = '#111'; x.lineWidth = 12; x.beginPath(); x.arc(w * 0.5, h * 0.45, 80, 0.3, Math.PI - 0.3); x.stroke();
    x.strokeStyle = '#6a4220'; x.lineWidth = 16; x.beginPath(); x.moveTo(w * 0.75, h * 0.25); x.lineTo(w * 0.85, h * 0.8); x.stroke(); x.fillStyle = '#6a4220'; x.beginPath(); x.ellipse(w * 0.86, h * 0.82, 30, 60, -0.2, 0, 7); x.fill();
    x.fillStyle = '#2a8a3a'; for (let i = 0; i < 7; i++) { x.save(); x.translate(80, 60); x.rotate(i * 0.35); x.beginPath(); x.ellipse(110, 0, 120, 28, 0, 0, 7); x.fill(); x.restore(); }
    x.fillStyle = '#e8402a'; x.font = `64px ${F.marker}`; x.fillText('ride the wave!', w * 0.52, h * 0.15); });
  box(0.3, H, D, [std({ map: mural, roughness: 0.85 }), yellow, yellow, yellow, yellow, yellow], W / 2 - 0.15, H / 2, -D / 2, g);
  box(0.3, H, D, std({ color: '#d8d0c0' }), -W / 2 + 0.15, H / 2, -D / 2, g); box(W, H, 0.3, std({ color: '#d8d0c0' }), 0, H / 2, -D + 0.15, g); box(W, 0.3, D, std({ color: '#3a3a3c' }), 0, H, -D / 2, g);
  // brick ground floor front with two big windows and a door, the green painted fascia with hand lettering
  box(W, 0.9, 0.3, brick, 0, 0.45, -0.15, g); for (const x of [-W / 2 + 0.4, -0.9, 0.9, W / 2 - 0.4]) box(0.5, 2.8, 0.3, brick, x, 1.4, -0.15, g);
  const gl = new THREE.MeshPhysicalMaterial({ color: '#b8c8d0', transparent: true, opacity: 0.25, roughness: 0.04, depthWrite: false });
  for (const x of [-2.4, 2.4]) { plane(2.6, 1.9, gl, x, 1.85, -0.1, 0, g); box(2.6, 0.06, 0.12, std({ color: '#f4f2ee' }), x, 2.8, -0.12, g); }
  box(1.2, 2.2, 0.06, std({ color: '#2a5a3a' }), 0, 1.1, -0.2, g); plane(0.8, 1.2, gl, 0, 1.4, -0.16, 0, g);
  const fas = canvasT(1024, 192, (x, w, h) => { x.fillStyle = '#1e6a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c21a'; x.lineWidth = 6; x.strokeRect(12, 12, w - 24, h - 24); x.fillStyle = '#f2c21a'; fitText(x, 'coconut raft', w / 2, 100, w - 120, 130, F.bubbly); x.fillStyle = '#f4f2ee'; fitText(x, 'vintage · surf · tees', w / 2, 168, w - 300, 26, F.hand); });
  const fb = box(W + 0.1, 1.0, 0.5, [std({ color: '#1e6a3a' }), std({ color: '#1e6a3a' }), std({ color: '#1e6a3a' }), std({ color: '#1e6a3a' }), std({ map: fas }), std({ color: '#1e6a3a' })], 0, 3.3, 0.1, g); fb.rotation.x = 0.0;
  // upper floor: stucco with two windows and a grille
  box(W, H - 3.8, 0.3, std({ map: tex('tx_stucco', 3, 1), color: '#f4e8d8' }), 0, 3.8 + (H - 3.8) / 2, -0.15, g);
  for (const x of [-2, 2]) { plane(1.4, 1.1, std({ color: '#2a3038', roughness: 0.1, metalness: 0.3 }), x, 5.0, 0.005, 0, g); for (let i = 0; i < 6; i++) box(0.02, 1.1, 0.03, std({ color: '#3a3c40', metalness: 0.6 }), x - 0.6 + i * 0.24, 5.0, 0.05, g); }
  // the street pole with its hanging banner (made-up street fair)
  const pole = std({ color: '#2a6a3a', metalness: 0.4 }); cyl(0.07, 0.08, 6.5, pole, W / 2 + 1.2, 3.25, 1.5, g, 14); rod(V(W / 2 + 1.2, 5.6, 1.5), V(W / 2 + 0.2, 5.6, 1.5), 0.025, pole, g);
  const bn = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'SHIMO', w / 2, 70, w - 40, 60, F.heavy); fitText(x, 'STREET', w / 2, 130, w - 40, 50, F.heavy); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(w / 2, 280, 80, 0, 7); x.fill(); x.fillStyle = '#e8402a'; fitText(x, '春', w / 2, 284, 120, 110, F.brush); x.fillStyle = '#fff'; fitText(x, 'spring market', w / 2, 420, w - 30, 34, F.hand); fitText(x, 'every weekend', w / 2, 470, w - 30, 28, F.label); });
  plane(0.9, 1.8, std({ map: bn, side: THREE.DoubleSide }), W / 2 + 0.7, 4.65, 1.5, 0, g);
  cols.push([-W / 2, W / 2, -D, 0], [W / 2 + 1.1, W / 2 + 1.3, 1.4, 1.6]);
  g.userData.colliders = cols;
  return g;
}
export function makeWoodIzakaya() {
  const g = new THREE.Group(); g.name = 'wood_izakaya';
  const W = 10, D = 8, H = 3.6, dark = std({ color: '#3a2a1e', roughness: 0.75 }), cols = [];
  const slats = canvasT(512, 512, (x, w, h) => { x.fillStyle = '#3a2618'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 22) { x.fillStyle = `rgba(0,0,0,0.5)`; x.fillRect(i, 0, 3, h); x.fillStyle = 'rgba(255,220,170,0.05)'; x.fillRect(i + 5, 0, 8, h); } }); slats.wrapS = slats.wrapT = THREE.RepeatWrapping; slats.repeat.set(W / 2, 1.5);
  box(W, H + 1.8, D, std({ map: slats, roughness: 0.8 }), 0, (H + 1.8) / 2, -D / 2 - 0.25, g);
  // eave + roof band, the name board
  box(W + 0.4, 0.2, 1.0, dark, 0, H + 0.1, 0.1, g); box(W + 0.4, 0.6, 0.2, std({ color: '#2a2622' }), 0, H + 0.5, 0.5, g);
  const nb = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#c8a878'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a1a10'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#1a1210'; fitText(x, '鶴亀', w / 2, 86, w - 200, 120, F.brush); });
  box(1.8, 0.56, 0.08, std({ map: nb }), -0.6, 3.1, 0.06, g);
  // two lattice sliding doors with a short noren, latticed windows, a plain wooden door at the left
  const lat = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#f2ead8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a2618'; x.lineWidth = 7; for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j <= h; j += 64) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } });
  const latM = std({ map: lat, emissive: '#ffd8a0', emissiveMap: lat, emissiveIntensity: 0.35 });
  for (const x of [-1.2, 0.0]) { box(1.2, 2.2, 0.06, dark, x, 1.1, 0.0, g); plane(1.04, 2.0, latM, x, 1.1, 0.035, 0, g); }
  const nor = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#1e2a4a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.4)'; for (let i = 1; i < 4; i++) x.fillRect(i * w / 4 - 2, 50, 4, h); x.fillStyle = '#f4f2ea'; fitText(x, '酒処 鶴亀', w / 2, 120, w - 60, 90, F.brush); });
  plane(2.4, 0.7, std({ map: nor, side: THREE.DoubleSide, roughness: 0.9 }), -0.6, 2.45, 0.15, 0, g);
  for (const x of [2.4, 3.9]) { box(1.3, 1.5, 0.06, dark, x, 1.6, 0.0, g); plane(1.15, 1.35, latM, x, 1.6, 0.035, 0, g); }
  box(1.0, 2.1, 0.08, std({ map: tex('slat_wood', 1, 2), color: '#8a6a4a' }), -4.2, 1.05, 0.0, g); cyl(0.02, 0.02, 0.1, std({ color: '#c8a03a', metalness: 0.8 }), -3.8, 1.0, 0.07, g, 8).rotation.x = Math.PI / 2;
  // the red paper lantern on a bracket by the door
  const lp = []; for (let i = 0; i <= 14; i++) { const t = i / 14; lp.push(new THREE.Vector2(0.06 + 0.22 * Math.sin(Math.PI * (0.1 + t * 0.8)), t * 0.75)); }
  const ln = new THREE.Mesh(new THREE.LatheGeometry(lp, 24), std({ map: canvasT(512, 256, (x, w, h) => { x.fillStyle = '#d8261e'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 10) x.fillRect(0, y, w, 2); x.fillStyle = '#141414'; x.font = `90px ${F.brush}`; x.textAlign = 'center'; x.fillText('酒', 128, 160); x.fillText('酒', 384, 160); }), emissive: '#ff4020', emissiveIntensity: 0.5, side: THREE.DoubleSide }));
  ln.position.set(-2.55, 1.9, 0.5); g.add(ln); for (const y of [1.9, 2.65]) cyl(0.08, 0.08, 0.05, std({ color: '#141414' }), -2.55, y, 0.5, g, 16); rod(V(-2.55, 2.65, 0.5), V(-2.55, 2.9, 0.1), 0.015, std({ color: '#141414' }), g);
  const lnl = new THREE.PointLight('#ff6a3a', 2.2, 5, 1.6); lnl.position.set(-2.55, 2.2, 0.8); g.add(lnl);
  // sake barrels (komodaru): straw-wrapped drums with a printed made-up brand, stacked 3 + 2
  const straw = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(140,110,60,0.5)'; x.lineWidth = 2; for (let i = 0; i < h; i += 5) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i + 2); x.stroke(); } x.fillStyle = '#c81e28'; x.fillRect(0, 20, w, 14); x.fillRect(0, h - 34, w, 14); x.fillStyle = '#141414'; fitText(x, '白鶴峰', w * 0.25, h / 2 + 10, 160, 90, F.brush); x.fillStyle = '#1e3a8a'; x.beginPath(); x.arc(w * 0.7, h / 2, 50, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, '吟', w * 0.7, h / 2 + 4, 70, 60, F.brush); });
  const bm = std({ map: straw, roughness: 0.95 });
  for (const [x, y] of [[-4.4, 0.25], [-3.85, 0.25], [-3.3, 0.25], [-4.12, 0.75], [-3.57, 0.75]]) { const b = cyl(0.27, 0.27, 0.5, bm, x, y, 0.55, g, 24); void b; cyl(0.28, 0.28, 0.06, std({ color: '#2a2a2a' }), x, y + 0.22, 0.55, g, 24); }
  cols.push([-4.75, -2.95, 0.25, 0.85]);
  // posters on the slats, an outdoor AC unit, a drinks vending machine at the right end
  const poster = (t1, t2, col, seed) => canvasT(256, 360, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, t1, w / 2, 80, w - 30, 70, F.brush); x.fillStyle = '#111'; x.fillRect(20, 140, w - 40, 120); x.fillStyle = '#f2c21a'; fitText(x, t2, w / 2, 310, w - 30, 36, F.heavy); });
  plane(0.42, 0.6, std({ map: poster('生ビール', '¥380', '#c81e28') }), 1.55, 1.8, 0.01, 0, g); plane(0.42, 0.6, std({ map: poster('焼鳥', 'set ¥980', '#1e3a8a') }), 4.75, 1.5, 0.01, 0, g);
  const ac = new THREE.Group(); ac.position.set(3.2, 0, 0.35); g.add(ac); box(0.8, 0.6, 0.3, std({ color: '#e8e8e2' }), 0, 0.3, 0, ac); const fan = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), std({ map: canvasT(128, 128, (x, w, h) => { x.fillStyle = '#d8d8d2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#555'; x.lineWidth = 3; for (let r = 10; r < 64; r += 8) { x.beginPath(); x.arc(64, 64, r, 0, 7); x.stroke(); } }) })); fan.position.set(-0.1, 0.3, 0.151); ac.add(fan); cols.push([2.8, 3.6, 0.2, 0.5]);
  const vm = new THREE.Group(); vm.position.set(W / 2 - 0.55, 0, 0.4); g.add(vm);
  box(1.0, 1.83, 0.72, std({ color: '#f4f4f0', roughness: 0.4 }), 0, 0.915, 0, vm);
  const vf = canvasT(256, 480, (x, w, h) => { x.fillStyle = '#2a6ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f2ea'; x.fillRect(16, 40, w - 32, 260); const c = ['#e8402a', '#3ab84a', '#f2c21a', '#111', '#2a8ad8', '#f2f2ee']; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { x.fillStyle = c[(i + r * 2) % 6]; x.fillRect(26 + i * 36, 54 + r * 84, 24, 56); x.fillStyle = '#c8261e'; x.fillRect(26 + i * 36, 116 + r * 84, 24, 8); } x.fillStyle = '#fff'; fitText(x, 'つめた〜い', w / 2, 22, w - 40, 26, F.rounded); x.fillStyle = '#111'; x.fillRect(40, 380, 176, 60); });
  plane(0.92, 1.72, glow(vf, 0.45), 0, 0.92, 0.361, 0, vm); cols.push([W / 2 - 1.05, W / 2 - 0.05, 0.04, 0.76]);
  cols.push([-W / 2, W / 2, -D - 0.25, -0.03]);
  g.userData.colliders = cols;
  return g;
}
export function makeJunkBalconyShop() {
  const g = new THREE.Group(); g.name = 'junk_balcony_shop';
  const W = 7, D = 7, cols = [], r = rng(73);
  const tile = std({ map: canvasT(256, 256, (x, w, h) => { x.fillStyle = '#e8e4da'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b8b4aa'; x.lineWidth = 2; for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }), roughness: 0.6 });
  box(W, 3.0, D, tile, 0, 1.5, -D / 2 - 0.2, g);
  box(W, 3.0, D, std({ map: tex('slat_wood', 3, 1), color: '#6a5040' }), 0, 4.6, -D / 2 - 1.0, g);
  // ground floor: two shutters with posters, a yellow-tape-striped pipe
  for (const [x, w] of [[-1.7, 3.0], [1.7, 3.0]]) { const s = shutter(w, 2.5, '#a8aaa8', 2, Math.round(x * 10)); s.position.set(x, 1.3, 0.01); g.add(s); box(w, 0.25, 0.25, std({ color: '#5a5c60', metalness: 0.6 }), x, 2.65, 0.05, g); }
  const stripe = canvasT(64, 512, (x, w, h) => { for (let i = 0; i < h; i += 32) { x.fillStyle = (i / 32) % 2 ? '#111' : '#f2c21a'; x.beginPath(); x.moveTo(0, i); x.lineTo(w, i + 16); x.lineTo(w, i + 48); x.lineTo(0, i + 32); x.fill(); } });
  const pp = cyl(0.05, 0.05, 2.9, std({ map: stripe }), -3.35, 1.45, 0.15, g, 12); pp.rotation.z = 0.12;
  // eave with tile roof (a row of half-cylinder tiles), the balcony on brackets
  box(W + 0.4, 0.15, 1.6, std({ color: '#3a2a20' }), 0, 3.05, 0.4, g);
  const tm = std({ color: '#4a4a4c', roughness: 0.6, metalness: 0.2 }); for (let i = 0; i < 26; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 10, 1, true, 0, Math.PI), tm); t.rotation.x = Math.PI / 2 - 0.35; t.rotation.z = 0; t.position.set(-W / 2 - 0.1 + i * 0.28, 6.4, 0.2); g.add(t); }
  box(W + 0.4, 0.15, 1.6, std({ color: '#3a2a20' }), 0, 6.15, 0.2, g);
  const BZ = 0.1; box(W + 0.2, 0.12, 1.4, std({ color: '#5a4030' }), 0, 3.2, BZ, g);
  const rail = std({ color: '#3a2418' }); box(W + 0.2, 0.08, 0.08, rail, 0, 4.1, BZ + 0.66, g); for (let i = 0; i <= 28; i++) box(0.04, 0.85, 0.04, rail, -W / 2 - 0.1 + i * (W + 0.2) / 28, 3.68, BZ + 0.66, g);
  // the junk on the balcony and hung on the wall above it
  const bal = new THREE.Group(); bal.position.set(0, 3.26, BZ); g.add(bal);
  const iron = std({ color: '#3a2a20', roughness: 0.7, metalness: 0.4 }), woodM = std({ color: '#7a5030', roughness: 0.8 });
  const wheel = (x, y, z, rr) => { const w = new THREE.Group(); w.position.set(x, y, z); bal.add(w); w.add(new THREE.Mesh(new THREE.TorusGeometry(rr, 0.035, 8, 32), iron)); cyl(0.08, 0.08, 0.12, woodM, 0, 0, 0, w, 12).rotation.x = Math.PI / 2; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; rod(V(0, 0, 0), V(Math.cos(a) * rr, Math.sin(a) * rr, 0), 0.016, woodM, w, 6); } return w; };
  wheel(-2.6, 0.45, 0.2, 0.42); wheel(-1.9, 0.45, 0.25, 0.42); wheel(-1.2, 0.42, 0.3, 0.4); wheel(2.6, 0.4, 0.3, 0.38);
  const enamel = (t1, bg, fg, x, y, w, h, z = -0.05) => { const t = canvasT(256, Math.round(256 * h / w), (cx, cw, ch) => { cx.fillStyle = bg; cx.fillRect(0, 0, cw, ch); cx.strokeStyle = fg; cx.lineWidth = 6; cx.strokeRect(6, 6, cw - 12, ch - 12); cx.fillStyle = fg; fitText(cx, t1, cw / 2, ch / 2 + 4, cw - 30, ch * 0.6, F.antique); cx.fillStyle = 'rgba(90,50,20,0.4)'; for (let i = 0; i < 12; i++) cx.fillRect(r() * cw, r() * ch, 8, 5); }); box(w, h, 0.02, std({ map: t, metalness: 0.3, roughness: 0.4 }), x, y, z, bal); };
  enamel('道具', '#f4f2ea', '#141414', 0.3, 0.35, 1.0, 0.36, 0.55); enamel('福助足袋', '#1e3a8a', '#f4f2ea', -2.4, 1.6, 0.4, 0.9, -0.55); enamel('氷', '#f4f2ea', '#c81e28', 1.5, 1.85, 0.5, 0.5, -0.55); enamel('ラムネ', '#c81e28', '#f4f2ea', 2.4, 1.2, 0.8, 0.3, -0.55);
  for (const [x, y, rr] of [[-0.5, 2.1, 0.22], [0.6, 1.55, 0.16], [-1.4, 1.9, 0.14]]) { const c = new THREE.Group(); c.position.set(x, y, -0.6); bal.add(c); cyl(rr, rr, 0.06, woodM, 0, 0, 0, c, 24).rotation.x = Math.PI / 2; const f = new THREE.Mesh(new THREE.CircleGeometry(rr * 0.85, 24), std({ map: canvasT(128, 128, (cx, w, h) => { cx.fillStyle = '#f2ead0'; cx.fillRect(0, 0, w, h); cx.fillStyle = '#141414'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; cx.fillRect(64 + Math.cos(a) * 50 - 2, 64 + Math.sin(a) * 50 - 2, 4, 4); } cx.lineWidth = 4; cx.strokeStyle = '#141414'; cx.beginPath(); cx.moveTo(64, 64); cx.lineTo(64, 26); cx.moveTo(64, 64); cx.lineTo(90, 70); cx.stroke(); }) })); f.position.z = 0.031; c.add(f); }
  // a pair of old lanterns, two masks, a lucky-cat-free folk statue (a raccoon-dog with a straw hat), a bicycle cart
  for (const x of [-0.9, 1.0]) { const l = new THREE.Group(); l.position.set(x, 1.15, -0.2); bal.add(l); cyl(0.1, 0.1, 0.3, std({ color: '#c8a03a', metalness: 0.6, transparent: true, opacity: 0.9 }), 0, 0, 0, l, 6); const tp = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.12, 6), iron); tp.position.y = 0.2; l.add(tp); }
  for (const [x, c] of [[1.8, '#f4f2ea'], [-0.1, '#c81e28']]) { const m = sphere(0.14, std({ color: c, roughness: 0.4 }), x, 1.2, -0.55, bal, 16, 12); m.scale.set(1, 1.2, 0.45); for (const s of [-1, 1]) sphere(0.022, std({ color: '#141414' }), x + s * 0.05, 1.25, -0.49, bal, 8, 6); }
  const tan = new THREE.Group(); tan.position.set(1.7, 0, 0.2); bal.add(tan); const tb = std({ color: '#7a5a3a', roughness: 0.6 }); const bd = sphere(0.24, tb, 0, 0.24, 0, tan, 16, 12); bd.scale.y = 1.1; sphere(0.25, std({ color: '#f2e8d8' }), 0, 0.22, 0.06, tan, 16, 12).scale.set(0.7, 0.8, 0.8); sphere(0.17, tb, 0, 0.6, 0.03, tan, 16, 12); const hat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.1, 18), std({ color: '#c8a860' })); hat.position.set(0, 0.76, 0); tan.add(hat); for (const s of [-1, 1]) sphere(0.03, std({ color: '#141414' }), s * 0.06, 0.63, 0.17, tan, 8, 6);
  const fig = new THREE.Group(); fig.position.set(-0.3, 0, 0.2); bal.add(fig); cyl(0.12, 0.15, 0.4, std({ color: '#2a6ad8', roughness: 0.4 }), 0, 0.2, 0, fig, 14); sphere(0.13, std({ color: '#f2dcc8' }), 0, 0.53, 0, fig); cyl(0.14, 0.14, 0.06, std({ color: '#c81e28' }), 0, 0.64, 0, fig, 16);
  for (let i = 0; i < 14; i++) { const k = box(0.15 + r() * 0.25, 0.1 + r() * 0.2, 0.15 + r() * 0.2, std({ color: ['#7a5030', '#3a3a3a', '#a88a5a', '#5a2a1a'][i % 4], roughness: 0.8 }), -3 + r() * 6, 0.1, -0.5 + r() * 0.4, bal); k.rotation.y = r(); }
  // the old 3-lamp traffic signal on the corner pole
  const sp = std({ color: '#5a5c60', metalness: 0.5 }); cyl(0.09, 0.1, 7.2, sp, W / 2 + 0.3, 3.6, 0.9, g, 12);
  const sig = new THREE.Group(); sig.position.set(W / 2 - 0.4, 5.9, 0.9); g.add(sig); box(1.2, 0.38, 0.25, std({ color: '#3a3c40', metalness: 0.4 }), 0, 0, 0, sig);
  ['#2a8a4a', '#c8a020', '#e81e1e'].forEach((c, i) => { const l = cyl(0.12, 0.12, 0.04, std({ color: c, emissive: c, emissiveIntensity: i === 2 ? 1.6 : 0.1 }), -0.38 + i * 0.38, 0, 0.13, sig, 20); l.rotation.x = Math.PI / 2; const v = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 16, 1, true, -Math.PI / 2, Math.PI), sp); v.rotation.x = Math.PI / 2; v.position.set(-0.38 + i * 0.38, 0.03, 0.2); sig.add(v); });
  rod(V(W / 2 + 0.3, 5.9, 0.9), V(W / 2 + 0.2, 5.9, 0.9), 0.04, sp, g);
  cols.push([-W / 2, W / 2, -D - 0.2, 0.0], [W / 2 + 0.18, W / 2 + 0.42, 0.78, 1.02]);
  g.userData.colliders = cols;
  return g;
}
// a two-bay arcade frontage: shutters down on the left, the right bay open onto a row of white sit-down cabinets;
// angled red sign panels over the top ("CLUB NOVA")
export function makeClubNovaFront() {
  const g = new THREE.Group(); g.name = 'club_nova';
  const W = 12, D = 9, H = 4.6, cols = [], put = placer(g, cols), red = std({ color: '#c81e28', roughness: 0.4 }), silver = std({ color: '#c8ccd0', metalness: 0.7, roughness: 0.3 });
  box(W, H + 2, 0.3, std({ color: '#d8d4cc' }), 0, (H + 2) / 2 + 2.6, -0.15, g).scale.y = 0.4;
  box(0.3, H + 2, D, std({ color: '#d8d4cc' }), -W / 2 + 0.15, (H + 2) / 2, -D / 2, g); box(0.3, H + 2, D, std({ color: '#d8d4cc' }), W / 2 - 0.15, (H + 2) / 2, -D / 2, g); box(W, H + 2, 0.3, std({ color: '#d8d4cc' }), 0, (H + 2) / 2, -D + 0.15, g); box(W, 0.3, D, std({ color: '#3a3a3c' }), 0, H + 2, -D / 2, g);
  box(0.5, 3.0, 0.3, std({ color: '#5a5c60' }), 0, 1.5, -0.15, g);
  // left bay: three shutters with made-up stencilled logos; right bay: open
  for (let i = 0; i < 2; i++) { const s = shutter(2.6, 2.9, '#c8ccce', 0, 30 + i); s.position.set(-4.4 + i * 2.75, 1.45, 0.0); g.add(s); }
  const logo = canvasT(512, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1e4ab8'; fitText(x, 'NOVA', w / 2, 140, w - 60, 160, F.heavy, { spacing: 6 }); });
  for (let i = 0; i < 2; i++) plane(1.6, 0.8, std({ map: logo, transparent: true }), -4.4 + i * 2.75, 1.6, 0.02, 0, g);
  // interior of the open bay: a floor, ceiling lights, a row of six sit-down cabinets back to back
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, D - 0.6), std({ color: '#c8b8a0', roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -D / 2); g.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, D - 0.6), std({ color: '#f4f2ee', emissive: '#ffffff', emissiveIntensity: 0.15 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, 3.0, -D / 2); g.add(cl);
  plane(W - 0.6, 3, std({ color: '#c8c4bc' }), 0, 1.5, -D + 0.31, 0, g);
  for (let i = 0; i < 5; i++) { put(makeSitDownCab(i + 1), 1.6 + i * 0.85, -4.3, 0); put(makeSitDownCab(i + 7), 1.6 + i * 0.85, -5.6, Math.PI); }
  const il = new THREE.PointLight('#f4f8ff', 12, 12, 1.4); il.position.set(3.2, 2.7, -4); g.add(il);
  // the sign: angled red panels with a silver frame, the name in tall white letters with a dark outline
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'CLUB NOVA', w / 2, 130, w - 120, 170, F.couture, { stroke: '#5a0a0a', weight: 700 }); x.fillStyle = '#f2c21a'; fitText(x, 'GAME · PRIZE · PHOTO', w / 2, 226, w - 300, 30, F.label, { spacing: 6 }); });
  for (const [x, ry, w] of [[-3.2, 0.18, 5.6], [3.2, -0.18, 5.6]]) { const p = new THREE.Group(); p.position.set(x, 3.9, 0.6); p.rotation.y = ry; g.add(p); box(w, 1.5, 0.15, red, 0, 0, 0, p); plane(w - 0.2, 1.3, glow(sg, 0.9), 0, 0, 0.08, 0, p); box(w + 0.1, 0.08, 0.2, silver, 0, 0.78, 0, p); box(w + 0.1, 0.08, 0.2, silver, 0, -0.78, 0, p); }
  const mid = new THREE.Group(); mid.position.set(0, 4.0, 1.1); g.add(mid); box(1.2, 2.0, 0.15, std({ color: '#f08a1a' }), 0, 0, 0, mid); box(1.0, 1.0, 0.18, std({ color: '#f2c21a' }), 0, 0.3, 0, mid);
  cols.push([-W / 2, -0.25, -0.3, 0.0], [-W / 2, -W / 2 + 0.3, -D, 0], [W / 2 - 0.3, W / 2, -D, 0], [-W / 2, W / 2, -D, -D + 0.3], [-W / 2, 0.25, -D, -0.3]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: 0.3, maxX: W / 2 - 0.35, minZ: -D + 0.35, maxZ: 0.2 }];
  return g;
}

// ---- park pieces ----------------------------------------------------------------------------------------------------
function domeGeo(r, h, hole = null) { let g = new THREE.SphereGeometry(r, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, h / r, 1);
  if (!hole) return g;
  // drop the triangles inside the doorway (|x| < hw, y < ht, z > 0) so the tunnel opens into the dome
  g = g.toNonIndexed(); const p = g.attributes.position, uv = g.attributes.uv, keepP = [], keepU = [];
  for (let i = 0; i < p.count; i += 3) { let cx = 0, cy = 0, cz = 0; for (let k = 0; k < 3; k++) { cx += p.getX(i + k) / 3; cy += p.getY(i + k) / 3; cz += p.getZ(i + k) / 3; }
    if (cz > 0 && Math.abs(cx) < hole.hw && cy < hole.ht) continue; for (let k = 0; k < 3; k++) { keepP.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); keepU.push(uv.getX(i + k), uv.getY(i + k)); } }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(keepP, 3)); out.setAttribute('uv', new THREE.Float32BufferAttribute(keepU, 2)); out.computeVertexNormals(); return out; }
const domeConcrete = () => std({ map: tex('tx_stucco', 3, 2), color: '#7aa898', roughness: 0.85 });
export function makeDomeBurner() {
  const g = new THREE.Group(); g.name = 'dome_burner'; const cols = [];
  const R = 2.4, Hh = 2.1, red = std({ color: '#c8302a', roughness: 0.55 });
  const dome = new THREE.Mesh(domeGeo(R, Hh, { hw: 0.62, ht: 1.85 }), Object.assign(domeConcrete(), { side: THREE.DoubleSide })); dome.castShadow = true; dome.receiveShadow = true; g.add(dome);
  cyl(R + 0.08, R + 0.12, 0.3, std({ color: '#8a8a84' }), 0, 0.15, 0, g, 40);
  // the red arched entry tunnel sticking out of the front (z+)
  const ash = new THREE.Shape(); const ow = 0.78, oh = 1.15; ash.moveTo(-ow, 0); ash.lineTo(-ow, oh); ash.absarc(0, oh, ow, Math.PI, 0, true); ash.lineTo(ow, 0); ash.lineTo(ow - 0.18, 0); ash.lineTo(ow - 0.18, oh); ash.absarc(0, oh, ow - 0.18, 0, Math.PI, false); ash.lineTo(-ow + 0.18, 0); ash.closePath();
  const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(ash, { depth: 1.6, bevelEnabled: false, curveSegments: 20 }), red); arch.position.set(0, 0, 0.6); arch.geometry = new THREE.ExtrudeGeometry(ash, { depth: R, bevelEnabled: false, curveSegments: 20 }); arch.castShadow = true; g.add(arch);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.0), std({ color: '#140e0a' })); inner.position.set(0, 1.0, 0.62); g.add(inner);
  const tf = new THREE.Mesh(new THREE.PlaneGeometry(1.3, R), std({ color: '#8a8478', roughness: 0.9 })); tf.rotation.x = -Math.PI / 2; tf.position.set(0, 0.02, 0.6 + R / 2); g.add(tf);
  const tl = new THREE.PointLight('#ffe0b0', 1.2, 3.5, 1.6); tl.position.set(0, 1.6, 1.3); g.add(tl);
  // paper pile inside: crumpled talisman papers, small wooden plaques, ropes
  const r = rng(5), paper = [std({ color: '#f4f2ea', roughness: 0.9 }), std({ color: '#e8e0c8' }), std({ color: '#d8c8b0' }), std({ color: '#c81e28' })];
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 + r() * 0.08, 0), paper[i % 4]); m.position.set((r() - 0.5) * 1.0, 0.05 + r() * 0.5, 0.75 + r() * 1.3); m.rotation.set(r() * 3, r() * 3, r() * 3); m.scale.y = 0.6; g.add(m); }
  for (let i = 0; i < 8; i++) { const p = box(0.1, 0.18, 0.015, std({ color: '#c8a878' }), (r() - 0.5) * 0.9, 0.35 + r() * 0.3, 1.2 + r() * 0.8, g); p.rotation.set(r(), r(), r()); }
  // two price boards on posts (made-up shrine name)
  const boardT = (lines, title) => canvasT(256, 640, (x, w, h) => { x.fillStyle = '#f8f6ee'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2a2a'; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#1e3a8a'; x.font = `34px ${F.brush}`; x.textAlign = 'center'; title.split('').forEach((c, i) => x.fillText(c, w - 40, 60 + i * 40)); x.fillStyle = '#141414'; x.font = `26px ${F.antique}`; lines.forEach((l, k) => l.split('').forEach((c, i) => x.fillText(c, w - 90 - k * 36, 60 + i * 32))); x.fillStyle = '#c81e28'; x.font = `22px ${F.antique}`; '八咫神社'.split('').forEach((c, i) => x.fillText(c, 30, h - 150 + i * 26)); });
  for (const [x, lines, title] of [[2.6, ['御神札縁起物', '人形', '一体千円', '一箱千円'], '御焚上料'], [-2.6, ['古いお札は', 'こちらへ', '毎月一日'], '古札の納め方']]) { const b = new THREE.Group(); b.position.set(x, 0, R + 0.4); b.rotation.y = x > 0 ? -0.25 : 0.25; g.add(b); for (const s of [-1, 1]) box(0.07, 1.4, 0.07, std({ color: '#5a3a22' }), s * 0.3, 0.7, -0.04, b); box(0.68, 1.6, 0.03, std({ map: boardT(lines, title) }), 0, 1.65, 0, b); cols.push([x - 0.4, x + 0.4, R + 0.25, R + 0.55]); }
  // a white sign over it on a red-framed board
  const tp = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#f8f6ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#141414'; fitText(x, '古札納所', w / 2, 90, w - 60, 110, F.brush); });
  cyl(0.06, 0.06, 3.6, red, 2.3, 1.8, R - 0.3, g, 10); box(1.8, 0.56, 0.06, std({ map: tp }), 1.4, 3.3, R - 0.3, g);
  cols.push([-R, R, -R, 0.7], [-0.85, -0.6, 0.6, R + 0.6], [0.6, 0.85, 0.6, R + 0.6]);
  g.userData.colliders = cols;
  return g;
}
export function makeDomeShed() {
  const g = new THREE.Group(); g.name = 'dome_shed';
  const R = 2.2, Hh = 1.9;
  const dome = new THREE.Mesh(domeGeo(R, Hh), domeConcrete()); dome.castShadow = true; dome.receiveShadow = true; g.add(dome);
  cyl(R + 0.1, R + 0.15, 0.35, std({ color: '#6a9888', roughness: 0.9 }), 0, 0.175, 0, g, 40);
  // the arched door frame stands proud of the dome at the front
  const fs = new THREE.Shape(); fs.moveTo(-0.6, 0); fs.lineTo(-0.6, 1.35); fs.absarc(0, 1.35, 0.6, Math.PI, 0, true); fs.lineTo(0.6, 0); fs.closePath();
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.8, bevelEnabled: false, curveSegments: 20 }), domeConcrete()); frame.position.set(0, 0, R - 0.95); frame.castShadow = true; g.add(frame);
  const ds = new THREE.Shape(); ds.moveTo(-0.45, 0); ds.lineTo(-0.45, 1.3); ds.absarc(0, 1.3, 0.45, Math.PI, 0, true); ds.lineTo(0.45, 0); ds.closePath();
  const plank = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#5a3a22'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 42) { x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(i, 0, 3, h); x.fillStyle = 'rgba(255,200,150,0.06)'; for (let j = 0; j < 30; j++) x.fillRect(i + 6, j * 18, 30, 1); } x.fillStyle = '#2a1a10'; x.fillRect(0, h * 0.3, w, 10); x.fillRect(0, h * 0.75, w, 10); });
  const dm = new THREE.Mesh(new THREE.ExtrudeGeometry(ds, { depth: 0.05, bevelEnabled: false, curveSegments: 16 }), std({ map: plank, roughness: 0.8 })); dm.material.map.repeat.set(1 / 0.9, 1 / 1.75); dm.position.set(0, 0.02, R - 0.18); g.add(dm);
  cyl(0.03, 0.03, 0.12, std({ color: '#2a2a2a', metalness: 0.7 }), 0.3, 1.0, R - 0.07, g, 8).rotation.x = Math.PI / 2;
  box(1.3, 0.18, 0.6, std({ color: '#a8a8a0' }), 0, 0.09, R + 0.1, g);
  const sk = makeSickle(); sk.position.set(-0.85, 0.23, R + 0.15); sk.rotation.set(0, 0.6, 0); g.add(sk);
  g.userData.collider = [-R, R, -R, R + 0.4];
  return g;
}
export function makeParkingKiosk() {
  const g = new THREE.Group(); g.name = 'parking_kiosk';
  const conc = std({ map: tex('lot_concrete', 1, 1), color: '#c8c4bc', roughness: 0.85 }), dark = std({ color: '#0a0a0c' });
  box(2.8, 0.25, 3.8, conc, 0, 2.75, -1.4, g);
  for (const s of [-1, 1]) box(0.25, 2.75, 3.6, conc, s * 1.3, 1.375, -1.4, g); box(2.8, 2.75, 0.25, conc, 0, 1.375, -3.2, g);
  box(2.4, 0.06, 0.12, std({ color: '#2a2a2c', metalness: 0.5 }), 0, 2.5, 0.38, g);
  // stair going down inside (into darkness), a lit ceiling strip
  for (let k = 0; k < 8; k++) box(2.3, 0.04, 0.3, std({ color: '#8a8884' }), 0, -0.15 * k + 0.02, -0.2 - k * 0.3, g);
  const pit = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 3.0), dark); pit.rotation.x = -Math.PI / 2; pit.position.set(0, -1.2, -1.6); g.add(pit);
  plane(2.35, 3.5, dark, 0, 0.6, -3.05, 0, g);
  box(1.8, 0.05, 0.12, std({ color: '#fff', emissive: '#f4f8ff', emissiveIntensity: 1.8 }), 0, 2.6, -1.0, g);
  const sgn = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, '地下駐車場入口', w / 2, 66, w - 40, 64, F.antique); fitText(x, 'UNDERGROUND PARKING  ·  P', w / 2, 128, w - 60, 30, F.label); });
  box(1.4, 0.44, 0.05, std({ map: sgn, emissive: '#ffffff', emissiveMap: sgn, emissiveIntensity: 0.4 }), 0, 3.1, 0.46, g);
  box(2.0, 0.08, 1.0, conc, 0, 0.04, 0.75, g); // the door mat apron
  g.userData.colliders = [[-1.45, -1.15, -3.3, 0.4], [1.15, 1.45, -3.3, 0.4], [-1.45, 1.45, -3.35, -3.05], [-1.2, 1.2, -3.0, -0.1]];
  return g;
}

// ---- the two lots ------------------------------------------------------------------------------------------------
// the shop row: a 74 m strip, fronts at z = 0, facing +z
export function makeOldTownRow() {
  const g = new THREE.Group(); g.name = 'old_town_row'; const cols = [], put = placer(g, cols); g.userData.areas = [];
  put(makeCornerShop(), 4.5, 0);
  put(makeWoodIzakaya(), 16.5, 0);
  // a little standing table outside the izakaya with a beef bowl on its tray
  const tb = new THREE.Group(); box(0.7, 0.04, 0.5, std({ color: '#5a3a22', roughness: 0.6 }), 0, 1.0, 0, tb); box(0.08, 1.0, 0.08, std({ color: '#2a2a2c', metalness: 0.5 }), 0, 0.5, 0, tb); box(0.5, 0.03, 0.4, std({ color: '#2a2a2c', metalness: 0.5 }), 0, 0.015, 0, tb);
  const gb = makeGyudonBowl(); gb.position.set(0.05, 1.02, 0); gb.rotation.y = 0.3; tb.add(gb); tb.userData.collider = [-0.36, 0.36, -0.26, 0.26];
  put(tb, 10.2, 1.0);
  put(makeJunkBalconyShop(), 28, 0);
  const vm = makeOvergrownVending(); put(vm, 33.5, -0.6, -0.1);
  const cn = put(makeClubNovaFront(), 42.5, 0); g.userData.areas.push(...cn.userData.areas.map((a) => ({ minX: a.minX + 42.5, maxX: a.maxX + 42.5, minZ: a.minZ, maxZ: a.maxZ })));
  // an electronics / hobby frontage: a plain shop box with a bright sign, capsule machines out front, sandwich boards
  const ex = new THREE.Group(); const W = 16, D = 8;
  box(W, 7, D, std({ map: tex('tx_stucco', 4, 2), color: '#e8e4dc' }), 0, 3.5, -D / 2, ex);
  const es = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2e04a'; fitText(x, 'DENKI LAND', w / 2, 110, w - 120, 150, F.heavy, { spacing: 4 }); x.fillStyle = '#fff'; fitText(x, 'games · figures · PC parts · retro · cards', w / 2, 210, w - 160, 36, F.label); });
  box(W - 1, 1.6, 0.25, glow(es, 0.7), 0, 5.4, 0.12, ex);
  const gl = new THREE.MeshPhysicalMaterial({ color: '#c8d8e0', transparent: true, opacity: 0.2, roughness: 0.04, depthWrite: false });
  plane(W - 2, 3.2, gl, 0, 1.6, 0.04, 0, ex); plane(W - 2, 3.2, std({ map: canvasT(512, 128, (x, w, h) => { const r = rng(4); x.fillStyle = '#3a3a40'; x.fillRect(0, 0, w, h); for (let i = 0; i < 80; i++) { x.fillStyle = ['#e8402a', '#2a8ad8', '#f2c21a', '#3ab84a', '#fff', '#c83ab8'][i % 6]; x.fillRect(r() * w, 10 + r() * (h - 30), 8 + r() * 14, 10 + r() * 16); } }), emissive: '#ffffff', emissiveIntensity: 0.2 }), 0, 1.6, 0.015, 0, ex);
  ex.userData.colliders = [[-W / 2, W / 2, -D, -0.02]];
  put(ex, 59, 0);
  for (let i = 0; i < 6; i++) put(makeCapsuleMachine(i + 1), 53.3 + i * 0.52, 0.42);
  put(makeSandwichBoard('buysell'), 63.6, 1.2, 0.2); put(makeSandwichBoard('pc'), 66.2, 1.0, -0.15);
  g.userData.colliders = cols;
  return g;
}
// the pocket park: gravel paths, pines, the dome burner, the dome shed, the parking kiosk; front at z = 0 facing -z
export function makePocketPark() {
  const g = new THREE.Group(); g.name = 'pocket_park'; const cols = [], put = placer(g, cols);
  const W = 40, D = 17;
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(W, D), b83Mat('b83_sandydirt', W / 1.2, D / 1.2)); /* item 83: sandy dirt with pebbles */ gr.rotation.x = -Math.PI / 2; gr.position.set(0, 0.015, D / 2); gr.receiveShadow = true; g.add(gr);
  const path = (x0, x1, z0, z1, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m); p.rotation.x = -Math.PI / 2; p.position.set((x0 + x1) / 2, 0.025, (z0 + z1) / 2); p.receiveShadow = true; g.add(p); };
  const dirt = b83Mat('b83_gravel', 2, 12) /* item 83: fine decomposed-granite gravel */, slabs = std({ map: tex('i5_paving', 1, 4), roughness: 0.85 });
  path(-1.5, 1.5, 0, D, dirt); path(-W / 2, W / 2, 7.5, 10, dirt); path(-15.4, -13.6, 10, 15.2, slabs);
  put(makeDomeBurner(), 9, 12.4, Math.PI);
  put(makeDomeShed(), -14.5, 13.4, Math.PI);
  put(makeParkingKiosk(), 15.5, 4.2, Math.PI);
  // pines: tall bare trunks with flat clumps of needles; low shrubs and a low stone edging along the paths
  const r = rng(73), bark = b84Mat('b84_bark_shaggy', 1, 6), needles = std({ color: '#2a4a2a', roughness: 0.9, flatShading: true });
  for (const [x, z, h] of [[-6, 3, 8], [-18, 4, 9], [4, 15, 9.5], [-8, 14.5, 7], [18, 13, 8.5], [-3, 12.5, 6]]) { const lean = (r() - 0.5) * 0.4; const top = V(x + lean * 2, h, z + lean); rod(V(x, 0, z), top, 0.18, bark, g, 10); for (let k = 0; k < 4; k++) { const c = sphere(1.6 - k * 0.2, needles, top.x + (r() - 0.5) * 2.4, h - 1.6 + k * 0.7, top.z + (r() - 0.5) * 2.0, g, 8, 5); c.scale.y = 0.35; } cols.push([x - 0.25, x + 0.25, z - 0.25, z + 0.25]); }
  for (let i = 0; i < 18; i++) { const x = -W / 2 + 1 + r() * (W - 2), z = 1 + r() * (D - 2); if (Math.abs(x) < 2.5 || (z > 7 && z < 10.5) || Math.hypot(x - 9, z - 12.4) < 3.5 || Math.hypot(x + 14.5, z - 13.4) < 3.2 || (x > 13 && x < 18 && z < 9)) continue; const s = sphere(0.5 + r() * 0.4, std({ color: '#3a5a2a', roughness: 0.9 }), x, 0.3, z, g, 10, 6); s.scale.y = 0.6; }
  put(makeStump(4), -4.5, 5.0); put(makeBarkTree('scored', 2, 6.5), 6.0, 4.6); put(makeBarkTree('split', 5, 5.5), -10.5, 9.0);   // item 84
  const edge = std({ color: '#9a9890' }); for (const s of [-1, 1]) box(0.15, 0.12, D, edge, s * 1.6, 0.06, D / 2, g);
  g.userData.colliders = cols;
  return g;
}
