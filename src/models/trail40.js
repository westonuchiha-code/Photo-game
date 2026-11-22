// Nature trail (queue item 40, photos/trail/). A patch of hillside forest, 34 x 26 m, entered from the east.
// Ground, moss, cobble, clay, gravel and bark are the photos' own surfaces (tools/tex_40.py).
//   - a leaf-litter trail winding west between ferns and thin trees, red-clay banks with exposed roots
//   - a stand of straight cedars and a giant cedar wrapped in a straw rope with zig-zag paper streamers
//   - a cobble path with moss carpet, three rounded cobble steps up to a terrace held by dry-stone walls;
//     on the terrace the weathered stone relief (the photo itself) with two teal offering cups and a coin
//   - a rope fence on wooden posts along the drop with a made-up DANGER board
//   - a concrete stair climbing the bank, a drain channel with a grate, a handrail and an original cartoon
//     "watch your step" sign
//   - a junk pile on the gravel spur: blue crates, a cooler, cones, buckets, wheel rims
//   - an overlook at the far end behind a wire fence
// Local frame: entrance at the origin, trail runs toward -x; north is -z. Ground y = 0 except the terrace.
// userData: colliders [[x0,x1,z0,z1]], area {minX..maxZ}, floorY(x, z) -> height or null
import * as THREE from 'three';
import { crownSprays, leafBlob } from './trees.js';
import { F, fitText } from '../fonts.js';
import { makeBlueCrate } from './grime39.js';
import { makeSnackPile, makeSodaCan, makeCandyPouch } from './snacks43.js';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.9, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, p, seg = 12) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; p.add(m); return m; }
function tube(pts, r, mat, p, seg = 20) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 6), mat); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// a flat ground patch following a polyline (ribbon), lifted a hair to avoid z-fighting
function ribbon(pts, width, mat, y, p, uvScale = 1.5) {
  const pos = [], uv = [], idx = []; let acc = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    if (i) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const w = width * (0.85 + 0.3 * Math.sin(i * 1.7));
    pos.push(pts[i][0] + nx * w / 2, y, pts[i][1] + nz * w / 2, pts[i][0] - nx * w / 2, y, pts[i][1] - nz * w / 2); uv.push(0, acc / uvScale, width / uvScale, acc / uvScale);
  }
  for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; p.add(m); return m;
}
// ---- plants
let _frond = null;
function frondTex() {
  if (_frond) return _frond;
  _frond = canvasT(128, 512, (x) => {
    x.clearRect(0, 0, 128, 512); x.strokeStyle = '#4a6a24'; x.lineWidth = 4; x.beginPath(); x.moveTo(64, 512); x.lineTo(64, 6); x.stroke();
    for (let i = 0; i < 26; i++) { const y = 500 - i * 19, l = 54 * Math.sin(Math.PI * (i + 2) / 30); for (const s of [-1, 1]) { x.fillStyle = i % 2 ? '#5e8a2c' : '#6f9a34'; x.beginPath(); x.moveTo(64, y); x.quadraticCurveTo(64 + s * l * 0.6, y - 14, 64 + s * l, y - 22); x.quadraticCurveTo(64 + s * l * 0.5, y - 4, 64, y - 8); x.fill(); } }
  });
  return _frond;
}
function fern(r, scale = 1) {
  const g = new THREE.Group(); const m = std({ map: frondTex(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 });
  const n = 9 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    const L = (0.55 + r() * 0.35) * scale, geo = new THREE.PlaneGeometry(0.22 * scale, L, 1, 6); geo.translate(0, L / 2, 0);
    const p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const t = p.getY(k) / L; p.setZ(k, t * t * L * 0.55); } geo.computeVertexNormals();
    const f = new THREE.Mesh(geo, m); f.rotation.y = (i / n) * Math.PI * 2 + r() * 0.4; f.rotation.x = -0.35 - r() * 0.3; f.castShadow = true; g.add(f);
  }
  return g;
}
function cedar(r, h, barkMat, canopyMat) {
  const g = new THREE.Group(); const rad = 0.16 + r() * 0.12;
  const t = cyl(rad * 0.55, rad, h, barkMat, g, 10); t.position.y = h / 2;
  // dark, narrow crown high up (layered cones), like the cedar plantations in the photos
  // (polish: the crown is needle sprays from the spruce photo, three shared variants, instead of flat green cones)
  { const cs = crownSprays(1 + Math.floor(r() * 3), 5.5, 1.5); const c = new THREE.Mesh(cs.geo, cs.mat); c.position.y = h - 4.6; c.rotation.y = r() * 6.28; c.scale.setScalar(0.9 + r() * 0.3); c.castShadow = true; g.add(c); }
  return g;
}
function thinTree(r, h, barkMat, leafMat) {
  const g = new THREE.Group(); const lean = (r() - 0.5) * 0.25;
  const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * 1.5, h * 0.4, 0.1), new THREE.Vector3(lean * 3, h * 0.75, -0.1), new THREE.Vector3(lean * 3.5, h, 0)];
  tube(pts, 0.07 + r() * 0.04, barkMat, g, 16);
  for (let i = 0; i < 4; i++) { const lb = leafBlob(1 + (i % 3)); const b = new THREE.Mesh(lb.geo, lb.mat); b.position.set(lean * 3 + (r() - 0.5) * 1.6, h * (0.75 + r() * 0.3), (r() - 0.5) * 1.6); b.scale.setScalar(1.1 + r() * 0.7); b.scale.y *= 0.7; b.rotation.y = r() * 6.28; b.castShadow = true; g.add(b); }
  return g;
}
// ---- signs
function dangerBoard() {
  return canvasT(512, 256, (x) => {
    x.fillStyle = '#d9b07a'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 30; i++) { x.strokeStyle = `rgba(110,70,30,${0.15 + Math.random() * 0.2})`; x.beginPath(); x.moveTo(0, Math.random() * 256); x.bezierCurveTo(170, Math.random() * 256, 340, Math.random() * 256, 512, Math.random() * 256); x.stroke(); }
    x.fillStyle = '#b81a1a'; x.fillRect(20, 20, 472, 100); x.fillStyle = '#fff'; fitText(x, 'DANGER', 256, 72, 440, 90, F.stencil, { spacing: 10 });
    x.fillStyle = '#2a1a0a'; fitText(x, '危険 · STEEP DROP · KEEP OUT', 256, 170, 460, 40, F.label, { spacing: 2 }); fitText(x, 'TRAIL STEWARDS', 256, 222, 300, 26, F.small, { spacing: 4 });
  });
}
function cartoonSign() {
  return canvasT(256, 768, (x) => {
    x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, 256, 768); x.fillStyle = '#f2c21a'; x.fillRect(0, 0, 256, 120);
    x.fillStyle = '#1a1a1a'; fitText(x, '足元注意', 128, 62, 230, 62, F.antique, { spacing: 6 });
    x.fillStyle = '#333'; x.font = `22px ${F.small}`; x.textAlign = 'center'; ['THE STEPS ARE', 'STEEP AND WET', 'AFTER RAIN.', 'PLEASE HOLD', 'THE RAIL.'].forEach((t, i) => x.fillText(t, 128, 180 + i * 34));
    // original cartoon: a round worried hiker with a cap, holding a rail
    x.save(); x.translate(128, 560);
    x.fillStyle = '#f6d0a8'; x.beginPath(); x.arc(0, 0, 70, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 5; x.stroke();
    x.fillStyle = '#2a7ad0'; x.beginPath(); x.arc(0, -30, 72, Math.PI * 1.08, Math.PI * 1.92); x.fill(); x.fillRect(-10, -48, 95, 16);
    x.fillStyle = '#222'; x.beginPath(); x.arc(-24, 8, 8, 0, 7); x.arc(24, 8, 8, 0, 7); x.fill();
    x.lineWidth = 5; x.beginPath(); x.arc(0, 44, 18, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
    x.fillStyle = '#7ac8f0'; x.beginPath(); x.moveTo(62, -10); x.quadraticCurveTo(76, 12, 62, 22); x.quadraticCurveTo(50, 12, 62, -10); x.fill();
    x.restore();
    x.fillStyle = '#c81e28'; fitText(x, 'WATCH YOUR STEP', 128, 720, 230, 34, F.heavy);
  });
}

export function makeTrail() {
  const g = new THREE.Group(); g.name = 'nature_trail';
  const colliders = [], col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);
  const r = rng(40);
  const X0 = -34, X1 = 0, Z0 = -26, Z1 = 0;
  // ---- ground: leaf litter everywhere, the trail itself in clay + gravel, moss carpets
  const leaf = std({ map: tex('tr_leaf', 12, 9) });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 + 4, Z1 - Z0 + 4), leaf); gr.rotation.x = -Math.PI / 2; gr.position.set((X0 + X1) / 2, 0.004, (Z0 + Z1) / 2); gr.receiveShadow = true; g.add(gr);
  const trailPts = [[1.5, -1.6], [-2, -2.2], [-5, -3.6], [-8, -4.2], [-11, -5.6], [-13.5, -8], [-15, -10.8], [-17.5, -12.6], [-21, -13.2], [-24, -15], [-26.5, -17.8], [-28.5, -20.5], [-30.5, -22.5]];
  ribbon(trailPts, 1.8, std({ map: tex('tr_clay', 1, 1) }), 0.008, g, 2);
  ribbon([[-17.5, -12.6], [-17.8, -15.5], [-17.2, -18.5], [-16.2, -21.5], [-15.5, -24.5]], 1.6, std({ map: tex('tr_gravel', 1, 1) }), 0.009, g, 2);      // gravel spur to the junk
  // ---- cedar stand + thin trees (kept off the trail), ferns, fallen leaves
  const bark = std({ map: tex('tr_cedar', 1, 3), roughness: 0.95 }), canopy = std({ color: '#1f3a22', roughness: 1 });
  const thinBark = std({ map: tex('bark_pale', 1, 4), color: '#9a8a7a', roughness: 0.9 }), leaves = std({ color: '#4a6a30', roughness: 1 });
  const nearTrail = (x, z, d) => trailPts.some(([px, pz]) => Math.hypot(px - x, pz - z) < d);
  let placed = 0;
  for (let i = 0; i < 160 && placed < 46; i++) {
    const x = X0 + 1 + r() * (X1 - X0 - 2), z = Z0 + 1 + r() * (Z1 - Z0 - 2);
    if (nearTrail(x, z, 2.2) || (x > -12 && x < -3 && z < -12 && z > -22) || (x > -26 && x < -19 && z > -9) || (x < -27 && z < -20)) continue;
    const t = r() < 0.6 ? cedar(r, 13 + r() * 6, bark, canopy) : thinTree(r, 6 + r() * 4, thinBark, leaves);
    t.position.set(x, 0, z); g.add(t); col(x - 0.3, x + 0.3, z - 0.3, z + 0.3); placed++;
  }
  for (let i = 0; i < 70; i++) {
    const x = X0 + r() * (X1 - X0), z = Z0 + r() * (Z1 - Z0);
    if (nearTrail(x, z, 1.1) || (x > -12 && x < -3 && z < -12 && z > -22)) continue;
    const f = fern(r, 0.8 + r() * 0.6); f.position.set(x, 0, z); g.add(f);
  }
  // ---- the forest continues past the edges: a dense ring of cedars on rising ground, so the trail reads as
  // a path through woods rather than a lot with trees on it (no colliders: they're beyond the walkable area)
  const hillM = std({ map: tex('tr_leaf', 10, 3), color: '#6a5a48' });
  for (const [cx, cz, w, ry] of [[(X0 + X1) / 2, Z0 - 5, X1 - X0 + 20, 0], [X0 - 5, (Z0 + Z1) / 2, Z1 - Z0 + 14, Math.PI / 2]]) {
    const hill = new THREE.Mesh(new THREE.PlaneGeometry(w, 14, 20, 4), hillM); const hp = hill.geometry.attributes.position;
    for (let i = 0; i < hp.count; i++) hp.setZ(i, 0.6 * Math.sin(hp.getX(i) * 0.4) * Math.cos(hp.getY(i) * 0.5)); hill.geometry.computeVertexNormals();
    hill.rotation.order = 'YXZ'; hill.rotation.y = ry; hill.rotation.x = -Math.PI / 2 + 0.45; hill.position.set(cx, 3, cz); hill.receiveShadow = true; g.add(hill);
  }
  for (let i = 0; i < 70; i++) {
    const side = i % 3; let x, z, y;
    if (side < 2) { x = X0 - 6 + r() * (X1 - X0 + 10); z = Z0 - 1.5 - r() * 9; y = (Z0 - z) * 0.48; } else { x = X0 - 1.5 - r() * 9; z = Z0 - 4 + r() * (Z1 - Z0 + 6); y = (X0 - x) * 0.48; }
    const t = cedar(r, 14 + r() * 7, bark, canopy); t.position.set(x, y - 0.5, z); g.add(t);
  }
  // ---- the giant cedar with its straw rope and paper streamers, beside the trail
  const GC = [-9, -1.2];
  const big = cyl(0.75, 1.15, 26, std({ map: tex('tr_cedar', 3, 6), roughness: 0.95 }), g, 24); big.position.set(GC[0], 13, GC[1]);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; tube([new THREE.Vector3(GC[0] + Math.cos(a) * 0.9, 0.9, GC[1] + Math.sin(a) * 0.9), new THREE.Vector3(GC[0] + Math.cos(a) * 1.5, 0.25, GC[1] + Math.sin(a) * 1.5), new THREE.Vector3(GC[0] + Math.cos(a) * 1.9, 0.02, GC[1] + Math.sin(a) * 1.9)], 0.14, std({ color: '#5a4030' }), g, 10); }
  { const cs = crownSprays(7, 8, 3.2); const c = new THREE.Mesh(cs.geo, cs.mat); c.position.set(GC[0], 19.5, GC[1]); c.scale.setScalar(1.5); g.add(c); }
  const rope = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 40), std({ color: '#c8b07a' })); rope.rotation.x = Math.PI / 2; rope.position.set(GC[0], 2.2, GC[1]); g.add(rope);
  const shideM = std({ color: '#f6f4ee', side: THREE.DoubleSide, roughness: 0.8 });
  for (let k = 0; k < 4; k++) {
    const a = k / 4 * Math.PI * 2 + 0.5; const sg = new THREE.Shape(); sg.moveTo(0, 0); sg.lineTo(0.06, 0); sg.lineTo(0.06, -0.08); sg.lineTo(0.0, -0.1); sg.lineTo(0.0, -0.18); sg.lineTo(0.06, -0.2); sg.lineTo(0.06, -0.3); sg.lineTo(0, -0.3); sg.lineTo(0, -0.22); sg.lineTo(-0.06, -0.2); sg.lineTo(-0.06, -0.1); sg.lineTo(0, -0.08); sg.closePath();
    const s = new THREE.Mesh(new THREE.ShapeGeometry(sg), shideM); s.position.set(GC[0] + Math.cos(a) * 1.04, 2.18, GC[1] + Math.sin(a) * 1.04); s.rotation.y = -a + Math.PI / 2; g.add(s);
  }
  col(GC[0] - 1.2, GC[0] + 1.2, GC[1] - 1.2, GC[1] + 1.2);
  // ---- clay bank with exposed roots on the north side of the trail
  const clay = std({ map: tex('tr_clay', 3, 1.5) });
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2, 16, 4), clay); const bp = bank.geometry.attributes.position;
  for (let i = 0; i < bp.count; i++) bp.setZ(i, 0.25 * Math.sin(bp.getX(i) * 1.3) + (bp.getY(i) + 1.1) * 0.0);
  bank.geometry.computeVertexNormals(); bank.position.set(-5.5, 1.0, -6.6); bank.rotation.x = -0.45; bank.receiveShadow = true; g.add(bank);
  const rootM = std({ color: '#6a4a2e', roughness: 0.9 });
  for (let i = 0; i < 9; i++) { const x = -9 + i * 0.9 + r() * 0.3; tube([new THREE.Vector3(x, 1.7, -7.2), new THREE.Vector3(x + 0.2, 0.9, -6.6), new THREE.Vector3(x + 0.1 + r() * 0.4, 0.1, -5.6 + r() * 0.4), new THREE.Vector3(x + 0.6 * (r() - 0.5), 0.02, -5.0 + r() * 0.3)], 0.03 + r() * 0.03, rootM, g, 16); }
  for (const x of [-8, -4.2]) { const t = cyl(0.22, 0.32, 12, std({ map: tex('tr_cedar', 1, 3) }), g, 12); t.position.set(x, 6.8, -7.3); col(x - 0.4, x + 0.4, -7.7, -6.9); }
  col(-9.5, -1.5, -8.0, -6.9);
  // ---- cobble path, moss carpet, three cobble steps up to the terrace (dry-stone walls) with the relief
  const cob = std({ map: tex('tr_cobble', 2, 1), roughness: 0.85 }), moss = std({ map: tex('tr_moss', 2, 2) });
  ribbon([[-3.5, -12], [-5, -14.5], [-6.5, -16.5]], 2.2, cob, 0.012, g, 2.2);
  for (const [x, z, w, d] of [[-4.3, -13.5, 2.6, 2.4], [-9.3, -14.2, 3.2, 3.0], [-3.2, -17.8, 1.8, 2.6]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), moss); m.rotation.x = -Math.PI / 2; m.rotation.z = r(); m.position.set(x, 0.011, z); m.receiveShadow = true; g.add(m); }
  // steps: rounded cobble risers stepping up 0.15 each toward the terrace (z -17.6 .. -21.6, x -10..-4)
  const TER = { x0: -10, x1: -4, z0: -21.8, z1: -18.2, y: 0.45 };
  const stoneM = std({ map: tex('tr_cobble', 1, 0.5), roughness: 0.85 });
  const cobbleRock = ['#8a8478', '#9a958a', '#7a756c'].map((c) => std({ color: c, roughness: 0.8, flatShading: true }));
  for (let i = 0; i < 3; i++) {
    const z = -16.9 - i * 0.45, y = 0.15 * (i + 1);
    box(5.6, y, 0.45, stoneM, -7, y / 2, z, g);
    for (let k = 0; k < 14; k++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.17 + r() * 0.07, 1), stoneM); s.material = cobbleRock[k % 3]; s.scale.set(1.1 + r() * 0.3, 0.32, 0.8); s.rotation.y = r() * 3; s.position.set(-9.6 + k * 0.4 + (r() - 0.5) * 0.08, y - 0.02, z + 0.17); s.castShadow = true; g.add(s); }
  }
  box(TER.x1 - TER.x0, TER.y, TER.z1 - TER.z0, std({ map: tex('tr_moss', 2, 1.4) }), (TER.x0 + TER.x1) / 2, TER.y / 2, (TER.z0 + TER.z1) / 2, g);
  // dry-stone retaining walls along both sides of the steps + terrace
  const wallM = std({ map: tex('tr_cobble', 3, 1), color: '#b0aca0' });
  for (const x of [TER.x0 - 0.3, TER.x1 + 0.3]) { box(0.6, 0.9, 5.4, wallM, x, 0.45, -19.3, g); col(x - 0.3, x + 0.3, -22, -16.6); }
  box(TER.x1 - TER.x0 + 1.2, 1.4, 0.6, wallM, (TER.x0 + TER.x1) / 2, 0.7, TER.z0 - 0.3, g); col(TER.x0 - 0.6, TER.x1 + 0.6, TER.z0 - 0.6, TER.z0);
  // the stone relief (the photo on a carved slab with a flame-shaped top), mossy boulders, cups, coin
  const rel = new THREE.Group(); rel.position.set(-7, TER.y, -21.2); g.add(rel);
  const slabSh = new THREE.Shape(); slabSh.moveTo(-0.42, 0); slabSh.lineTo(0.42, 0); slabSh.lineTo(0.44, 0.9); slabSh.quadraticCurveTo(0.42, 1.25, 0.18, 1.32); slabSh.quadraticCurveTo(0.0, 1.45, -0.2, 1.3); slabSh.quadraticCurveTo(-0.44, 1.2, -0.44, 0.9); slabSh.closePath();
  const slabG = new THREE.ExtrudeGeometry(slabSh, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 });
  const sp = slabG.attributes.position, su = slabG.attributes.uv; for (let i = 0; i < sp.count; i++) su.setXY(i, (sp.getX(i) + 0.44) / 0.88, sp.getY(i) / 1.45);
  const slab = new THREE.Mesh(slabG, [std({ map: _L.load('assets/textures/tr_relief.png', (t) => { t.colorSpace = THREE.SRGBColorSpace; }), roughness: 0.85 }), std({ color: '#6a7058' })]);
  slab.material[0].map.colorSpace = THREE.SRGBColorSpace; slab.position.z = -0.1; slab.castShadow = true; rel.add(slab);
  const rockM = std({ map: tex('tr_moss', 1, 1), color: '#9aa890' });
  for (const [x, y, z, s] of [[-0.8, 0.3, 0.0, 0.5], [0.85, 0.25, -0.1, 0.45], [-0.6, 0.8, -0.3, 0.4], [0.7, 0.75, -0.3, 0.38], [0, 1.4, -0.5, 0.5]]) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), rockM); b.position.set(x, y, z); b.scale.set(1, 0.8, 0.9); b.castShadow = true; rel.add(b); }
  const teal = std({ color: '#3aa0a8', roughness: 0.3 });
  for (const [x, z, tip] of [[-0.3, 0.45, 0], [0.15, 0.55, 1.2]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.06, 16, 1, true), std({ color: '#3aa0a8', roughness: 0.3, side: THREE.DoubleSide })); c.position.set(x, 0.035, z); c.rotation.z = tip; rel.add(c); }
  const coin = cyl(0.012, 0.012, 0.003, std({ color: '#c8a050', metalness: 0.8, roughness: 0.35 }), rel, 16); coin.position.set(0.05, 0.003, 0.7);
  void teal;
  // ---- rope fence + DANGER board along the drop at the trail's north-west bend
  const post = std({ color: '#6a5034', roughness: 0.95 }), ropeM = std({ color: '#c8b48a' });
  const fencePts = [[-21, -9.8], [-23.5, -11], [-26, -12.8], [-28.3, -15.2]];
  fencePts.forEach(([x, z]) => { const p = cyl(0.06, 0.07, 1.0, post, g, 8); p.position.set(x, 0.5, z); });
  for (let i = 0; i < fencePts.length - 1; i++) { const [a, b] = [fencePts[i], fencePts[i + 1]]; for (const y of [0.85, 0.5]) tube([new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, y - 0.08, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], y, b[1])], 0.012, ropeM, g, 10); col(Math.min(a[0], b[0]) - 0.1, Math.max(a[0], b[0]) + 0.1, Math.min(a[1], b[1]) - 0.1, Math.max(a[1], b[1]) + 0.1); }
  const db = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), std({ map: dangerBoard(), side: THREE.DoubleSide })); db.position.set(-24.7, 0.72, -11.75); db.rotation.y = Math.atan2(-(-12.8 + 11), -26 + 23.5) + Math.PI; db.rotation.y = -0.62; g.add(db);
  // the drop beyond the fence: the ground falls away (a dark slope) with tree tops below
  const drop = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), std({ map: tex('tr_leaf', 3, 2), color: '#7a6a58' })); drop.rotation.x = -Math.PI / 2 + 0.55; drop.rotation.z = 0.6; drop.position.set(-24, -1.5, -5.5); g.add(drop);
  // ---- concrete stair climbing the bank on the east side, drain channel + grate, rail, cartoon sign
  const conc = std({ color: '#a8a49a', roughness: 0.95 });
  const ST = { x: -1.6, z0: -6, n: 14, run: 0.32, rise: 0.17 };
  for (let i = 0; i < ST.n; i++) box(1.6, ST.rise * (i + 1), ST.run, conc, ST.x, ST.rise * (i + 1) / 2, ST.z0 - i * ST.run, g);
  box(0.3, 0.1, ST.n * ST.run, std({ color: '#5a5650' }), ST.x + 0.95, 0.05, ST.z0 - ST.n * ST.run / 2 + ST.run / 2, g);
  const grate = canvasT(64, 256, (x) => { x.fillStyle = '#1a1a1a'; x.fillRect(0, 0, 64, 256); x.fillStyle = '#6a6a66'; for (let i = 0; i < 32; i++) x.fillRect(0, i * 8, 64, 4); });
  grate.wrapT = THREE.RepeatWrapping; grate.repeat.set(1, 4);
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.26, ST.n * ST.run), std({ map: grate, metalness: 0.5 })); gm.rotation.x = -Math.PI / 2; gm.position.set(ST.x + 0.95, 0.101, ST.z0 - ST.n * ST.run / 2 + ST.run / 2); g.add(gm);
  const rail = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.35 });
  tube([new THREE.Vector3(ST.x - 0.85, 0.9, ST.z0 + 0.3), new THREE.Vector3(ST.x - 0.85, 0.9 + ST.n * ST.rise, ST.z0 - ST.n * ST.run)], 0.025, rail, g, 4);
  for (let i = 0; i <= ST.n; i += 4) { const p = cyl(0.02, 0.02, 0.9, rail, g, 8); p.position.set(ST.x - 0.85, i * ST.rise + 0.45, ST.z0 - i * ST.run + 0.15); }
  col(ST.x - 1.0, ST.x - 0.82, ST.z0 - ST.n * ST.run, ST.z0 + 0.2); col(ST.x + 0.82, ST.x + 1.15, ST.z0 - ST.n * ST.run, ST.z0 + 0.2); col(ST.x - 1.0, ST.x + 1.15, ST.z0 - ST.n * ST.run - 0.3, ST.z0 - ST.n * ST.run);
  const sgnPost = cyl(0.04, 0.04, 2.6, rail, g, 8); sgnPost.position.set(ST.x + 1.5, 1.3, ST.z0 + 0.6);
  const sg2 = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.26), std({ map: cartoonSign(), roughness: 0.6 })); sg2.position.set(ST.x + 1.5, 1.6, ST.z0 + 0.65); sg2.rotation.y = 0.3; g.add(sg2);
  col(ST.x + 1.4, ST.x + 1.6, ST.z0 + 0.5, ST.z0 + 0.7);
  // ---- junk pile at the end of the gravel spur
  const J = [-15.6, -24.2];
  const crates = [[0, 0, 0, 0.1, 'DISCONTINUED'], [0.05, 0.3, 0, -0.1, null], [0.65, 0, 0.1, 0.4, null]];
  crates.forEach(([dx, dy, dz, ry, lb], i) => { const c = makeBlueCrate({ label: lb, seed: i + 5 }); c.position.set(J[0] + dx, dy, J[1] + dz); c.rotation.y = ry; g.add(c); });
  const cooler = box(0.6, 0.38, 0.38, std({ color: '#2a8ad0', roughness: 0.5 }), J[0] - 0.8, 0.19, J[1] + 0.2, g); cooler.rotation.y = 0.3;
  box(0.62, 0.06, 0.4, std({ color: '#f2f2ee', roughness: 0.5 }), J[0] - 0.8, 0.41, J[1] + 0.2, g).rotation.y = 0.3;
  for (const [dx, dz, tilt] of [[1.0, 0.8, 0], [1.3, 0.3, 1.4]]) { const cone = new THREE.Group(); cone.position.set(J[0] + dx, 0, J[1] + dz); cone.rotation.z = tilt; g.add(cone); const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 16), std({ color: '#f05a1a', roughness: 0.6 })); c.position.y = 0.33; cone.add(c); box(0.36, 0.04, 0.36, std({ color: '#222' }), 0, 0.02, 0, cone); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.1, 16, 1, true), std({ color: '#f4f4f0' })); band.position.y = 0.38; cone.add(band); }
  const rimM = std({ color: '#9a9a96', metalness: 0.7, roughness: 0.4 });
  for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 20), rimM); w.rotation.x = Math.PI / 2 + (r() - 0.5) * 0.4; w.position.set(J[0] - 0.2 + i * 0.25, 0.05 + (i % 2) * 0.1, J[1] + 0.8); g.add(w); }
  for (const [dx, dz, c] of [[-1.4, -0.3, '#d8d0b0'], [-1.1, 0.8, '#5a7a9a']]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 16, 1, true), std({ color: c, side: THREE.DoubleSide })); b.position.set(J[0] + dx, 0.15, J[1] + dz); g.add(b); }
  col(J[0] - 1.7, J[0] + 1.5, J[1] - 0.5, J[1] + 1.2);
  // ---- overlook at the far end: wire fence, a bench; the view opens past the last cedars
  const OV = [-31.5, -23.5];
  for (let i = 0; i < 5; i++) { const p = cyl(0.03, 0.03, 1.2, rail, g, 8); p.position.set(OV[0] - 1.6 + i * 0.8, 0.6, OV[1] - 1.8); }
  const mesh = canvasT(128, 128, (x) => { x.clearRect(0, 0, 128, 128); x.strokeStyle = '#8a8c8a'; x.lineWidth = 2; for (let i = -128; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); } });
  mesh.wrapS = mesh.wrapT = THREE.RepeatWrapping; mesh.repeat.set(8, 3);
  const mf = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.1), std({ map: mesh, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.4 })); mf.position.set(OV[0], 0.6, OV[1] - 1.8); g.add(mf);
  col(OV[0] - 1.7, OV[0] + 1.7, OV[1] - 1.9, OV[1] - 1.7);
  const bench = new THREE.Group(); bench.position.set(OV[0] + 0.4, 0, OV[1] - 0.6); g.add(bench);
  box(1.6, 0.06, 0.36, std({ color: '#7a5a3a' }), 0, 0.45, 0, bench); for (const s of [-1, 1]) box(0.08, 0.45, 0.32, std({ color: '#5a5a58' }), s * 0.65, 0.225, 0, bench);
  col(OV[0] - 0.5, OV[0] + 1.3, OV[1] - 0.8, OV[1] - 0.4);
  // someone's picnic at the overlook: the snack pile on its woven blanket, a coconut-jelly can and a candy pouch on the bench
  const pic = makeSnackPile(); pic.position.set(OV[0] - 0.4, 0.01, OV[1] + 0.5); pic.rotation.y = 0.3; g.add(pic);
  const coco = makeSodaCan('coco'); coco.position.set(OV[0] + 0.7, 0.48, OV[1] - 0.6); g.add(coco);
  const candy = makeCandyPouch(); candy.rotation.set(-Math.PI / 2, 0, 0.5); candy.position.set(OV[0] + 0.25, 0.49, OV[1] - 0.58); g.add(candy);
  // trail-start sign at the entrance (made-up name)
  const ts = canvasT(512, 160, (x) => { x.fillStyle = '#5a3a20'; x.fillRect(0, 0, 512, 160); x.strokeStyle = '#e8d8b0'; x.lineWidth = 4; x.strokeRect(10, 10, 492, 140); x.fillStyle = '#f2e6c8'; fitText(x, 'すぎかげ遊歩道', 256, 62, 460, 56, F.brush, { spacing: 6 }); fitText(x, 'SUGIKAGE NATURE TRAIL  →  OVERLOOK 600 m', 256, 122, 460, 26, F.label, { spacing: 2 }); });
  const tsg = new THREE.Group(); tsg.position.set(-0.5, 0, 0.4); g.add(tsg);
  for (const s of [-1, 1]) { const p = cyl(0.06, 0.06, 1.7, post, tsg, 8); p.position.set(s * 0.5, 0.85, 0); }
  const tsb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.05), [post, post, post, post, std({ map: ts }), post]); tsb.position.y = 1.45; tsb.rotation.y = Math.PI / 2; tsg.add(tsb);
  tsg.rotation.y = -0.4;
  g.userData.colliders = colliders;
  g.userData.area = { minX: X0 + 0.5, maxX: X1 + 1.5, minZ: Z0 + 0.5, maxZ: Z1 + 0.5 };
  g.userData.floorY = (x, z) => {
    if (x >= TER.x0 && x <= TER.x1 && z >= TER.z0 && z <= TER.z1) return TER.y;
    if (x >= -9.8 && x <= -4.2 && z < -16.7 && z > TER.z1) return 0.15 * Math.ceil((-16.7 - z) / 0.45);
    if (x >= ST.x - 0.8 && x <= ST.x + 0.8 && z <= ST.z0 + ST.run / 2 && z >= ST.z0 - ST.n * ST.run) return ST.rise * Math.min(ST.n, Math.ceil((ST.z0 + ST.run / 2 - z) / ST.run));
    return null;
  };
  return g;
}
