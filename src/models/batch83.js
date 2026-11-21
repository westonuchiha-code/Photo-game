// Batch 83 (photos/batch83/): two cans (made-up brands), a fibreglass telecom pedestal in crushed-rock landscaping, and a
// commercial gas-meter manifold on a two-tone brick wall with junipers, ornamental grass and a bollard. Textures from
// tools/tex_83.py (sandy dirt, fine gravel, crushed rock, curb concrete).
//   b83Mat, makeEnergyCan16, makeColaCan, makeTelecomPedestal83, makeGasManifold, makeJuniper, makeOrnamentalGrass,
//   makeUtilityCorner
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { brickMat } from './batch78.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1, srgb = true) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 12) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function b83Mat(name, rx = 1, ry = 1, extra = {}) { return std({ map: tex(name, rx, ry), normalMap: tex(name + '_n', rx, ry, false), roughness: 0.95, ...extra }); }

// a can built from a lathe body (rounded bottom dome, neck, rim) and a printed wrap; open = ring pull up
function can(H, R, wrap, open, name) {
  const g = new THREE.Group(); g.name = name; const al = std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.25 });
  const lp = [V(0, 0.004, 0), V(R * 0.72, 0, 0), V(R * 0.95, 0.006, 0), V(R, 0.014, 0), V(R, H - 0.016, 0), V(R * 0.86, H - 0.004, 0), V(R * 0.86, H, 0), V(0, H - 0.004, 0)].map((v) => new THREE.Vector2(v.x, v.y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(lp, 36), al)); g.children[0].castShadow = true;
  const w = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.0003, R + 0.0003, H - 0.03, 48, 1, true), std({ map: wrap, metalness: 0.55, roughness: 0.28 })); w.position.y = H / 2; g.add(w);
  const tab = new THREE.Group(); tab.position.set(0.006, H + 0.0015, 0); g.add(tab); const t = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0018, 6, 14), al); t.rotation.x = Math.PI / 2; tab.add(t);
  if (open) { tab.rotation.z = -1.2; tab.position.set(0.004, H + 0.006, 0); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.007, 14), std({ color: '#0a0a0a' })); hole.rotation.x = -Math.PI / 2; hole.scale.set(1.4, 1, 1); hole.position.set(-0.008, H + 0.0005, 0); g.add(hole); }
  return g;
}
// 16 oz energy can (157 mm x 66 mm): metallic blue, big white arrow-letter wordmark "N2X" up the side, an orange band and
// a nutrition panel on the back (made-up brand)
export function makeEnergyCan16(open = true) {
  const t = canvasT(1024, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#0e3aa8'); gr.addColorStop(0.5, '#2a7ae8'); gr.addColorStop(1, '#0e3aa8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8702a'; x.fillRect(0, 30, w, 34); x.fillStyle = '#fff'; fitText(x, 'BOOSTED CITRUS FORMULA', w * 0.25, 48, 360, 22, F.label);
    x.save(); x.translate(w * 0.25, h / 2 + 30); x.rotate(-Math.PI / 2); x.fillStyle = '#ffffff'; x.strokeStyle = '#0a1a4a'; x.lineWidth = 10; x.font = `italic 170px ${F.heavy}`; x.textAlign = 'center'; x.strokeText('N2X', 0, 60); x.fillText('N2X', 0, 60);
    x.beginPath(); x.moveTo(-170, -40); x.lineTo(-120, -90); x.lineTo(-120, -55); x.lineTo(170, -55); x.lineTo(170, -25); x.lineTo(-120, -25); x.lineTo(-120, 10); x.closePath(); x.fill(); x.stroke(); x.restore();
    x.save(); x.translate(w * 0.44, h / 2 + 20); x.rotate(-Math.PI / 2); x.fillStyle = '#e8f4ff'; x.font = `20px ${F.label}`; x.textAlign = 'center'; x.fillText('HIGH OCTANE ENERGY DRINK', 0, 0); x.restore();
    // back: orange nutrition panel
    x.fillStyle = '#f08a2a'; x.fillRect(w * 0.6, 80, w * 0.3, h - 120); x.fillStyle = '#fff'; x.fillRect(w * 0.62, 96, w * 0.26, h - 152); x.fillStyle = '#111'; fitText(x, 'Nutrition Facts', w * 0.75, 120, 230, 24, F.heavy); x.fillRect(w * 0.63, 136, w * 0.24, 6);
    for (let i = 0; i < 12; i++) { x.fillRect(w * 0.63, 156 + i * 20, 80 + (i * 37) % 120, 6); x.fillRect(w * 0.84, 156 + i * 20, 24, 6); } x.fillStyle = '#fff'; fitText(x, '16 FL OZ (473 mL)', w * 0.75, h - 24, 230, 22, F.label); });
  return can(0.157, 0.033, t, open, 'energy_can_n2x');
}
// 12 oz cola can (122 mm x 66 mm): deep red metallic, a white swirl wordmark (made-up "Dr. Fizz"), a "23" flavour badge
export function makeColaCan(open = false) {
  const t = canvasT(1024, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5a0a10'); gr.addColorStop(0.5, '#a81a24'); gr.addColorStop(1, '#5a0a10'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.25)'; x.lineWidth = 12; x.beginPath(); x.moveTo(0, h * 0.7); x.bezierCurveTo(w * 0.2, h * 0.5, w * 0.4, h * 0.9, w * 0.6, h * 0.6); x.stroke();
    x.save(); x.translate(w * 0.25, h * 0.42); x.rotate(-0.18); x.fillStyle = '#fff'; fitText(x, 'Dr. Fizz', 0, 0, 340, 130, F.script); x.restore();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(w * 0.25, h * 0.72, 46, 0, 7); x.fill(); x.fillStyle = '#a81a24'; fitText(x, '23', w * 0.25, h * 0.72 + 4, 60, 50, F.heavy); x.fillStyle = '#fff'; fitText(x, '12 FL OZ (355 mL)', w * 0.25, h - 30, 220, 20, F.label);
    x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(w * 0.62, 120, w * 0.22, 260); x.fillStyle = '#5a0a10'; for (let i = 0; i < 10; i++) x.fillRect(w * 0.63, 140 + i * 22, 120 + (i * 31) % 60, 6); });
  return can(0.122, 0.033, t, open, 'cola_can_drfizz');
}
// beige fibreglass pedestal (rounded top) with a vent band and a peeling orange cable-warning sticker
export function makeTelecomPedestal83() {
  const g = new THREE.Group(); g.name = 'telecom_pedestal_beige'; const beige = std({ color: '#d8d2bc', roughness: 0.55 });
  const body = new RoundedBoxGeometry(0.38, 0.95, 0.3, 4, 0.06); const p = body.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0.3) { const k = (y - 0.3) / 0.175; p.setX(i, p.getX(i) * (1 - 0.15 * Math.min(1, k))); p.setZ(i, p.getZ(i) * (1 - 0.12 * Math.min(1, k))); } } body.computeVertexNormals();
  const m = new THREE.Mesh(body, beige); m.position.y = 0.475; m.castShadow = true; g.add(m);
  for (let i = 0; i < 6; i++) box(0.24, 0.008, 0.02, std({ color: '#a8a290' }), 0, 0.8 + i * 0.02, 0.147, g);
  const st = canvasT(192, 256, (x, w, h) => { x.fillStyle = '#f2902a'; x.beginPath(); x.moveTo(6, 6); x.lineTo(w - 6, 10); x.lineTo(w - 10, h - 30); x.lineTo(w - 40, h - 6); x.lineTo(6, h - 10); x.closePath(); x.fill(); x.fillStyle = '#111'; fitText(x, 'WARNING', w / 2, 34, w - 30, 30, F.heavy); x.beginPath(); x.moveTo(w / 2, 60); x.lineTo(w / 2 + 34, 120); x.lineTo(w / 2 - 34, 120); x.closePath(); x.fill(); x.fillStyle = '#f2902a'; fitText(x, '!', w / 2, 102, 20, 40, F.heavy); x.fillStyle = '#111'; ['BURIED CABLE', 'CALL BEFORE', 'YOU DIG', '811-555-0140'].forEach((l, i) => fitText(x, l, w / 2, 150 + i * 24, w - 30, 18, F.label)); x.fillStyle = '#e8e0c8'; x.beginPath(); x.moveTo(w - 50, h - 6); x.lineTo(w - 10, h - 30); x.lineTo(w - 20, h - 4); x.fill(); });
  plane(0.12, 0.16, std({ map: st, transparent: true }), 0.05, 0.62, 0.152, 0, g);
  box(0.05, 0.03, 0.02, std({ color: '#5a5a50' }), -0.12, 0.6, 0.152, g);
  g.userData.collider = [-0.2, 0.2, -0.16, 0.16];
  return g;
}
// commercial gas meter manifold: a grey steel riser loop with two regulators, ball valves, a rotary meter in a grey cabinet
// with a digital readout, a rusty riser into the ground, two conduits up the wall
export function makeGasManifold() {
  const g = new THREE.Group(); g.name = 'gas_manifold'; const pipe = std({ color: '#8a8e92', metalness: 0.55, roughness: 0.45 }), rust = std({ color: '#7a4a2a', roughness: 0.85, metalness: 0.3 }), yel = std({ color: '#f2c21a', roughness: 0.5 });
  const r = 0.03, z = 0.12;
  rod(V(-0.5, 0, z), V(-0.5, 0.5, z), r, rust, g); rod(V(-0.5, 0.5, z), V(-0.5, 1.2, z), r, pipe, g); rod(V(-0.5, 1.2, z), V(0.5, 1.2, z), r, pipe, g); rod(V(0.5, 1.2, z), V(0.5, 0.45, z), r, pipe, g); rod(V(-0.5, 0.45, z), V(0.5, 0.45, z), r, pipe, g);
  for (const [x, y] of [[-0.5, 1.2], [0.5, 1.2], [-0.5, 0.45], [0.5, 0.45]]) { const e = new THREE.Mesh(new THREE.SphereGeometry(r * 1.3, 12, 10), pipe); e.position.set(x, y, z); g.add(e); }
  // regulators: a bell housing + a spring dome + a vent screen
  for (const x of [-0.2, 0.15]) { const rg = new THREE.Group(); rg.position.set(x, 1.2, z); g.add(rg); cyl(0.07, 0.07, 0.07, std({ color: '#6a7a8a', metalness: 0.5 }), 0, 0.06, 0, rg, 20); const dm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#6a7a8a', metalness: 0.5 })); dm.position.y = 0.095; rg.add(dm); cyl(0.02, 0.02, 0.05, std({ color: '#222' }), 0.08, 0.06, 0, rg, 10).rotation.z = Math.PI / 2; }
  // ball valves with yellow lever handles
  for (const [x, y] of [[-0.5, 0.75], [0.5, 0.75], [0.0, 0.45]]) { const v = cyl(0.045, 0.045, 0.08, pipe, x, y, z, g, 14); if (x === 0) v.rotation.z = Math.PI / 2; box(0.14, 0.02, 0.025, yel, x + 0.05, y + 0.05, z + 0.04, g); }
  // the meter: a grey sheet-metal cabinet with a small LCD
  const cab = rbox(0.42, 0.5, 0.26, 0.02, std({ color: '#9aa0a4', metalness: 0.4, roughness: 0.5 }), 0.0, 0.85, z, g); void cab;
  const lcd = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#9ab89a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a2a1a'; x.font = `48px ${F.led}`; x.fillText('0418372', 20, 64); x.font = `16px ${F.label}`; x.fillText('CCF', 210, 30); });
  plane(0.16, 0.06, std({ map: lcd, emissive: '#405040', emissiveIntensity: 0.5 }), 0.0, 0.92, z + 0.131, 0, g); box(0.18, 0.03, 0.01, std({ color: '#f4f4f0' }), 0.0, 0.75, z + 0.131, g);
  // conduits up the wall + a couple of straps
  for (const x of [0.85, 0.95]) { rod(V(x, 0.2, 0.03), V(x, 3.6, 0.03), 0.022, std({ color: '#b8bcc0', metalness: 0.6 }), g); for (const y of [1.0, 2.0, 3.0]) box(0.06, 0.03, 0.05, std({ color: '#888' }), x, y, 0.03, g); }
  box(0.25, 0.32, 0.12, std({ color: '#8a8e92', metalness: 0.4 }), 0.9, 1.6, 0.06, g);   // a junction box
  g.userData.collider = [-0.6, 1.0, 0, 0.3];
  return g;
}
export function makeJuniper(seed = 1) { const g = new THREE.Group(); g.name = 'juniper'; const r = rng(seed); const m = std({ color: '#3a6a34', roughness: 0.95 });
  for (let i = 0; i < 60; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.45; const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + r() * 0.07, 1), m); s.position.set(Math.cos(a) * d, 0.1 + (0.45 - d) * 0.6 + r() * 0.1, Math.sin(a) * d); s.scale.y = 0.6; s.rotation.set(r() * 3, r() * 3, 0); s.castShadow = true; g.add(s); } return g; }
export function makeOrnamentalGrass(seed = 1, H = 1.3) { const g = new THREE.Group(); g.name = 'ornamental_grass'; const r = rng(seed);
  const blade = new THREE.PlaneGeometry(0.02, 1, 1, 6); blade.translate(0, 0.5, 0); const m = std({ color: '#c8a878', roughness: 1, side: THREE.DoubleSide }); const n = 140;
  const im = new THREE.InstancedMesh(blade, m, n); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  for (let i = 0; i < n; i++) { const a = r() * 6.28; Q.setFromEuler(E.set(Math.cos(a) * (0.1 + r() * 0.4), r() * 6.28, Math.sin(a) * (0.1 + r() * 0.4))); M.compose(V((r() - 0.5) * 0.15, 0, (r() - 0.5) * 0.15), Q, V(1, H * (0.6 + r() * 0.5), 1)); im.setMatrixAt(i, M); } g.add(im);
  for (let i = 0; i < 12; i++) { const a = r() * 6.28; const top = V(Math.cos(a) * 0.3, H * (1 + r() * 0.2), Math.sin(a) * 0.3); rod(V(0, 0, 0), top, 0.004, std({ color: '#d8c090' }), g, 4); const pl = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.22, 6), std({ color: '#e8d8b0', roughness: 1 })); pl.position.copy(top); g.add(pl); }
  return g; }
// the whole corner: a 3 m stretch of two-tone brick wall (tan below, white-painted... no: tan base course, red upper)
// with the manifold, a crushed-rock bed, junipers + grass, a yellow bollard, the beige pedestal and the two cans
export function makeUtilityCorner() {
  const g = new THREE.Group(); g.name = 'utility_corner';
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.6), b83Mat('b83_crushedrock', 6.0, 2.0)); bed.rotation.x = -Math.PI / 2; bed.position.set(0.2, 0.02, 0.8); bed.receiveShadow = true; g.add(bed);
  for (const [w, x, z, ry] of [[4.6, 0.2, 1.6, 0], [1.6, -2.1, 0.8, Math.PI / 2], [1.6, 2.5, 0.8, Math.PI / 2]]) { const e = box(w, 0.1, 0.12, b83Mat('b83_curb', w, 0.2), x, 0.05, z, g); e.rotation.y = ry; }
  const gm = makeGasManifold(); gm.position.set(-0.6, 0.02, 0); g.add(gm);
  const j1 = makeJuniper(3); j1.position.set(0.9, 0, 0.75); g.add(j1); const j2 = makeJuniper(7); j2.position.set(0.25, 0, 1.0); j2.scale.setScalar(0.8); g.add(j2);
  const og = makeOrnamentalGrass(5); og.position.set(-1.95, 0, 0.55); g.add(og);
  const tp = makeTelecomPedestal83(); tp.position.set(1.9, 0.02, 0.4); tp.rotation.y = -0.2; g.add(tp);
  const bl = new THREE.Group(); bl.position.set(2.85, 0, 1.0); g.add(bl); cyl(0.1, 0.1, 1.0, std({ color: '#f2c21a', roughness: 0.5 }), 0, 0.5, 0, bl, 18); const dm = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#f2c21a', roughness: 0.5 })); dm.position.y = 1.0; bl.add(dm);
  const ec = makeEnergyCan16(true); ec.position.set(1.0, 0.1, 1.6); g.add(ec);
  const cc = makeColaCan(false); cc.position.set(-1.2, 0.1, 1.6); cc.rotation.y = 0.5; g.add(cc);
  g.userData.colliders = [[-1.2, 0.5, 0, 0.35], [1.68, 2.12, 0.22, 0.58], [2.73, 2.97, 0.88, 1.12]];
  return g;
}
