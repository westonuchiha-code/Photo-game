// Teahouse with a painted ceiling (28j, from photos/city/teahouse-painted-ceiling.jpg).
// Names, labels and the painting are made up / original.
//   makeTeahouse()  one tall room, 10 m wide x 5.6 m deep, entered from the street through a glazed door:
//     ceiling    a hand-painted coffered ceiling like the photo: a cove frieze of cusped panels with
//                pomegranate bouquets and vases, a row of little arcade brackets under it, a flat field of
//                gold strapwork with turquoise coffers and red rosettes, navy bands of white teardrops,
//                and a raised two-tier lantern in the middle with a lit stained-glass skylight. All the
//                painting is drawn here in the photo's palette (turquoise, deep green, red, gold, cream,
//                navy) so it stays crisp close up.
//     walls      white carved plaster (texture + relief from tools/tex_28j.py), tan brick pilasters at the
//                corners and between the windows, two tall windows with dark wood frames and sheer
//                curtains gathered with tie-backs, an original abstract painting in gold and ochre
//     bar        a dark carved-wood counter across the left end; behind it a wall of glass shelves
//                holding black tea tins with gold labels, a red tea machine, a lit order screen,
//                white jugs; ladder-back wrought-iron bar stools with cushions
//     tables     dark wood tables with glass tops, wrought-iron chairs with wooden seats, plates, folded
//                napkins, glasses, salt and pepper; a cable rail of small pendant spots overhead
//     street     a cream plaster front with brick pilasters, the two lit windows, the door, a carved
//                name board (SILK GARDEN · TEA HOUSE) and an hours plaque
// Local frame: the street front is the plane z = 0 facing +z; the room is x -5..5, z 0..-5.6; origin at
// floor level in the middle of the front. userData: colliders [[x0,x1,z0,z1]], area, door {x0,x1}
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1, srgb = true) {
  const t = _L.load(`assets/textures/${name}`);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function tube(a, b, r, mat, seg = 8) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true;
  return m;
}

// ------------------------------------------------------------------ the painted ceiling artwork
const P = { teal: '#2aa79b', green: '#1f6b4a', dgreen: '#123f2c', red: '#c0392b', orange: '#e07a2a', gold: '#d9a520', ochre: '#b07a1e', cream: '#f2e6c8', navy: '#1c2a5a', blue: '#2b5aa0', sky: '#7cc6d6', ink: '#1a1410', white: '#fbf6ea' };
function outline(c, w = 2) { c.lineWidth = w; c.strokeStyle = P.ink; c.stroke(); }
function leaf(c, x, y, len, ang, col) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -len * 0.35, len, 0); c.quadraticCurveTo(len * 0.5, len * 0.35, 0, 0);
  c.fillStyle = col; c.fill(); outline(c, 1.5);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.9, 0); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.stroke();
  c.restore();
}
function rosette(c, x, y, r, petal, centre, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n;
    c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.45, r * 0.25, a, 0, 7);
    c.fillStyle = petal; c.fill(); outline(c, 1.2);
  }
  c.beginPath(); c.arc(x, y, r * 0.32, 0, 7); c.fillStyle = centre; c.fill(); outline(c, 1.2);
  c.beginPath(); c.arc(x, y, r * 0.12, 0, 7); c.fillStyle = P.gold; c.fill();
}
function pomegranate(c, x, y, r) {
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = P.red; c.fill(); outline(c, 1.5);
  c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, 7); c.fillStyle = 'rgba(255,190,150,0.45)'; c.fill();
  c.beginPath(); c.moveTo(x - r * 0.35, y - r * 0.9); c.lineTo(x - r * 0.2, y - r * 1.25); c.lineTo(x, y - r * 1.0); c.lineTo(x + r * 0.2, y - r * 1.25); c.lineTo(x + r * 0.35, y - r * 0.9); c.closePath(); c.fillStyle = P.red; c.fill(); outline(c, 1.2);
}
function cuspedArch(c, x0, y0, w, h, n = 5) { // a lobed arch outline, path only
  c.beginPath(); c.moveTo(x0, y0 + h); c.lineTo(x0, y0 + h * 0.45);
  const cx = x0 + w / 2;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const a0 = Math.PI + t0 * Math.PI, a1 = Math.PI + t1 * Math.PI;
    const p1 = [cx + Math.cos(a0) * w / 2, y0 + h * 0.45 + Math.sin(a0) * h * 0.45];
    const p2 = [cx + Math.cos(a1) * w / 2, y0 + h * 0.45 + Math.sin(a1) * h * 0.45];
    const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    const nx = mid[0] - cx, ny = mid[1] - (y0 + h * 0.45), ln = Math.hypot(nx, ny);
    c.quadraticCurveTo(mid[0] + nx / ln * w * 0.09, mid[1] + ny / ln * w * 0.09, p2[0], p2[1]);
  }
  c.lineTo(x0 + w, y0 + h); c.closePath();
}
// frieze: a row of cusped panels on turquoise, each with a bouquet (pomegranates) or an ornate vase
function friezeTex() {
  return canvasTex(2048, 256, (c, w, h) => {
    c.fillStyle = P.green; c.fillRect(0, 0, w, h);
    const n = 8, pw = w / n;
    for (let i = 0; i < n; i++) {
      const x = i * pw;
      c.fillStyle = P.teal; c.fillRect(x + 10, 16, pw - 20, h - 32);
      // blue scroll corners
      for (const [cx, cy, a] of [[x + 30, 34, 0], [x + pw - 30, 34, Math.PI / 2], [x + 30, h - 34, -Math.PI / 2], [x + pw - 30, h - 34, Math.PI]]) { c.save(); c.translate(cx, cy); c.rotate(a); c.beginPath(); c.arc(0, 0, 16, 0, Math.PI * 1.5); c.strokeStyle = P.navy; c.lineWidth = 5; c.stroke(); leaf(c, 8, 8, 18, 0.8, P.blue); c.restore(); }
      cuspedArch(c, x + 40, 26, pw - 80, h - 44, 7); c.fillStyle = P.cream; c.fill(); outline(c, 2.5);
      cuspedArch(c, x + 52, 40, pw - 104, h - 62, 7); c.fillStyle = i % 2 ? '#f7d9b0' : '#f4e4c4'; c.fill(); outline(c, 1.2);
      const cx = x + pw / 2;
      if (i % 2 === 0) { // bouquet of pomegranates with leaves
        c.beginPath(); c.moveTo(cx, h - 30); c.lineTo(cx, 110); c.strokeStyle = P.dgreen; c.lineWidth = 4; c.stroke();
        for (const [dx, dy, ang] of [[-1, 170, -2.4], [1, 170, -0.7], [-1, 135, -2.6], [1, 135, -0.5]]) leaf(c, cx, dy, 34, ang, P.green);
        pomegranate(c, cx - 26, 118, 22); pomegranate(c, cx + 26, 118, 22); pomegranate(c, cx, 92, 18);
        leaf(c, cx, 70, 26, -Math.PI / 2, P.green);
      } else { // ornate vase with a palmette
        c.beginPath(); c.moveTo(cx - 30, h - 34); c.quadraticCurveTo(cx - 50, 150, cx - 22, 130); c.lineTo(cx - 14, 112); c.lineTo(cx + 14, 112); c.lineTo(cx + 22, 130); c.quadraticCurveTo(cx + 50, 150, cx + 30, h - 34); c.closePath();
        c.fillStyle = P.orange; c.fill(); outline(c, 2);
        c.beginPath(); c.ellipse(cx, 170, 22, 10, 0, 0, 7); c.fillStyle = P.red; c.fill(); outline(c, 1);
        for (let k = -2; k <= 2; k++) leaf(c, cx, 108, 40, -Math.PI / 2 + k * 0.38, k % 2 ? P.green : P.teal);
        c.beginPath(); c.arc(cx, 76, 9, 0, 7); c.fillStyle = P.red; c.fill(); outline(c, 1);
      }
      c.fillStyle = P.gold; c.fillRect(x, 0, 6, h); c.fillRect(x + pw - 6, 0, 6, h);
    }
    c.fillStyle = P.gold; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
  });
}
// strapwork field: cream/gold ground with rows of little cartouches + blue rosettes (the gold beams in the photo)
function strapTex() {
  return canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#e2c070'; c.fillRect(0, 0, w, h);
    const r = rng(19);
    for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '120,80,20' : '255,240,200'},${r() * 0.06})`; c.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
    // gilt ribs dividing the field into panels (2 x 2 per tile)
    c.fillStyle = '#b8862a'; for (const t of [0, 256]) { c.fillRect(t, 0, 10, h); c.fillRect(0, t, w, 10); }
    c.fillStyle = '#f2d890'; for (const t of [0, 256]) { c.fillRect(t + 3, 0, 2, h); c.fillRect(0, t + 3, w, 2); }
    // in each panel: a central lozenge cartouche with a rosette, and four small oval cartouches
    for (const [px, py] of [[133, 133], [389, 133], [133, 389], [389, 389]]) {
      c.save(); c.translate(px, py);
      c.beginPath(); c.moveTo(0, -78); c.lineTo(78, 0); c.lineTo(0, 78); c.lineTo(-78, 0); c.closePath(); c.fillStyle = P.dgreen; c.fill(); outline(c, 2.5);
      c.beginPath(); c.moveTo(0, -62); c.lineTo(62, 0); c.lineTo(0, 62); c.lineTo(-62, 0); c.closePath(); c.fillStyle = P.teal; c.fill();
      c.restore();
      rosette(c, px, py, 30, P.red, P.gold, 10);
      for (const [dx, dy] of [[-88, -88], [88, -88], [-88, 88], [88, 88]]) { c.beginPath(); c.ellipse(px + dx, py + dy, 18, 11, 0, 0, 7); c.fillStyle = P.orange; c.fill(); outline(c, 1.5); c.beginPath(); c.ellipse(px + dx, py + dy, 8, 4, 0, 0, 7); c.fillStyle = P.dgreen; c.fill(); }
      for (const [dx, dy] of [[0, -96], [0, 96], [-96, 0], [96, 0]]) leaf(c, px + dx * 0.9, py + dy * 0.9, 22, Math.atan2(dy, dx), P.green);
    }
  });
}
// coffer panels: turquoise/green with scrolling vine and red rosettes, framed in navy pearls
function cofferTex(seed) {
  return canvasTex(512, 512, (c, w, h) => {
    const r = rng(seed);
    const gr = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#3bbcae'); gr.addColorStop(1, P.green);
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    // diagonal vine lattice
    c.strokeStyle = P.dgreen; c.lineWidth = 5;
    for (let k = -4; k < 8; k++) { c.beginPath(); for (let t = 0; t <= 1.001; t += 0.05) { const x = k * 90 + t * w, y = t * h + Math.sin(t * 12 + k) * 14; t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.beginPath(); for (let t = 0; t <= 1.001; t += 0.05) { const x = k * 90 + (1 - t) * w, y = t * h + Math.cos(t * 12 + k) * 14; t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    for (let k = 0; k < 26; k++) leaf(c, r() * w, r() * h, 20 + r() * 12, r() * 6.28, r() < 0.5 ? '#2f8f5a' : P.teal);
    for (const [x, y, s] of [[w / 2, h / 2, 70], [w * 0.2, h * 0.2, 34], [w * 0.8, h * 0.2, 34], [w * 0.2, h * 0.8, 34], [w * 0.8, h * 0.8, 34]]) rosette(c, x, y, s, P.red, P.gold, s > 50 ? 12 : 8);
    // navy frame with white teardrops
    c.fillStyle = P.navy; c.fillRect(0, 0, w, 34); c.fillRect(0, h - 34, w, 34); c.fillRect(0, 0, 34, h); c.fillRect(w - 34, 0, 34, h);
    c.fillStyle = P.white;
    for (let t = 20; t < w; t += 28) for (const [x, y] of [[t, 17], [t, h - 17], [17, t], [w - 17, t]]) { c.beginPath(); c.ellipse(x, y, 5, 8, 0, 0, 7); c.fill(); }
    c.strokeStyle = P.gold; c.lineWidth = 4; c.strokeRect(36, 36, w - 72, h - 72);
  });
}
// band of white teardrops / buds on navy (runs round the lantern and along the cove)
function pearlBandTex() {
  return canvasTex(512, 64, (c, w, h) => {
    c.fillStyle = P.navy; c.fillRect(0, 0, w, h);
    for (let x = 16; x < w; x += 32) {
      c.beginPath(); c.moveTo(x, 12); c.quadraticCurveTo(x + 12, 36, x, 52); c.quadraticCurveTo(x - 12, 36, x, 12); c.fillStyle = P.white; c.fill();
      c.beginPath(); c.arc(x, 38, 5, 0, 7); c.fillStyle = P.sky; c.fill();
    }
    c.fillStyle = P.gold; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4);
  });
}
// wide vine-scroll band (red/green medallions linked by a scroll, like the band round the photo's lantern)
function scrollBandTex() {
  return canvasTex(1024, 160, (c, w, h) => {
    c.fillStyle = '#5fbf8f'; c.fillRect(0, 0, w, h);
    c.strokeStyle = P.dgreen; c.lineWidth = 6;
    c.beginPath(); for (let x = 0; x <= w; x += 8) { const y = h / 2 + Math.sin(x / w * Math.PI * 8) * 38; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (let i = 0; i < 8; i++) {
      const x = (i + 0.25) * w / 8, y = h / 2 + (i % 2 ? 1 : -1) * 22;
      c.beginPath(); c.ellipse(x, y, 34, 30, 0, 0, 7); c.fillStyle = i % 2 ? '#f2d45a' : '#9ad6a0'; c.fill(); outline(c, 2);
      pomegranate(c, x, y + 4, 15);
      leaf(c, x + 36, y, 26, 0.3, P.green); leaf(c, x - 36, y, 26, Math.PI - 0.3, P.green);
    }
    c.fillStyle = P.gold; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6);
  });
}
// little arcade brackets (the row of small arches under the cove)
function arcadeTex() {
  return canvasTex(512, 96, (c, w, h) => {
    c.fillStyle = P.dgreen; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      c.beginPath(); c.moveTo(x + 4, h); c.lineTo(x + 4, 40); c.quadraticCurveTo(x + 16, 6, x + 28, 40); c.lineTo(x + 28, h); c.closePath();
      c.fillStyle = P.cream; c.fill(); outline(c, 1.2);
      c.beginPath(); c.moveTo(x + 9, h - 6); c.lineTo(x + 9, 44); c.quadraticCurveTo(x + 16, 22, x + 23, 44); c.lineTo(x + 23, h - 6); c.closePath(); c.fillStyle = P.red; c.fill();
    }
    c.fillStyle = P.gold; c.fillRect(0, 0, w, 5);
  });
}
// stained glass for the lantern top: a diamond lattice of jewel colours around an 8-point star
function glassTex() {
  return canvasTex(1024, 512, (c, w, h) => {
    const cols = ['#e8f4c8', '#9ad8e8', '#f2d45a', '#7cc6a0', '#e88a6a', '#c8a0e0', '#f4f0d8'];
    const r = rng(17);
    const s = 48;
    for (let j = -1; j < h / s * 2 + 2; j++) for (let i = -1; i < w / s + 2; i++) {
      const x = i * s + (j % 2) * s / 2, y = j * s / 2;
      c.beginPath(); c.moveTo(x, y - s / 2); c.lineTo(x + s / 2, y); c.lineTo(x, y + s / 2); c.lineTo(x - s / 2, y); c.closePath();
      c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fill(); c.strokeStyle = '#2a2a24'; c.lineWidth = 3; c.stroke();
    }
    // central star medallion
    const cx = w / 2, cy = h / 2;
    c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? 90 : 170; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9); } c.closePath();
    c.fillStyle = '#f4f0d8'; c.fill(); c.strokeStyle = '#2a2a24'; c.lineWidth = 6; c.stroke();
    rosette(c, cx, cy, 70, '#e88a6a', '#f2d45a', 12);
    // border
    c.fillStyle = '#2a6a4a'; c.fillRect(0, 0, w, 18); c.fillRect(0, h - 18, w, 18); c.fillRect(0, 0, 18, h); c.fillRect(w - 18, 0, 18, h);
  });
}

// ------------------------------------------------------------------ furniture + props
function ironChair(bar = false) {
  const g = new THREE.Group();
  const iron = std({ color: '#1c1c1c', metalness: 0.5, roughness: 0.45 });
  const wood = std({ color: '#5a2e1c', roughness: 0.5 });
  const cushion = std({ color: '#6a6a4a', roughness: 0.9 });
  const sh = bar ? 0.76 : 0.46, bh = bar ? 1.25 : 0.95;
  for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
    g.add(tube(V(x, sh, z), V(x * 1.25, 0, z * 1.25), 0.012, iron));
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), iron); foot.position.set(x * 1.25, 0.01, z * 1.25); g.add(foot);
  }
  if (bar) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.01, 6, 24), iron); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring); }
  else for (const z of [-0.23, 0.23]) g.add(tube(V(-0.24, 0.15, z), V(0.24, 0.15, z), 0.008, iron));
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.04, 0.44, 2, 0.015), bar ? cushion : wood); seat.position.y = sh + 0.02; g.add(seat);
  if (bar) { const cu = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.06, 0.42, 3, 0.03), cushion); cu.position.y = sh + 0.07; g.add(cu); }
  // ladder back with a scroll at the top
  for (const x of [-0.2, 0.2]) g.add(tube(V(x, sh, -0.2), V(x * 1.05, bh, -0.25), 0.012, iron));
  for (const y of [sh + 0.22, sh + 0.42, bh - 0.04]) g.add(tube(V(-0.2, y, -0.2 - (y - sh) * 0.1), V(0.2, y, -0.2 - (y - sh) * 0.1), 0.009, iron));
  for (const s of [-1, 1]) { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 14, Math.PI * 1.4), iron); sc.position.set(s * 0.12, bh + 0.02, -0.25); sc.rotation.z = s > 0 ? 0 : Math.PI; g.add(sc); }
  return g;
}
function cafeTable(seed) {
  const g = new THREE.Group();
  const wood = std({ color: '#3a2014', roughness: 0.45 });
  g.add(box(0.8, 0.05, 0.8, wood, 0, 0.74, 0));
  g.add(box(0.76, 0.012, 0.76, new THREE.MeshStandardMaterial({ color: '#a8c8c0', transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1 }), 0, 0.772, 0));
  g.add(box(0.1, 0.7, 0.1, wood, 0, 0.36, 0));
  g.add(box(0.5, 0.04, 0.08, wood, 0, 0.03, 0)); g.add(box(0.08, 0.04, 0.5, wood, 0, 0.03, 0));
  const r = rng(seed);
  const plate = std({ color: '#f6f4ee', roughness: 0.25 });
  const glass = new THREE.MeshStandardMaterial({ color: '#dfeef0', transparent: true, opacity: 0.35, roughness: 0.05 });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.015, 28), plate); p.position.set(s * 0.2, 0.787, 0.05 * s); g.add(p);
    const n = box(0.16, 0.025, 0.09, std({ color: '#f2f0ea', roughness: 0.9 }), s * 0.2, 0.805, -0.17 * s); g.add(n);
    for (const k of [-1, 1]) g.add(box(0.012, 0.005, 0.16, std({ color: '#c8cacc', metalness: 0.8, roughness: 0.25 }), s * 0.2 + k * 0.03, 0.82, -0.17 * s));
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 16, 1, true), glass); gl.position.set(s * 0.05, 0.84, 0.25 * s); g.add(gl);
  }
  for (const [x, c] of [[-0.03, '#f4f4f0'], [0.03, '#2a2a2a']]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.07, 10), std({ color: c, roughness: 0.3, metalness: 0.4 })); sh.position.set(x, 0.81, -0.02 + r() * 0.02); g.add(sh); }
  return g;
}
function curtain(w, h, seed) { // sheer curtain gathered toward a tie-back
  const geo = new THREE.PlaneGeometry(w, h, 40, 30);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const t = (y + h / 2) / h;                                 // 0 bottom .. 1 top
    const pinch = 1 - 0.55 * Math.exp(-(((t - 0.38) / 0.16) ** 2));      // gathered at the tie-back height
    p.setX(i, x * pinch);
    p.setZ(i, Math.sin(x * 26 + seed) * 0.035 * (0.6 + 0.4 * pinch));
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#f6f2ea', transparent: true, opacity: 0.82, roughness: 0.9, side: THREE.DoubleSide }));
}
function paintingTex() { // original abstract painting: gold, ochre and umber strokes around a pale glow
  return canvasTex(512, 640, (c, w, h) => {
    const r = rng(23);
    const gr = c.createRadialGradient(w * 0.55, h * 0.35, 20, w * 0.5, h * 0.5, w * 0.8);
    gr.addColorStop(0, '#fff2c8'); gr.addColorStop(0.4, '#e2b44a'); gr.addColorStop(1, '#4a3a1a');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, len = 30 + r() * 120, a = r() * Math.PI * 2;
      c.strokeStyle = ['rgba(120,80,30,0.35)', 'rgba(240,210,120,0.35)', 'rgba(60,50,30,0.3)', 'rgba(200,90,40,0.3)', 'rgba(250,240,210,0.3)'][Math.floor(r() * 5)];
      c.lineWidth = 3 + r() * 12; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 1) * len * 0.5, y + Math.sin(a + 1) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); c.stroke();
    }
    c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 8; c.beginPath(); c.moveTo(w * 0.3, h * 0.9); c.bezierCurveTo(w * 0.4, h * 0.5, w * 0.7, h * 0.6, w * 0.65, h * 0.15); c.stroke();
  });
}
function tinLabelTex(i) {
  const names = ['JASMINE', 'OOLONG', 'BREAKFAST', 'MINT', 'SENCHA', 'CHAI', 'ROOIBOS', 'PU-ERH', 'EARL', 'DARJEELING'];
  return canvasTex(256, 96, (c, w, h) => {
    c.fillStyle = '#1a1612'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d9b860'; c.fillRect(64, 8, 128, 80);
    c.strokeStyle = '#1a1612'; c.lineWidth = 2; c.strokeRect(70, 14, 116, 68);
    c.fillStyle = '#1a1612'; fitText(c, `No. ${11 + i * 7}`, 128, 34, 100, 16, F.roman); fitText(c, names[i % names.length], 128, 60, 104, 20, F.roman, { spacing: 1 });
  });
}

// ------------------------------------------------------------------ model
export function makeTeahouse() {
  const g = new THREE.Group();
  g.name = 'teahouse';
  const W = 10, D = 5.6, HW = W / 2;
  const WH = 4.4;                 // wall height to the cove
  const CY = 5.2;                 // flat painted field
  const colliders = [];
  const col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);

  const plasterM = (w, h) => std({ map: ptex('th_plaster.png', w / 0.8, h / 0.8), normalMap: ptex('th_plaster_n.png', w / 0.8, h / 0.8, false), roughness: 0.85 });
  const brickT = canvasTex(256, 512, (c, w, h) => { const r = rng(4); c.fillStyle = '#8a7a64'; c.fillRect(0, 0, w, h); for (let j = 0; j < 16; j++) for (let i = -1; i < 3; i++) { const x = i * 128 + (j % 2) * 64; const t = 170 + r() * 30; c.fillStyle = `rgb(${t},${t - 18},${t - 46})`; c.fillRect(x + 4, j * 32 + 4, 120, 24); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 4, j * 32 + 4, 120, 3); } });
  const brickM = (h) => { const t = brickT.clone(); t.repeat.set(1, h / 1.0); t.needsUpdate = true; return std({ map: t, roughness: 0.75 }); };
  const darkWood = std({ color: '#3a1e12', roughness: 0.5 });

  // ---------------------------------------------------------------- floor
  const fl = canvasTex(512, 512, (c, w, h) => { const r = rng(2); for (let i = 0; i < 8; i++) { const t = 46 + r() * 16; c.fillStyle = `rgb(${t + 12},${t - 2},${t - 12})`; c.fillRect(i * 64, 0, 64, h); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(i * 64, 0, 2, h); for (let k = 0; k < 30; k++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,220,180'},0.05)`; c.fillRect(i * 64 + r() * 60, r() * h, 1 + r() * 2, 20 + r() * 80); } const cut = r() * h; c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(i * 64, cut, 64, 2); } }, [W / 1.6, D / 1.6]);
  const floor = plane(W, D, std({ map: fl, roughness: 0.4 }), 0, 0.005, -D / 2, 0, -Math.PI / 2); g.add(floor);

  // ---------------------------------------------------------------- walls (inside faces) with windows + door on the front
  // back wall, end walls
  g.add(plane(W, WH, plasterM(W, WH), 0, WH / 2, -D, 0));
  g.add(plane(D, WH, plasterM(D, WH), -HW, WH / 2, -D / 2, Math.PI / 2));
  g.add(plane(D, WH, plasterM(D, WH), HW, WH / 2, -D / 2, -Math.PI / 2));
  // front wall pieces around two windows (x -2.2 and 3.0, 1.5 wide, sill 0.5 to head 3.7) and the door (x 0.2..1.3)
  const WIN = [[-2.2, 1.5], [3.0, 1.5]], DOOR = [0.2, 1.3], SILL = 0.5, HEAD = 3.7, DH = 2.3;
  const frontPieces = [];   // [x0, x1, y0, y1]
  const xs = [-HW, WIN[0][0] - 0.75, WIN[0][0] + 0.75, DOOR[0], DOOR[1], WIN[1][0] - 0.75, WIN[1][0] + 0.75, HW];
  frontPieces.push([xs[0], xs[1], 0, WH], [xs[2], xs[3], 0, WH], [xs[4], xs[5], 0, WH], [xs[6], xs[7], 0, WH]);
  for (const [cx, ww] of WIN) { frontPieces.push([cx - ww / 2, cx + ww / 2, 0, SILL], [cx - ww / 2, cx + ww / 2, HEAD, WH]); }
  frontPieces.push([DOOR[0], DOOR[1], DH, WH]);
  for (const [x0, x1, y0, y1] of frontPieces) {
    const w = x1 - x0, h = y1 - y0;
    g.add(plane(w, h, plasterM(w, h), (x0 + x1) / 2, (y0 + y1) / 2, -0.001, Math.PI));          // inside face
  }
  // brick pilasters: inside corners, either side of the windows, on the back wall
  for (const [x, z, ry] of [[-HW + 0.18, -0.18, 0], [HW - 0.18, -0.18, 0], [-HW + 0.18, -D + 0.18, 0], [HW - 0.18, -D + 0.18, 0], [WIN[0][0] - 0.95, -0.15, 0], [WIN[1][0] + 0.95, -0.15, 0], [-0.4, -D + 0.15, 0]]) {
    g.add(box(0.36, WH, 0.3, brickM(WH), x, WH / 2, z));
    void ry;
  }
  col(-HW, HW, -D - 0.3, -D + 0.32);
  col(-HW - 0.3, -HW + 0.36, -D, 0); col(HW - 0.36, HW + 0.3, -D, 0);
  col(-HW, DOOR[0] - 0.02, -0.33, 0.3); col(DOOR[1] + 0.02, HW, -0.33, 0.3);
  // windows: dark wood frames, mullions, glass looking out to the lit alley, curtains each side
  for (const [cx, ww] of WIN) {
    const fr = [[ww + 0.16, 0.1, cx, HEAD + 0.05], [ww + 0.16, 0.1, cx, SILL - 0.05]];
    for (const [w, h, x, y] of fr) g.add(box(w, h, 0.16, darkWood, x, y, -0.05));
    for (const k of [-1, 1]) g.add(box(0.08, HEAD - SILL + 0.1, 0.16, darkWood, cx + k * (ww / 2 + 0.04), (HEAD + SILL) / 2, -0.05));
    g.add(box(0.05, HEAD - SILL, 0.08, darkWood, cx, (HEAD + SILL) / 2, -0.05));
    g.add(box(ww, 0.05, 0.08, darkWood, cx, 2.9, -0.05));
    g.add(plane(ww, HEAD - SILL, new THREE.MeshStandardMaterial({ color: '#2a3440', transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.2, depthWrite: false }), cx, (HEAD + SILL) / 2, -0.04, Math.PI));
    g.add(box(ww + 0.3, 0.05, 0.3, darkWood, cx, SILL, -0.15));
    // curtains: a rod above, a panel each side gathered with a tie-back
    g.add(tube(V(cx - ww / 2 - 0.5, HEAD + 0.35, -0.22), V(cx + ww / 2 + 0.5, HEAD + 0.35, -0.22), 0.015, std({ color: '#2a2a2a', metalness: 0.5 })));
    for (const s of [-1, 1]) {
      const cu = curtain(0.75, HEAD + 0.3, cx * 3 + s); cu.position.set(cx + s * (ww / 2 + 0.15), (HEAD + 0.3) / 2 + 0.05, -0.24); g.add(cu);
      const tb = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16), std({ color: '#c8b890' })); tb.position.set(cx + s * (ww / 2 + 0.15), 1.4, -0.24); g.add(tb);
    }
  }
  // door: dark wood frame, glazed leaf standing open into the room
  for (const k of [0, 1]) g.add(box(0.08, DH, 0.18, darkWood, DOOR[k] + (k ? 0.04 : -0.04), DH / 2, -0.05));
  g.add(box(DOOR[1] - DOOR[0] + 0.16, 0.1, 0.18, darkWood, (DOOR[0] + DOOR[1]) / 2, DH + 0.05, -0.05));
  const leafG = new THREE.Group();
  leafG.add(box(DOOR[1] - DOOR[0] - 0.04, DH - 0.06, 0.05, darkWood, (DOOR[1] - DOOR[0]) / 2, (DH - 0.06) / 2, 0));
  leafG.add(box(DOOR[1] - DOOR[0] - 0.24, DH - 0.6, 0.06, new THREE.MeshStandardMaterial({ color: '#c8d8d8', transparent: true, opacity: 0.35, roughness: 0.05 }), (DOOR[1] - DOOR[0]) / 2, DH / 2 + 0.1, 0));
  leafG.add(box(0.03, 0.3, 0.06, std({ color: '#c9a050', metalness: 0.7, roughness: 0.3 }), DOOR[1] - DOOR[0] - 0.12, 1.05, 0.05));
  leafG.position.set(DOOR[0], 0, -0.1); leafG.rotation.y = 1.4; g.add(leafG);
  col(DOOR[0] - 0.05, DOOR[0] + 0.2, -1.2, -0.1);
  // the painting on the back wall, in a thin gold frame, lit by a picture light
  g.add(box(1.5, 1.86, 0.05, std({ color: '#b8923a', metalness: 0.6, roughness: 0.35 }), 2.2, 2.3, -D + 0.03));
  g.add(plane(1.42, 1.78, std({ map: paintingTex(), roughness: 0.6 }), 2.2, 2.3, -D + 0.06));
  g.add(box(0.5, 0.05, 0.12, std({ color: '#b8923a', metalness: 0.6 }), 2.2, 3.3, -D + 0.1));

  // ---------------------------------------------------------------- the painted ceiling
  {
    const IN = 0.6;                         // cove projects 0.6 m in from the walls
    const ix0 = -HW + IN, ix1 = HW - IN, iz0 = -IN, iz1 = -D + IN;
    // row of little arcade brackets right under the cove, all round
    const arc = arcadeTex();
    const band = (len, h, tex, x, y, z, ry, rep) => { const t = tex.clone(); t.repeat.set(rep, 1); t.needsUpdate = true; g.add(plane(len, h, std({ map: t, roughness: 0.6 }), x, y, z, ry)); };
    band(W, 0.25, arc, 0, WH + 0.125, -D + 0.01, 0, W / 2.6);
    band(W, 0.25, arc, 0, WH + 0.125, -0.01, Math.PI, W / 2.6);
    band(D, 0.25, arc, -HW + 0.01, WH + 0.125, -D / 2, Math.PI / 2, D / 2.6);
    band(D, 0.25, arc, HW - 0.01, WH + 0.125, -D / 2, -Math.PI / 2, D / 2.6);
    // the cove: four sloped trapezoid panels from the wall top (WH+0.25) in to the field edge (CY), frieze painted
    const fr = friezeTex();
    const cove = (ax, az, bx, bz, cx, cz, dx, dz, rep) => {
      const geo = new THREE.BufferGeometry();
      const y0 = WH + 0.25, y1 = CY;
      geo.setAttribute('position', new THREE.Float32BufferAttribute([ax, y0, az, bx, y0, bz, cx, y1, cz, dx, y1, dz], 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, rep, 0, rep - 0.0, 1, 0, 1], 2));
      geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals();
      const t = fr.clone(); t.needsUpdate = true;
      const m = new THREE.Mesh(geo, std({ map: t, roughness: 0.6, side: THREE.DoubleSide })); g.add(m);
    };
    // panels: along the back, front, left, right (uv u runs along the length; panels ~1.25 m each)
    cove(-HW, -D, HW, -D, ix1, iz1, ix0, iz1, W / 8.8);
    cove(HW, 0, -HW, 0, ix0, iz0, ix1, iz0, W / 8.8);
    cove(-HW, 0, -HW, -D, ix0, iz1, ix0, iz0, D / 8.8);
    cove(HW, -D, HW, 0, ix1, iz0, ix1, iz1, D / 8.8);
    // a gilded rope moulding where the cove meets the field
    const gold = std({ color: '#d9a520', metalness: 0.6, roughness: 0.35 });
    for (const [a, b] of [[V(ix0, CY, iz0), V(ix1, CY, iz0)], [V(ix1, CY, iz0), V(ix1, CY, iz1)], [V(ix1, CY, iz1), V(ix0, CY, iz1)], [V(ix0, CY, iz1), V(ix0, CY, iz0)]]) g.add(tube(a, b, 0.03, gold, 8));
    // the flat field with an opening for the lantern
    const LX = 2.3, LZ0 = -1.6, LZ1 = -4.0;  // lantern opening: x -2.3..2.3, z -1.6..-4.0
    const st = strapTex();
    const field = (x0, x1, z0, z1) => { const t = st.clone(); t.repeat.set((x1 - x0) / 1.6, (z0 - z1) / 1.6); t.needsUpdate = true; g.add(plane(x1 - x0, z0 - z1, std({ map: t, roughness: 0.6 }), (x0 + x1) / 2, CY, (z0 + z1) / 2, 0, Math.PI / 2)); };
    field(ix0, ix1, iz0, LZ0); field(ix0, ix1, LZ1, iz1); field(ix0, -LX, LZ0, LZ1); field(LX, ix1, LZ0, LZ1);
    // coffers set into the field: four boxes recessed upward at the corners + two at the ends of the lantern
    const cofs = [[ix0 + 0.75, iz0 - 0.5], [ix1 - 0.75, iz0 - 0.5], [ix0 + 0.75, iz1 + 0.5], [ix1 - 0.75, iz1 + 0.5], [(ix0 - LX) / 2, -2.8], [(ix1 + LX) / 2, -2.8]];
    cofs.forEach(([x, z], i) => {
      const w = i < 4 ? 1.1 : 1.0, d = i < 4 ? 0.7 : 1.6;
      // the coffer panel sits just under the field, framed by a hanging moulding painted with white teardrops on navy
      g.add(plane(w, d, std({ map: cofferTex(i * 7 + 3), roughness: 0.6 }), x, CY - 0.012, z, 0, Math.PI / 2));
      const pb = pearlBandTex(), fh = 0.1;
      for (const [len, px, pz, ry] of [[w + 0.1, x, z + d / 2 + 0.05, 0], [w + 0.1, x, z - d / 2 - 0.05, Math.PI], [d + 0.1, x - w / 2 - 0.05, z, -Math.PI / 2], [d + 0.1, x + w / 2 + 0.05, z, Math.PI / 2]]) {
        const t = pb.clone(); t.repeat.set(len / 1.0, 1); t.needsUpdate = true;
        g.add(plane(len, fh, std({ map: t, roughness: 0.6, side: THREE.DoubleSide }), px, CY - fh / 2, pz, ry));
      }
      for (const [bw, bd, bx2, bz] of [[w + 0.12, 0.03, x, z + d / 2 + 0.05], [w + 0.12, 0.03, x, z - d / 2 - 0.05], [0.03, d + 0.12, x - w / 2 - 0.05, z], [0.03, d + 0.12, x + w / 2 + 0.05, z]]) g.add(box(bw, 0.025, bd, gold, bx2, CY - fh, bz));
    });
    // the lantern: tier 1 (scroll band), a ledge, tier 2 (pearl band), the lit stained glass on top
    const T1 = 0.5, T2 = 0.32, inset = 0.25;
    const sb = scrollBandTex(), pb2 = pearlBandTex();
    const ring = (x0, x1, z0, z1, y0, h, tex, rep) => {
      for (const [len, px, pz, ry] of [[x1 - x0, (x0 + x1) / 2, z0, Math.PI], [x1 - x0, (x0 + x1) / 2, z1, 0], [z0 - z1, x0, (z0 + z1) / 2, Math.PI / 2], [z0 - z1, x1, (z0 + z1) / 2, -Math.PI / 2]]) {
        const t = tex.clone(); t.repeat.set(len / rep, 1); t.needsUpdate = true;
        g.add(plane(len, h, std({ map: t, roughness: 0.6, side: THREE.DoubleSide }), px, y0 + h / 2, pz, ry));
      }
    };
    ring(-LX, LX, LZ0, LZ1, CY, T1, sb, 3.6);
    // the ledge between the tiers (strapwork painted, seen from below)
    const lt = st.clone(); lt.repeat.set(2 * LX / 1.6, 0.16); lt.needsUpdate = true;
    for (const [w, d, x, z] of [[2 * LX, inset, 0, LZ0 - inset / 2], [2 * LX, inset, 0, LZ1 + inset / 2], [inset, LZ0 - LZ1 - 2 * inset, -LX + inset / 2, (LZ0 + LZ1) / 2], [inset, LZ0 - LZ1 - 2 * inset, LX - inset / 2, (LZ0 + LZ1) / 2]]) g.add(plane(w, d, std({ map: lt, roughness: 0.6 }), x, CY + T1, z, 0, Math.PI / 2));
    ring(-LX + inset, LX - inset, LZ0 - inset, LZ1 + inset, CY + T1, T2, pb2, 2.0);
    for (const y of [CY + T1, CY + T1 + T2]) for (const [a, b] of [[V(-LX + inset, y, LZ0 - inset), V(LX - inset, y, LZ0 - inset)], [V(-LX + inset, y, LZ1 + inset), V(LX - inset, y, LZ1 + inset)]]) g.add(tube(a, b, 0.02, gold, 6));
    const gl = plane(2 * (LX - inset), LZ0 - LZ1 - 2 * inset, new THREE.MeshStandardMaterial({ map: glassTex(), emissive: '#ffffff', emissiveMap: null, emissiveIntensity: 0, roughness: 0.4 }), 0, CY + T1 + T2, (LZ0 + LZ1) / 2, 0, Math.PI / 2);
    gl.material.emissiveMap = gl.material.map; gl.material.emissive = new THREE.Color('#ffffff'); gl.material.emissiveIntensity = 0.9;
    g.add(gl);
    const sl = new THREE.PointLight('#fff4e0', 4, 8, 1.4); sl.position.set(0, CY + 0.2, (LZ0 + LZ1) / 2); g.add(sl);
  }

  // ---------------------------------------------------------------- the bar + the tea tin wall (left end)
  {
    const bx = -HW;               // end wall
    // glass shelves on the end wall with rows of tins
    const shelfM = new THREE.MeshStandardMaterial({ color: '#cfe0e0', transparent: true, opacity: 0.45, roughness: 0.05 });
    const tinBody = std({ color: '#141210', metalness: 0.5, roughness: 0.35 });
    const labels = Array.from({ length: 6 }, (_, i) => std({ map: tinLabelTex(i), roughness: 0.4, metalness: 0.3 }));
    const lid = std({ color: '#1e1a16', metalness: 0.6, roughness: 0.3 });
    const r = rng(31);
    for (let row = 0; row < 4; row++) {
      const y = 1.25 + row * 0.42;
      g.add(box(0.32, 0.02, D - 1.2, shelfM, bx + 0.18, y, -D / 2));
      for (let k = 0; k < 15; k++) {
        const z = -0.8 - k * 0.27, h = 0.24 + (row === 3 ? 0.06 : 0), rr = 0.075;
        const t = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, h, 20), tinBody); t.position.set(bx + 0.18, y + 0.01 + h / 2, z); g.add(t);
        const lb = new THREE.Mesh(new THREE.CylinderGeometry(rr + 0.002, rr + 0.002, h * 0.6, 20, 1, true, Math.PI * 0.2, Math.PI * 0.6), labels[(k + row * 3) % 6]); lb.position.copy(t.position); lb.rotation.y = Math.PI / 2 - Math.PI * 0.5; g.add(lb);
        const lc = new THREE.Mesh(new THREE.CylinderGeometry(rr + 0.004, rr + 0.004, 0.02, 20), lid); lc.position.set(t.position.x, y + 0.02 + h, z); g.add(lc);
        void r;
      }
    }
    // under-shelf strip lights
    for (let row = 0; row < 4; row++) g.add(box(0.02, 0.01, D - 1.3, glow(1.6, 1.4, 1.1), bx + 0.33, 1.23 + row * 0.42, -D / 2));
    // back counter under the shelves: red tea machine, order screen, white jugs, bottles
    g.add(box(0.6, 0.95, D - 1.0, std({ color: '#2a1810', roughness: 0.5 }), bx + 0.3, 0.475, -D / 2));
    g.add(box(0.64, 0.04, D - 0.96, std({ color: '#1a1a1a', roughness: 0.3 }), bx + 0.3, 0.97, -D / 2));
    g.add(box(0.42, 0.62, 0.45, std({ color: '#c8201e', roughness: 0.3, metalness: 0.2 }), bx + 0.32, 1.3, -1.2));
    g.add(box(0.05, 0.32, 0.42, glow(0.5, 0.75, 1.1), bx + 0.4, 1.25, -2.4).rotateY(0));
    g.add(box(0.06, 0.34, 0.44, std({ color: '#111' }), bx + 0.38, 1.25, -2.4));
    for (let k = 0; k < 4; k++) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.26, 16), std({ color: '#f4f4f0', roughness: 0.3 })); j.position.set(bx + 0.3, 1.12, -3.2 - k * 0.22); g.add(j); }
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.3, 12), new THREE.MeshStandardMaterial({ color: ['#2a6a3a', '#7a2a1a', '#d8d0b0'][k], transparent: true, opacity: 0.8, roughness: 0.1 })); b.position.set(bx + 0.25, 1.14, -4.3 - k * 0.12); g.add(b); }
    // the front bar counter: carved dark wood, panelled, with a thick top
    const cx = -HW + 1.55;
    g.add(box(0.55, 1.05, D - 1.3, std({ color: '#3a1e12', roughness: 0.5 }), cx, 0.525, -D / 2 - 0.25));
    g.add(box(0.7, 0.06, D - 1.2, std({ color: '#2a140a', roughness: 0.35 }), cx, 1.08, -D / 2 - 0.25));
    for (let k = 0; k < 5; k++) { const z = -1.15 - k * 0.85; g.add(box(0.03, 0.75, 0.7, std({ color: '#4a2a18', roughness: 0.5 }), cx + 0.29, 0.52, z)); g.add(box(0.035, 0.6, 0.55, std({ color: '#2e180c', roughness: 0.5 }), cx + 0.3, 0.52, z)); }
    g.add(box(0.08, 0.06, D - 1.3, std({ color: '#2a140a' }), cx + 0.3, 0.08, -D / 2 - 0.25));
    col(-HW, cx + 0.32, -D, -0.6);
    // bar stools along the counter
    for (const z of [-1.4, -2.4, -3.4, -4.4]) { const s = ironChair(true); s.position.set(cx + 0.72, 0, z); s.rotation.y = Math.PI / 2 + (z % 2) * 0.05; g.add(s); }
    col(cx + 0.45, cx + 1.0, -4.75, -1.05);
    const bl = new THREE.PointLight('#ffd9a8', 2.4, 5, 1.6); bl.position.set(-HW + 1.0, 2.6, -2.8); g.add(bl);
  }

  // ---------------------------------------------------------------- tables + chairs
  {
    const tables = [[-0.4, -1.5], [-0.2, -3.9], [2.1, -2.3], [3.9, -3.6], [4.0, -1.2]];
    tables.forEach(([x, z], i) => {
      const t = cafeTable(i + 5); t.position.set(x, 0, z); t.rotation.y = (i % 2) * 0.1; g.add(t);
      for (const [dx, dz, ry] of [[0, 0.62, Math.PI], [0, -0.62, 0]]) { const ch = ironChair(false); ch.position.set(x + dx, 0, z + dz); ch.rotation.y = ry + (i * 0.13 % 0.3); g.add(ch); }
      col(x - 0.45, x + 0.45, z - 0.95, z + 0.95);
    });
  }

  // ---------------------------------------------------------------- lighting: a cable rail with small pendant spots + two pendant bowls
  {
    const wire = std({ color: '#2a2a2a', metalness: 0.5 });
    for (const z of [-1.6, -4.0]) g.add(tube(V(-HW + 0.3, 3.9, z), V(HW - 0.3, 3.9, z), 0.004, wire, 4));
    for (const [x, z] of [[-0.4, -1.6], [2.1, -1.6], [4.0, -1.6], [-0.2, -4.0], [2.2, -4.0], [3.9, -4.0]]) {
      g.add(tube(V(x, 3.9, z), V(x, 3.4, z), 0.004, wire, 4));
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 14, 1, true), std({ color: '#1a1a1a', side: THREE.DoubleSide })); sp.position.set(x, 3.34, z); g.add(sp);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), glow(2.4, 2.1, 1.6)); b.position.set(x, 3.29, z); g.add(b);
    }
    for (const [x, z] of [[-0.3, -2.7], [3.0, -2.5]]) {
      g.add(tube(V(x, CY, z), V(x, 3.2, z), 0.005, wire, 4));
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#f4ece0', emissive: '#ffd9a0', emissiveIntensity: 0.9, side: THREE.DoubleSide, roughness: 0.7 }));
      sh.rotation.x = Math.PI; sh.position.set(x, 3.15, z); g.add(sh);
    }
    const tl = new THREE.PointLight('#ffd9a8', 4, 7, 1.5); tl.position.set(1.8, 3.0, -2.6); g.add(tl);
  }

  // ---------------------------------------------------------------- street front (outside face of the front wall)
  {
    const FH = 7.2;
    const outM = (w, h) => { const m = plasterM(w, h); m.color = new THREE.Color('#efe6d4'); return m; };
    // the solid parts of the front around the openings, then the band above up to the parapet
    for (const [x0, x1, y0, y1] of frontPieces) { const w = x1 - x0, h = y1 - y0; g.add(plane(w, h, outM(w, h), (x0 + x1) / 2, (y0 + y1) / 2, 0.06)); }
    g.add(plane(W, FH - WH, outM(W, FH - WH), 0, WH + (FH - WH) / 2, 0.06));
    g.add(box(W + 0.2, 0.25, 0.3, std({ color: '#d8ccb4' }), 0, FH + 0.12, 0.05));
    // window and door reveals (the wall's thickness)
    for (const [cx, ww] of WIN) { for (const k of [-1, 1]) g.add(plane(0.12, HEAD - SILL, outM(0.12, HEAD - SILL), cx + k * ww / 2, (HEAD + SILL) / 2, 0.0, k * -Math.PI / 2)); g.add(box(ww + 0.2, 0.06, 0.2, std({ color: '#cfc3aa' }), cx, SILL - 0.03, 0.12)); }
    // brick pilasters outside
    for (const x of [-HW + 0.2, WIN[0][0] - 0.95, WIN[1][0] + 0.95, HW - 0.2]) g.add(box(0.4, FH, 0.18, brickM(FH), x, FH / 2, 0.1));
    // carved name board above the door + windows
    const nb = canvasTex(1600, 260, (c, w, h) => {
      c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#d9a520'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
      for (const x of [90, w - 90]) rosette(c, x, h / 2, 50, P.red, P.gold, 10);
      c.fillStyle = '#e9c97a'; fitText(c, 'Silk Garden', w / 2, 112, w - 360, 120, F.couture);
      c.fillStyle = '#c8b48a'; fitText(c, 'TEA HOUSE  ·  BAR  ·  KITCHEN', w / 2, 200, w - 480, 46, F.roman, { spacing: 10 });
    });
    g.add(box(6.2, 1.05, 0.12, std({ color: '#2a1a10' }), 0.4, 4.6, 0.14));
    g.add(plane(6.1, 0.99, std({ map: nb, roughness: 0.5, emissive: '#ffe0a0', emissiveIntensity: 0.12, emissiveMap: nb }), 0.4, 4.6, 0.205));
    for (const x of [-2.0, 2.8]) { g.add(tube(V(x, 5.3, 0.12), V(x, 5.3, 0.6), 0.015, std({ color: '#222' }))); const lmp = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 14, 1, true), std({ color: '#222', side: THREE.DoubleSide })); lmp.position.set(x, 5.24, 0.6); lmp.rotation.x = Math.PI; g.add(lmp); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), glow(2.2, 2.0, 1.6)).translateX(x).translateY(5.2).translateZ(0.6)); }
    // the rest of the building's outside: end walls, back, roof (seen from the alley's far bend)
    const shell = std({ map: ptex('ba_stucco.png', D, FH), color: '#d8cfbf', roughness: 0.9 });
    for (const s of [-1, 1]) g.add(plane(D, FH, shell, s * (HW + 0.06), FH / 2, -D / 2, s * Math.PI / 2));
    g.add(plane(W, FH, shell, 0, FH / 2, -D - 0.06, Math.PI));
    const roof = plane(W + 0.2, D + 0.2, std({ color: '#3a3a3c', roughness: 0.9 }), 0, FH, -D / 2, 0, -Math.PI / 2); g.add(roof);
    // ceiling void above the painted ceiling, so nothing outside shows through any gap
    const lid = plane(W, D, std({ color: '#2a2420', side: THREE.DoubleSide }), 0, CY + 0.95, -D / 2, 0, Math.PI / 2); g.add(lid);
    // hours plaque by the door
    const hp = canvasTex(256, 320, (c, w, h) => { c.fillStyle = '#efe4c8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a6a2a'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#3a2a14'; fitText(c, 'OPEN', w / 2, 60, w - 60, 46, F.roman, { spacing: 8 }); fitText(c, 'Tue – Sun', w / 2, 130, w - 60, 34, F.couture); fitText(c, '11:00 – 23:00', w / 2, 180, w - 60, 34, F.couture); c.fillStyle = '#8a3a1a'; fitText(c, 'loose-leaf tea · cakes', w / 2, 250, w - 50, 28, F.couture); });
    g.add(plane(0.4, 0.5, std({ map: hp }), DOOR[1] + 0.45, 1.5, 0.07));
    // the curtains + warm light read through the windows from outside
    const ol = new THREE.PointLight('#ffd9a8', 2.0, 4, 1.6); ol.position.set(0.7, 2.4, 0.9); g.add(ol);
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.area = { minX: -HW + 2.3, maxX: HW - 0.45, minZ: -D + 0.45, maxZ: -0.4 };
  g.userData.door = { x0: DOOR[0] + 0.15, x1: DOOR[1] - 0.12 };
  return g;
}
