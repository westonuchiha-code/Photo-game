// Covered electronics market alley (28h, from photos/city/electronics-market-arcade.jpg).
// All shop names and signs are made up; no phone numbers.
//   makeMarketAlley()  a 20 m alley of parts shops under an elevated concrete deck:
//     overhead   the deck soffit (painted pale grey-green, mould spots along cracks, texture from the
//                photo) on cross beams every 4 m and edge beams over each shop line, fluorescent
//                fittings on the beams, conduit and cable trays, a CCTV camera, globe lamps
//     floor      speckled granite pavers (texture from the photo) with a steel slot drain running the
//                length of the alley, damp patches, a rusty bench by the entrance
//     east side  (right, looking in) MIRAE ELECTRONICS with its big yellow / white / red P.C.B
//                lightbox, a blue-tiled P.C.B design office with a glass door, lit parts shops,
//                blade signs hanging down the alley, a hand truck with a carton, yellow crates,
//                a green stool, a junk robot sculpture holding a boombox
//     west side  (left) a striped awning over a half-shuttered shop with an old massage chair, a
//                yellow crate of amps and receivers, glass display cases of parts, closed shutters
//     far end    the alley opens past the deck to a white block with a strip of windows
// Faces +z (entrance at z = 0, alley runs to -z), origin at ground level on the centre line.
// userData: colliders [[x0,x1,z0,z1]] (street level only), area {minX..}
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeCircuitBoard, makeCordBundle } from './pcb33.js';

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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
};
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function tube(a, b, r, mat, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  m.castShadow = true;
  return m;
}
// a beam/slab whose visible faces (bottom + 4 sides) each get the texture at metre scale (unit = metres per repeat)
function beam(w, h, d, tex, unit, x, y, z) {
  const g = new THREE.Group();
  const mk = (a, b) => { const t = tex.clone(); t.repeat.set(a / unit, b / unit); t.needsUpdate = true; return std({ map: t, roughness: 0.9 }); };
  const add = (pw, ph, rx, ry, px, py, pz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mk(pw, ph)); m.rotation.set(rx, ry, 0); m.position.set(px, py, pz); m.receiveShadow = true; g.add(m); };
  add(w, d, Math.PI / 2, 0, 0, -h / 2, 0);                 // bottom
  add(w, h, 0, 0, 0, 0, d / 2); add(w, h, 0, Math.PI, 0, 0, -d / 2);
  add(d, h, 0, Math.PI / 2, w / 2, 0, 0); add(d, h, 0, -Math.PI / 2, -w / 2, 0, 0);
  g.position.set(x, y, z);
  return g;
}
function plane(w, h, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  return m;
}
const lit = (map, k = 0.5) => std({ map, emissive: '#ffffff', emissiveIntensity: k, emissiveMap: map, roughness: 0.45 });

// ------------------------------------------------------------------ sign artwork
function grime(c, w, h, seed, n = 160, a = 0.08) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { c.fillStyle = `rgba(50,45,40,${r() * a})`; c.fillRect(r() * w, r() * h, 2 + r() * 14, 2 + r() * 10); }
}
// the big three-band lightbox (yellow name band, white service band, red band)
function miraeTex() {
  return canvasTex(1200, 600, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#f6e3a8'); g.addColorStop(1, '#f1d68c');
    c.fillStyle = g; c.fillRect(0, 0, w, 300);
    c.fillStyle = '#d9262e'; fitText(c, 'MIRAE', w * 0.5, 160, w - 160, 230, F.heavy, { spacing: 24 });
    c.fillStyle = '#fbfaf6'; c.fillRect(0, 300, w, 150);
    c.fillStyle = '#d9262e'; fitText(c, 'P.C.B  ·  SINGLE  ·  DOUBLE-SIDED', w / 2, 378, w - 120, 84, F.heavy, { spacing: 4 });
    c.fillStyle = '#d9262e'; c.fillRect(0, 450, w, 150);
    c.fillStyle = '#ffffff'; fitText(c, 'ELECTRONICS  ·  OPEN 9:00 – 18:00', w / 2, 528, w - 140, 78, F.heavy, { spacing: 3 });
    c.strokeStyle = 'rgba(120,90,40,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 300); c.lineTo(w, 300); c.stroke();
    grime(c, w, h, 3);
  });
}
// white lightbox with blue text + a small blue strip (like the photo's middle sign)
function blueSignTex(head, sub, foot) {
  return canvasTex(800, 520, (c, w, h) => {
    c.fillStyle = '#f7f8fa'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1d3a8f'; fitText(c, head, w / 2, 130, w - 80, 120, F.heavy, { spacing: 4 });
    c.fillStyle = '#3a3a3a'; fitText(c, sub, w / 2, 270, w - 90, 46, F.label, { spacing: 2 });
    fitText(c, 'resistors · ICs · connectors · relays · LEDs', w / 2, 330, w - 110, 38, F.small);
    c.fillStyle = '#1d3a8f'; c.fillRect(0, h - 120, w, 120);
    c.fillStyle = '#fff'; fitText(c, foot, w / 2, h - 60, w - 100, 56, F.label, { spacing: 4 });
    grime(c, w, h, 7, 120);
  });
}
function plaqueTex(text, bg, ink, font = F.heavy) {
  return canvasTex(512, 160, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = ink; fitText(c, text, w / 2, h / 2 + 4, w - 50, 90, font, { spacing: 3 });
    grime(c, w, h, text.length, 60);
  });
}
function bladeTex(top, big, bot, bg, ink, band) {
  return canvasTex(256, 640, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (band) { c.fillStyle = band; c.fillRect(0, 0, w, 110); c.fillRect(0, h - 110, w, 110); }
    c.fillStyle = band ? '#ffffff' : ink; fitText(c, top, w / 2, 56, w - 30, 48, F.label, { spacing: 2 });
    c.fillStyle = ink;
    const letters = big.split('');
    const step = (h - 260) / letters.length;
    letters.forEach((ch, i) => fitText(c, ch, w / 2, 140 + step * (i + 0.5), w - 40, Math.min(150, step * 1.05), F.heavy));
    c.fillStyle = band ? '#ffffff' : ink; fitText(c, bot, w / 2, h - 56, w - 30, 42, F.label, { spacing: 2 });
    grime(c, w, h, big.length * 3, 80);
  });
}
function partsDrawersTex() { // wall of small parts drawers with hand labels
  return canvasTex(512, 512, (c, w, h) => {
    const r = rng(5);
    c.fillStyle = '#5a6066'; c.fillRect(0, 0, w, h);
    for (let j = 0; j < 12; j++) for (let i = 0; i < 8; i++) {
      const x = i * 64 + 3, y = j * 42.6 + 3;
      c.fillStyle = ['#d8dcd8', '#c9d4e0', '#e6dcc8'][(i + j) % 3]; c.fillRect(x, y, 58, 37);
      c.fillStyle = '#ffffff'; c.fillRect(x + 8, y + 5, 42, 14);
      c.fillStyle = '#333'; c.font = `11px ${F.small}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(['10kΩ', '4.7µF', 'LM358', '1N4148', 'M3', 'LED R', '2N2222', '220Ω', 'SW', 'XTAL'][Math.floor(r() * 10)], x + 29, y + 12);
      c.fillStyle = '#6a6e72'; c.fillRect(x + 21, y + 26, 16, 5);
    }
  });
}
function panelTex(kind, seed) { // fronts of old amps / receivers / test gear
  return canvasTex(512, 128, (c, w, h) => {
    const r = rng(seed);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, kind ? '#c9cbcc' : '#2a2b2d'); g.addColorStop(1, kind ? '#a9abac' : '#1a1b1c');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${r() * 0.05})`; c.fillRect(0, r() * h, w, 1); }
    // display / VU meters
    c.fillStyle = '#0d1a14'; c.fillRect(40, 30, 150, 50);
    c.fillStyle = kind ? '#e8c060' : '#58d0a0'; c.font = `24px ${F.led}`; c.textAlign = 'left'; c.fillText(kind ? '88.1 FM' : 'CH 2  5V', 52, 64);
    // knobs
    for (let k = 0; k < 4; k++) {
      const x = 250 + k * 62, y = 64;
      c.fillStyle = '#111'; c.beginPath(); c.arc(x, y, 20, 0, 7); c.fill();
      c.fillStyle = '#777'; c.beginPath(); c.arc(x - 5, y - 5, 12, 0, 7); c.fill();
      c.strokeStyle = '#ddd'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14 * Math.cos(r() * 6), y + 14 * Math.sin(r() * 6)); c.stroke();
    }
    c.fillStyle = kind ? '#333' : '#bbb'; c.font = `14px ${F.small}`; c.fillText(kind ? 'STEREO RECEIVER' : 'DC POWER SUPPLY', 40, 108);
  });
}
function slotDrainTex() {
  return canvasTex(64, 512, (c, w, h) => {
    c.fillStyle = '#6a6c6e'; c.fillRect(0, 0, w, h);
    for (let y = 8; y < h; y += 32) { c.fillStyle = '#121212'; c.fillRect(12, y, 40, 16); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(12, y + 16, 40, 2); }
    c.fillStyle = '#4a4c4e'; c.fillRect(0, 0, 4, h); c.fillRect(w - 4, 0, 4, h);
  });
}
function stripeTex() { // faded red / white awning stripes
  return canvasTex(256, 64, (c, w, h) => {
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#efe2d6' : '#c95b4e'; c.fillRect(i * 32, 0, 32, h); }
    grime(c, w, h, 4, 60, 0.12);
  });
}
function shutterTex(col) {
  return canvasTex(256, 256, (c, w, h) => {
    for (let i = 0; i < 26; i++) {
      const y = i * (h / 26);
      const g = c.createLinearGradient(0, y, 0, y + h / 26);
      g.addColorStop(0, col[0]); g.addColorStop(0.5, col[1]); g.addColorStop(1, col[2]);
      c.fillStyle = g; c.fillRect(0, y, w, h / 26 + 1);
    }
    grime(c, w, h, 9, 80, 0.1);
  });
}

// ------------------------------------------------------------------ props
function massageChair() {
  const g = new THREE.Group();
  const leather = std({ color: '#1c1d1f', roughness: 0.42 });
  const grey = std({ color: '#3a3c3f', roughness: 0.6 });
  g.add(rbox(0.75, 0.42, 0.85, 0.05, grey, 0, 0.21, 0));
  g.add(rbox(0.62, 0.16, 0.6, 0.07, leather, 0, 0.5, 0.05));
  const back = rbox(0.66, 1.0, 0.24, 0.09, leather, 0, 0.98, -0.32); back.rotation.x = -0.18; g.add(back);
  const head = rbox(0.5, 0.26, 0.2, 0.08, leather, 0, 1.52, -0.42); head.rotation.x = -0.25; g.add(head);
  for (const s of [-1, 1]) {
    g.add(rbox(0.12, 0.42, 0.78, 0.05, leather, s * 0.37, 0.66, 0.02));
    g.add(box(0.1, 0.03, 0.2, std({ color: '#888' }), s * 0.37, 0.88, 0.25));
  }
  const foot = rbox(0.5, 0.42, 0.18, 0.06, leather, 0, 0.26, 0.5); foot.rotation.x = 0.35; g.add(foot);
  // a gutted cassette deck left on the seat
  const deck = box(0.38, 0.1, 0.24, std({ color: '#b8a888' }), 0, 0.63, 0.12); g.add(deck);
  const wire = null; void wire;
  g.add(box(0.12, 0.04, 0.1, std({ color: '#3a3a3a' }), -0.08, 0.7, 0.12));
  return g;
}
function crate(col = '#f2c21a', seed = 1) {
  const g = new THREE.Group();
  const m = std({ color: col, roughness: 0.55 });
  const W = 0.6, D = 0.42, H = 0.3;
  g.add(box(W, 0.02, D, m, 0, 0.01, 0));
  // walls with lattice openings (rows of slots)
  const slot = canvasTex(128, 64, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.85)'; for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) c.fillRect(6 + i * 13.4, 8 + j * 13, 8, 8); });
  const sm = std({ map: slot, roughness: 0.55, transparent: true, alphaTest: 0.5 });
  const alphaC = document.createElement('canvas'); alphaC.width = 128; alphaC.height = 64; const ax = alphaC.getContext('2d'); ax.fillStyle = '#fff'; ax.fillRect(0, 0, 128, 64); ax.fillStyle = '#000'; for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) ax.fillRect(6 + i * 13.4, 8 + j * 13, 8, 8);
  sm.alphaMap = new THREE.CanvasTexture(alphaC); sm.side = THREE.DoubleSide;
  for (const s of [-1, 1]) { g.add(plane(W, H, sm, 0, H / 2, s * D / 2, s > 0 ? 0 : Math.PI)); g.add(plane(D, H, sm, s * W / 2, H / 2, 0, s * Math.PI / 2)); }
  g.add(box(W + 0.02, 0.025, 0.02, m, 0, H, D / 2)); g.add(box(W + 0.02, 0.025, 0.02, m, 0, H, -D / 2));
  g.add(box(0.02, 0.025, D, m, W / 2, H, 0)); g.add(box(0.02, 0.025, D, m, -W / 2, H, 0));
  void seed;
  return g;
}
function gearBox(w, h, d, kind, seed) {
  const g = new THREE.Group();
  const body = std({ color: kind ? '#b9bbbc' : '#232425', metalness: 0.3, roughness: 0.45 });
  g.add(box(w, h, d, body, 0, h / 2, 0));
  g.add(plane(w - 0.01, h - 0.01, std({ map: panelTex(kind, seed), roughness: 0.4 }), 0, h / 2, d / 2 + 0.002));
  for (const s of [-1, 1]) g.add(box(0.03, 0.012, 0.03, std({ color: '#111' }), s * (w / 2 - 0.05), 0.006, d / 2 - 0.05));
  return g;
}
function handTruck() {
  const g = new THREE.Group();
  const steel = std({ color: '#8a8d90', metalness: 0.5, roughness: 0.4 });
  for (const s of [-1, 1]) g.add(tube(V(s * 0.17, 0.08, 0), V(s * 0.17, 1.15, -0.12), 0.012, steel, 8));
  g.add(tube(V(-0.17, 1.15, -0.12), V(0.17, 1.15, -0.12), 0.012, steel, 8));
  for (let k = 1; k < 4; k++) g.add(tube(V(-0.17, 0.08 + k * 0.26, -k * 0.03), V(0.17, 0.08 + k * 0.26, -k * 0.03), 0.008, steel, 6));
  g.add(box(0.36, 0.01, 0.2, steel, 0, 0.02, 0.09));
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 20), std({ color: '#1a1a1a', roughness: 0.8 }));
    w.rotation.z = Math.PI / 2; w.position.set(s * 0.22, 0.08, -0.04); g.add(w);
  }
  // cardboard carton with tape and a shipping label
  const cb = canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#c49a64'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9b47c'; c.fillRect(w / 2 - 14, 0, 28, h); c.fillStyle = '#f4f2ec'; c.fillRect(160, 120, 70, 44); c.fillStyle = '#333'; for (let i = 0; i < 5; i++) c.fillRect(166, 128 + i * 7, 40 + (i % 2) * 14, 2); grime(c, w, h, 2, 40, 0.06); });
  g.add(box(0.5, 0.36, 0.4, std({ map: cb, roughness: 0.85 }), 0.05, 0.68, 0.02));
  return g;
}
function stool(col) {
  const g = new THREE.Group();
  const m = std({ color: col, roughness: 0.5 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 28), m); top.position.y = 0.45; g.add(top);
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.43, 4, 1, true), std({ color: col, roughness: 0.5, side: THREE.DoubleSide })); legs.rotation.y = Math.PI / 4; legs.position.y = 0.215; g.add(legs);
  // cut-outs read as dark panels on each face
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.add(plane(0.12, 0.26, std({ color: '#0e2a1e' }), Math.sin(a) * 0.123, 0.22, Math.cos(a) * 0.123, a)); }
  return g;
}
function junkRobot() { // a sculpture welded together from old audio + computer gear, holding a boombox
  const g = new THREE.Group();
  const black = std({ color: '#1a1a1b', roughness: 0.5 });
  const beige = std({ color: '#cfc6b0', roughness: 0.55 });
  const metal = std({ color: '#a6aaae', metalness: 0.5, roughness: 0.35 });
  const red = std({ color: '#b52a26', roughness: 0.45 });
  // legs: two short speaker cabinets as feet, conduit shins
  for (const s of [-1, 1]) {
    g.add(box(0.2, 0.16, 0.3, black, s * 0.13, 0.08, 0.03));
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 20), std({ color: '#3a3a3a' })); cone.rotation.x = Math.PI / 2; cone.position.set(s * 0.13, 0.08, 0.185); g.add(cone);
    for (let k = 0; k < 6; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.012, 6, 12), metal); r.rotation.x = Math.PI / 2; r.position.set(s * 0.13, 0.18 + k * 0.05, 0); g.add(r); }
  }
  // hips: red stool seat; body: beige computer tower with a floppy slot + vents; chest: a VU meter
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), red); seat.position.y = 0.5; g.add(seat);
  g.add(box(0.36, 0.48, 0.24, beige, 0, 0.77, 0));
  g.add(box(0.2, 0.012, 0.01, std({ color: '#222' }), 0.02, 0.92, 0.121));
  for (let k = 0; k < 6; k++) g.add(box(0.26, 0.008, 0.01, std({ color: '#8f8774' }), 0, 0.6 + k * 0.03, 0.121));
  const vu = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#f2e6b8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.arc(w / 2, h + 10, 56, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#c22'; c.beginPath(); c.arc(w / 2, h + 10, 56, Math.PI * 1.7, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#111'; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2 + 30, 12); c.stroke(); });
  g.add(plane(0.16, 0.08, lit(vu, 0.35), -0.06, 0.82, 0.122));
  // shoulders: a stereo receiver lying across; arms: segmented conduit down to the boombox
  g.add(box(0.52, 0.1, 0.26, std({ color: '#b8babb', metalness: 0.35, roughness: 0.4 }), 0, 1.06, 0));
  for (let k = 0; k < 4; k++) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 12), black); kn.rotation.x = Math.PI / 2; kn.position.set(-0.12 + k * 0.08, 1.06, 0.135); g.add(kn); }
  for (const s of [-1, 1]) {
    const a = V(s * 0.27, 1.04, 0), b = V(s * 0.22, 0.8, 0.2);
    for (let k = 0; k <= 8; k++) { const p = a.clone().lerp(b, k / 8); const r = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), metal); r.position.copy(p); g.add(r); }
  }
  // head: a small CRT monitor with a glowing face drawn on the screen, antenna
  g.add(box(0.26, 0.22, 0.22, beige, 0, 1.25, -0.01));
  const face = canvasTex(128, 96, (c, w, h) => { c.fillStyle = '#0c1a12'; c.fillRect(0, 0, w, h); c.fillStyle = '#6dfca0'; c.fillRect(30, 30, 16, 16); c.fillRect(82, 30, 16, 16); c.fillRect(40, 66, 48, 6); for (let y = 0; y < h; y += 3) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, y, w, 1); } });
  g.add(plane(0.2, 0.15, lit(face, 0.9), 0, 1.25, 0.101));
  g.add(tube(V(0.08, 1.36, 0), V(0.14, 1.52, 0), 0.005, metal, 5));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), glow(2.2, 0.3, 0.2)); tip.position.set(0.14, 1.52, 0); g.add(tip);
  // boombox held in front
  const bb = new THREE.Group();
  bb.add(rbox(0.42, 0.2, 0.11, 0.02, std({ color: '#2a2a2c', roughness: 0.4 })));
  for (const s of [-1, 1]) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 20), std({ color: '#6a6a6a', metalness: 0.4 })); sp.rotation.x = Math.PI / 2; sp.position.set(s * 0.12, -0.01, 0.056); bb.add(sp); }
  bb.add(box(0.1, 0.05, 0.01, std({ color: '#a9b0b5' }), 0, 0.03, 0.056));
  bb.add(tube(V(-0.15, 0.1, 0), V(0.15, 0.1, 0), 0.008, metal, 6));
  bb.position.set(0, 0.8, 0.26); g.add(bb);
  return g;
}
function displayCase(w, h, d, seed) {
  const g = new THREE.Group();
  const alu = std({ color: '#c3c6c8', metalness: 0.5, roughness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: '#d8e6ea', transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false });
  g.add(box(w, 0.35, d, std({ color: '#d9d6cf' }), 0, 0.175, 0));
  const gl = box(w - 0.02, h - 0.38, d - 0.02, glass, 0, 0.35 + (h - 0.38) / 2, 0); gl.castShadow = false; g.add(gl);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(box(0.025, h - 0.35, 0.025, alu, x * (w / 2 - 0.012), 0.35 + (h - 0.35) / 2, z * (d / 2 - 0.012)));
  for (const y of [0.35, h]) { g.add(box(w, 0.025, 0.025, alu, 0, y, d / 2 - 0.012)); g.add(box(w, 0.025, 0.025, alu, 0, y, -d / 2 + 0.012)); }
  const r = rng(seed);
  for (const y of [0.37, 0.37 + (h - 0.38) / 2]) {
    g.add(box(w - 0.06, 0.008, d - 0.06, new THREE.MeshStandardMaterial({ color: '#e9f2f4', transparent: true, opacity: 0.4 }), 0, y, 0));
    for (let i = 0; i < 9; i++) {
      const s = 0.03 + r() * 0.05;
      g.add(box(s, s * 0.6, s, std({ color: ['#2a6a3a', '#1c1c1c', '#c9a040', '#b8b8b8', '#2a4a8a'][Math.floor(r() * 5)], roughness: 0.4 }), (r() - 0.5) * (w - 0.15), y + s * 0.3 + 0.004, (r() - 0.5) * (d - 0.12)));
    }
  }
  return g;
}

// ------------------------------------------------------------------ model
export function makeMarketAlley() {
  const g = new THREE.Group();
  g.name = 'market_alley';
  const L = 20, HW = 2.5, SD = 2.6, DY = 3.3;          // length, half walkway, shop depth, deck soffit
  const colliders = [];
  const col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);
  const deckM = (w, h) => std({ map: ptex('em_deck.png', w / 2, h / 2), roughness: 0.9 });
  const deckTex = ptex('em_deck.png');
  const steel = std({ color: '#9a9ea2', metalness: 0.45, roughness: 0.4 });
  const white = std({ color: '#ecebe6', roughness: 0.5 });

  // ---------------------------------------------------------------- floor + drain
  {
    const f = plane(HW * 2 + 2 * SD, L + 6, std({ map: ptex('em_pave.png', (HW * 2 + 2 * SD) / 2.4, (L + 6) / 2.4), roughness: 0.75 }), 0, 0.006, -(L + 6) / 2);
    f.rotation.x = -Math.PI / 2; g.add(f);
    const dr = plane(0.16, L + 6, std({ map: (() => { const t = slotDrainTex(); t.repeat.set(1, (L + 6) / 1.0); return t; })(), metalness: 0.5, roughness: 0.45 }), 0.9, 0.01, -(L + 6) / 2);
    dr.rotation.x = -Math.PI / 2; g.add(dr);
    // one big non-repeating overlay: damp patches, a wet strip along the drain, worn paths, scuffs
    const gt = canvasTex(512, 2048, (c, w, h) => {
      const r = rng(77); c.clearRect(0, 0, w, h);
      const ppm = h / (L + 6);
      for (let i = 0; i < 60; i++) {
        const x = r() * w, y = r() * h, rx = (0.3 + r() * 1.4) * ppm, ry2 = (0.3 + r() * 2.2) * ppm;
        const gr = c.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry2));
        gr.addColorStop(0, `rgba(40,34,28,${0.12 + r() * 0.18})`); gr.addColorStop(1, 'rgba(40,34,28,0)');
        c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, rx, ry2, r() * 3, 0, 7); c.fill();
      }
      const dx = (0.9 + (HW + SD)) / (2 * (HW + SD)) * w;            // the drain line
      const gw = c.createLinearGradient(dx - 0.7 * ppm, 0, dx + 0.3 * ppm, 0);
      gw.addColorStop(0, 'rgba(35,30,26,0)'); gw.addColorStop(0.75, 'rgba(35,30,26,0.22)'); gw.addColorStop(1, 'rgba(35,30,26,0)');
      c.fillStyle = gw; c.fillRect(dx - 0.7 * ppm, 0, 1.0 * ppm, h);
      for (let i = 0; i < 25; i++) { c.fillStyle = `rgba(110,70,40,${0.08 + r() * 0.1})`; c.beginPath(); c.ellipse(r() * w, r() * h, (0.05 + r() * 0.2) * ppm, (0.05 + r() * 0.3) * ppm, r() * 3, 0, 7); c.fill(); }
    });
    gt.wrapS = gt.wrapT = THREE.ClampToEdgeWrapping;
    const ov = plane(HW * 2 + 2 * SD, L + 6, new THREE.MeshStandardMaterial({ map: gt, transparent: true, roughness: 0.4, depthWrite: false }), 0, 0.008, -(L + 6) / 2);
    ov.rotation.x = -Math.PI / 2; g.add(ov);
  }

  // ---------------------------------------------------------------- deck, beams, side walls
  {
    const W = HW * 2 + 2 * SD + 0.6;
    const soffit = plane(W, L, deckM(W, L), 0, DY, -L / 2); soffit.rotation.x = Math.PI / 2; g.add(soffit);
    g.add(box(W, 0.45, L, std({ color: '#b9c2be', roughness: 0.9 }), 0, DY + 0.23, -L / 2));
    for (let z = 0; z >= -L; z -= 4) {
      g.add(beam(W, 0.45, 0.4, deckTex, 2, 0, DY - 0.22, z - (z === 0 ? 0.2 : 0)));
    }
    for (const s of [-1, 1]) {
      g.add(beam(0.4, 0.4, L, deckTex, 2, s * (HW + 0.05), DY - 0.2, -L / 2));
      // outer walls of the block
      g.add(box(0.3, DY + 0.45, L, std({ color: '#b6b8b2', roughness: 0.9 }), s * (HW + SD + 0.15), (DY + 0.45) / 2, -L / 2));
      col(s > 0 ? HW + SD : -HW - SD - 0.3, s > 0 ? HW + SD + 0.3 : -HW - SD, -L, 0);
    }
    // railing on the deck top (it's an elevated walkway above)
    for (const s of [-1, 1]) {
      g.add(box(0.05, 1.0, L, steel, s * (W / 2 - 0.1), DY + 0.95, -L / 2));
    }
    g.add(box(W, 0.05, 0.05, steel, 0, DY + 1.45, -0.05));
    for (let x = -W / 2 + 0.1; x <= W / 2; x += 0.15) g.add(box(0.02, 1.0, 0.02, steel, x, DY + 0.95, -0.05));
    // conduit + cable tray along the east beam, fluorescent fittings under each cross beam
    g.add(box(0.3, 0.05, L, std({ color: '#7a7d80', metalness: 0.4 }), HW - 0.4, DY - 0.08, -L / 2));
    for (let i = 0; i < 6; i++) g.add(tube(V(HW - 0.55 + i * 0.05, DY - 0.05, 0), V(HW - 0.55 + i * 0.05, DY - 0.05, -L), 0.012, std({ color: i % 2 ? '#1a1a1a' : '#5a5a5a' }), 6));
    for (let z = -2; z >= -L + 1; z -= 4) {
      g.add(box(0.14, 0.06, 1.3, white, -0.9, DY - 0.06, z));
      g.add(box(0.07, 0.035, 1.22, glow(2.3, 2.4, 2.4), -0.9, DY - 0.1, z));
    }
    for (const z of [-3, -11, -17]) { const l = new THREE.PointLight('#eef4ff', 7, 11, 1.4); l.position.set(-0.6, DY - 0.5, z); g.add(l); }
  }

  // ---------------------------------------------------------------- shop units
  // Structural grid: the deck's cross beams sit every 4 m (z = 0, -4, ... -20). Each side is five 4 m
  // units between concrete piers under those beams. Every unit has a header band under the edge beam
  // carrying its sign, an opening 2.55 m high, and one front type:
  //   shutter (closed) · half (shutter partly up, dim inside) · open (stall open to the alley, lit)
  //   glass (aluminium storefront + door, lit) · tile (the tiled P.C.B office with a glass door)
  const PITCH = 4, OH = 2.55, HB = DY - 0.4;           // opening height, header band top (beam bottom)
  const facadeM = std({ color: '#d6d4cc', roughness: 0.85 });
  const headerM = std({ color: '#e2e0d8', roughness: 0.8 });
  const skirtM = std({ color: '#4a4844', roughness: 0.7 });
  const ry = (s) => (s > 0 ? -Math.PI / 2 : Math.PI / 2);   // planes facing into the alley
  const pegTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c9b48e'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,45,25,0.55)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); } });
  const reelTex = canvasTex(512, 512, (c, w, h) => {
    const r = rng(14); c.fillStyle = '#d8d4ca'; c.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++) { c.fillStyle = '#8a8478'; c.fillRect(0, 118 + j * 128, w, 10);
      for (let i = 0; i < 6; i++) { const x = 44 + i * 82, y = 70 + j * 128, col = ['#c82a2a', '#1d1d1d', '#2a5ab0', '#e8c020', '#2a8a4a', '#f2f2ee'][Math.floor(r() * 6)];
        c.fillStyle = '#6a5a40'; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, 33, 0, 7); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.25)'; for (let k = 14; k < 33; k += 4) { c.beginPath(); c.arc(x, y, k, 0, 7); c.stroke(); }
        c.fillStyle = '#3a3020'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); } }
  });
  const backTex = [partsDrawersTex(), reelTex, partsDrawersTex()];
  const unit = (s, i, type, o = {}) => {
    const z0 = -i * PITCH, z1 = z0 - PITCH, zc = (z0 + z1) / 2, w = PITCH - 0.3;
    const fx = s * HW, bx = s * (HW + SD);
    // header band + its underside, skirting along the front line
    g.add(box(0.3, HB - OH, PITCH, headerM, s * (HW + 0.15), (HB + OH) / 2, zc));
    // the sign on the header
    if (o.sign) {
      const sh = HB - OH - 0.12;
      g.add(box(0.1, sh + 0.04, w - 0.3, std({ color: '#cfcfca', metalness: 0.3, roughness: 0.4 }), s * (HW - 0.05), (HB + OH) / 2, zc));
      g.add(plane(w - 0.36, sh, lit(o.sign, 0.55), s * (HW - 0.101), (HB + OH) / 2, zc, ry(s)));
    }
    // interior (everything but a fully closed shutter)
    if (type !== 'shutter') {
      const lightOn = type !== 'half';
      const bt = o.back === 'peg' ? std({ map: pegTex, roughness: 0.8 }) : std({ map: backTex[(i + (s > 0 ? 0 : 1)) % 3], roughness: 0.6 });
      if (o.back === 'peg') { bt.map = pegTex.clone(); bt.map.repeat.set(w / 0.5, OH / 0.5); bt.map.needsUpdate = true; }
      g.add(plane(w, OH, bt, bx - s * 0.01, OH / 2, zc, ry(s)));
      for (const k of [-1, 1]) g.add(plane(SD, OH, std({ color: k > 0 ? '#ddd8cc' : '#d3cdbf' }), (fx + bx) / 2, OH / 2, zc + k * w / 2, k > 0 ? Math.PI : 0));
      const cl = plane(SD, w, lightOn ? glow(1.0, 1.0, 0.96) : std({ color: '#6a6a66' }), (fx + bx) / 2, OH - 0.005, zc); cl.rotation.x = Math.PI / 2; g.add(cl);
      const fl = plane(SD, w, std({ color: '#bdb8ac', roughness: 0.6 }), (fx + bx) / 2, 0.009, zc); fl.rotation.x = -Math.PI / 2; g.add(fl);
      // counter across the back with test gear, a stool behind it
      g.add(box(0.55, 0.9, w * 0.7, std({ color: '#cfc8ba' }), bx - s * 0.75, 0.45, zc));
      g.add(box(0.6, 0.03, w * 0.72, std({ color: '#8a7a62' }), bx - s * 0.75, 0.915, zc));
      const a1 = gearBox(0.36, 0.14, 0.3, 0, 21 + i * 7 + s); a1.position.set(bx - s * 0.75, 0.93, zc - 0.45); a1.rotation.y = ry(s) + Math.PI; g.add(a1);
      // circuit boards on the counter (item 33)
      for (const dz of [0.05, 0.22]) { const pb = makeCircuitBoard(); pb.position.set(bx - s * 0.75, 0.93, zc + dz); pb.rotation.y = dz * 9 + i; g.add(pb); }
      const a2 = gearBox(0.34, 0.2, 0.3, 1, 33 + i * 5 + s); a2.position.set(bx - s * 0.75, 0.93, zc + 0.35); a2.rotation.y = ry(s) + Math.PI; g.add(a2);
      if (lightOn) { const pl = new THREE.PointLight('#fff2dc', 2.0, 4.5, 1.6); pl.position.set((fx + bx) / 2, OH - 0.4, zc); g.add(pl); }
    }
    // fronts
    if (type === 'shutter' || type === 'half') {
      const lift = type === 'half' ? (o.lift || 1.3) : 0;
      const h = OH - lift;
      const sm = std({ map: shutterTex(o.cols), roughness: 0.5, metalness: 0.15 });
      sm.map.repeat.set(w / 1.2, h / 1.2);
      g.add(plane(w, h, sm, s * (HW + 0.1), lift + h / 2, zc, ry(s)));
      g.add(box(0.06, 0.05, w, steel, s * (HW + 0.08), lift + 0.025, zc));
      g.add(box(0.03, 0.04, 0.14, std({ color: '#2a2a2a' }), s * (HW + 0.05), lift + 0.07, zc + 0.6));
    }
    if (type === 'glass') {
      const glass = new THREE.MeshStandardMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.2, roughness: 0.04, depthWrite: false });
      const alu = std({ color: '#b5b9bc', metalness: 0.4, roughness: 0.35 });
      g.add(plane(w, OH, glass, s * (HW + 0.08), OH / 2, zc, ry(s)));
      for (const k of [-2, -1, 0, 1, 2]) g.add(box(0.06, OH, 0.05, alu, s * (HW + 0.08), OH / 2, zc + k * w / 4));
      g.add(box(0.07, 0.06, w, alu, s * (HW + 0.08), 2.15, zc)); g.add(box(0.08, 0.12, w, alu, s * (HW + 0.08), 0.06, zc));
      g.add(box(0.05, 0.42, 0.03, steel, s * (HW + 0.03), 1.05, zc + 0.12));
      const dec = canvasTex(512, 128, (c, ww, hh) => { c.clearRect(0, 0, ww, hh); c.fillStyle = 'rgba(255,255,255,0.88)'; fitText(c, o.decal || 'OPEN', ww / 2, hh / 2, ww - 30, 54, F.label, { spacing: 5 }); });
      g.add(plane(1.6, 0.4, new THREE.MeshBasicMaterial({ map: dec, transparent: true }), s * (HW + 0.06), 1.6, zc - 0.9, ry(s)));
    }
    if (type === 'open') {
      // shutter rolled up into its housing; a low display table at the front line
      g.add(box(0.28, 0.24, w, std({ color: '#c3c6c2', metalness: 0.2 }), s * (HW + 0.2), OH - 0.12, zc));
      if (o.cases) {
        for (const [dz, cw] of [[-0.9, 1.4], [0.9, 1.4]]) { const dc = displayCase(0.6, 1.25, cw, i * 13 + dz * 10); dc.position.set(s * (HW + 0.4), 0, zc + dz); dc.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(dc); }
      } else {
        g.add(box(0.6, 0.75, w * 0.55, std({ color: '#6a6e72', metalness: 0.3 }), s * (HW + 0.45), 0.375, zc - 0.5));
        const cb = makeCordBundle(); cb.position.set(s * (HW + 0.45), 0.75, zc - 0.5); cb.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(cb);
        const tr = rng(i * 31 + 7);
        for (let k = 0; k < 6; k++) { const b2 = box(0.14 + tr() * 0.1, 0.05 + tr() * 0.06, 0.12 + tr() * 0.1, std({ color: ['#1c1c1c', '#c9a040', '#2a4a8a', '#b8b8b8', '#2a6a3a'][k % 5], roughness: 0.45 }), s * (HW + 0.3 + tr() * 0.3), 0.78, zc - 0.5 + (tr() - 0.5) * w * 0.45); g.add(b2); }
      }
    }
    if (type === 'tile') {
      const tileM = (ww, hh) => { const t = ptex('em_tile.png', ww, hh); return std({ map: t, roughness: 0.45 }); };
      // tiled wall with a 1.2 m glass door in the middle
      for (const [a, b] of [[-w / 2, -0.6], [0.6, w / 2]]) { g.add(box(0.12, OH, b - a, std({ color: '#7a8a90' }), s * (HW + 0.07), OH / 2, zc + (a + b) / 2)); g.add(plane(b - a, OH, tileM(b - a, OH), s * (HW + 0.009), OH / 2, zc + (a + b) / 2, ry(s))); }
      const glass = new THREE.MeshStandardMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false });
      g.add(plane(1.2, 2.2, glass, s * (HW + 0.07), 1.1, zc, ry(s)));
      for (const k of [-1, 0, 1]) g.add(box(0.05, 2.25, 0.05, steel, s * (HW + 0.07), 1.12, zc + k * 0.6));
      g.add(box(0.05, 0.33, 1.25, steel, s * (HW + 0.07), 2.38, zc));
      const dec = canvasTex(256, 512, (c, ww, hh) => { c.clearRect(0, 0, ww, hh); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(20, 60, ww - 40, 120); c.fillStyle = '#1d3a8f'; fitText(c, 'SILK SCREEN', ww / 2, 96, ww - 60, 34, F.label); fitText(c, 'SMT · PROTOTYPE', ww / 2, 146, ww - 60, 28, F.label); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(40, 380, ww - 80, 70); c.fillStyle = '#c22'; fitText(c, 'PULL', ww / 2, 415, ww - 100, 40, F.heavy); });
      g.add(plane(0.55, 1.1, new THREE.MeshBasicMaterial({ map: dec, transparent: true }), s * (HW + 0.04), 1.35, zc - 0.3, ry(s)));
    }
    return zc;
  };
  // piers at every unit boundary (under the cross beams), both sides, with skirting
  for (const s of [-1, 1]) for (let i = 0; i <= 5; i++) {
    const z = -i * PITCH;
    g.add(box(0.36, HB, 0.34, facadeM, s * (HW + 0.13), HB / 2, z));
    g.add(box(0.38, 0.12, 0.36, skirtM, s * (HW + 0.13), 0.06, z));
    col(s > 0 ? HW - 0.05 : -HW - 0.31, s > 0 ? HW + 0.31 : -HW + 0.05, z - 0.17, z + 0.17);
  }
  // shop fronts are the walkway edge: nothing walks into the shops
  for (const s of [-1, 1]) col(s > 0 ? HW + 0.05 : -HW - SD, s > 0 ? HW + SD : -HW - 0.05, -L, 0);

  // EAST (+x)
  unit(1, 0, 'open', {});
  unit(1, 1, 'tile', { sign: canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#f6d53a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d3a8f'; fitText(c, 'P.C.B  DESIGN  ·  DEVELOPMENT', w / 2, h / 2 + 4, w - 60, 70, F.heavy, { spacing: 6 }); }) });
  unit(1, 2, 'open', { sign: blueSignTex('BORAM PARTS', 'DISPLAY & SALES  ·  WHOLESALE', 'UNIT 2-14'), back: 'peg' });
  unit(1, 3, 'shutter', { sign: plaqueTex('HANUL AUDIO', '#f19a2e', '#ffffff'), cols: ['#6e8fa8', '#9db8cc', '#56738a'] });
  unit(1, 4, 'glass', { sign: plaqueTex('JEIL REPAIR', '#f4f1e8', '#d9262e'), decal: 'TV · AUDIO · REPAIR' });
  // MIRAE's big three-band lightbox over unit 0 (in the photo it's the shop's main sign), on brackets
  {
    const big = new THREE.Group();
    big.add(box(0.22, 1.05, 3.4, std({ color: '#dcdcd8' })));
    big.add(plane(3.36, 1.02, lit(miraeTex(), 0.6), -0.111, 0, 0, -Math.PI / 2));
    for (const k of [-1, 1]) big.add(box(0.3, 0.06, 0.06, steel, 0.24, 0.45, k * 1.3));
    big.position.set(HW - 0.15, OH + 0.12, -2); g.add(big);
    const cam = new THREE.Group();
    cam.add(rbox(0.26, 0.11, 0.11, 0.03, std({ color: '#f2f2ee' })));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), std({ color: '#111' })); lens.rotation.z = Math.PI / 2; lens.position.x = -0.135; cam.add(lens);
    cam.add(box(0.04, 0.16, 0.04, std({ color: '#ddd' }), 0.08, 0.12, 0));
    cam.position.set(HW - 0.2, HB - 0.2, -0.35); cam.rotation.y = -0.6; g.add(cam);
  }
  // WEST (-x)
  unit(-1, 0, 'half', { sign: plaqueTex('DAEHAN SOUND', '#f2c21a', '#1d1d1d'), cols: ['#d8dcdc', '#f2f4f2', '#b9bebe'], lift: 1.25 });
  unit(-1, 1, 'open', { sign: blueSignTex('OK SWITCH', 'SWITCHES · RELAYS · SENSORS', 'OPEN 9:00 – 18:00'), cases: true });
  unit(-1, 2, 'shutter', { sign: plaqueTex('BITNA LED', '#ffffff', '#1d3a8f'), cols: ['#4f6a86', '#7b98b4', '#3e5670'] });
  unit(-1, 3, 'half', { sign: plaqueTex('SAMIL WIRE', '#e9532c', '#ffffff'), cols: ['#d0d4d4', '#eceeee', '#aeb3b3'], lift: 1.7 });
  unit(-1, 4, 'glass', { sign: blueSignTex('DONGIL CIRCUITS', 'BOARDS · ASSEMBLY · PARTS', 'SINCE 1987'), decal: 'P.C.B ASSEMBLY' });
  // striped awning over DAEHAN, fixed to the header
  {
    const aw = new THREE.Group();
    const am = std({ map: stripeTex(), roughness: 0.8, side: THREE.DoubleSide });
    am.map.repeat.set(4, 1);
    const sl = new THREE.Mesh(new THREE.PlaneGeometry(PITCH - 0.4, 1.0), am); sl.rotation.x = -Math.PI / 2 + 0.55; sl.position.set(0, -0.25, 0.42); aw.add(sl);
    aw.add(plane(PITCH - 0.4, 0.2, am, 0, -0.6, 0.85));
    for (const k of [-1, 1]) aw.add(tube(V(k * (PITCH / 2 - 0.25), 0, 0), V(k * (PITCH / 2 - 0.25), -0.5, 0.85), 0.012, steel, 6));
    aw.rotation.y = Math.PI / 2; aw.position.set(-HW, OH - 0.08, -2); g.add(aw);
  }
  // globe lamp on the pier between DAEHAN and OK SWITCH
  {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(1.1, 1.08, 1.0)); globe.position.set(-HW + 0.3, 2.3, -4); g.add(globe);
    g.add(tube(V(-HW + 0.05, 2.45, -4), V(-HW + 0.3, 2.45, -4), 0.015, steel, 6));
    g.add(tube(V(-HW + 0.3, 2.45, -4), V(-HW + 0.3, 2.4, -4), 0.015, steel, 6));
  }

  // ---------------------------------------------------------------- entrance: block end walls + arcade sign
  {
    for (const s of [-1, 1]) {
      const xc = s * (HW + 0.15 + (SD + 0.15) / 2);
      g.add(beam(SD + 0.3, DY, 0.3, deckTex, 2, xc, DY / 2, 0.15));
      // a poster board on each end wall (made-up market notices)
      const pt = canvasTex(512, 384, (c, w, h) => {
        c.fillStyle = '#20314f'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#f2c21a'; fitText(c, s > 0 ? 'PARTS · TOOLS · REPAIR' : 'AUDIO · LED · CABLE', w / 2, 60, w - 50, 46, F.heavy, { spacing: 3 });
        c.fillStyle = '#fff'; fitText(c, 'ELECTRONICS ARCADE', w / 2, 150, w - 60, 58, F.heavy, { spacing: 4 });
        c.fillStyle = '#c8d2e4'; fitText(c, '1F shops · 2F workshops · deck walkway', w / 2, 230, w - 60, 28, F.label);
        fitText(c, 'Mon – Sat  9:00 – 18:00', w / 2, 290, w - 60, 30, F.label);
        c.strokeStyle = '#f2c21a'; c.lineWidth = 6; c.strokeRect(12, 12, w - 24, h - 24);
      });
      g.add(box(1.7, 1.3, 0.04, std({ color: '#2a2a2a' }), xc, 1.5, 0.32));
      g.add(plane(1.6, 1.2, lit(pt, 0.25), xc, 1.5, 0.342));
      const pl = new THREE.PointLight('#fff1dc', 1.5, 3.5, 1.6); pl.position.set(xc, 2.6, 0.9); g.add(pl);
      col(s > 0 ? HW : -HW - SD - 0.3, s > 0 ? HW + SD + 0.3 : -HW, 0, 0.3);
    }
    // arcade name sign spanning the alley mouth on the first beam
    const at = canvasTex(1600, 200, (c, w, h) => {
      c.fillStyle = '#1d3a8f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f2c21a'; c.fillRect(0, h - 16, w, 16);
      c.fillStyle = '#fff'; fitText(c, 'DAEHAN  ELECTRONICS  ARCADE', w / 2, 92, w - 140, 110, F.heavy, { spacing: 10 });
    });
    g.add(box(4.2, 0.5, 0.12, std({ color: '#1d3a8f' }), 0, DY - 0.66, 0.08));
    g.add(plane(4.16, 0.48, lit(at, 0.55), 0, DY - 0.66, 0.141));
  }

  // ---------------------------------------------------------------- blade signs on bracket arms off the piers
  {
    const blades = [
      [1, -4, bladeTex('PARTS', 'MIRAE', '1F', '#ffffff', '#d9262e', '#d9262e')],
      [-1, -8, bladeTex('AUDIO', 'DAEHAN', 'B-12', '#f2c21a', '#1d1d1d', null)],
      [1, -12, bladeTex('P.C.B', 'BORAM', 'SALES', '#f7f8fa', '#1d3a8f', '#1d3a8f')],
      [-1, -12, bladeTex('LED', 'BITNA', 'ALL DAY', '#1d3a8f', '#ffffff', null)],
      [1, -20, bladeTex('REPAIR', 'JEIL', 'TV · AV', '#f19a2e', '#ffffff', null)],
    ];
    for (const [s, z, t] of blades) {
      const x0 = s * (HW - 0.05), xc = s * (HW - 0.5), y = OH - 0.05;
      g.add(box(0.95, 0.05, 0.05, steel, s * (HW - 0.47), y + 0.02, z + 0.25));         // arm off the pier face
      g.add(tube(V(x0, y + 0.02, z + 0.25), V(x0, y - 0.35, z + 0.25), 0.012, steel, 6)); // knee brace
      const b = new THREE.Group();
      b.add(box(0.66, 1.4, 0.1, std({ color: '#d8d8d4' })));
      for (const k of [-1, 1]) b.add(plane(0.62, 1.36, lit(t, 0.55), 0, 0, k * 0.051, k > 0 ? 0 : Math.PI));
      b.position.set(xc, y - 0.78, z + 0.25); g.add(b);
      for (const k of [-1, 1]) g.add(tube(V(xc + k * 0.25, y, z + 0.25), V(xc + k * 0.25, y - 0.08, z + 0.25), 0.006, steel, 4));
    }
  }

  // ---------------------------------------------------------------- props on the walkway
  {
    // DAEHAN's things out front: the old massage chair, a crate of amps and receivers
    const chair = massageChair(); chair.position.set(-HW + 0.6, 0, -1.4); chair.rotation.y = Math.PI / 2 - 0.15; g.add(chair);
    col(-HW, -HW + 1.15, -1.95, -0.85);
    const cr = crate(); cr.position.set(-HW + 0.4, 0, -3.0); cr.rotation.y = Math.PI / 2; g.add(cr);
    const amp = gearBox(0.44, 0.12, 0.34, 1, 5); amp.position.set(-HW + 0.4, 0.31, -3.0); amp.rotation.y = Math.PI / 2; g.add(amp);
    const amp2 = gearBox(0.43, 0.1, 0.33, 0, 6); amp2.position.set(-HW + 0.4, 0.43, -3.0); amp2.rotation.y = Math.PI / 2 + 0.05; g.add(amp2);
    col(-HW, -HW + 0.65, -3.35, -2.65);
    // BORAM's delivery: crate, hand truck with a carton, green stool; the junk robot by its door
    const c1 = crate(); c1.position.set(HW - 0.4, 0, -9.0); c1.rotation.y = Math.PI / 2; g.add(c1);
    const ht = handTruck(); ht.position.set(HW - 0.9, 0, -9.7); ht.rotation.y = -Math.PI / 2 + 0.3; g.add(ht);
    const st = stool('#2fa37a'); st.position.set(HW - 0.4, 0, -10.0); g.add(st);
    const rb = junkRobot(); rb.position.set(HW - 0.45, 0, -11.2); rb.rotation.y = -Math.PI / 2 - 0.4; g.add(rb);
    col(HW - 1.15, HW, -10.3, -8.7); col(HW - 0.8, HW, -11.5, -10.9);
    // a red stool outside JEIL, a blue crate with a power supply outside SAMIL
    const st2 = stool('#c9372f'); st2.position.set(HW - 0.35, 0, -17.0); g.add(st2);
    const c2 = crate('#3a7fc0'); c2.position.set(-HW + 0.4, 0, -13.3); c2.rotation.y = Math.PI / 2; g.add(c2);
    const g3 = gearBox(0.5, 0.18, 0.4, 0, 9); g3.position.set(-HW + 0.4, 0.31, -13.3); g3.rotation.y = Math.PI / 2; g.add(g3);
    col(-HW, -HW + 0.65, -13.65, -12.95);
    // rusty bench against BITNA's closed shutter
    const rust = std({ color: '#6a4030', roughness: 0.85, metalness: 0.2 });
    const bench = new THREE.Group();
    bench.add(box(1.4, 0.04, 0.4, std({ color: '#8f9a9e', roughness: 0.6 }), 0, 0.45, 0));
    for (const x of [-0.6, 0.6]) for (const z of [-0.16, 0.16]) bench.add(box(0.04, 0.45, 0.04, rust, x, 0.225, z));
    bench.add(box(1.25, 0.03, 0.03, rust, 0, 0.15, -0.16));
    bench.position.set(-HW + 0.3, 0, -10.0); bench.rotation.y = Math.PI / 2; g.add(bench);
    col(-HW, -HW + 0.55, -10.75, -9.25);
  }

  // ---------------------------------------------------------------- far end: white block with windows
  {
    const z = -L - 4;
    g.add(box(16, 9, 0.4, std({ color: '#e4e4de', roughness: 0.8 }), 0, 4.5, z));
    const win = std({ color: '#3a4448', roughness: 0.15, metalness: 0.3 });
    for (let i = 0; i < 5; i++) { g.add(box(1.3, 0.75, 0.05, win, -2.6 + i * 1.3, 4.6, z + 0.21)); g.add(box(0.04, 0.8, 0.07, white, -3.25 + i * 1.3, 4.6, z + 0.22)); }
    g.add(box(6.6, 0.06, 0.15, white, 0, 4.2, z + 0.25));
    g.add(box(16, 0.5, 2.5, std({ color: '#d8d9d4' }), 0, 6.8, z + 1.4));
    col(-8, 8, z - 0.3, z + 0.3);
    const fl = plane(HW * 2 + 2 * SD, 4, std({ map: ptex('em_pave.png', 4, 1.6), roughness: 0.75 }), 0, 0.006, -L - 2); fl.rotation.x = -Math.PI / 2; g.add(fl);
    for (const s of [-1, 1]) { g.add(box(0.3, 4, 4, std({ color: '#b6b8b2' }), s * (HW + SD + 0.15), 2, -L - 2)); }
    const el = new THREE.PointLight('#dfe8ff', 4, 9, 1.5); el.position.set(0, 3.2, -L - 2); g.add(el);
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.area = { minX: -HW + 0.25, maxX: HW - 0.25, minZ: -L - 3.6, maxZ: 0.6 };
  return g;
}
