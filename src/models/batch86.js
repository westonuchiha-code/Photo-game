// Batch 86 (photos/batch86/): a small public restroom built as a walk-in room, plus back-room pieces (paper-sack case
// pallet, an autonomous floor-scrubber, a standing wet-floor sign, brushed stainless wall panels, green tread plate).
// Brands are left off or made up. Textures from tools/tex_86.py.
//   b86Mat, makeLouvreDoor, makeVanity, makeDomeBin, makeAccessPanel, makeSportsPlaque, makeSoapDispenser,
//   makeJumboTPDispenser, makeGrabBar, makeSharpsBox, makeChangingStation, makeFloorDrain, makeFlushToilet, makeRestroom,
//   makePaperSackPallet, makeFloorScrubber, makeWetFloorStanding, makeStainlessWall, makeDockPlate
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1, srgb = true) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = Math.imul(seed + 0x9e37, 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 12) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function sphere(r, mat, x, y, z, p, ws = 16, hs = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function b86Mat(name, rx = 1, ry = 1, extra = {}) { return std({ map: tex(name, rx, ry), normalMap: tex(name + '_n', rx, ry, false), roughness: 0.5, ...extra }); }
const steelM = () => std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.28 });
const tanPaint = () => std({ color: '#d8c8a8', roughness: 0.45, metalness: 0.2 });

// ---- door: tan hollow-metal door (0.9 x 2.1) in a tan frame, a louvre panel low on it (one slat dented), lever, closer
export function makeLouvreDoor(open = 0) {
  const g = new THREE.Group(); g.name = 'louvre_door'; const tan = tanPaint(), blk = std({ color: '#1a1a1c', roughness: 0.5 });
  for (const s of [-1, 1]) box(0.06, 2.16, 0.14, tan, s * 0.48, 1.08, 0, g); box(1.02, 0.06, 0.14, tan, 0, 2.19, 0, g);
  const leaf = new THREE.Group(); leaf.position.set(-0.45, 0, 0); leaf.rotation.y = -open; g.add(leaf);
  box(0.9, 2.1, 0.045, tan, 0.45, 1.05, 0, leaf);
  // louvre: a framed opening with ~22 angled slats, slat 14 bent
  const lv = new THREE.Group(); lv.position.set(0.37, 0.48, 0.03); leaf.add(lv);
  for (const [w, h, x, y] of [[0.46, 0.03, 0, 0.27], [0.46, 0.03, 0, -0.27], [0.03, 0.57, -0.215, 0], [0.03, 0.57, 0.215, 0]]) box(w, h, 0.02, tan, x, y, 0, lv);
  box(0.4, 0.5, 0.01, std({ color: '#3a3430' }), 0, 0, -0.02, lv);
  for (let i = 0; i < 22; i++) { const s = box(0.4, 0.004, 0.035, tan, 0, -0.24 + i * 0.023, 0, lv); s.rotation.x = 0.7; if (i === 13) { s.rotation.z = 0.04; s.position.y -= 0.004; s.scale.x = 0.98; } }
  for (const [x, y] of [[-0.2, 0.25], [0.2, 0.25], [-0.2, -0.25], [0.2, -0.25]]) cyl(0.006, 0.006, 0.006, steelM(), x, y, 0.012, lv, 8).rotation.x = Math.PI / 2;
  // lever handle + rose, hinges, the overhead closer arm
  const lh = new THREE.Group(); lh.position.set(0.8, 1.0, 0.03); leaf.add(lh); cyl(0.035, 0.035, 0.012, steelM(), 0, 0, 0, lh, 20).rotation.x = Math.PI / 2; box(0.13, 0.02, 0.02, steelM(), -0.06, 0, 0.04, lh);
  for (const y of [0.25, 1.05, 1.9]) cyl(0.012, 0.012, 0.11, steelM(), 0.0, y, 0.0, leaf, 10);
  box(0.3, 0.07, 0.07, blk, 0.25, 2.04, 0.06, leaf); rod(V(0.4, 2.04, 0.08), V(0.0, 2.16, 0.18), 0.012, blk, g, 6);
  g.userData.collider = [-0.52, 0.52, -0.08, 0.08];
  return g;
}
// ---- vanity: solid-surface top (speckled tan) with an undermount oval sink, a sensor faucet, a round waste chute and a
// tall backsplash; a grey drain stack underneath
export function makeVanity() {
  const g = new THREE.Group(); g.name = 'vanity';
  const ss = std({ map: canvasT(256, 256, (x, w, h) => { const r = rng(4); x.fillStyle = '#d8ccb4'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { const c = r(); x.fillStyle = c < 0.3 ? '#a89880' : c < 0.6 ? '#ece4d4' : '#8a7a68'; x.fillRect(r() * w, r() * h, 1.3, 1.3); } }), roughness: 0.35 });
  const W = 1.4, D = 0.55, T = 0.12, Y = 0.82;
  // the top with a hole for the sink: an extruded shape
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -D / 2); sh.lineTo(W / 2, -D / 2); sh.lineTo(W / 2, D / 2); sh.lineTo(-W / 2, D / 2); sh.closePath();
  const hole = new THREE.Path(); hole.absellipse(-0.25, 0.05, 0.22, 0.15, 0, Math.PI * 2, true); sh.holes.push(hole); const h2 = new THREE.Path(); h2.absarc(0.18, -0.12, 0.06, 0, Math.PI * 2, true); sh.holes.push(h2);
  const top = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 32 }), ss); top.rotation.x = -Math.PI / 2; top.position.y = Y; top.castShadow = top.receiveShadow = true; g.add(top);
  box(W, 0.3, 0.025, ss, 0, Y + T + 0.15, -D / 2 + 0.0125, g); box(0.025, 0.3, D, ss, W / 2 - 0.0125, Y + T + 0.15, 0, g);
  // the bowl: a half-ellipsoid hanging under the hole
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color: '#f8f8f6', roughness: 0.15, side: THREE.DoubleSide })); bowl.scale.set(0.22, 0.13, 0.15); bowl.position.set(-0.25, Y + T - 0.005, -0.05); g.add(bowl);
  const chute = cyl(0.06, 0.06, 0.2, std({ color: '#8a8c90', metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }), 0.18, Y + 0.02, 0.12, g, 24); chute.material.side = THREE.DoubleSide; const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.006, 6, 24), steelM()); ring.rotation.x = Math.PI / 2; ring.position.set(0.18, Y + T + 0.003, 0.12); g.add(ring);
  // sensor faucet: a chrome gooseneck stub on a deck plate, a black sensor window
  const fc = new THREE.Group(); fc.position.set(-0.25, Y + T, -0.2); g.add(fc); const ch = std({ color: '#e0e4e8', metalness: 1, roughness: 0.12 });
  box(0.2, 0.008, 0.05, ch, 0, 0.004, 0, fc); cyl(0.022, 0.026, 0.12, ch, 0, 0.065, 0, fc, 20); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 10, 20, Math.PI / 2), ch); arc.position.set(0, 0.125, 0.05); arc.rotation.y = -Math.PI / 2; arc.rotation.z = 0; g.add(arc); arc.position.add(fc.position); box(0.02, 0.012, 0.004, std({ color: '#111' }), 0, 0.1, 0.024, fc);
  // drain stack + p-trap + the support brackets
  cyl(0.11, 0.11, Y - 0.1, std({ color: '#4a5058', roughness: 0.6 }), -0.1, (Y - 0.1) / 2, -0.12, g, 24);
  for (const x of [-0.6, 0.6]) box(0.04, 0.25, 0.4, std({ color: '#d8d8d4' }), x, Y - 0.12, -0.05, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
// the brown domed restroom bin with a swing flap and a crumpled paper towel on the lid
export function makeDomeBin() {
  const g = new THREE.Group(); g.name = 'dome_bin'; const br = std({ color: '#3a2a20', roughness: 0.45 });
  cyl(0.22, 0.2, 0.82, br, 0, 0.41, 0, g, 28); const d = new THREE.Mesh(new THREE.SphereGeometry(0.225, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), br); d.scale.y = 0.85; d.position.y = 0.82; d.castShadow = true; g.add(d);
  box(0.3, 0.12, 0.02, std({ color: '#1a120c' }), 0, 0.98, 0.17, g).rotation.x = -0.6;
  const tw = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), std({ color: '#c8a880', roughness: 1, flatShading: true })); tw.scale.set(1.4, 0.5, 1); tw.position.set(0.05, 1.0, 0.08); g.add(tw);
  g.userData.collider = [-0.23, 0.23, -0.23, 0.23];
  return g;
}
export function makeAccessPanel(s = 0.4) {
  const g = new THREE.Group(); g.name = 'access_panel'; const gr = std({ color: '#5a5e62', metalness: 0.5, roughness: 0.5 });
  box(s + 0.05, s + 0.05, 0.01, gr, 0, 0, 0.005, g); box(s - 0.02, s - 0.02, 0.012, gr, 0, 0, 0.012, g);
  const rust = std({ color: '#6a3a22', roughness: 0.9 }); box(s - 0.02, 0.006, 0.013, rust, 0, -(s - 0.02) / 2 + 0.003, 0.013, g); box(0.006, s - 0.04, 0.013, rust, -(s - 0.02) / 2 + 0.003, 0, 0.013, g);
  cyl(0.008, 0.008, 0.004, std({ color: '#1a1a1a' }), -s / 2 + 0.06, 0.02, 0.02, g, 12).rotation.x = Math.PI / 2;
  return g;
}
// a sports-ball plaque: a black steel square frame (set square or as a diamond), the ball medallion held by wire clips
export function makeSportsPlaque(ball = 'soccer', diamond = true) {
  const g = new THREE.Group(); g.name = 'plaque_' + ball; const blk = std({ color: '#1e1a18', metalness: 0.5, roughness: 0.6 }), brass = std({ color: '#c8a860', metalness: 0.8, roughness: 0.35 });
  const fr = new THREE.Group(); fr.rotation.z = diamond ? Math.PI / 4 : 0; g.add(fr); const S = 0.42, b = 0.03;
  for (const [w, h, x, y] of [[S, b, 0, S / 2], [S, b, 0, -S / 2], [b, S, S / 2, 0], [b, S, -S / 2, 0]]) box(w, h, 0.03, blk, x, y, 0.015, fr);
  const w = ball === 'football' ? 0.22 : 0.3, h = 0.3; const m = plane(w, h, std({ map: tex('b86_ball_' + ball), transparent: true, alphaTest: 0.5, roughness: 0.6 }), 0, 0, 0.04, 0, g); void m;
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), std({ color: '#2a2420' })); back.scale.x = w / 0.3; back.position.z = 0.035; g.add(back);
  for (const [x, y] of [[-0.12, 0.12], [0.12, 0.12], [-0.12, -0.12], [0.12, -0.12]]) rod(V(x * 1.0, y, 0.04), V(x * 1.4, y * 1.4, 0.035), 0.003, brass, g, 4);
  return g;
}
export function makeSoapDispenser() {
  const g = new THREE.Group(); g.name = 'soap_dispenser'; const wht = std({ color: '#f2f2ee', roughness: 0.25 });
  rbox(0.12, 0.26, 0.09, 0.03, wht, 0, 0, 0.045, g); const push = rbox(0.11, 0.09, 0.06, 0.03, wht, 0, 0.08, 0.1, g); push.rotation.x = 0.4;
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.025, 20), std({ color: '#3a6ab8', roughness: 0.2, transparent: true, opacity: 0.9 })); win.scale.y = 1.6; win.position.set(0, -0.05, 0.091); g.add(win);
  const pt = canvasT(64, 32, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#c8c8c4'; fitText(x, 'PUSH ▼', w / 2, 16, w - 6, 16, F.label); }); plane(0.05, 0.025, std({ map: pt, transparent: true }), 0, 0.1, 0.132, 0, g).rotation.x = -0.4;
  return g;
}
// stainless jumbo twin-roll toilet tissue dispenser: a stadium-shaped box with embossed rails + a slot, a tail of paper
export function makeJumboTPDispenser() {
  const g = new THREE.Group(); g.name = 'jumbo_tp_dispenser'; const st = std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3 });
  const sh = new THREE.Shape(); const L = 0.62, R = 0.17; sh.moveTo(-L / 2 + R, -R); sh.lineTo(L / 2 - R, -R); sh.absarc(L / 2 - R, 0, R, -Math.PI / 2, Math.PI / 2, false); sh.lineTo(-L / 2 + R, R); sh.absarc(-L / 2 + R, 0, R, Math.PI / 2, Math.PI * 1.5, false);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3, curveSegments: 20 }), st); m.castShadow = true; g.add(m);
  const em = new THREE.MeshStandardMaterial({ color: '#d8dce0', metalness: 0.85, roughness: 0.25 });
  for (const k of [0, 1]) { const r = R - 0.04 - k * 0.025; const c = new THREE.CatmullRomCurve3([V(-0.05, r, 0.138), V(L / 2 - R, r, 0.138), V(L / 2 - R + r * 0.95, 0.0, 0.138), V(L / 2 - R + r * 0.6, -r * 0.7, 0.138)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.005, 6), em)); const c2 = new THREE.CatmullRomCurve3([V(0.05, -r, 0.138), V(-L / 2 + R, -r, 0.138), V(-L / 2 + R - r * 0.95, 0, 0.138), V(-L / 2 + R - r * 0.6, r * 0.7, 0.138)]); g.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 30, 0.005, 6), em)); }
  box(0.16, 0.012, 0.005, std({ color: '#0a0a0a' }), 0, 0, 0.137, g);
  cyl(0.01, 0.01, 0.01, st, 0, R + 0.01, 0.06, g, 12);
  const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.4, 1, 6), std({ color: '#f8f8f6', roughness: 0.95, side: THREE.DoubleSide })); const p = tail.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.01 * Math.sin(p.getY(i) * 12)); tail.geometry.computeVertexNormals(); tail.position.set(-0.17, -R - 0.2, 0.09); g.add(tail);
  return g;
}
export function makeGrabBar(L = 1.06, vertical = false) {
  const g = new THREE.Group(); g.name = 'grab_bar'; const st = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.32 });
  const c = new THREE.CatmullRomCurve3([V(-L / 2, 0, 0), V(-L / 2 + 0.02, 0, 0.055), V(-L / 2 + 0.07, 0, 0.075), V(L / 2 - 0.07, 0, 0.075), V(L / 2 - 0.02, 0, 0.055), V(L / 2, 0, 0)], false, 'centripetal');
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.019, 12), st));
  for (const s of [-1, 1]) { const f = cyl(0.04, 0.04, 0.012, st, s * L / 2, 0, 0.006, g, 24); f.rotation.x = Math.PI / 2; }
  if (vertical) g.rotation.z = Math.PI / 2;
  return g;
}
// sharps container cabinet (all labels generic): cream lockable box, a red tinted window, a white rotating mouth on top
export function makeSharpsBox() {
  const g = new THREE.Group(); g.name = 'sharps_box'; const cream = std({ color: '#ece4d0', roughness: 0.45 });
  rbox(0.38, 0.3, 0.13, 0.01, cream, 0, 0, 0.065, g);
  const win = plane(0.13, 0.11, std({ color: '#8a2a20', roughness: 0.15, transparent: true, opacity: 0.9 }), -0.04, 0.05, 0.131, 0, g); void win;
  box(0.15, 0.13, 0.006, std({ color: '#e8e0cc' }), -0.04, 0.05, 0.128, g);
  const mouth = rbox(0.34, 0.07, 0.12, 0.01, std({ color: '#f8f8f4', roughness: 0.3, transparent: true, opacity: 0.92 }), 0, 0.18, 0.07, g); mouth.rotation.x = 0.15;
  const lab = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'SHARPS DISPOSAL', w / 2, 22, w - 20, 22, F.label); x.font = `12px ${F.small}`; ['used needles + lancets only', 'do not overfill · close when full', 'regulated medical waste'].forEach((l, i) => x.fillText(l, 12, 52 + i * 16)); x.fillStyle = '#f2b81a'; x.beginPath(); x.arc(206, 110, 34, 0, 7); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 4; for (let k = 0; k < 3; k++) { const a = k * 2.094 - Math.PI / 2; x.beginPath(); x.arc(206 + Math.cos(a) * 12, 110 + Math.sin(a) * 12, 11, 0, 7); x.stroke(); } x.beginPath(); x.arc(206, 110, 6, 0, 7); x.stroke(); });
  plane(0.12, 0.075, std({ map: lab }), 0.11, 0.05, 0.131, 0, g);
  const pl = canvasT(256, 48, (x, w, h) => { x.fillStyle = '#f8f8f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, '↑  PLACE SHARP HORIZONTALLY  ↑', w / 2, 24, w - 20, 20, F.label); }); const pm = plane(0.3, 0.05, std({ map: pl }), 0, 0.17, 0.132, 0, g); pm.rotation.x = 0.15;
  cyl(0.012, 0.012, 0.012, std({ color: '#c8ccd0', metalness: 0.9 }), 0.15, -0.05, 0.135, g, 12).rotation.x = Math.PI / 2;
  return g;
}
// fold-down baby-changing station (closed): a cream oval with a raised rim, the generic pictogram on a label, hinge tabs
export function makeChangingStation() {
  const g = new THREE.Group(); g.name = 'changing_station'; const cr = std({ color: '#f0e4c8', roughness: 0.4 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 40), cr); base.rotation.x = Math.PI / 2; base.scale.set(1, 1, 0.62); base.position.z = 0.05; base.castShadow = true; g.add(base);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 40), cr); lid.rotation.x = Math.PI / 2; lid.scale.set(1, 1, 0.55); lid.position.set(0, 0.02, 0.105); g.add(lid);
  const pic = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#fbf6e8'; x.beginPath(); x.ellipse(w / 2, h / 2, 120, 60, 0, 0, 7); x.fill(); x.fillStyle = '#5a5e62'; x.beginPath(); x.arc(150, 30, 10, 0, 7); x.fill(); x.fillRect(140, 42, 18, 46); x.save(); x.translate(150, 46); x.rotate(0.7); x.fillRect(-4, 0, 8, 40); x.restore(); x.fillRect(90, 74, 54, 10); x.beginPath(); x.arc(98, 66, 8, 0, 7); x.fill(); x.fillRect(104, 62, 30, 12); x.fillStyle = '#5a5e62'; fitText(x, 'BABY CHANGING STATION', w / 2, 108, 180, 12, F.label); });
  plane(0.3, 0.15, std({ map: pic, transparent: true }), 0, 0.03, 0.117, 0, g);
  for (const s of [-1, 1]) box(0.08, 0.06, 0.03, cr, s * 0.14, -0.22, 0.12, g);
  return g;
}
export function makeFloorDrain() { const g = new THREE.Group(); g.name = 'floor_drain'; const m = new THREE.Mesh(new THREE.CircleGeometry(0.075, 32), std({ map: tex('b86_drain'), transparent: true, alphaTest: 0.5, metalness: 0.6, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; g.add(m); return g; }
// flush-valve toilet: an elongated bowl lofted from ellipses, an open-front seat (raised), the chrome flush valve
export function makeFlushToilet(seatUp = true) {
  const g = new THREE.Group(); g.name = 'flush_toilet'; const por = phys({ color: '#fbfbf8', roughness: 0.12, clearcoat: 1 });
  const lp = []; for (let i = 0; i <= 16; i++) { const t = i / 16; lp.push(new THREE.Vector2(0.12 + 0.09 * Math.sin(t * Math.PI * 0.55) + (t > 0.85 ? 0.02 : 0), t * 0.4)); }
  const base = new THREE.Mesh(new THREE.LatheGeometry(lp, 36), por); base.scale.set(1, 1, 1.4); base.position.z = 0.32; base.castShadow = true; g.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 10, 36), por); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.4, 1); rim.position.set(0, 0.4, 0.32); g.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), phys({ color: '#dfe8ec', roughness: 0.05, transparent: true, opacity: 0.8 })); water.rotation.x = -Math.PI / 2; water.scale.set(1, 1.3, 1); water.position.set(0, 0.28, 0.36); g.add(water);
  rbox(0.34, 0.1, 0.16, 0.04, por, 0, 0.36, 0.08, g);
  // open-front seat: a C-shape (torus arc) + hinge posts; up = rotated to vertical against the flush pipe
  const seat = new THREE.Group(); seat.position.set(0, 0.43, 0.12); g.add(seat); const sm = std({ color: '#ffffff', roughness: 0.25 });
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 8, 28, Math.PI * 1.7), sm); c.rotation.z = Math.PI / 2 + Math.PI * 0.15; c.scale.set(1, 1.35, 0.5); c.rotation.x = Math.PI / 2; c.position.z = 0.22; seat.add(c);
  for (const s of [-1, 1]) box(0.05, 0.03, 0.05, sm, s * 0.08, 0, 0.0, seat);
  if (seatUp) seat.rotation.x = -1.45;
  // flush valve: chrome body, handle, stop, vacuum breaker pipe down into the bowl, the wall escutcheon
  const ch = std({ color: '#e4e8ec', metalness: 1, roughness: 0.1 }); const fv = new THREE.Group(); fv.position.set(0, 0.42, 0.02); g.add(fv);
  cyl(0.02, 0.02, 0.38, ch, 0, 0.19, 0, fv, 16); cyl(0.04, 0.04, 0.12, ch, 0, 0.42, 0, fv, 18); const top = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), ch); top.position.y = 0.48; fv.add(top);
  rod(V(0.0, 0.38, 0), V(-0.13, 0.38, 0.0), 0.009, ch, fv, 10); rod(V(0.03, 0.44, 0), V(0.12, 0.44, 0), 0.02, ch, fv, 14); cyl(0.04, 0.04, 0.01, ch, 0.13, 0.44, -0.03, fv, 20).rotation.x = Math.PI / 2;
  g.userData.collider = [-0.22, 0.22, 0, 0.62];
  return g;
}
// the restroom room: W x D, door wall at local z = 0 (door opening at x = -W/2 + 0.7), back wall at z = -D
export function makeRestroom(W = 3.0, D = 3.4) {
  const g = new THREE.Group(); g.name = 'restroom'; const cols = []; const H = 2.7;
  const wall = (w, rx) => b86Mat('b86_walltile', w / 1.2, H / 1.2, { roughness: 0.3 });
  const outer = std({ color: '#e8e4dc', roughness: 0.8 });
  // walls: inner tiled faces, outer painted
  plane(W, H, wall(W), 0, H / 2, -D + 0.01, 0, g); plane(D, H, wall(D), -W / 2 + 0.01, H / 2, -D / 2, Math.PI / 2, g); plane(D, H, wall(D), W / 2 - 0.01, H / 2, -D / 2, -Math.PI / 2, g);
  box(W + 0.2, H, 0.1, outer, 0, H / 2, -D - 0.05, g); box(0.1, H, D, outer, -W / 2 - 0.05, H / 2, -D / 2, g); box(0.1, H, D, outer, W / 2 + 0.05, H / 2, -D / 2, g);
  const DX = -W / 2 + 0.7;   // door centre
  box(W / 2 + DX - 0.52 + 0.1, H, 0.1, outer, (-W / 2 - 0.1 + DX - 0.52) / 2, H / 2, 0.05, g); box(W / 2 - DX - 0.52 + 0.1, H, 0.1, outer, (DX + 0.52 + W / 2 + 0.1) / 2, H / 2, 0.05, g); box(1.04, H - 2.22, 0.1, outer, DX, 2.22 + (H - 2.22) / 2, 0.05, g);
  plane(W / 2 + DX - 0.52, H, wall(1), (-W / 2 + DX - 0.52) / 2, H / 2, -0.01, Math.PI, g); plane(W / 2 - DX - 0.52, H, wall(1), (DX + 0.52 + W / 2) / 2, H / 2, -0.01, Math.PI, g);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#f2f0ea' })); cl.rotation.x = Math.PI / 2; cl.position.set(0, H, -D / 2); g.add(cl);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), b86Mat('b86_floortile', W / 0.9, D / 0.9, { roughness: 0.35 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.012, -D / 2); fl.receiveShadow = true; g.add(fl);
  for (const [w, x, z, ry] of [[W, 0, -D + 0.03, 0], [D, -W / 2 + 0.03, -D / 2, Math.PI / 2], [D, W / 2 - 0.03, -D / 2, Math.PI / 2]]) { const b = box(w, 0.05, 0.03, std({ color: '#8a8a7a', metalness: 0.4 }), x, 0.025, z, g); b.rotation.y = ry; }
  const lt = new THREE.PointLight('#fff4e4', 5, 6, 1.5); lt.position.set(0, H - 0.3, -D / 2); g.add(lt); box(0.6, 0.04, 0.6, std({ color: '#fff', emissive: '#fff8ee', emissiveIntensity: 1.5 }), 0, H - 0.02, -D / 2, g);
  // fixtures: toilet in the back-right corner with grab bars, the TP dispenser + sharps box on the right wall, the
  // changing station on the back wall, the vanity + bin + soap on the left wall, plaques above, access panels, a drain
  const put = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o; };
  put(makeFlushToilet(true), W / 2 - 0.5, 0, -D, 0);
  put(makeGrabBar(1.06), W / 2 - 0.6, 0.86, -D + 0.005, 0);
  const sb = put(makeGrabBar(1.06), W / 2 - 0.005, 0.86, -D + 1.0, -Math.PI / 2); void sb;
  put(makeJumboTPDispenser(), W / 2 - 0.005, 0.95, -D + 1.55, -Math.PI / 2).scale.setScalar(0.85);
  const vb = makeGrabBar(0.46, true); put(vb, W / 2 - 0.005, 1.15, -D + 1.95, -Math.PI / 2);
  put(makeSharpsBox(), W / 2 - 0.005, 1.45, -D + 2.6, -Math.PI / 2);
  put(makeChangingStation(), -0.45, 1.25, -D + 0.005, 0);
  put(makeAccessPanel(0.36), W / 2 - 0.5, 1.75, -D + 0.005, 0);
  put(makeVanity(), -W / 2 + 0.28, 0, -D / 2 - 0.25, Math.PI / 2);
  put(makeDomeBin(), -W / 2 + 0.3, 0, -D / 2 + 0.75);
  put(makeSoapDispenser(), -W / 2 + 0.005, 1.3, -D / 2 - 0.62, Math.PI / 2);
  const mirror = plane(1.2, 0.8, std({ color: '#c8d2d6', metalness: 0.35, roughness: 0.08, emissive: '#3a4448', emissiveIntensity: 0.6 }), -W / 2 + 0.012, 1.55, -D / 2 - 0.25, Math.PI / 2, g); void mirror;
  [['soccer', true], ['football', false], ['baseball', true]].forEach(([b, dia], i) => put(makeSportsPlaque(b, dia), -0.85 + i * 0.55 + 0.2, 1.95, -D + 0.005, 0));
  put(makeAccessPanel(0.34), -W / 2 + 0.005, 0.7, -0.6, Math.PI / 2);
  put(makeFloorDrain(), 0.1, 0.012, -D / 2 - 0.3);
  const ews = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e4ab8'; fitText(x, 'Employees Must', w / 2, 34, w - 30, 26, F.label); fitText(x, 'Wash Hands', w / 2, 68, w - 30, 26, F.label); });
  plane(0.16, 0.06, std({ map: ews }), -W / 2 + 0.012, 1.05, -D / 2 - 0.8, Math.PI / 2, g);
  const door = makeLouvreDoor(1.2); door.position.set(DX, 0, 0.05); g.add(door);
  const sign = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 60, 22, 0, 7); x.fill(); x.fillRect(104, 90, 48, 80); x.fillRect(108, 170, 16, 60); x.fillRect(132, 170, 16, 60); fitText(x, 'RESTROOM', w / 2, 240, w - 30, 22, F.label); });
  plane(0.22, 0.22, std({ map: sign }), DX + 0.75, 1.55, 0.11, 0, g);
  cols.push([-W / 2 - 0.1, -W / 2, -D, 0.1], [W / 2, W / 2 + 0.1, -D, 0.1], [-W / 2, W / 2, -D - 0.1, -D], [-W / 2, DX - 0.5, -0.02, 0.1], [DX + 0.5, W / 2, -0.02, 0.1]);
  cols.push([W / 2 - 0.72, W / 2 - 0.28, -D, -D + 0.66], [-W / 2, -W / 2 + 0.58, -D / 2 - 0.95, -D / 2 + 0.45], [-W / 2 + 0.07, -W / 2 + 0.53, -D / 2 + 0.52, -D / 2 + 0.98]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -W / 2 + 0.2, maxX: W / 2 - 0.2, minZ: -D + 0.2, maxZ: 0.6 }];
  return g;
}

// ---- back-room pieces -----------------------------------------------------------------------------------------------
// a pallet of brown paper-sack cases: two wrapped layers of four, two loose layers on top, white case labels, a marker number
export function makePaperSackPallet() {
  const g = new THREE.Group(); g.name = 'paper_sack_pallet'; const r = rng(86);
  const pw = std({ color: '#1e4ab8', roughness: 0.7 }), wood = std({ color: '#8a6a48', roughness: 0.9 });
  for (let i = 0; i < 7; i++) box(0.14, 0.02, 1.0, i % 3 ? wood : pw, -0.55 + i * 0.183, 0.135, 0, g); for (const z of [-0.42, 0, 0.42]) box(1.2, 0.1, 0.1, pw, 0, 0.06, z, g);
  const lab = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'HEARTH MARKET', w / 2, 24, w - 30, 22, F.label); ['1/7 BBL', 'PAPER SACK', '400 ct · recycled kraft'].forEach((l, i) => fitText(x, l, w / 2, 56 + i * 26, w - 40, 20, F.label)); let px = 30; while (px < w - 30) { const bw = 1 + Math.floor(r() * 4); x.fillRect(px, 136, bw, 18); px += bw + 2; } });
  const kraft = std({ color: '#b8946a', roughness: 0.95 }), labM = std({ map: lab, roughness: 0.8 });
  const caseBox = (x, y, z, w, h, d, rot) => { const b = box(w, h, d, [kraft, kraft, kraft, kraft, labM, kraft], x, y + h / 2, z, g); b.rotation.y = rot; return b; };
  let y = 0.145;
  for (let k = 0; k < 2; k++) { for (let i = 0; i < 4; i++) caseBox(-0.45 + i * 0.3, y, 0.22, 0.29, 0.36, 0.45, 0); for (let i = 0; i < 4; i++) caseBox(-0.45 + i * 0.3, y, -0.24, 0.29, 0.36, 0.45, Math.PI); y += 0.36; }
  const wrap = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.74, 0.96), phys({ color: '#fff', transparent: true, opacity: 0.12, roughness: 0.1, clearcoat: 1, depthWrite: false })); wrap.position.y = 0.145 + 0.37; g.add(wrap);
  const num = canvasT(128, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#111'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(20, 20); x.lineTo(20, 80); x.moveTo(50, 20); x.lineTo(50, 80); x.moveTo(70, 22); x.lineTo(110, 22); x.lineTo(84, 80); x.stroke(); });
  plane(0.16, 0.12, std({ map: num, transparent: true }), -0.45, 0.145 + 0.58, 0.45, 0, g);
  for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { const b = caseBox(-0.48 + i * 0.32 + (r() - 0.5) * 0.04, y, 0.05 + (r() - 0.5) * 0.06, 0.3, 0.34, 0.42, (r() - 0.5) * 0.1); b.rotation.z = (r() - 0.5) * 0.03; if (k === 1) b.position.y += 0.34; }
  g.userData.collider = [-0.62, 0.62, -0.5, 0.5];
  return g;
}
// an autonomous ride-on floor scrubber (generic): teal body, grey deck + recovery tank, black seat + steering wheel, a
// sensor head on the front column with an orange-finned camera, amber beacon, side brush, a spray bottle taped on
export function makeFloorScrubber() {
  const g = new THREE.Group(); g.name = 'floor_scrubber'; const teal = std({ color: '#2a8a96', roughness: 0.55 }), grey = std({ color: '#5a5e62', roughness: 0.6 }), blk = std({ color: '#141416', roughness: 0.5 });
  rbox(0.85, 0.45, 1.5, 0.08, grey, 0, 0.33, 0, g); rbox(0.9, 0.5, 0.9, 0.08, teal, 0, 0.7, -0.25, g); rbox(0.85, 0.28, 0.75, 0.08, grey, 0, 1.08, -0.35, g);
  const col = rbox(0.7, 1.0, 0.35, 0.08, teal, 0, 0.85, 0.6, g); void col;
  const sens = new THREE.Group(); sens.position.set(0, 1.25, 0.78); g.add(sens); box(0.36, 0.28, 0.06, blk, 0, 0, 0, sens);
  const fins = canvasT(128, 96, (x, w, h) => { x.fillStyle = '#e8702a'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a3a0a'; for (let i = 0; i < 12; i++) x.fillRect(4 + i * 10, 6, 4, h - 12); x.fillStyle = '#1a1a1c'; x.fillRect(34, 26, 60, 44); x.fillStyle = '#3ab8e8'; x.fillRect(42, 34, 44, 28); });
  plane(0.26, 0.18, std({ map: fins, emissive: '#3ab8e8', emissiveIntensity: 0.15 }), 0, 0.02, 0.031, 0, sens);
  const bz = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#1a1a1c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8702a'; fitText(x, 'autopilot', w / 2, 52, w - 40, 40, F.rounded); });
  plane(0.28, 0.1, std({ map: bz }), 0, 0.98, 0.776, 0, g);
  for (const s of [-1, 1]) { const arm = rbox(0.2, 0.12, 0.3, 0.05, teal, s * 0.4, 1.38, 0.65, g); void arm; }
  const seat = new THREE.Group(); seat.position.set(0, 1.25, -0.2); g.add(seat); rbox(0.45, 0.08, 0.42, 0.04, blk, 0, 0, 0, seat); const bk = rbox(0.45, 0.42, 0.08, 0.04, blk, 0, 0.24, -0.22, seat); bk.rotation.x = -0.15;
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 28), blk); wheel.position.set(0, 1.45, 0.38); wheel.rotation.x = -1.0; g.add(wheel); rod(V(0, 1.2, 0.48), V(0, 1.43, 0.4), 0.02, blk, g);
  const bc = cyl(0.05, 0.06, 0.12, std({ color: '#f2a01a', emissive: '#f28a1a', emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }), 0, 1.3, -0.7, g, 16); void bc;
  for (const [x, z] of [[-0.38, -0.55], [0.38, -0.55]]) { const w = cyl(0.12, 0.12, 0.08, blk, x, 0.12, z, g, 18); w.rotation.z = Math.PI / 2; }
  const brush = cyl(0.28, 0.28, 0.06, std({ color: '#1a1a1a', roughness: 1 }), 0.3, 0.05, 0.7, g, 28); void brush;
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; rod(V(0.3 + Math.cos(a) * 0.24, 0.05, 0.7 + Math.sin(a) * 0.24), V(0.3 + Math.cos(a) * 0.34, 0.01, 0.7 + Math.sin(a) * 0.34), 0.004, std({ color: '#141414' }), g, 3); }
  box(0.9, 0.05, 0.12, std({ color: '#2a2a2c' }), 0, 0.04, -0.82, g);   // squeegee
  const sp = new THREE.Group(); sp.position.set(-0.36, 0.75, 0.75); g.add(sp); cyl(0.04, 0.045, 0.18, std({ color: '#f4f6f8', transparent: true, opacity: 0.8 }), 0, 0, 0, sp, 14); box(0.03, 0.08, 0.06, std({ color: '#f4f4f0' }), 0, 0.12, 0.02, sp); box(0.12, 0.05, 0.005, std({ color: '#d81e1e' }), 0.0, -0.03, 0.05, sp);
  g.userData.collider = [-0.47, 0.47, -0.9, 1.0];
  return g;
}
// the standing A-frame wet-floor sign (bilingual), legs apart, handle cut-out on top
export function makeWetFloorStanding() {
  const g = new THREE.Group(); g.name = 'wet_floor_standing'; const yel = std({ color: '#f2d81a', roughness: 0.4 });
  const t = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#f2d81a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.fillRect(30, 150, w - 60, 46); x.fillStyle = '#f2d81a'; fitText(x, 'CAUTION', w / 2, 174, w - 80, 40, F.heavy); x.fillStyle = '#111'; fitText(x, 'WET FLOOR', w / 2, 226, w - 50, 40, F.heavy);
    x.strokeStyle = '#d81e1e'; x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2, 250); x.lineTo(w / 2 + 80, 380); x.lineTo(w / 2 - 80, 380); x.closePath(); x.stroke(); x.fillStyle = '#111'; x.beginPath(); x.arc(w / 2 + 6, 290, 8, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = '#111'; x.beginPath(); x.moveTo(w / 2 + 4, 300); x.lineTo(w / 2 - 6, 335); x.lineTo(w / 2 + 16, 355); x.moveTo(w / 2 - 6, 335); x.lineTo(w / 2 - 30, 352); x.moveTo(w / 2 + 2, 310); x.lineTo(w / 2 + 28, 318); x.stroke(); x.fillRect(w / 2 - 50, 362, 100, 4);
    x.fillStyle = '#111'; x.fillRect(40, 392, w - 80, 40); x.fillStyle = '#f2d81a'; fitText(x, 'CUIDADO', w / 2, 413, w - 100, 34, F.heavy); x.fillStyle = '#111'; fitText(x, 'PISO MOJADO', w / 2, 458, w - 50, 34, F.heavy); });
  const panelS = new THREE.Shape(); panelS.moveTo(-0.15, 0); panelS.lineTo(-0.11, 0); panelS.lineTo(-0.11, 0.05); panelS.lineTo(0.11, 0.05); panelS.lineTo(0.11, 0); panelS.lineTo(0.15, 0); panelS.lineTo(0.15, 0.62); panelS.lineTo(-0.15, 0.62); panelS.closePath(); const hp = new THREE.Path(); hp.moveTo(-0.08, 0.53); hp.lineTo(0.08, 0.53); hp.lineTo(0.08, 0.6); hp.lineTo(-0.08, 0.6); hp.closePath(); panelS.holes.push(hp);
  const pg = new THREE.ExtrudeGeometry(panelS, { depth: 0.012, bevelEnabled: false }); const uv = pg.attributes.uv, ps = pg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (ps.getX(i) + 0.15) / 0.3, ps.getY(i) / 0.62);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(pg, [std({ map: t, roughness: 0.4 }), yel]); p.position.set(0, 0, 0); p.rotation.x = s * 0.17; p.rotation.y = s > 0 ? 0 : Math.PI; p.position.z = s * 0.006; p.castShadow = true; g.add(p); }
  g.userData.collider = [-0.17, 0.17, -0.12, 0.12];
  return g;
}
// brushed stainless wall panels (2 x 1.2 m): seams with a stapled tape strip, one panel torn and taped
export function makeStainlessWall(L = 4.8, H = 2.4) {
  const g = new THREE.Group(); g.name = 'stainless_wall'; const m = b86Mat('b86_stainless', L / 1.2, H / 2.4, { metalness: 0.25, roughness: 0.3 }); m.color.setRGB(1.3, 1.62, 1.84);   // (the photo was taken under warm light: cooled back to steel, and less mirror so it doesn't go dark at night)
  box(L, H, 0.03, m, 0, H / 2, 0, g);
  for (let x = -L / 2 + 1.2; x < L / 2 - 0.1; x += 1.2) { box(0.004, H, 0.002, std({ color: '#5a5e62' }), x, H / 2, 0.016, g);
    if (Math.abs(x) < 0.7) for (let i = 0; i < 26; i++) box(0.025, 0.0025, 0.002, std({ color: '#d8dce0', metalness: 0.9 }), x + (i % 2 ? 0.003 : -0.003), 0.15 + i * 0.085, 0.018, g); }
  const tear = canvasT(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(40,40,40,0.9)'; x.lineWidth = 3; x.beginPath(); x.moveTo(60, 100); x.bezierCurveTo(90, 70, 150, 80, 170, 110); x.lineTo(176, 180); x.lineTo(70, 182); x.stroke(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(50, 92, 140, 16); x.fillRect(70, 170, 150, 18); x.fillStyle = 'rgba(200,220,200,0.6)'; x.fillRect(160, 172, 20, 14); });
  plane(0.4, 0.4, std({ map: tear, transparent: true, depthWrite: false }), 1.6, 1.2, 0.017, 0, g);
  g.userData.collider = [-L / 2, L / 2, -0.03, 0.03];
  return g;
}
export function makeDockPlate(w = 1.6, d = 1.2) { const g = new THREE.Group(); g.name = 'dock_plate'; const m = b86Mat('b86_greentread', w / 0.6, d / 0.6, { metalness: 0.35, roughness: 0.55 }); box(w, 0.012, d, m, 0, 0.006, 0, g); for (const s of [-1, 1]) box(w, 0.006, 0.05, std({ color: '#f2c21a' }), 0, 0.013, s * (d / 2 - 0.04), g); return g; }
