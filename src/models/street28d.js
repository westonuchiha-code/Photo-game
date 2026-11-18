// City street props from the city photos (28d). Brands, signs and mascots are made up.
//   makeCargoTrike({ cab })  three-wheel cargo motorcycle: sport-bike front (faired tank, made-up
//       "DASHER 125" livery, headlight, mirrors, spoked front wheel on forks) welded to a steel
//       flatbed on a rear axle with two wheels; load: blue tarp bundles, red cabinet, grey drum,
//       rope; `cab: true` gives the electric version with a clear plastic cab on yellow posts
//   makeArcadeCabinet()      stand-up cabinet: yellow body with chrome edge trim, lit marquee with
//       original dragon-ish mascots ("BUBBLE BOUNCE"), twin speakers, CRT glass with a lit game screen,
//       two joysticks + coloured buttons on a printed panel, coin door, green turf mat
//   makeGraffitiFront()      narrow closed shop: weathered sign board with made-up raised letters,
//       two roll shutters (graffiti textures from the photo), cracked concrete pier, old sub-signs,
//       a security sticker (generic), corrugated upper wall, wood pallet leaning in front
// Each faces +z, origin at ground level.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1) {
  const t = _L.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const cyl = (r0, r1, h, mat, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.castShadow = true; return m; };
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
// tube between two points
function tube(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), m = cyl(r, r, d.length(), mat, 10);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- cargo trike
let TM = null;
function trikeMats() {
  if (TM) return TM;
  const livery = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c8202a'; c.beginPath(); c.moveTo(0, h * 0.55); c.lineTo(w * 0.6, h * 0.3); c.lineTo(w, h * 0.35); c.lineTo(w, h * 0.5); c.lineTo(w * 0.55, h * 0.48); c.lineTo(0, h * 0.75); c.fill();
    c.fillStyle = '#2a8a5a'; c.beginPath(); c.moveTo(w * 0.1, h * 0.85); c.lineTo(w * 0.45, h * 0.62); c.lineTo(w * 0.62, h * 0.66); c.lineTo(w * 0.2, h * 0.92); c.fill();
    c.fillStyle = '#1a1a1a'; fitText(c, 'DASHER', w * 0.62, h * 0.2, w * 0.5, 64, '"Righteous"', { spacing: 4 });
    c.fillStyle = '#2a4aa8'; fitText(c, '125', w * 0.86, h * 0.2, 90, 48, '"Bebas Neue"');
  });
  TM = {
    livery: std({ map: livery, roughness: 0.35 }),
    white: std({ color: '#ecebe6', roughness: 0.35 }),
    black: std({ color: '#151516', roughness: 0.5 }),
    rubber: std({ color: '#1b1b1c', roughness: 0.9 }),
    chrome: std({ color: '#c8cbcf', metalness: 0.6, roughness: 0.25 }),
    steel: std({ color: '#5f6264', metalness: 0.45, roughness: 0.55 }),
    rust: std({ color: '#6a4a36', metalness: 0.3, roughness: 0.8 }),
    bed: std({ map: canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#dcdcd6'; c.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(120,80,50,${r() * 0.3})`; c.fillRect(r() * w, r() * h, 2 + r() * 10, 1 + r() * 3); } c.fillStyle = '#c84a3a'; c.fillRect(0, h * 0.8, w * 0.3, 4); }), roughness: 0.7 }),
    tarp: std({ color: '#2f63b8', roughness: 0.7, side: THREE.DoubleSide }),
    red: std({ color: '#d8301e', roughness: 0.45 }),
    yellow: std({ color: '#e8b81a', roughness: 0.5 }),
    clear: new THREE.MeshStandardMaterial({ color: '#d8e4ea', transparent: true, opacity: 0.25, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    lamp: glow(1.8, 1.75, 1.6),
  };
  return TM;
}
function trikeWheel(r, w, spoked) {
  const M = trikeMats(), g = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - w / 2, w / 2, 10, 28), M.rubber); g.add(tyre);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r - w * 0.95, 0.012, 6, 28), M.chrome); g.add(rim);
  const hub = cyl(0.04, 0.04, w * 1.2, M.chrome, 12); hub.rotation.x = Math.PI / 2; g.add(hub);
  if (spoked) for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; g.add(tube(V(0, 0, (i % 2 - 0.5) * 0.04), V(Math.cos(a) * (r - w), Math.sin(a) * (r - w), 0), 0.003, M.chrome)); }
  else { const disc = cyl(r - w, r - w, w * 0.8, M.white, 20); disc.rotation.x = Math.PI / 2; g.add(disc); for (let i = 0; i < 4; i++) { const h = cyl(0.025, 0.025, w, M.black, 8); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(i * 1.57) * 0.09, Math.sin(i * 1.57) * 0.09, 0); g.add(h); } }
  return g;
}
export function makeCargoTrike({ cab = false, seed = 1 } = {}) {
  const M = trikeMats(), g = new THREE.Group(), r = rng(seed);
  // axis: +x forward
  const fw = trikeWheel(0.31, 0.09, true); fw.position.set(1.15, 0.31, 0); g.add(fw);
  for (const s of [-1, 1]) { const rw = trikeWheel(0.3, 0.13, false); rw.position.set(-1.1, 0.3, s * 0.62); g.add(rw); }
  g.add(tube(V(-1.1, 0.3, -0.7), V(-1.1, 0.3, 0.7), 0.03, M.steel));                       // rear axle
  // forks, front fender, headlight, bars, mirrors
  for (const s of [-1, 1]) g.add(tube(V(1.15, 0.31, s * 0.07), V(0.85, 1.05, s * 0.09), 0.022, cab ? M.black : M.chrome));
  const fend = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 6, 16, Math.PI * 0.7), cab ? M.black : M.white); fend.position.set(1.15, 0.31, 0); fend.rotation.z = 0.3; fend.scale.z = 1.2; g.add(fend);
  g.add(tube(V(0.82, 1.12, -0.36), V(0.82, 1.12, 0.36), 0.014, M.black));
  for (const s of [-1, 1]) { g.add(tube(V(0.82, 1.12, s * 0.3), V(0.86, 1.4, s * 0.32), 0.006, M.chrome)); const mir = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), M.black); mir.scale.set(0.4, 0.8, 1.2); mir.position.set(0.86, 1.42, s * 0.33); g.add(mir); }
  const hl = cyl(0.08, 0.07, 0.1, M.black, 18); hl.rotation.z = Math.PI / 2; hl.position.set(0.96, 0.98, 0); g.add(hl);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 18), M.lamp); lens.rotation.y = Math.PI / 2; lens.position.set(1.015, 0.98, 0); g.add(lens);
  if (!cab) {
    // sport-bike tank + side fairing with livery, seat, engine block, exhaust
    const tank = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.3, 0.38, 4, 0.11), M.livery); tank.position.set(0.55, 0.92, 0); tank.rotation.z = -0.12; g.add(tank);
    for (const s of [-1, 1]) { const fair = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), M.livery); fair.position.set(0.55, 0.72, s * 0.2); fair.rotation.set(0, s < 0 ? Math.PI : 0, -0.15); g.add(fair); }
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.1, 0.3, 3, 0.04), M.black); seat.position.set(0.05, 0.92, 0); g.add(seat);
    g.add(box(0.42, 0.34, 0.28, M.steel, 0.45, 0.48, 0));
    for (let i = 0; i < 5; i++) g.add(box(0.36, 0.015, 0.3, M.chrome, 0.45, 0.36 + i * 0.06, 0));
    g.add(tube(V(0.3, 0.35, 0.18), V(-0.4, 0.4, 0.22), 0.035, M.chrome));
  } else {
    // electric: blue front cowl + bench, clear cab on yellow posts with a white roof
    const cowl = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.62, 0.42, 3, 0.06), std({ color: '#3a8ac8', roughness: 0.45 })); cowl.position.set(0.85, 0.58, 0); g.add(cowl);
    g.add(box(0.4, 0.3, 0.6, M.black, 0.3, 0.5, 0), new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.1, 0.62, 3, 0.04), M.black).translateX(0.3).translateY(0.7));
    const post = (a, b) => g.add(tube(a, b, 0.02, M.yellow));
    for (const s of [-1, 1]) { post(V(1.0, 0.75, s * 0.45), V(0.95, 1.85, s * 0.45)); post(V(0.0, 0.7, s * 0.5), V(0.0, 1.85, s * 0.5)); }
    g.add(box(1.25, 0.04, 1.1, M.white, 0.5, 1.88, 0));
    g.add(box(1.2, 0.025, 0.25, M.black, 0.5, 1.92, 0));
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.0), M.clear); ws.position.set(1.0, 1.32, 0); ws.rotation.set(0, Math.PI / 2, 0.08); g.add(ws);
    for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.0), M.clear); sd.position.set(0.5, 1.32, s * 0.48); g.add(sd); }
  }
  // chassis rails + flatbed with low sides
  for (const s of [-1, 1]) g.add(tube(V(0.4, 0.5, s * 0.12), V(-1.75, 0.55, s * 0.5), 0.03, M.steel));
  g.add(box(1.7, 0.06, 1.35, M.bed, -1.0, 0.62, 0));
  for (const s of [-1, 1]) g.add(box(1.7, 0.18, 0.04, M.bed, -1.0, 0.74, s * 0.66));
  g.add(box(0.04, 0.18, 1.35, M.bed, -1.85, 0.74, 0), box(0.04, 0.18, 1.35, M.bed, -0.15, 0.74, 0));
  // rear fenders, tail light, number plate (made up)
  for (const s of [-1, 1]) { const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 16, 1, true, 0, Math.PI), M.steel); rf.rotation.x = Math.PI / 2; rf.position.set(-1.1, 0.3, s * 0.62); rf.material = M.steel; g.add(rf); }
  g.add(box(0.03, 0.08, 0.12, glow(1.6, 0.2, 0.15), -1.88, 0.72, 0.5));
  // load
  if (!cab) {
    // pipe rack + tarp bundles, red cabinet, grey drum, rope
    for (const s of [-1, 1]) { g.add(tube(V(-1.8, 0.65, s * 0.62), V(-1.8, 1.55, s * 0.62), 0.018, M.steel)); g.add(tube(V(-0.2, 0.65, s * 0.62), V(-0.2, 1.55, s * 0.62), 0.018, M.steel)); g.add(tube(V(-1.8, 1.55, s * 0.62), V(-0.2, 1.55, s * 0.62), 0.016, M.steel)); }
    const cab2 = new THREE.Mesh(new RoundedBoxGeometry(0.42, 1.0, 0.75, 2, 0.02), M.red); cab2.position.set(-1.05, 1.15, 0.05); g.add(cab2);
    g.add(box(0.005, 0.9, 0.003, M.black, -0.84, 1.15, 0.05));
    const drum = cyl(0.17, 0.17, 0.4, std({ color: '#9a9c9a', metalness: 0.4, roughness: 0.5 })); drum.position.set(-0.45, 1.05, -0.3); g.add(drum);
    g.add(box(0.25, 0.08, 0.25, M.red, -0.45, 1.28, -0.3));
    const tp = (x, y, z, sx, sy, sz) => { const t = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), M.tarp); t.scale.set(sx, sy, sz); t.position.set(x, y, z); g.add(t); const p = t.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.9 + r() * 0.2), p.getY(i) * (0.9 + r() * 0.2), p.getZ(i) * (0.9 + r() * 0.2)); t.geometry.computeVertexNormals(); };
    tp(-0.35, 1.05, 0.3, 0.25, 0.45, 0.3); tp(-1.55, 0.95, -0.3, 0.3, 0.3, 0.35); tp(-1.7, 0.85, 0.4, 0.2, 0.2, 0.25);
    g.add(tube(V(-1.8, 1.45, -0.62), V(-0.5, 0.75, 0.62), 0.008, std({ color: '#e8e2c8' })));
  } else {
    for (let i = 0; i < 4; i++) g.add(box(0.5 + r() * 0.2, 0.25 + r() * 0.2, 0.45, std({ map: ptex('store_cardboard.png'), roughness: 0.9 }), -1.4 + (i % 2) * 0.65, 0.78 + Math.floor(i / 2) * 0.35, (r() - 0.5) * 0.4));
    g.add(box(0.5, 0.3, 0.4, std({ color: '#2a5aa8' }), -0.6, 0.8, 0.3));
  }
  g.userData.collider = [-1.95, 1.5, -0.8, 0.8];
  return g;
}

// ---------------------------------------------------------------- arcade cabinet
function drawMascot(c, x, y, s, body, belly, flip) {
  // original bubbly dragon: round body, big eyes, spiky back
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  c.lineWidth = 6; c.strokeStyle = '#1a2a4a';
  c.fillStyle = body;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-60 + i * 30, -50 - i * 6); c.lineTo(-48 + i * 30, -86 - i * 6); c.lineTo(-36 + i * 30, -50 - i * 6); c.fill(); c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, 70, 62, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = belly; c.beginPath(); c.ellipse(16, 20, 38, 34, 0, 0, 7); c.fill();
  c.fillStyle = '#fff'; for (const dx of [6, 40]) { c.beginPath(); c.ellipse(dx, -22, 16, 20, 0, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = '#1a2a4a'; for (const dx of [10, 44]) { c.beginPath(); c.arc(dx, -18, 7, 0, 7); c.fill(); }
  c.fillStyle = '#e84a6a'; c.beginPath(); c.arc(56, 4, 12, 0.2, Math.PI - 0.2); c.fill();
  c.fillStyle = body; c.beginPath(); c.ellipse(-30, 58, 22, 12, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(30, 58, 22, 12, 0, 0, 7); c.fill(); c.stroke();
  c.restore();
}
export function makeArcadeCabinet() {
  const g = new THREE.Group();
  const W = 0.78, D = 0.85;
  const yellow = std({ color: '#e8c21a', roughness: 0.4 });
  const grey = std({ color: '#7a7c80', roughness: 0.45, metalness: 0.15 });
  const chrome = std({ color: '#c8cbcf', metalness: 0.6, roughness: 0.25 });
  const black = std({ color: '#141516', roughness: 0.4 });
  // side panels as one profile (base, cut-in control shelf, screen slope, marquee box)
  const prof = new THREE.Shape();
  [[0, 0], [D, 0], [D, 0.95], [D + 0.12, 1.02], [D + 0.1, 1.08], [0.72, 1.12], [0.62, 1.7], [0.7, 1.75], [0.74, 2.25], [0, 2.25], [0, 0]].forEach(([z, y], i) => (i ? prof.lineTo(z, y) : prof.moveTo(z, y)));
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(prof, { depth: 0.03, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    const side = new THREE.Mesh(geo, grey); side.position.set(s * W / 2 + (s > 0 ? 0.03 : 0), 0, -D); side.castShadow = true; g.add(side);
    // chrome T-molding along the side's front edge
    for (const [a, b] of [[V(0, 0, 0), V(0, 0.95, 0)], [V(0, 1.12, -0.13), V(0, 1.7, -0.23)], [V(0, 1.75, -0.15), V(0, 2.25, -0.11)]]) g.add(tube(a.clone().add(V(s * (W / 2 + 0.015), 0, 0)), b.clone().add(V(s * (W / 2 + 0.015), 0, 0)), 0.012, chrome));
  }
  // lower body: grey with a coin door + service panel
  g.add(box(W, 0.95, 0.04, grey, 0, 0.475, -0.02));
  const cd = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.42, 0.03, 2, 0.01), std({ color: '#5a5c60', metalness: 0.4, roughness: 0.4 })); cd.position.set(0.12, 0.55, 0.01); g.add(cd);
  g.add(box(0.035, 0.08, 0.01, chrome, 0.12, 0.66, 0.03), box(0.06, 0.03, 0.01, glow(1.6, 0.4, 0.2), 0.12, 0.58, 0.03), box(0.08, 0.03, 0.01, black, 0.12, 0.45, 0.03));
  for (const [x, y] of [[-0.22, 0.6], [-0.22, 0.3]]) g.add(box(0.22, 0.22, 0.012, std({ color: '#55575a' }), x, y, 0.004));
  // control panel: printed overlay, 2 joysticks with ball tops, 6 buttons each, start buttons
  const cpTex = canvasTex(512, 160, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2a8ac8'); gr.addColorStop(0.5, '#e8d23a'); gr.addColorStop(1, '#2a8ac8');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    drawMascot(c, 70, 100, 0.45, '#5ac85a', '#e8f0c8', false);
    c.fillStyle = '#1a2a4a'; fitText(c, '1P', 140, 30, 60, 30, '"Bungee"'); fitText(c, '2P', 380, 30, 60, 30, '"Bungee"');
  });
  const cp = box(W, 0.04, 0.32, [black, black, std({ map: cpTex, roughness: 0.35 }), black, black, black], 0, 1.04, 0.1);
  cp.rotation.x = 0.18; g.add(cp);
  const cols = ['#d82a2a', '#e8c21a', '#2a8a3a', '#2a5ad8', '#e8e8e8', '#d82a2a'];
  for (const s of [-1, 1]) {
    const jx = s * 0.22 - 0.08;
    const shaft = cyl(0.008, 0.008, 0.08, chrome); shaft.position.set(jx, 1.1, 0.12); g.add(shaft);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 10), std({ color: '#f2f2ee', roughness: 0.25 })); ball.position.set(jx, 1.15, 0.12); g.add(ball);
    for (let i = 0; i < 6; i++) {
      const b = cyl(0.016, 0.016, 0.02, std({ color: cols[i], roughness: 0.3 }), 14);
      b.position.set(jx + 0.08 + (i % 3) * 0.045, 1.065 - Math.floor(i / 3) * 0.005, 0.1 + Math.floor(i / 3) * 0.045); b.rotation.x = 0.18; g.add(b);
    }
  }
  g.add(box(0.05, 0.02, 0.03, glow(1.4, 1.4, 1.4), 0, 1.07, 0.02));
  // screen: bezel + lit CRT showing an original platform game
  const screen = canvasTex(320, 240, (c, w, h) => {
    c.fillStyle = '#0a0a2a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8762a'; for (const [x, y, l] of [[20, 200, 280], [40, 150, 90], [190, 150, 90], [90, 100, 140], [20, 50, 70], [230, 50, 70]]) { c.fillRect(x, y, l, 10); c.fillStyle = '#c84a1a'; c.fillRect(x, y + 10, l, 3); c.fillStyle = '#e8762a'; }
    drawMascot(c, 80, 180, 0.22, '#5ac85a', '#e8f0c8', false);
    drawMascot(c, 250, 128, 0.18, '#5aa8e8', '#e8f0f8', true);
    c.strokeStyle = 'rgba(160,220,255,0.8)'; c.lineWidth = 2; for (const [x, y] of [[150, 80], [170, 70], [120, 130]]) { c.beginPath(); c.arc(x, y, 12, 0, 7); c.stroke(); }
    c.fillStyle = '#fff'; c.font = '16px "VT323"'; c.fillText('1UP 004320', 10, 18); c.fillText('HI 050000', 200, 18);
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.47), new THREE.MeshBasicMaterial({ map: screen, color: new THREE.Color(1.15, 1.15, 1.15), toneMapped: false }));
  const ang = Math.atan2(0.1, 0.58);
  sm.position.set(0, 1.42, -0.18); sm.rotation.x = -ang; g.add(sm);
  const bez = box(W, 0.6, 0.02, yellow, 0, 1.42, -0.2); bez.rotation.x = -ang; g.add(bez);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshStandardMaterial({ color: '#cfe0e8', transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.5 }));
  gl.position.set(0, 1.42, -0.165); gl.rotation.x = -ang; g.add(gl);
  // speaker panel with two round grilles
  g.add(box(W, 0.12, 0.08, yellow, 0, 1.78, -0.12));
  for (const s of [-1, 1]) { const sp = cyl(0.05, 0.05, 0.02, black, 20); sp.rotation.x = Math.PI / 2; sp.position.set(s * 0.2, 1.78, -0.075); g.add(sp); for (let i = 0; i < 4; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012 + i * 0.01, 0.002, 4, 16), chrome); ring.position.set(s * 0.2, 1.78, -0.064); g.add(ring); } }
  // marquee: lit backlit art (made-up title)
  const mq = canvasTex(768, 300, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e8f05a'); gr.addColorStop(1, '#a8d82a');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 0, 7); c.fill(); }
    drawMascot(c, 130, 160, 0.9, '#5aa8e8', '#e8f0f8', false);
    drawMascot(c, 650, 180, 0.65, '#5ac85a', '#e8f0c8', true);
    c.fillStyle = '#e8762a'; c.beginPath(); c.ellipse(w / 2, h / 2 + 10, 200, 70, 0, 0, 7); c.fill();
    c.strokeStyle = '#7a2a0a'; c.lineWidth = 6; c.stroke();
    c.fillStyle = '#fff'; c.strokeStyle = '#7a2a0a'; c.lineWidth = 8;
    fitText(c, 'BUBBLE BOUNCE', w / 2, h / 2 + 10, 340, 60, '"Shrikhand"', { stroke: 1 });
  });
  const marquee = box(W + 0.02, 0.42, 0.16, [yellow, yellow, yellow, yellow, new THREE.MeshBasicMaterial({ map: mq, color: new THREE.Color(1.2, 1.2, 1.2), toneMapped: false }), yellow], 0, 2.04, -0.07);
  g.add(marquee);
  for (const y of [1.83, 2.25]) g.add(box(W + 0.04, 0.02, 0.17, chrome, 0, y, -0.07));
  // taped handwritten note on the marquee (made-up: "OUT OF ORDER?")
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), std({ map: canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#f6f4ec'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; fitText(c, 'PLEASE', w / 2, 50, 110, 30, '"Caveat"', { weight: '700' }); fitText(c, 'BE GENTLE', w / 2, 90, 110, 26, '"Caveat"', { weight: '700' }); c.fillStyle = 'rgba(220,220,200,0.7)'; c.fillRect(30, 0, 60, 14); }) }));
  note.position.set(0.3, 1.95, 0.015); note.rotation.z = 0.08; note.scale.setScalar(0.75); g.add(note);
  g.add(box(W, 0.04, D, grey, 0, 2.27, -D / 2));
  // green turf mat in front
  const turf = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#2f7a3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { c.fillStyle = Math.random() < 0.5 ? '#3f8a44' : '#256a30'; c.fillRect(Math.random() * w, Math.random() * h, 1, 3); } });
  turf.repeat.set(3, 3);
  g.add(box(1.0, 0.015, 1.4, std({ map: turf, roughness: 1 }), 0, 0.008, 0.2));
  const l = new THREE.PointLight('#e8f0a0', 1.4, 3, 2); l.position.set(0, 1.7, 0.6); g.add(l);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.05, -D, 0.25];
  return g;
}

// ---------------------------------------------------------------- graffiti shop front + pallet
export function makePallet() {
  const g = new THREE.Group();
  const wood = std({ color: '#c8925a', roughness: 0.85, map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#d29a62'; c.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(120,70,30,${0.15 + r() * 0.2})`; c.beginPath(); const y = r() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2); c.stroke(); } for (let i = 0; i < 4; i++) { c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(r() * w, r() * h, 4, 2, 0, 0, 7); c.fill(); } }) });
  for (let i = 0; i < 7; i++) g.add(box(1.0, 0.1, 0.022, wood, 0, 0.06 + i * 0.19, 0.0));    // deck boards
  for (const x of [-0.45, 0, 0.45]) g.add(box(0.09, 1.25, 0.09, wood, x, 0.62, -0.06));          // stringers
  g.add(box(0.012, 0.012, 0.012, std({ color: '#888', metalness: 0.6 }), 0.3, 0.6, 0.012));
  return g;
}
export function makeGraffitiFront(W = 4.4) {
  const g = new THREE.Group();
  const H1 = 2.8;
  const conc = std({ map: ptex('gf_concrete.png', 1, 2), roughness: 0.95 });
  const metal = std({ color: '#c8cacc', metalness: 0.35, roughness: 0.5, map: canvasTex(64, 256, (c, w, h) => { for (let x = 0; x < w; x += 8) { const gg = c.createLinearGradient(x, 0, x + 8, 0); gg.addColorStop(0, '#9a9da0'); gg.addColorStop(0.5, '#d8dadc'); gg.addColorStop(1, '#8a8d90'); c.fillStyle = gg; c.fillRect(x, 0, 8, h); } }) });
  metal.map.repeat.set(W / 0.5, 1);
  // corrugated upper wall
  g.add(box(W, 2.2, 0.15, metal, 0, H1 + 1.5 + 1.1, -0.1));
  // cracked concrete pier on the left + right
  g.add(box(0.5, H1 + 1.5, 0.4, conc, -W / 2 - 0.25, (H1 + 1.5) / 2, -0.05));
  g.add(box(0.3, H1 + 1.5, 0.3, std({ color: '#5a6a78', roughness: 0.6 }), W / 2 + 0.15, (H1 + 1.5) / 2, -0.05));
  // weathered shop sign: mauve board, made-up raised letters + small lines + phone
  const sign = canvasTex(1024, 300, (c, w, h) => {
    c.fillStyle = '#7a5a5e'; c.fillRect(0, 0, w, h);
    const r = rng(9); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '40,30,30' : '200,180,180'},${r() * 0.12})`; c.fillRect(r() * w, r() * h, 2 + r() * 20, 1 + r() * 3); }
    c.fillStyle = 'rgba(30,20,20,0.35)'; c.fillRect(0, h - 26, w, 26);
    c.fillStyle = '#e8e2d2';
    ['HEATERS', 'BOILERS', 'REPAIRS', 'PARTS'].forEach((t, i) => fitText(c, t, 120, 70 + i * 46, 190, 34, '"Oswald"', { weight: '600', align: 'center', spacing: 3 }));
    c.fillStyle = '#efe6d0'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowOffsetX = 4; c.shadowOffsetY = 4;
    fitText(c, 'KWANG ELECTRIC', 620, 120, 620, 120, '"Bebas Neue"', { spacing: 10 });
    c.shadowColor = 'transparent';
    fitText(c, '2279 · 0000', 820, 240, 260, 44, '"Oswald"', { weight: '600', spacing: 4 });
  });
  g.add(box(W - 0.1, 0.95, 0.15, [std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ color: '#6a4a4e' }), std({ map: sign, roughness: 0.7 }), std({ color: '#6a4a4e' })], 0, H1 + 1.0, 0.0));
  g.add(box(W, 0.06, 0.2, std({ color: '#8a6a6e' }), 0, H1 + 1.5, 0.0));
  // two faded sub-signs over the shutters (green-grey enamel, made-up)
  const sub = (txt, x, w) => {
    const t = canvasTex(512, 96, (c, cw, ch) => { c.fillStyle = '#7a9a9a'; c.fillRect(0, 0, cw, ch); const r = rng(txt.length); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '40,40,40'},${r() * 0.2})`; c.fillRect(r() * cw, r() * ch, 3 + r() * 30, 2 + r() * 6); } c.fillStyle = '#e8f0ee'; fitText(c, txt, cw / 2, ch / 2 + 2, cw - 60, 60, '"Oswald"', { weight: '600', spacing: 4 }); });
    g.add(box(w, 0.32, 0.06, [std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ color: '#6a8a8a' }), std({ map: t, roughness: 0.6 }), std({ color: '#6a8a8a' })], x, H1 + 0.32, 0.04));
  };
  const aw = W * 0.42, bw = W * 0.52;
  const ax = -W / 2 + aw / 2 + 0.03, bx = W / 2 - bw / 2 - 0.03;
  sub('KWANG HEAT', ax, aw); sub('SHOWROOM', bx, bw);
  g.add(box(W, 0.36, 0.2, std({ color: '#3a3c3e' }), 0, H1 + 0.32, -0.08));
  // shutters (photo textures), box housings, guide rails, bottom bars
  const shutter = (tex, x, w, h) => {
    g.add(box(w, h, 0.05, std({ map: ptex(tex), roughness: 0.55, metalness: 0.3 }), x, h / 2, 0.0));
    for (const s of [-1, 1]) g.add(box(0.05, h, 0.08, std({ color: '#7a7d80', metalness: 0.5 }), x + s * (w / 2 + 0.02), h / 2, 0.02));
    g.add(box(w, 0.05, 0.07, std({ color: '#5a5d60', metalness: 0.5 }), x, 0.025, 0.02));
    g.add(box(0.12, 0.04, 0.03, std({ color: '#2a2a2a' }), x, 0.15, 0.04));
  };
  shutter('gf_shutter_a.png', ax, aw, H1 - 0.15);
  shutter('gf_shutter_b.png', bx, bw, H1 - 0.15);
  // security sticker (generic) + flyer on the pier
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), std({ map: canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#2a5ad8'; c.beginPath(); c.moveTo(w / 2, 4); c.lineTo(w - 4, h / 2); c.lineTo(w / 2, h - 4); c.lineTo(4, h / 2); c.fill(); c.fillStyle = '#fff'; fitText(c, 'GUARD', w / 2, h / 2, 80, 30, '"Bebas Neue"', { spacing: 2 }); }), transparent: true })).translateX(-W / 2 - 0.25).translateY(1.6).translateZ(0.155));
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), std({ map: canvasTex(128, 180, (c, w, h) => { c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; for (let i = 0; i < 9; i++) c.fillRect(12, 30 + i * 15, 60 + (i * 37) % 44, 4); c.fillStyle = '#d82a2a'; c.fillRect(12, 10, 104, 12); }) })).translateX(-W / 2 - 0.25).translateY(2.3).translateZ(0.155));
  // pallet leaning against the right shutter
  const p = makePallet(); p.position.set(bx + 0.35, 0, 0.45); p.rotation.x = -0.15; p.rotation.y = -0.12; g.add(p);
  // black bin by the shutter
  g.add(box(0.32, 0.5, 0.3, std({ color: '#1a1a1c', roughness: 0.5 }), bx - bw / 2 + 0.25, 0.25, 0.3));
  g.userData.collider = [-W / 2 - 0.5, W / 2 + 0.3, -0.3, 0.8];
  return g;
}
