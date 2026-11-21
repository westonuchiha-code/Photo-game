// Batch 76 (photos/batch76/): a dusty 70s kei car in a little garage (with a camp-stove breakfast), a walk-in freezer
// full of roll-cage carts, a reach-in cooler row with two doors patched in cardboard, a padlocked hasp. Plates,
// brands and store names are made up.
//   makeKeiCar, makeEggBaconPan, makeEggBaconSub, makeKeiGarage, makeCageCart, makeWalkInFreezer, makeHaspPadlock,
//   makeCardboardCoolerRow
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeKnobCabinet, makeTreadToolbox, makeScrewdriver, makeStickerCase, libMat82 } from './batch82.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 6) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rotRect([a, b, c0, c1], ry) { const q = Math.round(ry / (Math.PI / 2)) & 3; if (q === 0) return [a, b, c0, c1]; if (q === 2) return [-b, -a, -c1, -c0]; if (q === 1) return [c0, c1, -b, -a]; return [-c1, -c0, a, b]; }
function placer(g, cols) { return (o, x, z, ry = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); for (const c of (o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []))) { const r = rotRect(c, ry); cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; }; }

// ---- the kei car -----------------------------------------------------------------------------------------------------
// real 70s kei proportions: 2.99 m long, 1.295 m wide, 1.345 m tall, 2.0 m wheelbase, 12-inch wheels. The car points
// along +z (nose at +z). Dust: a grey film over the blue paint, finger doodles cut through it on the windscreen + bonnet
function dustT(base, doodle) { return canvasT(512, 512, (x, w, h) => { const r = rng(76); x.fillStyle = base; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(206,200,190,0.42)'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${170 + r() * 50},${165 + r() * 45},${150 + r() * 40},${r() * 0.35})`; x.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
  if (doodle) { x.globalCompositeOperation = 'destination-out'; x.strokeStyle = 'rgba(0,0,0,0.85)'; x.lineWidth = 9; x.lineCap = 'round'; doodle(x, w, h); x.globalCompositeOperation = 'source-over'; } }); }
export function makeKeiCar() {
  const g = new THREE.Group(); g.name = 'kei_car_dusty';
  const L = 2.99, W = 1.295, H = 1.345, WB = 2.0, WR = 0.27;
  const paint = std({ map: dustT('#4a78b8', (x, w, h) => { x.beginPath(); x.arc(160, 300, 60, 0.3, 5.5); x.stroke(); x.beginPath(); x.moveTo(300, 240); x.bezierCurveTo(340, 200, 380, 320, 420, 260); x.stroke(); x.beginPath(); x.moveTo(250, 380); x.lineTo(300, 340); x.lineTo(340, 390); x.stroke(); }), roughness: 0.85 });
  const paintPlain = std({ map: dustT('#4a78b8'), roughness: 0.85 });
  // body: a lower tub (rounded box) and a glasshouse on top, both slightly tapered
  const tub = new THREE.Mesh(new RoundedBoxGeometry(W, 0.62, L, 4, 0.12), [paintPlain, paintPlain, paint, paintPlain, paintPlain, paintPlain]); tub.position.y = 0.2 + 0.31; tub.castShadow = true; g.add(tub);
  // bonnet slopes down to the nose: a wedge on top of the tub front
  const cab = new THREE.Group(); cab.position.set(0, 0.82, -0.25); g.add(cab);
  const cabGeo = new RoundedBoxGeometry(W - 0.06, 0.52, 1.75, 4, 0.1); const cp = cabGeo.attributes.position; for (let i = 0; i < cp.count; i++) { const y = cp.getY(i), z = cp.getZ(i); if (y > 0) { cp.setX(i, cp.getX(i) * 0.9); if (z > 0) cp.setZ(i, z - 0.32); if (z < 0) cp.setZ(i, z + 0.08); } } cabGeo.computeVertexNormals();
  const glassDust = (doodle) => std({ map: dustT('#283038', doodle), roughness: 0.4, metalness: 0.2 });
  const cabM = new THREE.Mesh(cabGeo, [glassDust(), glassDust(), paintPlain, paintPlain, glassDust((x, w, h) => { // windscreen: a stick figure, a car, "lol"-style squiggle
      x.beginPath(); x.arc(120, 180, 24, 0, 7); x.moveTo(120, 204); x.lineTo(120, 290); x.moveTo(80, 240); x.lineTo(160, 240); x.moveTo(120, 290); x.lineTo(90, 340); x.moveTo(120, 290); x.lineTo(150, 340); x.stroke();
      x.beginPath(); x.moveTo(300, 260); x.bezierCurveTo(320, 170, 360, 300, 380, 200); x.bezierCurveTo(400, 150, 430, 280, 450, 220); x.stroke(); x.beginPath(); x.arc(380, 330, 40, Math.PI, 0); x.stroke(); }), glassDust()]);
  cabM.castShadow = true; cab.add(cabM);
  for (const s of [-1, 1]) { box(0.04, 0.5, 0.04, paintPlain, s * (W / 2 - 0.08), 0.0, 0.42, cab).rotation.x = -0.55; box(0.04, 0.5, 0.05, paintPlain, s * (W / 2 - 0.06), 0.0, -0.55, cab); }
  // front: honeycomb grille panel, round headlights in chrome rims, orange indicators, chrome bumper; plate
  const nose = L / 2;
  const grille = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#d8d4c8'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2a2a'; for (let j = 0; j < 5; j++) for (let i = 0; i < 26; i++) { x.beginPath(); const cx = 6 + i * 9.6 + (j % 2) * 4.8, cy = 10 + j * 17; for (let k = 0; k < 6; k++) x.lineTo(cx + Math.cos(k * Math.PI / 3) * 4, cy + Math.sin(k * Math.PI / 3) * 4); x.fill(); } x.fillStyle = 'rgba(200,190,170,0.5)'; x.fillRect(0, 0, w, h); });
  plane(0.72, 0.22, std({ map: grille, roughness: 0.6 }), 0, 0.62, nose + 0.002, 0, g);
  const chrome = std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.35 }), dustyChrome = std({ color: '#b8b4a8', metalness: 0.6, roughness: 0.6 });
  for (const s of [-1, 1]) { const rim = cyl(0.095, 0.095, 0.05, dustyChrome, s * 0.48, 0.62, nose - 0.005, g, 24); rim.rotation.x = Math.PI / 2; const lens = sphere(0.085, phys({ color: '#e8eef0', roughness: 0.25, transparent: true, opacity: 0.8 }), s * 0.48, 0.62, nose + 0.01, g, 20, 10); lens.scale.z = 0.35;
    const ind = box(0.12, 0.05, 0.03, std({ color: '#e88a2a', emissive: '#6a3a0a', emissiveIntensity: 0.3 }), s * 0.47, 0.34, nose + 0.01, g); void ind;
    // round mirrors on stalks out on the front wings
    rod(V(s * (W / 2 - 0.12), 0.83, nose - 0.45), V(s * (W / 2 + 0.02), 1.05, nose - 0.32), 0.008, chrome, g); const mr = cyl(0.06, 0.06, 0.015, chrome, s * (W / 2 + 0.03), 1.08, nose - 0.31, g, 18); mr.rotation.x = Math.PI / 2; mr.rotation.z = s * 0.3; }
  rbox(W + 0.02, 0.1, 0.08, 0.03, dustyChrome, 0, 0.33, nose + 0.02, g); rbox(W + 0.02, 0.1, 0.08, 0.03, dustyChrome, 0, 0.33, -nose - 0.02, g);
  const plate = canvasT(330, 165, (x, w, h) => { x.fillStyle = '#f2f0e4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a6a4a'; x.lineWidth = 5; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#2a6a4a'; fitText(x, '楡町 50 な', w / 2, 40, w - 40, 32, F.antique); fitText(x, '72-16', w / 2, 112, w - 40, 84, F.label, { weight: 700 }); x.fillStyle = 'rgba(200,190,170,0.45)'; x.fillRect(0, 0, w, h); });
  plane(0.33, 0.165, std({ map: plate }), 0, 0.42, nose + 0.065, 0, g); plane(0.33, 0.165, std({ map: plate }), 0, 0.48, -nose - 0.065, Math.PI, g);
  for (const s of [-1, 1]) { box(0.1, 0.12, 0.03, std({ color: '#c81e28', emissive: '#4a0008', emissiveIntensity: 0.3 }), s * 0.5, 0.6, -nose - 0.005, g); box(0.1, 0.06, 0.03, std({ color: '#e88a2a' }), s * 0.5, 0.48, -nose - 0.005, g); }
  // wheels: small tyres with plain steel hubcaps; dark arches
  for (const z of [WB / 2, -WB / 2]) for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(WR * 0.72, WR * 0.28, 10, 24), std({ color: '#1a1a1a', roughness: 0.85 })); t.rotation.y = Math.PI / 2; t.position.set(s * (W / 2 - 0.1), WR, z); g.add(t); const hc = cyl(WR * 0.5, WR * 0.5, 0.04, dustyChrome, s * (W / 2 - 0.07), WR, z, g, 20); hc.rotation.z = Math.PI / 2;
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(WR + 0.04, WR + 0.04, 0.02, 20, 1, false, 0, Math.PI), std({ color: '#0a0a0a' })); arch.rotation.set(0, 0, s * Math.PI / 2); arch.rotation.order = 'ZYX'; arch.position.set(s * (W / 2 + 0.001), WR + 0.02, z); g.add(arch); }
  // door lines + handles, a dusty interior silhouette
  for (const s of [-1, 1]) { box(0.005, 0.55, 0.005, std({ color: '#2a3a4a' }), s * (W / 2 + 0.001), 0.55, 0.1, g); box(0.02, 0.025, 0.1, chrome, s * (W / 2 + 0.01), 0.72, -0.15, g); }
  for (const z of [0.0, -0.75]) box(W - 0.3, 0.45, 0.4, std({ color: '#2a2a2c' }), 0, 0.85, z - 0.25, g);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.05, -L / 2 - 0.08, L / 2 + 0.08];
  return g;
}

// ---- breakfast --------------------------------------------------------------------------------------------------------
const eggM = () => std({ color: '#f2d24a', roughness: 0.55 }), eggW = () => std({ color: '#fbf6e0', roughness: 0.5 });
function scramble(p, cx, cz, rx, rz, n, seed, y = 0) { const r = rng(seed); const ye = eggM(), wh = eggW(), bacon = std({ color: '#7a2a1a', roughness: 0.5 }), crisp = std({ color: '#5a2a12' });
  for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()); const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.012 + r() * 0.01, 0), r() < 0.7 ? ye : (r() < 0.5 ? wh : (r() < 0.5 ? bacon : crisp))); m.position.set(cx + Math.cos(a) * d * rx, y + r() * 0.015, cz + Math.sin(a) * d * rz); m.scale.set(1.3, 0.6, 1); m.rotation.set(r() * 3, r() * 3, r() * 3); p.add(m); } }
function ketchup(p, pts, y) { const c = new THREE.CatmullRomCurve3(pts.map(([x, z], i) => V(x, y + (i % 2) * 0.004, z))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.0035, 5), phys({ color: '#c8140e', roughness: 0.2, clearcoat: 1 })); p.add(m); }
function subRoll(len = 0.24) { const g = new THREE.Group(); const crust = std({ color: '#e8c890', roughness: 0.8 }), crumb = std({ color: '#f4ead2', roughness: 0.95 });
  const r = sphere(0.045, crust, 0, 0.035, 0, g, 20, 12); r.scale.set(1, 0.8, len / 0.09); const inner = sphere(0.04, crumb, 0, 0.042, 0, g, 18, 10); inner.scale.set(0.7, 0.45, len / 0.09 * 0.95); return g; }
export function makeEggBaconPan() {
  const g = new THREE.Group(); g.name = 'egg_bacon_pan';
  const lp = []; for (let i = 0; i <= 10; i++) { const t = i / 10; lp.push(new THREE.Vector2(0.11 + 0.03 * t, 0.004 + t * 0.045)); } lp.unshift(new THREE.Vector2(0, 0.004));
  const pan = new THREE.Mesh(new THREE.LatheGeometry(lp, 40), std({ color: '#ece4d4', roughness: 0.35, side: THREE.DoubleSide })); pan.castShadow = true; g.add(pan);
  cyl(0.11, 0.11, 0.004, std({ color: '#3a3a3c', metalness: 0.6 }), 0, 0.002, 0, g, 40);
  const hd = rbox(0.18, 0.025, 0.03, 0.01, std({ color: '#1a1a1a', roughness: 0.5 }), 0.23, 0.045, 0, g); hd.rotation.z = 0.12;
  for (const s of [-1, 1]) cyl(0.006, 0.006, 0.01, std({ color: '#c8ccd0', metalness: 0.9 }), 0.145, 0.04, s * 0.012, g, 8).rotation.z = Math.PI / 2;
  scramble(g, -0.03, 0, 0.08, 0.1, 140, 4, 0.01);
  ketchup(g, [[-0.08, -0.06], [-0.05, -0.02], [-0.07, 0.02], [-0.03, 0.05], [0.0, 0.02], [-0.02, -0.04]], 0.03);
  const roll = subRoll(0.2); roll.position.set(0.07, 0.006, 0); roll.rotation.z = 0.2; g.add(roll);
  return g;
}
export function makeEggBaconSub() {
  const g = new THREE.Group(); g.name = 'egg_bacon_sub';
  const roll = subRoll(0.24); g.add(roll);
  scramble(g, 0, 0, 0.022, 0.1, 90, 9, 0.06);
  for (let i = 0; i < 4; i++) { const b = box(0.02, 0.006, 0.06, std({ color: '#6a2414', roughness: 0.45 }), (i % 2 - 0.5) * 0.02, 0.075, -0.08 + i * 0.05, g); b.rotation.y = 0.3 * (i % 2 ? 1 : -1); }
  ketchup(g, [[-0.02, -0.1], [0.02, -0.07], [-0.02, -0.04], [0.02, -0.01], [-0.02, 0.02], [0.02, 0.05], [-0.02, 0.08], [0.015, 0.1]], 0.085);
  return g;
}

// ---- the garage ---------------------------------------------------------------------------------------------------------
// a narrow concrete-block garage (3.4 x 5.6 m), open front at z = 0 facing +z, shutter rolled up; the dusty car nose out,
// a steel shelf at the back with junk, a folding table with a camp stove, the pan and the sub on a plate
export function makeKeiGarage() {
  const g = new THREE.Group(); g.name = 'kei_garage'; const cols = [], put = placer(g, cols);
  const W = 3.4, D = 5.6, H = 2.5, block = std({ map: tex('lot_concrete', 2, 1.4), color: '#b8b8b2', roughness: 0.9 });
  for (const s of [-1, 1]) box(0.2, H, D, block, s * (W / 2 - 0.1), H / 2, -D / 2, g); box(W, H, 0.2, block, 0, H / 2, -D + 0.1, g); box(W + 0.3, 0.2, D + 0.3, std({ color: '#5a5c60', metalness: 0.4 }), 0, H + 0.1, -D / 2, g);
  box(W, 0.35, 0.35, std({ color: '#8a8c90', metalness: 0.5 }), 0, H - 0.2, -0.1, g);   // the rolled-up shutter box
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.2), std({ map: tex('lot_concrete', 1.5, 2), color: '#a8a49c', roughness: 0.95 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.012, -D / 2); fl.receiveShadow = true; g.add(fl);
  const lt = new THREE.PointLight('#fff0d8', 3, 7, 1.5); lt.position.set(0, H - 0.3, -2.5); g.add(lt); box(0.6, 0.05, 0.1, std({ emissive: '#ffffff', emissiveIntensity: 1.5 }), 0, H - 0.05, -2.5, g);
  put(makeKeiCar(), -0.35, -2.7);
  // back shelf with tins, a fan heater, a kettle
  const sh = std({ color: '#3a5a8a', metalness: 0.4 }); for (let k = 0; k < 3; k++) box(1.2, 0.03, 0.4, sh, 0.9, 0.4 + k * 0.6, -D + 0.45, g); for (const sx of [0.3, 1.5]) box(0.04, 1.8, 0.4, sh, sx, 0.9, -D + 0.45, g); cols.push([0.28, 1.52, -D + 0.2, -D + 0.68]);
  const r = rng(6); for (let i = 0; i < 9; i++) { const c = cyl(0.06, 0.06, 0.12 + r() * 0.08, std({ color: ['#c81e28', '#2a6ad8', '#f2c21a', '#8a8c90'][i % 4], metalness: 0.5 }), 0.4 + (i % 3) * 0.35, 0.47 + Math.floor(i / 3) * 0.6 + 0.04, -D + 0.45, g, 14); void c; }
  // the folding table + camp stove by the right wall
  const tb = new THREE.Group(); box(0.8, 0.03, 0.5, std({ color: '#d8d4c8' }), 0, 0.72, 0, tb); for (const sx of [-0.35, 0.35]) for (const sz of [-0.2, 0.2]) rod(V(sx, 0, sz), V(sx * 0.9, 0.71, sz * 0.9), 0.012, std({ color: '#8a8c90', metalness: 0.7 }), tb);
  const stove = new THREE.Group(); stove.position.set(-0.12, 0.735, 0); tb.add(stove); box(0.34, 0.1, 0.28, std({ color: '#2a2a2c', metalness: 0.4 }), 0, 0.05, 0, stove); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 6, 20), std({ color: '#3a6ad8', emissive: '#2a5aff', emissiveIntensity: 1.8 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.105; stove.add(ring); for (let k = 0; k < 4; k++) box(0.012, 0.02, 0.24, std({ color: '#1a1a1a' }), -0.12 + k * 0.08, 0.11, 0, stove);
  const pan = makeEggBaconPan(); pan.position.set(-0.12, 0.85, 0); pan.rotation.y = -0.4; tb.add(pan);
  const plate = cyl(0.12, 0.1, 0.015, std({ color: '#ece4d4', roughness: 0.35 }), 0.22, 0.75, 0.05, tb, 32); void plate; const sub = makeEggBaconSub(); sub.position.set(0.22, 0.757, 0.05); sub.rotation.y = 0.5; tb.add(sub);
  tb.userData.collider = [-0.42, 0.42, -0.27, 0.27];
  put(tb, 1.15, -1.0, Math.PI / 2);
  // item 82: a white knob cabinet with a tread-plate toolbox in the back-left corner, the screwdriver on the camp
  // table, the sticker-covered case on the back shelf
  put(makeKnobCabinet(), -1.0, -D + 0.47); const tbx = makeTreadToolbox(); tbx.position.set(-1.0, 0.88, -D + 0.45); g.add(tbx);
  const sd = makeScrewdriver(); sd.position.set(1.4, 0.76, -0.75); sd.rotation.y = 0.6; g.add(sd);
  const sc = makeStickerCase(); sc.position.set(-0.25, 0.012, -D + 0.25); sc.rotation.y = 0.2; g.add(sc);
  cols.push([-W / 2, -W / 2 + 0.2, -D, 0], [W / 2 - 0.2, W / 2, -D, 0], [-W / 2, W / 2, -D, -D + 0.2]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -W / 2 + 0.25, maxX: W / 2 - 0.25, minZ: -D + 0.25, maxZ: 0.3 }];
  return g;
}

// ---- freezer + cooler ---------------------------------------------------------------------------------------------------
// a steel roll-cage cart (nesting cage: wire sides, castor base) stacked with frozen-food cases with made-up labels
export function makeCageCart(seed = 1, load = 6) {
  const g = new THREE.Group(); g.name = 'cage_cart'; const W = 0.72, D = 0.8, H = 1.75, wire = std({ color: '#b8bcc0', metalness: 0.7, roughness: 0.35 });
  box(W, 0.04, D, wire, 0, 0.18, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(0.05, 0.05, 0.04, std({ color: '#222' }), sx * (W / 2 - 0.06), 0.06, sz * (D / 2 - 0.06), g, 12).rotation.z = Math.PI / 2; box(0.04, 0.1, 0.04, wire, sx * (W / 2 - 0.06), 0.13, sz * (D / 2 - 0.06), g); }
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) rod(V(sx * W / 2, 0.2, sz * D / 2), V(sx * W / 2, H, sz * D / 2), 0.012, wire, g); for (let k = 0; k <= 6; k++) rod(V(sx * W / 2, 0.2 + k * 0.25, -D / 2), V(sx * W / 2, 0.2 + k * 0.25, D / 2), 0.005, wire, g); for (let k = 0; k <= 5; k++) rod(V(sx * W / 2, 0.2, -D / 2 + k * D / 5), V(sx * W / 2, H, -D / 2 + k * D / 5), 0.004, wire, g); }
  for (let k = 0; k <= 6; k++) rod(V(-W / 2, 0.2 + k * 0.25, -D / 2), V(W / 2, 0.2 + k * 0.25, -D / 2), 0.005, wire, g);
  const r = rng(seed * 31), brands = [['POLAR PANTRY', '#1e4ab8'], ['FROSTLINE', '#c81e28'], ['ICY HOLLOW', '#2a8ad8'], ['DEEP CHILL', '#1e6a3a'], ['SNOWCAP FARMS', '#5a2ab8']];
  let y = 0.2;
  for (let i = 0; i < load && y < H + 0.4; i++) { const bw = 0.5 + r() * 0.18, bh = 0.2 + r() * 0.15, bd = 0.4 + r() * 0.3; const [bn, bc] = brands[Math.floor(r() * brands.length)];
    const lab = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#c8a070'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.fillRect(16, 14, w - 32, h - 28); x.fillStyle = bc; fitText(x, bn, w / 2, 48, w - 50, 34, F.heavy); x.fillStyle = '#111'; fitText(x, ['FROZEN · KEEP BELOW -18°C', 'veggie mix 12 x 1 kg', 'fish fillets 10 lb', 'fries 6 x 2.5 kg'][i % 4], w / 2, 88, w - 50, 18, F.label); });
    const cm = std({ color: '#c8a070', roughness: 0.9 }); const b = box(bw, bh, bd, [cm, cm, cm, cm, std({ map: lab, roughness: 0.85 }), cm], (r() - 0.5) * 0.08, y + bh / 2, (r() - 0.5) * 0.06, g); b.rotation.y = (r() - 0.5) * 0.15; y += bh; }
  g.userData.collider = [-W / 2 - 0.02, W / 2 + 0.02, -D / 2 - 0.02, D / 2 + 0.02];
  return g;
}
export function makeHaspPadlock() {
  const g = new THREE.Group(); g.name = 'hasp_padlock'; const steel = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.3 }), zinc = std({ color: '#a8acb0', metalness: 0.6, roughness: 0.5 });
  box(0.05, 0.22, 0.012, zinc, 0, 0.0, 0.006, g); box(0.04, 0.05, 0.03, zinc, 0, -0.08, 0.02, g);   // hasp plate + staple
  const stp = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 12, Math.PI), steel); stp.position.set(0, -0.08, 0.04); g.add(stp);
  // long-shackle padlock: a tall U + a laminated body
  const sh = new THREE.Group(); sh.position.set(0, -0.08, 0.04); g.add(sh);
  for (const s of [-1, 1]) rod(V(s * 0.016, -0.0, 0), V(s * 0.016, -0.11, 0), 0.0045, steel, sh, 8);
  const top = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0045, 6, 14, Math.PI), steel); top.position.set(0, 0.0, 0); sh.add(top);
  const bd = rbox(0.05, 0.055, 0.025, 0.006, std({ color: '#b8bcc0', metalness: 0.75, roughness: 0.4 }), 0, -0.14, 0, sh); void bd; for (let k = 0; k < 5; k++) box(0.051, 0.002, 0.026, std({ color: '#8a8c90', metalness: 0.7 }), 0, -0.162 + k * 0.011, 0, sh);
  return g;
}
export function makeWalkInFreezer() {
  const g = new THREE.Group(); g.name = 'walkin_freezer'; const cols = [], put = placer(g, cols);
  const W = 4.0, D = 4.2, H = 2.7; const seam = canvasT(64, 256, (x, w, h) => { x.fillStyle = '#eef0f2'; x.fillRect(0, 0, w, h); x.fillStyle = '#c0c4c8'; x.fillRect(0, 0, 3, h); }); seam.wrapS = THREE.RepeatWrapping; seam.repeat.set(4, 1);
  const pm = std({ map: seam, roughness: 0.45, metalness: 0.15 });
  // walls: back, left, right, roof; the front (z = +D/2) has the open door + a locked emergency door
  box(W, H, 0.12, pm, 0, H / 2, -D / 2, g); box(0.12, H, D, pm, -W / 2, H / 2, 0, g); box(0.12, H, D, pm, W / 2, H / 2, 0, g); box(W, 0.12, D, pm, 0, H, 0, g);
  box(1.4, H, 0.12, pm, -W / 2 + 0.7, H / 2, D / 2, g); box(1.5, H, 0.12, pm, W / 2 - 0.75, H / 2, D / 2, g); box(1.1, H - 2.15, 0.12, pm, -0.15, 2.15 + (H - 2.15) / 2, D / 2, g);
  const door = new THREE.Group(); door.position.set(-0.7, 0, D / 2 + 0.06); door.rotation.y = 1.25; g.add(door); box(1.08, 2.12, 0.12, pm, 0.54, 1.06, 0.0, door); box(0.06, 0.36, 0.07, std({ color: '#8a8c90', metalness: 0.8 }), 0.95, 1.06, 0.09, door);
  const frost = std({ color: '#e8f2f8', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }); for (let i = 0; i < 6; i++) plane(0.18, 2.05, frost, -0.6 + i * 0.18, 1.06, D / 2 - 0.08, 0, g);
  // the emergency door on the right, hasp + padlock + a worn notice beside it
  box(0.9, 2.05, 0.05, std({ color: '#e4e6e8' }), W / 2 - 0.75, 1.03, D / 2 + 0.085, g);
  const hp = makeHaspPadlock(); hp.position.set(W / 2 - 1.12, 1.15, D / 2 + 0.11); g.add(hp);
  const nt = canvasT(256, 360, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8702a'; x.fillRect(0, 0, w, 70); x.fillStyle = '#fff'; fitText(x, 'DELIVERY RULES', w / 2, 38, w - 30, 34, F.heavy); x.fillStyle = '#e8702a'; fitText(x, 'Our pledge to you', w / 2, 96, w - 30, 26, F.label); x.fillStyle = '#333'; for (let i = 0; i < 12; i++) { x.fillRect(20, 124 + i * 18, 8, 8); x.fillRect(36, 126 + i * 18, 120 + (i * 41) % 80, 5); } x.fillStyle = 'rgba(140,120,80,0.25)'; x.fillRect(0, h - 60, w, 60); });
  plane(0.3, 0.42, std({ map: nt, roughness: 0.9 }), W / 2 - 0.15, 1.35, D / 2 + 0.065, 0, g);
  // inside: frost floor, two evaporator fan units high on the back wall, cage carts with cases, loose stacks
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, D - 0.2), std({ color: '#9a9690', roughness: 0.85 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.012; g.add(fl);
  for (const x of [-0.9, 0.9]) { const ev = new THREE.Group(); ev.position.set(x, H - 0.45, -D / 2 + 0.3); g.add(ev); box(1.2, 0.45, 0.45, std({ color: '#e8eaec', metalness: 0.3 }), 0, 0, 0, ev); for (const fx of [-0.3, 0.3]) { const fr = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), std({ map: canvasT(128, 128, (c, w, h) => { c.fillStyle = '#2a2c30'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a8acb0'; c.lineWidth = 3; for (let r = 12; r < 64; r += 10) { c.beginPath(); c.arc(64, 64, r, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(0, 64); c.lineTo(w, 64); c.moveTo(64, 0); c.lineTo(64, h); c.stroke(); }) })); fr.position.set(fx, 0, 0.226); ev.add(fr); } }
  const cl = new THREE.PointLight('#e8f4ff', 4, 7, 1.5); cl.position.set(0, H - 0.4, 0.4); g.add(cl);
  put(makeCageCart(1, 7), -1.3, -1.2, 0.0); put(makeCageCart(2, 6), -0.4, -1.4, 0.1); put(makeCageCart(3, 8), 0.6, -1.25, -0.05); put(makeCageCart(4, 5), 1.45, 0.2, Math.PI / 2);
  cols.length = 0;   // the carts block the back half; the colliders below cover them as a group
  cols.push([-W / 2 + 0.1, W / 2 - 0.1, -D / 2 + 0.1, -0.8], [1.0, W / 2 - 0.1, -0.3, 0.7]);
  cols.push([-W / 2 - 0.06, -W / 2 + 0.06, -D / 2, D / 2], [W / 2 - 0.06, W / 2 + 0.06, -D / 2, D / 2], [-W / 2, W / 2, -D / 2 - 0.06, -D / 2 + 0.06], [-W / 2, -1.25, D / 2 - 0.06, D / 2 + 0.06], [-0.15, W / 2, D / 2 - 0.06, D / 2 + 0.14]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -W / 2 + 0.2, maxX: W / 2 - 0.2, minZ: -D / 2 + 0.2, maxZ: D / 2 + 0.2 }];
  return g;
}
// a reach-in cooler row: glass doors on a black frame with lit shelves of dairy; two doors replaced by taped cardboard
// with finger holes cut in. The row faces +z.
export function makeCardboardCoolerRow(n = 4, patched = [1, 2]) {
  const g = new THREE.Group(); g.name = 'cardboard_cooler_row'; const DW = 0.78, W = n * DW, H = 2.1, D = 0.9, blk = std({ color: '#1a2a22', roughness: 0.5, metalness: 0.3 });
  box(W + 0.1, H + 0.35, D, std({ color: '#2a3a30' }), 0, (H + 0.35) / 2, -D / 2, g);
  box(W + 0.1, 0.35, 0.1, std({ color: '#3a5a48' }), 0, H + 0.18, 0.02, g);
  const stock = (k) => canvasT(256, 512, (x, w, h) => { const r = rng(k * 7 + 3); x.fillStyle = '#f2f4f4'; x.fillRect(0, 0, w, h); for (let s = 0; s < 6; s++) { const y0 = 20 + s * 82; x.fillStyle = '#c8ccd0'; x.fillRect(0, y0 + 66, w, 6); let px = 4; while (px < w - 20) { const cw = 24 + r() * 30, ch = 30 + r() * 34; x.fillStyle = ['#2a6ad8', '#f4f4f0', '#e8402a', '#f2c21a', '#8ad8f2', '#c83a8a', '#3ab84a'][Math.floor(r() * 7)]; x.fillRect(px, y0 + 66 - ch, cw - 3, ch); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px, y0 + 66 - ch, cw - 3, 6); px += cw; } } });
  for (let i = 0; i < n; i++) { const x = -W / 2 + DW / 2 + i * DW;
    plane(DW - 0.06, H - 0.1, std({ map: stock(i), emissive: '#ffffff', emissiveMap: stock(i), emissiveIntensity: 0.35 }), x, H / 2, -0.25, 0, g);
    box(0.05, H, 0.06, blk, x - DW / 2, H / 2, 0.0, g);
    if (patched.includes(i)) {
      // two cardboard sheets taped over the frame, finger holes, tape strips, a scrawled note
      const cb = canvasT(256, 640, (cx, w, h) => { cx.fillStyle = '#c8a070'; cx.fillRect(0, 0, w, h); cx.strokeStyle = 'rgba(120,80,40,0.25)'; cx.lineWidth = 2; for (let k = 0; k < h; k += 7) { cx.beginPath(); cx.moveTo(0, k); cx.lineTo(w, k); cx.stroke(); } cx.fillStyle = '#2a1a10'; for (const [hx, hy] of [[60, 260], [90, 262]]) { cx.beginPath(); cx.ellipse(hx, hy, 9, 14, 0, 0, 7); cx.fill(); } cx.fillStyle = 'rgba(240,235,215,0.7)'; for (const [tx, ty, tw, th] of [[0, 0, w, 20], [0, h - 20, w, 20], [0, 0, 20, h], [w - 20, 0, 20, h], [0, h / 2 - 10, w, 20]]) cx.fillRect(tx, ty, tw, th); if (i === patched[0]) { cx.fillStyle = '#111'; cx.font = `30px ${F.marker}`; cx.fillText('OUT OF', 60, 420); cx.fillText('ORDER', 64, 460); } });
      const cbm = new THREE.Mesh(new THREE.PlaneGeometry(DW - 0.05, H - 0.05, 4, 8), std({ map: cb, roughness: 0.95, side: THREE.DoubleSide })); const pp = cbm.geometry.attributes.position; for (let k = 0; k < pp.count; k++) pp.setZ(k, 0.008 * Math.sin(pp.getY(k) * 3 + i)); cbm.geometry.computeVertexNormals(); cbm.position.set(x, H / 2, 0.04); g.add(cbm);
    } else {
      plane(DW - 0.08, H - 0.12, phys({ color: '#e8f4f8', transparent: true, opacity: 0.16, roughness: 0.03, depthWrite: false }), x, H / 2, 0.03, 0, g);
      box(0.03, 0.9, 0.04, std({ color: '#c8ccd0', metalness: 0.8 }), x + DW / 2 - 0.1, 1.05, 0.07, g);
    } }
  box(0.05, H, 0.06, blk, W / 2, H / 2, 0.0, g); box(W + 0.05, 0.06, 0.06, blk, 0, H, 0.0, g); box(W + 0.1, 0.12, 0.1, std({ color: '#2a3a30' }), 0, 0.06, 0.02, g);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.05, -D, 0.1];
  return g;
}
